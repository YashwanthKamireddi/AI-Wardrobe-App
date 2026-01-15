import { memo } from "react";
import { Link, useLocation } from "wouter";
import { Home, Archive, Plus, MapPin, User, Sparkles, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { HapticFeedback } from "@/lib/haptics";

/**
 * 5-Pillar Navigation System
 * Luxury Light Theme Design
 *
 * 1. Home (The Daily Edit) - Today's outfit, weather context
 * 2. Closet (The Archive) - Wardrobe items
 * 3. Compose (The Studio) - Create outfits (center action)
 * 4. Calendar - Outfit planning
 * 5. Profile (The Atelier) - Settings & style DNA
 */

// Original luxury palette
const burgundy = "#80163a";
const gold = "#D4A54A";
const cream = "#faf9f7";
const slate = "#64748b";

const navItems = [
  { href: "/home", label: "Home", icon: Sparkles },
  { href: "/wardrobe", label: "Closet", icon: Archive },
  { href: "/compose", label: "Create", icon: Plus, isAction: true },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/profile", label: "Profile", icon: Settings },
];

const hiddenRoutes = ["/", "/auth"];

export const MobileBottomNav = memo(function MobileBottomNav() {
  const { isMobile } = useIsMobile();
  const [location] = useLocation();

  if (!isMobile || hiddenRoutes.includes(location)) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center justify-around h-[64px] max-w-[500px] mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.href ||
            (item.href === "/wardrobe" && location.includes("/wardrobe")) ||
            (item.href === "/home" && location === "/home") ||
            (item.href === "/calendar" && location.includes("/calendar"));
          const Icon = item.icon;

          // Center action button (Compose) - Burgundy Style
          if (item.isAction) {
            return (
              <Link key={item.href} href={item.href}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => HapticFeedback.selection()}
                  className="relative flex items-center justify-center shadow-lg"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${gold} 0%, #E8C060 100%)`,
                    color: '#1a1a1a',
                    marginTop: '-24px',
                    boxShadow: '0 4px 16px rgba(212, 165, 74, 0.4)',
                  }}
                >
                  <Icon className="h-6 w-6" strokeWidth={2.5} />
                </motion.button>
              </Link>
            );
          }

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                onClick={() => HapticFeedback.light()}
                className="flex flex-col items-center justify-center gap-1 min-w-[64px] py-2"
              >
                <div
                  className={cn(
                    "transition-all",
                    isActive && "scale-110"
                  )}
                  style={{
                    color: isActive ? gold : slate
                  }}
                >
                  <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span
                  className="text-[10px] tracking-wide"
                  style={{
                    color: isActive ? gold : slate,
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

export default MobileBottomNav;
