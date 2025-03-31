import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, KeyRound, User, Mail, Lock } from "lucide-react";

// Animation Components
import FashionAuthFrame from "@/components/ui/fashion-auth-frame";
import SilkUnwrapping from "@/components/ui/silk-unwrapping";
import SparkleEffect from "@/components/ui/sparkle-effect";
import GoldenThread from "@/components/ui/golden-thread";
import LuxuryFeatureGuide from "@/components/ui/luxury-feature-guide";
import { motion, AnimatePresence } from "framer-motion";

// Form validation schemas
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

function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeView, setActiveView] = useState<"login" | "register">("login");
  const [showSilkUnwrap, setShowSilkUnwrap] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Show silk unwrapping effect on first render
  useEffect(() => {
    setShowSilkUnwrap(true);
  }, []);

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

  // Determine if we're on login or register page from URL
  const isRegisterPage = location.includes('/register') || location.includes('/signup');
  
  // Set active view based on URL on component mount
  useEffect(() => {
    setActiveView(isRegisterPage ? "register" : "login");
  }, [isRegisterPage]);

  // Form container animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // Input field animation variants with staggered appearance
  const inputVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        delay: 0.1 * custom,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  return (
    <SilkUnwrapping isRevealing={showSilkUnwrap} luxuryLevel="haute-couture">
      <FashionAuthFrame
        title={activeView === "login" ? "Welcome Back" : "Join Cher's Closet"} 
        subtitle={activeView === "login" 
          ? "Sign in to access your curated wardrobe" 
          : "Create your account for AI-powered styling"}
        backgroundType="monogram"
      >
        <div className="w-full flex flex-col items-center relative">
          {/* Toggle between login and register */}
          <div className="flex w-full mb-8 relative">
            <div 
              className="w-1/2 text-center py-2 cursor-pointer relative z-10"
              onClick={() => setActiveView("login")}
            >
              <span className={`font-medium transition-colors ${activeView === "login" ? "text-amber-500" : "text-amber-500/50"}`}>
                Sign In
              </span>
            </div>
            <div 
              className="w-1/2 text-center py-2 cursor-pointer relative z-10"
              onClick={() => setActiveView("register")}
            >
              <span className={`font-medium transition-colors ${activeView === "register" ? "text-amber-500" : "text-amber-500/50"}`}>
                Register
              </span>
            </div>
            
            {/* Animated indicator */}
            <motion.div 
              className="absolute bottom-0 h-0.5 bg-amber-500"
              initial={false}
              animate={{
                x: activeView === "login" ? "0%" : "100%",
                width: "50%"
              }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
              }}
            />
          </div>

          {/* Form container */}
          <div className="w-full relative">
            <AnimatePresence mode="wait">
              {activeView === "login" ? (
                <motion.div
                  key="login-form"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                >
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                      <motion.div variants={inputVariants} custom={1} initial="hidden" animate="visible">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-500/80 flex items-center gap-2">
                                <User size={16} className="text-amber-500/60" />
                                Username
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="Enter username"
                                    {...field}
                                    className="input-luxury bg-transparent"
                                  />
                                  <div className="absolute inset-0 pointer-events-none rounded-md" 
                                    style={{
                                      background: "linear-gradient(90deg, rgba(251, 191, 36, 0) 0%, rgba(251, 191, 36, 0.05) 100%)"
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={inputVariants} custom={2} initial="hidden" animate="visible">
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-500/80 flex items-center gap-2">
                                <KeyRound size={16} className="text-amber-500/60" />
                                Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                    className="input-luxury bg-transparent"
                                  />
                                  <div className="absolute inset-0 pointer-events-none rounded-md"
                                    style={{
                                      background: "linear-gradient(90deg, rgba(251, 191, 36, 0) 0%, rgba(251, 191, 36, 0.05) 100%)"
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={inputVariants} custom={3} initial="hidden" animate="visible">
                        <SparkleEffect count={8} size={6} triggerOnScroll={false} className="mt-8">
                          <Button
                            type="submit"
                            className="w-full btn-gold-animated hover:shadow-lg"
                            disabled={loginMutation.isPending}
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
                        </SparkleEffect>
                      </motion.div>
                    </form>
                  </Form>
                </motion.div>
              ) : (
                <motion.div
                  key="register-form"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full"
                >
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                      <motion.div variants={inputVariants} custom={1} initial="hidden" animate="visible">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-500/80 flex items-center gap-2">
                                <User size={16} className="text-amber-500/60" />
                                Username
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="Enter username"
                                    {...field}
                                    className="input-luxury bg-transparent"
                                  />
                                  <div className="absolute inset-0 pointer-events-none rounded-md"
                                    style={{
                                      background: "linear-gradient(90deg, rgba(251, 191, 36, 0) 0%, rgba(251, 191, 36, 0.05) 100%)"
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={inputVariants} custom={2} initial="hidden" animate="visible">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-500/80 flex items-center gap-2">
                                <User size={16} className="text-amber-500/60" />
                                Full Name
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="Your full name"
                                    {...field}
                                    value={field.value || ''}
                                    className="input-luxury bg-transparent"
                                  />
                                  <div className="absolute inset-0 pointer-events-none rounded-md"
                                    style={{
                                      background: "linear-gradient(90deg, rgba(251, 191, 36, 0) 0%, rgba(251, 191, 36, 0.05) 100%)"
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={inputVariants} custom={3} initial="hidden" animate="visible">
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-500/80 flex items-center gap-2">
                                <Mail size={16} className="text-amber-500/60" />
                                Email (Optional)
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    {...field}
                                    className="input-luxury bg-transparent"
                                  />
                                  <div className="absolute inset-0 pointer-events-none rounded-md"
                                    style={{
                                      background: "linear-gradient(90deg, rgba(251, 191, 36, 0) 0%, rgba(251, 191, 36, 0.05) 100%)"
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <div className="pt-2">
                        <div className="relative">
                          <Separator className="my-4" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-amber-950/5 px-2 text-xs text-amber-500/70">SECURE PASSWORD</span>
                          </div>
                        </div>
                      </div>

                      <motion.div variants={inputVariants} custom={4} initial="hidden" animate="visible">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-500/80 flex items-center gap-2">
                                <Lock size={16} className="text-amber-500/60" />
                                Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                    className="input-luxury bg-transparent"
                                  />
                                  <div className="absolute inset-0 pointer-events-none rounded-md"
                                    style={{
                                      background: "linear-gradient(90deg, rgba(251, 191, 36, 0) 0%, rgba(251, 191, 36, 0.05) 100%)"
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={inputVariants} custom={5} initial="hidden" animate="visible">
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-amber-500/80 flex items-center gap-2">
                                <Lock size={16} className="text-amber-500/60" />
                                Confirm Password
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                    className="input-luxury bg-transparent"
                                  />
                                  <div className="absolute inset-0 pointer-events-none rounded-md"
                                    style={{
                                      background: "linear-gradient(90deg, rgba(251, 191, 36, 0) 0%, rgba(251, 191, 36, 0.05) 100%)"
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={inputVariants} custom={6} initial="hidden" animate="visible">
                        <SparkleEffect count={8} size={6} triggerOnScroll={false} className="mt-8">
                          <Button
                            type="submit"
                            className="w-full btn-gold-animated hover:shadow-lg"
                            disabled={registerMutation.isPending}
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
                        </SparkleEffect>
                      </motion.div>
                    </form>
                  </Form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom decoration */}
          <div className="mt-12 w-full overflow-hidden h-10">
            <GoldenThread 
              pathType="wave" 
              thickness={1}
              color="rgba(251, 191, 36, 0.6)"
              duration={3}
              repeat={true}
            />
          </div>
        </div>
      </FashionAuthFrame>
    </SilkUnwrapping>
  );
}

export default AuthPage;