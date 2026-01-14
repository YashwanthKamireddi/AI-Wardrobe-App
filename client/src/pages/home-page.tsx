import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWeather } from "@/hooks/use-weather";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useUserStats, useOutfits } from "@/hooks/use-outfits";
import NavigationBar from "@/components/navigation-bar";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import WeatherDisplay from "@/components/weather-display";
import MoodSelector from "@/components/mood-selector";
import AIOutfitRecommenderComponent from "@/components/ai-outfit-recommendation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import {
  Shirt,
  Plus,
  ArrowRight,
  CloudSun,
  Layers,
  Sparkles,
  Heart,
  Crown,
  Calendar,
  TrendingUp,
  Clock,
  Target,
  Zap,
  Sun,
  Moon,
  Sunrise,
  ChevronRight,
  Bell,
  Star,
  Award,
  BarChart3,
  Palette,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  Lightbulb,
  Eye,
  Snowflake,
} from "lucide-react";

// Brand colors
const gold = "hsl(38, 75%, 55%)";
const burgundy = "hsl(337, 73%, 26%)";
const burgundyDark = "hsl(337, 73%, 18%)";

// Style tips based on mood and weather
const styleTips = [
  { tip: "Layer light fabrics for easy temperature adjustment", icon: Layers },
  { tip: "Add a pop of color to boost your mood", icon: Palette },
  { tip: "Choose breathable materials for comfort", icon: Sun },
  { tip: "Accessorize to elevate your basic outfits", icon: Star },
  { tip: "Invest in timeless pieces that never go out of style", icon: Crown },
];

export function HomePage() {
  const { user } = useAuth();
  const { data: weather, isLoading: weatherLoading, error: weatherError } = useWeather();
  const { data: wardrobeItems, isLoading: wardrobeLoading, error: wardrobeError } = useWardrobeItems();
  const { data: outfits, isLoading: outfitsLoading, error: outfitsError } = useOutfits();
  const { stats, isLoading: statsLoading } = useUserStats(
    wardrobeItems, wardrobeLoading, wardrobeError,
    outfits, outfitsLoading, outfitsError
  );
  const [selectedMood, setSelectedMood] = useState("happy");
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch smart suggestions
  const { data: smartSuggestions } = useQuery({
    queryKey: ['smart-suggestions'],
    queryFn: async () => {
      const response = await fetch('/api/smart-suggestions', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      return response.json();
    }
  });

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Rotate style tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % styleTips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const isLoading = weatherLoading || wardrobeLoading || outfitsLoading;

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: "Good morning", icon: Sunrise };
    if (hour < 17) return { text: "Good afternoon", icon: Sun };
    return { text: "Good evening", icon: Moon };
  };

  const greeting = getTimeBasedGreeting();
  const formatTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Calculate wardrobe insights
  const wardrobeInsights = wardrobeItems ? {
    totalItems: wardrobeItems.length,
    topCategory: wardrobeItems.length > 0
      ? Object.entries(wardrobeItems.reduce((acc: Record<string, number>, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
      : 'None',
    recentlyAdded: wardrobeItems.filter(item => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(item.createdAt) > weekAgo;
    }).length,
  } : { totalItems: 0, topCategory: 'None', recentlyAdded: 0 };

  // Weekly goal progress (mock data - could be persisted)
  const weeklyGoal = { current: outfits?.length || 0, target: 5 };
  const goalProgress = Math.min(100, (weeklyGoal.current / weeklyGoal.target) * 100);

  // Error state handler
  const hasErrors = wardrobeError || outfitsError;
  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/wardrobe"] });
    queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
    queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf9]">
        <NavigationBar />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="space-y-4 mb-12">
            <Skeleton className="h-10 w-64 rounded-2xl" />
            <Skeleton className="h-5 w-40 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full rounded-[24px]" />
            <Skeleton className="h-48 w-full rounded-[24px] lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (hasErrors) {
    return (
      <div className="min-h-screen bg-[#fafaf9]">
        <NavigationBar />
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="w-20 h-20 rounded-[24px] mx-auto mb-6 flex items-center justify-center bg-red-50">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="font-serif text-3xl text-slate-900 mb-3">Something went wrong</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            We couldn't load your data. Please check your connection and try again.
          </p>
          <Button onClick={handleRetry} className="rounded-full gap-2 h-12 px-8" style={{ background: burgundy }}>
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24 md:pb-8">
      <NavigationBar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Header Section */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-4">
                <greeting.icon className="w-4 h-4" style={{ color: gold }} />
                <span className="text-sm font-medium text-slate-600">{greeting.text}</span>
                <span className="text-xs text-slate-400">• {formatTime}</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-2">
                {user?.name || user?.username}
              </h1>
              <p className="text-slate-500 text-lg">{formatDate}</p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Button variant="outline" size="sm" className="rounded-full gap-2 border-slate-200 hover:bg-white hover:shadow-sm transition-all">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Style Tip Banner */}
          <div
            className="p-4 rounded-2xl border border-slate-100 flex items-center gap-4 transition-all duration-500"
            style={{ background: `linear-gradient(135deg, ${burgundy}05 0%, ${gold}05 100%)` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${gold}20` }}>
              {(() => {
                const TipIcon = styleTips[currentTipIndex].icon;
                return <TipIcon className="w-5 h-5" style={{ color: burgundy }} />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-0.5">Style Tip of the Day</p>
              <p className="text-sm font-medium text-slate-700 truncate">{styleTips[currentTipIndex].tip}</p>
            </div>
            <Zap className="w-4 h-4 text-slate-300 flex-shrink-0" />
          </div>
        </header>

        {/* Quick Stats Cards */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Wardrobe Items", value: stats.totalItems, icon: Shirt, color: burgundy, trend: `+${wardrobeInsights.recentlyAdded} this week` },
              { label: "Saved Outfits", value: stats.totalOutfits, icon: Layers, color: "#059669", trend: "View all" },
              { label: "Favorites", value: stats.favoriteOutfits, icon: Heart, color: "#e11d48", trend: "Most loved" },
              { label: "Style Score", value: `${stats.totalItems && stats.totalOutfits ? Math.min(100, Math.round((stats.totalOutfits / Math.max(stats.totalItems / 3, 1)) * 100)) : 0}%`, icon: Crown, color: gold, trend: "Keep growing!" },
            ].map((stat, idx) => (
              <Card key={idx} className="group overflow-hidden border-0 bg-white shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 rounded-[20px]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ background: `${stat.color}10` }}
                    >
                      <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                    <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-xs text-slate-400">{stat.trend}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Left Column - Weather, Mood & Goals */}
          <div className="space-y-6">
            {/* Weather Card */}
            <Card className="overflow-hidden border-0 bg-white shadow-sm rounded-[24px]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CloudSun className="h-4 w-4" />
                    <span className="text-sm font-medium">Today&apos;s Weather</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-slate-200 rounded-full">Live</Badge>
                </div>
                {weatherError ? (
                  <div className="text-center py-6">
                    <CloudSun className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-400">Weather unavailable</p>
                  </div>
                ) : weather ? (
                  <WeatherDisplay weather={weather} />
                ) : (
                  <Skeleton className="h-16 w-full" />
                )}
              </CardContent>
            </Card>

            {/* Mood Card */}
            <Card className="overflow-hidden border-0 bg-white shadow-sm rounded-[24px]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5" style={{ color: gold }} />
                  <h3 className="font-serif text-xl text-slate-900">How are you feeling?</h3>
                </div>
                <p className="text-slate-500 mb-5">Select your mood for better recommendations</p>
                <MoodSelector selectedMood={selectedMood} setSelectedMood={setSelectedMood} />
              </CardContent>
            </Card>

            {/* Weekly Goal Card */}
            <Card className="overflow-hidden border-0 bg-white shadow-sm rounded-[24px]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${burgundy}10` }}>
                      <Target className="w-5 h-5" style={{ color: burgundy }} />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900">Weekly Goal</h3>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${burgundy}10` }}>
                    <span className="text-sm font-bold" style={{ color: burgundy }}>{weeklyGoal.current}</span>
                    <span className="text-sm text-slate-400">/</span>
                    <span className="text-sm font-medium text-slate-600">{weeklyGoal.target}</span>
                  </div>
                </div>
                <p className="text-slate-600 mb-4">Create {weeklyGoal.target} outfits this week</p>
                <div className="h-4 bg-slate-200 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(goalProgress, 5)}%`,
                      background: `linear-gradient(90deg, ${burgundy}, ${gold})`
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">{Math.round(goalProgress)}% complete</span>
                  <span className="text-slate-500">{Math.max(0, weeklyGoal.target - weeklyGoal.current)} remaining</span>
                </div>
                {goalProgress >= 100 && (
                  <div className="mt-4 p-3 rounded-2xl flex items-center gap-3" style={{ background: `${gold}10` }}>
                    <Award className="w-5 h-5" style={{ color: gold }} />
                    <span className="text-sm font-medium" style={{ color: burgundy }}>Goal achieved!</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wardrobe Insights */}
            <Card className="overflow-hidden border-0 bg-white shadow-sm rounded-[24px]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <BarChart3 className="w-5 h-5" style={{ color: burgundy }} />
                  <h3 className="font-semibold text-lg text-slate-900">Wardrobe Insights</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                    <span className="text-slate-600">Top Category</span>
                    <Badge variant="outline" className="capitalize rounded-full">{wardrobeInsights.topCategory}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                    <span className="text-slate-600">Recently Added</span>
                    <span className="font-semibold text-slate-900">{wardrobeInsights.recentlyAdded} items</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                    <span className="text-slate-600">Categories</span>
                    <span className="font-semibold text-slate-900">
                      {wardrobeItems ? new Set(wardrobeItems.map(i => i.category)).size : 0} types
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart Suggestions */}
            {smartSuggestions && (
              <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 rounded-[24px]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <Lightbulb className="w-5 h-5" style={{ color: gold }} />
                    <h3 className="font-semibold text-lg text-slate-900">Smart Suggestions</h3>
                  </div>
                  <div className="space-y-3">
                    {/* Forgotten Items */}
                    {smartSuggestions.forgottenItems?.length > 0 && (
                      <div className="p-3 rounded-xl bg-white/70 border border-amber-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-medium text-slate-700">Forgotten Items</span>
                        </div>
                        <div className="flex -space-x-2">
                          {smartSuggestions.forgottenItems.slice(0, 4).map((item: any) => (
                            <div
                              key={item.id}
                              className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden bg-slate-100"
                            >
                              {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Haven't worn in 30+ days</p>
                      </div>
                    )}

                    {/* Seasonal Items */}
                    {smartSuggestions.seasonalItems?.length > 0 && (
                      <div className="p-3 rounded-xl bg-white/70 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Snowflake className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-slate-700">Perfect for Today</span>
                        </div>
                        <div className="flex -space-x-2">
                          {smartSuggestions.seasonalItems.slice(0, 4).map((item: any) => (
                            <div
                              key={item.id}
                              className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden bg-slate-100"
                            >
                              {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Seasonal picks for the weather</p>
                      </div>
                    )}

                    {/* Favorite Items Not Worn Recently */}
                    {smartSuggestions.forgottenFavorites?.length > 0 && (
                      <div className="p-3 rounded-xl bg-white/70 border border-rose-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span className="text-sm font-medium text-slate-700">Miss Your Favorites?</span>
                        </div>
                        <div className="flex -space-x-2">
                          {smartSuggestions.forgottenFavorites.slice(0, 4).map((item: any) => (
                            <div
                              key={item.id}
                              className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden bg-slate-100"
                            >
                              {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Your favorites need some love!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI Recommendations - Wider Column */}
          <div className="lg:col-span-2">
            <Card className="h-full overflow-hidden border-slate-100 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
                    >
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-slate-900">AI Recommendations</h3>
                      <p className="text-sm text-slate-400">Personalized for your mood &amp; weather</p>
                    </div>
                  </div>
                  <Badge className="rounded-full" style={{ background: `${gold}20`, color: burgundy }}>
                    <Zap className="w-3 h-3 mr-1" />
                    AI Powered
                  </Badge>
                </div>

                {wardrobeItems && wardrobeItems.length > 0 && weather ? (
                  <AIOutfitRecommenderComponent
                    weather={{ temperature: weather.temperature, condition: weather.condition, icon: weather.icon }}
                    wardrobeItems={wardrobeItems}
                    selectedMood={selectedMood}
                  />
                ) : (
                  <div className="text-center py-16 px-6">
                    <div
                      className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${burgundy}15, ${burgundy}05)` }}
                    >
                      <ShoppingBag className="h-10 w-10" style={{ color: burgundy }} />
                    </div>
                    <h4 className="font-serif text-2xl text-slate-900 mb-3">Build Your Wardrobe</h4>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                      Add items to unlock personalized AI outfit recommendations tailored to your unique style, mood, and weather conditions.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button
                        asChild
                        className="rounded-full px-8 h-12 shadow-lg hover:shadow-xl transition-all"
                        style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
                      >
                        <Link href="/wardrobe">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Item
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        asChild
                        className="rounded-full px-6 h-12 border-slate-200"
                      >
                        <Link href="/inspirations">
                          <Sparkles className="h-4 w-4 mr-2" style={{ color: burgundy }} />
                          Get Inspired
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Navigation Section */}
        <section className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-serif text-xl text-slate-900">Quick Access</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: "/wardrobe", icon: Shirt, title: "Wardrobe", desc: "Manage your collection", count: stats?.totalItems || 0 },
              { href: "/outfits", icon: Layers, title: "Outfits", desc: "Create combinations", count: stats?.totalOutfits || 0 },
              { href: "/calendar", icon: Calendar, title: "Calendar", desc: "Plan your outfits", count: null },
              { href: "/statistics", icon: BarChart3, title: "Analytics", desc: "Track your style", count: null },
              { href: "/inspirations", icon: Sparkles, title: "Inspiration", desc: "Discover new styles", count: null },
              { href: "/profile", icon: Crown, title: "Profile", desc: "Your style journey", count: null },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="group h-full overflow-hidden border-slate-100 bg-white shadow-sm hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer hover:-translate-y-1">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ background: `${burgundy}08` }}
                      >
                        <item.icon className="h-6 w-6" style={{ color: burgundy }} />
                      </div>
                      {item.count !== null && (
                        <Badge variant="outline" className="text-xs border-slate-200">
                          {item.count}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400 mb-3">{item.desc}</p>
                    <span className="text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: burgundy }}>
                      Open <ChevronRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity Section */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-serif text-xl text-slate-900">Recent Activity</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
            <Link href="/outfits">
              <Button variant="ghost" size="sm" className="text-sm gap-1" style={{ color: burgundy }}>
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <Card className="border-slate-100 bg-white shadow-sm">
            <CardContent className="p-6">
              {outfits && outfits.length > 0 ? (
                <div className="space-y-4">
                  {outfits.slice(0, 3).map((outfit, idx) => (
                    <div key={outfit.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: `${burgundy}08` }}
                      >
                        <Layers className="w-5 h-5" style={{ color: burgundy }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{outfit.name || `Outfit ${idx + 1}`}</p>
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(outfit.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                  <p className="text-slate-400 mb-4">No recent activity yet</p>
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <Link href="/outfits">Create Your First Outfit</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <MobileBottomNav />
    </div>
  );
}
