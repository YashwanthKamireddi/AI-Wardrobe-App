import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWeather } from "@/hooks/use-weather";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";
import WeatherLocationModal from "@/components/weather-location-modal";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Sparkles, Shirt, Shuffle, Layers, Cloud, Sun, CloudRain, ArrowRight, Coffee, Briefcase, Moon, Dumbbell, PartyPopper, Snowflake, Wand2, Check } from "lucide-react";
import type { Outfit, WardrobeItem } from "@shared/schema";

/**
 * HOME PAGE V7 - "AI STYLE CURATOR"
 *
 * Features:
 * - Mood-based outfit generation
 * - Weather-aware recommendations
 * - Smart wardrobe matching
 */

// Mood configurations
const moods = [
    { id: "casual", label: "Casual", icon: Coffee, color: "#6B7280", description: "Relaxed day vibes" },
    { id: "work", label: "Work", icon: Briefcase, color: "#1A1A1A", description: "Professional edge" },
    { id: "evening", label: "Evening", icon: Moon, color: "#7C3AED", description: "Night out ready" },
    { id: "active", label: "Active", icon: Dumbbell, color: "#10B981", description: "Move & groove" },
    { id: "event", label: "Event", icon: PartyPopper, color: "#F59E0B", description: "Special occasion" },
    { id: "cozy", label: "Cozy", icon: Snowflake, color: "#80163A", description: "Comfort first" },
];

// Category mappings for moods
const moodCategories: Record<string, string[]> = {
    casual: ["tops", "t-shirts", "jeans", "sneakers", "denim"],
    work: ["blazers", "shirts", "trousers", "dresses", "blouses"],
    evening: ["dresses", "blazers", "heels", "accessories", "skirts"],
    active: ["activewear", "sportswear", "sneakers", "jackets", "hoodies"],
    event: ["dresses", "suits", "heels", "accessories", "formal"],
    cozy: ["sweaters", "hoodies", "joggers", "loungewear", "knits"],
};

