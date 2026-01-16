import { useState, useMemo } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import {
    Search, X, Sparkles, TrendingUp, Heart, Grid3X3,
    Layers, User, Star, Bookmark, ExternalLink, Sun, Crown, Palette, Shirt, Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import { useToast } from "@/hooks/use-toast";
import InspirationCard from "@/components/inspiration-card";
import { Inspiration } from "@shared/schema";

/**
 * INSPIRATION PAGE - EDITORIAL MAGAZINE
 *
 * Design: Pinterest-style curated looks
 * Focus: Visual discovery and inspiration
 */

// Featured collections
const featuredCollections = [
    { id: 1, title: "Spring Essentials", count: 24, icon: Sun, gradient: "from-emerald-400 to-teal-500" },
    { id: 2, title: "Office Chic", count: 18, icon: Shirt, gradient: "from-violet-400 to-purple-500" },
    { id: 3, title: "Weekend Casual", count: 32, icon: Clock, gradient: "from-amber-400 to-orange-500" },
    { id: 4, title: "Evening Elegance", count: 15, icon: Crown, gradient: "from-rose-400 to-pink-500" },
];

// Trending styles
const trendingStyles = [
    { name: "Quiet Luxury", desc: "Understated elegance" },
    { name: "Minimalist", desc: "Clean & simple" },
    { name: "Classic", desc: "Timeless pieces" },
    { name: "Smart Casual", desc: "Versatile looks" },
];

export function InspirationPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const { toast } = useToast();

    const { data: inspirations, isLoading } = useQuery<Inspiration[], Error>({
        queryKey: ["/api/inspirations"],
    });

    const filteredInspirations = useMemo(() => {
        if (!inspirations) return [];
        return inspirations.filter(inspiration => {
            const matchesSearch =
                inspiration.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inspiration.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inspiration.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory =
                selectedCategory === 'all' || inspiration.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [inspirations, searchQuery, selectedCategory]);

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-[#6B6B6B]">Loading inspiration...</p>
                </div>
            </div>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
                {/* Header */}
                <motion.header
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-2">
                        Discover
                    </p>
                    <h1
                        className="text-[#1A1A1A] mb-4"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(2rem, 5vw, 3rem)",
                            lineHeight: 1.1
                        }}
                    >
                        Style Inspiration
                    </h1>
                    <p className="text-[#6B6B6B] text-lg max-w-xl">
                        Discover curated looks and trending styles to elevate your wardrobe.
                    </p>
                </motion.header>

                {/* Search */}
                <motion.div
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9A9A9A]" />
                        <input
                            type="text"
                            placeholder="Search for styles, trends, or looks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-white border border-[#E5E5E5] rounded-full text-sm text-[#1A1A1A] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                        />
                    </div>
                </motion.div>

                {/* Featured Collections */}
                <motion.section
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <h2
                        className="text-xl text-[#1A1A1A] mb-6"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Featured Collections
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {featuredCollections.map((collection, i) => (
                            <motion.div
                                key={collection.id}
                                className={`p-6 rounded-3xl bg-gradient-to-br ${collection.gradient} cursor-pointer`}
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <collection.icon className="w-8 h-8 text-white/90 mb-4" />
                                <h3 className="text-white font-medium mb-1">{collection.title}</h3>
                                <p className="text-white/70 text-sm">{collection.count} looks</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Trending Styles */}
                <motion.section
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="w-5 h-5 text-[#80163A]" />
                        <h2
                            className="text-xl text-[#1A1A1A]"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Trending Now
                        </h2>
                    </div>

                    <div className="flex gap-3 overflow-x-auto py-2 -mx-6 px-6 scrollbar-hide">
                        {trendingStyles.map((style, i) => (
                            <motion.button
                                key={style.name}
                                className="flex-shrink-0 px-6 py-4 rounded-2xl bg-white border border-[#E5E5E5] text-left shadow-sm"
                                whileHover={{ borderColor: "#1A1A1A", y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <p className="font-medium text-[#1A1A1A] mb-1">{style.name}</p>
                                <p className="text-xs text-[#6B6B6B]">{style.desc}</p>
                            </motion.button>
                        ))}
                    </div>
                </motion.section>

                {/* Inspiration Grid */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h2
                        className="text-xl text-[#1A1A1A] mb-6"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        For You
                    </h2>

                    {filteredInspirations && filteredInspirations.length > 0 ? (
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                            {filteredInspirations.map((inspiration, index) => (
                                <motion.div
                                    key={inspiration.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="break-inside-avoid"
                                >
                                    <InspirationCard
                                        inspiration={inspiration}
                                        onSave={() => {
                                            toast({ title: "Saved!", description: "Added to your collection" });
                                        }}
                                        onShare={() => {
                                            toast({ title: "Shared!", description: "Link copied to clipboard" });
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-8 h-8 text-[#D5D5D5]" />
                            </div>
                            <h3
                                className="text-xl text-[#1A1A1A] mb-3"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                No inspiration found
                            </h3>
                            <p className="text-sm text-[#6B6B6B] max-w-sm mx-auto">
                                {searchQuery
                                    ? "Try a different search term"
                                    : "Check back soon for new style inspiration"}
                            </p>
                        </div>
                    )}
                </motion.section>
            </div>

            {/* Mobile Bottom Nav */}
        </AppLayout>
    );
}

export default InspirationPage;
