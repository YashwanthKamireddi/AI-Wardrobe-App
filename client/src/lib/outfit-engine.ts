/**
 * Outfit Engine
 * 
 * A sophisticated algorithm for generating personalized outfit recommendations based on:
 * - Weather conditions (sunny, rainy, etc.)
 * - User mood (happy, professional, etc.)
 * - Color harmony between items
 * - Item appropriateness for specific conditions
 * 
 * The engine uses a weighted scoring system that considers multiple factors to generate
 * outfit recommendations that are both functionally appropriate and aesthetically pleasing.
 * 
 * @module outfit-engine
 */

import { WardrobeItem } from "@shared/schema";

/**
 * Valid mood types used for outfit recommendations
 * These values must match the options in the schema
 */
type MoodType = "happy" | "confident" | "relaxed" | "energetic" | "romantic" | "professional" | "creative";

/**
 * Valid weather types used for outfit recommendations
 * These values must match the options in the schema
 */
type WeatherType = "sunny" | "cloudy" | "rainy" | "snowy" | "windy";

// Weight factors for different scoring criteria - adjust these to change the importance of each factor
const WEATHER_MATCH_WEIGHT = 0.4;
const MOOD_MATCH_WEIGHT = 0.4;
const COLOR_HARMONY_WEIGHT = 0.2;

// Color families for color harmony
const colorFamilies = {
  red: ["red", "burgundy", "maroon", "pink", "rose"],
  orange: ["orange", "peach", "coral", "amber"],
  yellow: ["yellow", "gold", "mustard", "lemon"],
  green: ["green", "olive", "mint", "lime", "emerald", "sage"],
  blue: ["blue", "navy", "teal", "aqua", "turquoise", "sky blue"],
  purple: ["purple", "lavender", "violet", "magenta", "plum"],
  neutral: ["black", "white", "gray", "beige", "tan", "brown", "cream", "ivory", "silver"],
};

/**
 * Determines the color family for a given color string
 * Used for color harmony calculations
 * 
 * @param {string} color - The color name to analyze
 * @returns {string} The color family name
 */
function getColorFamily(color: string): string {
  const colorLower = color.toLowerCase();
  for (const [family, colors] of Object.entries(colorFamilies)) {
    if (colors.some(c => colorLower.includes(c))) {
      return family;
    }
  }
  return "neutral"; // Default to neutral if no match
}

/**
 * Analyzes the color harmony between two wardrobe items
 * Uses color theory to determine how well colors complement each other
 * 
 * @param {WardrobeItem} item1 - First wardrobe item
 * @param {WardrobeItem} item2 - Second wardrobe item
 * @returns {number} Harmony score between 0-1, with 1 being perfect harmony
 */
function checkColorHarmony(item1: WardrobeItem, item2: WardrobeItem): number {
  if (!item1.color || !item2.color) return 0.5; // Neutral score if color info missing

  const family1 = getColorFamily(item1.color);
  const family2 = getColorFamily(item2.color);

  // Same color family (monochromatic)
  if (family1 === family2) return 0.8;

  // Complementary colors
  const complementaryPairs = [
    ["red", "green"],
    ["blue", "orange"],
    ["yellow", "purple"]
  ];

  if (complementaryPairs.some(pair => 
    (pair[0] === family1 && pair[1] === family2) || 
    (pair[1] === family1 && pair[0] === family2))) {
    return 1.0;
  }

  // Neutrals go with everything
  if (family1 === "neutral" || family2 === "neutral") return 0.9;

  // Default harmony score
  return 0.6;
}

/**
 * Evaluates how appropriate a clothing item is for specific weather conditions
 * Considers both item attributes and seasonal appropriateness
 * 
 * @param {WardrobeItem} item - The wardrobe item to evaluate
 * @param {WeatherType} weather - Current weather condition
 * @returns {number} Appropriateness score between 0-1
 */
