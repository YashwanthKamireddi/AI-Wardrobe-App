import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
Home, Shirt, Layers, Calendar, Plane, BarChart3, Sparkles,
    Lightbulb, User, LogOut, ChevronDown, Menu, X, Plus, Frame,
    Settings, Search, Bell, Grid3X3, DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { SearchDialog } from "@/components/ui/search-dialog";

/**
 * UNIFIED APP LAYOUT - "THE ATELIER" EDITION
 *
 * DESIGN SYSTEM UPGRADE:
 * - Mobile: "Floating Control Deck" (Island Dock)
 * - Desktop: "Minimalist Header"
 * - Aesthetics: Premium, Editorial, Efficient
 */

interface AppLayoutProps {
    children: React.ReactNode;
    fullWidth?: boolean;
}

// ------------------------------------------------------------------
// NAVIGATION CONFIGURATION
// ------------------------------------------------------------------

// Primary navigation items (Visible in Desktop Header & Mobile Dock)
const primaryNav = [
    { href: "/home", label: "Atelier", icon: Home },
    { href: "/wardrobe", label: "Collection", icon: Shirt },
    { href: "/compose", label: "Compose", icon: Plus, isAction: true }, // Special Action Button
    { href: "/calendar", label: "Plan", icon: Calendar },
    { href: "/trips", label: "Trips", icon: Plane },
];

// Secondary items (Profile Menu / More)
const secondaryNav = [
    { href: "/outfits", label: "Saved Looks", icon: Layers, desc: "Your curated edits" },
    { href: "/analytics", label: "Analytics", icon: BarChart3, desc: "Wardrobe insights" },
    { href: "/community", label: "Community", icon: User, desc: "Style network" }, // New
    { href: "/capsules", label: "Capsules", icon: Grid3X3, desc: "Curated collections" }, // New
    { href: "/wishlist", label: "Wishlist", icon: DollarSign, desc: "Smart shopping" }, // New
    { href: "/style-dna", label: "Style DNA", icon: Sparkles, desc: "Your fashion profile" },
    { href: "/inspiration", label: "Mood Boards", icon: Lightbulb, desc: "Visual inspiration" },
];

