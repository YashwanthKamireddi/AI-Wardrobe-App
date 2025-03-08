import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import NavigationBar from "@/components/navigation-bar";
import InspirationCard from "@/components/inspiration-card";
import { Inspiration } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Search, Heart, Share2, Bookmark, X, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function InspirationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedInspiration, setSelectedInspiration] = useState<Inspiration | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query with automatic background updates
  const { data: inspirations, isLoading, refetch } = useQuery<Inspiration[], Error>({
    queryKey: ["/api/inspirations"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
  });

  const handleRefresh = async () => {
    try {
      await fetch('/api/inspirations/refresh', { method: 'POST' });
      await refetch();
      toast({
        title: "Content refreshed",
        description: "New fashion inspirations have been loaded.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not load new inspirations. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const filteredInspirations = inspirations?.filter(inspiration => {
    const matchesSearch = 
      searchQuery === "" ||
      inspiration.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inspiration.description && inspiration.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inspiration.tags && inspiration.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesFilters = 
      activeFilters.length === 0 ||
      (inspiration.tags && inspiration.tags.some(tag => activeFilters.includes(tag))) ||
      (inspiration.category && activeFilters.includes(inspiration.category));

    return matchesSearch && matchesFilters;
  }) || [];

  // Extract all unique tags from inspirations
  const allTags = inspirations
    ? [...new Set(inspirations.flatMap(item => [...(item.tags || []), item.category].filter(Boolean)))]
    : [];

  const handleSave = (inspiration: Inspiration) => {
    toast({
      title: "Saved to collection",
      description: "This look has been saved to your collection.",
    });
  };

  const handleShare = (inspiration: Inspiration) => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Share link has been copied to your clipboard.",
    });
  };

  // Auto-refresh effect
  useEffect(() => {
    const autoRefresh = setInterval(handleRefresh, 30 * 60 * 1000); // Refresh every 30 minutes
    return () => clearInterval(autoRefresh);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">Fashion Inspiration</h1>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search inspirations..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              className="shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <h2 className="text-sm font-medium mb-2">Filter by tags:</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <motion.div
                key={tag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge 
                  variant={activeFilters.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleFilterClick(tag)}
                >
                  {tag}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[3/4] animate-pulse bg-muted" />
              </Card>
            ))}
          </div>
        ) : filteredInspirations.length > 0 ? (
          <motion.div 
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
            layout
          >
            {filteredInspirations.map((inspiration) => (
              <motion.div
                key={inspiration.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="break-inside-avoid"
                onClick={() => setSelectedInspiration(inspiration)}
              >
                <InspirationCard 
                  inspiration={inspiration}
                  onSave={() => handleSave(inspiration)}
                  onShare={() => handleShare(inspiration)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No inspirations found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || activeFilters.length > 0
                  ? "Try adjusting your search or filters" 
                  : "Check back later for new fashion inspirations"}
              </p>
              {(searchQuery || activeFilters.length > 0) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilters([]);
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Inspiration Detail Modal */}
        <Dialog open={!!selectedInspiration} onOpenChange={() => setSelectedInspiration(null)}>
          <DialogContent className="sm:max-w-[800px] p-0">
            {selectedInspiration && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 z-10"
                  onClick={() => setSelectedInspiration(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative aspect-square">
                    <img
                      src={selectedInspiration.imageUrl}
                      alt={selectedInspiration.title}
                      className="w-full h-full object-cover rounded-l-lg"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">{selectedInspiration.title}</h2>
                    <p className="text-muted-foreground mb-4">{selectedInspiration.description}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedInspiration.tags?.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleSave(selectedInspiration)}
                      >
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleShare(selectedInspiration)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}