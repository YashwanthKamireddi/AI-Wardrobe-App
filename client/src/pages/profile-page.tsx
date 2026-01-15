import { useState, useMemo } from "react";
import {
  User, LogOut, Mail, Shield, Settings, Crown, Shirt, Layers,
  Heart, TrendingUp, Award, Calendar, Sparkles, ChevronRight,
  Bell, Palette, Lock, HelpCircle, MessageSquare,
  Star, Target, Zap, BarChart3
} from "lucide-react";

import { LuxuryButton } from "@/components/ui/luxury-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ProfileCardSkeleton } from "@/components/ui/luxury-skeleton";
import { HapticFeedback } from "@/lib/haptics";

import NavigationBar from "@/components/navigation-bar";
import StyleProfileAnalysis from "@/components/style-profile-analysis";
import { useAuth } from "@/hooks/use-auth";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";

// Achievement badges - computed dynamically
const getAchievements = (wardrobeCount: number, outfitsCount: number, favoriteCount: number) => [
  { id: 1, name: "First Steps", desc: "Add your first wardrobe item", icon: Shirt, unlocked: wardrobeCount >= 1, color: "#10b981" },
  { id: 2, name: "Outfit Creator", desc: "Create 5 outfits", icon: Layers, unlocked: outfitsCount >= 5, color: "#8b5cf6" },
  { id: 3, name: "Favorite Finder", desc: "Mark 3 favorites", icon: Heart, unlocked: favoriteCount >= 3, color: "#D4AF37" },
  { id: 4, name: "Fashion Forward", desc: "Build a 50-item wardrobe", icon: Crown, unlocked: wardrobeCount >= 50, color: "#0F0F0F" },
];

