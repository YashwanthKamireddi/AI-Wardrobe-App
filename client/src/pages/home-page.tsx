import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWeather } from "@/hooks/use-weather";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";
import WeatherLocationModal from "@/components/weather-location-modal";
import { WeatherPill } from "@/components/home/weather-pill";
import { AtelierSection } from "@/components/home/atelier-section";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/app-layout";
import { Sparkles, Shirt, Shuffle, Layers, Cloud, Sun, CloudRain, ArrowRight, Coffee, Briefcase, Moon, Dumbbell, PartyPopper, Snowflake, Wand2, Check, X, Save } from "lucide-react";
import type { Outfit, WardrobeItem } from "@shared/schema";

/**
 * HOME PAGE V8 - "DIGITAL STYLIST 2.0 (COMMAND CENTER)"
 *
 * Features:
 * - Occasion & Vibe based styling
 * - Anchor Item (Build around this stroke)
 * - Item Locking & Smart Swaps
 */

// 1. New Constants for Command Center
const occasions = [
    { id: "work", label: "Workplace", icon: Briefcase, color: "#1A1A1A" },
    { id: "date", label: "Date Night", icon: Moon, color: "#80163A" },
    { id: "casual", label: "Casual Day", icon: Coffee, color: "#6B7280" },
    { id: "event", label: "Special Event", icon: PartyPopper, color: "#F59E0B" },
    { id: "gym", label: "Workout", icon: Dumbbell, color: "#10B981" },
];

const vibes = [
    { id: "minimal", label: "Minimalist", description: "Clean lines, neutral tones" },
    { id: "bold", label: "Bold & Expressive", description: "Vibrant colors, statement pieces" },
    { id: "classic", label: "Timeless Classic", description: "Elegant, polished essentials" },
];

// Mappings for generation logic
const occasionRules: Record<string, string[]> = {
    work: ["blazers", "shirts", "trousers", "loafers", "pumps"],
    date: ["dresses", "skirts", "heels", "blouses", "boots", "jacket"],
    casual: ["jeans", "t-shirts", "sneakers", "denim", "knitwear"],
    event: ["suits", "dresses", "heels", "formal", "clutch"],
    gym: ["activewear", "leggings", "sports bra", "hoodie", "trainers"],
};

