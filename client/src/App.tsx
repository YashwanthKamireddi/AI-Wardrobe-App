import { useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";
import { SharedElementProvider, AnimatedPage } from "@/components/ui/shared-transitions";
import { GlobalErrorBoundary } from "@/components/ui/error-boundary";
import { Loader2 } from "lucide-react";

// Lazy-loaded pages with proper wouter typing
const LandingPage = lazy(() => import("@/pages/landing-page").then(m => ({ default: m.LandingPage })));
const HomePage = lazy(() => import("@/pages/home-page").then(m => ({ default: m.HomePage })));
const AuthPage = lazy(() => import("@/pages/auth-page").then(m => ({ default: m.AuthPage })));
const WardrobePage = lazy(() => import("@/pages/wardrobe-page").then(m => ({ default: m.WardrobePage })));
const OutfitPage = lazy(() => import("@/pages/outfit-page").then(m => ({ default: m.OutfitPage })));
const InspirationPage = lazy(() => import("@/pages/inspiration-page").then(m => ({ default: m.InspirationPage })));
const ProfilePage = lazy(() => import("@/pages/profile-page").then(m => ({ default: m.ProfilePage })));
const CalendarPage = lazy(() => import("@/pages/calendar-page").then(m => ({ default: m.CalendarPage })));
const StatisticsPage = lazy(() => import("@/pages/statistics-page").then(m => ({ default: m.StatisticsPage })));
const StyleEssencePage = lazy(() => import("@/pages/style-essence-page").then(m => ({ default: m.StyleEssencePage })));
const ComposePage = lazy(() => import("@/pages/compose-page").then(m => ({ default: m.ComposePage })));
const TripsPage = lazy(() => import("@/pages/trips-page").then(m => ({ default: m.TripsPage })));
const FramingPage = lazy(() => import("@/pages/framing-page").then(m => ({ default: m.FramingPage })));
const WardrobeIntelligencePage = lazy(() => import("@/pages/intelligence-page").then(m => ({ default: m.WardrobeIntelligencePage })));
const AnalyticsPage = lazy(() => import("@/pages/analytics-page").then(m => ({ default: m.default })));
const NotFoundPage = lazy(() => import("@/pages/not-found").then(m => ({ default: m.NotFound })));

// Loading Component
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);


function Router() {
    return (
        <Suspense fallback={<PageLoader />}>
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
                <Route component={NotFoundPage} />
            </Switch>
        </Suspense>
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
                            <GlobalErrorBoundary>
                                <Router />
                            </GlobalErrorBoundary>
                        </AnimatedPage>

                        <Toaster />
                    </SharedElementProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
