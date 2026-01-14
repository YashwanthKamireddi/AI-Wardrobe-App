import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Brand colors
const burgundy = "hsl(337, 73%, 26%)";
const gold = "hsl(38, 75%, 55%)";

const navItems = [
  { path: "/home", label: "Home" },
  { path: "/wardrobe", label: "Wardrobe" },
  { path: "/outfits", label: "Outfits" },
  { path: "/style-essence", label: "Style" },
  { path: "/calendar", label: "Calendar" },
  { path: "/statistics", label: "Analytics" },
  { path: "/profile", label: "Profile" },
];

const NavigationBar = () => {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/home">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${burgundy} 0%, hsl(337, 73%, 20%) 100%)` }}
                >
                  <span className="font-serif text-lg font-semibold" style={{ color: gold }}>C</span>
                </div>
                <div className="hidden sm:block">
                  <span className="font-serif text-xl tracking-wide text-slate-900">Celura</span>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400">Luxury AI Wardrobe</p>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <span
                      className={cn(
                        "relative px-4 py-2 text-sm tracking-wide transition-all cursor-pointer rounded-full",
                        isActive
                          ? "font-medium"
                          : "text-slate-500 hover:text-slate-900"
                      )}
                      style={isActive ? { color: burgundy, background: `${burgundy}08` } : {}}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logoutMutation.mutate()}
                  className="text-slate-500 hover:text-slate-900 hover:bg-slate-50 hidden sm:flex rounded-full px-4"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="fixed top-16 left-4 right-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-xl">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <span
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "block py-3 px-4 text-sm cursor-pointer rounded-xl transition-all",
                        isActive
                          ? "font-medium"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      )}
                      style={isActive ? { color: burgundy, background: `${burgundy}08` } : {}}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}

              {user && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      logoutMutation.mutate();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 py-3 px-4 text-sm text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default NavigationBar;
