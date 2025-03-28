import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
    if (error instanceof Error) {
      return error.message.includes("quota") || 
             error.message.includes("rate limit") || 
             error.message.includes("429");
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
              onClick={() => window.location.href = '/wardrobe'}
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
      <AnimatedCard className="overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary" />
            Your Style Profile
          </CardTitle>
          <CardDescription>
            AI-generated insights about your personal style preferences
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-4">
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
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <div className="flex justify-center gap-3 flex-wrap">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-8 w-24" />
                  ))}
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            )}

            {isStyleProfileError && (
              <div className="text-center py-8">
                <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">Error Loading Style Profile</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  {isApiLimitError(styleProfileError) 
                    ? "The AI service is currently unavailable due to high demand. Please try again later."
                    : styleProfileError instanceof Error
                      ? styleProfileError.message
                      : "Please try again later"}
                </p>
                <Button
                  onClick={() => handleRefresh("profile")}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            )}

            {!styleProfile && !isStyleProfileLoading && !isStyleProfileError && wardrobeItemsCount < 5 && (
              <div className="text-center py-8">
                <div className="size-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                  <Flame className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">Almost There!</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  You need at least 5 items in your wardrobe to generate a complete style profile.
                  You currently have {wardrobeItemsCount} items.
                </p>
                
                <div className="w-full max-w-xs mx-auto mb-6">
                  <Progress value={(wardrobeItemsCount / 5) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{wardrobeItemsCount}/5 items</span>
                    <span>Add {5 - wardrobeItemsCount} more</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/wardrobe'}
                >
                  <Shirt className="mr-2 h-4 w-4" />
                  Add More Items
                </Button>
              </div>
            )}

            {styleProfile && !isStyleProfileLoading && (
              <>
                <TabsContent value="profile" className="pt-2 m-0">
                  <div className="text-center mb-6 py-3 bg-primary/5 rounded-lg">
                    <h3 className="text-2xl font-semibold flex items-center justify-center gap-2 mb-1">
                      <Sparkles className="h-5 w-5 text-primary" />
                      {styleProfile.dominantStyle || "Modern"} Style
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your dominant style based on your wardrobe items
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <TagIcon className="h-4 w-4 text-primary" />
                        Key Items
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {styleProfile.keyItems && styleProfile.keyItems.length > 0 ? (
                          styleProfile.keyItems.map((item, index) => (
                            <Badge key={index} variant="outline">
                              {item}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No key items identified yet</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Flower2 className="h-4 w-4 text-primary" />
                        Wardrobe Highlights
                      </h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{styleProfile.dominantStyle || "Modern"} pieces make up your core wardrobe</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>Your style shows {styleProfile.preferences?.seasonality || "versatile"} sensibilities</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="colors" className="pt-2 m-0">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-center">Your Color Palette</h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {styleProfile.colorPalette && styleProfile.colorPalette.length > 0 ? (
                        styleProfile.colorPalette.map((color, index) => (
                          <div key={index} className="bg-muted rounded-lg p-3 text-center">
                            <div className="w-full aspect-square rounded-md mb-2 border" 
                                 style={{ backgroundColor: getColorCode(color) }}></div>
                            <span className="text-sm font-medium">{color}</span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-6">
                          <p className="text-muted-foreground">No color palette available yet</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-primary/5 rounded-lg p-4 mt-4">
                      <h4 className="font-medium mb-2">Color Harmony Tips</h4>
                      <p className="text-sm text-muted-foreground">
                        Your wardrobe shows a preference for {styleProfile.colorPalette && styleProfile.colorPalette.length > 0 
                          ? `${styleProfile.colorPalette[0]} and ${styleProfile.colorPalette.length > 1 ? styleProfile.colorPalette[1] : 'neutral'} tones` 
                          : 'balanced colors'}. Consider adding complementary colors for more outfit flexibility.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="preferences" className="pt-2 m-0">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium mb-2">Style Metrics</h3>
                      
                      <div className="space-y-4">
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
      <AnimatedCard hoverEffect="lift" className="bg-gradient-to-br from-background to-muted/40">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            Style Analysis
          </CardTitle>
          <CardDescription>
            Detailed analysis of your wardrobe and style recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          {isStyleAnalysisLoading && (
            <div className="space-y-3 py-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {isStyleAnalysisError && (
            <div className="text-center py-8">
              <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Error Loading Style Analysis</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {isApiLimitError(styleAnalysisError) 
                  ? "The AI service is currently unavailable due to high demand. Please try again later."
                  : styleAnalysisError instanceof Error
                    ? styleAnalysisError.message
                    : "Please try again later"}
              </p>
              <Button
                onClick={() => handleRefresh("analysis")}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}

          {styleAnalysis && !isStyleAnalysisLoading && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {styleAnalysis.analysis.split('\n').map((paragraph, i) => (
                paragraph.trim() ? (
                  <p key={i} className="my-2">{paragraph}</p>
                ) : null
              ))}
            </div>
          )}

          {!styleAnalysis && !isStyleAnalysisLoading && !isStyleAnalysisError && (
            <div className="text-center py-10">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-3">Generate Style Analysis</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Get personalized insights about your style preferences and recommendations
                based on your current wardrobe items.
              </p>
              <Button onClick={() => handleRefresh("analysis")}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Analysis
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between border-t py-3">
          <div className="text-xs text-muted-foreground">
            {styleAnalysis ? (
              <span>Last updated: Today</span>
            ) : (
              <span>Analysis available with {Math.max(3 - wardrobeItemsCount, 0)} more items</span>
            )}
          </div>
          
          {styleAnalysis && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRefresh("analysis")}
              disabled={isStyleAnalysisLoading}
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
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium">{safeValue}/10</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${(safeValue / 10) * 100}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
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
    <div className="border rounded-lg p-3 flex flex-col items-center text-center">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm font-medium">{label}</span>
        {icon}
      </div>
      <Badge variant="secondary" className="px-3 py-1">
        {value}
      </Badge>
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