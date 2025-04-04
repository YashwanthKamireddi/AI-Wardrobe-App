/**
 * UserSettings Component
 * 
 * A luxurious settings panel that allows users to customize their experience,
 * including theme preferences, notifications, and replay of the interactive tutorial.
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings, HelpCircle, Book, Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { motion } from "framer-motion";

interface UserSettingsProps {
  onReplayTutorial: () => void;
}

export function UserSettings({ onReplayTutorial }: UserSettingsProps) {
  const { theme, setTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notificationsEnabled") === "true"
  );
  
  const handleReplayTutorial = () => {
    // Clear tutorial completion status
    localStorage.setItem("tutorialComplete", "false");
    // Call the parent handler
    onReplayTutorial();
  };
  
  const handleNotificationsChange = (checked: boolean) => {
    setNotificationsEnabled(checked);
    localStorage.setItem("notificationsEnabled", checked.toString());
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="p-2" aria-label="Settings">
          <Settings className="h-5 w-5 text-amber-700 dark:text-amber-300" />
        </Button>
      </SheetTrigger>
      <SheetContent className="border-l border-amber-200 dark:border-amber-800 bg-white/95 dark:bg-slate-900/95">
        <SheetHeader>
          <SheetTitle className="text-amber-800 dark:text-amber-300">
            User Preferences
          </SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          {/* Theme Toggle */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400">Appearance</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                )}
                <Label htmlFor="theme-toggle" className="text-slate-700 dark:text-slate-300">
                  {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </Label>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                className="data-[state=checked]:bg-amber-600"
              />
            </div>
          </div>
          
          <Separator className="bg-amber-200/50 dark:bg-amber-800/30" />
          
          {/* Notifications */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400">Notifications</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <Label htmlFor="notifications-toggle" className="text-slate-700 dark:text-slate-300">
                  Style Recommendations
                </Label>
              </div>
              <Switch
                id="notifications-toggle"
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationsChange}
                className="data-[state=checked]:bg-amber-600"
              />
            </div>
          </div>
          
          <Separator className="bg-amber-200/50 dark:bg-amber-800/30" />
          
          {/* Help & Tutorials */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400">Help & Guidance</h3>
            
            {/* Replay Tutorial Button with Gold Animation */}
            <div className="relative">
              <Button
                variant="outline"
                className="w-full border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 
                           hover:bg-amber-50 dark:hover:bg-amber-900/20 group relative overflow-hidden"
                onClick={handleReplayTutorial}
              >
                <span className="flex items-center justify-center gap-2">
                  <Book className="h-4 w-4" />
                  Replay Interactive Tutorial
                </span>
                
                {/* Subtle Gold Sparkle Effect on Hover */}
                <motion.div 
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 
                             bg-gradient-to-r from-amber-200/0 via-amber-300/20 to-amber-200/0"
                  initial={{ x: -100, opacity: 0 }}
                  whileHover={{ 
                    x: 250,
                    opacity: 1,
                    transition: { duration: 1.5, ease: "easeInOut" }
                  }}
                />
              </Button>
            </div>
            
            {/* Help Center Link */}
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 dark:text-slate-400 
                         hover:text-amber-700 dark:hover:text-amber-300"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help Center
            </Button>
          </div>
          
          <Separator className="bg-amber-200/50 dark:bg-amber-800/30" />
          
          {/* Account Settings */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400">Account</h3>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 dark:text-slate-400 
                         hover:text-amber-700 dark:hover:text-amber-300"
            >
              Edit Profile
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 dark:text-slate-400 
                         hover:text-amber-700 dark:hover:text-amber-300"
            >
              Privacy Settings
            </Button>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500">
          Cher's Closet — Version 1.0.0
        </div>
      </SheetContent>
    </Sheet>
  );
}