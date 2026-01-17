import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for multi-select wardrobe operations
 * Handles batch delete, favorites, and add to outfit with backend integration
 */

export function useMultiSelectWardrobe() {
    const [selectedItems, setSelectedItems] = useState(new Set<number>());
    const [selectionMode, setSelectionMode] = useState(false);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const toggleSelection = (itemId: number) => {
        setSelectedItems(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            // Exit selection mode if no items are selected
            if (next.size === 0) {
                setSelectionMode(false);
            } else if (!selectionMode) {
                setSelectionMode(true);
            }
            return next;
        });
    };

    const clearSelection = () => {
        setSelectedItems(new Set());
        setSelectionMode(false);
    };

    const handleBatchDelete = async () => {
        if (selectedItems.size === 0) return;

        // Confirm deletion
        const confirmed = window.confirm(
            `Are you sure you want to delete ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''}? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            const response = await fetch('/api/wardrobe/batch-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    itemIds: Array.from(selectedItems)
                })
            });

            if (!response.ok) throw new Error('Batch delete failed');

            const result = await response.json();

            // Invalidate wardrobe query to refetch
            await queryClient.invalidateQueries({ queryKey: ['/api/wardrobe'] });

            toast({
                title: 'Items Deleted',
                description: result.message,
            });

            clearSelection();
        } catch (error) {
            toast({
                title: 'Delete Failed',
                description: 'Failed to delete items. Please try again.',
                variant: 'destructive'
            });
        }
    };

    const handleBatchFavorites = async () => {
        if (selectedItems.size === 0) return;

        try {
            const response = await fetch('/api/wardrobe/batch-favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    itemIds: Array.from(selectedItems),
                    favorite: true
                })
            });

            if (!response.ok) throw new Error('Batch favorites failed');

            const result = await response.json();

            // Invalidate wardrobe query to refetch
            await queryClient.invalidateQueries({ queryKey: ['/api/wardrobe'] });

            toast({
                title: 'Items Marked as Favorites',
                description: result.message,
            });

            clearSelection();
        } catch (error) {
            toast({
                title: 'Operation Failed',
                description: 'Failed to mark items as favorites. Please try again.',
                variant: 'destructive'
            });
        }
    };

    const handleAddToOutfit = async (outfitId?: number, outfitName?: string) => {
        if (selectedItems.size === 0) return;

        try {
            const response = await fetch('/api/outfits/add-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    itemIds: Array.from(selectedItems),
                    outfitId,
                    outfitName
                })
            });

            if (!response.ok) throw new Error('Add to outfit failed');

            const result = await response.json();

            // Invalidate outfits query to refetch
            await queryClient.invalidateQueries({ queryKey: ['/api/outfits'] });

            toast({
                title: outfitId ? 'Added to Outfit' : 'Outfit Created',
                description: `Successfully ${outfitId ? 'added items to' : 'created'} outfit`,
            });

            clearSelection();
        } catch (error) {
            toast({
                title: 'Operation Failed',
                description: 'Failed to add items to outfit. Please try again.',
                variant: 'destructive'
            });
        }
    };

    return {
        selectedItems,
        selectionMode,
        selectedCount: selectedItems.size,
        toggleSelection,
        clearSelection,
        handleBatchDelete,
        handleBatchFavorites,
        handleAddToOutfit,
    };
}
