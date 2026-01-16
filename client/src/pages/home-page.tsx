import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWeather } from "@/hooks/use-weather";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";
import WeatherLocationModal from "@/components/weather-location-modal";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import {
    MapPin,
    Sparkles,
    ArrowRight,
    Shirt,
    Plus,
    Camera,
    Layers,
    Shuffle,
    Plane
} from "lucide-react";
import type { Outfit } from "@shared/schema";

/**
 * HOME PAGE V5 - "THE DESIGNER'S DESK"
 *
 * Changes:
 * - High Contrast Weather Widget
 * - "Collage" style Daily Pick
 * - Refined Typography & Spacing
 */

export function HomePage() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Data Hooks
    const weatherLocation = typeof window !== 'undefined' ? localStorage.getItem("weatherLocation") || undefined : undefined;
    const { data: weather, isLoading: weatherLoading } = useWeather(weatherLocation);
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
            // Simple random for now, but with "thinking" delay
            const randomPick = outfits[Math.floor(Math.random() * outfits.length)];
            setDailyLook(randomPick);
            setIsGenerating(false);
        }, 600);
    };

    const getItemImage = (itemId: number) => {
        return wardrobeItems?.find(i => i.id === itemId)?.imageUrl;
    };

    const isLoading = weatherLoading || wardrobeLoading || outfitsLoading;

    // Derived Data for "Discovery"
    const recentItems = useMemo(() => wardrobeItems?.slice(0, 5) || [], [wardrobeItems]);
    const rediscoverItems = useMemo(() => {
        if (!wardrobeItems || wardrobeItems.length < 5) return [];
        return [...wardrobeItems].sort(() => 0.5 - Math.random()).slice(0, 5);
    }, [wardrobeItems]);

    const formattedDate = currentTime.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    }).toUpperCase();

    const handleSaveWeatherLocation = (newLocation: string) => {
        localStorage.setItem("weatherLocation", newLocation);
        window.location.reload();
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
            <div className="w-full max-w-5xl mx-auto px-6 py-8 md:py-12 space-y-16">

                {/* 1. HEADER */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-between items-end border-b border-gray-100 pb-8"
                >
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.25em] text-[#80163A] mb-3 uppercase">
                            {formattedDate}
                        </p>
                        <h1 className="text-4xl md:text-6xl text-[#1A1A1A] leading-[1.1]" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'},<br />
                            <span className="italic text-gray-400">{user?.username || 'Style Icon'}</span>.
                        </h1>
                    </div>
                    <Link href="/profile">
                        <div className="hidden md:block w-14 h-14 rounded-full border border-gray-200 p-1 cursor-pointer hover:border-[#1A1A1A] transition-colors">
                            <div className="w-full h-full rounded-full overflow-hidden bg-[#1A1A1A]">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-lg">
                                        {user?.username?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                </motion.header>


                {/* 2. HERO: WEATHER & LOOK */}
                <section className="grid lg:grid-cols-12 gap-6 items-stretch">

                    {/* WEATHER (Left) */}
                    <motion.div
                        className="lg:col-span-5 relative min-h-[380px] h-full rounded-[24px] bg-[#0F0F0F] text-white p-8 flex flex-col justify-between overflow-hidden group cursor-pointer shadow-2xl shadow-black/20 ring-1 ring-white/10"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => setShowWeatherModal(true)}
                    >
                        {/* Gradient Orbs - Enhanced for depth */}
                        <div className="absolute top-[-20%] right-[-20%] w-[350px] h-[350px] bg-[#80163A]/80 rounded-full blur-[120px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-indigo-900/80 rounded-full blur-[100px] opacity-40" />

                        {/* Grain Texture Overlay */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

                        <div className="relative z-10 flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-white/60" />
                                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-medium">
                                        {weatherLocation || "Select Location"}
                                    </p>
                                </div>
                                <h2 className="text-3xl font-medium tracking-tight text-white/90" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    {weather?.condition || "Clear Sky"}
                                </h2>
                            </div>
                        </div>

                        <div className="relative z-10 mt-auto">
                            <div className="flex items-baseline">
                                <span className="text-[100px] leading-none font-light tracking-tighter -ml-2 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    {weather?.temperature || 20}
                                </span>
                                <span className="text-3xl font-light text-white/50 ml-1">°</span>
                            </div>
                            <div className="h-px w-12 bg-white/20 my-4" />
                            <p className="text-sm text-white/80 font-light leading-relaxed max-w-[90%]">
                                "A quiet confidence in the air today."
                            </p>
                        </div>
                    </motion.div>

                    {/* DAILY LOOK (Right) */}
                    <motion.div
                        className="lg:col-span-7 relative flex flex-col justify-between min-h-[450px] lg:min-h-[380px] h-full rounded-[24px] bg-white border border-gray-100 p-6 md:p-8 shadow-xl shadow-gray-100/50 overflow-hidden"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {dailyLook ? (
                            <>
                                {/* HEADER */}
                                <div className="flex justify-between items-start mb-4 z-10 shrink-0">
                                    <div>
                                        <p className="text-[10px] font-bold text-[#80163A] uppercase tracking-[0.25em] mb-1">
                                            Daily Edit
                                        </p>
                                        <h3 className="text-2xl text-[#1A1A1A] line-clamp-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {dailyLook.name}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); generateDailyLook(); }}
                                        disabled={isGenerating}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent border border-gray-200 hover:border-[#1A1A1A] transition-all duration-300 disabled:opacity-50 group/refresh"
                                    >
                                        <Shuffle className={`w-4 h-4 text-gray-400 group-hover/refresh:text-[#1A1A1A] ${isGenerating ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>

                                {/* CONTENT - RESPONSIVE GALLERY */}
                                <div className="flex-1 min-h-0 relative mb-4">
                                    {(() => {
                                        const items = (Array.isArray(dailyLook.items) ? dailyLook.items : []).slice(0, 3);
                                        const count = items.length;

                                        const GalleryCard = ({ itemId, className = "" }: { itemId: number, className?: string }) => {
                                            const img = getItemImage(itemId);
                                            return (
                                                <div className={`relative w-full h-full rounded-xl bg-[#F8F8F8] border border-gray-100 flex items-center justify-center p-4 overflow-hidden ${className}`}>
                                                    {img ? (
                                                        <img
                                                            src={img}
                                                            alt="Outfit Item"
                                                            style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                                                            className="drop-shadow-sm transition-transform duration-500 hover:scale-105"
                                                        />
                                                    ) : (
                                                        <Shirt className="w-8 h-8 text-gray-300" />
                                                    )}
                                                </div>
                                            );
                                        };

                                        if (count === 0) return <div className="w-full h-full bg-gray-50 rounded-xl" />;

                                        return (
                                            <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-3">
                                                {/* Main Item */}
                                                <div className="lg:col-span-7 h-full">
                                                    <GalleryCard itemId={items[0]} />
                                                </div>

                                                {/* Secondary Items (Stacked on Desktop, row or hidden on mobile if space allows) */}
                                                {count > 1 && (
                                                    <div className="hidden lg:grid lg:col-span-5 grid-rows-2 gap-3 h-full">
                                                        <GalleryCard itemId={items[1]} />
                                                        {count > 2 && <GalleryCard itemId={items[2]} />}
                                                    </div>
                                                )}

                                                {/* Mobile Secondary (Show only 1 secondary item to save space) */}
                                                {count > 1 && (
                                                    <div className="lg:hidden grid grid-cols-2 gap-3 h-24">
                                                        <GalleryCard itemId={items[1]} />
                                                        {count > 2 && <GalleryCard itemId={items[2]} />}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* FOOTER ACTIONS */}
                                <div className="mt-auto shrink-0 pt-2 border-t border-gray-50">
                                    <Link href={`/outfits`}>
                                        <button className="w-full h-12 bg-[#1A1A1A] text-white rounded-xl font-bold text-[11px] tracking-[0.2em] uppercase hover:bg-[#80163A] transition-colors flex items-center justify-center gap-3 shadow-md shadow-gray-200">
                                            Wear This Look
                                        </button>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            // Empty State
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-[#FAF9F6] flex items-center justify-center mb-4 ring-1 ring-gray-100">
                                    <Layers className="w-6 h-6 text-gray-300" />
                                </div>
                                <h3 className="text-xl text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    Your Digital Atelier
                                </h3>
                                <p className="text-gray-400 text-xs mb-6 max-w-[200px] leading-relaxed">
                                    Start by adding items to your wardrobe. Your personal stylist is waiting.
                                </p>
                                <Link href="/compose">
                                    <button className="px-6 py-3 bg-[#1A1A1A] text-white rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#80163A] transition-colors">
                                        Enter Studio
                                    </button>
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </section>


                {/* 3. QUICK ACTIONS */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-4 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
                        {[
                            { icon: Camera, label: "Log Fit", sub: "Track Wear", href: "/wardrobe" },
                            { icon: Plus, label: "Add Item", sub: "New Piece", href: "/wardrobe" },
                            { icon: Layers, label: "Studio", sub: "Create", href: "/compose" },
                            { icon: Plane, label: "Trips", sub: "Packing", href: "/trips" },
                        ].map((action, i) => (
                            <Link key={i} href={action.href}>
                                <div className="min-w-[140px] flex-1 bg-white border border-gray-100 p-5 rounded-[24px] flex flex-col items-center gap-3 cursor-pointer hover:border-[#80163A] hover:shadow-xl hover:shadow-[#80163A]/5 transition-all group active:scale-95">
                                    <div className="w-10 h-10 rounded-full bg-[#FAF9F6] flex items-center justify-center group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors duration-300">
                                        <action.icon className="w-4 h-4" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[#1A1A1A] font-semibold text-sm mb-0.5">{action.label}</p>
                                        <p className="text-[9px] text-gray-400 uppercase tracking-widest">{action.sub}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.section>


                {/* 4. DISCOVERY & INSIGHTS */}
                <motion.section
                    className="grid md:grid-cols-2 gap-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {/* NEW IN */}
                    <div>
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
                            <h3 className="text-lg text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>New In</h3>
                            <Link href="/wardrobe"><span className="text-[10px] font-bold uppercase tracking-widest text-[#80163A] cursor-pointer">View All</span></Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {recentItems.slice(0, 2).map((item) => (
                                <Link key={item.id} href="/wardrobe">
                                    <div className="aspect-[3/4] rounded-2xl bg-white overflow-hidden relative group cursor-pointer border border-gray-100">
                                        {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                                            <p className="text-white text-xs font-medium truncate">{item.name}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {recentItems.length === 0 && (
                                <div className="col-span-2 py-8 text-center bg-[#FAF9F6] rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-xs text-gray-400 mb-2">Wardrobe is empty</p>
                                    <Link href="/wardrobe"><span className="text-xs font-bold underline cursor-pointer">Add Items</span></Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* REDISCOVER */}
                    <div>
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
                            <h3 className="text-lg text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>Rediscover</h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Hidden Gems</span>
                        </div>
                        <div className="space-y-3">
                            {rediscoverItems.slice(0, 3).map((item) => (
                                <Link key={item.id} href="/wardrobe">
                                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-gray-100 hover:border-[#1A1A1A] transition-colors cursor-pointer group">
                                        <div className="w-12 h-12 rounded-lg bg-[#FAF9F6] overflow-hidden shrink-0">
                                            {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#80163A] transition-colors">{item.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.category}</p>
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
                    currentLocation={weatherLocation || ""}
                    onSave={handleSaveWeatherLocation}
                />
            </div>
        </AppLayout>
    );
}

export default HomePage;
