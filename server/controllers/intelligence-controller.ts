/**
 * Wardrobe Intelligence Controller
 *
 * AI-powered wardrobe analysis features:
 * - Gap analysis (missing essential items)
 * - Duplicate detection
 * - Versatility scoring
 * - Budget recommendations
 */

import { Request, Response } from "express";
import { storage } from "../storage";
import { logger } from "../utils/logger";

// Essential items for a complete wardrobe (industry standard)
const WARDROBE_ESSENTIALS: Record<string, string[]> = {
    tops: ["white_shirt", "black_tee", "blazer", "cardigan", "sweater"],
    bottoms: ["dark_jeans", "black_pants", "neutral_trousers", "shorts"],
    dresses: ["lbd", "day_dress", "formal_dress"],
    outerwear: ["trench_coat", "leather_jacket", "winter_coat", "rain_jacket"],
    shoes: ["white_sneakers", "black_heels", "loafers", "boots", "sandals"],
    accessories: ["watch", "belt", "scarf", "sunglasses"],
};

// Color families for duplicate detection
const COLOR_FAMILIES: Record<string, string[]> = {
    neutrals: ["black", "white", "gray", "grey", "beige", "cream", "navy", "brown", "tan", "khaki"],
    warm: ["red", "orange", "yellow", "coral", "burgundy", "maroon", "rust", "terracotta"],
    cool: ["blue", "green", "purple", "teal", "mint", "lavender", "navy"],
    pastels: ["pink", "peach", "light blue", "mint", "lavender", "blush"],
};

/**
 * GET /api/wardrobe/intelligence
 * Get comprehensive wardrobe analysis
 */
export async function getWardrobeIntelligence(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;
        const items = await storage.getWardrobeItems(userId);

        if (!items || items.length === 0) {
            return res.json({
                gapAnalysis: { score: 0, missingEssentials: Object.keys(WARDROBE_ESSENTIALS), recommendations: [] },
                duplicates: [],
                versatilityScore: 0,
                budgetInsights: { totalValue: 0, avgCostPerWear: 0, suggestions: [] },
            });
        }

        // 1. Gap Analysis - Find missing essentials
        const gapAnalysis = analyzeGaps(items);

        // 2. Duplicate Detection - Find similar items
        const duplicates = detectDuplicates(items);

        // 3. Versatility Score - How well-rounded is the wardrobe?
        const versatilityScore = calculateVersatility(items);

        // 4. Budget Insights
        const budgetInsights = analyzeBudget(items);

        res.json({
            gapAnalysis,
            duplicates,
            versatilityScore,
            budgetInsights,
            totalItems: items.length,
            analyzedAt: new Date().toISOString(),
        });
    } catch (error) {
        logger.error({ err: error }, "Error analyzing wardrobe");
        res.status(500).json({ message: "Failed to analyze wardrobe" });
    }
}

/**
 * GET /api/wardrobe/shopping-recommendations
 * Get personalized shopping recommendations
 */
export async function getShoppingRecommendations(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = (req.user as any).id;
        const items = await storage.getWardrobeItems(userId);
        const budget = parseInt(req.query.budget as string) || 10000;

        // Analyze current wardrobe
        const categories = new Map<string, number>();
        const colors = new Map<string, number>();

        items.forEach(item => {
            categories.set(item.category, (categories.get(item.category) || 0) + 1);
            if (item.color) {
                colors.set(item.color.toLowerCase(), (colors.get(item.color.toLowerCase()) || 0) + 1);
            }
        });

        // Generate recommendations
        const recommendations = [];

        // Check for missing categories
        const essentialCategories = ["tops", "bottoms", "outerwear", "shoes"];
        for (const cat of essentialCategories) {
            const count = categories.get(cat) || 0;
            if (count < 3) {
                recommendations.push({
                    type: "category_gap",
                    priority: "high",
                    category: cat,
                    reason: `You only have ${count} ${cat}. Consider adding more for versatility.`,
                    suggestedBudget: Math.floor(budget * 0.3),
                });
            }
        }

        // Check for color balance
        const hasNeutrals = Array.from(colors.keys()).some(c =>
            COLOR_FAMILIES.neutrals.includes(c)
        );
        if (!hasNeutrals) {
            recommendations.push({
                type: "color_gap",
                priority: "medium",
                category: "any",
                reason: "Your wardrobe lacks neutral basics. Add black, white, or beige pieces.",
                suggestedBudget: Math.floor(budget * 0.2),
            });
        }

        // Check for seasonal gaps
        const seasons = items.map(i => i.season).filter(Boolean);
        const currentSeason = getCurrentSeason();
        const hasCurrentSeason = seasons.includes(currentSeason);
        if (!hasCurrentSeason && items.length > 5) {
            recommendations.push({
                type: "seasonal_gap",
                priority: "medium",
                category: "any",
                reason: `Limited ${currentSeason} pieces. Consider seasonal shopping.`,
                suggestedBudget: Math.floor(budget * 0.25),
            });
        }

        // Avoid duplicates recommendation
        const duplicateCategories = items.filter(i => {
            const sameCategory = items.filter(other =>
                other.id !== i.id &&
                other.category === i.category &&
                other.color === i.color
            );
            return sameCategory.length > 2;
        }).map(i => i.category);

        if (duplicateCategories.length > 0) {
            recommendations.push({
                type: "duplicate_warning",
                priority: "low",
                category: duplicateCategories[0],
                reason: `You have many similar ${duplicateCategories[0]}. Diversify before buying more.`,
                suggestedBudget: 0,
            });
        }

        res.json({
            recommendations,
            budget,
            totalRecommendations: recommendations.length,
            wardrobeHealth: items.length >= 20 ? "good" : items.length >= 10 ? "building" : "starting",
        });
    } catch (error) {
        logger.error({ err: error }, "Error getting shopping recommendations");
        res.status(500).json({ message: "Failed to get recommendations" });
    }
}

