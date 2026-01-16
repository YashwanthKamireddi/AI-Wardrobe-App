/**
 * Server-Side Outfit Engine
 *
 * Moved from client to server for:
 * - Better performance on mobile devices
 * - Consistent results across platforms
 * - Reduced client bundle size
 *
 * @module server/lib/outfit-engine
 */

import { WardrobeItem } from "@shared/schema";

// Types
export type MoodType = "happy" | "confident" | "relaxed" | "energetic" | "romantic" | "professional" | "creative" | "casual" | "formal" | "playful";
export type WeatherType = "sunny" | "cloudy" | "rainy" | "snowy" | "windy";

// Weight factors
const WEATHER_MATCH_WEIGHT = 0.4;
const MOOD_MATCH_WEIGHT = 0.4;
const COLOR_HARMONY_WEIGHT = 0.2;

// Color families
const colorFamilies: Record<string, string[]> = {
    red: ["red", "burgundy", "maroon", "pink", "rose"],
    orange: ["orange", "peach", "coral", "amber"],
    yellow: ["yellow", "gold", "mustard", "lemon"],
    green: ["green", "olive", "mint", "lime", "emerald", "sage"],
    blue: ["blue", "navy", "teal", "aqua", "turquoise", "sky blue"],
    purple: ["purple", "lavender", "violet", "magenta", "plum"],
    neutral: ["black", "white", "gray", "beige", "tan", "brown", "cream", "ivory", "silver"],
};

function getColorFamily(color: string): string {
    const colorLower = color.toLowerCase();
    for (const [family, colors] of Object.entries(colorFamilies)) {
        if (colors.some(c => colorLower.includes(c))) {
            return family;
        }
    }
    return "neutral";
}

function checkColorHarmony(item1: WardrobeItem, item2: WardrobeItem): number {
    if (!item1.color || !item2.color) return 0.5;

    const family1 = getColorFamily(item1.color);
    const family2 = getColorFamily(item2.color);

    if (family1 === family2) return 0.8;

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

    if (family1 === "neutral" || family2 === "neutral") return 0.9;
    return 0.6;
}

function getWeatherScore(item: WardrobeItem, weather: WeatherType): number {
    const weatherMap: Record<WeatherType, string[]> = {
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

    if (weatherMap[weather].some(w => tags.some(tag => tag.includes(w)))) {
        return 1.0;
    }

    if (item.season) {
        switch (weather) {
            case 'sunny': return item.season.includes('summer') ? 0.9 : 0.5;
            case 'cloudy': return ['spring', "fall", "autumn"].some(s => item.season?.includes(s)) ? 0.8 : 0.6;
            case 'rainy': return ['spring', "fall", "autumn"].some(s => item.season?.includes(s)) ? 0.8 : 0.5;
            case 'snowy': return item.season.includes('winter') ? 0.9 : 0.3;
            case 'windy': return ['fall', "autumn", "spring"].some(s => item.season?.includes(s)) ? 0.8 : 0.6;
        }
    }

    return 0.5;
}

function getMoodScore(item: WardrobeItem, mood: MoodType): number {
    const moodMap: Record<string, Record<string, number>> = {
        casual: { "t-shirt": 1.0, "jeans": 1.0, "sneakers": 1.0, "sweater": 0.9, "hoodie": 1.0, "shorts": 0.9 },
        formal: { "suit": 1.0, "blazer": 1.0, "dress shirt": 1.0, "tie": 1.0, "dress": 1.0, "heels": 1.0 },
        professional: { "suit": 1.0, "blazer": 1.0, "business": 1.0, "formal": 0.9, "office": 1.0, "shirt": 0.8 },
        confident: { "suit": 1.0, "blazer": 1.0, "heels": 0.9, "red": 1.0, "bold": 1.0, "leather": 0.9 },
        relaxed: { "loose": 1.0, "soft": 1.0, "comfortable": 1.0, "casual": 0.9, "hoodie": 1.0, "loungewear": 1.0 },
        energetic: { "sports": 1.0, "bright": 0.9, "athleisure": 1.0, "sneakers": 0.9, "activewear": 1.0 },
        romantic: { "dress": 0.9, "floral": 1.0, "pink": 0.8, "red": 0.8, "lace": 1.0, "elegant": 0.9 },
        happy: { "colorful": 1.0, "bright": 1.0, "casual": 0.9, "fun": 1.0, "yellow": 1.0, "orange": 0.9 },
        creative: { "unique": 1.0, "pattern": 1.0, "colorful": 0.9, "artistic": 1.0, "bold": 0.9 },
        playful: { "colorful": 1.0, "print": 1.0, "pattern": 1.0, "bright": 1.0, "fun": 1.0 },
    };

    const tags = [
        ...(item.tags || []),
        item.subcategory || '',
        item.category,
        item.color || ''
    ].map(t => t.toLowerCase());

    let highestScore = 0.5;
    const moodMapping = moodMap[mood] || moodMap.casual;

    for (const tag of tags) {
        for (const [key, score] of Object.entries(moodMapping)) {
            if (tag.includes(key) && score > highestScore) {
                highestScore = score;
            }
        }
    }

    if (item.favorite) {
        highestScore = Math.min(1.0, highestScore + 0.1);
    }

    return highestScore;
}

function calculateItemScore(item: WardrobeItem, weather: WeatherType, mood: MoodType): number {
    const weatherScore = getWeatherScore(item, weather);
    const moodScore = getMoodScore(item, mood);
    return (weatherScore * WEATHER_MATCH_WEIGHT) + (moodScore * MOOD_MATCH_WEIGHT);
}

function calculateOutfitScore(items: WardrobeItem[], weather: WeatherType, mood: MoodType): number {
    const avgScore = items.map(item => calculateItemScore(item, weather, mood))
        .reduce((sum, score) => sum + score, 0) / items.length;

    let totalHarmony = 0;
    let pairs = 0;

    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            totalHarmony += checkColorHarmony(items[i], items[j]);
            pairs++;
        }
    }

    const avgHarmony = pairs > 0 ? totalHarmony / pairs : 0.5;
    return (avgScore * (1 - COLOR_HARMONY_WEIGHT)) + (avgHarmony * COLOR_HARMONY_WEIGHT);
}

