import { useState, useMemo } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Plus, Search, X, Layers, Heart, Trash2, Grid3X3, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

import { useOutfits, useDeleteOutfit } from "@/hooks/use-outfits";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { cn } from "@/lib/utils";
import { OutfitCardSkeleton } from "@/components/ui/wardrobe-skeletons";

/**
 * OUTFITS PAGE - EDITORIAL GALLERY
 *
 * Design: Magazine-style outfit presentation
 * Focus: Visual storytelling through outfit combinations
 */

export function OutfitPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<string>('all');

    const { data: outfits, isLoading: outfitsLoading } = useOutfits();
    const { data: wardrobeItems } = useWardrobeItems();
    const deleteOutfit = useDeleteOutfit();

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

    const handleDelete = async (id: number) => {
        try {
            await deleteOutfit.mutateAsync(id);
        } catch (error) {
            console.error('Failed to delete outfit:', error);
        }
    };

    const getItemImage = (itemId: number) => {
        const item = wardrobeItems?.find(i => i.id === itemId);
        return item?.imageUrl;
    };

    // Loading State
    if (outfitsLoading) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
                    <div className="mb-16 space-y-4">
                        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-20 w-3/4 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <OutfitCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
                {/* Header */}
                <motion.header
                    className="mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-4">
                                Collection
                            </p>
                            <h1
                                className="text-[#1A1A1A] text-5xl lg:text-7xl font-light leading-[0.9]"
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                }}
                            >
                                Your <span className="italic text-[#80163A]">Lookbook</span>.
                            </h1>
                        </div>
                        <Link href="/compose">
                            <motion.button
                                className="h-14 px-8 bg-[#1A1A1A] text-[#F9F9F7] text-sm tracking-wider uppercase font-medium rounded-full flex items-center gap-2 hover:bg-[#80163A] transition-colors shadow-lg"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Create New Look</span>
                            </motion.button>
                        </Link>
                    </div>
                </motion.header>

                {/* Search & Filters */}
                <motion.div
                    className="mb-12 flex flex-col md:flex-row gap-6 justify-between items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A9A]" />
                        <input
                            type="text"
                            placeholder="Search looks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white border border-[#E5E5E5] rounded-full text-sm text-[#1A1A1A] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                        />
                    </div>

                    <div className="flex gap-2">
                        {['all', 'favorites'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={cn(
                                    "px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-all",
                                    selectedTab === tab
                                        ? "bg-[#1A1A1A] text-white"
                                        : "bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A1A1A]"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Outfits Grid - Masonry-ish Feel */}
                {filteredOutfits.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredOutfits.map((outfit, index) => (
                            <motion.div
                                key={outfit.id}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="group"
                            >
                                <div className="relative bg-[#FAF9F6] p-4 rounded-[2rem] transition-all duration-500 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] group-hover:-translate-y-2">
                                    {/* Collage Grid */}
                                    <div className="aspect-[3/4] grid grid-cols-2 gap-2 mb-6 overflow-hidden rounded-2xl bg-white">
                                        {(Array.isArray(outfit.items) ? outfit.items : []).slice(0, 4).map((itemId: number, idx: number, arr: number[]) => {
                                            const imageUrl = getItemImage(itemId);
                                            const isSingle = arr.length === 1;
                                            const isTriple = arr.length === 3;

                                            // Dynamic grid logic for visual interest
                                            let className = "relative overflow-hidden bg-gray-50";
                                            if (isSingle) className += " col-span-2 row-span-2";
                                            else if (isTriple && idx === 0) className += " col-span-2";

                                            return (
                                                <div key={idx} className={className}>
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt=""
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Grid3X3 className="w-6 h-6 text-[#D5D5D5]" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Info Card */}
                                    <div className="px-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl text-[#1A1A1A] font-serif italic mb-1">
                                                    {outfit.name}
                                                </h3>
                                                <p className="text-xs text-[#9A9A9A] uppercase tracking-wider">
                                                    {(Array.isArray(outfit.items) ? outfit.items : []).length} Items
                                                    {outfit.occasion && ` • ${outfit.occasion}`}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {outfit.favorite && <Heart className="w-4 h-4 text-[#80163A] fill-[#80163A]" />}
                                                <button
                                                    onClick={() => handleDelete(outfit.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hover Action */}
                                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-[#1A1A1A] hover:text-white transition-colors">
                                            <ArrowUpRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        className="py-32 text-center border border-dashed border-[#E5E5E5] rounded-[3rem]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="w-24 h-24 rounded-full bg-[#FAF9F6] flex items-center justify-center mx-auto mb-8">
                            <Layers className="w-10 h-10 text-[#D5D5D5]" />
                        </div>
                        <h3 className="text-3xl text-[#1A1A1A] mb-4 font-serif italic">
                            {searchQuery ? 'No looks found' : 'The Canvas is Empty'}
                        </h3>
                        <p className="text-[#6B6B6B] mb-10 max-w-md mx-auto">
                            {searchQuery
                                ? 'Try adjusting your search terms.'
                                : 'Start curating your personal collection in the Studio.'}
                        </p>
                        {!searchQuery && (
                            <Link href="/compose">
                                <motion.button
                                    className="h-14 px-10 bg-[#1A1A1A] text-[#F9F9F7] text-sm tracking-widest uppercase font-medium rounded-full inline-flex items-center gap-3 hover:bg-[#80163A] transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Enter Studio
                                </motion.button>
                            </Link>
                        )}
                    </motion.div>
                )}
            </div>
        </AppLayout >
    );
}

export default OutfitPage;
