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
          content: [
            {
              type: "image_url",
              url: imageUrl
            },
            {
              type: "text",
              text: "Classify this clothing item with category, subcategory, color, season, and style tags."
            }
          ]
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