export function AppLayout({ children, fullWidth = false }: AppLayoutProps) {
    const { user, logoutMutation } = useAuth();
    const [location, setLocation] = useLocation();

    // UI States
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    // Scroll effect for desktop header
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
        <div className="min-h-screen bg-[#FAF9F6]">

            {/* ================================================================================== */}
            {/* DESKTOP HEADER ("THE MINIMALIST")                                                  */}
            {/* Zero-clutter, airy, focuses on content.                                            */}
            {/* ================================================================================== */}
            <nav className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100/50 py-3' : 'bg-transparent py-6'
                }`}>
                <div className={`mx-auto px-8 flex items-center justify-between ${fullWidth ? 'max-w-full' : 'max-w-7xl'}`}>

                    {/* 1. LOGO AREA */}
                    <Link href="/home">
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-8 h-8 bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-sm rounded-full">
                                C
                            </div>
                            <span className="text-lg tracking-[0.2em] font-medium text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                CELURA
                            </span>
                        </div>
                    </Link>

                    {/* 2. CENTER NAV (DNA) */}
                    <div className="flex items-center gap-1 bg-white/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-gray-100 shadow-sm">
                        {primaryNav.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <div className={`relative px-5 py-2 rounded-full text-[11px] font-medium uppercase tracking-widest cursor-pointer transition-all duration-300 group ${isActive(item.href) ? 'text-white bg-[#1A1A1A]' : 'text-gray-500 hover:text-[#1A1A1A] hover:bg-white'
                                    }`}>
                                    <span className="relative z-10">{item.label}</span>
                                    {isActive(item.href) && (
                                        <motion.div
                                            layoutId="desktop-nav-active"
                                            className="absolute inset-0 bg-[#1A1A1A] rounded-full -z-0"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* 3. RIGHT ACTIONS (PROFILE & UTILS) */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#1A1A1A]"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#1A1A1A]">
                            <Bell className="w-4 h-4" />
                        </button>

                        {/* Profile Dropdown Trigger */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-gray-100 hover:border-gray-200 bg-white transition-all cursor-pointer"
                            >
                                <span className="text-xs font-medium text-gray-600 pl-2 hidden lg:block">{user?.username || 'Member'}</span>
                                <div className="w-7 h-7 rounded-full bg-[#FAF9F6] ring-1 ring-gray-100 flex items-center justify-center text-xs font-serif italic text-[#1A1A1A]">
                                    {user?.username?.charAt(0) || 'U'}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {showProfileMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden py-2"
                                        onMouseLeave={() => setShowProfileMenu(false)}
                                    >
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-sm font-medium text-[#1A1A1A]">{user?.name || "Style Member"}</p>
                                            <p className="text-xs text-gray-400">Premium Plan</p>
                                        </div>

                                        <div className="py-2">
                                            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Collection</div>
                                            {secondaryNav.map(item => (
                                                <Link key={item.href} href={item.href}>
                                                    <div className="px-4 py-2 flex items-center gap-3 hover:bg-gray-50 cursor-pointer text-gray-600 hover:text-[#1A1A1A]">
                                                        <item.icon className="w-4 h-4" />
                                                        <span className="text-xs font-medium">{item.label}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="border-t border-gray-50 py-2">
                                            <div className="px-4 py-2 flex items-center gap-3 hover:bg-red-50 cursor-pointer text-red-500 hover:text-red-600 transition-colors" onClick={handleLogout}>
                                                <LogOut className="w-4 h-4" />
                                                <span className="text-xs font-medium">Sign Out</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </nav>


            {/* ================================================================================== */}
            {/* MOBILE "FLOATING CONTROL DECK" (ISLAND DOCK)                                       */}
            {/* Detached from edge, dark interface for contrast.                                   */}
            {/* ================================================================================== */}
            <nav className="md:hidden fixed bottom-6 inset-x-5 z-50">
                <div className="relative">
                    {/* The Dock Container */}
                    <div className="bg-[#151515]/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/30 rounded-[2rem] px-2 py-2 flex items-center justify-between">

                        {primaryNav.map((item) => {
                            const active = isActive(item.href);
                            const Icon = item.icon;

                            // Special styling for the "Compose" action button in the middle
                            if (item.isAction) {
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <div className="relative -mt-8 mx-2 group cursor-pointer">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E5E5E5] to-[#FFFFFF] shadow-lg shadow-white/10 flex items-center justify-center transform transition-transform group-hover:scale-105 active:scale-95 ring-4 ring-[#151515]">
                                                <Plus className="w-6 h-6 text-[#151515]" strokeWidth={2.5} />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            }

                            return (
                                <Link key={item.href} href={item.href}>
                                    <div className="flex-1 flex flex-col items-center justify-center px-1 py-1 cursor-pointer group relative w-14 h-12">

                                        {/* Icon Container with Glow */}
                                        <div className={`relative transition-all duration-300 ${active ? 'transform -translate-y-1' : 'opacity-50 group-hover:opacity-80'}`}>
                                            <Icon
                                                className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-gray-400'}`}
                                                strokeWidth={active ? 2.5 : 2}
                                            />

                                            {/* Active State Glow */}
                                            {active && (
                                                <motion.div
                                                    layoutId="dock-glow"
                                                    className="absolute -inset-2 bg-white/20 blur-lg rounded-full"
                                                    transition={{ duration: 0.2 }}
                                                />
                                            )}
                                        </div>

                                        {/* Minimal Dot Indicator (Instead of Labels) */}
                                        <div className={`absolute bottom-1 w-1 h-1 rounded-full bg-white transition-all duration-300 ${active ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>


            {/* ================================================================================== */}
            {/* PAGE CONTENT WRAPPER                                                               */}
            {/* Added padding at bottom for mobile to account for floating dock                     */}
            {/* ================================================================================== */}
            <main className={`min-h-screen pt-20 pb-32 md:pt-24 md:pb-10 transition-all duration-500`}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {children}
                </motion.div>
            </main>

            {/* Global Search Dialog */}
            <SearchDialog
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
            />

        </div>
    );
}

export default AppLayout;
