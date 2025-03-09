import OpenAI from "openai";
import { WardrobeItem, clothingCategories } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface ClassificationResult {
  category: string;
  subcategory: string;
  color: string;
  season: string;
  tags: string[];
  style_description: string;
}

export interface AIOutfitRecommendation {
  outfitName: string;
  description: string;
  items: {
    id: number;
    name: string;
    reason: string;
  }[];
  styleAdvice: string;
  occasion: string;
  confidence: number;
}

export interface StyleProfile {
  dominantStyle: string;
  colorPalette: string[];
  keyItems: string[];
  preferences: Record<string, any>;
  personalityTraits: string[];
}

export async function classifyClothingItem(imageUrl: string): Promise<ClassificationResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: `You are a fashion expert AI that classifies clothing items. 
          Return JSON format only with the following properties:
          {
            "category": one of [${clothingCategories.map(c => `"${c.value}"`).join(", ")}],
            "subcategory": appropriate subcategory based on the category,
            "color": main color(s) of the item,
            "season": "winter", "summer", "spring", "fall", or "all",
            "tags": [array of style tags like "casual", "formal", "vintage", etc.],
            "style_description": brief description of the style
          }`
        },
        {
          role: "user",
          content: `I have a clothing item image at this URL: ${imageUrl}. 
          Please classify this clothing item with category, subcategory, color, season, and style tags.`
        }
      ],
      max_tokens: 1000,
    });

    const result = JSON.parse(completion.choices[0].message.content!);
    return result as ClassificationResult;
  } catch (error) {
    console.error("Error classifying clothing item:", error);
    throw new Error("Failed to classify clothing item");
  }
}

export async function generateMoodBasedRecommendation(
  mood: string,
  weather: string,
  availableItems: WardrobeItem[]
): Promise<string> {
  try {
    const itemDescriptions = availableItems.map(item => 
      `${item.name} (${item.category}, ${item.color}, tags: ${item.tags?.join(", ")})`
    ).join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a fashion expert AI that provides personalized outfit recommendations."
        },
        {
          role: "user",
          content: `Given the following context:
          - Current mood: ${mood}
          - Weather: ${weather}
          - Available items:\n${itemDescriptions}
          
          Provide a natural, conversational outfit recommendation that matches the mood and weather conditions.
          Include specific items from the available list and explain why they work well together.`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return completion.choices[0].message.content || "No recommendation available";
  } catch (error) {
    console.error("Error generating mood-based recommendation:", error);
    throw new Error("Failed to generate outfit recommendation");
  }
}

export async function analyzeStyle(items: WardrobeItem[]): Promise<string> {
  try {
    const itemDescriptions = items.map(item => 
      `${item.name} (${item.category}, ${item.color}, tags: ${item.tags?.join(", ")})`
    ).join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a fashion expert AI that analyzes personal style based on wardrobe items."
        },
        {
          role: "user",
          content: `Analyze the following wardrobe items and provide insights about the person's style:
          ${itemDescriptions}
          
          Consider:
          - Dominant colors and patterns
          - Most common categories
          - Style preferences (casual vs formal, classic vs trendy)
          - Seasonal preferences
          - Suggested additions to complete the wardrobe`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return completion.choices[0].message.content || "No style analysis available";
  } catch (error) {
    console.error("Error analyzing style:", error);
    throw new Error("Failed to analyze style");
  }
}