function getWeatherScore(item: WardrobeItem, weather: WeatherType): number {
  // Default weather appropriateness
  const weatherAppropriateMap: Record<WeatherType, string[]> = {
    sunny: ["t-shirt", "shorts", "sundress", "sandals", "sunglasses", "hat"],
    cloudy: ["blouse", "sweater", "jeans", "light jacket", "sneakers"],
    rainy: ["raincoat", "boots", "umbrella", "waterproof", "jacket"],
    snowy: ["coat", "boots", "scarf", "gloves", "sweater", "hat", "jacket"],
    windy: ["jacket", "windbreaker", "jeans", "sweater", "hoodie"]
  };

  const tags = [
    ...(item.tags || []),
    item.subcategory || '',
    item.category
  ].map(t => t.toLowerCase());

  // Check if any tags match the weather-appropriate items
  if (weatherAppropriateMap[weather].some(appropriate => 
    tags.some(tag => tag.includes(appropriate)))) {
    return 1.0;
  }

  // Season-based scores
  if (item.season) {
    switch (weather) {
      case 'sunny':
        return item.season.includes('summer') ? 0.9 : 0.5;
      case 'cloudy':
        return ['spring', "fall", "autumn"].some(s => item.season?.includes(s)) ? 0.8 : 0.6;
      case 'rainy':
        return ['spring', "fall", "autumn"].some(s => item.season?.includes(s)) ? 0.8 : 0.5;
      case 'snowy':
        return item.season.includes('winter') ? 0.9 : 0.3;
      case 'windy':
        return ['fall', "autumn", "spring"].some(s => item.season?.includes(s)) ? 0.8 : 0.6;
    }
  }

  return 0.5; // Default score
}

/**
 * Evaluates how appropriate a clothing item is for a specific mood or occasion
 * Uses item tags, category, and color to determine mood compatibility
 * 
 * @param {WardrobeItem} item - The wardrobe item to evaluate
 * @param {MoodType} mood - User's current mood preference
 * @returns {number} Mood appropriateness score between 0-1
 */
function getMoodScore(item: WardrobeItem, mood: MoodType): number {
  // Mood-appropriate outfits mapping
  const moodAppropriateMap: Record<MoodType, Record<string, number>> = {
    casual: {
      "t-shirt": 1.0, "jeans": 1.0, "sneakers": 1.0, "sweater": 0.9, "hoodie": 1.0,
      "shorts": 0.9, "sundress": 0.8, "sandals": 0.9
    },
    formal: {
      "suit": 1.0, "blazer": 1.0, "dress shirt": 1.0, "tie": 1.0, "dress": 1.0,
      "heels": 1.0, "formal shoes": 1.0
    },
    playful: {
      "colorful": 1.0, "print": 1.0, "pattern": 1.0, "bright": 1.0, "fun": 1.0,
      "casual": 0.8
    },
    confident: {
      "suit": 1.0, "blazer": 1.0, "heels": 0.9, "red": 1.0, "bold": 1.0,
      "leather": 0.9, "fitted": 0.9
    },
    relaxed: {
      "loose": 1.0, "soft": 1.0, "comfortable": 1.0, "casual": 0.9, "hoodie": 1.0,
      "pajamas": 1.0, "loungewear": 1.0
    },
    energetic: {
      "sports": 1.0, "bright": 0.9, "athleisure": 1.0, "sneakers": 0.9, 
      "activewear": 1.0, "workout": 1.0
    },
    romantic: {
      "dress": 0.9, "floral": 1.0, "pink": 0.8, "red": 0.8, "lace": 1.0,
      "soft": 0.8, "elegant": 0.9
    },
    professional: {
      "suit": 1.0, "blazer": 1.0, "business": 1.0, "formal": 0.9, "office": 1.0,
      "shirt": 0.8, "tie": 1.0, "slacks": 1.0
    },
    happy: {
      "colorful": 1.0, "bright": 1.0, "casual": 0.9, "fun": 1.0, "print": 0.9,
      "yellow": 1.0, "orange": 0.9
    },
    creative: {
      "unique": 1.0, "pattern": 1.0, "colorful": 0.9, "artistic": 1.0, "bold": 0.9,
      "mixed": 1.0, "unconventional": 1.0
    }
  } as Record<MoodType, Record<string, number>>;

  const tags = [
    ...(item.tags || []),
    item.subcategory || '',
    item.category,
    item.color || ''
  ].map(t => t.toLowerCase());

  // Check if any tags match the mood-appropriate items
  let highestScore = 0.5; // Default score

  for (const tag of tags) {
    for (const [key, score] of Object.entries(moodAppropriateMap[mood] || {})) {
      if (tag.includes(key) && score > highestScore) {
        highestScore = score;
      }
    }
  }

  // Favorite items get a bonus for any mood
  if (item.favorite) {
    highestScore = Math.min(1.0, highestScore + 0.1);
  }

  return highestScore;
}

