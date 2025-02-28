import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertWardrobeItemSchema, 
  insertOutfitSchema, 
  insertWeatherPreferenceSchema, 
  insertMoodPreferenceSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Wardrobe routes
  app.get("/api/wardrobe", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const items = await storage.getWardrobeItems(req.user!.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wardrobe items" });
    }
  });

  app.post("/api/wardrobe", async (req: Request, res: Response) => {
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

  app.get("/api/wardrobe/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const id = parseInt(req.params.id);
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

  app.patch("/api/wardrobe/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const id = parseInt(req.params.id);
      const item = await storage.getWardrobeItem(id);

      if (!item) {
        return res.status(404).json({ message: "Wardrobe item not found" });
      }

      if (item.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedItem = await storage.updateWardrobeItem(id, req.body);
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update wardrobe item" });
    }
  });

  app.delete("/api/wardrobe/:id", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const id = parseInt(req.params.id);
      const item = await storage.getWardrobeItem(id);

      if (!item) {
        return res.status(404).json({ message: "Wardrobe item not found" });
      }

      if (item.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteWardrobeItem(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete wardrobe item" });
    }
  });

  // Outfit routes
  app.get("/api/outfits", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const outfits = await storage.getOutfits(req.user!.id);
      res.json(outfits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch outfits" });
    }
  });

  app.post("/api/outfits", async (req: Request, res: Response) => {
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

  app.get("/api/outfits/:id", async (req: Request, res: Response) => {
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
  });

  app.patch("/api/outfits/:id", async (req: Request, res: Response) => {
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

      const updatedOutfit = await storage.updateOutfit(id, req.body);
      res.json(updatedOutfit);
    } catch (error) {
      res.status(500).json({ message: "Failed to update outfit" });
    }
  });

  app.delete("/api/outfits/:id", async (req: Request, res: Response) => {
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
  });

  // Inspiration routes
  app.get("/api/inspirations", async (req: Request, res: Response) => {
    try {
      const inspirations = await storage.getInspirations();
      res.json(inspirations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspirations" });
    }
  });

  app.get("/api/inspirations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const inspiration = await storage.getInspiration(id);

      if (!inspiration) {
        return res.status(404).json({ message: "Inspiration not found" });
      }

      res.json(inspiration);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspiration" });
    }
  });

  // Weather preferences routes
  app.get("/api/weather-preferences", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const preferences = await storage.getWeatherPreferences(req.user!.id);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weather preferences" });
    }
  });

  app.post("/api/weather-preferences", async (req: Request, res: Response) => {
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

  // Mood preferences routes
  app.get("/api/mood-preferences", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const preferences = await storage.getMoodPreferences(req.user!.id);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mood preferences" });
    }
  });

  app.post("/api/mood-preferences", async (req: Request, res: Response) => {
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

  // Weather API route - mock for now
  app.get("/api/weather", (req: Request, res: Response) => {
    // In a real application, we would integrate with a weather API
    // For now, we'll return mock data based on the location parameter
    const location = req.query.location as string || "New York City";

    // Use the getWeatherForLocation function from weather.ts
    import("./weather").then(({ getWeatherForLocation }) => {
      getWeatherForLocation(location).then(weatherData => {
        // Check if the response is an error
        if ('error' in weatherData) {
          return res.status(400).json(weatherData);
        }

        // Map the weather data to the expected response format
        const response = {
          location: location,
          temperature: weatherData.temperature,
          condition: weatherData.description,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed,
          icon: weatherData.type // We use the weather type as the icon identifier
        };

        res.json(response);
      });
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}