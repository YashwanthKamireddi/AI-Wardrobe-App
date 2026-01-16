/**
 * Wardrobe Routes Module
 * Handles CRUD operations for wardrobe items
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import storage from "../storage";
import { insertWardrobeItemSchema } from "@shared/schema";

const router = Router();

// Input validation schema for PATCH
const patchWardrobeItemSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    category: z.string().min(1).max(50).optional(),
    color: z.string().min(1).max(50).optional(),
    brand: z.string().max(100).optional(),
    size: z.string().max(20).optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    favorite: z.boolean().optional(),
}).strict();

// Helper function to validate and parse numeric IDs
const parseId = (id: string): number | null => {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) || parsed < 1 ? null : parsed;
};

// GET /api/wardrobe - List all wardrobe items
router.get("/", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const items = await storage.getWardrobeItems(req.user!.id);
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch wardrobe items" });
    }
});

// POST /api/wardrobe - Create new wardrobe item
router.post("/", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const itemData = insertWardrobeItemSchema.parse({
            ...req.body,
            userId: req.user!.id
        });

        const item = await storage.createWardrobeItem(itemData);
        res.status(201).json(item);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid wardrobe item data", errors: error.format() });
        }
        res.status(500).json({ message: "Failed to create wardrobe item" });
    }
});

// GET /api/wardrobe/stats - Get wardrobe statistics
router.get("/stats", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const items = await storage.getWardrobeItems(req.user!.id);

        const stats = {
            totalItems: items.length,
            totalValue: items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0),
            byCategory: {} as Record<string, number>,
            favoriteCount: items.filter(i => i.favorite).length,
            mostWorn: items.sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0)).slice(0, 5),
            unworn: items.filter(i => !i.wearCount || i.wearCount === 0).length
        };

        items.forEach(item => {
            stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Failed to get wardrobe stats" });
    }
});

// GET /api/wardrobe/:id - Get single wardrobe item
router.get("/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid item ID" });

    try {
        const item = await storage.getWardrobeItem(id);
        if (!item) {
            return res.status(404).json({ message: "Wardrobe item not found" });
        }
        if (item.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch wardrobe item" });
    }
});

// PUT /api/wardrobe/:id - Update wardrobe item
router.put("/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid item ID" });

    try {
        const existing = await storage.getWardrobeItem(id);
        if (!existing) {
            return res.status(404).json({ message: "Wardrobe item not found" });
        }
        if (existing.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const updated = await storage.updateWardrobeItem(id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Failed to update wardrobe item" });
    }
});

// PATCH /api/wardrobe/:id - Partial update wardrobe item
router.patch("/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid item ID" });

    try {
        const existing = await storage.getWardrobeItem(id);
        if (!existing) {
            return res.status(404).json({ message: "Wardrobe item not found" });
        }
        if (existing.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const validatedData = patchWardrobeItemSchema.parse(req.body);
        const updated = await storage.updateWardrobeItem(id, validatedData);
        res.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid update data", errors: error.format() });
        }
        res.status(500).json({ message: "Failed to update wardrobe item" });
    }
});

// DELETE /api/wardrobe/:id - Delete wardrobe item
router.delete("/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid item ID" });

    try {
        const existing = await storage.getWardrobeItem(id);
        if (!existing) {
            return res.status(404).json({ message: "Wardrobe item not found" });
        }
        if (existing.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await storage.deleteWardrobeItem(id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete wardrobe item" });
    }
});

// GET /api/wardrobe/:id/wear-log - Get wear logs for specific item
router.get("/:id/wear-log", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const itemId = parseId(req.params.id);
    if (!itemId) return res.status(400).json({ message: "Invalid item ID" });

    try {
        const item = await storage.getWardrobeItem(itemId);
        if (!item) {
            return res.status(404).json({ message: "Wardrobe item not found" });
        }
        if (item.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const logs = await storage.getItemWearLogs(itemId);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch item wear logs" });
    }
});

export default router;
