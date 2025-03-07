import React from "react";
import { Link, useLocation } from "wouter";
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
  const [location] = useLocation();

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      color: "text-violet-500",
      hoverColor: "group-hover:text-violet-400",
      bgColor: "group-hover:bg-violet-500/10",
    },
    {
      name: "Wardrobe",
      href: "/wardrobe",
      icon: Shirt,
      color: "text-emerald-500",
      hoverColor: "group-hover:text-emerald-400",
      bgColor: "group-hover:bg-emerald-500/10",
    },
    {
      name: "Outfits",
      href: "/outfits",
      icon: Sparkles,
      color: "text-rose-500",
      hoverColor: "group-hover:text-rose-400",
      bgColor: "group-hover:bg-rose-500/10",
    },
    {
      name: "Inspirations",
      href: "/inspirations",
      icon: Heart,
      color: "text-pink-500",
      hoverColor: "group-hover:text-pink-400",
      bgColor: "group-hover:bg-pink-500/10",
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
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur"> {/* Added nav element and styling */}
      <div className="container flex h-16 items-center">
        <div className="flex items-center space-x-1">
          <Sparkles className="h-6 w-6 text-primary mr-2" /> {/* Added logo */}
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Style Sage</span> {/* Added title */}
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "group relative flex items-center justify-center rounded-full p-2 text-sm font-medium transition-all hover:shadow-md focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                  isActive
                    ? `bg-gradient-to-r from-${item.color.slice(5, -5)}-500 to-${item.color.slice(5, -5)}-600 text-white shadow-md scale-110`
                    : `hover:bg-gradient-to-r hover:from-${item.color.slice(5, -5)}-500 hover:to-${item.color.slice(5, -5)}-600 hover:text-white ${item.color}`
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className={cn(
                  "ml-2 hidden md:inline-block",
                  isActive ? "text-white" : "text-foreground/70"
                )}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
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
    </nav>
  );
}