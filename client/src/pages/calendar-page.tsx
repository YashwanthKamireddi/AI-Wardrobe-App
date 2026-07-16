import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";
import { AppLayout } from "@/components/layout/app-layout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, X, Shirt, ArrowLeft, ArrowRight, Grid3X3, Rows3,
    Flame, Sparkles, Repeat, Calendar as CalendarIcon, Camera
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
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

    const getOutfitPreviewImage = (outfit: Outfit) => {
        if (!outfit.items || outfit.items.length === 0 || !wardrobeItems) return null;
        const firstItemId = outfit.items[0];
        const item = wardrobeItems.find(i => i.id === firstItemId);
        return item?.imageUrl || null;
    };

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

    const eventsByDate = useMemo(() => {
        const map = new Map<string, OutfitCalendar>();
        if (!calendarEvents) return map;

        calendarEvents.forEach(event => {
            const dateStr = new Date(event.date).toISOString().split('T')[0];
            map.set(dateStr, event);
        });
        return map;
    }, [calendarEvents]);

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
                title: "Schedule Updated",
                description: "Look added to your runway schedule.",
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

    const monthName = format(currentDate, 'MMMM');
    const year = format(currentDate, 'yyyy');
    const weekRange = viewMode === "week"
        ? `${format(startOfWeek(currentDate), 'MMMM d')} - ${format(endOfWeek(currentDate), 'MMMM d')}`
        : null;

    return (
        <AppLayout>
            <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
                {/* Background Noise with reduced opacity */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

                <div className="flex-1 flex flex-col md:px-8 pb-28 md:pb-8 max-w-7xl mx-auto w-full z-10">

                    {/* Editorial Header */}
                    <div className="pt-12 pb-8 px-6 md:px-0 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#1A1A1A]/10 mb-8">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 mb-2"
                            >
                                <div className="h-[1px] w-8 bg-[#80163a]" />
                                <span className="text-[#80163a] font-mono text-xs uppercase tracking-[0.2em]">Fashion Week Schedule</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl sm:text-5xl md:text-7xl font-playfair text-[#1A1A1A] leading-[1] mb-1"
                            >
                                {viewMode === "month" ? monthName : "Weekly View"}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="font-mono text-xs uppercase tracking-[0.3em] text-[#1A1A1A]/40"
                            >
                                {viewMode === "month" ? year : weekRange}
                            </motion.p>
                        </div>

                        <div className="flex flex-col items-end gap-4 mt-8 md:mt-0">
                            {/* Streak Badge Styled */}
                            {currentStreak > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 px-3 py-1 bg-[#1A1A1A] text-white rounded-sm"
                                >
                                    <Flame className="w-3 h-3 text-[#f59e0b]" />
                                    <span className="font-mono text-[10px] uppercase tracking-wider">
                                        {currentStreak} Day Streak
                                    </span>
                                </motion.div>
                            )}

                            <div className="flex items-center gap-4">
                                {/* View Toggles */}
                                <div className="flex items-center border border-[#1A1A1A]/10 p-1 bg-white">
                                    <button
                                        onClick={() => setViewMode("month")}
                                        className={cn(
                                            "w-11 h-11 flex items-center justify-center transition-all",
                                            viewMode === "month" ? "bg-[#1A1A1A] text-white" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                                        )}
                                    >
                                        <Grid3X3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("week")}
                                        className={cn(
                                            "w-11 h-11 flex items-center justify-center transition-all",
                                            viewMode === "week" ? "bg-[#1A1A1A] text-white" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                                        )}
                                    >
                                        <Rows3 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Navigation */}
                                <div className="flex items-center gap-2">
                                    <button onClick={prevPeriod} className="w-11 h-11 border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-colors bg-white">
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <button onClick={goToToday} className="h-11 px-4 border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-colors bg-white font-mono text-[10px] uppercase tracking-wider">
                                        Current
                                    </button>
                                    <button onClick={nextPeriod} className="w-11 h-11 border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-colors bg-white">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Season Overview Stats */}
                    <div className="mb-8 px-6 md:px-0 flex gap-12 overflow-x-auto pb-4 scrollbar-hide">
                        <div className="shrink-0">
                            <p className="font-playfair text-3xl text-[#1A1A1A]">
                                {calendarEvents?.filter(e => isSameMonth(new Date(e.date), currentDate)).length || 0}
                            </p>
                            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 mt-1">Shows Scheduled</p>
                        </div>
                        <div className="shrink-0 relative">
                            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-[#1A1A1A]/10" />
                            <p className="font-playfair text-3xl text-[#1A1A1A]">
                                {outfits?.length || 0}
                            </p>
                            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 mt-1">Collection Size</p>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="flex-1 flex flex-col bg-white border border-[#1A1A1A]/10 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                        {/* Weekly Header for Month View */}
                        {viewMode === "month" && (
                            <div className="grid grid-cols-7 border-b border-[#1A1A1A]/10 bg-background shrink-0">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="py-4 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-[#1A1A1A]/50">
                                        {day}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={cn(
                            "flex-1",
                            viewMode === "month" ? "grid grid-cols-7 auto-rows-fr" : "grid grid-cols-7 divide-x divide-[#1A1A1A]/5"
                        )}>
                            {calendarDays.map((day, dayIdx) => {
                                const eventData = getOutfitForDate(day);
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                const isTodayDate = isToday(day);
                                const isPastDate = day < new Date(new Date().setHours(0, 0, 0, 0));

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
                                            "relative transition-all cursor-pointer group flex flex-col",
                                            viewMode === "month"
                                                ? "min-h-[140px] border-b border-r border-[#1A1A1A]/5 p-3 hover:bg-[#FAF9F6]"
                                                : "min-h-[400px] p-4 hover:bg-[#FAF9F6]",
                                            (dayIdx + 1) % 7 === 0 && viewMode === "month" && "border-r-0",
                                            !isCurrentMonth && viewMode === "month" && "bg-background/50 text-opacity-30"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2 z-10">
                                            <span className={cn(
                                                "font-playfair text-lg leading-none transition-colors",
                                                isTodayDate ? "text-[#80163a] font-bold" : "text-[#1A1A1A]",
                                                !isCurrentMonth && "opacity-30"
                                            )}>
                                                {format(day, 'd')}
                                            </span>
                                            {viewMode === "week" && (
                                                <span className="font-mono text-[9px] uppercase tracking-widest text-[#1A1A1A]/30">
                                                    {format(day, 'EEE')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Lookbook Card */}
                                        {eventData?.outfit ? (
                                            <div className="flex-1 relative group/card">
                                                <div className="absolute inset-0 bg-background overflow-hidden border border-[#1A1A1A]/5 transition-all duration-500 group-hover/card:shadow-xl">
                                                    {getOutfitPreviewImage(eventData.outfit) ? (
                                                        <img
                                                            src={getOutfitPreviewImage(eventData.outfit)!}
                                                            alt={eventData.outfit.name}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110 grayscale group-hover/card:grayscale-0"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Shirt className="w-6 h-6 text-[#1A1A1A]/20" />
                                                        </div>
                                                    )}

                                                    <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/10 transition-colors" />
                                                </div>

                                                {/* Label Float */}
                                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 border-t border-[#1A1A1A]/5 translate-y-full group-hover/card:translate-y-0 transition-transform duration-300">
                                                    {eventData.eventName && (
                                                        <p className="font-mono text-[8px] uppercase tracking-wider text-[#80163a] mb-1">
                                                            {eventData.eventName}
                                                        </p>
                                                    )}
                                                    <p className="font-playfair text-xs truncate text-[#1A1A1A]">
                                                        {eventData.outfit.name}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={(e) => handleRemoveEvent(e, eventData.id)}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-white text-[#1A1A1A] flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-[#80163a] hover:text-white"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            /* Empty State / Add Trigger */
                                            <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isPastDate && (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full border border-[#1A1A1A]/20 flex items-center justify-center">
                                                            <Plus className="w-4 h-4 text-[#1A1A1A]/40" />
                                                        </div>
                                                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#1A1A1A]/40">Plan Look</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Outfit Picker / Studio Modal */}
                <Dialog open={showOutfitPicker} onOpenChange={setShowOutfitPicker}>
                    <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col bg-[#FAF9F6] border-none shadow-2xl overflow-hidden">
                        <div className="flex flex-col md:flex-row h-full">
                            {/* Left: Context / Header */}
                            <div className="w-full md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-[#1A1A1A]/10 bg-white flex flex-col">
                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-2">
                                        Backstage Access
                                    </p>
                                    <h2 className="font-playfair text-4xl text-[#1A1A1A] mb-1">Select Look</h2>
                                    <p className="font-playfair italic text-xl text-[#80163a]">
                                        {selectedDate && format(selectedDate, 'MMMM do')}
                                    </p>
                                </div>

                                <div className="mt-12 space-y-6 flex-1">
                                    <div>
                                        <Label className="block font-mono text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 mb-3">
                                            Event Details
                                        </Label>
                                        <Input
                                            className="border-b border-[#1A1A1A]/20 rounded-none px-0 h-10 bg-transparent focus:outline-none focus:border-[#80163a] font-playfair text-xl placeholder:text-[#1A1A1A]/20"
                                            placeholder="Gala, Dinner, Office..."
                                            value={eventName}
                                            onChange={(e) => setEventName(e.target.value)}
                                        />
                                    </div>

                                    <div className="pt-8 border-t border-[#1A1A1A]/5">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Sparkles className="w-4 h-4 text-[#80163a]" />
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-[#1A1A1A]">AI Suggestion</span>
                                        </div>
                                        <p className="text-sm text-[#1A1A1A]/60 font-light leading-relaxed">
                                            Based on the season, a structured coat and tailored trousers would suit this date perfectly.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setLocation("/studio")}
                                    className="mt-8 w-full py-4 border border-[#1A1A1A] text-[#1A1A1A] font-mono text-xs uppercase tracking-[0.2em] hover:bg-[#1A1A1A] hover:text-white transition-all flex items-center justify-center gap-3"
                                >
                                    <Camera className="w-4 h-4" />
                                    <span>Create New Fit</span>
                                </button>
                            </div>

                            {/* Right: Grid */}
                            <div className="flex-1 bg-background overflow-y-auto p-8">
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                    {outfits?.map(outfit => {
                                        const recentlyWorn = isRecentlyWorn(outfit.id);
                                        return (
                                            <motion.div
                                                key={outfit.id}
                                                className={cn(
                                                    "cursor-pointer group relative aspect-[3/4] bg-white transition-all duration-500",
                                                    recentlyWorn ? "grayscale opacity-60" : "grayscale-0 hover:shadow-2xl"
                                                )}
                                                onClick={() => handlePlanOutfit(outfit.id)}
                                                whileHover={{ y: -5 }}
                                            >
                                                <div className="absolute inset-0 p-2">
                                                    <div className="w-full h-full bg-[#FAF9F6] relative overflow-hidden">
                                                        {getOutfitPreviewImage(outfit) ? (
                                                            <img
                                                                src={getOutfitPreviewImage(outfit)!}
                                                                alt={outfit.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Shirt className="w-8 h-8 text-[#1A1A1A]/10" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Selection Overlay */}
                                                <div className="absolute inset-0 bg-[#80163a]/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="font-mono text-white text-xs uppercase tracking-[0.2em] border border-white/30 px-4 py-2">
                                                        Select Look
                                                    </span>
                                                </div>

                                                {/* Info */}
                                                <div className="absolute -bottom-8 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                                                    <p className="font-playfair text-sm text-[#1A1A1A]">{outfit.name}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {(!outfits || outfits.length === 0) && (
                                    <div className="h-full flex flex-col items-center justify-center text-[#1A1A1A]/40">
                                        <Shirt className="w-12 h-12 mb-4 opacity-50" />
                                        <p className="font-playfair text-xl">No looks in collection</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
