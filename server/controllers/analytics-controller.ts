/**
 * Analytics Controller
 *
 * Handles all analytics and statistics endpoints for wardrobe insights
 */

import { Request, Response } from "express";
import storage from "../storage";

/**
 * GET /api/analytics/wardrobe-stats
 * Returns comprehensive wardrobe statistics dashboard data
 */
export const getWardrobeStats = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;

        // Get all items for this user
        const items = await storage.getWardrobeItems(userId);
        const outfits = await storage.getOutfits(userId);

        // Calculate statistics
        const totalItems = items.length;
        const totalOutfits = outfits.length;

        // Total wardrobe value
        const totalValue = items.reduce((sum: number, item) => {
            return sum + (item.purchasePrice || 0);
        }, 0);

        // Category breakdown
        const categoryBreakdown = items.reduce((acc: Record<string, number>, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Color breakdown
        const colorBreakdown = items.reduce((acc: Record<string, number>, item) => {
            if (item.color) {
                acc[item.color] = (acc[item.color] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        // Brand breakdown
        const brandBreakdown = items.reduce((acc: Record<string, number>, item) => {
            if (item.brand) {
                acc[item.brand] = (acc[item.brand] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        // Season breakdown
        const seasonBreakdown = items.reduce((acc: Record<string, number>, item) => {
            if (item.season) {
                acc[item.season] = (acc[item.season] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        // Worn vs unworn
        const wornItems = items.filter(item => item.wearCount && item.wearCount > 0).length;
        const unwornItems = totalItems - wornItems;
        const percentWorn = totalItems > 0 ? (wornItems / totalItems) * 100 : 0;

        // Status breakdown
        const statusBreakdown = items.reduce((acc: Record<string, number>, item) => {
            const status = item.status || 'available';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        res.json({
            totalItems,
            totalOutfits,
            totalValue,
            categoryBreakdown,
            colorBreakdown,
            brandBreakdown,
            seasonBreakdown,
            wornItems,
            unwornItems,
            percentWorn: Math.round(percentWorn * 10) / 10,
            statusBreakdown,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to get wardrobe stats" });
    }
};

/**
 * GET /api/analytics/cost-per-wear
 * Returns cost-per-wear data for all items
 */
export const getCostPerWear = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;
        const items = await storage.getWardrobeItems(userId);

        const costPerWearData = items
            .filter(item => item.purchasePrice && item.purchasePrice > 0)
            .map(item => {
                const wearCount = item.wearCount || 0;
                const costPerWear = wearCount > 0 ? item.purchasePrice! / wearCount : item.purchasePrice!;

                return {
                    id: item.id,
                    name: item.name,
                    imageUrl: item.imageUrl,
                    category: item.category,
                    purchasePrice: item.purchasePrice,
                    wearCount,
                    costPerWear: Math.round(costPerWear * 100) / 100,
                };
            })
            .sort((a, b) => a.costPerWear - b.costPerWear); // Best value first

        res.json(costPerWearData);
    } catch (error) {
        res.status(500).json({ message: "Failed to get cost per wear data" });
    }
};

/**
 * GET /api/analytics/most-worn
 * Returns most worn items
 */
export const getMostWorn = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;
        const limit = parseInt(req.query.limit as string) || 10;

        const items = await storage.getWardrobeItems(userId);

        const mostWorn = items
            .filter(item => item.wearCount && item.wearCount > 0)
            .sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0))
            .slice(0, limit)
            .map(item => ({
                id: item.id,
                name: item.name,
                imageUrl: item.imageUrl,
                category: item.category,
                wearCount: item.wearCount,
                lastWorn: item.lastWorn,
            }));

        res.json(mostWorn);
    } catch (error) {
        res.status(500).json({ message: "Failed to get most worn items" });
    }
};

/**
 * GET /api/analytics/least-worn
 * Returns least worn items
 */
export const getLeastWorn = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;
        const limit = parseInt(req.query.limit as string) || 10;

        const items = await storage.getWardrobeItems(userId);

        const leastWorn = items
            .filter(item => item.wearCount !== null && item.wearCount !== undefined)
            .sort((a, b) => (a.wearCount || 0) - (b.wearCount || 0))
            .slice(0, limit)
            .map(item => ({
                id: item.id,
                name: item.name,
                imageUrl: item.imageUrl,
                category: item.category,
                wearCount: item.wearCount || 0,
                lastWorn: item.lastWorn,
            }));

        res.json(leastWorn);
    } catch (error) {
        res.status(500).json({ message: "Failed to get least worn items" });
    }
};

/**
 * GET /api/analytics/never-worn
 * Returns items that have never been worn
 */
export const getNeverWorn = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;
        const items = await storage.getWardrobeItems(userId);

        const neverWorn = items
            .filter(item => !item.wearCount || item.wearCount === 0)
            .map(item => ({
                id: item.id,
                name: item.name,
                imageUrl: item.imageUrl,
                category: item.category,
                purchaseDate: item.purchaseDate,
                purchasePrice: item.purchasePrice,
            }));

        res.json(neverWorn);
    } catch (error) {
        res.status(500).json({ message: "Failed to get never worn items" });
    }
};

/**
 * GET /api/analytics/style-patterns
 * Returns style analytics and patterns
 */
export const getStylePatterns = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;
        const items = await storage.getWardrobeItems(userId);
        const outfits = await storage.getOutfits(userId);

        // Identify "go-to" items (top 20% most worn)
        const sorted = [...items].sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0));
        const topIndex = Math.ceil(sorted.length * 0.2);
        const goToItems = sorted.slice(0, topIndex).map(item => ({
            id: item.id,
            name: item.name,
            imageUrl: item.imageUrl,
            wearCount: item.wearCount,
        }));

        // Calculate average wear count
        const totalWears = items.reduce((sum: number, item) => sum + (item.wearCount || 0), 0);
        const avgWearCount = items.length > 0 ? totalWears / items.length : 0;

        // Most versatile category (most used in outfits)
        const categoryUsage = items.reduce((acc: Record<string, number>, item) => {
            const usageCount = outfits.filter(outfit =>
                outfit.items.includes(item.id)
            ).length;
            acc[item.category] = (acc[item.category] || 0) + usageCount;
            return acc;
        }, {} as Record<string, number>);

        const mostVersatileCategory = Object.entries(categoryUsage)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

        res.json({
            goToItems,
            avgWearCount: Math.round(avgWearCount * 10) / 10,
            mostVersatileCategory,
            categoryUsage,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to get style patterns" });
    }
};
