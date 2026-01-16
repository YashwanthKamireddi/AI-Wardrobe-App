import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Plus, X, MapPin, Calendar, ChevronLeft, ChevronRight, Trash2, Briefcase, Check, Search, Grid3X3 } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Trip } from "@shared/schema";
import { useWardrobeItems } from "@/hooks/use-wardrobe";

export function TripsPage() {
    const [showForm, setShowForm] = useState(false);
    const [activeTrip, setActiveTrip] = useState<Trip | null>(null); // For packing list
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [pickerView, setPickerView] = useState<"start" | "end" | null>(null);
    const [pickerMonth, setPickerMonth] = useState(new Date());
    const [packingSearch, setPackingSearch] = useState("");

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: trips = [], isLoading: tripsLoading } = useQuery<Trip[]>({
        queryKey: ["/api/trips"],
    });

    const { data: wardrobeItems, isLoading: wardrobeLoading } = useWardrobeItems();

    const createMutation = useMutation({
        mutationFn: async (data: { destination: string; startDate: Date; endDate: Date }) => {
            return await apiRequest({
                method: "POST",
                path: "/api/trips",
                body: {
                    name: `${data.destination} ${data.startDate.getFullYear()}`,
                    destination: data.destination,
                    startDate: data.startDate.toISOString(),
                    endDate: data.endDate.toISOString(),
                    type: "vacation",
                    packedItems: [],
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
            closeForm();
            toast({ title: "Trip created!" });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err?.message || "Failed to create trip", variant: "destructive" });
        },
    });

    const updateTripMutation = useMutation({
        mutationFn: async (data: { id: number; packedItems: number[] }) => {
            return await apiRequest({
                method: "PATCH",
                path: `/api/trips/${data.id}`,
                body: { packedItems: data.packedItems },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (tripId: number) => {
            return await apiRequest({
                method: "DELETE",
                path: `/api/trips/${tripId}`,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
            toast({ title: "Trip deleted" });
        },
    });

    const closeForm = () => {
        setShowForm(false);
        setDestination("");
        setStartDate(null);
        setEndDate(null);
        setPickerView(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!destination || !startDate || !endDate) {
            toast({ title: "Please fill all fields", variant: "destructive" });
            return;
        }
        createMutation.mutate({ destination, startDate, endDate });
    };

    const handleDateSelect = (date: Date) => {
        if (pickerView === "start") {
            setStartDate(date);
            setPickerView("end");
            setPickerMonth(date);
        } else if (pickerView === "end") {
            if (startDate && date < startDate) {
                setEndDate(startDate);
                setStartDate(date);
            } else {
                setEndDate(date);
            }
            setPickerView(null);
        }
    };

    const togglePackedItem = (itemId: number) => {
        if (!activeTrip) return;
        const currentItems = activeTrip.packedItems || [];
        const newItems = currentItems.includes(itemId)
            ? currentItems.filter(id => id !== itemId)
            : [...currentItems, itemId];

        // Optimistic update
        const updatedTrip = { ...activeTrip, packedItems: newItems };
        setActiveTrip(updatedTrip); // Update local state for immediate feedback
        updateTripMutation.mutate({ id: activeTrip.id, packedItems: newItems });
    };

    // Filter wardrobe for packing
    const filteredWardrobe = wardrobeItems?.filter(item =>
        item.name.toLowerCase().includes(packingSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(packingSearch.toLowerCase())
    );

    // Generate calendar days for picker
    const calendarDays = eachDayOfInterval({
        start: startOfMonth(pickerMonth),
        end: endOfMonth(pickerMonth),
    });
    const startDayOfWeek = startOfMonth(pickerMonth).getDay();
    const paddingDays = Array(startDayOfWeek).fill(null);

    const isLoading = tripsLoading || wardrobeLoading;

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a1a1a] border-t-transparent" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#FAF9F6] px-4 py-8 md:px-8 md:py-12">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="text-[#80163a] text-xs font-semibold uppercase tracking-wider mb-1">Travel</p>
                            <h1 className="text-3xl md:text-4xl font-playfair text-[#1a1a1a]">My Trips</h1>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-[#80163a] transition-colors shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Trips List */}
                    {trips.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
                            <Plane className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 mb-4">No trips planned yet</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="text-[#80163a] text-sm font-semibold uppercase tracking-wider hover:underline"
                            >
                                Plan your first trip
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {trips.map((trip, i) => (
                                <motion.div
                                    key={trip.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all relative"
                                >
                                    <button
                                        onClick={() => deleteMutation.mutate(trip.id)}
                                        className="absolute top-3 right-3 p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] flex items-center justify-center shrink-0">
                                            <Plane className="w-5 h-5 text-[#1a1a1a]" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-playfair text-[#1a1a1a] truncate">{trip.destination}</h3>
                                            <p className="text-[10px] text-[#80163a] font-semibold uppercase tracking-wider">{trip.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4">
                                        <Calendar className="w-4 h-4 shrink-0" />
                                        <span className="truncate">
                                            {format(new Date(trip.startDate), "MMM d")} – {format(new Date(trip.endDate), "MMM d, yyyy")}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                        <span className="text-xs text-gray-400">
                                            {(trip.packedItems || []).length} items packed
                                        </span>
                                        <button
                                            onClick={() => setActiveTrip(trip)}
                                            className="text-xs font-medium text-[#1a1a1a] flex items-center gap-1 hover:text-[#80163a]"
                                        >
                                            <Briefcase className="w-3 h-3" />
                                            Manage Packing
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Create Form Modal */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                                onClick={closeForm}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                                >
                                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                        <h2 className="text-xl font-playfair text-[#1a1a1a]">New Trip</h2>
                                        <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                        {/* Destination */}
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                                Where to?
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={destination}
                                                    onChange={(e) => setDestination(e.target.value)}
                                                    placeholder="Paris, Tokyo, New York..."
                                                    className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-xl text-[#1a1a1a] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#80163a]/20 focus:border-[#80163a]"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        {/* Date Selection */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => { setPickerView("start"); setPickerMonth(startDate || new Date()); }}
                                                className={`h-11 px-3 border rounded-xl text-left flex items-center gap-2 transition-all ${pickerView === "start" ? "border-[#80163a] ring-2 ring-[#80163a]/20" : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className={`text-sm ${startDate ? "text-[#1a1a1a]" : "text-gray-400"}`}>
                                                    {startDate ? format(startDate, "MMM d") : "Start"}
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setPickerView("end"); setPickerMonth(endDate || startDate || new Date()); }}
                                                className={`h-11 px-3 border rounded-xl text-left flex items-center gap-2 transition-all ${pickerView === "end" ? "border-[#80163a] ring-2 ring-[#80163a]/20" : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className={`text-sm ${endDate ? "text-[#1a1a1a]" : "text-gray-400"}`}>
                                                    {endDate ? format(endDate, "MMM d") : "End"}
                                                </span>
                                            </button>
                                        </div>

                                        {/* Inline Calendar Picker */}
                                        <AnimatePresence>
                                            {pickerView && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                                                        {/* Month Nav */}
                                                        <div className="flex items-center justify-between mb-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => setPickerMonth(subMonths(pickerMonth, 1))}
                                                                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                                                            >
                                                                <ChevronLeft className="w-4 h-4" />
                                                            </button>
                                                            <span className="text-sm font-semibold text-[#1a1a1a]">
                                                                {format(pickerMonth, "MMMM yyyy")}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setPickerMonth(addMonths(pickerMonth, 1))}
                                                                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                                                            >
                                                                <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        {/* Day Headers */}
                                                        <div className="grid grid-cols-7 gap-1 mb-1">
                                                            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                                                                <div key={i} className="text-center text-[10px] font-medium text-gray-400 py-1">
                                                                    {d}
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Days Grid */}
                                                        <div className="grid grid-cols-7 gap-1">
                                                            {paddingDays.map((_, i) => (
                                                                <div key={`pad-${i}`} />
                                                            ))}
                                                            {calendarDays.map((day) => {
                                                                const isStart = startDate && isSameDay(day, startDate);
                                                                const isEnd = endDate && isSameDay(day, endDate);
                                                                const isInRange = startDate && endDate && day > startDate && day < endDate;
                                                                const isTodayDay = isToday(day);
                                                                const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

                                                                return (
                                                                    <button
                                                                        key={day.toISOString()}
                                                                        type="button"
                                                                        onClick={() => handleDateSelect(day)}
                                                                        disabled={isPast}
                                                                        className={`
                                                                            aspect-square rounded-lg text-xs font-medium transition-all
                                                                            ${isPast ? "text-gray-300 cursor-not-allowed" : "hover:bg-[#80163a]/10 cursor-pointer"}
                                                                            ${isStart || isEnd ? "bg-[#80163a] text-white" : ""}
                                                                            ${isInRange ? "bg-[#80163a]/10 text-[#80163a]" : ""}
                                                                            ${isTodayDay && !isStart && !isEnd ? "ring-1 ring-[#80163a]" : ""}
                                                                            ${!isStart && !isEnd && !isInRange && !isPast ? "text-[#1a1a1a]" : ""}
                                                                        `}
                                                                    >
                                                                        {format(day, "d")}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <button
                                            type="submit"
                                            disabled={createMutation.isPending || !destination || !startDate || !endDate}
                                            className="w-full h-11 bg-[#1a1a1a] text-white rounded-xl font-semibold text-sm uppercase tracking-wider hover:bg-[#80163a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {createMutation.isPending ? "Creating..." : "Create Trip"}
                                        </button>
                                    </form>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Packing List Modal */}
                    <AnimatePresence>
                        {activeTrip && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                                onClick={() => setActiveTrip(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-[#FAF9F6] rounded-3xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden"
                                >
                                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 sticky top-0">
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Packing For</p>
                                            <h2 className="text-2xl font-playfair text-[#1a1a1a]">{activeTrip.destination}</h2>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-[#80163a] bg-[#80163a]/5 px-3 py-1 rounded-full">
                                                {(activeTrip.packedItems || []).length} Selected
                                            </span>
                                            <button onClick={() => setActiveTrip(null)} className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                                                <X className="w-5 h-5 text-gray-500" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white border-b border-gray-100">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search wardrobe..."
                                                className="w-full h-10 pl-10 pr-4 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#80163a]"
                                                value={packingSearch}
                                                onChange={(e) => setPackingSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {filteredWardrobe?.map(item => {
                                                const isPacked = activeTrip.packedItems?.includes(item.id);
                                                return (
                                                    <motion.div
                                                        key={item.id}
                                                        onClick={() => togglePackedItem(item.id)}
                                                        className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${isPacked ? 'border-[#80163a]' : 'border-transparent hover:border-gray-200'}`}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />

                                                        {isPacked ? (
                                                            <div className="absolute inset-0 bg-[#80163a]/20 flex items-center justify-center">
                                                                <div className="bg-[#80163a] p-2 rounded-full text-white shadow-lg">
                                                                    <Briefcase className="w-4 h-4" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                        )}

                                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                                            <p className="text-white text-xs font-medium truncate">{item.name}</p>
                                                        </div>
                                                    </motion.div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white border-t border-gray-100">
                                        <button
                                            onClick={() => setActiveTrip(null)}
                                            className="w-full h-12 bg-[#1a1a1a] text-white rounded-xl font-medium hover:bg-[#80163a] transition-colors"
                                        >
                                            Done Packing
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </AppLayout>
    );
}
