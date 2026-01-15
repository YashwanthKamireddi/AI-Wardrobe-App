import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";
import { SharedElementProvider, AnimatedPage } from "@/components/ui/shared-transitions";

import { LandingPage } from "@/pages/landing-page-editorial";
import { HomePage } from "@/pages/home-page-complete";
import { AuthPage } from "@/pages/auth-page-editorial";
import { WardrobePage } from "@/pages/wardrobe-page-editorial";
import { OutfitPage } from "@/pages/outfit-page-editorial";
import { InspirationPage } from "@/pages/inspiration-page-editorial";
import { ProfilePage } from "@/pages/profile-page-editorial";
import { CalendarPage } from "@/pages/calendar-page-editorial";
import { StatisticsPage } from "@/pages/statistics-page-editorial";
import { StyleEssencePage } from "@/pages/style-essence-page-editorial";
import { ComposePage } from "@/pages/compose-page-editorial";
import { TripsPage } from "@/pages/trips-page-editorial";
import { FramingPage } from "@/pages/framing-page-editorial";
import { WardrobeIntelligencePage } from "@/pages/intelligence-page-editorial";
import { NotFound } from "@/pages/not-found";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />

      {/* Protected routes - 5 Pillar Navigation */}
      <ProtectedRoute path="/home" component={HomePage} />
      <ProtectedRoute path="/wardrobe" component={WardrobePage} />
      <ProtectedRoute path="/compose" component={ComposePage} />
      <ProtectedRoute path="/trips" component={TripsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />

      {/* Additional routes */}
      <ProtectedRoute path="/outfits" component={OutfitPage} />
      <ProtectedRoute path="/inspiration" component={InspirationPage} />
      <ProtectedRoute path="/inspirations" component={InspirationPage} />
      <ProtectedRoute path="/calendar" component={CalendarPage} />
      <ProtectedRoute path="/statistics" component={StatisticsPage} />
      <ProtectedRoute path="/style-essence" component={StyleEssencePage} />
      <ProtectedRoute path="/framing" component={FramingPage} />
      <ProtectedRoute path="/intelligence" component={WardrobeIntelligencePage} />

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
          <SharedElementProvider>
            <AnimatedPage>
              <Router />
            </AnimatedPage>
            <MobileBottomNav />
            <Toaster />
          </SharedElementProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
