import { memo } from "react";
import { Link, useLocation } from "wouter";
import { Home, Shirt, Layers, Sparkles, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const burgundy = "hsl(337, 73%, 26%)";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/outfits", label: "Outfits", icon: Layers },
  { href: "/style-essence", label: "Style", icon: Sparkles },
  { href: "/statistics", label: "Stats", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

const hiddenRoutes = ["/", "/auth"];

export const MobileBottomNav = memo(function MobileBottomNav() {
  const { isMobile } = useIsMobile();
  const [location] = useLocation();

  if (!isMobile || hiddenRoutes.includes(location)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 z-50 px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <div className="relative flex flex-col items-center justify-center gap-0.5 px-4 py-2">
                {/* Active indicator dot */}
                {isActive && (
                  <div
                    className="absolute -top-0.5 w-5 h-1 rounded-full"
                    style={{ background: burgundy }}
                  />
                )}
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-all duration-200",
                    isActive ? "scale-105" : "text-slate-400"
                  )}
                  style={isActive ? { color: burgundy, background: `${burgundy}08` } : {}}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "" : "text-slate-400"
                  )}
                  style={isActive ? { color: burgundy } : {}}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

export default MobileBottomNav;
