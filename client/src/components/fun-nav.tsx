
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Shirt, 
  Sun, 
  User, 
  Heart, 
  Cloud,
  Sparkles, 
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { motion } from "framer-motion";

export function FunNavigation({ className }: { className?: string }) {
  const location = useLocation();
  
  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      color: "text-pink-500",
      hoverColor: "group-hover:text-pink-400",
      bgColor: "group-hover:bg-pink-500/10",
    },
    {
      name: "Wardrobe",
      href: "/wardrobe",
      icon: Shirt,
      color: "text-blue-500",
      hoverColor: "group-hover:text-blue-400",
      bgColor: "group-hover:bg-blue-500/10",
    },
    {
      name: "Outfits",
      href: "/outfits",
      icon: Sparkles,
      color: "text-purple-500",
      hoverColor: "group-hover:text-purple-400",
      bgColor: "group-hover:bg-purple-500/10",
    },
    {
      name: "Inspirations",
      href: "/inspirations",
      icon: Heart,
      color: "text-red-500",
      hoverColor: "group-hover:text-red-400",
      bgColor: "group-hover:bg-red-500/10",
    },
    {
      name: "Weather",
      href: "/weather",
      icon: Cloud,
      color: "text-cyan-500",
      hoverColor: "group-hover:text-cyan-400",
      bgColor: "group-hover:bg-cyan-500/10",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      color: "text-amber-500",
      hoverColor: "group-hover:text-amber-400",
      bgColor: "group-hover:bg-amber-500/10",
    },
  ];

  return (
    <div className={cn("flex flex-col space-y-1 p-2", className)}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "group relative justify-start h-12 overflow-hidden transition-all duration-300",
              isActive && "bg-primary/10 font-medium"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 z-0 opacity-0 transition-opacity duration-300",
                item.bgColor,
                isActive && "opacity-10"
              )}
            />
            
            <item.icon 
              className={cn(
                "mr-2 h-5 w-5 transition-all duration-300", 
                item.color,
                item.hoverColor
              )} 
            />
            
            {isActive ? (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 relative"
              >
                {item.name}
              </motion.span>
            ) : (
              <span className="z-10 relative">{item.name}</span>
            )}
            
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary"
                transition={{ type: "spring", bounce: 0.25 }}
              />
            )}
          </Link>
        );
      })}
      
      <div className="pt-2 mt-2 border-t border-border">
        <Link
          to="/auth"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "group justify-start text-muted-foreground hover:text-destructive"
          )}
        >
          <LogOut className="mr-2 h-5 w-5 transition-all duration-300 group-hover:rotate-12" />
          Sign Out
        </Link>
      </div>
    </div>
  );
}