export async function generateAdvancedOutfitRecommendations(
  mood: string,
  weather: string,
  occasion: string,
  wardrobe: WardrobeItem[],
  styleProfile?: Partial<StyleProfile>
): Promise<AIOutfitRecommendation[]> {
  if (wardrobe.length === 0) {
    return [];
  }

  try {
    const itemsJSON = JSON.stringify(wardrobe.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory || "",
      color: item.color || "",
      season: item.season || "",
      tags: item.tags || [],
      favorite: item.favorite || false
    })));

    const styleProfileJSON = styleProfile ? JSON.stringify(styleProfile) : "{}";

    const prompt = `
    You are an expert fashion stylist. Create ${wardrobe.length < 10 ? "1" : "3"} outfit recommendations based on the following:

    MOOD: ${mood}
    WEATHER: ${weather}
    OCCASION: ${occasion || "everyday"}
    STYLE PROFILE: ${styleProfileJSON}
    
    AVAILABLE ITEMS:
    ${itemsJSON}

    For each outfit recommendation, provide:
    1. A creative name for the outfit
    2. A brief description of the overall look and how it relates to the mood/weather/occasion
    3. The specific items from the wardrobe that make up the outfit
    4. For each item, a brief explanation of why it works in this outfit
    5. One piece of styling advice for the outfit
    6. A confidence score (0-100) representing how well this outfit matches the criteria

    Return the result as a JSON array following this structure:
    [
      {
        "outfitName": "Name of the outfit",
        "description": "Overall description",
        "items": [
          {
            "id": item_id,
            "name": "Item name",
            "reason": "Why this item works in the outfit"
          }
        ],
        "styleAdvice": "One tip to style or wear this outfit better",
        "occasion": "What this outfit is best suited for",
        "confidence": confidence_score
      }
    ]

    Only include items that actually exist in the provided wardrobe.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are FashionGPT, an expert clothing stylist and personal shopper with deep knowledge of fashion principles, color theory, and style concepts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
    });

    try {
      // Parse the response as JSON
      const responseContent = completion.choices[0].message.content || "{}";
      const parsedResponse = JSON.parse(responseContent);
      
      // Check if the response contains recommendations
      if (Array.isArray(parsedResponse.recommendations)) {
        return parsedResponse.recommendations as AIOutfitRecommendation[];
      } else if (Array.isArray(parsedResponse)) {
        return parsedResponse as AIOutfitRecommendation[];
      } else {
        console.error("Unexpected response format:", parsedResponse);
        return [];
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Raw response:", completion.choices[0].message.content);
      return [];
    }
  } catch (error) {
    console.error("Error generating advanced outfit recommendations:", error);
    return [];
  }
}

export async function createUserStyleProfile(wardrobe: WardrobeItem[]): Promise<StyleProfile> {
  if (wardrobe.length === 0) {
    return {
      dominantStyle: "casual",
      colorPalette: ["neutral"],
      keyItems: [],
      preferences: {},
      personalityTraits: ["practical"]
    };
  }

  try {
    const itemsJSON = JSON.stringify(wardrobe.map(item => ({
      name: item.name,
      category: item.category,
      subcategory: item.subcategory || "",
      color: item.color || "",
      season: item.season || "",
      tags: item.tags || [],
      favorite: item.favorite || false
    })));

    const prompt = `
    You are a fashion psychologist and style analyst. Based on the following wardrobe items:
    
    ${itemsJSON}
    
    Create a detailed style profile for this user following this structure:
    {
      "dominantStyle": "The primary style category (e.g., classic, bohemian, minimalist, etc.)",
      "colorPalette": ["Array of 3-5 colors that define their wardrobe"],
      "keyItems": ["List of 3-5 signature or staple items in their wardrobe"],
      "preferences": {
        "formality": score from 1-10,
        "boldness": score from 1-10,
        "trendiness": score from 1-10,
        "seasonality": "preferred season or 'versatile'",
        "silhouette": "preferred fit and shape"
      },
      "personalityTraits": ["3-5 personality traits reflected in their style choices"]
    }

    Return only the JSON object without any additional text.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a fashion psychology expert who can analyze personal style preferences from wardrobe data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000
    });

    try {
      // Parse the response as JSON
      const responseContent = completion.choices[0].message.content || "{}";
      const parsedResponse = JSON.parse(responseContent);
      
      return parsedResponse as StyleProfile;
    } catch (parseError) {
      console.error("Error parsing style profile response:", parseError);
      return {
        dominantStyle: "undefined",
        colorPalette: [],
        keyItems: [],
        preferences: {},
        personalityTraits: []
      };
    }
  } catch (error) {
    console.error("Error creating user style profile:", error);
    return {
      dominantStyle: "undefined",
      colorPalette: [],
      keyItems: [],
      preferences: {},
      personalityTraits: []
    };
  }
}

export async function getOutfitSuggestionForOccasion(
  occasion: string, 
  wardrobe: WardrobeItem[],
  weather?: string,
  styleProfile?: Partial<StyleProfile>
): Promise<AIOutfitRecommendation | null> {
  if (wardrobe.length === 0) {
    return null;
  }

  try {
    const itemsJSON = JSON.stringify(wardrobe.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory || "",
      color: item.color || "",
      season: item.season || "",
      tags: item.tags || [],
      favorite: item.favorite || false
    })));

    const styleProfileJSON = styleProfile ? JSON.stringify(styleProfile) : "{}";
    const weatherContext = weather ? `WEATHER: ${weather}` : "";

    const prompt = `
    You are an expert personal stylist. Create a perfect outfit recommendation for the following occasion:

    OCCASION: ${occasion}
    ${weatherContext}
    STYLE PROFILE: ${styleProfileJSON}
    
    AVAILABLE ITEMS:
    ${itemsJSON}

    Provide:
    1. A creative name for the outfit
    2. A brief description of the overall look and why it works for the occasion
    3. The specific items from the wardrobe that make up the outfit
    4. For each item, a brief explanation of why it works in this outfit
    5. One piece of styling advice for this specific occasion
    6. A confidence score (0-100) representing how appropriate this outfit is for the occasion

    Return the result as a JSON object with this structure:
    {
      "outfitName": "Name of the outfit",
      "description": "Overall description",
      "items": [
        {
          "id": item_id,
          "name": "Item name",
          "reason": "Why this item works for the occasion"
        }
      ],
      "styleAdvice": "One tip to style or wear this outfit better for this occasion",
      "occasion": "${occasion}",
      "confidence": confidence_score
    }

    Only include items that actually exist in the provided wardrobe.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are FashionGPT, an expert clothing stylist and personal shopper with deep knowledge of occasion-appropriate dressing."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000
    });

    try {
      // Parse the response as JSON
      const responseContent = completion.choices[0].message.content || "{}";
      return JSON.parse(responseContent) as AIOutfitRecommendation;
    } catch (parseError) {
      console.error("Error parsing occasion outfit response:", parseError);
      console.log("Raw response:", completion.choices[0].message.content);
      return null;
    }
  } catch (error) {
    console.error("Error generating occasion outfit recommendation:", error);
    return null;
  }
}