export function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { data: wardrobeItems } = useWardrobeItems();
  const { data: outfits } = useOutfits();

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notificationsEnabled") === "true"
  );

  const handleNotificationsChange = (checked: boolean) => {
    setNotificationsEnabled(checked);
    localStorage.setItem("notificationsEnabled", checked.toString());
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.username.slice(0, 2).toUpperCase() || 'U';
  };

  // Calculate style insights
  const styleInsights = useMemo(() => {
    if (!wardrobeItems || wardrobeItems.length === 0) {
      return {
        topCategory: 'None',
        topColor: 'None',
        favoriteCount: 0,
        completionScore: 0,
        diversityScore: 0,
      };
    }

    const categories = wardrobeItems.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const colors = wardrobeItems.reduce((acc: Record<string, number>, item) => {
      if (item.color) acc[item.color] = (acc[item.color] || 0) + 1;
      return acc;
    }, {});

    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    const topColor = Object.entries(colors).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    const favoriteCount = wardrobeItems.filter(item => item.favorite).length;

    // Calculate completion score (based on essential categories)
    const essentialCategories = ['tops', 'bottoms', 'shoes', 'outerwear'];
    const hasCategories = essentialCategories.filter(cat => categories[cat] > 0).length;
    const completionScore = Math.round((hasCategories / essentialCategories.length) * 100);

    // Diversity score (unique categories / 8 max categories)
    const diversityScore = Math.min(100, Math.round((Object.keys(categories).length / 8) * 100));

    return { topCategory, topColor, favoriteCount, completionScore, diversityScore };
  }, [wardrobeItems]);

  // Calculate level and XP
  const xpData = useMemo(() => {
    const baseXP = (wardrobeItems?.length || 0) * 10 + (outfits?.length || 0) * 25;
    const level = Math.floor(baseXP / 100) + 1;
    const currentLevelXP = baseXP % 100;
    return { level, currentXP: currentLevelXP, nextLevelXP: 100, totalXP: baseXP };
  }, [wardrobeItems, outfits]);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: '#faf9f7' }}>
      {/* Desktop Navigation Bar */}
      <div className="hidden md:block">
        <NavigationBar />
      </div>

      {/* Mobile Header */}
      <header
        className="md:hidden sticky top-0 z-40 px-4 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1"
              style={{ color: '#80163a' }}
            >
              Settings
            </p>
            <h1
              className="font-serif text-2xl font-medium text-slate-900"
            >
              Profile
            </h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Profile Card */}
        <section
          className="rounded-2xl p-5 mb-4 bg-white border border-slate-200"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-serif font-medium"
              style={{
                background: '#80163a',
                color: '#D4A54A'
              }}
            >
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className="font-serif text-lg font-medium truncate text-slate-800"
              >
                {user?.name || user?.username}
              </h2>
              <p
                className="text-sm truncate text-slate-500"
              >
                @{user?.username}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    background: 'rgba(212, 175, 55, 0.1)',
                    color: '#D4A54A',
                  }}
                >
                  Level {xpData.level}
                </span>
                <span
                  className="text-xs text-slate-400"
                >
                  {xpData.currentXP}/{xpData.nextLevelXP} XP
                </span>
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-4">
            <div
              className="h-1.5 rounded-full overflow-hidden bg-slate-200"
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(xpData.currentXP / xpData.nextLevelXP) * 100}%`,
                  background: '#D4A54A',
                }}
              />
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "Items", value: wardrobeItems?.length || 0, icon: Shirt },
            { label: "Outfits", value: outfits?.length || 0, icon: Layers },
            { label: "Favorites", value: styleInsights.favoriteCount, icon: Heart },
            { label: "Score", value: `${styleInsights.completionScore}%`, icon: Target },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="text-center p-3 rounded-xl bg-white border border-slate-200"
            >
              <stat.icon className="w-4 h-4 mx-auto mb-1.5 text-slate-400" />
              <div className="text-lg font-semibold text-slate-800">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Tabs */}
        <section
          className="rounded-2xl overflow-hidden mb-4 bg-white border border-slate-200"
        >
          <Tabs defaultValue="insights" className="w-full">
            <TabsList
              className="grid w-full grid-cols-3 p-1.5 rounded-none bg-slate-100"
            >
              <TabsTrigger
                value="insights"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-sm py-2.5"
              >
                <BarChart3 className="h-4 w-4 mr-1.5" />
                Insights
              </TabsTrigger>
              <TabsTrigger
                value="style"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-sm py-2.5"
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                Style
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-sm py-2.5"
              >
                <Settings className="h-4 w-4 mr-1.5" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Insights Tab */}
            <TabsContent value="insights" className="p-4 pt-3 m-0">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div
                  className="p-4 rounded-xl bg-slate-100"
                >
                  <p className="text-xs mb-1 text-slate-500">Top Category</p>
                  <p className="text-base font-medium capitalize text-slate-800">{styleInsights.topCategory}</p>
                </div>
                <div
                  className="p-4 rounded-xl bg-slate-100"
                >
                  <p className="text-xs mb-1 text-slate-500">Favorite Color</p>
                  <p className="text-base font-medium capitalize text-slate-800">{styleInsights.topColor}</p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Wardrobe Completion</span>
                    <span className="text-sm font-medium text-slate-800">{styleInsights.completionScore}%</span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden bg-slate-200"
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${styleInsights.completionScore}%`,
                        background: '#80163a',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Style Diversity</span>
                    <span className="text-sm font-medium text-slate-800">{styleInsights.diversityScore}%</span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden bg-slate-200"
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${styleInsights.diversityScore}%`,
                        background: '#D4A54A',
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Style Tab */}
            <TabsContent value="style" className="p-4 pt-3 m-0">
              <StyleProfileAnalysis wardrobeCount={wardrobeItems?.length || 0} />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="p-4 pt-3 m-0">
              <div className="space-y-4">
                {/* Notifications */}
                <div>
                  <h3
                    className="text-xs font-semibold tracking-wider uppercase mb-3 flex items-center gap-2 text-slate-500"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Notifications
                  </h3>
                  <div className="space-y-2">
                    <div
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-100"
                    >
                      <div>
                        <Label htmlFor="notifications-toggle" className="text-sm font-medium text-slate-800">
                          Style Recommendations
                        </Label>
                        <p className="text-xs mt-0.5 text-slate-500">
                          Receive personalized outfit suggestions
                        </p>
                      </div>
                      <Switch
                        id="notifications-toggle"
                        checked={notificationsEnabled}
                        onCheckedChange={handleNotificationsChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div>
                  <h3
                    className="text-xs font-semibold tracking-wider uppercase mb-3 flex items-center gap-2 text-slate-500"
                  >
                    <User className="w-3.5 h-3.5" />
                    Account
                  </h3>
                  {user?.email && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl mb-2 bg-slate-100"
                    >
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-sm truncate text-slate-800">{user.email}</span>
                    </div>
                  )}
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl bg-slate-100"
                  >
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-800">Member since {memberSince}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Achievements */}
        {(() => {
          const achievements = getAchievements(
            wardrobeItems?.length || 0,
            outfits?.length || 0,
            styleInsights.favoriteCount
          );
          return (
            <section
              className="rounded-2xl overflow-hidden mb-4 bg-white border border-slate-200"
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-200">
                <h3 className="font-serif text-lg font-medium text-slate-800">Achievements</h3>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"
                >
                  {achievements.filter(a => a.unlocked).length}/{achievements.length}
                </span>
              </div>
              <div className="p-4 space-y-2">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all bg-slate-100 ${achievement.unlocked ? '' : 'opacity-50'}`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${achievement.color}15` }}
                    >
                      <achievement.icon className="w-5 h-5" style={{ color: achievement.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-slate-800">{achievement.name}</p>
                      <p className="text-xs truncate text-slate-500">{achievement.desc}</p>
                    </div>
                    {achievement.unlocked && (
                      <Star className="w-4 h-4 fill-amber-400" style={{ color: '#D4A54A' }} />
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Sign Out Button */}
        <LuxuryButton
          variant="destructive"
          className="w-full rounded-xl h-12"
          onClick={() => {
            HapticFeedback.heavy();
            handleLogout();
          }}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
        </LuxuryButton>
      </main>
    </div>
  );
}
