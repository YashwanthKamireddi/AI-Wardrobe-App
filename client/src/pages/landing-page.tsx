import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Shirt,
  CloudSun,
  Palette,
  ArrowRight,
  Crown,
  Star,
  Users,
  Zap,
  Shield,
  Heart,
  TrendingUp,
  Camera,
  Wand2,
  CheckCircle,
  Play,
  ChevronRight,
  Instagram,
  Twitter,
  Linkedin,
  Layers
} from "lucide-react";

// Brand colors
const gold = "hsl(38, 75%, 55%)";
const goldLight = "hsl(38, 75%, 70%)";
const burgundy = "hsl(337, 73%, 26%)";
const burgundyDark = "hsl(337, 73%, 18%)";
const burgundyLight = "hsl(337, 73%, 35%)";

// Animated counter component
function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

// Testimonial data
const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Fashion Blogger",
    avatar: "SM",
    content: "Celura transformed how I plan my outfits. The AI recommendations are incredibly accurate and save me hours every week.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Creative Director",
    content: "Finally, a wardrobe app that understands personal style. The weather integration is a game-changer for my busy schedule.",
    avatar: "MC",
    rating: 5
  },
  {
    name: "Emma Rodriguez",
    role: "Entrepreneur",
    avatar: "ER",
    content: "I've tried many wardrobe apps, but Celura's luxury feel and intelligent suggestions are in a league of their own.",
    rating: 5
  }
];

// How it works steps
const howItWorks = [
  {
    step: 1,
    icon: Camera,
    title: "Capture Your Wardrobe",
    description: "Simply photograph your clothing items and let our AI categorize and organize them automatically."
  },
  {
    step: 2,
    icon: Wand2,
    title: "Get AI Recommendations",
    description: "Our intelligent algorithm suggests perfect outfit combinations based on weather, mood, and occasions."
  },
  {
    step: 3,
    icon: Sparkles,
    title: "Discover Your Style",
    description: "Learn your style profile, track favorites, and continuously improve your fashion choices."
  }
];

