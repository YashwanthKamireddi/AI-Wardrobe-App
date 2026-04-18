
import { Request, Response } from "express";
import { z } from "zod";
import storage from "../storage";

// Validate the wear-log create body. Dates accepted as ISO strings or Date,
// and at least one of wardrobeItemId / outfitId is required (checked below).
const createWearLogBodySchema = z.object({
    wardrobeItemId: z.number().int().positive().optional().nullable(),
    outfitId: z.number().int().positive().optional().nullable(),
    wornDate: z.union([z.string(), z.date()]).optional(),
    occasion: z.string().max(200).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
    rating: z.number().int().min(1).max(5).optional().nullable(),
});

export const getWearLogs = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const logs = await storage.getWearLogs(req.user!.id);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch wear logs" });
    }
};

export const getItemWearLogs = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const itemId = parseInt(req.params.id);

        // Verify item belongs to user
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
};

export const createWearLog = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const parsed = createWearLogBodySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid wear log data", errors: parsed.error.format() });
        }
        const { wardrobeItemId, outfitId, wornDate, occasion, notes, rating } = parsed.data;

        if (!wardrobeItemId && !outfitId) {
            return res.status(400).json({ message: "Either wardrobeItemId or outfitId is required" });
        }

        // Validate item/outfit belongs to user
        if (wardrobeItemId) {
            const item = await storage.getWardrobeItem(wardrobeItemId);
            if (!item) {
                return res.status(404).json({ message: "Wardrobe item not found" });
            }
            if (item.userId !== req.user!.id) {
                return res.status(403).json({ message: "Forbidden" });
            }
        }

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
};

export const deleteWearLog = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const id = parseInt(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid wear log id" });
        }

        // Ownership check: only delete logs belonging to the authed user.
        const userLogs = await storage.getWearLogs(req.user!.id);
        const owned = userLogs.find(l => l.id === id);
        if (!owned) {
            return res.status(404).json({ message: "Wear log not found" });
        }

        const deleted = await storage.deleteWearLog(id);
        if (!deleted) {
            return res.status(404).json({ message: "Wear log not found" });
        }
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete wear log" });
    }
};
