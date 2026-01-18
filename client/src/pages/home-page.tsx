import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWeather } from "@/hooks/use-weather";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";
import WeatherLocationModal from "@/components/weather-location-modal";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/app-layout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Calendar, Search,
    Shirt, RefreshCw, ArrowUpRight, Maximize2, Settings,
    X, Layers, Loader2
} from "lucide-react";
import type { Outfit } from "@shared/schema";

/**
 * HOME PAGE - "QUIET LUXURY" EDITION
 *
 * Design Philosophy:
 * - Clean, editorial aesthetic matching Celura brand
 * - Warm off-white (#FDFBF7) background
 * - Minimalist interactions with premium feel
 * - Content-first: Wardrobe items are the interface
 */

// --- COMPONENTS ---

const ToolCard = ({ label, icon: Icon, onClick, href }: {
    label: string;
    icon: React.ElementType;
    onClick?: () => void;
    href?: string;
}) => {
    const Content = (
        <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-black/5 hover:border-black/10 hover:shadow-sm transition-all duration-300 h-full min-h-[100px] cursor-pointer"
        >
            <Icon className="w-5 h-5 text-[#666] group-hover:text-[#1A1A1A] mb-2 transition-colors duration-300" strokeWidth={1.5} />
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#666] group-hover:text-[#1A1A1A] transition-colors duration-300">{label}</span>
        </motion.div>
    );
    return href ? <Link href={href} className="flex-1 h-full">{Content}</Link> : <div onClick={onClick} className="flex-1 h-full">{Content}</div>;
};

const StatBlock = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex flex-col p-4 flex-1 bg-white rounded-xl border border-black/5 justify-center items-center">
        <span className="text-2xl font-semibold text-[#1A1A1A] leading-none mb-1">{value}</span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-[#666]">{label}</span>
    </div>
);

const OutfitDetails = ({ items, onGenerate, isGenerating }: {
    items: any[];
    onGenerate: (e?: React.MouseEvent) => void;
    isGenerating: boolean
}) => (
    <>
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    Composition
                </span>
                <span className="font-mono text-xs text-[#666]">{items.length} items</span>
            </div>

            <ul className="space-y-4">
                {items.map((item, i) => (
                    <motion.li
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group cursor-pointer flex gap-4"
                    >
                        <div className="w-12 h-16 bg-[#FAFAFA] flex-none border border-black/5 rounded-lg overflow-hidden">
                            {item?.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />}
                        </div>
                        <div className="py-1 min-w-0">
                            <p className="font-medium text-[#1A1A1A] group-hover:underline decoration-black/20 underline-offset-4 transition-all truncate">{item?.name}</p>
                            <p className="text-xs text-[#666] capitalize mt-0.5">{item?.category}</p>
                        </div>
                    </motion.li>
                ))}
            </ul>
        </div>

        <div className="p-6 border-t border-black/5 bg-[#FAFAFA] shrink-0">
            <button
                onClick={onGenerate}
                className="w-full py-3 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
            >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                Generate New Look
            </button>
        </div>
    </>
);

