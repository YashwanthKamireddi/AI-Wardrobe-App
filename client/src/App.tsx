import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";

import { LandingPage } from "@/pages/landing-page-new";
import { HomePage } from "@/pages/home-page";
import { AuthPage } from "@/pages/auth-page";
import { WardrobePage } from "@/pages/wardrobe-page";
import { OutfitPage } from "@/pages/outfit-page";
import { InspirationPage } from "@/pages/inspiration-page";
import { ProfilePage } from "@/pages/profile-page";
import { CalendarPage } from "@/pages/calendar-page";
import { StatisticsPage } from "@/pages/statistics-page";
import { StyleEssencePage } from "@/pages/style-essence-page";
import { NotFound } from "@/pages/not-found";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />

      {/* Protected routes */}
      <ProtectedRoute path="/home" component={HomePage} />
      <ProtectedRoute path="/wardrobe" component={WardrobePage} />
      <ProtectedRoute path="/outfits" component={OutfitPage} />
      <ProtectedRoute path="/inspirations" component={InspirationPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/calendar" component={CalendarPage} />
      <ProtectedRoute path="/statistics" component={StatisticsPage} />
      <ProtectedRoute path="/style-essence" component={StyleEssencePage} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Setting default values in localStorage to bypass tutorial/onboarding
    localStorage.setItem("onboardingComplete", "true");
    localStorage.setItem("tutorialComplete", "true");
  }, []);

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
