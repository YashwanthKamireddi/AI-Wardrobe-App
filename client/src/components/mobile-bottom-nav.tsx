import { memo } from "react";
import { Link, useLocation } from "wouter";
import { Home, Shirt, Layers, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const burgundy = "hsl(337, 73%, 26%)";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/outfits", label: "Outfits", icon: Layers },
  { href: "/inspirations", label: "Inspiration", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: User },
];

const hiddenRoutes = ["/", "/auth"];

export const MobileBottomNav = memo(function MobileBottomNav() {
  const { isMobile } = useIsMobile();
  const [location] = useLocation();

  if (!isMobile || hiddenRoutes.includes(location)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-sm border-t border-slate-100 flex items-center justify-around z-50 px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = location === item.href;
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive ? "font-medium" : "text-slate-400"
              )}
              style={isActive ? { color: burgundy } : {}}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
});

export default MobileBottomNav;