export function HomePage() {
    const { user } = useAuth();

    // Data & State
    const savedLocation = typeof window !== 'undefined' ? localStorage.getItem("weatherLocation") || undefined : undefined;
    const [coords, setCoords] = useState<string | undefined>(undefined);
    const [showWeatherModal, setShowWeatherModal] = useState(false);

    useEffect(() => {
        if (!savedLocation && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setCoords(`${position.coords.latitude},${position.coords.longitude}`);
            });
        }
    }, [savedLocation]);

    const { data: weather, isLoading: weatherLoading } = useWeather(savedLocation || coords);
    const { data: wardrobeItems } = useWardrobeItems();
    const { data: outfits } = useOutfits();

    const [dailyLook, setDailyLook] = useState<Outfit | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showMobileDetails, setShowMobileDetails] = useState(false);

    useEffect(() => {
        if (outfits && outfits.length > 0 && !dailyLook) {
            const today = new Date().getDate();
            const index = today % outfits.length;
            setDailyLook(outfits[index]);
        }
    }, [outfits, dailyLook]);

    const refreshDailyLook = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!outfits || outfits.length === 0) return;
        setIsGenerating(true);
        setTimeout(() => {
            let nextLook = dailyLook;
            if (outfits.length > 1) {
                while (nextLook?.id === dailyLook?.id) {
                    nextLook = outfits[Math.floor(Math.random() * outfits.length)];
                }
            } else {
                nextLook = outfits[0];
            }
            setDailyLook(nextLook);
            setIsGenerating(false);
        }, 600);
    };

    const resolveOutfitItems = (outfit: Outfit) => {
        const itemIds = outfit.items as unknown as number[];
        return itemIds.map(id => wardrobeItems?.find(item => item.id === id)).filter(Boolean);
    };
    const resolvedDailyItems = dailyLook ? resolveOutfitItems(dailyLook) : [];

    // Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    if (weatherLoading) {
        return (
            <AppLayout>
                <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#666] animate-spin" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="bg-[#FAFAFA] text-[#1A1A1A] w-full min-h-[calc(100vh-5rem)] md:h-[calc(100vh-5rem)] overflow-y-auto md:overflow-hidden flex flex-col font-sans">

                <div className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-6 md:px-8 md:py-8 flex flex-col gap-6">

                    {/* HEADER */}
                    <motion.header
                        className="flex flex-col md:flex-row justify-between items-start md:items-end pb-4 border-b border-black/5 shrink-0"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div>
                            <h1 className="text-2xl md:text-3xl font-semibold text-[#1A1A1A] leading-tight tracking-tight mb-1">
                                {greeting}, {user?.username || 'there'}.
                            </h1>
                            <p className="text-xs text-[#666] uppercase tracking-widest">
                                {format(new Date(), 'EEEE, MMMM do')}
                            </p>
                        </div>

                        {/* Weather Widget */}
                        <button
                            onClick={() => setShowWeatherModal(true)}
                            className="mt-4 md:mt-0 flex items-center gap-3 text-xs font-mono text-[#666] bg-white border border-black/5 px-4 py-2.5 rounded-full hover:border-black/10 hover:shadow-sm transition-all"
                        >
                            <span>{weather?.location || 'Select City'}</span>
                            <span className="w-px h-4 bg-black/10" />
                            <span className="text-[#1A1A1A] font-semibold">{weather?.temperature || 20}°C</span>
                            <span className="hidden sm:inline text-[#666]">{weather?.condition || "Clear"}</span>
                        </button>
                    </motion.header>

                    {/* MAIN GRID */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                        {/* LEFT: VISUAL STAGE (8 COLS) */}
                        <div className="lg:col-span-8 flex flex-col min-h-[500px] lg:min-h-0 relative">
                            <motion.div
                                className="flex-1 w-full bg-white border border-black/5 rounded-2xl shadow-sm flex relative overflow-hidden"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                {dailyLook ? (
                                    <>
                                        {/* IMAGE COMPOSITION */}
                                        <div className="relative bg-[#1A1A1A] h-full w-full lg:w-2/3 transition-all duration-500">
                                            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[1px] bg-[#1A1A1A]">
                                                {resolvedDailyItems.slice(0, 4).map((item, i) => (
                                                    <div key={i} className="bg-white relative overflow-hidden">
                                                        {item?.imageUrl ? (
                                                            <img src={item.imageUrl} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt={item.name} />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-[#FAFAFA]"><Shirt className="w-10 h-10 text-[#DDD]" /></div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* OVERLAY */}
                                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/50 to-transparent pt-24 pointer-events-none">
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
                                                        <p className="text-[10px] text-white/80 font-mono uppercase tracking-widest">
                                                            Daily Curated
                                                        </p>
                                                    </div>
                                                    <h2 className="text-2xl md:text-3xl font-semibold italic text-white leading-none drop-shadow-sm">
                                                        {dailyLook.name}
                                                    </h2>
                                                </div>
                                            </div>

                                            {/* MOBILE INFO BUTTON */}
                                            <button
                                                onClick={() => setShowMobileDetails(true)}
                                                className="lg:hidden absolute top-4 right-4 p-2.5 bg-black/20 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-black/40 transition-all"
                                            >
                                                <Maximize2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* DESKTOP SIDEBAR */}
                                        <div className="hidden lg:flex w-1/3 bg-white border-l border-black/5 flex-col relative">
                                            <OutfitDetails
                                                items={resolvedDailyItems}
                                                onGenerate={refreshDailyLook}
                                                isGenerating={isGenerating}
                                            />
                                        </div>

                                        {/* MOBILE DETAILS OVERLAY */}
                                        <AnimatePresence>
                                            {showMobileDetails && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="fixed inset-0 z-50 bg-black/50 lg:hidden"
                                                    onClick={() => setShowMobileDetails(false)}
                                                >
                                                    <motion.div
                                                        initial={{ y: '100%' }}
                                                        animate={{ y: 0 }}
                                                        exit={{ y: '100%' }}
                                                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] flex flex-col"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="p-4 border-b border-black/5 flex justify-between items-center shrink-0">
                                                            <h3 className="font-semibold text-[#1A1A1A]">{dailyLook.name}</h3>
                                                            <button onClick={() => setShowMobileDetails(false)} className="p-2 text-[#666] hover:text-[#1A1A1A]">
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                        <OutfitDetails
                                                            items={resolvedDailyItems}
                                                            onGenerate={(e) => { refreshDailyLook(e); setShowMobileDetails(false); }}
                                                            isGenerating={isGenerating}
                                                        />
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
                                        <Shirt className="w-16 h-16 text-[#DDD]" />
                                        <div className="text-center">
                                            <p className="text-[#666] mb-2">No outfits yet</p>
                                            <Link href="/compose">
                                                <button className="text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] border-b border-[#1A1A1A] hover:text-[#80163a] hover:border-[#80163a] transition-colors">
                                                    Create Your First Look
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* RIGHT: UTILITY STACK (4 COLS) */}
                        <div className="lg:col-span-4 flex flex-col gap-4 h-full min-h-0">

                            {/* STATS */}
                            <motion.div
                                className="flex gap-4 shrink-0"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <StatBlock label="Items" value={wardrobeItems?.length || 0} />
                                <StatBlock label="Outfits" value={outfits?.length || 0} />
                            </motion.div>

                            {/* TOOLS */}
                            <motion.div
                                className="grid grid-cols-2 gap-3 shrink-0"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <ToolCard label="Add Item" icon={Plus} href="/wardrobe" />
                                <ToolCard label="Plan Trip" icon={Calendar} href="/trips" />
                                <ToolCard label="Search" icon={Search} href="/wardrobe" />
                                <ToolCard label="Settings" icon={Settings} href="/profile" />
                            </motion.div>

                            {/* RECENT ITEMS */}
                            <motion.div
                                className="flex-1 bg-white border border-black/5 rounded-2xl p-5 flex flex-col min-h-0 overflow-hidden"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-black/5 shrink-0">
                                    <span className="text-xs font-semibold uppercase tracking-widest text-[#666]">Recent Items</span>
                                    <Link href="/wardrobe">
                                        <div className="flex items-center gap-1 cursor-pointer group">
                                            <span className="text-xs font-semibold text-[#1A1A1A] group-hover:underline">View All</span>
                                            <ArrowUpRight className="w-3.5 h-3.5 text-[#1A1A1A]" />
                                        </div>
                                    </Link>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-2">
                                    {(wardrobeItems || []).slice(0, 5).map((item) => (
                                        <Link key={item.id} href={`/wardrobe?item=${item.id}`}>
                                            <div className="flex items-center gap-3 group cursor-pointer hover:bg-black/[0.02] p-2 rounded-xl transition-colors">
                                                <div className="w-10 h-10 bg-[#FAFAFA] flex-none overflow-hidden border border-black/5 rounded-lg">
                                                    {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-[#1A1A1A] truncate group-hover:underline">{item.name}</p>
                                                    <p className="text-xs text-[#666] capitalize">{item.category}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {(!wardrobeItems || wardrobeItems.length === 0) && (
                                        <div className="text-center py-8 text-[#666] text-sm">
                                            No items yet
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                    </div>

                </div>

                <WeatherLocationModal
                    isOpen={showWeatherModal}
                    onClose={() => setShowWeatherModal(false)}
                    currentLocation={savedLocation || ""}
                    onSave={(newLocation) => {
                        localStorage.setItem("weatherLocation", newLocation);
                        window.location.reload();
                    }}
                />
            </div>
        </AppLayout>
    );
}

export default HomePage;
