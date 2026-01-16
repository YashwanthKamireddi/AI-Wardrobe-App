import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check, Star, PlayCircle, BarChart3, Grid3X3, ArrowDown, Sparkles } from "lucide-react";
import { InteractiveIngestion } from "@/components/landing/interactive-ingestion";
import { HeroPhonePreview } from "@/components/landing/hero-phone-preview";

// Helper components for animation
const StaggerText = ({ text, className, delayStr = 0 }: { text: string, className?: string, delayStr?: number }) => {
    return (
        <span className={`inline-block ${className}`}>
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: 20, opacity: 0, filter: "blur(5px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    transition={{ delay: delayStr + (i * 0.1), duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block mr-[0.25em]"
                >
                    {word}
                </motion.span>
            ))}
        </span>
    );
};

export function LandingPage() {
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 500], [0, 150]);
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

    return (
        <div className="min-h-screen w-full bg-[#FAF9F6] text-[#1a1a1a] font-sans relative overflow-x-hidden selection:bg-[#80163a] selection:text-white">

            {/* Film Grain Overlay */}
            <div className="grain" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-6 bg-[#FAF9F6]/80 backdrop-blur-md border-b border-[#1a1a1a]/5">
                <Link href="/">
                    <span className="text-xl tracking-[0.2em] font-bold cursor-pointer" style={{ fontFamily: "'Playfair Display', serif" }}>
                        CELURA.
                    </span>
                </Link>
                <div className="hidden md:flex items-center gap-10">
                    {["Vision", "Features", "Pricing"].map((item) => (
                        <a href={`#${item.toLowerCase()}`} key={item} className="text-xs uppercase tracking-[0.2em] font-medium text-gray-500 hover:text-[#80163a] transition-colors">
                            {item}
                        </a>
                    ))}
                </div>
                <Link href="/auth">
                    <button className="px-8 py-3 bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#80163a] transition-colors duration-300 shadow-lg hover:shadow-xl">
                        Enter Atelier
                    </button>
                </Link>
            </nav>

            {/* Hero Section: The "Workspace" */}
            <section id="vision" className="relative min-h-screen pt-32 pb-20 px-6 md:px-12 flex flex-col items-center justify-center overflow-hidden">

                {/* Split Background Effect */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[#F4F1EA] -z-10 hidden lg:block" />

                <div className="max-w-[1600px] w-full mx-auto grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Manifesto */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8 lg:pr-12"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1a1a1a]/10 bg-white/50 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#80163a] animate-pulse" />
                            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">System v1.0 Live</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair leading-tight text-[#1a1a1a] mb-8">
                            The Operating <span className="italic font-normal text-[#80163a]">System</span> <br className="hidden lg:block" />
                            Used By The Best Dressed.
                        </h1>

                        <p className="text-sm md:text-base text-gray-500 max-w-md leading-relaxed font-medium uppercase tracking-wide">
                            Stop scrolling. Start curating. <br />
                            Digitize, Analyize, and Compose with professional-grade tools designed for the modern collector.
                        </p>

                        <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
                            <Link href="/auth">
                                <button className="px-8 py-4 bg-[#1a1a1a] text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#80163a] transition-all hover:pl-10 group relative overflow-hidden">
                                    <span className="relative z-10">Request Access</span>
                                    <div className="absolute inset-0 bg-[#80163a] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                </button>
                            </Link>
                            <button className="px-8 py-4 bg-transparent border border-[#1a1a1a]/20 text-[#1a1a1a] text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:border-[#1a1a1a] transition-colors">
                                View Lookbook
                            </button>
                        </div>
                    </motion.div>

                    {/* Right: The Floating Interface */}
                    <motion.div
                        style={{ y: heroY, opacity: heroOpacity }}
                        className="relative h-full w-full flex items-center justify-center lg:justify-end"
                    >
                        {/* Abstract shapes */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#eaddd6] to-[#d6e0ea] rounded-full blur-[100px] opacity-60 pointer-events-none" />

                        {/* The Device (Real Preview) */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="relative z-10"
                        >
                            <HeroPhonePreview />
                        </motion.div>

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-[20%] right-[10%] bg-white p-4 rounded-xl shadow-lg border border-gray-100 max-w-[150px]"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-[8px] uppercase font-bold tracking-widest text-gray-400">Analysis</span>
                            </div>
                            <p className="text-xs font-bold leading-tight">Cost Per Wear: <span className="text-green-600">$1.20</span></p>
                        </motion.div>
                    </motion.div>
                </div>

                <motion.div
                    style={{ opacity: heroOpacity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-300 animate-bounce"
                >
                    <ArrowDown className="w-5 h-5" />
                </motion.div>
            </section>

            {/* Feature 01: Ingestion (The Magic) */}
            <section id="features" className="py-32 px-6 md:px-12 bg-white relative z-10">
                <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                    <div className="order-1 md:order-1 relative">
                        {/* Live Demo */}
                        <InteractiveIngestion />
                    </div>
                    <div className="order-1 md:order-2 space-y-8">
                        <span className="text-[#80163a] text-xs font-bold uppercase tracking-[0.2em] block">01. Ingestion</span>
                        <h2 className="text-4xl md:text-6xl font-playfair leading-none">From Chaos <br /> To Catalog.</h2>
                        <p className="text-gray-500 text-lg leading-relaxed max-w-md">
                            Our proprietary AI engine cleans, crops, and categorizes your wardrobe in seconds. Just snap and upload. We handle the rest.
                        </p>
                        <ul className="space-y-4 pt-4">
                            {["Auto-Background Removal", "Color Extraction", "Smart Categorization"].map((feature) => (
                                <li key={feature} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-[#1a1a1a]">
                                    <Check className="w-4 h-4 text-[#80163a]" /> {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Feature 02: Analytics (The Brain) */}
            <section className="py-32 px-6 md:px-12 bg-[#F4F1EA] text-[#1a1a1a] relative z-10 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full blur-[150px] opacity-60 transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8 relative z-10">
                        <span className="text-[#80163a] text-xs font-bold uppercase tracking-[0.2em] block">02. Intelligence</span>
                        <h2 className="text-5xl md:text-6xl font-playfair leading-none text-[#1a1a1a]">Wear Your <br /> Worth.</h2>
                        <p className="text-gray-500 text-lg leading-relaxed max-w-md">
                            Understand your wardrobe like an asset class. Track Cost Per Wear, utilization rates, and discover your true color season.
                        </p>
                        <Link href="/auth">
                            <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest border-b border-[#1a1a1a] pb-1 hover:text-[#80163a] hover:border-[#80163a] transition-colors">
                                View Analytics Demo <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>
                    <div className="relative z-10">
                        {/* Abstract Charts */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Total Value</p>
                                <p className="text-3xl font-playfair text-[#1a1a1a]">$12,450</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-[#e5e5e5] shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Utilization</p>
                                <p className="text-3xl font-playfair text-[#1a1a1a]">78%</p>
                            </div>
                            <div className="col-span-2 bg-white p-8 rounded-2xl border border-[#e5e5e5] relative overflow-hidden shadow-lg group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#80163a]/10 to-transparent rounded-bl-full pointer-events-none" />
                                <div className="relative z-10">
                                    <p className="text-[10px] uppercase tracking-widest text-[#80163a] mb-2 font-bold">Color Season</p>
                                    <h3 className="text-4xl font-playfair mb-4 text-[#1a1a1a]">Deep Autumn</h3>
                                    <div className="flex gap-2">
                                        {["#5d1a1a", "#8c3b1a", "#d9a031", "#2d3a28"].map(c => (
                                            <div key={c} className="w-8 h-8 rounded-full shadow-sm border border-[#1a1a1a]/10" style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 03: Compose (The Art) */}
            <section className="py-32 px-6 md:px-12 bg-[#FAF9F6] relative z-10">
                <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                        {/* Authentic Grid Preview */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Top Slot */}
                            <div className="aspect-[3/4] bg-[#F5F5F0] rounded-xl border border-[#e5e5e5] p-4 relative group cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                                <div className="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-bold text-gray-400">Top</div>
                                <img src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80" className="w-[80%] mx-auto mt-4 drop-shadow-xl" alt="White Linen Top" />
                                <div className="absolute bottom-3 right-3 w-6 h-6 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white"><Check className="w-3 h-3" /></div>
                            </div>
                            {/* Bottom Slot */}
                            <div className="aspect-[3/4] bg-white rounded-xl border border-gray-200 p-4 relative opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                                <div className="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-bold text-gray-400">Bottom</div>
                                <div className="absolute inset-0 flex items-center justify-center text-gray-300"><Grid3X3 className="w-8 h-8" /></div>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                            <div>
                                <p className="text-xs font-playfair font-bold">"Sunday Brunch"</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">2/5 Items Selected</p>
                            </div>
                            <button className="px-4 py-2 bg-[#1a1a1a] text-white text-[10px] uppercase tracking-widest rounded hover:bg-[#80163a] transition-colors">
                                Save Outfit
                            </button>
                        </div>
                    </div>

                    <div className="order-1 md:order-2 space-y-8">
                        <span className="text-[#80163a] text-xs font-bold uppercase tracking-[0.2em] block">03. Composition</span>
                        <h2 className="text-5xl md:text-6xl font-playfair leading-none text-[#1a1a1a]">Algorithms <br /> With Taste.</h2>
                        <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
                            Build outfits on an infinite canvas. Let our style engine suggest the missing piece, or curate your own lookbook for every occasion.
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Section - The Membership */}
            <section id="pricing" className="py-32 px-6 md:px-12 bg-white relative z-10 border-t border-gray-100">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-[#80163a] text-xs font-bold uppercase tracking-[0.2em] block mb-4">The Membership</span>
                    <h2 className="text-5xl md:text-6xl font-playfair mb-8 text-[#1a1a1a]">Private Atelier <br /> Access.</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 md:mt-20 max-w-4xl mx-auto items-stretch">
                        {/* Tier 1: Collector - Clean, Light */}
                        <div className="flex flex-col p-10 bg-[#FAF9F6] border border-[#e5e5e5] rounded-xl text-center hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                            <div className="mb-8">
                                <h3 className="font-playfair text-3xl mb-2 text-[#1a1a1a]">Collector</h3>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Essential Curation</p>
                            </div>

                            <div className="mb-8 relative inline-flex justify-center items-baseline gap-1">
                                <span className="text-2xl font-playfair text-[#1a1a1a] self-start">$</span>
                                <span className="text-6xl font-playfair text-[#1a1a1a] leading-none">29</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest self-end mb-1">/mo</span>
                            </div>

                            <div className="space-y-4 mb-10 flex-grow border-t border-b border-[#e5e5e5] py-8">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a]">Up to 50 Items</p>
                                <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Basic Analytics</p>
                                <p className="text-xs font-medium uppercase tracking-widest text-gray-500">Self-Service</p>
                            </div>

                            <Link href="/auth">
                                <button className="w-full py-4 bg-transparent border border-[#1a1a1a] text-[#1a1a1a] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#1a1a1a] hover:text-white transition-colors">
                                    Apply
                                </button>
                            </Link>
                        </div>

                        {/* Tier 2: Archivist - Premium, Dark */}
                        <div className="flex flex-col p-10 bg-[#1a1a1a] border border-[#1a1a1a] rounded-xl text-center overflow-hidden shadow-2xl relative group hover:-translate-y-1 transition-transform duration-300">
                            {/* Subtle Texture */}
                            <div className="absolute inset-0 bg-[#80163a] opacity-[0.05]" />

                            <div className="relative z-10 mb-8">
                                <h3 className="font-playfair text-3xl mb-2 text-white">Archivist</h3>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] opacity-90">Unlimited Access</p>
                            </div>

                            <div className="relative z-10 mb-8 inline-flex justify-center items-baseline gap-1">
                                <span className="text-2xl font-playfair text-white self-start">$</span>
                                <span className="text-6xl font-playfair text-white leading-none">99</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest self-end mb-1">/mo</span>
                            </div>

                            <div className="relative z-10 space-y-4 mb-10 flex-grow border-t border-b border-white/10 py-8">
                                <p className="text-xs font-bold uppercase tracking-widest text-white">Unlimited Items</p>
                                <p className="text-xs font-medium uppercase tracking-widest text-white/90">Advanced Metrics</p>
                                <p className="text-xs font-medium uppercase tracking-widest text-white/90">AI Personal Stylist</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mt-2">Priority Support</p>
                            </div>

                            <Link href="/auth">
                                <button className="relative z-10 w-full py-4 bg-white text-[#1a1a1a] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-[#1a1a1a] border border-white transition-colors">
                                    Become a Member
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer / CTA */}
            <section className="py-40 bg-white text-center px-6">
                <h2 className="text-6xl md:text-8xl font-playfair mb-12 text-[#1a1a1a]">
                    Ready to <br /> Curate?
                </h2>
                <Link href="/auth">
                    <button className="px-12 py-5 bg-[#1a1a1a] text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#80163a] transition-all hover:scale-105 shadow-2xl">
                        Request Access
                    </button>
                </Link>
                <p className="mt-8 text-xs text-gray-400 uppercase tracking-widest">Limited spots available for v1.0 Beta</p>
            </section>

        </div>
    );
}
