import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import {
    User, LogOut, Grid3X3, Layers, Heart, ChevronRight,
    Bell, MapPin, Info, FileText, Shield, Mail, Edit2
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";

/**
 * PROFILE PAGE - REDESIGNED
 * Single column, mobile-first layout following Apple Settings / Instagram patterns
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
            <div className="max-w-lg mx-auto px-4 py-8 md:py-12">

                {/* ========================================== */}
                {/* PROFILE HERO */}
                {/* ========================================== */}
                <motion.section
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Avatar */}
                    <div className="relative inline-block mb-4">
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl text-white shadow-lg"
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                background: "linear-gradient(135deg, #1A1A1A 0%, #80163A 100%)"
                            }}
                        >
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                getUserInitials()
                            )}
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
                            <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                    </div>

                    {/* Name & Info */}
                    <h1
                        className="text-2xl text-[#1A1A1A] mb-1"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        {user?.name || user?.username}
                    </h1>
                    <p className="text-sm text-gray-500">@{user?.username}</p>
                    {user?.email && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                        </p>
                    )}
                </motion.section>


                {/* ========================================== */}
                {/* STATS BAR */}
                {/* ========================================== */}
                <motion.section
                    className="grid grid-cols-3 gap-2 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {[
                        { label: "Items", value: stats.items, icon: Grid3X3 },
                        { label: "Outfits", value: stats.outfits, icon: Layers },
                        { label: "Favorites", value: stats.favorites, icon: Heart },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="text-center py-4 rounded-2xl bg-white border border-gray-100"
                        >
                            <p
                                className="text-2xl font-semibold text-[#1A1A1A] mb-0.5"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                                {stat.value}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </motion.section>


                {/* ========================================== */}
                {/* PREFERENCES SECTION */}
                {/* ========================================== */}
                <motion.section
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                >
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3 px-1">
                        Preferences
                    </h2>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                        {/* Weather Location */}
                        <button
                            onClick={updateWeatherLocation}
                            className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#1A1A1A]">Weather Location</p>
                                    <p className="text-xs text-gray-400">{weatherLocation || "Auto-detect"}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </button>

                        {/* Notifications */}
                        <div className="flex items-center justify-between px-4 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <Bell className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#1A1A1A]">Notifications</p>
                                    <p className="text-xs text-gray-400">Outfit reminders</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleNotifications}
                                className={`w-11 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`}
                            >
                                <motion.div
                                    className="w-5 h-5 rounded-full bg-white shadow-sm"
                                    animate={{ x: notificationsEnabled ? 22 : 2 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </button>
                        </div>
                    </div>
                </motion.section>


                {/* ========================================== */}
                {/* ABOUT SECTION */}
                {/* ========================================== */}
                <motion.section
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3 px-1">
                        About
                    </h2>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                        <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <Info className="w-4 h-4 text-gray-600" />
                                </div>
                                <p className="text-sm font-medium text-[#1A1A1A]">About Celura</p>
                            </div>
                            <span className="text-xs text-gray-400">v1.0.0</span>
                        </button>

                        <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-gray-600" />
                                </div>
                                <p className="text-sm font-medium text-[#1A1A1A]">Privacy Policy</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </button>

                        <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-gray-600" />
                                </div>
                                <p className="text-sm font-medium text-[#1A1A1A]">Terms of Service</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </button>
                    </div>
                </motion.section>


                {/* ========================================== */}
                {/* SIGN OUT */}
                {/* ========================================== */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                >
                    <button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        className="w-full py-4 rounded-2xl bg-white border border-gray-100 text-red-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-100 transition-colors disabled:opacity-50"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </motion.section>


                {/* Footer */}
                <footer className="mt-12 text-center">
                    <p className="text-[10px] text-gray-300 uppercase tracking-widest">Celura • Made with ♥</p>
                </footer>
            </div>
        </AppLayout>
    );
}

export default ProfilePage;
