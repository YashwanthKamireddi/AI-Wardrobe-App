import { useState } from "react";
import NavigationBar from "@/components/navigation-bar";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MapPin,
  Calendar,
  Sun,
  Cloud,
  Thermometer,
  ChevronRight,
  Plane,
  Briefcase,
  Palmtree,
  Building2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

type Trip = {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  type: 'business' | 'vacation' | 'weekend';
  weather?: {
    temp: number;
    condition: string;
  };
  packedItems: number;
  totalItems: number;
};

const SAMPLE_TRIPS: Trip[] = [
  {
    id: "1",
    name: "Paris Fashion Week",
    destination: "Paris, France",
    startDate: "2025-02-25",
    endDate: "2025-03-02",
    type: "business",
    weather: { temp: 12, condition: "cloudy" },
    packedItems: 8,
    totalItems: 15,
  },
  {
    id: "2",
    name: "Weekend Getaway",
    destination: "Santorini, Greece",
    startDate: "2025-03-15",
    endDate: "2025-03-17",
    type: "vacation",
    weather: { temp: 18, condition: "sunny" },
    packedItems: 0,
    totalItems: 10,
  },
];

const TRIP_TYPES = [
  { id: "all", label: "All Trips", icon: Plane },
  { id: "business", label: "Business", icon: Briefcase },
  { id: "vacation", label: "Vacation", icon: Palmtree },
  { id: "weekend", label: "Weekend", icon: Building2 },
];

export function TripsPage() {
  const [trips] = useState<Trip[]>(SAMPLE_TRIPS);
  const [selectedType, setSelectedType] = useState("all");

  const filteredTrips = trips.filter(trip =>
    selectedType === "all" || trip.type === selectedType
  );

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });

    if (startMonth === endMonth) {
      return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}`;
    }
    return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}`;
  };

  const getDaysUntil = (startDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const diff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "In progress";
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `In ${diff} days`;
  };

  return (
    <div
      className="min-h-screen pb-24 md:pb-8"
      style={{ background: '#faf9f7' }}
    >
      {/* Desktop Navigation Bar */}
      <div className="hidden md:block">
        <NavigationBar />
      </div>

      {/* Mobile Header */}
      <header
        className="md:hidden sticky top-0 z-40 px-4 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1"
              style={{ color: '#80163a' }}
            >
              The Nomad
            </p>
            <h1
              className="font-serif text-2xl font-medium text-slate-800"
            >
              Trips
            </h1>
          </div>
          <Button
            size="sm"
            className="h-9 px-4 rounded-lg text-white"
            style={{
              background: '#80163a',
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Button>
        </div>
      </header>

      {/* Trip Type Filter */}
      <section className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {TRIP_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                )}
                style={{
                  background: selectedType === type.id ? '#80163a' : 'transparent',
                  color: selectedType === type.id ? 'white' : '#64748b',
                }}
              >
                <Icon className="h-4 w-4" />
                {type.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Upcoming Trips */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xs font-semibold tracking-wide uppercase text-slate-500"
          >
            Upcoming
          </h2>
          <span
            className="text-xs text-slate-400"
          >
            {filteredTrips.length} trips
          </span>
        </div>

        {filteredTrips.length > 0 ? (
          <div className="space-y-3">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="rounded-xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer bg-white border border-slate-200 shadow-sm"
              >
                {/* Trip Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3
                      className="font-serif text-lg font-medium mb-1 text-slate-800"
                    >
                      {trip.name}
                    </h3>
                    <div
                      className="flex items-center gap-1 text-sm text-slate-500"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {trip.destination}
                    </div>
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-md"
                    style={{
                      background: 'rgba(212, 175, 55, 0.1)',
                      color: '#8B7730',
                    }}
                  >
                    {getDaysUntil(trip.startDate)}
                  </span>
                </div>

                {/* Trip Details */}
                <div
                  className="flex items-center gap-4 py-3 mb-3 border-y border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-500">
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </span>
                  </div>
                  {trip.weather && (
                    <div className="flex items-center gap-2">
                      {trip.weather.condition === 'sunny' ? (
                        <Sun className="h-4 w-4" style={{ color: '#D4A54A' }} />
                      ) : (
                        <Cloud className="h-4 w-4 text-slate-400" />
                      )}
                      <span className="text-sm text-slate-500">
                        {trip.weather.temp}°C
                      </span>
                    </div>
                  )}
                </div>

                {/* Packing Progress */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-24 h-1.5 rounded-full overflow-hidden bg-slate-200"
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(trip.packedItems / trip.totalItems) * 100}%`,
                          background: trip.packedItems === trip.totalItems
                            ? '#10b981'
                            : '#80163a',
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-medium text-slate-500"
                    >
                      {trip.packedItems}/{trip.totalItems} packed
                    </span>
                  </div>
                  <ChevronRight
                    className="h-5 w-5 text-slate-400"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-16 rounded-xl bg-slate-50 border border-slate-200"
          >
            <Plane
              className="h-12 w-12 mx-auto mb-4 text-slate-400"
            />
            <h3
              className="font-serif text-lg font-medium mb-2 text-slate-800"
            >
              No trips planned
            </h3>
            <p
              className="text-sm mb-6 max-w-xs mx-auto text-slate-500"
            >
              Plan your next adventure and let AI help you pack the perfect wardrobe
            </p>
            <Button
              size="sm"
              className="rounded-lg text-white"
              style={{
                background: '#80163a',
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Plan a Trip
            </Button>
          </div>
        )}
      </section>

      {/* AI Packing Suggestion */}
      <section className="px-4 mt-6">
        <div
          className="rounded-xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(212, 175, 55, 0.03) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.15)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(212, 175, 55, 0.15)' }}
            >
              <Sparkles className="h-5 w-5" style={{ color: '#D4A54A' }} />
            </div>
            <div>
              <h3
                className="font-medium text-sm mb-1 text-slate-800"
              >
                Smart Packing
              </h3>
              <p
                className="text-xs leading-relaxed text-slate-500"
              >
                AI analyzes weather forecasts, trip duration, and your style to suggest the perfect packing list — maximizing outfit combinations while minimizing luggage.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TripsPage;
