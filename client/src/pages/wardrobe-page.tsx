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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Wardrobe Item</DialogTitle>
            <DialogDescription>
              Upload and categorize a new item for your wardrobe.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Blue T-Shirt" 
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newItem.category} 
                  onValueChange={(value) => setNewItem({...newItem, category: value, subcategory: ""})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {clothingCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newItem.category && (
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select 
                    value={newItem.subcategory} 
                    onValueChange={(value) => setNewItem({...newItem, subcategory: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {clothingCategories
                        .find(c => c.value === newItem.category)
                        ?.subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="color">Color</Label>
                <Input 
                  id="color" 
                  placeholder="e.g., Blue" 
                  value={newItem.color}
                  onChange={(e) => setNewItem({...newItem, color: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="season">Season</Label>
                <Select 
                  value={newItem.season} 
                  onValueChange={(value) => setNewItem({...newItem, season: value})}
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
            </div>

            <div className="space-y-4">
              <Label>Item Image</Label>
              <FileUpload 
                onUpload={handleImageUpload} 
                currentImageUrl={newItem.imageUrl}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingItem(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={!newItem.name || !newItem.category || !newItem.imageUrl || addWardrobeItem.isPending}
            >
              {addWardrobeItem.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add to Wardrobe"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}