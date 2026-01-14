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
  ChevronRight,
  Shirt,
  ArrowRight,
  Zap,
  Target,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { Link } from "wouter";

const burgundy = "hsl(337, 73%, 26%)";
const burgundyDark = "hsl(337, 73%, 18%)";
const gold = "hsl(38, 75%, 55%)";

// Style archetypes
const styleArchetypes = [
  { name: "Classic", description: "Timeless, elegant pieces that never go out of style", icon: Crown },
  { name: "Minimalist", description: "Clean lines, neutral colors, and effortless simplicity", icon: Target },
  { name: "Trendy", description: "Fashion-forward, always on top of the latest trends", icon: TrendingUp },
  { name: "Bohemian", description: "Free-spirited with natural fabrics and earthy tones", icon: Star },
  { name: "Edgy", description: "Bold, unconventional choices that make a statement", icon: Zap },
  { name: "Romantic", description: "Soft, feminine details with delicate fabrics", icon: Heart },
];

// Color harmony analysis
function analyzeColorHarmony(colors: string[]): { harmony: string; score: number; description: string } {
  const uniqueColors = [...new Set(colors.filter(Boolean))];

  if (uniqueColors.length <= 3) {
    return { harmony: "Monochromatic", score: 95, description: "Your wardrobe focuses on a refined palette, creating a cohesive and sophisticated look." };
  } else if (uniqueColors.length <= 6) {
    return { harmony: "Analogous", score: 85, description: "Your colors flow naturally together, suggesting a harmonious and intentional style." };
  } else if (uniqueColors.length <= 10) {
    return { harmony: "Complementary", score: 75, description: "You embrace color diversity while maintaining balance in your wardrobe." };
  }
  return { harmony: "Eclectic", score: 65, description: "Your colorful wardrobe shows creativity and willingness to experiment!" };
}

// Calculate style score based on wardrobe metrics
function calculateStyleScore(items: any[], outfits: any[]): number {
  if (!items.length) return 0;

  const categoryVariety = new Set(items.map(i => i.category)).size;
  const colorVariety = new Set(items.filter(i => i.color).map(i => i.color)).size;
  const outfitRatio = outfits.length / Math.max(items.length / 3, 1);
  const favoriteRatio = items.filter(i => i.favorite).length / items.length;

  const varietyScore = Math.min(categoryVariety / 6, 1) * 30;
  const colorScore = Math.min(colorVariety / 8, 1) * 25;
  const outfitScore = Math.min(outfitRatio, 1) * 25;
  const favScore = favoriteRatio * 20;

  return Math.round(varietyScore + colorScore + outfitScore + favScore);
}

// Determine dominant style archetype
function determineStyleArchetype(items: any[]): typeof styleArchetypes[0] {
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

  if (neutralRatio > 0.7) return styleArchetypes[1]; // Minimalist
  if (boldRatio > 0.4) return styleArchetypes[4]; // Edgy
  if (categories.filter(c => c === 'dresses').length > items.length * 0.3) return styleArchetypes[5]; // Romantic

  return styleArchetypes[0]; // Classic (default)
}

