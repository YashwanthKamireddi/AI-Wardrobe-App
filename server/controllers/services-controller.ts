
import { Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import { analyticsService } from "../services/analytics";
import fs from "fs";
import { uploadImage, uploadImageFromPath, base64ToBuffer } from "../lib/supabase-storage";

export const uploadImageHandler = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        // Check if file was provided via multipart/form-data
        if (req.file) {
            // Using disk storage now (from server/config/upload.ts), so we stream from path
            const result = await uploadImageFromPath(
                req.file.path,
                req.file.originalname,
                req.file.mimetype,
                req.user!.id
            );

            // Cleanup temp file
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error cleaning up temp upload file:", err);
            });

            if (!result.success) {
                return res.status(500).json({ message: result.error || "Upload failed" });
            }

            return res.json({ url: result.url });
        }

        // Check if base64 data URL was provided in body
        if (req.body.dataUrl) {
            const parsed = base64ToBuffer(req.body.dataUrl);
            if (!parsed) {
                return res.status(400).json({ message: "Invalid base64 data URL" });
            }

            const result = await uploadImage(
                parsed.buffer,
                `upload-${Date.now()}.jpg`,
                parsed.contentType,
                req.user!.id
            );

            if (!result.success) {
                return res.status(500).json({ message: result.error || "Upload failed" });
            }

            return res.json({ url: result.url });
        }

        return res.status(400).json({ message: "No image provided. Send either a file or dataUrl." });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "Failed to upload image" });
    }
};

export const scrapeProduct = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ message: "URL is required" });
        }

        // Fetch the HTML
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const html = response.data;
        const $ = cheerio.load(html);

        // 1. Try Open Graph Tags
        let name = $('meta[property="og:title"]').attr('content') || $('title').text();
        let imageUrl = $('meta[property="og:image"]').attr('content');
        let description = $('meta[property="og:description"]').attr('content');
        let siteName = $('meta[property="og:site_name"]').attr('content');

        // 2. Try JSON-LD (Rich Snippets)
        let price: number | undefined;
        let currency: string | undefined;
        let brand: string | undefined;

        $('script[type="application/ld+json"]').each((_, element) => {
            try {
                const json = JSON.parse($(element).html() || '{}');
                // Handle Product schema
                if (json['@type'] === 'Product') {
                    if (!name && json.name) name = json.name;
                    if (!imageUrl && json.image) {
                        imageUrl = Array.isArray(json.image) ? json.image[0] : json.image;
                    }
                    if (!brand && json.brand) {
                        brand = typeof json.brand === 'object' ? json.brand.name : json.brand;
                    }

                    // Handle Offers
                    if (json.offers) {
                        const offer = Array.isArray(json.offers) ? json.offers[0] : json.offers;
                        if (offer) {
                            if (offer.price) price = parseFloat(offer.price);
                            if (offer.priceCurrency) currency = offer.priceCurrency;
                        }
                    }
                }
            } catch (e) {
                // Ignore JSON parse errors
            }
        });

        // 3. Fallbacks if JSON-LD failed
        if (!price) {
            const priceMeta = $('meta[property="product:price:amount"]').attr('content');
            if (priceMeta) price = parseFloat(priceMeta);
        }
        if (!currency) {
            currency = $('meta[property="product:price:currency"]').attr('content');
        }
        if (!brand && siteName) {
            brand = siteName;
        }

        // Cleanup
        if (name) name = name.trim();
        if (brand) brand = brand.trim();

        res.json({
            name,
            imageUrl,
            description,
            price,
            currency,
            brand,
            sourceUrl: url
        });

    } catch (error) {
        console.error("Scraping error:", error);
        res.status(500).json({ message: "Failed to scrape product data" });
    }
};

export const getWeather = async (req: Request, res: Response) => {
    try {
        const { location } = req.query;

        if (!location || typeof location !== "string") {
            // Default to London if no location provided (or handle as error)
            return res.status(400).json({ message: "Location is required" });
        }

        let lat: number, lon: number;
        let locationName = location;

        // Check if location is "lat,long" format
        if (location.includes(",")) {
            const [latStr, lonStr] = location.split(",");
            lat = parseFloat(latStr);
            lon = parseFloat(lonStr);

            // Optional: Reverse geocode to get city name (for display),
            // but for now we can just use "Current Location" or the coordinates
            locationName = "Current Location";
        } else {
            // Geocode the city name using Open-Meteo Geocoding API
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
            const geoRes = await axios.get(geoUrl);

            if (!geoRes.data.results || geoRes.data.results.length === 0) {
                return res.status(404).json({ message: "Location not found" });
            }

            lat = geoRes.data.results[0].latitude;
            lon = geoRes.data.results[0].longitude;
            locationName = geoRes.data.results[0].name;
        }

        // Fetch Weather Data
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh`;
        const weatherRes = await axios.get(weatherUrl);
        const data = weatherRes.data.current;

        // Map WMO Weather Codes to readable conditions
        // https://open-meteo.com/en/docs
        const wmoCode = data.weather_code;
        let condition = "Clear";
        let icon = "sun";

        if (wmoCode === 0) { condition = "Clear Sky"; icon = "sun"; }
        else if (wmoCode >= 1 && wmoCode <= 3) { condition = "Cloudy"; icon = "cloud"; }
        else if (wmoCode >= 45 && wmoCode <= 48) { condition = "Foggy"; icon = "cloud-fog"; }
        else if (wmoCode >= 51 && wmoCode <= 55) { condition = "Drizzle"; icon = "cloud-drizzle"; }
        else if (wmoCode >= 56 && wmoCode <= 57) { condition = "Freezing Drizzle"; icon = "cloud-drizzle"; }
        else if (wmoCode >= 61 && wmoCode <= 65) { condition = "Rain"; icon = "cloud-rain"; }
        else if (wmoCode >= 66 && wmoCode <= 67) { condition = "Freezing Rain"; icon = "cloud-rain"; }
        else if (wmoCode >= 71 && wmoCode <= 77) { condition = "Snow"; icon = "cloud-snow"; }
        else if (wmoCode >= 80 && wmoCode <= 82) { condition = "Heavy Rain"; icon = "cloud-lightning"; }
        else if (wmoCode >= 85 && wmoCode <= 86) { condition = "Snow Showers"; icon = "cloud-snow"; }
        else if (wmoCode >= 95 && wmoCode <= 99) { condition = "Thunderstorm"; icon = "cloud-lightning"; }

        res.json({
            location: locationName,
            temperature: Math.round(data.temperature_2m),
            condition: condition,
            humidity: data.relative_humidity_2m,
            windSpeed: data.wind_speed_10m,
            icon: icon
        });

    } catch (error) {
        console.error("Weather API error:", error);
        res.status(500).json({ message: "Failed to fetch weather data" });
    }
};

export const getAnalytics = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
        const stats = await analyticsService.getWardrobeStats(req.user!.id);
        res.json(stats);
    } catch (error) {
        console.error("Analytics error:", error);
        res.status(500).json({ message: "Failed to calculate analytics" });
    }
};
