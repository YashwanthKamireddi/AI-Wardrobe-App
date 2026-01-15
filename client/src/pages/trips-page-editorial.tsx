import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  MapPin,
  Calendar,
  Sun,
  Cloud,
  Layers,
  Grid3X3,
  Heart,
  User,
  Plane,
  Briefcase,
  Palmtree,
  Mountain,
  Check,
  ChevronRight,
} from "lucide-react";

import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * TRIPS PAGE - EDITORIAL TRAVEL PLANNING
 *
 * Design: Clean trip cards with packing lists
 * Focus: Travel outfit planning with weather integration
 */

interface Trip {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  type: 'business' | 'vacation' | 'adventure' | 'city';
  packedItems: number[];
  weather?: { temp: number; condition: string };
}

const TRIP_TYPES = [
  { id: 'all', label: 'All Trips', icon: Plane },
  { id: 'vacation', label: 'Vacation', icon: Palmtree },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'adventure', label: 'Adventure', icon: Mountain },
];

const MOCK_TRIPS: Trip[] = [
  {
    id: 1,
    name: "Paris Fashion Week",
    destination: "Paris, France",
    startDate: "2025-02-24",
    endDate: "2025-03-02",
    type: "business",
    packedItems: [],
    weather: { temp: 12, condition: "cloudy" }
  },
  {
    id: 2,
    name: "Summer in Santorini",
    destination: "Santorini, Greece",
    startDate: "2025-06-15",
    endDate: "2025-06-22",
    type: "vacation",
    packedItems: [],
    weather: { temp: 28, condition: "sunny" }
  },
  {
    id: 3,
    name: "NYC Business Trip",
    destination: "New York, USA",
    startDate: "2025-03-10",
    endDate: "2025-03-14",
    type: "business",
    packedItems: [],
    weather: { temp: 8, condition: "partly-cloudy" }
  },
];

