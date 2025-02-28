import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Grid2X2, 
  Home, 
  Shirt, 
  ShoppingBag, 
  LogOut, 
  Menu, 
  User, 
  Settings 
} from "lucide-react";

export default function NavigationBar() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Wardrobe", path: "/wardrobe", icon: <Shirt className="h-5 w-5" /> },
    { name: "Outfits", path: "/outfits", icon: <ShoppingBag className="h-5 w-5" /> },
    { name: "Inspiration", path: "/inspirations", icon: <Grid2X2 className="h-5 w-5" /> },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const userInitials = user?.name 
    ? getInitials(user.name) 
    : user?.username 
      ? user.username.substring(0, 2).toUpperCase() 
      : "CC";

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>

            <a href="/" className="flex items-center gap-2">
              {/* More subtle logo design */}
              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-primary/20 shadow-sm flex items-center justify-center">
                <span className="text-primary font-bold text-xl">CC</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-xl">Cher's Closet</span>
                <span className="text-xs text-muted-foreground">Style with Weather</span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location === item.path ? "secondary" : "ghost"}
                className="flex items-center gap-2"
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.profilePicture || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                CC
              </div>
              <span>Cher's Closet</span>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-2 mt-8">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location === item.path ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Button>
            ))}

            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => {
                navigate("/profile");
                setMobileOpen(false);
              }}
            >
              <User className="h-5 w-5" />
              <span className="ml-2">Profile</span>
            </Button>

            <Button
              variant="ghost"
              className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10 mt-4"
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-2">Log out</span>
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}