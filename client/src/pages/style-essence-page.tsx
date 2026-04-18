import { useState } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { motion } from "framer-motion";
import {
    Palette,
    Sparkles,
    Crown,
    Layers,
    Star,
    Gem,
    Feather,
    Minimize2,
    RefreshCw,
    TrendingUp,
    Clock,
} from "lucide-react";

import { useStyleDna, useRefreshStyleDna, type StyleDnaProfile } from "@/hooks/use-style-dna";
import { useToast } from "@/hooks/use-toast";

/**
 * STYLE ESSENCE PAGE - EDITORIAL STYLE ANALYSIS
 *
 * Design: Clean personality assessment with visual harmony
 * Focus: Style DNA discovery and color harmony analysis
 */

interface StylePersonality {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    traits: string[];
    colorPalette: string[];
}

const STYLE_PERSONALITIES: StylePersonality[] = [
    {
        id: 'curator',
        name: 'The Curator',
        description: 'You collect pieces with intention, building a wardrobe of timeless investment items.',
        icon: Crown,
        traits: ['Quality-focused', 'Timeless choices', 'Investment mindset'],
        colorPalette: ['#1A1A1A', '#F9F9F7', '#8B7355', '#4A4A4A']
    },
    {
        id: 'minimalist',
        name: 'The Minimalist',
        description: 'Less is more. You believe in the power of simplicity and clean lines.',
        icon: Minimize2,
        traits: ['Capsule wardrobe', 'Neutral tones', 'Clean silhouettes'],
        colorPalette: ['#1A1A1A', '#FFFFFF', '#9A9A9A', '#E5E5E5']
    },
    {
        id: 'expressionist',
        name: 'The Expressionist',
        description: 'Fashion is your canvas. You use clothing to express your unique creative vision.',
        icon: Sparkles,
        traits: ['Bold choices', 'Color lover', 'Trend-aware'],
        colorPalette: ['#80163A', '#D4AF37', '#1A4D2E', '#2A4B8F']
    },
    {
        id: 'classicist',
        name: 'The Classicist',
        description: 'You honor tradition and find beauty in proven elegance.',
        icon: Gem,
        traits: ['Traditional styling', 'Polished looks', 'Heritage brands'],
        colorPalette: ['#1e3a5f', '#8B0000', '#2F4F4F', '#DAA520']
    },
    {
        id: 'naturalist',
        name: 'The Naturalist',
        description: 'Comfort meets consciousness. You gravitate toward organic and sustainable choices.',
        icon: Feather,
        traits: ['Eco-conscious', 'Natural fibers', 'Earth tones'],
        colorPalette: ['#606C38', '#8B5E3C', '#E5DDD3', '#588157']
    },
];

