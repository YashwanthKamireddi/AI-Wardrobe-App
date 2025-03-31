import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";
import { useEffect } from "react";
import { motion } from "framer-motion";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect effect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      const timer = setTimeout(() => setLocation("/auth"), 50);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gradient-to-tr from-white/90 via-white/95 to-white/90 dark:from-black/90 dark:via-black/95 dark:to-black/90">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </motion.div>
          <motion.p 
            className="text-muted-foreground mt-4 text-sm font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Loading your fashion experience...
          </motion.p>
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gradient-to-tr from-white/90 via-white/95 to-white/90 dark:from-black/90 dark:via-black/95 dark:to-black/90">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </motion.div>
          <motion.p 
            className="text-muted-foreground mt-4 text-sm font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Redirecting to login...
          </motion.p>
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
