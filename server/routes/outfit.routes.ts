/**
 * Outfit Routes Module
 * Handles CRUD operations for outfits
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import storage from "../storage";
import { insertOutfitSchema } from "@shared/schema";

const router = Router();

// Helper function to validate and parse numeric IDs
const parseId = (id: string): number | null => {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) || parsed < 1 ? null : parsed;
};

// GET /api/outfits - List all outfits
router.get("/", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const outfits = await storage.getOutfits(req.user!.id);
        res.json(outfits);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch outfits" });
    }
});

// POST /api/outfits - Create new outfit
router.post("/", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const outfitData = insertOutfitSchema.parse({
            ...req.body,
            userId: req.user!.id
        });

        const outfit = await storage.createOutfit(outfitData);
        res.status(201).json(outfit);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid outfit data", errors: error.format() });
        }
        res.status(500).json({ message: "Failed to create outfit" });
    }
});

// POST /api/outfits/:id/schedule - Schedule an outfit
router.post("/:id/schedule", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid outfit ID" });

    try {
        const { date, eventName } = req.body;
        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        const entry = await storage.addToOutfitCalendar({
            userId: req.user!.id,
            outfitId: id,
            date: new Date(date),
            eventName: eventName || null,
            notes: null,
            isWorn: false
        });

        res.json(entry);
    } catch (error) {
        res.status(500).json({ message: "Failed to schedule outfit" });
    }
});

// POST /api/outfits/random - Generate random outfit
router.post("/random", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const userId = req.user!.id;
        const { occasion, season } = req.query;

        // Get all available items
        let items = await storage.getWardrobeItems(userId);
        items = items.filter(item => !item.status || item.status === 'available');

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
});

// GET /api/items/:id/possibilities - Get outfit possibilities for item
router.get("/items/:id/possibilities", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const userId = req.user!.id;
        const itemId = parseInt(req.params.id);

        if (!itemId || isNaN(itemId)) {
            return res.status(400).json({ message: "Invalid item ID" });
        }

        const item = await storage.getWardrobeItem(itemId);
        if (!item || item.userId !== userId) {
            return res.status(404).json({ message: "Item not found" });
        }

        const allOutfits = await storage.getOutfits(userId);
        const outfitsWithItem = allOutfits.filter(outfit => outfit.items.includes(itemId));

        const allItems = await storage.getWardrobeItems(userId);
        const availableItems = allItems.filter(i =>
            i.id !== itemId &&
            (!i.status || i.status === 'available')
        );

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
            versatilityScore: outfitsWithItem.length,
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
});

// GET /api/outfits/:id - Get single outfit
router.get("/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid outfit ID" });

    try {
        const outfit = await storage.getOutfit(id);
        if (!outfit) {
            return res.status(404).json({ message: "Outfit not found" });
        }
        if (outfit.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }
        res.json(outfit);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch outfit" });
    }
});

// PUT /api/outfits/:id - Update outfit
router.put("/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid outfit ID" });

    try {
        const existing = await storage.getOutfit(id);
        if (!existing) {
            return res.status(404).json({ message: "Outfit not found" });
        }
        if (existing.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const updated = await storage.updateOutfit(id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Failed to update outfit" });
    }
});

// DELETE /api/outfits/:id - Delete outfit
router.delete("/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid outfit ID" });

    try {
        const existing = await storage.getOutfit(id);
        if (!existing) {
            return res.status(404).json({ message: "Outfit not found" });
        }
        if (existing.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await storage.deleteOutfit(id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete outfit" });
    }
});

// POST /api/outfits/add-items - Add items to existing or new outfit
router.post("/add-items", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const { outfitId, itemIds, outfitName } = req.body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
        return res.status(400).json({ message: "itemIds must be a non-empty array" });
    }

    try {
        // If outfit ID provided, add to existing outfit
        if (outfitId) {
            const id = parseId(outfitId.toString());
            if (!id) return res.status(400).json({ message: "Invalid outfit ID" });

            const outfit = await storage.getOutfit(id);
            if (!outfit) {
                return res.status(404).json({ message: "Outfit not found" });
            }
            if (outfit.userId !== req.user!.id) {
                return res.status(403).json({ message: "Forbidden" });
            }

            // Merge item IDs (avoid duplicates)
            const existingItemIds = outfit.items || [];
            const newItemIds = [...new Set([...existingItemIds, ...itemIds])];

            const updated = await storage.updateOutfit(id, { items: newItemIds });
            return res.json(updated);
        }

        // Otherwise, create new outfit
        if (!outfitName) {
            return res.status(400).json({ message: "outfitName is required when creating a new outfit" });
        }

        const newOutfit = await storage.createOutfit({
            userId: req.user!.id,
            name: outfitName,
            items: itemIds,
            occasion: "casual"
        });

        res.status(201).json(newOutfit);
    } catch (error) {
        res.status(500).json({ message: "Failed to add items to outfit" });
    }
});

export default router;
