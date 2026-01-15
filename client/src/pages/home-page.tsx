import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWeather } from "@/hooks/use-weather";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useUserStats, useOutfits } from "@/hooks/use-outfits";
import MoodSelector from "@/components/mood-selector";
import AIOutfitRecommenderComponent from "@/components/ai-outfit-recommendation";
import OutfitShuffle from "@/components/outfit-shuffle";
import EnhancedWeatherWidget from "@/components/enhanced-weather-widget";
import CPWAnalytics from "@/components/cpw-analytics";
import { GamificationBadges, getMockGamificationStats } from "@/components/gamification-badges";
import NavigationBar from "@/components/navigation-bar";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { LuxurySkeleton, StatsGridSkeleton } from "@/components/ui/luxury-skeleton";
import { PlinthButton } from "@/components/ui/plinth-button";
import { GlassCard, GlassPanel } from "@/components/ui/glass-card";
import { BentoGrid, BentoItem, BentoStat } from "@/components/ui/bento-grid";
import { queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { HapticFeedback } from "@/lib/haptics";
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
  Target,
  Zap,
  Sun,
  Moon,
  Sunrise,
  ChevronRight,
  RefreshCw,
  Eye,
  Snowflake,
  Settings,
  TrendingUp,
  Archive,
  Shuffle,
  BarChart3,
  Gem,
  Trophy,
  Star,
} from "lucide-react";

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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSection, setActiveSection] = useState<"outfit" | "shuffle">("outfit");

  // Mock gamification stats (in production, this would come from API)
  const gamificationStats = getMockGamificationStats();

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

  const isLoading = weatherLoading || wardrobeLoading || outfitsLoading;

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: "Good morning", icon: Sunrise };
    if (hour < 17) return { text: "Good afternoon", icon: Sun };
    return { text: "Good evening", icon: Moon };
  };

  const greeting = getTimeBasedGreeting();
  const formatDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Weekly goal progress
  const weeklyGoal = { current: outfits?.length || 0, target: 5 };
  const goalProgress = Math.min(100, (weeklyGoal.current / weeklyGoal.target) * 100);

  // Error state handler
  const hasErrors = wardrobeError || outfitsError;
  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/wardrobe"] });
    queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
    queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
  };

  // Brand colors
  const burgundy = "#80163a";
  const gold = "#D4A54A";

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 bg-[#faf9f7]">
        <div className="px-4 py-6">
          <LuxurySkeleton className="h-8 w-48 mb-2" />
          <LuxurySkeleton className="h-5 w-32" />
        </div>
        <div className="px-4 space-y-4">
          <StatsGridSkeleton />
          <LuxurySkeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (hasErrors) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center bg-[#faf9f7]">
        <div className="text-center px-6">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-red-50 border border-red-200">
            <RefreshCw className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-serif text-3xl mb-3 text-slate-900">
            Something went wrong
          </h2>
          <p className="text-sm mb-8 max-w-xs mx-auto text-slate-500">
            We couldn't load your data. Please try again.
          </p>
          <LuxuryButton
            onClick={() => {
              HapticFeedback.success();
              handleRetry();
            }}
            className="rounded-full gap-2 h-12 px-8"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </LuxuryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-[#faf9f7]">
      {/* Desktop Navigation Bar */}
      <div className="hidden md:block">
        <NavigationBar />
      </div>

      {/* Mobile Header - Light Theme */}
      <header
        className="md:hidden sticky top-0 z-40 px-4 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-1" style={{ color: burgundy }}>
              The Daily Edit
            </p>
            <h1 className="font-serif text-2xl font-medium text-slate-900">
              {greeting.text}, {user?.name?.split(' ')[0] || user?.username}
            </h1>
          </div>
          <Link href="/profile">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Settings className="h-5 w-5" style={{ color: burgundy }} />
            </motion.button>
          </Link>
        </div>
      </header>

      {/* Desktop Hero Header - Light Theme */}
      <div className="hidden md:block px-6 py-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: burgundy }}>
              The Daily Edit • {formatDate}
            </p>
            <h1 className="font-serif text-5xl font-medium text-slate-900 mb-2">
              {greeting.text}, {user?.name?.split(' ')[0] || user?.username}
            </h1>
            <p className="text-slate-500 text-lg">Your personal style dashboard</p>
          </div>
          <div className="flex gap-3">
            <Link href="/compose">
              <LuxuryButton
                className="rounded-full gap-2 h-12 px-6"
              >
                <Plus className="w-5 h-5" />
                Create Outfit
              </LuxuryButton>
            </Link>
          </div>
        </motion.div>
      </div>

      <main className="px-4 py-4 md:px-6 md:max-w-6xl md:mx-auto space-y-6">
        {/* Quick Stats - Bento Grid with Glass Cards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: burgundy }}>
              Your Style Overview
            </h2>
            <Link href="/statistics">
              <span className="text-xs font-medium flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors">
                Analytics <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            <GlassCard className="p-4 text-center" animated>
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${burgundy}15`, border: `1px solid ${burgundy}30` }}>
                <Archive className="h-6 w-6" style={{ color: burgundy }} />
              </div>
              <p className="text-3xl font-bold text-slate-900 font-mono">
                {stats?.totalItems || 0}
              </p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">Items</p>
            </GlassCard>
            <GlassCard className="p-4 text-center" animated>
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-emerald-50 border border-emerald-200">
                <Layers className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900 font-mono">
                {stats?.totalOutfits || 0}
              </p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">Outfits</p>
            </GlassCard>
            <GlassCard className="p-4 text-center" animated>
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-pink-50 border border-pink-200">
                <Heart className="h-6 w-6 text-pink-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900 font-mono">
                {stats?.favoriteOutfits || 0}
              </p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">Favorites</p>
            </GlassCard>
            <GlassCard className="hidden md:flex p-4 text-center flex-col items-center justify-center" animated>
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${gold}20`, border: `1px solid ${gold}40` }}>
                <Trophy className="h-6 w-6" style={{ color: gold }} />
              </div>
              <p className="text-3xl font-bold text-slate-900 font-mono">
                {gamificationStats.level}
              </p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">Level</p>
            </GlassCard>
          </div>
        </section>

        {/* Enhanced Weather Widget */}
        <section>
          {weather && !weatherError ? (
            <GlassCard className="p-0 overflow-hidden" borderGlow>
              <EnhancedWeatherWidget
                weather={{
                  temperature: weather.temperature,
                  condition: weather.condition,
                  humidity: weather.humidity,
                  windSpeed: weather.windSpeed,
                  icon: weather.icon,
                }}
                compact={false}
              />
            </GlassCard>
          ) : (
            <GlassCard className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100">
                  <Calendar className="h-5 w-5" style={{ color: burgundy }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDate}
                  </p>
                </div>
              </div>
              <CloudSun className="h-6 w-6" style={{ color: gold }} />
            </GlassCard>
          )}
        </section>

        {/* Today's Outfit - Toggle between AI Recommendation & Shuffle */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: burgundy }}>
              Today's Outfit
            </h2>
            <div className="flex p-1 rounded-xl bg-slate-100">
              <button
                onClick={() => setActiveSection("outfit")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeSection === "outfit"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Sparkles className="h-3 w-3 inline mr-1.5" />
                AI Pick
              </button>
              <button
                onClick={() => setActiveSection("shuffle")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeSection === "shuffle"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Shuffle className="h-3 w-3 inline mr-1.5" />
                Shuffle
              </button>
            </div>
          </div>

          {activeSection === "outfit" ? (
            <GlassCard className="overflow-hidden" borderGlow>
              {wardrobeItems && wardrobeItems.length > 0 && weather ? (
                <div className="p-4">
                  <AIOutfitRecommenderComponent
                    weather={{ temperature: weather.temperature, condition: weather.condition, icon: weather.icon }}
                    wardrobeItems={wardrobeItems}
                    selectedMood={selectedMood}
                  />
                </div>
              ) : (
                <div className="p-10 text-center">
                  <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: `${burgundy}10`, border: `1px solid ${burgundy}20` }}>
                    <Sparkles className="h-9 w-9" style={{ color: burgundy }} />
                  </div>
                  <h3 className="font-serif text-2xl font-medium mb-3 text-slate-900">
                    Build Your Wardrobe
                  </h3>
                  <p className="text-sm mb-8 max-w-xs mx-auto text-slate-500">
                    Add items to get personalized outfit suggestions powered by AI
                  </p>
                  <Link href="/wardrobe">
                    <LuxuryButton
                      className="rounded-full gap-2 h-12 px-6"
                    >
                      <Plus className="h-4 w-4" />
                      Add Items
                    </LuxuryButton>
                  </Link>
                </div>
              )}
            </GlassCard>
          ) : (
            <GlassCard className="overflow-hidden">
              <OutfitShuffle
                onSaveOutfit={(items) => {
                  console.log("Saved outfit with items:", items);
                }}
              />
            </GlassCard>
          )}
        </section>

        {/* Mood Selection */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: burgundy }}>
              How are you feeling?
            </h2>
          </div>
          <GlassCard className="p-4">
            <MoodSelector selectedMood={selectedMood} setSelectedMood={setSelectedMood} />
          </GlassCard>
        </section>

        {/* Gamification Progress */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: burgundy }}>
              Your Style Journey
            </h2>
            <Link href="/statistics">
              <span className="text-xs font-medium flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors">
                View all <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
          <GlassCard className="p-4">
            <GamificationBadges stats={gamificationStats} compact />
          </GlassCard>
        </section>

        {/* CPW Analytics */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: burgundy }}>
              Cost Per Wear
            </h2>
            <Link href="/statistics">
              <span className="text-xs font-medium flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors">
                Details <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
          <GlassCard className="p-4">
            <CPWAnalytics
              wardrobeItems={wardrobeItems}
              outfits={outfits}
              compact
            />
          </GlassCard>
        </section>

        {/* Rediscover Section */}
        {smartSuggestions?.forgottenItems?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: burgundy }}>
                Rediscover
              </h2>
              <span className="text-xs text-slate-500">
                Haven't worn in 30+ days
              </span>
            </div>
            <GlassCard className="p-4" borderGlow>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${gold}20` }}>
                  <Eye className="h-4 w-4" style={{ color: gold }} />
                </div>
                <span className="text-sm font-medium text-slate-900">
                  Forgotten treasures in your closet
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-container">
                {smartSuggestions.forgottenItems.slice(0, 5).map((item: any) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 snap-item border border-slate-200 bg-slate-50"
                  >
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </section>
        )}

        {/* Weekly Goal */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: burgundy }}>
              Weekly Goal
            </h2>
          </div>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-200">
                  <Target className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Create {weeklyGoal.target} outfits
                  </p>
                  <p className="text-xs text-slate-500">
                    {Math.max(0, weeklyGoal.target - weeklyGoal.current)} remaining this week
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold font-mono text-slate-900">
                {weeklyGoal.current}/{weeklyGoal.target}
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(goalProgress, 5)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  goalProgress >= 100
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400'
                }`}
              />
            </div>
            {goalProgress >= 100 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 py-3 px-4 rounded-xl flex items-center gap-3 bg-emerald-50 border border-emerald-200"
              >
                <Crown className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">
                  Goal achieved! You're on fire 🔥
                </span>
              </motion.div>
            )}
          </GlassCard>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: burgundy }}>
              Quick Access
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/wardrobe">
              <GlassCard className="p-5 h-full cursor-pointer group" hoverEffect>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${burgundy}10`, border: `1px solid ${burgundy}20` }}>
                    <Archive className="h-5 w-5" style={{ color: burgundy }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-900 block mb-1">
                  The Archive
                </span>
                <p className="text-xs text-slate-500">
                  Browse your wardrobe
                </p>
              </GlassCard>
            </Link>
            <Link href="/compose">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-5 rounded-2xl cursor-pointer text-white shadow-lg hover:shadow-xl transition-all"
                style={{ background: `linear-gradient(135deg, ${burgundy} 0%, #9b1b4a 100%)` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/20">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                </div>
                <span className="text-sm font-semibold text-white block mb-1">
                  The Studio
                </span>
                <p className="text-xs text-white/70">
                  Create an outfit
                </p>
              </motion.div>
            </Link>
            <Link href="/calendar">
              <GlassCard className="p-5 h-full cursor-pointer group" hoverEffect>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#00FFFF]/20 to-transparent border border-[#00FFFF]/30 group-hover:border-[#00FFFF]/50 transition-colors">
                    <Calendar className="h-5 w-5 text-[#00FFFF]" />
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#F5F0E6] block mb-1">
                  Planner
                </span>
                <p className="text-xs text-[#A0A3BD]">
                  Plan your outfits
                </p>
              </GlassCard>
            </Link>
            <Link href="/statistics">
              <GlassCard className="p-5 h-full cursor-pointer group" hoverEffect>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#FF1493]/20 to-transparent border border-[#FF1493]/30 group-hover:border-[#FF1493]/50 transition-colors">
                    <BarChart3 className="h-5 w-5 text-[#FF1493]" />
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#F5F0E6] block mb-1">
                  Analytics
                </span>
                <p className="text-xs text-[#A0A3BD]">
                  Track your style
                </p>
              </GlassCard>
            </Link>
          </div>
        </section>
      </main>

      {/* Mobile Bottom Navigation - NeoPOP Dark Theme */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{
          background: 'rgba(22, 23, 34, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center justify-around py-2 px-4 safe-area-bottom">
          <Link href="/">
            <button className="flex flex-col items-center py-2 px-4">
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[10px] mt-1 font-semibold text-[#D4AF37]">Home</span>
            </button>
          </Link>
          <Link href="/wardrobe">
            <button className="flex flex-col items-center py-2 px-4">
              <Archive className="h-5 w-5 text-[#A0A3BD]" />
              <span className="text-[10px] mt-1 text-[#A0A3BD]">Wardrobe</span>
            </button>
          </Link>
          <Link href="/compose">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center w-14 h-14 rounded-xl -mt-6 bg-gradient-to-br from-[#D4AF37] to-[#F5D547] shadow-[3px_3px_0px_#A68B2B]"
            >
              <Plus className="h-7 w-7 text-[#161722]" />
            </motion.button>
          </Link>
          <Link href="/calendar">
            <button className="flex flex-col items-center py-2 px-4">
              <Calendar className="h-5 w-5 text-[#A0A3BD]" />
              <span className="text-[10px] mt-1 text-[#A0A3BD]">Calendar</span>
            </button>
          </Link>
          <Link href="/profile">
            <button className="flex flex-col items-center py-2 px-4">
              <Settings className="h-5 w-5 text-[#A0A3BD]" />
              <span className="text-[10px] mt-1 text-[#A0A3BD]">Profile</span>
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
