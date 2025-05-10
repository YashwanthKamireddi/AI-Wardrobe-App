/**
 * AI Service
 * 
 * This service handles all AI-related operations using OpenAI.
 * It provides functions for outfit recommendations, style analysis, and other AI features.
 */

import OpenAI from 'openai';
import { createLogger } from '../utils/logger';
import { openai as openaiConfig } from '../config/app-config';
import { ApiError } from '../middleware/error-handler';

// Initialize logger for AI service
const logger = createLogger('ai-service');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openaiConfig.apiKey,
});

/**
 * Validates that the OpenAI API key is configured
 * Throws an error if the key is missing
 */
function validateApiKey() {
  if (!openaiConfig.apiKey) {
    logger.error('OpenAI API key is missing');
    throw new ApiError(
      'OpenAI API key is required for AI features. Please set the OPENAI_API_KEY environment variable.',
      500
    );
  }
}

/**
 * Get outfit recommendations based on wardrobe items, weather, and occasion
 */
export async function getOutfitRecommendations({
  wardrobeItems,
  weatherCondition,
  occasion,
  mood,
  userPreferences,
}: {
  wardrobeItems: any[];
  weatherCondition?: {
    temperature: number;
    condition: string;
    humidity: number;
    precipitation: number;
  };
  occasion?: string;
  mood?: string;
  userPreferences?: Record<string, any>;
}) {
  try {
    validateApiKey();
    
    // Prepare wardrobe items for the prompt
    const itemsText = wardrobeItems.map(item => 
      `${item.name} (${item.category}): ${item.color}, ${item.material}, ${item.style}`
    ).join('\n');
    
    // Build a detailed prompt for the AI
    let prompt = `You are a personal styling assistant. Based on the user's wardrobe items, create 3 stylish outfit recommendations.

Wardrobe Items:
${itemsText}

`;

    // Add weather information if available
    if (weatherCondition) {
      prompt += `Weather Conditions:
- Temperature: ${weatherCondition.temperature}°C
- Condition: ${weatherCondition.condition}
- Humidity: ${weatherCondition.humidity}%
- Precipitation: ${weatherCondition.precipitation}%

`;
    }

    // Add occasion if specified
    if (occasion) {
      prompt += `Occasion: ${occasion}\n\n`;
    }

    // Add mood if specified
    if (mood) {
      prompt += `Current Mood: ${mood}\n\n`;
    }

    // Add user preferences if available
    if (userPreferences) {
      const preferencesText = Object.entries(userPreferences)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      prompt += `User Style Preferences:
${preferencesText}

`;
    }

    // Specify the output format
    prompt += `
For each outfit, provide:
1. A name for the outfit (creative, catchy)
2. A list of specific clothing items from the wardrobe to wear together
3. A brief styling tip
4. A reason why this outfit works well for the weather/occasion/mood
5. A confidence score from 1-100 on how well this outfit matches the user's preferences

Format your response as JSON with an array of outfits, each containing:
{
  "name": "Outfit name",
  "items": ["Item 1", "Item 2", ...],
  "stylingTip": "Tip text",
  "reasoning": "Why this works",
  "confidenceScore": 87
}`;

    // Make API request to OpenAI
    logger.info('Requesting outfit recommendations from OpenAI');
    const response = await openai.chat.completions.create({
      model: openaiConfig.model,
      messages: [
        { 
          role: "system", 
          content: "You are a luxury fashion styling assistant with expertise in creating outfit combinations from available clothing items. Always respond in valid JSON format."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: openaiConfig.maxTokens,
      temperature: openaiConfig.temperature,
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = response.choices[0]?.message?.content || '';
    logger.debug('OpenAI response received', { content });
    
    // Parse JSON response
    try {
      const data = JSON.parse(content);
      return data.outfits || [];
    } catch (parseError) {
      logger.error('Error parsing OpenAI response', { error: parseError, content });
      throw new ApiError('Failed to parse outfit recommendations', 500);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Re-throw API errors
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error generating outfit recommendations:', { error: errorMessage });
    throw new ApiError(`Failed to generate outfit recommendations: ${errorMessage}`, 500);
  }
}

/**
 * Analyze a user's style based on their wardrobe and preferences
 */
export async function analyzeUserStyle({
  wardrobeItems,
  outfitHistory,
  userPreferences,
}: {
  wardrobeItems: any[];
  outfitHistory?: any[];
  userPreferences?: Record<string, any>;
}) {
  try {
    validateApiKey();
    
    // Prepare wardrobe data for the prompt
    const itemsByCategory = wardrobeItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
    
    // Create summary of wardrobe by category
    const categorySummary = Object.entries(itemsByCategory).map(([category, items]) => {
      const colors = [...new Set(items.map(item => item.color))];
      const styles = [...new Set(items.map(item => item.style))];
      
      return `${category}: ${items.length} items
- Common colors: ${colors.join(', ')}
- Styles: ${styles.join(', ')}`;
    }).join('\n\n');
    
    // Build the prompt
    let prompt = `You are a professional fashion stylist analyzing a user's wardrobe to determine their style profile.

Wardrobe Summary:
${categorySummary}

`;

    // Add outfit history if available
    if (outfitHistory && outfitHistory.length > 0) {
      const historyText = outfitHistory.map(outfit => 
        `- ${outfit.name}: ${outfit.items.join(', ')}`
      ).join('\n');
      
      prompt += `Recent Outfit Choices:
${historyText}

`;
    }

    // Add user preferences if available
    if (userPreferences) {
      const preferencesText = Object.entries(userPreferences)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      prompt += `User Stated Preferences:
${preferencesText}

`;
    }

    // Specify the output format
    prompt += `
Based on this information, provide a comprehensive style analysis with:
1. Primary style archetype (e.g., Classic, Bohemian, Minimalist)
2. Secondary style influences
3. Color palette analysis
4. Strengths of current wardrobe
5. Gaps or opportunities to enhance the wardrobe
6. Personalized style advice

Format your response as JSON with:
{
  "primaryStyle": "Style name",
  "secondaryInfluences": ["Style 1", "Style 2"],
  "colorAnalysis": "Description of color preferences and palette",
  "strengths": ["Strength 1", "Strength 2", ...],
  "opportunities": ["Opportunity 1", "Opportunity 2", ...],
  "personalizedAdvice": "Detailed advice paragraph",
  "recommendedItems": ["Item type 1", "Item type 2", ...]
}`;

    // Make API request to OpenAI
    logger.info('Requesting style analysis from OpenAI');
    const response = await openai.chat.completions.create({
      model: openaiConfig.model,
      messages: [
        { 
          role: "system", 
          content: "You are a luxury fashion consultant with expertise in analyzing personal style. Always respond in valid JSON format."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: openaiConfig.maxTokens,
      temperature: openaiConfig.temperature,
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = response.choices[0]?.message?.content || '';
    logger.debug('OpenAI response received', { content });
    
    // Parse JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      logger.error('Error parsing OpenAI response', { error: parseError, content });
      throw new ApiError('Failed to parse style analysis', 500);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Re-throw API errors
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error analyzing user style:', { error: errorMessage });
    throw new ApiError(`Failed to analyze user style: ${errorMessage}`, 500);
  }
}

/**
 * Generate an outfit recommendation for a specific occasion
 */
export async function getOccasionOutfit({
  occasion,
  wardrobeItems,
  weatherCondition,
  userPreferences,
}: {
  occasion: string;
  wardrobeItems: any[];
  weatherCondition?: {
    temperature: number;
    condition: string;
  };
  userPreferences?: Record<string, any>;
}) {
  try {
    validateApiKey();
    
    // Prepare wardrobe items for the prompt
    const itemsText = wardrobeItems.map(item => 
      `${item.name} (${item.category}): ${item.color}, ${item.material}, ${item.style}`
    ).join('\n');
    
    // Build a detailed prompt
    let prompt = `You are a personal styling assistant. Create the perfect outfit for a specific occasion using items from the user's wardrobe.

Occasion: ${occasion}

Wardrobe Items:
${itemsText}

`;

    // Add weather information if available
    if (weatherCondition) {
      prompt += `Weather Conditions:
- Temperature: ${weatherCondition.temperature}°C
- Condition: ${weatherCondition.condition}

`;
    }

    // Add user preferences if available
    if (userPreferences) {
      const preferencesText = Object.entries(userPreferences)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      prompt += `User Style Preferences:
${preferencesText}

`;
    }

    // Specify the output format
    prompt += `
Provide a detailed outfit recommendation with:
1. A name for the outfit
2. Specific clothing items from the wardrobe
3. Accessories to complete the look
4. Styling instructions
5. Why this outfit is perfect for the occasion

Format your response as JSON:
{
  "name": "Outfit name",
  "items": ["Item 1", "Item 2", ...],
  "accessories": ["Accessory 1", "Accessory 2", ...],
  "stylingInstructions": "Detailed instructions",
  "occasionReasoning": "Why this outfit works for the occasion"
}`;

    // Make API request to OpenAI
    logger.info('Requesting occasion outfit from OpenAI');
    const response = await openai.chat.completions.create({
      model: openaiConfig.model,
      messages: [
        { 
          role: "system", 
          content: "You are a luxury fashion styling assistant specializing in occasion dressing. Always respond in valid JSON format."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: openaiConfig.maxTokens,
      temperature: openaiConfig.temperature,
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = response.choices[0]?.message?.content || '';
    logger.debug('OpenAI response received', { content });
    
    // Parse JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      logger.error('Error parsing OpenAI response', { error: parseError, content });
      throw new ApiError('Failed to parse occasion outfit recommendation', 500);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Re-throw API errors
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error generating occasion outfit:', { error: errorMessage });
    throw new ApiError(`Failed to generate occasion outfit: ${errorMessage}`, 500);
  }
}

/**
 * Analyze the user's style based on their wardrobe items
 */
export async function analyzeStyle(wardrobeItems: any[]) {
  try {
    validateApiKey();
    
    // Prepare wardrobe items for the prompt
    const itemsText = wardrobeItems.map(item => 
      `${item.name} (${item.category}): ${item.color}, ${item.description || ''}`
    ).join('\n');
    
    // Build a detailed prompt for the AI
    const prompt = `Analyze this user's wardrobe and describe their style profile:

Wardrobe Items:
${itemsText}

Based on these items, provide:
1. A summary of their overall style aesthetic
2. Their preferred color palette
3. Common patterns or themes in their clothing choices
4. Style strengths
5. Potential style areas for development
6. Recommendations for versatile items that would complement their existing wardrobe

Format your response as JSON with:
{
  "styleProfile": "Overall style description",
  "colorPalette": ["Primary colors", "Secondary colors"],
  "patterns": ["Pattern 1", "Pattern 2"],
  "strengths": ["Strength 1", "Strength 2"],
  "developmentAreas": ["Area 1", "Area 2"],
  "recommendations": ["Item 1", "Item 2"]
}`;

    // Make API request to OpenAI
    logger.info('Requesting style analysis from OpenAI');
    const response = await openai.chat.completions.create({
      model: openaiConfig.model,
      messages: [
        { 
          role: "system", 
          content: "You are a professional fashion stylist with expertise in analyzing wardrobes. Always respond in valid JSON format."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: openaiConfig.maxTokens,
      temperature: openaiConfig.temperature,
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = response.choices[0]?.message?.content || '';
    logger.debug('OpenAI response received', { content });
    
    // Parse JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      logger.error('Error parsing OpenAI response', { error: parseError, content });
      throw new ApiError('Failed to parse style analysis', 500);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Re-throw API errors
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error analyzing style:', { error: errorMessage });
    throw new ApiError(`Failed to analyze style: ${errorMessage}`, 500);
  }
}

/**
 * Create a detailed user style profile based on their wardrobe
 */
export async function createUserStyleProfile(wardrobeItems: any[]) {
  try {
    validateApiKey();
    
    // This could be more complex, but for now we'll leverage the analyzeStyle function
    // and add some additional processing
    const styleAnalysis = await analyzeStyle(wardrobeItems);
    
    // Add a profile summary and creation date
    return {
      ...styleAnalysis,
      profileSummary: `Style profile based on ${wardrobeItems.length} wardrobe items`,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error; // Re-throw API errors
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error creating user style profile:', { error: errorMessage });
    throw new ApiError(`Failed to create style profile: ${errorMessage}`, 500);
  }
}

/**
 * Generate advanced outfit recommendations based on various factors
 */
export async function generateAdvancedOutfitRecommendations(params: any) {
  // This is an alias for getOutfitRecommendations but with a more specific name
  return getOutfitRecommendations(params);
}

/**
 * Get outfit suggestions for a specific occasion
 */
export async function getOutfitSuggestionForOccasion(params: any) {
  // This is an alias for getOccasionOutfit with a more specific name
  return getOccasionOutfit(params);
}

// Export as default for default imports
export default {
  getOutfitRecommendations,
  getOccasionOutfit, // If this function exists in the full file
  analyzeUserStyle, // If this function exists in the full file
  analyzeStyle,
  createUserStyleProfile,
  generateAdvancedOutfitRecommendations,
  getOutfitSuggestionForOccasion
};