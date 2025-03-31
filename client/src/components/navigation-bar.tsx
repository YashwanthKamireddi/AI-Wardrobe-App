import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { 
  Sun, 
  Moon, 
  Home, 
  Shirt, 
  CloudSun, 
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

const NavigationBar: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  const navItems = [
    { 
      path: "/", 
      icon: <Home className="h-5 w-5" />, 
      label: "Home" 
    },
    { 
      path: "/wardrobe", 
      icon: <Shirt className="h-5 w-5" />, 
      label: "Wardrobe" 
    },
    { 
      path: "/outfits", 
      icon: <Layers className="h-5 w-5" />, 
      label: "Outfits" 
    },
    { 
      path: "/inspirations", 
      icon: <Sparkles className="h-5 w-5" />, 
      label: "Inspiration" 
    },
    { 
      path: "/profile", 
      icon: <User className="h-5 w-5" />, 
      label: "Profile" 
    },
  ];

  const getGradient = (path: string) => {
    if (location === path) {
      switch (path) {
        case "/":
          return "from-blue-500 to-purple-500";
        case "/wardrobe":
          return "from-pink-500 to-orange-500";
        case "/weather":
          return "from-sky-500 to-emerald-500";
        case "/inspirations":
          return "from-amber-500 to-pink-500";
        case "/profile":
          return "from-indigo-500 to-pink-500";
        case "/outfits":
          return "from-green-500 to-teal-500";
        default:
          return "from-primary to-secondary";
      }
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
      className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      {/* Fashion-themed bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/80 via-pink-500/80 to-primary/80 transform translate-y-0.5"></div>
      <div className="container flex h-16 items-center justify-between py-4">
        <motion.div 
          className="flex items-center gap-2"
          variants={itemVariants}
          whileHover="hover"
          initial="initial"
        >
          <Link href="/">
            <motion.div variants={logoVariants}>
              <FashionLogo size="md" className="hidden sm:flex" />
              <FashionLogo size="sm" className="sm:hidden" />
            </motion.div>
          </Link>
        </motion.div>

        <motion.nav 
          className="hidden md:flex items-center gap-1"
          variants={navVariants}
        >
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <motion.div 
                key={item.path} 
                className="relative"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "px-3 flex items-center gap-2 relative",
                    isActive 
                      ? "text-primary font-medium bg-primary/10 shadow-sm border border-primary/20 dark:border-accent/30 dark:bg-accent/10 dark:text-accent-foreground" 
                      : "text-muted-foreground hover:bg-background hover:border hover:border-primary/10 dark:hover:border-accent/20 dark:hover:bg-accent/5 dark:text-slate-300"
                  )}
                  asChild
                >
                  <Link href={item.path}>
                    <motion.span 
                      variants={iconVariants}
                      whileHover="hover"
                      initial="initial"
                    >
                      {item.icon}
                    </motion.span>
                    <span>{item.label}</span>
                  </Link>
                </Button>
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
                      {/* Removed decorative dots as requested */}
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.nav>

        <motion.div 
          className="flex items-center gap-2"
          variants={itemVariants}
        >
          <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="border border-primary/10 bg-primary/5 shadow-sm dark:border-accent/30 dark:bg-accent/10 dark:text-accent-foreground hover:bg-primary/10 dark:hover:bg-accent/20"
            >
              <AnimatePresence mode="wait">
                {themeIcon}
              </AnimatePresence>
            </Button>
          </motion.div>

          {user && (
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logoutMutation.mutate()}
                aria-label="Logout"
                className="border border-primary/10 bg-primary/5 shadow-sm dark:border-accent/30 dark:bg-accent/10 dark:text-accent-foreground hover:bg-primary/10 dark:hover:bg-accent/20"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
};

export default NavigationBar;