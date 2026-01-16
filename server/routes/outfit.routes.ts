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

export default router;
