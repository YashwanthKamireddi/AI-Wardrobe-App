import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { AIOutfitRecommendation } from "../types/ai-types";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  ThumbsUp,
  Calendar,
  Save,
  Loader2,
  Umbrella,
  Sun,
  Cloud,
  CloudSnow,
  Wind,
} from "lucide-react";

// Weather icon mapping
const weatherIcons: Record<string, React.ReactNode> = {
  sunny: <Sun className="h-5 w-5 text-yellow-500" />,
  rainy: <Umbrella className="h-5 w-5 text-blue-500" />,
  cloudy: <Cloud className="h-5 w-5 text-gray-500" />,
  snowy: <CloudSnow className="h-5 w-5 text-blue-300" />,
  windy: <Wind className="h-5 w-5 text-blue-400" />,
};

// Mood options
const moodOptions = [
  { value: "happy", label: "Happy 😊" },
  { value: "confident", label: "Confident 💪" },
  { value: "relaxed", label: "Relaxed 😌" },
  { value: "energetic", label: "Energetic ⚡" },
  { value: "romantic", label: "Romantic 💖" },
  { value: "professional", label: "Professional 💼" },
  { value: "creative", label: "Creative 🎨" },
];

// Occasion options
const occasionOptions = [
  { value: "everyday", label: "Everyday" },
  { value: "work", label: "Work" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "date", label: "Date Night" },
  { value: "party", label: "Party" },
  { value: "interview", label: "Interview" },
  { value: "outdoor", label: "Outdoor Activity" },
];

interface AIOutfitRecommendationProps {
  weather: { 
    temperature: number; 
    condition: string; 
    icon: string; 
  };
  wardrobeItems: WardrobeItem[];
}

export default function AIOutfitRecommendation({ weather, wardrobeItems }: AIOutfitRecommendationProps) {
  const [mood, setMood] = useState("happy");
  const [occasion, setOccasion] = useState("everyday");
  const [expandedOutfit, setExpandedOutfit] = useState<number | null>(null);

  // Convert weather condition to a simple format for the AI
  const getSimpleWeather = () => {
    const { condition, temperature } = weather;
    if (condition.toLowerCase().includes("rain")) return "rainy";
    if (condition.toLowerCase().includes("snow")) return "snowy";
    if (condition.toLowerCase().includes("cloud")) return "cloudy";
    if (condition.toLowerCase().includes("wind")) return "windy";
    
    // Temperature-based conditions if no specific weather is detected
    if (temperature < 5) return "cold";
    if (temperature > 25) return "hot";
    return "mild";
  };

  // AI outfit recommendations query
  const {
    data: recommendationsData,
    isLoading: isRecommendationsLoading,
    isError: isRecommendationsError,
    refetch
  } = useQuery({
    queryKey: ['ai-outfit-recommendations', mood, weather.condition],
    queryFn: () => apiRequest<{recommendations: AIOutfitRecommendation[], count: number}>({
      path: '/api/ai-outfit-recommendations',
      method: 'POST',
      body: {
        mood,
        weather: getSimpleWeather(),
        occasion
      }
    }, { on401: 'throw' }),
    enabled: false, // Don't fetch on mount, wait for user to click Generate
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
        weather: getSimpleWeather(),
        mood: mood,
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

  const handleExpandOutfit = (index: number) => {
    setExpandedOutfit(expandedOutfit === index ? null : index);
  };

  const handleGenerateOutfits = () => {
    refetch();
  };

  const handleSaveOutfit = (recommendation: AIOutfitRecommendation) => {
    saveOutfit(recommendation);
  };

  const renderWeatherIcon = (weatherType: string) => {
    return weatherIcons[weatherType] || <Cloud className="h-5 w-5" />;
  };

  if (wardrobeItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Outfit Recommendations</CardTitle>
          <CardDescription>Add some items to your wardrobe to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            You need to add some items to your wardrobe before you can get outfit recommendations.
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
            AI Outfit Recommendations
          </CardTitle>
          <CardDescription>
            Get personalized outfit recommendations based on your mood and the weather
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="mood">Your Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger id="mood">
                  <SelectValue placeholder="Select your mood" />
                </SelectTrigger>
                <SelectContent>
                  {moodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger id="occasion">
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  {occasionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Current Weather</Label>
              <div className="border rounded-md p-3 h-10 flex items-center gap-2">
                {renderWeatherIcon(weather.icon)}
                <span>
                  {weather.temperature}°C, {weather.condition}
                </span>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerateOutfits} 
            className="w-full"
            disabled={isRecommendationsLoading}
          >
            {isRecommendationsLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Outfit Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isRecommendationsLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
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
          ))}
        </div>
      )}

      {isRecommendationsError && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error Generating Recommendations</CardTitle>
            <CardDescription>
              There was an error generating your outfit recommendations. Please try again.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {recommendationsData && recommendationsData.recommendations.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Recommendations Available</CardTitle>
            <CardDescription>
              We couldn't generate any recommendations based on your current wardrobe and preferences.
              Try adding more items to your wardrobe or selecting different preferences.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {recommendationsData && recommendationsData.recommendations.length > 0 && (
        <div className="space-y-6">
          {recommendationsData.recommendations.map((recommendation, index) => (
            <AnimatedCard key={index} hoverEffect="glow">
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>{recommendation.outfitName}</span>
                  <Badge variant="outline" className="ml-2">
                    {recommendation.confidence}% match
                  </Badge>
                </CardTitle>
                <CardDescription>{recommendation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {expandedOutfit === index ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div>
                      <h4 className="text-sm font-medium mb-2">Items:</h4>
                      <ul className="space-y-3">
                        {recommendation.items.map((item) => (
                          <li key={item.id} className="pl-4 border-l-2 border-primary">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.reason}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Styling Advice:</h4>
                      <p className="text-sm text-muted-foreground">{recommendation.styleAdvice}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="secondary">
                        {moodOptions.find(m => m.value === mood)?.label || mood}
                      </Badge>
                      <Badge variant="secondary">
                        {occasionOptions.find(o => o.value === recommendation.occasion)?.label || recommendation.occasion}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {renderWeatherIcon(weather.icon)}
                        {getSimpleWeather()}
                      </Badge>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    Click "Show Details" to see the full recommendation
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleExpandOutfit(index)}
                >
                  {expandedOutfit === index ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Show Details
                    </>
                  )}
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      // TODO: Implement scheduling functionality
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
                    Save Outfit
                  </Button>
                </div>
              </CardFooter>
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  );
}