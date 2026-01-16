
import storage from "../storage";
import { WardrobeItem } from "@shared/schema";

interface WardrobeStats {
    totalValue: number;
    totalItems: number;
    averageCPW: number;
    utilizationRate: number; // Percentage of items worn at least once
    mostWornCategory: string;
    brandDistribution: Record<string, number>;
    colorSeason: {
        season: string;
        palette: string[];
        description: string;
    };
    potentialSavings: number; // Value of unworn items
}

// Seasonal Color Palettes (Heuristic Data)
// These are simplified palettes used to guess the user's season based on what they own.
const SEASON_PALETTES: Record<string, string[]> = {
    Spring: ["coral", "peach", "gold", "cream", "yellow", "orange", "warm green", "turquoise"],
    Summer: ["lavender", "blue", "mauve", "rose", "soft white", "gray", "silver", "pastel"],
    Autumn: ["olive", "rust", "mustard", "brown", "camel", "teal", "forest green", "burnt orange"],
    Winter: ["black", "white", "navy", "red", "royal blue", "emerald", "fuchsia", "ice blue"]
};

// Map typical wardrobe colors to seasons with weights
const COLOR_TO_SEASON: Record<string, string[]> = {
    // Warm / Light
    "gold": ["Spring"], "cream": ["Spring", "Autumn"], "yellow": ["Spring"], "orange": ["Spring", "Autumn"],
    "coral": ["Spring"], "peach": ["Spring"],

    // Cool / Light
    "lavender": ["Summer"], "blue": ["Summer", "Winter"], "rose": ["Summer"], "pastel": ["Summer"],
    "gray": ["Summer", "Winter"], "silver": ["Summer", "Winter"],

    // Warm / Deep
    "olive": ["Autumn"], "rust": ["Autumn"], "mustard": ["Autumn"], "brown": ["Autumn"], "camel": ["Autumn"],
    "teal": ["Autumn", "Winter"], "forest": ["Autumn"],

    // Cool / Deep
    "black": ["Winter"], "white": ["Winter", "Summer"], "navy": ["Winter"], "red": ["Winter", "Spring"],
    "emerald": ["Winter"], "fuchsia": ["Winter"], "burgundy": ["Winter", "Autumn"]
};

export class AnalyticsService {

    async getWardrobeStats(userId: number): Promise<WardrobeStats> {
        const items = await storage.getWardrobeItems(userId);

        let totalValue = 0;
        let totalCPW = 0;
        let itemsWithPrice = 0;
        let wornItemsCount = 0;
        let unwornValue = 0;

        const categoryCounts: Record<string, number> = {};
        const brandCounts: Record<string, number> = {};
        const seasonScores: Record<string, number> = { Spring: 0, Summer: 0, Autumn: 0, Winter: 0 };

        for (const item of items) {
            // Financials
            const price = item.purchasePrice || 0; // Price is in cents
            if (price > 0) {
                totalValue += price;
                itemsWithPrice++;

                const wearCount = Math.max(item.wearCount || 0, 1); // Avoid division by zero, assume 1 if unworn for CPW projection
                totalCPW += (price / wearCount);

                if ((item.wearCount || 0) === 0) {
                    unwornValue += price;
                }
            }

            // Utilization
            if ((item.wearCount || 0) > 0) {
                wornItemsCount++;
            }

            // Distribution
            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
            if (item.brand) {
                brandCounts[item.brand] = (brandCounts[item.brand] || 0) + 1;
            }

            // Color Analysis
            if (item.color) {
                this.scoreColorForSeason(item.color.toLowerCase(), seasonScores);
            }
        }

        // Averages
        const averageCPW = itemsWithPrice > 0 ? totalCPW / itemsWithPrice : 0;
        const utilizationRate = items.length > 0 ? (wornItemsCount / items.length) * 100 : 0;

        // Top Category
        let mostWornCategory = "N/A";
        let maxCategoryCount = 0;
        for (const [cat, count] of Object.entries(categoryCounts)) {
            if (count > maxCategoryCount) {
                maxCategoryCount = count;
                mostWornCategory = cat;
            }
        }

        // Determine Season
        const bestSeason = Object.entries(seasonScores).reduce((a, b) => a[1] > b[1] ? a : b)[0];

        return {
            totalValue, // in cents
            totalItems: items.length,
            averageCPW, // in cents
            utilizationRate,
            mostWornCategory,
            brandDistribution: brandCounts,
            colorSeason: {
                season: bestSeason,
                palette: SEASON_PALETTES[bestSeason],
                description: this.getSeasonDescription(bestSeason)
            },
            potentialSavings: unwornValue
        };
    }

    private scoreColorForSeason(colorName: string, scores: Record<string, number>) {
        // Simple fuzzy match for basic colors embedded in strings (e.g. "dark blue")
        for (const [key, seasons] of Object.entries(COLOR_TO_SEASON)) {
            if (colorName.includes(key)) {
                seasons.forEach(season => scores[season] += 1);
            }
        }
    }

    private getSeasonDescription(season: string): string {
        switch (season) {
            case "Spring": return "You look best in warm, fresh, and clear colors. Think 'golden hour'.";
            case "Summer": return "You shine in cool, soft, and muted tones. Think 'sea glass and lavender'.";
            case "Autumn": return "Your best colors are warm, deep, and rich. Think 'earth tones and spice'.";
            case "Winter": return "You rock cool, deep, and vivid colors. Think 'contrast and jewel tones'.";
            default: return "Your wardrobe is a mix of many seasons.";
        }
    }
}

export const analyticsService = new AnalyticsService();
