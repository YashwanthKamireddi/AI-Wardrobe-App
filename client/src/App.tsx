import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import WardrobePage from "@/pages/wardrobe-page";
import OutfitPage from "@/pages/outfit-page";
import InspirationPage from "@/pages/inspiration-page";
import ProfilePage from "@/pages/profile-page";
import NotFound from "@/pages/not-found";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/wardrobe" component={WardrobePage} />
      <ProtectedRoute path="/outfits" component={OutfitPage} />
      <ProtectedRoute path="/inspirations" component={InspirationPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <MobileBottomNav />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;