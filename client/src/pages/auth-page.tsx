import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

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

// Modernized 3D Card Tilt Component with subtler effect
function CardTilt({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]); // Reduced rotation range for subtler effect
  const rotateY = useTransform(x, [-100, 100], [-5, 5]); // Reduced rotation range for subtler effect
  
  // More refined animations with gentler spring
  const springConfig = { damping: 30, stiffness: 100 }; // Slower, smoother movement
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Dampen the effect by reducing the input values
    x.set(mouseX * 0.7); // Reduced sensitivity
    y.set(mouseY * 0.7); // Reduced sensitivity
  }
  
  function handleMouseLeave() {
    // Smoother return to neutral position
    x.set(0);
    y.set(0);
  }
  
  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 1500, // Increased for subtler effect
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.01 }} // Subtler hover scaling
      className="relative w-full"
    >
      {/* Minimalist card shadow */}
      <div 
        className="absolute -inset-1 bg-amber-300/10 dark:bg-amber-700/10 rounded-xl blur-lg opacity-40" // More subtle shadow
        style={{ transformStyle: "preserve-3d", transform: "translateZ(-8px)" }}
      />
      
      {/* Card content */}
      <div className="relative w-full">
        {children}
      </div>
      
      {/* Subtle reflective highlight */}
      <motion.div 
        className="absolute inset-0 rounded-xl bg-gradient-to-tr from-amber-100/5 to-amber-50/10 dark:from-amber-700/5 dark:to-amber-800/5 pointer-events-none" // More subtle gradient
        style={{ 
          transformStyle: "preserve-3d", 
          transform: "translateZ(1px)", // Reduced height
          backgroundBlendMode: "overlay"
        }}
      />
    </motion.div>
  );
}

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
    hidden: { 
      opacity: 0, 
      y: 20
    },
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
        duration: 0.25,
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
          backgroundType="minimal"
        >
        <div className="w-full flex flex-col items-center relative">
          {/* Toggle between login and register - more minimal */}
          <div className="flex w-full mb-5 relative">
            <div 
              className="w-1/2 text-center py-1 cursor-pointer relative z-10"
              onClick={() => setActiveView("login")}
            >
              <span className={`font-light tracking-widest uppercase text-xs transition-colors ${activeView === "login" ? "text-amber-500/90" : "text-amber-500/30"}`}>
                Sign In
              </span>
            </div>
            <div 
              className="w-1/2 text-center py-1 cursor-pointer relative z-10"
              onClick={() => setActiveView("register")}
            >
              <span className={`font-light tracking-widest uppercase text-xs transition-colors ${activeView === "register" ? "text-amber-500/90" : "text-amber-500/30"}`}>
                Register
              </span>
            </div>
            
            {/* Refined animated indicator */}
            <motion.div 
              className="absolute bottom-0 h-[0.5px] bg-amber-500/40"
              initial={false}
              animate={{
                x: activeView === "login" ? "0%" : "100%",
                width: "50%"
              }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1]
              }}
            />
          </div>

          {/* Form container with subtle 3D tilt effect */}
          <div className="w-full relative h-[440px]">
            <CardTilt>
              <AnimatePresence mode="wait" initial={false}>
                {activeView === "login" ? (
                <motion.div
                  key="login-form"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full absolute inset-0"
                >
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                      <motion.div variants={inputVariants} custom={1} initial="hidden" animate="visible">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="form-label-minimal">
                                <User className="input-icon" />
                                Username
                              </FormLabel>
                              <FormControl>
                                <div className="input-container-minimal">
                                  <Input
                                    placeholder="Enter username"
                                    {...field}
                                    className="input-minimal"
                                  />
                                  <div className="input-focus-line" />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs opacity-70 mt-1 ml-1" />
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
                              <FormLabel className="form-label-minimal">
                                <KeyRound className="input-icon" />
                                Password
                              </FormLabel>
                              <FormControl>
                                <div className="input-container-minimal">
                                  <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                    className="input-minimal"
                                  />
                                  <div className="input-focus-line" />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs opacity-70 mt-1 ml-1" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={inputVariants} custom={3} initial="hidden" animate="visible">
                        <SparkleEffect count={5} size={4} triggerOnScroll={false} className="mt-10">
                          <Button
                            type="submit"
                            className="btn-submit-minimal w-full"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin opacity-70" />
                                Signing In
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
                  className="w-full absolute inset-0"
                >
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3">
                      <motion.div variants={inputVariants} custom={1} initial="hidden" animate="visible">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="form-label-minimal">
                                <User className="input-icon" />
                                Username
                              </FormLabel>
                              <FormControl>
                                <div className="input-container-minimal">
                                  <Input
                                    placeholder="Enter username"
                                    {...field}
                                    className="input-minimal"
                                  />
                                  <div className="input-focus-line" />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs opacity-70 mt-1 ml-1" />
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
                              <FormLabel className="form-label-minimal">
                                <User className="input-icon" />
                                Full Name
                              </FormLabel>
                              <FormControl>
                                <div className="input-container-minimal">
                                  <Input
                                    placeholder="Your full name"
                                    {...field}
                                    value={field.value || ''}
                                    className="input-minimal"
                                  />
                                  <div className="input-focus-line" />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs opacity-70 mt-1 ml-1" />
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
                              <FormLabel className="form-label-minimal">
                                <Mail className="input-icon" />
                                Email (Optional)
                              </FormLabel>
                              <FormControl>
                                <div className="input-container-minimal">
                                  <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    {...field}
                                    className="input-minimal"
                                  />
                                  <div className="input-focus-line" />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs opacity-70 mt-1 ml-1" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <Separator className="separator-minimal my-2" />

                      <motion.div variants={inputVariants} custom={4} initial="hidden" animate="visible">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="form-label-minimal">
                                <Lock className="input-icon" />
                                Password
                              </FormLabel>
                              <FormControl>
                                <div className="input-container-minimal">
                                  <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                    className="input-minimal"
                                  />
                                  <div className="input-focus-line" />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs opacity-70 mt-1 ml-1" />
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
                              <FormLabel className="form-label-minimal">
                                <Lock className="input-icon" />
                                Confirm Password
                              </FormLabel>
                              <FormControl>
                                <div className="input-container-minimal">
                                  <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                    className="input-minimal"
                                  />
                                  <div className="input-focus-line" />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs opacity-70 mt-1 ml-1" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={inputVariants} custom={6} initial="hidden" animate="visible">
                        <SparkleEffect count={5} size={4} triggerOnScroll={false} className="mt-4">
                          <Button
                            type="submit"
                            className="btn-submit-minimal w-full"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin opacity-70 mr-2" />
                                Creating Account
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
            </CardTilt>
          </div>

          {/* Minimalist bottom decoration */}
          <div className="mt-6 w-full overflow-hidden h-6 opacity-30">
            <GoldenThread 
              pathType="wave" 
              thickness={0.5}
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