import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
    Home, Shirt, Layers, Calendar, Plane, BarChart3, Sparkles,
    Lightbulb, User, LogOut, ChevronDown, Menu, X, Plus, Frame,
    Settings, Search, Bell, Grid3X3, DollarSign, Command
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { SearchDialog } from "@/components/ui/search-dialog";
import { MobileSystemMenu } from "@/components/layout/mobile-system-menu";

/**
 * UNIFIED APP LAYOUT - "THE ATELIER" EDITION (V19)
 *
 * DESIGN SYSTEM UPGRADE:
 * - Header: Minimalist "SYSTEM" toggle.
 * - Aesthetics: Quiet Luxury, Production Polish.
 */

interface AppLayoutProps {
    children: React.ReactNode;
    fullWidth?: boolean;
    hideMobileNav?: boolean;
}

// ------------------------------------------------------------------
// NAVIGATION CONFIGURATION
// ------------------------------------------------------------------

const primaryNav = [
    { href: "/home", label: "Atelier", icon: Home },
    { href: "/wardrobe", label: "Collection", icon: Shirt },
    { href: "/compose", label: "Compose", icon: Plus, isAction: true },
    { href: "/calendar", label: "Plan", icon: Calendar },
    { href: "/trips", label: "Trips", icon: Plane },
];

const systemNav = [
    { href: "/outfits", label: "Saved Looks", icon: Layers },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/community", label: "Community", icon: User },
    { href: "/capsules", label: "Capsules", icon: Grid3X3 },
    { href: "/wishlist", label: "Wishlist", icon: DollarSign },
    { href: "/style-dna", label: "Style DNA", icon: Sparkles },
    { href: "/inspiration", label: "Mood Boards", icon: Lightbulb },
];

export function AppLayout({ children, fullWidth = false, hideMobileNav = false }: AppLayoutProps) {
    const { user, logoutMutation } = useAuth();
    const [location, setLocation] = useLocation();

    // UI States
    const [showSystemMenu, setShowSystemMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logoutMutation.mutate();
        setLocation('/');
    };

    const isActive = (href: string) => location === href;

    return (
        <div className="min-h-screen bg-[#FDFBF7] selection:bg-[#151515] selection:text-white font-sans text-[#151515]">

            {/* ================================================================================== */}
            {/* DESKTOP HEADER ("THE SYSTEM")                                                      */}
            {/* ================================================================================== */}
            <nav className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${scrolled ? 'bg-[#FDFBF7]/90 backdrop-blur-md border-b border-black/5 py-3' : 'bg-transparent py-5'
                }`}>
                <div className={`mx-auto px-10 flex items-center justify-between ${fullWidth ? 'max-w-full' : 'max-w-[1920px]'}`}>

                    {/* 1. BRAND */}
                    <Link href="/home">
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <span className="text-xl tracking-[0.15em] font-playfair font-bold text-[#151515]">
                                CELURA<span className="text-[#80163A]">.</span>
                            </span>
                        </div>
                    </Link>

                    {/* 2. CENTER NAV (PILL) */}
                    <div className="flex items-center gap-1 bg-white border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] px-1.5 py-1.5 rounded-full">
                        {primaryNav.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <div className={`relative px-5 py-2 rounded-full flex items-center gap-2 transition-all duration-300 cursor-pointer group ${item.isAction
                                    ? 'bg-[#151515] text-white hover:bg-black shadow-md mx-1'
                                    : isActive(item.href)
                                        ? 'bg-gray-100/80 text-[#151515]'
                                        : 'text-gray-500 hover:text-[#151515] hover:bg-gray-50'
                                    }`}>
                                    <item.icon className={`w-4 h-4 ${item.isAction ? 'text-white' : ''}`} strokeWidth={1.5} />
                                    <span className="text-[11px] font-semibold tracking-wide uppercase">{item.label}</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* 3. SYSTEM TOGGLE */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="p-2 text-gray-400 hover:text-[#151515] transition-colors"
                        >
                            <Search className="w-5 h-5" strokeWidth={1.5} />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowSystemMenu(!showSystemMenu)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${showSystemMenu
                                    ? 'bg-[#151515] text-white border-black'
                                    : 'bg-white text-[#151515] border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">System</span>
                                {showSystemMenu ? <X className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
                            </button>

                            <AnimatePresence>
                                {showSystemMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute top-full right-0 mt-3 w-64 bg-white border border-gray-100 rounded-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden p-1 z-50"
                                    >
                                        <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-50">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Atelier Tools</p>
                                        </div>
                                        <div className="p-1">
                                            {systemNav.map((item) => (
                                                <Link key={item.href} href={item.href}>
                                                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-[#151515] transition-colors cursor-pointer group">
                                                        <item.icon className="w-4 h-4 group-hover:text-[#151515]" strokeWidth={1.5} />
                                                        <span className="text-xs font-medium">{item.label}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                            <div className="h-px bg-gray-50 my-1" />
                                            <div
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                                                <span className="text-xs font-medium">Disconnect</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </nav>

            {/* MOBILE HEADER (Minimal) */}
            {!hideMobileNav && (
                <nav className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-black/5 px-4 py-3 flex justify-between items-center">
                    <Link href="/home">
                        <span className="text-lg font-playfair font-bold text-[#151515]">CELURA.</span>
                    </Link>
                    <div className="flex gap-4">
                        <button onClick={() => setSearchOpen(true)}>
                            <Search className="w-5 h-5 text-[#151515]" strokeWidth={1.5} />
                        </button>
                        <button onClick={() => setShowSystemMenu(!showSystemMenu)}>
                            <Menu className="w-5 h-5 text-[#151515]" strokeWidth={1.5} />
                        </button>
                    </div>
                </nav>
            )}

            {/* MAIN CONTENT */}
            <main className={`pt-14 md:pt-24 pb-24 md:pb-0 min-h-screen ${hideMobileNav ? '!pt-0 !pb-0' : ''}`}>
                {children}
            </main>

            {/* MOBILE DOCK ("THE ISLAND") */}
            {!hideMobileNav && (
                <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40">
                    <div className="bg-[#151515] text-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.25)] px-6 py-4 flex justify-between items-center backdrop-blur-md bg-opacity-95">
                        {primaryNav.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <div className={`flex flex-col items-center gap-1 ${isActive(item.href) ? 'text-white' : 'text-white/40'}`}>
                                    <item.icon className="w-5 h-5" strokeWidth={1.5} />
                                    {isActive(item.href) && <div className="w-1 h-1 bg-white rounded-full mt-1" />}
                                </div>
                            </Link>
                        ))}
                    </div>
                </nav>
            )}

            <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

            <MobileSystemMenu
                isOpen={showSystemMenu}
                onClose={() => setShowSystemMenu(false)}
                onLogout={handleLogout}
            />

        </div>
    );
}