// Helper functions

function analyzeGaps(items: any[]): { score: number; missingEssentials: string[]; recommendations: any[] } {
    const categories = new Set(items.map(i => i.category?.toLowerCase()));
    const colors = new Set(items.map(i => i.color?.toLowerCase()).filter(Boolean));

    const missingEssentials: string[] = [];
    const recommendations: any[] = [];

    // Check each essential category
    Object.entries(WARDROBE_ESSENTIALS).forEach(([category, essentials]) => {
        if (!categories.has(category)) {
            missingEssentials.push(category);
            recommendations.push({
                category,
                priority: "high",
                reason: `Missing ${category} entirely`,
            });
        }
    });

    // Check for neutral basics
    const hasBlack = colors.has("black");
    const hasWhite = colors.has("white");
    const hasBeige = colors.has("beige") || colors.has("cream") || colors.has("tan");

    if (!hasBlack) recommendations.push({ item: "black basics", priority: "medium" });
    if (!hasWhite) recommendations.push({ item: "white basics", priority: "medium" });
    if (!hasBeige) recommendations.push({ item: "neutral tones", priority: "low" });

    const score = Math.max(0, 100 - (missingEssentials.length * 15) - (recommendations.length * 5));

    return { score, missingEssentials, recommendations };
}

function detectDuplicates(items: any[]): any[] {
    const duplicates: any[] = [];
    const processed = new Set<number>();

    items.forEach(item => {
        if (processed.has(item.id)) return;

        const similar = items.filter(other =>
            other.id !== item.id &&
            !processed.has(other.id) &&
            other.category === item.category &&
            isSimilarColor(item.color, other.color)
        );

        if (similar.length >= 1) {
            duplicates.push({
                items: [item, ...similar].map(i => ({
                    id: i.id,
                    name: i.name,
                    color: i.color,
                    imageUrl: i.imageUrl,
                })),
                category: item.category,
                suggestion: similar.length >= 2
                    ? "Consider donating or selling extras"
                    : "Having options is good, but watch for over-buying",
            });

            similar.forEach(s => processed.add(s.id));
        }
        processed.add(item.id);
    });

    return duplicates.slice(0, 5); // Limit to top 5 duplicate groups
}

function isSimilarColor(color1?: string, color2?: string): boolean {
    if (!color1 || !color2) return false;
    if (color1.toLowerCase() === color2.toLowerCase()) return true;

    // Check if in same color family
    for (const family of Object.values(COLOR_FAMILIES)) {
        const c1InFamily = family.includes(color1.toLowerCase());
        const c2InFamily = family.includes(color2.toLowerCase());
        if (c1InFamily && c2InFamily) return true;
    }

    return false;
}

function calculateVersatility(items: any[]): number {
    const categories = new Set(items.map(i => i.category));
    const colors = new Set(items.map(i => i.color).filter(Boolean));
    const seasons = new Set(items.map(i => i.season).filter(Boolean));

    const categoryScore = Math.min(categories.size * 10, 30);
    const colorScore = Math.min(colors.size * 5, 30);
    const seasonScore = Math.min(seasons.size * 10, 20);
    const quantityScore = Math.min(items.length * 2, 20);

    return Math.min(100, categoryScore + colorScore + seasonScore + quantityScore);
}

function analyzeBudget(items: any[]): any {
    const totalValue = items.reduce((sum, i) => sum + (i.purchasePrice || 0), 0);
    const itemsWithPrice = items.filter(i => i.purchasePrice && i.purchasePrice > 0);
    const avgPrice = itemsWithPrice.length > 0
        ? totalValue / itemsWithPrice.length
        : 0;

    const itemsWithWear = items.filter(i => i.wearCount && i.wearCount > 0 && i.purchasePrice);
    const avgCostPerWear = itemsWithWear.length > 0
        ? itemsWithWear.reduce((sum, i) => sum + (i.purchasePrice / i.wearCount), 0) / itemsWithWear.length
        : 0;

    const suggestions: string[] = [];

    if (avgCostPerWear > 500) {
        suggestions.push("Consider wearing items more often to improve cost-per-wear");
    }
    if (totalValue > 100000 && items.length < 30) {
        suggestions.push("High investment pieces. Maximize by creating more outfit combinations");
    }

    // Find best and worst investments
    const sortedByCPW = itemsWithWear
        .map(i => ({ ...i, cpw: i.purchasePrice / i.wearCount }))
        .sort((a, b) => a.cpw - b.cpw);

    return {
        totalValue,
        avgPrice: Math.round(avgPrice),
        avgCostPerWear: Math.round(avgCostPerWear),
        bestInvestments: sortedByCPW.slice(0, 3).map(i => ({ name: i.name, cpw: Math.round(i.cpw) })),
        worstInvestments: sortedByCPW.slice(-3).reverse().map(i => ({ name: i.name, cpw: Math.round(i.cpw) })),
        suggestions,
    };
}

function getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "fall";
    return "winter";
}
