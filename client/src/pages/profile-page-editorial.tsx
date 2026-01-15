import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  User, LogOut, Mail, Shield, Settings, Crown, Grid3X3, Layers,
  Heart, ChevronRight, Bell, Lock, Star, ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/hooks/use-auth";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";

/**
 * PROFILE PAGE - EDITORIAL MINIMAL
 *
 * Design: Clean settings interface
 * Focus: User data and preferences
 */

export function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { data: wardrobeItems } = useWardrobeItems();
  const { data: outfits } = useOutfits();

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notificationsEnabled") === "true"
  );

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation('/');
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.username.slice(0, 2).toUpperCase() || 'U';
  };

  // Stats
  const stats = useMemo(() => {
    return {
      items: wardrobeItems?.length || 0,
      outfits: outfits?.length || 0,
      favorites: wardrobeItems?.filter(item => item.favorite).length || 0,
    };
  }, [wardrobeItems, outfits]);

  const memberSince = 'Recently joined';

  return (
    <div className="min-h-screen bg-[#F9F9F7] pb-24 md:pb-0">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#F9F9F7]/95 backdrop-blur-xl border-b border-[#E5E5E5]/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <span
              className="text-lg tracking-[0.2em] text-[#1A1A1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              CELURA
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/home">
              <span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Home</span>
            </Link>
            <Link href="/wardrobe">
              <span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Wardrobe</span>
            </Link>
            <Link href="/outfits">
              <span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Outfits</span>
            </Link>
            <Link href="/profile">
              <span className="text-xs tracking-[0.15em] uppercase text-[#1A1A1A] font-medium">Profile</span>
            </Link>
          </div>

          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8 md:py-12">
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

          <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-2">
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
            Profile
          </h1>
        </motion.header>

        {/* Profile Card */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="rounded-3xl bg-white border border-[#E5E5E5]/50 p-8">
            <div className="flex items-center gap-6 mb-8">
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl text-white"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  background: "linear-gradient(135deg, #1A1A1A 0%, #80163A 100%)"
                }}
              >
                {getUserInitials()}
              </div>

              {/* Info */}
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
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Items", value: stats.items },
                { label: "Outfits", value: stats.outfits },
                { label: "Favorites", value: stats.favorites },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-2xl bg-[#F9F9F7]">
                  <p
                    className="text-2xl text-[#1A1A1A] mb-1"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-[#6B6B6B] uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Member Since */}
            <div className="flex items-center justify-between py-4 border-t border-[#E5E5E5]">
              <span className="text-sm text-[#6B6B6B]">Member since</span>
              <span className="text-sm text-[#1A1A1A]">{memberSince}</span>
            </div>
          </div>
        </motion.section>

        {/* Settings */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-4">Settings</h3>

          <div className="rounded-3xl bg-white border border-[#E5E5E5]/50 overflow-hidden">
            {/* Notifications */}
            <div className="flex items-center justify-between p-5 border-b border-[#E5E5E5]/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#6B6B6B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">Notifications</p>
                  <p className="text-xs text-[#9A9A9A]">Outfit suggestions & updates</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setNotificationsEnabled(!notificationsEnabled);
                  localStorage.setItem("notificationsEnabled", (!notificationsEnabled).toString());
                }}
                className={`w-12 h-7 rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-[#1A1A1A]' : 'bg-[#E5E5E5]'
                }`}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white shadow-sm"
                  animate={{ x: notificationsEnabled ? 22 : 4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Privacy */}
            <div className="flex items-center justify-between p-5 border-b border-[#E5E5E5]/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#6B6B6B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">Privacy</p>
                  <p className="text-xs text-[#9A9A9A]">Manage your data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#9A9A9A]" />
            </div>

            {/* Account */}
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#6B6B6B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">Account Security</p>
                  <p className="text-xs text-[#9A9A9A]">Password & security</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#9A9A9A]" />
            </div>
          </div>
        </motion.section>

        {/* Sign Out */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full h-14 rounded-full border border-[#E5E5E5] text-[#B44141] text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            whileHover={{ borderColor: "#B44141", backgroundColor: "#FEF2F2" }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </motion.button>
        </motion.section>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-[#9A9A9A]">
            CELURA v1.0.0
          </p>
          <p className="text-xs text-[#9A9A9A] mt-1">
            Made with care for your wardrobe
          </p>
        </footer>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E5E5E5]/50 px-6 py-3">
        <div className="flex items-center justify-around">
          {[
            { href: "/home", icon: Grid3X3, label: "Home" },
            { href: "/wardrobe", icon: Layers, label: "Wardrobe" },
            { href: "/outfits", icon: Heart, label: "Outfits" },
            { href: "/profile", icon: User, label: "Profile", active: true },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center gap-1 ${item.active ? "text-[#1A1A1A]" : "text-[#9A9A9A]"}`}>
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] tracking-wider">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default ProfilePage;