function formatRelative(date: string | Date | undefined): string {
    if (!date) return '';
    const ms = Date.now() - new Date(date).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function StyleEssencePage() {
    const { data: profile, isLoading, error } = useStyleDna();
    const refresh = useRefreshStyleDna();
    const { toast } = useToast();
    const [selectedPersonality, setSelectedPersonality] = useState<StylePersonality | null>(null);

    const personalityMatch: StylePersonality | null = profile
        ? (STYLE_PERSONALITIES.find(p => p.id === profile.archetype) || STYLE_PERSONALITIES[0])
        : null;

    const handleRefresh = async () => {
        try {
            await refresh.mutateAsync();
            toast({ title: "Recomputed", description: "Your Style DNA is up to date." });
        } catch (e) {
            toast({ title: "Couldn't refresh", description: "Please try again.", variant: "destructive" });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <AppLayout>
                <div className="max-w-6xl mx-auto px-6 py-20 text-center">
                    <p className="text-[#6B6B6B] mb-4">Couldn't load your Style DNA.</p>
                    <button
                        onClick={handleRefresh}
                        className="min-h-[44px] px-6 py-3 rounded-full bg-[#1A1A1A] text-white text-sm tracking-wider"
                    >
                        Try Again
                    </button>
                </div>
            </AppLayout>
        );
    }

    const hasData = !!profile && profile.totalItems > 0;

    return (
        <AppLayout>
            {/* Navigation */}

            <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
                {/* Header */}
                <motion.header
                    className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-2">Discover</p>
                        <h1 className="text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3rem)" }}>
                            Your Style DNA
                        </h1>
                        <p className="text-[#6B6B6B] text-lg">Understand your unique fashion identity</p>
                        {profile?.computedAt && (
                            <p className="text-xs text-[#9A9A9A] mt-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Last computed {formatRelative(profile.computedAt)}
                            </p>
                        )}
                    </div>
                    {hasData && (
                        <button
                            onClick={handleRefresh}
                            disabled={refresh.isPending}
                            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-3 rounded-full border border-[#E5E5E5] bg-white text-sm text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors disabled:opacity-50"
                            aria-label="Recompute Style DNA"
                        >
                            <RefreshCw className={`w-4 h-4 ${refresh.isPending ? 'animate-spin' : ''}`} />
                            {refresh.isPending ? 'Recomputing…' : 'Recompute'}
                        </button>
                    )}
                </motion.header>

                {hasData && profile && personalityMatch ? (
                    <>
                        {/* Score Cards */}
                        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            {/* Style Score */}
                            <motion.div
                                className="p-6 rounded-3xl bg-[#1A1A1A] text-white col-span-2 md:col-span-1"
                                whileHover={{ scale: 1.02 }}
                            >
                                <Star className="w-6 h-6 mb-4 opacity-60" />
                                <div className="text-5xl mb-2 font-mono">
                                    {profile.styleScore}
                                </div>
                                <p className="text-xs uppercase tracking-wider opacity-60">Style Score</p>
                            </motion.div>

                            {/* Color Harmony */}
                            <motion.div
                                className="p-6 rounded-3xl bg-white border border-[#E5E5E5]/50"
                                whileHover={{ scale: 1.02 }}
                            >
                                <Palette className="w-6 h-6 mb-4 text-[#9A9A9A]" />
                                <div className="text-4xl text-[#1A1A1A] mb-2 font-mono">
                                    {profile.colorHarmony}
                                </div>
                                <p className="text-xs text-[#9A9A9A] uppercase tracking-wider">Color Harmony</p>
                            </motion.div>

                            {/* Versatility */}
                            <motion.div
                                className="p-6 rounded-3xl bg-white border border-[#E5E5E5]/50"
                                whileHover={{ scale: 1.02 }}
                            >
                                <TrendingUp className="w-6 h-6 mb-4 text-[#9A9A9A]" />
                                <div className="text-4xl text-[#1A1A1A] mb-2 font-mono">
                                    {profile.versatilityScore}
                                </div>
                                <p className="text-xs text-[#9A9A9A] uppercase tracking-wider">Versatility</p>
                            </motion.div>

                            {/* Total Items */}
                            <motion.div
                                className="p-6 rounded-3xl bg-white border border-[#E5E5E5]/50"
                                whileHover={{ scale: 1.02 }}
                            >
                                <Layers className="w-6 h-6 mb-4 text-[#9A9A9A]" />
                                <div className="text-4xl text-[#1A1A1A] mb-2 font-mono">
                                    {profile.totalItems}
                                </div>
                                <p className="text-xs text-[#9A9A9A] uppercase tracking-wider">Pieces Analyzed</p>
                            </motion.div>
                        </motion.div>

                        {/* Style Personality Match */}
                        <motion.section className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <h2 className="text-xl text-[#1A1A1A] mb-6 font-playfair">
                                Your Style Personality
                            </h2>
                            <motion.div
                                className="rounded-3xl bg-white border border-[#E5E5E5]/50 p-8"
                                whileHover={{ boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}
                            >
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Icon */}
                                    <div className="w-20 h-20 rounded-2xl bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                                        <personalityMatch.icon className="w-10 h-10 text-white" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <h3 className="text-2xl text-[#1A1A1A] mb-2 font-playfair">
                                            {personalityMatch.name}
                                        </h3>
                                        <p className="text-[#6B6B6B] mb-4">{personalityMatch.description}</p>

                                        {/* Traits — prefer server-computed traits, fallback to archetype defaults */}
                                        <div className="flex flex-wrap gap-2">
                                            {(profile.traits?.length ? profile.traits : personalityMatch.traits).map((trait) => (
                                                <span
                                                    key={trait}
                                                    className="px-4 py-2 rounded-full bg-[#F5F5F5] text-[#6B6B6B] text-sm"
                                                >
                                                    {trait}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color Palette */}
                                    <div className="flex md:flex-col gap-2">
                                        {personalityMatch.colorPalette.map((color) => (
                                            <div
                                                key={color}
                                                className="w-10 h-10 rounded-lg border border-[#E5E5E5]"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.section>

                        {/* Your Color Palette */}
                        {profile.dominantColors.length > 0 && (
                            <motion.section className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <h2 className="text-xl text-[#1A1A1A] mb-6 font-playfair">
                                    Your Dominant Colors
                                </h2>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {profile.dominantColors.map((color, i) => (
                                        <motion.div
                                            key={color}
                                            className="flex-shrink-0 text-center"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <div
                                                className="w-24 h-24 rounded-2xl mb-2 border border-[#E5E5E5]"
                                                style={{ backgroundColor: getColorHex(color) }}
                                            />
                                            <p className="text-sm font-medium text-[#1A1A1A] capitalize">{color}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* All Personalities */}
                        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <h2 className="text-xl text-[#1A1A1A] mb-6 font-playfair">
                                Style Archetypes
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {STYLE_PERSONALITIES.map((personality, i) => {
                                    const isMatch = personality.id === profile.archetype;
                                    return (
                                        <motion.button
                                            key={personality.id}
                                            type="button"
                                            className={`text-left p-6 rounded-2xl border-2 cursor-pointer transition-all min-h-[44px] ${isMatch
                                                ? 'border-[#1A1A1A] bg-white'
                                                : 'border-[#E5E5E5] bg-white hover:border-[#9A9A9A]'
                                                }`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            whileHover={{ scale: 1.01 }}
                                            onClick={() => setSelectedPersonality(personality)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isMatch ? 'bg-[#1A1A1A]' : 'bg-[#F5F5F5]'}`}>
                                                    <personality.icon className={`w-6 h-6 ${isMatch ? 'text-white' : 'text-[#6B6B6B]'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-[#1A1A1A] font-medium mb-1">{personality.name}</h3>
                                                    <p className="text-sm text-[#9A9A9A] line-clamp-2">{personality.description}</p>
                                                </div>
                                            </div>
                                            {isMatch && (
                                                <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                                                    <span className="text-xs text-[#80163A] uppercase tracking-wider">Your Match</span>
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.section>
                    </>
                ) : (
                    /* Empty State */
                    <motion.div
                        className="text-center py-20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
                            <RefreshCw className="w-8 h-8 text-[#9A9A9A]" />
                        </div>
                        <h2 className="text-2xl text-[#1A1A1A] mb-2 font-playfair">
                            Add Items to Discover
                        </h2>
                        <p className="text-[#6B6B6B] mb-8 max-w-md mx-auto">
                            Start building your wardrobe to unlock your style DNA analysis
                        </p>
                        <Link href="/wardrobe">
                            <motion.button
                                className="px-8 py-4 rounded-full bg-[#1A1A1A] text-white text-sm tracking-wider"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                GO TO WARDROBE
                            </motion.button>
                        </Link>
                    </motion.div>
                )}
            </div>

            {/* Mobile Bottom Nav */}
        </AppLayout>
    );
}

function getColorHex(colorName: string): string {
    const colorMap: Record<string, string> = {
        'black': '#1A1A1A', 'white': '#F9F9F7', 'gray': '#6B6B6B', 'grey': '#6B6B6B',
        'navy': '#1e3a5f', 'blue': '#4A90D9', 'red': '#C44536', 'burgundy': '#80163A',
        'pink': '#E8A4B8', 'coral': '#E07A5F', 'orange': '#E07A5F', 'yellow': '#E9C46A',
        'gold': '#D4AF37', 'beige': '#E5DDD3', 'cream': '#FAF3E0', 'tan': '#C9B99A',
        'brown': '#8B5E3C', 'olive': '#606C38', 'green': '#588157', 'teal': '#2A9D8F',
        'purple': '#7B68EE', 'lavender': '#E6E6FA',
    };
    const lowerColor = colorName.toLowerCase();
    for (const [key, value] of Object.entries(colorMap)) {
        if (lowerColor.includes(key)) return value;
    }
    return '#9A9A9A';
}

export default StyleEssencePage;
