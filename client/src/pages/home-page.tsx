import { useState } from "react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
} from "lucide-react";

// Brand colors
const gold = "hsl(38, 75%, 55%)";
const burgundy = "hsl(337, 73%, 26%)";

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

  const isLoading = weatherLoading || wardrobeLoading || outfitsLoading;

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <NavigationBar />
        <div className="max-w-6xl mx-auto px-6 py-12">
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24 md:pb-8">
      <NavigationBar />

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        {/* Header Section */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: gold }} />
            <span className="text-sm tracking-widest uppercase text-slate-400">{getTimeBasedGreeting()}</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-slate-900 mb-2">
            {user?.name || user?.username}
          </h1>
          <p className="text-slate-500">Welcome to your style dashboard</p>
        </header>

        {/* Quick Stats Bar */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-4 gap-3 mb-8 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            {[
              { label: "Items", value: stats.totalItems, icon: Shirt },
              { label: "Outfits", value: stats.totalOutfits, icon: Layers },
              { label: "Favorites", value: stats.favoriteOutfits, icon: Heart },
              { label: "Style", value: `${stats.totalItems && stats.totalOutfits ? Math.min(100, Math.round((stats.totalOutfits / Math.max(stats.totalItems / 3, 1)) * 100)) : 0}%`, icon: Crown },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <stat.icon className="w-4 h-4 mx-auto mb-1.5 text-slate-400" />
                <p className="text-xl font-semibold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Weather & Mood Column */}
          <div className="space-y-6">
            {/* Weather Card */}
            <Card className="overflow-hidden border-slate-100 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <CloudSun className="h-4 w-4" />
                  <span className="text-xs tracking-widest uppercase">Today's Weather</span>
                </div>
                {weatherError ? (
                  <p className="text-slate-400 text-sm">Weather unavailable</p>
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
                <h3 className="font-serif text-lg text-slate-900 mb-1">How are you feeling?</h3>
                <p className="text-sm text-slate-400 mb-4">Select your mood for better recommendations</p>
                <MoodSelector selectedMood={selectedMood} setSelectedMood={setSelectedMood} />
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations - Wider Column */}
          <div className="lg:col-span-2">
            <Card className="h-full overflow-hidden border-slate-100 bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${burgundy}10` }}>
                      <Sparkles className="h-4 w-4" style={{ color: burgundy }} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-slate-900">AI Recommendations</h3>
                      <p className="text-xs text-slate-400">Personalized outfit suggestions</p>
                    </div>
                  </div>
                </div>

                {wardrobeItems && wardrobeItems.length > 0 && weather ? (
                  <AIOutfitRecommenderComponent
                    weather={{ temperature: weather.temperature, condition: weather.condition, icon: weather.icon }}
                    wardrobeItems={wardrobeItems}
                    selectedMood={selectedMood}
                  />
                ) : (
                  <div className="text-center py-12 px-6">
                    <div
                      className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${burgundy}15, ${burgundy}05)` }}
                    >
                      <Shirt className="h-7 w-7" style={{ color: burgundy }} />
                    </div>
                    <h4 className="font-serif text-xl text-slate-900 mb-2">Build Your Wardrobe</h4>
                    <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                      Add items to unlock personalized AI outfit recommendations tailored to your style.
                    </p>
                    <Button
                      asChild
                      className="rounded-full px-6"
                      style={{ background: burgundy }}
                    >
                      <Link href="/wardrobe">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Item
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Navigation */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-serif text-xl text-slate-900">Quick Access</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: "/wardrobe", icon: Shirt, title: "Wardrobe", desc: "Manage your collection" },
              { href: "/outfits", icon: Layers, title: "Outfits", desc: "Create combinations" },
              { href: "/inspirations", icon: Sparkles, title: "Inspiration", desc: "Discover new styles" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className="group h-full overflow-hidden border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                      style={{ background: `${burgundy}08` }}
                    >
                      <item.icon className="h-5 w-5" style={{ color: burgundy }} />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400 mb-3">{item.desc}</p>
                    <span className="text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: burgundy }}>
                      Open <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <MobileBottomNav />
    </div>
  );
}
