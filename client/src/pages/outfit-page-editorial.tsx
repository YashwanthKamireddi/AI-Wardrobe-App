import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Plus, Search, X, Layers, Heart, Trash2, Check, Loader2, Grid3X3, User, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

import { useOutfits, useCreateOutfit, useDeleteOutfit } from "@/hooks/use-outfits";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { seasons, moodTypes } from "@shared/schema";

/**
 * OUTFITS PAGE - EDITORIAL GALLERY
 *
 * Design: Magazine-style outfit presentation
 * Focus: Visual storytelling through outfit combinations
 */

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
  const [showFilters, setShowFilters] = useState(false);

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

  const filteredOutfits = useMemo(() => {
    if (!outfits) return [];
    return outfits.filter(outfit => {
      const matchesSearch =
        outfit.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outfit.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab =
        selectedTab === 'all' ||
        (selectedTab === 'favorites' && outfit.favorite);
      return matchesSearch && matchesTab;
    });
  }, [outfits, searchQuery, selectedTab]);

  const onSubmit = async (data: OutfitFormData) => {
    try {
      await createOutfit.mutateAsync({
        ...data,
        items: data.items,
      });
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

  const getItemImage = (itemId: number) => {
    const item = wardrobeItems?.find(i => i.id === itemId);
    return item?.imageUrl;
  };

  const inputClass = `
    w-full h-12 px-4 bg-[#F5F5F5]
    text-[#1A1A1A] text-sm placeholder:text-[#9A9A9A]
    border-0 rounded-lg
    focus:ring-2 focus:ring-[#1A1A1A]/10 focus:outline-none
    transition-all duration-300
  `;

  // Loading State
  if (outfitsLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#6B6B6B]">Loading your outfits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7] pb-24 md:pb-0">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#F9F9F7]/95 backdrop-blur-xl border-b border-[#E5E5E5]/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <span
              className="text-lg tracking-[0.2em] text-[#1A1A1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              CELURA
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/home">
              <span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Home</span>
            </Link>
            <Link href="/wardrobe">
              <span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Wardrobe</span>
            </Link>
            <Link href="/outfits">
              <span className="text-xs tracking-[0.15em] uppercase text-[#1A1A1A] font-medium">Outfits</span>
            </Link>
            <Link href="/inspiration">
              <span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Inspiration</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/profile">
              <motion.div
                className="w-10 h-10 rounded-full bg-[#E5E5E5] flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <User className="w-5 h-5 text-[#6B6B6B]" />
              </motion.div>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-2">
                Collection
              </p>
              <h1
                className="text-[#1A1A1A]"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  lineHeight: 1.1
                }}
              >
                Your Outfits
              </h1>
            </div>
            <motion.button
              onClick={() => setIsCreateDialogOpen(true)}
              className="h-12 px-6 bg-[#1A1A1A] text-[#F9F9F7] text-sm font-medium rounded-full flex items-center gap-2"
              whileHover={{ backgroundColor: "#80163A" }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Outfit</span>
            </motion.button>
          </div>
        </motion.header>

        {/* Search & Filters */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9A9A9A]" />
              <input
                type="text"
                placeholder="Search outfits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white border border-[#E5E5E5] rounded-full text-sm text-[#1A1A1A] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
              />
            </div>

            {/* Tab Filters */}
            <div className="flex p-1 rounded-full bg-white border border-[#E5E5E5]">
              <button
                onClick={() => setSelectedTab('all')}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedTab === 'all'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#6B6B6B]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedTab('favorites')}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedTab === 'favorites'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#6B6B6B]'
                }`}
              >
                <Heart className="w-3 h-3 inline mr-1" />
                Favorites
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          className="flex items-center gap-6 mb-8 text-sm text-[#6B6B6B]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span>{filteredOutfits.length} outfits</span>
          {searchQuery && (
            <span className="flex items-center gap-2">
              matching "{searchQuery}"
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#9A9A9A] hover:text-[#1A1A1A]"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </motion.div>

        {/* Outfits Grid */}
        {filteredOutfits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOutfits.map((outfit, index) => (
              <motion.div
                key={outfit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <motion.div
                  className="group relative bg-white rounded-3xl overflow-hidden border border-[#E5E5E5]/50"
                  whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
                >
                  {/* Items Preview Grid */}
                  <div className="grid grid-cols-2 gap-1 p-4">
                    {(Array.isArray(outfit.items) ? outfit.items : []).slice(0, 4).map((itemId: number, idx: number) => {
                      const imageUrl = getItemImage(itemId);
                      return (
                        <div
                          key={idx}
                          className="aspect-square rounded-xl bg-[#F5F5F5] overflow-hidden"
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Grid3X3 className="w-6 h-6 text-[#D5D5D5]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Info */}
                  <div className="p-4 pt-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className="text-lg text-[#1A1A1A]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {outfit.name}
                      </h3>
                      {outfit.favorite && (
                        <Heart className="w-4 h-4 text-[#80163A] fill-[#80163A]" />
                      )}
                    </div>

                    {outfit.description && (
                      <p className="text-sm text-[#6B6B6B] line-clamp-2 mb-3">
                        {outfit.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#9A9A9A]">
                        {(Array.isArray(outfit.items) ? outfit.items : []).length} items
                      </span>
                      <motion.button
                        onClick={() => handleDelete(outfit.id)}
                        className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ backgroundColor: "#FEE2E2" }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-4 h-4 text-[#B44141]" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="py-24 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
              <Layers className="w-8 h-8 text-[#D5D5D5]" />
            </div>
            <h3
              className="text-xl text-[#1A1A1A] mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {searchQuery ? 'No outfits found' : 'No outfits yet'}
            </h3>
            <p className="text-sm text-[#6B6B6B] mb-8 max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Create your first outfit by combining items from your wardrobe'}
            </p>
            {!searchQuery && (
              <motion.button
                onClick={() => setIsCreateDialogOpen(true)}
                className="h-12 px-8 bg-[#1A1A1A] text-[#F9F9F7] text-sm font-medium rounded-full inline-flex items-center gap-2"
                whileHover={{ backgroundColor: "#80163A" }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                Create Your First Outfit
              </motion.button>
            )}
          </motion.div>
        )}
      </main>

      {/* Create Outfit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-[#F9F9F7] border-0 rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle
              className="text-2xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Create Outfit
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Name</FormLabel>
                    <FormControl>
                      <input
                        placeholder="Weekend Casual"
                        className={inputClass}
                        {...field}
                      />
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
                    <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Description</FormLabel>
                    <FormControl>
                      <input
                        placeholder="Perfect for lazy Sunday brunches"
                        className={inputClass}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Item Selection */}
              <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">
                      Select Items ({field.value?.length || 0} selected)
                    </FormLabel>
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-[#F5F5F5] rounded-xl">
                      {wardrobeItems?.map(item => {
                        const isSelected = field.value?.includes(item.id);
                        return (
                          <motion.button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const newValue = isSelected
                                ? field.value.filter((id: number) => id !== item.id)
                                : [...(field.value || []), item.id];
                              field.onChange(newValue);
                            }}
                            className={`aspect-square rounded-lg overflow-hidden relative border-2 transition-all ${
                              isSelected ? 'border-[#1A1A1A]' : 'border-transparent'
                            }`}
                            whileTap={{ scale: 0.95 }}
                          >
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#E5E5E5] flex items-center justify-center">
                                <Grid3X3 className="w-4 h-4 text-[#9A9A9A]" />
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="season"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Season</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-[#F5F5F5] border-0 rounded-lg">
                            <SelectValue placeholder="Any" />
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
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Mood</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-[#F5F5F5] border-0 rounded-lg">
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {moodTypes.map(m => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
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
                name="occasion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-wider uppercase text-[#6B6B6B]">Occasion</FormLabel>
                    <FormControl>
                      <input
                        placeholder="Brunch, Work, Date night..."
                        className={inputClass}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <motion.button
                type="submit"
                disabled={createOutfit.isPending}
                className="w-full h-12 bg-[#1A1A1A] text-[#F9F9F7] text-sm font-medium rounded-full disabled:opacity-50"
                whileHover={{ backgroundColor: "#80163A" }}
                whileTap={{ scale: 0.98 }}
              >
                {createOutfit.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Create Outfit"
                )}
              </motion.button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E5E5E5]/50 px-6 py-3">
        <div className="flex items-center justify-around">
          {[
            { href: "/home", icon: Grid3X3, label: "Home" },
            { href: "/wardrobe", icon: Layers, label: "Wardrobe" },
            { href: "/outfits", icon: Heart, label: "Outfits", active: true },
            { href: "/profile", icon: User, label: "Profile" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center gap-1 ${item.active ? "text-[#1A1A1A]" : "text-[#9A9A9A]"}`}>
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] tracking-wider">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default OutfitPage;
