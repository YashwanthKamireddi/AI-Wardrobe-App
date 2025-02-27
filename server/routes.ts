import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { getWeatherForLocation } from "./weather";
import { z } from "zod";
import { insertWardrobeItemSchema, insertOutfitSchema } from "@shared/schema";

// Helper function to check authentication
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes: /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Wardrobe routes
  app.get("/api/wardrobe", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const items = await storage.getWardrobeItems(userId);
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wardrobe items" });
    }
  });

  app.get("/api/wardrobe/category/:category", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { category } = req.params;
      const items = await storage.getWardrobeItemsByCategory(userId, category);
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wardrobe items by category" });
    }
  });

  app.get("/api/wardrobe/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.getWardrobeItemById(parseInt(id));
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      if (item.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wardrobe item" });
    }
  });

  app.post("/api/wardrobe", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const itemData = { ...req.body, userId };
      
      // Validate the request data
      const validData = insertWardrobeItemSchema.parse(itemData);
      
      const newItem = await storage.addWardrobeItem(validData);
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add wardrobe item" });
    }
  });

  app.put("/api/wardrobe/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.getWardrobeItemById(parseInt(id));
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      if (item.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedItem = await storage.updateWardrobeItem(parseInt(id), req.body);
      res.status(200).json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update wardrobe item" });
    }
  });

  app.delete("/api/wardrobe/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.getWardrobeItemById(parseInt(id));
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      if (item.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteWardrobeItem(parseInt(id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete wardrobe item" });
    }
  });

  // Outfits routes
  app.get("/api/outfits", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const outfits = await storage.getOutfits(userId);
      res.status(200).json(outfits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch outfits" });
    }
  });

  app.get("/api/outfits/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const outfit = await storage.getOutfitById(parseInt(id));
      
      if (!outfit) {
        return res.status(404).json({ message: "Outfit not found" });
      }
      
      if (outfit.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.status(200).json(outfit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch outfit" });
    }
  });

  app.post("/api/outfits", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const outfitData = { ...req.body, userId };
      
      // Validate the request data
      const validData = insertOutfitSchema.parse(outfitData);
      
      const newOutfit = await storage.addOutfit(validData);
      res.status(201).json(newOutfit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add outfit" });
    }
  });

  app.put("/api/outfits/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const outfit = await storage.getOutfitById(parseInt(id));
      
      if (!outfit) {
        return res.status(404).json({ message: "Outfit not found" });
      }
      
      if (outfit.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedOutfit = await storage.updateOutfit(parseInt(id), req.body);
      res.status(200).json(updatedOutfit);
    } catch (error) {
      res.status(500).json({ message: "Failed to update outfit" });
    }
  });

  app.delete("/api/outfits/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const outfit = await storage.getOutfitById(parseInt(id));
      
      if (!outfit) {
        return res.status(404).json({ message: "Outfit not found" });
      }
      
      if (outfit.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteOutfit(parseInt(id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete outfit" });
    }
  });

  // Weather API route
  app.get("/api/weather", isAuthenticated, async (req, res) => {
    try {
      const { location } = req.query;
      if (!location) {
        return res.status(400).json({ message: "Location is required" });
      }
      
      const weatherData = await getWeatherForLocation(location as string);
      res.status(200).json(weatherData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
