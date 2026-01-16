import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Search } from "lucide-react";

interface WeatherLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLocation: string;
    onSave: (location: string) => void;
}

/**
 * Styled modal for changing weather location
 * Replaces the ugly browser prompt
 */
export function WeatherLocationModal({
    isOpen,
    onClose,
    currentLocation,
    onSave,
}: WeatherLocationModalProps) {
    const [location, setLocation] = useState(currentLocation);

    const handleSave = () => {
        onSave(location);
        onClose();
    };

    const popularCities = [
        "New York",
        "London",
        "Tokyo",
        "Paris",
        "Mumbai",
        "Sydney",
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <div
                            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-[#E5E5E5] flex items-center justify-between">
                                <div>
                                    <h2
                                        className="text-xl text-[#1A1A1A]"
                                        style={{ fontFamily: "'Playfair Display', serif" }}
                                    >
                                        Weather Location
                                    </h2>
                                    <p className="text-xs text-[#9A9A9A] mt-1">
                                        Set your city for outfit recommendations
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center hover:bg-[#E5E5E5] transition-colors"
                                >
                                    <X className="w-4 h-4 text-[#6B6B6B]" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Input */}
                                <div className="relative mb-6">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9A9A9A]" />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Enter city name..."
                                        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#F9F9F7] border border-[#E5E5E5] text-[#1A1A1A] text-sm placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                                        autoFocus
                                    />
                                </div>

                                {/* Quick Select */}
                                <div className="mb-6">
                                    <p className="text-xs text-[#6B6B6B] uppercase tracking-wider mb-3">
                                        Popular Cities
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {popularCities.map((city) => (
                                            <button
                                                key={city}
                                                onClick={() => setLocation(city)}
                                                className={`px-4 py-2 rounded-full text-sm transition-all ${location === city
                                                        ? "bg-[#1A1A1A] text-white"
                                                        : "bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#E5E5E5]"
                                                    }`}
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Auto-detect option */}
                                <button
                                    onClick={() => setLocation("")}
                                    className={`w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${location === ""
                                            ? "bg-[#80163A]/10 text-[#80163A] border border-[#80163A]/30"
                                            : "bg-[#F9F9F7] text-[#6B6B6B] hover:bg-[#F5F5F5]"
                                        }`}
                                >
                                    <Search className="w-4 h-4" />
                                    Use Auto-detect
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-[#E5E5E5] flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 h-12 rounded-xl border border-[#E5E5E5] text-[#6B6B6B] text-sm font-medium hover:bg-[#F9F9F7] transition-colors"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    onClick={handleSave}
                                    className="flex-1 h-12 rounded-xl bg-[#1A1A1A] text-white text-sm font-medium"
                                    whileHover={{ backgroundColor: "#80163A" }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Save Location
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default WeatherLocationModal;
