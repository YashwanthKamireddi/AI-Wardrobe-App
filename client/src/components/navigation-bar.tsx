/**
 * NavigationBar Component
 * 
 * A luxury-styled navigation bar for Cher's Closet fashion application that provides site-wide
 * navigation, theme toggling, and user authentication controls.
 * 
 * @module NavigationBar
 * @component
 * 
 * Features:
 * - Responsive design that adapts to mobile, tablet, and desktop viewports
 * - Framer Motion animations for seamless transitions and interactive elements
 * - Dynamic active state indication with animated underlines and dot indicators
 * - Luxury fashion-inspired styling with amber/gold accents and decorative elements
 * - Dark/light theme toggle with animated icon transitions
 * - Tooltip-enhanced navigation with descriptive labels
 * 
 * UI Elements:
 * - Gradient borders and corner decorations for luxury aesthetic
 * - Amber/gold color palette with appropriate dark mode variations
 * - Animated hover states and interactive feedback
 * - Proper accessibility attributes and keyboard navigation
 * 
 * Dependencies:
 * - React and standard hooks (useState, useEffect)
 * - Wouter for routing (Link, useLocation)
 * - Framer Motion for animations
 * - Lucide React for iconography
 * - Custom hooks: useAuth, useTheme
 * - Shadcn UI components: Button, Tooltip system
 * 
 * @example
 * // Used in App.tsx or a layout component
 * <NavigationBar />
 */

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { 
  Sun, 
  Moon, 
  Home, 
  Shirt, 
  Sparkles, 
  User, 
  LogOut,
  Layers,
  Palette,
  Scissors,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FashionLogo } from "@/components/ui/fashion-logo";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Animation variants
const navVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
      when: "beforeChildren"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20
    }
  }
};

const iconVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.1,
    rotate: [0, -5, 0, 5, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

const logoVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: {
      repeat: Infinity,
      repeatType: "reverse" as const,
      duration: 1.2
    }
  }
};

/**
 * NavigationBar Component Function
 * 
 * Primary navigation component that provides the main navigation interface for the application.
 * Features a luxury fashion aesthetic with amber/gold styling, animated transitions,
 * and responsive design for all device sizes.
 * 
 * @function NavigationBar
 * @returns {JSX.Element} The rendered NavigationBar component with animated navigation links,
 *                        theme toggle, and user authentication controls
 * 
 * State Management:
 * - Uses location from wouter for active route highlighting
 * - Manages tooltip visibility with delay to prevent flash during navigation
 * - Handles theme toggling between light and dark modes
 * - Controls user authentication status display
 * 
 * Animation Features:
 * - Entry animations with staggered children
 * - Hover animations for interactive elements
 * - Active state transitions with underlines and indicator dots
 * - Theme toggle icon animations
 * 
 * Styling Features:
 * - Luxury fashion aesthetic with amber/gold gradient accents
 * - Decorative corner elements and border treatments
 * - Consistent styling across light and dark themes
 * - Tooltip enhancements with descriptive labels
 */
