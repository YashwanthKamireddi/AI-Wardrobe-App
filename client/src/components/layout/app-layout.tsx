import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
    Home, Shirt, Layers, Calendar, Plane, BarChart3, Sparkles,
    Lightbulb, User, LogOut, ChevronDown, Menu, X, Plus, Frame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

/**
 * UNIFIED APP LAYOUT
 * Single consistent navigation for the entire application
 * Premium "Digital Atelier" aesthetic
 */

interface AppLayoutProps {
    children: React.ReactNode;
    fullWidth?: boolean; // For pages that need full width (like wardrobe)
}

// Primary navigation items - always visible
const primaryNav = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
    { href: "/compose", label: "Compose", icon: Plus },
    { href: "/outfits", label: "Outfits", icon: Layers },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/trips", label: "Trips", icon: Plane },
];

// Secondary navigation - in "More" dropdown
const secondaryNav = [
    { href: "/statistics", label: "Analytics", icon: BarChart3, desc: "Wardrobe insights" },
    { href: "/style-essence", label: "Style DNA", icon: Sparkles, desc: "Fashion profile" },
    { href: "/inspiration", label: "Inspiration", icon: Lightbulb, desc: "Mood boards" },
    { href: "/framing", label: "Framing", icon: Frame, desc: "Showcase looks" },
];

