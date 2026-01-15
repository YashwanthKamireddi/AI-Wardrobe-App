import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Palette,
  Sparkles,
  Crown,
  Grid3X3,
  Layers,
  Heart,
  User,
  Star,
  Gem,
  Feather,
  CircleDot,
  Minimize2,
  Maximize2,
  Circle,
  RefreshCw,
} from "lucide-react";

import { useWardrobeItems } from "@/hooks/use-wardrobe";

/**
 * STYLE ESSENCE PAGE - EDITORIAL STYLE ANALYSIS
 *
 * Design: Clean personality assessment with visual harmony
 * Focus: Style DNA discovery and color harmony analysis
 */

interface StylePersonality {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  traits: string[];
  colorPalette: string[];
}

const STYLE_PERSONALITIES: StylePersonality[] = [
  {
    id: 'curator',
    name: 'The Curator',
    description: 'You collect pieces with intention, building a wardrobe of timeless investment items.',
    icon: Crown,
    traits: ['Quality-focused', 'Timeless choices', 'Investment mindset'],
    colorPalette: ['#1A1A1A', '#F9F9F7', '#8B7355', '#4A4A4A']
  },
  {
    id: 'minimalist',
    name: 'The Minimalist',
    description: 'Less is more. You believe in the power of simplicity and clean lines.',
    icon: Minimize2,
    traits: ['Capsule wardrobe', 'Neutral tones', 'Clean silhouettes'],
    colorPalette: ['#1A1A1A', '#FFFFFF', '#9A9A9A', '#E5E5E5']
  },
  {
    id: 'expressionist',
    name: 'The Expressionist',
    description: 'Fashion is your canvas. You use clothing to express your unique creative vision.',
    icon: Sparkles,
    traits: ['Bold choices', 'Color lover', 'Trend-aware'],
    colorPalette: ['#80163A', '#D4AF37', '#1A4D2E', '#2A4B8F']
  },
  {
    id: 'classicist',
    name: 'The Classicist',
    description: 'You honor tradition and find beauty in proven elegance.',
    icon: Gem,
    traits: ['Traditional styling', 'Polished looks', 'Heritage brands'],
    colorPalette: ['#1e3a5f', '#8B0000', '#2F4F4F', '#DAA520']
  },
  {
    id: 'naturalist',
    name: 'The Naturalist',
    description: 'Comfort meets consciousness. You gravitate toward organic and sustainable choices.',
    icon: Feather,
    traits: ['Eco-conscious', 'Natural fibers', 'Earth tones'],
    colorPalette: ['#606C38', '#8B5E3C', '#E5DDD3', '#588157']
  },
];

