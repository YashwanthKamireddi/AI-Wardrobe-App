import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2, User, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FashionAuthFrame from "@/components/ui/fashion-auth-frame";

// Zod schemas for form validation
const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

const registerSchema = loginSchema.extend({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(100, "Email is too long")
    .optional()
    .or(z.literal("")),
  confirmPassword: z
    .string()
    .min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Redirect authenticated users to home
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => setLocation("/"), 100);
      return () => clearTimeout(timer);
    }
  }, [user, setLocation]);

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      email: "",
    },
  });

  // Handle login submission
  const handleLogin = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync({
        username: data.username,
        password: data.password,
      });
      // Redirect will happen via useEffect when user state updates
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error("Login error:", error);
    }
  };

  // Handle register submission
  const handleRegister = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      
      // Clean up optional fields
      const cleanData = {
        username: registerData.username,
        password: registerData.password,
        ...(registerData.name && registerData.name.trim() && { name: registerData.name.trim() }),
        ...(registerData.email && registerData.email.trim() && { email: registerData.email.trim() }),
      };
      
      await registerMutation.mutateAsync(cleanData);
      // Redirect will happen via useEffect when user state updates
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error("Registration error:", error);
    }
  };

  // Show loading spinner if checking auth status
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </motion.div>
        <motion.p 
          className="text-muted-foreground mt-4 text-sm font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          Loading your fashion experience...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
      <FashionAuthFrame 
        title="Welcome to Cher's Closet"
        subtitle="Your personal fashion stylist awaits"
        backgroundType="minimal"
        className="flex items-center justify-center min-h-screen p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-sm bg-white/90 border-amber-200/50 shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                  Enter Your Fashion Universe
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Sign in to access your wardrobe or create a new account to begin your style journey
                </CardDescription>
              </motion.div>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-amber-100/50">
                  <TabsTrigger 
                    value="login"
                    data-testid="tab-login"
                    className="data-[state=active]:bg-white data-[state=active]:text-amber-700"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    data-testid="tab-register"
                    className="data-[state=active]:bg-white data-[state=active]:text-amber-700"
                  >
                    Create Account
                  </TabsTrigger>
                </TabsList>

                  <TabsContent value="login" className="space-y-4 mt-0">
                    <div>
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-amber-700">Username</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="Enter your username"
                                      className="pl-10 border-amber-200 focus:border-amber-400"
                                      data-testid="input-login-username"
                                      {...field}
                                    />
                                  </div>
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
                                <FormLabel className="text-amber-700">Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      type={showPassword ? "text" : "password"}
                                      placeholder="Enter your password"
                                      className="pl-10 pr-10 border-amber-200 focus:border-amber-400"
                                      data-testid="input-login-password"
                                      {...field}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                      aria-label={showPassword ? "Hide password" : "Show password"}
                                      data-testid="button-toggle-login-password"
                                    >
                                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2.5 shadow-lg transition-all duration-200"
                            disabled={loginMutation.isPending}
                            data-testid="button-login-submit"
                          >
                            {loginMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing In...
                              </>
                            ) : (
                              "Sign In"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4 mt-0">
                    <div>
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-amber-700">Username *</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="Choose a username"
                                      className="pl-10 border-amber-200 focus:border-amber-400"
                                      data-testid="input-register-username"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-amber-700">Name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        placeholder="Your name"
                                        className="pl-10 border-amber-200 focus:border-amber-400"
                                        data-testid="input-register-name"
                                        {...field}
                                      />
                                    </div>
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
                                  <FormLabel className="text-amber-700">Email</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        className="pl-10 border-amber-200 focus:border-amber-400"
                                        data-testid="input-register-email"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-amber-700">Password *</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      type={showPassword ? "text" : "password"}
                                      placeholder="Create a password"
                                      className="pl-10 pr-10 border-amber-200 focus:border-amber-400"
                                      data-testid="input-register-password"
                                      {...field}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                      aria-label={showPassword ? "Hide password" : "Show password"}
                                      data-testid="button-toggle-register-password"
                                    >
                                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                  </div>
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
                                <FormLabel className="text-amber-700">Confirm Password *</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      type={showConfirmPassword ? "text" : "password"}
                                      placeholder="Confirm your password"
                                      className="pl-10 pr-10 border-amber-200 focus:border-amber-400"
                                      data-testid="input-register-confirm-password"
                                      {...field}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                      data-testid="button-toggle-register-confirm-password"
                                    >
                                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2.5 shadow-lg transition-all duration-200"
                            disabled={registerMutation.isPending}
                            data-testid="button-register-submit"
                          >
                            {registerMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Account...
                              </>
                            ) : (
                              "Create Account"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter>
              <div className="text-center text-sm text-muted-foreground w-full">
                <p className="leading-relaxed">
                  {activeTab === "login" ? (
                    <>
                      Don't have an account?{" "}
                      <button
                        onClick={() => setActiveTab("register")}
                        className="text-amber-600 hover:text-amber-700 font-medium underline-offset-4 hover:underline transition-colors"
                        data-testid="link-switch-to-register"
                      >
                        Create one now
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        onClick={() => setActiveTab("login")}
                        className="text-amber-600 hover:text-amber-700 font-medium underline-offset-4 hover:underline transition-colors"
                        data-testid="link-switch-to-login"
                      >
                        Sign in here
                      </button>
                    </>
                  )}
                </p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </FashionAuthFrame>
    </div>
  );
}