export function StyleDNAPage() {
  const { data: wardrobeItems, isLoading: wardrobeLoading } = useWardrobeItems();
  const { data: outfits, isLoading: outfitsLoading } = useOutfits();
  const [refreshing, setRefreshing] = useState(false);

  const isLoading = wardrobeLoading || outfitsLoading;

  const analysis = useMemo(() => {
    if (!wardrobeItems || !outfits) return null;

    const colors = wardrobeItems.map(item => item.color).filter(Boolean) as string[];
    const colorHarmony = analyzeColorHarmony(colors);
    const styleScore = calculateStyleScore(wardrobeItems, outfits);
    const archetype = determineStyleArchetype(wardrobeItems);

    // Calculate color distribution
    const colorCounts = colors.reduce((acc: Record<string, number>, color) => {
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {});

    const topColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color, count]) => ({ color, count, percentage: Math.round((count / colors.length) * 100) }));

    // Category analysis
    const categoryCounts = wardrobeItems.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([category, count]) => ({ category, count, percentage: Math.round((count / wardrobeItems.length) * 100) }));

    // Style tips based on analysis
    const tips = [];
    if (topColors.length > 0 && topColors[0].percentage > 40) {
      tips.push(`You love ${topColors[0].color}! Try adding complementary colors to create more variety.`);
    }
    if (categoryCounts['bottoms'] > categoryCounts['tops']) {
      tips.push("You have more bottoms than tops. Consider adding more versatile top options.");
    }
    if (wardrobeItems.filter(i => i.favorite).length < 5) {
      tips.push("Mark your favorite pieces to help our AI create better outfit recommendations.");
    }

    return {
      colorHarmony,
      styleScore,
      archetype,
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
    // Simulate analysis refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <NavigationBar />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="grid gap-6">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!wardrobeItems?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
        <NavigationBar />
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div
            className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${burgundy}15, ${gold}10)` }}
          >
            <Sparkles className="w-10 h-10" style={{ color: burgundy }} />
          </div>
          <h1 className="font-serif text-3xl text-slate-900 mb-3">Discover Your Style DNA</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Add items to your wardrobe to unlock personalized style analysis, color harmony insights, and AI-powered fashion recommendations.
          </p>
          <Link href="/wardrobe">
            <Button
              className="rounded-full px-8 h-12"
              style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
            >
              Start Building Your Wardrobe
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24 md:pb-8">
      <NavigationBar />

      <main className="max-w-4xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" style={{ color: gold }} />
              <span className="text-sm uppercase tracking-wider text-slate-400">Personal Analysis</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-slate-900 mb-2">Your Style DNA</h1>
            <p className="text-slate-500">AI-powered insights into your unique fashion identity</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {analysis && (
          <div className="space-y-6">
            {/* Style Score Hero Card */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <div
                className="p-8"
                style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Score Circle */}
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full bg-white/10 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-5xl font-bold text-white">{analysis.styleScore}</span>
                          <p className="text-white/60 text-sm">Style Score</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: gold }}
                    >
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Archetype Info */}
                  <div className="flex-1 text-center md:text-left">
                    <Badge className="mb-3 bg-white/10 text-white hover:bg-white/20">
                      <analysis.archetype.icon className="w-3 h-3 mr-1" />
                      Your Style Archetype
                    </Badge>
                    <h2 className="font-serif text-3xl text-white mb-2">{analysis.archetype.name}</h2>
                    <p className="text-white/70 leading-relaxed">{analysis.archetype.description}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Color Harmony Analysis */}
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${burgundy}10` }}
                  >
                    <Palette className="w-5 h-5" style={{ color: burgundy }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Color Harmony</h3>
                    <p className="text-sm text-slate-500">Your wardrobe color palette analysis</p>
                  </div>
                  <Badge className="ml-auto" style={{ background: `${gold}20`, color: burgundy }}>
                    {analysis.colorHarmony.harmony}
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Harmony Score</span>
                    <span className="text-sm font-semibold" style={{ color: burgundy }}>{analysis.colorHarmony.score}%</span>
                  </div>
                  <Progress value={analysis.colorHarmony.score} className="h-2" />
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{analysis.colorHarmony.description}</p>

                {/* Top Colors */}
                <div className="mt-6">
                  <p className="text-sm font-medium text-slate-700 mb-3">Your Top Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.topColors.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-50 border border-slate-100"
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-slate-200"
                          style={{ background: getColorHex(item.color) }}
                        />
                        <span className="text-sm text-slate-700 capitalize">{item.color}</span>
                        <span className="text-xs text-slate-400">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wardrobe Composition */}
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${burgundy}10` }}
                  >
                    <Layers className="w-5 h-5" style={{ color: burgundy }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Wardrobe Composition</h3>
                    <p className="text-sm text-slate-500">How your wardrobe is distributed</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {analysis.topCategories.map((cat, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600 capitalize">{cat.category}</span>
                        <span className="text-sm text-slate-400">{cat.count} items ({cat.percentage}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${cat.percentage}%`,
                            background: `linear-gradient(90deg, ${burgundy}, ${gold})`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{analysis.totalItems}</p>
                    <p className="text-xs text-slate-500">Total Items</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{analysis.totalOutfits}</p>
                    <p className="text-xs text-slate-500">Outfits Created</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{analysis.favoriteCount}</p>
                    <p className="text-xs text-slate-500">Favorites</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Style Tips */}
            {analysis.tips.length > 0 && (
              <Card className="border-slate-100 shadow-sm overflow-hidden">
                <div
                  className="p-1"
                  style={{ background: `linear-gradient(90deg, ${burgundy}10, ${gold}10)` }}
                >
                  <CardContent className="bg-white rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${gold}20` }}
                      >
                        <Eye className="w-5 h-5" style={{ color: burgundy }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">Personalized Tips</h3>
                        <p className="text-sm text-slate-500">AI-generated recommendations for your style</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {analysis.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-700">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </Card>
            )}

            {/* Style Archetypes */}
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${burgundy}10` }}
                  >
                    <Star className="w-5 h-5" style={{ color: burgundy }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">All Style Archetypes</h3>
                    <p className="text-sm text-slate-500">Discover different fashion personalities</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {styleArchetypes.map((archetype, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        archetype.name === analysis.archetype.name
                          ? 'border-current bg-slate-50'
                          : 'border-transparent bg-slate-50/50 hover:bg-slate-50'
                      }`}
                      style={archetype.name === analysis.archetype.name ? { borderColor: burgundy } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            background: archetype.name === analysis.archetype.name ? `${burgundy}15` : 'white'
                          }}
                        >
                          <archetype.icon
                            className="w-5 h-5"
                            style={{
                              color: archetype.name === analysis.archetype.name ? burgundy : '#94a3b8'
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{archetype.name}</p>
                          <p className="text-xs text-slate-500">{archetype.description}</p>
                        </div>
                        {archetype.name === analysis.archetype.name && (
                          <Badge className="ml-auto" style={{ background: burgundy }}>You</Badge>
                        )}
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

// Helper function to convert color names to hex (basic implementation)
function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    'black': '#1f2937',
    'white': '#f8fafc',
    'gray': '#6b7280',
    'grey': '#6b7280',
    'navy': '#1e3a5f',
    'blue': '#3b82f6',
    'red': '#ef4444',
    'burgundy': '#722f37',
    'maroon': '#800000',
    'pink': '#ec4899',
    'coral': '#f87171',
    'orange': '#f97316',
    'yellow': '#eab308',
    'gold': '#d4af37',
    'beige': '#d4c5b0',
    'cream': '#fffdd0',
    'tan': '#d2b48c',
    'brown': '#92400e',
    'olive': '#6b7f4c',
    'green': '#22c55e',
    'teal': '#14b8a6',
    'purple': '#a855f7',
    'lavender': '#e9d5ff',
  };

  const lowerColor = colorName.toLowerCase();
  for (const [key, value] of Object.entries(colorMap)) {
    if (lowerColor.includes(key)) return value;
  }
  return '#94a3b8'; // Default gray
}
