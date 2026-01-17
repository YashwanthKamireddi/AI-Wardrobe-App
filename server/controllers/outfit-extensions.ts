/**
 * Outfit Randomizer and Possibilities Endpoints
 *
 * Extends outfit controller with smart outfit generation
 */

import { Request, Response } from "express";
import storage from "../storage";

/**
 * POST /api/outfits/random
 * Generates a random outfit from available items
 */
export const generateRandomOutfit = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;
        const { occasion, season, formality } = req.query;

        // Get all available items
        let items = await storage.getWardrobeItems(userId);

        // Filter by status (only available items)
        items = items.filter(item => !item.status || item.status === 'available');

        // Apply filters if provided
        if (season) {
            items = items.filter(item => !item.season || item.season === season || item.season === 'all');
        }

        if (items.length < 2) {
            return res.status(400).json({ message: "Not enough items to create an outfit" });
        }

        // Simple outfit generation: pick one from each category
        const categories = ['tops', 'bottoms', 'shoes', 'outerwear', 'accessories'];
        const outfitItems: number[] = [];

        for (const category of categories) {
            const categoryItems = items.filter(item => item.category === category);
            if (categoryItems.length > 0) {
                const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
                outfitItems.push(randomItem.id);
            }
        }

        // Ensure at least 2 items
        if (outfitItems.length < 2) {
            // Add random items until we have at least 2
            const remainingItems = items.filter(item => !outfitItems.includes(item.id));
            while (outfitItems.length < 2 && remainingItems.length > 0) {
                const randomIndex = Math.floor(Math.random() * remainingItems.length);
                outfitItems.push(remainingItems[randomIndex].id);
                remainingItems.splice(randomIndex, 1);
            }
        }

        res.json({
            items: outfitItems,
            suggestion: true,
            occasion: occasion || 'casual',
            season: season || 'all',
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to generate random outfit" });
    }
};

/**
 * GET /api/items/:id/outfit-possibilities
 * Shows all outfits that could be created with this item
 */
export const getItemOutfitPossibilities = async (req: Request, res: Response) => {
    try {
        if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

        const userId = req.user!.id;
        const itemId = parseInt(req.params.id);

        if (!itemId || isNaN(itemId)) {
            return res.status(400).json({ message: "Invalid item ID" });
        }

        // Get the item
        const item = await storage.getWardrobeItem(itemId);
        if (!item || item.userId !== userId) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Get all outfits that include this item
        const allOutfits = await storage.getOutfits(userId);
        const outfitsWithItem = allOutfits.filter(outfit => outfit.items.includes(itemId));

        // Calculate versatility score
        const versatilityScore = outfitsWithItem.length;

        // Get all items to show potential combinations
        const allItems = await storage.getWardrobeItems(userId);
        const availableItems = allItems.filter(i =>
            i.id !== itemId &&
            (!i.status || i.status === 'available')
        );

        // Group by category for smart pairing suggestions
        const pairings: Record<string, number[]> = {};
        availableItems.forEach(availableItem => {
            if (!pairings[availableItem.category]) {
                pairings[availableItem.category] = [];
            }
            pairings[availableItem.category].push(availableItem.id);
        });

        res.json({
            itemId,
            itemName: item.name,
            imageUrl: item.imageUrl,
            outfitCount: outfitsWithItem.length,
            versatilityScore,
            existingOutfits: outfitsWithItem.map(outfit => ({
                id: outfit.id,
                name: outfit.name,
                items: outfit.items,
            })),
            potentialPairings: pairings,
            totalCombinations: availableItems.length,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to get outfit possibilities" });
    }
};
