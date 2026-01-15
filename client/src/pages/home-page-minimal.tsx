import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWeather } from "@/hooks/use-weather";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";
import AIStylistMinimal from "@/components/ai-stylist-minimal";
import { queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import {
  Plus,
  ArrowRight,
  Sun,
  Moon,
  Sunrise,
  RefreshCw,
  Grid3X3,
  Layers,
  Heart,
  User,
  BarChart3,
} from "lucide-react";

/**
 * HOME PAGE - CLEAN & MINIMAL
 *
 * Inspired by Cladwell, Acloset - focused, not overwhelming
 * One action at a time, progressive disclosure
 */

export function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: weather, isLoading: weatherLoading, error: weatherError } = useWeather();
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
    if (hour < 12) return { text: "Good Morning", icon: Sunrise };
    if (hour < 17) return { text: "Good Afternoon", icon: Sun };
    return { text: "Good Evening", icon: Moon };
  };

  const greeting = getGreeting();
  const formatDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  const hasErrors = wardrobeError || outfitsError;
  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/wardrobe"] });
    queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
    queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#9A9A9A]">Loading...</p>
        </div>
      </div>
    );
  }

  // Error
  if (hasErrors) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 text-[#CACACA]" />
          <p className="text-sm text-[#6B6B6B] mb-4">Something went wrong</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2.5 bg-[#1A1A1A] text-white text-sm rounded-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const itemCount = wardrobeItems?.length || 0;
  const outfitCount = outfits?.length || 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FAFAFA]/95 backdrop-blur-xl border-b border-[#F0F0F0]">
        <div className="max-w-5xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between">
          <span
            className="text-base tracking-[0.15em] text-[#1A1A1A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            CELURA
          </span>
          <Link href="/profile">
            <div className="w-8 h-8 rounded-full bg-[#F0F0F0] flex items-center justify-center">
              <User className="w-4 h-4 text-[#9A9A9A]" />
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:px-8 py-6 md:py-10 pb-24">
        {/* Greeting */}
        <motion.div
          className="mb-8 md:mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs md:text-sm text-[#9A9A9A] mb-1">{formatDate}</p>
          <h1
            className="text-2xl md:text-4xl text-[#1A1A1A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {greeting.text}, {user?.name?.split(' ')[0] || user?.username}
          </h1>
        </motion.div>

        {/* Desktop: Two column layout | Mobile: Stacked */}
        <div className="grid md:grid-cols-5 gap-6 md:gap-8">
          {/* Left Column - Stats & Links */}
          <div className="md:col-span-2 space-y-6">
            {/* Quick Stats */}
            <motion.div
              className="grid grid-cols-3 gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link href="/wardrobe">
                <div className="p-4 md:p-5 rounded-2xl bg-white border border-[#F0F0F0] hover:border-[#E0E0E0] transition-colors">
                  <p className="text-2xl md:text-3xl text-[#1A1A1A] font-light">{itemCount}</p>
                  <p className="text-xs text-[#9A9A9A]">Items</p>
                </div>
              </Link>
              <Link href="/outfits">
                <div className="p-4 md:p-5 rounded-2xl bg-white border border-[#F0F0F0] hover:border-[#E0E0E0] transition-colors">
                  <p className="text-2xl md:text-3xl text-[#1A1A1A] font-light">{outfitCount}</p>
                  <p className="text-xs text-[#9A9A9A]">Outfits</p>
                </div>
              </Link>
              {weather && (
                <div className="p-4 md:p-5 rounded-2xl bg-white border border-[#F0F0F0]">
                  <p className="text-2xl md:text-3xl text-[#1A1A1A] font-light">{weather.temperature}°</p>
                  <p className="text-xs text-[#9A9A9A] capitalize truncate">{weather.condition}</p>
                </div>
              )}
            </motion.div>

            {/* Quick Links */}
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/wardrobe">
                <div className="group p-4 md:p-5 rounded-2xl bg-white border border-[#F0F0F0] hover:border-[#1A1A1A] transition-colors">
                  <Grid3X3 className="w-5 h-5 mb-3 text-[#9A9A9A] group-hover:text-[#1A1A1A] transition-colors" />
                  <p className="text-sm text-[#1A1A1A]">Wardrobe</p>
                  <p className="text-xs text-[#9A9A9A]">Manage items</p>
                </div>
              </Link>
              <Link href="/outfits">
                <div className="group p-4 md:p-5 rounded-2xl bg-white border border-[#F0F0F0] hover:border-[#1A1A1A] transition-colors">
                  <Layers className="w-5 h-5 mb-3 text-[#9A9A9A] group-hover:text-[#1A1A1A] transition-colors" />
                  <p className="text-sm text-[#1A1A1A]">Outfits</p>
                  <p className="text-xs text-[#9A9A9A]">Saved looks</p>
                </div>
              </Link>
              <Link href="/intelligence">
                <div className="group p-4 md:p-5 rounded-2xl bg-white border border-[#F0F0F0] hover:border-[#C5A572] transition-colors">
                  <BarChart3 className="w-5 h-5 mb-3 text-[#C5A572]" />
                  <p className="text-sm text-[#1A1A1A]">Intelligence</p>
                  <p className="text-xs text-[#9A9A9A]">Analytics</p>
                </div>
              </Link>
              <Link href="/inspiration">
                <div className="group p-4 md:p-5 rounded-2xl bg-white border border-[#F0F0F0] hover:border-[#1A1A1A] transition-colors">
                  <Heart className="w-5 h-5 mb-3 text-[#9A9A9A] group-hover:text-[#1A1A1A] transition-colors" />
                  <p className="text-sm text-[#1A1A1A]">Inspiration</p>
                  <p className="text-xs text-[#9A9A9A]">Style ideas</p>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Right Column - AI Outfit Generator */}
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="p-5 md:p-8 rounded-3xl bg-white border border-[#F0F0F0] h-full">
              {wardrobeItems && weather ? (
                <AIStylistMinimal
                  weather={{ temperature: weather.temperature, condition: weather.condition, icon: weather.icon }}
                  wardrobeItems={wardrobeItems}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-[#9A9A9A] mb-4">Add items to get started</p>
                  <Link href="/wardrobe">
                    <button className="px-5 py-2.5 bg-[#1A1A1A] text-white text-sm rounded-full inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Items
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Add Item CTA - Only if wardrobe is empty */}
        {itemCount === 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/wardrobe">
              <div className="p-5 rounded-3xl bg-[#1A1A1A] text-center">
                <h3 className="text-white text-lg mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Build Your Wardrobe
                </h3>
                <p className="text-white/60 text-xs mb-4">Add your first items to get personalized outfits</p>
                <div className="inline-flex items-center gap-1.5 text-white text-sm">
                  Get Started <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </main>

      {/* Bottom Nav - Only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#F0F0F0] safe-area-pb">
        <div className="max-w-lg mx-auto px-6 py-2.5 flex items-center justify-around">
          {[
            { href: "/home", icon: Grid3X3, label: "Home", active: true },
            { href: "/wardrobe", icon: Layers, label: "Wardrobe", active: false },
            { href: "/outfits", icon: Heart, label: "Outfits", active: false },
            { href: "/profile", icon: User, label: "Profile", active: false },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center gap-0.5 py-1 ${
                item.active ? "text-[#1A1A1A]" : "text-[#CACACA]"
              }`}>
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default HomePage;
