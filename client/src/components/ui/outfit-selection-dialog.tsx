import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOutfits } from '@/hooks/use-outfits';
import { motion } from 'framer-motion';
import { Plus, Layers } from 'lucide-react';

/**
 * Outfit Selection Dialog
 * Allows user to either add items to existing outfit or create new one
 */

interface OutfitSelectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (outfitId?: number, outfitName?: string) => void;
    selectedCount: number;
}

export function OutfitSelectionDialog({
    isOpen,
    onClose,
    onSelect,
    selectedCount
}: OutfitSelectionDialogProps) {
    const { data: outfits } = useOutfits();
    const [newOutfitName, setNewOutfitName] = useState('');
    const [mode, setMode] = useState<'select' | 'create'>('select');

    const handleSelect = (outfitId: number) => {
        onSelect(outfitId);
        onClose();
    };

    const handleCreate = () => {
        if (!newOutfitName.trim()) return;
        onSelect(undefined, newOutfitName);
        setNewOutfitName('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#F9F9F7] border-0 rounded-3xl">
                <DialogHeader>
                    <DialogTitle
                        className="text-2xl"
                        style={{
                            fontFamily: "'Playfair Display', serif"
                        }}
                    >
                        Add {selectedCount} Item{selectedCount > 1 ? 's' : ''} to Outfit
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    {/* Mode Tabs */}
                    <div className="flex gap-2 p-1 bg-[#EDEDE9] rounded-xl">
                        <button
                            onClick={() => setMode('select')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'select'
                                    ? 'bg-white shadow-sm text-[#1A1A1A]'
                                    : 'text-[#6B6B6B]'
                                }`}
                        >
                            Existing Outfit
                        </button>
                        <button
                            onClick={() => setMode('create')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'create'
                                    ? 'bg-white shadow-sm text-[#1A1A1A]'
                                    : 'text-[#6B6B6B]'
                                }`}
                        >
                            New Outfit
                        </button>
                    </div>

                    {mode === 'select' ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {outfits && outfits.length > 0 ? (
                                outfits.map((outfit) => (
                                    <motion.button
                                        key={outfit.id}
                                        onClick={() => handleSelect(outfit.id)}
                                        className="w-full p-4 bg-white rounded-xl border border-[#E5E5E5] hover:border-[#1A1A1A] transition-colors text-left flex items-center gap-3"
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Layers className="w-5 h-5 text-[#6B6B6B]" />
                                        <div>
                                            <p className="font-medium text-[#1A1A1A]">{outfit.name}</p>
                                            <p className="text-xs text-[#6B6B6B]">
                                                {outfit.items?.length || 0} items
                                            </p>
                                        </div>
                                    </motion.button>
                                ))
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-sm text-[#6B6B6B]">
                                        No outfits yet. Create your first one!
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Input
                                placeholder="Enter outfit name..."
                                value={newOutfitName}
                                onChange={(e) => setNewOutfitName(e.target.value)}
                                className="h-12 bg-white border-[#E5E5E5]"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCreate();
                                    }
                                }}
                            />
                            <Button
                                onClick={handleCreate}
                                disabled={!newOutfitName.trim()}
                                className="w-full h-12 bg-[#1A1A1A] hover:bg-[#80163A] text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Outfit
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
