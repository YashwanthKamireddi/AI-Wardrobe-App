import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, Layers, Heart } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import NavigationBar from "@/components/navigation-bar";
import OutfitCard from "@/components/outfit-card";
import { useOutfits, useCreateOutfit, useDeleteOutfit } from "@/hooks/use-outfits";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { seasons, moodTypes } from "@shared/schema";

const createOutfitFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  items: z.array(z.number()).min(1, "Select at least one item"),
  occasion: z.string().optional(),
  season: z.string().optional(),
  weatherConditions: z.string().optional(),
  mood: z.string().optional(),
  favorite: z.boolean().optional(),
});

type CreateOutfitFormData = z.infer<typeof createOutfitFormSchema>;

export function OutfitPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: outfits, isLoading: outfitsLoading } = useOutfits();
  const { data: wardrobeItems, isLoading: wardrobeLoading } = useWardrobeItems();
  const createOutfit = useCreateOutfit();
  const deleteOutfit = useDeleteOutfit();

  const form = useForm<CreateOutfitFormData>({
    resolver: zodResolver(createOutfitFormSchema),
    defaultValues: {
      name: "",
      description: "",
      items: [],
      occasion: "",
      season: "",
      weatherConditions: "",
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

      if (selectedCategory === 'all') return matchesSearch;
      if (selectedCategory === 'favorites') return matchesSearch && outfit.favorite;
      return matchesSearch && outfit.occasion === selectedCategory;
    });
  }, [outfits, searchQuery, selectedCategory]);

  const getOutfitItems = (outfitItemIds: number[]) => {
    if (!wardrobeItems) return [];
    return wardrobeItems.filter(item => outfitItemIds.includes(item.id));
  };

  const onSubmit = async (data: CreateOutfitFormData) => {
    await createOutfit.mutateAsync({
      name: data.name,
      description: data.description || null,
      items: data.items,
      occasion: data.occasion || null,
      season: data.season || null,
      weatherConditions: data.weatherConditions || null,
      mood: data.mood || null,
      favorite: data.favorite || false,
    });
    
    setIsCreateDialogOpen(false);
    form.reset();
  };

  const handleDelete = (id: number) => {
    deleteOutfit.mutate(id);
  };

  const toggleItemSelection = (itemId: number) => {
    const currentItems = selectedItems;
    if (currentItems.includes(itemId)) {
      form.setValue('items', currentItems.filter(id => id !== itemId));
    } else {
      form.setValue('items', [...currentItems, itemId]);
    }
  };

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

  const isLoading = outfitsLoading || wardrobeLoading;

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
              Your Ensembles
            </h1>
            <p className="text-muted-foreground font-fashion-body mt-1">
              Create and manage your outfits
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="button-create-outfit"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md"
                disabled={!wardrobeItems || wardrobeItems.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Outfit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-fashion-heading text-amber-900">
                  Create New Outfit
                </DialogTitle>
                <DialogDescription className="font-fashion-body">
                  Select wardrobe items to create a complete outfit.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Outfit Name</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-outfit-name"
                              placeholder="Summer Casual Look"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="occasion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occasion (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-occasion">
                                <SelectValue placeholder="Select occasion" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="party">Party</SelectItem>
                              <SelectItem value="formal">Formal</SelectItem>
                              <SelectItem value="athletic">Athletic</SelectItem>
                              <SelectItem value="date">Date Night</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-description"
                              placeholder="Perfect for a weekend brunch..."
                              {...field}
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
                          <FormLabel>Season (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
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
                      name="mood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mood (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-mood">
                                <SelectValue placeholder="Select mood" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {moodTypes.map(mood => (
                                <SelectItem key={mood.value} value={mood.value}>
                                  {mood.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="items"
                    render={() => (
                      <FormItem>
                        <FormLabel>Select Items ({selectedItems.length} selected)</FormLabel>
                        <FormDescription>
                          Choose wardrobe items to include in this outfit
                        </FormDescription>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2 max-h-[300px] overflow-y-auto p-2 border rounded-md">
                          {wardrobeItems?.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => toggleItemSelection(item.id)}
                              className={`relative cursor-pointer rounded-md border-2 transition-all ${
                                selectedItems.includes(item.id)
                                  ? 'border-amber-500 ring-2 ring-amber-200'
                                  : 'border-gray-200 hover:border-amber-300'
                              }`}
                              data-testid={`item-select-${item.id}`}
                            >
                              <div className="aspect-square overflow-hidden rounded-md">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-1 bg-white">
                                <p className="text-xs font-medium truncate">{item.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {item.category}
                                </p>
                              </div>
                              {selectedItems.includes(item.id) && (
                                <div className="absolute top-1 right-1 bg-amber-500 text-white rounded-full p-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="favorite"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            data-testid="checkbox-favorite"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Mark as favorite
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createOutfit.isPending}
                      data-testid="button-submit"
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                    >
                      {createOutfit.isPending ? "Creating..." : "Create Outfit"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Filters */}
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
              placeholder="Search outfits..."
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

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
            <TabsList className="grid w-full md:w-auto grid-cols-4 md:grid-cols-6">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="favorites" data-testid="tab-favorites">
                <Heart className="h-3 w-3 mr-1" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="casual" data-testid="tab-casual">Casual</TabsTrigger>
              <TabsTrigger value="work" data-testid="tab-work">Work</TabsTrigger>
              <TabsTrigger value="party" data-testid="tab-party">Party</TabsTrigger>
              <TabsTrigger value="formal" data-testid="tab-formal">Formal</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Stats */}
        {outfits && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4 flex-wrap"
          >
            <Badge variant="outline" className="border-amber-300 text-amber-800 px-3 py-1">
              <Layers className="h-3 w-3 mr-1" />
              Total Outfits: {outfits.length}
            </Badge>
            <Badge variant="outline" className="border-amber-300 text-amber-800 px-3 py-1">
              Showing: {filteredOutfits.length}
            </Badge>
            <Badge variant="outline" className="border-amber-300 text-amber-800 px-3 py-1">
              <Heart className="h-3 w-3 mr-1" />
              Favorites: {outfits.filter(o => o.favorite).length}
            </Badge>
          </motion.div>
        )}

        {/* Outfits Grid */}
        {isLoading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOutfits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Card className="max-w-md mx-auto border-amber-200">
              <CardHeader>
                <CardTitle className="font-fashion-heading text-amber-900">
                  {outfits && outfits.length > 0 ? 'No Outfits Found' : 'No Outfits Yet'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-fashion-body mb-4">
                  {outfits && outfits.length > 0
                    ? 'Try adjusting your search or filters.'
                    : wardrobeItems && wardrobeItems.length === 0
                      ? 'Add wardrobe items first, then create outfits.'
                      : 'Start creating outfits with your wardrobe items.'}
                </p>
                {wardrobeItems && wardrobeItems.length > 0 && (!outfits || outfits.length === 0) && (
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    data-testid="button-create-first-outfit"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Outfit
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
            className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            data-testid="outfits-grid"
          >
            <AnimatePresence mode="popLayout">
              {filteredOutfits.map((outfit) => (
                <motion.div
                  key={outfit.id}
                  variants={itemVariants}
                  layout
                  data-testid={`outfit-${outfit.id}`}
                >
                  <OutfitCard
                    outfit={outfit}
                    items={getOutfitItems(outfit.items)}
                    onDelete={() => handleDelete(outfit.id)}
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
