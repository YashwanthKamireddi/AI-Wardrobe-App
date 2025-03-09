import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AnimatedCard } from "@/components/ui/animated-card";
import { WardrobeItem } from "@shared/schema";
import { AIOutfitRecommendation } from "@/types/ai-types";
import {
  CheckCircleIcon as CheckCircle,
  SparklesIcon as Sparkles,
  CalendarIcon as Calendar,
  SaveIcon as Save,
  Loader2Icon as Loader2,
  AlertCircleIcon as AlertCircle,
} from "lucide-react";

interface OccasionOutfitGeneratorProps {
  weather?: { 
    temperature: number; 
    condition: string; 
    icon: string; 
  };
  wardrobeItems: WardrobeItem[];
}

export default function OccasionOutfitGenerator({ weather, wardrobeItems }: OccasionOutfitGeneratorProps) {
  const [occasion, setOccasion] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Convert weather condition to a simple format for the AI
  const getSimpleWeather = () => {
    if (!weather) return undefined;
    
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

  // Get outfit for occasion mutation
  const { 
    mutate: generateOutfit, 
    data: outfitData, 
    isPending, 
    isError, 
    error
  } = useMutation({
    mutationFn: () => apiRequest<{recommendation: AIOutfitRecommendation, occasion: string}>({
      path: '/api/occasion-outfit',
      method: 'POST',
      body: {
        occasion,
        weather: getSimpleWeather()
      }
    }, { on401: 'throw' }),
    onSuccess: () => {
      setShowResults(true);
    },
    onError: (err: Error) => {
      toast({
        title: "Error generating outfit",
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
        weather: getSimpleWeather(),
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

  const handleGenerateOutfit = () => {
    if (!occasion.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter an occasion for your outfit.",
        variant: "destructive",
      });
      return;
    }
    
    generateOutfit();
  };

  const handleSaveOutfit = (recommendation: AIOutfitRecommendation) => {
    saveOutfit(recommendation);
  };

  if (wardrobeItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Occasion-Based Outfit Generator</CardTitle>
          <CardDescription>Add some items to your wardrobe to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            You need to add some items to your wardrobe before you can generate outfits.
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
            <CheckCircle className="h-5 w-5 text-primary" />
            Occasion Outfit Generator
          </CardTitle>
          <CardDescription>
            Get the perfect outfit suggestion for any occasion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="occasion">Enter the Occasion</Label>
              <Input
                id="occasion"
                placeholder="e.g., Job interview, Date night, Wedding, Beach day"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Be specific about the event, setting, and formality level
              </p>
            </div>

            {weather && (
              <div className="px-3 py-2 bg-muted/50 rounded-md text-sm">
                <span className="font-medium">Current weather:</span> {weather.temperature}°C, {weather.condition}
                <span className="block text-xs text-muted-foreground mt-1">
                  We'll factor in the weather when suggesting your outfit.
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateOutfit} 
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Perfect Outfit...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Perfect Outfit
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
              Error Generating Outfit
            </CardTitle>
            <CardDescription>
              There was an error generating your outfit suggestion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {error?.message || "Please try again or use different occasion details."}
            </p>
          </CardContent>
        </Card>
      )}

      {showResults && outfitData && outfitData.recommendation && (
        <AnimatedCard 
          hoverEffect="glow"
          className="border-primary/50"
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{outfitData.recommendation.outfitName}</CardTitle>
                <CardDescription>Perfect for: {outfitData.occasion}</CardDescription>
              </div>
              <Badge variant="outline">
                {outfitData.recommendation.confidence}% match
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="mb-4">{outfitData.recommendation.description}</p>
              
              <h4 className="text-sm font-medium mb-3">Outfit Items:</h4>
              <div className="space-y-4">
                {outfitData.recommendation.items.map((item) => (
                  <div key={item.id} className="pl-4 border-l-2 border-primary">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.reason}</div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h4 className="text-sm font-medium mb-2">Styling Advice:</h4>
                <p className="text-sm text-muted-foreground">{outfitData.recommendation.styleAdvice}</p>
              </div>
              
              {weather && (
                <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                  <span className="font-medium">Weather Consideration:</span> Outfit is suitable for current weather conditions: {weather.temperature}°C, {weather.condition}.
                </div>
              )}
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
              Schedule for Event
            </Button>
            
            <Button
              onClick={() => handleSaveOutfit(outfitData.recommendation)}
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
      )}
    </div>
  );
}