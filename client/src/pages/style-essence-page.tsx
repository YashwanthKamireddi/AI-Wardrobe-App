import { useState, useMemo } from "react";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";
import NavigationBar from "@/components/navigation-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Palette,
  Sparkles,
  TrendingUp,
  Star,
  Heart,
  Crown,
  Eye,
  Layers,
  Shirt,
  ArrowRight,
  Zap,
  Target,
  RefreshCw,
  CheckCircle,
  Gem,
  Sun,
  Moon,
} from "lucide-react";
import { Link } from "wouter";

const burgundy = "hsl(337, 73%, 26%)";
const burgundyDark = "hsl(337, 73%, 18%)";
const gold = "hsl(38, 75%, 55%)";

// Style personalities (original naming)
const stylePersonalities = [
  { name: "The Curator", description: "You collect timeless, elegant pieces with intention", icon: Crown, color: "#8b5cf6" },
  { name: "The Purist", description: "Clean lines, neutral tones, understated elegance", icon: Target, color: "#64748b" },
  { name: "The Visionary", description: "Fashion-forward, always ahead of the curve", icon: TrendingUp, color: "#ec4899" },
  { name: "The Free Spirit", description: "Natural fabrics, earthy tones, effortless flow", icon: Sun, color: "#f59e0b" },
  { name: "The Maverick", description: "Bold choices that challenge conventions", icon: Zap, color: "#ef4444" },
  { name: "The Dreamer", description: "Soft textures, delicate details, romantic silhouettes", icon: Heart, color: "#f472b6" },
];

function analyzeColorHarmony(colors: string[]): { harmony: string; score: number; description: string } {
  const uniqueColors = [...new Set(colors.filter(Boolean))];

  if (uniqueColors.length <= 3) {
    return { harmony: "Focused", score: 95, description: "A refined palette creating cohesive, sophisticated looks." };
  } else if (uniqueColors.length <= 6) {
    return { harmony: "Balanced", score: 85, description: "Colors flow naturally together with intentional harmony." };
  } else if (uniqueColors.length <= 10) {
    return { harmony: "Diverse", score: 75, description: "You embrace color variety while maintaining balance." };
  }
  return { harmony: "Expressive", score: 65, description: "A colorful wardrobe showing creativity and experimentation." };
}

function calculateStyleScore(items: any[], outfits: any[]): number {
  if (!items.length) return 0;

  const categoryVariety = new Set(items.map(i => i.category)).size;
  const colorVariety = new Set(items.filter(i => i.color).map(i => i.color)).size;
  const outfitRatio = outfits.length / Math.max(items.length / 3, 1);
  const favoriteRatio = items.filter(i => i.favorite).length / items.length;

  return Math.round(
    Math.min(categoryVariety / 6, 1) * 30 +
    Math.min(colorVariety / 8, 1) * 25 +
    Math.min(outfitRatio, 1) * 25 +
    favoriteRatio * 20
  );
}

function determineStylePersonality(items: any[]): typeof stylePersonalities[0] {
  const colors = items.map(i => i.color?.toLowerCase()).filter(Boolean);
  const categories = items.map(i => i.category);

  const neutralCount = colors.filter(c =>
    c?.includes('white') || c?.includes('black') || c?.includes('gray') || c?.includes('beige') || c?.includes('cream')
  ).length;

  const boldCount = colors.filter(c =>
    c?.includes('red') || c?.includes('yellow') || c?.includes('orange') || c?.includes('pink')
  ).length;

  const neutralRatio = neutralCount / Math.max(colors.length, 1);
  const boldRatio = boldCount / Math.max(colors.length, 1);

  if (neutralRatio > 0.7) return stylePersonalities[1]; // The Purist
  if (boldRatio > 0.4) return stylePersonalities[4]; // The Maverick
  if (categories.filter(c => c === 'dresses').length > items.length * 0.3) return stylePersonalities[5]; // The Dreamer

  return stylePersonalities[0]; // The Curator (default)
}

