import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import {
    User, LogOut, Grid3X3, Layers, Heart, ChevronRight,
    Bell, MapPin, ArrowLeft, Calendar, Plane, Sparkles, Lightbulb, BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";

/**
 * PROFILE PAGE - EDITORIAL THEME
 * Matches the app's editorial aesthetic with proper desktop layout
 */

export function ProfilePage() {
    const { user, logoutMutation } = useAuth();
    const [, setLocation] = useLocation();
    const { data: wardrobeItems } = useWardrobeItems();
    const { data: outfits } = useOutfits();

    const [notificationsEnabled, setNotificationsEnabled] = useState(
        localStorage.getItem("notificationsEnabled") === "true"
    );
    const [weatherLocation, setWeatherLocationState] = useState(
        localStorage.getItem("weatherLocation") || ""
    );

    const handleLogout = () => {
        logoutMutation.mutate();
        setLocation('/');
    };

    const getUserInitials = () => {
        if (user?.name) {
            return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return user?.username?.slice(0, 2).toUpperCase() || 'U';
    };

    const stats = useMemo(() => ({
        items: wardrobeItems?.length || 0,
        outfits: outfits?.length || 0,
        favorites: wardrobeItems?.filter(item => item.favorite).length || 0,
    }), [wardrobeItems, outfits]);

    const updateWeatherLocation = () => {
        const newLocation = prompt("Enter your city name:", weatherLocation);
        if (newLocation !== null) {
            localStorage.setItem("weatherLocation", newLocation);
            setWeatherLocationState(newLocation);
            window.location.reload();
        }
    };

    const toggleNotifications = () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        localStorage.setItem("notificationsEnabled", newValue.toString());
    };

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
                {/* Header */}
                <motion.header
                    className="mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Link href="/home">
                        <motion.button
                            className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors mb-6 md:hidden"
                            whileHover={{ x: -4 }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm">Back</span>
                        </motion.button>
                    </Link>

                    <p className="text-xs tracking-[0.2em] uppercase text-[#80163A] mb-2">
                        Account
                    </p>
                    <h1
                        className="text-[#1A1A1A]"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(2rem, 5vw, 3rem)",
                            lineHeight: 1.1
                        }}
                    >
                        Profile & Settings
                    </h1>
                </motion.header>

                {/* Two-Column Layout for Desktop */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column - Profile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        {/* Profile Card */}
                        <div className="rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E5E5E5]/50 p-8 mb-6">
                            <div className="flex items-center gap-6 mb-8">
                                <div
                                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl text-white"
                                    style={{
                                        fontFamily: "'Playfair Display', serif",
                                        background: "linear-gradient(135deg, #1A1A1A 0%, #80163A 100%)"
                                    }}
                                >
                                    {getUserInitials()}
                                </div>
                                <div className="flex-1">
                                    <h2
                                        className="text-2xl text-[#1A1A1A] mb-1"
                                        style={{ fontFamily: "'Playfair Display', serif" }}
                                    >
                                        {user?.name || user?.username}
                                    </h2>
                                    <p className="text-sm text-[#6B6B6B]">@{user?.username}</p>
                                    {user?.email && (
                                        <p className="text-sm text-[#9A9A9A] mt-1">{user.email}</p>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: "Items", value: stats.items, icon: Grid3X3 },
                                    { label: "Outfits", value: stats.outfits, icon: Layers },
                                    { label: "Favorites", value: stats.favorites, icon: Heart },
                                ].map((stat) => (
                                    <motion.div
                                        key={stat.label}
                                        className="text-center p-4 rounded-2xl bg-[#F9F9F7]"
                                        whileHover={{ y: -2 }}
                                    >
                                        <stat.icon className="w-4 h-4 mx-auto mb-2 text-[#9A9A9A]" />
                                        <p
                                            className="text-2xl text-[#1A1A1A] mb-1"
                                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                        >
                                            {stat.value}
                                        </p>
                                        <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Sign Out */}
                        <motion.button
                            onClick={handleLogout}
                            disabled={logoutMutation.isPending}
                            className="w-full h-14 rounded-2xl border border-[#E5E5E5] text-[#B44141] text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 bg-white/70"
                            whileHover={{ borderColor: "#B44141", backgroundColor: "#FEF2F2" }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </motion.button>
                    </motion.div>

                    {/* Right Column - Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {/* Preferences */}
                        <div className="rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E5E5E5]/50 overflow-hidden mb-6">
                            <h3 className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] px-6 pt-6 pb-4">
                                Preferences
                            </h3>

                            {/* Weather Location */}
                            <motion.button
                                onClick={updateWeatherLocation}
                                className="w-full flex items-center justify-between px-6 py-5 hover:bg-[#F9F9F7] transition-colors border-b border-[#E5E5E5]/50 group"
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center group-hover:bg-[#1A1A1A] transition-colors">
                                        <MapPin className="w-5 h-5 text-[#1A1A1A] group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-[#1A1A1A]">Weather Location</p>
                                        <p className="text-xs text-[#9A9A9A]">{weatherLocation || "Auto-detect"}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[#9A9A9A]" />
                            </motion.button>

                            {/* Notifications */}
                            <div className="flex items-center justify-between px-6 py-5 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center group-hover:bg-[#1A1A1A] transition-colors">
                                        <Bell className="w-5 h-5 text-[#1A1A1A] group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-[#1A1A1A]">Notifications</p>
                                        <p className="text-xs text-[#9A9A9A]">Outfit suggestions & updates</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleNotifications}
                                    className={`w-12 h-7 rounded-full transition-colors ${notificationsEnabled ? 'bg-[#1A1A1A]' : 'bg-[#E5E5E5]'
                                        }`}
                                >
                                    <motion.div
                                        className="w-5 h-5 rounded-full bg-white shadow-sm"
                                        animate={{ x: notificationsEnabled ? 22 : 4 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="rounded-3xl bg-white/70 backdrop-blur-sm border border-[#E5E5E5]/50 overflow-hidden">
                            <h3 className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] px-6 pt-6 pb-4">
                                Quick Access
                            </h3>

                            {[
                                { href: "/wardrobe", label: "My Wardrobe", desc: "Manage your items", icon: Grid3X3 },
                                { href: "/outfits", label: "Saved Outfits", desc: "View combinations", icon: Layers },
                                { href: "/calendar", label: "Calendar", desc: "Plan your looks", icon: Calendar },
                                { href: "/trips", label: "Trips", desc: "Pack for travel", icon: Plane },
                                { href: "/style-essence", label: "Style DNA", desc: "Your fashion profile", icon: Sparkles },
                                { href: "/inspiration", label: "Inspiration", desc: "Mood boards & ideas", icon: Lightbulb },
                                { href: "/statistics", label: "Analytics", desc: "Wardrobe insights", icon: BarChart3 },
                            ].map((item, i) => (
                                <Link key={item.href} href={item.href}>
                                    <motion.div
                                        className={`flex items-center justify-between px-6 py-5 hover:bg-[#F9F9F7] transition-colors ${i < 2 ? 'border-b border-[#E5E5E5]/50' : ''
                                            }`}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center group-hover:bg-[#1A1A1A] transition-colors">
                                                <item.icon className="w-5 h-5 text-[#1A1A1A] group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-[#1A1A1A]">{item.label}</p>
                                                <p className="text-xs text-[#9A9A9A]">{item.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-[#9A9A9A]" />
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Footer */}
                <footer className="mt-12 text-center">
                    <p className="text-xs text-[#9A9A9A]">CELURA v1.0.0</p>
                </footer>
            </div>


        </AppLayout>
    );
}

export default ProfilePage;
