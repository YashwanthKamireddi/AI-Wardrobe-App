import React, { memo } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Shirt,
  Layers,
  Sparkles,
  User,
  Palette,
  Scissors
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { FashionLogo } from "@/components/ui/fashion-logo";

// Animation variants - memoized to avoid recreation on re-renders
const navVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

const iconVariants = {
  inactive: { scale: 1, y: 0 },
  active: { 
    scale: 1.2, 
    y: -2,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 10 
    }
  }
};

// Defining navItems outside of component to prevent recreation on each render
const navItems = [
  { href: "/", label: "Atelier", icon: Home, gradient: "from-primary/10 to-accent/10" },
  { href: "/wardrobe", label: "Collection", icon: Shirt, gradient: "from-accent/10 to-primary/10" },
  { href: "/outfits", label: "Ensembles", icon: Layers, gradient: "from-primary/10 to-accent/10" },
  { href: "/inspirations", label: "Runway", icon: Sparkles, gradient: "from-accent/10 to-primary/10" },
  { href: "/profile", label: "Boutique", icon: User, gradient: "from-primary/10 to-accent/10" },
];

// Get gradient for a path - moved outside component for better performance
const getGradient = (path: string, currentLocation: string): string => {
  if (currentLocation === path) {
    const item = navItems.find(item => item.href === path);
    return item?.gradient || "from-primary/10 to-secondary/10";
  }
  return "";
};

// Using React.memo to prevent unnecessary re-renders
export const MobileBottomNav = memo(function MobileBottomNav() {
  const { isMobile } = useIsMobile();
  const [location] = useLocation();
  
  if (!isMobile) return null;

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-t border-accent/30 flex items-center justify-around z-50 px-1 shadow-lg pb-safe dark:bg-slate-900/95 dark:border-accent/40"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      {/* Luxury fashion-themed top decoration */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-primary to-accent transform -translate-y-0.5"></div>
      {/* Side decorative elements */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-accent/40 transform -translate-x-0.5 -translate-y-0.5"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-accent/40 transform translate-x-0.5 -translate-y-0.5"></div>
      {navItems.map((item) => {
        const isActive = location === item.href;
        const Icon = item.icon;
        
        return (
          <motion.div
            key={item.href}
            variants={itemVariants}
            className="w-full"
          >
            <Link 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center h-full w-full rounded-md transition-all px-1",
                isActive 
                  ? "text-primary bg-gradient-to-r " + getGradient(item.href, location)
                  : "text-muted-foreground"
              )}
            >
              <motion.div
                animate={isActive ? "active" : "inactive"}
                variants={iconVariants}
                className={cn(
                  "flex items-center justify-center p-1 rounded-full mb-1",
                  isActive ? "bg-primary/10 shadow-sm" : ""
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-primary dark:text-accent" : "text-muted-foreground dark:text-slate-400"
                )} />
              </motion.div>
              <AnimatePresence>
                <motion.span
                  className="text-xs font-medium"
                  initial={{ opacity: 0.7 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0.7,
                    fontWeight: isActive ? 600 : 400
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
              </AnimatePresence>
              {isActive && (
                <>
                  <motion.div
                    className="absolute bottom-0 left-[25%] right-[25%] h-0.5 bg-gradient-to-r from-accent via-primary to-accent rounded-t"
                    layoutId="navIndicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.div
                    className="absolute -top-1 left-[30%] right-[30%] h-[2px] bg-accent/40 rounded-b"
                    layoutId="navIndicatorTop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                  {/* Luxury corner accents for active item */}
                  <motion.div 
                    className="absolute bottom-3 left-1 w-1 h-1 border-l border-b border-accent/40"
                    layoutId="cornerBottomLeft"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                  <motion.div 
                    className="absolute bottom-3 right-1 w-1 h-1 border-r border-b border-accent/40"
                    layoutId="cornerBottomRight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                </>
              )}
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
});