function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    'black': '#1f2937', 'white': '#f8fafc', 'gray': '#6b7280', 'grey': '#6b7280',
    'navy': '#1e3a5f', 'blue': '#3b82f6', 'red': '#ef4444', 'burgundy': '#722f37',
    'pink': '#ec4899', 'coral': '#f87171', 'orange': '#f97316', 'yellow': '#eab308',
    'gold': '#d4af37', 'beige': '#d4c5b0', 'cream': '#fffdd0', 'tan': '#d2b48c',
    'brown': '#92400e', 'olive': '#6b7f4c', 'green': '#22c55e', 'teal': '#14b8a6',
    'purple': '#a855f7', 'lavender': '#e9d5ff',
  };

  const lowerColor = colorName.toLowerCase();
  for (const [key, value] of Object.entries(colorMap)) {
    if (lowerColor.includes(key)) return value;
  }
  return '#94a3b8';
}

export function StyleEssencePage() {
  const { data: wardrobeItems, isLoading: wardrobeLoading } = useWardrobeItems();
  const { data: outfits, isLoading: outfitsLoading } = useOutfits();
  const [refreshing, setRefreshing] = useState(false);

  const isLoading = wardrobeLoading || outfitsLoading;

  const analysis = useMemo(() => {
    if (!wardrobeItems || !outfits) return null;

    const colors = wardrobeItems.map(item => item.color).filter(Boolean) as string[];
    const colorHarmony = analyzeColorHarmony(colors);
    const styleScore = calculateStyleScore(wardrobeItems, outfits);
    const personality = determineStylePersonality(wardrobeItems);

    const colorCounts = colors.reduce((acc: Record<string, number>, color) => {
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {});

    const topColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color, count]) => ({ color, count, percentage: Math.round((count / colors.length) * 100) }));

    const categoryCounts = wardrobeItems.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([category, count]) => ({ category, count, percentage: Math.round((count / wardrobeItems.length) * 100) }));

    const tips = [];
    if (topColors.length > 0 && topColors[0].percentage > 40) {
      tips.push(`You gravitate towards ${topColors[0].color}. Consider exploring complementary shades.`);
    }
    if (categoryCounts['bottoms'] > categoryCounts['tops']) {
      tips.push("Your collection has more bottoms than tops. Versatile tops could expand your options.");
    }
    if (wardrobeItems.filter(i => i.favorite).length < 5) {
      tips.push("Mark your favorites to help us understand your preferences better.");
    }

    return {
      colorHarmony,
      styleScore,
      personality,
      topColors,
      topCategories,
      tips,
      totalItems: wardrobeItems.length,
      totalOutfits: outfits.length,
      favoriteCount: wardrobeItems.filter(i => i.favorite).length,
    };
  }, [wardrobeItems, outfits]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf9]">
        <NavigationBar />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="grid gap-6">
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!wardrobeItems?.length) {
    return (
      <div className="min-h-screen bg-[#fafaf9] pb-24">
        <NavigationBar />
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="w-24 h-24 rounded-[32px] mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 shadow-lg">
            <Gem className="w-12 h-12 text-slate-400" />
          </div>
          <h1 className="font-serif text-4xl text-slate-900 mb-4">Discover Your Style</h1>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed">
            Add items to your wardrobe to unlock personalized insights about your unique fashion identity.
          </p>
          <Link href="/wardrobe">
            <Button
              size="lg"
              className="rounded-full px-10 h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
            >
              Build Your Wardrobe
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24 md:pb-8">
      <NavigationBar />

      <main className="max-w-4xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-4">
              <Sparkles className="w-4 h-4" style={{ color: gold }} />
              <span className="text-sm font-medium text-slate-600">AI Analysis</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-2">Your Style Essence</h1>
            <p className="text-slate-500 text-lg">Insights into your unique fashion identity</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-2 border-slate-200 hover:bg-white"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {analysis && (
          <div className="space-y-6">
            {/* Style Score Hero */}
            <div className="relative overflow-hidden rounded-[32px] shadow-xl">
              <div
                className="p-8 md:p-12"
                style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
              >
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

                <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  {/* Score Circle */}
                  <div className="relative flex-shrink-0">
                    <svg className="w-44 h-44" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="45" fill="none" stroke={gold} strokeWidth="8"
                        strokeLinecap="round" strokeDasharray={`${analysis.styleScore * 2.83} 283`}
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-white">{analysis.styleScore}</span>
                      <span className="text-white/60 text-sm">Style Score</span>
                    </div>
                  </div>

                  {/* Personality Info */}
                  <div className="flex-1 text-center md:text-left">
                    <Badge className="mb-4 bg-white/10 text-white hover:bg-white/20 rounded-full px-4 py-1">
                      <analysis.personality.icon className="w-3.5 h-3.5 mr-1.5" />
                      Your Style Personality
                    </Badge>
                    <h2 className="font-serif text-4xl text-white mb-3">{analysis.personality.name}</h2>
                    <p className="text-white/70 text-lg leading-relaxed max-w-md">{analysis.personality.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Palette */}
            <Card className="border-0 shadow-lg rounded-[24px] overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
                    <Palette className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Color Palette</h3>
                    <p className="text-slate-500">Your wardrobe's color identity</p>
                  </div>
                  <Badge className="ml-auto rounded-full px-4" style={{ background: `${burgundy}10`, color: burgundy }}>
                    {analysis.colorHarmony.harmony}
                  </Badge>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-600">Harmony Score</span>
                    <span className="text-sm font-semibold" style={{ color: burgundy }}>{analysis.colorHarmony.score}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${analysis.colorHarmony.score}%`,
                        background: `linear-gradient(90deg, ${burgundy}, ${gold})`
                      }}
                    />
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed mb-8">{analysis.colorHarmony.description}</p>

                {/* Color swatches */}
                <div className="flex flex-wrap gap-3">
                  {analysis.topColors.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                      <div
                        className="w-8 h-8 rounded-xl shadow-inner border border-white/50"
                        style={{ background: getColorHex(item.color) }}
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-700 capitalize block">{item.color}</span>
                        <span className="text-xs text-slate-400">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wardrobe Breakdown */}
            <Card className="border-0 shadow-lg rounded-[24px] overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
                    <Layers className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Wardrobe Breakdown</h3>
                    <p className="text-slate-500">How your collection is distributed</p>
                  </div>
                </div>

                <div className="space-y-5 mb-8">
                  {analysis.topCategories.map((cat, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 capitalize">{cat.category}</span>
                        <span className="text-sm text-slate-400">{cat.count} items</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${cat.percentage}%`,
                            background: `linear-gradient(90deg, ${burgundy}, ${gold})`,
                            transitionDelay: `${i * 100}ms`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                  {[
                    { label: "Total Items", value: analysis.totalItems, icon: Shirt },
                    { label: "Outfits", value: analysis.totalOutfits, icon: Layers },
                    { label: "Favorites", value: analysis.favoriteCount, icon: Heart },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-2">
                        <stat.icon className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Style Tips */}
            {analysis.tips.length > 0 && (
              <Card className="border-0 shadow-lg rounded-[24px] overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm">
                      <Eye className="w-6 h-6" style={{ color: gold }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">Style Insights</h3>
                      <p className="text-slate-500">Personalized recommendations for you</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {analysis.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-slate-700 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Personalities */}
            <Card className="border-0 shadow-lg rounded-[24px] overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50">
                    <Star className="w-6 h-6 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Style Personalities</h3>
                    <p className="text-slate-500">Discover different fashion identities</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {stylePersonalities.map((p, i) => (
                    <div
                      key={i}
                      className={`p-5 rounded-2xl border-2 transition-all ${
                        p.name === analysis.personality.name
                          ? 'bg-slate-50 shadow-sm'
                          : 'bg-white border-transparent hover:border-slate-200'
                      }`}
                      style={p.name === analysis.personality.name ? { borderColor: burgundy } : {}}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: `${p.color}15` }}
                        >
                          <p.icon className="w-6 h-6" style={{ color: p.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900">{p.name}</p>
                            {p.name === analysis.personality.name && (
                              <Badge className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: burgundy }}>You</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 truncate">{p.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
