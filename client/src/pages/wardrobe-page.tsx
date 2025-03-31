import { useState } from "react";
import { useWardrobeItems, useAddWardrobeItem, useDeleteWardrobeItem } from "@/hooks/use-wardrobe";
import NavigationBar from "@/components/navigation-bar";
import WardrobeItem from "@/components/wardrobe-item";
import FileUpload from "@/components/file-upload";
import { 
  AnimatedWardrobeList, 
  WardrobeLoadingAnimation, 
  EmptyWardrobeAnimation,
  HangerIcon,
  FloatingActionButton
} from "@/components/ui/animated-wardrobe";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Loader2, 
  Plus, 
  Search,
  Shirt,
  Pencil,
  Shirt as DressIcon,
  Wind as OuterwearIcon,
  ShoppingBag as AccessoriesIcon,
  Footprints as ShoesIcon
} from "lucide-react";
import { clothingCategories, WardrobeItem as WardrobeItemType } from "@shared/schema";

export default function WardrobePage() {
  const { data: wardrobeItems, isLoading } = useWardrobeItems();
  const addWardrobeItem = useAddWardrobeItem();
  const deleteWardrobeItem = useDeleteWardrobeItem();

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    subcategory: "",
    color: "",
    season: "all",
    imageUrl: "",
    tags: [],
    favorite: false
  });

  const filteredItems = wardrobeItems?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.color && item.color.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = activeCategory === "all" || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  }) || [];

  const handleImageUpload = (url: string) => {
    setNewItem({...newItem, imageUrl: url});
  };

  const handleSubmit = () => {
    if (newItem.name && newItem.category && newItem.imageUrl) {
      addWardrobeItem.mutate(newItem, {
        onSuccess: () => {
          setIsAddingItem(false);
          setNewItem({
            name: "",
            category: "",
            subcategory: "",
            color: "",
            season: "all",
            imageUrl: "",
            tags: [],
            favorite: false
          });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteWardrobeItem.mutate(id);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "tops":
        return <Shirt className="h-4 w-4" />;
      case "bottoms":
        return <Pencil className="h-4 w-4" />;
      case "dresses":
        return <DressIcon className="h-4 w-4" />;
      case "outerwear":
        return <OuterwearIcon className="h-4 w-4" />;
      case "accessories":
        return <AccessoriesIcon className="h-4 w-4" />;
      case "shoes":
        return <ShoesIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">My Wardrobe</h1>

          <div className="flex w-full sm:w-auto space-x-2">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search items..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <FloatingActionButton onClick={() => setIsAddingItem(true)} className="px-4">
              <Plus className="h-4 w-4 mr-2" />
              <span>Add Item</span>
            </FloatingActionButton>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <TabsList className="mb-4 flex flex-wrap h-auto">
            <TabsTrigger value="all">All Items</TabsTrigger>
            {clothingCategories.map((category) => (
              <TabsTrigger key={category.value} value={category.value} className="flex items-center">
                {getCategoryIcon(category.value)}
                <span className="ml-1">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-4">
            {isLoading ? (
              <WardrobeLoadingAnimation />
            ) : filteredItems.length > 0 ? (
              <AnimatedWardrobeList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item, index) => (
                  <WardrobeItem
                    key={item.id}
                    item={item}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </AnimatedWardrobeList>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <EmptyWardrobeAnimation />
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Try adjusting your search terms"
                    : wardrobeItems?.length 
                      ? "No items in this category. Try adding some!" 
                      : "Your wardrobe is empty. Start by adding some items!"}
                </p>
                <FloatingActionButton onClick={() => setIsAddingItem(true)} className="mx-auto mt-4 px-4">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Add Your First Item</span>
                </FloatingActionButton>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="premium-dialog md:max-w-[800px] max-h-[92vh] py-8 px-6 overflow-hidden flex flex-col">
          <DialogHeader className="border-b border-accent/30 pb-4 mb-5 relative gold-corner">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-accent/10 to-transparent opacity-50 rounded-full blur-md"></div>
            <DialogTitle className="font-fashion-heading text-2xl flex items-center gap-3 mb-1">
              <span className="relative">
                <Plus className="h-5 w-5 text-accent absolute -left-7 top-1/2 transform -translate-y-1/2" />
                <span className="animate-luxury-reveal">Add New Wardrobe Item</span>
              </span>
            </DialogTitle>
            <DialogDescription className="font-fashion-body text-muted-foreground">
              Upload and categorize a new item for your luxury collection.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 thin-scrollbar">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6 bg-background/30 border border-accent/20 h-auto p-1">
                <TabsTrigger 
                  value="details" 
                  className="py-3 data-[state=active]:bg-accent/10 data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-accent/20"
                >
                  Item Details
                </TabsTrigger>
                <TabsTrigger 
                  value="image" 
                  className="py-3 data-[state=active]:bg-accent/10 data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-accent/20"
                >
                  Upload Image
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-0 animate-fade-in space-y-5">
                <div className="luxury-card p-5 dark:bg-slate-900/60">
                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="name" className="font-fashion-body text-sm uppercase tracking-wider text-foreground/80 mb-2 flex items-center">
                        <Pencil className="h-3.5 w-3.5 mr-2 text-accent/70" />
                        Item Name
                      </Label>
                      <Input 
                        id="name" 
                        placeholder="e.g., Cashmere Cardigan" 
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        className="input-enhanced font-fashion-body"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category" className="font-fashion-body text-sm uppercase tracking-wider text-foreground/80 mb-2 flex items-center">
                          <DressIcon className="h-3.5 w-3.5 mr-2 text-accent/70" />
                          Category
                        </Label>
                        <Select 
                          value={newItem.category} 
                          onValueChange={(value) => setNewItem({...newItem, category: value, subcategory: ""})}
                        >
                          <SelectTrigger className="input-enhanced">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {clothingCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value} className="font-fashion-body">
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {newItem.category && (
                        <div>
                          <Label htmlFor="subcategory" className="font-fashion-body text-sm uppercase tracking-wider text-foreground/80 mb-2 flex items-center">
                            <ShoesIcon className="h-3.5 w-3.5 mr-2 text-accent/70" />
                            Subcategory
                          </Label>
                          <Select 
                            value={newItem.subcategory} 
                            onValueChange={(value) => setNewItem({...newItem, subcategory: value})}
                          >
                            <SelectTrigger className="input-enhanced">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                              {clothingCategories
                                .find(c => c.value === newItem.category)
                                ?.subcategories.map((sub) => (
                                  <SelectItem key={sub} value={sub} className="font-fashion-body">
                                    {sub}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="color" className="font-fashion-body text-sm uppercase tracking-wider text-foreground/80 mb-2 flex items-center">
                          <span className="w-3.5 h-3.5 mr-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></span>
                          Color
                        </Label>
                        <Input 
                          id="color" 
                          placeholder="e.g., Burgundy" 
                          value={newItem.color}
                          onChange={(e) => setNewItem({...newItem, color: e.target.value})}
                          className="input-enhanced font-fashion-body"
                        />
                      </div>

                      <div>
                        <Label htmlFor="season" className="font-fashion-body text-sm uppercase tracking-wider text-foreground/80 mb-2 flex items-center">
                          <span className="h-3.5 w-3.5 mr-2 text-accent/70">❄</span>
                          Season
                        </Label>
                        <Select 
                          value={newItem.season} 
                          onValueChange={(value) => setNewItem({...newItem, season: value})}
                        >
                          <SelectTrigger className="input-enhanced">
                            <SelectValue placeholder="Select season" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="winter" className="font-fashion-body">Winter</SelectItem>
                            <SelectItem value="spring" className="font-fashion-body">Spring</SelectItem>
                            <SelectItem value="summer" className="font-fashion-body">Summer</SelectItem>
                            <SelectItem value="fall" className="font-fashion-body">Fall</SelectItem>
                            <SelectItem value="all" className="font-fashion-body">All Seasons</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="image" className="mt-0 animate-fade-in">
                <div className="luxury-card p-5 dark:bg-slate-900/60">
                  <Label className="font-fashion-body text-sm uppercase tracking-wider text-foreground/80 mb-3 flex items-center">
                    <AccessoriesIcon className="h-3.5 w-3.5 mr-2 text-accent/70" />
                    Item Image
                  </Label>
                  <div className="border border-accent/20 p-5 rounded-md bg-background/50 animate-glossy-shine">
                    <FileUpload 
                      onUpload={handleImageUpload} 
                      currentImageUrl={newItem.imageUrl}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="pt-4 mt-4 border-t border-accent/20 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {!newItem.name || !newItem.category || !newItem.imageUrl ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500/70 rounded-full mr-2 animate-pulse"></span>
                  Please fill all required fields
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500/70 rounded-full mr-2"></span>
                  Ready to add to your collection
                </span>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsAddingItem(false)} 
                className="fashion-button dark:border-accent/30 dark:text-accent-foreground dark:hover:bg-accent/10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!newItem.name || !newItem.category || !newItem.imageUrl || addWardrobeItem.isPending}
                className="btn-modern dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/90"
              >
                {addWardrobeItem.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add to Collection
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