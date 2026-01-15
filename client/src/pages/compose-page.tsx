import { useState } from "react";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import NavigationBar from "@/components/navigation-bar";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Save,
  Trash2,
  Wand2,
  Layers,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WardrobeItem } from "@shared/schema";

type OutfitSlot = {
  id: string;
  label: string;
  category: string;
  item: WardrobeItem | null;
};

const OUTFIT_SLOTS: OutfitSlot[] = [
  { id: "top", label: "Top", category: "tops", item: null },
  { id: "bottom", label: "Bottom", category: "bottoms", item: null },
  { id: "outerwear", label: "Layer", category: "outerwear", item: null },
  { id: "shoes", label: "Shoes", category: "shoes", item: null },
  { id: "accessory", label: "Accessory", category: "accessories", item: null },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "outerwear", label: "Layers" },
  { id: "shoes", label: "Shoes" },
  { id: "accessories", label: "Accessories" },
];

export function ComposePage() {
  const { data: items } = useWardrobeItems();
  const [outfitSlots, setOutfitSlots] = useState<OutfitSlot[]>(OUTFIT_SLOTS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSlot, setSelectedSlot] = useState<string | null>("top");

  // Filter items by category
  const filteredItems = items?.filter((item: WardrobeItem) => {
    return item.category?.toLowerCase() === selectedCategory;
  }) || [];

  // Add item to selected slot
  const addItemToSlot = (item: WardrobeItem) => {
    if (!selectedSlot) return;

    setOutfitSlots(slots =>
      slots.map(slot =>
        slot.id === selectedSlot
          ? { ...slot, item }
          : slot
      )
    );

    // Auto-advance to next empty slot
    const currentIndex = outfitSlots.findIndex(s => s.id === selectedSlot);
    const nextEmpty = outfitSlots.find((s, i) => i > currentIndex && !s.item);
    if (nextEmpty) {
      setSelectedSlot(nextEmpty.id);
    }
  };

  // Remove item from slot
  const removeItemFromSlot = (slotId: string) => {
    setOutfitSlots(slots =>
      slots.map(slot =>
        slot.id === slotId ? { ...slot, item: null } : slot
      )
    );
  };

  // Clear all slots
  const clearOutfit = () => {
    setOutfitSlots(OUTFIT_SLOTS);
    setSelectedSlot("top");
  };

  // Count filled slots
  const filledSlots = outfitSlots.filter(s => s.item).length;

  return (
    <div
      className="min-h-screen pb-24 md:pb-8"
      style={{ background: '#faf9f7' }}
    >
      {/* Desktop Navigation Bar */}
      <div className="hidden md:block">
        <NavigationBar />
      </div>

      {/* Mobile Header */}
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
            <p
              className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1"
              style={{ color: '#80163a' }}
            >
              The Studio
            </p>
            <h1
              className="font-serif text-2xl font-medium text-slate-800"
            >
              Compose
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearOutfit}
              disabled={filledSlots === 0}
              className="h-9 px-3 rounded-lg border-pearl"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              disabled={filledSlots < 2}
              className="h-9 px-4 rounded-lg text-white"
              style={{
                background: '#80163a',
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Outfit Canvas */}
      <section className="px-4 py-6">
        <div
          className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm"
        >
          {/* AI Assist Button */}
          <button
            className="w-full mb-4 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
            }}
          >
            <Wand2 className="h-4 w-4" style={{ color: '#D4A54A' }} />
            <span
              className="text-sm font-medium"
              style={{ color: '#8B7730' }}
            >
              AI Assist — Complete this look
            </span>
          </button>

          {/* Outfit Slots Grid */}
          <div className="grid grid-cols-5 gap-2">
            {outfitSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot.id)}
                className={cn(
                  "aspect-[3/4] rounded-xl transition-all flex flex-col items-center justify-center overflow-hidden",
                  selectedSlot === slot.id && "ring-2 ring-offset-2 ring-slate-900"
                )}
                style={{
                  background: slot.item ? 'transparent' : '#f5f0eb',
                  border: slot.item ? '1px solid #e8e6e3' : '2px dashed #e8e6e3',
                }}
              >
                {slot.item ? (
                  <div className="relative w-full h-full">
                    <img
                      src={slot.item.imageUrl || ''}
                      alt={slot.item.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItemFromSlot(slot.id);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: 'rgba(15, 15, 15, 0.7)',
                        color: 'white',
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Layers
                      className="h-5 w-5 mb-1 text-slate-400"
                    />
                    <span
                      className="text-[10px] font-medium text-slate-400"
                    >
                      {slot.label}
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Outfit Stats */}
          <div
            className="mt-4 pt-4 flex items-center justify-between border-t border-slate-200"
          >
            <span
              className="text-xs font-medium text-slate-500"
            >
              {filledSlots} of {outfitSlots.length} pieces
            </span>
            {filledSlots >= 2 && (
              <span
                className="text-xs font-medium flex items-center gap-1 text-emerald-600"
              >
                <Sparkles className="h-3 w-3" />
                Ready to save
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="px-4 mb-3">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === cat.id
                  ? "text-alabaster"
                  : "text-graphite hover:bg-cashmere"
              )}
              style={{
                background: selectedCategory === cat.id ? '#80163a' : 'transparent',
                color: selectedCategory === cat.id ? 'white' : '#64748b',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Items Grid */}
      <section className="px-4">
        <div
          className="text-xs font-semibold tracking-wide uppercase mb-3 text-slate-500"
        >
          {selectedSlot ? `Select for ${outfitSlots.find(s => s.id === selectedSlot)?.label}` : 'Your Items'}
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {filteredItems.map((item: WardrobeItem) => (
              <button
                key={item.id}
                onClick={() => addItemToSlot(item)}
                className="aspect-[3/4] rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] bg-white border border-slate-200 shadow-sm"
              >
                <img
                  src={item.imageUrl || ''}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 rounded-xl bg-slate-50 border border-slate-200"
          >
            <Layers
              className="h-10 w-10 mx-auto mb-3 text-slate-400"
            />
            <p
              className="text-sm font-medium mb-1 text-slate-700"
            >
              No items yet
            </p>
            <p
              className="text-xs text-slate-500"
            >
              Add items to your wardrobe to start composing
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default ComposePage;
