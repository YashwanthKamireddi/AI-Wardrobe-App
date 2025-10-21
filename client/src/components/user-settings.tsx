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
import { Settings, HelpCircle, Book, Bell } from "lucide-react";
import { motion } from "framer-motion";

interface UserSettingsProps {
  onReplayTutorial: () => void;
}

export function UserSettings({ onReplayTutorial }: UserSettingsProps) {
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
          <Settings className="h-5 w-5 text-amber-700" />
        </Button>
      </SheetTrigger>
      <SheetContent className="border-l border-amber-200 bg-white/95">
        <SheetHeader>
          <SheetTitle className="text-amber-800">
            User Preferences
          </SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          {/* Notifications */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-medium text-amber-700">Notifications</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-amber-600" />
                <Label htmlFor="notifications-toggle" className="text-slate-700">
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
          
          <Separator className="bg-amber-200/50" />
          
          {/* Help & Tutorials */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-medium text-amber-700">Help & Guidance</h3>
            
            {/* Replay Tutorial Button with Gold Animation */}
            <div className="relative">
              <Button
                variant="outline"
                className="w-full border-amber-300 text-amber-700 
                           hover:bg-amber-50 group relative overflow-hidden"
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
              className="w-full justify-start text-slate-600 
                         hover:text-amber-700"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help Center
            </Button>
          </div>
          
          <Separator className="bg-amber-200/50" />
          
          {/* Account Settings */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-medium text-amber-700">Account</h3>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 
                         hover:text-amber-700"
            >
              Edit Profile
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 
                         hover:text-amber-700"
            >
              Privacy Settings
            </Button>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-slate-500">
          Cher's Closet — Version 1.0.0
        </div>
      </SheetContent>
    </Sheet>
  );
}