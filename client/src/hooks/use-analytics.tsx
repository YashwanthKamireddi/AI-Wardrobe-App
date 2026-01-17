/**
 * Analytics Hooks
 *
 * React Query hooks for fetching analytics and statistics data
 */

import { useQuery } from "@tanstack/react-query";

// API request helper
async function apiRequest<T = unknown>(config: { path: string; method: string }): Promise<T> {
    const response = await fetch(config.path, {
        method: config.method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
}

// Types for analytics data
export interface WardrobeStats {
    totalItems: number;
    totalOutfits: number;
    totalValue: number;
    categoryBreakdown: Record<string, number>;
    colorBreakdown: Record<string, number>;
    brandBreakdown: Record<string, number>;
    seasonBreakdown: Record<string, number>;
    wornItems: number;
    unwornItems: number;
    percentWorn: number;
    statusBreakdown: Record<string, number>;
}

export interface CostPerWearItem {
    id: number;
    name: string;
    imageUrl: string;
    category: string;
    purchasePrice: number;
    wearCount: number;
    costPerWear: number;
}

export interface WornItem {
    id: number;
    name: string;
    imageUrl: string;
    category: string;
    wearCount: number;
    lastWorn: string | null;
}

export interface NeverWornItem {
    id: number;
    name: string;
    imageUrl: string;
    category: string;
    purchaseDate: string | null;
    purchasePrice: number | null;
}

export interface StylePatterns {
    goToItems: Array<{
        id: number;
        name: string;
        imageUrl: string;
        wearCount: number;
    }>;
    avgWearCount: number;
    mostVersatileCategory: string | null;
    categoryUsage: Record<string, number>;
}

/**
 * Hook to fetch wardrobe statistics
 */
export function useWardrobeStats() {
    return useQuery<WardrobeStats>({
        queryKey: ["analytics", "wardrobe-stats"],
        queryFn: () => apiRequest({ path: "/api/analytics/wardrobe-stats", method: "GET" }),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to fetch cost-per-wear data
 */
export function useCostPerWear() {
    return useQuery<CostPerWearItem[]>({
        queryKey: ["analytics", "cost-per-wear"],
        queryFn: () => apiRequest({ path: "/api/analytics/cost-per-wear", method: "GET" }),
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook to fetch most worn items
 */
export function useMostWorn(limit: number = 10) {
    return useQuery<WornItem[]>({
        queryKey: ["analytics", "most-worn", limit],
        queryFn: () => apiRequest({ path: `/api/analytics/most-worn?limit=${limit}`, method: "GET" }),
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook to fetch least worn items
 */
export function useLeastWorn(limit: number = 10) {
    return useQuery<WornItem[]>({
        queryKey: ["analytics", "least-worn", limit],
        queryFn: () => apiRequest({ path: `/api/analytics/least-worn?limit=${limit}`, method: "GET" }),
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook to fetch never worn items
 */
export function useNeverWorn() {
    return useQuery<NeverWornItem[]>({
        queryKey: ["analytics", "never-worn"],
        queryFn: () => apiRequest({ path: "/api/analytics/never-worn", method: "GET" }),
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook to fetch style patterns
 */
export function useStylePatterns() {
    return useQuery<StylePatterns>({
        queryKey: ["analytics", "style-patterns"],
        queryFn: () => apiRequest({ path: "/api/analytics/style-patterns", method: "GET" }),
        staleTime: 1000 * 60 * 5,
    });
}
