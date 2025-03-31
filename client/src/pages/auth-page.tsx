import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Cloud, Shirt, Palette, Sun, Umbrella } from "lucide-react";
import { FashionLogo } from "@/components/ui/fashion-logo";
import { FashionPatternBackground } from "@/components/ui/fashion-pattern-background";
import { motion } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const registerSchema = insertUserSchema
  .pick({
    username: true,
    password: true,
    name: true,
    email: true,
  })
  .extend({
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }).optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation, isLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      email: "",
    },
  });

  function onLoginSubmit(values: LoginValues) {
    loginMutation.mutate(values);
  }

  function onRegisterSubmit(values: RegisterValues) {
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(userData);
  }

  return (
    <FashionPatternBackground pattern="fabric" density="light" color="primary" className="min-h-screen">
      <div className="min-h-screen relative bg-gradient-to-tr from-white/90 via-white/95 to-white/90 dark:from-black/90 dark:via-black/95 dark:to-black/90">
        {/* Fashion-themed decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {/* Top decorative ribbon */}
          <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-primary/80 via-pink-500/80 to-primary/80" />
          
          {/* Decorative elements - floating fashion icons */}
          <motion.div
            className="absolute top-[20%] left-[5%] text-primary/30"
            animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Shirt size={40} />
          </motion.div>
          
          <motion.div
            className="absolute top-[35%] right-[8%] text-pink-500/30"
            animate={{ y: [0, -15, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          >
            <Palette size={48} />
          </motion.div>
          
          <motion.div
            className="absolute bottom-[25%] left-[12%] text-purple-500/30"
            animate={{ y: [0, 12, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Sun size={36} />
          </motion.div>
          
          <motion.div
            className="absolute bottom-[15%] right-[15%] text-primary/20"
            animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <Umbrella size={32} />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 py-8 h-full relative z-10">
          <div className="grid md:grid-cols-5 gap-8 items-center min-h-screen">
            {/* Fashion Branding Section */}
            <div className="md:col-span-3 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6">
                  <FashionLogo size="xl" />
                </div>

                <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                  Your AI Fashion Stylist
                </h1>

                <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                  Discover your perfect style with AI-powered outfit recommendations based on your mood, the weather, 
                  and your personal wardrobe collection.
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 text-primary px-3 py-1 text-sm border-primary/20">
                    <Cloud className="w-3.5 h-3.5 mr-1.5" />
                    Weather-Based Styling
                  </Badge>
                  <Badge variant="outline" className="bg-pink-500/5 hover:bg-pink-500/10 text-pink-500 px-3 py-1 text-sm border-pink-500/20">
                    <Shirt className="w-3.5 h-3.5 mr-1.5" />
                    Wardrobe Management
                  </Badge>
                  <Badge variant="outline" className="bg-purple-500/5 hover:bg-purple-500/10 text-purple-500 px-3 py-1 text-sm border-purple-500/20">
                    <Palette className="w-3.5 h-3.5 mr-1.5" />
                    Mood-Based Recommendations
                  </Badge>
                  <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 text-primary px-3 py-1 text-sm border-primary/20">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    AI-Powered Fashion Advice
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
                  <motion.div 
                    className="flex flex-col items-center text-center p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 shadow-sm"
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Shirt className="h-10 w-10 mb-3 text-primary" />
                    <h3 className="font-medium text-lg mb-2">Smart Wardrobe</h3>
                    <p className="text-muted-foreground text-sm">Organize your clothing with AI categorization</p>
                  </motion.div>
                  
                  <motion.div 
                    className="flex flex-col items-center text-center p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 shadow-sm"
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Cloud className="h-10 w-10 mb-3 text-primary" />
                    <h3 className="font-medium text-lg mb-2">Weather Aware</h3>
                    <p className="text-muted-foreground text-sm">Dress appropriately for any weather</p>
                  </motion.div>
                  
                  <motion.div 
                    className="flex flex-col items-center text-center p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 shadow-sm"
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Palette className="h-10 w-10 mb-3 text-primary" />
                    <h3 className="font-medium text-lg mb-2">Express Yourself</h3>
                    <p className="text-muted-foreground text-sm">Fashion that matches your mood</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Auth Forms */}
            <div className="md:col-span-2 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-md"
              >
                <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-primary/20 shadow-lg">
                  <Tabs defaultValue="login">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <FashionLogo size="sm" />
                        <TabsList>
                          <TabsTrigger value="login">Login</TabsTrigger>
                          <TabsTrigger value="register">Register</TabsTrigger>
                        </TabsList>
                      </div>
                      <CardDescription className="mt-2">
                        Your personal AI stylist for perfect outfits
                      </CardDescription>
                    </CardHeader>

                    <TabsContent value="login">
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                          <CardContent className="space-y-4 pt-2">
                            <FormField
                              control={loginForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="username" {...field} className="bg-white/50 dark:bg-slate-800/50" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={loginForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="••••••" {...field} className="bg-white/50 dark:bg-slate-800/50" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                          <CardFooter>
                            <Button
                              type="submit"
                              className="w-full bg-gradient-to-r from-primary to-pink-500 hover:opacity-90"
                              disabled={loginMutation.isPending}
                            >
                              {loginMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Logging in...
                                </>
                              ) : (
                                "Log in"
                              )}
                            </Button>
                          </CardFooter>
                        </form>
                      </Form>
                    </TabsContent>

                    <TabsContent value="register">
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                          <CardContent className="space-y-4 pt-2">
                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="username" {...field} className="bg-white/50 dark:bg-slate-800/50" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your name" {...field} value={field.value || ''} className="bg-white/50 dark:bg-slate-800/50" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email (Optional)</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="email@example.com" {...field} className="bg-white/50 dark:bg-slate-800/50" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="••••••" {...field} className="bg-white/50 dark:bg-slate-800/50" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="••••••" {...field} className="bg-white/50 dark:bg-slate-800/50" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                          <CardFooter>
                            <Button
                              type="submit"
                              className="w-full bg-gradient-to-r from-primary to-pink-500 hover:opacity-90"
                              disabled={registerMutation.isPending}
                            >
                              {registerMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Creating account...
                                </>
                              ) : (
                                "Create Account"
                              )}
                            </Button>
                          </CardFooter>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </FashionPatternBackground>
  );
}