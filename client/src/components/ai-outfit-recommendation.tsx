import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AnimatedCard } from "@/components/ui/animated-card";
import { WardrobeItem } from "@shared/schema";
import { AIOutfitRecommendation, AIOutfitRecommendationRequest } from "@/types/ai-types";
import {
  SparklesIcon as Sparkles,
  CalendarIcon as Calendar,
  SaveIcon as Save,
  Loader2Icon as Loader2,
  AlertCircleIcon as AlertCircle,
  CloudIcon,
  SunIcon,
  ThumbsUpIcon as ThumbsUp
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

// Memoize the component for better performance
const AIOutfitRecommenderComponent = memo(function AIOutfitRecommenderComponent({ 
  weather, 
  wardrobeItems, 
  selectedMood: initialMood 
}: AIOutfitRecommendationProps) {
  const [selectedMood, setSelectedMood] = useState(initialMood || "happy");
  const [selectedOccasion, setSelectedOccasion] = useState("none");
  const [showResults, setShowResults] = useState(false);
  
  // Update selectedMood when initialMood changes
  useEffect(() => {
    if (initialMood) {
      setSelectedMood(initialMood);
    }
  }, [initialMood]);

  // Helper to convert weather condition to a simple format for the AI
  const getWeatherType = useCallback((): string => {
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
  }, [weather]);

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
        weather: getWeatherType(),
        occasion: selectedOccasion !== "none" ? selectedOccasion : undefined
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

  // Schedule outfit mutation
  const { mutate: scheduleOutfit, isPending: isSchedulingOutfit } = useMutation({
    mutationFn: (data: { outfitId: number, date: string }) => apiRequest({
      path: '/api/calendar-outfits',
      method: 'POST',
      body: data
    }, { on401: 'throw' }),
    onSuccess: () => {
      toast({
        title: "Outfit scheduled",
        description: "The outfit has been added to your calendar.",
      });
      // Invalidate calendar outfits query
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-outfits'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error scheduling outfit",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateRecommendations = useCallback(() => {
    if (!selectedMood) {
      toast({
        title: "Missing information",
        description: "Please select a mood for your outfit recommendations.",
        variant: "destructive",
      });
      return;
    }
    
    generateRecommendations();
  }, [selectedMood, generateRecommendations]);

  const handleSaveOutfit = useCallback((recommendation: AIOutfitRecommendation) => {
    saveOutfit(recommendation);
  }, [saveOutfit]);

  if (wardrobeItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Outfit Recommendations</CardTitle>
          <CardDescription>Add some items to your wardrobe to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            You need to add some items to your wardrobe before you can generate outfit recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Outfit Recommendations
          </CardTitle>
          <CardDescription>
            Get personalized outfit recommendations based on your mood and the weather
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mood">How are you feeling today?</Label>
              <Select 
                value={selectedMood} 
                onValueChange={setSelectedMood}
              >
                <SelectTrigger id="mood" className="w-full">
                  <SelectValue placeholder="Select your mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="happy">Happy & Cheerful</SelectItem>
                  <SelectItem value="confident">Confident & Bold</SelectItem>
                  <SelectItem value="relaxed">Relaxed & Casual</SelectItem>
                  <SelectItem value="energetic">Energetic & Active</SelectItem>
                  <SelectItem value="romantic">Romantic & Dreamy</SelectItem>
                  <SelectItem value="professional">Professional & Polished</SelectItem>
                  <SelectItem value="creative">Creative & Expressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion (optional)</Label>
              <Select 
                value={selectedOccasion} 
                onValueChange={setSelectedOccasion}
              >
                <SelectTrigger id="occasion" className="w-full">
                  <SelectValue placeholder="Select an occasion (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific occasion</SelectItem>
                  <SelectItem value="work">Work / Office</SelectItem>
                  <SelectItem value="casual">Casual Outing</SelectItem>
                  <SelectItem value="date">Date Night</SelectItem>
                  <SelectItem value="formal">Formal Event</SelectItem>
                  <SelectItem value="interview">Job Interview</SelectItem>
                  <SelectItem value="party">Party</SelectItem>
                  <SelectItem value="workout">Workout / Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {weather && (
              <div className="px-3 py-2 bg-muted/50 rounded-md flex items-center">
                <div className="relative h-5 w-5 mr-2 text-primary">
                  <CloudIcon className="h-5 w-5 absolute" />
                  <SunIcon className="h-3 w-3 absolute right-0 bottom-0" />
                </div>
                <div>
                  <span className="font-medium">Current weather:</span> {weather.temperature}°C, {weather.condition}
                  <span className="block text-xs text-muted-foreground mt-1">
                    We'll consider the weather when suggesting your outfits.
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateRecommendations} 
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Recommendations...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Recommendations
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {isPending && (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Error Generating Recommendations
            </CardTitle>
            <CardDescription>
              There was an error generating your outfit recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {error?.message?.includes("quota") 
                ? "The OpenAI service has reached its usage limit. Please try again later or contact support for assistance."
                : error?.message || "Please try again or select different preferences."}
            </p>
            <div className="bg-muted p-3 rounded-md">
              <h4 className="font-medium text-sm mb-2">Troubleshooting Tips:</h4>
              <ul className="text-xs space-y-1 list-disc pl-4">
                <li>Try again in a few minutes</li>
                <li>Try selecting a different mood</li>
                <li>Check your internet connection</li>
                <li>If the problem persists, manual outfit selection is still available</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {showResults && recommendationsData && recommendationsData.recommendations && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your AI-Generated Outfit Suggestions</h3>
          <div className="flex items-center mb-2">
            <Badge variant="outline" className="mr-2 bg-primary/10 font-medium">Best Match</Badge>
            <div className="flex items-center gap-1 text-xs">
              <span className="flex items-center"><ThumbsUp className="mr-1 h-3 w-3" /> Top recommendation selected</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Based on your {selectedMood} mood{selectedOccasion ? ` and ${selectedOccasion} occasion` : ''}.
            {weather ? ` Optimized for ${weather.temperature}°C, ${weather.condition}.` : ''}
          </p>
          
          <div className="space-y-6">
            {recommendationsData.recommendations
              .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
              .slice(0, 1)
              .map((recommendation, index) => (
              <AnimatedCard
                key={index}
                hoverEffect="glow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{recommendation.outfitName}</CardTitle>
                      <CardDescription>
                        {recommendation.occasion}
                        {recommendation.confidence && (
                          <Badge variant="outline" className="ml-2">
                            {recommendation.confidence}% match
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <ThumbsUp className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <p className="mb-4">{recommendation.description}</p>
                    
                    <h4 className="text-sm font-medium mb-3">Outfit Components:</h4>
                    <div className="space-y-4">
                      {recommendation.items.map((item) => (
                        <div key={item.id} className="pl-3 border-l-2 border-primary">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.reason}</div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Styling Tips:</h4>
                      <p className="text-sm text-muted-foreground">{recommendation.styleAdvice}</p>
                    </div>
                  </motion.div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      // Add calendar functionality in the future
                      toast({
                        title: "Coming Soon",
                        description: "Calendar integration is coming soon!",
                      });
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                  
                  <Button
                    onClick={() => handleSaveOutfit(recommendation)}
                    disabled={isSavingOutfit}
                  >
                    {isSavingOutfit ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save to Outfits
                  </Button>
                </CardFooter>
              </AnimatedCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// Export default for easier imports
export default AIOutfitRecommenderComponent;