const NavigationBar: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const [showTooltips, setShowTooltips] = useState(false);
  
  // Only show tooltips after a delay to avoid them appearing during navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltips(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { 
      path: "/", 
      icon: <Home className="h-5 w-5" />, 
      label: "Atelier",
      description: "Your personalized style hub" 
    },
    { 
      path: "/wardrobe", 
      icon: <Shirt className="h-5 w-5" />, 
      label: "Collection",
      description: "Your curated clothing items" 
    },
    { 
      path: "/outfits", 
      icon: <Layers className="h-5 w-5" />, 
      label: "Ensembles",
      description: "Your signature looks" 
    },
    { 
      path: "/inspirations", 
      icon: <Sparkles className="h-5 w-5" />, 
      label: "Runway",
      description: "Fashion inspiration gallery" 
    },
    { 
      path: "/profile", 
      icon: <User className="h-5 w-5" />, 
      label: "Boutique",
      description: "Your personal style profile" 
    },
  ];

  const getGradient = (path: string) => {
    if (location === path) {
      // Use the luxury gold palette for all items for consistency
      return "from-amber-400/80 via-amber-300/50 to-amber-400/80";
    }
    return "from-muted to-muted";
  };

  const themeIcon = theme === "dark" ? (
    <motion.div
      key="sun-icon"
      initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      exit={{ scale: 0.5, rotate: 30, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Sun className="h-5 w-5" />
    </motion.div>
  ) : (
    <motion.div
      key="moon-icon"
      initial={{ scale: 0.5, rotate: 30, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      exit={{ scale: 0.5, rotate: -30, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Moon className="h-5 w-5" />
    </motion.div>
  );

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b border-amber-200/30 bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md dark:border-amber-700/30 dark:bg-slate-900/98"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      {/* Luxury fashion bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400/80 via-amber-200/50 to-amber-400/80 transform translate-y-0.5"></div>
      
      {/* Left luxury corner decoration */}
      <div className="absolute bottom-0 left-0 w-6 h-6 border-l border-b border-amber-300/30 dark:border-amber-700/30"></div>
      
      {/* Right luxury corner decoration */}
      <div className="absolute bottom-0 right-0 w-6 h-6 border-r border-b border-amber-300/30 dark:border-amber-700/30"></div>
      
      {/* Top luxury line decoration */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400/30 via-amber-200/10 to-amber-400/30"></div>
      
      <div className="container flex h-16 items-center justify-between py-4">
        <motion.div 
          className="flex items-center gap-2"
          variants={itemVariants}
          whileHover="hover"
          initial="initial"
        >
          <Link href="/">
            <motion.div variants={logoVariants}>
              <FashionLogo size="md" className="hidden lg:flex" />
              <FashionLogo size="md" compact={true} className="hidden sm:flex lg:hidden" />
              <FashionLogo size="sm" compact={true} className="sm:hidden" />
            </motion.div>
          </Link>
        </motion.div>

        <motion.nav 
          className="hidden md:flex items-center gap-1"
          variants={navVariants}
        >
          <TooltipProvider>
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <motion.div 
                  key={item.path} 
                  className="relative"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "px-3 flex items-center gap-2 relative font-luxury-heading tracking-wide",
                          isActive 
                            ? "text-amber-800 font-medium bg-gradient-to-r from-amber-50/50 to-amber-100/30 shadow-sm border border-amber-200/40 dark:border-amber-400/20 dark:bg-gradient-to-r dark:from-amber-900/20 dark:to-amber-800/10 dark:text-amber-200" 
                            : "text-muted-foreground hover:bg-gradient-to-r hover:from-amber-50/20 hover:to-amber-100/10 hover:border hover:border-amber-200/20 dark:hover:border-amber-400/10 dark:hover:bg-gradient-to-r dark:hover:from-amber-900/10 dark:hover:to-amber-800/5 dark:text-slate-300"
                        )}
                        asChild
                      >
                        <Link href={item.path}>
                          <motion.span 
                            variants={iconVariants}
                            whileHover="hover"
                            initial="initial"
                            className="text-amber-700 dark:text-amber-300 relative"
                          >
                            {item.icon}
                            {isActive && (
                              <motion.span 
                                className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-luxury-shimmer"
                                layoutId="nav-active-dot"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ duration: 0.3 }}
                              />
                            )}
                          </motion.span>
                          <span className="tracking-wide relative">
                            {item.label}
                            {isActive && (
                              <motion.span 
                                className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                              />
                            )}
                          </span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    {showTooltips && (
                      <TooltipContent 
                        side="bottom" 
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
                  <AnimatePresence>
                    {isActive && (
                      <>
                        <motion.div
                          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${getGradient(item.path)} rounded-t-lg`}
                          layoutId="nav-underline"
                          initial={{ opacity: 0, width: "0%" }}
                          animate={{ opacity: 1, width: "100%" }}
                          exit={{ opacity: 0, width: "0%" }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 25,
                            duration: 0.2
                          }}
                        />
                      </>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </TooltipProvider>
        </motion.nav>

        <motion.div 
          className="flex items-center gap-2"
          variants={itemVariants}
        >
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    aria-label="Toggle theme"
                    className="border border-amber-200/40 bg-gradient-to-r from-amber-50/40 to-amber-100/20 shadow-sm dark:border-amber-700/30 dark:bg-gradient-to-r dark:from-amber-900/20 dark:to-amber-800/10 dark:text-amber-200 hover:from-amber-50/60 hover:to-amber-100/30 dark:hover:from-amber-900/30 dark:hover:to-amber-800/20"
                  >
                    <AnimatePresence mode="wait">
                      {themeIcon}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              {showTooltips && (
                <TooltipContent 
                  side="bottom" 
                  className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-amber-200/40 dark:border-amber-800/40 shadow-lg px-3 py-1.5 rounded-md"
                >
                  <div className="flex flex-col">
                    <span className="text-amber-800 dark:text-amber-200 text-xs font-semibold mb-0.5 font-luxury-heading">
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 text-[10px] italic font-luxury-serif">
                      Switch to {theme === "dark" ? "light" : "dark"} theme
                    </span>
                  </div>
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-200/40 dark:border-amber-700/40"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-200/40 dark:border-amber-700/40"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-200/40 dark:border-amber-700/40"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-200/40 dark:border-amber-700/40"></div>
                </TooltipContent>
              )}
            </Tooltip>

            {user && (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => logoutMutation.mutate()}
                      aria-label="Logout"
                      className="border border-amber-200/40 bg-gradient-to-r from-amber-50/40 to-amber-100/20 shadow-sm dark:border-amber-700/30 dark:bg-gradient-to-r dark:from-amber-900/20 dark:to-amber-800/10 dark:text-amber-200 hover:from-amber-50/60 hover:to-amber-100/30 dark:hover:from-amber-900/30 dark:hover:to-amber-800/20"
                    >
                      <LogOut className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                {showTooltips && (
                  <TooltipContent 
                    side="bottom" 
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-amber-200/40 dark:border-amber-800/40 shadow-lg px-3 py-1.5 rounded-md"
                  >
                    <div className="flex flex-col">
                      <span className="text-amber-800 dark:text-amber-200 text-xs font-semibold mb-0.5 font-luxury-heading">Sign Out</span>
                      <span className="text-slate-600 dark:text-slate-300 text-[10px] italic font-luxury-serif">Exit your account</span>
                    </div>
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-200/40 dark:border-amber-700/40"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-200/40 dark:border-amber-700/40"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-200/40 dark:border-amber-700/40"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-200/40 dark:border-amber-700/40"></div>
                  </TooltipContent>
                )}
              </Tooltip>
            )}
          </TooltipProvider>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default NavigationBar;