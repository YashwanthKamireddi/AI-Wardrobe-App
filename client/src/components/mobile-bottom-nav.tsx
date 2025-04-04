/**
 * MobileBottomNav Component
 * 
 * A luxurious mobile navigation bar that appears at the bottom of the screen on small devices.
 * Provides elegant styling, animations, and navigation controls for a premium fashion application experience.
 * The component is only rendered on mobile devices and provides touch-friendly navigation controls.
 * 
 * @module MobileBottomNav
 * @component
 * 
 * Features:
 * - Luxury fashion styling with amber/gold color palette
 * - Animated navigation indicators with spring physics
 * - Active state transitions with sophisticated visual feedback
 * - Responsive design optimized for mobile interaction
 * - Tooltip guide system with descriptive labels
 * - Memory-optimized with React.memo and externalized constants
 * 
 * UI Elements:
 * - Translucent backdrop with subtle blur effect
 * - Gradient borders and decorative corner embellishments
 * - Animated indicator bars for the active route
 * - Icon-based navigation with subtle labels
 * - Touch-optimized hit targets for mobile finger operation
 * 
 * Performance Optimizations:
 * - Component is memoized to prevent unnecessary re-renders
 * - Animation variants defined outside the component
 * - Navigation items are pre-defined to avoid recreation
 * - Conditional rendering based on viewport size
 * 
 * @example
 * // Used in App.tsx or a layout component
 * <MobileBottomNav />
 */

import React, { memo, useState, useEffect } from "react";
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
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  { 
    href: "/", 
    label: "Atelier", 
    icon: Home, 
    gradient: "from-amber-400/30 via-amber-300/20 to-amber-400/30",
    description: "Your personalized style hub"
  },
  { 
    href: "/wardrobe", 
    label: "Collection", 
    icon: Shirt, 
    gradient: "from-amber-400/30 via-amber-300/20 to-amber-400/30",
    description: "Your curated clothing items"
  },
  { 
    href: "/outfits", 
    label: "Ensembles", 
    icon: Layers, 
    gradient: "from-amber-400/30 via-amber-300/20 to-amber-400/30",
    description: "Your signature looks"
  },
  { 
    href: "/inspirations", 
    label: "Runway", 
    icon: Sparkles, 
    gradient: "from-amber-400/30 via-amber-300/20 to-amber-400/30",
    description: "Fashion inspiration gallery"
  },
  { 
    href: "/profile", 
    label: "Boutique", 
    icon: User, 
    gradient: "from-amber-400/30 via-amber-300/20 to-amber-400/30",
    description: "Your personal style profile"
  },
];

// Get gradient for a path - moved outside component for better performance
const getGradient = (path: string, currentLocation: string): string => {
  if (currentLocation === path) {
    const item = navItems.find(item => item.href === path);
    return item?.gradient || "from-amber-400/80 via-amber-300/50 to-amber-400/80";
  }
  return "";
};

/**
 * MobileBottomNav Component Function
 * 
 * Mobile navigation component rendering a luxurious, touch-friendly navigation bar
 * at the bottom of the screen with animated indicators and visual feedback.
 * 
 * @function MobileBottomNav
 * @returns {JSX.Element|null} The rendered MobileBottomNav or null if not on mobile
 * 
 * State Management:
 * - Tracks current location to highlight active navigation item
 * - Controls tooltip visibility with delay to prevent unwanted popups
 * - Conditional rendering based on viewport detection
 * 
 * Visual Features:
 * - Luxury-themed with amber/gold gradients and decorative elements
 * - Active state transitions with spring animations
 * - Backdrop blur for depth and layering
 * - Mobile-optimized proportions and touch targets
 * 
 * Behavior Notes:
 * - Returns null when not on mobile device
 * - Uses setTimeout to delay tooltip availability until navigation is complete
 * - Dynamic gradient application based on active route
 * - Memory-optimized with React.memo to prevent unnecessary re-renders
 */
