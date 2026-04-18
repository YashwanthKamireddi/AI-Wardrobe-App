import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWeather } from "@/hooks/use-weather";
import { useWardrobeItems, useSeedWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";
import WeatherLocationModal from "@/components/weather-location-modal";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/app-layout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shirt, Layers, RefreshCw, Sparkles, ChevronRight,
    MapPin, Plus, BarChart3, Calendar, Sun, Cloud, CloudRain,
    Snowflake, Wind, Wand2, Heart, ArrowUpRight, Loader2,
} from "lucide-react";
import type { Outfit, WardrobeItem } from "@shared/schema";

/**
 * HOME — THE DAILY EDIT
 *
 * Post-login dashboard. Editorial but functional:
 * - Today's edit: weather + mood driven outfit suggestion
 * - Mood dial: re-roll suggestion for a specific vibe
 * - Curated outfits: browse complete seeded looks
 * - Wardrobe highlights: recent items + favorites
 * - Quick actions and health stats
 * - Onboarding: if wardrobe is empty, load the demo set in one click
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const SERIF = { fontFamily: '"Playfair Display", Georgia, serif' } as const;

const MOODS = [
    { id: "any", label: "Any mood", icon: Sparkles },
    { id: "focused", label: "Focused", icon: Wand2 },
    { id: "relaxed", label: "Relaxed", icon: Sun },
    { id: "bold", label: "Bold", icon: Sparkles },
    { id: "elevated", label: "Elevated", icon: Heart },
    { id: "cozy", label: "Cozy", icon: Cloud },
] as const;

type MoodId = typeof MOODS[number]["id"];

// Map weather condition to icon
function WeatherIcon({ condition, className }: { condition?: string; className?: string }) {
    const c = (condition || "").toLowerCase();
    const cls = className ?? "w-5 h-5";
    if (c.includes("snow")) return <Snowflake className={cls} />;
    if (c.includes("rain") || c.includes("drizzle")) return <CloudRain className={cls} />;
    if (c.includes("wind")) return <Wind className={cls} />;
    if (c.includes("cloud")) return <Cloud className={cls} />;
    return <Sun className={cls} />;
}

// Derive a "temperature bucket" from the weather response for outfit matching.
function temperatureBucket(temp?: number): "cold" | "cool" | "mild" | "hot" {
    if (temp == null) return "mild";
    if (temp < 8) return "cold";
    if (temp < 16) return "cool";
    if (temp < 25) return "mild";
    return "hot";
}

// Score an outfit against a mood + weather bucket. Higher = better match.
function scoreOutfit(outfit: Outfit, mood: MoodId, bucket: string): number {
    let score = 0;
    const outfitMood = (outfit.mood || "").toLowerCase();
    const outfitWeather = (outfit.weatherConditions || "").toLowerCase();
    const outfitSeason = (outfit.season || "").toLowerCase();

    if (mood !== "any" && outfitMood === mood) score += 10;
    if (mood === "any") score += 1;

    if (outfitWeather === bucket) score += 6;
    if (bucket === "hot" && outfitSeason === "summer") score += 3;
    if (bucket === "cold" && outfitSeason === "winter") score += 3;
    if (bucket === "cool" && outfitSeason === "fall") score += 2;
    if (outfitSeason === "all") score += 1;

    if (outfit.favorite) score += 1;

    return score;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function GreetingHeader({
    username,
    weather,
    onOpenWeather,
}: {
    username: string;
    weather: { location?: string; temperature?: number; condition?: string } | undefined;
    onOpenWeather: () => void;
}) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#4A4A4A] mb-2">
                    {format(new Date(), "EEEE · MMMM d")}
                </p>
                <h1 className="text-4xl md:text-5xl leading-[1.05] text-[#1A1A1A]" style={SERIF}>
                    {greeting},
                    <br className="md:hidden" />
                    <span className="italic text-[#80163A]"> {username}</span>
                </h1>
            </div>

            <button
                onClick={onOpenWeather}
                className="group self-start md:self-end flex items-center gap-3 pl-4 pr-5 py-3 bg-white border border-[#E5E5E5] hover:border-[#80163A]/40 transition-colors rounded-full"
                aria-label="Change weather location"
            >
                <MapPin className="w-4 h-4 text-[#4A4A4A] group-hover:text-[#80163A] transition-colors" strokeWidth={1.75} />
                <span className="text-sm text-[#1A1A1A]">{weather?.location ?? "Set location"}</span>
                <span className="h-4 w-px bg-[#E5E5E5]" />
                <WeatherIcon condition={weather?.condition} className="w-4 h-4 text-[#1A1A1A]" />
                <span className="text-base font-medium text-[#1A1A1A]">
                    {weather?.temperature != null ? `${Math.round(weather.temperature)}°` : "—°"}
                </span>
            </button>
        </header>
    );
}

function EmptyState({ onSeed, isSeeding }: { onSeed: () => void; isSeeding: boolean }) {
    return (
        <motion.div
            className="relative overflow-hidden rounded-3xl border border-[#E5E5E5] bg-gradient-to-br from-[#FDFBF7] via-white to-[#FAF6EE] p-8 md:p-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
        >
            {/* decorative gold hairline */}
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-[#D4AF37]/60" />

            <div className="relative max-w-xl">
                <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-[#80163A] mb-4">
                    Start Here
                </span>
                <h2 className="text-3xl md:text-4xl leading-tight text-[#1A1A1A] mb-4" style={SERIF}>
                    Your wardrobe is a <span className="italic">blank canvas</span>.
                </h2>
                <p className="text-[#4A4A4A] mb-8 leading-relaxed">
                    Load a curated demo wardrobe — 22 pieces, 8 complete outfits — to try every feature
                    instantly. You can clear it and add your own items any time.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onSeed}
                        disabled={isSeeding}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1A1A1A] text-white text-sm font-medium tracking-wide rounded-full hover:bg-[#2A2A2A] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSeeding ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Loading demo wardrobe…
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" /> Load demo wardrobe
                            </>
                        )}
                    </button>
                    <Link href="/wardrobe">
                        <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-[#E5E5E5] text-[#1A1A1A] text-sm font-medium tracking-wide rounded-full hover:border-[#1A1A1A] transition-colors">
                            <Plus className="w-4 h-4" /> Add your own items
                        </button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

// Color palette used for graceful placeholder tiles when an outfit item is
// missing or has no imageUrl. Keeps the hero strip from ever going black.
const PLACEHOLDER_TONES = ["#80163A", "#1A2744", "#5C3A20", "#2A2A2A", "#365940", "#6E1426", "#B08A2E"];

function PieceTile({ item, fallbackIdx }: { item?: WardrobeItem; fallbackIdx: number }) {
    if (item?.imageUrl) {
        return (
            <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                    // Degrade gracefully if the URL is broken (legacy Unsplash IDs)
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.setAttribute("data-broken", "true");
                }}
            />
        );
    }
    const bg = PLACEHOLDER_TONES[fallbackIdx % PLACEHOLDER_TONES.length];
    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center text-center px-3"
            style={{ backgroundColor: bg, color: "#FDFBF7" }}
        >
            <Shirt className="w-6 h-6 md:w-8 md:h-8 mb-2 opacity-45" strokeWidth={1.25} />
            {item?.name && (
                <p className="text-[9px] md:text-[10px] tracking-[0.15em] uppercase opacity-75 leading-tight max-w-[80%]">
                    {item.name}
                </p>
            )}
        </div>
    );
}

