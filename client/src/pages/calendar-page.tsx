import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";
import { AppLayout } from "@/components/layout/app-layout";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Shirt, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { OutfitCalendar, Outfit } from "@shared/schema";
import { useLocation } from "wouter";

export function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showOutfitPicker, setShowOutfitPicker] = useState(false);
    const [eventName, setEventName] = useState("");
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

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
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
            // Store date as YYYY-MM-DD
            const dateStr = new Date(event.date).toISOString().split('T')[0];
            map.set(dateStr, event);
        });
        return map;
    }, [calendarEvents]);

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

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({
            start: startDate,
            end: endDate,
        });
    }, [currentDate]);

    const getDateKey = (date: Date) => date.toISOString().split('T')[0];

    const getOutfitForDate = (date: Date) => {
        const key = getDateKey(date);
        const event = eventsByDate.get(key);
        if (!event || !event.outfitId || !outfits) return null;

        const outfit = outfits.find(o => o.id === event.outfitId);
        return outfit ? { ...event, outfit } : null;
    };

    // Date formatting for header
    const monthName = format(currentDate, 'MMMM');
    const year = format(currentDate, 'yyyy');

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
                <div className="flex-1 flex flex-col md:px-6 md:pb-6 max-w-7xl mx-auto w-full">
                    {/* Header */}
                    <div className="pt-12 pb-8 px-6 md:px-0 flex flex-col md:flex-row justify-between items-end border-b border-[#1a1a1a] mb-6">
                        <div className="relative">
                            <span className="text-[#80163a] text-xs font-bold uppercase tracking-[0.2em] mb-4 block">Planner</span>
                            <div className="flex items-baseline gap-4">
                                <h1 className="text-5xl md:text-7xl font-playfair text-[#1a1a1a] leading-[0.9]">
                                    {monthName}
                                </h1>
                                <span className="text-xl md:text-3xl font-playfair italic text-gray-300">{year}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-6 md:mt-0">
                            <button
                                onClick={goToToday}
                                className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1a1a1a] hover:text-[#80163a] mr-4 transition-colors"
                            >
                                Today
                            </button>
                            <div className="flex items-center gap-1 border border-[#e5e5e5] rounded-full p-1 bg-white">
                                <button onClick={prevMonth} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#FAF9F6] transition-colors">
                                    <ArrowLeft className="w-4 h-4 text-[#1a1a1a]" />
                                </button>
                                <div className="w-[1px] h-4 bg-[#e5e5e5]" />
                                <button onClick={nextMonth} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#FAF9F6] transition-colors">
                                    <ArrowRight className="w-4 h-4 text-[#1a1a1a]" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Container - Responsive Layout */}
                    <div className="flex-1 flex flex-col overflow-hidden">

                        {/* MOBILE: Horizontal Day Scroller */}
                        <div className="md:hidden mb-6">
                            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-6 px-6">
                                {calendarDays.map((day) => {
                                    const eventData = getOutfitForDate(day);
                                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                                    const isTodayDate = isToday(day);

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={`shrink-0 snap-center w-[16vw] flex flex-col items-center gap-2 cursor-pointer transition-all ${isSelected ? "opacity-100" : "opacity-50"
                                                }`}
                                            onClick={() => {
                                                setSelectedDate(day);
                                                if (!eventData) setShowOutfitPicker(true);
                                            }}
                                        >
                                            <span className="text-[10px] uppercase tracking-wider text-[#9A9A9A]">
                                                {format(day, 'EEE')}
                                            </span>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${isSelected ? "bg-[#1A1A1A] text-white scale-110 shadow-lg" :
                                                    isTodayDate ? "bg-[#E5E5E5] text-[#1A1A1A]" : "bg-transparent text-[#1A1A1A]"
                                                }`}>
                                                {format(day, 'd')}
                                            </div>
                                            {/* Event Dot Indicator */}
                                            <div className={`w-1 h-1 rounded-full ${eventData ? "bg-[#80163A]" : "bg-transparent"}`} />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Mobile Event Card (Active Day) */}
                            <AnimatePresence mode="wait">
                                {selectedDate && (
                                    <motion.div
                                        key={selectedDate.toISOString()}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-2"
                                    >
                                        {getOutfitForDate(selectedDate)?.outfit ? (
                                            <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] shadow-sm">
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-xs uppercase tracking-widest text-[#9A9A9A]">Scheduled Look</p>
                                                    <div className="flex gap-2">
                                                        <button onClick={(e) => handleRemoveEvent(e, getOutfitForDate(selectedDate)!.id)}>
                                                            <X className="w-4 h-4 text-[#9A9A9A]" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    {getOutfitPreviewImage(getOutfitForDate(selectedDate)!.outfit) && (
                                                        <div className="w-20 h-24 rounded-lg bg-[#FAF9F6] overflow-hidden shrink-0">
                                                            <img
                                                                src={getOutfitPreviewImage(getOutfitForDate(selectedDate)!.outfit)!}
                                                                alt="Look"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h3 className="font-serif text-xl italic text-[#1A1A1A] mb-1">
                                                            {getOutfitForDate(selectedDate)?.outfit.name}
                                                        </h3>
                                                        <p className="text-sm text-[#666666]">
                                                            {getOutfitForDate(selectedDate)?.eventName || "No event name"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="bg-[#FAFAFA] border border-dashed border-[#E5E5E5] rounded-xl p-8 flex flex-col items-center justify-center text-center"
                                                onClick={() => setShowOutfitPicker(true)}
                                            >
                                                <Plus className="w-8 h-8 text-[#E5E5E5] mb-2" />
                                                <p className="text-sm text-[#9A9A9A]">Plan a look for {format(selectedDate, 'MMM do')}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* DESKTOP: Full Calendar Grid */}
                        <div className="hidden md:flex flex-1 bg-white border border-[#e5e5e5] rounded-xl shadow-sm overflow-hidden flex-col">
                            {/* Days Header */}
                            <div className="grid grid-cols-7 border-b border-[#e5e5e5] bg-[#FAF9F6] shrink-0">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="py-4 text-center text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
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
                                        <div
                                            key={day.toISOString()}
                                            onClick={() => {
                                                setSelectedDate(day);
                                                if (!eventData) setShowOutfitPicker(true);
                                            }}
                                            className={cn(
                                                "border-b border-r border-[#e5e5e5] p-3 relative transition-all cursor-pointer group hover:bg-[#FAF9F6] min-h-[140px]",
                                                (dayIdx + 1) % 7 === 0 && "border-r-0", // No right border on last column
                                                !isCurrentMonth && "bg-[#F9F9F9] text-gray-300"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className={cn(
                                                    "font-playfair text-lg w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                                                    isTodayDate
                                                        ? "bg-[#1a1a1a] text-white shadow-lg"
                                                        : "text-[#1a1a1a]",
                                                    !isCurrentMonth && "text-gray-300"
                                                )}>
                                                    {format(day, 'd')}
                                                </div>

                                                {/* Add Button */}
                                                {!eventData && isCurrentMonth && (
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Plus className="w-4 h-4 text-[#e5e5e5]" />
                                                    </div>
                                                )}
                                            </div>

                                            {eventData && eventData.outfit ? (
                                                <div className="animate-in fade-in zoom-in duration-300">
                                                    <div className="bg-[#FAF9F6] border border-[#e5e5e5] hover:border-[#80163A] transition-colors rounded-lg overflow-hidden relative group/event">
                                                        <div className="flex items-center gap-2 p-1.5">
                                                            {getOutfitPreviewImage(eventData.outfit) && (
                                                                <div className="w-8 h-10 rounded-sm bg-gray-100 overflow-hidden shrink-0">
                                                                    <img
                                                                        src={getOutfitPreviewImage(eventData.outfit)!}
                                                                        alt={eventData.outfit.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="overflow-hidden">
                                                                {eventData.eventName && (
                                                                    <p className="text-[9px] uppercase tracking-wider text-[#80163A] font-bold truncate mb-0.5">
                                                                        {eventData.eventName}
                                                                    </p>
                                                                )}
                                                                <p className="font-playfair text-xs text-[#1a1a1a] truncate leading-tight">
                                                                    {eventData.outfit.name}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={(e) => handleRemoveEvent(e, eventData.id)}
                                                            className="absolute top-1 right-1 opacity-0 group-hover/event:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-full"
                                                        >
                                                            <X className="w-3 h-3 text-red-500" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Outfit Picker Dialog (Refined) */}
                <Dialog open={showOutfitPicker} onOpenChange={setShowOutfitPicker}>
                    <DialogContent className="max-w-3xl max-h-[85vh] p-0 flex flex-col bg-white border-none shadow-2xl overflow-hidden">
                        <div className="p-6 bg-white border-b border-[#e5e5e5] shrink-0">
                            <DialogHeader>
                                <DialogTitle className="font-playfair text-2xl">Select Look</DialogTitle>
                                <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">
                                    For {selectedDate && format(selectedDate, 'MMMM do, yyyy')}
                                </p>
                            </DialogHeader>
                        </div>

                        {/* Event Name Input */}
                        <div className="px-6 py-4 bg-[#FAF9F6] border-b border-[#e5e5e5] shrink-0">
                            <Label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">Event Name (Optional)</Label>
                            <Input
                                className="border-[#e5e5e5] rounded-lg h-10 bg-white"
                                placeholder="e.g. Gallery Opening, Date Night..."
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                            />
                        </div>

                        {/* Outfit Grid - with explicit height */}
                        <div className="flex-1 overflow-y-auto p-6 bg-[#FAF9F6]" style={{ maxHeight: "50vh" }}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs uppercase tracking-widest text-gray-500">Your Outfits</span>
                                <span className="text-xs text-gray-400">{outfits?.length || 0} looks</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {/* Create New Card */}
                                <div
                                    onClick={() => setLocation("/studio")}
                                    className="aspect-[3/4] border-2 border-dashed border-[#e5e5e5] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#1a1a1a] hover:bg-white transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 group-hover:bg-[#1a1a1a] transition-colors shadow-sm">
                                        <Plus className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                    </div>
                                    <p className="font-playfair text-base text-[#1a1a1a]">New Look</p>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Create in Studio</p>
                                </div>

                                {outfits?.map(outfit => (
                                    <div
                                        key={outfit.id}
                                        className="cursor-pointer group relative aspect-[3/4] bg-white border border-[#e5e5e5] rounded-xl overflow-hidden hover:shadow-lg hover:border-[#80163a]/30 transition-all"
                                        onClick={() => handlePlanOutfit(outfit.id)}
                                    >
                                        {/* Image or placeholder */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                                            {getOutfitPreviewImage(outfit) ? (
                                                <img
                                                    src={getOutfitPreviewImage(outfit)!}
                                                    alt={outfit.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <Shirt className="w-10 h-10 text-gray-200 group-hover:scale-110 transition-transform duration-300" />
                                            )}
                                        </div>

                                        {/* Overlay Label */}
                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-white/95 border-t border-[#e5e5e5]">
                                            <p className="font-playfair text-sm text-[#1a1a1a] truncate">{outfit.name}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{outfit.items?.length || 0} items</p>
                                        </div>

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-[#80163a]/0 group-hover:bg-[#80163a]/5 transition-colors flex items-center justify-center">
                                            <span className="opacity-0 group-hover:opacity-100 text-[#80163a] text-xs font-semibold uppercase tracking-widest bg-white px-3 py-1.5 rounded-full shadow-sm transition-opacity">
                                                Select
                                            </span>
                                        </div>
                                    </div>
                                ))}
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
