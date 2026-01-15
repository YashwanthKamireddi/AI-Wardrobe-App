import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Layers,
  Grid3X3,
  Heart,
  User,
  Sparkles,
  Check,
  ChevronDown,
  Shirt,
  Camera,
} from "lucide-react";

import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * COMPOSE PAGE - EDITORIAL OUTFIT BUILDER
 *
 * Design: Clean slot-based outfit composition
 * Focus: Visual outfit building with AI assistance
 */

interface OutfitSlot {
  id: string;
  category: string;
  label: string;
  item: any | null;
}

const INITIAL_SLOTS: OutfitSlot[] = [
  { id: "top", category: "tops", label: "Top", item: null },
  { id: "bottom", category: "bottoms", label: "Bottom", item: null },
  { id: "outerwear", category: "outerwear", label: "Outerwear", item: null },
  { id: "shoes", category: "shoes", label: "Shoes", item: null },
  { id: "accessory", category: "accessories", label: "Accessory", item: null },
];

const CATEGORIES = ["all", "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "bags"];

export function ComposePage() {
  const queryClient = useQueryClient();
  const { data: wardrobeItems, isLoading } = useWardrobeItems();
  const [slots, setSlots] = useState<OutfitSlot[]>(INITIAL_SLOTS);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [outfitName, setOutfitName] = useState("");

  const saveOutfitMutation = useMutation({
    mutationFn: async (outfit: any) => {
      const response = await fetch("/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(outfit),
      });
      if (!response.ok) throw new Error("Failed to save outfit");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
      setSlots(INITIAL_SLOTS);
      setOutfitName("");
    },
  });

  const filteredItems = useMemo(() => {
    if (!wardrobeItems) return [];
    if (activeCategory === "all" && selectedSlot) {
      const slot = slots.find(s => s.id === selectedSlot);
      if (slot) {
        return wardrobeItems.filter(item => {
          if (slot.category === "tops") return item.category === "tops";
          if (slot.category === "bottoms") return ["bottoms", "pants", "skirts", "shorts"].includes(item.category);
          if (slot.category === "outerwear") return ["outerwear", "jackets", "coats"].includes(item.category);
          if (slot.category === "shoes") return item.category === "shoes";
          if (slot.category === "accessories") return ["accessories", "bags", "jewelry", "hats", "scarves"].includes(item.category);
          return true;
        });
      }
    }
    if (activeCategory === "all") return wardrobeItems;
    return wardrobeItems.filter(item => item.category === activeCategory);
  }, [wardrobeItems, activeCategory, selectedSlot, slots]);

  const filledSlots = slots.filter(s => s.item !== null).length;
  const canSave = filledSlots >= 2 && outfitName.trim().length > 0;

  const handleSelectItem = (item: any) => {
    if (!selectedSlot) return;
    setSlots(prev => prev.map(slot =>
      slot.id === selectedSlot ? { ...slot, item } : slot
    ));
    setSelectedSlot(null);
  };

  const handleClearSlot = (slotId: string) => {
    setSlots(prev => prev.map(slot =>
      slot.id === slotId ? { ...slot, item: null } : slot
    ));
  };

  const handleSaveOutfit = () => {
    if (!canSave) return;
    const itemIds = slots.filter(s => s.item).map(s => s.item!.id);
    saveOutfitMutation.mutate({
      name: outfitName,
      itemIds,
      occasion: "casual",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7] pb-24 md:pb-0">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#F9F9F7]/95 backdrop-blur-xl border-b border-[#E5E5E5]/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><span className="text-lg tracking-[0.2em] text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>CELURA</span></Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/home"><span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Home</span></Link>
            <Link href="/wardrobe"><span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Wardrobe</span></Link>
            <Link href="/compose"><span className="text-xs tracking-[0.15em] uppercase text-[#1A1A1A] font-medium">Compose</span></Link>
            <Link href="/profile"><span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Profile</span></Link>
          </div>
          <Link href="/profile"><motion.div className="w-10 h-10 rounded-full bg-[#E5E5E5] flex items-center justify-center" whileHover={{ scale: 1.05 }}><User className="w-5 h-5 text-[#6B6B6B]" /></motion.div></Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <motion.header className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-2">Create</p>
          <h1 className="text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            Compose Outfit
          </h1>
          <p className="text-[#6B6B6B] text-lg">Build your perfect look piece by piece</p>
        </motion.header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Outfit Slots */}
          <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            {/* Outfit Name Input */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Name your outfit..."
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#E5E5E5] text-[#1A1A1A] placeholder-[#9A9A9A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                style={{ fontFamily: "'Playfair Display', serif" }}
              />
            </div>

            {/* Slots Grid */}
            <div className="space-y-3">
              {slots.map((slot, i) => (
                <motion.div
                  key={slot.id}
                  className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedSlot === slot.id
                      ? "border-[#1A1A1A] bg-white"
                      : slot.item
                        ? "border-[#E5E5E5] bg-white"
                        : "border-dashed border-[#D5D5D5] bg-[#FAFAFA]"
                  }`}
                  onClick={() => setSelectedSlot(slot.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center gap-4">
                    {/* Item Preview or Placeholder */}
                    <div className="w-16 h-16 rounded-xl bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
                      {slot.item ? (
                        <img
                          src={slot.item.imageUrl}
                          alt={slot.item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Plus className="w-5 h-5 text-[#9A9A9A]" />
                      )}
                    </div>

                    {/* Slot Info */}
                    <div className="flex-1">
                      <p className="text-xs text-[#9A9A9A] uppercase tracking-wider mb-1">{slot.label}</p>
                      <p className="text-sm text-[#1A1A1A] font-medium">
                        {slot.item ? slot.item.name : "Select an item"}
                      </p>
                    </div>

                    {/* Clear Button */}
                    {slot.item && (
                      <motion.button
                        className="p-2 rounded-full bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5] hover:text-[#1A1A1A]"
                        onClick={(e) => { e.stopPropagation(); handleClearSlot(slot.id); }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <motion.button
                className="flex-1 py-4 rounded-xl bg-[#1A1A1A] text-white text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canSave || saveOutfitMutation.isPending}
                onClick={handleSaveOutfit}
                whileHover={canSave ? { scale: 1.02 } : {}}
                whileTap={canSave ? { scale: 0.98 } : {}}
              >
                {saveOutfitMutation.isPending ? "SAVING..." : "SAVE OUTFIT"}
              </motion.button>
              <motion.button
                className="px-6 py-4 rounded-xl bg-white border border-[#E5E5E5] text-[#1A1A1A] text-sm tracking-wider flex items-center gap-2"
                whileHover={{ scale: 1.02, backgroundColor: "#FAFAFA" }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-4 h-4" />
                AI ASSIST
              </motion.button>
            </div>
          </motion.section>

          {/* Item Picker */}
          <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="sticky top-24">
              {/* Category Filter */}
              <div className="mb-4 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 min-w-max pb-2">
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat}
                      className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all ${
                        activeCategory === cat
                          ? "bg-[#1A1A1A] text-white"
                          : "bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
                      }`}
                      onClick={() => setActiveCategory(cat)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Items Grid */}
              <div className="rounded-3xl bg-white border border-[#E5E5E5]/50 p-4 max-h-[60vh] overflow-y-auto">
                {selectedSlot ? (
                  <div className="grid grid-cols-3 gap-3">
                    {filteredItems.map((item) => (
                      <motion.div
                        key={item.id}
                        className="aspect-square rounded-xl bg-[#F5F5F5] overflow-hidden cursor-pointer relative group"
                        onClick={() => handleSelectItem(item)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      </motion.div>
                    ))}
                    {filteredItems.length === 0 && (
                      <div className="col-span-3 py-12 text-center text-[#9A9A9A]">
                        <Shirt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No items found</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-16 text-center text-[#9A9A9A]">
                    <ChevronDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a slot to add items</p>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E5E5E5]/50 px-6 py-3">
        <div className="flex items-center justify-around">
          {[
            { href: "/home", icon: Grid3X3, label: "Home" },
            { href: "/wardrobe", icon: Layers, label: "Wardrobe" },
            { href: "/outfits", icon: Heart, label: "Outfits" },
            { href: "/profile", icon: User, label: "Profile" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex flex-col items-center gap-1 text-[#9A9A9A]">
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

export default ComposePage;
