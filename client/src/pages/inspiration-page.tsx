import { useState, useMemo } from "react";
import {
  Search, X, Sparkles, TrendingUp, Heart, Filter,
  Grid3x3, LayoutGrid, Star, Bookmark, ExternalLink,
  ChevronRight, Crown, Palette, Shirt, Clock, Sun
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import NavigationBar from "@/components/navigation-bar";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import InspirationCard from "@/components/inspiration-card";
import { Inspiration } from "@shared/schema";

// Brand colors
const gold = "hsl(38, 75%, 55%)";
const burgundy = "hsl(337, 73%, 26%)";
const burgundyDark = "hsl(337, 73%, 18%)";

// Featured collections - themed placeholders
const featuredCollections = [
  {
    id: 1,
    title: "Spring Essentials",
    count: 24,
    icon: Sun,
    color: "#10b981"
  },
  {
    id: 2,
    title: "Office Chic",
    count: 18,
    icon: Shirt,
    color: "#8b5cf6"
  },
  {
    id: 3,
    title: "Weekend Casual",
    count: 32,
    icon: Clock,
    color: "#f59e0b"
  },
  {
    id: 4,
    title: "Evening Elegance",
    count: 15,
    icon: Crown,
    color: burgundy
  },
];

// Trending styles - themed suggestions
const trendingStyles = [
  { name: "Quiet Luxury", desc: "Understated elegance", icon: Crown },
  { name: "Minimalist", desc: "Clean & simple", icon: Palette },
  { name: "Classic", desc: "Timeless pieces", icon: Star },
  { name: "Smart Casual", desc: "Versatile looks", icon: Shirt },
];

export function InspirationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const { toast } = useToast();

  const { data: inspirations, isLoading } = useQuery<Inspiration[], Error>({
    queryKey: ["/api/inspirations"],
  });

  const filteredInspirations = useMemo(() => {
    if (!inspirations) return [];
    return inspirations.filter(inspiration => {
      const matchesSearch =
        inspiration.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspiration.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspiration.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      if (selectedCategory === 'all') return matchesSearch;
      return matchesSearch && inspiration.category === selectedCategory;
    });
  }, [inspirations, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    if (!inspirations) return [];
    const uniqueCategories = new Set(
      inspirations.map(i => i.category).filter((c): c is string => c !== null)
    );
    return Array.from(uniqueCategories);
  }, [inspirations]);

  const handleSave = (inspiration: Inspiration) => {
    toast({
      title: "Saved to Favorites",
      description: `"${inspiration.title}" added to your collection.`,
      duration: 3000,
    });
  };

  const handleShare = async (inspiration: Inspiration) => {
    const shareUrl = `${window.location.origin}/inspirations/${inspiration.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Inspiration link copied to clipboard.",
        duration: 3000,
      });
    } catch {
      toast({
        title: "Unable to Share",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-24 md:pb-8">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${burgundy}10 0%, transparent 70%)` }} />
        <div className="absolute bottom-40 left-10 w-48 h-48 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${gold}15 0%, transparent 70%)` }} />
      </div>

      <NavigationBar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}>
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="font-serif text-3xl md:text-4xl text-slate-900">Style Inspiration</h1>
                  <p className="text-slate-400 text-sm">Discover trends and curated looks</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
                <p className="text-xl font-bold" style={{ color: burgundy }}>{inspirations?.length || 0}</p>
                <p className="text-xs text-slate-400">Inspirations</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
                <p className="text-xl font-bold" style={{ color: burgundy }}>{categories.length}</p>
                <p className="text-xs text-slate-400">Categories</p>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Collections */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5" style={{ color: gold }} />
              <h2 className="font-serif text-xl text-slate-900">Featured Collections</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-sm gap-1" style={{ color: burgundy }}>
              View All <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredCollections.map((collection) => (
              <Card key={collection.id} className="group overflow-hidden border-slate-100 bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1">
                <div className="relative aspect-[4/3] flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${collection.color}15 0%, ${collection.color}05 100%)` }}>
                  <collection.icon className="w-16 h-16 transition-transform group-hover:scale-110" style={{ color: collection.color }} />
                  <Badge
                    className="absolute top-3 right-3 rounded-full text-[10px] text-white border-0"
                    style={{ background: collection.color }}
                  >
                    Featured
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-1">{collection.title}</h3>
                  <p className="text-xs text-slate-400">{collection.count} looks</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Trending Styles */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5" style={{ color: burgundy }} />
            <h2 className="font-serif text-xl text-slate-900">Trending Now</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trendingStyles.map((style, idx) => (
              <Card key={idx} className="border-slate-100 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${burgundy}10` }}>
                      <style.icon className="w-5 h-5" style={{ color: burgundy }} />
                    </div>
                    <Badge variant="outline" className="text-[10px] border-slate-200">
                      Trending
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">{style.name}</h3>
                  <p className="text-xs text-slate-400">{style.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Search & Filters */}
        <section className="mb-8">
          <Card className="border-slate-100 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search styles, trends, looks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 rounded-full border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-300 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
                    </button>
                  )}
                </div>

                {/* Category Tabs */}
                {categories.length > 0 && (
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                    <TabsList className="bg-slate-50 border border-slate-200">
                      <TabsTrigger value="all" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        All
                      </TabsTrigger>
                      {categories.slice(0, 4).map(category => (
                        <TabsTrigger
                          key={category}
                          value={category}
                          className="text-xs capitalize data-[state=active]:bg-white data-[state=active]:shadow-sm"
                        >
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )}

                {/* View Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? '' : 'border-slate-200'}
                    style={viewMode === 'grid' ? { background: burgundy } : {}}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'masonry' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('masonry')}
                    className={viewMode === 'masonry' ? '' : 'border-slate-200'}
                    style={viewMode === 'masonry' ? { background: burgundy } : {}}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Results Info */}
        {filteredInspirations.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-3">
              <Badge variant="outline" className="border-slate-200 text-slate-600">
                Showing {filteredInspirations.length} of {inspirations?.length || 0}
              </Badge>
              {selectedCategory !== 'all' && (
                <Badge className="rounded-full capitalize" style={{ background: `${burgundy}10`, color: burgundy }}>
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-slate-500">
              <Filter className="w-3 h-3 mr-1" />
              More Filters
            </Button>
          </div>
        )}

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-slate-100 bg-white">
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredInspirations.length === 0 ? (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto border-slate-100 bg-white shadow-sm">
              <CardHeader>
                <div
                  className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center"
                  style={{ background: `${burgundy}10` }}
                >
                  <Sparkles className="h-10 w-10" style={{ color: burgundy }} />
                </div>
                <CardTitle className="font-serif text-2xl text-slate-900">
                  {inspirations?.length ? 'No Results Found' : 'Coming Soon'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500 mb-6">
                  {inspirations?.length
                    ? 'Try adjusting your search or explore different categories.'
                    : 'Our curated style inspirations will be available soon. Stay tuned!'}
                </p>
                {inspirations?.length ? (
                  <Button
                    variant="outline"
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                    className="rounded-full"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button className="rounded-full" style={{ background: burgundy }}>
                    <Bookmark className="w-4 h-4 mr-2" />
                    Get Notified
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Suggestions */}
            {!inspirations?.length && (
              <div className="mt-12 max-w-2xl mx-auto">
                <h3 className="font-serif text-xl text-slate-900 mb-6">While You Wait</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: Shirt, title: "Build Your Wardrobe", desc: "Add items to get started" },
                    { icon: Star, title: "Complete Your Profile", desc: "Set your style preferences" },
                    { icon: Palette, title: "Take Style Quiz", desc: "Discover your aesthetic" },
                  ].map((item, idx) => (
                    <Card key={idx} className="border-slate-100 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer group">
                      <CardContent className="p-4 text-center">
                        <div
                          className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                          style={{ background: `${burgundy}10` }}
                        >
                          <item.icon className="w-6 h-6" style={{ color: burgundy }} />
                        </div>
                        <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? "grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6"
          }>
            {filteredInspirations.map((inspiration) => (
              <div key={inspiration.id} className={viewMode === 'masonry' ? 'break-inside-avoid' : ''}>
                <InspirationCard
                  inspiration={inspiration}
                  onSave={() => handleSave(inspiration)}
                  onShare={() => handleShare(inspiration)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredInspirations.length > 0 && filteredInspirations.length >= 8 && (
          <div className="text-center mt-12">
            <Button variant="outline" className="rounded-full px-8 border-slate-200 hover:border-slate-300">
              Load More Inspiration
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
