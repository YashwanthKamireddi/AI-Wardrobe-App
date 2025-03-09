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
  Layers
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NavigationBar: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: <Home className="h-5 w-5" />, label: "Home" },
    { path: "/wardrobe", icon: <Shirt className="h-5 w-5" />, label: "Wardrobe" },
    { path: "/outfits", icon: <Layers className="h-5 w-5" />, label: "Outfits" }, // Added Outfits section
    { path: "/inspirations", icon: <Sparkles className="h-5 w-5" />, label: "Inspirations" },
    { path: "/profile", icon: <User className="h-5 w-5" />, label: "Profile" },
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
        case "/outfits": // Added case for Outfits
          return "from-green-500 to-teal-500"; // Added gradient for Outfits
        default:
          return "from-primary to-secondary";
      }
    }
    return "from-muted to-muted";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent flex items-center">
              <span className="hidden sm:inline">Cher's Closet</span>
              <span className="sm:hidden">CC</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <div key={item.path} className="relative">
                <Link href={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "px-3 flex items-center gap-2 relative",
                      isActive ? "text-primary font-medium" : "text-muted-foreground"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Button>
                </Link>
                {isActive && (
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${getGradient(item.path)} rounded-t-lg`}
                    layoutId="nav-underline"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 25,
                      duration: 0.2
                    }}
                  />
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logoutMutation.mutate()}
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}

          <div className="block md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {/* Toggle mobile menu */}}
              aria-label="Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationBar;