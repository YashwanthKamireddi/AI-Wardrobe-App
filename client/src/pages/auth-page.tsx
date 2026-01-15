import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { Eye, EyeOff, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/hooks/use-auth";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { LuxuryInput } from "@/components/ui/luxury-input";
import { PlinthButton } from "@/components/ui/plinth-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { HapticFeedback } from "@/lib/haptics";

// Light Theme colors
const burgundy = "#80163a";
const gold = "#D4A54A";

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

  // Read mode from URL params
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
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#faf9f7]">
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, rgba(128, 22, 58, 0.05) 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 80%, rgba(212, 165, 74, 0.05) 0%, transparent 50%)`
        }}
      />

      {/* Decorative line */}
      <div
        className="absolute left-1/2 top-0 h-32 w-px -translate-x-1/2"
        style={{ background: `linear-gradient(180deg, ${burgundy}, transparent)` }}
      />

      {/* Back to home */}
      <Link href="/">
        <motion.button
          whileHover={{ x: -2 }}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </motion.button>
      </Link>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 flex items-center justify-center rounded-xl shadow-md"
              style={{ background: `linear-gradient(135deg, ${burgundy} 0%, #9b1b4a 100%)` }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-serif text-3xl tracking-[0.2em] text-slate-900">CELURA</span>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-[420px] bg-white rounded-2xl p-8 sm:p-10 shadow-xl border border-slate-200"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 mb-2">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-slate-500 text-sm">
              {isRegister ? "Start your style journey" : "Sign in to continue"}
            </p>
          </div>

          {/* Forms */}
          {!isRegister ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField control={loginForm.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Username"
                        className="h-12 px-4 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-slate-300 focus:border-slate-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs mt-1.5 text-red-500" />
                  </FormItem>
                )} />

                <FormField control={loginForm.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="h-12 px-4 pr-11 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-slate-300 focus:border-slate-300"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs mt-1.5 text-red-500" />
                  </FormItem>
                )} />

                <LuxuryButton
                  type="submit"
                  className="w-full h-12 rounded-xl text-sm font-medium tracking-wide mt-6"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </LuxuryButton>
              </form>
            </Form>
          ) : (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-3">
                <FormField control={registerForm.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Username"
                        className="h-12 px-4 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-slate-300 focus:border-slate-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs mt-1 text-red-500" />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-3">
                  <FormField control={registerForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Full name"
                          className="h-12 px-4 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-slate-300 focus:border-slate-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs mt-1 text-red-500" />
                    </FormItem>
                  )} />

                  <FormField control={registerForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email"
                          className="h-12 px-4 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-slate-300 focus:border-slate-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs mt-1 text-red-500" />
                    </FormItem>
                  )} />
                </div>

                <FormField control={registerForm.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="h-12 px-4 pr-11 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-slate-300 focus:border-slate-300"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs mt-1 text-red-500" />
                  </FormItem>
                )} />

                <FormField control={registerForm.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          className="h-12 px-4 pr-11 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-slate-300 focus:border-slate-300"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs mt-1 text-red-500" />
                  </FormItem>
                )} />

                <LuxuryButton
                  type="submit"
                  className="w-full h-12 rounded-xl text-sm font-medium tracking-wide mt-4"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </LuxuryButton>
              </form>
            </Form>
          )}

          {/* Toggle */}
          <div className="mt-6 text-center">
            <span className="text-slate-500 text-sm">
              {isRegister ? "Already have an account? " : "Don't have an account? "}
            </span>
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: burgundy }}
            >
              {isRegister ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
