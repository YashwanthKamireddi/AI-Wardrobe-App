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
    <FashionPatternBackground pattern="fabric" density="light" color="primary" className="min-h-[100dvh]">
      <div className="min-h-[100dvh] relative bg-gradient-to-tr from-white/90 via-white/95 to-white/90 dark:from-black/90 dark:via-black/95 dark:to-black/90">
        {/* Fashion-themed decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {/* Top decorative ribbon */}
          <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-primary/80 via-pink-500/80 to-primary/80" />
          
          {/* Decorative elements - floating fashion icons - hidden on small screens */}
          <motion.div
            className="absolute top-[20%] left-[5%] text-primary/30 hidden sm:block"
            animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Shirt size={40} />
          </motion.div>
          
          <motion.div
            className="absolute top-[35%] right-[8%] text-pink-500/30 hidden sm:block"
            animate={{ y: [0, -15, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          >
            <Palette size={48} />
          </motion.div>
          
          <motion.div
            className="absolute bottom-[25%] left-[12%] text-purple-500/30 hidden sm:block"
            animate={{ y: [0, 12, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Sun size={36} />
          </motion.div>
          
          <motion.div
            className="absolute bottom-[15%] right-[15%] text-primary/20 hidden sm:block"
            animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <Umbrella size={32} />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-8 h-full relative z-10">
          <div className="flex flex-col md:grid md:grid-cols-5 gap-6 md:gap-8 md:items-center min-h-[calc(100dvh-4rem)]">
            {/* Fashion Branding Section - Collapsed on mobile */}
            <div className="md:col-span-3 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-4 md:mb-6">
                  <FashionLogo size="xl" className="hidden md:block" />
                  <FashionLogo size="lg" className="md:hidden" />
                </div>

                <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 md:mb-6 bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                  Your AI Fashion Stylist
                </h1>

                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-8 max-w-2xl">
                  Discover your perfect style with AI-powered outfit recommendations based on your mood, the weather, 
                  and your personal wardrobe collection.
                </p>

                <div className="flex flex-wrap gap-2 mb-4 md:mb-8">
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
              </motion.div>
            </div>

            {/* Auth Forms */}
            <div className="md:col-span-2 flex items-center justify-center p-0 md:p-4 auth-form-container">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-md"
              >
                <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border border-primary/20 shadow-lg auth-card">
                  <Tabs defaultValue="login" className="w-full">
                    <CardHeader className="pb-2">
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <FashionLogo size="sm" />
                        </div>
                        <TabsList className="w-full !border-none">
                          <TabsTrigger value="login" className="flex-1 !border-none after:!hidden before:!hidden">Login</TabsTrigger>
                          <TabsTrigger value="register" className="flex-1 !border-none after:!hidden before:!hidden">Register</TabsTrigger>
                        </TabsList>
                        <CardDescription className="mt-0">
                          Your personal AI stylist for perfect outfits
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <TabsContent value="login" className="auth-tabs-content">
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="auth-form">
                          <CardContent className="space-y-4 pt-2 auth-card-content">
                            <FormField
                              control={loginForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem className="form-row">
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="username" {...field} className="bg-white/50 dark:bg-slate-800/50 form-control" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={loginForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem className="form-row">
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="••••••" {...field} className="bg-white/50 dark:bg-slate-800/50 form-control" />
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

                    <TabsContent value="register" className="auth-tabs-content">
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="auth-form">
                          <CardContent className="space-y-4 pt-2 auth-card-content">
                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem className="form-row">
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="username" {...field} className="bg-white/50 dark:bg-slate-800/50 form-control" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem className="form-row">
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your name" {...field} value={field.value || ''} className="bg-white/50 dark:bg-slate-800/50 form-control" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem className="form-row">
                                  <FormLabel>Email (Optional)</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="email@example.com" {...field} className="bg-white/50 dark:bg-slate-800/50 form-control" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem className="form-row">
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="••••••" {...field} className="bg-white/50 dark:bg-slate-800/50 form-control" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem className="form-row">
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="••••••" {...field} className="bg-white/50 dark:bg-slate-800/50 form-control" />
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