import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  X,
  Grid3X3,
  Layers,
  Heart,
  User,
  CalendarDays,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useOutfits } from "@/hooks/use-outfits";
import { useWardrobeItems } from "@/hooks/use-wardrobe";

/**
 * CALENDAR PAGE - EDITORIAL PLANNER
 *
 * Design: Clean calendar with outfit planning
 * Focus: Visual outfit preview on each day
 */

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

interface PlannedOutfit {
  date: string;
  outfitId?: number;
  eventName?: string;
  isWorn?: boolean;
}

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showOutfitPicker, setShowOutfitPicker] = useState(false);
  const [eventName, setEventName] = useState("");
  const [plannedOutfits, setPlannedOutfits] = useState<Map<string, PlannedOutfit>>(new Map());

  const { data: outfits, isLoading: outfitsLoading } = useOutfits();
  const { data: wardrobeItems } = useWardrobeItems();

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  const getDateKey = (date: Date) => date.toISOString().split('T')[0];
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowOutfitPicker(true);
  };

  const handlePlanOutfit = (outfitId: number) => {
    if (!selectedDate) return;
    const dateKey = getDateKey(selectedDate);
    setPlannedOutfits(prev => {
      const newMap = new Map(prev);
      newMap.set(dateKey, { date: dateKey, outfitId, eventName: eventName || undefined, isWorn: false });
      return newMap;
    });
    setShowOutfitPicker(false);
    setEventName("");
    setSelectedDate(null);
  };

  const handleMarkAsWorn = (dateKey: string) => {
    setPlannedOutfits(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(dateKey);
      if (existing) newMap.set(dateKey, { ...existing, isWorn: !existing.isWorn });
      return newMap;
    });
  };

  const getOutfitForDate = (date: Date) => {
    const dateKey = getDateKey(date);
    const plan = plannedOutfits.get(dateKey);
    if (plan?.outfitId && outfits) {
      return outfits.find(o => o.id === plan.outfitId);
    }
    return null;
  };

  const getOutfitItemImages = (itemIds: number[]) => {
    if (!wardrobeItems) return [];
    return itemIds.map(id => wardrobeItems.find(item => item.id === id)).filter(Boolean).slice(0, 2);
  };

  if (outfitsLoading) {
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
            <Link href="/calendar"><span className="text-xs tracking-[0.15em] uppercase text-[#1A1A1A] font-medium">Calendar</span></Link>
            <Link href="/profile"><span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Profile</span></Link>
          </div>
          <Link href="/profile"><motion.div className="w-10 h-10 rounded-full bg-[#E5E5E5] flex items-center justify-center" whileHover={{ scale: 1.05 }}><User className="w-5 h-5 text-[#6B6B6B]" /></motion.div></Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <motion.header className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-2">Planning</p>
          <h1 className="text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            Outfit Calendar
          </h1>
          <p className="text-[#6B6B6B]">Plan your looks ahead of time</p>
        </motion.header>

        {/* Calendar Controls */}
        <motion.div className="flex items-center justify-between mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2">
            <motion.button onClick={goToPreviousMonth} className="w-10 h-10 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center" whileHover={{ backgroundColor: "#F5F5F5" }} whileTap={{ scale: 0.95 }}>
              <ChevronLeft className="w-5 h-5 text-[#6B6B6B]" />
            </motion.button>
            <motion.button onClick={goToNextMonth} className="w-10 h-10 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center" whileHover={{ backgroundColor: "#F5F5F5" }} whileTap={{ scale: 0.95 }}>
              <ChevronRight className="w-5 h-5 text-[#6B6B6B]" />
            </motion.button>
          </div>
          <h2 className="text-xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <motion.button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 rounded-full text-xs font-medium bg-white border border-[#E5E5E5] text-[#6B6B6B]" whileHover={{ borderColor: "#1A1A1A" }}>
            Today
          </motion.button>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div className="rounded-3xl bg-white border border-[#E5E5E5]/50 overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-[#E5E5E5]/50">
            {DAYS.map(day => (
              <div key={day} className="p-3 text-center text-xs font-medium text-[#9A9A9A] uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarData.map((day, index) => {
              const outfit = getOutfitForDate(day.date);
              const dateKey = getDateKey(day.date);
              const plan = plannedOutfits.get(dateKey);
              const items = outfit && Array.isArray(outfit.items) ? getOutfitItemImages(outfit.items as number[]) : [];

              return (
                <motion.button
                  key={index}
                  onClick={() => handleDateClick(day.date)}
                  className={`min-h-[100px] p-2 border-b border-r border-[#E5E5E5]/30 text-left transition-colors ${
                    !day.isCurrentMonth ? 'bg-[#FAFAFA]' : 'bg-white hover:bg-[#F9F9F7]'
                  } ${isToday(day.date) ? 'ring-2 ring-inset ring-[#1A1A1A]' : ''}`}
                  whileHover={{ backgroundColor: day.isCurrentMonth ? "#F5F5F5" : undefined }}
                >
                  <span className={`text-sm font-medium ${!day.isCurrentMonth ? 'text-[#D5D5D5]' : isToday(day.date) ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}`}>
                    {day.date.getDate()}
                  </span>

                  {outfit && items.length > 0 && (
                    <div className="mt-1 flex gap-1">
                      {items.map((item: any, i: number) => (
                        <div key={i} className="w-8 h-8 rounded-lg overflow-hidden bg-[#F5F5F5]">
                          {item?.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                        </div>
                      ))}
                      {plan?.isWorn && <Check className="w-4 h-4 text-emerald-500 ml-auto" />}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 text-xs text-[#6B6B6B]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#1A1A1A]" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#F5F5F5] border border-[#E5E5E5]" />
            <span>Planned outfit</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Worn</span>
          </div>
        </div>
      </main>

      {/* Outfit Picker Dialog */}
      <Dialog open={showOutfitPicker} onOpenChange={setShowOutfitPicker}>
        <DialogContent className="sm:max-w-lg bg-[#F9F9F7] border-0 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              Plan Outfit for {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Event name (optional)"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full h-12 px-4 bg-[#F5F5F5] rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#9A9A9A] focus:outline-none"
            />

            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {outfits?.map(outfit => {
                const items = Array.isArray(outfit.items) ? getOutfitItemImages(outfit.items as number[]) : [];
                return (
                  <motion.button
                    key={outfit.id}
                    onClick={() => handlePlanOutfit(outfit.id)}
                    className="p-4 rounded-2xl bg-white border border-[#E5E5E5] text-left"
                    whileHover={{ borderColor: "#1A1A1A" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex gap-1 mb-2">
                      {items.slice(0, 3).map((item: any, i: number) => (
                        <div key={i} className="w-10 h-10 rounded-lg overflow-hidden bg-[#F5F5F5]">
                          {item?.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{outfit.name}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E5E5E5]/50 px-6 py-3">
        <div className="flex items-center justify-around">
          {[
            { href: "/home", icon: Grid3X3, label: "Home" },
            { href: "/wardrobe", icon: Layers, label: "Wardrobe" },
            { href: "/calendar", icon: CalendarDays, label: "Calendar", active: true },
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

export default CalendarPage;
