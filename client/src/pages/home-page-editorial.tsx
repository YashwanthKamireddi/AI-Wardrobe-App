import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWeather } from "@/hooks/use-weather";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useUserStats, useOutfits } from "@/hooks/use-outfits";
import MoodSelector from "@/components/mood-selector";
import AIStylistEditorial from "@/components/ai-stylist-editorial";
import OutfitShuffle from "@/components/outfit-shuffle";
import { queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ArrowRight,
  CloudSun,
  Sparkles,
  Heart,
  Calendar,
  Sun,
  Moon,
  Sunrise,
  ChevronRight,
  RefreshCw,
  Shuffle,
  Grid3X3,
  Layers,
  Search,
  User,
  LogOut,
  Frame,
  Lightbulb,
  BarChart3,
} from "lucide-react";

/**
 * HOME PAGE - EDITORIAL DASHBOARD
 *
 * Design Philosophy: Vogue meets Apple
 * - Massive whitespace
 * - Editorial typography
 * - Minimal UI, maximum impact
 */

export function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { data: weather, isLoading: weatherLoading, error: weatherError } = useWeather();
  const { data: wardrobeItems, isLoading: wardrobeLoading, error: wardrobeError } = useWardrobeItems();
  const { data: outfits, isLoading: outfitsLoading, error: outfitsError } = useOutfits();
  const { stats, isLoading: statsLoading } = useUserStats(
    wardrobeItems, wardrobeLoading, wardrobeError,
    outfits, outfitsLoading, outfitsError
  );
  const [selectedMood, setSelectedMood] = useState("happy");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSection, setActiveSection] = useState<"ai" | "shuffle">("ai");

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isLoading = weatherLoading || wardrobeLoading || outfitsLoading;

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: "Good Morning", icon: Sunrise };
    if (hour < 17) return { text: "Good Afternoon", icon: Sun };
    return { text: "Good Evening", icon: Moon };
  };

  const greeting = getTimeBasedGreeting();
  const formatDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#6B6B6B]">Curating your wardrobe...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (hasErrors) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center px-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#F5E6E6] flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-7 h-7 text-[#B44141]" />
          </div>
          <h2
            className="text-2xl mb-3 text-[#1A1A1A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Something went wrong
          </h2>
          <p className="text-sm text-[#6B6B6B] mb-8">
            We couldn't load your wardrobe. Please try again.
          </p>
          <motion.button
            onClick={handleRetry}
            className="h-12 px-8 bg-[#1A1A1A] text-[#F9F9F7] text-sm font-medium"
            whileHover={{ backgroundColor: "#80163A" }}
            whileTap={{ scale: 0.98 }}
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#F9F9F7]/95 backdrop-blur-xl border-b border-[#E5E5E5]/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <span
              className="text-lg tracking-[0.2em] text-[#1A1A1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              CELURA
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/home">
              <span className="text-xs tracking-[0.15em] uppercase text-[#1A1A1A] font-medium">Home</span>
            </Link>
            <Link href="/wardrobe">
              <span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Wardrobe</span>
            </Link>
            <Link href="/compose">
              <span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Compose</span>
            </Link>
            <Link href="/outfits">
              <span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Outfits</span>
            </Link>
            <Link href="/statistics">
              <span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Statistics</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/profile">
              <motion.div
                className="w-10 h-10 rounded-full bg-[#E5E5E5] flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <User className="w-5 h-5 text-[#6B6B6B]" />
              </motion.div>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        {/* Hero Section */}
        <motion.header
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-3">
            {formatDate}
          </p>
          <h1
            className="text-[#1A1A1A] mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 1.1
            }}
          >
            {greeting.text}, {user?.name?.split(' ')[0] || user?.username}
          </h1>
          <p className="text-[#6B6B6B] text-lg max-w-xl">
            Your personal style dashboard. Let's create something beautiful today.
          </p>
        </motion.header>

        {/* Stats Grid */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Items", value: stats?.totalItems || 0, icon: Grid3X3 },
              { label: "Outfits", value: stats?.totalOutfits || 0, icon: Layers },
              { label: "Favorites", value: stats?.favoriteOutfits || 0, icon: Heart },
              { label: "Weather", value: weather ? `${weather.temperature}°` : "—", icon: CloudSun, subtext: weather?.condition },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E5E5E5]/50"
                whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}
                transition={{ duration: 0.3 }}
              >
                <stat.icon className="w-5 h-5 text-[#9A9A9A] mb-4" />
                <p
                  className="text-3xl text-[#1A1A1A] mb-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs tracking-wider uppercase text-[#6B6B6B]">
                  {stat.label}
                </p>
                {stat.subtext && (
                  <p className="text-xs text-[#9A9A9A] mt-1 capitalize">{stat.subtext}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Today's Outfit Section */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#80163A] mb-1">
                Today's Selection
              </p>
              <h2
                className="text-2xl text-[#1A1A1A]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Your Daily Edit
              </h2>
            </div>

            {/* Toggle */}
            <div className="flex p-1 rounded-full bg-[#F0F0F0]">
              <button
                onClick={() => setActiveSection("ai")}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  activeSection === "ai"
                    ? "bg-white text-[#1A1A1A] shadow-sm"
                    : "text-[#6B6B6B]"
                }`}
              >
                <Sparkles className="w-3 h-3 inline mr-1.5" />
                Stylist
              </button>
              <button
                onClick={() => setActiveSection("shuffle")}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  activeSection === "shuffle"
                    ? "bg-white text-[#1A1A1A] shadow-sm"
                    : "text-[#6B6B6B]"
                }`}
              >
                <Shuffle className="w-3 h-3 inline mr-1.5" />
                Shuffle
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E5E5E5]/50 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeSection === "ai" ? (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {wardrobeItems && wardrobeItems.length > 0 && weather ? (
                    <div className="p-6 md:p-8">
                      <AIStylistEditorial
                        weather={{ temperature: weather.temperature, condition: weather.condition, icon: weather.icon }}
                        wardrobeItems={wardrobeItems}
                        selectedMood={selectedMood}
                      />
                    </div>
                  ) : (
                    <div className="p-16 text-center">
                      <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-[#9A9A9A]" />
                      </div>
                      <h3
                        className="text-xl text-[#1A1A1A] mb-3"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        Build Your Wardrobe
                      </h3>
                      <p className="text-sm text-[#6B6B6B] mb-8 max-w-sm mx-auto">
                        Add items to receive personalized outfit recommendations
                      </p>
                      <Link href="/wardrobe">
                        <motion.button
                          className="h-12 px-8 bg-[#1A1A1A] text-[#F9F9F7] text-sm font-medium rounded-full inline-flex items-center gap-2"
                          whileHover={{ backgroundColor: "#80163A" }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Plus className="w-4 h-4" />
                          Add Items
                        </motion.button>
                      </Link>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="shuffle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6"
                >
                  <OutfitShuffle
                    onSaveOutfit={(items) => {
                      console.log("Saved outfit:", items);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Mood Selection */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="mb-6">
            <h2
              className="text-2xl text-[#1A1A1A] mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Today's Mood
            </h2>
            <p className="text-sm text-[#6B6B6B]">How are you feeling today?</p>
          </div>

          <div className="rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E5E5E5]/50 p-6">
            <MoodSelector selectedMood={selectedMood} setSelectedMood={setSelectedMood} />
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="mb-6">
            <h2
              className="text-2xl text-[#1A1A1A] mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Quick Actions
            </h2>
            <p className="text-sm text-[#6B6B6B]">Navigate your fashion world</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Link href="/wardrobe">
              <motion.div
                className="group p-8 rounded-3xl bg-[#1A1A1A] cursor-pointer relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#80163A]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative z-10">
                  <Grid3X3 className="w-6 h-6 mb-4 text-white/60" />
                  <h3
                    className="text-xl text-white mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Manage Wardrobe
                  </h3>
                  <p className="text-sm text-white/60 mb-4">Add, organize, and curate your collection</p>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.div>
            </Link>

            <Link href="/outfits">
              <motion.div
                className="group p-8 rounded-3xl bg-white border border-[#E5E5E5] cursor-pointer"
                whileHover={{ scale: 1.02, borderColor: "#1A1A1A" }}
                transition={{ duration: 0.3 }}
              >
                <Layers className="w-6 h-6 mb-4 text-[#9A9A9A]" />
                <h3
                  className="text-xl text-[#1A1A1A] mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  View Outfits
                </h3>
                <p className="text-sm text-[#6B6B6B] mb-4">Browse your saved outfit combinations</p>
                <ArrowRight className="w-5 h-5 text-[#9A9A9A] group-hover:translate-x-2 transition-transform" />
              </motion.div>
            </Link>
          </div>

          {/* Additional Quick Links */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <Link href="/compose">
              <motion.div
                className="group p-5 rounded-2xl bg-white border border-[#E5E5E5] cursor-pointer text-center"
                whileHover={{ scale: 1.02, borderColor: "#1A1A1A" }}
                transition={{ duration: 0.3 }}
              >
                <Plus className="w-5 h-5 mx-auto mb-2 text-[#9A9A9A] group-hover:text-[#1A1A1A] transition-colors" />
                <p className="text-xs text-[#6B6B6B] group-hover:text-[#1A1A1A] transition-colors">Compose</p>
              </motion.div>
            </Link>
            <Link href="/calendar">
              <motion.div
                className="group p-5 rounded-2xl bg-white border border-[#E5E5E5] cursor-pointer text-center"
                whileHover={{ scale: 1.02, borderColor: "#1A1A1A" }}
                transition={{ duration: 0.3 }}
              >
                <Calendar className="w-5 h-5 mx-auto mb-2 text-[#9A9A9A] group-hover:text-[#1A1A1A] transition-colors" />
                <p className="text-xs text-[#6B6B6B] group-hover:text-[#1A1A1A] transition-colors">Calendar</p>
              </motion.div>
            </Link>
            <Link href="/statistics">
              <motion.div
                className="group p-5 rounded-2xl bg-white border border-[#E5E5E5] cursor-pointer text-center"
                whileHover={{ scale: 1.02, borderColor: "#1A1A1A" }}
                transition={{ duration: 0.3 }}
              >
                <Search className="w-5 h-5 mx-auto mb-2 text-[#9A9A9A] group-hover:text-[#1A1A1A] transition-colors" />
                <p className="text-xs text-[#6B6B6B] group-hover:text-[#1A1A1A] transition-colors">Statistics</p>
              </motion.div>
            </Link>
            <Link href="/intelligence">
              <motion.div
                className="group p-5 rounded-2xl bg-gradient-to-br from-white to-[#FAF9F8] border border-[#C5A572]/30 cursor-pointer text-center relative overflow-hidden"
                whileHover={{ scale: 1.02, borderColor: "#C5A572" }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C5A572] animate-pulse" />
                <BarChart3 className="w-5 h-5 mx-auto mb-2 text-[#C5A572] group-hover:text-[#80163A] transition-colors" />
                <p className="text-xs text-[#6B6B6B] group-hover:text-[#1A1A1A] transition-colors font-medium">Intelligence</p>
              </motion.div>
            </Link>
            <Link href="/trips">
              <motion.div
                className="group p-5 rounded-2xl bg-white border border-[#E5E5E5] cursor-pointer text-center"
                whileHover={{ scale: 1.02, borderColor: "#1A1A1A" }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="w-5 h-5 mx-auto mb-2 text-[#9A9A9A] group-hover:text-[#1A1A1A] transition-colors rotate-45" />
                <p className="text-xs text-[#6B6B6B] group-hover:text-[#1A1A1A] transition-colors">Trips</p>
              </motion.div>
            </Link>
            <Link href="/framing">
              <motion.div
                className="group p-5 rounded-2xl bg-white border border-[#E5E5E5] cursor-pointer text-center"
                whileHover={{ scale: 1.02, borderColor: "#1A1A1A" }}
                transition={{ duration: 0.3 }}
              >
                <Frame className="w-5 h-5 mx-auto mb-2 text-[#9A9A9A] group-hover:text-[#1A1A1A] transition-colors" />
                <p className="text-xs text-[#6B6B6B] group-hover:text-[#1A1A1A] transition-colors">Framing</p>
              </motion.div>
            </Link>
            <Link href="/inspiration">
              <motion.div
                className="group p-5 rounded-2xl bg-white border border-[#E5E5E5] cursor-pointer text-center"
                whileHover={{ scale: 1.02, borderColor: "#1A1A1A" }}
                transition={{ duration: 0.3 }}
              >
                <Lightbulb className="w-5 h-5 mx-auto mb-2 text-[#9A9A9A] group-hover:text-[#1A1A1A] transition-colors" />
                <p className="text-xs text-[#6B6B6B] group-hover:text-[#1A1A1A] transition-colors">Inspiration</p>
              </motion.div>
            </Link>
          </div>
        </motion.section>

        {/* Style Essence Banner */}
        <motion.section
          className="mt-8 pb-24 md:pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link href="/style-essence">
            <motion.div
              className="group relative p-8 rounded-3xl bg-gradient-to-r from-[#1A1A1A] to-[#3A3A3A] cursor-pointer overflow-hidden"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
                <Sparkles className="w-full h-full" />
              </div>
              <div className="relative z-10">
                <p className="text-xs tracking-[0.2em] uppercase text-white/50 mb-2">Discover</p>
                <h3
                  className="text-2xl text-white mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Your Style DNA
                </h3>
                <p className="text-sm text-white/60 mb-4 max-w-md">
                  Understand your unique fashion identity with our style personality analysis
                </p>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <span>Explore Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.section>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E5E5E5]/50 px-6 py-3">
        <div className="flex items-center justify-around">
          {[
            { href: "/home", icon: Grid3X3, label: "Home", active: true },
            { href: "/wardrobe", icon: Layers, label: "Wardrobe" },
            { href: "/outfits", icon: Heart, label: "Outfits" },
            { href: "/profile", icon: User, label: "Profile" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center gap-1 ${item.active ? "text-[#1A1A1A]" : "text-[#9A9A9A]"}`}>
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] tracking-wider">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default HomePage;