function TodaysEdit({
    outfit,
    items,
    bucket,
    onReroll,
    isRerolling,
}: {
    outfit: Outfit | null;
    items: WardrobeItem[];
    bucket: string;
    onReroll: () => void;
    isRerolling: boolean;
}) {
    if (!outfit) {
        return (
            <div className="rounded-3xl border border-dashed border-[#E5E5E5] p-10 text-center">
                <p className="text-[#4A4A4A]">
                    No outfits yet.{" "}
                    <Link href="/outfits">
                        <span className="text-[#80163A] underline underline-offset-2 cursor-pointer">Create your first look</span>
                    </Link>
                    .
                </p>
            </div>
        );
    }

    // Cap to 4 tiles; use real items for as many as we have, placeholders otherwise.
    const panelCount = Math.min(4, Math.max(items.length, 4));
    const panelItems = Array.from({ length: panelCount }).map((_, i) => items[i]);

    return (
        <motion.article
            key={outfit.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="rounded-3xl overflow-hidden bg-[#1A1A1A] text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]"
        >
            {/* image strip — 2×2 on mobile (wider panels, readable card text),
                 4-up horizontal on md+. */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] aspect-square md:aspect-[16/6] bg-white/5">
                {panelItems.map((item, i) => (
                    <div key={i} className="relative overflow-hidden bg-white/5">
                        <PieceTile item={item} fallbackIdx={i} />
                    </div>
                ))}
            </div>

            {/* info row */}
            <div className="p-5 md:p-8 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37]">Today's Edit</span>
                        <span className="h-px flex-1 bg-white/10" />
                        <span className="text-[10px] tracking-[0.2em] uppercase text-white/75">
                            Matched for {bucket} weather
                        </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl leading-tight mb-2 text-white" style={SERIF}>
                        {outfit.name}
                    </h3>
                    {outfit.description && (
                        <p className="text-sm text-white/80 max-w-xl leading-relaxed">{outfit.description}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] tracking-wide uppercase text-white/85">
                        {outfit.mood && <span className="px-2.5 py-1 rounded-full bg-white/12">{outfit.mood}</span>}
                        {outfit.occasion && <span className="px-2.5 py-1 rounded-full bg-white/12">{outfit.occasion}</span>}
                        {outfit.season && <span className="px-2.5 py-1 rounded-full bg-white/12">{outfit.season}</span>}
                        <span className="px-2.5 py-1 rounded-full bg-white/12">{items.length} pieces</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onReroll}
                        disabled={isRerolling}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 disabled:opacity-50 transition-colors text-sm"
                        aria-label="Suggest another outfit"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRerolling ? "animate-spin" : ""}`} />
                        <span>Re-roll</span>
                    </button>
                    <Link href={`/outfits?id=${outfit.id}`}>
                        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#C9A959] transition-colors text-sm font-medium">
                            <span>View</span>
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </Link>
                </div>
            </div>
        </motion.article>
    );
}

function MoodDial({ value, onChange }: { value: MoodId; onChange: (v: MoodId) => void }) {
    return (
        <div
            className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap"
            role="radiogroup"
            aria-label="Mood filter"
        >
            {MOODS.map((m) => {
                const Icon = m.icon;
                const active = m.id === value;
                return (
                    <button
                        key={m.id}
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(m.id)}
                        className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors ${
                            active
                                ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                                : "bg-white text-[#1A1A1A] border-[#E5E5E5] hover:border-[#1A1A1A]/40"
                        }`}
                    >
                        <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                        {m.label}
                    </button>
                );
            })}
        </div>
    );
}