export const MobileBottomNav = memo(function MobileBottomNav() {
  // Check if current viewport is mobile
  const { isMobile } = useIsMobile();
  
  // Get current route location for active highlighting
  const [location] = useLocation();
  
  // Control tooltip visibility with delay
  const [showTooltips, setShowTooltips] = useState(false);
  
  // Only show tooltips after a delay to avoid them appearing during navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltips(true);
    }, 1000);
    
    // Cleanup timeout on unmount
    return () => clearTimeout(timer);
  }, []);
  
  if (!isMobile) return null;

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-background/90 to-background/98 backdrop-blur-md border-t border-amber-200/40 flex items-center justify-around z-50 px-1 shadow-lg pb-safe dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-900/98 dark:border-amber-700/30"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      {/* Luxury fashion-themed top decoration */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400/80 via-amber-200/50 to-amber-400/80 transform -translate-y-0.5"></div>
      
      {/* Left luxury corner decoration */}
      <div className="absolute top-0 left-0 w-6 h-6 border-l border-t border-amber-300/40 dark:border-amber-700/40 transform -translate-x-0.5 -translate-y-0.5"></div>
      
      {/* Right luxury corner decoration */}
      <div className="absolute top-0 right-0 w-6 h-6 border-r border-t border-amber-300/40 dark:border-amber-700/40 transform translate-x-0.5 -translate-y-0.5"></div>
      
      {/* Bottom luxury line decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400/30 via-amber-200/10 to-amber-400/30"></div>
      
      {/* Removed center logo decoration to save space */}
      
      <TooltipProvider>
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.href}
              variants={itemVariants}
              className="w-full"
            >
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link 
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center h-full w-full rounded-md transition-all px-1 font-luxury-heading",
                      isActive 
                        ? "text-amber-800 dark:text-amber-200 bg-gradient-to-r " + getGradient(item.href, location)
                        : "text-muted-foreground"
                    )}
                  >
                    <motion.div
                      animate={isActive ? "active" : "inactive"}
                      variants={iconVariants}
                      className={cn(
                        "flex items-center justify-center p-1.5 rounded-full mb-1 relative",
                        isActive 
                          ? "bg-gradient-to-r from-amber-100/60 to-amber-200/40 shadow-md border border-amber-200/30 dark:from-amber-900/40 dark:to-amber-800/30 dark:border-amber-700/30" 
                          : "hover:bg-amber-50/20 dark:hover:bg-amber-900/10"
                      )}
                    >
                      {isActive && (
                        <motion.div 
                          className="absolute inset-0 rounded-full animate-luxury-shimmer opacity-30"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.3 }}
                        />
                      )}
                      <Icon className={cn(
                        "h-5 w-5",
                        isActive ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground dark:text-slate-400"
                      )} />
                    </motion.div>
                    <AnimatePresence>
                      <motion.span
                        className={cn(
                          "text-xs font-luxury-heading tracking-wide relative",
                          isActive ? "text-amber-800 dark:text-amber-200" : "text-slate-600 dark:text-slate-400"
                        )}
                        initial={{ opacity: 0.7 }}
                        animate={{ 
                          opacity: isActive ? 1 : 0.7,
                          fontWeight: isActive ? 600 : 400,
                          letterSpacing: isActive ? "0.05em" : "0.03em"
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                        {isActive && (
                          <motion.span 
                            className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            exit={{ scaleX: 0 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </motion.span>
                    </AnimatePresence>
                    {isActive && (
                      <>
                        <motion.div
                          className="absolute bottom-0 left-[25%] right-[25%] h-0.5 bg-gradient-to-r from-amber-400/80 via-amber-200/50 to-amber-400/80 rounded-t"
                          layoutId="navIndicator"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                        <motion.div
                          className="absolute -top-1 left-[30%] right-[30%] h-[2px] bg-amber-200/40 rounded-b"
                          layoutId="navIndicatorTop"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                        {/* Luxury corner accents for active item */}
                        <motion.div 
                          className="absolute bottom-3 left-1 w-1 h-1 border-l border-b border-amber-200/40"
                          layoutId="cornerBottomLeft"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                        <motion.div 
                          className="absolute bottom-3 right-1 w-1 h-1 border-r border-b border-amber-200/40"
                          layoutId="cornerBottomRight"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      </>
                    )}
                  </Link>
                </TooltipTrigger>
                {showTooltips && (
                  <TooltipContent 
                    side="top" 
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-amber-200/40 dark:border-amber-800/40 shadow-lg px-3 py-1.5 rounded-md"
                  >
                    <div className="flex flex-col">
                      <span className="text-amber-800 dark:text-amber-200 text-xs font-semibold mb-0.5 font-luxury-heading">{item.label}</span>
                      <span className="text-slate-600 dark:text-slate-300 text-[10px] italic font-luxury-serif">{item.description}</span>
                    </div>
                    {/* Tooltip decorations */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-200/40 dark:border-amber-700/40"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-200/40 dark:border-amber-700/40"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-200/40 dark:border-amber-700/40"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-200/40 dark:border-amber-700/40"></div>
                  </TooltipContent>
                )}
              </Tooltip>
            </motion.div>
          );
        })}
      </TooltipProvider>
    </motion.div>
  );
});