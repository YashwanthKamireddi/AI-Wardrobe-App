import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plane, Plus, X, MapPin, Calendar, ChevronLeft, ChevronRight,
    Trash2, Check, Search, Mountain, Building2, PartyPopper, Heart, Users,
    QrCode, Ticket, ScanLine
} from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, differenceInDays, isPast } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Trip } from "@shared/schema";
import { useWardrobeItems } from "@/hooks/use-wardrobe";

// Trip type configurations with updated colors for the luxury theme
const tripTypes = [
    { value: "vacation", label: "Vacation", icon: Plane, color: "#80163a" },
    { value: "business", label: "Business", icon: Building2, color: "#1A1A1A" },
    { value: "wedding", label: "Wedding", icon: Heart, color: "#EC4899" },
    { value: "festival", label: "Festival", icon: PartyPopper, color: "#F59E0B" },
    { value: "adventure", label: "Adventure", icon: Mountain, color: "#10B981" },
    { value: "family", label: "Family", icon: Users, color: "#8B5CF6" },
];

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
            toast({ title: "Itinerary Created", description: "Your journey has been logged." });
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
            toast({ title: "Itinerary Cancelled" });
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
            toast({ title: "Incomplete details", description: "Please provide all travel correct details.", variant: "destructive" });
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

    const { upcomingTrips, pastTrips } = useMemo(() => {
        const upcoming: Trip[] = [];
        const past: Trip[] = [];
        trips.forEach(trip => {
            if (isPast(new Date(trip.endDate)) && !isToday(new Date(trip.endDate))) {
                past.push(trip);
            } else {
                upcoming.push(trip);
            }
        });
        return { upcomingTrips: upcoming.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()), pastTrips: past.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()) };
    }, [trips]);

    const filteredWardrobe = wardrobeItems?.filter(item =>
        item.name.toLowerCase().includes(packingSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(packingSearch.toLowerCase())
    );

    const calendarDays = eachDayOfInterval({
        start: startOfMonth(pickerMonth),
        end: endOfMonth(pickerMonth),
    });
    const startDayOfWeek = startOfMonth(pickerMonth).getDay();
    const paddingDays = Array(startDayOfWeek).fill(null);

    const getTripTypeConfig = (type: string) => {
        return tripTypes.find(t => t.value === type) || tripTypes[0];
    };

    const getDaysUntil = (startDate: string | Date) => {
        const days = differenceInDays(new Date(startDate), new Date());
        return days > 0 ? days : 0;
    };

    const isLoading = tripsLoading || wardrobeLoading;

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#80163a]" />
                        <p className="text-[#80163a] font-geist-mono text-xs tracking-widest uppercase">Loading Itinerary...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#F5F4F0] relative overflow-hidden">
                {/* Background "Noise" Texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

                <div className="max-w-4xl mx-auto px-4 py-8 md:px-8 md:py-16 relative z-10">

                    {/* Editorial Header */}
                    <div className="mb-16 flex items-end justify-between">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 mb-4"
                            >
                                <div className="h-[1px] w-12 bg-[#80163a]" />
                                <span className="text-[#80163a] font-geist-mono text-xs uppercase tracking-[0.2em]">Voyage Log</span>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl md:text-7xl font-playfair text-[#1A1A1A] leading-[0.9]"
                            >
                                The<br />Itinerary
                            </motion.h1>
                        </div>

                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            onClick={() => setShowForm(true)}
                            className="group relative px-6 py-3 bg-[#1A1A1A] text-[#FAF9F6] overflow-hidden rounded-sm"
                        >
                            <div className="relative z-10 flex items-center gap-2 font-geist-mono text-xs uppercase tracking-wider">
                                <Plus className="w-3 h-3" />
                                <span>Book Trip</span>
                            </div>
                            <div className="absolute inset-0 bg-[#80163a] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        </motion.button>
                    </div>

                    {/* Upcoming Voyages */}
                    <div className="space-y-8 mb-20">
                        {upcomingTrips.map((trip, i) => {
                            const config = getTripTypeConfig(trip.type || "vacation");
                            const TypeIcon = config.icon;
                            const daysUntil = getDaysUntil(trip.startDate);

                            return (
                                <motion.div
                                    key={trip.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 + 0.3 }}
                                    className="group relative bg-[#FAF9F6] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
                                >
                                    {/* Boarding Pass Layout */}
                                    <div className="flex flex-col md:flex-row min-h-[220px]">
                                        {/* Left: Main Details */}
                                        <div className="flex-1 p-8 relative border-b md:border-b-0 md:border-r border-[#1A1A1A]/5 border-dashed">
                                            <div className="absolute top-4 right-4 md:hidden">
                                                <div className="p-2 border border-[#1A1A1A]/10 rounded-full">
                                                    <TypeIcon className="w-4 h-4 text-[#1A1A1A]/40" />
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-between h-full">
                                                <div>
                                                    <div className="flex items-center gap-2 text-[#80163a] font-geist-mono text-[10px] uppercase tracking-widest mb-2">
                                                        <span>Flight No. {trip.id.toString().padStart(4, '0')}</span>
                                                        <span className="w-1 h-1 rounded-full bg-[#80163a]" />
                                                        <span>{config.label}</span>
                                                    </div>
                                                    <h3 className="text-4xl md:text-5xl font-playfair text-[#1A1A1A] mb-1">{trip.destination}</h3>
                                                    <p className="font-geist-mono text-xs text-[#1A1A1A]/40 uppercase tracking-widest">
                                                        {format(new Date(trip.startDate), "MMMM d").toUpperCase()} — {format(new Date(trip.endDate), "MMMM d, yyyy").toUpperCase()}
                                                    </p>
                                                </div>

                                                <div className="mt-8 flex items-end justify-between">
                                                    <div>
                                                        <p className="font-geist-mono text-[9px] text-[#1A1A1A]/30 uppercase tracking-widest mb-1">Status</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="font-geist-mono text-xs text-[#1A1A1A] uppercase">Confirmed</span>
                                                        </div>
                                                    </div>

                                                    <div className="hidden md:block">
                                                        <TypeIcon className="w-8 h-8 text-[#1A1A1A]/5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Tear-off / Actions */}
                                        <div className="w-full md:w-80 bg-[#F5F4F0]/50 p-8 flex flex-col justify-between relative group-hover:bg-[#80163a] transition-colors duration-500">
                                            {/* Decorative 'Cut' circles */}
                                            <div className="absolute -left-3 top-0 bottom-0 flex flex-col justify-between py-2 hidden md:flex">
                                                {Array.from({ length: 12 }).map((_, idx) => (
                                                    <div key={idx} className="w-6 h-6 rounded-full bg-[#F5F4F0] -ml-3" />
                                                ))}
                                            </div>

                                            <div className="relative z-10">
                                                <p className="font-geist-mono text-[9px] text-[#1A1A1A]/40 uppercase tracking-widest mb-4 group-hover:text-white/60 transition-colors">Manifest Status</p>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-playfair text-3xl text-[#1A1A1A] group-hover:text-white transition-colors">{(trip.packedItems || []).length}</span>
                                                    <span className="font-geist-mono text-[10px] uppercase text-[#1A1A1A]/40 group-hover:text-white/60 transition-colors">Items Packed</span>
                                                </div>
                                                <div className="h-[1px] w-full bg-[#1A1A1A]/10 group-hover:bg-white/20 transition-colors" />
                                            </div>

                                            <div className="relative z-10 mt-6 md:mt-0">
                                                <button
                                                    onClick={() => setActiveTrip(trip)}
                                                    className="w-full py-4 border border-[#1A1A1A] group-hover:border-white group-hover:text-white text-[#1A1A1A] font-geist-mono text-xs uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white group-hover:hover:bg-white group-hover:hover:text-[#80163a] transition-all duration-300 flex items-center justify-center gap-3"
                                                >
                                                    <ScanLine className="w-4 h-4" />
                                                    <span>Open Manifest</span>
                                                </button>
                                            </div>

                                            {/* Barcode Decoration */}
                                            <div className="absolute bottom-4 right-4 mix-blend-multiply opacity-10 group-hover:opacity-20 group-hover:invert transition-all">
                                                <QrCode className="w-16 h-16" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Action (Hidden usually) */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm("Cancel this itinerary?")) deleteMutation.mutate(trip.id);
                                        }}
                                        className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:text-red-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            );
                        })}

                        {upcomingTrips.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-24 border border-dashed border-[#1A1A1A]/10"
                            >
                                <p className="font-playfair text-xl text-[#1A1A1A] mb-2">No itineraries found</p>
                                <p className="font-geist-mono text-xs text-[#1A1A1A]/40 uppercase tracking-widest mb-6">Your travel log is empty</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-8 py-3 bg-[#1A1A1A] text-white font-geist-mono text-xs uppercase tracking-widest hover:bg-[#80163a] transition-colors"
                                >
                                    Initialize Trip
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Past Voyages */}
                    {pastTrips.length > 0 && (
                        <div className="pt-12 border-t border-[#1A1A1A]/5">
                            <h2 className="font-geist-mono text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/40 mb-8">Archived Logs</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {pastTrips.map((trip, i) => (
                                    <motion.div
                                        key={trip.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white p-6 border border-[#1A1A1A]/5 hover:border-[#80163a]/20 transition-colors group relative"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-playfair text-xl text-[#1A1A1A] opacity-60 group-hover:opacity-100 transition-opacity">{trip.destination}</h3>
                                            <Ticket className="w-4 h-4 text-[#1A1A1A]/20" />
                                        </div>
                                        <p className="font-geist-mono text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest">
                                            {format(new Date(trip.startDate), "MMM yyyy")}
                                        </p>

                                        <button
                                            onClick={() => deleteMutation.mutate(trip.id)}
                                            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#1A1A1A]/40 hover:text-red-500"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Create Trip Form - Modal Refined */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F5F4F0]/90 backdrop-blur-md"
                            onClick={closeForm}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-lg bg-white shadow-2xl overflow-hidden border border-[#1A1A1A]/5"
                            >
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="font-playfair text-3xl text-[#1A1A1A]">New Entry</h2>
                                        <button onClick={closeForm} className="p-2 hover:bg-[#F5F4F0] rounded-full transition-colors">
                                            <X className="w-5 h-5 text-[#1A1A1A]" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label className="block font-geist-mono text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 mb-2">Category</label>
                                            <div className="flex flex-wrap gap-2">
                                                {tripTypes.map(type => (
                                                    <button
                                                        key={type.value}
                                                        type="button"
                                                        onClick={() => setTripType(type.value)}
                                                        className={`px-4 py-2 border font-geist-mono text-[10px] uppercase tracking-wider transition-all ${tripType === type.value
                                                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                                                            : 'bg-transparent border-[#1A1A1A]/10 text-[#1A1A1A]/60 hover:border-[#1A1A1A]/30'
                                                            }`}
                                                    >
                                                        {type.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block font-geist-mono text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 mb-2">Destination</label>
                                            <input
                                                type="text"
                                                value={destination}
                                                onChange={(e) => setDestination(e.target.value)}
                                                placeholder="CITY, COUNTRY"
                                                className="w-full h-12 border-b border-[#1A1A1A]/20 bg-transparent text-xl font-playfair focus:outline-none focus:border-[#80163a] placeholder:text-[#1A1A1A]/20 transition-colors"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block font-geist-mono text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 mb-2">Departure</label>
                                                <button
                                                    type="button"
                                                    onClick={() => { setPickerView("start"); setPickerMonth(startDate || new Date()); }}
                                                    className={`w-full text-left h-10 border-b ${pickerView === "start" ? 'border-[#80163a] text-[#80163a]' : 'border-[#1A1A1A]/20 text-[#1A1A1A]'} font-geist-mono text-xs uppercase`}
                                                >
                                                    {startDate ? format(startDate, "MMM d, yyyy") : "SELECT DATE"}
                                                </button>
                                            </div>
                                            <div>
                                                <label className="block font-geist-mono text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 mb-2">Return</label>
                                                <button
                                                    type="button"
                                                    onClick={() => { setPickerView("end"); setPickerMonth(endDate || startDate || new Date()); }}
                                                    className={`w-full text-left h-10 border-b ${pickerView === "end" ? 'border-[#80163a] text-[#80163a]' : 'border-[#1A1A1A]/20 text-[#1A1A1A]'} font-geist-mono text-xs uppercase`}
                                                >
                                                    {endDate ? format(endDate, "MMM d, yyyy") : "SELECT DATE"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Simplified Calendar Picker */}
                                        <AnimatePresence>
                                            {pickerView && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-[#F5F4F0] p-4 -mx-2"
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <button type="button" onClick={() => setPickerMonth(subMonths(pickerMonth, 1))}><ChevronLeft className="w-4 h-4" /></button>
                                                        <span className="font-playfair text-sm">{format(pickerMonth, "MMMM yyyy")}</span>
                                                        <button type="button" onClick={() => setPickerMonth(addMonths(pickerMonth, 1))}><ChevronRight className="w-4 h-4" /></button>
                                                    </div>
                                                    <div className="grid grid-cols-7 gap-1 text-center">
                                                        {["S", "M", "T", "W", "T", "F", "S"].map(d => <span key={d} className="text-[9px] font-geist-mono opacity-40 py-2">{d}</span>)}
                                                        {paddingDays.map((_, i) => <div key={`pad-${i}`} />)}
                                                        {calendarDays.map((day) => {
                                                            const isSelected = (startDate && isSameDay(day, startDate)) || (endDate && isSameDay(day, endDate));
                                                            const isInRange = startDate && endDate && day > startDate && day < endDate;
                                                            const isDisabled = day < new Date(new Date().setHours(0, 0, 0, 0));

                                                            return (
                                                                <button
                                                                    key={day.toISOString()}
                                                                    type="button"
                                                                    disabled={isDisabled}
                                                                    onClick={() => handleDateSelect(day)}
                                                                    className={`
                                                                        aspect-square text-xs font-medium flex items-center justify-center relative
                                                                        ${isDisabled ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#1A1A1A]/5'}
                                                                        ${isSelected ? 'bg-[#1A1A1A] text-white' : ''}
                                                                        ${isInRange ? 'bg-[#1A1A1A]/5' : ''}
                                                                    `}
                                                                >
                                                                    {format(day, "d")}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <button
                                            type="submit"
                                            disabled={createMutation.isPending}
                                            className="w-full py-4 bg-[#1A1A1A] text-white font-geist-mono text-xs uppercase tracking-[0.2em] hover:bg-[#80163a] transition-colors disabled:opacity-50"
                                        >
                                            {createMutation.isPending ? "Processing..." : "Confirm Booking"}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Manifest (Packing) Slide-over */}
                <AnimatePresence>
                    {activeTrip && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm z-50 cursor-pointer"
                                onClick={() => setActiveTrip(null)}
                            />
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-8 pb-4 border-b border-[#1A1A1A]/5">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <p className="font-geist-mono text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 mb-1">Travel Manifest</p>
                                            <h2 className="font-playfair text-3xl md:text-4xl text-[#1A1A1A]">{activeTrip.destination}</h2>
                                        </div>
                                        <button onClick={() => setActiveTrip(null)} className="p-2 hover:rotate-90 transition-transform duration-300">
                                            <X className="w-6 h-6 text-[#1A1A1A]" />
                                        </button>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="font-playfair text-2xl text-[#80163a]">{(activeTrip.packedItems || []).length}</p>
                                            <p className="font-geist-mono text-[9px] uppercase tracking-widest text-[#1A1A1A]/40">Assets Loaded</p>
                                        </div>
                                        <div>
                                            <p className="font-playfair text-2xl text-[#1A1A1A]">{differenceInDays(new Date(activeTrip.endDate), new Date(activeTrip.startDate)) + 1}</p>
                                            <p className="font-geist-mono text-[9px] uppercase tracking-widest text-[#1A1A1A]/40">Days Duration</p>
                                        </div>
                                    </div>

                                    {/* Search */}
                                    <div className="mt-8 relative">
                                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A1A]/30" />
                                        <input
                                            type="text"
                                            value={packingSearch}
                                            onChange={(e) => setPackingSearch(e.target.value)}
                                            placeholder="SEARCH INVENTORY..."
                                            className="w-full pl-8 py-2 border-b border-[#1A1A1A]/10 font-geist-mono text-xs uppercase focus:outline-none focus:border-[#80163a]"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto bg-[#F5F4F0]">
                                    <div className="p-8">
                                        <div className="grid grid-cols-2 gap-4">
                                            {filteredWardrobe?.map(item => {
                                                const isPacked = activeTrip.packedItems?.includes(item.id);
                                                return (
                                                    <motion.div
                                                        key={item.id}
                                                        onClick={() => togglePackedItem(item.id)}
                                                        className={`
                                                            group cursor-pointer relative bg-white p-3 transition-all duration-300
                                                            ${isPacked ? 'ring-1 ring-[#80163a] shadow-md' : 'hover:shadow-lg'}
                                                        `}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <div className="aspect-[3/4] overflow-hidden mb-3 relative">
                                                            <div className="absolute inset-0 bg-[#F5F4F0] mix-blend-multiply opacity-0 group-hover:opacity-10 transition-opacity" />
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={item.name}
                                                                className={`w-full h-full object-cover transition-all duration-500 ${isPacked ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
                                                            />
                                                            {isPacked && (
                                                                <div className="absolute inset-0 bg-[#80163a]/10 flex items-center justify-center">
                                                                    <div className="bg-[#80163a] text-white p-2 rounded-full">
                                                                        <Check className="w-4 h-4" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-playfair text-sm text-[#1A1A1A] truncate">{item.name}</p>
                                                            <p className="font-geist-mono text-[9px] uppercase tracking-widest text-[#1A1A1A]/40">{item.category}</p>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-white border-t border-[#1A1A1A]/5">
                                    <button
                                        onClick={() => setActiveTrip(null)}
                                        className="w-full py-4 bg-[#1A1A1A] text-white font-geist-mono text-xs uppercase tracking-[0.2em] hover:bg-[#80163a] transition-colors"
                                    >
                                        Update Manifest
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}

// Add these to global styles if not present, but for now we assume tailwind config handles utility classes
// We're essentially using:
// font-playfair -> Playfair Display
// font-geist-mono -> Geist Mono / Monospace equivalent
