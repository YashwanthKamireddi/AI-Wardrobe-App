import { useState, useMemo } from "react";
import { Plus, Search, X, Layers, Heart, Trash2, Check, Loader2, Shuffle, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { useOutfits, useCreateOutfit, useDeleteOutfit } from "@/hooks/use-outfits";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { seasons, moodTypes } from "@shared/schema";

const outfitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  items: z.array(z.number()).min(1, "Select at least one item"),
  occasion: z.string().optional(),
  season: z.string().optional(),
  mood: z.string().optional(),
  favorite: z.boolean().optional(),
});

type OutfitFormData = z.infer<typeof outfitSchema>;

export function OutfitPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [outfitToDelete, setOutfitToDelete] = useState<{ id: number; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [shuffledOutfit, setShuffledOutfit] = useState<any>(null);

  const { data: outfits, isLoading: outfitsLoading } = useOutfits();
  const { data: wardrobeItems } = useWardrobeItems();
  const createOutfit = useCreateOutfit();
  const deleteOutfit = useDeleteOutfit();

  // Fetch shuffled outfit
  const { refetch: fetchShuffle, isFetching: isShuffling } = useQuery({
    queryKey: ['outfit-shuffle'],
    queryFn: async () => {
      const response = await fetch('/api/outfit-shuffle', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to shuffle');
      const data = await response.json();
      setShuffledOutfit(data);
      return data;
    },
    enabled: false
  });

  const handleShuffle = () => {
    fetchShuffle();
  };

  const form = useForm<OutfitFormData>({
    resolver: zodResolver(outfitSchema),
    defaultValues: {
      name: "",
      description: "",
      items: [],
      occasion: "",
      season: "",
      mood: "",
      favorite: false,
    },
  });

  const selectedItems = form.watch('items') || [];

  const filteredOutfits = useMemo(() => {
    if (!outfits) return [];
    return outfits.filter(outfit => {
      const matchesSearch = outfit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outfit.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedTab === 'all') return matchesSearch;
      if (selectedTab === 'favorites') return matchesSearch && outfit.favorite;
      return matchesSearch;
    });
  }, [outfits, searchQuery, selectedTab]);

  const getOutfitItems = (itemIds: number[]) => {
    if (!wardrobeItems) return [];
    return wardrobeItems.filter(item => itemIds.includes(item.id));
  };

  const toggleItem = (itemId: number) => {
    const current = form.getValues('items') || [];
    const updated = current.includes(itemId)
      ? current.filter(id => id !== itemId)
      : [...current, itemId];
    form.setValue('items', updated, { shouldValidate: true });
  };

  const onSubmit = async (data: OutfitFormData) => {
    try {
      await createOutfit.mutateAsync(data);
      form.reset();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create outfit:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteOutfit.mutateAsync(id);
      setOutfitToDelete(null);
    } catch (error) {
      console.error('Failed to delete outfit:', error);
    }
  };

  const openDeleteDialog = (outfit: { id: number; name: string }) => {
    setOutfitToDelete(outfit);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24 md:pb-8">
      <NavigationBar />

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-4">
            <Layers className="w-4 h-4" style={{ color: 'hsl(38, 75%, 55%)' }} />
            <span className="text-sm font-medium text-slate-600">Style</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-2">Your Outfits</h1>
              <p className="text-slate-500 text-lg">{outfits?.length || 0} saved combinations</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-full px-5 h-12 shadow-sm hover:shadow-md transition-all"
                onClick={handleShuffle}
                disabled={isShuffling}
              >
                {isShuffling ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shuffle className="h-4 w-4 mr-2" />
                )}
                Shuffle
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="rounded-full px-6 h-12 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, hsl(337, 73%, 26%) 0%, hsl(337, 73%, 32%) 100%)" }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Outfit
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl rounded-[24px]">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl text-slate-900">Create New Outfit</DialogTitle>
                  <DialogDescription className="text-slate-500 text-base">Combine your wardrobe items into a complete look.</DialogDescription>
                </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Casual Friday" className="border-slate-200 focus:border-[hsl(337,73%,26%)]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Description</FormLabel>
                        <FormControl>
                          <Input placeholder="A relaxed look for the office..." className="border-slate-200 focus:border-[hsl(337,73%,26%)]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="occasion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">Occasion</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-slate-200">
                                <SelectValue placeholder="Select occasion" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white border-slate-200">
                              {['casual', 'work', 'formal', 'date', 'party', 'sport'].map(o => (
                                <SelectItem key={o} value={o}>
                                  {o.charAt(0).toUpperCase() + o.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="season"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">Season</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-slate-200">
                                <SelectValue placeholder="Select season" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white border-slate-200">
                              {seasons.map(s => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Item Selection */}
                  <FormField
                    control={form.control}
                    name="items"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Select Items ({selectedItems.length} selected)</FormLabel>
                        <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50">
                          {wardrobeItems?.map(item => (
                            <div
                              key={item.id}
                              onClick={() => toggleItem(item.id)}
                              className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                                selectedItems.includes(item.id)
                                  ? 'border-[hsl(337,73%,26%)] ring-2 ring-[hsl(337,73%,26%)]/20 shadow-md'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="relative aspect-square bg-white">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                    {item.name}
                                  </div>
                                )}
                                {selectedItems.includes(item.id) && (
                                  <div className="absolute top-1 right-1 rounded-full p-0.5 shadow-md" style={{ background: "hsl(337, 73%, 26%)" }}>
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="submit"
                      className="w-full rounded-full h-12 shadow-lg hover:shadow-xl transition-all"
                      style={{ background: "linear-gradient(135deg, hsl(337, 73%, 26%) 0%, hsl(337, 73%, 32%) 100%)" }}
                    >
                      Create Outfit
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
            </div>
          </div>
        </header>

        {/* Shuffled Outfit Card */}
        {shuffledOutfit && shuffledOutfit.items && (
          <Card className="mb-8 border-0 shadow-xl overflow-hidden rounded-[24px] bg-gradient-to-r from-amber-50 to-rose-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span className="font-serif text-xl font-semibold text-slate-900">Today's Shuffle</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShuffledOutfit(null)}
                  className="rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {shuffledOutfit.items.map((item: any, index: number) => (
                  <div key={index} className="flex-shrink-0 w-20">
                    <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Layers className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-center mt-1 text-slate-600 truncate">{item.name}</p>
                  </div>
                ))}
              </div>
              {shuffledOutfit.message && (
                <p className="text-sm text-slate-600 mt-3 italic">{shuffledOutfit.message}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search outfits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-[hsl(337,73%,26%)] focus:shadow-md transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors" />
              </button>
            )}
          </div>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="bg-white border border-slate-200 rounded-full h-12 p-1">
              <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-[hsl(337,73%,26%)] data-[state=active]:text-white">All</TabsTrigger>
              <TabsTrigger value="favorites" className="rounded-full data-[state=active]:bg-[hsl(337,73%,26%)] data-[state=active]:text-white">
                <Heart className="h-4 w-4 mr-1" />
                Favorites
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Results Count */}
        {filteredOutfits.length > 0 && (
          <div className="flex gap-3 mb-6">
            <Badge variant="outline" className="border-slate-200 text-slate-600 rounded-full px-4 py-1">Showing: {filteredOutfits.length}</Badge>
          </div>
        )}

        {/* Content */}
        {outfitsLoading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-0 shadow-lg rounded-[24px] bg-white">
                <Skeleton className="aspect-[4/3] rounded-t-[24px]" />
                <CardContent className="p-5">
                  <Skeleton className="h-5 w-3/4 mb-2 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOutfits.length === 0 ? (
          <div className="space-y-8">
            <Card className="max-w-md mx-auto border-0 shadow-xl rounded-[24px] bg-white">
              <CardHeader className="text-center pb-2 pt-8">
                <div
                  className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "hsl(337, 73%, 26%)10" }}
                >
                  <Layers className="h-8 w-8" style={{ color: "hsl(337, 73%, 26%)" }} />
                </div>
                <CardTitle className="font-serif text-2xl text-slate-900">
                  {outfits?.length ? 'No Matches Found' : 'Create Your First Outfit'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4 pb-8">
                <p className="text-slate-500 text-lg">
                  {outfits?.length
                    ? 'Try adjusting your search.'
                    : 'Combine your wardrobe pieces into stunning outfits. Celura will help you style them perfectly.'}
                </p>
                {!outfits?.length && (
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="rounded-full px-6 h-12 shadow-lg hover:shadow-xl transition-all"
                    style={{ background: "linear-gradient(135deg, hsl(337, 73%, 26%) 0%, hsl(337, 73%, 32%) 100%)" }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Outfit
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Outfit Inspiration */}
            {!outfits?.length && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="font-serif text-2xl text-slate-900 mb-2">Outfit Inspiration</h3>
                  <p className="text-slate-400 text-base">Curated looks to inspire your style</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: 'Business Casual',
                      occasion: 'Work',
                      items: 4,
                      color: '#4f46e5',
                      description: 'Professional yet relaxed'
                    },
                    {
                      name: 'Weekend Brunch',
                      occasion: 'Casual',
                      items: 3,
                      color: '#f59e0b',
                      description: 'Effortlessly chic'
                    },
                    {
                      name: 'Evening Elegance',
                      occasion: 'Formal',
                      items: 5,
                      color: 'hsl(337, 73%, 26%)',
                      description: 'Sophisticated glamour'
                    },
                  ].map((outfit, idx) => (
                    <Card key={idx} className="overflow-hidden border-0 shadow-lg rounded-[24px] bg-white hover:shadow-xl transition-all group cursor-pointer hover:-translate-y-1" onClick={() => setIsCreateDialogOpen(true)}>
                      <div className="aspect-[4/3] flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${outfit.color}15 0%, ${outfit.color}30 100%)` }}>
                        <Layers className="w-20 h-20 transition-transform group-hover:scale-110" style={{ color: outfit.color }} />
                      </div>
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-slate-900 text-lg mb-1">{outfit.name}</h4>
                        <p className="text-sm text-slate-500 mb-3">{outfit.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge className="rounded-full bg-[hsl(337,73%,26%)]/10 text-[hsl(337,73%,26%)] text-xs hover:bg-[hsl(337,73%,26%)]/15">{outfit.occasion}</Badge>
                          <span className="text-xs text-slate-400">{outfit.items} pieces</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOutfits.map((outfit) => {
              const outfitItems = getOutfitItems(outfit.items || []);
              return (
                <Card key={outfit.id} className="group overflow-hidden border-0 shadow-lg rounded-[24px] bg-white hover:shadow-xl transition-all hover:-translate-y-1">
                  {/* Outfit Preview */}
                  <div className="relative aspect-[4/3] bg-slate-100 rounded-t-[24px] overflow-hidden">
                    <div className="grid grid-cols-2 gap-1 h-full p-2">
                      {outfitItems.slice(0, 4).map((item, idx) => (
                        <div key={item.id} className="bg-white rounded-lg overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs p-1 text-center">
                              {item.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {outfit.favorite && (
                      <div className="absolute top-3 right-3 rounded-full p-2 shadow-md" style={{ background: "hsl(337, 73%, 26%)" }}>
                        <Heart className="h-4 w-4 fill-white text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog({ id: outfit.id, name: outfit.name });
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-medium text-slate-900 mb-1">{outfit.name}</h3>
                    {outfit.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-2">{outfit.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {outfit.occasion && (
                        <Badge className="text-xs capitalize bg-[hsl(337,73%,26%)]/10 text-[hsl(337,73%,26%)] hover:bg-[hsl(337,73%,26%)]/15">{outfit.occasion}</Badge>
                      )}
                      {outfit.season && outfit.season !== 'all' && (
                        <Badge variant="outline" className="text-xs capitalize border-slate-200 text-slate-500">{outfit.season}</Badge>
                      )}
                      <Badge variant="outline" className="text-xs border-slate-200 text-slate-500">
                        {outfitItems.length} items
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Outfit"
        description={`Are you sure you want to delete "${outfitToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        onConfirm={async () => {
          if (outfitToDelete) {
            await handleDelete(outfitToDelete.id);
          }
        }}
        isLoading={deleteOutfit.isPending}
      />
    </div>
  );
}