export function AppLayout({ children, fullWidth = false }: AppLayoutProps) {
    const { user, logoutMutation } = useAuth();
    const [location, setLocation] = useLocation();
    const [showMore, setShowMore] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = () => {
        logoutMutation.mutate();
        setLocation('/');
    };

    const isActive = (href: string) => location === href;
    const isSecondaryActive = secondaryNav.some(item => isActive(item.href));

    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            {/* ========== DESKTOP NAVIGATION ========== */}
            <nav className="sticky top-0 z-50 bg-[#FAF9F6]/95 backdrop-blur-xl border-b border-[#E5E5E5]">
                <div className={`mx-auto px-6 h-16 flex items-center justify-between ${fullWidth ? 'max-w-[1800px]' : 'max-w-7xl'}`}>

                    {/* Logo */}
                    <Link href="/home">
                        <span
                            className="text-lg tracking-[0.25em] text-[#1A1A1A] cursor-pointer font-medium"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            CELURA
                        </span>
                    </Link>

                    {/* Desktop Nav Items */}
                    <div className="hidden md:flex items-center gap-1">
                        {primaryNav.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <span
                                    className={`px-4 py-2 rounded-full text-[11px] tracking-[0.1em] uppercase font-medium transition-all cursor-pointer ${isActive(item.href)
                                        ? "bg-[#1A1A1A] text-white"
                                        : "text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0F0F0]"
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        ))}

                        {/* More Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => { setShowMore(!showMore); setShowProfile(false); }}
                                className={`px-4 py-2 rounded-full text-[11px] tracking-[0.1em] uppercase font-medium transition-all flex items-center gap-1.5 ${isSecondaryActive
                                    ? "bg-[#1A1A1A] text-white"
                                    : "text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0F0F0]"
                                    }`}
                            >
                                More
                                <ChevronDown className={`w-3 h-3 transition-transform ${showMore ? "rotate-180" : ""}`} />
                            </button>

                            <AnimatePresence>
                                {showMore && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ duration: 0.12 }}
                                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-[#E5E5E5] overflow-hidden py-1"
                                        onMouseLeave={() => setShowMore(false)}
                                    >
                                        {secondaryNav.map((item) => (
                                            <Link key={item.href} href={item.href}>
                                                <div
                                                    className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${isActive(item.href) ? "bg-[#FAF9F6]" : "hover:bg-[#FAF9F6]"
                                                        }`}
                                                    onClick={() => setShowMore(false)}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive(item.href) ? "bg-[#1A1A1A]" : "bg-[#F5F5F5]"
                                                        }`}>
                                                        <item.icon className={`w-4 h-4 ${isActive(item.href) ? "text-white" : "text-[#1A1A1A]"}`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-[#1A1A1A]">{item.label}</p>
                                                        <p className="text-[10px] text-[#9A9A9A]">{item.desc}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Side - Profile & Mobile Menu */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors"
                        >
                            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        {/* Profile Avatar with Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => { setShowProfile(!showProfile); setShowMore(false); }}
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#80163A] text-white flex items-center justify-center text-xs font-medium cursor-pointer hover:ring-2 hover:ring-[#80163A]/20 transition-all"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                            </button>

                            <AnimatePresence>
                                {showProfile && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ duration: 0.12 }}
                                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-[#E5E5E5] overflow-hidden"
                                        onMouseLeave={() => setShowProfile(false)}
                                    >
                                        <div className="px-4 py-3 border-b border-[#E5E5E5] bg-[#FAF9F6]">
                                            <p className="text-sm font-medium text-[#1A1A1A]">{user?.name || user?.username}</p>
                                            <p className="text-xs text-[#9A9A9A]">@{user?.username}</p>
                                        </div>

                                        <div className="py-1">
                                            <Link href="/profile">
                                                <div
                                                    className="px-4 py-2.5 flex items-center gap-3 hover:bg-[#FAF9F6] cursor-pointer"
                                                    onClick={() => setShowProfile(false)}
                                                >
                                                    <User className="w-4 h-4 text-[#6B6B6B]" />
                                                    <span className="text-sm text-[#1A1A1A]">Profile & Settings</span>
                                                </div>
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 text-red-600"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span className="text-sm">Sign Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ========== MOBILE MENU PANEL ("THE INDEX") ========== */}
            <AnimatePresence>
                {showMobileMenu && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[60] bg-[#FAF9F6]/95 backdrop-blur-2xl flex flex-col"
                    >
                        {/* Header with Close Button */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-8">
                            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#80163A]">
                                The Index
                            </span>
                            <button
                                onClick={() => setShowMobileMenu(false)}
                                className="p-2 rounded-full bg-[#E5E5E5]/50 hover:bg-[#E5E5E5] transition-colors"
                            >
                                <X className="w-5 h-5 text-[#1A1A1A]" />
                            </button>
                        </div>

                        {/* Main Navigation Links */}
                        <div className="flex-1 overflow-y-auto px-8 flex flex-col justify-center space-y-8 pb-32">
                            {[...primaryNav, ...secondaryNav].map((item, i) => (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ delay: i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <Link href={item.href}>
                                        <div onClick={() => setShowMobileMenu(false)} className="group cursor-pointer">
                                            <div className="flex items-baseline gap-4">
                                                <span className="text-xs font-mono text-[#9A9A9A] group-hover:text-[#80163A] transition-colors">
                                                    0{i + 1}
                                                </span>
                                                <span
                                                    className={`text-4xl font-light italic transition-all group-hover:translate-x-2 ${isActive(item.href) ? "text-[#1A1A1A] not-italic font-medium" : "text-[#666666] group-hover:text-[#1A1A1A]"
                                                        }`}
                                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                                >
                                                    {item.label}
                                                </span>
                                            </div>
                                            {(item as any).desc && (
                                                <p className="ml-8 text-xs text-[#9A9A9A] tracking-wider uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {(item as any).desc}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer / Account */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white border-t border-[#E5E5E5] p-6 pb-safe"
                        >
                            <Link href="/profile">
                                <div
                                    className="flex items-center gap-4 p-4 rounded-xl bg-[#FAF9F6] border border-[#E5E5E5]"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#80163A] flex items-center justify-center text-white font-serif italic text-lg shadow-md">
                                        {user?.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <p className="text-[#1A1A1A] font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
                                            {user?.name || "Member"}
                                        </p>
                                        <p className="text-xs text-[#9A9A9A] tracking-wide uppercase">View Profile & Settings</p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========== MAIN CONTENT ========== */}
            <main className="pb-32 md:pb-0 min-h-[calc(100vh-4rem)]">
                {children}
            </main>

            {/* ========== MOBILE BOTTOM NAV ========== */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
                {/* Gradient fade above nav for smooth content scrolling */}
                <div className="absolute bottom-full left-0 right-0 h-12 bg-gradient-to-t from-[#FAF9F6] to-transparent pointer-events-none" />

                <div className="bg-white/90 backdrop-blur-xl border-t border-[#E5E5E5] pb-safe">
                    <div className="flex justify-around items-center h-20 px-2 pb-2">
                        {primaryNav.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <div
                                    className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${isActive(item.href)
                                        ? "text-[#1A1A1A]"
                                        : "text-[#9A9A9A] hover:text-[#6B6B6B]"
                                        }`}
                                >
                                    <div className={`relative p-1.5 rounded-full transition-all ${isActive(item.href) ? "bg-[#F5F5F5]" : ""}`}>
                                        <item.icon className={`w-5 h-5 ${isActive(item.href) ? "stroke-[2.5]" : "stroke-2"}`} />
                                    </div>
                                    <span className={`text-[10px] font-medium tracking-wide transition-all ${isActive(item.href) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 hidden"}`}>
                                        {item.label}
                                    </span>

                                    {isActive(item.href) && (
                                        <motion.div
                                            layoutId="mobile-nav-indicator"
                                            className="absolute -bottom-1 w-1 h-1 bg-[#1A1A1A] rounded-full"
                                        />
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default AppLayout;
