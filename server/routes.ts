import type { Express, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import storage from "./storage";
import { z } from "zod";
import {
  insertWardrobeItemSchema,
  insertOutfitSchema,
  insertWeatherPreferenceSchema,
  insertMoodPreferenceSchema
} from "@shared/schema";
// Import AI service
import aiService from "./services/ai-service";


export async function registerRoutes(app: Express): Promise<void> {
  // Note: Health check and auth are already configured in app.ts
  // Only register business logic routes here

  // Helper function to validate and parse numeric IDs
  const parseId = (id: string): number | null => {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) || parsed < 1 ? null : parsed;
  };

  // Input validation schemas
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

  // Seed sample wardrobe items for demo purposes - MUST be before :id routes
  app.post("/api/wardrobe/seed", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const userId = req.user!.id;

      // Sample men's wardrobe items with high-quality Unsplash images
      const sampleItems = [
        // TOPS
        {
          userId,
          name: "Classic White Oxford Shirt",
          category: "tops",
          subcategory: "dress-shirt",
          color: "white",
          brand: "Ralph Lauren",
          size: "M",
          season: "all",
          imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
          tags: ["formal", "classic", "versatile"],
          favorite: true,
          purchasePrice: 8900,
        },
        {
          userId,
          name: "Navy Blue Polo",
          category: "tops",
          subcategory: "polo",
          color: "navy",
          brand: "Lacoste",
          size: "M",
          season: "summer",
          imageUrl: "https://images.unsplash.com/photo-1625910513413-5fc45e836d0f?w=400&h=500&fit=crop",
          tags: ["casual", "smart-casual", "preppy"],
          favorite: false,
          purchasePrice: 9500,
        },
        {
          userId,
          name: "Black Crew Neck T-Shirt",
          category: "tops",
          subcategory: "t-shirt",
          color: "black",
          brand: "COS",
          size: "M",
          season: "all",
          imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
          tags: ["casual", "minimal", "essential"],
          favorite: true,
          purchasePrice: 3500,
        },
        {
          userId,
          name: "Grey Cashmere Sweater",
          category: "tops",
          subcategory: "sweater",
          color: "grey",
          brand: "Uniqlo",
          size: "M",
          season: "winter",
          imageUrl: "https://images.unsplash.com/photo-1614975059251-992f11792b9f?w=400&h=500&fit=crop",
          tags: ["casual", "cozy", "minimal"],
          favorite: false,
          purchasePrice: 12900,
        },
        {
          userId,
          name: "Striped Linen Shirt",
          category: "tops",
          subcategory: "casual-shirt",
          color: "blue-white",
          brand: "J.Crew",
          size: "M",
          season: "summer",
          imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop",
          tags: ["casual", "summer", "vacation"],
          favorite: false,
          purchasePrice: 6500,
        },
        // BOTTOMS
        {
          userId,
          name: "Dark Indigo Slim Jeans",
          category: "bottoms",
          subcategory: "jeans",
          color: "indigo",
          brand: "Levi's",
          size: "32",
          season: "all",
          imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop",
          tags: ["casual", "essential", "versatile"],
          favorite: true,
          purchasePrice: 9800,
        },
        {
          userId,
          name: "Khaki Chinos",
          category: "bottoms",
          subcategory: "chinos",
          color: "khaki",
          brand: "Dockers",
          size: "32",
          season: "all",
          imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop",
          tags: ["smart-casual", "office", "versatile"],
          favorite: false,
          purchasePrice: 6500,
        },
        {
          userId,
          name: "Navy Dress Trousers",
          category: "bottoms",
          subcategory: "dress-pants",
          color: "navy",
          brand: "Hugo Boss",
          size: "32",
          season: "all",
          imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
          tags: ["formal", "office", "elegant"],
          favorite: true,
          purchasePrice: 15000,
        },
        {
          userId,
          name: "Olive Cargo Shorts",
          category: "bottoms",
          subcategory: "shorts",
          color: "olive",
          brand: "Carhartt",
          size: "32",
          season: "summer",
          imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=500&fit=crop",
          tags: ["casual", "summer", "outdoor"],
          favorite: false,
          purchasePrice: 5500,
        },
        // OUTERWEAR
        {
          userId,
          name: "Classic Navy Blazer",
          category: "outerwear",
          subcategory: "blazer",
          color: "navy",
          brand: "Brooks Brothers",
          size: "M",
          season: "all",
          imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop",
          tags: ["formal", "classic", "timeless"],
          favorite: true,
          purchasePrice: 35000,
        },
        {
          userId,
          name: "Tan Trench Coat",
          category: "outerwear",
          subcategory: "coat",
          color: "tan",
          brand: "Burberry",
          size: "M",
          season: "fall",
          imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=500&fit=crop",
          tags: ["classic", "elegant", "british"],
          favorite: true,
          purchasePrice: 89000,
        },
        {
          userId,
          name: "Black Leather Jacket",
          category: "outerwear",
          subcategory: "jacket",
          color: "black",
          brand: "AllSaints",
          size: "M",
          season: "fall",
          imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
          tags: ["edgy", "casual", "statement"],
          favorite: true,
          purchasePrice: 45000,
        },
        {
          userId,
          name: "Grey Wool Overcoat",
          category: "outerwear",
          subcategory: "coat",
          color: "grey",
          brand: "Reiss",
          size: "M",
          season: "winter",
          imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop",
          tags: ["formal", "elegant", "winter"],
          favorite: false,
          purchasePrice: 55000,
        },
        // SHOES
        {
          userId,
          name: "White Minimalist Sneakers",
          category: "shoes",
          subcategory: "sneakers",
          color: "white",
          brand: "Common Projects",
          size: "10",
          season: "all",
          imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop",
          tags: ["casual", "minimal", "versatile"],
          favorite: true,
          purchasePrice: 42500,
        },
        {
          userId,
          name: "Brown Oxford Dress Shoes",
          category: "shoes",
          subcategory: "oxford",
          color: "brown",
          brand: "Allen Edmonds",
          size: "10",
          season: "all",
          imageUrl: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=500&fit=crop",
          tags: ["formal", "classic", "elegant"],
          favorite: true,
          purchasePrice: 39500,
        },
        {
          userId,
          name: "Black Chelsea Boots",
          category: "shoes",
          subcategory: "boots",
          color: "black",
          brand: "R.M. Williams",
          size: "10",
          season: "fall",
          imageUrl: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=400&h=500&fit=crop",
          tags: ["smart-casual", "versatile", "stylish"],
          favorite: false,
          purchasePrice: 52500,
        },
        {
          userId,
          name: "Navy Suede Loafers",
          category: "shoes",
          subcategory: "loafers",
          color: "navy",
          brand: "Tod's",
          size: "10",
          season: "summer",
          imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&h=500&fit=crop",
          tags: ["smart-casual", "summer", "italian"],
          favorite: false,
          purchasePrice: 48000,
        },
        // ACCESSORIES
        {
          userId,
          name: "Black Leather Belt",
          category: "accessories",
          subcategory: "belt",
          color: "black",
          brand: "Gucci",
          size: "34",
          season: "all",
          imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop",
          tags: ["essential", "formal", "versatile"],
          favorite: true,
          purchasePrice: 35000,
        },
        {
          userId,
          name: "Silver Chronograph Watch",
          category: "accessories",
          subcategory: "watch",
          color: "silver",
          brand: "Omega",
          size: "42mm",
          season: "all",
          imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=500&fit=crop",
          tags: ["luxury", "classic", "timepiece"],
          favorite: true,
          purchasePrice: 550000,
        },
        {
          userId,
          name: "Navy Silk Tie",
          category: "accessories",
          subcategory: "tie",
          color: "navy",
          brand: "Hermes",
          size: "one-size",
          season: "all",
          imageUrl: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=400&h=500&fit=crop",
          tags: ["formal", "elegant", "silk"],
          favorite: false,
          purchasePrice: 18500,
        },
        {
          userId,
          name: "Tortoise Shell Sunglasses",
          category: "accessories",
          subcategory: "sunglasses",
          color: "tortoise",
          brand: "Ray-Ban",
          size: "one-size",
          season: "summer",
          imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop",
          tags: ["casual", "summer", "classic"],
          favorite: false,
          purchasePrice: 15500,
        },
        {
          userId,
          name: "Grey Wool Scarf",
          category: "accessories",
          subcategory: "scarf",
          color: "grey",
          brand: "Acne Studios",
          size: "one-size",
          season: "winter",
          imageUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&h=500&fit=crop",
          tags: ["winter", "cozy", "minimal"],
          favorite: false,
          purchasePrice: 22000,
        },
      ];

      const createdItems = [];
      for (const item of sampleItems) {
        const created = await storage.createWardrobeItem(item);
        createdItems.push(created);
      }

      res.status(201).json({
        message: `Successfully added ${createdItems.length} sample wardrobe items`,
        count: createdItems.length,
        items: createdItems
      });
    } catch (error) {
      console.error("Failed to seed wardrobe items:", error);
      res.status(500).json({ message: "Failed to seed wardrobe items" });
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
      const id = parseId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      // Validate input data
      const validatedData = patchWardrobeItemSchema.parse(req.body);

      const item = await storage.getWardrobeItem(id);

      if (!item) {
        return res.status(404).json({ message: "Wardrobe item not found" });
      }

      if (item.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedItem = await storage.updateWardrobeItem(id, validatedData);
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.format() });
      }
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

  // Calendar outfit planning routes
  app.get("/api/calendar-outfits", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      // In a real implementation, you would fetch outfits planned for specific dates
      // For now, we'll return the user's outfits with mock dates
      const outfits = await storage.getOutfits(req.user!.id);

      // Simulate outfits being assigned to days in the requested range
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      const calendarOutfits = outfits.map((outfit, index) => {
        // Distribute outfits across the requested date range
        const date = new Date(start);
        date.setDate(date.getDate() + (index % Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))));

        return {
          ...outfit,
          plannedDate: date.toISOString().split('T')[0]
        };
      });

      res.json(calendarOutfits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar outfits" });
    }
  });

  app.post("/api/calendar-outfits", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { outfitId, date } = req.body;

      if (!outfitId || !date) {
        return res.status(400).json({ message: "Outfit ID and date are required" });
      }

      // Verify outfit exists and belongs to user
      const outfit = await storage.getOutfit(outfitId);
      if (!outfit) {
        return res.status(404).json({ message: "Outfit not found" });
      }

      if (outfit.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // In a real implementation, you would store the outfit planning for this date
      // For now, just return a success message
      res.status(201).json({
        message: "Outfit scheduled successfully",
        plannedOutfit: {
          ...outfit,
          plannedDate: date
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to schedule outfit" });
    }
  });

  // Outfit sharing
  app.post("/api/outfits/:id/share", async (req: Request, res: Response) => {
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

      // Generate a cryptographically secure sharing token
      const shareId = crypto.randomBytes(32).toString('hex');

      // In a real implementation, store this sharing information in the database
      // await storage.createOutfitShare(outfit.id, shareId);

      // Generate a shareable link
      const shareableLink = `${req.protocol}://${req.get('host')}/shared-outfit/${shareId}`;

      res.status(200).json({
        message: "Outfit shared successfully",
        shareableLink
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to share outfit" });
    }
  });

  // Get a shared outfit (public endpoint)
  app.get("/api/shared-outfit/:shareId", async (req: Request, res: Response) => {
    try {
      const { shareId } = req.params;

      // In a real implementation, get the outfit ID from the share record
      // const share = await storage.getOutfitShareByShareId(shareId);
      // if (!share) {
      //   return res.status(404).json({ message: "Shared outfit not found" });
      // }

      // For demo purposes, parse the outfit ID from the share ID
      let outfitId: number;
      try {
        const decoded = Buffer.from(shareId, 'base64').toString();
        outfitId = parseInt(decoded.split('-')[0]);
      } catch (e) {
        return res.status(400).json({ message: "Invalid share ID" });
      }

      const outfit = await storage.getOutfit(outfitId);
      if (!outfit) {
        return res.status(404).json({ message: "Shared outfit not found" });
      }

      // For shared outfits, we'll need to include item details
      const outfitItems = await Promise.all(
        outfit.items.map(async (itemId) => {
          return await storage.getWardrobeItem(itemId);
        })
      );

      // Filter out any null items (in case some items were deleted)
      const validItems = outfitItems.filter(Boolean);

      // Return a sanitized version for public sharing
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

  // AI-powered outfit recommendation routes
  app.post("/api/ai-outfit-recommendations", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { mood, weather, occasion } = req.body;

      if (!mood || !weather) {
        return res.status(400).json({ message: "Mood and weather are required" });
      }

      // Get wardrobe items for the user
      const wardrobeItems = await storage.getWardrobeItems(req.user!.id);

      if (wardrobeItems.length === 0) {
        return res.json({
          message: "No wardrobe items available",
          recommendations: []
        });
      }

      try {
        // First try AI-based recommendations
        const recommendations = await aiService.generateAdvancedOutfitRecommendations({
          wardrobeItems,
          mood,
          weatherCondition: weather,
          occasion: occasion || "everyday"
        });

        if (recommendations && recommendations.length > 0) {
          return res.json({
            recommendations,
            count: recommendations.length,
            source: "ai"
          });
        } else {
          // If AI returned empty results, fall back to algorithm
          console.log("AI returned empty recommendations, using fallback algorithm");
          throw new Error("AI returned empty recommendations");
        }
      } catch (aiError: any) {
        console.log("AI recommendation failed, using fallback algorithm:", aiError.message);

        // Import the outfit engine
        const outfitEngine = await import("../client/src/lib/outfit-engine");

        // Convert weather string to WeatherType
        const weatherType = (() => {
          const w = weather.toLowerCase();
          if (w.includes("rain")) return "rainy";
          if (w.includes("snow")) return "snowy";
          if (w.includes("cloud")) return "cloudy";
          if (w.includes("wind")) return "windy";
          if (w.includes("sun") || w.includes("clear")) return "sunny";
          return "cloudy"; // Default
        })();

        // Convert mood string to MoodType
        const moodType = mood.toLowerCase() as any;

        // Generate algorithm-based recommendations
        const algorithmRecommendations = outfitEngine.generateOutfitRecommendations(
          wardrobeItems,
          weatherType,
          moodType,
          3 // Generate 3 outfits
        );

        // Convert to AI format for frontend compatibility
        const convertedRecommendations = algorithmRecommendations.map((rec, index) => {
          // Create descriptive names based on mood and weather
          const occasionText = occasion || "everyday";
          const outfitNames = [
            `${weather.charAt(0).toUpperCase() + weather.slice(1)} ${mood.charAt(0).toUpperCase() + mood.slice(1)} Outfit`,
            `Perfect for ${occasionText.charAt(0).toUpperCase() + occasionText.slice(1)}`,
            `${mood.charAt(0).toUpperCase() + mood.slice(1)} Day Look`
          ];

          // Create descriptions
          const descriptions = [
            `A coordinated outfit designed for ${weather} conditions when you're feeling ${mood}.`,
            `This combination works well for ${occasionText} occasions and matches your current mood.`,
            `A comfortable and stylish outfit that reflects your ${mood} mood while being appropriate for the weather.`
          ];

          // Create styling advice
          const stylingAdvice = [
            "Try accessorizing with jewelry that complements the main colors in this outfit.",
            "You can layer these pieces differently depending on temperature changes throughout the day.",
            "This outfit can be dressed up with the right accessories or dressed down for more casual settings."
          ];

          return {
            outfitName: outfitNames[index % outfitNames.length],
            description: descriptions[index % descriptions.length],
            items: rec.outfitItems.map(item => ({
              id: item.id,
              name: item.name,
              reason: `This ${item.category} works well with your ${mood} mood and is appropriate for ${weather} weather.`
            })),
            styleAdvice: stylingAdvice[index % stylingAdvice.length],
            occasion: occasionText,
            confidence: Math.round(rec.score * 100)
          };
        });

        return res.json({
          recommendations: convertedRecommendations,
          count: convertedRecommendations.length,
          source: "algorithm"
        });
      }
    } catch (error) {
      console.error("Error generating outfit recommendations:", error);

      // Check if this is an OpenAI API error
      let statusCode = 500;
      let errorMessage = "Failed to generate outfit recommendations";

      if (error instanceof Error) {
        // Check for OpenAI quota errors
        if (error.message.includes("quota") || error.message.includes("rate limit")) {
          statusCode = 429; // Too Many Requests
          errorMessage = "OpenAI API quota exceeded. Please try again later.";
        } else if (error.message.includes("authentication")) {
          statusCode = 401;
          errorMessage = "OpenAI API authentication failed. Please check your API key.";
        }
      }

      res.status(statusCode).json({
        message: errorMessage,
        error: error instanceof Error ? error.message : "Unknown error",
        recommendations: [] // Return empty recommendations array to prevent client-side errors
      });
    }
  });

  // Style profile creation
  app.get("/api/style-profile", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      // Get wardrobe items for the user
      const wardrobeItems = await storage.getWardrobeItems(req.user!.id);

      if (wardrobeItems.length === 0) {
        return res.status(400).json({
          message: "Not enough wardrobe items to create a style profile",
          minimumRequired: 5
        });
      }

      // Generate style profile
      const styleProfile = await aiService.createUserStyleProfile(wardrobeItems);

      res.json(styleProfile);
    } catch (error) {
      console.error("Error creating style profile:", error);

      let statusCode = 500;
      let errorMessage = "Failed to create style profile";

      if (error instanceof Error) {
        if (error.message.includes("quota") || error.message.includes("rate limit")) {
          statusCode = 429;
          errorMessage = "OpenAI API quota exceeded. Please try again later.";
        }
      }

      res.status(statusCode).json({
        message: errorMessage,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Style analysis
  app.get("/api/style-analysis", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      // Get wardrobe items for the user
      const wardrobeItems = await storage.getWardrobeItems(req.user!.id);

      if (wardrobeItems.length < 3) {
        return res.status(400).json({
          message: "Not enough wardrobe items for style analysis",
          minimumRequired: 3
        });
      }

      // Generate style analysis
      const analysis = await aiService.analyzeStyle(wardrobeItems);

      res.json({
        analysis,
        itemCount: wardrobeItems.length
      });
    } catch (error) {
      console.error("Error analyzing style:", error);

      let statusCode = 500;
      let errorMessage = "Failed to analyze style";
      let errorCode = "unknown_error";

      if (error instanceof Error) {
        // Check for rate limit or quota-related errors
        if (error.message.includes("quota") ||
            error.message.includes("rate limit") ||
            error.message.includes("API rate limit") ||
            error.message.includes("capacity") ||
            error.message.includes("insufficient_quota") ||
            (error as any).code === 'insufficient_quota') {

          statusCode = 429;
          errorMessage = "AI service quota exceeded. Please try again later.";
          errorCode = "api_limit_exceeded";
        }
      }

      res.status(statusCode).json({
        message: errorMessage,
        error: error instanceof Error ? error.message : "Unknown error",
        code: errorCode,
        analysis: "Unable to generate style analysis at this time."
      });
    }
  });

  // Occasion-based outfit suggestions
  app.post("/api/occasion-outfit", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { occasion, weather } = req.body;

      if (!occasion) {
        return res.status(400).json({ message: "Occasion is required" });
      }

      // Get wardrobe items for the user
      const wardrobeItems = await storage.getWardrobeItems(req.user!.id);

      if (wardrobeItems.length === 0) {
        return res.status(400).json({
          message: "No wardrobe items available",
          recommendation: null
        });
      }

      try {
        // First attempt to generate occasion-specific outfit recommendation using AI
        const recommendation = await aiService.getOutfitSuggestionForOccasion({
          wardrobeItems,
          occasion,
          weatherCondition: weather
        });

        if (recommendation) {
          return res.json({
            recommendation,
            occasion,
            source: "ai"
          });
        } else {
          console.log("AI returned null recommendation, using fallback algorithm for occasion outfit");
          throw new Error("AI returned null recommendation");
        }
      } catch (aiError: any) {
        console.log("AI occasion recommendation failed, using fallback algorithm:", aiError.message);

        // Import the outfit engine for fallback
        const outfitEngine = await import("../client/src/lib/outfit-engine");

        // Convert weather string to WeatherType if provided
        const weatherType = weather ? (() => {
          const w = weather.toLowerCase();
          if (w.includes("rain")) return "rainy";
          if (w.includes("snow")) return "snowy";
          if (w.includes("cloud")) return "cloudy";
          if (w.includes("wind")) return "windy";
          if (w.includes("sun") || w.includes("clear")) return "sunny";
          return "cloudy"; // Default
        })() : "cloudy";

        // Map occasion to a suitable mood
        const moodType = (() => {
          const o = occasion.toLowerCase();
          if (o.includes("work") || o.includes("office") || o.includes("interview")) return "professional";
          if (o.includes("date") || o.includes("romantic")) return "romantic";
          if (o.includes("formal") || o.includes("wedding") || o.includes("ceremony")) return "confident";
          if (o.includes("workout") || o.includes("gym") || o.includes("exercise")) return "energetic";
          if (o.includes("casual") || o.includes("relax")) return "relaxed";
          if (o.includes("party") || o.includes("celebration")) return "happy";
          if (o.includes("creative") || o.includes("art")) return "creative";
          return "confident"; // Default to confident for any other occasion
        })() as any;

        // Generate algorithm-based recommendations and pick the best one
        const algorithmRecommendations = outfitEngine.generateOutfitRecommendations(
          wardrobeItems,
          weatherType,
          moodType,
          3 // Generate 3 outfits
        );

        if (algorithmRecommendations.length === 0) {
          return res.status(404).json({
            message: "Could not generate a suitable outfit for this occasion",
            recommendation: null
          });
        }

        // Take the highest scored outfit recommendation
        const bestOutfit = algorithmRecommendations[0];

        // Convert to AI format for frontend compatibility
        const occasionName = occasion.charAt(0).toUpperCase() + occasion.slice(1);
        const fallbackRecommendation = {
          outfitName: `Perfect ${occasionName} Outfit`,
          description: `A curated outfit specially selected for ${occasion} occasions${weather ? ` in ${weather} weather` : ''}.`,
          items: bestOutfit.outfitItems.map(item => ({
            id: item.id,
            name: item.name,
            reason: `This ${item.category} is ideal for ${occasion} settings${weather ? ` and appropriate for ${weather} conditions` : ''}.`
          })),
          styleAdvice: "Accessorize thoughtfully to enhance this outfit while keeping the occasion in mind.",
          occasion: occasionName,
          confidence: Math.round(bestOutfit.score * 100)
        };

        return res.json({
          recommendation: fallbackRecommendation,
          occasion,
          source: "algorithm"
        });
      }
    } catch (error) {
      console.error("Error generating occasion outfit:", error);

      let statusCode = 500;
      let errorMessage = "Failed to generate occasion outfit";

      if (error instanceof Error) {
        if (error.message.includes("quota") || error.message.includes("rate limit")) {
          statusCode = 429;
          errorMessage = "OpenAI API quota exceeded. Please try again later.";
        }
      }

      res.status(statusCode).json({
        message: errorMessage,
        error: error instanceof Error ? error.message : "Unknown error",
        recommendation: null
      });
    }
  });

  // Weather API route - enhanced mock implementation
  app.get("/api/weather", (req: Request, res: Response) => {
    console.log("Fetching weather for location:", req.query.location);

    // Get location from query parameter, defaulting to New York City
    const location = req.query.location as string || "New York City";

    // Use the getWeatherForLocation function from weather.ts
    import("./weather").then(({ getWeatherForLocation }) => {
      getWeatherForLocation(location).then(weatherData => {
        // Map the weather data to the expected response format
        const response = {
          location: weatherData.type === 'snowy' || weatherData.type === 'cold'
            ? location + " ❄️"
            : weatherData.type === 'hot' || weatherData.type === 'sunny'
              ? location + " ☀️"
              : weatherData.type === 'rainy'
                ? location + " 🌧️"
                : weatherData.type === 'windy'
                  ? location + " 💨"
                  : location + " ☁️",
          temperature: weatherData.temperature,
          condition: weatherData.description,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed,
          icon: weatherData.type // We use the weather type as the icon identifier
        };

        console.log("Weather data received:", response);
        res.json(response);
      });
    });
  });

  // Weather suggestions API endpoint
  app.get("/api/weather-suggestions", async (req: Request, res: Response) => {
    const query = (req.query.q as string || "").toLowerCase();

    if (!query || query.length < 2) {
      return res.json([]);
    }

    // Filter the valid locations from weather.ts
    import("./weather").then(({ validLocations }) => {
      const suggestions = validLocations
        .filter(location => location.toLowerCase().includes(query))
        .slice(0, 10);

      res.json(suggestions);
    }).catch(error => {
      console.error("Error fetching location suggestions:", error);
      res.status(500).json({ error: "Failed to fetch location suggestions" });
    });
  });

  // ==================== STATISTICS & ANALYTICS ====================

  // Get wardrobe statistics
  app.get("/api/statistics", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const items = await storage.getWardrobeItems(req.user!.id);
      const outfits = await storage.getOutfits(req.user!.id);

      // Calculate statistics
      const totalItems = items.length;
      const totalOutfits = outfits.length;
      const favoriteItems = items.filter(i => i.favorite).length;
      const favoriteOutfits = outfits.filter(o => o.favorite).length;

      // Calculate total wardrobe value
      const totalValue = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);

      // Category breakdown
      const categoryBreakdown = items.reduce((acc: Record<string, number>, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      // Color breakdown
      const colorBreakdown = items.reduce((acc: Record<string, number>, item) => {
        if (item.color) {
          acc[item.color] = (acc[item.color] || 0) + 1;
        }
        return acc;
      }, {});

      // Most worn items (top 5)
      const mostWorn = [...items]
        .filter(i => (i.wearCount || 0) > 0)
        .sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0))
        .slice(0, 5)
        .map(i => ({ id: i.id, name: i.name, wearCount: i.wearCount || 0 }));

      // Least worn items (items never worn or rarely worn)
      const leastWorn = [...items]
        .sort((a, b) => (a.wearCount || 0) - (b.wearCount || 0))
        .slice(0, 5)
        .map(i => ({ id: i.id, name: i.name, wearCount: i.wearCount || 0 }));

      // Items not worn in 30+ days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const unwornItems = items.filter(i => {
        if (!i.lastWorn) return true;
        return new Date(i.lastWorn) < thirtyDaysAgo;
      }).length;

      // Cost per wear analysis (items with both price and wear count)
      const costPerWearItems = items
        .filter(i => i.purchasePrice && (i.wearCount || 0) > 0)
        .map(i => ({
          id: i.id,
          name: i.name,
          costPerWear: Math.round((i.purchasePrice || 0) / (i.wearCount || 1)),
          totalCost: i.purchasePrice || 0,
          wearCount: i.wearCount || 0
        }))
        .sort((a, b) => a.costPerWear - b.costPerWear);

      // Season breakdown
      const seasonBreakdown = items.reduce((acc: Record<string, number>, item) => {
        const season = item.season || 'all';
        acc[season] = (acc[season] || 0) + 1;
        return acc;
      }, {});

      // Recent additions (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentAdditions = items.filter(i => {
        if (!i.createdAt) return false;
        return new Date(i.createdAt) > weekAgo;
      }).length;

      res.json({
        overview: {
          totalItems,
          totalOutfits,
          favoriteItems,
          favoriteOutfits,
          totalValue: totalValue / 100, // Convert cents to dollars
          recentAdditions,
          unwornItems
        },
        breakdown: {
          byCategory: categoryBreakdown,
          byColor: colorBreakdown,
          bySeason: seasonBreakdown
        },
        wearAnalysis: {
          mostWorn,
          leastWorn,
          costPerWear: costPerWearItems.slice(0, 10)
        }
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Log wear for an item
  app.post("/api/wardrobe/:id/log-wear", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const id = parseId(req.params.id);
      if (!id) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      const item = await storage.getWardrobeItem(id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      if (item.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Update wear count and last worn date
      const updatedItem = await storage.updateWardrobeItem(id, {
        wearCount: (item.wearCount || 0) + 1,
        lastWorn: new Date()
      });

      res.json({
        message: "Wear logged successfully",
        item: updatedItem
      });
    } catch (error) {
      console.error("Error logging wear:", error);
      res.status(500).json({ message: "Failed to log wear" });
    }
  });

  // Get smart suggestions (items not worn recently, seasonal recommendations)
  app.get("/api/smart-suggestions", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const items = await storage.getWardrobeItems(req.user!.id);

      // Get current season
      const month = new Date().getMonth();
      const currentSeason = month >= 2 && month <= 4 ? 'spring'
        : month >= 5 && month <= 7 ? 'summer'
        : month >= 8 && month <= 10 ? 'fall'
        : 'winter';

      // Items not worn in 14+ days
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const forgottenItems = items
        .filter(i => {
          if (!i.lastWorn) return true;
          return new Date(i.lastWorn) < twoWeeksAgo;
        })
        .slice(0, 5)
        .map(i => ({
          id: i.id,
          name: i.name,
          imageUrl: i.imageUrl,
          category: i.category,
          lastWorn: i.lastWorn,
          reason: i.lastWorn
            ? `Not worn in ${Math.floor((Date.now() - new Date(i.lastWorn).getTime()) / (1000 * 60 * 60 * 24))} days`
            : "Never worn"
        }));

      // Seasonal suggestions
      const seasonalItems = items
        .filter(i => i.season === currentSeason || i.season === 'all')
        .filter(i => (i.wearCount || 0) < 3) // Less worn items for the season
        .slice(0, 5)
        .map(i => ({
          id: i.id,
          name: i.name,
          imageUrl: i.imageUrl,
          category: i.category,
          reason: `Perfect for ${currentSeason}`
        }));

      // Favorites that haven't been worn recently
      const forgottenFavorites = items
        .filter(i => i.favorite)
        .filter(i => {
          if (!i.lastWorn) return true;
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return new Date(i.lastWorn) < sevenDaysAgo;
        })
        .slice(0, 3)
        .map(i => ({
          id: i.id,
          name: i.name,
          imageUrl: i.imageUrl,
          reason: "One of your favorites!"
        }));

      res.json({
        forgottenItems,
        seasonalItems,
        forgottenFavorites,
        currentSeason
      });
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  // Get wardrobe gaps analysis
  app.get("/api/wardrobe-gaps", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const items = await storage.getWardrobeItems(req.user!.id);

      // Essential categories everyone should have
      const essentialCategories = {
        tops: { min: 5, description: "Basic tops (t-shirts, blouses)" },
        bottoms: { min: 3, description: "Pants, jeans, skirts" },
        outerwear: { min: 2, description: "Jackets, coats" },
        shoes: { min: 3, description: "Everyday, formal, casual" },
        dresses: { min: 1, description: "Versatile dress" },
        accessories: { min: 2, description: "Belts, bags, etc." }
      };

      // Count items by category
      const categoryCount = items.reduce((acc: Record<string, number>, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      // Identify gaps
      const gaps: Array<{ category: string; have: number; recommended: number; description: string }> = [];

      for (const [category, config] of Object.entries(essentialCategories)) {
        const have = categoryCount[category] || 0;
        if (have < config.min) {
          gaps.push({
            category,
            have,
            recommended: config.min,
            description: config.description
          });
        }
      }

      // Color variety check
      const uniqueColors = new Set(items.map(i => i.color).filter(Boolean)).size;
      const colorSuggestion = uniqueColors < 5
        ? "Consider adding more color variety to your wardrobe"
        : null;

      // Season coverage
      const seasonCount = items.reduce((acc: Record<string, number>, item) => {
        const season = item.season || 'all';
        acc[season] = (acc[season] || 0) + 1;
        return acc;
      }, {});

      const seasonGaps = ['spring', 'summer', 'fall', 'winter']
        .filter(season => (seasonCount[season] || 0) < 3)
        .map(season => ({ season, count: seasonCount[season] || 0 }));

      res.json({
        categoryGaps: gaps,
        colorSuggestion,
        seasonGaps,
        overallScore: Math.round((1 - gaps.length / Object.keys(essentialCategories).length) * 100)
      });
    } catch (error) {
      console.error("Error analyzing wardrobe gaps:", error);
      res.status(500).json({ message: "Failed to analyze wardrobe gaps" });
    }
  });

  // Outfit shuffle/randomizer
  app.get("/api/outfit-shuffle", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const items = await storage.getWardrobeItems(req.user!.id);
      const { occasion, season } = req.query;

      if (items.length < 3) {
        return res.status(400).json({
          message: "Need at least 3 items to generate an outfit",
          suggestion: "Add more items to your wardrobe first"
        });
      }

      // Filter by season if provided
      let filteredItems = items;
      if (season) {
        filteredItems = items.filter(i => i.season === season || i.season === 'all');
      }

      // Group by category
      const byCategory: Record<string, typeof items> = {};
      filteredItems.forEach(item => {
        if (!byCategory[item.category]) byCategory[item.category] = [];
        byCategory[item.category].push(item);
      });

      // Generate random outfit
      const outfit: typeof items = [];

      // Try to pick one item from essential categories
      const essentialOrder = ['tops', 'bottoms', 'shoes', 'outerwear', 'accessories'];

      for (const category of essentialOrder) {
        if (byCategory[category] && byCategory[category].length > 0) {
          const randomIndex = Math.floor(Math.random() * byCategory[category].length);
          outfit.push(byCategory[category][randomIndex]);
        }
      }

      // If we couldn't form a basic outfit, just pick random items
      if (outfit.length < 2) {
        const shuffled = [...filteredItems].sort(() => Math.random() - 0.5);
        return res.json({
          items: shuffled.slice(0, Math.min(4, shuffled.length)),
          message: "Random selection - add more categorized items for better outfits"
        });
      }

      res.json({
        items: outfit,
        occasion: occasion || "casual",
        message: "Here's a random outfit for you!"
      });
    } catch (error) {
      console.error("Error shuffling outfit:", error);
      res.status(500).json({ message: "Failed to generate random outfit" });
    }
  });
}
