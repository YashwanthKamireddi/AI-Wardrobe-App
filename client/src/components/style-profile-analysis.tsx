import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedCard } from "@/components/ui/animated-card";
import { apiRequest } from "@/lib/queryClient";
import { StyleProfile } from "@/types/ai-types";
import { useToast } from "@/hooks/use-toast";
import {
  Brush,
  Book,
  Palette,
  Sparkles,
  RefreshCw,
  Shirt,
  Loader2,
  AlertCircle,
  TagIcon,
  Flower2,
  Heart,
  LayoutList,
  Flame,
  CheckCircle2,
  ThumbsUp,
  UserCircle,
  Crown,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface StyleProfileAnalysisProps {
  wardrobeItemsCount: number;
}

export default function StyleProfileAnalysis({ wardrobeItemsCount }: StyleProfileAnalysisProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [_, navigate] = useLocation();
  
  // Fetch style profile data
  const {
    data: styleProfile,
    isLoading: isStyleProfileLoading,
    isError: isStyleProfileError,
    refetch: refetchStyleProfile,
    error: styleProfileError,
  } = useQuery({
    queryKey: ["style-profile"],
    queryFn: () => apiRequest<StyleProfile>({
      path: "/api/style-profile",
      method: "GET",
    }, { on401: "throw" }),
    enabled: wardrobeItemsCount >= 5, // Only enable if there are enough wardrobe items
  });

  // Fetch style analysis data
  const {
    data: styleAnalysis,
    isLoading: isStyleAnalysisLoading,
    isError: isStyleAnalysisError,
    refetch: refetchStyleAnalysis,
    error: styleAnalysisError,
  } = useQuery({
    queryKey: ["style-analysis"],
    queryFn: () => apiRequest<{analysis: string, itemCount: number}>({
      path: "/api/style-analysis",
      method: "GET",
    }, { on401: "throw" }),
    enabled: wardrobeItemsCount >= 3, // Only enable if there are enough wardrobe items
  });

  // Handle API limit errors
  const isApiLimitError = (error: any) => {
    if (error?.response?.data?.code === "api_limit_exceeded") {
      return true;
    }
    
    if (error instanceof Error) {
      return error.message.includes("quota") || 
             error.message.includes("rate limit") || 
             error.message.includes("429") ||
             error.message.includes("capacity") ||
             error.message.includes("AI service");
    }
    
    // Check response data for any indication of rate limiting
    if (error?.response?.data) {
      const errorData = error.response.data;
      return errorData.status === 429 || 
             (typeof errorData.message === "string" && 
              (errorData.message.includes("quota") || 
               errorData.message.includes("rate limit") ||
               errorData.message.includes("AI service")));
    }
    
    return false;
  };

  const handleRefresh = (type: "profile" | "analysis") => {
    if (type === "profile") {
      refetchStyleProfile();
      toast({
        title: "Refreshing style profile",
        description: "Your style profile is being updated based on your current wardrobe items.",
      });
    } else {
      refetchStyleAnalysis();
      toast({
        title: "Refreshing style analysis",
        description: "Your style analysis is being generated based on your wardrobe items.",
      });
    }
  };

  if (wardrobeItemsCount < 3) {
    return (
      <AnimatedCard hoverEffect="lift" className="bg-gradient-to-br from-background to-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brush className="h-5 w-5 text-primary" />
            Style Profile & Analysis
          </CardTitle>
          <CardDescription>
            Add more items to your wardrobe to unlock style insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8 text-center">
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shirt className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Not Enough Items</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              You need at least 3 items in your wardrobe to generate a style analysis, 
              and 5 items for a complete style profile.
            </p>
            
            <div className="w-full max-w-md mt-6">
              <div className="flex justify-between text-sm mb-1">
                <span>Current Progress</span>
                <span className="font-medium">{wardrobeItemsCount}/5 items</span>
              </div>
              <Progress value={(wardrobeItemsCount / 5) * 100} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  3
                </span>
                <span className="flex items-center gap-1">
                  <Crown className="h-3 w-3 text-amber-500" />
                  5
                </span>
              </div>
            </div>
            
            <Button 
              className="mt-6"
              onClick={() => navigate('/wardrobe')}
            >
              <Shirt className="mr-2 h-4 w-4" />
              Add Items to Wardrobe
            </Button>
          </div>
        </CardContent>
      </AnimatedCard>
    );
  }

  return (
    <div className="space-y-8">
      {/* Style Profile Section */}
      <AnimatedCard className="overflow-hidden bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3 border-b bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary" />
            Your Personal Style Profile
          </CardTitle>
          <CardDescription>
            Discover your unique fashion identity and preferences
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-4 p-1 bg-muted/50 shadow-inner">
              <TabsTrigger value="profile" className="text-xs sm:text-sm">
                <Brush className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Style</span> Profile
              </TabsTrigger>
              <TabsTrigger value="colors" className="text-xs sm:text-sm">
                <Palette className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Color</span> Palette
              </TabsTrigger>
              <TabsTrigger value="preferences" className="text-xs sm:text-sm">
                <LayoutList className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Style</span> Preferences
              </TabsTrigger>
              <TabsTrigger value="personality" className="text-xs sm:text-sm">
                <Heart className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Style</span> Personality
              </TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="pt-4">
            {isStyleProfileLoading && (
              <div className="space-y-4 py-8">
                <div className="flex items-center justify-center mb-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <div className="flex justify-center gap-3 flex-wrap">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-8 w-24" />
                  ))}
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="text-center text-sm text-muted-foreground mt-2">
                  Creating your personalized style profile...
                </div>
              </div>
            )}

            {isStyleProfileError && (
              <div className="text-center py-8 bg-white/50 dark:bg-slate-900/50 rounded-lg shadow-sm">
                <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">Unable to Create Style Profile</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  {isApiLimitError(styleProfileError) 
                    ? "Our AI styling assistant is temporarily unavailable due to high demand. Please try again in a few minutes."
                    : styleProfileError instanceof Error
                      ? styleProfileError.message
                      : "We encountered an issue analyzing your style preferences. Please try again."}
                </p>
                <Button
                  onClick={() => handleRefresh("profile")}
                  variant="outline"
                  className="shadow-sm"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            )}

            {!styleProfile && !isStyleProfileLoading && !isStyleProfileError && wardrobeItemsCount < 5 && (
              <div className="text-center py-8 bg-white/50 dark:bg-slate-900/50 rounded-lg shadow-sm">
                <div className="size-20 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                  <Flame className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-medium mb-2">Complete Your Collection</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  You're almost ready for a style profile! Add {5 - wardrobeItemsCount} more items to your wardrobe to unlock this feature.
                </p>
                
                <div className="w-full max-w-sm mx-auto mb-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Progress:</span>
                    <span className="font-medium">{wardrobeItemsCount}/5 items</span>
                  </div>
                  <Progress value={(wardrobeItemsCount / 5) * 100} className="h-3" />
                  <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      Starting
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      {wardrobeItemsCount >= 3 ? "Analysis Ready" : "Analysis"}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      Full Profile
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/wardrobe')}
                  size="lg"
                  className="shadow-md hover:shadow-lg transition-all"
                >
                  <Shirt className="mr-2 h-4 w-4" />
                  Add More Clothing Items
                </Button>
              </div>
            )}

            {styleProfile && !isStyleProfileLoading && (
              <>
                <TabsContent value="profile" className="pt-2 m-0">
                  <div className="text-center mb-6 py-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg shadow-lg border border-primary/20">
                    <div className="inline-block bg-white dark:bg-slate-800 p-4 rounded-full mb-3 shadow-md border border-primary/30 transform hover:scale-105 transition-transform duration-300">
                      <Sparkles className="h-7 w-7 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-3xl font-bold mb-2 font-fashion-heading tracking-tight bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                      {styleProfile.dominantStyle || "Modern"} Style
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto px-4">
                      Your signature aesthetic based on your personal wardrobe collection
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-4 bg-white/90 dark:bg-slate-900/70 p-5 rounded-lg shadow-md border border-primary/10 hover:border-primary/20 transition-all duration-300">
                      <h4 className="text-sm font-medium flex items-center gap-2 border-b border-primary/20 pb-2">
                        <div className="bg-primary/10 p-1.5 rounded-full">
                          <TagIcon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-fashion-heading tracking-wide">Signature Pieces</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {styleProfile.keyItems && styleProfile.keyItems.length > 0 ? (
                          styleProfile.keyItems.map((item, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="bg-gradient-to-r from-primary/5 to-primary/10 text-sm py-1.5 px-3 border-primary/20 hover:bg-primary/20 transition-colors duration-300 cursor-default"
                            >
                              {item}
                            </Badge>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground py-3 px-4 bg-muted/50 rounded-md w-full text-center border border-dashed border-primary/20">
                            Add more items to identify key pieces
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4 bg-white/90 dark:bg-slate-900/70 p-5 rounded-lg shadow-md border border-primary/10 hover:border-primary/20 transition-all duration-300">
                      <h4 className="text-sm font-medium flex items-center gap-2 border-b border-primary/20 pb-2">
                        <div className="bg-primary/10 p-1.5 rounded-full">
                          <Flower2 className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-fashion-heading tracking-wide">Style Highlights</span>
                      </h4>
                      <ul className="text-sm space-y-3">
                        <li className="flex items-start gap-2 bg-gradient-to-r from-primary/5 to-primary/10 p-3 rounded-md border border-primary/10">
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>Your wardrobe reflects a <strong className="text-primary/90">{styleProfile.dominantStyle || "Modern"}</strong> aesthetic</span>
                        </li>
                        <li className="flex items-start gap-2 bg-gradient-to-r from-primary/5 to-primary/10 p-3 rounded-md border border-primary/10">
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>Preferred seasonality: <strong className="text-primary/90">{styleProfile.preferences?.seasonality || "Versatile"}</strong></span>
                        </li>
                        {styleProfile.colorPalette && styleProfile.colorPalette.length > 0 && (
                          <li className="flex items-start gap-2 bg-gradient-to-r from-primary/5 to-primary/10 p-3 rounded-md border border-primary/10">
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <span>Color preference: <strong className="text-primary/90">{styleProfile.colorPalette[0]}</strong> tones</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="colors" className="pt-2 m-0">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-medium text-center font-fashion-heading tracking-tight bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent mb-6">Your Color Palette</h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {styleProfile.colorPalette && styleProfile.colorPalette.length > 0 ? (
                        styleProfile.colorPalette.map((color, index) => (
                          <div 
                            key={index} 
                            className="bg-white dark:bg-slate-900/80 rounded-lg p-3 text-center shadow-md border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                          >
                            <div 
                              className="w-full aspect-square rounded-md mb-3 border border-primary/20 shadow-inner overflow-hidden" 
                              style={{ backgroundColor: getColorCode(color) }}
                            >
                              <div className="w-full h-full bg-gradient-to-br from-white/10 to-black/10"></div>
                            </div>
                            <span className="text-sm font-medium font-fashion-heading">{color}</span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 bg-white/80 dark:bg-slate-900/50 rounded-lg shadow-md border border-dashed border-primary/20">
                          <div className="inline-block bg-primary/10 p-2 rounded-full mb-2">
                            <Palette className="h-5 w-5 text-primary/70" />
                          </div>
                          <p className="text-muted-foreground">Add more items to generate your color palette</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-5 mt-6 shadow-md border border-primary/20">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <div className="bg-primary/20 p-1.5 rounded-full">
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-fashion-heading tracking-wide">Color Harmony Tips</span>
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your wardrobe shows a preference for {styleProfile.colorPalette && styleProfile.colorPalette.length > 0 
                          ? <><span className="font-semibold text-primary/90">{styleProfile.colorPalette[0]}</span> and <span className="font-semibold text-primary/90">{styleProfile.colorPalette.length > 1 ? styleProfile.colorPalette[1] : 'neutral'}</span> tones</> 
                          : 'balanced colors'}. Consider adding complementary colors for more outfit flexibility and visual interest in your ensembles.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="preferences" className="pt-2 m-0">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-medium text-center font-fashion-heading tracking-tight bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent mb-6">Style Metrics</h3>
                      
                      <div className="space-y-6 bg-white/90 dark:bg-slate-900/70 p-5 rounded-lg shadow-md border border-primary/10">
                        <div className="text-sm text-center text-muted-foreground mb-2">
                          Your personal style profile, based on your wardrobe composition
                        </div>
                        
                        <StylePreferenceBar 
                          label="Formality"
                          value={styleProfile.preferences?.formality || 5}
                          leftLabel="Casual"
                          rightLabel="Formal"
                        />
                        
                        <StylePreferenceBar 
                          label="Boldness" 
                          value={styleProfile.preferences?.boldness || 5}
                          leftLabel="Subtle" 
                          rightLabel="Bold"
                        />
                        
                        <StylePreferenceBar 
                          label="Trendiness" 
                          value={styleProfile.preferences?.trendiness || 5}
                          leftLabel="Classic" 
                          rightLabel="Trendy"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <StylePreferenceCard 
                        label="Seasonality"
                        value={styleProfile.preferences?.seasonality || "All Seasons"}
                        icon={<Flower2 className="h-4 w-4" />}
                      />
                      
                      <StylePreferenceCard 
                        label="Silhouette"
                        value={styleProfile.preferences?.silhouette || "Balanced"}
                        icon={<Shirt className="h-4 w-4" />}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="personality" className="pt-2 m-0">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-center mb-2">Your Style Personality</h3>
                    
                    <div className="flex flex-wrap justify-center gap-2 py-3">
                      {styleProfile.personalityTraits && styleProfile.personalityTraits.length > 0 ? (
                        styleProfile.personalityTraits.map((trait, index) => (
                          <Badge key={index} variant="default" className="px-3 py-1.5 text-sm">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {trait}
                          </Badge>
                        ))
                      ) : (
                        <div className="w-full text-center py-6">
                          <p className="text-muted-foreground">No personality traits available yet</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-primary/5 rounded-lg p-4 mt-2">
                      <h4 className="font-medium mb-2">Style Personality Insight</h4>
                      <p className="text-sm text-muted-foreground">
                        Your wardrobe suggests you value {styleProfile.personalityTraits && styleProfile.personalityTraits.length > 0 
                          ? styleProfile.personalityTraits[0].toLowerCase() 
                          : 'versatility'} and {styleProfile.personalityTraits && styleProfile.personalityTraits.length > 1 
                          ? styleProfile.personalityTraits[1].toLowerCase() 
                          : 'comfort'} in your fashion choices. This reflects your personal approach to style and self-expression.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </>
            )}
          </CardContent>
        </Tabs>
        
        <CardFooter className="justify-between border-t bg-muted/30 py-3">
          <div className="text-xs text-muted-foreground">
            {wardrobeItemsCount >= 5 ? (
              <span>Based on {wardrobeItemsCount} wardrobe items</span>
            ) : (
              <span>Add {5 - wardrobeItemsCount} more items for full analysis</span>
            )}
          </div>
          
          {styleProfile && (
            <Button
              size="sm"
              onClick={() => handleRefresh("profile")}
              disabled={isStyleProfileLoading}
            >
              {isStyleProfileLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Profile
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </AnimatedCard>

      {/* Style Analysis Section */}
      <AnimatedCard hoverEffect="lift" className="bg-gradient-to-br from-background to-muted/40 overflow-hidden">
        <CardHeader className="pb-3 border-b bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            Style Analysis & Recommendations
          </CardTitle>
          <CardDescription>
            AI-powered insights and personalized styling advice for your wardrobe
          </CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          {isStyleAnalysisLoading && (
            <div className="space-y-4 py-6">
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <div className="text-center text-sm text-muted-foreground mt-2">
                Analyzing your wardrobe and creating your personalized style guide...
              </div>
            </div>
          )}

          {isStyleAnalysisError && (
            <div className="text-center py-8">
              <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Unable to Create Analysis</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {isApiLimitError(styleAnalysisError) 
                  ? "Our AI styling assistant is temporarily unavailable due to high demand. Please try again in a few minutes."
                  : styleAnalysisError instanceof Error
                    ? styleAnalysisError.message
                    : "We encountered an issue while analyzing your wardrobe. Please try again."}
              </p>
              <Button
                onClick={() => handleRefresh("analysis")}
                variant="outline"
                className="shadow-sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}

          {styleAnalysis && !isStyleAnalysisLoading && (
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium flex items-center mb-2">
                  <Sparkles className="h-5 w-5 text-primary mr-2" />
                  Your Style Summary
                </h3>
                <p className="text-sm text-muted-foreground">
                  Based on {styleAnalysis.itemCount || wardrobeItemsCount} items in your wardrobe
                </p>
              </div>
              
              <div className="prose prose-sm dark:prose-invert max-w-none bg-white/50 dark:bg-slate-900/50 rounded-lg p-4 shadow-sm">
                {styleAnalysis.analysis.split('\n').map((paragraph, i) => {
                  // Format the paragraphs for better readability
                  if (!paragraph.trim()) return null;
                  
                  // Highlight sections/headings
                  if (paragraph.includes(':') && paragraph.length < 50) {
                    const [title, content] = paragraph.split(':');
                    return (
                      <div key={i} className="mb-3">
                        <h4 className="text-primary font-medium mb-1">{title}:</h4>
                        {content && <p className="ml-1">{content.trim()}</p>}
                      </div>
                    );
                  }
                  
                  return <p key={i} className="my-2">{paragraph}</p>;
                })}
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-primary/5">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  AI Analyzed
                </Badge>
                <Badge variant="outline" className="bg-primary/5">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Personalized
                </Badge>
                <Badge variant="outline" className="bg-primary/5">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Up to Date
                </Badge>
              </div>
            </div>
          )}

          {!styleAnalysis && !isStyleAnalysisLoading && !isStyleAnalysisError && (
            <div className="text-center py-8 bg-white/50 dark:bg-slate-900/50 rounded-lg shadow-sm">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-3">Get Your Style Analysis</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Receive personalized styling advice, outfit suggestions, and wardrobe insights
                tailored specifically to your collection.
              </p>
              <Button 
                onClick={() => handleRefresh("analysis")} 
                size="lg"
                className="shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Create My Style Analysis
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between border-t py-3 bg-muted/30">
          <div className="text-xs text-muted-foreground flex items-center">
            {styleAnalysis ? (
              <span className="flex items-center">
                <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                Last updated: Today
              </span>
            ) : (
              <span>
                {wardrobeItemsCount >= 3 
                  ? "Ready to generate" 
                  : `Need ${Math.max(3 - wardrobeItemsCount, 0)} more items to analyze`}
              </span>
            )}
          </div>
          
          {styleAnalysis && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRefresh("analysis")}
              disabled={isStyleAnalysisLoading}
              className="shadow-sm"
            >
              {isStyleAnalysisLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Analysis
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </AnimatedCard>
    </div>
  );
}

// Helper components

function StylePreferenceBar({ label, value, leftLabel, rightLabel }: { 
  label: string; 
  value: number;
  leftLabel: string;
  rightLabel: string;
}) {
  // Ensure value is within 0-10 range
  const safeValue = Math.max(0, Math.min(10, value));
  
  return (
    <div className="space-y-2 bg-gradient-to-r from-primary/5 to-transparent p-3 rounded-lg border border-primary/10">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium font-fashion-heading tracking-wide flex items-center gap-1.5">
          <div className="bg-primary/10 p-1 rounded-full">
            {label === "Formality" && <Crown className="h-3.5 w-3.5 text-primary" />}
            {label === "Boldness" && <Flame className="h-3.5 w-3.5 text-primary" />}
            {label === "Trendiness" && <Sparkles className="h-3.5 w-3.5 text-primary" />}
          </div>
          {label}
        </span>
        <span className="text-sm font-medium px-2 py-0.5 bg-primary/10 rounded-md text-primary">
          {safeValue}/10
        </span>
      </div>
      <div className="h-3 bg-white dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-primary/20">
        <div
          className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-500"
          style={{ width: `${(safeValue / 10) * 100}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-md shadow-sm border border-primary/10">{leftLabel}</span>
        <span className="text-muted-foreground bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-md shadow-sm border border-primary/10">{rightLabel}</span>
      </div>
    </div>
  );
}

function StylePreferenceCard({ label, value, icon }: { 
  label: string; 
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white/90 dark:bg-slate-900/70 rounded-lg p-4 flex flex-col items-center text-center shadow-md border border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
      <div className="bg-primary/10 p-2 rounded-full mb-3">
        <div className="text-primary">
          {icon}
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <span className="text-sm font-medium font-fashion-heading tracking-wide">{label}</span>
        <Badge 
          variant="secondary" 
          className="px-3 py-1 bg-gradient-to-r from-primary/20 to-primary/10 text-primary/90 border border-primary/20"
        >
          {value}
        </Badge>
      </div>
    </div>
  );
}

// Helper function to generate a color code from a color name
function getColorCode(colorName: string): string {
  const colorMap: Record<string, string> = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Gray': '#808080',
    'Red': '#FF0000',
    'Blue': '#0000FF',
    'Green': '#008000',
    'Yellow': '#FFFF00',
    'Purple': '#800080',
    'Pink': '#FFC0CB',
    'Orange': '#FFA500',
    'Brown': '#A52A2A',
    'Navy': '#000080',
    'Teal': '#008080',
    'Olive': '#808000',
    'Maroon': '#800000',
    'Beige': '#F5F5DC',
    'Cream': '#FFFDD0',
    'Tan': '#D2B48C',
    'Khaki': '#C3B091',
    'Burgundy': '#800020',
    'Charcoal': '#36454F',
    'Turquoise': '#40E0D0',
    'Lavender': '#E6E6FA',
    'Coral': '#FF7F50',
    'Mint': '#98FB98',
    'Salmon': '#FA8072',
    'Gold': '#FFD700',
    'Silver': '#C0C0C0',
    'Indigo': '#4B0082',
  };
  
  // Try to match the color name to our map
  for (const [key, value] of Object.entries(colorMap)) {
    if (colorName.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Default color if no match found
  return '#CCCCCC';
}