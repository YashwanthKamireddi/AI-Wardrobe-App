/**
 * Preferences Routes Module
 * Handles weather and mood preferences CRUD
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import storage from "../storage";
import { insertWeatherPreferenceSchema, insertMoodPreferenceSchema } from "@shared/schema";

const router = Router();

// Helper function to validate and parse numeric IDs
const parseId = (id: string): number | null => {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) || parsed < 1 ? null : parsed;
};

// ============================================
// WEATHER PREFERENCES
// ============================================

// GET /api/weather-preferences
router.get("/weather-preferences", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const preferences = await storage.getWeatherPreferences(req.user!.id);
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch weather preferences" });
    }
});

// POST /api/weather-preferences
router.post("/weather-preferences", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const preferenceData = insertWeatherPreferenceSchema.parse({
            ...req.body,
            userId: req.user!.id
        });

        const preference = await storage.createWeatherPreference(preferenceData);
        res.status(201).json(preference);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid weather preference data", errors: error.format() });
        }
        res.status(500).json({ message: "Failed to create weather preference" });
    }
});

// PUT /api/weather-preferences/:id
router.put("/weather-preferences/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid preference ID" });

    try {
        const updated = await storage.updateWeatherPreference(id, req.body);
        if (!updated) {
            return res.status(404).json({ message: "Weather preference not found" });
        }
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Failed to update weather preference" });
    }
});

// DELETE /api/weather-preferences/:id
router.delete("/weather-preferences/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid preference ID" });

    try {
        const deleted = await storage.deleteWeatherPreference(id);
        if (!deleted) {
            return res.status(404).json({ message: "Weather preference not found" });
        }
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete weather preference" });
    }
});

// ============================================
// MOOD PREFERENCES
// ============================================

// GET /api/mood-preferences
router.get("/mood-preferences", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const preferences = await storage.getMoodPreferences(req.user!.id);
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch mood preferences" });
    }
});

// POST /api/mood-preferences
router.post("/mood-preferences", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const preferenceData = insertMoodPreferenceSchema.parse({
            ...req.body,
            userId: req.user!.id
        });

        const preference = await storage.createMoodPreference(preferenceData);
        res.status(201).json(preference);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid mood preference data", errors: error.format() });
        }
        res.status(500).json({ message: "Failed to create mood preference" });
    }
});

// PUT /api/mood-preferences/:id
router.put("/mood-preferences/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid preference ID" });

    try {
        const updated = await storage.updateMoodPreference(id, req.body);
        if (!updated) {
            return res.status(404).json({ message: "Mood preference not found" });
        }
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Failed to update mood preference" });
    }
});

// DELETE /api/mood-preferences/:id
router.delete("/mood-preferences/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid preference ID" });

    try {
        const deleted = await storage.deleteMoodPreference(id);
        if (!deleted) {
            return res.status(404).json({ message: "Mood preference not found" });
        }
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete mood preference" });
    }
});

export default router;
