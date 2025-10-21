import { useState } from "react";
import { motion } from "framer-motion";
import { User, LogOut, Mail, Shield, Sparkles } from "lucide-react";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-amber-50/20">
      <NavigationBar />

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-fashion-heading text-foreground">
              Your Profile
            </h1>
            <p className="text-muted-foreground font-fashion-body mt-1">
              Manage your account and style preferences
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Profile Info Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="border-amber-200">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-24 w-24 rounded-full border-4 border-amber-200 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-3xl font-fashion-heading shadow-lg">
                    {getUserInitials()}
                  </div>
                </div>
                <CardTitle className="font-fashion-heading text-xl">
                  {user?.name || user?.username}
                </CardTitle>
                <CardDescription className="font-fashion-body">
                  {user?.email || 'No email provided'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator className="bg-amber-200/50" />
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-amber-50/50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-900">
                      {wardrobeItems?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Items</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50/50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-900">
                      {outfits?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Outfits</div>
                  </div>
                </div>

                <Separator className="bg-amber-200/50" />

                {/* Account Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-amber-600" />
                    <span className="text-muted-foreground">Username:</span>
                    <span className="font-medium">{user?.username}</span>
                  </div>
                  {user?.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-amber-600" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium truncate">{user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <span className="text-muted-foreground">Role:</span>
                    <Badge variant="outline" className="border-amber-300 text-amber-800">
                      {user?.role || 'User'}
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-amber-200/50" />

                {/* Logout Button */}
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings and Style Profile */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="settings" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings" data-testid="tab-settings">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="style" data-testid="tab-style">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Style Profile
                </TabsTrigger>
              </TabsList>

              <TabsContent value="settings" className="space-y-4">
                <Card className="border-amber-200">
                  <CardHeader>
                    <CardTitle className="font-fashion-heading">Preferences</CardTitle>
                    <CardDescription>
                      Customize your experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Notifications */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-amber-700">Notifications</h3>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifications-toggle" className="text-sm">
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
                          data-testid="switch-notifications"
                        />
                      </div>
                    </div>

                    <Separator className="bg-amber-200/50" />

                    {/* Privacy */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-amber-700">Privacy</h3>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="private-profile" className="text-sm">
                            Private Profile
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Hide your profile from other users
                          </p>
                        </div>
                        <Switch
                          id="private-profile"
                          defaultChecked={true}
                          data-testid="switch-private"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="style">
                <StyleProfileAnalysis 
                  wardrobeItemsCount={wardrobeItems?.length || 0} 
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
