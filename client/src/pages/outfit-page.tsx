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

export default function OutfitPage() {
  const { toast } = useToast();
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
      const res = await apiRequest("POST", "/api/outfits", outfitData);
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
      await apiRequest("DELETE", `/api/outfits/${id}`);
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Outfit</DialogTitle>
            <DialogDescription>
              Combine items from your wardrobe to create a complete outfit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Outfit Name</Label>
              <Input 
                id="name" 
                placeholder="e.g., Summer Day Out" 
                value={newOutfit.name}
                onChange={(e) => setNewOutfit({...newOutfit, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="occasion">Occasion</Label>
                <Select 
                  value={newOutfit.occasion} 
                  onValueChange={(value) => setNewOutfit({...newOutfit, occasion: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="party">Party</SelectItem>
                    <SelectItem value="sports">Sports/Active</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="season">Season</Label>
                <Select 
                  value={newOutfit.season} 
                  onValueChange={(value) => setNewOutfit({...newOutfit, season: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="winter">Winter</SelectItem>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                    <SelectItem value="fall">Fall</SelectItem>
                    <SelectItem value="all">All Seasons</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="weather">Weather Conditions</Label>
                <Select 
                  value={newOutfit.weatherConditions} 
                  onValueChange={(value) => setNewOutfit({...newOutfit, weatherConditions: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select weather" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunny">Sunny</SelectItem>
                    <SelectItem value="rainy">Rainy</SelectItem>
                    <SelectItem value="cloudy">Cloudy</SelectItem>
                    <SelectItem value="snowy">Snowy</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                    <SelectItem value="windy">Windy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mood">Mood</Label>
                <Select 
                  value={newOutfit.mood} 
                  onValueChange={(value) => setNewOutfit({...newOutfit, mood: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">Happy</SelectItem>
                    <SelectItem value="confident">Confident</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="romantic">Romantic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Items for This Outfit</Label>
              {!wardrobeItems || wardrobeItems.length === 0 ? (
                <div className="text-center p-4 border rounded">
                  <p className="text-muted-foreground mb-2">You haven't added any items to your wardrobe yet.</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      localStorage.setItem('pendingOutfit', JSON.stringify(newOutfit));
                      window.location.href = '/wardrobe';
                    }}
                  >
                    Add Items First
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {wardrobeItems.map((item: WardrobeItem) => (
                      <div key={item.id} className="flex items-start space-x-2 p-2 border rounded-md">
                        <Checkbox 
                          id={`item-${item.id}`} 
                          checked={newOutfit.items.includes(item.id)}
                          onCheckedChange={() => toggleItemSelection(item.id)}
                        />
                        <div className="flex items-center space-x-2 overflow-hidden">
                          {item.imageUrl && (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="h-12 w-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <Label 
                              htmlFor={`item-${item.id}`}
                              className="font-medium text-sm cursor-pointer"
                            >
                              {item.name}
                            </Label>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.category}{item.subcategory ? ` - ${item.subcategory}` : ""}
                              {item.color ? `, ${item.color}` : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Selected items: {newOutfit.items.length}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingOutfit(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateOutfit}
              disabled={!newOutfit.name || newOutfit.items.length === 0 || createOutfitMutation.isPending}
            >
              {createOutfitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Outfit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}