import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Grid3x3, List, X, Edit, Trash2, Shirt } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import FileUpload from "@/components/file-upload";
import { useWardrobeItems, useAddWardrobeItem, useDeleteWardrobeItem, useUpdateWardrobeItem } from "@/hooks/use-wardrobe";
import { clothingCategories, seasons, WardrobeItem as WardrobeItemType } from "@shared/schema";

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  color: z.string().optional(),
  season: z.string().optional(),
  imageUrl: z.string().min(1, "Image is required"),
  tags: z.string().optional(),
  favorite: z.boolean().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

export function WardrobePage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WardrobeItemType | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: wardrobeItems, isLoading } = useWardrobeItems();
  const addItem = useAddWardrobeItem();
  const updateItem = useUpdateWardrobeItem();
  const deleteItem = useDeleteWardrobeItem();

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
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

  const editForm = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  useEffect(() => {
    if (editingItem) {
      editForm.reset({
        name: editingItem.name,
        category: editingItem.category,
        subcategory: editingItem.subcategory || "",
        color: editingItem.color || "",
        season: editingItem.season || "all",
        imageUrl: editingItem.imageUrl || "",
        tags: editingItem.tags?.join(", ") || "",
        favorite: editingItem.favorite || false,
      });
    }
  }, [editingItem, editForm]);

  const filteredItems = useMemo(() => {
    if (!wardrobeItems) return [];
    return wardrobeItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.color?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [wardrobeItems, searchQuery, categoryFilter]);

  const onSubmitAdd = async (data: ItemFormData) => {
    try {
      await addItem.mutateAsync({
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
      });
      form.reset();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const onSubmitEdit = async (data: ItemFormData) => {
    if (!editingItem) return;
    try {
      await updateItem.mutateAsync({
        id: editingItem.id,
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
      });
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteItem.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const ItemForm = ({ formInstance, onSubmit, submitLabel }: { formInstance: any; onSubmit: (data: ItemFormData) => void; submitLabel: string }) => (
    <Form {...formInstance}>
      <form onSubmit={formInstance.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={formInstance.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value}
                  onChange={field.onChange}
                  accept="image/*"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={formInstance.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="White cotton shirt" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={formInstance.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
            control={formInstance.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="White" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={formInstance.control}
          name="season"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Season</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {seasons.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={formInstance.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="casual, work, favorite" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" className="w-full">{submitLabel}</Button>
        </DialogFooter>
      </form>
    </Form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24 md:pb-8">
      <NavigationBar />

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(38,75%,55%)]" />
              <span className="text-sm tracking-widest uppercase text-slate-400">Collection</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-slate-900 mb-1">Your Wardrobe</h1>
            <p className="text-slate-500">{wardrobeItems?.length || 0} items in your collection</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="rounded-full px-6"
                style={{ background: "hsl(337, 73%, 26%)" }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white border-slate-200">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl text-slate-900">Add New Item</DialogTitle>
                <DialogDescription className="text-slate-500">Add a new piece to your wardrobe collection.</DialogDescription>
              </DialogHeader>
              <ItemForm formInstance={form} onSubmit={onSubmitAdd} submitLabel="Add Item" />
            </DialogContent>
          </Dialog>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search wardrobe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full border-slate-200 bg-white focus:border-[hsl(337,73%,26%)] focus:ring-[hsl(337,73%,26%)]/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
              </button>
            )}
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px] border-slate-200 bg-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 bg-white">
              <SelectItem value="all">All Categories</SelectItem>
              {clothingCategories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-[hsl(337,73%,26%)]' : 'border-slate-200 hover:bg-slate-50'}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-[hsl(337,73%,26%)]' : 'border-slate-200 hover:bg-slate-50'}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results Count */}
        {filteredItems.length > 0 && (
          <div className="flex gap-3 mb-6">
            <Badge variant="outline" className="border-slate-200 text-slate-600">Showing: {filteredItems.length}</Badge>
            {categoryFilter !== 'all' && (
              <Badge className="bg-[hsl(337,73%,26%)]/10 text-[hsl(337,73%,26%)] hover:bg-[hsl(337,73%,26%)]/15">
                {categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}
              </Badge>
            )}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className={viewMode === 'grid'
            ? "grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            : "space-y-4"
          }>
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="border-slate-100 bg-white">
                <Skeleton className={viewMode === 'grid' ? "aspect-square" : "h-24"} />
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="space-y-8">
            <Card className="max-w-md mx-auto border-slate-100 bg-white shadow-sm">
              <CardHeader className="text-center pb-2">
                <div
                  className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "hsl(337, 73%, 26%)10" }}
                >
                  <Shirt className="h-7 w-7" style={{ color: "hsl(337, 73%, 26%)" }} />
                </div>
                <CardTitle className="font-serif text-2xl text-slate-900">
                  {wardrobeItems?.length ? 'No Matches Found' : 'Start Your Collection'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-slate-500">
                  {wardrobeItems?.length
                    ? 'Try adjusting your search or filters.'
                    : 'Build your wardrobe by adding your first piece. Celura will help you create perfect outfits.'}
                </p>
                {!wardrobeItems?.length && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="rounded-full px-6"
                    style={{ background: "hsl(337, 73%, 26%)" }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Item
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Inspiration Section */}
            {!wardrobeItems?.length && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="font-serif text-xl text-slate-900 mb-1">Get Inspired</h3>
                  <p className="text-slate-400 text-sm">Ideas for building your wardrobe</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Classic Blazer', category: 'Tops', color: 'Navy', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop' },
                    { name: 'White Silk Blouse', category: 'Tops', color: 'White', img: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=300&h=300&fit=crop' },
                    { name: 'Tailored Trousers', category: 'Bottoms', color: 'Black', img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&h=300&fit=crop' },
                    { name: 'Cashmere Sweater', category: 'Tops', color: 'Camel', img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=300&fit=crop' },
                  ].map((item, idx) => (
                    <Card key={idx} className="overflow-hidden border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group">
                      <div className="aspect-square bg-slate-100 relative overflow-hidden">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm text-slate-900 truncate">{item.name}</h4>
                        <p className="text-xs text-slate-400">{item.category} • {item.color}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredItems.map((item) => (
              <Card key={item.id} className="group overflow-hidden border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                <div className="relative aspect-square bg-slate-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setEditingItem(item)} className="bg-white hover:bg-slate-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-slate-900 truncate">{item.name}</h3>
                  <p className="text-sm text-slate-400 capitalize">{item.category}</p>
                  {item.color && (
                    <Badge variant="outline" className="mt-2 text-xs border-slate-200 text-slate-500">{item.color}</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="flex overflow-hidden border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all">
                <div className="w-24 h-24 flex-shrink-0 bg-muted">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <CardContent className="flex-1 p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                    <div className="flex gap-2 mt-2">
                      {item.color && <Badge variant="outline" className="text-xs border-primary/20">{item.color}</Badge>}
                      {item.season && item.season !== 'all' && (
                        <Badge variant="secondary" className="text-xs capitalize bg-primary/10 text-primary">{item.season}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingItem(item)} className="border-primary/20 hover:bg-primary/10">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto border-primary/20 bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit Item</DialogTitle>
            <DialogDescription>Update the details of this wardrobe item.</DialogDescription>
          </DialogHeader>
          <ItemForm formInstance={editForm} onSubmit={onSubmitEdit} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
