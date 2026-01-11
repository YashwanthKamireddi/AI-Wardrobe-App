import { useState } from "react";
import { User, LogOut, Mail, Shield, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import NavigationBar from "@/components/navigation-bar";
import StyleProfileAnalysis from "@/components/style-profile-analysis";
import { useAuth } from "@/hooks/use-auth";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";

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

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-primary/[0.03] to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-secondary/30 to-transparent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <NavigationBar />

      <main className="relative max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <header className="mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground">Your Profile</h1>
          </div>
          <p className="text-muted-foreground text-lg">Manage your account and style preferences</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-primary/40 to-transparent" />
            <Settings className="w-4 h-4 text-primary/40" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="text-center relative">
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
                <div className="relative flex justify-center mb-4">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center text-primary-foreground text-3xl font-serif shadow-lg shadow-primary/25 border-4 border-background">
                    {getUserInitials()}
                  </div>
                </div>
                <CardTitle className="font-serif text-2xl">
                  {user?.name || user?.username}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {user?.email || 'No email provided'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator className="bg-primary/10" />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border border-primary/10 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
                    <div className="text-2xl font-serif text-foreground">
                      {wardrobeItems?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Items</div>
                  </div>
                  <div className="text-center p-4 border border-primary/10 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
                    <div className="text-2xl font-serif text-foreground">
                      {outfits?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Outfits</div>
                  </div>
                </div>

                <Separator className="bg-primary/10" />

                {/* Account Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-primary/60" />
                    <span className="text-muted-foreground">Username:</span>
                    <span className="font-medium text-foreground">{user?.username}</span>
                  </div>
                  {user?.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-primary/60" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium text-foreground truncate">{user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-4 w-4 text-primary/60" />
                    <span className="text-muted-foreground">Role:</span>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {user?.role || 'User'}
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-primary/10" />

                {/* Logout Button */}
                <Button
                  variant="outline"
                  className="w-full border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? 'Logging out...' : 'Sign Out'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Settings and Style Profile */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="settings" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-card/50 border border-primary/10">
                <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="style" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Style Profile
                </TabsTrigger>
              </TabsList>

              <TabsContent value="settings">
                <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Preferences</CardTitle>
                    <CardDescription>Customize your experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Notifications */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-foreground">Notifications</h3>
                      <div className="flex items-center justify-between p-4 border border-primary/10 rounded-xl bg-primary/5">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifications-toggle" className="text-sm font-medium">
                            Style Recommendations
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Receive personalized outfit suggestions
                          </p>
                        </div>
                        <Switch
                          id="notifications-toggle"
                          checked={notificationsEnabled}
                          onCheckedChange={handleNotificationsChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    </div>

                    <Separator className="bg-primary/10" />

                    {/* Privacy */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-foreground">Privacy</h3>
                      <div className="flex items-center justify-between p-4 border border-primary/10 rounded-xl bg-primary/5">
                        <div className="space-y-0.5">
                          <Label htmlFor="private-profile" className="text-sm font-medium">
                            Private Profile
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Hide your profile from other users
                          </p>
                        </div>
                        <Switch
                          id="private-profile"
                          defaultChecked={true}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="style">
                <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <StyleProfileAnalysis
                      wardrobeCount={wardrobeItems?.length || 0}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
