import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WardrobeItem, moodTypes } from "@shared/schema";
import { AIOutfitRecommendation, AIOutfitRecommendationRequest } from "@/types/ai-types";
import {
  SparklesIcon,
  SaveIcon,
  Loader2Icon,
  AlertCircleIcon,
  SmilePlusIcon, 
  BadgeCheckIcon, 
  CoffeeIcon, 
  HeartIcon, 
  BriefcaseIcon, 
  PaletteIcon 
} from "lucide-react";

interface IntegratedMoodOutfitProps {
  weather: { 
    temperature: number; 
    condition: string; 
    icon: string; 
  };
  wardrobeItems: WardrobeItem[];
}

export default function IntegratedMoodOutfit({ weather, wardrobeItems }: IntegratedMoodOutfitProps) {
  const [selectedMood, setSelectedMood] = useState("happy");
  const [showResults, setShowResults] = useState(false);
  
  // Helper to convert weather condition to a simple format for the AI
  const getWeatherType = (): string => {
    if (!weather) return "mild";
    
    const { condition, temperature } = weather;
    if (condition.toLowerCase().includes("rain")) return "rainy";
    if (condition.toLowerCase().includes("snow")) return "snowy";
    if (condition.toLowerCase().includes("cloud")) return "cloudy";
    if (condition.toLowerCase().includes("wind")) return "windy";
    if (condition.toLowerCase().includes("sun") || condition.toLowerCase().includes("clear")) return "sunny";
    
    // Temperature-based conditions if no specific weather is detected
    if (temperature < 5) return "cold";
    if (temperature > 25) return "hot";
    return "mild";
  };

  // Map mood types to icons
  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy": return <SmilePlusIcon className="h-6 w-6" />;
      case "confident": return <BadgeCheckIcon className="h-6 w-6" />;
      case "relaxed": return <CoffeeIcon className="h-6 w-6" />;
      case "energetic": return <SparklesIcon className="h-6 w-6" />;
      case "romantic": return <HeartIcon className="h-6 w-6" />;
      case "professional": return <BriefcaseIcon className="h-6 w-6" />;
      case "creative": return <PaletteIcon className="h-6 w-6" />;
      default: return <SmilePlusIcon className="h-6 w-6" />;
    }
  };

  // Define vibrant gradient backgrounds for each mood
  const getMoodGradient = (mood: string): string => {
    switch (mood) {
      case "happy": return "from-yellow-500 to-orange-500";
      case "confident": return "from-blue-500 to-indigo-600";
      case "relaxed": return "from-teal-400 to-teal-600";
      case "energetic": return "from-red-500 to-pink-600";
      case "romantic": return "from-pink-400 to-purple-500";
      case "professional": return "from-slate-500 to-gray-700";
      case "creative": return "from-purple-400 to-violet-600";
      default: return "from-primary to-primary/80";
    }
  };

  // Map mood types to descriptions
  const getMoodDescription = (mood: string): string => {
    switch (mood) {
      case "happy": return "Bright, colorful outfits to match your upbeat mood";
      case "confident": return "Bold, striking choices to make a statement";
      case "relaxed": return "Comfortable, laid-back pieces for effortless style";
      case "energetic": return "Dynamic looks to keep up with your active day";
      case "romantic": return "Soft, feminine pieces for a dreamy aesthetic";
      case "professional": return "Polished, refined outfits for a commanding presence";
      case "creative": return "Unique, artistic combinations to express yourself";
      default: return "Select a mood for personalized recommendations";
    }
  };

  // Get AI outfit recommendations mutation
  const { 
    mutate: generateRecommendations, 
    data: recommendationsData, 
    isPending, 
    isError, 
    error
  } = useMutation({
    mutationFn: () => {
      const requestData: AIOutfitRecommendationRequest = {
        mood: selectedMood,
        weather: getWeatherType()
      };
      
      return apiRequest<{ recommendations: AIOutfitRecommendation[] }>({
        path: '/api/ai-outfit-recommendations',
        method: 'POST',
        body: requestData
      }, { on401: 'throw' });
    },
    onSuccess: () => {
      setShowResults(true);
    },
    onError: (err: Error) => {
      toast({
        title: "Error generating recommendations",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Save outfit mutation
  const { mutate: saveOutfit, isPending: isSavingOutfit } = useMutation({
    mutationFn: (recommendation: AIOutfitRecommendation) => apiRequest({
      path: '/api/outfits',
      method: 'POST',
      body: {
        name: recommendation.outfitName,
        description: recommendation.description,
        items: recommendation.items.map(item => item.id),
        occasion: recommendation.occasion,
        weather: getWeatherType(),
        mood: selectedMood,
        styleAdvice: recommendation.styleAdvice
      }
    }, { on401: 'throw' }),
    onSuccess: () => {
      toast({
        title: "Outfit saved",
        description: "The outfit has been saved to your collection.",
      });
      // Invalidate outfits query
      queryClient.invalidateQueries({ queryKey: ['/api/outfits'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving outfit",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveOutfit = (recommendation: AIOutfitRecommendation) => {
    saveOutfit(recommendation);
  };

  // Generate a new outfit whenever the mood changes
  useEffect(() => {
    if (selectedMood && wardrobeItems.length > 0) {
      generateRecommendations();
    }
  }, [selectedMood]);

  if (wardrobeItems.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center py-8 text-muted-foreground font-poppins">
            You need to add some items to your wardrobe before you can generate outfit recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-2">
        {moodTypes.map((mood) => (
          <Button
            key={`mood-button-${mood.value}`}
            variant="ghost"
            className={cn(
              "flex flex-col items-center justify-center h-20 gap-1 p-0 transition-all",
              selectedMood === mood.value && "bg-gradient-to-br animate-pulse shadow-lg scale-105 border-none",
              selectedMood === mood.value && getMoodGradient(mood.value)
            )}
            onClick={() => setSelectedMood(mood.value)}
          >
            <div className={cn(
              "p-1 rounded-full transition-transform duration-300",
              selectedMood === mood.value ? "text-white transform scale-110" : "text-muted-foreground"
            )}>
              {getMoodIcon(mood.value)}
            </div>
            <span className={cn(
              "text-xs font-medium font-poppins",
              selectedMood === mood.value ? "text-white font-bold" : "text-foreground"
            )}>
              {mood.label}
            </span>
          </Button>
        ))}
      </div>

      <div className={cn(
        "p-3 rounded-lg bg-gradient-to-br shadow-md transform transition-all duration-300",
        selectedMood ? "translate-y-0 opacity-100" : "translate-y-2 opacity-90",
        getMoodGradient(selectedMood)
      )}>
        <p className="text-white text-sm font-medium font-poppins">
          {getMoodDescription(selectedMood)}
        </p>
      </div>

      {isPending && (
        <div className="space-y-4 mt-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      )}

      {isError && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircleIcon className="h-5 w-5" />
            <h3 className="font-medium font-poppins">Error Generating Recommendations</h3>
          </div>
          <p className="text-sm mb-3 font-poppins">
            {error?.message?.includes("quota") 
              ? "The OpenAI service has reached its usage limit. Please try again later or contact support for assistance."
              : error?.message || "Please try again or select different preferences."}
          </p>
        </div>
      )}

      {showResults && recommendationsData && recommendationsData.recommendations && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/10">Best Match</Badge>
            <span className="text-sm text-muted-foreground font-poppins">
              Based on your {selectedMood} mood.
              {weather ? ` Optimized for ${weather.temperature}°C, ${weather.condition}.` : ''}
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {recommendationsData.recommendations
              .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
              .slice(0, 1)
              .map((recommendation, index) => (
                <AnimatedCard
                  key={`recommendation-${recommendation.outfitName}-${index}`}
                  hoverEffect="glow"
                  className="border-2 border-primary/40 shadow-lg rounded-xl overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl font-poppins">{recommendation.outfitName}</h3>
                        <div className="text-sm text-muted-foreground mt-1 font-montserrat">
                          {recommendation.occasion}
                          {recommendation.confidence && (
                            <Badge variant="secondary" className="ml-2 font-medium">
                              {recommendation.confidence}% match
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="space-y-4"
                    >
                      <div className="text-base mb-5 p-3 bg-primary/5 rounded-lg font-poppins">{recommendation.description}</div>
                      
                      <div className="grid grid-cols-2 gap-5">
                        {recommendation.items.map((item) => {
                          // Find the full wardrobe item to get the image
                          const wardrobeItem = wardrobeItems.find(w => w.id === item.id);
                          return (
                            <div key={item.id} className="relative">
                              <div className="border-2 border-muted rounded-xl overflow-hidden aspect-square bg-muted/30 shadow-sm">
                                {wardrobeItem?.imageUrl ? (
                                  <img 
                                    src={wardrobeItem.imageUrl} 
                                    alt={wardrobeItem.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div className="mt-3">
                                <div className="font-medium text-sm font-poppins">{item.name}</div>
                                <div className="text-xs text-muted-foreground mt-1 font-montserrat">{item.reason}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="text-sm mt-5 pt-4 border-t border-primary/10">
                        <div className="font-semibold text-foreground mb-2 font-poppins">Styling Tips</div>
                        <div className="text-muted-foreground px-3 py-2 bg-muted/20 rounded-md font-montserrat">
                          {recommendation.styleAdvice}
                        </div>
                      </div>
                    </motion.div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => handleSaveOutfit(recommendation)}
                        disabled={isSavingOutfit}
                        className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 rounded-full px-6 font-poppins"
                        size="default"
                      >
                        {isSavingOutfit ? (
                          <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <SaveIcon className="mr-2 h-5 w-5" />
                        )}
                        Save to Wardrobe
                      </Button>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}