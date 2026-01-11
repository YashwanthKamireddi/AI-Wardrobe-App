import { useState } from "react";
import { Settings, Bell, HelpCircle, LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useAuth } from "@/hooks/use-auth";

export default function UserSettings() {
  const { user, logoutMutation } = useAuth();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-serif">Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-muted-foreground">Member</p>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Notifications</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Push notifications</span>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </div>

          <Separator />

          {/* Help */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Help & Support</h3>
            <Button variant="outline" className="w-full justify-start">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help Center
            </Button>
          </div>

          <Separator />

          {/* Account */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Account</h3>
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
