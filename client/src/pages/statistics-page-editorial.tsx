import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Shirt,
  DollarSign,
  Palette,
  Grid3X3,
  Layers,
  Heart,
  User,
  BarChart3,
  PieChart,
} from "lucide-react";

import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";

/**
 * STATISTICS PAGE - EDITORIAL ANALYTICS
 *
 * Design: Clean data visualization with minimal charts
 * Focus: Wardrobe insights and patterns
 */

const categoryColors: Record<string, string> = {
  tops: '#1A1A1A',
  bottoms: '#6B6B6B',
  dresses: '#80163A',
  outerwear: '#4A4A4A',
  shoes: '#9A9A9A',
  accessories: '#D4AF37',
  bags: '#C4C4C4',
  activewear: '#3A3A3A'
};

export function StatisticsPage() {
  const { data: wardrobeItems, isLoading: wardrobeLoading } = useWardrobeItems();
  const { data: outfits, isLoading: outfitsLoading } = useOutfits();

  const stats = useMemo(() => {
    if (!wardrobeItems) return null;

    const totalValue = wardrobeItems.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
    const totalItems = wardrobeItems.length;

    const byCategory = wardrobeItems.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const byColor = wardrobeItems.reduce((acc: Record<string, number>, item) => {
      const color = item.color || 'unknown';
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {});

    const categoryData = Object.entries(byCategory)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalItems) * 100),
        color: categoryColors[category] || '#9A9A9A'
      }))
      .sort((a, b) => b.count - a.count);

    const colorData = Object.entries(byColor)
      .map(([color, count]) => ({
        color,
        count,
        percentage: Math.round((count / totalItems) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      totalValue,
      totalItems,
      totalOutfits: outfits?.length || 0,
      categoryData,
      colorData,
      avgCostPerWear: totalItems > 0 ? Math.round(totalValue / totalItems) : 0,
      favoriteCount: wardrobeItems.filter(i => i.favorite).length,
    };
  }, [wardrobeItems, outfits]);

  if (wardrobeLoading || outfitsLoading) {
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
            <Link href="/statistics"><span className="text-xs tracking-[0.15em] uppercase text-[#1A1A1A] font-medium">Statistics</span></Link>
            <Link href="/profile"><span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Profile</span></Link>
          </div>
          <Link href="/profile"><motion.div className="w-10 h-10 rounded-full bg-[#E5E5E5] flex items-center justify-center" whileHover={{ scale: 1.05 }}><User className="w-5 h-5 text-[#6B6B6B]" /></motion.div></Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <motion.header className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-2">Insights</p>
          <h1 className="text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            Analytics
          </h1>
          <p className="text-[#6B6B6B] text-lg">Understand your wardrobe patterns</p>
        </motion.header>

        {/* Quick Stats */}
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {[
            { label: "Total Items", value: stats?.totalItems || 0, icon: Shirt, suffix: "" },
            { label: "Total Value", value: stats?.totalValue || 0, icon: DollarSign, prefix: "$" },
            { label: "Outfits", value: stats?.totalOutfits || 0, icon: Layers, suffix: "" },
            { label: "Avg. Cost", value: stats?.avgCostPerWear || 0, icon: TrendingUp, prefix: "$" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="p-6 rounded-2xl bg-white border border-[#E5E5E5]/50"
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.05)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <stat.icon className="w-5 h-5 text-[#9A9A9A] mb-3" />
              <p className="text-3xl text-[#1A1A1A] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {stat.prefix}{stat.value.toLocaleString()}{stat.suffix}
              </p>
              <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Category Breakdown */}
        <motion.section className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl text-[#1A1A1A] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Category Breakdown
          </h2>
          <div className="rounded-3xl bg-white border border-[#E5E5E5]/50 p-6">
            <div className="space-y-4">
              {stats?.categoryData.map((cat, i) => (
                <motion.div key={cat.category} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#1A1A1A] capitalize">{cat.category}</span>
                    <span className="text-sm text-[#6B6B6B]">{cat.count} items • {cat.percentage}%</span>
                  </div>
                  <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Color Palette */}
        <motion.section className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl text-[#1A1A1A] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Color Palette
          </h2>
          <div className="rounded-3xl bg-white border border-[#E5E5E5]/50 p-6">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {stats?.colorData.map((item, i) => (
                <motion.div
                  key={item.color}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div
                    className="w-full aspect-square rounded-2xl mb-2 border border-[#E5E5E5]"
                    style={{ backgroundColor: getColorHex(item.color) }}
                  />
                  <p className="text-sm font-medium text-[#1A1A1A] capitalize truncate">{item.color}</p>
                  <p className="text-xs text-[#9A9A9A]">{item.percentage}%</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Insights */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-xl text-[#1A1A1A] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Insights
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-[#1A1A1A] text-white">
              <BarChart3 className="w-6 h-6 mb-4 opacity-60" />
              <h3 className="text-lg mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Most Worn Category</h3>
              <p className="text-sm text-white/60">Your {stats?.categoryData[0]?.category || "tops"} make up {stats?.categoryData[0]?.percentage || 0}% of your wardrobe</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5]">
              <Palette className="w-6 h-6 mb-4 text-[#9A9A9A]" />
              <h3 className="text-lg text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Color Harmony</h3>
              <p className="text-sm text-[#6B6B6B]">Your wardrobe features {stats?.colorData.length || 0} primary colors with {stats?.colorData[0]?.color || "neutral"} as your signature</p>
            </div>
          </div>
        </motion.section>
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

export default StatisticsPage;
