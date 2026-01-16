import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { Eye, EyeOff, Loader2, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/hooks/use-auth";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * AUTH PAGE - "THE CURATION DESK" (MOODBOARD LAYOUT)
 *
 * Design Philosophy:
 * - Matches Landing Page "Digital Atelier" theme (Cream #FDFBF7, Burgundy #80163a).
 * - "Un-SaaS": No generic cards or split screens.
 * - Feels like a fashion editor's desk or a moodboard.
 * - Floating, asymmetric imagery (Polaroid style).
 * - Minimalist "Underline" inputs for high-end editorial feel.
 */

const loginSchema = z.object({
    username: z.string().min(3, "Username required"),
    password: z.string().min(6, "Password required"),
});

const registerSchema = loginSchema.extend({
    name: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    confirmPassword: z.string().min(6, "Confirm password"),
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

    const urlParams = new URLSearchParams(window.location.search);
    const initialMode = urlParams.get('mode') === 'signup';
    const [isRegister, setIsRegister] = useState(initialMode);

    useEffect(() => {
        if (user) {
            setTimeout(() => setLocation("/home"), 500);
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
        try { await loginMutation.mutateAsync(data); } catch { }
    };

    const handleRegister = async (data: RegisterFormData) => {
        try {
            const { confirmPassword, ...rest } = data;
            await registerMutation.mutateAsync({
                username: rest.username,
                password: rest.password,
                ...(rest.name && { name: rest.name }),
                ...(rest.email && { email: rest.email }),
            });
        } catch { }
    };

    if (isLoading || user) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-[#80163a] text-white flex items-center justify-center font-playfair font-bold text-xl rounded-sm animate-pulse">C</div>
            </div>
        )
    }

    // Floating Images Animation Variants
    const floatAnim = {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen w-full bg-[#FAF9F6] text-[#1a1a1a] font-sans relative overflow-hidden selection:bg-[#80163a] selection:text-white">

            {/* Film Grain Overlay */}
            <div className="grain" />

            {/* Decorative Grid / Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: "linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

            {/* Navigation (Absolute Top) */}
            <nav className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
                <Link href="/">
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-8 h-8 bg-[#1a1a1a] text-white flex items-center justify-center font-playfair font-bold text-lg rounded-sm group-hover:bg-[#80163a] transition-colors">C</div>
                        <span className="font-playfair font-bold text-xl tracking-wider hidden md:block">CELURA</span>
                    </div>
                </Link>
                <Link href="/">
                    <button className="text-[10px] font-bold uppercase tracking-widest border-b border-transparent hover:border-[#1a1a1a] transition-all">
                        Return to Boutique
                    </button>
                </Link>
            </nav>

            {/* Main Content Area */}
            <div className="min-h-screen flex items-center justify-center relative z-10 px-6 py-20">

                {/* MOODBOARD ELEMENTS (Hidden on mobile, visible on desktop) */}
                <div className="hidden lg:block absolute inset-0 pointer-events-none">
                    {/* Image 1: Top Left - Fabric/Texture */}
                    <motion.div
                        variants={floatAnim} initial="initial" animate="animate"
                        className="absolute top-[15%] left-[10%] w-48 aspect-[3/4] bg-white p-2 shadow-xl rotate-[-6deg]"
                    >
                        <img src="https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?w=400&q=80" className="w-full h-full object-cover" alt="Texture" />
                    </motion.div>

                    {/* Image 2: Bottom Right - Street Style */}
                    <motion.div
                        variants={floatAnim} initial="initial" animate="animate" transition={{ delay: 0.2 }}
                        className="absolute bottom-[10%] right-[10%] w-64 aspect-[3/4] bg-white p-2 shadow-xl rotate-[3deg]"
                    >
                        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80" className="w-full h-full object-cover grayscale" alt="Fashion" />
                    </motion.div>

                    {/* Image 3: Far Right - Detail */}
                    <motion.div
                        variants={floatAnim} initial="initial" animate="animate" transition={{ delay: 0.4 }}
                        className="absolute top-[20%] right-[5%] w-40 aspect-square bg-[#80163a] p-1 shadow-lg rotate-[12deg] flex items-center justify-center"
                    >
                        <div className="w-full h-full border border-white/20 flex items-center justify-center text-white font-playfair italic text-2xl text-center leading-none p-4">
                            "Style is eternal."
                        </div>
                    </motion.div>
                </div>

                {/* FORM CONTAINER - Centered, Minimal, Editorial */}
                <div className="w-full max-w-md relative z-10 mx-6 md:mx-0">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-8 md:p-0 rounded-2xl md:rounded-none shadow-lg md:shadow-none border border-[#eee] md:border-none"
                    >
                        {/* Header */}
                        <div className="mb-12 text-center md:text-left">
                            <span className="text-[#80163a] text-xs font-bold uppercase tracking-[0.2em] mb-3 block">
                                {isRegister ? "New Member" : "Members Only"}
                            </span>
                            <h1 className="text-5xl md:text-6xl font-playfair text-[#1a1a1a] mb-4 leading-[0.9]">
                                {isRegister ? "Join the" : "Enter the"} <br />
                                <span className="italic">Atelier.</span>
                            </h1>
                            <p className="text-[#666] text-sm md:max-w-xs leading-relaxed">
                                {isRegister
                                    ? "Begin your journey to a perfectly curated digital wardrobe."
                                    : "Welcome back. Your personal style algorithm is ready."}
                            </p>
                        </div>

                        {/* Unified Form */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isRegister ? "reg" : "log"}
                                initial={{ opacity: 0, x: isRegister ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isRegister ? -20 : 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {isRegister ? (
                                    <Form {...registerForm}>
                                        <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-8">
                                            <div className="grid grid-cols-2 gap-6">
                                                <FormField
                                                    control={registerForm.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-0">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] block mb-2">Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Your Name" className="border-0 border-b border-[#ddd] rounded-none px-0 py-2 h-auto text-base focus-visible:ring-0 focus-visible:border-[#80163a] bg-transparent" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={registerForm.control}
                                                    name="username"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-0">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] block mb-2">Username</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="username" className="border-0 border-b border-[#ddd] rounded-none px-0 py-2 h-auto text-base focus-visible:ring-0 focus-visible:border-[#80163a] bg-transparent" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={registerForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] block mb-2">Email</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="email@example.com" className="border-0 border-b border-[#ddd] rounded-none px-0 py-2 h-auto text-base focus-visible:ring-0 focus-visible:border-[#80163a] bg-transparent" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={registerForm.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] block mb-2">Password</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="••••••••" className="border-0 border-b border-[#ddd] rounded-none px-0 py-2 h-auto text-lg focus-visible:ring-0 focus-visible:border-[#80163a] bg-transparent" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={registerForm.control}
                                                name="confirmPassword"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] block mb-2">Confirm</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="••••••••" className="border-0 border-b border-[#ddd] rounded-none px-0 py-2 h-auto text-lg focus-visible:ring-0 focus-visible:border-[#80163a] bg-transparent" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="pt-4">
                                                <Button type="submit" className="w-full h-14 bg-[#1a1a1a] text-white hover:bg-[#80163a] rounded-none uppercase tracking-widest text-xs font-bold transition-all px-6 group" disabled={registerMutation.isPending}>
                                                    <span>Create Profile</span>
                                                    {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                ) : (
                                    <Form {...loginForm}>
                                        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-8">
                                            <FormField
                                                control={loginForm.control}
                                                name="username"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] block mb-2">Username</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Type your username..." className="border-0 border-b border-[#ddd] rounded-none px-0 py-2 h-auto text-lg focus-visible:ring-0 focus-visible:border-[#80163a] bg-transparent placeholder:text-[#999]" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={loginForm.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <div className="flex justify-between items-baseline mb-2">
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">Password</FormLabel>
                                                            <span className="text-[10px] uppercase text-[#80163a] cursor-pointer hover:underline">Forgot?</span>
                                                        </div>
                                                        <div className="relative">
                                                            <FormControl>
                                                                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="border-0 border-b border-[#ddd] rounded-none px-0 py-2 h-auto text-lg focus-visible:ring-0 focus-visible:border-[#80163a] bg-transparent pr-8" {...field} />
                                                            </FormControl>
                                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-2 text-[#999] hover:text-[#1a1a1a]">
                                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                            </button>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="pt-4">
                                                <Button type="submit" className="w-full h-14 bg-[#1a1a1a] text-white hover:bg-[#80163a] rounded-none uppercase tracking-widest text-xs font-bold transition-all px-6 group" disabled={loginMutation.isPending}>
                                                    <span>Secure Login</span>
                                                    {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Footer Switch */}
                        <div className="mt-8 text-center md:text-left">
                            <p className="text-[#666] text-sm">
                                {isRegister ? "Already hold an account?" : "No account yet?"}
                                <button
                                    onClick={() => setIsRegister(!isRegister)}
                                    className="ml-2 font-bold text-[#1a1a1a] border-b border-[#1a1a1a] pb-0.5 hover:text-[#80163a] hover:border-[#80163a] transition-all uppercase text-xs tracking-wider"
                                >
                                    {isRegister ? "Sign In" : "Apply for Access"}
                                </button>
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}

export default AuthPage;
