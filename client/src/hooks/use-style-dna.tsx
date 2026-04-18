import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface StyleDnaProfile {
    archetype: 'minimalist' | 'curator' | 'classicist' | 'expressionist' | 'naturalist';
    styleScore: number;
    colorHarmony: number;
    versatilityScore: number;
    maturityScore: number;
    dominantColors: string[];
    categoryBreakdown: Record<string, number>;
    traits: string[];
    totalItems: number;
    computedAt: string | Date;
    stale?: boolean;
}

export function useStyleDna() {
    return useQuery<StyleDnaProfile>({
        queryKey: ["style-dna"],
        queryFn: () => apiRequest({ path: "/api/style-dna", method: "GET" }),
        staleTime: 1000 * 60 * 10,
    });
}

export function useRefreshStyleDna() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => apiRequest({ path: "/api/style-dna/refresh", method: "POST" }),
        onSuccess: (data) => {
            qc.setQueryData(["style-dna"], data);
        },
    });
}
