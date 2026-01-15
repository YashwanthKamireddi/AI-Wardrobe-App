import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Shirt,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  Sparkles,
  Star,
  Clock,
  Award,
  Target,
  Palette,
  ShoppingBag,
  Heart,
  AlertTriangle,
  Trophy
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import NavigationBar from "@/components/navigation-bar";
import CPWAnalytics from "@/components/cpw-analytics";
import { GamificationBadges, getMockGamificationStats } from "@/components/gamification-badges";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";

// Brand colors
const gold = "hsl(38, 75%, 55%)";
const burgundy = "hsl(337, 73%, 26%)";
const burgundyDark = "hsl(337, 73%, 18%)";

// API fetch for statistics
async function fetchStatistics() {
  const response = await fetch('/api/statistics', {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch statistics');
  return response.json();
}

// API fetch for wardrobe gaps
async function fetchWardrobeGaps() {
  const response = await fetch('/api/wardrobe-gaps', {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch wardrobe gaps');
  return response.json();
}

// Color mapping
const categoryColors: Record<string, string> = {
  tops: '#ef4444',
  bottoms: '#3b82f6',
  dresses: '#ec4899',
  outerwear: '#f97316',
  shoes: '#8b5cf6',
  accessories: '#14b8a6',
  bags: '#f59e0b',
  activewear: '#10b981'
};

export function StatisticsPage() {
  const { data: wardrobeItems } = useWardrobeItems();
  const { data: outfits } = useOutfits();

  // Mock gamification stats (in production, this would come from API)
  const gamificationStats = getMockGamificationStats();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['statistics'],
    queryFn: fetchStatistics
  });

  const { data: gaps, isLoading: gapsLoading } = useQuery({
    queryKey: ['wardrobe-gaps'],
    queryFn: fetchWardrobeGaps
  });

  // Calculate additional stats from wardrobe items
  const localStats = {
    totalValue: wardrobeItems?.reduce((sum, item) => sum + (item.purchasePrice || 0), 0) || 0,
    totalItems: wardrobeItems?.length || 0,
    byCategory: wardrobeItems?.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {}) || {},
    byColor: wardrobeItems?.reduce((acc: Record<string, number>, item) => {
      const color = item.color || 'unknown';
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {}) || {}
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf9]">
        <NavigationBar />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Skeleton className="h-12 w-64 mb-8 rounded-2xl" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-[24px]" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Skeleton className="h-72 rounded-[24px]" />
            <Skeleton className="h-72 rounded-[24px]" />
          </div>
        </div>
      </div>
    );
  }

  // Calculate percentages for category breakdown
  const categoryData = Object.entries(localStats.byCategory).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / localStats.totalItems) * 100),
    color: categoryColors[category] || '#94a3b8'
  })).sort((a, b) => b.count - a.count);

  // Get top colors
  const colorData = Object.entries(localStats.byColor).map(([color, count]) => ({
    color,
    count,
    percentage: Math.round((count / localStats.totalItems) * 100)
  })).sort((a, b) => b.count - a.count).slice(0, 8);

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24 md:pb-8">
      <NavigationBar />

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-4">
            <BarChart3 className="w-4 h-4" style={{ color: gold }} />
            <span className="text-sm font-medium text-slate-600">Fashion Insights</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-2">Analytics</h1>
          <p className="text-slate-500 text-lg">Understand your wardrobe patterns and trends</p>
        </header>

        {/* Quick Stats Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Items */}
          <Card className="border-0 shadow-lg overflow-hidden rounded-[24px]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 mb-2">Total Items</p>
                  <p className="text-4xl font-bold text-slate-900">{localStats.totalItems}</p>
                  <p className="text-sm text-emerald-600 flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4" />
                    Growing wardrobe
                  </p>
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: `${burgundy}10` }}
                >
                  <Shirt className="w-7 h-7" style={{ color: burgundy }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Value */}
          <Card className="border-0 shadow-lg overflow-hidden rounded-[24px]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 mb-2">Total Value</p>
                  <p className="text-3xl font-bold text-slate-900">
                    ${localStats.totalValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Avg ${localStats.totalItems > 0 ? Math.round(localStats.totalValue / localStats.totalItems) : 0}/item
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${gold}20` }}
                >
                  <DollarSign className="w-6 h-6" style={{ color: gold }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="border-0 shadow-lg overflow-hidden rounded-[24px]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 mb-2">Categories</p>
                  <p className="text-4xl font-bold text-slate-900">{Object.keys(localStats.byCategory).length}</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Active categories
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-purple-50">
                  <PieChart className="w-7 h-7 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wardrobe Score */}
          <Card className="border-0 shadow-lg overflow-hidden rounded-[24px]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 mb-2">Wardrobe Score</p>
                  <p className="text-4xl font-bold text-slate-900">{gaps?.overallScore || 75}%</p>
                  <p className="text-sm text-emerald-600 flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4" />
                    Well-balanced
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50">
                  <Award className="w-7 h-7 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Breakdown */}
          <Card className="border-0 shadow-xl rounded-[24px]">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <PieChart className="w-5 h-5" style={{ color: burgundy }} />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.map(({ category, count, percentage, color }) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-medium text-slate-700 capitalize">
                          {category}
                        </span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {count} items ({percentage}%)
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-2"
                      style={{
                        background: '#e2e8f0',
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Color Palette */}
          <Card className="border-0 shadow-xl rounded-[24px]">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Palette className="w-5 h-5" style={{ color: burgundy }} />
                Your Color Palette
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {colorData.map(({ color, count, percentage }) => (
                  <div
                    key={color}
                    className="flex flex-col items-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded-full mb-2 shadow-sm border-2 border-white"
                      style={{
                        backgroundColor: color.toLowerCase() === 'white' ? '#f8fafc' :
                                        color.toLowerCase() === 'black' ? '#1e293b' :
                                        color.toLowerCase() === 'navy' ? '#1e3a5f' :
                                        color.toLowerCase() === 'beige' ? '#d4c5a9' :
                                        color.toLowerCase() === 'cream' ? '#fffdd0' :
                                        color.toLowerCase()
                      }}
                    />
                    <span className="text-sm font-medium text-slate-700 capitalize">{color}</span>
                    <span className="text-xs text-slate-400">{count} items</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Wardrobe Gaps */}
          {gaps && (
            <Card className="border-0 shadow-xl rounded-[24px]">
              <CardHeader className="pb-2">
                <CardTitle className="font-serif text-xl flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: burgundy }} />
                  Wardrobe Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gaps.categoryGaps?.length > 0 ? (
                  <div className="space-y-3">
                    {gaps.categoryGaps.map((gap: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100"
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 capitalize">
                              {gap.category}
                            </p>
                            <p className="text-xs text-slate-500">
                              Consider adding more items
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-amber-600 border-amber-200">
                          {gap.currentCount} items
                        </Badge>
                      </div>
                    ))}
                    {gaps.colorSuggestion && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <div className="flex items-center gap-3">
                          <Palette className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              Add more colors
                            </p>
                            <p className="text-xs text-slate-500">
                              Try {gaps.colorSuggestion}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                    <p className="font-medium text-slate-900">Your wardrobe is well-balanced!</p>
                    <p className="text-sm text-slate-500">No significant gaps detected</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Full CPW Analytics Section */}
        <section className="mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
            <DollarSign className="w-4 h-4" style={{ color: burgundy }} />
            <span className="text-sm font-medium text-slate-600">Cost Per Wear Analysis</span>
          </div>
          <CPWAnalytics
            wardrobeItems={wardrobeItems || []}
            outfits={outfits || []}
            compact={false}
          />
        </section>

        {/* Gamification & Achievements */}
        <section className="mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
            <Trophy className="w-4 h-4" style={{ color: gold }} />
            <span className="text-sm font-medium text-slate-600">Style Achievements</span>
          </div>
          <GamificationBadges stats={gamificationStats} compact={false} />
        </section>

        {/* Style Insights */}
        <Card className="border-0 shadow-xl rounded-[24px] mt-8">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: gold }} />
              Style Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
                <p className="text-sm font-medium text-slate-600 mb-2">Dominant Style</p>
                <p className="font-serif text-2xl text-slate-900">
                  {categoryData[0]?.category === 'dresses' ? 'Feminine' :
                   categoryData[0]?.category === 'activewear' ? 'Sporty' :
                   categoryData[0]?.category === 'outerwear' ? 'Layered' :
                   'Classic'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                <p className="text-sm font-medium text-slate-600 mb-2">Color Preference</p>
                <p className="font-serif text-2xl text-slate-900 capitalize">
                  {colorData[0]?.color || 'Neutral'} Palette
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100">
                <p className="text-sm font-medium text-slate-600 mb-2">Versatility</p>
                <p className="font-serif text-2xl text-slate-900">
                  {localStats.totalItems > 20 ? 'Highly Versatile' :
                   localStats.totalItems > 10 ? 'Growing' : 'Building'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