function CuratedOutfits({ outfits, items }: { outfits: Outfit[]; items: WardrobeItem[] }) {
    const itemById = useMemo(() => {
        const map = new Map<number, WardrobeItem>();
        for (const item of items) map.set(item.id, item);
        return map;
    }, [items]);

    const show = outfits.slice(0, 6);
    if (show.length === 0) return null;

    return (
        <section>
            <div className="flex items-end justify-between mb-6">
                <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#4A4A4A] mb-2">The Lookbook</p>
                    <h2 className="text-2xl md:text-3xl leading-tight" style={SERIF}>
                        Complete <span className="italic">outfits</span>, ready to wear.
                    </h2>
                </div>
                <Link href="/outfits">
                    <span className="hidden md:inline-flex items-center gap-1 text-sm text-[#4A4A4A] hover:text-[#1A1A1A] cursor-pointer">
                        All looks <ChevronRight className="w-4 h-4" />
                    </span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {show.map((outfit) => {
                    const outfitItems = outfit.items
                        .map((id) => itemById.get(id))
                        .filter((i): i is WardrobeItem => Boolean(i));
                    return (
                        <Link key={outfit.id} href={`/outfits?id=${outfit.id}`}>
                            <motion.article
                                whileHover={{ y: -3 }}
                                className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-[#E5E5E5] hover:border-[#1A1A1A]/20 transition-colors"
                            >
                                <div className="grid grid-cols-4 gap-[1px] aspect-[4/3] bg-[#F5F2EC]">
                                    {Array.from({ length: 4 }).map((_, i) => {
                                        const item = outfitItems[i];
                                        return (
                                            <div key={i} className="relative overflow-hidden bg-white">
                                                {item?.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#E5E5E5]">
                                                        <Shirt className="w-5 h-5" strokeWidth={1.25} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        {outfit.favorite && <Heart className="w-3.5 h-3.5 fill-[#80163A] text-[#80163A]" />}
                                        <span className="text-[10px] tracking-[0.2em] uppercase text-[#4A4A4A]">
                                            {outfit.occasion || "look"} · {outfitItems.length} pieces
                                        </span>
                                    </div>
                                    <h3 className="text-lg text-[#1A1A1A] leading-tight mb-1" style={SERIF}>
                                        {outfit.name}
                                    </h3>
                                    {outfit.description && (
                                        <p className="text-sm text-[#4A4A4A] leading-relaxed line-clamp-2">
                                            {outfit.description}
                                        </p>
                                    )}
                                </div>
                            </motion.article>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

function StatCard({ label, value, icon: Icon, href }: { label: string; value: string | number; icon: any; href?: string }) {
    const body = (
        <motion.div
            whileHover={href ? { y: -2 } : undefined}
            className="rounded-2xl bg-white border border-[#E5E5E5] p-5 h-full flex flex-col justify-between"
        >
            <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#4A4A4A]">{label}</span>
                <Icon className="w-4 h-4 text-[#80163A]" strokeWidth={1.5} />
            </div>
            <div className="text-3xl md:text-4xl text-[#1A1A1A] mt-4" style={SERIF}>
                {value}
            </div>
        </motion.div>
    );
    return href ? <Link href={href}>{body}</Link> : body;
}

function QuickActions() {
    const actions = [
        { href: "/outfits", label: "Compose a look", description: "Drag-and-drop outfit builder.", icon: Layers },
        { href: "/wardrobe", label: "Add an item", description: "Photograph a piece; we'll tag it.", icon: Plus },
        { href: "/plan", label: "Plan the week", description: "Calendar your outfits.", icon: Calendar },
        { href: "/analytics", label: "See insights", description: "Cost-per-wear and health grade.", icon: BarChart3 },
    ];
    return (
        <section>
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-[#4A4A4A] mb-4">Quick actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {actions.map((a) => (
                    <Link key={a.href} href={a.href}>
                        <motion.div
                            whileHover={{ y: -2 }}
                            className="group rounded-2xl bg-white border border-[#E5E5E5] hover:border-[#1A1A1A]/30 p-5 cursor-pointer transition-colors h-full"
                        >
                            <a.icon className="w-5 h-5 text-[#80163A] mb-3" strokeWidth={1.5} />
                            <div className="text-sm font-medium text-[#1A1A1A] mb-1">{a.label}</div>
                            <p className="text-xs text-[#4A4A4A] leading-relaxed">{a.description}</p>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

function WardrobeHighlights({ items }: { items: WardrobeItem[] }) {
    if (items.length === 0) return null;
    const recent = [...items].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)).slice(0, 8);
    return (
        <section>
            <div className="flex items-end justify-between mb-4">
                <h2 className="text-[10px] tracking-[0.3em] uppercase text-[#4A4A4A]">Recently added</h2>
                <Link href="/wardrobe">
                    <span className="text-xs text-[#4A4A4A] hover:text-[#1A1A1A] cursor-pointer inline-flex items-center gap-1">
                        View wardrobe <ChevronRight className="w-3 h-3" />
                    </span>
                </Link>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5 md:gap-3">
                {recent.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ y: -2 }}
                        className="aspect-square rounded-xl overflow-hidden bg-white border border-[#E5E5E5] relative group"
                    >
                        {item.imageUrl ? (
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#E5E5E5]">
                                <Shirt className="w-5 h-5" strokeWidth={1.25} />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export function HomePage() {
    const { user } = useAuth();
    const { data: weather } = useWeather();
    const { data: wardrobeItems, isLoading: itemsLoading } = useWardrobeItems();
    const { data: outfits, isLoading: outfitsLoading } = useOutfits();
    const seed = useSeedWardrobeItems();

    const [showWeatherModal, setShowWeatherModal] = useState(false);
    const [savedLocation, setSavedLocation] = useState<string | null>(null);
    const [mood, setMood] = useState<MoodId>("any");
    const [manualOutfit, setManualOutfit] = useState<Outfit | null>(null);
    const [isRerolling, setIsRerolling] = useState(false);

    useEffect(() => {
        const loc = localStorage.getItem("weatherLocation");
        if (loc) setSavedLocation(loc);
    }, []);

    const bucket = temperatureBucket(weather?.temperature);

    // Pick the best outfit given current mood + weather, unless the user re-rolled.
    const recommended: Outfit | null = useMemo(() => {
        if (manualOutfit) return manualOutfit;
        if (!outfits || outfits.length === 0) return null;
        const ranked = [...outfits]
            .map((o) => ({ o, score: scoreOutfit(o, mood, bucket) + Math.random() * 0.5 }))
            .sort((a, b) => b.score - a.score);
        return ranked[0]?.o ?? null;
    }, [outfits, mood, bucket, manualOutfit]);

    // Reset manual override when mood changes.
    useEffect(() => {
        setManualOutfit(null);
    }, [mood]);

    const recommendedItems = useMemo<WardrobeItem[]>(() => {
        if (!recommended || !wardrobeItems) return [];
        return recommended.items
            .map((id) => wardrobeItems.find((w) => w.id === id))
            .filter((w): w is WardrobeItem => Boolean(w));
    }, [recommended, wardrobeItems]);

    const handleReroll = () => {
        if (!outfits || outfits.length === 0) return;
        setIsRerolling(true);
        // filter to current mood bucket, then pick a non-current one
        const pool = outfits.filter((o) => {
            if (mood === "any") return true;
            return (o.mood || "").toLowerCase() === mood;
        });
        const candidates = (pool.length > 1 ? pool : outfits).filter((o) => o.id !== recommended?.id);
        const pick = candidates[Math.floor(Math.random() * candidates.length)] ?? outfits[0];
        setTimeout(() => {
            setManualOutfit(pick);
            setIsRerolling(false);
        }, 300);
    };

    const wardrobeEmpty = !itemsLoading && (!wardrobeItems || wardrobeItems.length === 0);
    const hasOutfits = (outfits?.length ?? 0) > 0;

    // Stats
    const itemCount = wardrobeItems?.length ?? 0;
    const outfitCount = outfits?.length ?? 0;
    const favoriteCount = wardrobeItems?.filter((i) => i.favorite).length ?? 0;

    const rightRailActions = [
        { href: "/outfits", label: "Compose a look", icon: Layers },
        { href: "/wardrobe", label: "Add an item", icon: Plus },
        { href: "/plan", label: "Plan the week", icon: Calendar },
        { href: "/analytics", label: "See insights", icon: BarChart3 },
        { href: "/style-dna", label: "Style DNA", icon: Sparkles },
        { href: "/wishlist", label: "Wishlist", icon: Heart },
    ];

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#FDFBF7]">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-5 md:py-8 space-y-8">

                    <GreetingHeader
                        username={user?.name || user?.username || "friend"}
                        weather={weather ?? undefined}
                        onOpenWeather={() => setShowWeatherModal(true)}
                    />

                    {/* Loading skeleton for first paint */}
                    {itemsLoading && (
                        <div className="grid lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 h-[420px] rounded-3xl bg-white border border-[#E5E5E5] animate-pulse" />
                            <div className="lg:col-span-4 space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-28 rounded-2xl bg-white border border-[#E5E5E5] animate-pulse" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Onboarding for empty wardrobe — new users see this, no auto-seed */}
                    {wardrobeEmpty && (
                        <EmptyState
                            onSeed={() => seed.mutate({ reset: false })}
                            isSeeding={seed.isPending}
                        />
                    )}

                    {/* Has items but no outfits → prompt composer */}
                    {!wardrobeEmpty && !outfitsLoading && !hasOutfits && (
                        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-8 md:p-10 text-center">
                            <Layers className="w-8 h-8 text-[#80163A] mx-auto mb-4" strokeWidth={1.5} />
                            <h2 className="text-2xl mb-2" style={SERIF}>
                                Compose your first outfit
                            </h2>
                            <p className="text-[#4A4A4A] mb-6 max-w-md mx-auto">
                                You've got pieces — now combine them. The Atelier lets you drag items together or
                                have AI suggest a look.
                            </p>
                            <Link href="/outfits">
                                <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-white text-sm rounded-full hover:bg-[#2A2A2A] transition-colors">
                                    <Sparkles className="w-4 h-4" /> Open The Atelier
                                </button>
                            </Link>
                        </div>
                    )}

                    {/* Main dashboard — 2-col grid on lg+, stacks on mobile */}
                    {!wardrobeEmpty && hasOutfits && (
                        <div className="grid lg:grid-cols-12 gap-5 lg:gap-7">
                            {/* ─── Left column: hero outfit + mood ─── */}
                            <div className="lg:col-span-8 space-y-4">
                                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] tracking-[0.3em] uppercase text-[#4A4A4A] mb-1">The Daily Edit</p>
                                        <h2 className="text-2xl md:text-3xl leading-tight" style={SERIF}>
                                            A look <span className="italic">picked for</span> today.
                                        </h2>
                                    </div>
                                </div>
                                <MoodDial value={mood} onChange={setMood} />
                                <AnimatePresence mode="wait">
                                    <TodaysEdit
                                        key={recommended?.id ?? "none"}
                                        outfit={recommended}
                                        items={recommendedItems}
                                        bucket={bucket}
                                        onReroll={handleReroll}
                                        isRerolling={isRerolling}
                                    />
                                </AnimatePresence>
                            </div>

                            {/* ─── Right rail: stats + quick nav ─── */}
                            <aside className="lg:col-span-4 space-y-4">
                                {/* Stats card */}
                                <div className="rounded-2xl bg-white border border-[#E5E5E5] p-5 md:p-6">
                                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#4A4A4A] mb-4">At a glance</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Link href="/wardrobe">
                                            <div className="group cursor-pointer">
                                                <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-[#4A4A4A]">
                                                    <Shirt className="w-3 h-3 text-[#80163A]" strokeWidth={1.75} /> Items
                                                </div>
                                                <div className="text-3xl md:text-4xl text-[#1A1A1A] group-hover:text-[#80163A] transition-colors mt-1" style={SERIF}>{itemCount}</div>
                                            </div>
                                        </Link>
                                        <Link href="/outfits">
                                            <div className="group cursor-pointer">
                                                <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-[#4A4A4A]">
                                                    <Layers className="w-3 h-3 text-[#80163A]" strokeWidth={1.75} /> Outfits
                                                </div>
                                                <div className="text-3xl md:text-4xl text-[#1A1A1A] group-hover:text-[#80163A] transition-colors mt-1" style={SERIF}>{outfitCount}</div>
                                            </div>
                                        </Link>
                                        <div>
                                            <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-[#4A4A4A]">
                                                <Heart className="w-3 h-3 text-[#80163A]" strokeWidth={1.75} /> Favorites
                                            </div>
                                            <div className="text-3xl md:text-4xl text-[#1A1A1A] mt-1" style={SERIF}>{favoriteCount}</div>
                                        </div>
                                        <Link href="/analytics">
                                            <div className="group cursor-pointer">
                                                <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-[#4A4A4A]">
                                                    <BarChart3 className="w-3 h-3 text-[#80163A]" strokeWidth={1.75} /> Health
                                                </div>
                                                <div className="text-3xl md:text-4xl text-[#1A1A1A] group-hover:text-[#80163A] transition-colors mt-1" style={SERIF}>A–</div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>

                                {/* Quick nav list */}
                                <div className="rounded-2xl bg-white border border-[#E5E5E5] p-5 md:p-6">
                                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#4A4A4A] mb-3">Jump to</p>
                                    <div className="divide-y divide-[#F0EBE0]">
                                        {rightRailActions.map((a) => (
                                            <Link key={a.href} href={a.href}>
                                                <div className="flex items-center justify-between py-2.5 cursor-pointer group">
                                                    <div className="flex items-center gap-3 text-sm text-[#1A1A1A] group-hover:text-[#80163A] transition-colors">
                                                        <a.icon className="w-4 h-4 text-[#80163A]" strokeWidth={1.5} />
                                                        {a.label}
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-[#4A4A4A] group-hover:text-[#80163A] transition-colors" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Demo utility — hidden inside the right rail, tiny */}
                                <button
                                    onClick={() => {
                                        if (window.confirm("Replace your current wardrobe + outfits with a fresh demo set? This will delete what's currently there.")) {
                                            seed.mutate({ reset: true });
                                        }
                                    }}
                                    disabled={seed.isPending}
                                    className="w-full min-h-[44px] text-[10px] tracking-[0.2em] uppercase text-[#4A4A4A] hover:text-[#80163A] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 py-3"
                                >
                                    {seed.isPending ? (
                                        <><Loader2 className="w-3 h-3 animate-spin" /> Rebuilding demo…</>
                                    ) : (
                                        <><RefreshCw className="w-3 h-3" /> Reload demo wardrobe</>
                                    )}
                                </button>
                            </aside>
                        </div>
                    )}

                    {/* Curated outfits lookbook */}
                    {hasOutfits && wardrobeItems && (
                        <CuratedOutfits outfits={outfits!} items={wardrobeItems} />
                    )}

                    {/* Wardrobe highlights */}
                    {wardrobeItems && <WardrobeHighlights items={wardrobeItems} />}

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
