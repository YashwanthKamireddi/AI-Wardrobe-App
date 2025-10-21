/**
 * NavigationBar Component
 * 
 * A luxury-styled navigation bar for Cher's Closet fashion application with amber/gold theme.
 * Features responsive design with hamburger menu on mobile and clean desktop navigation.
 * 
 * @module NavigationBar
 * @component
 * 
 * Features:
 * - Rich amber/gold gradient background with luxury aesthetic
 * - Responsive hamburger menu for mobile devices
 * - Clean three-section layout: Logo | Navigation | Actions
 * - Smooth animations and transitions
 * - Professional spacing and typography
 * - Touch-friendly mobile interactions
 * 
 * Dependencies:
 * - React and hooks
 * - Wouter for routing
 * - Framer Motion for animations
 * - Lucide React for icons
 * - Radix UI Sheet for mobile menu
 * - Custom hooks: useAuth, useIsMobile
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Shirt, 
  Sparkles, 
  User, 
  LogOut,
  Layers,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FashionLogo } from "@/components/ui/fashion-logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const navItems = [
  { 
    path: "/", 
    icon: Home, 
    label: "Atelier",
    description: "Your style hub" 
  },
  { 
    path: "/wardrobe", 
    icon: Shirt, 
    label: "Collection",
    description: "Your wardrobe" 
  },
  { 
    path: "/outfits", 
    icon: Layers, 
    label: "Ensembles",
    description: "Your looks" 
  },
  { 
    path: "/inspirations", 
    icon: Sparkles, 
    label: "Runway",
    description: "Inspiration" 
  },
  { 
    path: "/profile", 
    icon: User, 
    label: "Boutique",
    description: "Your profile" 
  },
];

/**
 * NavigationBar Component
 * 
 * Main navigation bar with luxury amber/gold theme and responsive design
 */
const NavigationBar = () => {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const { isMobile } = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header 
        className="sticky top-0 z-50 w-full bg-gradient-to-r from-amber-50 via-amber-100/80 to-amber-50 backdrop-blur-sm border-b border-amber-200/60 shadow-md"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.6 
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
        
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo/Brand */}
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Link href="/" data-testid="link-home-logo">
                <div className="flex items-center gap-2">
                  <FashionLogo size="md" className="hidden lg:flex" />
                  <FashionLogo size="sm" compact={true} className="lg:hidden" />
                </div>
              </Link>
            </motion.div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location === item.path;
                const Icon = item.icon;
                
                return (
                  <motion.div
                    key={item.path}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "relative px-4 py-2 flex items-center gap-2 font-fashion-heading tracking-wide transition-all duration-300",
                        isActive 
                          ? "text-amber-900 bg-white/60 shadow-sm border border-amber-300/50" 
                          : "text-amber-800/70 hover:text-amber-900 hover:bg-white/40 hover:shadow-sm"
                      )}
                      asChild
                      data-testid={`link-${item.label.toLowerCase()}`}
                    >
                      <Link href={item.path}>
                        <Icon className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-amber-700" : "text-amber-600"
                        )} />
                        <span className="text-sm">{item.label}</span>
                        
                        {isActive && (
                          <motion.div
                            className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-full"
                            layoutId="navbar-indicator"
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 500, 
                              damping: 30 
                            }}
                          />
                        )}
                      </Link>
                    </Button>
                  </motion.div>
                );
              })}
            </nav>

            {/* Right: User Actions */}
            <div className="flex items-center gap-2">
              {user && (
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => logoutMutation.mutate()}
                    className="border border-amber-300/50 bg-white/40 hover:bg-white/60 hover:border-amber-400/60 hover:shadow-md transition-all duration-300 group"
                    aria-label="Logout"
                    data-testid="button-logout"
                  >
                    <LogOut className="h-5 w-5 text-amber-700 group-hover:text-amber-800 transition-colors" />
                  </Button>
                </motion.div>
              )}

              {/* Mobile Menu Button */}
              {isMobile && (
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="md:hidden"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(true)}
                    className="border border-amber-300/50 bg-white/40 hover:bg-white/60 hover:border-amber-400/60 hover:shadow-md transition-all duration-300"
                    aria-label="Open menu"
                    data-testid="button-menu"
                  >
                    <Menu className="h-5 w-5 text-amber-700" />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
      </motion.header>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent 
          side="left" 
          className="w-[280px] bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border-r border-amber-200/60"
        >
          <SheetHeader className="border-b border-amber-200/40 pb-4 mb-6">
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FashionLogo size="sm" compact={true} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 hover:bg-amber-100/50"
                data-testid="button-close-menu"
              >
                <X className="h-4 w-4 text-amber-700" />
              </Button>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <motion.div
                  key={item.path}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-12 px-4 font-fashion-heading transition-all duration-300",
                      isActive 
                        ? "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-900 border border-amber-300/50 shadow-sm" 
                        : "text-amber-800/80 hover:bg-amber-50/50 hover:text-amber-900"
                    )}
                    asChild
                    onClick={handleNavClick}
                    data-testid={`link-mobile-${item.label.toLowerCase()}`}
                  >
                    <Link href={item.path}>
                      <Icon className={cn(
                        "h-5 w-5",
                        isActive ? "text-amber-700" : "text-amber-600"
                      )} />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-xs text-amber-700/60 font-light">
                          {item.description}
                        </span>
                      </div>
                      
                      {isActive && (
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-400 rounded-r-full"
                          layoutId="mobile-nav-indicator"
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 500, 
                            damping: 30 
                          }}
                        />
                      )}
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </nav>

          {/* Mobile Menu Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-amber-200/40 bg-gradient-to-t from-amber-50/80 to-transparent">
            <div className="flex items-center justify-center gap-2 text-xs text-amber-700/60 font-fashion-heading">
              <Sparkles className="h-3 w-3" />
              <span>Cher's Closet</span>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default NavigationBar;