export interface OutfitRecommendation {
    outfitItems: WardrobeItem[];
    score: number;
    categories: {
        tops?: WardrobeItem;
        bottoms?: WardrobeItem;
        dresses?: WardrobeItem;
        outerwear?: WardrobeItem;
        shoes?: WardrobeItem;
        accessories?: WardrobeItem[];
    };
}

/**
 * Generate outfit recommendations based on wardrobe, weather, and mood
 */
export function generateOutfitRecommendations(
    wardrobeItems: WardrobeItem[],
    weather: WeatherType,
    mood: MoodType,
    count: number = 3
): OutfitRecommendation[] {
    const itemsByCategory: Record<string, WardrobeItem[]> = {};

    for (const item of wardrobeItems) {
        if (!itemsByCategory[item.category]) {
            itemsByCategory[item.category] = [];
        }
        itemsByCategory[item.category].push(item);
    }

    const recommendations: OutfitRecommendation[] = [];

    if (Object.keys(itemsByCategory).length === 0) {
        return recommendations;
    }

    for (let i = 0; i < count * 3 && recommendations.length < count; i++) {
        const useDress = Math.random() > 0.6 && itemsByCategory.dresses?.length > 0;

        const outfit: OutfitRecommendation = {
            outfitItems: [],
            score: 0,
            categories: { accessories: [] }
        };

        if (useDress) {
            const dresses = [...(itemsByCategory.dresses || [])];
            dresses.sort((a, b) => calculateItemScore(b, weather, mood) - calculateItemScore(a, weather, mood));
            const idx = Math.floor(Math.random() * Math.min(3, dresses.length));
            outfit.categories.dresses = dresses[idx];
            outfit.outfitItems.push(dresses[idx]);
        } else {
            const tops = [...(itemsByCategory.tops || [])];
            if (tops.length > 0) {
                tops.sort((a, b) => calculateItemScore(b, weather, mood) - calculateItemScore(a, weather, mood));
                const idx = Math.floor(Math.random() * Math.min(3, tops.length));
                outfit.categories.tops = tops[idx];
                outfit.outfitItems.push(tops[idx]);
            }

            const bottoms = [...(itemsByCategory.bottoms || [])];
            if (bottoms.length > 0 && outfit.categories.tops) {
                bottoms.sort((a, b) => {
                    const scoreA = calculateItemScore(a, weather, mood) + checkColorHarmony(a, outfit.categories.tops!);
                    const scoreB = calculateItemScore(b, weather, mood) + checkColorHarmony(b, outfit.categories.tops!);
                    return scoreB - scoreA;
                });
                const idx = Math.floor(Math.random() * Math.min(3, bottoms.length));
                outfit.categories.bottoms = bottoms[idx];
                outfit.outfitItems.push(bottoms[idx]);
            }
        }

        if (['cloudy', 'rainy', 'snowy', 'windy'].includes(weather)) {
            const outerwear = [...(itemsByCategory.outerwear || [])];
            if (outerwear.length > 0) {
                outerwear.sort((a, b) => calculateItemScore(b, weather, mood) - calculateItemScore(a, weather, mood));
                const idx = Math.floor(Math.random() * Math.min(2, outerwear.length));
                outfit.categories.outerwear = outerwear[idx];
                outfit.outfitItems.push(outerwear[idx]);
            }
        }

        const shoes = [...(itemsByCategory.shoes || [])];
        if (shoes.length > 0) {
            shoes.sort((a, b) => calculateItemScore(b, weather, mood) - calculateItemScore(a, weather, mood));
            const idx = Math.floor(Math.random() * Math.min(2, shoes.length));
            outfit.categories.shoes = shoes[idx];
            outfit.outfitItems.push(shoes[idx]);
        }

        const accessories = [...(itemsByCategory.accessories || [])];
        if (accessories.length > 0) {
            accessories.sort((a, b) => calculateItemScore(b, weather, mood) - calculateItemScore(a, weather, mood));
            const accessoryCount = Math.min(Math.floor(Math.random() * 2) + 1, accessories.length);
            for (let j = 0; j < accessoryCount; j++) {
                outfit.categories.accessories?.push(accessories[j]);
                outfit.outfitItems.push(accessories[j]);
            }
        }

        outfit.score = calculateOutfitScore(outfit.outfitItems, weather, mood);

        const isDuplicate = recommendations.some(rec =>
            JSON.stringify(rec.outfitItems.map(item => item.id).sort()) ===
            JSON.stringify(outfit.outfitItems.map(item => item.id).sort())
        );

        if (!isDuplicate && outfit.outfitItems.length >= 2) {
            recommendations.push(outfit);
        }
    }

    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, count);
}
