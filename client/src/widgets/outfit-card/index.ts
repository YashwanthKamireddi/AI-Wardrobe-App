/**
 * Outfit Card Widget
 *
 * FSD Widget layer - composite UI for displaying outfits.
 * Used on home page, calendar, and outfit lists.
 */

// Re-export outfit card component (default export)
export { default as OutfitCard } from '@/components/outfit-card';

// Widget props type
export interface OutfitCardWidgetProps {
    outfit: import('@shared/schema').Outfit;
    items: import('@shared/schema').WardrobeItem[];
    showActions?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onWear?: () => void;
    compact?: boolean;
    className?: string;
}
