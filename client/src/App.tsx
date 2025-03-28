import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";
import { PageTransition } from "@/components/ui/page-transition";
import { AnimatePresence } from "framer-motion";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import WardrobePage from "@/pages/wardrobe-page";
import OutfitPage from "@/pages/outfit-page";
import InspirationPage from "@/pages/inspiration-page";
import ProfilePage from "@/pages/profile-page";
import NotFound from "@/pages/not-found";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

// Enhanced pages with transitions
const EnhancedHomePage = () => (
  <PageTransition transitionType="spring">
    <HomePage />
  </PageTransition>
);

const EnhancedWardrobePage = () => (
  <PageTransition transitionType="slide">
    <WardrobePage />
  </PageTransition>
);

const EnhancedOutfitPage = () => (
  <PageTransition transitionType="zoom">
    <OutfitPage />
  </PageTransition>
);

const EnhancedInspirationPage = () => (
  <PageTransition transitionType="advanced">
    <InspirationPage />
  </PageTransition>
);

const EnhancedProfilePage = () => (
  <PageTransition transitionType="fade">
    <ProfilePage />
  </PageTransition>
);

const EnhancedAuthPage = () => (
  <PageTransition transitionType="fade">
    <AuthPage />
  </PageTransition>
);

const EnhancedNotFound = () => (
  <PageTransition transitionType="slide">
    <NotFound />
  </PageTransition>
);

function Router() {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <ProtectedRoute path="/" component={EnhancedHomePage} />
        <ProtectedRoute path="/wardrobe" component={EnhancedWardrobePage} />
        <ProtectedRoute path="/outfits" component={EnhancedOutfitPage} />
        <ProtectedRoute path="/inspirations" component={EnhancedInspirationPage} />
        <ProtectedRoute path="/profile" component={EnhancedProfilePage} />
        <Route path="/auth" component={EnhancedAuthPage} />
        <Route component={EnhancedNotFound} />
      </Switch>
    </AnimatePresence>
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