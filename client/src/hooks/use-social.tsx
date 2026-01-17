/**
 * Social Features Hooks
 * React Query hooks for social interactions
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API helper
async function apiRequest<T = unknown>(config: {
    path: string;
    method: string;
    body?: any
}): Promise<T> {
    const options: RequestInit = {
        method: config.method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (config.body) {
        options.body = JSON.stringify(config.body);
    }

    const response = await fetch(config.path, options);

    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Follow a user
 */
export function useFollowUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: number) =>
            apiRequest({ path: `/api/social/follow/${userId}`, method: "POST" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
        },
    });
}

/**
 * Unfollow a user
 */
export function useUnfollowUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: number) =>
            apiRequest({ path: `/api/social/unfollow/${userId}`, method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
        },
    });
}

/**
 * Get community feed
 */
export function useCommunityFeed(limit: number = 20) {
    return useQuery<any[]>({
        queryKey: ["social", "feed", limit],
        queryFn: () => apiRequest({ path: `/api/social/feed?limit=${limit}`, method: "GET" }),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

/**
 * Like an outfit
 */
export function useLikeOutfit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (outfitId: number) =>
            apiRequest({ path: `/api/social/outfits/${outfitId}/like`, method: "POST" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
            queryClient.invalidateQueries({ queryKey: ["outfits"] });
        },
    });
}

/**
 * Unlike an outfit
 */
export function useUnlikeOutfit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (outfitId: number) =>
            apiRequest({ path: `/api/social/outfits/${outfitId}/like`, method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["social", "feed"] });
            queryClient.invalidateQueries({ queryKey: ["outfits"] });
        },
    });
}

/**
 * Share an outfit
 */
export function useShareOutfit() {
    return useMutation({
        mutationFn: ({ outfitId, platform }: { outfitId: number; platform?: string }) =>
            apiRequest({
                path: `/api/social/outfits/${outfitId}/share`,
                method: "POST",
                body: { platform }
            }),
    });
}

/**
 * Get challenges
 */
export function useChallenges() {
    return useQuery<any[]>({
        queryKey: ["social", "challenges"],
        queryFn: () => apiRequest({ path: "/api/social/challenges", method: "GET" }),
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Submit to challenge
 */
export function useSubmitToChallenge() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ challengeId, outfitId }: { challengeId: number; outfitId: number }) =>
            apiRequest({
                path: `/api/social/challenges/${challengeId}/submit`,
                method: "POST",
                body: { outfitId }
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["social", "challenges"] });
        },
    });
}
