/**
 * Outfit Page Component
 * 
 * A comprehensive page for managing outfits in the wardrobe management application.
 * This page allows users to view, create, and delete outfits, with a sophisticated
 * outfit creation interface that includes selection of items, occasion, season,
 * weather conditions, and mood.
 * 
 * The page features:
 * - Responsive grid layout for displaying outfit cards
 * - Search functionality to filter outfits by name, occasion, or mood
 * - Interactive creation dialog with multi-step form and item selection
 * - Elegant empty state handling with contextual messages
 * - Optimistic UI updates using React Query
 * 
 * @module Pages
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import NavigationBar from "@/components/navigation-bar";
import OutfitCard from "@/components/outfit-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Outfit, InsertOutfit, WardrobeItem } from "@shared/schema";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import {
  Loader2,
  Plus,
  Search
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * OutfitPage Component
 * 
 * Renders the outfit management page of the application. This component handles the
 * display of all user outfits, provides outfit creation and deletion functionality,
 * and implements search/filter capabilities for outfit discovery.
 * 
 * @returns {JSX.Element} The rendered outfit page
 */
export default function OutfitPage() {
  /** Toast notification hook for user feedback */
  const { toast } = useToast();
  
  /** Query hook for wardrobe items data with loading state */
  const { data: wardrobeItems, isLoading: wardrobeLoading } = useWardrobeItems();

  const [isCreatingOutfit, setIsCreatingOutfit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newOutfit, setNewOutfit] = useState<{
    name: string;
    items: number[];
    occasion: string;
    season: string;
    weatherConditions: string;
    mood: string;
  }>({
    name: "",
    items: [],
    occasion: "",
    season: "",
    weatherConditions: "",
    mood: ""
  });

  // Get outfits
  const { 
    data: outfits, 
    isLoading: outfitsLoading 
  } = useQuery<Outfit[], Error>({
    queryKey: ["/api/outfits"],
  });

  // Create outfit
  const createOutfitMutation = useMutation({
    mutationFn: async (outfitData: Omit<InsertOutfit, "userId">) => {
      const res = await apiRequest({
        method: "POST", 
        path: "/api/outfits", 
        body: outfitData
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
      setIsCreatingOutfit(false);
      setNewOutfit({
        name: "",
        items: [],
        occasion: "",
        season: "",
        weatherConditions: "",
        mood: ""
      });
      toast({
        title: "Outfit created",
        description: "Your new outfit has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create outfit",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete outfit
  const deleteOutfitMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest({
        method: "DELETE", 
        path: `/api/outfits/${id}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
      toast({
        title: "Outfit deleted",
        description: "The outfit has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete outfit",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredOutfits = outfits?.filter(outfit => 
    outfit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    outfit.occasion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    outfit.mood?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleCreateOutfit = () => {
    if (newOutfit.name && newOutfit.items.length > 0) {
      createOutfitMutation.mutate(newOutfit);
    } else {
      toast({
        title: "Incomplete outfit",
        description: "Please provide a name and select at least one item.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOutfit = (id: number) => {
    if (confirm("Are you sure you want to delete this outfit?")) {
      deleteOutfitMutation.mutate(id);
    }
  };

  const toggleItemSelection = (id: number) => {
    setNewOutfit(prev => {
      if (prev.items.includes(id)) {
        return {...prev, items: prev.items.filter(itemId => itemId !== id)};
      } else {
        return {...prev, items: [...prev.items, id]};
      }
    });
  };

  const getOutfitItems = (outfitItemIds: number[]) => {
    if (!wardrobeItems) return [];
    return wardrobeItems.filter(item => outfitItemIds.includes(item.id));
  };

  const isLoading = outfitsLoading || wardrobeLoading;

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">My Outfits</h1>

          <div className="flex w-full sm:w-auto space-x-2">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search outfits..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsCreatingOutfit(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Outfit
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredOutfits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredOutfits.map((outfit) => (
              <OutfitCard 
                key={outfit.id} 
                outfit={outfit}
                items={getOutfitItems(outfit.items)}
                onDelete={() => handleDeleteOutfit(outfit.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <h3 className="text-lg font-medium mb-2">No outfits found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "Try adjusting your search terms"
                : outfits?.length 
                  ? "No outfits match your filters" 
                  : "You haven't created any outfits yet. Start by creating one!"}
            </p>
            <Button onClick={() => setIsCreatingOutfit(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Outfit
            </Button>
          </div>
        )}
      </main>

      {/* Create Outfit Dialog */}
      <Dialog open={isCreatingOutfit} onOpenChange={setIsCreatingOutfit}>
        <DialogContent className="max-w-[95%] md:max-w-[800px] border-amber-200 bg-white shadow-lg overflow-y-auto max-h-[90vh] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
          <DialogHeader className="border-b border-amber-200/30 pb-4 mb-5 relative gold-corner">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-amber-100 to-transparent opacity-50 rounded-full blur-md"></div>
            <DialogTitle className="font-luxury-heading text-2xl flex items-center gap-3 mb-1 text-amber-900">
              <span className="relative">
                <Plus className="h-5 w-5 text-amber-500 absolute -left-7 top-1/2 transform -translate-y-1/2" />
                <span className="animate-luxury-reveal">Create New Ensemble</span>
              </span>
            </DialogTitle>
            <DialogDescription className="font-luxury-body text-amber-800/70">
              Combine items from your collection to create a complete outfit
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 max-h-[60vh] overflow-y-auto">
            {/* Step 1: Basic Information */}
            <div className="luxury-card p-3 sm:p-5 bg-amber-50/80 mb-6">
              <h3 className="font-luxury-heading text-lg text-amber-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="font-luxury-body text-sm uppercase tracking-wider text-amber-800 mb-2 flex items-center">
                    <span className="h-3.5 w-3.5 mr-2 text-amber-500">✧</span>
                    Outfit Name
                  </Label>
                  <Input 
                    id="name" 
                    placeholder="e.g., Paris Evening Soirée" 
                    value={newOutfit.name}
                    onChange={(e) => setNewOutfit({...newOutfit, name: e.target.value})}
                    className="input-luxury font-luxury-body"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="occasion" className="font-luxury-body text-sm uppercase tracking-wider text-amber-800 mb-2 flex items-center">
                      <span className="h-3.5 w-3.5 mr-2 text-amber-500">✧</span>
                      Occasion
                    </Label>
                    <Select 
                      value={newOutfit.occasion} 
                      onValueChange={(value) => setNewOutfit({...newOutfit, occasion: value})}
                    >
                      <SelectTrigger className="input-luxury">
                        <SelectValue placeholder="Select occasion" />
                      </SelectTrigger>
                      <SelectContent className="border-amber-200 bg-white">
                        <SelectItem value="casual" className="font-luxury-body text-amber-900">Casual</SelectItem>
                        <SelectItem value="work" className="font-luxury-body text-amber-900">Work</SelectItem>
                        <SelectItem value="formal" className="font-luxury-body text-amber-900">Formal</SelectItem>
                        <SelectItem value="party" className="font-luxury-body text-amber-900">Party</SelectItem>
                        <SelectItem value="sports" className="font-luxury-body text-amber-900">Sports/Active</SelectItem>
                        <SelectItem value="date" className="font-luxury-body text-amber-900">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="season" className="font-luxury-body text-sm uppercase tracking-wider text-amber-800 mb-2 flex items-center">
                      <span className="h-3.5 w-3.5 mr-2 text-amber-500">✧</span>
                      Season
                    </Label>
                    <Select 
                      value={newOutfit.season} 
                      onValueChange={(value) => setNewOutfit({...newOutfit, season: value})}
                    >
                      <SelectTrigger className="input-luxury">
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent className="border-amber-200 bg-white">
                        <SelectItem value="winter" className="font-luxury-body text-amber-900">Winter</SelectItem>
                        <SelectItem value="spring" className="font-luxury-body text-amber-900">Spring</SelectItem>
                        <SelectItem value="summer" className="font-luxury-body text-amber-900">Summer</SelectItem>
                        <SelectItem value="fall" className="font-luxury-body text-amber-900">Fall</SelectItem>
                        <SelectItem value="all" className="font-luxury-body text-amber-900">All Seasons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Additional Details */}
            <div className="luxury-card p-3 sm:p-5 bg-amber-50/80 mb-6">
              <h3 className="font-luxury-heading text-lg text-amber-900 mb-4">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weather" className="font-luxury-body text-sm uppercase tracking-wider text-amber-800 mb-2 flex items-center">
                    <span className="h-3.5 w-3.5 mr-2 text-amber-500">✧</span>
                    Weather
                  </Label>
                  <Select 
                    value={newOutfit.weatherConditions} 
                    onValueChange={(value) => setNewOutfit({...newOutfit, weatherConditions: value})}
                  >
                    <SelectTrigger className="input-luxury">
                      <SelectValue placeholder="Select weather" />
                    </SelectTrigger>
                    <SelectContent className="border-amber-200 bg-white">
                      <SelectItem value="sunny" className="font-luxury-body text-amber-900">Sunny</SelectItem>
                      <SelectItem value="rainy" className="font-luxury-body text-amber-900">Rainy</SelectItem>
                      <SelectItem value="cloudy" className="font-luxury-body text-amber-900">Cloudy</SelectItem>
                      <SelectItem value="snowy" className="font-luxury-body text-amber-900">Snowy</SelectItem>
                      <SelectItem value="hot" className="font-luxury-body text-amber-900">Hot</SelectItem>
                      <SelectItem value="cold" className="font-luxury-body text-amber-900">Cold</SelectItem>
                      <SelectItem value="windy" className="font-luxury-body text-amber-900">Windy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="mood" className="font-luxury-body text-sm uppercase tracking-wider text-amber-800 mb-2 flex items-center">
                    <span className="h-3.5 w-3.5 mr-2 text-amber-500">✧</span>
                    Mood
                  </Label>
                  <Select 
                    value={newOutfit.mood} 
                    onValueChange={(value) => setNewOutfit({...newOutfit, mood: value})}
                  >
                    <SelectTrigger className="input-luxury">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent className="border-amber-200 bg-white">
                      <SelectItem value="happy" className="font-luxury-body text-amber-900">Happy</SelectItem>
                      <SelectItem value="confident" className="font-luxury-body text-amber-900">Confident</SelectItem>
                      <SelectItem value="relaxed" className="font-luxury-body text-amber-900">Relaxed</SelectItem>
                      <SelectItem value="energetic" className="font-luxury-body text-amber-900">Energetic</SelectItem>
                      <SelectItem value="romantic" className="font-luxury-body text-amber-900">Romantic</SelectItem>
                      <SelectItem value="professional" className="font-luxury-body text-amber-900">Professional</SelectItem>
                      <SelectItem value="creative" className="font-luxury-body text-amber-900">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Step 3: Select Items */}
            <div className="luxury-card p-3 sm:p-5 bg-amber-50/80">
              <h3 className="font-luxury-heading text-lg text-amber-900 mb-4 flex items-center">
                <span className="h-3.5 w-3.5 mr-2 text-amber-500">✧</span>
                Select Items for Your Ensemble
                <span className="ml-auto text-sm font-luxury-body text-amber-700">
                  {newOutfit.items.length} selected
                </span>
              </h3>
              
              {!wardrobeItems || wardrobeItems.length === 0 ? (
                <div className="text-center p-6 border border-amber-200/40 rounded-md bg-white">
                  <p className="text-amber-800/70 mb-4 font-luxury-body">You haven't added any items to your collection yet.</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      localStorage.setItem('pendingOutfit', JSON.stringify(newOutfit));
                      window.location.href = '/wardrobe';
                    }}
                    className="border-amber-300 text-amber-900 hover:bg-amber-50 hover:text-amber-950 font-luxury-body"
                  >
                    Add Items First
                  </Button>
                </div>
              ) : (
                <div className="border border-amber-200/40 rounded-md p-4 max-h-[300px] overflow-y-auto bg-white">
                  <div className="flex flex-wrap gap-3">
                    {wardrobeItems.map((item: WardrobeItem) => (
                      <div 
                        key={item.id} 
                        className={`relative flex flex-col items-center p-2 border rounded-md cursor-pointer transition-all w-[110px] h-[135px] overflow-hidden ${
                          newOutfit.items.includes(item.id) 
                            ? 'border-amber-400 bg-amber-50/80 shadow-md transform scale-[1.02]' 
                            : 'border-gray-200 hover:border-amber-300'
                        }`}
                        onClick={() => toggleItemSelection(item.id)}
                      >
                        {newOutfit.items.includes(item.id) && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-[10px]">✓</span>
                          </div>
                        )}
                        
                        <div className="h-[85px] w-[85px] mb-1 overflow-hidden rounded-md">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-amber-100 flex items-center justify-center">
                              <span className="text-amber-400 text-xs">No image</span>
                            </div>
                          )}
                        </div>
                        
                        <span className="font-luxury-body text-xs font-medium text-center line-clamp-1" title={item.name}>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-amber-700/70 line-clamp-1" title={`${item.category}${item.subcategory ? ` - ${item.subcategory}` : ""}`}>
                          {item.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-amber-200/30 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="text-sm text-amber-700 font-luxury-body">
              {!newOutfit.name || newOutfit.items.length === 0 ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-2 animate-pulse"></span>
                  Complete all required fields
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Ready to create your ensemble
                </span>
              )}
            </div>
            
            <div className="flex justify-end gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => setIsCreatingOutfit(false)} 
                className="flex-1 sm:flex-none border-amber-300 text-amber-900 hover:bg-amber-50 hover:text-amber-950 font-luxury-body"
              >
                <span className="whitespace-nowrap">Cancel</span>
              </Button>
              <Button 
                onClick={handleCreateOutfit}
                disabled={!newOutfit.name || newOutfit.items.length === 0 || createOutfitMutation.isPending}
                className="flex-1 sm:flex-none btn-luxury"
              >
                {createOutfitMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                    <span className="whitespace-nowrap">Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="whitespace-nowrap">Create Ensemble</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}