import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check, Sparkles, Shirt, Calendar, BarChart3, Zap } from "lucide-react";
import { useRef } from "react";

/**
 * LANDING PAGE - Premium AI Wardrobe
 *
 * Clean, sophisticated design that communicates value
 * Light theme with subtle gradients and purposeful animations
 */

const EASE = [0.22, 1, 0.36, 1];

export function LandingPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <div ref={containerRef} className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

            {/* Navigation */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            >
                <div className="max-w-6xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-xl rounded-full px-6 py-3 border border-gray-100">
                    <Link href="/">
                        <span className="text-xl font-bold tracking-tight cursor-pointer">
                            Vessura<span className="text-[#80163A]">.</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</a>
                        <a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</a>
                    </div>

                    <Link href="/auth">
                        <motion.button
                            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Get Started
                        </motion.button>
                    </Link>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">

                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 via-white to-white pointer-events-none" />
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-100 rounded-full blur-[100px] opacity-50" />
                <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-pink-100 rounded-full blur-[100px] opacity-40" />

                <motion.div
                    className="relative z-10 text-center max-w-4xl mx-auto"
                    style={{ opacity: heroOpacity }}
                >
                    {/* Badge */}
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
                    >
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-600">Now in public beta</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
                    >
                        Your wardrobe,
                        <br />
                        <span className="bg-gradient-to-r from-[#80163A] to-purple-600 bg-clip-text text-transparent">
                            intelligently curated
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
                    >
                        Digitize your wardrobe, get AI-powered outfit suggestions,
                        and make smarter fashion decisions. Your personal stylist, always available.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9, ease: EASE }}
                    >
                        <Link href="/auth">
                            <motion.span
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-medium rounded-full cursor-pointer hover:bg-gray-800 transition-colors"
                                whileHover={{ scale: 1.02, gap: '12px' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Start for free <ArrowRight className="w-4 h-4" />
                            </motion.span>
                        </Link>
                        <a href="#features">
                            <span className="inline-flex items-center gap-2 px-8 py-4 text-gray-600 font-medium cursor-pointer hover:text-gray-900 transition-colors">
                                See how it works
                            </span>
                        </a>
                    </motion.div>

                    {/* Social Proof */}
                    <motion.div
                        className="flex items-center justify-center gap-4 mt-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 1.2, ease: EASE }}
                    >
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white"
                                />
                            ))}
                        </div>
                        <p className="text-sm text-gray-500">
                            <span className="font-semibold text-gray-900">2,400+</span> curators already joined
                        </p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 md:py-32 px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">

                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: EASE }}
                    >
                        <span className="text-sm font-medium text-[#80163A] uppercase tracking-wider mb-4 block">
                            Features
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Everything you need
                        </h2>
                        <p className="text-lg text-gray-500 max-w-xl mx-auto">
                            A complete system to manage, style, and optimize your wardrobe
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Shirt,
                                title: "Digital Wardrobe",
                                description: "Catalog every item with AI-powered categorization and color detection"
                            },
                            {
                                icon: Sparkles,
                                title: "AI Stylist",
                                description: "Get personalized outfit suggestions based on weather and occasion"
                            },
                            {
                                icon: Calendar,
                                title: "Outfit Calendar",
                                description: "Plan your looks ahead and never repeat outfits accidentally"
                            },
                            {
                                icon: BarChart3,
                                title: "Analytics",
                                description: "Track cost-per-wear and identify your best investments"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
                            >
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 md:py-32 px-6">
                <div className="max-w-6xl mx-auto">

                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: EASE }}
                    >
                        <span className="text-sm font-medium text-[#80163A] uppercase tracking-wider mb-4 block">
                            How it works
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Three simple steps
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Upload your clothes",
                                description: "Take photos of your wardrobe items. Our AI handles the rest - categorizing, detecting colors, and organizing everything."
                            },
                            {
                                step: "02",
                                title: "Get styled by AI",
                                description: "Receive personalized outfit suggestions based on weather, your schedule, and style preferences. Mix and match effortlessly."
                            },
                            {
                                step: "03",
                                title: "Track & optimize",
                                description: "See what you actually wear, discover neglected items, and make informed decisions about future purchases."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className="relative"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.15, ease: EASE }}
                            >
                                <span className="text-6xl font-bold text-gray-100 mb-4 block">{item.step}</span>
                                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-24 md:py-32 px-6 bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto text-center">

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: EASE }}
                    >
                        <span className="text-sm font-medium text-[#80163A] uppercase tracking-wider mb-4 block">
                            Pricing
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Start free, upgrade anytime
                        </h2>
                        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-12">
                            Full access to all features. No credit card required.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
                    >
                        {/* Free */}
                        <div className="bg-gray-800 p-8 rounded-2xl text-left">
                            <h3 className="text-xl font-semibold mb-2">Free</h3>
                            <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-500">/mo</span></div>
                            <ul className="space-y-3 mb-8">
                                {["Up to 50 items", "AI outfit suggestions", "Weather integration", "Basic analytics"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-300">
                                        <Check className="w-4 h-4 text-green-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/auth">
                                <span className="block w-full py-3 border border-gray-600 text-center rounded-full font-medium hover:bg-gray-700 transition-colors cursor-pointer">
                                    Get Started
                                </span>
                            </Link>
                        </div>

                        {/* Pro */}
                        <div className="bg-white text-gray-900 p-8 rounded-2xl text-left relative overflow-hidden">
                            <div className="absolute top-4 right-4 px-3 py-1 bg-[#80163A] text-white text-xs font-medium rounded-full">
                                Popular
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Pro</h3>
                            <div className="text-4xl font-bold mb-6">$9<span className="text-lg text-gray-500">/mo</span></div>
                            <ul className="space-y-3 mb-8">
                                {["Unlimited items", "Advanced AI styling", "Cost-per-wear tracking", "Priority support"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-600">
                                        <Check className="w-4 h-4 text-[#80163A]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/auth">
                                <span className="block w-full py-3 bg-gray-900 text-white text-center rounded-full font-medium hover:bg-gray-800 transition-colors cursor-pointer">
                                    Start Free Trial
                                </span>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 md:py-32 px-6">
                <motion.div
                    className="max-w-3xl mx-auto text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: EASE }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        Ready to transform your wardrobe?
                    </h2>
                    <p className="text-lg text-gray-500 mb-10">
                        Join thousands who've already discovered a smarter way to style.
                    </p>
                    <Link href="/auth">
                        <motion.span
                            className="inline-flex items-center gap-2 px-10 py-5 bg-gray-900 text-white font-medium rounded-full cursor-pointer hover:bg-gray-800 transition-colors"
                            whileHover={{ scale: 1.02, gap: '12px' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Get started for free <ArrowRight className="w-5 h-5" />
                        </motion.span>
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-gray-100">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <span className="text-xl font-bold tracking-tight">
                        Vessura<span className="text-[#80163A]">.</span>
                    </span>
                    <span className="text-sm text-gray-400">
                        © 2024 Vessura. All rights reserved.
                    </span>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
