import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, User, Home, Shirt, Palette, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("/"); // Set default active tab

  useEffect(() => {
    setMounted(true);
    // Update active tab based on current path
    setActiveTab(window.location.pathname);
  }, []);

  const navItems = [
    { icon: Home, name: "Home", path: "/" },
    { icon: Shirt, name: "Wardrobe", path: "/wardrobe" },
    { icon: Palette, name: "Outfits", path: "/outfits" },
    { icon: UserCircle, name: "Profile", path: "/profile" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold text-xl sm:inline-block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mood Wardrobe
            </span>
          </Link>
          <nav className="flex items-center space-x-1 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeTab === item.path;
              return (
                <Link 
                  key={item.path}
                  href={item.path} 
                  onClick={() => setActiveTab(item.path)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-all hover:text-primary",
                    isActive 
                      ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-primary font-medium" 
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 mr-2",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {mounted && (
            <div className="flex items-center mr-2">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Switch 
                id="theme-toggle"
                className="mx-2"
                checked={theme === "dark"}
                onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              />
              <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </div>
          )}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavigationBar;