import { useState, useEffect } from "react";
import { Link } from "wouter";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <NavigationBar />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="space-y-4 mb-12">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-24 md:pb-8">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${burgundy}10 0%, transparent 70%)` }} />
        <div className="absolute bottom-40 left-10 w-48 h-48 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${gold}15 0%, transparent 70%)` }} />
      </div>

      <NavigationBar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Header Section with Time */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${burgundy}10` }}>
                  <greeting.icon className="w-5 h-5" style={{ color: burgundy }} />
                </div>
                <div>
                  <span className="text-sm tracking-wider uppercase text-slate-400">{greeting.text}</span>
                  <p className="text-xs text-slate-300">{formatTime}</p>
                </div>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-slate-900 mb-1">
                {user?.name || user?.username}
              </h1>
              <p className="text-slate-500">{formatDate}</p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Button variant="outline" size="sm" className="rounded-full gap-2 border-slate-200 hover:border-slate-300">
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
              <Card key={idx} className="group overflow-hidden border-slate-100 bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ background: `${stat.color}10` }}
                    >
                      <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mb-0.5">{stat.value}</p>
                  <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-[10px] text-slate-300">{stat.trend}</p>
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
            <Card className="overflow-hidden border-slate-100 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <CloudSun className="h-4 w-4" />
                    <span className="text-xs tracking-widest uppercase">Today&apos;s Weather</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-slate-200">Live</Badge>
                </div>
                {weatherError ? (
                  <div className="text-center py-4">
                    <CloudSun className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-slate-400 text-sm">Weather unavailable</p>
                  </div>
                ) : weather ? (
                  <WeatherDisplay weather={weather} />
                ) : (
                  <Skeleton className="h-16 w-full" />
                )}
              </CardContent>
            </Card>

            {/* Mood Card */}
            <Card className="overflow-hidden border-slate-100 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4" style={{ color: gold }} />
                  <h3 className="font-serif text-lg text-slate-900">How are you feeling?</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">Select your mood for better recommendations</p>
                <MoodSelector selectedMood={selectedMood} setSelectedMood={setSelectedMood} />
              </CardContent>
            </Card>

            {/* Weekly Goal Card */}
            <Card className="overflow-hidden border-slate-100 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" style={{ color: burgundy }} />
                    <h3 className="font-semibold text-slate-900">Weekly Goal</h3>
                  </div>
                  <Badge className="rounded-full text-[10px]" style={{ background: `${burgundy}10`, color: burgundy }}>
                    {weeklyGoal.current}/{weeklyGoal.target}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mb-3">Create {weeklyGoal.target} outfits this week</p>
                <Progress value={goalProgress} className="h-2 mb-2" />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{Math.round(goalProgress)}% complete</span>
                  <span>{weeklyGoal.target - weeklyGoal.current} remaining</span>
                </div>
                {goalProgress >= 100 && (
                  <div className="mt-3 p-2 rounded-lg flex items-center gap-2" style={{ background: `${gold}10` }}>
                    <Award className="w-4 h-4" style={{ color: gold }} />
                    <span className="text-xs font-medium" style={{ color: burgundy }}>Goal achieved! 🎉</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wardrobe Insights */}
            <Card className="overflow-hidden border-slate-100 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4" style={{ color: burgundy }} />
                  <h3 className="font-semibold text-slate-900">Wardrobe Insights</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <span className="text-sm text-slate-600">Top Category</span>
                    <Badge variant="outline" className="capitalize">{wardrobeInsights.topCategory}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <span className="text-sm text-slate-600">Recently Added</span>
                    <span className="text-sm font-semibold text-slate-900">{wardrobeInsights.recentlyAdded} items</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <span className="text-sm text-slate-600">Categories</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {wardrobeItems ? new Set(wardrobeItems.map(i => i.category)).size : 0} types
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/wardrobe", icon: Shirt, title: "Wardrobe", desc: "Manage your collection", count: stats?.totalItems || 0 },
              { href: "/outfits", icon: Layers, title: "Outfits", desc: "Create combinations", count: stats?.totalOutfits || 0 },
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
