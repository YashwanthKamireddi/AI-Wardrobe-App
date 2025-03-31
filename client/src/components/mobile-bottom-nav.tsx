import React, { memo, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Shirt,
  Layers,
  Sparkles,
  User,
  ChevronsUp,
  ChevronsDown,
  Search,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { FashionLogo } from "@/components/ui/fashion-logo";

// Animation variants
const drawerVariants = {
  closed: { 
    height: "64px", 
    boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)"
  },
  open: { 
    height: "240px", 
    boxShadow: "0 -5px 25px rgba(0, 0, 0, 0.15)"
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { 
      delay: i * 0.05,
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  })
};

// Redesigned navigation items with fashion-focused icons and labels
const navItems = [
  { href: "/", label: "Home", icon: Home, color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt, color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-200" },
  { href: "/outfits", label: "Looks", icon: Layers, color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200" },
  { href: "/inspirations", label: "Discover", icon: Sparkles, color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200" },
  { href: "/profile", label: "Profile", icon: User, color: "text-indigo-600", bgColor: "bg-indigo-50 border-indigo-200" },
];

// Actions for the expanded drawer
const drawerActions = [
  { label: "Search", icon: Search, color: "text-slate-600", bgColor: "bg-slate-50 border-slate-200" },
  { label: "Add New", icon: Plus, color: "text-rose-600", bgColor: "bg-rose-50 border-rose-200" },
];

// Using React.memo to prevent unnecessary re-renders
export const MobileBottomNav = memo(function MobileBottomNav() {
  const { isMobile } = useIsMobile();
  const [location] = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Close drawer when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      if (currentScrollPos > scrollPosition + 10) {
        setIsDrawerOpen(false);
      }
      setScrollPosition(currentScrollPos);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollPosition]);
  
  // Also close drawer when location changes
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location]);
  
  if (!isMobile) return null;

  return (
    <>
      {/* Drawer overlay - shows when drawer is open */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
          />
        )}
      </AnimatePresence>
    
      {/* Main drawer container */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex flex-col overflow-hidden z-50"
        variants={drawerVariants}
        initial="closed"
        animate={isDrawerOpen ? "open" : "closed"}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Drawer handle with shadow gradient to mimic a handle */}
        <div 
          className="w-full h-7 flex items-center justify-center cursor-pointer touch-manipulation"
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        >
          <div className="w-12 h-1 bg-neutral-200 rounded-full mb-1"></div>
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: isDrawerOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            {isDrawerOpen ? <ChevronsDown className="h-4 w-4 text-neutral-400" /> : <ChevronsUp className="h-4 w-4 text-neutral-400" />}
          </motion.div>
        </div>
        
        {/* Main navigation row */}
        <div className="flex items-center justify-around px-2 h-14">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center flex-col h-full"
                )}
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    "border shadow-sm",
                    isActive ? item.bgColor : "bg-white border-neutral-200"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5",
                    isActive ? item.color : "text-neutral-500"
                  )} />
                </motion.div>
                <span className={cn(
                  "text-[10px] mt-1 font-medium",
                  isActive ? "text-neutral-800" : "text-neutral-500"
                )}>
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    className={cn(
                      "absolute bottom-1 h-1 w-5 rounded-full",
                      item.color.replace("text", "bg")
                    )}
                    layoutId="navIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
        
        {/* Expanded drawer content */}
        <AnimatePresence>
          {isDrawerOpen && (
            <motion.div
              className="px-4 pt-4 pb-8 border-t border-neutral-100"
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Recent outfits section */}
              <div className="mb-6">
                <h3 className="text-xs uppercase font-semibold text-neutral-500 mb-3">Quick Access</h3>
                <div className="grid grid-cols-5 gap-3">
                  {navItems.map((item, i) => (
                    <motion.div
                      key={`quick-${i}`}
                      custom={i}
                      variants={itemVariants}
                      className="flex flex-col items-center"
                    >
                      <Link href={item.href}>
                        <motion.div
                          whileHover={{ 
                            y: -2, 
                            scale: 1.1,
                            transition: { duration: 0.2 }
                          }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center",
                            "shadow-sm border-2",
                            location === item.href ? item.bgColor : "bg-white border-neutral-100"
                          )}
                        >
                          <item.icon 
                            className={cn(
                              "h-6 w-6",
                              item.color
                            )} 
                          />
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Actions section */}
              <div>
                <h3 className="text-xs uppercase font-semibold text-neutral-500 mb-3">Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {drawerActions.map((action, i) => (
                    <motion.div
                      key={`action-${i}`}
                      custom={i + 5} // Continue staggering from the quick access items
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer",
                        "border shadow-sm",
                        action.bgColor
                      )}
                    >
                      <action.icon className={cn("h-5 w-5", action.color)} />
                      <span className="text-sm font-medium">{action.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
});