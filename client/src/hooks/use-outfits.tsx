import { useQuery, useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { Outfit, InsertOutfit, WardrobeItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useOutfits() {
    return useQuery<Outfit[], Error>({
        queryKey: ["/api/outfits"],
    });
}

export function useOutfit(id: number) {
    return useQuery<Outfit, Error>({
        queryKey: ["/api/outfits", id],
        queryFn: async () => {
            const res = await fetch(`/api/outfits/${id}`, {
                credentials: "include",
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch outfit: ${res.statusText}`);
            }
            return res.json();
        },
        enabled: !!id,
    });
}

export function useCreateOutfit() {
    const { toast } = useToast();

    return useMutation({
        mutationFn: (outfit: Omit<InsertOutfit, "userId">) => {
            return apiRequest({
                path: "/api/outfits",
                method: "POST",
                body: outfit
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
            toast({
                title: "Outfit created",
                description: "Your outfit has been created successfully.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to create outfit",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

export function useUpdateOutfit() {
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, ...data }: { id: number } & Partial<InsertOutfit>) => {
            return apiRequest({
                path: `/api/outfits/${id}`,
                method: "PUT",
                body: data
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
            queryClient.invalidateQueries({ queryKey: ["/api/outfits", variables.id] });
            toast({
                title: "Outfit updated",
                description: "Your outfit has been updated successfully.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to update outfit",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

export function useDeleteOutfit() {
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: number) => {
            return apiRequest({
                path: `/api/outfits/${id}`,
                method: "DELETE"
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
            toast({
                title: "Outfit deleted",
                description: "The outfit has been removed successfully.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to delete outfit",
                description: error.message,
                variant: "destructive",
            });
        },
    });
}

// Optimized statistics hook for dashboard - accepts data to avoid redundant API calls
export function useUserStats(
    wardrobeItems: WardrobeItem[] | undefined,
    wardrobeLoading: boolean,
    wardrobeError: Error | null,
    outfits: Outfit[] | undefined,
    outfitsLoading: boolean,
    outfitsError: Error | null
) {
    const isLoading = wardrobeLoading || outfitsLoading;
    const hasError = !!wardrobeError || !!outfitsError;
    const error = wardrobeError || outfitsError;

    const stats = useMemo(() => {
        // Return null if loading or no data available
        if (isLoading || !wardrobeItems || !outfits) {
            return null;
        }

        // Ensure we have arrays before processing with proper type safety
        const wardrobeArray: WardrobeItem[] = Array.isArray(wardrobeItems) ? wardrobeItems : [];
        const outfitsArray: Outfit[] = Array.isArray(outfits) ? outfits : [];

        return {
            totalItems: wardrobeArray.length,
            totalOutfits: outfitsArray.length,
            favoriteOutfits: outfitsArray.filter((outfit: Outfit) => outfit.favorite).length,
            categories: {
                tops: wardrobeArray.filter((item: WardrobeItem) => item.category === "tops").length,
                bottoms: wardrobeArray.filter((item: WardrobeItem) => item.category === "bottoms").length,
                dresses: wardrobeArray.filter((item: WardrobeItem) => item.category === "dresses").length,
                shoes: wardrobeArray.filter((item: WardrobeItem) => item.category === "shoes").length,
                accessories: wardrobeArray.filter((item: WardrobeItem) => item.category === "accessories").length,
                outerwear: wardrobeArray.filter((item: WardrobeItem) => item.category === "outerwear").length,
            },
            recentActivity: {
                recentOutfits: outfitsArray.slice(0, 3),
                recentItems: wardrobeArray.slice(0, 3),
            }
        };
    }, [wardrobeItems, outfits, isLoading]);

    return {
        isLoading,
        hasError,
        error,
        stats
    };
}
