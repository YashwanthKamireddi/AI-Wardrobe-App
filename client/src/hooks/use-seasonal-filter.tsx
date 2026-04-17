/**
 * Seasonal Filter Hook
 *
 * Provides React Query hooks for seasonal wardrobe filtering.
 */

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { WardrobeItem } from "@shared/schema";

export interface SeasonalFilterResult {
    items: WardrobeItem[];
    grouped: Record<string, WardrobeItem[]>;
    stats: {
        total: number;
        byCategory: Array<{ category: string; count: number }>;
    };
}

export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all';
export type WeatherCondition = 'hot' | 'sunny' | 'cold' | 'snowy' | 'rainy' | 'mild';

/**
 * Hook to get wardrobe items filtered by season and weather
 */
export function useSeasonalWardrobe(season?: Season, weather?: WeatherCondition) {
    const queryString = new URLSearchParams();
    if (season && season !== 'all') queryString.set('season', season);
    if (weather) queryString.set('weather', weather);

    const queryKey = ["/api/wardrobe/seasonal", { season, weather }];

    return useQuery<SeasonalFilterResult>({
        queryKey,
        queryFn: () => apiRequest<SeasonalFilterResult>({
            method: "GET",
            path: `/api/wardrobe/seasonal?${queryString.toString()}`,
        }),
        enabled: !!season || !!weather, // Only fetch when filter is applied
    });
}

/**
 * Get current season based on date
 */
export function getCurrentSeason(): Season {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
}

/**
 * Get season icon and colors
 */
export function getSeasonStyles(season: Season): { icon: string; colors: string; label: string } {
    switch (season) {
        case 'spring':
            return { icon: '🌸', colors: 'from-pink-400 to-green-300', label: 'Spring' };
        case 'summer':
            return { icon: '☀️', colors: 'from-yellow-400 to-orange-400', label: 'Summer' };
        case 'fall':
            return { icon: '🍂', colors: 'from-orange-400 to-amber-600', label: 'Fall' };
        case 'winter':
            return { icon: '❄️', colors: 'from-blue-300 to-indigo-400', label: 'Winter' };
        default:
            return { icon: '🌍', colors: 'from-gray-400 to-gray-500', label: 'All Seasons' };
    }
}
