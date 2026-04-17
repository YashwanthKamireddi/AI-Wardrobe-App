import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWeather } from "@/hooks/use-weather";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";
import WeatherLocationModal from "@/components/weather-location-modal";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/app-layout";
import { motion } from "framer-motion";
import {
    Calendar, Shirt, RefreshCw, Layers, Loader2,
    Sparkles, ChevronRight, MapPin, Plus, BarChart3,
    Sun, Cloud, CloudRain, Thermometer
} from "lucide-react";
import type { Outfit } from "@shared/schema";

/**
 * HOME PAGE - "COMMAND CENTER"
 *
 * A clean, functional dashboard that feels premium but actually works
 * Focus on utility and visual clarity over complexity
 */

const EASE = [0.22, 1, 0.36, 1];

// Weather Icon
const WeatherIcon = ({ condition }: { condition?: string }) => {
    const lower = condition?.toLowerCase() || "";
    if (lower.includes("rain")) return <CloudRain className="w-5 h-5" />;
    if (lower.includes("cloud")) return <Cloud className="w-5 h-5" />;
    return <Sun className="w-5 h-5" />;
};

// Stat Card
const StatCard = ({ label, value, icon: Icon, delay = 0 }: {
    label: string;
    value: string | number;
    icon: any;
    delay?: number;
}) => (
    <motion.div
        className="bg-white border border-gray-100 p-5 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5, ease: EASE }}
    >
        <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-gray-400" />
            </div>
        </div>
        <div className="text-3xl font-semibold text-gray-900 mb-1">{value}</div>
        <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
    </motion.div>
);

// Quick Action
const QuickAction = ({ href, icon: Icon, label, description, accent = false, delay = 0 }: {
    href: string;
    icon: any;
    label: string;
    description: string;
    accent?: boolean;
    delay?: number;
}) => (
    <Link href={href}>
        <motion.div
            className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${accent
                    ? 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]'
                    : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md'
                }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: EASE }}
            whileHover={{ y: -2 }}
        >
            <Icon className={`w-6 h-6 mb-4 ${accent ? 'text-white' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-1 ${accent ? 'text-white' : 'text-gray-900'}`}>
                {label}
            </h3>
            <p className={`text-sm ${accent ? 'text-gray-400' : 'text-gray-500'}`}>
                {description}
            </p>
        </motion.div>
    </Link>
);

