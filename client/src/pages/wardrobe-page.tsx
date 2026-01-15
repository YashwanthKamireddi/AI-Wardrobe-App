import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Grid3x3, List, X, Edit, Trash2, Shirt, Sparkles, Loader2, Wand2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

import { LuxuryButton } from "@/components/ui/luxury-button";
import { LuxuryInput, SearchInput } from "@/components/ui/luxury-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WardrobeItemSkeleton, ProcessingOverlay } from "@/components/ui/luxury-skeleton";
import { MasonryGrid, LuxuryCard, LazyImage } from "@/components/ui/masonry-grid";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlinthButton } from "@/components/ui/plinth-button";
import { GlassCard } from "@/components/ui/glass-card";
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
import { Input } from "@/components/ui/input";

import NavigationBar from "@/components/navigation-bar";
import FileUpload from "@/components/file-upload";
import { useWardrobeItems, useAddWardrobeItem, useDeleteWardrobeItem, useUpdateWardrobeItem } from "@/hooks/use-wardrobe";
import { clothingCategories, seasons, WardrobeItem as WardrobeItemType } from "@shared/schema";
import { processWardrobeImage, AIProcessingResult } from "@/lib/image-ai";
import { Progress } from "@/components/ui/progress";
import { HapticFeedback } from "@/lib/haptics";

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

  // AI Processing states
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStage, setAiStage] = useState('');
  const [aiResult, setAiResult] = useState<AIProcessingResult | null>(null);

  const { data: wardrobeItems, isLoading } = useWardrobeItems();
  const addItem = useAddWardrobeItem();
  const updateItem = useUpdateWardrobeItem();
  const deleteItem = useDeleteWardrobeItem();

  // Handle AI image processing
  const handleAIProcess = async (file: File) => {
    setIsAIProcessing(true);
    setAiProgress(0);
    setAiStage('Starting AI analysis...');

    try {
      const result = await processWardrobeImage(file, (stage, progress) => {
        setAiStage(stage);
        setAiProgress(progress);
      });

      setAiResult(result);

      // Auto-fill form fields with AI results
      form.setValue('imageUrl', result.processedImageUrl);
      form.setValue('color', result.colors.colorName);
      form.setValue('category', result.category.category);
      if (result.category.subcategory) {
        form.setValue('subcategory', result.category.subcategory);
      }

      // Generate a suggested name
      const suggestedName = `${result.colors.colorName} ${result.category.category.slice(0, -1)}`;
      form.setValue('name', suggestedName.charAt(0).toUpperCase() + suggestedName.slice(1));

      // Convert blob to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        form.setValue('imageUrl', base64);
      };
      reader.readAsDataURL(result.processedImageBlob);

    } catch (error) {
      console.error('AI processing failed:', error);
      // Fallback: just use the original image as base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        form.setValue('imageUrl', base64);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsAIProcessing(false);
      setAiProgress(0);
      setAiStage('');
    }
  };

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
      setAiResult(null); // Reset AI result
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

  const ItemForm = ({ formInstance, onSubmit, submitLabel, enableAI = false }: { formInstance: any; onSubmit: (data: ItemFormData) => void; submitLabel: string; enableAI?: boolean }) => (
    <Form {...formInstance}>
      <form onSubmit={formInstance.handleSubmit(onSubmit)} className="space-y-4">
        {/* AI Processing Status */}
        {enableAI && isAIProcessing && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-4 h-4 text-purple-500 animate-pulse" />
              <span className="text-sm font-medium text-purple-700">{aiStage}</span>
            </div>
            <Progress value={aiProgress} className="h-2" />
            <p className="text-xs text-purple-500 mt-2">
              AI is removing background, detecting colors & categorizing...
            </p>
          </div>
        )}

        {/* AI Results Summary */}
        {enableAI && aiResult && !isAIProcessing && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-700">AI Analysis Complete</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-white rounded-lg text-center">
                <div
                  className="w-6 h-6 rounded-full mx-auto mb-1 border-2 border-white shadow-sm"
                  style={{ backgroundColor: aiResult.colors.dominant }}
                />
                <span className="text-slate-600">{aiResult.colors.colorName}</span>
              </div>
              <div className="p-2 bg-white rounded-lg text-center">
                <Shirt className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                <span className="text-slate-600 capitalize">{aiResult.category.category}</span>
              </div>
              <div className="p-2 bg-white rounded-lg text-center">
                <span className="text-lg mb-1 block">✨</span>
                <span className="text-slate-600">BG Removed</span>
              </div>
            </div>
          </div>
        )}

        <FormField
          control={formInstance.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Image
                {enableAI && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    AI Enhanced
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value}
                  onChange={field.onChange}
                  onFileSelect={enableAI ? handleAIProcess : undefined}
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
          <LuxuryButton type="submit" className="w-full">{submitLabel}</LuxuryButton>
        </DialogFooter>
      </form>
    </Form>
  );

  // Brand colors
  const burgundy = "#80163a";
  const gold = "#D4A54A";

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-[#faf9f7]">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <NavigationBar />
      </div>

      {/* Mobile Header - Light Theme */}
      <header
        className="md:hidden sticky top-0 z-40 px-4 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-1" style={{ color: burgundy }}>
              The Archive
            </p>
            <h1 className="font-serif text-2xl font-medium text-slate-900">
              Closet
            </h1>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <LuxuryButton size="sm" className="rounded-full gap-2">
                <Plus className="h-4 w-4" />
                Add
              </LuxuryButton>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-200">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-slate-900 flex items-center gap-3">
                  Add New Item
                  <span className="text-[10px] px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    AI Powered
                  </span>
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-base">
                  Upload an image and AI will automatically remove the background, detect colors, and suggest a category.
                </DialogDescription>
              </DialogHeader>
              <ItemForm formInstance={form} onSubmit={onSubmitAdd} submitLabel="Add Item" enableAI={true} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Desktop Hero Header */}
      <div className="hidden md:block px-6 py-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: burgundy }}>
              The Archive
            </p>
            <h1 className="font-serif text-4xl font-medium text-slate-900">
              Your Closet
            </h1>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <LuxuryButton className="rounded-full gap-2 h-12 px-6">
                <Plus className="h-5 w-5" />
                Add Item
              </LuxuryButton>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-slate-200">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-slate-900 flex items-center gap-3">
                  Add New Item
                  <span className="text-[10px] px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    AI Powered
                  </span>
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-base">
                  Upload an image and AI will automatically remove the background, detect colors, and suggest a category.
                </DialogDescription>
              </DialogHeader>
              <ItemForm formInstance={form} onSubmit={onSubmitAdd} submitLabel="Add Item" enableAI={true} />
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>

      <main className="px-4 py-4 md:px-6 md:max-w-6xl md:mx-auto">
        {/* Search & Filter */}
        <section className="mb-4">
          <div className="mb-3">
            <SearchInput
              placeholder="Search your archive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>

          {/* Category Tabs - Light Theme */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                categoryFilter === 'all'
                  ? 'text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
              style={categoryFilter === 'all' ? { background: gold } : {}}
            >
              All ({wardrobeItems?.length || 0})
            </button>
            {clothingCategories.map(cat => {
              const count = wardrobeItems?.filter(item => item.category === cat.value).length || 0;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                    categoryFilter === cat.value
                      ? 'text-white shadow-md'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                  style={categoryFilter === cat.value ? { background: gold } : {}}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </section>

        {/* Results Count */}
        {filteredItems.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-slate-500">
              {filteredItems.length} items
            </span>
            <div className="flex gap-1 p-1 rounded-lg bg-slate-100">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <WardrobeItemSkeleton key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <GlassCard className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: `${gold}20`, border: `1px solid ${gold}40` }}>
              <Shirt className="h-9 w-9" style={{ color: gold }} />
            </div>
            <h3 className="font-serif text-2xl font-medium mb-3 text-slate-900">
              {searchQuery ? 'No matches found' : 'Your archive is empty'}
            </h3>
            <p className="text-sm mb-8 max-w-xs mx-auto text-slate-500">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Start building your digital wardrobe by adding your first piece'}
            </p>
            {!searchQuery && (
              <LuxuryButton
                onClick={() => setIsAddDialogOpen(true)}
                className="rounded-full gap-2 h-12 px-6"
              >
                <Plus className="h-4 w-4" />
                Add Your First Item
              </LuxuryButton>
            )}
          </GlassCard>
        ) : viewMode === 'grid' ? (
          <MasonryGrid columns={{ sm: 2, md: 3, lg: 4 }} gap={16}>
            {filteredItems.map((item, index) => (
              <LuxuryCard
                key={item.id}
                className="group"
                delay={index * 0.05}
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  className="relative aspect-[3/4] bg-slate-50 rounded-t-xl overflow-hidden"
                >
                  {item.imageUrl ? (
                    <LazyImage
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Shirt className="h-8 w-8 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 bg-black/40">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        HapticFeedback.selection();
                        setEditingItem(item);
                      }}
                      className="h-10 w-10 rounded-xl bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Edit className="h-4 w-4 text-slate-700" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        HapticFeedback.heavy();
                        handleDelete(item.id);
                      }}
                      className="h-10 w-10 rounded-xl bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </motion.button>
                  </div>
                </motion.div>
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate mb-0.5 text-slate-900">
                    {item.name}
                  </h3>
                  <p className="text-xs capitalize text-slate-500">
                    {item.category}
                  </p>
                  {item.color && (
                    <span className="inline-block mt-2 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {item.color}
                    </span>
                  )}
                </div>
              </LuxuryCard>
            ))}
          </MasonryGrid>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <GlassCard
                key={item.id}
                className="flex overflow-hidden p-0"
                hoverEffect
              >
                <div className="w-20 h-20 flex-shrink-0 bg-slate-50">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Shirt className="h-6 w-6 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm mb-0.5 text-slate-900">
                      {item.name}
                    </h3>
                    <p className="text-xs capitalize text-slate-500">
                      {item.category}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {item.color && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white/10 text-[#D4AF37]">
                          {item.color}
                        </span>
                      )}
                      {item.season && item.season !== 'all' && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold capitalize bg-[#39FF14]/10 text-[#39FF14]">
                          {item.season}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditingItem(item)}
                      className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <Edit className="h-4 w-4 text-[#A0A3BD]" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(item.id)}
                      className="h-9 w-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </motion.button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>

      {/* Edit Dialog - NeoPOP Dark */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-[24px]" style={{ background: '#1E1F2E', border: '1px solid rgba(255,255,255,0.1)' }}>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#F5F0E6]">Edit Item</DialogTitle>
            <DialogDescription className="text-[#A0A3BD]">Update the details of this wardrobe item.</DialogDescription>
          </DialogHeader>
          <ItemForm formInstance={editForm} onSubmit={onSubmitEdit} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