// Pricing plans
const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: ["Up to 50 wardrobe items", "Basic outfit suggestions", "Weather integration", "Mobile app access"],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "per month",
    description: "For fashion enthusiasts",
    features: ["Unlimited wardrobe items", "Advanced AI recommendations", "Style analytics", "Priority support", "Outfit history", "Color palette analysis"],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Luxury",
    price: "$24.99",
    period: "per month",
    description: "For the style-conscious",
    features: ["Everything in Premium", "Personal style consultation", "Exclusive fashion insights", "Custom color palettes", "Wardrobe value tracking", "VIP support"],
    cta: "Contact Sales",
    popular: false
  }
];

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-30" style={{ background: `radial-gradient(circle, ${burgundy}15 0%, transparent 70%)` }} />
        <div className="absolute top-40 right-20 w-96 h-96 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${gold}20 0%, transparent 70%)` }} />
        <div className="absolute bottom-40 left-1/4 w-64 h-64 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${burgundy}10 0%, transparent 70%)` }} />
      </div>

      {/* Navigation */}
      <nav className={`px-6 py-4 border-b sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-sm' : 'bg-white/80 backdrop-blur-sm border-slate-100'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
            >
              <span className="font-serif text-lg font-bold" style={{ color: gold }}>C</span>
            </div>
            <div>
              <span className="font-serif text-xl font-semibold text-slate-900">Celura</span>
              <p className="text-[9px] tracking-[0.2em] uppercase text-slate-400">Luxury AI Wardrobe</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Testimonials</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-medium">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button className="rounded-full px-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in"
                style={{ background: `linear-gradient(135deg, ${burgundy}08 0%, ${gold}08 100%)`, border: `1px solid ${burgundy}15` }}
              >
                <Crown className="w-4 h-4" style={{ color: gold }} />
                <span className="text-sm font-medium" style={{ color: burgundy }}>AI-Powered Fashion Intelligence</span>
                <Sparkles className="w-3 h-3" style={{ color: gold }} />
              </div>

              {/* Main Heading */}
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
                <span className="text-slate-900">Elevate Your</span>
                <br />
                <span className="relative">
                  <span style={{ color: burgundy }}>Personal Style</span>
                  <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 200 12" preserveAspectRatio="none">
                    <path d="M0 9 Q50 0 100 9 Q150 18 200 9" stroke={gold} strokeWidth="3" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-slate-500 max-w-xl mb-8 leading-relaxed mx-auto lg:mx-0">
                Experience luxury wardrobe management with intelligent AI that learns your style,
                adapts to weather, and creates stunning outfits for every occasion.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10">
                <Link href="/auth">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 h-auto rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group"
                    style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
                  >
                    Start Your Style Journey
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-6 h-auto rounded-full border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 group"
                  >
                    <Play className="mr-2 w-5 h-5" style={{ color: burgundy }} />
                    Try Now Free
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Privacy first</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: gold }} />
                  <span>AI-powered</span>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image/Visual */}
            <div className="relative lg:pl-8">
              <div className="relative py-8 px-4">
                {/* Main Card */}
                <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
                  {/* App Preview Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${burgundy}10` }}>
                        <Sparkles className="w-5 h-5" style={{ color: burgundy }} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Today&apos;s Outfit</p>
                        <p className="text-xs text-slate-400">AI Generated</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-full px-3 py-1.5 border-0 text-xs font-medium" style={{ background: gold, color: burgundyDark }}>
                      Perfect Match
                    </Badge>
                  </div>

                  {/* Outfit Preview */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: 'Top', icon: Shirt, color: '#4f46e5' },
                      { label: 'Bottom', icon: Layers, color: '#0891b2' },
                      { label: 'Shoes', icon: Heart, color: '#e11d48' },
                    ].map((item, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center border border-slate-100 hover:scale-105 transition-transform cursor-pointer group">
                        <item.icon className="w-8 h-8 mb-1 transition-colors" style={{ color: item.color }} />
                        <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Weather Badge */}
                  <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: `linear-gradient(135deg, ${burgundy}05 0%, ${gold}05 100%)` }}>
                    <div className="flex items-center gap-3">
                      <CloudSun className="w-8 h-8" style={{ color: gold }} />
                      <div>
                        <p className="font-semibold text-slate-900">22°C Sunny</p>
                        <p className="text-xs text-slate-400">Perfect for light layers</p>
                      </div>
                    </div>
                    <Button size="sm" className="rounded-full" style={{ background: burgundy }}>
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Floating Elements - positioned above main card */}
                <div className="absolute -top-6 -right-6 z-20 bg-white rounded-2xl shadow-xl px-5 py-4 border border-slate-100 animate-float">
                  <div className="flex items-center gap-2">
                    <Shirt className="w-5 h-5" style={{ color: burgundy }} />
                    <span className="font-semibold text-slate-900">50+</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Items Stored</p>
                </div>

                <div className="absolute -bottom-6 -left-6 z-20 bg-white rounded-2xl shadow-xl px-5 py-4 border border-slate-100 animate-float-delayed">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" style={{ color: gold }} />
                    <span className="font-semibold text-slate-900">AI</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Powered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16 border-y border-slate-100 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 50000, suffix: "+", label: "Happy Users", icon: Users },
              { value: 2, suffix: "M+", label: "Outfits Created", icon: Shirt },
              { value: 98, suffix: "%", label: "Satisfaction Rate", icon: Star },
              { value: 24, suffix: "/7", label: "AI Assistance", icon: Zap },
            ].map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" style={{ background: `${burgundy}08` }}>
                  <stat.icon className="w-6 h-6" style={{ color: burgundy }} />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: burgundy }}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full px-5 py-2.5 text-sm font-medium border-0" style={{ background: burgundy, color: 'white' }}>
              Features
            </Badge>
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-slate-900">
              Fashion at Your Fingertips
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Discover how Celura revolutionizes your wardrobe management with cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: "AI Style Recommendations", desc: "Get personalized outfit suggestions based on your unique style preferences, mood, and upcoming occasions.", color: burgundy },
              { icon: CloudSun, title: "Weather-Aware Styling", desc: "Never get caught unprepared. Our AI adapts your outfits to real-time weather conditions automatically.", color: gold },
              { icon: Shirt, title: "Smart Wardrobe Organization", desc: "Effortlessly catalog and organize your entire clothing collection with intelligent categorization.", color: burgundyLight },
              { icon: Palette, title: "Color Harmony Analysis", desc: "AI-powered color coordination ensures your outfits always look perfectly put together.", color: burgundy },
              { icon: Heart, title: "Favorite Collections", desc: "Save your best outfit combinations and access them instantly when you need inspiration.", color: "#e11d48" },
              { icon: TrendingUp, title: "Style Analytics", desc: "Track your fashion choices, identify patterns, and continuously improve your personal style.", color: "#059669" },
            ].map((feature, idx) => (
              <Card key={idx} className="group h-full border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <CardContent className="p-6 relative">
                  {/* Decorative gradient on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(135deg, ${feature.color}03 0%, transparent 50%)` }} />

                  <div className="relative">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                      style={{ background: `${feature.color}10` }}
                    >
                      <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                    </div>
                    <h3 className="font-semibold text-xl mb-3 text-slate-900">{feature.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{feature.desc}</p>

                    <div className="mt-4 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: feature.color }}>
                      Learn more <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-6 py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full px-5 py-2.5 text-sm font-medium border-0" style={{ background: gold, color: burgundyDark }}>
              How It Works
            </Badge>
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-slate-900">
              Three Simple Steps to Better Style
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Getting started with Celura is easy. Follow these steps to transform your wardrobe experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, idx) => (
              <div key={idx} className="relative">
                {/* Connector Line */}
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 -translate-y-1/2 z-0">
                    <div className="w-full h-full" style={{ background: `linear-gradient(90deg, ${burgundy}30 0%, transparent 100%)` }} />
                  </div>
                )}

                <div className="relative z-10 text-center">
                  {/* Step Number */}
                  <div
                    className="w-32 h-32 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-lg relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
                  >
                    <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 30% 30%, ${gold} 0%, transparent 50%)` }} />
                    <item.icon className="w-14 h-14 text-white relative z-10" />
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{item.step}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-xl mb-3 text-slate-900">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed max-w-xs mx-auto">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full px-5 py-2.5 text-sm font-medium border-0" style={{ background: burgundy, color: 'white' }}>
              Testimonials
            </Badge>
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-slate-900">
              Loved by Fashion Enthusiasts
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              See what our users have to say about their Celura experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="h-full border-slate-100 bg-white shadow-sm hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-slate-600 mb-6 leading-relaxed italic">&quot;{testimonial.content}&quot;</p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white"
                      style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
                    >
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 rounded-full px-5 py-2.5 text-sm font-medium border-0" style={{ background: gold, color: burgundyDark }}>
              Pricing
            </Badge>
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-slate-900">
              Choose Your Style Plan
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Start free and upgrade as you grow your wardrobe
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <Card key={idx} className={`relative h-full border-2 transition-all hover:shadow-xl ${plan.popular ? 'border-2 shadow-lg scale-105' : 'border-slate-100'}`} style={plan.popular ? { borderColor: burgundy } : {}}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="outline" className="rounded-full px-4 py-1.5 shadow-lg border-0 text-xs font-medium" style={{ background: burgundy, color: 'white' }}>
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="font-semibold text-xl mb-2 text-slate-900">{plan.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold" style={{ color: burgundy }}>{plan.price}</span>
                    <span className="text-slate-500 ml-1">/{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href="/auth">
                    <Button
                      className="w-full rounded-full h-12"
                      variant={plan.popular ? "default" : "outline"}
                      style={plan.popular ? { background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` } : {}}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 overflow-hidden shadow-2xl" style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}>
            <CardContent className="p-10 md:p-16 text-center relative">
              {/* Decorative elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 rounded-full" style={{ background: `radial-gradient(circle, ${gold} 0%, transparent 70%)` }} />
                <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full" style={{ background: `radial-gradient(circle, ${goldLight} 0%, transparent 70%)` }} />
              </div>

              <div className="relative">
                <Crown className="w-16 h-16 mx-auto mb-6" style={{ color: gold }} />
                <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-white">
                  Ready to Transform Your Style?
                </h2>
                <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                  Join over 50,000 fashion enthusiasts who have discovered their perfect style with Celura
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/auth">
                    <Button
                      size="lg"
                      className="text-lg px-10 py-6 h-auto rounded-full shadow-xl hover:shadow-2xl transition-all bg-white hover:bg-slate-50"
                      style={{ color: burgundy }}
                    >
                      Get Started Free
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-16 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
                >
                  <span className="font-serif text-lg font-semibold" style={{ color: gold }}>C</span>
                </div>
                <div>
                  <span className="font-serif text-xl text-slate-900">Celura</span>
                  <p className="text-[9px] tracking-[0.15em] uppercase text-slate-400">Est. 2026</p>
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-4">
                Luxury AI-powered wardrobe management for the style-conscious individual.
              </p>
              <div className="flex gap-3">
                {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title: "Product", links: ["Features", "Pricing", "Testimonials", "FAQ"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Support", links: ["Help Center", "Contact", "Privacy", "Terms"] },
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-slate-900 mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-slate-500 hover:text-slate-900 text-sm transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© 2026 Celura. Crafted with elegance.</p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 3s ease-in-out infinite 0.5s; }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