/**
 * Calculates the overall score for a single wardrobe item
 * Combines weather appropriateness and mood compatibility scores
 * 
 * @param {WardrobeItem} item - The wardrobe item to score
 * @param {WeatherType} weather - Current weather condition
 * @param {MoodType} mood - User's current mood preference
 * @returns {number} Combined score between 0-1
 */
function calculateItemScore(item: WardrobeItem, weather: WeatherType, mood: MoodType): number {
  const weatherScore = getWeatherScore(item, weather);
  const moodScore = getMoodScore(item, mood);

  return (weatherScore * WEATHER_MATCH_WEIGHT) + (moodScore * MOOD_MATCH_WEIGHT);
}

/**
 * Calculates the overall score for an entire outfit
 * Combines individual item scores with color harmony analysis
 * 
 * @param {WardrobeItem[]} outfitItems - Array of items in the outfit
 * @param {WeatherType} weather - Current weather condition
 * @param {MoodType} mood - User's current mood preference
 * @returns {number} Overall outfit score between 0-1
 */
function calculateOutfitScore(
  outfitItems: WardrobeItem[],
  weather: WeatherType,
  mood: MoodType
): number {
  // Average of individual item scores
  const individualScores = outfitItems.map(item => calculateItemScore(item, weather, mood));
  const avgIndividualScore = individualScores.reduce((sum, score) => sum + score, 0) / individualScores.length;

  // Color harmony between items
  let totalHarmony = 0;
  let harmonyPairs = 0;

  for (let i = 0; i < outfitItems.length; i++) {
    for (let j = i + 1; j < outfitItems.length; j++) {
      totalHarmony += checkColorHarmony(outfitItems[i], outfitItems[j]);
      harmonyPairs++;
    }
  }

  const avgColorHarmony = harmonyPairs > 0 ? totalHarmony / harmonyPairs : 0.5;

  // Weighted total score
  return (avgIndividualScore * (1 - COLOR_HARMONY_WEIGHT)) + (avgColorHarmony * COLOR_HARMONY_WEIGHT);
}

/**
 * Represents a complete outfit recommendation with items and score
 * Categorizes items by type for easy UI rendering
 */
export interface OutfitRecommendation {
  /** All wardrobe items that make up this outfit */
  outfitItems: WardrobeItem[];
  
  /** Overall score from 0-1, higher is better */
  score: number;
  
  /** Items organized by category for display purposes */
  categories: {
    tops?: WardrobeItem;
    bottoms?: WardrobeItem;
    dresses?: WardrobeItem;
    outerwear?: WardrobeItem;
    shoes?: WardrobeItem;
    accessories?: WardrobeItem[];
    makeup?: WardrobeItem[];
  };
}

/**
 * Main outfit generation function
 * Creates outfit recommendations based on user's wardrobe, weather, and mood
 * 
 * @param {WardrobeItem[]} wardrobeItems - All available items in the user's wardrobe
 * @param {WeatherType} weather - Current weather condition
 * @param {MoodType} mood - User's current mood preference
 * @param {number} count - Number of recommendations to generate (default: 3)
 * @returns {OutfitRecommendation[]} Array of recommended outfits with scores
 */
