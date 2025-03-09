import React from "react";
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
import { StyleProfile } from "../types/ai-types";
import {
  Brush,
  Book,
  Palette,
  Sparkles,
  RefreshCw,
  Shirt,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface StyleProfileAnalysisProps {
  wardrobeItemsCount: number;
}

export default function StyleProfileAnalysis({ wardrobeItemsCount }: StyleProfileAnalysisProps) {
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

  if (wardrobeItemsCount < 3) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Style Profile & Analysis</CardTitle>
          <CardDescription>
            Add more items to your wardrobe to unlock style insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6 text-center">
            <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Not Enough Items</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              You need at least 3 items in your wardrobe to generate a style analysis, 
              and 5 items for a complete style profile.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline">Current Items: {wardrobeItemsCount}</Badge>
              <Badge variant="outline">Needed: {wardrobeItemsCount < 3 ? "3" : "5"}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Style Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brush className="h-5 w-5 text-primary" />
            Your Style Profile
          </CardTitle>
          <CardDescription>
            AI-generated insights about your personal style preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isStyleProfileLoading && (
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="flex flex-wrap gap-2 mt-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-16" />
                ))}
              </div>
            </div>
          )}

          {isStyleProfileError && (
            <div className="text-center p-4">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium">Error Loading Style Profile</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {styleProfileError instanceof Error
                  ? styleProfileError.message
                  : "Please try again later"}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetchStyleProfile()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}

          {styleProfile && !isStyleProfileLoading && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {styleProfile.dominantStyle} Style
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Color Palette
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {styleProfile.colorPalette.map((color) => (
                        <Badge key={color} variant="secondary">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Items</h4>
                    <div className="flex flex-wrap gap-2">
                      {styleProfile.keyItems.map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Style Preferences</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Formality</div>
                    <div className="h-2 bg-muted rounded-full">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${(styleProfile.preferences.formality / 10) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Casual</span>
                      <span>{styleProfile.preferences.formality}/10</span>
                      <span>Formal</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Boldness</div>
                    <div className="h-2 bg-muted rounded-full">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${(styleProfile.preferences.boldness / 10) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Subtle</span>
                      <span>{styleProfile.preferences.boldness}/10</span>
                      <span>Bold</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Trendiness</div>
                    <div className="h-2 bg-muted rounded-full">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${(styleProfile.preferences.trendiness / 10) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Classic</span>
                      <span>{styleProfile.preferences.trendiness}/10</span>
                      <span>Trendy</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">Seasonality:</span>
                    <Badge variant="secondary">{styleProfile.preferences.seasonality}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">Silhouette:</span>
                    <Badge variant="secondary">{styleProfile.preferences.silhouette}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Your Style Personality</h4>
                <div className="flex flex-wrap gap-2">
                  {styleProfile.personalityTraits.map((trait) => (
                    <Badge key={trait} variant="default">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!styleProfile && !isStyleProfileLoading && !isStyleProfileError && wardrobeItemsCount < 5 && (
            <div className="text-center p-4">
              <h3 className="text-lg font-medium">Almost There!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                You need at least 5 items in your wardrobe to generate a complete style profile.
                You currently have {wardrobeItemsCount} items.
              </p>
              <Badge variant="outline" className="mt-4">
                {wardrobeItemsCount}/5 items
              </Badge>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          {styleProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchStyleProfile()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Analysis
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Style Analysis Section */}
      <AnimatedCard hoverEffect="lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            Style Analysis
          </CardTitle>
          <CardDescription>
            Detailed analysis of your wardrobe and style preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isStyleAnalysisLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}

          {isStyleAnalysisError && (
            <div className="text-center p-4">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium">Error Loading Style Analysis</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {styleAnalysisError instanceof Error
                  ? styleAnalysisError.message
                  : "Please try again later"}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetchStyleAnalysis()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}

          {styleAnalysis && !isStyleAnalysisLoading && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {styleAnalysis.analysis.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}

          {!styleAnalysis && !isStyleAnalysisLoading && !isStyleAnalysisError && (
            <div className="text-center p-4">
              <Button onClick={() => refetchStyleAnalysis()}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Analysis
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          {styleAnalysis && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchStyleAnalysis()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Analysis
            </Button>
          )}
        </CardFooter>
      </AnimatedCard>
    </div>
  );
}