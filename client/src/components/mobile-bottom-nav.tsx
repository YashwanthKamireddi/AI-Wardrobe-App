
import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  ShoppingBag, 
  ShoppingCart, 
  Image, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function MobileBottomNav() {
  const { isMobile } = useIsMobile();
  const [location] = useLocation();
  
  if (!isMobile) return null;
  
  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/wardrobe", label: "Wardrobe", icon: ShoppingBag },
    { href: "/outfits", label: "Outfits", icon: ShoppingCart },
    { href: "/inspirations", label: "Inspiration", icon: Image },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t flex items-center justify-around z-50 px-1">
      {navItems.map((item) => {
        const isActive = location === item.href;
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center h-full w-full rounded-md transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
