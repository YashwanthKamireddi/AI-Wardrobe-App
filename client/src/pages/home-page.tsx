import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWeather } from "@/hooks/use-weather";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";
import WeatherLocationModal from "@/components/weather-location-modal";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Plus, Sparkles, MapPin, Shirt, Shuffle, Layers, Camera, Plane, Cloud, Sun, CloudRain, ArrowRight } from "lucide-react";
import type { Outfit } from "@shared/schema";

/**
 * HOME PAGE V6 - "FOCUS ON FASHION"
 *
 * Redesign:
 * - Compact weather strip in header (not a giant widget)
 * - Full-width Daily Look Hero
 * - Streamlined quick actions
 * - Clean discovery section
 */

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

    // Use saved location OR coordinates
    const { data: weather, isLoading: weatherLoading } = useWeather(savedLocation || coords);

    const { data: wardrobeItems, isLoading: wardrobeLoading } = useWardrobeItems();
    const { data: outfits, isLoading: outfitsLoading } = useOutfits();
    const [showWeatherModal, setShowWeatherModal] = useState(false);

    // State for Daily Look
    const [dailyLook, setDailyLook] = useState<Outfit | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

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
                    <div className="flex items-end justify-between">
                        <h1 className="text-3xl md:text-5xl text-[#1A1A1A] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {currentTime.getHours() < 12 ? 'Good Morning' : currentTime.getHours() < 18 ? 'Good Afternoon' : 'Good Evening'},
                            <br />
                            <span className="italic text-gray-400">{user?.username || 'Style Icon'}</span>
                        </h1>

                        <Link href="/profile">
                            <div className="w-11 h-11 rounded-full border border-gray-200 p-0.5 cursor-pointer hover:border-[#1A1A1A] transition-colors shrink-0">
                                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#80163A] to-[#1A1A1A]">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-sm font-medium">
                                            {user?.username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </div>
                </motion.header>


                {/* ========================================== */}
                {/* 2. DAILY LOOK HERO - FULL WIDTH */}
                {/* ========================================== */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative rounded-[28px] bg-gradient-to-br from-[#FAF9F6] to-[#F5F4F0] border border-gray-100 overflow-hidden min-h-[400px] md:min-h-[450px]"
                >
                    {dailyLook ? (
                        <div className="flex flex-col md:flex-row h-full">
                            {/* Left: Outfit Info & Actions */}
                            <div className="flex flex-col justify-between p-6 md:p-10 md:w-[40%] z-10 relative">
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

                            {/* Right: Outfit Images Grid */}
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
                    ) : (
                        // Empty State
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#80163A]/10 to-[#1A1A1A]/10 flex items-center justify-center mb-6">
                                <Layers className="w-8 h-8 text-[#80163A]" />
                            </div>
                            <h3 className="text-2xl text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Your Style Awaits
                            </h3>
                            <p className="text-gray-400 text-sm mb-6 max-w-[280px]">
                                Create your first outfit to get personalized daily recommendations.
                            </p>
                            <Link href="/compose">
                                <button className="px-6 py-3 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#80163A] transition-colors">
                                    Create Outfit
                                </button>
                            </Link>
                        </div>
                    )}
                </motion.section>


                {/* ========================================== */}
                {/* 3. QUICK ACTIONS - HORIZONTAL GRID */}
                {/* ========================================== */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                >
                    {[
                        { icon: Plus, label: "Add Item", href: "/wardrobe", color: "bg-[#80163A]" },
                        { icon: Layers, label: "Create Look", href: "/compose", color: "bg-[#1A1A1A]" },
                        { icon: Camera, label: "Log Outfit", href: "/wardrobe", color: "bg-emerald-600" },
                        { icon: Plane, label: "Trip Packer", href: "/trips", color: "bg-indigo-600" },
                    ].map((action, i) => (
                        <Link key={i} href={action.href}>
                            <div className="relative h-20 rounded-2xl bg-white border border-gray-100 p-4 flex items-center gap-3 cursor-pointer hover:border-[#1A1A1A] hover:shadow-lg transition-all group overflow-hidden">
                                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform`}>
                                    <action.icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-semibold text-[#1A1A1A]">{action.label}</span>
                                <ArrowRight className="w-4 h-4 text-gray-300 absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </Link>
                    ))}
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
