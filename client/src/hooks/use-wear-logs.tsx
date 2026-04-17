/**
 * Wear Logging Hook
 *
 * Provides React Query hooks for wear log management:
 * - Get wear history
 * - Log new wears
 * - Delete wear logs
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

export interface WearLog {
    id: number;
    userId: number;
    outfitId?: number;
    wardrobeItemIds?: number[];
    photoUrl?: string;
    occasion?: string;
    weatherCondition?: string;
    temperature?: number;
    notes?: string;
    rating?: number;
    wornDate: string;
    createdAt: Date;
    // Enriched fields
    outfitDetails?: any;
    itemDetails?: Array<{ id: number; name: string; imageUrl?: string }>;
}

export interface CreateWearLogInput {
    outfitId?: number;
    wardrobeItemIds?: number[];
    photoUrl?: string;
    occasion?: string;
    weatherCondition?: string;
    temperature?: number;
    notes?: string;
    rating?: number;
    wornDate?: string;
}

/**
 * Hook to get all wear logs for current user
 */
export function useWearLogs() {
    return useQuery<WearLog[]>({
        queryKey: ["/api/wear-logs"],
        queryFn: () => apiRequest<WearLog[]>({ method: "GET", path: "/api/wear-logs" }),
    });
}

/**
 * Hook to create a new wear log
 */
export function useCreateWearLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateWearLogInput) =>
            apiRequest<WearLog>({
                method: "POST",
                path: "/api/wear-logs",
                body: data,
            }),
        onSuccess: () => {
            // Invalidate wear logs and wardrobe items (wear count updates)
            queryClient.invalidateQueries({ queryKey: ["/api/wear-logs"] });
            queryClient.invalidateQueries({ queryKey: ["/api/wardrobe-items"] });
        },
    });
}

/**
 * Hook to delete a wear log
 */
export function useDeleteWearLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) =>
            apiRequest<{ success: boolean }>({
                method: "DELETE",
                path: `/api/wear-logs/${id}`,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/wear-logs"] });
        },
    });
}

/**
 * Hook for wear statistics
 */
export function useWearStats() {
    const { data: logs } = useWearLogs();

    if (!logs) return null;

    // Calculate stats
    const now = new Date();
    const thisMonth = logs.filter(l => {
        const date = new Date(l.wornDate);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const lastMonth = logs.filter(l => {
        const date = new Date(l.wornDate);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
    });

    // Most worn items this month
    const itemFrequency: Record<number, number> = {};
    thisMonth.forEach(log => {
        (log.wardrobeItemIds || []).forEach(id => {
            itemFrequency[id] = (itemFrequency[id] || 0) + 1;
        });
    });

    const topItems = Object.entries(itemFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id, count]) => ({ itemId: Number(id), count }));

    // Occasions breakdown
    const occasions: Record<string, number> = {};
    thisMonth.forEach(log => {
        if (log.occasion) {
            occasions[log.occasion] = (occasions[log.occasion] || 0) + 1;
        }
    });

    return {
        totalLogs: logs.length,
        thisMonthCount: thisMonth.length,
        lastMonthCount: lastMonth.length,
        monthlyGrowth: lastMonth.length > 0
            ? Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 100)
            : 0,
        topItems,
        occasions,
        averageRating: thisMonth.filter(l => l.rating).reduce((sum, l) => sum + (l.rating || 0), 0) /
            (thisMonth.filter(l => l.rating).length || 1),
    };
}
