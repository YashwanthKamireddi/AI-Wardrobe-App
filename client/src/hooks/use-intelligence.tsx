/**
 * Wardrobe Intelligence Hook
 *
 * Provides React hooks for wardrobe analytics, outfit recommendations,
 * and style intelligence features.
 */

import { useMemo } from "react";
import { useWardrobeItems } from "./use-wardrobe";
import { useWeather } from "./use-weather";
import {
    analyzeWardrobe,
    generateItemInsight,
    identifyWardrobeGaps,
    predictReplacements,
    scoreOutfitCombination,
    calculateColorHarmony,
    WardrobeAnalytics,
    ItemInsight,
    StyleCompatibility,
} from "@/lib/wardrobe-intelligence";
import {
    generateOutfitRecommendations,
    OutfitRecommendation,
} from "@/lib/outfit-engine";

/**
 * Hook for comprehensive wardrobe analytics
 * Returns CPW, dead stock, category breakdown, etc.
 */
export function useWardrobeAnalytics(): {
    analytics: WardrobeAnalytics | null;
    isLoading: boolean;
} {
    const { data: items, isLoading } = useWardrobeItems();

    const analytics = useMemo(() => {
        if (!items || items.length === 0) return null;
        return analyzeWardrobe(items);
    }, [items]);

    return { analytics, isLoading };
}

/**
 * Hook for individual item insights
 * Returns CPW grade, wear frequency, compatible items
 */
export function useItemInsight(itemId: number | null): {
    insight: ItemInsight | null;
    isLoading: boolean;
} {
    const { data: items, isLoading } = useWardrobeItems();

    const insight = useMemo(() => {
        if (!items || !itemId) return null;
        const item = items.find(i => i.id === itemId);
        if (!item) return null;
        return generateItemInsight(item, items);
    }, [items, itemId]);

    return { insight, isLoading };
}

/**
 * Hook for AI outfit recommendations based on weather and mood
 */
export function useOutfitRecommendations(
    mood: string = "casual",
    count: number = 3
): {
    recommendations: OutfitRecommendation[];
    isLoading: boolean;
    refetch: () => void;
} {
    const { data: items, isLoading: itemsLoading, refetch } = useWardrobeItems();
    const { data: weather, isLoading: weatherLoading } = useWeather();

    const recommendations = useMemo(() => {
        if (!items || items.length < 3) return [];

        // Map weather condition to weather type - fallback to sunny if not available
        const weatherType = (weather as any)?.type || (weather as any)?.condition || "sunny";
        const moodType = mood as any;

        return generateOutfitRecommendations(items, weatherType, moodType, count);
    }, [items, weather, mood, count]);

    return {
        recommendations,
        isLoading: itemsLoading || weatherLoading,
        refetch,
    };
}

/**
 * Hook for wardrobe gap analysis
 * Identifies missing essentials and recommendations
 */
export function useWardrobeGaps(): {
    gaps: Array<{ gap: string; reason: string; priority: string }>;
    isLoading: boolean;
} {
    const { data: items, isLoading } = useWardrobeItems();

    const gaps = useMemo(() => {
        if (!items) return [];
        return identifyWardrobeGaps(items);
    }, [items]);

    return { gaps, isLoading };
}

/**
 * Hook for replacement predictions
 * Identifies items that may need replacing soon
 */
export function useReplacementPredictions(): {
    predictions: Array<{
        item: any;
        wearVelocity: number;
        estimatedLifeRemaining: string;
        replacementUrgency: string;
    }>;
    isLoading: boolean;
} {
    const { data: items, isLoading } = useWardrobeItems();

    const predictions = useMemo(() => {
        if (!items) return [];
        return predictReplacements(items);
    }, [items]);

    return { predictions, isLoading };
}

/**
 * Hook for color harmony analysis between items
 */
export function useColorHarmony(
    itemId1: number | null,
    itemId2: number | null
): StyleCompatibility | null {
    const { data: items } = useWardrobeItems();

    return useMemo(() => {
        if (!items || !itemId1 || !itemId2) return null;
        const item1 = items.find(i => i.id === itemId1);
        const item2 = items.find(i => i.id === itemId2);
        if (!item1 || !item2) return null;
        return calculateColorHarmony(item1, item2);
    }, [items, itemId1, itemId2]);
}

/**
 * Hook for scoring an outfit combination
 */
export function useOutfitScore(itemIds: number[]): {
    score: number;
    colorHarmony: number;
    styleCoherence: number;
    seasonalMatch: number;
    reasoning: string[];
} | null {
    const { data: items } = useWardrobeItems();

    return useMemo(() => {
        if (!items || itemIds.length < 2) return null;
        const outfitItems = itemIds
            .map(id => items.find(i => i.id === id))
            .filter(Boolean) as any[];
        if (outfitItems.length < 2) return null;
        return scoreOutfitCombination(outfitItems);
    }, [items, itemIds]);
}
