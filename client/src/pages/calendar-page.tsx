import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Shirt,
  Sparkles,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Check,
  X,
  CalendarDays
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import NavigationBar from "@/components/navigation-bar";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import { useOutfits } from "@/hooks/use-outfits";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { queryClient } from "@/lib/queryClient";

// Brand colors
const gold = "hsl(38, 75%, 55%)";
const burgundy = "hsl(337, 73%, 26%)";
const burgundyDark = "hsl(337, 73%, 18%)";

// Days of the week
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

  const { data: outfits, isLoading: outfitsLoading } = useOutfits();
  const { data: wardrobeItems } = useWardrobeItems();

  // Local state for planned outfits (in production, this would come from API)
  const [plannedOutfits, setPlannedOutfits] = useState<Map<string, PlannedOutfit>>(new Map());

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Next month days to complete the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentDate]);

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowOutfitPicker(true);
  };

  const handlePlanOutfit = (outfitId: number) => {
    if (!selectedDate) return;

    const dateKey = getDateKey(selectedDate);
    setPlannedOutfits(prev => {
      const newMap = new Map(prev);
      newMap.set(dateKey, {
        date: dateKey,
        outfitId,
        eventName: eventName || undefined,
        isWorn: false
      });
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
      if (existing) {
        newMap.set(dateKey, { ...existing, isWorn: !existing.isWorn });
      }
      return newMap;
    });
  };

  const handleRemovePlan = (dateKey: string) => {
    setPlannedOutfits(prev => {
      const newMap = new Map(prev);
      newMap.delete(dateKey);
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
    return itemIds
      .map(id => wardrobeItems.find(item => item.id === id))
      .filter(Boolean)
      .slice(0, 3);
  };

  if (outfitsLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf9]">
        <NavigationBar />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Skeleton className="h-12 w-64 mb-8 rounded-2xl" />
          <Skeleton className="h-[600px] w-full rounded-[32px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24 md:pb-8">
      <NavigationBar />

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-4">
              <CalendarDays className="w-4 h-4" style={{ color: gold }} />
              <span className="text-sm font-medium text-slate-600">Plan Ahead</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-2">Outfit Calendar</h1>
            <p className="text-slate-500 text-lg">Schedule your looks for the week</p>
          </div>

          <Button
            onClick={goToToday}
            variant="outline"
            className="rounded-full px-6 h-11 border-slate-200 hover:bg-white hover:shadow-sm transition-all"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Today
          </Button>
        </header>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            className="rounded-full h-11 w-11 hover:bg-white hover:shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="rounded-full h-11 w-11 hover:bg-white hover:shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <Card className="border-0 shadow-xl overflow-hidden rounded-[24px]">
          <CardContent className="p-0">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
              {DAYS.map(day => (
                <div
                  key={day}
                  className="py-4 text-center text-sm font-semibold text-slate-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarData.map((day, index) => {
                const dateKey = getDateKey(day.date);
                const plannedOutfit = getOutfitForDate(day.date);
                const plan = plannedOutfits.get(dateKey);
                const outfitItems = plannedOutfit ? getOutfitItemImages(plannedOutfit.items) : [];

                return (
                  <div
                    key={index}
                    onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
                    className={`
                      min-h-[100px] md:min-h-[120px] p-2 border-b border-r border-slate-100
                      transition-colors cursor-pointer hover:bg-slate-50
                      ${!day.isCurrentMonth ? 'bg-slate-50/50 text-slate-300' : ''}
                      ${isToday(day.date) ? 'bg-amber-50/50' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`
                          text-sm font-medium
                          ${isToday(day.date)
                            ? 'w-7 h-7 rounded-full flex items-center justify-center text-white'
                            : ''
                          }
                        `}
                        style={isToday(day.date) ? { background: burgundy } : {}}
                      >
                        {day.date.getDate()}
                      </span>
                      {plan?.isWorn && (
                        <Badge className="text-[10px] px-1.5 py-0" style={{ background: '#10b981' }}>
                          Worn
                        </Badge>
                      )}
                    </div>

                    {plannedOutfit && day.isCurrentMonth && (
                      <div className="mt-2">
                        {/* Mini outfit preview */}
                        <div className="flex -space-x-2 mb-1">
                          {outfitItems.map((item: any, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-slate-100"
                            >
                              {item?.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-600 truncate font-medium">
                          {plannedOutfit.name}
                        </p>
                        {plan?.eventName && (
                          <p className="text-[9px] text-slate-400 truncate">
                            {plan.eventName}
                          </p>
                        )}
                      </div>
                    )}

                    {!plannedOutfit && day.isCurrentMonth && (
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Planned Outfits */}
        {plannedOutfits.size > 0 && (
          <div className="mt-8">
            <h3 className="font-serif text-xl font-semibold text-slate-900 mb-4">
              Upcoming Outfits
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from(plannedOutfits.entries())
                .filter(([dateKey]) => new Date(dateKey) >= new Date())
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .slice(0, 6)
                .map(([dateKey, plan]) => {
                  const outfit = outfits?.find(o => o.id === plan.outfitId);
                  const outfitItems = outfit ? getOutfitItemImages(outfit.items) : [];
                  const date = new Date(dateKey);

                  return (
                    <Card key={dateKey} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                            {plan.eventName && (
                              <p className="text-xs text-slate-500">{plan.eventName}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => handleMarkAsWorn(dateKey)}
                            >
                              <Check className={`w-4 h-4 ${plan.isWorn ? 'text-green-500' : 'text-slate-400'}`} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => handleRemovePlan(dateKey)}
                            >
                              <X className="w-4 h-4 text-slate-400" />
                            </Button>
                          </div>
                        </div>

                        {outfit && (
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                              {outfitItems.map((item: any, i) => (
                                <div
                                  key={i}
                                  className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden bg-slate-100"
                                >
                                  {item?.imageUrl && (
                                    <img
                                      src={item.imageUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 truncate">{outfit.name}</p>
                              <p className="text-xs text-slate-500 truncate">{outfit.occasion || 'Casual'}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}
      </main>

      {/* Outfit Picker Dialog */}
      <Dialog open={showOutfitPicker} onOpenChange={setShowOutfitPicker}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Plan Outfit for {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="event-name">Event or Occasion (optional)</Label>
              <Input
                id="event-name"
                placeholder="e.g., Work, Date Night, Wedding..."
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Select Outfit</Label>
              <div className="grid gap-3 mt-2 max-h-[300px] overflow-y-auto">
                {outfits && outfits.length > 0 ? (
                  outfits.map(outfit => {
                    const items = getOutfitItemImages(outfit.items);
                    return (
                      <div
                        key={outfit.id}
                        onClick={() => handlePlanOutfit(outfit.id)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all"
                      >
                        <div className="flex -space-x-2">
                          {items.map((item: any, i) => (
                            <div
                              key={i}
                              className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden bg-slate-100"
                            >
                              {item?.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{outfit.name}</p>
                          <p className="text-xs text-slate-500">
                            {outfit.occasion || 'Casual'} • {outfit.items.length} items
                          </p>
                        </div>
                        <Sparkles className="w-4 h-4 text-slate-300" />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Shirt className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No outfits created yet</p>
                    <p className="text-sm">Create some outfits first to plan them here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MobileBottomNav />
    </div>
  );
}
