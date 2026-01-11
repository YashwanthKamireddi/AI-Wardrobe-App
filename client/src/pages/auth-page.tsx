import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { Eye, EyeOff, Loader2, Crown, Diamond, Star, ArrowRight } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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

// Luxury brand colors
const gold = "hsl(38, 75%, 55%)";
const goldDark = "hsl(38, 75%, 45%)";
const burgundy = "hsl(337, 73%, 26%)";
const burgundyDark = "hsl(337, 73%, 18%)";

export function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

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
      <div className="flex items-center justify-center min-h-screen" style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${gold} 0%, ${goldDark} 100%)` }}>
            <span className="font-serif text-2xl font-bold" style={{ color: burgundy }}>C</span>
          </div>
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: gold }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Immersive Luxury Brand Experience */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-between relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${burgundy} 0%, ${burgundyDark} 50%, hsl(337, 73%, 12%) 100%)` }}
      >
        {/* Premium Decorative Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, ${gold} 35px, ${gold} 70px)`,
          }} />
        </div>

        {/* Floating Gold Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] right-[15%] w-64 h-64 rounded-full blur-[100px]" style={{ background: `${gold}20` }} />
          <div className="absolute bottom-[20%] left-[10%] w-80 h-80 rounded-full blur-[120px]" style={{ background: `${gold}15` }} />
          <div className="absolute top-[60%] right-[30%] w-40 h-40 rounded-full blur-[80px]" style={{ background: `${gold}10` }} />
        </div>

        {/* Elegant Border Frame */}
        <div className="absolute inset-8 border rounded-3xl pointer-events-none" style={{ borderColor: `${gold}15` }} />
        <div className="absolute inset-12 border rounded-2xl pointer-events-none" style={{ borderColor: `${gold}08` }} />

        {/* Content */}
        <div className="relative z-10 p-12 lg:p-16">
          {/* Logo */}
          <Link href="/">
            <div className="inline-flex items-center gap-4 cursor-pointer group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                style={{ background: `linear-gradient(135deg, ${gold} 0%, ${goldDark} 100%)`, boxShadow: `0 10px 40px ${gold}40` }}
              >
                <span className="font-serif text-2xl font-bold" style={{ color: burgundy }}>C</span>
              </div>
              <div>
                <h1 className="font-serif text-3xl tracking-wider" style={{ color: gold }}>CELURA</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-8 h-px" style={{ background: `linear-gradient(90deg, ${gold}60, transparent)` }} />
                  <span className="text-xs tracking-[0.3em] uppercase opacity-60 text-white">Est. 2026</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex-1 flex items-center px-12 lg:px-16">
          <div className="space-y-10 max-w-lg">
            {/* Tagline */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5" style={{ color: gold }} />
                <span className="text-sm tracking-[0.25em] uppercase" style={{ color: `${gold}CC` }}>Luxury AI Fashion</span>
              </div>
              <h2 className="font-serif text-5xl xl:text-6xl leading-[1.15] text-white">
                Elevate Your
                <span className="block" style={{ color: gold }}>Personal Style</span>
              </h2>
              <p className="text-lg leading-relaxed text-white/70 max-w-md">
                Experience the future of fashion with AI-curated outfit recommendations that understand your unique aesthetic.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Diamond, label: "AI Styling", desc: "Smart recommendations" },
                { icon: Star, label: "Weather Aware", desc: "Daily suggestions" },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 group">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${gold}15`, border: `1px solid ${gold}25` }}
                  >
                    <feature.icon className="w-5 h-5" style={{ color: gold }} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{feature.label}</p>
                    <p className="text-sm text-white/50">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial or Quote */}
            <div
              className="p-6 rounded-2xl border backdrop-blur-sm"
              style={{ background: `${gold}05`, borderColor: `${gold}15` }}
            >
              <p className="text-white/80 italic leading-relaxed">
                "Where technology meets timeless elegance. Your wardrobe, reimagined."
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-8 h-px" style={{ background: gold }} />
                <span className="text-sm" style={{ color: `${gold}CC` }}>The Celura Philosophy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 p-12 lg:p-16">
          <p className="text-sm text-white/40">© 2026 Celura. Crafted with precision.</p>
        </div>
      </div>

      {/* Right Panel - Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/">
              <div className="inline-flex flex-col items-center gap-3 cursor-pointer">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
                  style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)`, boxShadow: `0 10px 40px ${burgundy}30` }}
                >
                  <span className="font-serif text-2xl font-bold" style={{ color: gold }}>C</span>
                </div>
                <div className="text-center">
                  <h1 className="font-serif text-2xl tracking-wider" style={{ color: burgundy }}>CELURA</h1>
                  <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Luxury AI Wardrobe</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl text-slate-900 mb-2">
                {isRegister ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-slate-500">
                {isRegister ? "Begin your luxury fashion journey" : "Sign in to your wardrobe"}
              </p>
            </div>

            {/* Form */}
            {!isRegister ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                  <FormField control={loginForm.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[hsl(337,73%,26%)] focus:ring-[hsl(337,73%,26%)]/20 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={loginForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[hsl(337,73%,26%)] focus:ring-[hsl(337,73%,26%)]/20 pr-12 transition-all"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-base font-medium transition-all group"
                    style={{
                      background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)`,
                      boxShadow: `0 4px 20px ${burgundy}30`
                    }}
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign in to Celura
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <FormField control={registerForm.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Username *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Choose a username"
                          className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[hsl(337,73%,26%)] focus:ring-[hsl(337,73%,26%)]/20 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={registerForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your name"
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[hsl(337,73%,26%)] focus:ring-[hsl(337,73%,26%)]/20 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={registerForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[hsl(337,73%,26%)] focus:ring-[hsl(337,73%,26%)]/20 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={registerForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Password *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[hsl(337,73%,26%)] focus:ring-[hsl(337,73%,26%)]/20 pr-12 transition-all"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={registerForm.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Confirm Password *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[hsl(337,73%,26%)] focus:ring-[hsl(337,73%,26%)]/20 pr-12 transition-all"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-base font-medium transition-all group"
                    style={{
                      background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)`,
                      boxShadow: `0 4px 20px ${burgundy}30`
                    }}
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Join Celura
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {/* Toggle Link */}
            <div className="text-center pt-4 border-t border-slate-100">
              <p className="text-slate-500 text-sm">
                {isRegister ? (
                  <>Already have an account? <button onClick={() => setIsRegister(false)} className="font-semibold hover:underline transition-colors" style={{ color: burgundy }}>Sign in</button></>
                ) : (
                  <>New to Celura? <button onClick={() => setIsRegister(true)} className="font-semibold hover:underline transition-colors" style={{ color: burgundy }}>Create account</button></>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
