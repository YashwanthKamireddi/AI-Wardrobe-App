import { Link, useLocation } from "wouter";
import { Grid3X3, Layers, Heart, User, Sparkles, Plus } from "lucide-react";
import { motion } from "framer-motion";

export function MobileNav() {
    const [location] = useLocation();

    // Hide on Landing and Auth pages
    if (location === "/" || location === "/auth") return null;

    const navItems = [
        { href: "/home", icon: Sparkles, label: "Home" },
        { href: "/wardrobe", icon: Grid3X3, label: "Wardrobe" },
        { href: "/compose", icon: Plus, label: "Create", isAction: true },
        { href: "/outfits", icon: Layers, label: "Outfits" },
        { href: "/profile", icon: User, label: "Profile" },
    ];

    return (
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1A1A]/90 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 z-50 shadow-[0_8px_32px_rgb(0,0,0,0.12)]">
            <div className="flex items-center gap-6">
                {navItems.map((item) => {
                    const isActive = location === item.href;

                    if (item.isAction) {
                        return (
                            <Link key={item.href} href={item.href}>
                                <motion.div
                                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center -mt-8 shadow-xl shadow-black/10 border-[3px] border-[#F9F9F7]"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <item.icon className="w-5 h-5 text-[#1A1A1A]" />
                                </motion.div>
                            </Link>
                        );
                    }

                    return (
                        <Link key={item.href} href={item.href}>
                            <div className="relative flex flex-col items-center gap-1">
                                <item.icon
                                    className={`w-5 h-5 transition-all duration-300 ${isActive ? "text-white scale-110" : "text-white/40 hover:text-white/80"}`}
                                />
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-dot"
                                        className="absolute -bottom-2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