// Today's Look Card
const TodaysLook = ({ outfit, items, onRefresh, isRefreshing }: {
    outfit: Outfit | null;
    items: any[];
    onRefresh: () => void;
    isRefreshing: boolean;
}) => {
    if (!outfit || items.length === 0) {
        return (
            <motion.div
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
            >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Layers className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Create Your First Look</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                    Add items to your wardrobe and create outfits to see AI suggestions here
                </p>
                <Link href="/wardrobe">
                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-[#2A2A2A] transition-colors">
                        <Plus className="w-4 h-4" />
                        Add Items
                    </span>
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="bg-[#1A1A1A] rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
        >
            {/* Images Grid */}
            <div className="grid grid-cols-4 gap-[1px] aspect-[4/1.5]">
                {items.slice(0, 4).map((item, i) => (
                    <div key={i} className="relative overflow-hidden bg-gray-800">
                        {item?.imageUrl ? (
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Shirt className="w-8 h-8 text-gray-600" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Info */}
            <div className="p-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Today's Suggestion</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">{outfit.name}</h3>
                    <p className="text-gray-500 text-sm">{items.length} pieces</p>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </motion.div>
    );
};

// Recent Item
const RecentItem = ({ item, delay }: { item: any; delay: number }) => (
    <motion.div
        className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative group"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.4 }}
    >
        {item.imageUrl ? (
            <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center">
                <Shirt className="w-6 h-6 text-gray-300" />
            </div>
        )}
    </motion.div>
);

export function HomePage() {
    const { user } = useAuth();
    const { data: weather, isLoading: weatherLoading } = useWeather();
    const { data: wardrobeItems } = useWardrobeItems();
    const { data: outfits } = useOutfits();

    const [showWeatherModal, setShowWeatherModal] = useState(false);
    const [savedLocation, setSavedLocation] = useState<string | null>(null);
    const [dailyLook, setDailyLook] = useState<Outfit | null>(null);
    const [resolvedDailyItems, setResolvedDailyItems] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const loc = localStorage.getItem("weatherLocation");
        if (loc) setSavedLocation(loc);
    }, []);

    useEffect(() => {
        if (outfits && outfits.length > 0 && !dailyLook) {
            const randomOutfit = outfits[Math.floor(Math.random() * outfits.length)];
            setDailyLook(randomOutfit);
        }
    }, [outfits, dailyLook]);

    useEffect(() => {
        if (dailyLook && wardrobeItems) {
            const resolved = dailyLook.items
                .map(id => wardrobeItems.find(item => item.id === id))
                .filter(Boolean);
            setResolvedDailyItems(resolved);
        }
    }, [dailyLook, wardrobeItems]);

    const refreshDailyLook = () => {
        if (!outfits || outfits.length === 0) return;
        setIsGenerating(true);
        setTimeout(() => {
            const randomOutfit = outfits[Math.floor(Math.random() * outfits.length)];
            setDailyLook(randomOutfit);
            setIsGenerating(false);
        }, 600);
    };

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    if (weatherLoading) {
        return (
            <AppLayout>
                <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#FAFAFA] pb-28 md:pb-12">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">

                    {/* Header */}
                    <motion.header
                        className="mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EASE }}
                    >
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">{format(new Date(), 'EEEE, MMMM d')}</p>
                                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
                                    {greeting}, {user?.username || 'there'}
                                </h1>
                            </div>

                            {/* Weather */}
                            <button
                                onClick={() => setShowWeatherModal(true)}
                                className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                            >
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">{weather?.location || 'Set location'}</span>
                                <div className="w-px h-4 bg-gray-200" />
                                <WeatherIcon condition={weather?.condition} />
                                <span className="text-lg font-medium text-gray-900">{weather?.temperature || 20}°</span>
                            </button>
                        </div>
                    </motion.header>

                    {/* Today's Look */}
                    <section className="mb-8">
                        <TodaysLook
                            outfit={dailyLook}
                            items={resolvedDailyItems}
                            onRefresh={refreshDailyLook}
                            isRefreshing={isGenerating}
                        />
                    </section>

                    {/* Stats Row */}
                    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            label="Wardrobe Items"
                            value={wardrobeItems?.length || 0}
                            icon={Shirt}
                            delay={0.1}
                        />
                        <StatCard
                            label="Outfit Combos"
                            value={outfits?.length || 0}
                            icon={Layers}
                            delay={0.15}
                        />
                        <StatCard
                            label="This Week"
                            value="4 looks"
                            icon={Calendar}
                            delay={0.2}
                        />
                        <StatCard
                            label="Style Score"
                            value="A+"
                            icon={Sparkles}
                            delay={0.25}
                        />
                    </section>

                    {/* Quick Actions */}
                    <section className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <QuickAction
                                href="/compose"
                                icon={Sparkles}
                                label="Create Outfit"
                                description="AI-powered outfit suggestions"
                                accent
                                delay={0.1}
                            />
                            <QuickAction
                                href="/wardrobe"
                                icon={Shirt}
                                label="Add Items"
                                description="Expand your wardrobe"
                                delay={0.15}
                            />
                            <QuickAction
                                href="/analytics"
                                icon={BarChart3}
                                label="View Insights"
                                description="Wardrobe analytics"
                                delay={0.2}
                            />
                        </div>
                    </section>

                    {/* Recent Items */}
                    {wardrobeItems && wardrobeItems.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Additions</h2>
                                <Link href="/wardrobe">
                                    <span className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer">
                                        View all <ChevronRight className="w-4 h-4" />
                                    </span>
                                </Link>
                            </div>
                            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                {wardrobeItems.slice(0, 8).map((item, i) => (
                                    <RecentItem key={item.id} item={item} delay={0.1 + (i * 0.03)} />
                                ))}
                            </div>
                        </section>
                    )}

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
