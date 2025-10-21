import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWeather } from "@/hooks/use-weather";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useUserStats, useOutfits } from "@/hooks/use-outfits";
import { queryClient } from "@/lib/queryClient";
import NavigationBar from "@/components/navigation-bar";
import WeatherDisplay from "@/components/weather-display";
import MoodSelector from "@/components/mood-selector";
import AIOutfitRecommenderComponent from "@/components/ai-outfit-recommendation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Shirt,
  Calendar,
  TrendingUp,
  Heart,
  Plus,
  Palette,
  Camera,
  ShoppingBag,
  Star,
  BarChart3,
  Clock,
  Zap,
  Layers,
  Target,
  ArrowRight,
  Sun,
  CloudRain,
  Thermometer,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

export function HomePage() {
  const { user } = useAuth();
  const { data: weather, isLoading: weatherLoading, error: weatherError } = useWeather();
  const { data: wardrobeItems, isLoading: wardrobeLoading, error: wardrobeError } = useWardrobeItems();
  const { data: outfits, isLoading: outfitsLoading, error: outfitsError } = useOutfits();
  const { stats, isLoading: statsLoading, hasError: statsError, error } = useUserStats(
    wardrobeItems,
    wardrobeLoading,
    wardrobeError,
    outfits,
    outfitsLoading,
    outfitsError
  );
  const [selectedMood, setSelectedMood] = useState("happy");

  const isLoading = weatherLoading || wardrobeLoading || outfitsLoading;

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-amber-50/20">
        <NavigationBar />
        <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
          <div className="space-y-4">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="luxury-card shadow-md">
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-amber-50/20">
      <NavigationBar />
      <motion.div 
        className="container mx-auto px-4 py-8 space-y-8 animate-fade-in"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        data-testid="dashboard-home"
      >
      {/* Header Section */}
      <motion.div 
        className="space-y-6"
        variants={itemVariants}
        data-testid="dashboard-header"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-fashion-heading text-foreground leading-tight">
              {getTimeBasedGreeting()}, {user?.name || user?.username}
            </h1>
            <p className="text-lg text-muted-foreground font-fashion-body">
              Welcome to your personal style dashboard
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3" data-testid="quick-actions">
            <Button 
              asChild 
              size="default" 
              className="min-h-[44px] bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-md hover:shadow-lg transition-all"
              data-testid="button-add-item"
            >
              <Link href="/wardrobe">
                <Plus className="h-5 w-5 mr-2" />
                Add Item
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="default"
              className="min-h-[44px] border-2 hover:bg-amber-50 hover:border-amber-300 transition-all"
              data-testid="button-create-outfit"
            >
              <Link href="/outfits">
                <Palette className="h-5 w-5 mr-2" />
                Create Outfit
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="default"
              className="min-h-[44px] border-2 hover:bg-violet-50 hover:border-violet-300 transition-all"
              data-testid="button-inspirations"
            >
              <Link href="/inspirations">
                <Sparkles className="h-5 w-5 mr-2" />
                Explore
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column - Weather & Mood */}
        <motion.div 
          className="space-y-6" 
          variants={itemVariants}
          data-testid="dashboard-left-column"
        >
          {/* Weather Card */}
          <Card className={cn(
            "luxury-card relative overflow-hidden",
            "bg-gradient-to-br from-card to-background",
            "border-2 border-amber-200/40 shadow-lg hover:shadow-xl transition-shadow"
          )} data-testid="weather-card">
            <CardHeader className="pb-4 space-y-2">
              <CardTitle className="flex items-center gap-2 font-fashion-heading text-xl">
                <Sun className="h-5 w-5 text-amber-500" />
                Today's Weather
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {weatherError ? (
                <div className="text-center py-4 text-muted-foreground" data-testid="weather-error">
                  <CloudRain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Weather data unavailable</p>
                </div>
              ) : weather ? (
                <WeatherDisplay weather={weather} />
              ) : (
                <div className="text-center py-4 text-muted-foreground" data-testid="weather-loading">
                  <Sun className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Loading weather...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mood Selector Card */}
          <Card className="luxury-card border-2 border-rose-200/40 shadow-lg hover:shadow-xl transition-shadow" data-testid="mood-selector-card">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 font-fashion-heading text-xl">
                <Heart className="h-5 w-5 text-rose-500" />
                How are you feeling?
              </CardTitle>
              <CardDescription className="text-base">
                Select your mood for personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <MoodSelector 
                selectedMood={selectedMood} 
                setSelectedMood={setSelectedMood}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Center Column - AI Recommendations */}
        <motion.div 
          className="lg:col-span-2 space-y-6" 
          variants={itemVariants}
          data-testid="dashboard-center-column"
        >
          {/* AI Outfit Recommendations */}
          <Card className="luxury-card border-2 border-violet-200/40 shadow-lg hover:shadow-xl transition-shadow" data-testid="outfit-recommendations-card">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 font-fashion-heading text-xl">
                <Sparkles className="h-5 w-5 text-violet-500" />
                AI Outfit Recommendations
              </CardTitle>
              <CardDescription className="text-base">
                Curated suggestions based on weather and your mood
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {wardrobeItems && weather ? (
                <AIOutfitRecommenderComponent
                  weather={{
                    temperature: weather.temperature,
                    condition: weather.condition,
                    icon: weather.icon
                  }}
                  wardrobeItems={wardrobeItems}
                  selectedMood={selectedMood}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground" data-testid="no-items-message">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Add items to your wardrobe to get personalized recommendations</p>
                  <Button asChild className="mt-4" data-testid="button-add-first-item">
                    <Link href="/wardrobe">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Item
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Statistics Section */}
      <motion.div variants={itemVariants} data-testid="statistics-section">
        <div className="mb-8 space-y-2">
          <h2 className="text-3xl font-fashion-heading">Your Style Statistics</h2>
          <p className="text-lg text-muted-foreground font-fashion-body">
            Track your fashion journey and wardrobe insights
          </p>
        </div>

        {/* Error State */}
        {statsError && (
          <Card className="luxury-card border-2 border-destructive/20 bg-destructive/5 shadow-lg" data-testid="stats-error-card">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-4">
                <div className="p-3 rounded-full bg-destructive/10 mx-auto w-fit">
                  <WifiOff className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-destructive">Unable to Load Statistics</h3>
                  <p className="text-sm text-muted-foreground">
                    {error?.message || 'There was an issue loading your wardrobe and outfit data.'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ["/api/wardrobe"] });
                      queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
                    }}
                    className="border-destructive/20 hover:bg-destructive/10"
                    data-testid="retry-stats-button"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <Button asChild variant="ghost" size="sm" data-testid="check-connection-button">
                    <Link href="/wardrobe">
                      <Wifi className="h-4 w-4 mr-2" />
                      Check Wardrobe
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {(statsLoading && !statsError) && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" data-testid="stats-loading">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="luxury-card text-center border-2 shadow-md">
                <CardContent className="pt-8 pb-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Success State - Stats Display */}
        {(!statsLoading && !statsError && stats) && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" data-testid="stats-display">
            {/* Wardrobe Stats */}
            <Card className="luxury-card text-center border-2 border-primary/20 shadow-md hover:shadow-lg transition-shadow" data-testid="stat-total-items">
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Shirt className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-3xl font-bold font-fashion-display">
                    {stats.totalItems}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Wardrobe Items</p>
                </div>
              </CardContent>
            </Card>

            <Card className="luxury-card text-center border-2 border-violet-200/40 shadow-md hover:shadow-lg transition-shadow" data-testid="stat-total-outfits">
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-4 rounded-full bg-violet-500/10">
                    <Layers className="h-7 w-7 text-violet-500" />
                  </div>
                  <div className="text-3xl font-bold font-fashion-display">
                    {stats.totalOutfits}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Created Outfits</p>
                </div>
              </CardContent>
            </Card>

            <Card className="luxury-card text-center border-2 border-rose-200/40 shadow-md hover:shadow-lg transition-shadow" data-testid="stat-favorite-outfits">
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-4 rounded-full bg-rose-500/10">
                    <Star className="h-7 w-7 text-rose-500" />
                  </div>
                  <div className="text-3xl font-bold font-fashion-display">
                    {stats.favoriteOutfits}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Favorites</p>
                </div>
              </CardContent>
            </Card>

            <Card className="luxury-card text-center border-2 border-amber-200/40 shadow-md hover:shadow-lg transition-shadow" data-testid="stat-style-score">
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-4 rounded-full bg-amber-500/10">
                    <TrendingUp className="h-7 w-7 text-amber-500" />
                  </div>
                  <div className="text-3xl font-bold font-fashion-display">
                    {stats.totalItems && stats.totalOutfits 
                      ? Math.min(100, Math.round((stats.totalOutfits / Math.max(stats.totalItems / 3, 1)) * 100))
                      : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Style Score</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {(!statsLoading && !statsError && !stats) && (
          <Card className="luxury-card border-2 shadow-lg" data-testid="stats-empty-state">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-4">
                <div className="p-3 rounded-full bg-muted/20 mx-auto w-fit">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No Data Available</h3>
                  <p className="text-sm text-muted-foreground">
                    Start building your wardrobe to see your style statistics
                  </p>
                </div>
                <Button asChild className="mt-4" data-testid="start-wardrobe-button">
                  <Link href="/wardrobe">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Item
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Navigation Shortcuts */}
      <motion.div variants={itemVariants} data-testid="navigation-shortcuts">
        <div className="mb-8 space-y-2">
          <h2 className="text-3xl font-fashion-heading">Quick Navigation</h2>
          <p className="text-lg text-muted-foreground font-fashion-body">
            Access your favorite features with one click
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Button 
            asChild 
            variant="outline" 
            className="h-auto min-h-[88px] p-6 justify-start group luxury-card border-2 hover:border-primary shadow-md hover:shadow-lg transition-all"
            data-testid="nav-wardrobe"
          >
            <Link href="/wardrobe">
              <div className="flex items-center gap-4 w-full">
                <div className="p-4 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Shirt className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-base mb-1">Wardrobe</h3>
                  <p className="text-sm text-muted-foreground">Manage your clothing items</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline" 
            className="h-auto min-h-[88px] p-6 justify-start group luxury-card border-2 hover:border-violet-500 shadow-md hover:shadow-lg transition-all"
            data-testid="nav-outfits"
          >
            <Link href="/outfits">
              <div className="flex items-center gap-4 w-full">
                <div className="p-4 rounded-lg bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
                  <Palette className="h-6 w-6 text-violet-500" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-base mb-1">Outfits</h3>
                  <p className="text-sm text-muted-foreground">Create and manage outfits</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-violet-500 transition-colors" />
              </div>
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline" 
            className="h-auto min-h-[88px] p-6 justify-start group luxury-card border-2 hover:border-amber-500 shadow-md hover:shadow-lg transition-all"
            data-testid="nav-inspirations"
          >
            <Link href="/inspirations">
              <div className="flex items-center gap-4 w-full">
                <div className="p-4 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                  <Sparkles className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-base mb-1">Inspirations</h3>
                  <p className="text-sm text-muted-foreground">Discover style ideas</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-500 transition-colors" />
              </div>
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Recent Activity */}
      {stats?.recentActivity && (stats.recentActivity.recentOutfits.length > 0 || stats.recentActivity.recentItems.length > 0) && (
        <motion.div variants={itemVariants} data-testid="recent-activity">
          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-fashion-heading">Recent Activity</h2>
            <p className="text-lg text-muted-foreground font-fashion-body">
              Your latest additions and creations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Recent Outfits */}
            {stats.recentActivity.recentOutfits.length > 0 && (
              <Card className="luxury-card border-2 border-violet-200/40 shadow-lg hover:shadow-xl transition-shadow" data-testid="recent-outfits">
                <CardHeader className="space-y-2">
                  <CardTitle className="flex items-center gap-2 text-xl font-fashion-heading">
                    <Clock className="h-5 w-5 text-violet-500" />
                    Recent Outfits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {stats.recentActivity.recentOutfits.map((outfit, index: number) => (
                    <div 
                      key={outfit.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      data-testid={`recent-outfit-${index}`}
                    >
                      <div className="p-2 rounded-full bg-violet-500/10">
                        <Layers className="h-4 w-4 text-violet-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{outfit.name}</p>
                        {outfit.occasion && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {outfit.occasion}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="ghost" size="sm" className="w-full mt-2" data-testid="view-all-outfits">
                    <Link href="/outfits">
                      View All Outfits
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Items */}
            {stats.recentActivity.recentItems.length > 0 && (
              <Card className="luxury-card border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow" data-testid="recent-items">
                <CardHeader className="space-y-2">
                  <CardTitle className="flex items-center gap-2 text-xl font-fashion-heading">
                    <Zap className="h-5 w-5 text-primary" />
                    Recent Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {stats.recentActivity.recentItems.map((item, index: number) => (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      data-testid={`recent-item-${index}`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="ghost" size="sm" className="w-full mt-2" data-testid="view-wardrobe">
                    <Link href="/wardrobe">
                      View Wardrobe
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      )}
      </motion.div>
    </div>
  );
}