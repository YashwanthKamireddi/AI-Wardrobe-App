import { useState, useMemo, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import {
    Plus, Search, Layers, Heart, Trash2, ArrowUpRight, Sun, Sparkles, X,
    Wand2, Shirt, Grid3X3, Save, RotateCcw, Palette
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useOutfits, useDeleteOutfit } from "@/hooks/use-outfits";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

/**
 * OUTFITS PAGE - "THE LOOKBOOK" (V3.0 - Integrated)
 *
 * Design Philosophy: Fashion House Lookbook with inline creation.
 * - Mobile-first, native app feel
 * - Editorial typography (Playfair Display)
 * - Integrated outfit creation from Compose
 */

const CATEGORIES = [
    { id: "all", label: "All" },
    { id: "tops", label: "Tops" },
    { id: "bottoms", label: "Bottoms" },
    { id: "dresses", label: "Dresses" },
    { id: "outerwear", label: "Layers" },
    { id: "shoes", label: "Shoes" },
    { id: "accessories", label: "Accents" },
];

export function OutfitPage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [, navigate] = useLocation();

    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [selectedTab, setSelectedTab] = useState<string>('all');

    // Create modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [outfitName, setOutfitName] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    const { data: outfits, isLoading: outfitsLoading } = useOutfits();
    const { data: wardrobeItems, isLoading: wardrobeLoading } = useWardrobeItems();
    const deleteOutfit = useDeleteOutfit();

    // Filter outfits
    const filteredOutfits = useMemo(() => {
        if (!outfits) return [];
        return outfits.filter(outfit => {
            const matchesSearch =
                outfit.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                outfit.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTab =
                selectedTab === 'all' ||
                (selectedTab === 'favorites' && outfit.favorite);
            return matchesSearch && matchesTab;
        });
    }, [outfits, searchQuery, selectedTab]);

    // Filter wardrobe items for picker
    const filteredWardrobeItems = useMemo(() => {
        if (!wardrobeItems) return [];
        return wardrobeItems.filter(item => {
            const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
            return matchesCategory;
        });
    }, [wardrobeItems, activeCategory]);

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await deleteOutfit.mutateAsync(id);
            toast({ title: "Deleted", description: `"${name}" has been removed.` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete outfit.", variant: "destructive" });
        }
    };

    const getItemImage = (itemId: number) => {
        const item = wardrobeItems?.find(i => i.id === itemId);
        return item?.imageUrl;
    };

    // Save outfit mutation
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
                title: "Look Saved",
                description: "Your outfit is now in your collection.",
            });
            handleResetCreate();
            setShowCreateModal(false);
        },
        onError: () => {
            toast({
                title: "Couldn't save",
                description: "Please try again.",
                variant: "destructive",
            });
        },
    });

    const toggleItem = useCallback((item: any) => {
        setSelectedItems(prev => {
            const exists = prev.find(i => i.id === item.id);
            if (exists) {
                return prev.filter(i => i.id !== item.id);
            }
            return [...prev, item];
        });
    }, []);

    const handleResetCreate = () => {
        setSelectedItems([]);
        setOutfitName("");
        setActiveCategory("all");
    };

    const handleSaveOutfit = () => {
        if (selectedItems.length < 2) {
            toast({
                title: "Add more items",
                description: "An outfit needs at least 2 pieces.",
                variant: "destructive",
            });
            return;
        }

        const name = outfitName.trim() || `Look #${Date.now().toString(36).slice(-4).toUpperCase()}`;

        saveOutfitMutation.mutate({
            name,
            items: selectedItems.map(i => i.id),
            occasion: "casual",
        });
    };

    // Loading State
    if (outfitsLoading) {
        return (
            <AppLayout>
                <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#80163A]" />
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Loading Lookbook...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#FDFBF7]">

                {/* ========================================== */}
                {/* MOBILE HEADER - Sticky */}
                {/* ========================================== */}
                <motion.header
                    className="md:hidden sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-black/5"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="px-4 h-14 flex items-center justify-between">
                        <div>
                            <h1 className="text-[#1A1A1A] font-playfair text-lg font-bold leading-none">Outfits</h1>
                            <span className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">
                                {filteredOutfits.length} LOOKS
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center text-[#1A1A1A]"
                            >
                                {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                            </button>
                            <motion.button
                                onClick={() => setShowCreateModal(true)}
                                className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white"
                                whileTap={{ scale: 0.9 }}
                            >
                                <Plus className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <AnimatePresence>
                        {showSearch && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-black/5"
                            >
                                <div className="p-3">
                                    <input
                                        type="text"
                                        placeholder="Search looks..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-10 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1A1A1A]"
                                        autoFocus
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Mobile Tab Filter */}
                    <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
                        {['all', 'favorites'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all",
                                    selectedTab === tab
                                        ? "bg-[#1A1A1A] text-white"
                                        : "bg-white border border-gray-200 text-gray-500"
                                )}
                            >
                                {tab === 'favorites' && <Heart className="w-3 h-3 inline mr-1" />}
                                {tab}
                            </button>
                        ))}
                    </div>
                </motion.header>

                {/* ========================================== */}
                {/* DESKTOP HEADER */}
                {/* ========================================== */}
                <div className="hidden md:block max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-20">
                    <motion.header
                        className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16 relative"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="absolute top-0 right-0 -z-10 opacity-5">
                            <h1 className="text-9xl font-bold uppercase tracking-tighter text-[#1A1A1A]">Looks</h1>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-4 border-b border-[#80163A] pb-2 inline-flex">
                                <Layers className="w-4 h-4 text-[#80163A]" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#80163A]">Your Collection</span>
                            </div>
                            <h1
                                className="text-[#1A1A1A] leading-[0.9]"
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: "clamp(3rem, 7vw, 6rem)",
                                }}
                            >
                                The <span className="italic font-light text-[#6B6B6B]">Lookbook</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search looks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-64 h-12 pl-11 pr-4 bg-white border border-gray-200 rounded-none text-sm focus:outline-none focus:border-[#1A1A1A]"
                                />
                            </div>
                            <div className="h-12 w-px bg-gray-200"></div>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="rounded-none bg-[#1A1A1A] text-white px-8 h-14 hover:bg-[#80163A] transition-all uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl"
                            >
                                <Plus className="w-4 h-4" />
                                Create New Look
                            </Button>
                        </div>
                    </motion.header>

                    {/* Desktop Tab Filters */}
                    <div className="flex gap-3 mb-12">
                        {['all', 'favorites'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={cn(
                                    "px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all border",
                                    selectedTab === tab
                                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                                        : "bg-transparent border-gray-200 text-gray-500 hover:border-[#1A1A1A]"
                                )}
                            >
                                {tab === 'favorites' && <Heart className="w-3 h-3 inline mr-2" />}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ========================================== */}
                {/* OUTFIT GRID */}
                {/* ========================================== */}
                <div className="px-0 md:px-12 md:max-w-[1400px] md:mx-auto pb-24 md:pb-12">

                    {/* Desktop Grid */}
                    {filteredOutfits.length > 0 && (
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                            {/* Blueprint Card */}
                            <motion.button
                                onClick={() => setShowCreateModal(true)}
                                className="group relative aspect-[3/4] border border-dashed border-[#1A1A1A]/20 hover:border-[#80163A] bg-[#FAF9F6] transition-all flex flex-col items-center justify-center gap-6 overflow-hidden cursor-pointer"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="absolute inset-0 opacity-[0.03]"
                                    style={{ backgroundImage: 'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                                </div>
                                <div className="w-20 h-20 rounded-full border border-[#1A1A1A] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 bg-white z-10">
                                    <Plus className="w-8 h-8 text-[#1A1A1A]" strokeWidth={1} />
                                </div>
                                <div className="text-center z-10">
                                    <p className="text-lg font-playfair italic text-[#1A1A1A] mb-2">New Look</p>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Compose an outfit</p>
                                </div>
                            </motion.button>

                            {/* Outfit Cards */}
                            {filteredOutfits.map((outfit, index) => (
                                <OutfitCard
                                    key={outfit.id}
                                    outfit={outfit}
                                    index={index + 1}
                                    getItemImage={getItemImage}
                                    onDelete={() => handleDelete(outfit.id, outfit.name)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Mobile Grid */}
                    <div className="md:hidden">
                        {filteredOutfits.length > 0 ? (
                            <div className="grid grid-cols-2 gap-[1px] bg-gray-200">
                                {filteredOutfits.map((outfit, index) => (
                                    <MobileOutfitCard
                                        key={outfit.id}
                                        outfit={outfit}
                                        index={index + 1}
                                        getItemImage={getItemImage}
                                        onDelete={() => handleDelete(outfit.id, outfit.name)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState onCreateNew={() => setShowCreateModal(true)} />
                        )}
                    </div>

                    {/* Desktop Empty State */}
                    {filteredOutfits.length === 0 && (
                        <div className="hidden md:block">
                            <EmptyState onCreateNew={() => setShowCreateModal(true)} searchQuery={searchQuery} />
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================== */}
            {/* CREATE OUTFIT MODAL */}
            {/* ========================================== */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden bg-[#FDFBF7] border-none p-0">
                    <div className="h-full flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-black/5 bg-[#FDFBF7]">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-playfair">
                                    <span className="text-[10px] tracking-[0.3em] uppercase text-[#80163A] font-medium block mb-1">The Atelier</span>
                                    Compose <span className="italic font-light">Your Look</span>
                                </DialogTitle>
                            </DialogHeader>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Outfit Name Input */}
                            <div className="mb-6">
                                <input
                                    type="text"
                                    placeholder="Name your look..."
                                    value={outfitName}
                                    onChange={(e) => setOutfitName(e.target.value)}
                                    className="w-full text-lg font-medium bg-transparent border-0 border-b border-black/10 focus:border-[#80163A] focus:outline-none py-2 placeholder:text-gray-300 text-[#1A1A1A] font-playfair"
                                />
                            </div>

                            {/* Selected Items Canvas */}
                            <div className="bg-white rounded-2xl border border-black/5 p-4 mb-6 min-h-[150px]">
                                {selectedItems.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                        <div className="w-12 h-12 rounded-full bg-[#FAF9F6] flex items-center justify-center mb-3">
                                            <Palette className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <h3 className="text-md text-[#1A1A1A] mb-1 font-playfair">Your Canvas Awaits</h3>
                                        <p className="text-xs text-gray-400 max-w-xs">Select pieces below to build your outfit</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                                                {selectedItems.length} piece{selectedItems.length > 1 ? 's' : ''}
                                            </span>
                                            <button
                                                onClick={handleResetCreate}
                                                className="text-[10px] text-gray-400 hover:text-[#1A1A1A] flex items-center gap-1"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                                Clear
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {selectedItems.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="relative group aspect-square rounded-xl overflow-hidden bg-[#FAF9F6] border border-black/5"
                                                >
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Shirt className="w-5 h-5 text-gray-200" />
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => toggleItem(item)}
                                                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Category Filters */}
                            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all",
                                            activeCategory === cat.id
                                                ? "bg-[#1A1A1A] text-white"
                                                : "bg-white border border-gray-200 text-gray-500"
                                        )}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Wardrobe Items Grid */}
                            <div className="grid grid-cols-4 gap-2">
                                {wardrobeLoading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />
                                    ))
                                ) : filteredWardrobeItems.length > 0 ? (
                                    filteredWardrobeItems.map((item) => {
                                        const isSelected = selectedItems.some(i => i.id === item.id);
                                        return (
                                            <motion.button
                                                key={item.id}
                                                onClick={() => toggleItem(item)}
                                                className={cn(
                                                    "relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all",
                                                    isSelected
                                                        ? "border-[#80163A] ring-2 ring-[#80163A]/20"
                                                        : "border-transparent bg-[#FAF9F6]"
                                                )}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                        <Shirt className="w-5 h-5 text-gray-300" />
                                                    </div>
                                                )}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-[#80163A]/20 flex items-center justify-center">
                                                        <div className="w-5 h-5 rounded-full bg-[#80163A] flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.button>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-4 py-8 text-center">
                                        <Shirt className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                        <p className="text-xs text-gray-400">No items in this category</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-black/5 bg-white">
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveOutfit}
                                    disabled={selectedItems.length < 2 || saveOutfitMutation.isPending}
                                    className="flex-1 bg-[#1A1A1A] hover:bg-[#80163A]"
                                >
                                    {saveOutfitMutation.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Save className="w-4 h-4" />
                                            Save Look
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

// ============================================================
// MOBILE OUTFIT CARD
// ============================================================
interface OutfitCardProps {
    outfit: any;
    index: number;
    getItemImage: (id: number) => string | undefined;
    onDelete: () => void;
}

function MobileOutfitCard({ outfit, index, getItemImage, onDelete }: OutfitCardProps) {
    const items = Array.isArray(outfit.items) ? outfit.items : [];

    return (
        <motion.div
            className="bg-white aspect-[3/4] relative overflow-hidden active:opacity-90 transition-opacity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
        >
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[1px] bg-[#1A1A1A]">
                {items.slice(0, 4).map((itemId: number, i: number) => {
                    const imageUrl = getItemImage(itemId);
                    return (
                        <div key={i} className="bg-white relative overflow-hidden">
                            {imageUrl ? (
                                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#FAFAFA]">
                                    <Sparkles className="w-4 h-4 text-gray-200" />
                                </div>
                            )}
                        </div>
                    );
                })}
                {Array.from({ length: Math.max(0, 4 - items.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-[#FAFAFA] flex items-center justify-center">
                        <Plus className="w-3 h-3 text-gray-200" />
                    </div>
                ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
                <p className="text-white text-sm font-playfair italic truncate drop-shadow-sm">{outfit.name}</p>
                <p className="text-white/70 text-[10px] font-mono uppercase tracking-wider">{items.length} items</p>
            </div>

            {outfit.favorite && (
                <div className="absolute top-2 right-2">
                    <Heart className="w-4 h-4 text-white fill-[#80163A] drop-shadow-lg" />
                </div>
            )}

            <div className="absolute top-2 left-2 text-white/30 font-playfair text-2xl font-light">
                0{index}
            </div>
        </motion.div>
    );
}

// ============================================================
// DESKTOP OUTFIT CARD
// ============================================================
function OutfitCard({ outfit, index, getItemImage, onDelete }: OutfitCardProps) {
    const [showActions, setShowActions] = useState(false);
    const items = Array.isArray(outfit.items) ? outfit.items : [];

    return (
        <motion.div
            className="group cursor-pointer relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className="relative aspect-[3/4] bg-[#E5E5E5] overflow-hidden mb-6">
                {items.length > 0 ? (
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[1px] bg-[#1A1A1A]">
                        {items.slice(0, 4).map((itemId: number, i: number) => {
                            const imageUrl = getItemImage(itemId);
                            return (
                                <div key={i} className="relative overflow-hidden bg-white">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#FAFAFA]">
                                            <Sparkles className="w-6 h-6 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {Array.from({ length: Math.max(0, 4 - items.length) }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-[#FAFAFA] flex items-center justify-center">
                                <Plus className="w-4 h-4 text-gray-200" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300 flex flex-col items-center justify-center">
                        <Sparkles className="w-12 h-12 text-white opacity-50 mb-4" />
                        <span className="text-[10px] uppercase tracking-widest text-white/50">No Items</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                        variant="outline"
                        className="border-white text-white hover:bg-white hover:text-black uppercase tracking-widest text-xs h-12 px-8 bg-transparent"
                    >
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        View Details
                    </Button>
                </div>

                {outfit.occasion && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                        <Sun className="w-3 h-3 text-[#D4AF37]" />
                        {outfit.occasion}
                    </div>
                )}

                {showActions && (
                    <div className="absolute top-4 left-4 flex gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="w-8 h-8 bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="border-t border-[#1A1A1A] pt-4">
                <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-2xl text-[#1A1A1A] font-playfair italic group-hover:text-[#80163A] transition-colors">
                        {outfit.name}
                    </h3>
                    <span className="text-4xl font-light text-gray-200 font-playfair">0{index}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 font-mono uppercase tracking-widest">
                    <span>{items.length} Items</span>
                    {outfit.favorite && (
                        <span className="flex items-center gap-1 text-[#80163A]">
                            <Heart className="w-3 h-3 fill-current" /> Favorite
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ============================================================
// EMPTY STATE
// ============================================================
function EmptyState({ onCreateNew, searchQuery }: { onCreateNew: () => void; searchQuery?: string }) {
    return (
        <motion.div
            className="py-24 md:py-32 text-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <Layers className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl md:text-3xl text-[#1A1A1A] mb-3 font-playfair italic">
                {searchQuery ? 'No looks found' : 'Your Lookbook Awaits'}
            </h3>
            <p className="text-gray-500 text-sm md:text-base mb-8 max-w-sm mx-auto">
                {searchQuery
                    ? 'Try adjusting your search terms.'
                    : 'Create your first outfit to start building your collection.'}
            </p>
            {!searchQuery && (
                <Button
                    onClick={onCreateNew}
                    className="bg-[#1A1A1A] text-white hover:bg-[#80163A] px-8 h-12 uppercase tracking-widest text-xs"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Look
                </Button>
            )}
        </motion.div>
    );
}

export default OutfitPage;