export function HomePage() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Data Hooks
    const savedLocation = typeof window !== 'undefined' ? localStorage.getItem("weatherLocation") || undefined : undefined;
    const [coords, setCoords] = useState<string | undefined>(undefined);

    // Auto-detect location if not saved
    useEffect(() => {
        if (!savedLocation && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setCoords(`${position.coords.latitude},${position.coords.longitude}`);
            });
        }
    }, [savedLocation]);

    const { data: weather, isLoading: weatherLoading } = useWeather(savedLocation || coords);
    const { data: wardrobeItems, isLoading: wardrobeLoading } = useWardrobeItems();
    const { data: outfits, isLoading: outfitsLoading } = useOutfits();
    const [showWeatherModal, setShowWeatherModal] = useState(false);

    // AI Outfit Generator State
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [generatedOutfit, setGeneratedOutfit] = useState<WardrobeItem[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Existing Daily Look State (for when user has outfits)
    const [dailyLook, setDailyLook] = useState<Outfit | null>(null);

    // Update time
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    // Daily Look Logic (for users with existing outfits)
    useEffect(() => {
        if (outfits && outfits.length > 0 && !dailyLook) {
            generateDailyLook();
        }
    }, [outfits]);

    const generateDailyLook = () => {
        if (!outfits || outfits.length === 0) return;
        setIsGenerating(true);
        setTimeout(() => {
            const randomPick = outfits[Math.floor(Math.random() * outfits.length)];
            setDailyLook(randomPick);
            setIsGenerating(false);
        }, 600);
    };

    // AI Outfit Generation Logic
    const generateAIOutfit = () => {
        if (!selectedMood || !wardrobeItems || wardrobeItems.length === 0) return;

        setIsGenerating(true);
        setShowSuccess(false);

        setTimeout(() => {
            const moodCats = moodCategories[selectedMood] || [];
            const temp = weather?.temperature || 20;

            // Filter items by mood categories
            let matchingItems = wardrobeItems.filter(item => {
                const cat = item.category?.toLowerCase() || '';
                const name = item.name?.toLowerCase() || '';
                return moodCats.some(mc => cat.includes(mc) || name.includes(mc));
            });

            // If no matching items, use all items
            if (matchingItems.length === 0) {
                matchingItems = [...wardrobeItems];
            }

            // Weather-based filtering
            if (temp < 15) {
                // Cold: prefer warm items
                const warmItems = matchingItems.filter(i =>
                    ['jacket', 'sweater', 'coat', 'hoodie', 'knit'].some(w =>
                        i.category?.toLowerCase().includes(w) || i.name?.toLowerCase().includes(w)
                    )
                );
                if (warmItems.length > 0) matchingItems = [...warmItems, ...matchingItems];
            }

            // Shuffle and pick 3-4 items
            const shuffled = [...matchingItems].sort(() => Math.random() - 0.5);
            const count = Math.min(4, shuffled.length);
            const selected = shuffled.slice(0, count);

            setGeneratedOutfit(selected);
            setIsGenerating(false);
            setShowSuccess(true);

            // Hide success animation after delay
            setTimeout(() => setShowSuccess(false), 2000);
        }, 1200);
    };

    const regenerateOutfit = () => {
        if (selectedMood) {
            generateAIOutfit();
        }
    };

    const getItemImage = (itemId: number) => {
        return wardrobeItems?.find(i => i.id === itemId)?.imageUrl;
    };

    const isLoading = weatherLoading || wardrobeLoading || outfitsLoading;

    // Derived Data
    const recentItems = useMemo(() => wardrobeItems?.slice(0, 4) || [], [wardrobeItems]);
    const rediscoverItems = useMemo(() => {
        if (!wardrobeItems || wardrobeItems.length < 3) return [];
        return [...wardrobeItems].sort(() => 0.5 - Math.random()).slice(0, 3);
    }, [wardrobeItems]);

    const formattedDate = currentTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    const handleSaveWeatherLocation = (newLocation: string) => {
        localStorage.setItem("weatherLocation", newLocation);
        window.location.reload();
    };

    // Weather icon helper
    const WeatherIcon = () => {
        const condition = weather?.condition?.toLowerCase() || '';
        if (condition.includes('rain') || condition.includes('drizzle')) return <CloudRain className="w-4 h-4" />;
        if (condition.includes('cloud')) return <Cloud className="w-4 h-4" />;
        return <Sun className="w-4 h-4" />;
    };

    // Check if user has wardrobe items but no outfits
    const hasWardrobeNoOutfits = (wardrobeItems?.length || 0) > 0 && (outfits?.length || 0) === 0;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin" />
                    <p className="text-xs uppercase tracking-widest text-gray-400">Loading Atelier...</p>
                </div>
            </div>
        );
    }

    return (
        <AppLayout>
            <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8">

                {/* ========================================== */}
                {/* 1. HEADER WITH COMPACT WEATHER STRIP */}
                {/* ========================================== */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                >
                    {/* Top Row: Date + Weather Pill */}
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">
                            {formattedDate}
                        </p>

                        {/* Compact Weather Pill */}
                        <button
                            onClick={() => setShowWeatherModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1A1A] text-white text-xs font-medium hover:bg-[#333] transition-colors"
                        >
                            <WeatherIcon />
                            <span>{weather?.temperature || '--'}°</span>
                            <span className="text-white/60 hidden sm:inline">•</span>
                            <span className="text-white/60 hidden sm:inline truncate max-w-[80px]">{weather?.location || 'Set Location'}</span>
                        </button>
                    </div>

                    {/* Greeting */}
                    <div>
                        <h1 className="text-3xl md:text-5xl text-[#1A1A1A] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {currentTime.getHours() < 12 ? 'Good Morning' : currentTime.getHours() < 18 ? 'Good Afternoon' : 'Good Evening'},
                            <br />
                            <span className="italic text-gray-400">{user?.username || 'Style Icon'}</span>
                        </h1>
                    </div>
                </motion.header>


                {/* ========================================== */}
                {/* 2. DAILY LOOK HERO / AI OUTFIT GENERATOR */}
                {/* ========================================== */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative rounded-[28px] bg-gradient-to-br from-[#FAF9F6] to-[#F5F4F0] border border-gray-100 overflow-hidden"
                >
                    {/* User has outfits - show daily look */}
                    {dailyLook ? (
                        <div className="flex flex-col md:flex-row h-full min-h-[400px] md:min-h-[450px]">
                            {/* Left: Info */}
                            <div className="flex flex-col justify-between p-6 md:p-10 md:w-[40%] z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-[#80163A] animate-pulse" />
                                        <p className="text-[10px] font-bold text-[#80163A] uppercase tracking-[0.2em]">
                                            Today's Look
                                        </p>
                                    </div>

                                    <h2 className="text-2xl md:text-4xl text-[#1A1A1A] mb-3 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {dailyLook.name}
                                    </h2>

                                    <p className="text-sm text-gray-500 leading-relaxed mb-2">
                                        Curated for {weather?.condition?.toLowerCase() || 'today'}'s weather.
                                    </p>

                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Sparkles className="w-3 h-3" />
                                        <span>{(dailyLook.items?.length || 0)} pieces • AI Matched</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <Link href="/outfits" className="flex-1">
                                        <button className="w-full h-11 bg-[#1A1A1A] text-white rounded-xl font-medium text-xs tracking-wide uppercase hover:bg-[#333] transition-colors shadow-lg shadow-black/10">
                                            Wear Today
                                        </button>
                                    </Link>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); generateDailyLook(); }}
                                        disabled={isGenerating}
                                        className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all"
                                    >
                                        <Shuffle className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Right: Images */}
                            <div className="flex-1 p-4 md:p-6 flex items-center justify-center">
                                <div className="grid grid-cols-2 gap-3 w-full max-w-[350px]">
                                    {(Array.isArray(dailyLook.items) ? dailyLook.items : []).slice(0, 4).map((itemId, idx) => (
                                        <motion.div
                                            key={itemId}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.1 * idx }}
                                            className={`relative aspect-square rounded-2xl bg-white shadow-lg shadow-gray-200/50 overflow-hidden ${idx === 0 ? 'col-span-2 aspect-[2/1]' : ''}`}
                                        >
                                            {getItemImage(itemId) ? (
                                                <img
                                                    src={getItemImage(itemId)!}
                                                    alt="Outfit piece"
                                                    className="w-full h-full object-contain p-3"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Shirt className="w-8 h-8 text-gray-200" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : hasWardrobeNoOutfits ? (
                        /* AI OUTFIT GENERATOR - User has wardrobe but no outfits */
                        <div className="p-6 md:p-10 min-h-[480px] md:min-h-[500px]">
                            {!generatedOutfit ? (
                                /* MOOD SELECTION STATE */
                                <div className="flex flex-col h-full">
                                    {/* Header */}
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#80163A]/10 to-purple-500/10 mb-4">
                                            <Wand2 className="w-4 h-4 text-[#80163A]" />
                                            <span className="text-xs font-bold text-[#80163A] uppercase tracking-wider">AI Style Curator</span>
                                        </div>
                                        <h2 className="text-2xl md:text-4xl text-[#1A1A1A] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            What's your vibe today?
                                        </h2>
                                        <p className="text-sm text-gray-400 max-w-md mx-auto">
                                            Select your mood and let our AI curate the perfect outfit from your wardrobe
                                        </p>
                                    </div>

                                    {/* Mood Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto w-full mb-8">
                                        {moods.map((mood) => {
                                            const MoodIcon = mood.icon;
                                            const isSelected = selectedMood === mood.id;
                                            return (
                                                <motion.button
                                                    key={mood.id}
                                                    onClick={() => setSelectedMood(mood.id)}
                                                    className={`relative p-4 md:p-5 rounded-2xl border-2 transition-all group ${isSelected
                                                        ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-lg shadow-black/10'
                                                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                                                        }`}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-gray-100'}`}
                                                        >
                                                            <MoodIcon
                                                                className="w-5 h-5"
                                                                style={{ color: isSelected ? 'white' : mood.color }}
                                                            />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-[#1A1A1A]'}`}>
                                                                {mood.label}
                                                            </p>
                                                            <p className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                                                                {mood.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#80163A] flex items-center justify-center"
                                                        >
                                                            <Check className="w-3 h-3 text-white" />
                                                        </motion.div>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {/* Weather Context */}
                                    {weather && (
                                        <div className="text-center mb-6">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 text-xs text-gray-500">
                                                <WeatherIcon />
                                                <span>Styling for {weather.temperature}° {weather.condition || 'weather'}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Generate Button */}
                                    <div className="mt-auto text-center">
                                        <motion.button
                                            onClick={generateAIOutfit}
                                            disabled={!selectedMood || isGenerating}
                                            className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm uppercase tracking-wider transition-all ${selectedMood
                                                ? 'bg-gradient-to-r from-[#80163A] to-[#a02050] text-white hover:shadow-xl hover:shadow-[#80163A]/20 cursor-pointer'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                            whileHover={selectedMood ? { scale: 1.02 } : {}}
                                            whileTap={selectedMood ? { scale: 0.98 } : {}}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Curating Your Look...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5" />
                                                    <span>Style Me</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            ) : (
                                /* GENERATED OUTFIT DISPLAY */
                                <div className="flex flex-col md:flex-row h-full gap-6">
                                    {/* Left: Info */}
                                    <div className="flex flex-col md:w-[40%]">
                                        <div className="flex items-center gap-2 mb-4">
                                            <AnimatePresence>
                                                {showSuccess && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                        className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                                                    >
                                                        <Check className="w-4 h-4 text-white" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <div className="w-2 h-2 rounded-full bg-[#80163A] animate-pulse" />
                                            <p className="text-[10px] font-bold text-[#80163A] uppercase tracking-[0.2em]">
                                                AI Curated Look
                                            </p>
                                        </div>

                                        <h2 className="text-2xl md:text-3xl text-[#1A1A1A] mb-3 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            Your {moods.find(m => m.id === selectedMood)?.label} Look
                                        </h2>

                                        <p className="text-sm text-gray-500 leading-relaxed mb-2">
                                            Curated from your wardrobe for {weather?.condition?.toLowerCase() || 'today'}'s {weather?.temperature || '--'}° weather.
                                        </p>

                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                                            <Sparkles className="w-3 h-3" />
                                            <span>{generatedOutfit.length} pieces selected</span>
                                        </div>

                                        <div className="flex gap-3 mt-auto">
                                            <Link href="/compose" className="flex-1">
                                                <button className="w-full h-11 bg-[#1A1A1A] text-white rounded-xl font-medium text-xs tracking-wide uppercase hover:bg-[#333] transition-colors shadow-lg shadow-black/10">
                                                    Save as Outfit
                                                </button>
                                            </Link>
                                            <button
                                                onClick={regenerateOutfit}
                                                disabled={isGenerating}
                                                className="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all"
                                            >
                                                <Shuffle className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => { setGeneratedOutfit(null); setSelectedMood(null); }}
                                            className="mt-4 text-xs text-gray-400 hover:text-[#80163A] transition-colors"
                                        >
                                            ← Choose different mood
                                        </button>
                                    </div>

                                    {/* Right: Generated Items Grid */}
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="grid grid-cols-2 gap-3 w-full max-w-[350px]">
                                            {generatedOutfit.map((item, idx) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    transition={{ delay: 0.15 * idx, type: "spring", stiffness: 200 }}
                                                    className={`relative rounded-2xl bg-white shadow-lg shadow-gray-200/50 overflow-hidden ${idx === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}
                                                >
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-full h-full object-contain p-3"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Shirt className="w-8 h-8 text-gray-200" />
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-2 left-2 right-2 py-1.5 px-2 bg-white/90 backdrop-blur-sm rounded-lg">
                                                        <p className="text-[10px] font-medium text-[#1A1A1A] truncate">{item.name}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* EMPTY STATE - No wardrobe items */
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#80163A]/10 to-[#1A1A1A]/10 flex items-center justify-center mb-6">
                                <Layers className="w-8 h-8 text-[#80163A]" />
                            </div>
                            <h3 className="text-2xl text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Start Your Collection
                            </h3>
                            <p className="text-gray-400 text-sm mb-6 max-w-[280px]">
                                Add clothes to your wardrobe and let our AI create stunning outfits for you.
                            </p>
                            <Link href="/wardrobe">
                                <button className="px-6 py-3 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#80163A] transition-colors">
                                    Add First Item
                                </button>
                            </Link>
                        </div>
                    )}
                </motion.section>


                {/* ========================================== */}
                {/* 3. QUICK ACTIONS - MINIMAL TEXT STYLE */}
                {/* ========================================== */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="py-6 border-y border-gray-100"
                >
                    <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                        {[
                            { label: "Add to Wardrobe", href: "/wardrobe" },
                            { label: "Create Look", href: "/compose" },
                            { label: "Plan a Trip", href: "/trips" },
                            { label: "View Calendar", href: "/calendar" },
                        ].map((action, i) => (
                            <Link key={i} href={action.href}>
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F5F4F0] transition-colors cursor-pointer group whitespace-nowrap">
                                    <span className="text-[10px] font-mono text-gray-300 group-hover:text-[#80163A] transition-colors">
                                        0{i + 1}
                                    </span>
                                    <span className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#80163A] transition-colors">
                                        {action.label}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.section>


                {/* ========================================== */}
                {/* 4. DISCOVERY SECTION */}
                {/* ========================================== */}
                <motion.section
                    className="grid md:grid-cols-2 gap-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {/* Recent Items */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg text-[#1A1A1A] font-semibold">New In Wardrobe</h3>
                            <Link href="/wardrobe">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#80163A] cursor-pointer hover:underline">View All</span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {recentItems.slice(0, 4).map((item) => (
                                <Link key={item.id} href="/wardrobe">
                                    <div className="aspect-square rounded-2xl bg-white border border-gray-100 overflow-hidden relative group cursor-pointer hover:shadow-lg transition-shadow">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Shirt className="w-8 h-8 text-gray-200" />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                            {recentItems.length === 0 && (
                                <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-xs text-gray-400 mb-2">Your wardrobe is empty</p>
                                    <Link href="/wardrobe"><span className="text-xs font-bold text-[#80163A] underline cursor-pointer">Add Items</span></Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rediscover */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg text-[#1A1A1A] font-semibold">Rediscover</h3>
                            <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400">Hidden Gems</span>
                        </div>
                        <div className="space-y-3">
                            {rediscoverItems.map((item) => (
                                <Link key={item.id} href="/wardrobe">
                                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-gray-100 hover:border-[#1A1A1A] transition-colors cursor-pointer group">
                                        <div className="w-14 h-14 rounded-xl bg-[#FAF9F6] overflow-hidden shrink-0">
                                            {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-contain p-1" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#1A1A1A] truncate group-hover:text-[#80163A] transition-colors">{item.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.category} • {item.brand || 'No brand'}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </Link>
                            ))}
                            {rediscoverItems.length === 0 && (
                                <div className="py-8 text-center text-xs text-gray-400">
                                    Add more items to discover hidden gems
                                </div>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* Weather Modal */}
                <WeatherLocationModal
                    isOpen={showWeatherModal}
                    onClose={() => setShowWeatherModal(false)}
                    currentLocation={savedLocation || ""}
                    onSave={handleSaveWeatherLocation}
                />
            </div>
        </AppLayout>
    );
}

export default HomePage;
