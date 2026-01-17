/**
 * Advanced Features Hooks
 * Capsule wardrobes, wishlist, and style profile
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    if (!response.ok) throw new Error(`API failed: ${response.statusText}`);
    return response.json();
}

// Capsule Wardrobes
export function useCapsules() {
    return useQuery<any[]>({
        queryKey: ["capsules"],
        queryFn: () => apiRequest({ path: "/api/capsules", method: "GET" }),
    });
}

export function useCreateCapsule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiRequest({ path: "/api/capsules", method: "POST", body: data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["capsules"] }),
    });
}

export function useUpdateCapsule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: any) =>
            apiRequest({ path: `/api/capsules/${id}`, method: "PUT", body: data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["capsules"] }),
    });
}

export function useDeleteCapsule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => apiRequest({ path: `/api/capsules/${id}`, method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["capsules"] }),
    });
}

// Shopping Wishlist
export function useWishlist() {
    return useQuery<any[]>({
        queryKey: ["wishlist"],
        queryFn: () => apiRequest({ path: "/api/wishlist", method: "GET" }),
    });
}

export function useAddToWishlist() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => apiRequest({ path: "/api/wishlist", method: "POST", body: data }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
    });
}

export function useRemoveFromWishlist() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => apiRequest({ path: `/api/wishlist/${id}`, method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
    });
}

// Style Profile
export function useStyleProfile() {
    return useQuery<any>({
        queryKey: ["style-profile"],
        queryFn: () => apiRequest({ path: "/api/style-profile", method: "GET" }),
    });
}

export function useSubmitStyleQuiz() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (quizData: any) =>
            apiRequest({ path: "/api/style-quiz", method: "POST", body: quizData }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["style-profile"] }),
    });
}

// Outfit Randomizer
export function useRandomOutfit() {
    return useMutation({
        mutationFn: (params?: { occasion?: string; season?: string }) => {
            const query = new URLSearchParams(params as any).toString();
            return apiRequest({ path: `/api/outfits/random?${query}`, method: "POST" });
        },
    });
}

// Item Outfit Possibilities
export function useItemPossibilities(itemId: number | null) {
    return useQuery({
        queryKey: ["item-possibilities", itemId],
        queryFn: () => apiRequest({ path: `/api/outfits/items/${itemId}/possibilities`, method: "GET" }),
        enabled: !!itemId,
    });
}
