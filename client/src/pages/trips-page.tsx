import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Plus, X, MapPin, Calendar, ChevronLeft, ChevronRight, Trash2, Briefcase, Check, Search, Sun, Cloud, Snowflake, Umbrella, Mountain, Building2, PartyPopper, Heart, Users } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, differenceInDays, isPast } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Trip } from "@shared/schema";
import { useWardrobeItems } from "@/hooks/use-wardrobe";

// Trip type configurations
const tripTypes = [
    { value: "vacation", label: "Vacation", icon: Plane, color: "#3B82F6" },
    { value: "business", label: "Business", icon: Building2, color: "#1A1A1A" },
    { value: "wedding", label: "Wedding", icon: Heart, color: "#EC4899" },
    { value: "festival", label: "Festival", icon: PartyPopper, color: "#F59E0B" },
    { value: "adventure", label: "Adventure", icon: Mountain, color: "#10B981" },
    { value: "family", label: "Family", icon: Users, color: "#8B5CF6" },
];

const getWeatherIcon = (temp: number) => {
    if (temp < 10) return Snowflake;
    if (temp < 20) return Cloud;
    return Sun;
};

export function TripsPage() {
    const [showForm, setShowForm] = useState(false);
    const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
    const [destination, setDestination] = useState("");
    const [tripType, setTripType] = useState("vacation");
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
        mutationFn: async (data: { destination: string; startDate: Date; endDate: Date; type: string }) => {
            return await apiRequest({
                method: "POST",
                path: "/api/trips",
                body: {
                    name: `${data.destination} ${data.startDate.getFullYear()}`,
                    destination: data.destination,
                    startDate: data.startDate.toISOString(),
                    endDate: data.endDate.toISOString(),
                    type: data.type,
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
        setTripType("vacation");
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
        createMutation.mutate({ destination, startDate, endDate, type: tripType });
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

        const updatedTrip = { ...activeTrip, packedItems: newItems };
        setActiveTrip(updatedTrip);
        updateTripMutation.mutate({ id: activeTrip.id, packedItems: newItems });
    };

    // Separate upcoming and past trips
    const { upcomingTrips, pastTrips } = useMemo(() => {
        const upcoming: Trip[] = [];
        const past: Trip[] = [];
        trips.forEach(trip => {
            if (isPast(new Date(trip.endDate))) {
                past.push(trip);
            } else {
                upcoming.push(trip);
            }
        });
        return { upcomingTrips: upcoming, pastTrips: past };
    }, [trips]);

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

    // Get trip type config
    const getTripTypeConfig = (type: string) => {
        return tripTypes.find(t => t.value === type) || tripTypes[0];
    };

    // Calculate days until trip
    const getDaysUntil = (startDate: string) => {
        const days = differenceInDays(new Date(startDate), new Date());
        return days > 0 ? days : 0;
    };

    // Calculate packing progress
    const getPackingProgress = (trip: Trip) => {
        const packed = (trip.packedItems || []).length;
        const suggested = 10; // You can make this dynamic based on trip length
        return Math.min((packed / suggested) * 100, 100);
    };

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
                    <motion.div
                        className="flex items-end justify-between mb-10"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div>
                            <p className="text-[#80163a] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Travel Planner</p>
                            <h1 className="text-4xl md:text-5xl font-playfair text-[#1a1a1a] leading-[0.9]">
                                My Trips
                            </h1>
                            <p className="text-gray-400 text-sm mt-2">{upcomingTrips.length} upcoming • {pastTrips.length} past</p>
                        </div>
                        <motion.button
                            onClick={() => setShowForm(true)}
                            className="h-12 px-6 rounded-full bg-[#1a1a1a] text-white flex items-center gap-2 hover:bg-[#80163a] transition-colors shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline text-sm font-medium">New Trip</span>
                        </motion.button>
                    </motion.div>

                    {/* Upcoming Trips */}
                    {upcomingTrips.length > 0 && (
                        <section className="mb-12">
                            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">Upcoming</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {upcomingTrips.map((trip, i) => {
                                    const typeConfig = getTripTypeConfig(trip.type || "vacation");
                                    const TypeIcon = typeConfig.icon;
                                    const daysUntil = getDaysUntil(trip.startDate);
                                    const progress = getPackingProgress(trip);

                                    return (
                                        <motion.div
                                            key={trip.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all relative"
                                        >
                                            {/* Countdown Banner */}
                                            {daysUntil <= 7 && daysUntil > 0 && (
                                                <div className="bg-gradient-to-r from-[#80163a] to-[#a02050] px-4 py-2 flex items-center justify-between">
                                                    <span className="text-white text-xs font-medium">
                                                        {daysUntil === 1 ? "Tomorrow!" : `${daysUntil} days to go`}
                                                    </span>
                                                    <Plane className="w-4 h-4 text-white/70" />
                                                </div>
                                            )}

                                            <div className="p-5">
                                                {/* Delete button */}
                                                <button
                                                    onClick={() => deleteMutation.mutate(trip.id)}
                                                    className="absolute top-4 right-4 p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>

                                                {/* Trip Type & Destination */}
                                                <div className="flex items-start gap-3 mb-4">
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                                        style={{ backgroundColor: `${typeConfig.color}15` }}
                                                    >
                                                        <TypeIcon className="w-6 h-6" style={{ color: typeConfig.color }} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: typeConfig.color }}>
                                                            {typeConfig.label}
                                                        </span>
                                                        <h3 className="text-xl font-playfair text-[#1a1a1a] truncate">{trip.destination}</h3>
                                                    </div>
                                                </div>

                                                {/* Date Range */}
                                                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4">
                                                    <Calendar className="w-4 h-4 shrink-0" />
                                                    <span className="truncate">
                                                        {format(new Date(trip.startDate), "MMM d")} – {format(new Date(trip.endDate), "MMM d, yyyy")}
                                                    </span>
                                                </div>

                                                {/* Packing Progress */}
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between text-xs mb-2">
                                                        <span className="text-gray-400">Packing Progress</span>
                                                        <span className="font-medium text-[#1a1a1a]">{(trip.packedItems || []).length} items</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full rounded-full"
                                                            style={{ backgroundColor: typeConfig.color }}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            transition={{ duration: 0.5, delay: i * 0.1 }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Manage Packing Button */}
                                                <button
                                                    onClick={() => setActiveTrip(trip)}
                                                    className="w-full h-11 rounded-xl bg-[#1a1a1a] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#80163a] transition-colors"
                                                >
                                                    <Briefcase className="w-4 h-4" />
                                                    Manage Packing
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Past Trips */}
                    {pastTrips.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">Past Trips</h2>
                            <div className="grid gap-3 md:grid-cols-3">
                                {pastTrips.map((trip, i) => {
                                    const typeConfig = getTripTypeConfig(trip.type || "vacation");
                                    const TypeIcon = typeConfig.icon;

                                    return (
                                        <motion.div
                                            key={trip.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="group bg-white/50 rounded-xl p-4 border border-gray-100 hover:bg-white transition-all relative"
                                        >
                                            <button
                                                onClick={() => deleteMutation.mutate(trip.id)}
                                                className="absolute top-2 right-2 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>

                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 opacity-50"
                                                    style={{ backgroundColor: `${typeConfig.color}15` }}
                                                >
                                                    <TypeIcon className="w-4 h-4" style={{ color: typeConfig.color }} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-medium text-gray-600 truncate">{trip.destination}</h3>
                                                    <p className="text-[10px] text-gray-400">
                                                        {format(new Date(trip.startDate), "MMM yyyy")} • {(trip.packedItems || []).length} items
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Empty State */}
                    {trips.length === 0 && (
                        <motion.div
                            className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                                <Plane className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-2xl font-playfair text-[#1a1a1a] mb-2">No trips yet</h3>
                            <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                                Plan your next adventure and pack with style
                            </p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="h-12 px-8 rounded-full bg-[#1a1a1a] text-white text-sm font-medium inline-flex items-center gap-2 hover:bg-[#80163a] transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Plan Your First Trip
                            </button>
                        </motion.div>
                    )}

                    {/* Create Form Modal */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                onClick={closeForm}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                                >
                                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                        <h2 className="text-2xl font-playfair text-[#1a1a1a]">New Trip</h2>
                                        <button onClick={closeForm} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                                            <X className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-5 space-y-5">
                                        {/* Trip Type Selection */}
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                                                Trip Type
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {tripTypes.map(type => {
                                                    const TypeIcon = type.icon;
                                                    const isSelected = tripType === type.value;
                                                    return (
                                                        <button
                                                            key={type.value}
                                                            type="button"
                                                            onClick={() => setTripType(type.value)}
                                                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${isSelected
                                                                ? 'border-[#1a1a1a] bg-[#1a1a1a]'
                                                                : 'border-gray-100 hover:border-gray-200'
                                                                }`}
                                                        >
                                                            <TypeIcon
                                                                className="w-5 h-5"
                                                                style={{ color: isSelected ? 'white' : type.color }}
                                                            />
                                                            <span className={`text-[10px] font-medium ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                                                                {type.label}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Destination */}
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                                                Destination
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={destination}
                                                    onChange={(e) => setDestination(e.target.value)}
                                                    placeholder="Paris, Tokyo, New York..."
                                                    className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-xl text-[#1a1a1a] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#80163a]/20 focus:border-[#80163a]"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        {/* Date Selection */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => { setPickerView("start"); setPickerMonth(startDate || new Date()); }}
                                                className={`h-12 px-3 border rounded-xl text-left flex items-center gap-2 transition-all ${pickerView === "start" ? "border-[#80163a] ring-2 ring-[#80163a]/20" : "border-gray-200 hover:border-gray-300"
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
                                                className={`h-12 px-3 border rounded-xl text-left flex items-center gap-2 transition-all ${pickerView === "end" ? "border-[#80163a] ring-2 ring-[#80163a]/20" : "border-gray-200 hover:border-gray-300"
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

                                                        <div className="grid grid-cols-7 gap-1 mb-1">
                                                            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                                                                <div key={i} className="text-center text-[10px] font-medium text-gray-400 py-1">
                                                                    {d}
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="grid grid-cols-7 gap-1">
                                                            {paddingDays.map((_, i) => (
                                                                <div key={`pad-${i}`} />
                                                            ))}
                                                            {calendarDays.map((day) => {
                                                                const isStart = startDate && isSameDay(day, startDate);
                                                                const isEnd = endDate && isSameDay(day, endDate);
                                                                const isInRange = startDate && endDate && day > startDate && day < endDate;
                                                                const isTodayDay = isToday(day);
                                                                const isPastDay = day < new Date(new Date().setHours(0, 0, 0, 0));

                                                                return (
                                                                    <button
                                                                        key={day.toISOString()}
                                                                        type="button"
                                                                        onClick={() => handleDateSelect(day)}
                                                                        disabled={isPastDay}
                                                                        className={`
                                                                            aspect-square rounded-lg text-xs font-medium transition-all
                                                                            ${isPastDay ? "text-gray-300 cursor-not-allowed" : "hover:bg-[#80163a]/10 cursor-pointer"}
                                                                            ${isStart || isEnd ? "bg-[#80163a] text-white" : ""}
                                                                            ${isInRange ? "bg-[#80163a]/10 text-[#80163a]" : ""}
                                                                            ${isTodayDay && !isStart && !isEnd ? "ring-1 ring-[#80163a]" : ""}
                                                                            ${!isStart && !isEnd && !isInRange && !isPastDay ? "text-[#1a1a1a]" : ""}
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
                                            className="w-full h-12 bg-[#1a1a1a] text-white rounded-xl font-semibold text-sm hover:bg-[#80163a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                onClick={() => setActiveTrip(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-[#FAF9F6] rounded-3xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-1">Packing For</p>
                                            <h2 className="text-2xl font-playfair text-[#1a1a1a]">{activeTrip.destination}</h2>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-[#80163a] bg-[#80163a]/10 px-3 py-1.5 rounded-full">
                                                {(activeTrip.packedItems || []).length} packed
                                            </span>
                                            <button
                                                onClick={() => setActiveTrip(null)}
                                                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
                                            >
                                                <X className="w-5 h-5 text-gray-500" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Search */}
                                    <div className="p-4 bg-white border-b border-gray-100">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search your wardrobe..."
                                                className="w-full h-11 pl-10 pr-4 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#80163a]/20"
                                                value={packingSearch}
                                                onChange={(e) => setPackingSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Items Grid */}
                                    <div className="flex-1 overflow-y-auto p-6">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {filteredWardrobe?.map(item => {
                                                const isPacked = activeTrip.packedItems?.includes(item.id);
                                                return (
                                                    <motion.div
                                                        key={item.id}
                                                        onClick={() => togglePackedItem(item.id)}
                                                        className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${isPacked ? 'border-[#80163a] shadow-lg' : 'border-transparent hover:border-gray-200'}`}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />

                                                        {isPacked ? (
                                                            <div className="absolute inset-0 bg-[#80163a]/20 flex items-center justify-center">
                                                                <div className="bg-[#80163a] p-3 rounded-full text-white shadow-lg">
                                                                    <Check className="w-5 h-5" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                        )}

                                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                                            <p className="text-white text-xs font-medium truncate">{item.name}</p>
                                                            <p className="text-white/60 text-[10px] capitalize">{item.category}</p>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Footer */}
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
