import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, Grid3x3, List, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import NavigationBar from "@/components/navigation-bar";
import WardrobeItem from "@/components/wardrobe-item";
import FileUpload from "@/components/file-upload";
import { useWardrobeItems, useAddWardrobeItem, useDeleteWardrobeItem, useUpdateWardrobeItem } from "@/hooks/use-wardrobe";
import { clothingCategories, seasons, WardrobeItem as WardrobeItemType } from "@shared/schema";
import { insertWardrobeItemSchema } from "@shared/schema";

const addItemFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  color: z.string().optional(),
  season: z.string().optional(),
  imageUrl: z.string().min(1, "Image is required"),
  tags: z.string().optional(),
  favorite: z.boolean().optional(),
});

type AddItemFormData = z.infer<typeof addItemFormSchema>;

export function WardrobePage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WardrobeItemType | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [seasonFilter, setSeasonFilter] = useState<string>('all');

  const { data: wardrobeItems, isLoading } = useWardrobeItems();
  const addItem = useAddWardrobeItem();
  const updateItem = useUpdateWardrobeItem();
  const deleteItem = useDeleteWardrobeItem();

  const form = useForm<AddItemFormData>({
    resolver: zodResolver(addItemFormSchema),
    defaultValues: {
      name: "",
      category: "tops",
      subcategory: "",
      color: "",
      season: "all",
      imageUrl: "",
      tags: "",
      favorite: false,
    },
  });

  const editForm = useForm<AddItemFormData>({
    resolver: zodResolver(addItemFormSchema),
    defaultValues: {
      name: "",
      category: "tops",
      subcategory: "",
      color: "",
      season: "all",
      imageUrl: "",
      tags: "",
      favorite: false,
    },
  });

  useEffect(() => {
    if (editingItem) {
      editForm.reset({
        name: editingItem.name,
        category: editingItem.category,
        subcategory: editingItem.subcategory || "",
        color: editingItem.color || "",
        season: editingItem.season || "all",
        imageUrl: editingItem.imageUrl,
        tags: editingItem.tags?.join(", ") || "",
        favorite: editingItem.favorite || false,
      });
    }
  }, [editingItem, editForm]);

  const filteredItems = useMemo(() => {
    if (!wardrobeItems) return [];

    return wardrobeItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.color?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesSeason = seasonFilter === 'all' || item.season === seasonFilter || item.season === 'all';

      return matchesSearch && matchesCategory && matchesSeason;
    });
  }, [wardrobeItems, searchQuery, categoryFilter, seasonFilter]);

  const onSubmit = async (data: AddItemFormData) => {
    const tagsArray = data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];
    
    await addItem.mutateAsync({
      name: data.name,
      category: data.category,
      subcategory: data.subcategory || null,
      color: data.color || null,
      season: data.season || null,
      imageUrl: data.imageUrl,
      tags: tagsArray.length > 0 ? tagsArray : null,
      favorite: data.favorite || false,
    });
    
    setIsAddDialogOpen(false);
    form.reset();
  };

  const onEditSubmit = async (data: AddItemFormData) => {
    if (!editingItem) return;

    const tagsArray = data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];
    
    await updateItem.mutateAsync({
      id: editingItem.id,
      name: data.name,
      category: data.category,
      subcategory: data.subcategory || null,
      color: data.color || null,
      season: data.season || null,
      imageUrl: data.imageUrl,
      tags: tagsArray.length > 0 ? tagsArray : null,
      favorite: data.favorite || false,
    });
    
    setEditingItem(null);
    editForm.reset();
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate(id);
  };

  const currentCategory = clothingCategories.find(c => c.value === form.watch('category'));
  const currentEditCategory = clothingCategories.find(c => c.value === editForm.watch('category'));

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
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-fashion-heading text-foreground">
              Your Collection
            </h1>
            <p className="text-muted-foreground font-fashion-body mt-1">
              Manage your wardrobe items
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="button-add-item"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-fashion-heading text-amber-900">
                  Add New Wardrobe Item
                </DialogTitle>
                <DialogDescription className="font-fashion-body">
                  Add a new clothing item to your wardrobe collection.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Image</FormLabel>
                          <FormControl>
                            <FileUpload
                              onUpload={field.onChange}
                              currentImageUrl={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Name</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-name"
                              placeholder="Blue Denim Jacket"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clothingCategories.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-subcategory">
                                <SelectValue placeholder="Select subcategory" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currentCategory?.subcategories.map(subcat => (
                                <SelectItem key={subcat} value={subcat}>
                                  {subcat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-color"
                              placeholder="Navy Blue"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="season"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Season</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || "all"}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-season">
                                <SelectValue placeholder="Select season" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {seasons.map(season => (
                                <SelectItem key={season.value} value={season.value}>
                                  {season.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Tags (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-tags"
                              placeholder="casual, summer, comfortable (comma-separated)"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={addItem.isPending}
                      data-testid="button-submit"
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                    >
                      {addItem.isPending ? "Adding..." : "Add Item"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Edit Item Dialog */}
          <Dialog open={editingItem !== null} onOpenChange={(open) => !open && setEditingItem(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-item">
              <DialogHeader>
                <DialogTitle className="font-fashion-heading text-amber-900">
                  Edit Wardrobe Item
                </DialogTitle>
                <DialogDescription className="font-fashion-body">
                  Update the details of your wardrobe item.
                </DialogDescription>
              </DialogHeader>

              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Image</FormLabel>
                          <FormControl>
                            <FileUpload
                              onUpload={field.onChange}
                              currentImageUrl={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Name</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-edit-name"
                              placeholder="Blue Denim Jacket"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-edit-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clothingCategories.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-edit-subcategory">
                                <SelectValue placeholder="Select subcategory" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currentEditCategory?.subcategories.map(subcat => (
                                <SelectItem key={subcat} value={subcat}>
                                  {subcat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-edit-color"
                              placeholder="Navy Blue"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="season"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Season</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || "all"}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-edit-season">
                                <SelectValue placeholder="Select season" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {seasons.map(season => (
                                <SelectItem key={season.value} value={season.value}>
                                  {season.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Tags (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-edit-tags"
                              placeholder="casual, summer, comfortable (comma-separated)"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingItem(null)}
                      data-testid="button-edit-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateItem.isPending}
                      data-testid="button-edit-submit"
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                    >
                      {updateItem.isPending ? "Updating..." : "Update Item"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Filters and Search */}
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
              placeholder="Search items..."
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

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger data-testid="select-filter-category" className="w-full md:w-[180px] border-amber-200">
              <Filter className="h-4 w-4 mr-2 text-amber-500" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {clothingCategories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={seasonFilter} onValueChange={setSeasonFilter}>
            <SelectTrigger data-testid="select-filter-season" className="w-full md:w-[180px] border-amber-200">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              {seasons.map(season => (
                <SelectItem key={season.value} value={season.value}>
                  {season.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              data-testid="button-grid-view"
              className={viewMode === 'grid' ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              data-testid="button-list-view"
              className={viewMode === 'list' ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        {wardrobeItems && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4 flex-wrap"
          >
            <Badge variant="outline" className="border-amber-300 text-amber-800 px-3 py-1">
              Total Items: {wardrobeItems.length}
            </Badge>
            <Badge variant="outline" className="border-amber-300 text-amber-800 px-3 py-1">
              Showing: {filteredItems.length}
            </Badge>
          </motion.div>
        )}

        {/* Items Grid/List */}
        {isLoading ? (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Card className="max-w-md mx-auto border-amber-200">
              <CardHeader>
                <CardTitle className="font-fashion-heading text-amber-900">
                  {wardrobeItems && wardrobeItems.length > 0 ? 'No Items Found' : 'No Items Yet'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-fashion-body mb-4">
                  {wardrobeItems && wardrobeItems.length > 0
                    ? 'Try adjusting your filters or search query.'
                    : 'Start building your wardrobe by adding your first item.'}
                </p>
                {(!wardrobeItems || wardrobeItems.length === 0) && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    data-testid="button-add-first-item"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Item
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`grid gap-4 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1 max-w-2xl mx-auto'
            }`}
            data-testid="wardrobe-items-grid"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  layout
                  data-testid={`wardrobe-item-${item.id}`}
                >
                  <WardrobeItem
                    item={item}
                    onDelete={() => handleDelete(item.id)}
                    onEdit={() => setEditingItem(item)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
