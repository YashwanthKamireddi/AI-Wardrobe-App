/**
 * Outfit Entity
 *
 * FSD Entity layer - domain model for Outfit.
 * Contains model types, hooks, and UI components.
 */

// Re-export types from shared schema
export type { Outfit, InsertOutfit } from '@shared/schema';

// Re-export outfit hooks
export {
    useOutfits,
    useOutfit,
    useCreateOutfit,
    useUpdateOutfit,
    useDeleteOutfit
} from '@/hooks/use-outfits';

// Occasion options for forms
export const OUTFIT_OCCASIONS = [
    { value: 'casual', label: 'Casual' },
    { value: 'work', label: 'Work' },
    { value: 'formal', label: 'Formal' },
    { value: 'date', label: 'Date Night' },
    { value: 'party', label: 'Party' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'workout', label: 'Workout' },
    { value: 'travel', label: 'Travel' },
    { value: 'beach', label: 'Beach' },
    { value: 'other', label: 'Other' },
] as const;

// Weather conditions for outfit recommendations
export const WEATHER_CONDITIONS = [
    { value: 'hot', label: 'Hot (>30°C)' },
    { value: 'warm', label: 'Warm (20-30°C)' },
    { value: 'mild', label: 'Mild (15-20°C)' },
    { value: 'cool', label: 'Cool (10-15°C)' },
    { value: 'cold', label: 'Cold (<10°C)' },
    { value: 'rainy', label: 'Rainy' },
    { value: 'snowy', label: 'Snowy' },
] as const;
