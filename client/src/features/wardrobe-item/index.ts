/**
 * Wardrobe Item Feature
 *
 * FSD Feature layer - wardrobe item actions.
 * Add, edit, delete wardrobe items.
 */

// Re-export entity
export * from '@/entities/wardrobe-item';

// Feature-specific types
export interface AddItemFormData {
    name: string;
    category: string;
    color?: string;
    brand?: string;
    size?: string;
    season?: string;
    imageUrl?: string;
    purchasePrice?: number;
    tags?: string[];
    favorite?: boolean;
}

export interface ItemFilters {
    category?: string;
    color?: string;
    season?: string;
    status?: string;
    search?: string;
    favorites?: boolean;
}

export interface ItemSort {
    field: 'name' | 'created_at' | 'wear_count' | 'purchase_price';
    direction: 'asc' | 'desc';
}
