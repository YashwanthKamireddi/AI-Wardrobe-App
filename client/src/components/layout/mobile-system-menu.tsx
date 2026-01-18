import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
    X, Search, ChevronRight, LogOut,
    Home, Shirt, Plus, Calendar, Plane, // Primary
    Layers, BarChart3, User, Grid3X3, DollarSign, Sparkles, Lightbulb // System
} from "lucide-react";
import { useRef, useEffect } from "react";

/**
 * MOBILE SYSTEM MENU - THE "APP" DOCK
 *
 * Design: Full screen glassmorphism overlay.
 * Animation: Spring physics slide-up.
 * Content: Unified access to "Atelier" (Primary) and "System" (Secondary) tools.
 */

interface MobileSystemMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const PRIMARY_APPS = [
    { href: "/home", label: "Atelier", icon: Home, description: "Dashboard" },
    { href: "/wardrobe", label: "Collection", icon: Shirt, description: "Digital Wardrobe" },
    { href: "/compose", label: "Studio", icon: Plus, description: "Outfit Builder" },
    { href: "/calendar", label: "Plan", icon: Calendar, description: "Schedule" },
    { href: "/trips", label: "Trips", icon: Plane, description: "Travel Log" },
];

const SYSTEM_TOOLS = [
    { href: "/outfits", label: "Saved Looks", icon: Layers },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/community", label: "Community", icon: User },
    { href: "/capsules", label: "Capsules", icon: Grid3X3 },
    { href: "/wishlist", label: "Wishlist", icon: DollarSign },
    { href: "/style-dna", label: "Style DNA", icon: Sparkles },
    { href: "/inspiration", label: "Mood Boards", icon: Lightbulb },
    { href: "/framing", label: "Frame Studio", icon: Layers },
];

export function MobileSystemMenu({ isOpen, onClose, onLogout }: MobileSystemMenuProps) {
    const [location] = useLocation();

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Main Menu Sheet */}
                    <motion.div
                        className="fixed inset-0 z-[70] bg-[#FDFBF7]/95 backdrop-blur-xl flex flex-col md:hidden"
                        initial={{ y: "100%" }}
                        animate={{ y: "0%" }}
                        exit={{ y: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 200,
                            mass: 0.8
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
                            <span className="text-lg font-playfair font-bold text-[#1A1A1A]">
                                SYSTEM<span className="text-[#80163A]">.</span>
                            </span>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-[#1A1A1A] active:scale-95 transition-transform"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrolling Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 pb-safe">

                            {/* Search Bar - Prominent */}
                            <div className="relative mb-8">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search entire collection..."
                                    className="w-full h-12 pl-11 pr-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all shadow-sm"
                                />
                            </div>

                            {/* Section: Primary Apps */}
                            <div className="mb-8">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4 font-bold">Applications</p>
                                <div className="space-y-2">
                                    {PRIMARY_APPS.map((app) => (
                                        <Link key={app.href} href={app.href}>
                                            <div
                                                onClick={onClose}
                                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-[0.98] ${location === app.href
                                                    ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-lg'
                                                    : 'bg-white border-gray-100 text-[#1A1A1A] shadow-sm'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${location === app.href ? 'bg-white/10' : 'bg-gray-50'}`}>
                                                    <app.icon className="w-5 h-5" strokeWidth={1.5} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-sm">{app.label}</h3>
                                                    <p className={`text-[11px] ${location === app.href ? 'text-white/60' : 'text-gray-400'}`}>
                                                        {app.description}
                                                    </p>
                                                </div>
                                                {location === app.href && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Section: System Tools */}
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4 font-bold">System Tools</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {SYSTEM_TOOLS.map((tool) => (
                                        <Link key={tool.href} href={tool.href}>
                                            <div
                                                onClick={onClose}
                                                className="flex flex-col gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm active:scale-[0.96] transition-transform"
                                            >
                                                <tool.icon className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                                                <span className="text-xs font-medium text-[#1A1A1A]">{tool.label}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Logout Action */}
                            <div className="mt-12 pt-6 border-t border-black/5">
                                <button
                                    onClick={() => { onLogout(); onClose(); }}
                                    className="w-full flex items-center justify-center gap-2 p-4 text-red-600 bg-red-50/50 rounded-xl hover:bg-red-50 transition-colors font-medium text-sm"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Disconnect System
                                </button>
                                <p className="text-center text-[10px] text-gray-300 mt-4 tracking-widest">
                                    CELURA v19.5 (BUILD 2026.1)
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
