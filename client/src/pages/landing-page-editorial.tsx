import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Camera,
  Wand2,
  Layers,
  ChevronDown,
  Play,
  Pause
} from "lucide-react";

/**
 * CELURA LANDING PAGE
 *
 * Design Philosophy: "Vogue meets Apple"
 * - Massive whitespace
 * - Editorial typography (Playfair Display + Inter)
 * - Invisible utility
 * - High-impact imagery
 * - Minimal UI, maximum impact
 */

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-rotate editorial slides
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % editorialSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const editorialSlides = [
    {
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80",
      caption: "The Art of Getting Dressed",
      subcaption: "Curated by AI, styled by you"
    },
    {
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
      caption: "Your Closet, Reimagined",
      subcaption: "Every piece has a purpose"
    },
    {
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80",
      caption: "Dress with Intention",
      subcaption: "Weather-aware recommendations"
    }
  ];

  const features = [
    {
      number: "01",
      title: "Capture",
      description: "AI removes backgrounds and catalogs your pieces automatically",
      icon: Camera
    },
    {
      number: "02",
      title: "Curate",
      description: "Smart algorithms learn your style DNA over time",
      icon: Wand2
    },
    {
      number: "03",
      title: "Compose",
      description: "Mix and match with an infinite outfit canvas",
      icon: Layers
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* Navigation - Minimal */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-[#F9F9F7]/90 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/">
              <motion.div
                className="flex items-center gap-3 cursor-pointer"
                whileHover={{ opacity: 0.7 }}
              >
                <span
                  className="font-serif text-2xl tracking-[0.2em] text-[#1A1A1A]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  CELURA
                </span>
              </motion.div>
            </Link>

            {/* Minimal Nav */}
            <div className="flex items-center gap-8">
              <Link href="/auth">
                <motion.span
                  className="hidden md:block text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer transition-colors"
                  whileHover={{ y: -1 }}
                >
                  Sign In
                </motion.span>
              </Link>
              <Link href="/auth?mode=signup">
                <motion.button
                  className="px-6 py-3 bg-[#1A1A1A] text-[#F9F9F7] text-sm font-medium tracking-wide"
                  whileHover={{ backgroundColor: "#80163A" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero - Full Screen Editorial */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <img
                src={editorialSlides[activeSlide].image}
                alt=""
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#F9F9F7]/60 via-transparent to-[#F9F9F7]" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xs font-semibold tracking-[0.3em] uppercase text-[#80163A] mb-8"
          >
            AI-Powered Wardrobe
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#1A1A1A] mb-6"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
              lineHeight: 1.0,
              letterSpacing: "-0.03em"
            }}
          >
            {editorialSlides[activeSlide].caption}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-lg md:text-xl text-[#6B6B6B] mb-12 max-w-xl mx-auto"
          >
            {editorialSlides[activeSlide].subcaption}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/auth?mode=signup">
              <motion.button
                className="group flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] text-[#F9F9F7] text-sm font-medium tracking-wide"
                whileHover={{ backgroundColor: "#80163A", gap: "16px" }}
                whileTap={{ scale: 0.98 }}
              >
                Begin Your Journey
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {editorialSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`h-0.5 transition-all duration-500 ${
                index === activeSlide
                  ? "w-12 bg-[#1A1A1A]"
                  : "w-6 bg-[#1A1A1A]/30 hover:bg-[#1A1A1A]/50"
              }`}
            />
          ))}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="ml-4 p-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-[#6B6B6B]" />
        </motion.div>
      </motion.section>

      {/* Features - Editorial Grid */}
      <section className="py-32 md:py-40 bg-[#F9F9F7]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          {/* Section Header */}
          <div className="max-w-2xl mb-20">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-semibold tracking-[0.3em] uppercase text-[#80163A] mb-6"
            >
              How It Works
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em"
              }}
              className="text-[#1A1A1A]"
            >
              A new way to experience your wardrobe
            </motion.h2>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-px bg-[#E5E5E5]">
            {features.map((feature, index) => (
              <motion.div
                key={feature.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-[#F9F9F7] p-10 md:p-12 group cursor-default"
              >
                <span className="text-xs font-mono text-[#D4AF37] tracking-wider">
                  {feature.number}
                </span>
                <div className="mt-8 mb-6">
                  <feature.icon className="w-8 h-8 text-[#1A1A1A] stroke-[1.5]" />
                </div>
                <h3
                  className="text-xl mb-4 text-[#1A1A1A]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {feature.title}
                </h3>
                <p className="text-[#6B6B6B] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Image Break */}
      <section className="relative h-[70vh] overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1600&q=80"
          alt="Fashion Editorial"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F9F9F7] via-transparent to-transparent" />

        {/* Floating Quote */}
        <div className="absolute bottom-20 left-0 right-0 text-center px-6">
          <motion.blockquote
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <p
              className="text-2xl md:text-3xl text-[#1A1A1A] italic mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              "Style is knowing who you are"
            </p>
            <cite className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] not-italic">
              — Celura Philosophy
            </cite>
          </motion.blockquote>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-32 bg-[#1A1A1A]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-semibold tracking-[0.3em] uppercase text-[#D4AF37] mb-12"
          >
            Trusted By Fashion Enthusiasts
          </motion.p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-20">
            {[
              { value: "50K+", label: "Active Users" },
              { value: "2M+", label: "Items Cataloged" },
              { value: "500K+", label: "Outfits Created" },
              { value: "4.9", label: "App Rating" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <p
                  className="text-4xl md:text-5xl text-[#F9F9F7] mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B]">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 md:py-40 bg-[#F9F9F7]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-8" />
            <h2
              className="text-[#1A1A1A] mb-8"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em"
              }}
            >
              Ready to transform your wardrobe experience?
            </h2>
            <p className="text-lg text-[#6B6B6B] mb-12 max-w-xl mx-auto">
              Join thousands who have discovered a smarter way to dress.
            </p>
            <Link href="/auth?mode=signup">
              <motion.button
                className="group inline-flex items-center gap-3 px-10 py-5 bg-[#1A1A1A] text-[#F9F9F7] text-sm font-medium tracking-wide"
                whileHover={{ backgroundColor: "#80163A", gap: "16px" }}
                whileTap={{ scale: 0.98 }}
              >
                Start Free Today
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-12 border-t border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <span
              className="font-serif text-lg tracking-[0.2em] text-[#1A1A1A]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              CELURA
            </span>
            <div className="flex items-center gap-8 text-sm text-[#6B6B6B]">
              <span className="hover:text-[#1A1A1A] cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-[#1A1A1A] cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-[#1A1A1A] cursor-pointer transition-colors">Contact</span>
            </div>
            <p className="text-xs text-[#9A9A9A]">
              © 2026 Celura. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
