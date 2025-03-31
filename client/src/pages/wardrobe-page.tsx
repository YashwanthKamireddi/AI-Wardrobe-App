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
    <div className="min-h-screen bg-amber-50/20 dark:bg-gray-950/95">
      <NavigationBar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-amber-200/50 dark:border-amber-700/30 pb-6">
          <h1 className="text-3xl font-luxury-heading mb-4 sm:mb-0 text-amber-900 dark:text-amber-300 relative">
            <span className="relative inline-block">
              My Wardrobe
              <span className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-amber-400 via-amber-200 to-transparent dark:from-amber-600 dark:via-amber-700/40"></span>
            </span>
          </h1>

          <div className="flex w-full sm:w-auto space-x-3">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-amber-500 dark:text-amber-400" />
              <Input 
                type="search" 
                placeholder="Search your collection..." 
                className="pl-8 input-luxury font-luxury-body dark:bg-gray-900/60 dark:border-amber-700/40 dark:text-amber-100 dark:placeholder:text-amber-500/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => setIsAddingItem(true)} 
              className="btn-luxury bg-amber-600 dark:bg-amber-700 hover:bg-amber-700 dark:hover:bg-amber-600 text-white font-luxury-body"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Add Item</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <TabsList className="mb-6 flex flex-wrap h-auto bg-amber-50 dark:bg-gray-900/60 border border-amber-200 dark:border-amber-700/50">
            <TabsTrigger 
              value="all" 
              className="font-luxury-body text-amber-800 dark:text-amber-400 data-[state=active]:bg-amber-100 dark:data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-900 dark:data-[state=active]:text-amber-300"
            >
              All Items
            </TabsTrigger>
            {clothingCategories.map((category) => (
              <TabsTrigger 
                key={category.value} 
                value={category.value} 
                className="flex items-center font-luxury-body text-amber-800 dark:text-amber-400 data-[state=active]:bg-amber-100 dark:data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-900 dark:data-[state=active]:text-amber-300"
              >
                <span className="text-amber-500 dark:text-amber-500 mr-1.5">{getCategoryIcon(category.value)}</span>
                <span>{category.label}</span>
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
              <div className="text-center py-16 border border-amber-200/40 dark:border-amber-700/40 rounded-lg bg-amber-50/30 dark:bg-amber-900/20 luxury-card">
                <div className="max-w-md mx-auto">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900/60 w-20 h-20 mx-auto flex items-center justify-center mb-6">
                    <EmptyWardrobeAnimation />
                  </div>
                  <h3 className="text-xl font-luxury-heading text-amber-900 dark:text-amber-300 mb-3">
                    {searchQuery 
                      ? "No matching items found"
                      : wardrobeItems?.length 
                        ? "This category is empty" 
                        : "Your collection awaits"}
                  </h3>
                  <p className="text-amber-700 dark:text-amber-400/90 font-luxury-body mb-6 px-6">
                    {searchQuery 
                      ? "Try adjusting your search terms or browse by category instead"
                      : wardrobeItems?.length 
                        ? "Add some items to this category to build your perfect outfit collection" 
                        : "Start building your personal style collection by adding your first clothing item"}
                  </p>
                  <Button 
                    onClick={() => setIsAddingItem(true)} 
                    className="btn-luxury bg-amber-600 dark:bg-amber-700 hover:bg-amber-700 dark:hover:bg-amber-600 text-white font-luxury-body mx-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span>{wardrobeItems?.length ? "Add New Item" : "Add Your First Item"}</span>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="md:max-w-[800px] border-amber-200 dark:border-amber-700/50 bg-white dark:bg-gray-900 shadow-lg p-6">
          <DialogHeader className="border-b border-amber-200/30 dark:border-amber-700/30 pb-4 mb-6 relative gold-corner">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-amber-100 dark:from-amber-900/20 to-transparent opacity-50 rounded-full blur-md"></div>
            <DialogTitle className="font-luxury-heading text-2xl flex items-center gap-3 mb-2 text-amber-900 dark:text-amber-300">
              <span className="relative">
                <Plus className="h-5 w-5 text-amber-500 dark:text-amber-400 absolute -left-7 top-1/2 transform -translate-y-1/2" />
                <span className="animate-luxury-reveal">Add to Your Collection</span>
              </span>
            </DialogTitle>
            <DialogDescription className="font-luxury-body text-amber-800/70 dark:text-amber-400/80">
              Create a new entry for your luxury wardrobe with detailed attributes
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 luxury-scrollbar">
            <div className="flex gap-6 flex-col md:flex-row">
              {/* Left side - Image upload */}
              <div className="md:w-2/5 order-2 md:order-1">
                <div className="luxury-card p-5 bg-amber-50/80 dark:bg-amber-900/20 rounded-md">
                  <Label className="font-luxury-body text-sm uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-3 flex items-center">
                    <AccessoriesIcon className="h-3.5 w-3.5 mr-2 text-amber-500 dark:text-amber-400" />
                    Item Image
                  </Label>
                  <div className="border border-amber-200/40 dark:border-amber-700/40 p-5 rounded-md bg-white dark:bg-gray-900/60 animate-luxury-shimmer">
                    <FileUpload 
                      onUpload={handleImageUpload} 
                      currentImageUrl={newItem.imageUrl}
                    />
                  </div>
                </div>
              </div>

              {/* Right side - Item details */}
              <div className="md:w-3/5 order-1 md:order-2">
                <div className="luxury-card p-5 bg-amber-50/80 dark:bg-amber-900/20 rounded-md">
                  <div className="space-y-5">
                    <div>
                      <Label htmlFor="name" className="font-luxury-body text-sm uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2 flex items-center">
                        <Pencil className="h-3.5 w-3.5 mr-2 text-amber-500 dark:text-amber-400" />
                        Item Name
                      </Label>
                      <Input 
                        id="name" 
                        placeholder="e.g., Cashmere Cardigan" 
                        value={newItem.name}
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        className="input-luxury font-luxury-body dark:bg-gray-900/60 dark:border-amber-700/40 dark:text-amber-100 dark:placeholder:text-amber-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category" className="font-luxury-body text-sm uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2 flex items-center">
                          <DressIcon className="h-3.5 w-3.5 mr-2 text-amber-500 dark:text-amber-400" />
                          Category
                        </Label>
                        <Select 
                          value={newItem.category} 
                          onValueChange={(value) => setNewItem({...newItem, category: value, subcategory: ""})}
                        >
                          <SelectTrigger className="input-luxury dark:bg-gray-900/60 dark:border-amber-700/40 dark:text-amber-100">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] border-amber-200 dark:border-amber-700/50 bg-white dark:bg-gray-900">
                            {clothingCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value} className="font-luxury-body text-amber-900 dark:text-amber-300">
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {newItem.category && (
                        <div>
                          <Label htmlFor="subcategory" className="font-luxury-body text-sm uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2 flex items-center">
                            <ShoesIcon className="h-3.5 w-3.5 mr-2 text-amber-500 dark:text-amber-400" />
                            Subcategory
                          </Label>
                          <Select 
                            value={newItem.subcategory} 
                            onValueChange={(value) => setNewItem({...newItem, subcategory: value})}
                          >
                            <SelectTrigger className="input-luxury dark:bg-gray-900/60 dark:border-amber-700/40 dark:text-amber-100">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px] border-amber-200 dark:border-amber-700/50 bg-white dark:bg-gray-900">
                              {clothingCategories
                                .find(c => c.value === newItem.category)
                                ?.subcategories.map((sub) => (
                                  <SelectItem key={sub} value={sub} className="font-luxury-body text-amber-900 dark:text-amber-300">
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
                        <Label htmlFor="color" className="font-luxury-body text-sm uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2 flex items-center">
                          <span className="w-3.5 h-3.5 mr-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700"></span>
                          Color
                        </Label>
                        <Input 
                          id="color" 
                          placeholder="e.g., Burgundy" 
                          value={newItem.color}
                          onChange={(e) => setNewItem({...newItem, color: e.target.value})}
                          className="input-luxury font-luxury-body dark:bg-gray-900/60 dark:border-amber-700/40 dark:text-amber-100 dark:placeholder:text-amber-500/50"
                        />
                      </div>

                      <div>
                        <Label htmlFor="season" className="font-luxury-body text-sm uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2 flex items-center">
                          <span className="h-3.5 w-3.5 mr-2 text-amber-500 dark:text-amber-400">❄</span>
                          Season
                        </Label>
                        <Select 
                          value={newItem.season} 
                          onValueChange={(value) => setNewItem({...newItem, season: value})}
                        >
                          <SelectTrigger className="input-luxury dark:bg-gray-900/60 dark:border-amber-700/40 dark:text-amber-100">
                            <SelectValue placeholder="Select season" />
                          </SelectTrigger>
                          <SelectContent className="border-amber-200 dark:border-amber-700/50 bg-white dark:bg-gray-900">
                            <SelectItem value="winter" className="font-luxury-body text-amber-900 dark:text-amber-300">Winter</SelectItem>
                            <SelectItem value="spring" className="font-luxury-body text-amber-900 dark:text-amber-300">Spring</SelectItem>
                            <SelectItem value="summer" className="font-luxury-body text-amber-900 dark:text-amber-300">Summer</SelectItem>
                            <SelectItem value="fall" className="font-luxury-body text-amber-900 dark:text-amber-300">Fall</SelectItem>
                            <SelectItem value="all" className="font-luxury-body text-amber-900 dark:text-amber-300">All Seasons</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-amber-200/30 dark:border-amber-700/30 flex items-center justify-between">
            <div className="text-sm text-amber-700 dark:text-amber-400/80 font-luxury-body">
              {!newItem.name || !newItem.category || !newItem.imageUrl ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-amber-400 dark:bg-amber-500 rounded-full mr-2 animate-pulse"></span>
                  Complete all required fields
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-2"></span>
                  Ready to add to your collection
                </span>
              )}
            </div>
            
            <div className="flex justify-end gap-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddingItem(false)} 
                className="border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-950 dark:hover:text-amber-200 font-luxury-body"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!newItem.name || !newItem.category || !newItem.imageUrl || addWardrobeItem.isPending}
                className="btn-luxury bg-amber-600 dark:bg-amber-700 hover:bg-amber-700 dark:hover:bg-amber-600 text-white"
              >
                {addWardrobeItem.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
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