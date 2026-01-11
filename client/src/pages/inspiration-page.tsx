import { useState, useMemo } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import NavigationBar from "@/components/navigation-bar";
import InspirationCard from "@/components/inspiration-card";
import { Inspiration } from "@shared/schema";

export function InspirationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-primary/[0.03] to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-secondary/30 to-transparent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <NavigationBar />

      <main className="relative max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <header className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground">Inspiration</h1>
          </div>
          <p className="text-muted-foreground text-lg">Discover style inspiration and trending looks</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-primary/40 to-transparent" />
            <Sparkles className="w-4 h-4 text-primary/40" />
          </div>
        </header>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inspiration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 border-primary/20 focus:border-primary bg-card/50 rounded-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <div className="mb-8">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="bg-card/50 border border-primary/10">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All</TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger key={category} value={category} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Stats */}
        {inspirations && (
          <div className="flex gap-3 mb-8">
            <Badge variant="outline" className="border-primary/30 text-primary">
              Total: {inspirations.length}
            </Badge>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Showing: {filteredInspirations.length}
            </Badge>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-primary/10 bg-card/50 backdrop-blur-sm">
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
            <Card className="max-w-md mx-auto border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary/60" />
                </div>
                <CardTitle className="font-serif text-xl">
                  {inspirations?.length ? 'No Results Found' : 'No Inspirations Yet'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {inspirations?.length
                    ? 'Try adjusting your search or category filter.'
                    : 'Check back soon for fashion inspiration.'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredInspirations.map((inspiration) => (
              <InspirationCard
                key={inspiration.id}
                inspiration={inspiration}
                onSave={() => handleSave(inspiration)}
                onShare={() => handleShare(inspiration)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
