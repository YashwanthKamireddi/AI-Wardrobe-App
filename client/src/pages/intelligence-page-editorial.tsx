import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import {
  analyzeWardrobe,
  generateItemInsight,
  predictReplacements,
  identifyWardrobeGaps,
  calculateCPW,
  getColorInfo,
  WardrobeAnalytics,
  ItemInsight,
} from "@/lib/wardrobe-intelligence";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3,
  PieChart,
  Palette,
  Archive,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Shirt,
  ShoppingBag,
  Calendar,
  Zap,
  Target,
  Award,
  ArrowUpRight,
  Heart,
  X,
} from "lucide-react";
import { WardrobeItem } from "@shared/schema";

/**
 * WARDROBE INTELLIGENCE PAGE - Editorial Design
 *
 * Implements the "Agentic Wardrobe" analytics from the blueprint:
 * - Cost-Per-Wear tracking
 * - Dead stock alerts
 * - Investment health scoring
 * - Color palette analysis
 * - Predictive insights
 */

export function WardrobeIntelligencePage() {
  const { user } = useAuth();
  const { data: wardrobeItems, isLoading } = useWardrobeItems();
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "items" | "insights">("overview");

  const analytics = useMemo(() => {
    if (!wardrobeItems || wardrobeItems.length === 0) return null;
    return analyzeWardrobe(wardrobeItems);
  }, [wardrobeItems]);

  const itemInsights = useMemo(() => {
    if (!wardrobeItems) return [];
    return wardrobeItems.map(item => generateItemInsight(item, wardrobeItems));
  }, [wardrobeItems]);

  const replacementPredictions = useMemo(() => {
    if (!wardrobeItems) return [];
    return predictReplacements(wardrobeItems);
  }, [wardrobeItems]);

  const wardrobeGaps = useMemo(() => {
    if (!wardrobeItems) return [];
    return identifyWardrobeGaps(wardrobeItems);
  }, [wardrobeItems]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#6B6B6B]">Analyzing your wardrobe...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!wardrobeItems || wardrobeItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F9F7]">
        <nav className="sticky top-0 z-50 bg-[#F9F9F7]/95 backdrop-blur-xl border-b border-[#E5E5E5]/50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/">
              <span className="text-lg tracking-[0.2em] text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                CELURA
              </span>
            </Link>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-8 h-8 text-[#9A9A9A]" />
          </div>
          <h1 className="text-3xl text-[#1A1A1A] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Intelligence Awaits
          </h1>
          <p className="text-[#6B6B6B] mb-8">
            Add items to your wardrobe to unlock powerful analytics and insights
          </p>
          <Link href="/wardrobe">
            <motion.button
              className="h-12 px-8 bg-[#1A1A1A] text-white rounded-full text-sm font-medium"
              whileHover={{ backgroundColor: "#80163A" }}
              whileTap={{ scale: 0.98 }}
            >
              Build Your Wardrobe
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  const gradeColors: Record<string, string> = {
    A: "#2E7D32",
    B: "#558B2F",
    C: "#F9A825",
    D: "#EF6C00",
    F: "#C62828",
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#F9F9F7]/95 backdrop-blur-xl border-b border-[#E5E5E5]/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <span className="text-lg tracking-[0.2em] text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
              CELURA
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/wardrobe">
              <span className="text-xs tracking-[0.15em] uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                Wardrobe
              </span>
            </Link>
            <Link href="/statistics">
              <span className="text-xs tracking-[0.15em] uppercase text-[#1A1A1A] font-medium">
                Intelligence
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs tracking-[0.2em] uppercase text-[#80163A] mb-2">Wardrobe Analytics</p>
          <h1 className="text-4xl md:text-5xl text-[#1A1A1A] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Style Intelligence
          </h1>
          <p className="text-[#6B6B6B] max-w-xl">
            Data-driven insights to maximize your wardrobe's potential and transform how you dress
          </p>
        </motion.div>

        {/* Investment Health Score */}
        {analytics && (
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid md:grid-cols-3 gap-6">
              {/* Main Score Card */}
              <div className="md:col-span-1">
                <div className="h-full p-8 rounded-3xl bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] text-white">
                  <div className="flex items-center gap-2 mb-6">
                    <Award className="w-5 h-5 text-[#C5A572]" />
                    <span className="text-xs tracking-[0.15em] uppercase text-white/60">Investment Health</span>
                  </div>
                  <div className="flex items-end gap-4 mb-6">
                    <span
                      className="text-7xl font-light"
                      style={{ fontFamily: "'Playfair Display', serif", color: gradeColors[analytics.investmentHealth.grade] }}
                    >
                      {analytics.investmentHealth.grade}
                    </span>
                    <span className="text-2xl text-white/40 mb-3">{analytics.investmentHealth.score}/100</span>
                  </div>
                  <div className="space-y-2">
                    {analytics.investmentHealth.insights.slice(0, 2).map((insight, i) => (
                      <p key={i} className="text-sm text-white/70">{insight}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <motion.div
                  className="p-6 rounded-2xl bg-white border border-[#E5E5E5]"
                  whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Shirt className="w-5 h-5 text-[#6B6B6B]" />
                    <span className="text-xs text-[#6B6B6B]">Total</span>
                  </div>
                  <p className="text-3xl text-[#1A1A1A] font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {analytics.totalItems}
                  </p>
                  <p className="text-sm text-[#6B6B6B]">pieces in wardrobe</p>
                </motion.div>

                <motion.div
                  className="p-6 rounded-2xl bg-white border border-[#E5E5E5]"
                  whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-5 h-5 text-[#6B6B6B]" />
                    <span className="text-xs text-[#6B6B6B]">Value</span>
                  </div>
                  <p className="text-3xl text-[#1A1A1A] font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                    ${analytics.totalValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#6B6B6B]">total investment</p>
                </motion.div>

                <motion.div
                  className="p-6 rounded-2xl bg-white border border-[#E5E5E5]"
                  whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Target className="w-5 h-5 text-[#6B6B6B]" />
                    <span className="text-xs text-[#6B6B6B]">CPW</span>
                  </div>
                  <p className="text-3xl text-[#1A1A1A] font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                    ${analytics.averageCPW.toFixed(2)}
                  </p>
                  <p className="text-sm text-[#6B6B6B]">avg cost-per-wear</p>
                </motion.div>

                <motion.div
                  className="p-6 rounded-2xl bg-white border border-[#E5E5E5]"
                  whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Archive className="w-5 h-5 text-[#B44141]" />
                    <span className="text-xs text-[#B44141]">Alert</span>
                  </div>
                  <p className="text-3xl text-[#1A1A1A] font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {analytics.deadStock.length}
                  </p>
                  <p className="text-sm text-[#6B6B6B]">dead stock items</p>
                </motion.div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Tab Navigation */}
        <motion.div
          className="flex gap-2 mb-8 p-1 bg-[#F0F0F0] rounded-full w-fit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { id: "overview", label: "Overview" },
            { id: "items", label: "Item Analysis" },
            { id: "insights", label: "Predictions" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#1A1A1A] shadow-sm"
                  : "text-[#6B6B6B] hover:text-[#1A1A1A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && analytics && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Category Breakdown */}
              <section>
                <h2 className="text-xl text-[#1A1A1A] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Category Distribution
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.categoryBreakdown.map((cat, index) => (
                    <motion.div
                      key={cat.category}
                      className="p-5 rounded-2xl bg-white border border-[#E5E5E5] hover:border-[#1A1A1A] transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="text-xs text-[#6B6B6B]">{cat.percentage.toFixed(0)}%</span>
                      </div>
                      <p className="text-lg text-[#1A1A1A] capitalize mb-1">{cat.category}</p>
                      <p className="text-sm text-[#6B6B6B]">{cat.count} items · ${cat.totalValue.toFixed(0)} value</p>
                      <div className="mt-3 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#80163A] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percentage}%` }}
                          transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Color Palette */}
              <section>
                <h2 className="text-xl text-[#1A1A1A] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Your Color Palette
                </h2>
                <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5]">
                  <div className="flex flex-wrap gap-4">
                    {analytics.colorPalette.map((color, index) => (
                      <motion.div
                        key={color.color}
                        className="flex items-center gap-3 px-4 py-2 rounded-full border border-[#E5E5E5]"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-sm capitalize">{color.color}</span>
                        <span className="text-xs text-[#6B6B6B]">{color.count}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Most & Least Worn */}
              <div className="grid md:grid-cols-2 gap-6">
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#2E7D32]" />
                    <h2 className="text-xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Most Worn
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {analytics.mostWorn.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#E5E5E5]"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div
                          className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: getColorInfo(item.color).hex }}
                        >
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.name}</p>
                          <p className="text-xs text-[#6B6B6B]">{item.wearCount || 0} wears</p>
                        </div>
                        <span className="text-lg">🏆</span>
                      </motion.div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-[#EF6C00]" />
                    <h2 className="text-xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Dead Stock Alert
                    </h2>
                  </div>
                  {analytics.deadStock.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.deadStock.slice(0, 5).map((item, index) => (
                        <motion.div
                          key={item.id}
                          className="flex items-center gap-4 p-4 rounded-xl bg-[#FFF8E1] border border-[#FFCC02]/30"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div
                            className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                            style={{ backgroundColor: getColorInfo(item.color).hex }}
                          >
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.name}</p>
                            <p className="text-xs text-[#EF6C00]">Never worn · Consider selling</p>
                          </div>
                          <button className="text-xs px-3 py-1.5 bg-[#1A1A1A] text-white rounded-full">
                            Restyle
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7]/30 text-center">
                      <CheckCircle className="w-8 h-8 text-[#2E7D32] mx-auto mb-3" />
                      <p className="text-[#2E7D32] font-medium">All items in rotation!</p>
                      <p className="text-sm text-[#2E7D32]/70">Your wardrobe is well-utilized</p>
                    </div>
                  )}
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === "items" && (
            <motion.div
              key="items"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-xl text-[#1A1A1A] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                Individual Item Analysis
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {itemInsights.slice(0, 12).map((insight, index) => (
                  <motion.div
                    key={insight.item.id}
                    className="p-5 rounded-2xl bg-white border border-[#E5E5E5] hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedItem(insight.item)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: getColorInfo(insight.item.color).hex }}
                      >
                        {insight.item.imageUrl && (
                          <img src={insight.item.imageUrl} alt={insight.item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate">{insight.item.name}</p>
                        <p className="text-xs text-[#6B6B6B] capitalize">{insight.item.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#6B6B6B]">Cost per Wear</p>
                        <p className="text-lg font-medium text-[#1A1A1A]">
                          ${insight.cpw.toFixed(2)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          insight.cpwGrade === "Excellent"
                            ? "bg-[#E8F5E9] text-[#2E7D32]"
                            : insight.cpwGrade === "Good"
                            ? "bg-[#E3F2FD] text-[#1565C0]"
                            : insight.cpwGrade === "Fair"
                            ? "bg-[#FFF8E1] text-[#F9A825]"
                            : insight.cpwGrade === "Dead Stock"
                            ? "bg-[#FFEBEE] text-[#C62828]"
                            : "bg-[#FFF3E0] text-[#EF6C00]"
                        }`}
                      >
                        {insight.cpwGrade}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-3">{insight.wearFrequency}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Replacement Predictions */}
              {replacementPredictions.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-[#80163A]" />
                    <h2 className="text-xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Replacement Predictions
                    </h2>
                  </div>
                  <p className="text-sm text-[#6B6B6B] mb-6">
                    Based on wear patterns and average garment lifespan
                  </p>
                  <div className="space-y-4">
                    {replacementPredictions.map((pred, index) => (
                      <motion.div
                        key={pred.item.id}
                        className={`p-5 rounded-2xl border ${
                          pred.replacementUrgency === "High"
                            ? "bg-[#FFEBEE] border-[#FFCDD2]"
                            : "bg-[#FFF8E1] border-[#FFE082]"
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                            style={{ backgroundColor: getColorInfo(pred.item.color).hex }}
                          >
                            {pred.item.imageUrl && (
                              <img src={pred.item.imageUrl} alt={pred.item.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-[#1A1A1A]">{pred.item.name}</p>
                            <p className="text-sm text-[#6B6B6B]">
                              {pred.wearVelocity} wears/month · {pred.estimatedLifeRemaining} remaining
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                              pred.replacementUrgency === "High"
                                ? "bg-[#C62828] text-white"
                                : "bg-[#EF6C00] text-white"
                            }`}
                          >
                            {pred.replacementUrgency} Priority
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Wardrobe Gaps */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-[#80163A]" />
                  <h2 className="text-xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Wardrobe Gaps
                  </h2>
                </div>
                <p className="text-sm text-[#6B6B6B] mb-6">
                  Strategic additions to complete your wardrobe
                </p>
                {wardrobeGaps.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {wardrobeGaps.map((gap, index) => (
                      <motion.div
                        key={gap.gap}
                        className="p-5 rounded-2xl bg-white border border-[#E5E5E5]"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <p className="font-medium text-[#1A1A1A]">{gap.gap}</p>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs ${
                              gap.priority === "Essential"
                                ? "bg-[#80163A] text-white"
                                : gap.priority === "Recommended"
                                ? "bg-[#1A1A1A] text-white"
                                : "bg-[#E5E5E5] text-[#6B6B6B]"
                            }`}
                          >
                            {gap.priority}
                          </span>
                        </div>
                        <p className="text-sm text-[#6B6B6B]">{gap.reason}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7]/30 text-center">
                    <CheckCircle className="w-8 h-8 text-[#2E7D32] mx-auto mb-3" />
                    <p className="text-[#2E7D32] font-medium">Well-rounded wardrobe!</p>
                    <p className="text-sm text-[#2E7D32]/70">No critical gaps identified</p>
                  </div>
                )}
              </section>

              {/* Recommendations */}
              {analytics && analytics.investmentHealth.recommendations.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-[#C5A572]" />
                    <h2 className="text-xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Stylist Recommendations
                    </h2>
                  </div>
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1A1A1A] to-[#2D2D2D]">
                    <div className="space-y-4">
                      {analytics.investmentHealth.recommendations.map((rec, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.1 }}
                        >
                          <ArrowUpRight className="w-4 h-4 text-[#C5A572] mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-white/90">{rec}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Item Detail Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setSelectedItem(null)}
              />
              <motion.div
                className="relative w-full max-w-lg bg-white rounded-3xl p-8 max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] transition-colors"
                >
                  <X className="w-5 h-5 text-[#6B6B6B]" />
                </button>

                {(() => {
                  const insight = itemInsights.find(i => i.item.id === selectedItem.id);
                  if (!insight) return null;

                  return (
                    <>
                      <div className="flex items-start gap-4 mb-6">
                        <div
                          className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: getColorInfo(selectedItem.color).hex }}
                        >
                          {selectedItem.imageUrl && (
                            <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl text-[#1A1A1A] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {selectedItem.name}
                          </h3>
                          <p className="text-sm text-[#6B6B6B] capitalize">{selectedItem.brand} · {selectedItem.category}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="p-4 rounded-xl bg-[#F9F9F7] text-center">
                          <p className="text-2xl font-light text-[#1A1A1A]">${insight.cpw.toFixed(2)}</p>
                          <p className="text-xs text-[#6B6B6B]">Cost/Wear</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#F9F9F7] text-center">
                          <p className="text-2xl font-light text-[#1A1A1A]">{selectedItem.wearCount || 0}</p>
                          <p className="text-xs text-[#6B6B6B]">Total Wears</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#F9F9F7] text-center">
                          <p className="text-2xl font-light text-[#1A1A1A]">{insight.daysOwned}</p>
                          <p className="text-xs text-[#6B6B6B]">Days Owned</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-[#F9F9F7]">
                          <p className="text-xs tracking-[0.1em] uppercase text-[#6B6B6B] mb-2">Assessment</p>
                          <p className="text-sm text-[#1A1A1A]">{insight.valueAssessment}</p>
                        </div>

                        {insight.actionRecommendation && (
                          <div className="p-4 rounded-xl bg-[#FFF8E1] border border-[#FFE082]">
                            <p className="text-xs tracking-[0.1em] uppercase text-[#EF6C00] mb-2">Recommendation</p>
                            <p className="text-sm text-[#1A1A1A]">{insight.actionRecommendation}</p>
                          </div>
                        )}

                        {insight.compatibleItems.length > 0 && (
                          <div>
                            <p className="text-xs tracking-[0.1em] uppercase text-[#6B6B6B] mb-3">Pairs Well With</p>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {insight.compatibleItems.map(item => (
                                <div
                                  key={item.id}
                                  className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden"
                                  style={{ backgroundColor: getColorInfo(item.color).hex }}
                                >
                                  {item.imageUrl && (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E5E5E5]/50 px-6 py-3">
        <div className="flex items-center justify-around">
          <Link href="/home">
            <div className="flex flex-col items-center gap-1 text-[#9A9A9A]">
              <Shirt className="w-5 h-5" />
              <span className="text-[10px]">Home</span>
            </div>
          </Link>
          <Link href="/wardrobe">
            <div className="flex flex-col items-center gap-1 text-[#9A9A9A]">
              <Archive className="w-5 h-5" />
              <span className="text-[10px]">Wardrobe</span>
            </div>
          </Link>
          <Link href="/intelligence">
            <div className="flex flex-col items-center gap-1 text-[#1A1A1A]">
              <BarChart3 className="w-5 h-5" />
              <span className="text-[10px]">Intel</span>
            </div>
          </Link>
          <Link href="/profile">
            <div className="flex flex-col items-center gap-1 text-[#9A9A9A]">
              <Heart className="w-5 h-5" />
              <span className="text-[10px]">Profile</span>
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default WardrobeIntelligencePage;
