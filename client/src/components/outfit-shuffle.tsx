import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { Button } from "@/components/ui/button";
import {
  Shuffle,
  Lock,
  Unlock,
  Save,
  RefreshCw,
  Sparkles,
  Check,
  ChevronDown,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WardrobeItem } from "@shared/schema";

interface ShuffleSlot {
  id: string;
  label: string;
  category: string;
  item: WardrobeItem | null;
  locked: boolean;
  rolling: boolean;
}

const INITIAL_SLOTS: ShuffleSlot[] = [
  { id: "top", label: "Top", category: "tops", item: null, locked: false, rolling: false },
  { id: "bottom", label: "Bottom", category: "bottoms", item: null, locked: false, rolling: false },
  { id: "shoes", label: "Shoes", category: "shoes", item: null, locked: false, rolling: false },
];

interface OutfitShuffleProps {
  onSaveOutfit?: (items: WardrobeItem[]) => void;
  compact?: boolean;
}

export function OutfitShuffle({ onSaveOutfit, compact = false }: OutfitShuffleProps) {
  const { data: wardrobeItems } = useWardrobeItems();
  const [slots, setSlots] = useState<ShuffleSlot[]>(INITIAL_SLOTS);
  const [isShuffling, setIsShuffling] = useState(false);
  const [hasShuffled, setHasShuffled] = useState(false);

  // Get random item from category
  const getRandomItem = useCallback((category: string, exclude?: number) => {
    if (!wardrobeItems) return null;
    const categoryItems = wardrobeItems.filter(
      (item) => item.category?.toLowerCase() === category && item.id !== exclude
    );
    if (categoryItems.length === 0) return null;
    return categoryItems[Math.floor(Math.random() * categoryItems.length)];
  }, [wardrobeItems]);

  // Initialize with random items on mount
  useEffect(() => {
    if (wardrobeItems && wardrobeItems.length > 0 && !hasShuffled) {
      const newSlots = slots.map(slot => ({
        ...slot,
        item: getRandomItem(slot.category),
      }));
      setSlots(newSlots);
      setHasShuffled(true);
    }
  }, [wardrobeItems, hasShuffled, getRandomItem]);

  // Shuffle animation for a single slot
  const animateSlot = useCallback(async (slotId: string) => {
    return new Promise<void>((resolve) => {
      setSlots(prev => prev.map(s =>
        s.id === slotId ? { ...s, rolling: true } : s
      ));

      // Roll effect - change item rapidly
      let count = 0;
      const interval = setInterval(() => {
        setSlots(prev => prev.map(s => {
          if (s.id === slotId && !s.locked) {
            return { ...s, item: getRandomItem(s.category, s.item?.id) };
          }
          return s;
        }));
        count++;
        if (count >= 8) {
          clearInterval(interval);
          setSlots(prev => prev.map(s =>
            s.id === slotId ? { ...s, rolling: false } : s
          ));
          resolve();
        }
      }, 80);
    });
  }, [getRandomItem]);

  // Main shuffle function
  const handleShuffle = useCallback(async () => {
    if (isShuffling || !wardrobeItems?.length) return;

    setIsShuffling(true);

    // Stagger the animations
    for (const slot of slots) {
      if (!slot.locked) {
        await animateSlot(slot.id);
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }

    setIsShuffling(false);
  }, [isShuffling, wardrobeItems, slots, animateSlot]);

  // Toggle lock on a slot
  const toggleLock = (slotId: string) => {
    setSlots(prev => prev.map(s =>
      s.id === slotId ? { ...s, locked: !s.locked } : s
    ));
  };

  // Save the current outfit
  const handleSave = () => {
    const items = slots
      .filter(s => s.item)
      .map(s => s.item!);
    if (onSaveOutfit && items.length > 0) {
      onSaveOutfit(items);
    }
  };

  // Get filled slots count
  const filledCount = slots.filter(s => s.item).length;

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Compact Slot View */}
        <div className="flex gap-2 justify-center">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={cn(
                "relative w-20 h-24 rounded-xl overflow-hidden transition-all",
                slot.rolling && "animate-pulse",
                slot.item ? "bg-white" : "bg-cashmere"
              )}
              style={{
                border: slot.locked
                  ? '2px solid var(--color-gold-muted)'
                  : '1px solid var(--color-pearl)',
                boxShadow: slot.rolling ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
              }}
            >
              {slot.item ? (
                <>
                  <img
                    src={slot.item.imageUrl || ''}
                    alt={slot.item.name}
                    className={cn(
                      "w-full h-full object-cover transition-all",
                      slot.rolling && "blur-sm scale-105"
                    )}
                  />
                  {/* Lock Button */}
                  <button
                    onClick={() => toggleLock(slot.id)}
                    className={cn(
                      "absolute top-1 right-1 w-6 h-6 rounded-md flex items-center justify-center transition-all",
                      slot.locked
                        ? "bg-[var(--color-gold-muted)]"
                        : "bg-white/80 backdrop-blur-sm"
                    )}
                    style={{
                      border: slot.locked ? 'none' : '1px solid var(--color-pearl)',
                    }}
                  >
                    {slot.locked ? (
                      <Lock className="h-3 w-3 text-white" />
                    ) : (
                      <Unlock className="h-3 w-3" style={{ color: 'var(--color-graphite)' }} />
                    )}
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Layers className="h-5 w-5 mb-1" style={{ color: 'var(--color-taupe)' }} />
                  <span className="text-[9px] font-medium" style={{ color: 'var(--color-taupe)' }}>
                    {slot.label}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Shuffle Button */}
        <Button
          onClick={handleShuffle}
          disabled={isShuffling || !wardrobeItems?.length}
          className={cn(
            "w-full h-11 rounded-xl font-medium transition-all",
            isShuffling && "shake"
          )}
          style={{
            background: 'var(--color-obsidian)',
            color: 'var(--color-alabaster)',
          }}
        >
          {isShuffling ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Shuffle className="h-4 w-4 mr-2" />
          )}
          {isShuffling ? 'Shuffling...' : 'Shuffle Outfit'}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'white',
        border: '1px solid var(--color-pearl)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-pearl)' }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: 'var(--color-gold-muted)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-charcoal)' }}>
            Outfit Shuffle
          </span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--color-cashmere)', color: 'var(--color-graphite)' }}>
          Lock items to keep them
        </span>
      </div>

      {/* Slots */}
      <div className="p-4">
        <div className="space-y-2">
          {slots.map((slot, index) => (
            <div key={slot.id}>
              {/* Slot Card */}
              <div
                className={cn(
                  "relative flex items-center gap-4 p-3 rounded-xl transition-all",
                  slot.rolling && "ring-2 ring-[var(--color-gold-muted)] ring-opacity-50"
                )}
                style={{
                  background: slot.locked
                    ? 'rgba(212, 175, 55, 0.05)'
                    : 'var(--color-cashmere)',
                  border: slot.locked
                    ? '1px solid rgba(212, 175, 55, 0.3)'
                    : '1px solid var(--color-pearl)',
                }}
              >
                {/* Item Image */}
                <div
                  className={cn(
                    "w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all",
                    slot.rolling && "blur-sm"
                  )}
                  style={{ background: slot.item ? 'white' : 'var(--color-pearl)' }}
                >
                  {slot.item?.imageUrl ? (
                    <img
                      src={slot.item.imageUrl}
                      alt={slot.item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Layers className="h-6 w-6" style={{ color: 'var(--color-taupe)' }} />
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] uppercase tracking-wider mb-0.5"
                    style={{ color: 'var(--color-graphite)' }}
                  >
                    {slot.label}
                  </p>
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--color-charcoal)' }}
                  >
                    {slot.item?.name || 'No item selected'}
                  </p>
                  {slot.item?.color && (
                    <span
                      className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--color-alabaster)', color: 'var(--color-graphite)' }}
                    >
                      {slot.item.color}
                    </span>
                  )}
                </div>

                {/* Lock Toggle */}
                <button
                  onClick={() => toggleLock(slot.id)}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                    slot.locked && "shadow-md"
                  )}
                  style={{
                    background: slot.locked ? 'var(--color-gold-muted)' : 'white',
                    border: slot.locked ? 'none' : '1px solid var(--color-pearl)',
                  }}
                >
                  {slot.locked ? (
                    <Lock className="h-4 w-4 text-white" />
                  ) : (
                    <Unlock className="h-4 w-4" style={{ color: 'var(--color-taupe)' }} />
                  )}
                </button>
              </div>

              {/* Divider */}
              {index < slots.length - 1 && (
                <div className="flex justify-center py-1">
                  <ChevronDown className="h-4 w-4" style={{ color: 'var(--color-pearl)' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div
        className="p-4 flex gap-2"
        style={{ borderTop: '1px solid var(--color-pearl)' }}
      >
        <Button
          onClick={handleShuffle}
          disabled={isShuffling || !wardrobeItems?.length}
          className={cn(
            "flex-1 h-11 rounded-xl font-medium transition-all press-feedback",
            isShuffling && "shake"
          )}
          style={{
            background: 'var(--color-obsidian)',
            color: 'var(--color-alabaster)',
          }}
        >
          {isShuffling ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Shuffle className="h-4 w-4 mr-2" />
          )}
          {isShuffling ? 'Shuffling...' : 'Shuffle'}
        </Button>

        <Button
          onClick={handleSave}
          disabled={filledCount < 2}
          variant="outline"
          className="h-11 px-4 rounded-xl font-medium press-feedback"
          style={{
            borderColor: 'var(--color-pearl)',
          }}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}

export default OutfitShuffle;