export function HomePage() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Data Hooks
    const savedLocation = typeof window !== 'undefined' ? localStorage.getItem("weatherLocation") || undefined : undefined;
    const [coords, setCoords] = useState<string | undefined>(undefined);

    // Auto-detect location
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

    // AI STYLIST 2.0 STATE
    const [selectedOccasion, setSelectedOccasion] = useState<string>("casual");
    const [selectedVibe, setSelectedVibe] = useState<string>("minimal");
    const [anchorItem, setAnchorItem] = useState<WardrobeItem | null>(null);
    const [generatedOutfit, setGeneratedOutfit] = useState<WardrobeItem[] | null>(null);
    const [lockedItemIds, setLockedItemIds] = useState<Set<number>>(new Set());

    const [isGenerating, setIsGenerating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showAnchorModal, setShowAnchorModal] = useState(false);
    const [showFullReveal, setShowFullReveal] = useState(false); // New state for overlay

    // Existing Daily Look State
    const [dailyLook, setDailyLook] = useState<Outfit | null>(null);

    // Update time
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    // Daily Look Logic
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

    // ------------------------------------------------------------------
    // CORE LOGIC: CONSTRAINT_BASED GENERATION (DIGITAL STYLIST ENGINE)
    // ------------------------------------------------------------------
    const generateAIOutfit = () => {
        if (!wardrobeItems || wardrobeItems.length === 0) return;

        setIsGenerating(true);
        setShowSuccess(false);
        setShowFullReveal(false);

        // Simulate AI Processing time
        setTimeout(() => {
            const rules = occasionRules[selectedOccasion] || [];
            let pool = [...wardrobeItems];

            // 1. FILTER: By Occasion
            const occasionMatches = pool.filter(item => {
                const cat = (item.category || "").toLowerCase();
                const name = (item.name || "").toLowerCase();
                return rules.some(r => cat.includes(r) || name.includes(r));
            });
            if (occasionMatches.length >= 2) {
                pool = occasionMatches;
            }

            // 2. FILTER: By Vibe
            if (selectedVibe === "minimal") {
                pool.sort(() => Math.random() - 0.3);
            } else if (selectedVibe === "bold") {
                pool.sort(() => Math.random() - 0.7);
            }

            // 3. ANCHOR LOGIC
            let initialSelection: WardrobeItem[] = [];

            if (anchorItem) {
                initialSelection.push(anchorItem);
                pool = pool.filter(i => i.id !== anchorItem.id);
                const anchorCat = (anchorItem.category || "").toLowerCase();
                const isTop = ["shirt", "top", "blouse", "tee", "sweater"].some(c => anchorCat.includes(c));
                const isBottom = ["pants", "trouser", "jean", "skirt"].some(c => anchorCat.includes(c));

                if (isTop) {
                    pool = pool.filter(i => !["shirt", "top", "blouse", "tee", "sweater"].some(c => (i.category || "").toLowerCase().includes(c)));
                } else if (isBottom) {
                    pool = pool.filter(i => !["pants", "trouser", "jean", "skirt"].some(c => (i.category || "").toLowerCase().includes(c)));
                }
            } else {
                if (generatedOutfit && lockedItemIds.size > 0) {
                    const locked = generatedOutfit.filter(i => lockedItemIds.has(i.id));
                    initialSelection = [...locked];
                    const lockedIds = new Set(locked.map(i => i.id));
                    pool = pool.filter(i => !lockedIds.has(i.id));
                }
            }

            // 4. FILL THE REST
            const targetCount = 4;
            const slotsNeeded = targetCount - initialSelection.length;

            if (slotsNeeded > 0) {
                const shuffled = pool.sort(() => Math.random() - 0.5);
                for (const candidate of shuffled) {
                    if (initialSelection.length >= targetCount) break;
                    initialSelection.push(candidate);
                }
            }

            setGeneratedOutfit(initialSelection);
            setIsGenerating(false);
            setShowSuccess(true);
            setShowFullReveal(true); // Trigger Full Screen Reveal
            setTimeout(() => setShowSuccess(false), 2000);

        }, 1200); // Slightly longer for dramatic effect
    };

    // ITEM LOCKING TOGGLE
    const toggleLockItem = (itemId: number) => {
        setLockedItemIds(prev => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            return next;
        });
    };

    const regenerateOutfit = () => {
        generateAIOutfit();
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

    const WeatherIcon = () => {
        const condition = weather?.condition?.toLowerCase() || '';
        if (condition.includes('rain') || condition.includes('drizzle')) return <CloudRain className="w-4 h-4" />;
        if (condition.includes('cloud')) return <Cloud className="w-4 h-4" />;
        return <Sun className="w-4 h-4" />;
    };

    const hasWardrobeItems = (wardrobeItems?.length || 0) > 0;

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
            <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 relative">

                {/* ========================================== */}
                {/* 1. HEADER */}
                {/* ========================================== */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">
                            {format(currentTime, 'EEEE, MMMM do')}
                        </p>
                        <WeatherPill
                            temperature={weather?.temperature}
                            condition={weather?.condition}
                            location={weather?.location}
                            onClick={() => setShowWeatherModal(true)}
                        />
                    </div>

                    <div>
                        <h1 className="text-3xl md:text-5xl text-[#1A1A1A] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {currentTime.getHours() < 12 ? 'Good Morning' : currentTime.getHours() < 18 ? 'Good Afternoon' : 'Good Evening'},
                            <br />
                            <span className="italic text-gray-400">{user?.username || 'Style Icon'}</span>
                        </h1>
                    </div>
                </motion.header>


                {/* ========================================== */}
                {/* 2. THE ATELIER (COMMAND CENTER)            */}
                {/* ========================================== */}
                {/* ========================================== */}
                {/* 2. THE ATELIER (COMMAND CENTER)            */}
                {/* ========================================== */}
                <AtelierSection
                    hasWardrobeItems={hasWardrobeItems}
                    selectedOccasion={selectedOccasion}
                    setSelectedOccasion={setSelectedOccasion}
                    selectedVibe={selectedVibe}
                    setSelectedVibe={setSelectedVibe}
                    anchorItem={anchorItem}
                    setAnchorItem={setAnchorItem}
                    setShowAnchorModal={setShowAnchorModal}
                    generateAIOutfit={generateAIOutfit}
                    isGenerating={isGenerating}
                />

                {/* ========================================== */}
                {/* 3. QUICK ACTIONS & DISCOVERY              */}
                {/* ========================================== */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="py-6 border-y border-gray-100"
                >
                    <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                        {[
                            { label: "My Wardrobe", href: "/wardrobe" },
                            { label: "Saved Looks", href: "/calendar" }, // Assuming saved looks live here or are accessible
                            { label: "Trip Planner", href: "/trips" },
                        ].map((action, i) => (
                            <Link key={i} href={action.href}>
                                <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-gray-50 hover:bg-[#F5F4F0] transition-colors cursor-pointer group whitespace-nowrap min-w-[140px] justify-center">
                                    <span className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#80163A] transition-colors">
                                        {action.label}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.section>

                <motion.section
                    className="grid md:grid-cols-2 gap-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {/* Recent Items */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg text-[#1A1A1A] font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>New In</h3>
                            <Link href="/wardrobe">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#80163A] cursor-pointer hover:underline">View All</span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {recentItems.slice(0, 4).map((item) => (
                                <Link key={item.id} href="/wardrobe">
                                    <div className="aspect-square rounded-xl bg-white border border-gray-100 overflow-hidden relative group cursor-pointer hover:shadow-md transition-all">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Shirt className="w-6 h-6 text-gray-200" />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                    {/* Rediscover */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg text-[#1A1A1A] font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>Rediscover</h3>
                        </div>
                        <div className="space-y-3">
                            {rediscoverItems.map((item) => (
                                <Link key={item.id} href="/wardrobe">
                                    <div className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
                                        <div className="w-12 h-12 rounded-lg bg-[#FAF9F6] overflow-hidden shrink-0">
                                            {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-contain p-1" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.brand || 'No brand'}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
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
            </div >

            {/* ========================================================================= */}
            {/* FULL SCREEN REVEAL OVERLAY (THE ATELIER RESULT)                           */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {showFullReveal && generatedOutfit && generatedOutfit.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // Luxury Ease
                        className="fixed inset-0 z-[9999] bg-[#FAF9F6] flex flex-col"
                    >
                        {/* Dynamic Background Blur */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full blur-[100px] opacity-30 mix-blend-multiply"
                                style={{ background: `linear-gradient(135deg, ${occasions.find(o => o.id === selectedOccasion)?.color || '#80163A'}, transparent)` }}
                            />
                        </div>

                        {/* CONTENT WRAPPER */}
                        <div className="relative flex-1 flex flex-col w-full h-full overflow-y-auto z-10">

                            {/* OVERLAY HEADER */}
                            <div className="flex-none flex justify-between items-center px-6 py-6 md:px-12 md:py-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: occasions.find(o => o.id === selectedOccasion)?.color }} />
                                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">
                                            {selectedVibe} Edit
                                        </span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                        {occasions.find(o => o.id === selectedOccasion)?.label}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowFullReveal(false)}
                                    className="w-12 h-12 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-all hover:rotate-90 shadow-sm"
                                >
                                    <X className="w-5 h-5 text-[#1A1A1A]" />
                                </button>
                            </div>

                            {/* OUTFIT GRID */}
                            <div className="flex-1 flex flex-col justify-center py-10 px-4">
                                <div className="max-w-5xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 justify-items-center">
                                    {generatedOutfit.map((item, idx) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 40 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + (idx * 0.1), duration: 0.6 }}
                                            className={`relative w-full aspect-[3/4] md:aspect-[4/5] bg-white rounded-[2rem] shadow-xl shadow-black/5 flex flex-col items-center p-6 border border-white/40 backdrop-blur-sm
                                                ${lockedItemIds.has(item.id) ? 'ring-2 ring-[#80163A]/20' : ''}
                                            `}
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleLockItem(item.id); }}
                                                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Save className={`w-4 h-4 ${lockedItemIds.has(item.id) ? 'fill-[#80163A] text-[#80163A]' : 'text-gray-400'}`} />
                                            </button>

                                            <div className="flex-1 w-full flex items-center justify-center mb-4">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        className="max-w-full max-h-full object-contain drop-shadow-2xl mix-blend-multiply transition-transform duration-700 hover:scale-105"
                                                        alt={item.name}
                                                    />
                                                ) : (
                                                    <Shirt className="w-12 h-12 text-gray-200" />
                                                )}
                                            </div>

                                            <div className="text-center w-full">
                                                <p className="text-xs font-bold text-[#1A1A1A] truncate w-full mb-1">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.brand || 'Unknown'}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* ACTION BAR */}
                            <div className="flex-none pb-12 pt-6 px-6 bg-gradient-to-t from-[#FAF9F6] to-transparent">
                                <div className="max-w-sm mx-auto flex items-center gap-3">
                                    <Link href="/compose" className="flex-1">
                                        <button className="w-full h-14 bg-[#1A1A1A] text-white rounded-2xl font-medium text-xs tracking-[0.15em] uppercase hover:bg-[#333] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-black/20">
                                            <Check className="w-4 h-4" />
                                            <span>Accept Edit</span>
                                        </button>
                                    </Link>
                                    <button
                                        onClick={regenerateOutfit}
                                        disabled={isGenerating}
                                        className="h-14 w-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                        <Shuffle className={`w-5 h-5 text-[#1A1A1A] ${isGenerating ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </AppLayout >
    );
}

export default HomePage;
