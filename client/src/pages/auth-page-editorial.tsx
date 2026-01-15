import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/hooks/use-auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

/**
 * AUTH PAGE - EDITORIAL MINIMAL
 *
 * Design: Clean, typography-focused
 * Split layout on desktop, full on mobile
 */

const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "At least 2 characters").max(50).optional().or(z.literal("")),
  email: z.string().email("Invalid email").max(100).optional().or(z.literal("")),
  confirmPassword: z.string().min(6, "At least 6 characters"),
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

  const urlParams = new URLSearchParams(window.location.search);
  const initialMode = urlParams.get('mode') === 'signup';
  const [isRegister, setIsRegister] = useState(initialMode);

  useEffect(() => {
    if (user) {
      setTimeout(() => setLocation("/home"), 300);
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", confirmPassword: "", name: "", email: "" },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...rest } = data;
      const cleanData = {
        username: rest.username,
        password: rest.password,
        ...(rest.name?.trim() && { name: rest.name.trim() }),
        ...(rest.email?.trim() && { email: rest.email.trim() }),
      };
      await registerMutation.mutateAsync(cleanData);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]">
        <div className="w-8 h-8 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = `
    w-full h-14 px-0 py-4 bg-transparent
    text-[#1A1A1A] text-base placeholder:text-[#9A9A9A]
    border-0 border-b border-[#E5E5E5]
    focus:border-[#1A1A1A] focus:ring-0 focus:outline-none
    transition-colors duration-300
  `;

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex">
      {/* Left Side - Editorial Image (Desktop Only) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F9F9F7]/20 to-transparent" />

        {/* Floating Text */}
        <div className="absolute bottom-16 left-16 right-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-white text-xs tracking-[0.3em] uppercase mb-4"
          >
            Your Wardrobe, Elevated
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-white text-4xl italic"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            "Style is a way to say who you are without having to speak"
          </motion.h2>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Header */}
        <header className="px-8 py-6 flex items-center justify-between">
          <Link href="/">
            <motion.button
              whileHover={{ x: -4 }}
              className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </motion.button>
          </Link>
          <span
            className="font-serif text-xl tracking-[0.2em] text-[#1A1A1A]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            CELURA
          </span>
        </header>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Title */}
              <h1
                className="text-[#1A1A1A] mb-4"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "2.5rem",
                  lineHeight: 1.1
                }}
              >
                {isRegister ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-[#6B6B6B] mb-12">
                {isRegister
                  ? "Start your journey to effortless style"
                  : "Sign in to continue your style journey"}
              </p>

              {/* Forms */}
              <AnimatePresence mode="wait">
                {!isRegister ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <input
                                  placeholder="Username"
                                  className={inputClass}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs mt-2 text-[#B44141]" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className={inputClass}
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors"
                                  >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs mt-2 text-[#B44141]" />
                            </FormItem>
                          )}
                        />

                        <motion.button
                          type="submit"
                          disabled={loginMutation.isPending}
                          className="w-full h-14 bg-[#1A1A1A] text-[#F9F9F7] text-sm font-medium tracking-wide mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ backgroundColor: "#80163A" }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {loginMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                          ) : (
                            "Sign In"
                          )}
                        </motion.button>
                      </form>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <input
                                  placeholder="Username"
                                  className={inputClass}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-xs mt-2 text-[#B44141]" />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <input
                                    placeholder="Full name"
                                    className={inputClass}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs mt-2 text-[#B44141]" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <input
                                    type="email"
                                    placeholder="Email"
                                    className={inputClass}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs mt-2 text-[#B44141]" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className={inputClass}
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors"
                                  >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs mt-2 text-[#B44141]" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm password"
                                    className={inputClass}
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors"
                                  >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs mt-2 text-[#B44141]" />
                            </FormItem>
                          )}
                        />

                        <motion.button
                          type="submit"
                          disabled={registerMutation.isPending}
                          className="w-full h-14 bg-[#1A1A1A] text-[#F9F9F7] text-sm font-medium tracking-wide mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{ backgroundColor: "#80163A" }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {registerMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                          ) : (
                            "Create Account"
                          )}
                        </motion.button>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toggle */}
              <div className="mt-10 text-center">
                <span className="text-[#6B6B6B] text-sm">
                  {isRegister ? "Already have an account? " : "Don't have an account? "}
                </span>
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-sm font-medium text-[#1A1A1A] hover:text-[#80163A] transition-colors underline underline-offset-4"
                >
                  {isRegister ? "Sign In" : "Sign Up"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-8 py-6 text-center">
          <p className="text-xs text-[#9A9A9A]">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </footer>
      </div>
    </div>
  );
}

export default AuthPage;
