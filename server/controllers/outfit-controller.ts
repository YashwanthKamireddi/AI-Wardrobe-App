
import { Request, Response } from "express";
import { z } from "zod";
import crypto from "crypto";
import storage from "../storage";
import { insertOutfitSchema, insertOutfitCalendarSchema } from "@shared/schema";

export const getOutfits = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const outfits = await storage.getOutfits(req.user!.id);
        res.json(outfits);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch outfits" });
    }
};

export const createOutfit = async (req: Request, res: Response) => {
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
};

export const getOutfit = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const id = parseInt(req.params.id);
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
};

// Partial-update schema for outfits: all fields optional, with userId/id stripped
// so a client can't hand us an overriding userId and reassign ownership.
const updateOutfitSchema = insertOutfitSchema.partial().omit({ userId: true as never });

export const updateOutfit = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const id = parseInt(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid outfit id" });
        }

        const outfit = await storage.getOutfit(id);
        if (!outfit) {
            return res.status(404).json({ message: "Outfit not found" });
        }
        if (outfit.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const validated = updateOutfitSchema.parse(req.body);

        const updatedOutfit = await storage.updateOutfit(id, validated);
        res.json(updatedOutfit);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid outfit data", errors: error.format() });
        }
        res.status(500).json({ message: "Failed to update outfit" });
    }
};

export const deleteOutfit = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const id = parseInt(req.params.id);
        const outfit = await storage.getOutfit(id);

        if (!outfit) {
            return res.status(404).json({ message: "Outfit not found" });
        }

        if (outfit.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await storage.deleteOutfit(id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete outfit" });
    }
};

export const getCalendarOutfits = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const events = await storage.getCalendarEvents(req.user!.id);
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch calendar outfits" });
    }
};

export const scheduleOutfit = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const eventData = insertOutfitCalendarSchema.parse({
            ...req.body,
            userId: req.user!.id
        });

        // Verify outfit exists if provided
        if (eventData.outfitId) {
            const outfit = await storage.getOutfit(eventData.outfitId);
            if (!outfit || outfit.userId !== req.user!.id) {
                return res.status(404).json({ message: "Outfit not found or access denied" });
            }
        }

        const event = await storage.createCalendarEvent(eventData);
        res.status(201).json(event);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid calendar data", errors: error.format() });
        }
        res.status(500).json({ message: "Failed to schedule outfit" });
    }
};

export const deleteCalendarEvent = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const id = parseInt(req.params.id);
        const events = await storage.getCalendarEvents(req.user!.id);
        const event = events.find(e => e.id === id);

        if (!event) {
            return res.status(404).json({ message: "Calendar event not found" });
        }

        await storage.deleteCalendarEvent(id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete calendar event" });
    }
};

// Share token format: base64url(`${outfitId}-${16 random hex bytes}`).
// Stateless (no DB table needed for the demo) yet stable — generation and
// decode share this helper so the two routes can never drift again.
function encodeShareId(outfitId: number): string {
    const salt = crypto.randomBytes(16).toString('hex');
    return Buffer.from(`${outfitId}-${salt}`).toString('base64url');
}

function decodeShareId(shareId: string): number | null {
    try {
        const decoded = Buffer.from(shareId, 'base64url').toString('utf8');
        const [idStr] = decoded.split('-');
        const id = parseInt(idStr, 10);
        return Number.isFinite(id) && id > 0 ? id : null;
    } catch {
        return null;
    }
}

export const shareOutfit = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const id = parseInt(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid outfit id" });
        }
        const outfit = await storage.getOutfit(id);

        if (!outfit) {
            return res.status(404).json({ message: "Outfit not found" });
        }

        if (outfit.userId !== req.user!.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const shareId = encodeShareId(outfit.id);

        const shareableLink = `${req.protocol}://${req.get('host')}/shared-outfit/${shareId}`;

        res.status(200).json({
            message: "Outfit shared successfully",
            shareId,
            shareableLink
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to share outfit" });
    }
};

export const getSharedOutfit = async (req: Request, res: Response) => {
    try {
        const { shareId } = req.params;
        const outfitId = decodeShareId(shareId);
        if (outfitId === null) {
            return res.status(400).json({ message: "Invalid share ID" });
        }

        const outfit = await storage.getOutfit(outfitId);
        if (!outfit) {
            return res.status(404).json({ message: "Shared outfit not found" });
        }

        const outfitItems = await Promise.all(
            outfit.items.map(async (itemId) => {
                return await storage.getWardrobeItem(itemId);
            })
        );

        const validItems = outfitItems.filter(Boolean);

        const publicOutfit = {
            id: outfit.id,
            name: outfit.name,
            items: validItems.map(item => item ? {
                id: item.id,
                name: item.name,
                category: item.category,
                subcategory: item.subcategory,
                color: item.color,
                season: item.season,
                imageUrl: item.imageUrl,
                tags: item.tags
            } : null).filter(Boolean),
            occasion: outfit.occasion || "casual",
            season: outfit.season || "all",
            weatherConditions: outfit.weatherConditions || [],
            mood: outfit.mood || "neutral",
            shared: true
        };

        res.json(publicOutfit);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch shared outfit" });
    }
};
