import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { TrendingUp, DollarSign, Clock, Star, Grid3X3, ArrowRight, Sparkles, Brain, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useWardrobeStats, useCostPerWear, useMostWorn, useNeverWorn } from "@/hooks/use-analytics";
import { useWardrobeAnalytics, useWardrobeGaps, useReplacementPredictions } from "@/hooks/use-intelligence";
import { Link } from "wouter";
import { ShoppingAdvisor } from "@/components/shopping-advisor";
import { Button } from "@/components/ui/button";

/**
 * ANALYTICS PAGE - "THE REPORT"
 *
 * Design Philosophy: Editorial Financial Report meets Vogue.
 * - Typography: Massive Playfair Display
 * - Layout: Asymmetrical, extreme whitespace
 * - Visuals: Abstract charts, "Price Tag" aesthetics
 */

export default function AnalyticsPage() {
    const [showAdvisor, setShowAdvisor] = useState(false);
    const { data: stats, isLoading: statsLoading } = useWardrobeStats();
    const { data: costPerWear } = useCostPerWear();
    const { data: mostWorn } = useMostWorn(4);
    const { data: neverWorn } = useNeverWorn();

    // Intelligence Engine hooks
    const { analytics } = useWardrobeAnalytics();
    const { gaps } = useWardrobeGaps();
    const { predictions } = useReplacementPredictions();

    // Loading State - Minimalist Spinner
    if (statsLoading) {
        return (
            <AppLayout>
                <div className="min-h-[80vh] flex flex-col items-center justify-center">
                    <div className="w-px h-24 bg-[#E5E5E5] overflow-hidden">
                        <motion.div
                            className="w-full h-full bg-[#1A1A1A]"
                            animate={{ y: ["-100%", "100%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                    <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-gray-400 font-medium">Gathering Intelligence</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 pb-28 md:py-20 md:pb-20">

                {/* 1. HEADER - "THE COVER" */}
                <motion.header
                    className="mb-24 md:mb-32 relative"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#E5E5E5]/20 rounded-full blur-[80px] pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#1A1A1A] pb-8">
                        <div>
                            <p className="text-[#80163A] text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#80163A] rounded-full animate-pulse" />
                                Live Intelligence
                            </p>
                            <h1 className="text-6xl md:text-8xl lg:text-9xl text-[#1A1A1A] leading-[0.9] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                                The <br /> <span className="italic font-light text-[#6B6B6B]">Report</span>
                            </h1>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Asset Value</p>
                            <p className="text-4xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                ₹{((stats?.totalValue || 0)).toLocaleString()}
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowAdvisor(true)}
                            className="bg-gradient-to-r from-[#80163A] to-[#D4AF37] hover:from-[#6B1233] hover:to-[#B8962F] text-white h-14 px-6 rounded-none flex items-center gap-3 uppercase tracking-widest text-xs shadow-lg"
                        >
                            <Brain className="w-5 h-5" />
                            <span className="hidden md:inline">AI Shopping Advisor</span>
                            <span className="md:hidden">AI Advisor</span>
                        </Button>
                    </div>
                </motion.header>

                {/* 2. KEY METRICS - "THE TICKER" */}
                <section className="mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
                        <MetricCell
                            label="Portfolio Size"
                            value={stats?.totalItems || 0}
                            sub="Total Items"
                        />
                        <MetricCell
                            label="Efficiency Name"
                            value={`${stats?.percentWorn?.toFixed(0)}%`}
                            sub="Utilization Rate"
                            highlight
                        />
                        <MetricCell
                            label="Composition"
                            value={stats?.totalOutfits || 0}
                            sub="Outfit Combos"
                        />
                        <MetricCell
                            label="Liquidated"
                            value={costPerWear && costPerWear.length > 0 ? `₹${Math.min(...costPerWear.map(i => i.costPerWear)).toFixed(0)}` : "—"}
                            sub="Lowest CPW"
                        />
                    </div>
                </section>

                {/* 3. SPLIT SECTION - "THE BREAKDOWN" */}
                <div className="grid lg:grid-cols-12 gap-12 mb-32">

                    {/* Left: Category Analysis (Abstract Bars) */}
                    <div className="lg:col-span-7 space-y-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl md:text-4xl text-[#1A1A1A] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Composition <span className="italic text-[#80163A]">Analysis</span>
                            </h2>

                            <div className="space-y-8">
                                {stats?.categoryBreakdown && Object.entries(stats.categoryBreakdown)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([category, count], index) => {
                                        const percentage = (count / stats.totalItems) * 100;
                                        return (
                                            <div key={category} className="group cursor-default">
                                                <div className="flex items-baseline justify-between mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-lg md:text-xl font-light capitalize">{category}</span>
                                                    <span className="text-xs tracking-widest">{count} ITEMS / {percentage.toFixed(0)}%</span>
                                                </div>
                                                <div className="h-px bg-[#E5E5E5] w-full relative overflow-hidden">
                                                    <motion.div
                                                        className="absolute top-0 left-0 h-full bg-[#1A1A1A]"
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${percentage}%` }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 1.2, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Color Season & Alerts */}
                    <div className="lg:col-span-5 space-y-12">

                        {/* Color Palette - "Make Up Palette" Style */}
                        <div className="bg-white p-8 border border-gray-100 shadow-xl shadow-[#1a1a1a]/5 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-6">Color DNA</h3>

                            <div className="grid grid-cols-4 gap-2">
                                {stats?.colorBreakdown && Object.entries(stats.colorBreakdown)
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 8)
                                    .map(([color, count], i) => (
                                        <motion.div
                                            key={color}
                                            className="aspect-square relative group/color cursor-pointer"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <div
                                                className="w-full h-full rounded-sm"
                                                style={{ backgroundColor: getColorHex(color) }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 bg-black/40 transition-opacity">
                                                <span className="text-[10px] text-white font-medium capitalize">{color}</span>
                                            </div>
                                        </motion.div>
                                    ))
                                }
                            </div>
                            <p className="mt-6 text-sm text-gray-500 font-light italic text-center">
                                "Your palette leans towards deep earth tones, suggesting an Autumn color season."
                            </p>
                        </div>

                        {/* Never Worn Alert - "The Archive" */}
                        {neverWorn && neverWorn.length > 0 && (
                            <div className="border border-[#80163A]/20 bg-[#80163A]/5 p-8 relative">
                                <div className="absolute top-4 right-4 animate-pulse">
                                    <Clock className="w-4 h-4 text-[#80163A]" />
                                </div>
                                <h3 className="text-2xl text-[#1A1A1A] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>The Archive</h3>
                                <p className="text-sm text-gray-600 mb-6 max-w-xs">
                                    {neverWorn.length} items have been dormant. Reintroduce them or liquidate.
                                </p>
                                <div className="flex -space-x-3 overflow-hidden">
                                    {neverWorn.slice(0, 5).map(item => (
                                        <img
                                            key={item.id}
                                            src={item.imageUrl}
                                            className="w-12 h-12 rounded-full border-2 border-[#FAF9F6] object-cover grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110 hover:z-10"
                                            alt={item.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. COST PER WEAR - "THE INVESTMENT" */}
                {costPerWear && costPerWear.length > 0 && (
                    <motion.section
                        className="mb-8"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-baseline justify-between mb-12 border-b border-[#1A1A1A] pb-4">
                            <h2 className="text-4xl md:text-5xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Best <span className="italic text-[#80163A]">Investments</span>
                            </h2>
                            <Link href="/analytics/financials">
                                <span className="text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-[#80163A] transition-colors flex items-center gap-2">
                                    View Full Ledger <ArrowRight className="w-4 h-4" />
                                </span>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {costPerWear.slice(0, 3).map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    className="group relative cursor-pointer"
                                    whileHover={{ y: -10 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <div className="aspect-[3/4] overflow-hidden mb-4 relative bg-gray-100">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        {/* Luxury Price Tag */}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-4 shadow-xl flex flex-col items-center min-w-[60px] border border-gray-100">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">CPW</span>
                                            <span className="text-sm font-bold text-[#1A1A1A]">₹{(item.costPerWear).toFixed(0)}</span>
                                            <div className="w-1 h-1 bg-[#80163A] rounded-full mt-2" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-lg font-medium text-[#1A1A1A] font-playfair italic">{item.name}</h4>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Worn {item.wearCount} times</p>
                                        </div>
                                        {i === 0 && <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* 5. WARDROBE INTELLIGENCE - Powered by Engine */}
                {analytics && (
                    <motion.section
                        className="mb-32"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-baseline justify-between mb-12 border-b border-[#1A1A1A] pb-4">
                            <h2 className="text-4xl md:text-5xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Wardrobe <span className="italic text-[#80163A]">Intelligence</span>
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className={`text-3xl font-bold ${analytics.investmentHealth.grade === 'A' ? 'text-green-600' :
                                    analytics.investmentHealth.grade === 'B' ? 'text-blue-600' :
                                        analytics.investmentHealth.grade === 'C' ? 'text-yellow-600' :
                                            'text-red-600'
                                    }`}>
                                    {analytics.investmentHealth.grade}
                                </span>
                                <span className="text-xs uppercase tracking-widest text-gray-400">Health Grade</span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Investment Health Card */}
                            <div className="p-6 bg-white border border-gray-100 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-[#1A1A1A]">Investment Health</h3>
                                    <div className="text-2xl font-bold text-[#1A1A1A]">{analytics.investmentHealth.score}%</div>
                                </div>
                                <div className="space-y-2">
                                    {analytics.investmentHealth.insights.slice(0, 2).map((insight, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <span>{insight}</span>
                                        </div>
                                    ))}
                                    {analytics.investmentHealth.recommendations.slice(0, 1).map((rec, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <Sparkles className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                                            <span>{rec}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Wardrobe Gaps Card */}
                            {gaps && gaps.length > 0 && (
                                <div className="p-6 bg-white border border-gray-100 shadow-lg">
                                    <h3 className="font-semibold text-[#1A1A1A] mb-4">Wardrobe Gaps</h3>
                                    <div className="space-y-3">
                                        {gaps.slice(0, 3).map((gap, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${gap.priority === 'Essential' ? 'text-red-500' :
                                                    gap.priority === 'Recommended' ? 'text-yellow-500' :
                                                        'text-gray-400'
                                                    }`} />
                                                <div>
                                                    <p className="text-sm font-medium text-[#1A1A1A]">{gap.gap}</p>
                                                    <p className="text-xs text-gray-500">{gap.reason}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Replacement Predictions Card */}
                            {predictions && predictions.length > 0 && (
                                <div className="p-6 bg-white border border-gray-100 shadow-lg">
                                    <h3 className="font-semibold text-[#1A1A1A] mb-4">Replacement Forecast</h3>
                                    <div className="space-y-3">
                                        {predictions.slice(0, 3).map((pred, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                {pred.item.imageUrl && (
                                                    <img src={pred.item.imageUrl} alt={pred.item.name} className="w-10 h-10 rounded-lg object-cover" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{pred.item.name}</p>
                                                    <p className="text-xs text-gray-500">{pred.estimatedLifeRemaining}</p>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${pred.replacementUrgency === 'High' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {pred.replacementUrgency}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.section>
                )}
            </div>

            {/* Shopping Advisor Modal */}
            <ShoppingAdvisor
                isOpen={showAdvisor}
                onClose={() => setShowAdvisor(false)}
            />
        </AppLayout>
    );
}

// Minimalist Metric Cell
function MetricCell({ label, value, sub, highlight = false }: { label: string, value: string | number, sub: string, highlight?: boolean }) {
    return (
        <div className={`bg-white p-8 md:p-12 hover:bg-[#FAF9F6] transition-colors relative flex flex-col justify-between min-h-[200px] group ${highlight ? 'bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]' : ''}`}>
            <span className={`text-[10px] uppercase tracking-[0.2em] font-medium ${highlight ? 'text-gray-400' : 'text-gray-400'}`}>
                {label}
            </span>
            <div>
                <span className={`text-5xl md:text-6xl font-light block mb-2 ${highlight ? 'text-white' : 'text-[#1A1A1A]'}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                    {value}
                </span>
                <span className={`text-xs border-t pt-2 inline-block w-full ${highlight ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                    {sub}
                </span>
            </div>
            {highlight && <Sparkles className="absolute top-8 right-8 w-5 h-5 text-[#D4AF37] animate-pulse" />}
        </div>
    );
}

// Utility
function getColorHex(colorName: string): string {
    const colorMap: Record<string, string> = {
        black: "#000000", white: "#FFFFFF", red: "#DC2626", blue: "#2563EB",
        green: "#16A34A", yellow: "#EAB308", purple: "#9333EA", pink: "#EC4899",
        orange: "#F97316", brown: "#92400E", gray: "#6B7280", beige: "#D4C5B9",
        navy: "#1E3A8A", maroon: "#7F1D1D", teal: "#14B8A6", gold: "#CA8A04",
        silver: "#9CA3AF", cream: "#FFFDD0", khaki: "#C3B091", olive: "#808000",
    };
    return colorMap[colorName.toLowerCase()] || "#80163A";
}
