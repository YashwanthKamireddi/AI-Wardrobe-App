import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Multi-Select Action Toolbar
 * Black toolbar with text-only actions - elegant and minimal
 */

interface MultiSelectToolbarProps {
    selectedCount: number;
    onAddToOutfit: () => void;
    onMarkFavorites: () => void;
    onDelete: () => void;
    onCancel: () => void;
}

export function MultiSelectToolbar({
    selectedCount,
    onAddToOutfit,
    onMarkFavorites,
    onDelete,
    onCancel
}: MultiSelectToolbarProps) {
    return (
        <AnimatePresence>
            {selectedCount > 0 && (
                <motion.div
                    className="fixed bottom-0 left-0 right-0 bg-black text-white p-6 z-50"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        {/* Count */}
                        <p className="text-sm">
                            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-6">
                            <button
                                onClick={onAddToOutfit}
                                className="text-xs tracking-[0.2em] uppercase hover:opacity-60 transition-opacity"
                            >
                                Add to Outfit
                            </button>

                            <button
                                onClick={onMarkFavorites}
                                className="text-xs tracking-[0.2em] uppercase hover:opacity-60 transition-opacity"
                            >
                                Favorite
                            </button>

                            <button
                                onClick={onDelete}
                                className="text-xs tracking-[0.2em] uppercase text-red-400 hover:opacity-60 transition-opacity"
                            >
                                Remove
                            </button>

                            <button
                                onClick={onCancel}
                                className="ml-4 w-8 h-8 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
