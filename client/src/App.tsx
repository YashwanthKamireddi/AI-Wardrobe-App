import { useEffect, lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";
import { SharedElementProvider, AnimatedPage } from "@/components/ui/shared-transitions";
import { GlobalErrorBoundary } from "@/components/ui/error-boundary";
import { Loader2 } from "lucide-react";

/**
 * VESSURA APP - SIMPLIFIED NAVIGATION (V2.0)
 *
 * Primary Navigation (5 Core):
 * - /home      → Dashboard
 * - /wardrobe  → Items + Collections
 * - /outfits   → Create + View Looks
 * - /plan      → Calendar + Trips
 * - /discover  → Community + Inspiration
 *
 * System Menu (Secondary):
 * - /analytics → Wardrobe Analytics
 * - /style-dna → Style Profile
 * - /wishlist  → Shopping List
 * - /profile   → Account Settings
 */

// ============================================================
// LAZY-LOADED PAGES
// ============================================================

// Core 5 Navigation Pages
const LandingPage = lazy(() => import("@/pages/landing-page").then(m => ({ default: m.LandingPage })));
const AuthPage = lazy(() => import("@/pages/auth-page").then(m => ({ default: m.AuthPage })));
const HomePage = lazy(() => import("@/pages/home-page").then(m => ({ default: m.HomePage })));
const WardrobePage = lazy(() => import("@/pages/wardrobe-page").then(m => ({ default: m.WardrobePage })));
const OutfitPage = lazy(() => import("@/pages/outfit-page").then(m => ({ default: m.OutfitPage })));
const CalendarPage = lazy(() => import("@/pages/calendar-page").then(m => ({ default: m.CalendarPage })));
const SocialPage = lazy(() => import("@/pages/social-page").then(m => ({ default: m.SocialPage })));

// System Menu Pages
const AnalyticsPage = lazy(() => import("@/pages/analytics-page").then(m => ({ default: m.default })));
const StyleProfilePage = lazy(() => import("@/pages/style-profile-page").then(m => ({ default: m.StyleProfilePage })));
const WishlistPage = lazy(() => import("@/pages/wishlist-page").then(m => ({ default: m.WishlistPage })));
const ProfilePage = lazy(() => import("@/pages/profile-page").then(m => ({ default: m.ProfilePage })));

// Additional Feature Pages
const FramingPage = lazy(() => import("@/pages/framing-page").then(m => ({ default: m.FramingPage })));
const StudioPage = lazy(() => import("@/pages/studio-page").then(m => ({ default: m.StudioPage })));

// Other/Utility
const NotFoundPage = lazy(() => import("@/pages/not-found").then(m => ({ default: m.NotFound })));

// ============================================================
// LOADING COMPONENT
// ============================================================

const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);

// ============================================================
// ROUTER - SIMPLIFIED NAVIGATION
// ============================================================

function Router() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Switch>
                {/* ========== PUBLIC ROUTES ========== */}
                <Route path="/" component={LandingPage} />
                <Route path="/auth" component={AuthPage} />

                {/* ========== CORE 5 NAVIGATION ========== */}
                <ProtectedRoute path="/home" component={HomePage} />
                <ProtectedRoute path="/wardrobe" component={WardrobePage} />
                <ProtectedRoute path="/outfits" component={OutfitPage} />
                <ProtectedRoute path="/plan" component={CalendarPage} />
                <ProtectedRoute path="/discover" component={SocialPage} />

                <ProtectedRoute path="/analytics" component={AnalyticsPage} />
                <ProtectedRoute path="/style-dna" component={StyleProfilePage} />
                <ProtectedRoute path="/framing" component={FramingPage} />
                <ProtectedRoute path="/studio" component={StudioPage} />
                <ProtectedRoute path="/wishlist" component={WishlistPage} />
                <ProtectedRoute path="/profile" component={ProfilePage} />

                {/* ========== LEGACY REDIRECTS ========== */}
                {/* Old routes redirect to new structure */}
                <Route path="/compose">
                    <Redirect to="/outfits" />
                </Route>
                <Route path="/calendar">
                    <Redirect to="/plan" />
                </Route>
                <Route path="/trips">
                    <Redirect to="/plan" />
                </Route>
                <Route path="/community">
                    <Redirect to="/discover" />
                </Route>
                <Route path="/capsules">
                    <Redirect to="/wardrobe" />
                </Route>

                {/* ========== 404 ========== */}
                <Route component={NotFoundPage} />
            </Switch>
        </Suspense>
    );
}

// ============================================================
// APP COMPONENT
// ============================================================

function App() {
    useEffect(() => {
        // Skip onboarding/tutorials
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