export function TripsPage() {
  const queryClient = useQueryClient();
  const { data: wardrobeItems } = useWardrobeItems();
  const [activeType, setActiveType] = useState("all");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showNewTripModal, setShowNewTripModal] = useState(false);

  // In a real app, this would fetch from API
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);

  const filteredTrips = useMemo(() => {
    if (activeType === "all") return trips;
    return trips.filter(trip => trip.type === activeType);
  }, [trips, activeType]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    const tripDate = new Date(dateStr);
    const diff = Math.ceil((tripDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Past";
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `In ${diff} days`;
  };

  const getWeatherIcon = (condition: string) => {
    if (condition === "sunny") return <Sun className="w-4 h-4 text-amber-500" />;
    return <Cloud className="w-4 h-4 text-slate-400" />;
  };

  const togglePackedItem = (tripId: number, itemId: number) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      const packed = trip.packedItems.includes(itemId)
        ? trip.packedItems.filter(id => id !== itemId)
        : [...trip.packedItems, itemId];
      return { ...trip, packedItems: packed };
    }));
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] pb-24 md:pb-0">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#F9F9F7]/95 backdrop-blur-xl border-b border-[#E5E5E5]/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><span className="text-lg tracking-[0.2em] text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>CELURA</span></Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/home"><span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Home</span></Link>
            <Link href="/wardrobe"><span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Wardrobe</span></Link>
            <Link href="/trips"><span className="text-xs tracking-[0.15em] uppercase text-[#1A1A1A] font-medium">Trips</span></Link>
            <Link href="/profile"><span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Profile</span></Link>
          </div>
          <Link href="/profile"><motion.div className="w-10 h-10 rounded-full bg-[#E5E5E5] flex items-center justify-center" whileHover={{ scale: 1.05 }}><User className="w-5 h-5 text-[#6B6B6B]" /></motion.div></Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <motion.header className="mb-10 flex items-end justify-between" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-2">Plan</p>
            <h1 className="text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3rem)" }}>
              Trip Packing
            </h1>
            <p className="text-[#6B6B6B] text-lg">Pack smart for every journey</p>
          </div>
          <motion.button
            className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full bg-[#1A1A1A] text-white text-sm tracking-wider"
            onClick={() => setShowNewTripModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4" /> NEW TRIP
          </motion.button>
        </motion.header>

        {/* Type Filter */}
        <motion.div className="mb-8 overflow-x-auto scrollbar-hide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex gap-3 min-w-max pb-2">
            {TRIP_TYPES.map((type) => (
              <motion.button
                key={type.id}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs uppercase tracking-wider transition-all ${
                  activeType === type.id
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-white border border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
                }`}
                onClick={() => setActiveType(type.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <type.icon className="w-4 h-4" />
                {type.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Trips Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTrips.map((trip, i) => (
              <motion.div
                key={trip.id}
                className="group rounded-3xl bg-white border border-[#E5E5E5]/50 overflow-hidden cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
                onClick={() => setSelectedTrip(trip)}
              >
                {/* Trip Header Image */}
                <div className="relative h-32 bg-gradient-to-br from-[#1A1A1A] to-[#3A3A3A]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {trip.type === 'vacation' && <Palmtree className="w-12 h-12 text-white/20" />}
                    {trip.type === 'business' && <Briefcase className="w-12 h-12 text-white/20" />}
                    {trip.type === 'adventure' && <Mountain className="w-12 h-12 text-white/20" />}
                    {trip.type === 'city' && <MapPin className="w-12 h-12 text-white/20" />}
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs">
                    {getDaysUntil(trip.startDate)}
                  </div>
                </div>

                {/* Trip Info */}
                <div className="p-5">
                  <h3 className="text-lg text-[#1A1A1A] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {trip.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-[#6B6B6B] mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    {trip.destination}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-[#9A9A9A]">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </div>
                    </div>
                    {trip.weather && (
                      <div className="flex items-center gap-1.5 text-xs text-[#9A9A9A]">
                        {getWeatherIcon(trip.weather.condition)}
                        {trip.weather.temp}°C
                      </div>
                    )}
                  </div>

                  {/* Packing Progress */}
                  <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#9A9A9A] uppercase tracking-wider">Packing</span>
                      <span className="text-xs text-[#6B6B6B]">{trip.packedItems.length} items</span>
                    </div>
                    <div className="h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1A1A1A] rounded-full transition-all"
                        style={{ width: trip.packedItems.length > 0 ? `${Math.min((trip.packedItems.length / 10) * 100, 100)}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add New Trip Card */}
          <motion.div
            className="rounded-3xl border-2 border-dashed border-[#D5D5D5] bg-[#FAFAFA] flex flex-col items-center justify-center min-h-[280px] cursor-pointer hover:border-[#1A1A1A] transition-colors"
            onClick={() => setShowNewTripModal(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: filteredTrips.length * 0.05 }}
            whileHover={{ scale: 1.01 }}
          >
            <Plus className="w-8 h-8 text-[#9A9A9A] mb-3" />
            <p className="text-sm text-[#6B6B6B]">Plan a new trip</p>
          </motion.div>
        </div>
      </main>

      {/* Trip Detail Modal */}
      <AnimatePresence>
        {selectedTrip && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTrip(null)}
          >
            <motion.div
              className="w-full max-w-2xl max-h-[80vh] rounded-3xl bg-[#F9F9F7] overflow-hidden"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative h-40 bg-gradient-to-br from-[#1A1A1A] to-[#3A3A3A] p-6">
                <button
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                  onClick={() => setSelectedTrip(null)}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-6 left-6">
                  <h2 className="text-2xl text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{selectedTrip.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedTrip.destination}
                  </div>
                </div>
              </div>

              {/* Packing List */}
              <div className="p-6 max-h-[calc(80vh-10rem)] overflow-y-auto">
                <h3 className="text-lg text-[#1A1A1A] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Packing List</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {wardrobeItems?.slice(0, 12).map((item) => (
                    <motion.div
                      key={item.id}
                      className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedTrip.packedItems.includes(item.id)
                          ? "border-[#1A1A1A] bg-white"
                          : "border-[#E5E5E5] bg-white hover:border-[#9A9A9A]"
                      }`}
                      onClick={() => togglePackedItem(selectedTrip.id, item.id)}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#F5F5F5] overflow-hidden">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#1A1A1A] truncate">{item.name}</p>
                          <p className="text-xs text-[#9A9A9A] capitalize">{item.category}</p>
                        </div>
                        {selectedTrip.packedItems.includes(item.id) && (
                          <div className="w-5 h-5 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {(!wardrobeItems || wardrobeItems.length === 0) && (
                  <div className="text-center py-8 text-[#9A9A9A]">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Add items to your wardrobe first</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E5E5E5]/50 px-6 py-3">
        <div className="flex items-center justify-around">
          {[
            { href: "/home", icon: Grid3X3, label: "Home" },
            { href: "/wardrobe", icon: Layers, label: "Wardrobe" },
            { href: "/outfits", icon: Heart, label: "Outfits" },
            { href: "/profile", icon: User, label: "Profile" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex flex-col items-center gap-1 text-[#9A9A9A]">
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] tracking-wider">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile FAB */}
      <motion.button
        className="md:hidden fixed right-6 bottom-24 w-14 h-14 rounded-full bg-[#1A1A1A] text-white shadow-lg flex items-center justify-center"
        onClick={() => setShowNewTripModal(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}

export default TripsPage;
