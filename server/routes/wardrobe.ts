import { Router } from "express";
import { storage } from "../storage";
import { classifyClothingItem, generateMoodBasedRecommendation } from "../services/ai-service";
import { insertWardrobeItemSchema } from "@shared/schema";

const router = Router();

// Get all wardrobe items for a user
router.get("/api/wardrobe", async (req, res) => {
  if (!req.user) return res.status(401).send("Unauthorized");
  
  try {
    const items = await storage.getWardrobeItems(req.user.id);
    res.json(items);
  } catch (error) {
    console.error("Error fetching wardrobe items:", error);
    res.status(500).send("Failed to fetch wardrobe items");
  }
});

// Add a new wardrobe item with AI classification
router.post("/api/wardrobe", async (req, res) => {
  if (!req.user) return res.status(401).send("Unauthorized");

  try {
    const { imageUrl, ...rest } = req.body;
    
    // Use AI to classify the clothing item
    const classification = await classifyClothingItem(imageUrl);
    
    // Combine manual input with AI classification
    const itemData = {
      ...rest,
      ...classification,
      userId: req.user.id,
      imageUrl
    };

    // Validate the combined data
    const validatedData = insertWardrobeItemSchema.parse(itemData);
    
    // Save to database
    const newItem = await storage.createWardrobeItem(validatedData);
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error adding wardrobe item:", error);
    res.status(500).send("Failed to add wardrobe item");
  }
});

// Get AI-powered outfit recommendations
router.get("/api/wardrobe/recommendations", async (req, res) => {
  if (!req.user) return res.status(401).send("Unauthorized");

  try {
    const { mood, weather } = req.query;
    if (!mood || !weather) {
      return res.status(400).send("Mood and weather are required");
    }

    const items = await storage.getWardrobeItems(req.user.id);
    const recommendation = await generateMoodBasedRecommendation(
      mood as string,
      weather as string,
      items
    );

    res.json({ recommendation });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).send("Failed to generate recommendations");
  }
});

export default router;
