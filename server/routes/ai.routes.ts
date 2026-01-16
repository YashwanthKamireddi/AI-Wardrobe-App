/**
 * AI Routes Module
 * Handles outfit recommendations and wardrobe intelligence endpoints
 */

import { Router, Request, Response } from "express";
import storage from "../storage";
import { generateOutfitRecommendations, MoodType, WeatherType } from "../lib/outfit-engine";

const router = Router();

// POST /api/ai/outfit-recommendations - Generate outfit recommendations
router.post("/outfit-recommendations", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const { weather, mood, count = 3 } = req.body;

        // Validate inputs
        const validWeather: WeatherType[] = ["sunny", "cloudy", "rainy", "snowy", "windy"];
        const validMood: MoodType[] = ["happy", "confident", "relaxed", "energetic", "romantic", "professional", "creative", "casual", "formal", "playful"];

        if (!validWeather.includes(weather)) {
            return res.status(400).json({
                message: "Invalid weather type",
                valid: validWeather
            });
        }

        if (!validMood.includes(mood)) {
            return res.status(400).json({
                message: "Invalid mood type",
                valid: validMood
            });
        }

        // Get user's wardrobe
        const wardrobeItems = await storage.getWardrobeItems(req.user!.id);

        if (wardrobeItems.length < 2) {
            return res.status(400).json({
                message: "Not enough items in wardrobe. Add at least 2 items to get recommendations."
            });
        }

        // Generate recommendations
        const recommendations = generateOutfitRecommendations(
            wardrobeItems,
            weather as WeatherType,
            mood as MoodType,
            Math.min(count, 10) // Limit to 10 max
        );

        res.json({
            weather,
            mood,
            count: recommendations.length,
            recommendations
        });
    } catch (error) {
        console.error("Error generating outfit recommendations:", error);
        res.status(500).json({ message: "Failed to generate outfit recommendations" });
    }
});

// GET /api/ai/wardrobe-analytics - Get wardrobe insights and analytics
router.get("/wardrobe-analytics", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const wardrobeItems = await storage.getWardrobeItems(req.user!.id);
        const wearLogs = await storage.getWearLogs(req.user!.id);

        // Calculate analytics
        const totalItems = wardrobeItems.length;
        const totalValue = wardrobeItems.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);

        // Items by category
        const byCategory: Record<string, number> = {};
        wardrobeItems.forEach(item => {
            byCategory[item.category] = (byCategory[item.category] || 0) + 1;
        });

        // Color distribution
        const byColor: Record<string, number> = {};
        wardrobeItems.forEach(item => {
            const color = item.color || 'unknown';
            byColor[color] = (byColor[color] || 0) + 1;
        });

        // Most worn items
        const mostWorn = [...wardrobeItems]
            .sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0))
            .slice(0, 5);

        // Least worn (with at least 1 wear)
        const leastWorn = [...wardrobeItems]
            .filter(i => i.wearCount && i.wearCount > 0)
            .sort((a, b) => (a.wearCount || 0) - (b.wearCount || 0))
            .slice(0, 5);

        // Unworn items
        const unwornItems = wardrobeItems.filter(i => !i.wearCount || i.wearCount === 0);

        // Cost per wear analysis
        const itemsWithCPW = wardrobeItems
            .filter(i => i.purchasePrice && i.wearCount && i.wearCount > 0)
            .map(i => ({
                ...i,
                costPerWear: (i.purchasePrice || 0) / (i.wearCount || 1)
            }))
            .sort((a, b) => a.costPerWear - b.costPerWear);

        // Recent wear activity
        const recentWears = wearLogs.slice(0, 10);

        res.json({
            summary: {
                totalItems,
                totalValue,
                favoriteCount: wardrobeItems.filter(i => i.favorite).length,
                unwornCount: unwornItems.length,
                averageCPW: itemsWithCPW.length > 0
                    ? itemsWithCPW.reduce((sum, i) => sum + i.costPerWear, 0) / itemsWithCPW.length
                    : null
            },
            distribution: {
                byCategory,
                byColor
            },
            insights: {
                mostWorn,
                leastWorn,
                unwornItems: unwornItems.slice(0, 10),
                bestValueItems: itemsWithCPW.slice(0, 5),
                recentActivity: recentWears
            }
        });
    } catch (error) {
        console.error("Error getting wardrobe analytics:", error);
        res.status(500).json({ message: "Failed to get wardrobe analytics" });
    }
});

export default router;
