import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NavigationBar from "@/components/navigation-bar";
import InspirationCard from "@/components/inspiration-card";
import { Inspiration } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InspirationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const { data: inspirations, isLoading } = useQuery<Inspiration[], Error>({
    queryKey: ["/api/inspirations"],
  });
  
  const handleFilterClick = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };
  
  const filteredInspirations = inspirations?.filter(inspiration => {
    // Filter by search query
    const matchesSearch = 
      searchQuery === "" ||
      inspiration.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inspiration.description && inspiration.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inspiration.tags && inspiration.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    // Filter by active filters
    const matchesFilters = 
      activeFilters.length === 0 ||
      (inspiration.tags && inspiration.tags.some(tag => activeFilters.includes(tag))) ||
      activeFilters.includes(inspiration.category);
    
    return matchesSearch && matchesFilters;
  }) || [];
  
  // Extract all unique tags from inspirations
  const allTags = inspirations
    ? [...new Set(inspirations.flatMap(item => [...(item.tags || []), item.category]))]
    : [];
  
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">Fashion Inspiration</h1>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search inspirations..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6">
          <h2 className="text-sm font-medium mb-2">Filter by tags:</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge 
                key={tag}
                variant={activeFilters.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleFilterClick(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredInspirations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInspirations.map((inspiration) => (
              <InspirationCard 
                key={inspiration.id} 
                inspiration={inspiration} 
              />
            ))}
          </div>
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
        
        {/* Trending Topics */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Trending Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-all group cursor-pointer">
              <CardContent className="p-6">
                <div className="bg-primary/10 rounded-full h-12 w-12 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="M6.8 3h10.4a2 2 0 0 1 1.8 2.8l-2.3 4.8a2 2 0 0 0 0 1.8l2.3 4.8a2 2 0 0 1-1.8 2.8H6.8a2 2 0 0 1-1.8-2.8l2.3-4.8a2 2 0 0 0 0-1.8L5 5.8A2 2 0 0 1 6.8 3z" />
                    <path d="m15 13-5-5" />
                    <path d="m9 13 5-5" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">Sustainable Fashion</h3>
                <p className="text-muted-foreground mt-2">Eco-conscious clothing choices for a greener planet</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all group cursor-pointer">
              <CardContent className="p-6">
                <div className="bg-primary/10 rounded-full h-12 w-12 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <rect width="18" height="10" x="3" y="11" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4" />
                    <line x1="8" x2="8" y1="16" y2="16" />
                    <line x1="16" x2="16" y1="16" y2="16" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">Capsule Wardrobes</h3>
                <p className="text-muted-foreground mt-2">Minimalist approach to maximize outfit combinations</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all group cursor-pointer">
              <CardContent className="p-6">
                <div className="bg-primary/10 rounded-full h-12 w-12 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">Style Photography</h3>
                <p className="text-muted-foreground mt-2">Tips for capturing your outfits for social media</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
