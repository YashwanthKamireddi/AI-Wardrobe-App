import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
    X, Search, LogOut,
    Home, Shirt, Layers, Calendar, Compass, // Primary 5
    BarChart3, Sparkles, DollarSign, User, Frame, Palette // System
} from "lucide-react";
import { useEffect } from "react";

/**
 * MOBILE SYSTEM MENU - SIMPLIFIED NAVIGATION (V2.0)
 *
 * Design: Full screen glassmorphism overlay.
 * Navigation: 5 Core Apps + 4 System Tools
 */

interface MobileSystemMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

// Primary Navigation - 5 Core Features
const PRIMARY_APPS = [
    { href: "/home", label: "Home", icon: Home, description: "Dashboard" },
    { href: "/wardrobe", label: "Wardrobe", icon: Shirt, description: "Your Collection" },
    { href: "/outfits", label: "Outfits", icon: Layers, description: "Create & View Looks" },
    { href: "/plan", label: "Plan", icon: Calendar, description: "Calendar & Trips" },
    { href: "/discover", label: "Discover", icon: Compass, description: "Community & Inspiration" },
];

// System Menu - Secondary Features
const SYSTEM_TOOLS = [
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/style-dna", label: "Style DNA", icon: Sparkles },
    { href: "/framing", label: "Framing", icon: Frame },
    { href: "/studio", label: "Studio", icon: Palette },
    { href: "/wishlist", label: "Wishlist", icon: DollarSign },
    { href: "/profile", label: "Profile", icon: User },
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
                                VESSURA<span className="text-[#80163A]">.</span>
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

                            {/* Search Bar */}
                            <div className="relative mb-8">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search your wardrobe..."
                                    className="w-full h-12 pl-11 pr-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all shadow-sm"
                                />
                            </div>

                            {/* Section: Primary Apps */}
                            <div className="mb-8">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4 font-bold">Navigate</p>
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
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4 font-bold">Tools</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {SYSTEM_TOOLS.map((tool) => (
                                        <Link key={tool.href} href={tool.href}>
                                            <div
                                                onClick={onClose}
                                                className={`flex flex-col gap-3 p-4 rounded-xl border shadow-sm active:scale-[0.96] transition-transform ${location === tool.href
                                                    ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                                                    : 'bg-white border-gray-100 text-[#1A1A1A]'
                                                    }`}
                                            >
                                                <tool.icon className={`w-5 h-5 ${location === tool.href ? 'text-white' : 'text-gray-600'}`} strokeWidth={1.5} />
                                                <span className="text-xs font-medium">{tool.label}</span>
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
                                    Sign Out
                                </button>
                                <p className="text-center text-[10px] text-gray-300 mt-4 tracking-widest">
                                    VESSURA v2.0
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
