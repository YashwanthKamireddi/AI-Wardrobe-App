import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { WardrobeItem } from "@shared/schema";
import { AIOutfitRecommendation, AIOutfitRecommendationRequest } from "@/types/ai-types";
import {
  Sparkles,
  Calendar,
  Save,
  Loader2,
  ChevronRight,
  Cloud,
  Droplets,
  Wind,
  ThermometerSun,
  Bookmark,
  RefreshCw,
  Heart,
  ArrowRight,
  Check,
  Palette,
  Shirt,
  X,
} from "lucide-react";

interface AIOutfitRecommendationProps {
  weather: {
    temperature: number;
    condition: string;
    icon: string;
  };
  wardrobeItems: WardrobeItem[];
  selectedMood?: string;
}

// Mood configurations with editorial descriptions
const moodConfig: Record<string, { label: string; description: string; colors: string[] }> = {
  happy: {
    label: "Joyful",
    description: "Bright, warm energy radiating optimism",
    colors: ["#F5C563", "#E8A839", "#FFE5B4"],
  },
  confident: {
    label: "Powerful",
    description: "Bold presence, commanding attention",
    colors: ["#1A1A1A", "#80163A", "#C5A572"],
  },
  relaxed: {
    label: "Serene",
    description: "Effortless ease, quiet sophistication",
    colors: ["#E8E4DF", "#C4B8A5", "#9A8F82"],
  },
  energetic: {
    label: "Dynamic",
    description: "Movement and vitality in every thread",
    colors: ["#E55B3C", "#FF7F5C", "#FFB49A"],
  },
  romantic: {
    label: "Ethereal",
    description: "Soft, dreamy allure with gentle femininity",
    colors: ["#D4A5A5", "#E8C4C4", "#F5E1E1"],
  },
  professional: {
    label: "Refined",
    description: "Polished excellence, understated power",
    colors: ["#2C3E50", "#34495E", "#5D6D7E"],
  },
  creative: {
    label: "Expressive",
    description: "Artistic vision brought to life",
    colors: ["#9B59B6", "#8E44AD", "#D7BDE2"],
  },
};

// Occasion configurations
const occasionConfig: Record<string, { label: string; icon: string }> = {
  none: { label: "Everyday", icon: "☀️" },
  work: { label: "Office", icon: "💼" },
  casual: { label: "Weekend", icon: "🌿" },
  date: { label: "Date Night", icon: "✨" },
  formal: { label: "Black Tie", icon: "🥂" },
  interview: { label: "Interview", icon: "🤝" },
  party: { label: "Celebration", icon: "🎉" },
  workout: { label: "Active", icon: "⚡" },
};

