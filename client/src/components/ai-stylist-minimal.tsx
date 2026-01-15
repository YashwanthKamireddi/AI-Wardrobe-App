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
      <div className="text-center py-12">
        <Shirt className="w-10 h-10 mx-auto mb-4 text-[#CACACA]" />
        <p className="text-[#6B6B6B] text-sm">Add items to get outfit suggestions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Header with Weather */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl md:text-2xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Today's Outfit
          </h3>
          <p className="text-sm text-[#6B6B6B]">
            {weather.temperature}° · {weather.condition}
          </p>
        </div>

        {/* Occasion Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowOccasionPicker(!showOccasionPicker)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F5F5] text-sm text-[#1A1A1A] hover:bg-[#EBEBEB] transition-colors"
          >
            {occasions.find(o => o.key === occasion)?.label || "Everyday"}
            <ChevronDown className={`w-4 h-4 text-[#6B6B6B] transition-transform ${showOccasionPicker ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showOccasionPicker && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-[#E5E5E5] overflow-hidden z-20 min-w-[140px]"
              >
                {occasions.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => {
                      setOccasion(o.key);
                      setShowOccasionPicker(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-[#F9F9F7] transition-colors ${
                      occasion === o.key ? 'text-[#80163A] bg-[#FBF5F7] font-medium' : 'text-[#1A1A1A]'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!recommendation ? (
          /* Generate State */
          <motion.div
            key="generate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-10"
          >
            <motion.button
              onClick={() => generate()}
              disabled={isPending}
              className="group relative w-full max-w-sm mx-auto h-14 bg-[#1A1A1A] text-white rounded-full text-sm font-medium flex items-center justify-center gap-3 disabled:opacity-60"
              whileHover={{ scale: 1.02, backgroundColor: "#80163A" }}
              whileTap={{ scale: 0.98 }}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating your look...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Outfit</span>
                </>
              )}
            </motion.button>
            <p className="text-xs text-[#9A9A9A] mt-3">
              AI will pick the best pieces for today
            </p>
          </motion.div>
        ) : (
          /* Result State */
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Outfit Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {recommendation.items.slice(0, 4).map((item, index) => {
                const wardrobeItem = getItem(item.id);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative aspect-square rounded-2xl bg-[#F5F5F5] overflow-hidden border border-[#E5E5E5]/50"
                  >
                    {wardrobeItem?.imageUrl ? (
                      <img
                        src={wardrobeItem.imageUrl}
                        alt={wardrobeItem.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F5F5F5] to-[#EBEBEB]">
                        <Shirt className="w-10 h-10 text-[#CACACA]" />
                      </div>
                    )}
                    {/* Category label */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3">
                      <p className="text-white text-xs font-medium truncate">
                        {wardrobeItem?.name || "Item"}
                      </p>
                      <p className="text-white/70 text-[10px] uppercase tracking-wider">
                        {wardrobeItem?.category || "Clothing"}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Style Note */}
            {recommendation.styleAdvice && (
              <div className="p-4 rounded-2xl bg-[#F9F9F7] border border-[#E5E5E5]/50">
                <p className="text-sm text-[#6B6B6B] text-center italic leading-relaxed">
                  "{recommendation.styleAdvice}"
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <motion.button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F5F5F5] text-sm text-[#6B6B6B] hover:bg-[#EBEBEB] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </motion.button>
              <motion.button
                onClick={() => saveOutfit(recommendation)}
                disabled={isSaving || isSaved}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  isSaved
                    ? "bg-[#E8F5E9] text-[#2E7D32]"
                    : "bg-[#1A1A1A] text-white hover:bg-[#80163A]"
                }`}
                whileHover={{ scale: isSaved ? 1 : 1.02 }}
                whileTap={{ scale: isSaved ? 1 : 0.98 }}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    Save Outfit
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default AIStylistMinimal;
