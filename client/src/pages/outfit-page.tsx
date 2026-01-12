import { useState, useMemo } from "react";
import { Plus, Search, X, Layers, Heart, Trash2, Check } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('all');

  const { data: outfits, isLoading: outfitsLoading } = useOutfits();
  const { data: wardrobeItems } = useWardrobeItems();
  const createOutfit = useCreateOutfit();
  const deleteOutfit = useDeleteOutfit();

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
    } catch (error) {
      console.error('Failed to delete outfit:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24 md:pb-8">
      <NavigationBar />

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(38,75%,55%)]" />
              <span className="text-sm tracking-widest uppercase text-slate-400">Style</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-slate-900 mb-1">Your Outfits</h1>
            <p className="text-slate-500">{outfits?.length || 0} saved combinations</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="rounded-full px-6"
                style={{ background: "hsl(337, 73%, 26%)" }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Outfit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-slate-200">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl text-slate-900">Create New Outfit</DialogTitle>
                <DialogDescription className="text-slate-500">Combine your wardrobe items into a complete look.</DialogDescription>
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
                      className="w-full rounded-full"
                      style={{ background: "hsl(337, 73%, 26%)" }}
                    >
                      Create Outfit
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search outfits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full border-slate-200 bg-white focus:border-[hsl(337,73%,26%)]"
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
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="all" className="data-[state=active]:bg-[hsl(337,73%,26%)] data-[state=active]:text-white">All</TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-[hsl(337,73%,26%)] data-[state=active]:text-white">
                <Heart className="h-4 w-4 mr-1" />
                Favorites
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Results Count */}
        {filteredOutfits.length > 0 && (
          <div className="flex gap-3 mb-6">
            <Badge variant="outline" className="border-slate-200 text-slate-600">Showing: {filteredOutfits.length}</Badge>
          </div>
        )}

        {/* Content */}
        {outfitsLoading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-slate-100 bg-white">
                <Skeleton className="aspect-[4/3]" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOutfits.length === 0 ? (
          <div className="space-y-8">
            <Card className="max-w-md mx-auto border-slate-100 bg-white shadow-sm">
              <CardHeader className="text-center pb-2">
                <div
                  className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "hsl(337, 73%, 26%)10" }}
                >
                  <Layers className="h-7 w-7" style={{ color: "hsl(337, 73%, 26%)" }} />
                </div>
                <CardTitle className="font-serif text-2xl text-slate-900">
                  {outfits?.length ? 'No Matches Found' : 'Create Your First Outfit'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-slate-500">
                  {outfits?.length
                    ? 'Try adjusting your search.'
                    : 'Combine your wardrobe pieces into stunning outfits. Celura will help you style them perfectly.'}
                </p>
                {!outfits?.length && (
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="rounded-full px-6"
                    style={{ background: "hsl(337, 73%, 26%)" }}
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
                  <h3 className="font-serif text-xl text-slate-900 mb-1">Outfit Inspiration</h3>
                  <p className="text-slate-400 text-sm">Curated looks to inspire your style</p>
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
                    <Card key={idx} className="overflow-hidden border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => setIsCreateDialogOpen(true)}>
                      <div className="aspect-[4/3] flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${outfit.color}15 0%, ${outfit.color}30 100%)` }}>
                        <Layers className="w-20 h-20 transition-transform group-hover:scale-110" style={{ color: outfit.color }} />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-slate-900 mb-1">{outfit.name}</h4>
                        <p className="text-sm text-slate-500 mb-3">{outfit.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge className="bg-[hsl(337,73%,26%)]/10 text-[hsl(337,73%,26%)] text-xs hover:bg-[hsl(337,73%,26%)]/15">{outfit.occasion}</Badge>
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
                <Card key={outfit.id} className="group overflow-hidden border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                  {/* Outfit Preview */}
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <div className="grid grid-cols-2 gap-1 h-full p-2">
                      {outfitItems.slice(0, 4).map((item, idx) => (
                        <div key={item.id} className="bg-white rounded overflow-hidden">
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
                      <div className="absolute top-2 right-2 rounded-full p-1.5 shadow-md" style={{ background: "hsl(337, 73%, 26%)" }}>
                        <Heart className="h-4 w-4 fill-white text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(outfit.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
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
    </div>
  );
}
