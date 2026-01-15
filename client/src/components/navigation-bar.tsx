import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Original luxury palette
const burgundy = "#80163a";
const gold = "#D4A54A";
const cream = "#faf9f7";

const navItems = [
  { path: "/home", label: "Home" },
  { path: "/wardrobe", label: "Closet" },
  { path: "/compose", label: "Create" },
  { path: "/calendar", label: "Calendar" },
  { path: "/profile", label: "Profile" },
];

const NavigationBar = () => {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/home">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${burgundy} 0%, #9b1b4a 100%)`,
                  }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-serif text-xl tracking-tight text-slate-900">Celura</span>
                  <p className="text-[9px] tracking-widest uppercase text-slate-500">Style AI</p>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-slate-100/80">
              {navItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <motion.span
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative px-4 py-2 text-sm transition-all cursor-pointer rounded-full font-medium",
                        isActive
                          ? "text-white"
                          : "text-slate-600 hover:text-slate-900"
                      )}
                      style={isActive ? {
                        background: burgundy,
                      } : {}}
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {user && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => logoutMutation.mutate()}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </motion.button>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-slate-100 text-slate-700 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-20 left-4 right-4 rounded-2xl p-4 shadow-xl bg-white border border-slate-200"
            >
              <div className="space-y-1">
                {navItems.map((item, index) => {
                  const isActive = location === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "block py-3 px-4 text-sm cursor-pointer rounded-xl transition-all font-medium",
                          isActive
                            ? "text-white"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        )}
                        style={isActive ? { background: burgundy } : {}}
                      >
                        {item.label}
                      </motion.span>
                    </Link>
                  );
                })}

                {user && (
                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        logoutMutation.mutate();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 py-3 px-4 text-sm text-red-600 hover:text-red-700 rounded-xl hover:bg-red-50 transition-all w-full font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavigationBar;
