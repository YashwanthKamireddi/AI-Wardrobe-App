import React, { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { WardrobeItem } from "@shared/schema";
import { AIOutfitRecommendation, AIOutfitRecommendationRequest } from "@/types/ai-types";
import {
    Sparkles,
    Save,
    Loader2,
    ChevronDown,
    RefreshCw,
    Heart,
    Shirt,
    Check,
} from "lucide-react";

/**
 * AI STYLIST - MINIMAL EDITION
 *
 * Design Philosophy: Less is more
 * Inspired by Cladwell, Acloset - clean, focused interfaces
 * One clear action at a time
 */

interface AIOutfitRecommendationProps {
    weather: {
        temperature: number;
        condition: string;
        icon: string;
    };
    wardrobeItems: WardrobeItem[];
    selectedMood?: string;
}

// Simplified occasion list
const occasions = [
    { key: "none", label: "Everyday" },
    { key: "work", label: "Work" },
    { key: "casual", label: "Casual" },
    { key: "date", label: "Date" },
    { key: "formal", label: "Formal" },
];

const AIStylistMinimal = memo(function AIStylistMinimal({
    weather,
    wardrobeItems,
    selectedMood = "confident",
}: AIOutfitRecommendationProps) {
    const [occasion, setOccasion] = useState("none");
    const [showOccasionPicker, setShowOccasionPicker] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const getWeatherType = useCallback((): string => {
        if (!weather) return "mild";
        const { condition, temperature } = weather;
        if (condition.toLowerCase().includes("rain")) return "rainy";
        if (condition.toLowerCase().includes("snow")) return "snowy";
        if (condition.toLowerCase().includes("cloud")) return "cloudy";
        if (temperature < 5) return "cold";
        if (temperature > 25) return "hot";
        return "mild";
    }, [weather]);

    // Generate recommendations
    const {
        mutate: generate,
        data: result,
        isPending,
        reset,
    } = useMutation({
        mutationFn: () => {
            const requestData: AIOutfitRecommendationRequest = {
                mood: selectedMood,
                weather: getWeatherType(),
                occasion: occasion !== "none" ? occasion : undefined,
            };
            return apiRequest<{ recommendations: AIOutfitRecommendation[] }>(
                { path: "/api/ai-outfit-recommendations", method: "POST", body: requestData },
                { on401: "throw" }
            );
        },
        onError: (err: Error) => {
            toast({ title: "Couldn't generate outfit", description: err.message, variant: "destructive" });
        },
    });

    // Save outfit
    const { mutate: saveOutfit, isPending: isSaving } = useMutation({
        mutationFn: (rec: AIOutfitRecommendation) =>
            apiRequest({
                path: "/api/outfits",
                method: "POST",
                body: {
                    name: rec.outfitName,
                    description: rec.description,
                    items: rec.items.map((item) => item.id),
                    occasion: rec.occasion,
                    weather: getWeatherType(),
                    mood: selectedMood,
                    styleAdvice: rec.styleAdvice,
                },
            }, { on401: "throw" }),
        onSuccess: () => {
            setIsSaved(true);
            toast({ title: "Saved!", description: "Added to your outfits" });
            queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
        },
    });

    const handleRefresh = () => {
        reset();
        setIsSaved(false);
    };

    const recommendation = result?.recommendations?.[0];

    // Get wardrobe item details
    const getItem = (id: number) => wardrobeItems.find((item) => item.id === id);

    // Empty wardrobe
    if (wardrobeItems.length === 0) {
        return (
            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-[#E5E5E5]/50">
                <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shirt className="w-8 h-8 text-[#CACACA]" />
                </div>
                <p className="text-[#1A1A1A] font-medium">Your wardrobe is empty</p>
                <p className="text-[#6B6B6B] text-sm mt-1">Add items to get AI outfit suggestions</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Occasion Selector - Floating or Integrated */}
            {!recommendation && (
                <div className="flex justify-end mb-4">
                    <div className="relative">
                        <button
                            onClick={() => setShowOccasionPicker(!showOccasionPicker)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5E5E5] text-sm text-[#1A1A1A] hover:bg-[#F9F9F7] transition-all shadow-sm"
                        >
                            <span className="text-[#6B6B6B]">Occasion:</span>
                            <span className="font-medium">{occasions.find(o => o.key === occasion)?.label || "Everyday"}</span>
                            <ChevronDown className={`w-3 h-3 text-[#6B6B6B] transition-transform ${showOccasionPicker ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {showOccasionPicker && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-[#E5E5E5] overflow-hidden z-20 min-w-[160px] py-1"
                                >
                                    {occasions.map((o) => (
                                        <button
                                            key={o.key}
                                            onClick={() => {
                                                setOccasion(o.key);
                                                setShowOccasionPicker(false);
                                            }}
                                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#F9F9F7] transition-colors flex items-center justify-between ${occasion === o.key ? 'text-[#80163A] bg-[#FBF5F7] font-medium' : 'text-[#1A1A1A]'
                                                }`}
                                        >
                                            {o.label}
                                            {occasion === o.key && <Check className="w-3 h-3" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {!recommendation ? (
                    /* "Zero State" / Generate Call to Action */
                    <motion.div
                        key="generate"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="relative flex flex-col items-center justify-center py-12 px-6 bg-white rounded-[2rem] border border-[#E5E5E5] shadow-sm text-center overflow-hidden"
                    >
                        {/* Decorative Background Blur */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#80163A] rounded-full filter blur-[100px] opacity-[0.03] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37] rounded-full filter blur-[80px] opacity-[0.05] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

                        <div className="relative z-10 w-20 h-20 bg-gradient-to-tr from-[#F9F9F7] to-[#F0F0F0] rounded-full flex items-center justify-center mb-6 shadow-inner border border-white">
                            <Sparkles className="w-8 h-8 text-[#1A1A1A]" />
                        </div>

                        <h3 className="relative z-10 text-3xl text-[#1A1A1A] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Daily <span className="italic text-[#80163A]">Curation</span>
                        </h3>
                        <p className="relative z-10 text-sm text-[#6B6B6B] mb-8 max-w-[280px] leading-relaxed mx-auto">
                            Let's compose a look for <span className="font-medium text-[#1A1A1A]">{weather.temperature}° {weather.condition}</span>.
                            Ready for your {occasions.find(o => o.key === occasion)?.label.toLowerCase()} agenda?
                        </p>

                        <motion.button
                            onClick={() => generate()}
                            disabled={isPending}
                            className="relative z-10 group h-12 px-10 bg-[#1A1A1A] text-white rounded-full text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-3 disabled:opacity-80 hover:bg-[#80163A] transition-all shadow-xl shadow-[#1A1A1A]/20 hover:shadow-[#80163A]/20"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Curating...</span>
                                </>
                            ) : (
                                <>
                                    <span>Style Me</span>
                                    <div className="w-px h-3 bg-white/20" />
                                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                ) : (
                    /* Result State - Premium Card */
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] border border-[#E5E5E5]/50 shadow-xl shadow-black/5 overflow-hidden"
                    >
                        {/* Outfit Name Header */}
                        <div className="px-6 pt-6 pb-2 flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold tracking-widest text-[#9A9A9A] uppercase mb-1">Recommended For You</p>
                                <h3 className="text-xl md:text-2xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    {recommendation.outfitName}
                                </h3>
                            </div>
                            <button
                                onClick={handleRefresh}
                                className="p-2.5 rounded-full bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#1A1A1A] transition-colors"
                                title="Generate New"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Main Visual Composition */}
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-2 aspect-[4/3] w-full rounded-2xl overflow-hidden">
                                {/* Primary Item - Takes full left half */}
                                <div className="col-span-1 row-span-2 relative bg-[#F9F9F7] group overflow-hidden">
                                    {recommendation.items[0] && getItem(recommendation.items[0].id)?.imageUrl ? (
                                        <img
                                            src={getItem(recommendation.items[0].id)!.imageUrl}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            alt="Main item"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><Shirt className="w-10 h-10 text-[#DDD]" /></div>
                                    )}
                                </div>

                                {/* Secondary Items - Right Column Stacked */}
                                <div className="col-span-1 flex flex-col gap-2 h-full">
                                    <div className="flex-1 relative bg-[#F9F9F7] group overflow-hidden rounded-tr-none">
                                        {recommendation.items[1] && getItem(recommendation.items[1].id)?.imageUrl ? (
                                            <img
                                                src={getItem(recommendation.items[1].id)!.imageUrl}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                alt="Item 2"
                                            />
                                        ) : null}
                                    </div>
                                    <div className="flex-1 relative bg-[#F9F9F7] group overflow-hidden rounded-br-none">
                                        {recommendation.items[2] && getItem(recommendation.items[2].id)?.imageUrl ? (
                                            <img
                                                src={getItem(recommendation.items[2].id)!.imageUrl}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                alt="Item 3"
                                            />
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Style Advice */}
                        <div className="px-6 pb-6">
                            <p className="text-sm text-[#6B6B6B] leading-relaxed italic border-l-2 border-[#80163A] pl-4 py-1 mb-6">
                                {recommendation.styleAdvice}
                            </p>

                            {/* Action Bar */}
                            <div className="flex gap-3">
                                <motion.button
                                    onClick={() => saveOutfit(recommendation)}
                                    disabled={isSaving || isSaved}
                                    className={`flex-1 h-12 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${isSaved
                                        ? "bg-[#E8F5E9] text-[#2E7D32]"
                                        : "bg-[#1A1A1A] text-white hover:bg-[#333]"
                                        }`}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isSaved ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Saved to Wardrobe
                                        </>
                                    ) : (
                                        <>
                                            <Heart className="w-4 h-4" />
                                            Save this Look
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

export default AIStylistMinimal;