export function StyleEssencePage() {
  const { data: wardrobeItems, isLoading } = useWardrobeItems();
  const [selectedPersonality, setSelectedPersonality] = useState<StylePersonality | null>(null);

  // Analyze wardrobe to determine style personality
  const analysis = useMemo(() => {
    if (!wardrobeItems || wardrobeItems.length === 0) return null;

    // Count colors
    const colorCounts: Record<string, number> = {};
    wardrobeItems.forEach(item => {
      const color = item.color?.toLowerCase() || 'unknown';
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    });

    // Calculate dominant colors
    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);

    // Simple style score based on wardrobe diversity
    const uniqueColors = Object.keys(colorCounts).length;
    const colorHarmonyScore = Math.min(Math.round((uniqueColors / wardrobeItems.length) * 100 + 30), 95);

    // Determine personality based on wardrobe characteristics
    const neutralCount = wardrobeItems.filter(item => {
      const color = item.color?.toLowerCase() || '';
      return ['black', 'white', 'gray', 'grey', 'beige', 'cream', 'navy'].some(n => color.includes(n));
    }).length;

    const neutralRatio = neutralCount / wardrobeItems.length;

    let personalityMatch: StylePersonality;
    if (neutralRatio > 0.7) {
      personalityMatch = STYLE_PERSONALITIES.find(p => p.id === 'minimalist')!;
    } else if (neutralRatio > 0.5) {
      personalityMatch = STYLE_PERSONALITIES.find(p => p.id === 'curator')!;
    } else if (neutralRatio > 0.3) {
      personalityMatch = STYLE_PERSONALITIES.find(p => p.id === 'classicist')!;
    } else {
      personalityMatch = STYLE_PERSONALITIES.find(p => p.id === 'expressionist')!;
    }

    return {
      dominantColors: sortedColors,
      colorHarmonyScore,
      personalityMatch,
      totalItems: wardrobeItems.length,
      styleScore: Math.min(Math.round(wardrobeItems.length * 3 + colorHarmonyScore / 2), 100),
    };
  }, [wardrobeItems]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7] pb-24 md:pb-0">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#F9F9F7]/95 backdrop-blur-xl border-b border-[#E5E5E5]/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><span className="text-lg tracking-[0.2em] text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>CELURA</span></Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/home"><span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Home</span></Link>
            <Link href="/wardrobe"><span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Wardrobe</span></Link>
            <Link href="/style-essence"><span className="text-xs tracking-[0.15em] uppercase text-[#1A1A1A] font-medium">Style DNA</span></Link>
            <Link href="/profile"><span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Profile</span></Link>
          </div>
          <Link href="/profile"><motion.div className="w-10 h-10 rounded-full bg-[#E5E5E5] flex items-center justify-center" whileHover={{ scale: 1.05 }}><User className="w-5 h-5 text-[#6B6B6B]" /></motion.div></Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <motion.header className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-2">Discover</p>
          <h1 className="text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            Your Style DNA
          </h1>
          <p className="text-[#6B6B6B] text-lg">Understand your unique fashion identity</p>
        </motion.header>

        {analysis ? (
          <>
            {/* Score Cards */}
            <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              {/* Style Score */}
              <motion.div
                className="p-6 rounded-3xl bg-[#1A1A1A] text-white col-span-2 md:col-span-1"
                whileHover={{ scale: 1.02 }}
              >
                <Star className="w-6 h-6 mb-4 opacity-60" />
                <div className="text-5xl mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {analysis.styleScore}
                </div>
                <p className="text-xs uppercase tracking-wider opacity-60">Style Score</p>
              </motion.div>

              {/* Color Harmony */}
              <motion.div
                className="p-6 rounded-3xl bg-white border border-[#E5E5E5]/50"
                whileHover={{ scale: 1.02 }}
              >
                <Palette className="w-6 h-6 mb-4 text-[#9A9A9A]" />
                <div className="text-4xl text-[#1A1A1A] mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {analysis.colorHarmonyScore}%
                </div>
                <p className="text-xs text-[#9A9A9A] uppercase tracking-wider">Color Harmony</p>
              </motion.div>

              {/* Total Items */}
              <motion.div
                className="p-6 rounded-3xl bg-white border border-[#E5E5E5]/50"
                whileHover={{ scale: 1.02 }}
              >
                <Layers className="w-6 h-6 mb-4 text-[#9A9A9A]" />
                <div className="text-4xl text-[#1A1A1A] mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {analysis.totalItems}
                </div>
                <p className="text-xs text-[#9A9A9A] uppercase tracking-wider">Pieces Analyzed</p>
              </motion.div>
            </motion.div>

            {/* Style Personality Match */}
            <motion.section className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-xl text-[#1A1A1A] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Your Style Personality
              </h2>
              <motion.div
                className="rounded-3xl bg-white border border-[#E5E5E5]/50 p-8"
                whileHover={{ boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}
              >
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Icon */}
                  <div className="w-20 h-20 rounded-2xl bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                    {analysis.personalityMatch && <analysis.personalityMatch.icon className="w-10 h-10 text-white" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {analysis.personalityMatch?.name}
                    </h3>
                    <p className="text-[#6B6B6B] mb-4">{analysis.personalityMatch?.description}</p>

                    {/* Traits */}
                    <div className="flex flex-wrap gap-2">
                      {analysis.personalityMatch?.traits.map((trait) => (
                        <span
                          key={trait}
                          className="px-4 py-2 rounded-full bg-[#F5F5F5] text-[#6B6B6B] text-sm"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div className="flex md:flex-col gap-2">
                    {analysis.personalityMatch?.colorPalette.map((color) => (
                      <div
                        key={color}
                        className="w-10 h-10 rounded-lg border border-[#E5E5E5]"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.section>

            {/* Your Color Palette */}
            <motion.section className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-xl text-[#1A1A1A] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Your Dominant Colors
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {analysis.dominantColors.map((color, i) => (
                  <motion.div
                    key={color}
                    className="flex-shrink-0 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div
                      className="w-24 h-24 rounded-2xl mb-2 border border-[#E5E5E5]"
                      style={{ backgroundColor: getColorHex(color) }}
                    />
                    <p className="text-sm font-medium text-[#1A1A1A] capitalize">{color}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* All Personalities */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h2 className="text-xl text-[#1A1A1A] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Style Archetypes
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {STYLE_PERSONALITIES.map((personality, i) => (
                  <motion.div
                    key={personality.id}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                      analysis.personalityMatch?.id === personality.id
                        ? 'border-[#1A1A1A] bg-white'
                        : 'border-[#E5E5E5] bg-white hover:border-[#9A9A9A]'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedPersonality(personality)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        analysis.personalityMatch?.id === personality.id ? 'bg-[#1A1A1A]' : 'bg-[#F5F5F5]'
                      }`}>
                        <personality.icon className={`w-6 h-6 ${
                          analysis.personalityMatch?.id === personality.id ? 'text-white' : 'text-[#6B6B6B]'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[#1A1A1A] font-medium mb-1">{personality.name}</h3>
                        <p className="text-sm text-[#9A9A9A] line-clamp-2">{personality.description}</p>
                      </div>
                    </div>
                    {analysis.personalityMatch?.id === personality.id && (
                      <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                        <span className="text-xs text-[#80163A] uppercase tracking-wider">Your Match</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </>
        ) : (
          /* Empty State */
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-8 h-8 text-[#9A9A9A]" />
            </div>
            <h2 className="text-2xl text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Add Items to Discover
            </h2>
            <p className="text-[#6B6B6B] mb-8 max-w-md mx-auto">
              Start building your wardrobe to unlock your style DNA analysis
            </p>
            <Link href="/wardrobe">
              <motion.button
                className="px-8 py-4 rounded-full bg-[#1A1A1A] text-white text-sm tracking-wider"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                GO TO WARDROBE
              </motion.button>
            </Link>
          </motion.div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E5E5E5]/50 px-6 py-3">
        <div className="flex items-center justify-around">
          {[
            { href: "/home", icon: Grid3X3, label: "Home" },
            { href: "/wardrobe", icon: Layers, label: "Wardrobe" },
            { href: "/outfits", icon: Heart, label: "Outfits" },
            { href: "/profile", icon: User, label: "Profile" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex flex-col items-center gap-1 text-[#9A9A9A]">
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

function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    'black': '#1A1A1A', 'white': '#F9F9F7', 'gray': '#6B6B6B', 'grey': '#6B6B6B',
    'navy': '#1e3a5f', 'blue': '#4A90D9', 'red': '#C44536', 'burgundy': '#80163A',
    'pink': '#E8A4B8', 'coral': '#E07A5F', 'orange': '#E07A5F', 'yellow': '#E9C46A',
    'gold': '#D4AF37', 'beige': '#E5DDD3', 'cream': '#FAF3E0', 'tan': '#C9B99A',
    'brown': '#8B5E3C', 'olive': '#606C38', 'green': '#588157', 'teal': '#2A9D8F',
    'purple': '#7B68EE', 'lavender': '#E6E6FA',
  };
  const lowerColor = colorName.toLowerCase();
  for (const [key, value] of Object.entries(colorMap)) {
    if (lowerColor.includes(key)) return value;
  }
  return '#9A9A9A';
}

export default StyleEssencePage;
