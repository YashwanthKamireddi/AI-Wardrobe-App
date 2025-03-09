import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import NavigationBar from "@/components/navigation-bar";
import StyleProfileAnalysis from "@/components/style-profile-analysis";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Settings, Bell, Moon, Sun, LogOut, Upload } from "lucide-react";

// Profile form schema
const profileFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  username: z.string().min(3).max(30),
  profilePicture: z.string().url().optional().or(z.literal("")),
});

// Settings form schema
const settingsFormSchema = z.object({
  darkMode: z.boolean().default(false),
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  temperatureUnit: z.enum(["celsius", "fahrenheit"]).default("celsius"),
  autoRefreshWeather: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function ProfilePage() {
  const { user, isLoading, updateUserMutation, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      username: user?.username || "",
      profilePicture: user?.profilePicture || "",
    },
  });

  // Reset form when user data changes (e.g., after login)
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        profilePicture: user.profilePicture || "",
      });
    }
  }, [user, profileForm]);

  // Settings form with default values
  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      darkMode: theme === "dark",
      emailNotifications: true,
      pushNotifications: true,
      temperatureUnit: "celsius",
      autoRefreshWeather: true,
    },
  });

  // Handle profile form submission
  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      // Remove undefined values to prevent overwriting with undefined
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined && v !== "")
      );

      // Call the update mutation with filtered data
      updateUserMutation.mutate(filteredData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle settings form submission
  const onSettingsSubmit = async (data: SettingsFormValues) => {
    try {
      // Apply dark mode setting
      setTheme(data.darkMode ? "dark" : "light");

      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/auth";
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Profile & Settings</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and how others see you on the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white">
                          {user?.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.name || user.username}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-10 w-10" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{user?.name || user?.username}</h3>
                          <p className="text-sm text-muted-foreground">
                            Member since February 2024
                          </p>
                        </div>
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public display name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              Your full name helps personalize your experience.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              We'll use this for notifications and account recovery.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="profilePicture"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile Picture</FormLabel>
                            <div className="space-y-4">
                              {field.value && (
                                <div className="relative h-24 w-24 rounded-full overflow-hidden border border-border">
                                  <img 
                                    src={field.value} 
                                    alt="Profile" 
                                    className="object-cover w-full h-full" 
                                  />
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-2">
                                <div className="relative">
                                  <Input
                                    type="file"
                                    id="profile-upload"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          field.onChange(event.target?.result);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Photo
                                  </Button>
                                </div>

                                <Input
                                  type="url"
                                  placeholder="Or enter image URL"
                                  value={field.value || ''}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  className="w-full"
                                />
                              </div>
                            </div>
                            <FormDescription>
                              Upload an image from your computer or enter a URL.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="mr-2"
                        disabled={updateUserMutation.isPending}
                      >
                        {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Application Settings</CardTitle>
                  <CardDescription>
                    Customize your experience with Cher's Closet.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...settingsForm}>
                    <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <Moon className="h-5 w-5 mr-2" />
                          Appearance
                        </h3>
                        <FormField
                          control={settingsForm.control}
                          name="darkMode"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-xl border p-4 shadow-soft hover:shadow-hover transition-all duration-300 bg-card/50 backdrop-blur-sm">
                              <div className="space-y-1">
                                <FormLabel className="text-lg font-medium">Dark Mode</FormLabel>
                                <FormDescription className="text-muted-foreground">
                                  Switch between light and dark theme.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <div className="flex items-center">
                                  <Sun className="h-4 w-4 mr-2" />
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      setTheme(checked ? "dark" : "light"); // Apply theme immediately on toggle
                                    }}
                                  />
                                  <Moon className="h-4 w-4 ml-2" />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <Bell className="h-5 w-5 mr-2" />
                          Notifications
                        </h3>
                        <FormField
                          control={settingsForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Email Notifications</FormLabel>
                                <FormDescription>
                                  Receive outfit suggestions and weather alerts via email.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="pushNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Push Notifications</FormLabel>
                                <FormDescription>
                                  Receive alerts directly in your browser.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Weather Preferences</h3>
                        <FormField
                          control={settingsForm.control}
                          name="temperatureUnit"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel>Temperature Unit</FormLabel>
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant={field.value === "celsius" ? "default" : "outline"}
                                  onClick={() => field.onChange("celsius")}
                                  className="w-24"
                                >
                                  Celsius (°C)
                                </Button>
                                <Button
                                  type="button"
                                  variant={field.value === "fahrenheit" ? "default" : "outline"}
                                  onClick={() => field.onChange("fahrenheit")}
                                  className="w-24"
                                >
                                  Fahrenheit (°F)
                                </Button>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={settingsForm.control}
                          name="autoRefreshWeather"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Auto-refresh Weather</FormLabel>
                                <FormDescription>
                                  Automatically update weather data every 30 minutes.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit">Save Settings</Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}