
import { Request, Response } from "express";
import { z } from "zod";
import storage from "../storage";
import { insertWeatherPreferenceSchema, insertMoodPreferenceSchema } from "@shared/schema";

// Partial schemas for PATCH — re-use same shape but allow all fields optional,
// and strip any attempt to mutate userId/id via mass-assignment.
const updateWeatherPreferenceSchema = insertWeatherPreferenceSchema
    .partial()
    .omit({ userId: true as never });
const updateMoodPreferenceSchema = insertMoodPreferenceSchema
    .partial()
    .omit({ userId: true as never });

// Weather Preferences
export const getWeatherPreferences = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const preferences = await storage.getWeatherPreferences(req.user!.id);
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch weather preferences" });
    }
};

export const createWeatherPreference = async (req: Request, res: Response) => {
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
};

export const updateWeatherPreference = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const id = parseInt(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid preference id" });
        }

        // Ownership: scan user's preferences and confirm this id belongs to them.
        const userPrefs = await storage.getWeatherPreferences(req.user!.id);
        const owned = userPrefs.find(p => p.id === id);
        if (!owned) {
            return res.status(404).json({ message: "Weather preference not found" });
        }

        const validated = updateWeatherPreferenceSchema.parse(req.body);

        const updatedPreference = await storage.updateWeatherPreference(id, validated);
        if (!updatedPreference) {
            return res.status(404).json({ message: "Weather preference not found" });
        }
        res.json(updatedPreference);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid weather preference data", errors: error.format() });
        }
        res.status(500).json({ message: "Failed to update weather preference" });
    }
};

export const deleteWeatherPreference = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const id = parseInt(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid preference id" });
        }

        const userPrefs = await storage.getWeatherPreferences(req.user!.id);
        const owned = userPrefs.find(p => p.id === id);
        if (!owned) {
            return res.status(404).json({ message: "Weather preference not found" });
        }

        const deleted = await storage.deleteWeatherPreference(id);
        if (!deleted) {
            return res.status(404).json({ message: "Weather preference not found" });
        }
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete weather preference" });
    }
};

// Mood Preferences
export const getMoodPreferences = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const preferences = await storage.getMoodPreferences(req.user!.id);
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch mood preferences" });
    }
};

export const createMoodPreference = async (req: Request, res: Response) => {
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
};

export const updateMoodPreference = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const id = parseInt(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid preference id" });
        }

        const userPrefs = await storage.getMoodPreferences(req.user!.id);
        const owned = userPrefs.find(p => p.id === id);
        if (!owned) {
            return res.status(404).json({ message: "Mood preference not found" });
        }

        const validated = updateMoodPreferenceSchema.parse(req.body);

        const updatedPreference = await storage.updateMoodPreference(id, validated);
        if (!updatedPreference) {
            return res.status(404).json({ message: "Mood preference not found" });
        }
        res.json(updatedPreference);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Invalid mood preference data", errors: error.format() });
        }
        res.status(500).json({ message: "Failed to update mood preference" });
    }
};

export const deleteMoodPreference = async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
        const id = parseInt(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ message: "Invalid preference id" });
        }

        const userPrefs = await storage.getMoodPreferences(req.user!.id);
        const owned = userPrefs.find(p => p.id === id);
        if (!owned) {
            return res.status(404).json({ message: "Mood preference not found" });
        }

        const deleted = await storage.deleteMoodPreference(id);
        if (!deleted) {
            return res.status(404).json({ message: "Mood preference not found" });
        }
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete mood preference" });
    }
};