export function generateOutfitRecommendations(
  wardrobeItems: WardrobeItem[],
  weather: WeatherType,
  mood: MoodType,
  count: number = 3
): OutfitRecommendation[] {
  // Group items by category
  const itemsByCategory: Record<string, WardrobeItem[]> = {};

  for (const item of wardrobeItems) {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = [];
    }
    itemsByCategory[item.category].push(item);
  }

  const recommendations: OutfitRecommendation[] = [];

  // Base case: no items
  if (Object.keys(itemsByCategory).length === 0) {
    return recommendations;
  }

  // Try to create unique outfit combinations
  for (let i = 0; i < count * 3 && recommendations.length < count; i++) {
    // Either dress-based outfit or top+bottom
    const useDress = Math.random() > 0.6 && itemsByCategory.dresses && itemsByCategory.dresses.length > 0;

    const outfit: OutfitRecommendation = {
      outfitItems: [],
      score: 0,
      categories: {
        accessories: [],
        makeup: [],
      }
    };

    // Add base outfit (dress or top+bottom)
    if (useDress) {
      const dresses = itemsByCategory.dresses || [];
      if (dresses.length > 0) {
        // Sort by score
        dresses.sort((a, b) => calculateItemScore(b, weather, mood) - calculateItemScore(a, weather, mood));
        // Choose one of the top scoring dresses (with some randomness)
        const topCount = Math.min(3, dresses.length);
        const selectedIndex = Math.floor(Math.random() * topCount);
        outfit.categories.dresses = dresses[selectedIndex];
        outfit.outfitItems.push(dresses[selectedIndex]);
      }
    } else {
      // Add a top
      const tops = itemsByCategory.tops || [];
      if (tops.length > 0) {
        tops.sort((a, b) => calculateItemScore(b, weather, mood) - calculateItemScore(a, weather, mood));
        const topCount = Math.min(3, tops.length);
        const selectedTopIndex = Math.floor(Math.random() * topCount);
        outfit.categories.tops = tops[selectedTopIndex];
        outfit.outfitItems.push(tops[selectedTopIndex]);
      }

      // Add a bottom
      const bottoms = itemsByCategory.bottoms || [];
      if (bottoms.length > 0) {
        // Sort bottoms by score and by color harmony with the selected top
        bottoms.sort((a, b) => {
          const scoreA = calculateItemScore(a, weather, mood);
          const scoreB = calculateItemScore(b, weather, mood);

          if (outfit.categories.tops) {
            const harmonyA = checkColorHarmony(a, outfit.categories.tops);
            const harmonyB = checkColorHarmony(b, outfit.categories.tops);
            return (scoreB + harmonyB) - (scoreA + harmonyA);
          }

          return scoreB - scoreA;
        });

        const bottomCount = Math.min(3, bottoms.length);
        const selectedBottomIndex = Math.floor(Math.random() * bottomCount);
        outfit.categories.bottoms = bottoms[selectedBottomIndex];
        outfit.outfitItems.push(bottoms[selectedBottomIndex]);
      }
    }

    // Add outerwear if appropriate for the weather
    if (['cloudy', 'rainy', 'snowy', 'windy'].includes(weather)) {
      const outerwear = itemsByCategory.outerwear || [];
      if (outerwear.length > 0) {
        outerwear.sort((a, b) => calculateItemScore(b, weather, mood) - calculateItemScore(a, weather, mood));
        const outerwearCount = Math.min(2, outerwear.length);
        const selectedOuterwearIndex = Math.floor(Math.random() * outerwearCount);
        outfit.categories.outerwear = outerwear[selectedOuterwearIndex];
        outfit.outfitItems.push(outerwear[selectedOuterwearIndex]);
      }
    }

    // Add shoes
    const shoes = itemsByCategory.shoes || [];
    if (shoes.length > 0) {
      shoes.sort((a, b) => calculateItemScore(b, weather, mood) - calculateItemScore(a, weather, mood));
      const shoesCount = Math.min(2, shoes.length);
      const selectedShoesIndex = Math.floor(Math.random() * shoesCount);
      outfit.categories.shoes = shoes[selectedShoesIndex];
      outfit.outfitItems.push(shoes[selectedShoesIndex]);
    }

    // Add accessories (1-2)
    const accessories = itemsByCategory.accessories || [];
    if (accessories.length > 0) {
      accessories.sort((a, b) => calculateItemScore(b, weather, mood) - calculateItemScore(a, weather, mood));
      const accessoryCount = Math.min(Math.floor(Math.random() * 2) + 1, accessories.length);

      for (let j = 0; j < accessoryCount; j++) {
        outfit.categories.accessories?.push(accessories[j]);
        outfit.outfitItems.push(accessories[j]);
      }
    }

    // Add makeup
    const makeup = itemsByCategory.makeup || [];
    if (makeup.length > 0) {
      makeup.sort((a, b) => calculateItemScore(b, weather, mood) - calculateItemScore(a, weather, mood));
      const makeupCount = Math.min(Math.floor(Math.random() * 2) + 1, makeup.length);

      for (let j = 0; j < makeupCount; j++) {
        outfit.categories.makeup?.push(makeup[j]);
        outfit.outfitItems.push(makeup[j]);
      }
    }

    // Calculate overall outfit score
    outfit.score = calculateOutfitScore(outfit.outfitItems, weather, mood);

    // Only add unique outfit combinations
    const isDuplicate = recommendations.some(rec => 
      JSON.stringify(rec.outfitItems.map(item => item.id).sort()) === 
      JSON.stringify(outfit.outfitItems.map(item => item.id).sort())
    );

    if (!isDuplicate && outfit.outfitItems.length >= 2) {
      recommendations.push(outfit);
    }
  }

  // Sort by score
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations.slice(0, count);
}