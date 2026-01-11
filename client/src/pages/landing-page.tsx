import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Shirt,
  CloudSun,
  Palette,
  ArrowRight,
  Crown
} from "lucide-react";

// Brand colors
const gold = "hsl(38, 75%, 55%)";
const burgundy = "hsl(337, 73%, 26%)";
const burgundyDark = "hsl(337, 73%, 18%)";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
            >
              <span className="font-serif text-lg font-semibold" style={{ color: gold }}>C</span>
            </div>
            <div>
              <span className="font-serif text-xl text-slate-900">Celura</span>
              <p className="text-[10px] tracking-[0.15em] uppercase text-slate-400">Est. 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button style={{ background: burgundy }}>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-24">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: `${burgundy}08`, border: `1px solid ${burgundy}15` }}
          >
            <Crown className="w-4 h-4" style={{ color: gold }} />
            <span className="text-sm font-medium" style={{ color: burgundy }}>Luxury AI-Powered Fashion</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="text-slate-900">Your Personal</span>
            <br />
            <span style={{ color: burgundy }}>Style Curator</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience luxury wardrobe management with intelligent outfit recommendations
            tailored to your unique style and occasions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/auth">
              <Button
                size="lg"
                className="text-lg px-8 py-6 h-auto rounded-full"
                style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
              >
                Start Your Style Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 h-auto rounded-full border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: "10K+", label: "Outfits Created" },
              { value: "98%", label: "Satisfaction" },
              { value: "24/7", label: "AI Assistance" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl md:text-3xl font-bold" style={{ color: burgundy }}>{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              Intelligent Fashion at Your Fingertips
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Experience the future of personal styling with our cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: "AI Recommendations", desc: "Get personalized outfit suggestions based on your style, mood, and occasion" },
              { icon: CloudSun, title: "Weather-Aware", desc: "Automatically adapts recommendations based on local weather conditions" },
              { icon: Shirt, title: "Smart Wardrobe", desc: "Organize and manage your clothing collection with ease" },
              { icon: Palette, title: "Color Matching", desc: "AI-powered color coordination for stunning outfit combinations" },
            ].map((feature, idx) => (
              <Card key={idx} className="h-full border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${burgundy}08` }}
                  >
                    <feature.icon className="w-6 h-6" style={{ color: burgundy }} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <Card className="border-slate-100 bg-white shadow-lg overflow-hidden">
            <CardContent className="p-10 md:p-12 text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-slate-900">
                Ready to Transform Your Style?
              </h2>
              <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">
                Join thousands of fashion enthusiasts who have discovered their perfect style with Celura
              </p>
              <Link href="/auth">
                <Button
                  size="lg"
                  className="text-lg px-10 py-6 h-auto rounded-full"
                  style={{ background: `linear-gradient(135deg, ${burgundy} 0%, ${burgundyDark} 100%)` }}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: burgundy }}
            >
              <span className="font-serif text-sm font-semibold" style={{ color: gold }}>C</span>
            </div>
            <div>
              <span className="font-serif text-slate-900">Celura</span>
              <p className="text-[9px] tracking-[0.15em] uppercase text-slate-400">Luxury AI Wardrobe</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">© 2026 Celura. Crafted with elegance.</p>
        </div>
      </footer>
    </div>
  );
}
