import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";
import { SharedElementProvider, AnimatedPage } from "@/components/ui/shared-transitions";

import { LandingPage } from "@/pages/landing-page";
import { HomePage } from "@/pages/home-page";
import { AuthPage } from "@/pages/auth-page";
import { WardrobePage } from "@/pages/wardrobe-page";
import { OutfitPage } from "@/pages/outfit-page";
import { InspirationPage } from "@/pages/inspiration-page";
import { ProfilePage } from "@/pages/profile-page";
import { CalendarPage } from "@/pages/calendar-page";
import { StatisticsPage } from "@/pages/statistics-page";
import { StyleEssencePage } from "@/pages/style-essence-page";
import { ComposePage } from "@/pages/compose-page";
import { TripsPage } from "@/pages/trips-page";
import { FramingPage } from "@/pages/framing-page";
import { WardrobeIntelligencePage } from "@/pages/intelligence-page";
import AnalyticsPage from "@/pages/analytics-page";
import { NotFound } from "@/pages/not-found";


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
            <ProtectedRoute path="/analytics" component={AnalyticsPage} />

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

                        <Toaster />
                    </SharedElementProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
