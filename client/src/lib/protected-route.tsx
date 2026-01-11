import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";
import { useEffect } from "react";

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
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gradient-to-tr from-white/90 via-white/95 to-white/90">
          <div className="animate-fade-in">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground mt-4 text-sm font-medium animate-fade-in">
            Loading your fashion experience...
          </p>
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gradient-to-tr from-white/90 via-white/95 to-white/90">
          <div className="animate-fade-in">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground mt-4 text-sm font-medium animate-fade-in">
            Redirecting to login...
          </p>
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
