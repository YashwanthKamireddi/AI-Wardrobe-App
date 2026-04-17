import { useState, useMemo, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
    Sparkles, Plus, X, Trash2, Save, Wand2, Shirt,
    ChevronDown, Search, Grid3X3, ArrowRight, Check,
    Palette, Sun, Cloud, Heart, Eye, RotateCcw, Share2
} from "lucide-react";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfitRecommendations } from "@/hooks/use-intelligence";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { SeasonalFilter } from "@/components/seasonal-filter";
import { Season, WeatherCondition } from "@/hooks/use-seasonal-filter";

/**
 * COMPOSE PAGE - "THE ATELIER"
 *
 * Complete redesign following Celura Design System
 * Inspired by: Clueless closet, fashion editorial layouts
 * Mobile-first with desktop side panel
 */

const CATEGORIES = [
    { id: "all", label: "All", icon: Grid3X3 },
    { id: "tops", label: "Tops", icon: Shirt },
    { id: "bottoms", label: "Bottoms", icon: Shirt },
    { id: "dresses", label: "Dresses", icon: Shirt },
    { id: "outerwear", label: "Layers", icon: Shirt },
    { id: "shoes", label: "Shoes", icon: Shirt },
    { id: "accessories", label: "Accents", icon: Sparkles },
];

