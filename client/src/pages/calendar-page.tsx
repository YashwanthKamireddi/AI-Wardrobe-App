import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";
import { AppLayout } from "@/components/layout/app-layout";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Plus, X, Shirt, ArrowLeft, ArrowRight, Grid3X3, Rows3, Flame, Sparkles, Repeat } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, addWeeks, subWeeks, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { OutfitCalendar, Outfit } from "@shared/schema";
import { useLocation } from "wouter";

export function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showOutfitPicker, setShowOutfitPicker] = useState(false);
    const [eventName, setEventName] = useState("");
    const [viewMode, setViewMode] = useState<"month" | "week">("month");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [, setLocation] = useLocation();

    const { data: outfits } = useOutfits();
    const { data: wardrobeItems } = useWardrobeItems();

    // Helper to get first item image from outfit
    const getOutfitPreviewImage = (outfit: Outfit) => {
        if (!outfit.items || outfit.items.length === 0 || !wardrobeItems) return null;
        const firstItemId = outfit.items[0];
        const item = wardrobeItems.find(i => i.id === firstItemId);
        return item?.imageUrl || null;
    };

    // Use a query to fetch all calendar events
    const { data: calendarEvents, isLoading: isEventsLoading } = useQuery<OutfitCalendar[]>({
        queryKey: ["/api/calendar-outfits"],
    });

    const nextPeriod = () => {
        if (viewMode === "month") {
            setCurrentDate(addMonths(currentDate, 1));
        } else {
            setCurrentDate(addWeeks(currentDate, 1));
        }
    };

    const prevPeriod = () => {
        if (viewMode === "month") {
            setCurrentDate(subMonths(currentDate, 1));
        } else {
            setCurrentDate(subWeeks(currentDate, 1));
        }
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    // Convert array of events to a Map for O(1) lookup by date string
    const eventsByDate = useMemo(() => {
        const map = new Map<string, OutfitCalendar>();
        if (!calendarEvents) return map;

        calendarEvents.forEach(event => {
            const dateStr = new Date(event.date).toISOString().split('T')[0];
            map.set(dateStr, event);
        });
        return map;
    }, [calendarEvents]);

    // Calculate streak (consecutive days with planned outfits)
    const currentStreak = useMemo(() => {
        if (!calendarEvents || calendarEvents.length === 0) return 0;

        let streak = 0;
        let checkDate = new Date();

        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (eventsByDate.has(dateStr)) {
                streak++;
                checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
            } else {
                break;
            }
        }
        return streak;
    }, [calendarEvents, eventsByDate]);

    // Create Event Mutation
    const createEventMutation = useMutation({
        mutationFn: async (eventData: any) => {
            const res = await apiRequest({
                method: "POST",
                path: "/api/calendar-outfits",
                body: eventData,
            });
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/calendar-outfits"] });
            setShowOutfitPicker(false);
            setEventName("");
            setSelectedDate(null);
            toast({
                title: "Scheduled",
                description: "Look added to your calendar.",
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to schedule outfit.",
                variant: "destructive",
            });
        },
    });

    // Delete Event Mutation
    const deleteEventMutation = useMutation({
        mutationFn: async (eventId: number) => {
            await apiRequest({
                method: "DELETE",
                path: `/api/calendar-outfits/${eventId}`,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/calendar-outfits"] });
            toast({
                title: "Removed",
                description: "Outfit removed from calendar.",
            });
        },
    });

    const handlePlanOutfit = (outfitId: number) => {
        if (!selectedDate) return;

        createEventMutation.mutate({
            outfitId,
            date: selectedDate.toISOString(),
            eventName: eventName || undefined,
            isWorn: false
        });
    };

    const handleRemoveEvent = (e: React.MouseEvent, eventId: number) => {
        e.stopPropagation();
        deleteEventMutation.mutate(eventId);
    };

    // Generate calendar days based on view mode
    const calendarDays = useMemo(() => {
        if (viewMode === "month") {
            const monthStart = startOfMonth(currentDate);
            const monthEnd = endOfMonth(monthStart);
            const startDate = startOfWeek(monthStart);
            const endDate = endOfWeek(monthEnd);
            return eachDayOfInterval({ start: startDate, end: endDate });
        } else {
            const weekStart = startOfWeek(currentDate);
            const weekEnd = endOfWeek(currentDate);
            return eachDayOfInterval({ start: weekStart, end: weekEnd });
        }
    }, [currentDate, viewMode]);

    const getDateKey = (date: Date) => date.toISOString().split('T')[0];

    const getOutfitForDate = (date: Date) => {
        const key = getDateKey(date);
        const event = eventsByDate.get(key);
        if (!event || !event.outfitId || !outfits) return null;

        const outfit = outfits.find(o => o.id === event.outfitId);
        return outfit ? { ...event, outfit } : null;
    };

    // Check if outfit was worn recently (within 2 weeks)
    const isRecentlyWorn = (outfitId: number) => {
        if (!calendarEvents) return false;
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        return calendarEvents.some(event =>
            event.outfitId === outfitId &&
            new Date(event.date) > twoWeeksAgo &&
            (!selectedDate || !isSameDay(new Date(event.date), selectedDate))
        );
    };

    // Date formatting for header
    const monthName = format(currentDate, 'MMMM');
    const year = format(currentDate, 'yyyy');
    const weekRange = viewMode === "week"
        ? `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d')}`
        : null;

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
                <div className="flex-1 flex flex-col md:px-6 md:pb-6 max-w-7xl mx-auto w-full">
                    {/* Header */}
                    <motion.div
                        className="pt-10 pb-6 px-6 md:px-0 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 mb-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div>
                            <span className="text-[#80163a] text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">Style Planner</span>
                            <div className="flex items-baseline gap-4">
                                <h1 className="text-4xl md:text-6xl font-playfair text-[#1a1a1a] leading-[0.9]">
                                    {viewMode === "month" ? monthName : weekRange}
                                </h1>
                                {viewMode === "month" && (
                                    <span className="text-xl md:text-2xl font-playfair italic text-gray-300">{year}</span>
                                )}
                            </div>

                            {/* Streak Badge */}
                            {currentStreak > 0 && (
                                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-100">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span className="text-xs font-medium text-orange-600">
                                        {currentStreak} day planning streak!
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mt-6 md:mt-0">
                            {/* View Toggle */}
                            <div className="flex items-center border border-gray-200 rounded-full p-1 bg-white">
                                <button
                                    onClick={() => setViewMode("month")}
                                    className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                                        viewMode === "month" ? "bg-[#1a1a1a] text-white" : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("week")}
                                    className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                                        viewMode === "week" ? "bg-[#1a1a1a] text-white" : "text-gray-400 hover:text-gray-600"
                                    )}
                                >
                                    <Rows3 className="w-4 h-4" />
                                </button>
                            </div>

                            <button
                                onClick={goToToday}
                                className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500 hover:text-[#80163a] transition-colors px-3 py-2"
                            >
                                Today
                            </button>

                            <div className="flex items-center gap-1 border border-gray-200 rounded-full p-1 bg-white">
                                <button onClick={prevPeriod} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                                    <ArrowLeft className="w-4 h-4 text-[#1a1a1a]" />
                                </button>
                                <div className="w-[1px] h-4 bg-gray-200" />
                                <button onClick={nextPeriod} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                                    <ArrowRight className="w-4 h-4 text-[#1a1a1a]" />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Bar */}
                    <div className="px-6 md:px-0 mb-4 flex items-center gap-4 overflow-x-auto pb-2">
                        <div className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 flex items-center gap-3 shrink-0">
                            <CalendarIcon className="w-4 h-4 text-[#80163a]" />
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-gray-400">This Month</p>
                                <p className="text-sm font-medium text-[#1a1a1a]">
                                    {calendarEvents?.filter(e => isSameMonth(new Date(e.date), currentDate)).length || 0} looks planned
                                </p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 flex items-center gap-3 shrink-0">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-gray-400">Outfits</p>
                                <p className="text-sm font-medium text-[#1a1a1a]">{outfits?.length || 0} created</p>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Container */}
                    <div className="flex-1 flex flex-col overflow-hidden px-6 md:px-0">
                        {/* Week View */}
                        {viewMode === "week" && (
                            <div className="grid grid-cols-7 gap-2 flex-1">
                                {calendarDays.map((day) => {
                                    const eventData = getOutfitForDate(day);
                                    const isTodayDate = isToday(day);

                                    return (
                                        <motion.div
                                            key={day.toISOString()}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => {
                                                setSelectedDate(day);
                                                if (!eventData) setShowOutfitPicker(true);
                                            }}
                                            className={cn(
                                                "bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all flex flex-col",
                                                isTodayDate && "ring-2 ring-[#80163a] ring-offset-2"
                                            )}
                                        >
                                            {/* Day Header */}
                                            <div className="text-center mb-3">
                                                <p className="text-[10px] uppercase tracking-wider text-gray-400">{format(day, 'EEE')}</p>
                                                <p className={cn(
                                                    "text-2xl font-playfair",
                                                    isTodayDate ? "text-[#80163a]" : "text-[#1a1a1a]"
                                                )}>
                                                    {format(day, 'd')}
                                                </p>
                                            </div>

                                            {/* Outfit Card */}
                                            <div className="flex-1 flex items-center justify-center">
                                                {eventData?.outfit ? (
                                                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden group">
                                                        {getOutfitPreviewImage(eventData.outfit) && (
                                                            <img
                                                                src={getOutfitPreviewImage(eventData.outfit)!}
                                                                alt={eventData.outfit.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                                                            <p className="text-white text-xs font-medium truncate">{eventData.outfit.name}</p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => handleRemoveEvent(e, eventData.id)}
                                                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                                                        <Plus className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Month View */}
                        {viewMode === "month" && (
                            <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                                {/* Days Header */}
                                <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50 shrink-0">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="py-3 text-center text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Days Grid */}
                                <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                                    {calendarDays.map((day, dayIdx) => {
                                        const eventData = getOutfitForDate(day);
                                        const isCurrentMonth = isSameMonth(day, currentDate);
                                        const isTodayDate = isToday(day);

                                        return (
                                            <motion.div
                                                key={day.toISOString()}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: dayIdx * 0.01 }}
                                                onClick={() => {
                                                    setSelectedDate(day);
                                                    if (!eventData) setShowOutfitPicker(true);
                                                }}
                                                className={cn(
                                                    "border-b border-r border-gray-50 p-2 md:p-3 relative transition-all cursor-pointer group hover:bg-gray-50/50 min-h-[100px] md:min-h-[120px]",
                                                    (dayIdx + 1) % 7 === 0 && "border-r-0",
                                                    !isCurrentMonth && "bg-gray-50/30"
                                                )}
                                            >
                                                {/* Date Number */}
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className={cn(
                                                        "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                                                        isTodayDate ? "bg-[#80163a] text-white" : "",
                                                        !isCurrentMonth && "text-gray-300"
                                                    )}>
                                                        {format(day, 'd')}
                                                    </div>

                                                    {!eventData && isCurrentMonth && (
                                                        <Plus className="w-4 h-4 text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>

                                                {/* Event Card */}
                                                {eventData?.outfit && (
                                                    <div className="absolute inset-x-2 bottom-2 top-9 group/event">
                                                        <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 hover:border-[#80163a]/30 transition-colors rounded-lg overflow-hidden flex">
                                                            {getOutfitPreviewImage(eventData.outfit) && (
                                                                <div className="w-10 shrink-0 bg-gray-100">
                                                                    <img
                                                                        src={getOutfitPreviewImage(eventData.outfit)!}
                                                                        alt={eventData.outfit.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 p-1.5 min-w-0">
                                                                {eventData.eventName && (
                                                                    <p className="text-[8px] uppercase tracking-wider text-[#80163a] font-bold truncate">
                                                                        {eventData.eventName}
                                                                    </p>
                                                                )}
                                                                <p className="text-[10px] text-[#1a1a1a] font-medium truncate leading-tight">
                                                                    {eventData.outfit.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => handleRemoveEvent(e, eventData.id)}
                                                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center opacity-0 group-hover/event:opacity-100 transition-all shadow-sm"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Outfit Picker Dialog */}
                <Dialog open={showOutfitPicker} onOpenChange={setShowOutfitPicker}>
                    <DialogContent className="max-w-2xl max-h-[85vh] p-0 flex flex-col bg-[#FAF9F6] border-none shadow-2xl overflow-hidden rounded-3xl">
                        <div className="p-6 bg-white border-b border-gray-100 shrink-0">
                            <DialogHeader>
                                <DialogTitle className="font-playfair text-2xl">Plan Your Look</DialogTitle>
                                <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">
                                    {selectedDate && format(selectedDate, 'EEEE, MMMM do')}
                                </p>
                            </DialogHeader>
                        </div>

                        {/* Event Name Input */}
                        <div className="px-6 py-4 bg-white border-b border-gray-100 shrink-0">
                            <Label className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 block">
                                What's the occasion?
                            </Label>
                            <Input
                                className="border-gray-200 rounded-xl h-11 bg-gray-50 focus:bg-white"
                                placeholder="e.g. Date Night, Work Meeting, Wedding..."
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                            />
                        </div>

                        {/* Outfit Grid */}
                        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "50vh" }}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs uppercase tracking-widest text-gray-400">Your Looks</span>
                                <span className="text-xs text-gray-400">{outfits?.length || 0} outfits</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {/* Create New Card */}
                                <motion.div
                                    onClick={() => setLocation("/studio")}
                                    className="aspect-[3/4] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#1a1a1a] hover:bg-white transition-all group"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-3 group-hover:bg-[#1a1a1a] transition-colors shadow-sm">
                                        <Plus className="w-6 h-6 text-gray-400 group-hover:text-white" />
                                    </div>
                                    <p className="font-playfair text-base text-[#1a1a1a]">Create New</p>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Open Studio</p>
                                </motion.div>

                                {outfits?.map(outfit => {
                                    const recentlyWorn = isRecentlyWorn(outfit.id);
                                    return (
                                        <motion.div
                                            key={outfit.id}
                                            className={cn(
                                                "cursor-pointer group relative aspect-[3/4] bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-all",
                                                recentlyWorn ? "border-orange-200" : "border-gray-100 hover:border-[#80163a]/30"
                                            )}
                                            onClick={() => handlePlanOutfit(outfit.id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {/* Recently Worn Badge */}
                                            {recentlyWorn && (
                                                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
                                                    <Repeat className="w-3 h-3 text-orange-500" />
                                                    <span className="text-[9px] font-medium text-orange-600">Recent</span>
                                                </div>
                                            )}

                                            {/* Image or placeholder */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                                                {getOutfitPreviewImage(outfit) ? (
                                                    <img
                                                        src={getOutfitPreviewImage(outfit)!}
                                                        alt={outfit.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <Shirt className="w-12 h-12 text-gray-200" />
                                                )}
                                            </div>

                                            {/* Overlay Label */}
                                            <div className="absolute inset-x-0 bottom-0 p-3 bg-white/95 border-t border-gray-100">
                                                <p className="font-playfair text-sm text-[#1a1a1a] truncate">{outfit.name}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{outfit.items?.length || 0} items</p>
                                            </div>

                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-[#80163a]/0 group-hover:bg-[#80163a]/5 transition-colors flex items-center justify-center">
                                                <span className="opacity-0 group-hover:opacity-100 text-[#80163a] text-xs font-semibold uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm transition-opacity">
                                                    Select
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Empty state */}
                            {(!outfits || outfits.length === 0) && (
                                <div className="text-center py-12">
                                    <Shirt className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 mb-2">No outfits yet</p>
                                    <button
                                        onClick={() => setLocation("/studio")}
                                        className="text-[#80163a] text-sm font-semibold hover:underline"
                                    >
                                        Create your first look
                                    </button>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
