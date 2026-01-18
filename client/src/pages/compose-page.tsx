import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Menu,
    Plus,
    X,
    Trash2,
    Save,
    Share2,
    Undo2
} from "lucide-react";

import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AtelierCanvas } from "@/components/compose/atelier-canvas";
import { AtelierPalette } from "@/components/compose/atelier-palette";
import { useToast } from "@/hooks/use-toast";

/**
 * THE ATELIER - STUDIO MODE
 *
 * Design: Infinite-feel Canvas + Bottom Floating Palette
 */

interface OutfitSlot {
    id: string;
    category: string;
    label: string;
    item: any | null;
    zIndex: number;
}

const INITIAL_SLOTS: OutfitSlot[] = [
    { id: "top", category: "tops", label: "Top", item: null, zIndex: 2 },
    { id: "bottom", category: "bottoms", label: "Bottom", item: null, zIndex: 1 },
    { id: "shoes", category: "shoes", label: "Shoes", item: null, zIndex: 3 },
    { id: "outerwear", category: "outerwear", label: "Coat", item: null, zIndex: 4 },
    { id: "accessory", category: "accessories", label: "Accessory", item: null, zIndex: 5 },
];

const CATEGORIES = ["all", "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "bags"];

export function ComposePage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { data: wardrobeItems, isLoading } = useWardrobeItems();

    // State
    const [slots, setSlots] = useState<OutfitSlot[]>(INITIAL_SLOTS);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>("top"); // Default select first slot
    const [outfitName, setOutfitName] = useState("");
    const [isPaletteOpen, setIsPaletteOpen] = useState(true); // Palette visible by default

    const saveOutfitMutation = useMutation({
        mutationFn: async (outfit: any) => {
            const response = await fetch("/api/outfits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(outfit),
            });
            if (!response.ok) throw new Error("Failed to save outfit");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
            toast({
                title: "Masterpiece Created",
                description: "Your outfit has been saved to the collection.",
            });
            setSlots(INITIAL_SLOTS);
            setOutfitName("");
        },
    });

    const handleSelectItem = (item: any) => {
        if (!selectedSlotId) return;

        // Put item in slot
        setSlots(prev => prev.map(slot =>
            slot.id === selectedSlotId ? { ...slot, item } : slot
        ));

        // Auto-advance to next empty slot if available, loop or stop?
        // For studio feel, let's just stay or maybe close palette if full?
        // Let's stay on current slot, but trigger a little success haptic visual
    };

    const handleClearSlot = (slotId: string) => {
        setSlots(prev => prev.map(slot =>
            slot.id === slotId ? { ...slot, item: null } : slot
        ));
    };

    const handleSaveOutfit = () => {
        const items = slots.filter(s => s.item !== null).map(s => s.item);
        if (items.length < 2) {
            toast({
                title: "Incomplete Look",
                description: "Select at least 2 items to save an outfit.",
                variant: "destructive"
            });
            return;
        }

        saveOutfitMutation.mutate({
            name: outfitName || "Untitled Composition",
            itemIds: items.map((i: any) => i.id),
            occasion: "casual", // Default for now
        });
    };

    const handleReset = () => {
        if (confirm("Clear current canvas?")) {
            setSlots(INITIAL_SLOTS);
        }
    };

    return (
        <AppLayout hideMobileNav>
            {/* Full Screen Viewport Fix */}
            <div className="h-[calc(100vh-theme(spacing.16))] md:h-screen w-full flex flex-col bg-[#FDFBF7] relative overflow-hidden">

                {/* STUDIO HEADER */}
                <header className="z-10 px-6 py-4 flex items-center justify-between bg-[#FDFBF7]/80 backdrop-blur-sm border-b border-black/5">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Current Composition..."
                            value={outfitName}
                            onChange={(e) => setOutfitName(e.target.value)}
                            className="bg-transparent border-none text-lg font-playfair font-bold text-[#1A1A1A] placeholder:text-gray-300 focus:outline-none w-full"
                        />
                        <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400">The Atelier</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleReset}
                            className="p-2 text-gray-400 hover:text-[#1A1A1A] transition-colors"
                        >
                            <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleSaveOutfit}
                            className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white shadow-lg shadow-black/20"
                        >
                            <Save className="w-4 h-4" />
                        </motion.button>
                    </div>
                </header>

                {/* MAIN WORKSPACE */}
                <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden">

                    {/* CANVAS AREA - Takes available space */}
                    <div className="flex-1 relative z-0 h-full">
                        <AtelierCanvas
                            slots={slots}
                            selectedSlotId={selectedSlotId}
                            onSelectSlot={(id) => {
                                setSelectedSlotId(id);
                                setIsPaletteOpen(true);
                            }}
                            onClearSlot={handleClearSlot}
                        />
                    </div>

                    {/* PALETTE DRAWER - Bottom on mobile (draggable?), Side on Desktop */}
                    <AnimatePresence>
                        {isPaletteOpen && (
                            <motion.div
                                className="z-20 h-[50vh] md:h-full md:w-[400px] w-full absolute bottom-0 md:relative md:right-0 border-t md:border-t-0 md:border-l border-black/5 shadow-2xl md:shadow-none flex flex-col bg-white"
                                initial={{ y: "100%" }}
                                animate={{ y: "0%" }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            >
                                <AtelierPalette
                                    items={wardrobeItems || []}
                                    isLoading={isLoading}
                                    categories={CATEGORIES}
                                    onSelectItem={handleSelectItem}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AppLayout>
    );
}

export default ComposePage;
