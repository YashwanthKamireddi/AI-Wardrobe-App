/**
 * WARDROBE GAP ANALYSIS - "THE CURATOR'S EYE"
 *
 * Design Philosophy: Editorial Shopping Guide meets Luxury Magazine.
 * - Typography: Playfair Display headlines, minimalist labels
 * - Layout: Clean, asymmetric, premium whitespace
 * - Aesthetic: Net-a-Porter meets Vogue recommendations
 *
 * Analyzes your wardrobe to find missing essentials
 * and suggest smart additions based on:
 * - Category coverage
 * - Color balance
 * - Seasonal needs
 * - Style profile
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    AlertTriangle, Sparkles, ArrowRight, Plus,
    TrendingUp, Package, Palette, Sun
} from "lucide-react";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { WARDROBE_METRICS } from "@/lib/brand";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAddToWishlist } from "@/hooks/use-advanced";
import { useToast } from "@/hooks/use-toast";

interface GapItem {
    name: string;
    category: string;
    reason: string;
    priority: "high" | "medium" | "low";
    suggestedBrands?: string[];
    priceRange?: string;
}

interface GapAnalysisResult {
    score: number;
    missingEssentials: GapItem[];
    categoryGaps: { category: string; current: number; ideal: number }[];
    colorGaps: string[];
    seasonalGaps: string[];
    suggestions: string[];
}

export function useWardrobeGapAnalysis(): GapAnalysisResult | null {
    const { data: items } = useWardrobeItems();

    return useMemo(() => {
        if (!items || items.length < 3) return null;

        const missingEssentials: GapItem[] = [];
        const categoryGaps: { category: string; current: number; ideal: number }[] = [];
        const colorGaps: string[] = [];
        const seasonalGaps: string[] = [];
        const suggestions: string[] = [];

        // Category analysis
        const categoryCounts: Record<string, number> = {};
        items.forEach(item => {
            categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
        });

        const idealCounts: Record<string, number> = {
            tops: 10,
            bottoms: 6,
            dresses: 3,
            outerwear: 4,
            shoes: 5,
            accessories: 6,
        };

        // Check each category
        Object.entries(idealCounts).forEach(([category, ideal]) => {
            const current = categoryCounts[category] || 0;
            if (current < ideal * 0.5) {
                categoryGaps.push({ category, current, ideal });
            }
        });

        // Check essentials
        const itemNames = items.map(i => i.name.toLowerCase());
        const itemColors = items.map(i => i.color?.toLowerCase());

        // Check for white t-shirt
        const hasWhiteTee = items.some(i =>
            i.category === 'tops' &&
            (i.color?.toLowerCase().includes('white') || i.name.toLowerCase().includes('white')) &&
            (i.name.toLowerCase().includes('t-shirt') || i.name.toLowerCase().includes('tee'))
        );
        if (!hasWhiteTee) {
            missingEssentials.push({
                name: "White T-Shirt",
                category: "tops",
                reason: "A wardrobe essential that pairs with everything",
                priority: "high",
                suggestedBrands: ["COS", "Uniqlo", "Sunspel"],
                priceRange: "₹1,500 - ₹5,000"
            });
        }

        // Check for dark jeans
        const hasDarkJeans = items.some(i =>
            i.category === 'bottoms' &&
            (i.name.toLowerCase().includes('jean') || i.name.toLowerCase().includes('denim')) &&
            (i.color?.toLowerCase().includes('dark') || i.color?.toLowerCase().includes('indigo') || i.color?.toLowerCase().includes('black'))
        );
        if (!hasDarkJeans) {
            missingEssentials.push({
                name: "Dark Wash Jeans",
                category: "bottoms",
                reason: "Versatile foundation piece for casual and smart-casual looks",
                priority: "high",
                suggestedBrands: ["Levi's", "A.P.C.", "Acne Studios"],
                priceRange: "₹5,000 - ₹15,000"
            });
        }

        // Check for white sneakers
        const hasWhiteSneakers = items.some(i =>
            i.category === 'shoes' &&
            (i.color?.toLowerCase().includes('white')) &&
            (i.name.toLowerCase().includes('sneaker') || i.name.toLowerCase().includes('trainer'))
        );
        if (!hasWhiteSneakers) {
            missingEssentials.push({
                name: "White Sneakers",
                category: "shoes",
                reason: "The ultimate casual shoe that elevates any outfit",
                priority: "medium",
                suggestedBrands: ["Common Projects", "Veja", "Adidas Stan Smith"],
                priceRange: "₹6,000 - ₹30,000"
            });
        }

        // Check for blazer
        const hasBlazer = items.some(i =>
            (i.category === 'outerwear' || i.category === 'tops') &&
            (i.name.toLowerCase().includes('blazer') || i.name.toLowerCase().includes('sport coat'))
        );
        if (!hasBlazer) {
            missingEssentials.push({
                name: "Tailored Blazer",
                category: "outerwear",
                reason: "Instantly dresses up any outfit for professional or formal occasions",
                priority: "medium",
                suggestedBrands: ["Suitsupply", "Massimo Dutti", "Thom Browne"],
                priceRange: "₹15,000 - ₹50,000"
            });
        }

        // Color analysis
        const colors = items.map(i => i.color?.toLowerCase()).filter(Boolean);
        const neutrals = ['black', 'white', 'grey', 'gray', 'beige', 'cream', 'navy'];
        const hasNeutrals = neutrals.some(n => colors.some(c => c?.includes(n)));

        if (!hasNeutrals) {
            colorGaps.push("Add more neutral tones for versatility");
        }

        // Seasonal analysis
        const seasons = items.map(i => i.season).filter(Boolean);
        const seasonCounts: Record<string, number> = {};
        seasons.forEach(s => {
            if (s) seasonCounts[s] = (seasonCounts[s] || 0) + 1;
        });

        if (!seasonCounts['winter'] || seasonCounts['winter'] < 3) {
            seasonalGaps.push("Winter wardrobe needs attention");
        }
        if (!seasonCounts['summer'] || seasonCounts['summer'] < 3) {
            seasonalGaps.push("Summer wardrobe could use more pieces");
        }

        // Calculate overall score
        let score = 100;
        score -= missingEssentials.length * 10;
        score -= categoryGaps.length * 8;
        score -= colorGaps.length * 5;
        score -= seasonalGaps.length * 5;
        score = Math.max(0, Math.min(100, score));

        // Generate suggestions
        if (missingEssentials.length > 0) {
            suggestions.push(`Consider adding ${missingEssentials[0].name} to complete your essentials`);
        }
        if (categoryGaps.length > 0) {
            suggestions.push(`Your ${categoryGaps[0].category} collection could use more variety`);
        }
        if (items.length < 20) {
            suggestions.push("Building a capsule wardrobe of 30-40 pieces is recommended");
        }

        return {
            score,
            missingEssentials,
            categoryGaps,
            colorGaps,
            seasonalGaps,
            suggestions,
        };
    }, [items]);
}

interface GapAnalysisCardProps {
    gap: GapItem;
    index: number;
    onAddToWishlist?: (gap: GapItem) => void;
}

export function GapAnalysisCard({ gap, index, onAddToWishlist }: GapAnalysisCardProps) {
    return (
        <motion.div
            className="group relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
        >
            {/* Image Placeholder - Editorial Style */}
            <div className="aspect-[3/4] mb-6 bg-gradient-to-br from-[#F5F5F5] to-[#E8E8E8] relative overflow-hidden">
                {/* Abstract Category Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 border border-[#D5D5D5] flex items-center justify-center">
                        <Package className="w-8 h-8 text-[#C0C0C0]" />
                    </div>
                </div>

                {/* Priority Tag */}
                <div className="absolute top-4 left-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${gap.priority === 'high'
                            ? 'bg-[#80163A] text-white'
                            : gap.priority === 'medium'
                                ? 'bg-[#D4AF37] text-white'
                                : 'bg-[#1A1A1A]/10 text-[#1A1A1A]'
                        }`}>
                        {gap.priority === 'high' ? 'Essential' : gap.priority === 'medium' ? 'Recommended' : 'Optional'}
                    </span>
                </div>

                {/* Hover Overlay */}
                <motion.div
                    className="absolute inset-0 bg-[#1A1A1A]/90 flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    <p className="text-white text-sm text-center mb-6 font-light leading-relaxed">
                        "{gap.reason}"
                    </p>
                    <Button
                        onClick={() => onAddToWishlist?.(gap)}
                        className="bg-white text-[#1A1A1A] hover:bg-[#80163A] hover:text-white h-10 px-6 rounded-none text-[10px] uppercase tracking-widest transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Cart
                    </Button>
                </motion.div>
            </div>

            {/* Meta */}
            <div className="space-y-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">{gap.category}</p>
                <h3
                    className="text-xl text-[#1A1A1A] group-hover:text-[#80163A] transition-colors"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    {gap.name}
                </h3>

                {gap.priceRange && (
                    <p className="text-sm text-gray-500 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {gap.priceRange}
                    </p>
                )}

                {/* Brand Pills */}
                {gap.suggestedBrands && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {gap.suggestedBrands.map(brand => (
                            <span
                                key={brand}
                                className="text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-0.5 hover:border-[#80163A] hover:text-[#80163A] cursor-pointer transition-colors"
                            >
                                {brand}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

interface GapAnalysisSectionProps {
    compact?: boolean;
}

export function GapAnalysisSection({ compact = false }: GapAnalysisSectionProps) {
    const analysis = useWardrobeGapAnalysis();
    const addToWishlist = useAddToWishlist();
    const { toast } = useToast();

    const handleAddToWishlist = async (gap: GapItem) => {
        try {
            await addToWishlist.mutateAsync({
                name: gap.name,
                brand: gap.suggestedBrands?.[0] || null,
                price: null,
                imageUrl: null,
                sourceUrl: null,
            });
            toast({
                title: "Added to Wishlist",
                description: `"${gap.name}" has been added to your cart.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not add to wishlist.",
                variant: "destructive",
            });
        }
    };

    if (!analysis) return null;

    // No gaps - show success state
    if (analysis.missingEssentials.length === 0 && analysis.categoryGaps.length === 0) {
        return (
            <motion.div
                className="border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-4" />
                <h3
                    className="text-2xl text-[#1A1A1A] mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Wardrobe <span className="italic">Complete</span>
                </h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                    Your collection covers all the essentials. You have excellent taste.
                </p>
            </motion.div>
        );
    }

    if (compact) {
        // Compact version for inline display
        return (
            <motion.div
                className="border border-gray-200 bg-white p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p className="text-[10px] text-[#80163A] font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" />
                            Curator's Recommendations
                        </p>
                        <h3
                            className="text-2xl text-[#1A1A1A]"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            What's <span className="italic text-[#6B6B6B]">Missing</span>
                        </h3>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {analysis.score}%
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400">Complete</p>
                    </div>
                </div>

                {/* Quick List */}
                <div className="space-y-4 mb-6">
                    {analysis.missingEssentials.slice(0, 3).map((gap, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${gap.priority === 'high' ? 'bg-[#80163A]' : 'bg-[#D4AF37]'
                                    }`} />
                                <div>
                                    <p className="text-sm font-medium text-[#1A1A1A]">{gap.name}</p>
                                    <p className="text-xs text-gray-400 capitalize">{gap.category}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleAddToWishlist(gap)}
                                className="text-[10px] uppercase tracking-widest text-[#80163A] hover:underline"
                            >
                                + Add
                            </button>
                        </div>
                    ))}
                </div>

                {analysis.missingEssentials.length > 3 && (
                    <Link href="/wishlist">
                        <button className="text-xs uppercase tracking-widest text-[#1A1A1A] hover:text-[#80163A] transition-colors flex items-center gap-2">
                            View All Recommendations
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                )}
            </motion.div>
        );
    }

    // Full version for dedicated section
    return (
        <section className="py-16 border-t border-[#E5E5E5]">
            {/* Header */}
            <motion.div
                className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <div>
                    <p className="text-[#80163A] text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        The Curator's Eye
                    </p>
                    <h2
                        className="text-4xl md:text-5xl text-[#1A1A1A] leading-[0.9]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        What's <span className="italic text-[#6B6B6B]">Missing</span>
                    </h2>
                </div>

                <div className="flex items-end gap-8">
                    {/* Score Display */}
                    <div className="text-right">
                        <p className="text-5xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {analysis.score}%
                        </p>
                        <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">Completeness</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="hidden md:flex gap-6 text-center border-l border-gray-200 pl-8">
                        <div>
                            <p className="text-2xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {analysis.missingEssentials.length}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400">Essentials</p>
                        </div>
                        <div>
                            <p className="text-2xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {analysis.categoryGaps.length}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400">Categories</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Missing Essentials Grid */}
            {analysis.missingEssentials.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mb-16">
                    {analysis.missingEssentials.map((gap, i) => (
                        <GapAnalysisCard
                            key={i}
                            gap={gap}
                            index={i}
                            onAddToWishlist={handleAddToWishlist}
                        />
                    ))}
                </div>
            )}

            {/* Insights Row */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Category Gaps */}
                {analysis.categoryGaps.length > 0 && (
                    <motion.div
                        className="bg-white border border-gray-100 p-6 shadow-lg shadow-black/5"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-4 h-4 text-[#80163A]" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#80163A]">
                                Category Gaps
                            </h3>
                        </div>
                        <div className="space-y-4">
                            {analysis.categoryGaps.map((gap, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize text-[#1A1A1A]">{gap.category}</span>
                                        <span className="text-gray-400">{gap.current} / {gap.ideal}</span>
                                    </div>
                                    <div className="h-1 bg-gray-100 relative overflow-hidden">
                                        <motion.div
                                            className="absolute top-0 left-0 h-full bg-[#80163A]"
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${(gap.current / gap.ideal) * 100}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Color Gaps */}
                {analysis.colorGaps.length > 0 && (
                    <motion.div
                        className="bg-white border border-gray-100 p-6 shadow-lg shadow-black/5"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Palette className="w-4 h-4 text-[#D4AF37]" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                                Color Balance
                            </h3>
                        </div>
                        <ul className="space-y-2">
                            {analysis.colorGaps.map((gap, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                    <AlertTriangle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                                    {gap}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                {/* Seasonal Gaps */}
                {analysis.seasonalGaps.length > 0 && (
                    <motion.div
                        className="bg-white border border-gray-100 p-6 shadow-lg shadow-black/5"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Sun className="w-4 h-4 text-amber-500" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500">
                                Seasonal Needs
                            </h3>
                        </div>
                        <ul className="space-y-2">
                            {analysis.seasonalGaps.map((gap, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    {gap}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </div>

            {/* AI Suggestions */}
            {analysis.suggestions.length > 0 && (
                <motion.div
                    className="mt-8 bg-[#FAF9F6] border border-[#E5E5E5] p-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                            Curator's Notes
                        </h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {analysis.suggestions.map((suggestion, i) => (
                            <p key={i} className="text-sm text-gray-600 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                                "{suggestion}"
                            </p>
                        ))}
                    </div>
                </motion.div>
            )}
        </section>
    );
}

export default GapAnalysisSection;
