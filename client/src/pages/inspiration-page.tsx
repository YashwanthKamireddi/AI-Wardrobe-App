import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, BookmarkPlus, Share2 } from "lucide-react";
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
      description: `"${inspiration.title}" has been added to your inspiration collection.`,
      duration: 3000,
    });
  };

  const handleShare = async (inspiration: Inspiration) => {
    const shareUrl = `${window.location.origin}/inspirations/${inspiration.id}`;
    const shareData = {
      title: inspiration.title,
      text: inspiration.description || `Check out this fashion inspiration: ${inspiration.title}`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Shared Successfully",
          description: "Inspiration shared via your device.",
          duration: 3000,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Inspiration link copied to clipboard.",
          duration: 3000,
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Inspiration link copied to clipboard.",
          duration: 3000,
        });
      } catch (clipboardError) {
        toast({
          title: "Unable to Share",
          description: "Please copy the link manually from the address bar.",
          variant: "destructive",
          duration: 4000,
        });
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-amber-50/20">
      <NavigationBar />

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-fashion-heading text-foreground flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-amber-500" />
              Fashion Runway
            </h1>
            <p className="text-muted-foreground font-fashion-body mt-1">
              Discover style inspiration and trending looks
            </p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
            <Input
              data-testid="input-search"
              placeholder="Search inspiration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-amber-200 focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-amber-500" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    data-testid={`tab-${category}`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>
        )}

        {/* Stats */}
        {inspirations && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 flex-wrap"
          >
            <Badge variant="outline" className="border-amber-300 text-amber-800 px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Total Inspirations: {inspirations.length}
            </Badge>
            <Badge variant="outline" className="border-amber-300 text-amber-800 px-3 py-1">
              Showing: {filteredInspirations.length}
            </Badge>
          </motion.div>
        )}

        {/* Inspirations Grid */}
        {isLoading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredInspirations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Card className="max-w-md mx-auto border-amber-200">
              <CardHeader>
                <CardTitle className="font-fashion-heading text-amber-900">
                  {inspirations && inspirations.length > 0 ? 'No Inspirations Found' : 'No Inspirations Yet'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-fashion-body mb-4">
                  {inspirations && inspirations.length > 0
                    ? 'Try adjusting your search query or category filter.'
                    : 'Check back soon for fashion inspiration and style guides.'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            data-testid="inspirations-grid"
          >
            <AnimatePresence mode="popLayout">
              {filteredInspirations.map((inspiration) => (
                <motion.div
                  key={inspiration.id}
                  variants={itemVariants}
                  layout
                  data-testid={`inspiration-${inspiration.id}`}
                >
                  <InspirationCard
                    inspiration={inspiration}
                    onSave={() => handleSave(inspiration)}
                    onShare={() => handleShare(inspiration)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Helper Text */}
        {inspirations && inspirations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm text-muted-foreground font-fashion-body"
          >
            <p>
              Hover over images to save or share inspiration
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
