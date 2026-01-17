import { useState, useMemo } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    X,
    Layers,
    Grid3X3,
    Heart,
    User,
    Sparkles,
    Check,
    ChevronDown,
    Shirt,
    Camera,
} from "lucide-react";

import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * COMPOSE PAGE - EDITORIAL OUTFIT BUILDER
 *
 * Design: Clean slot-based outfit composition
 * Focus: Visual outfit building with AI assistance
 */

interface OutfitSlot {
    id: string;
    category: string;
    label: string;
    item: any | null;
}

const INITIAL_SLOTS: OutfitSlot[] = [
    { id: "top", category: "tops", label: "Top", item: null },
    { id: "bottom", category: "bottoms", label: "Bottom", item: null },
    { id: "outerwear", category: "outerwear", label: "Outerwear", item: null },
    { id: "shoes", category: "shoes", label: "Shoes", item: null },
    { id: "accessory", category: "accessories", label: "Accessory", item: null },
];

const CATEGORIES = ["all", "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "bags"];

export function ComposePage() {
    const queryClient = useQueryClient();
    const { data: wardrobeItems, isLoading } = useWardrobeItems();
    const [slots, setSlots] = useState<OutfitSlot[]>(INITIAL_SLOTS);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState("all");
    const [outfitName, setOutfitName] = useState("");

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
            setSlots(INITIAL_SLOTS);
            setOutfitName("");
        },
    });

    const filteredItems = useMemo(() => {
        if (!wardrobeItems) return [];
        if (activeCategory === "all" && selectedSlot) {
            const slot = slots.find(s => s.id === selectedSlot);
            if (slot) {
                return wardrobeItems.filter(item => {
                    if (slot.category === "tops") return item.category === "tops";
                    if (slot.category === "bottoms") return ["bottoms", "pants", "skirts", "shorts"].includes(item.category);
                    if (slot.category === "outerwear") return ["outerwear", "jackets", "coats"].includes(item.category);
                    if (slot.category === "shoes") return item.category === "shoes";
                    if (slot.category === "accessories") return ["accessories", "bags", "jewelry", "hats", "scarves"].includes(item.category);
                    return true;
                });
            }
        }
        if (activeCategory === "all") return wardrobeItems;
        return wardrobeItems.filter(item => item.category === activeCategory);
    }, [wardrobeItems, activeCategory, selectedSlot, slots]);

    const filledSlots = slots.filter(s => s.item !== null).length;
    const canSave = filledSlots >= 2 && outfitName.trim().length > 0;

    const handleSelectItem = (item: any) => {
        if (!selectedSlot) return;
        setSlots(prev => prev.map(slot =>
            slot.id === selectedSlot ? { ...slot, item } : slot
        ));
        setSelectedSlot(null);
    };

    const handleClearSlot = (slotId: string) => {
        setSlots(prev => prev.map(slot =>
            slot.id === slotId ? { ...slot, item: null } : slot
        ));
    };

    const handleSaveOutfit = () => {
        if (!canSave) return;
        const itemIds = slots.filter(s => s.item).map(s => s.item!.id);
        saveOutfitMutation.mutate({
            name: outfitName,
            itemIds,
            occasion: "casual",
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <AppLayout>
            {/* Navigation */}

            {/* Navigation */}

            <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 min-h-screen flex flex-col">
                {/* Header - Studio Style */}
                <motion.header
                    className="mb-8 md:mb-12 flex items-end justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <p className="text-xs tracking-[0.25em] uppercase text-[#80163A] mb-3 font-bold">Build & Create</p>
                        <h1 className="text-[#1A1A1A] leading-[0.9]" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 6vw, 4rem)" }}>
                            Outfit <span className="italic font-light">Composer</span>.
                        </h1>
                    </div>
                    <div className="hidden md:block">
                        <p className="text-[#666666] text-sm text-right max-w-xs leading-relaxed">
                            Build your perfect look piece by piece. Select items and create complete outfits.
                        </p>
                    </div>
                </motion.header>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 flex-1">
                    {/* LEFT COLUMN: THE CANVAS (Outfit Slots) */}
                    <motion.section
                        className="lg:col-span-7 flex flex-col"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Outfit Name Input - Minimalist Line */}
                        <div className="mb-8 group">
                            <input
                                type="text"
                                placeholder="Untitled Composition..."
                                value={outfitName}
                                onChange={(e) => setOutfitName(e.target.value)}
                                className="w-full py-2 bg-transparent border-b border-[#E5E5E5] text-2xl text-[#1A1A1A] placeholder-[#D5D5D5] focus:outline-none focus:border-[#1A1A1A] transition-colors font-serif italic"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            />
                        </div>

                        {/* Slots - Mobile: Horizontal Scroll (Story Mode) / Desktop: Polaroid Grid */}
                        <div className="flex-1">
                            {/* Mobile Label */}
                            <p className="md:hidden text-xs uppercase tracking-widest text-[#9A9A9A] mb-4">Swipe to Build</p>

                            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-2 gap-4 overflow-x-auto md:overflow-visible pb-8 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                                {slots.map((slot, i) => (
                                    <motion.div
                                        key={slot.id}
                                        className={`shrink-0 w-[80vw] md:w-auto snap-center relative aspect-[3/4] md:aspect-[4/5] p-3 rounded-none border transition-all cursor-pointer group bg-white shadow-[0_2px_10px_-5px_rgba(0,0,0,0.05)] ${selectedSlot === slot.id
                                            ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A]"
                                            : "border-[#E5E5E5] hover:border-[#9A9A9A]"
                                            }`}
                                        onClick={() => setSelectedSlot(slot.id)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        {/* Slot Label (Polaroid Style) */}
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A] border border-[#E5E5E5]">
                                                {slot.label}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="w-full h-full bg-[#FAFAFA] flex items-center justify-center overflow-hidden relative">
                                            {slot.item ? (
                                                <img
                                                    src={slot.item.imageUrl}
                                                    alt={slot.item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center opacity-30 group-hover:opacity-50 transition-opacity">
                                                    <Plus className="w-8 h-8 mx-auto mb-2 text-[#1A1A1A] stroke-[1]" />
                                                    <span className="text-[10px] uppercase tracking-widest">Add Piece</span>
                                                </div>
                                            )}

                                            {/* Clear Button - Top Right */}
                                            {slot.item && (
                                                <button
                                                    className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white text-[#1A1A1A] transition-colors"
                                                    onClick={(e) => { e.stopPropagation(); handleClearSlot(slot.id); }}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Bottom Action Hint */}
                                        {selectedSlot === slot.id && !slot.item && (
                                            <div className="absolute bottom-4 left-0 right-0 text-center">
                                                <span className="text-[10px] bg-[#1A1A1A] text-white px-3 py-1 rounded-full animate-bounce">
                                                    Select Item
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Action Bar (Sticky Bottom on Mobile) */}
                        <div className="mt-8 flex gap-4 sticky bottom-6 z-20 md:static">
                            <motion.button
                                className="flex-1 py-4 bg-[#1A1A1A] text-white text-xs uppercase tracking-[0.2em] hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl md:shadow-none"
                                disabled={!canSave || saveOutfitMutation.isPending}
                                onClick={handleSaveOutfit}
                                whileTap={{ scale: 0.98 }}
                            >
                                {saveOutfitMutation.isPending ? "Archiving..." : "Save to Collection"}
                            </motion.button>

                            <motion.button
                                className="px-6 py-4 bg-white border border-[#E5E5E5] text-[#1A1A1A] shadow-xl md:shadow-none hover:bg-[#FAFAFA]"
                                whileTap={{ scale: 0.98 }}
                            >
                                <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                            </motion.button>
                        </div>
                    </motion.section>

                    {/* RIGHT COLUMN: THE WARDROBE (Item Picker) */}
                    <motion.section
                        className="lg:col-span-5 hidden md:block"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="sticky top-24 bg-white border border-[#E5E5E5] p-6 h-[calc(100vh-8rem)] flex flex-col shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
                            <h3 className="text-lg font-serif italic text-[#1A1A1A] mb-6 border-b border-[#E5E5E5] pb-4">
                                {selectedSlot ? `Select ${slots.find(s => s.id === selectedSlot)?.label}` : "Wardrobe Archive"}
                            </h3>

                            {/* Category Filter */}
                            <div className="mb-6 flex flex-wrap gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        className={`px-3 py-1.5 text-[10px] uppercase tracking-wider transition-all border ${activeCategory === cat
                                            ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                                            : "bg-transparent border-transparent text-[#9A9A9A] hover:border-[#E5E5E5] hover:text-[#1A1A1A]"
                                            }`}
                                        onClick={() => setActiveCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Items Grid */}
                            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                                {selectedSlot ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {filteredItems.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                className="aspect-[3/4] bg-[#F9F9F9] cursor-pointer group relative overflow-hidden"
                                                onClick={() => handleSelectItem(item)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                    <div className="bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                        <Plus className="w-4 h-4 text-[#1A1A1A]" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {filteredItems.length === 0 && (
                                            <div className="col-span-2 py-12 text-center text-[#9A9A9A]">
                                                <p className="text-xs uppercase tracking-widest">No items found</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-[#9A9A9A] bg-[#FAFAFA] border border-dashed border-[#E5E5E5]">
                                        <Grid3X3 className="w-8 h-8 opacity-20 mb-3" />
                                        <p className="text-xs uppercase tracking-widest opacity-50">Select a slot on the left</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.section>

                    {/* MOBILE DRAWER: Item Picker (Only visible on mobile when slot selected) */}
                    <AnimatePresence>
                        {selectedSlot && (
                            <motion.div
                                className="md:hidden fixed inset-0 z-50 bg-white flex flex-col"
                                initial={{ y: "100%" }}
                                animate={{ y: "0%" }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            >
                                <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between bg-white px-safe">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-[#9A9A9A]">Select Item</p>
                                        <h3 className="font-serif italic text-xl text-[#1A1A1A]">
                                            {slots.find(s => s.id === selectedSlot)?.label}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setSelectedSlot(null)}
                                        className="p-2 bg-[#F5F5F5] rounded-full"
                                    >
                                        <ChevronDown className="w-5 h-5 text-[#1A1A1A]" />
                                    </button>
                                </div>

                                <div className="p-4 overflow-x-auto whitespace-nowrap border-b border-[#E5E5E5] bg-[#FAFAFA]">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat}
                                            className={`inline-block px-4 py-2 mr-2 rounded-full text-[10px] uppercase tracking-wider transition-all border ${activeCategory === cat
                                                ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                                                : "bg-white border-[#E5E5E5] text-[#6B6B6B]"
                                                }`}
                                            onClick={() => setActiveCategory(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 pb-safe bg-white">
                                    <div className="grid grid-cols-2 gap-3">
                                        {filteredItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="aspect-[3/4] bg-[#F9F9F9] cursor-pointer relative"
                                                onClick={() => handleSelectItem(item)}
                                            >
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
        </AppLayout>
    );
}

export default ComposePage;