const AIStylistEditorial = memo(function AIStylistEditorial({
  weather,
  wardrobeItems,
  selectedMood: initialMood,
}: AIOutfitRecommendationProps) {
  const [selectedMood, setSelectedMood] = useState(initialMood || "confident");
  const [selectedOccasion, setSelectedOccasion] = useState("none");
  const [showResults, setShowResults] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (initialMood) {
      setSelectedMood(initialMood);
    }
  }, [initialMood]);

  const getWeatherType = useCallback((): string => {
    if (!weather) return "mild";
    const { condition, temperature } = weather;
    if (condition.toLowerCase().includes("rain")) return "rainy";
    if (condition.toLowerCase().includes("snow")) return "snowy";
    if (condition.toLowerCase().includes("cloud")) return "cloudy";
    if (condition.toLowerCase().includes("wind")) return "windy";
    if (condition.toLowerCase().includes("sun") || condition.toLowerCase().includes("clear"))
      return "sunny";
    if (temperature < 5) return "cold";
    if (temperature > 25) return "hot";
    return "mild";
  }, [weather]);

  // Get AI outfit recommendations
  const {
    mutate: generateRecommendations,
    data: recommendationsData,
    isPending,
    isError,
    reset,
  } = useMutation({
    mutationFn: () => {
      const requestData: AIOutfitRecommendationRequest = {
        mood: selectedMood,
        weather: getWeatherType(),
        occasion: selectedOccasion !== "none" ? selectedOccasion : undefined,
      };
      return apiRequest<{ recommendations: AIOutfitRecommendation[] }>(
        {
          path: "/api/ai-outfit-recommendations",
          method: "POST",
          body: requestData,
        },
        { on401: "throw" }
      );
    },
    onSuccess: () => {
      setShowResults(true);
      setSelectedRecommendation(0);
      setIsLiked(false);
    },
    onError: (err: Error) => {
      toast({
        title: "Unable to generate looks",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Save outfit mutation
  const { mutate: saveOutfit, isPending: isSavingOutfit } = useMutation({
    mutationFn: (recommendation: AIOutfitRecommendation) =>
      apiRequest(
        {
          path: "/api/outfits",
          method: "POST",
          body: {
            name: recommendation.outfitName,
            description: recommendation.description,
            items: recommendation.items.map((item) => item.id),
            occasion: recommendation.occasion,
            weather: getWeatherType(),
            mood: selectedMood,
            styleAdvice: recommendation.styleAdvice,
          },
        },
        { on401: "throw" }
      ),
    onSuccess: () => {
      toast({
        title: "Look saved to collection",
        description: "Find it in your Outfits",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Couldn't save look",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = useCallback(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const handleNewLook = useCallback(() => {
    reset();
    setShowResults(false);
    setIsLiked(false);
  }, [reset]);

  // Get wardrobe item by id
  const getWardrobeItem = (id: number): WardrobeItem | undefined => {
    return wardrobeItems.find((item) => item.id === id);
  };

  // Extract color from item
  const extractColor = (item: WardrobeItem | undefined): string => {
    if (!item?.color) return "#E5E5E5";
    const colorMap: Record<string, string> = {
      white: "#FAFAFA",
      black: "#1A1A1A",
      navy: "#1B2838",
      blue: "#3B5998",
      grey: "#6B6B6B",
      gray: "#6B6B6B",
      brown: "#8B4513",
      tan: "#D2B48C",
      khaki: "#C3B091",
      indigo: "#3F51B5",
      olive: "#556B2F",
      red: "#B44141",
      burgundy: "#80163A",
      green: "#2E7D32",
      beige: "#E8DFD0",
    };
    const lowerColor = item.color.toLowerCase();
    for (const [key, value] of Object.entries(colorMap)) {
      if (lowerColor.includes(key)) return value;
    }
    return "#9A8F82";
  };

  const recommendations = recommendationsData?.recommendations || [];
  const currentRecommendation = recommendations[selectedRecommendation];
  const currentMoodConfig = moodConfig[selectedMood] || moodConfig.confident;

  // Get style insight based on mood and weather
  const getStyleInsight = () => {
    const weatherInsights: Record<string, string> = {
      rainy: "Layering creates depth while keeping you dry",
      cold: "Rich textures add warmth and visual interest",
      hot: "Breathable fabrics maintain your polished look",
      mild: "Perfect conditions for versatile layering",
      sunny: "Light colors reflect your radiant mood",
      cloudy: "Structured pieces add definition to softer light",
      snowy: "Contrast creates drama against white backdrop",
      windy: "Tailored fits stay elegant in motion",
    };
    return weatherInsights[getWeatherType()] || weatherInsights.mild;
  };

  // Empty state
  if (wardrobeItems.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
          <Shirt className="w-8 h-8 text-[#9A9A9A]" />
        </div>
        <h3
          className="text-xl text-[#1A1A1A] mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Your Wardrobe Awaits
        </h3>
        <p className="text-sm text-[#6B6B6B] max-w-sm mx-auto">
          Add pieces to your collection and discover personalized looks curated just for you.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!showResults ? (
          /* SELECTION VIEW */
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center pb-2">
              <p
                className="text-xs tracking-[0.2em] uppercase text-[#80163A] mb-2"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Your Personal Stylist
              </p>
              <h2
                className="text-2xl md:text-3xl text-[#1A1A1A] mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Curate Today's Look
              </h2>
              <p className="text-sm text-[#6B6B6B] max-w-md mx-auto">
                Tell me about your mood and I'll craft the perfect ensemble from your wardrobe
              </p>
            </div>

            {/* Weather Context */}
            {weather && (
              <motion.div
                className="flex items-center justify-center gap-6 py-4 px-6 bg-gradient-to-r from-[#F9F9F7] via-[#F5F5F3] to-[#F9F9F7] rounded-2xl border border-[#E5E5E5]/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <ThermometerSun className="w-5 h-5 text-[#80163A]" />
                  </div>
                  <div>
                    <p className="text-2xl font-light text-[#1A1A1A]">{weather.temperature}°</p>
                    <p className="text-xs text-[#6B6B6B] capitalize">{weather.condition}</p>
                  </div>
                </div>
                <div className="h-12 w-px bg-[#E5E5E5]" />
                <p className="text-sm text-[#6B6B6B] italic max-w-xs">{getStyleInsight()}</p>
              </motion.div>
            )}

            {/* Mood Selection */}
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-[#6B6B6B] mb-4">
                How are you feeling?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(moodConfig).map(([key, config], index) => (
                  <motion.button
                    key={key}
                    onClick={() => setSelectedMood(key)}
                    className={`relative p-4 rounded-xl text-left transition-all overflow-hidden ${
                      selectedMood === key
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-white border border-[#E5E5E5] hover:border-[#1A1A1A]"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Color accent bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{
                        background: `linear-gradient(90deg, ${config.colors.join(", ")})`,
                      }}
                    />
                    <p
                      className={`text-sm font-medium mb-1 ${
                        selectedMood === key ? "text-white" : "text-[#1A1A1A]"
                      }`}
                    >
                      {config.label}
                    </p>
                    <p
                      className={`text-xs leading-relaxed ${
                        selectedMood === key ? "text-white/70" : "text-[#6B6B6B]"
                      }`}
                    >
                      {config.description}
                    </p>
                    {selectedMood === key && (
                      <motion.div
                        className="absolute bottom-3 right-3"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Check className="w-4 h-4 text-white/70" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Occasion Selection */}
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-[#6B6B6B] mb-4">
                What's the occasion?
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(occasionConfig).map(([key, config], index) => (
                  <motion.button
                    key={key}
                    onClick={() => setSelectedOccasion(key)}
                    className={`px-4 py-2.5 rounded-full text-sm transition-all ${
                      selectedOccasion === key
                        ? "bg-[#80163A] text-white"
                        : "bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#80163A] hover:text-[#80163A]"
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.03 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="mr-1.5">{config.icon}</span>
                    {config.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <motion.div
              className="pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                onClick={handleGenerate}
                disabled={isPending}
                className="w-full h-14 bg-[#1A1A1A] text-white rounded-xl font-medium flex items-center justify-center gap-3 relative overflow-hidden group"
                whileHover={{ backgroundColor: "#80163A" }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Curating your look...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate My Look</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          /* RESULTS VIEW */
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Results Header */}
            <div className="flex items-start justify-between">
              <div>
                <motion.p
                  className="text-xs tracking-[0.2em] uppercase text-[#80163A] mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Styled for {currentMoodConfig.label.toLowerCase()} mood
                </motion.p>
                <motion.h2
                  className="text-2xl text-[#1A1A1A]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  Your Curated Look
                </motion.h2>
              </div>
              <motion.button
                onClick={handleNewLook}
                className="p-2.5 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <RefreshCw className="w-4 h-4 text-[#6B6B6B]" />
              </motion.button>
            </div>

            {isError ? (
              /* Error State */
              <motion.div
                className="text-center py-12 px-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-16 h-16 rounded-full bg-[#F5E6E6] flex items-center justify-center mx-auto mb-4">
                  <X className="w-7 h-7 text-[#B44141]" />
                </div>
                <h3
                  className="text-xl text-[#1A1A1A] mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Couldn't create your look
                </h3>
                <p className="text-sm text-[#6B6B6B] mb-6">
                  Let's try again with different preferences
                </p>
                <motion.button
                  onClick={handleNewLook}
                  className="h-11 px-6 bg-[#1A1A1A] text-white text-sm font-medium rounded-full"
                  whileHover={{ backgroundColor: "#80163A" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Try Again
                </motion.button>
              </motion.div>
            ) : currentRecommendation ? (
              <>
                {/* Outfit Visual */}
                <motion.div
                  className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#F9F9F7] to-[#F0EDE8]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Outfit Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3
                          className="text-xl text-[#1A1A1A] mb-1"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          {currentRecommendation.outfitName}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-2.5 py-1 bg-white rounded-full text-[#6B6B6B] border border-[#E5E5E5]">
                            {occasionConfig[selectedOccasion]?.label || "Everyday"}
                          </span>
                          {currentRecommendation.confidence && (
                            <span className="text-xs text-[#80163A] font-medium">
                              {currentRecommendation.confidence}% match
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.button
                        onClick={() => setIsLiked(!isLiked)}
                        className={`p-2.5 rounded-full transition-colors ${
                          isLiked ? "bg-[#80163A]" : "bg-white border border-[#E5E5E5]"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart
                          className={`w-4 h-4 ${isLiked ? "text-white fill-white" : "text-[#6B6B6B]"}`}
                        />
                      </motion.button>
                    </div>
                    <p className="text-sm text-[#6B6B6B] leading-relaxed">
                      {currentRecommendation.description}
                    </p>
                  </div>

                  {/* Visual Outfit Grid */}
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {currentRecommendation.items.map((item, index) => {
                        const wardrobeItem = getWardrobeItem(item.id);
                        return (
                          <motion.div
                            key={item.id}
                            className="relative aspect-square rounded-xl overflow-hidden bg-white shadow-sm group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
                          >
                            {wardrobeItem?.imageUrl ? (
                              <img
                                src={wardrobeItem.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ backgroundColor: extractColor(wardrobeItem) }}
                              >
                                <Shirt className="w-8 h-8 text-white/50" />
                              </div>
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                              <p className="text-white text-xs font-medium line-clamp-2">
                                {item.name}
                              </p>
                            </div>
                            {/* Category badge */}
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full">
                              <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">
                                {wardrobeItem?.category || "item"}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div className="px-6 pb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Palette className="w-4 h-4 text-[#6B6B6B]" />
                      <span className="text-xs tracking-[0.1em] uppercase text-[#6B6B6B]">
                        Color Harmony
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {currentRecommendation.items.slice(0, 5).map((item, index) => {
                        const wardrobeItem = getWardrobeItem(item.id);
                        const color = extractColor(wardrobeItem);
                        return (
                          <motion.div
                            key={item.id}
                            className="group relative"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                          >
                            <div
                              className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                              style={{ backgroundColor: color }}
                            />
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1A1A1A] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {wardrobeItem?.color || "Color"}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* Item Breakdown */}
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h4 className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B]">
                    Why This Works
                  </h4>
                  {currentRecommendation.items.map((item, index) => {
                    const wardrobeItem = getWardrobeItem(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        className="flex items-start gap-4 p-4 bg-white rounded-xl border border-[#E5E5E5]/50"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 + index * 0.05 }}
                      >
                        <div
                          className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden"
                          style={{ backgroundColor: extractColor(wardrobeItem) }}
                        >
                          {wardrobeItem?.imageUrl ? (
                            <img
                              src={wardrobeItem.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Shirt className="w-6 h-6 text-white/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-medium text-[#1A1A1A] text-sm">{item.name}</p>
                            <span className="text-xs px-2 py-0.5 bg-[#F5F5F5] rounded-full text-[#6B6B6B] flex-shrink-0">
                              {wardrobeItem?.category}
                            </span>
                          </div>
                          <p className="text-xs text-[#6B6B6B] leading-relaxed">{item.reason}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Styling Advice */}
                {currentRecommendation.styleAdvice && (
                  <motion.div
                    className="p-5 bg-gradient-to-r from-[#1A1A1A] to-[#2D2D2D] rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-[#C5A572]" />
                      <span className="text-xs tracking-[0.1em] uppercase text-white/60">
                        Stylist Notes
                      </span>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed italic">
                      "{currentRecommendation.styleAdvice}"
                    </p>
                  </motion.div>
                )}

                {/* Multi-recommendation nav (if more than 1) */}
                {recommendations.length > 1 && (
                  <motion.div
                    className="flex items-center justify-center gap-2 pt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    {recommendations.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedRecommendation(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          selectedRecommendation === index
                            ? "bg-[#80163A] w-8"
                            : "bg-[#E5E5E5] hover:bg-[#D0D0D0]"
                        }`}
                      />
                    ))}
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  className="flex gap-3 pt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.button
                    onClick={() => {
                      toast({
                        title: "Coming Soon",
                        description: "Calendar scheduling will be available soon",
                      });
                    }}
                    className="flex-1 h-12 bg-white border border-[#E5E5E5] rounded-xl text-sm font-medium text-[#1A1A1A] flex items-center justify-center gap-2 hover:border-[#1A1A1A] transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </motion.button>
                  <motion.button
                    onClick={() => saveOutfit(currentRecommendation)}
                    disabled={isSavingOutfit}
                    className="flex-1 h-12 bg-[#80163A] rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 hover:bg-[#6B1331] transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSavingOutfit ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                    Save to Collection
                  </motion.button>
                </motion.div>
              </>
            ) : (
              /* Loading shimmer */
              <div className="space-y-4">
                <div className="h-48 bg-gradient-to-r from-[#F5F5F5] via-[#EDEDED] to-[#F5F5F5] rounded-xl animate-pulse" />
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-[#F5F5F5] rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default AIStylistEditorial;
