import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
    Home, Shirt, Layers, Calendar, Plane, BarChart3, Sparkles,
    Lightbulb, User, LogOut, ChevronDown, ArrowLeft, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

interface MainLayoutProps {
    children: React.ReactNode;
}

// Navigation items
const mainNav = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
    { href: "/outfits", label: "Outfits", icon: Layers },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/trips", label: "Trips", icon: Plane },
];

const moreNav = [
    { href: "/statistics", label: "Analytics", icon: BarChart3, desc: "Wardrobe insights" },
    { href: "/style-essence", label: "Style DNA", icon: Sparkles, desc: "Your fashion profile" },
    { href: "/inspiration", label: "Inspiration", icon: Lightbulb, desc: "Mood boards & ideas" },
];

export function MainLayout({ children }: MainLayoutProps) {
    const { user, logoutMutation } = useAuth();
    const [location, setLocation] = useLocation();
    const [showMore, setShowMore] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = () => {
        logoutMutation.mutate();
        setLocation('/');
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] pb-24 md:pb-0">
            {/* Desktop Navigation */}
            <nav className="sticky top-0 z-50 bg-[#FAF9F6]/95 backdrop-blur-xl border-b border-[#E5E5E5]/50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/">
                        <span
                            className="text-lg tracking-[0.2em] text-[#1A1A1A] cursor-pointer"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            VESSURA
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {mainNav.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <span
                                    className={`px-4 py-2 rounded-lg text-xs tracking-[0.1em] uppercase transition-all cursor-pointer ${location === item.href
                                        ? "bg-[#1A1A1A] text-white font-medium"
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
                                className={`px-4 py-2 rounded-lg text-xs tracking-[0.1em] uppercase transition-all flex items-center gap-1 ${moreNav.some(n => location === n.href)
                                    ? "bg-[#1A1A1A] text-white font-medium"
                                    : "text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F0F0F0]"
                                    }`}
                            >
                                More
                                <ChevronDown className={`w-3 h-3 transition-transform ${showMore ? "rotate-180" : ""}`} />
                            </button>

                            <AnimatePresence>
                                {showMore && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E5E5E5] overflow-hidden py-2"
                                        onMouseLeave={() => setShowMore(false)}
                                    >
                                        {moreNav.map((item) => (
                                            <Link key={item.href} href={item.href}>
                                                <div
                                                    className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${location === item.href
                                                        ? "bg-[#FAF9F6]"
                                                        : "hover:bg-[#FAF9F6]"
                                                        }`}
                                                    onClick={() => setShowMore(false)}
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center">
                                                        <item.icon className="w-4 h-4 text-[#1A1A1A]" />
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

                    {/* Profile Menu */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors"
                        >
                            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        {/* Profile Avatar - Direct Link */}
                        <Link href="/profile">
                            <div
                                className="hidden md:flex w-9 h-9 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#80163A] text-white items-center justify-center text-xs font-medium cursor-pointer hover:ring-2 hover:ring-[#80163A]/20 transition-all"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                            </div>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Panel */}
            <AnimatePresence>
                {showMobileMenu && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-[#E5E5E5] overflow-hidden"
                    >
                        <div className="p-4 space-y-1">
                            {[...mainNav, ...moreNav].map((item) => (
                                <Link key={item.href} href={item.href}>
                                    <div
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location === item.href
                                            ? "bg-[#1A1A1A] text-white"
                                            : "text-[#1A1A1A] hover:bg-[#FAF9F6]"
                                            }`}
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </div>
                                </Link>
                            ))}

                            <div className="border-t border-[#E5E5E5] pt-2 mt-2">
                                <Link href="/profile">
                                    <div
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FAF9F6]"
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        <User className="w-5 h-5 text-[#6B6B6B]" />
                                        <span className="text-sm text-[#1A1A1A]">Profile & Settings</span>
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="text-sm">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] z-40 safe-area-pb">
                <div className="flex justify-around items-center h-16">
                    {mainNav.slice(0, 5).map((item) => (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${location === item.href
                                    ? "text-[#80163A]"
                                    : "text-[#9A9A9A]"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
}
