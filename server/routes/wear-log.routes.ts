/**
 * Wear Log Routes Module
 * Handles wear tracking operations
 */

import { Router, Request, Response } from "express";
import storage from "../storage";

const router = Router();

// Helper function to validate and parse numeric IDs
const parseId = (id: string): number | null => {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) || parsed < 1 ? null : parsed;
};

// GET /api/wear-log - Get all wear logs for current user
router.get("/", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const logs = await storage.getWearLogs(req.user!.id);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch wear logs" });
    }
});

// POST /api/wear-log - Create new wear log entry
router.post("/", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const { wardrobeItemId, outfitId, wornDate, occasion, notes, rating } = req.body;

        // Validate that at least one of itemId or outfitId is provided
        if (!wardrobeItemId && !outfitId) {
            return res.status(400).json({ message: "Either wardrobeItemId or outfitId is required" });
        }

        // Validate item belongs to user
        if (wardrobeItemId) {
            const item = await storage.getWardrobeItem(wardrobeItemId);
            if (!item) {
                return res.status(404).json({ message: "Wardrobe item not found" });
            }
            if (item.userId !== req.user!.id) {
                return res.status(403).json({ message: "Forbidden" });
            }
        }

        // Validate outfit belongs to user
        if (outfitId) {
            const outfit = await storage.getOutfit(outfitId);
            if (!outfit) {
                return res.status(404).json({ message: "Outfit not found" });
            }
            if (outfit.userId !== req.user!.id) {
                return res.status(403).json({ message: "Forbidden" });
            }
        }

        const log = await storage.createWearLog({
            userId: req.user!.id,
            wardrobeItemId: wardrobeItemId || null,
            outfitId: outfitId || null,
            wornDate: new Date(wornDate || Date.now()),
            occasion: occasion || null,
            notes: notes || null,
            rating: rating || null
        });

        res.status(201).json(log);
    } catch (error) {
        console.error("Error creating wear log:", error);
        res.status(500).json({ message: "Failed to create wear log" });
    }
});

// DELETE /api/wear-log/:id - Delete wear log entry
router.delete("/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid wear log ID" });

    try {
        const deleted = await storage.deleteWearLog(id);
        if (!deleted) {
            return res.status(404).json({ message: "Wear log not found" });
        }
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete wear log" });
    }
});

export default router;
