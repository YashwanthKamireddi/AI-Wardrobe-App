import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";
import { useEffect, useState } from "react";
import { LuxuryOnboarding } from "@/components/onboarding/luxury-onboarding";
import { LuxuryTutorial } from "@/components/tutorial/luxury-tutorial";

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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  useEffect(() => {
    // Check if user has completed onboarding before
    const onboardingComplete = localStorage.getItem("onboardingComplete") === "true";
    const tutorialComplete = localStorage.getItem("tutorialComplete") === "true";
    
    if (!onboardingComplete) {
      setShowOnboarding(true);
    } else if (!tutorialComplete) {
      // Only show tutorial after onboarding is complete
      setShowTutorial(true);
    }
  }, []);
  
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Show tutorial after onboarding
    setShowTutorial(true);
  };
  
  const handleTutorialComplete = () => {
    localStorage.setItem("tutorialComplete", "true");
    setShowTutorial(false);
  };
  
  const handleTutorialSkip = () => {
    localStorage.setItem("tutorialComplete", "true");
    setShowTutorial(false);
  };
  
  // Handler for tutorial replay from settings
  const handleReplayTutorial = () => {
    localStorage.setItem("tutorialComplete", "false");
    setShowTutorial(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {/* Luxury onboarding experience */}
          {showOnboarding && (
            <LuxuryOnboarding onComplete={handleOnboardingComplete} />
          )}
          
          {/* Interactive tutorial with golden animations */}
          <LuxuryTutorial 
            isActive={showTutorial}
            onComplete={handleTutorialComplete}
            onSkip={handleTutorialSkip}
          />
          
          <Router />
          <MobileBottomNav />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;