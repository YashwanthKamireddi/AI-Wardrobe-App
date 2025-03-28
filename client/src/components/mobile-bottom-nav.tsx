import React, { memo } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

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
  { href: "/", label: "Home", icon: Home, gradient: "from-blue-500/10 to-purple-500/10" },
  { href: "/wardrobe", label: "Wardrobe", icon: ShoppingBag, gradient: "from-pink-500/10 to-orange-500/10" },
  { href: "/outfits", label: "Outfits", icon: ShoppingCart, gradient: "from-green-500/10 to-teal-500/10" },
  { href: "/inspirations", label: "Inspiration", icon: Image, gradient: "from-amber-500/10 to-pink-500/10" },
  { href: "/profile", label: "Profile", icon: User, gradient: "from-indigo-500/10 to-pink-500/10" },
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
      className="fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-sm border-t flex items-center justify-around z-50 px-1"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
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
              >
                <Icon className="h-5 w-5 mb-1" />
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
                <motion.div
                  className="absolute bottom-0 left-[25%] right-[25%] h-0.5 bg-primary rounded-t"
                  layoutId="navIndicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
});