import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWeather } from "@/hooks/use-weather";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";
import AIStylistMinimal from "@/components/ai-stylist-minimal";
import { queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ArrowRight,
  Sun,
  Moon,
  Sunrise,
  Cloud,
  RefreshCw,
  Grid3X3,
  Layers,
  Heart,
  User,
  BarChart3,
  Sparkles,
  Calendar,
  Settings,
  ChevronRight,
  TrendingUp,
  Award,
  Shirt,
  LogOut,
} from "lucide-react";

/**
 * HOME PAGE - POLISHED & COMPLETE
 *
 * Design: Ethereal Structure theme throughout
 * - Desktop: Full nav, two-column layout
 * - Mobile: Clean stacked layout with bottom nav
 */

// Theme colors
const theme = {
  bg: "#F9F9F7",
  card: "#FFFFFF",
  text: "#1A1A1A",
  muted: "#6B6B6B",
  subtle: "#9A9A9A",
  border: "#E5E5E5",
  accent: "#80163A",
  gold: "#C5A572",
};

export function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const { data: weather, isLoading: weatherLoading } = useWeather();
  const { data: wardrobeItems, isLoading: wardrobeLoading, error: wardrobeError } = useWardrobeItems();
  const { data: outfits, isLoading: outfitsLoading, error: outfitsError } = useOutfits();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isLoading = weatherLoading || wardrobeLoading || outfitsLoading;

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: "Good Morning", icon: Sunrise, period: "morning" };
    if (hour < 17) return { text: "Good Afternoon", icon: Sun, period: "afternoon" };
    return { text: "Good Evening", icon: Moon, period: "evening" };
  };

  const greeting = getGreeting();
  const formatDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const hasErrors = wardrobeError || outfitsError;
  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/wardrobe"] });
    queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
    queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-2 border-[#E5E5E5] border-t-[#80163A] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#6B6B6B]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Preparing your wardrobe...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (hasErrors) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center px-6">
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-full bg-[#FBF5F7] flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-7 h-7 text-[#80163A]" />
          </div>
          <h2 className="text-xl mb-2 text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Something went wrong
          </h2>
          <p className="text-sm text-[#6B6B6B] mb-6">We couldn't load your wardrobe</p>
          <button
            onClick={handleRetry}
            className="px-8 py-3 bg-[#1A1A1A] text-white text-sm rounded-full hover:bg-[#80163A] transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  const itemCount = wardrobeItems?.length || 0;
  const outfitCount = outfits?.length || 0;
  const favoriteCount = outfits?.filter(o => o.favorite)?.length || 0;

  // Get recent items for preview
  const recentItems = wardrobeItems?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* Desktop Navigation */}
      <nav className="sticky top-0 z-50 bg-[#F9F9F7]/95 backdrop-blur-xl border-b border-[#E5E5E5]/50">
        <div className="w-full px-6 lg:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/home">
            <span
              className="text-lg tracking-[0.2em] text-[#1A1A1A] cursor-pointer"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              CELURA
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/home">
              <span className="text-xs tracking-[0.15em] uppercase text-[#1A1A1A] font-medium cursor-pointer">
                Home
              </span>
            </Link>
            <Link href="/wardrobe">
              <span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors cursor-pointer">
                Wardrobe
              </span>
            </Link>
            <Link href="/outfits">
              <span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors cursor-pointer">
                Outfits
              </span>
            </Link>
            <Link href="/intelligence">
              <span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors cursor-pointer">
                Intelligence
              </span>
            </Link>
            <Link href="/inspiration">
              <span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors cursor-pointer">
                Inspiration
              </span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#80163A] to-[#B01B4C] flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                </span>
              </motion.div>
            </Link>
          </div>
        </div>
      </nav>

      <main className="w-full px-6 lg:px-12 py-8 md:py-12 pb-24 md:pb-12">
        {/* Hero Section */}
        <motion.header
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-2">
                {formatDate}
              </p>
              <h1
                className="text-3xl md:text-4xl text-[#1A1A1A] mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {greeting.text}, {user?.name?.split(' ')[0] || user?.username}
              </h1>
              <p className="text-[#6B6B6B] text-base max-w-md">
                Let's find the perfect outfit for today.
              </p>
            </div>

            {/* Weather Card */}
            {weather && (
              <motion.div
                className="hidden md:flex items-center gap-4 px-6 py-4 rounded-2xl bg-white border border-[#E5E5E5]/50"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Cloud className="w-8 h-8 text-[#9A9A9A]" />
                <div>
                  <p className="text-2xl text-[#1A1A1A] font-light">{weather.temperature}°</p>
                  <p className="text-xs text-[#6B6B6B] capitalize">{weather.condition}</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.header>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/wardrobe">
            <motion.div
              className="p-5 rounded-2xl bg-white border border-[#E5E5E5]/50 cursor-pointer group"
              whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.06)" }}
            >
              <Grid3X3 className="w-5 h-5 text-[#9A9A9A] mb-3 group-hover:text-[#80163A] transition-colors" />
              <p className="text-3xl text-[#1A1A1A] font-light mb-1">{itemCount}</p>
              <p className="text-xs text-[#6B6B6B] tracking-wide uppercase">Items</p>
            </motion.div>
          </Link>

          <Link href="/outfits">
            <motion.div
              className="p-5 rounded-2xl bg-white border border-[#E5E5E5]/50 cursor-pointer group"
              whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.06)" }}
            >
              <Layers className="w-5 h-5 text-[#9A9A9A] mb-3 group-hover:text-[#80163A] transition-colors" />
              <p className="text-3xl text-[#1A1A1A] font-light mb-1">{outfitCount}</p>
              <p className="text-xs text-[#6B6B6B] tracking-wide uppercase">Outfits</p>
            </motion.div>
          </Link>

          <motion.div
            className="p-5 rounded-2xl bg-white border border-[#E5E5E5]/50"
            whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.06)" }}
          >
            <Heart className="w-5 h-5 text-[#9A9A9A] mb-3" />
            <p className="text-3xl text-[#1A1A1A] font-light mb-1">{favoriteCount}</p>
            <p className="text-xs text-[#6B6B6B] tracking-wide uppercase">Favorites</p>
          </motion.div>

          {weather && (
            <motion.div
              className="p-5 rounded-2xl bg-white border border-[#E5E5E5]/50 md:hidden"
              whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.06)" }}
            >
              <Cloud className="w-5 h-5 text-[#9A9A9A] mb-3" />
              <p className="text-3xl text-[#1A1A1A] font-light mb-1">{weather.temperature}°</p>
              <p className="text-xs text-[#6B6B6B] tracking-wide uppercase capitalize truncate">{weather.condition}</p>
            </motion.div>
          )}

          <Link href="/intelligence">
            <motion.div
              className="hidden md:block p-5 rounded-2xl bg-gradient-to-br from-[#FAF9F8] to-white border border-[#C5A572]/30 cursor-pointer group"
              whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(197,165,114,0.15)" }}
            >
              <BarChart3 className="w-5 h-5 text-[#C5A572] mb-3" />
              <p className="text-3xl text-[#1A1A1A] font-light mb-1">
                <TrendingUp className="w-6 h-6 inline text-[#C5A572]" />
              </p>
              <p className="text-xs text-[#6B6B6B] tracking-wide uppercase">Intelligence</p>
            </motion.div>
          </Link>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* AI Stylist - Main Feature (takes 2/3 on large screens) */}
          <motion.div
            className="lg:col-span-2 order-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#E5E5E5]/50 shadow-sm h-full">
              {wardrobeItems && wardrobeItems.length > 0 && weather ? (
                <AIStylistMinimal
                  weather={{ temperature: weather.temperature, condition: weather.condition, icon: weather.icon }}
                  wardrobeItems={wardrobeItems}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-[#F9F9F7] flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-[#80163A]" />
                  </div>
                  <h3 className="text-xl text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Build Your Wardrobe
                  </h3>
                  <p className="text-sm text-[#6B6B6B] mb-6 max-w-xs mx-auto">
                    Add items to receive AI-powered outfit recommendations
                  </p>
                  <Link href="/wardrobe">
                    <motion.button
                      className="px-6 py-3 bg-[#1A1A1A] text-white text-sm rounded-full inline-flex items-center gap-2"
                      whileHover={{ backgroundColor: "#80163A" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-4 h-4" />
                      Add First Item
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar (takes 1/3 on large screens) */}
          <div className="space-y-6 order-2">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h2 className="text-sm tracking-[0.1em] uppercase text-[#6B6B6B] mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/wardrobe">
                  <motion.div
                    className="p-4 rounded-2xl bg-white border border-[#E5E5E5]/50 cursor-pointer group"
                    whileHover={{ borderColor: "#1A1A1A" }}
                  >
                    <Grid3X3 className="w-5 h-5 text-[#9A9A9A] mb-2 group-hover:text-[#1A1A1A] transition-colors" />
                    <p className="text-sm text-[#1A1A1A] font-medium">Wardrobe</p>
                    <p className="text-xs text-[#9A9A9A]">Manage items</p>
                  </motion.div>
                </Link>
                <Link href="/outfits">
                  <motion.div
                    className="p-4 rounded-2xl bg-white border border-[#E5E5E5]/50 cursor-pointer group"
                    whileHover={{ borderColor: "#1A1A1A" }}
                  >
                    <Layers className="w-5 h-5 text-[#9A9A9A] mb-2 group-hover:text-[#1A1A1A] transition-colors" />
                    <p className="text-sm text-[#1A1A1A] font-medium">Outfits</p>
                    <p className="text-xs text-[#9A9A9A]">Saved looks</p>
                  </motion.div>
                </Link>
                <Link href="/intelligence">
                  <motion.div
                    className="p-4 rounded-2xl bg-white border border-[#C5A572]/30 cursor-pointer group"
                    whileHover={{ borderColor: "#C5A572" }}
                  >
                    <BarChart3 className="w-5 h-5 text-[#C5A572] mb-2" />
                    <p className="text-sm text-[#1A1A1A] font-medium">Intelligence</p>
                    <p className="text-xs text-[#9A9A9A]">Analytics</p>
                  </motion.div>
                </Link>
                <Link href="/inspiration">
                  <motion.div
                    className="p-4 rounded-2xl bg-white border border-[#E5E5E5]/50 cursor-pointer group"
                    whileHover={{ borderColor: "#1A1A1A" }}
                  >
                    <Heart className="w-5 h-5 text-[#9A9A9A] mb-2 group-hover:text-[#80163A] transition-colors" />
                    <p className="text-sm text-[#1A1A1A] font-medium">Inspiration</p>
                    <p className="text-xs text-[#9A9A9A]">Style ideas</p>
                  </motion.div>
                </Link>
              </div>
            </motion.div>

            {/* Recent Items Preview */}
            {recentItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm tracking-[0.1em] uppercase text-[#6B6B6B]">Recent Items</h2>
                  <Link href="/wardrobe">
                    <span className="text-xs text-[#80163A] cursor-pointer flex items-center gap-1">
                      View all <ChevronRight className="w-3 h-3" />
                    </span>
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {recentItems.slice(0, 6).map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="aspect-square rounded-xl bg-[#F5F5F5] overflow-hidden"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + index * 0.05 }}
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Shirt className="w-6 h-6 text-[#CACACA]" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Style Tip */}
            <motion.div
              className="p-5 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Award className="w-5 h-5 text-[#C5A572] mb-3" />
              <h3 className="text-sm font-medium mb-1">Style Tip</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                {greeting.period === "morning"
                  ? "Start your day with confidence. Layer up for the morning chill."
                  : greeting.period === "afternoon"
                  ? "Midday calls for breathable fabrics. Stay comfortable and chic."
                  : "Evening elegance awaits. Elevate your look with darker tones."
                }
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E5E5E5]/50 z-50">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
          {[
            { href: "/home", icon: Sparkles, label: "Home", active: true },
            { href: "/wardrobe", icon: Grid3X3, label: "Wardrobe" },
            { href: "/compose", icon: Plus, label: "Create", isAction: true },
            { href: "/outfits", icon: Layers, label: "Outfits" },
            { href: "/profile", icon: User, label: "Profile" },
          ].map((item) => {
            if (item.isAction) {
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C5A572] to-[#D4B584] flex items-center justify-center -mt-4 shadow-lg"
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className="w-5 h-5 text-[#1A1A1A]" />
                  </motion.div>
                </Link>
              );
            }
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex flex-col items-center gap-1 ${item.active ? "text-[#C5A572]" : "text-[#9A9A9A]"}`}>
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px]">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default HomePage;
