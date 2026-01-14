import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Shirt,
  CloudSun,
  Palette,
  ArrowRight,
  Crown,
  Star,
  Zap,
  Heart,
  Camera,
  Wand2,
  CheckCircle,
  ChevronRight,
  Play,
  Layers,
  BarChart3,
  Calendar,
  Eye,
  Smartphone,
  Monitor,
  ScanLine
} from "lucide-react";

// Brand colors
const burgundy = "hsl(337, 73%, 26%)";
const burgundyDark = "hsl(337, 73%, 18%)";
const gold = "hsl(38, 75%, 55%)";

export function LandingPage() {
  const [, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Camera,
      title: "Smart Capture",
      description: "AI removes backgrounds and detects colors instantly",
      color: "#ec4899"
    },
    {
      icon: Wand2,
      title: "Style DNA",
      description: "Personalized recommendations based on your unique style",
      color: "#8b5cf6"
    },
    {
      icon: CloudSun,
      title: "Weather Aware",
      description: "Outfits perfectly suited for today's conditions",
      color: "#3b82f6"
    },
    {
      icon: Calendar,
      title: "Plan Ahead",
      description: "Schedule outfits for the week with outfit calendar",
      color: "#10b981"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] overflow-x-hidden">
      {/* Premium Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-black/5 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
              >
                <span className="text-white font-serif text-lg font-medium">C</span>
              </div>
              <span className="font-serif text-xl tracking-tight text-slate-900">Celura</span>
            </div>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {["Features", "How it Works", "Pricing"].map((item) => (
                <button
                  key={item}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-all"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/auth">
                <button className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href="/auth">
                <button
                  className="px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
                >
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Apple Style */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-40 md:pb-32">
        {/* Background Gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.15]"
            style={{
              background: `radial-gradient(circle, ${burgundy} 0%, transparent 70%)`
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8 animate-fade-up">
            <Sparkles className="w-4 h-4" style={{ color: gold }} />
            <span className="text-sm font-medium text-slate-700">AI-Powered Fashion Assistant</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-slate-900 mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
            Your Style,
            <br />
            <span className="bg-gradient-to-r from-[hsl(337,73%,26%)] to-[hsl(337,73%,40%)] bg-clip-text text-transparent">
              Perfected
            </span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '200ms' }}>
            Discover your unique style DNA with AI that learns your preferences,
            analyzes your wardrobe, and creates perfect outfits for any occasion.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <Link href="/auth">
              <button
                className="group flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-full transition-all hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)`,
                  boxShadow: `0 4px 24px ${burgundy}40`
                }}
              >
                Start for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <button className="flex items-center gap-2 px-6 py-4 text-base font-medium text-slate-700 hover:text-slate-900 rounded-full hover:bg-white hover:shadow-md transition-all">
              <Play className="w-5 h-5" style={{ color: burgundy }} />
              Watch Demo
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-slate-200 animate-fade-up" style={{ animationDelay: '400ms' }}>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">50K+</div>
              <div className="text-sm text-slate-500">Active Users</div>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">4.9</div>
              <div className="text-sm text-slate-500 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                Rating
              </div>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">2M+</div>
              <div className="text-sm text-slate-500">Outfits Created</div>
            </div>
          </div>
        </div>

        {/* Hero Image/Mockup */}
        <div className="relative max-w-5xl mx-auto mt-16 px-6">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-slate-100 to-white border border-slate-200 shadow-2xl">
            <div className="aspect-[16/9] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
              {/* App Preview Mock */}
              <div className="grid grid-cols-3 gap-4 p-8 w-full max-w-4xl">
                {/* Wardrobe Preview */}
                <div className="col-span-1 bg-white rounded-xl shadow-lg p-4 animate-fade-up" style={{ animationDelay: '500ms' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Shirt className="w-4 h-4" style={{ color: burgundy }} />
                    <span className="text-sm font-semibold text-slate-900">Wardrobe</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-slate-100 to-slate-200" />
                    ))}
                  </div>
                </div>

                {/* Main Outfit Card */}
                <div className="col-span-1 bg-white rounded-xl shadow-xl p-4 transform scale-110 animate-fade-up" style={{ animationDelay: '600ms' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-900">Today's Look</span>
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-700">Perfect Match</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-20 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200" />
                    <div className="h-24 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800" />
                    <div className="h-12 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200" />
                  </div>
                </div>

                {/* Weather & Mood */}
                <div className="col-span-1 space-y-4 animate-fade-up" style={{ animationDelay: '700ms' }}>
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CloudSun className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-semibold text-slate-900">Weather</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">22°C</div>
                    <div className="text-xs text-slate-500">Partly Cloudy</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span className="text-sm font-semibold text-slate-900">Mood</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {['😊', '💼', '🎉', '☕'].map((emoji, i) => (
                        <span key={i} className={`text-lg p-1 rounded ${i === 0 ? 'bg-rose-100' : ''}`}>{emoji}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -left-4 top-1/4 bg-white rounded-xl shadow-lg p-3 animate-fade-up hidden md:flex items-center gap-2" style={{ animationDelay: '800ms' }}>
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">AI Powered</span>
          </div>

          <div className="absolute -right-4 top-1/3 bg-white rounded-xl shadow-lg p-3 animate-fade-up hidden md:flex items-center gap-2" style={{ animationDelay: '900ms' }}>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Style Match 98%</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-medium text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From AI-powered styling to weather-based recommendations,
              Celura has all the tools to elevate your fashion game.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
                  activeFeature === index
                    ? "bg-white shadow-xl border-2 border-slate-900 scale-[1.02]"
                    : "bg-slate-50 hover:bg-white hover:shadow-lg border-2 border-transparent"
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${feature.color}15` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Extended Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: ScanLine, title: "Style Scanner", desc: "Scan any item to check if it matches your style", color: "#f97316" },
              { icon: BarChart3, title: "Style Analytics", desc: "Track your wardrobe usage and discover patterns", color: "#06b6d4" },
              { icon: Palette, title: "Color Palette", desc: "Discover which colors complement your skin tone", color: "#ec4899" },
              { icon: Layers, title: "Outfit Builder", desc: "Mix and match items to create new looks", color: "#8b5cf6" },
              { icon: Eye, title: "Virtual Closet", desc: "Your entire wardrobe, organized digitally", color: "#10b981" },
              { icon: Crown, title: "Style Profile", desc: "AI learns and adapts to your preferences", color: gold },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}15` }}
                >
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-medium text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Camera,
                title: "Upload Your Wardrobe",
                desc: "Take photos of your clothes. Our AI automatically removes backgrounds, detects colors, and categorizes items."
              },
              {
                step: "02",
                icon: Wand2,
                title: "Get Personalized Outfits",
                desc: "Receive daily outfit suggestions based on weather, your mood, and upcoming occasions."
              },
              {
                step: "03",
                icon: Sparkles,
                title: "Discover Your Style",
                desc: "Build your style DNA, track what you wear, and get smarter recommendations over time."
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-slate-300" />
                )}
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="absolute -top-4 left-8 px-3 py-1 bg-slate-900 text-white text-sm font-bold rounded-full">
                    {item.step}
                  </div>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ background: `${burgundy}10` }}
                  >
                    <item.icon className="w-7 h-7" style={{ color: burgundy }} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Platform Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                <Smartphone className="w-4 h-4" />
                Available Everywhere
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-medium text-slate-900 mb-6">
                Your Style, <br />Any Device
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Access your wardrobe and get outfit recommendations wherever you are.
                Seamlessly sync across all your devices with our responsive design.
              </p>

              <div className="flex flex-col gap-4">
                {[
                  { icon: Monitor, text: "Beautiful on desktop browsers" },
                  { icon: Smartphone, text: "Optimized for mobile devices" },
                  { icon: Zap, text: "Lightning fast performance" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Mockups */}
            <div className="relative">
              <div className="relative">
                {/* Desktop mockup */}
                <div className="bg-slate-200 rounded-xl p-2 shadow-xl">
                  <div className="bg-slate-800 rounded-lg aspect-[16/10] flex items-center justify-center">
                    <span className="text-slate-400 text-sm">Desktop Preview</span>
                  </div>
                </div>

                {/* Mobile mockup overlaid */}
                <div className="absolute -bottom-8 -right-4 w-32 bg-slate-900 rounded-2xl p-1.5 shadow-2xl">
                  <div className="bg-white rounded-xl aspect-[9/16] flex items-center justify-center">
                    <span className="text-slate-400 text-xs">Mobile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
        />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-6">
            Ready to Transform <br />Your Wardrobe?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of fashion-forward individuals who have already discovered
            their perfect style with Celura.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth">
              <button className="group flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-full hover:shadow-xl transition-all hover:-translate-y-1">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <button className="px-8 py-4 text-white font-medium rounded-full border border-white/30 hover:bg-white/10 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${gold} 0%, ${burgundy} 100%)` }}
                >
                  <span className="text-white font-serif text-lg font-medium">C</span>
                </div>
                <span className="font-serif text-2xl">Celura</span>
              </div>
              <p className="text-slate-400 max-w-xs">
                Your AI-powered personal stylist. Discover your style DNA and look amazing every day.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2026 Celura. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