export function ComposePage() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [, navigate] = useLocation();
    const { data: wardrobeItems, isLoading } = useWardrobeItems();

    // State
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [outfitName, setOutfitName] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAISuggestions, setShowAISuggestions] = useState(false);
    const [activeMood, setActiveMood] = useState<string>("casual");
    const [seasonFilter, setSeasonFilter] = useState<Season | null>(null);
    const [weatherFilter, setWeatherFilter] = useState<WeatherCondition | null>(null);

    // AI Recommendations
    const { recommendations, isLoading: aiLoading } = useOutfitRecommendations(activeMood, 3);

    // Filtered items
    const filteredItems = useMemo(() => {
        if (!wardrobeItems) return [];
        return wardrobeItems.filter(item => {
            const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
            const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSeason = !seasonFilter || item.season === seasonFilter || item.season === 'all' || !item.season;
            return matchesCategory && matchesSearch && matchesSeason;
        });
    }, [wardrobeItems, activeCategory, searchQuery, seasonFilter]);

    // Save mutation
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
            handleReset();
            navigate("/outfits");
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

    const handleReset = () => {
        setSelectedItems([]);
        setOutfitName("");
    };

    const handleSave = () => {
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

    const applyAIOutfit = (items: any[]) => {
        setSelectedItems(items);
        setShowAISuggestions(false);
        toast({
            title: "AI Outfit Applied",
            description: `${items.length} items added to your look.`,
        });
    };

    const moods = ["casual", "confident", "professional", "romantic", "creative"];

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#FDFBF7]">
                {/* Header */}
                <motion.header
                    className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-sm border-b border-black/5"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] tracking-[0.3em] uppercase text-[#80163A] font-medium">The Atelier</p>
                                <h1
                                    className="text-2xl md:text-3xl text-[#1A1A1A]"
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                    Compose <span className="italic font-light">Your Look</span>
                                </h1>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {selectedItems.length > 0 && (
                                    <>
                                        <motion.button
                                            onClick={handleReset}
                                            className="p-2 text-gray-400 hover:text-[#1A1A1A] transition-colors"
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <RotateCcw className="w-5 h-5" />
                                        </motion.button>
                                        <motion.button
                                            onClick={handleSave}
                                            className="h-10 px-5 bg-[#1A1A1A] text-white rounded-full text-sm font-medium flex items-center gap-2"
                                            whileHover={{ backgroundColor: "#80163A" }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={saveOutfitMutation.isPending}
                                        >
                                            <Save className="w-4 h-4" />
                                            {saveOutfitMutation.isPending ? "Saving..." : "Save Look"}
                                        </motion.button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.header>

                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Left: Canvas - Selected Items */}
                        <motion.div
                            className="lg:col-span-5 order-1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="sticky top-24">
                                {/* Outfit Name */}
                                <div className="mb-6">
                                    <input
                                        type="text"
                                        placeholder="Name your look..."
                                        value={outfitName}
                                        onChange={(e) => setOutfitName(e.target.value)}
                                        className="w-full text-xl font-medium bg-transparent border-0 border-b border-black/10 focus:border-[#80163A] focus:outline-none py-2 placeholder:text-gray-300 text-[#1A1A1A]"
                                        style={{ fontFamily: "'Playfair Display', serif" }}
                                    />
                                </div>

                                {/* Canvas */}
                                <div className="bg-white rounded-2xl border border-black/5 p-6 min-h-[400px]">
                                    {selectedItems.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-16">
                                            <div className="w-16 h-16 rounded-full bg-[#FAF9F6] flex items-center justify-center mb-4">
                                                <Palette className="w-7 h-7 text-gray-300" />
                                            </div>
                                            <h3
                                                className="text-lg text-[#1A1A1A] mb-2"
                                                style={{ fontFamily: "'Playfair Display', serif" }}
                                            >
                                                Your Canvas Awaits
                                            </h3>
                                            <p className="text-sm text-gray-400 max-w-xs">
                                                Select pieces from your wardrobe or let AI suggest a look
                                            </p>
                                            <button
                                                onClick={() => setShowAISuggestions(true)}
                                                className="mt-6 px-4 py-2 text-sm text-[#80163A] border border-[#80163A] rounded-full hover:bg-[#80163A] hover:text-white transition-colors flex items-center gap-2"
                                            >
                                                <Wand2 className="w-4 h-4" />
                                                AI Suggestions
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-xs uppercase tracking-widest text-gray-400 font-medium">
                                                    {selectedItems.length} piece{selectedItems.length > 1 ? 's' : ''}
                                                </span>
                                                <button
                                                    onClick={() => setShowAISuggestions(true)}
                                                    className="text-xs text-[#80163A] hover:underline flex items-center gap-1"
                                                >
                                                    <Wand2 className="w-3 h-3" />
                                                    Get AI ideas
                                                </button>
                                            </div>

                                            {/* Item Grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {selectedItems.map((item, index) => (
                                                    <motion.div
                                                        key={item.id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        className="relative group aspect-[3/4] rounded-xl overflow-hidden bg-[#FAF9F6] border border-black/5"
                                                    >
                                                        {item.imageUrl ? (
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Shirt className="w-8 h-8 text-gray-200" />
                                                            </div>
                                                        )}

                                                        {/* Remove Button */}
                                                        <button
                                                            onClick={() => toggleItem(item)}
                                                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>

                                                        {/* Label */}
                                                        <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                                            <p className="text-white text-xs truncate">{item.name}</p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Wardrobe Picker */}
                        <motion.div
                            className="lg:col-span-7 order-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            {/* Search & Filters */}
                            <div className="mb-6 space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search your wardrobe..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-12 pl-11 pr-4 bg-white border border-black/5 rounded-xl focus:outline-none focus:border-[#80163A] text-sm"
                                    />
                                </div>

                                {/* Category Pills */}
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${activeCategory === cat.id
                                                    ? 'bg-[#1A1A1A] text-white'
                                                    : 'bg-white text-gray-600 border border-black/5 hover:border-black/20'
                                                }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Season Filter */}
                                <SeasonalFilter
                                    onFilterChange={(season, weather) => {
                                        setSeasonFilter(season);
                                        setWeatherFilter(weather);
                                    }}
                                />
                            </div>

                            {/* Items Grid */}
                            {isLoading ? (
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="aspect-[3/4] rounded-xl bg-gray-100 animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredItems.length === 0 ? (
                                <div className="text-center py-16">
                                    <p className="text-gray-400">No items found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                    {filteredItems.map(item => {
                                        const isSelected = selectedItems.find(i => i.id === item.id);
                                        return (
                                            <motion.button
                                                key={item.id}
                                                onClick={() => toggleItem(item)}
                                                className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-[#FAF9F6] border-2 transition-all ${isSelected
                                                        ? 'border-[#80163A] ring-2 ring-[#80163A]/20'
                                                        : 'border-transparent hover:border-black/10'
                                                    }`}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Shirt className="w-8 h-8 text-gray-200" />
                                                    </div>
                                                )}

                                                {/* Selection indicator */}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-[#80163A]/20 flex items-center justify-center">
                                                        <div className="w-8 h-8 rounded-full bg-[#80163A] flex items-center justify-center">
                                                            <Check className="w-5 h-5 text-white" />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Name */}
                                                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                                                    <p className="text-white text-[10px] truncate">{item.name}</p>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* AI Suggestions Modal */}
                <AnimatePresence>
                    {showAISuggestions && (
                        <motion.div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAISuggestions(false)}
                        >
                            <motion.div
                                className="bg-white w-full md:max-w-lg md:rounded-2xl overflow-hidden"
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2
                                                className="text-xl text-[#1A1A1A]"
                                                style={{ fontFamily: "'Playfair Display', serif" }}
                                            >
                                                <Wand2 className="w-5 h-5 inline mr-2 text-[#80163A]" />
                                                AI Stylist
                                            </h2>
                                            <p className="text-xs text-gray-400 mt-1">Let AI create a look for you</p>
                                        </div>
                                        <button onClick={() => setShowAISuggestions(false)} className="p-2">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Mood Selector */}
                                    <div className="mt-4 flex gap-2 flex-wrap">
                                        {moods.map(mood => (
                                            <button
                                                key={mood}
                                                onClick={() => setActiveMood(mood)}
                                                className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${activeMood === mood
                                                        ? 'bg-[#1A1A1A] text-white'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                {mood}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 max-h-[50vh] overflow-y-auto">
                                    {aiLoading ? (
                                        <div className="text-center py-8">
                                            <div className="w-8 h-8 border-2 border-[#80163A]/20 border-t-[#80163A] rounded-full animate-spin mx-auto" />
                                            <p className="text-sm text-gray-400 mt-3">Creating looks...</p>
                                        </div>
                                    ) : recommendations.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-400">Add more items to get AI suggestions</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {recommendations.map((rec, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => applyAIOutfit(rec.outfitItems)}
                                                    className="w-full p-4 border border-gray-100 rounded-xl hover:border-[#80163A] hover:bg-[#FAF9F6] transition-all text-left"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm font-medium">Look {idx + 1}</span>
                                                        <span className="text-xs text-[#80163A]">{Math.round(rec.score * 100)}% match</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {rec.outfitItems.slice(0, 4).map(item => (
                                                            <div key={item.id} className="w-12 h-16 rounded-lg bg-gray-100 overflow-hidden">
                                                                {item.imageUrl ? (
                                                                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Shirt className="w-5 h-5 text-gray-300" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}

export default ComposePage;
