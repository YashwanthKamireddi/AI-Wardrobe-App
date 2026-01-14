import { useState, useMemo } from "react";
import {
  User, LogOut, Mail, Shield, Settings, Crown, Shirt, Layers,
  Heart, TrendingUp, Award, Calendar, Sparkles, ChevronRight,
  Bell, Palette, Lock, HelpCircle, MessageSquare,
  Star, Target, Zap, BarChart3
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

import NavigationBar from "@/components/navigation-bar";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import StyleProfileAnalysis from "@/components/style-profile-analysis";
import { useAuth } from "@/hooks/use-auth";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";

// Brand colors
const gold = "hsl(38, 75%, 55%)";
const burgundy = "hsl(337, 73%, 26%)";
const burgundyDark = "hsl(337, 73%, 18%)";

// Achievement badges - computed dynamically
const getAchievements = (wardrobeCount: number, outfitsCount: number, favoriteCount: number) => [
  { id: 1, name: "First Steps", desc: "Add your first wardrobe item", icon: Shirt, unlocked: wardrobeCount >= 1, color: "#10b981" },
  { id: 2, name: "Outfit Creator", desc: "Create 5 outfits", icon: Layers, unlocked: outfitsCount >= 5, color: "#8b5cf6" },
  { id: 3, name: "Favorite Finder", desc: "Mark 3 favorites", icon: Heart, unlocked: favoriteCount >= 3, color: "#f59e0b" },
  { id: 4, name: "Fashion Forward", desc: "Build a 50-item wardrobe", icon: Crown, unlocked: wardrobeCount >= 50, color: burgundy },
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
    <div className="min-h-screen bg-[#fafaf9] pb-24 md:pb-8">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${burgundy}10 0%, transparent 70%)` }} />
        <div className="absolute bottom-40 left-10 w-48 h-48 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${gold}15 0%, transparent 70%)` }} />
      </div>

      <NavigationBar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-4">
            <User className="w-4 h-4" style={{ color: gold }} />
            <span className="text-sm font-medium text-slate-600">Account</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-2">Your Profile</h1>
          <p className="text-slate-500 text-lg">Manage your account and style journey</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Profile Card */}
            <Card className="border-0 shadow-xl rounded-[24px] bg-white overflow-hidden">
              <CardHeader className="text-center relative pb-4">
                {/* Header Background */}
                <div
                  className="absolute top-0 left-0 right-0 h-32"
                  style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
                />

                {/* Avatar */}
                <div className="relative flex justify-center mb-4 pt-10">
                  <div
                    className="h-28 w-28 rounded-full flex items-center justify-center text-4xl font-serif shadow-xl border-4 border-white relative"
                    style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)`, color: gold }}
                  >
                    {getUserInitials()}
                    {/* Level Badge */}
                    <div
                      className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg"
                      style={{ background: gold }}
                    >
                      {xpData.level}
                    </div>
                  </div>
                </div>

                <CardTitle className="font-serif text-2xl text-slate-900">
                  {user?.name || user?.username}
                </CardTitle>
                <CardDescription className="text-slate-500 text-base">
                  @{user?.username}
                </CardDescription>

                {/* Member Badge */}
                <Badge className="mt-3 rounded-full px-4 py-1" style={{ background: `${gold}20`, color: burgundy }}>
                  <Star className="w-3 h-3 mr-1" />
                  Style Member
                </Badge>
              </CardHeader>

              <CardContent className="space-y-5 p-6">
                {/* Level Progress */}
                <div className="p-5 rounded-2xl" style={{ background: `${burgundy}05` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Level {xpData.level}</span>
                    <span className="text-xs text-slate-400">{xpData.currentXP}/{xpData.nextLevelXP} XP</span>
                  </div>
                  <Progress value={(xpData.currentXP / xpData.nextLevelXP) * 100} className="h-2" />
                  <p className="text-xs text-slate-400 mt-2">
                    <Zap className="w-3 h-3 inline mr-1" style={{ color: gold }} />
                    Earn XP by adding items and creating outfits
                  </p>
                </div>

                <Separator className="bg-slate-100" />

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Items", value: wardrobeItems?.length || 0, icon: Shirt },
                    { label: "Outfits", value: outfits?.length || 0, icon: Layers },
                    { label: "Favorites", value: styleInsights.favoriteCount, icon: Heart },
                    { label: "Score", value: `${styleInsights.completionScore}%`, icon: Target },
                  ].map((stat, idx) => (
                    <div key={idx} className="text-center p-4 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors">
                      <stat.icon className="w-5 h-5 mx-auto mb-2 text-slate-400" />
                      <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <Separator className="bg-slate-100" />

                {/* Account Info */}
                <div className="space-y-3">
                  {user?.email && (
                    <div className="flex items-center gap-3 text-sm p-4 rounded-2xl bg-slate-50">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 truncate">{user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm p-4 rounded-2xl bg-slate-50">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">Member since {memberSince}</span>
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                {/* Logout Button */}
                <Button
                  variant="outline"
                  className="w-full rounded-full h-12 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                </Button>
              </CardContent>
            </Card>

            {/* Achievements Card */}
            {(() => {
              const achievements = getAchievements(
                wardrobeItems?.length || 0,
                outfits?.length || 0,
                styleInsights.favoriteCount
              );
              return (
                <Card className="border-0 shadow-xl rounded-[24px] bg-white">
                  <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-serif text-xl text-slate-900">Achievements</CardTitle>
                      <Badge variant="outline" className="rounded-full border-slate-200">
                        {achievements.filter(a => a.unlocked).length}/{achievements.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 px-6 pb-6">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                          achievement.unlocked ? 'bg-slate-50' : 'bg-slate-50/50 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            achievement.unlocked ? '' : 'grayscale'
                          }`}
                          style={{ background: `${achievement.color}15` }}
                        >
                          <achievement.icon className="w-6 h-6" style={{ color: achievement.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{achievement.name}</p>
                          <p className="text-sm text-slate-400 truncate">{achievement.desc}</p>
                        </div>
                        {achievement.unlocked && (
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          {/* Settings and Style Profile */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="style" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-white border border-slate-200 p-1.5 rounded-2xl h-14">
                <TabsTrigger
                  value="style"
                  className="rounded-xl data-[state=active]:shadow-sm transition-all h-10"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Style
                </TabsTrigger>
                <TabsTrigger
                  value="insights"
                  className="rounded-xl data-[state=active]:shadow-sm transition-all h-10"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Insights
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="rounded-xl data-[state=active]:shadow-sm transition-all h-10"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Style Profile Tab */}
              <TabsContent value="style">
                <Card className="border-0 shadow-xl rounded-[24px] bg-white">
                  <CardHeader className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${burgundy}10` }}>
                        <Palette className="w-6 h-6" style={{ color: burgundy }} />
                      </div>
                      <div>
                        <CardTitle className="font-serif text-2xl text-slate-900">Style Profile</CardTitle>
                        <CardDescription className="text-base">Your unique fashion identity</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <StyleProfileAnalysis
                      wardrobeCount={wardrobeItems?.length || 0}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Insights Tab */}
              <TabsContent value="insights">
                <div className="space-y-6">
                  {/* Wardrobe Analysis */}
                  <Card className="border-0 shadow-xl rounded-[24px] bg-white">
                    <CardHeader className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${gold}15` }}>
                          <TrendingUp className="w-6 h-6" style={{ color: burgundy }} />
                        </div>
                        <div>
                          <CardTitle className="font-serif text-2xl text-slate-900">Wardrobe Analysis</CardTitle>
                          <CardDescription className="text-base">Insights about your collection</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-5 rounded-2xl border border-slate-100">
                          <p className="text-sm text-slate-500 mb-2">Top Category</p>
                          <p className="text-xl font-semibold text-slate-900 capitalize">{styleInsights.topCategory}</p>
                        </div>
                        <div className="p-5 rounded-2xl border border-slate-100">
                          <p className="text-sm text-slate-500 mb-2">Favorite Color</p>
                          <p className="text-xl font-semibold text-slate-900 capitalize">{styleInsights.topColor}</p>
                        </div>
                      </div>

                      {/* Progress Bars */}
                      <div className="space-y-5">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600">Wardrobe Completion</span>
                            <span className="text-sm font-medium" style={{ color: burgundy }}>{styleInsights.completionScore}%</span>
                          </div>
                          <Progress value={styleInsights.completionScore} className="h-2" />
                          <p className="text-xs text-slate-400 mt-1">Based on essential categories</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600">Style Diversity</span>
                            <span className="text-sm font-medium" style={{ color: burgundy }}>{styleInsights.diversityScore}%</span>
                          </div>
                          <Progress value={styleInsights.diversityScore} className="h-2" />
                          <p className="text-xs text-slate-400 mt-1">Variety across categories</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card className="border-0 shadow-xl rounded-[24px] bg-white">
                    <CardHeader className="p-6">
                      <CardTitle className="font-serif text-xl text-slate-900">Personalized Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="space-y-3">
                        {[
                          { text: "Add more bottoms to balance your collection", icon: Shirt },
                          { text: "Try creating outfits for different occasions", icon: Layers },
                          { text: "Explore neutral colors for versatility", icon: Palette },
                        ].map((rec, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                            <rec.icon className="w-5 h-5 text-slate-400" />
                            <span className="text-sm text-slate-600 flex-1">{rec.text}</span>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card className="border-0 shadow-xl rounded-[24px] bg-white">
                  <CardHeader className="p-6">
                    <CardTitle className="font-serif text-2xl text-slate-900">Preferences</CardTitle>
                    <CardDescription className="text-base">Customize your Celura experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6 pt-0">
                    {/* Notifications Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <Bell className="w-4 h-4" style={{ color: burgundy }} />
                        Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors">
                          <div className="space-y-1">
                            <Label htmlFor="notifications-toggle" className="text-sm font-medium text-slate-700">
                              Style Recommendations
                            </Label>
                            <p className="text-xs text-slate-400">
                              Receive personalized outfit suggestions
                            </p>
                          </div>
                          <Switch
                            id="notifications-toggle"
                            checked={notificationsEnabled}
                            onCheckedChange={handleNotificationsChange}
                          />
                        </div>
                        <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors">
                          <div className="space-y-1">
                            <Label htmlFor="weather-alerts" className="text-sm font-medium text-slate-700">
                              Weather Alerts
                            </Label>
                            <p className="text-xs text-slate-400">
                              Get notified about weather-appropriate outfits
                            </p>
                          </div>
                          <Switch id="weather-alerts" defaultChecked />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* Privacy Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <Lock className="w-4 h-4" style={{ color: burgundy }} />
                        Privacy
                      </h3>
                      <div className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors">
                        <div className="space-y-1">
                          <Label htmlFor="private-profile" className="text-sm font-medium text-slate-700">
                            Private Profile
                          </Label>
                          <p className="text-xs text-slate-400">
                            Hide your profile from other users
                          </p>
                        </div>
                        <Switch id="private-profile" defaultChecked />
                      </div>
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* Support Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" style={{ color: burgundy }} />
                        Support
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="justify-start rounded-2xl h-12 border-slate-200 hover:border-slate-300">
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Help Center
                        </Button>
                        <Button variant="outline" className="justify-start rounded-2xl h-12 border-slate-200 hover:border-slate-300">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Us
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
