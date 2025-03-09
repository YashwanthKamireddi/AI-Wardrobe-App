import type { Express, Request, Response, NextFunction } from "express";
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
import { 
  generateAdvancedOutfitRecommendations, 
  getOutfitSuggestionForOccasion, 
  createUserStyleProfile,
  analyzeStyle
} from "./services/ai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Return type is Server, make sure we return it at the end
  // Health check endpoint for basic API testing
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
      environment: process.env.NODE_ENV || "development"
    });
  });

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
      
      // Generate a sharing token/ID
      const shareId = Buffer.from(`${outfit.id}-${Date.now()}`).toString('base64');
      
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

      // Generate advanced outfit recommendations
      const recommendations = await generateAdvancedOutfitRecommendations(
        mood,
        weather,
        occasion || "everyday",
        wardrobeItems
      );
      
      res.json({
        recommendations,
        count: recommendations.length
      });
    } catch (error) {
      console.error("Error generating AI outfit recommendations:", error);
      res.status(500).json({ 
        message: "Failed to generate AI outfit recommendations",
        error: error instanceof Error ? error.message : "Unknown error"
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
      const styleProfile = await createUserStyleProfile(wardrobeItems);
      
      res.json(styleProfile);
    } catch (error) {
      console.error("Error creating style profile:", error);
      res.status(500).json({ 
        message: "Failed to create style profile",
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
      const analysis = await analyzeStyle(wardrobeItems);
      
      res.json({
        analysis,
        itemCount: wardrobeItems.length
      });
    } catch (error) {
      console.error("Error analyzing style:", error);
      res.status(500).json({ 
        message: "Failed to analyze style",
        error: error instanceof Error ? error.message : "Unknown error"
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
          recommendations: null
        });
      }

      // Generate occasion-specific outfit recommendation
      const recommendation = await getOutfitSuggestionForOccasion(
        occasion,
        wardrobeItems,
        weather
      );
      
      if (!recommendation) {
        return res.status(404).json({ 
          message: "Could not generate a suitable outfit for this occasion",
          recommendation: null
        });
      }
      
      res.json({
        recommendation,
        occasion
      });
    } catch (error) {
      console.error("Error generating occasion outfit:", error);
      res.status(500).json({ 
        message: "Failed to generate occasion outfit",
        error: error instanceof Error ? error.message : "Unknown error"
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
        // Check if the response is an error
        if ('error' in weatherData) {
          console.log("Weather API error:", weatherData.error, weatherData.message);
          return res.status(400).json(weatherData);
        }

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

  const httpServer = createServer(app);
  return httpServer;
}