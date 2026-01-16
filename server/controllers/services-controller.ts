
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
