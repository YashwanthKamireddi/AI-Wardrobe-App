import { motion } from "framer-motion";
import { Sparkles, Layers, X } from "lucide-react";
import { Link } from "wouter";
import { WardrobeItem } from "@shared/schema";
import { memo } from "react";

// Types
import { LucideIcon } from "lucide-react";
import { Briefcase, Moon, Coffee, PartyPopper, Dumbbell } from "lucide-react";

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

interface AtelierSectionProps {
    hasWardrobeItems: boolean;
    selectedOccasion: string;
    setSelectedOccasion: (val: string) => void;
    selectedVibe: string;
    setSelectedVibe: (val: string) => void;
    anchorItem: WardrobeItem | null;
    setAnchorItem: (item: WardrobeItem | null) => void;
    setShowAnchorModal: (show: boolean) => void;
    generateAIOutfit: () => void;
    isGenerating: boolean;
}

export const AtelierSection = memo(function AtelierSection({
    hasWardrobeItems,
    selectedOccasion,
    setSelectedOccasion,
    selectedVibe,
    setSelectedVibe,
    anchorItem,
    setAnchorItem,
    setShowAnchorModal,
    generateAIOutfit,
    isGenerating
}: AtelierSectionProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-[28px] bg-white border border-gray-100 overflow-hidden shadow-sm"
        >
            {hasWardrobeItems ? (
                <div className="p-0 md:p-0 min-h-[500px] flex flex-col">
                    {/* ATELIER UI (INPUTS) */}
                    <div className="flex flex-col h-full relative p-8 md:p-12">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#80163A]/5 mb-4">
                                <Sparkles className="w-3 h-3 text-[#80163A]" />
                                <span className="text-[10px] font-bold text-[#80163A] uppercase tracking-widest">The Atelier</span>
                            </div>
                        </div>

                        {/* NARRATIVE BUILDER AREA (THE "SENTENCE") */}
                        <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full pb-32 space-y-12">

                            {/* The Sentence */}
                            <h2 className="text-4xl md:text-6xl text-[#1A1A1A] leading-tight text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
                                "Curate a <br className="md:hidden" />
                                <span className="relative inline-block mx-2 group">
                                    <span className="relative z-10 border-b-2 border-[#80163A] pb-1 cursor-pointer text-[#80163A] italic hover:text-[#5e102b] transition-colors whitespace-nowrap">
                                        {occasions.find(o => o.id === selectedOccasion)?.label}
                                    </span>
                                    {/* Occasion Options (Hover/Click) */}
                                    <select
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                                        value={selectedOccasion}
                                        onChange={(e) => setSelectedOccasion(e.target.value)}
                                    >
                                        {occasions.map(o => (
                                            <option key={o.id} value={o.id}>{o.label}</option>
                                        ))}
                                    </select>
                                </span>
                                look <br className="hidden md:block" />
                                that feels
                                <span className="relative inline-block mx-2 group">
                                    <span className="relative z-10 border-b-2 border-[#80163A] pb-1 cursor-pointer text-[#80163A] italic hover:text-[#5e102b] transition-colors whitespace-nowrap">
                                        {vibes.find(v => v.id === selectedVibe)?.label}
                                    </span>
                                    {/* Vibe Options */}
                                    <select
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                                        value={selectedVibe}
                                        onChange={(e) => setSelectedVibe(e.target.value)}
                                    >
                                        {vibes.map(v => (
                                            <option key={v.id} value={v.id}>{v.label}</option>
                                        ))}
                                    </select>
                                </span>."
                            </h2>

                            {/* Subtitle / Helper */}
                            <p className="text-sm md:text-base text-gray-400 text-center max-w-md mx-auto font-light">
                                Tap the underlined words to change the context. Our stylist will handle the rest.
                            </p>

                            {/* 3. ANCHOR ITEM - Minimalist Centered */}
                            {anchorItem ? (
                                <div className="flex items-center gap-4 p-3 pr-6 rounded-full bg-[#F9F8F6] border border-[#80163A]/20 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                    <div className="w-10 h-10 bg-white rounded-full p-1 border border-gray-100 overflow-hidden">
                                        <img src={anchorItem.imageUrl || ""} className="w-full h-full object-contain" alt={anchorItem.name} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] uppercase tracking-widest text-[#80163A] font-bold">Anchored By</span>
                                        <span className="text-xs font-medium text-[#1A1A1A] truncate max-w-[120px]">{anchorItem.name}</span>
                                    </div>
                                    <button onClick={() => setAnchorItem(null)} className="ml-2 w-6 h-6 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-colors">
                                        <X className="w-3 h-3 text-gray-400" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAnchorModal(true)}
                                    className="text-xs font-medium text-gray-400 hover:text-[#80163A] flex items-center gap-2 transition-colors border-b border-transparent hover:border-[#80163A]/30 pb-0.5"
                                >
                                    <Layers className="w-3 h-3" />
                                    <span>Build around a specific item?</span>
                                </button>
                            )}
                        </div>

                        {/* GENERATE BUTTON */}
                        <div className="absolute bottom-0 left-0 right-0 pt-8 pb-10 px-6 bg-gradient-to-t from-white via-white to-transparent flex justify-center">
                            <motion.button
                                onClick={generateAIOutfit}
                                disabled={isGenerating}
                                className="w-full max-w-sm py-5 rounded-2xl bg-[#1A1A1A] text-white font-medium text-sm tracking-[0.2em] uppercase hover:bg-[#333] shadow-xl shadow-black/20 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                                whileTap={{ scale: 0.98 }}
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Curating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 text-[#80163A] group-hover:text-white transition-colors" />
                                        <span>Curate My Edit</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>
            ) : (
                /* EMPTY STATE */
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
    );
});
