/**
 * Wardrobe Item Entity
 *
 * FSD Entity layer - domain model for WardrobeItem.
 * Contains model types, hooks, and UI components.
 */

// Re-export types from shared schema
export type { WardrobeItem, InsertWardrobeItem } from '@shared/schema';

// Re-export wardrobe hooks (only those that exist)
export {
    useWardrobeItems,
    useWardrobeItem,
} from '@/hooks/use-wardrobe';

// Category options for forms
export const WARDROBE_CATEGORIES = [
    { value: 'tops', label: 'Tops' },
    { value: 'bottoms', label: 'Bottoms' },
    { value: 'dresses', label: 'Dresses' },
    { value: 'outerwear', label: 'Outerwear' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'bags', label: 'Bags' },
    { value: 'activewear', label: 'Activewear' },
    { value: 'swimwear', label: 'Swimwear' },
    { value: 'formal', label: 'Formal' },
    { value: 'loungewear', label: 'Loungewear' },
    { value: 'other', label: 'Other' },
] as const;

export const SEASONS = [
    { value: 'all', label: 'All Seasons' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'fall', label: 'Fall' },
    { value: 'winter', label: 'Winter' },
] as const;

export const ITEM_STATUSES = [
    { value: 'available', label: 'Available' },
    { value: 'in_laundry', label: 'In Laundry' },
    { value: 'at_cleaners', label: 'At Cleaners' },
    { value: 'in_storage', label: 'In Storage' },
    { value: 'lent_out', label: 'Lent Out' },
    { value: 'archived', label: 'Archived' },
] as const;
