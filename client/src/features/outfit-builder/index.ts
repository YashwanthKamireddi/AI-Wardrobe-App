/**
 * Outfit Builder Feature
 *
 * FSD Feature layer - outfit composition actions.
 * Create, edit, compose outfits from wardrobe items.
 */

// Re-export entity
export * from '@/entities/outfit';

// Feature-specific types
export interface OutfitBuilderState {
    selectedItems: number[];
    name: string;
    occasion?: string;
    season?: string;
    notes?: string;
}

export interface OutfitRecommendation {
    items: number[];
    score: number;
    reason: string;
    occasion?: string;
    weather?: string;
}

// AI Outfit request types
export interface AIOutfitRequest {
    occasion?: string;
    weather?: {
        temperature: number;
        condition: string;
    };
    mood?: string;
    colorPreference?: string;
    excludeItems?: number[];
}

export interface AIOutfitResponse {
    success: boolean;
    outfit: OutfitRecommendation;
    alternatives?: OutfitRecommendation[];
}
