import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { TrendingUp, DollarSign, Clock, Star, Grid3X3, Package, Info } from "lucide-react";
import { useWardrobeStats, useCostPerWear, useMostWorn, useNeverWorn } from "@/hooks/use-analytics";
import { Link } from "wouter";

/**
 * ANALYTICS DASHBOARD PAGE
 *
 * Comprehensive wardrobe insights and statistics
 * Features: cost-per-wear, most/least worn, wardrobe breakdown
 * Design: Luxury magazine-style layout
 */

export default function AnalyticsPage() {
    const { data: stats, isLoading: statsLoading } = useWardrobeStats();
    const { data: costPerWear } = useCostPerWear();
    const { data: mostWorn } = useMostWorn(5);
    const { data: neverWorn } = useNeverWorn();

    if (statsLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="w-12 h-12 border-2 border-[#80163A]/20 border-t-[#80163A] rounded-full animate-spin" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
                {/* Header */}
                <motion.header
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <p className="text-xs tracking-[0.2em] uppercase text-[#80163A] mb-3 font-bold">Analytics</p>
                    <h1
                        className="text-[#1A1A1A] mb-4"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(2.5rem, 6vw, 4rem)",
                            lineHeight: 1.1
                        }}
                    >
                        Wardrobe <span className="italic font-light">Insights</span>
                    </h1>
                    <p className="text-[#6B6B6B] text-lg max-w-2xl">
                        Understand your style, optimize your wardrobe, and make smarter fashion decisions
                    </p>
                </motion.header>

                {/* Key Metrics Grid */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <MetricCard
                        icon={<Grid3X3 className="w-5 h-5" />}
                        label="Total Items"
                        value={stats?.totalItems || 0}
                    />
                    <MetricCard
                        icon={<Package className="w-5 h-5" />}
                        label="Total Outfits"
                        value={stats?.totalOutfits || 0}
                    />
                    <MetricCard
                        icon={<DollarSign className="w-5 h-5" />}
                        label="Wardrobe Value"
                        value={`₹${((stats?.totalValue || 0)).toLocaleString()}`}
                    />
                    <MetricCard
                        icon={<TrendingUp className="w-5 h-5" />}
                        label="Items Worn"
                        value={`${stats?.percentWorn.toFixed(1)}%`}
                    />
                </motion.div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Category Breakdown */}
                    {stats?.categoryBreakdown && (
                        <ChartCard title="Category Breakdown">
                            <div className="space-y-3">
                                {Object.entries(stats.categoryBreakdown)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([category, count]) => {
                                        const percentage = (count / stats.totalItems) * 100;
                                        return (
                                            <div key={category} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="capitalize text-[#1A1A1A] font-medium">{category}</span>
                                                    <span className="text-[#6B6B6B]">{count} items ({percentage.toFixed(0)}%)</span>
                                                </div>
                                                <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-[#80163A] to-[#A01D4A] rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 0.8, delay: 0.2 }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </ChartCard>
                    )}

                    {/* Color Palette */}
                    {stats?.colorBreakdown && Object.keys(stats.colorBreakdown).length > 0 && (
                        <ChartCard title="Color Palette">
                            <div className="space-y-3">
                                {Object.entries(stats.colorBreakdown)
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 8)
                                    .map(([color, count]) => {
                                        const percentage = (count / stats.totalItems) * 100;
                                        return (
                                            <div key={color} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="capitalize text-[#1A1A1A] font-medium">{color}</span>
                                                    <span className="text-[#6B6B6B]">{count} items</span>
                                                </div>
                                                <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: getColorHex(color) }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 0.8, delay: 0.3 }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </ChartCard>
                    )}
                </div>

                {/* Cost Per Wear - Best Value Items */}
                {costPerWear && costPerWear.length > 0 && (
                    <motion.section
                        className="mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2
                            className="text-[#1A1A1A] mb-6"
                            style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem" }}
                        >
                            Best Value Items
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {costPerWear.slice(0, 5).map(item => (
                                <motion.div
                                    key={item.id}
                                    className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden hover:border-[#1A1A1A] transition-colors group"
                                    whileHover={{ y: -4 }}
                                >
                                    <div className="relative aspect-[3/4] bg-[#F5F5F5]">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                            ₹{(item.costPerWear).toFixed(0)}/wear
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h4 className="text-sm font-medium text-[#1A1A1A] truncate group-hover:text-[#80163A] transition-colors">{item.name}</h4>
                                        <p className="text-xs text-[#6B6B6B] mt-1">{item.wearCount} wears</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Most Worn Items */}
                {mostWorn && mostWorn.length > 0 && (
                    <motion.section
                        className="mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h2
                            className="text-[#1A1A1A] mb-6"
                            style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem" }}
                        >
                            Go-To Favorites
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {mostWorn.map(item => (
                                <motion.div
                                    key={item.id}
                                    className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden hover:border-[#1A1A1A] transition-colors group"
                                    whileHover={{ y: -4 }}
                                >
                                    <div className="relative aspect-[3/4] bg-[#F5F5F5]">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-[#80163A] text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 shadow-sm">
                                            <Star className="w-3 h-3fill-current" />
                                            {item.wearCount}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h4 className="text-sm font-medium text-[#1A1A1A] truncate group-hover:text-[#80163A] transition-colors">{item.name}</h4>
                                        <p className="text-xs text-[#6B6B6B] capitalize mt-1">{item.category}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Never Worn Items Alert */}
                {neverWorn && neverWorn.length > 0 && (
                    <motion.section
                        className="mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                    <Clock className="w-6 h-6 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">
                                        {neverWorn.length} Item{neverWorn.length > 1 ? 's' : ''} Never Worn
                                    </h3>
                                    <p className="text-sm text-[#6B6B6B] mb-4">
                                        These items are waiting for their debut. Consider styling them into outfits or decluttering your wardrobe.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {neverWorn.slice(0, 8).map(item => (
                                            <div
                                                key={item.id}
                                                className="w-16 h-20 rounded-lg overflow-hidden border border-amber-200"
                                            >
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                        {neverWorn.length > 8 && (
                                            <div className="w-16 h-20 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
                                                <span className="text-xs text-amber-700 font-medium">+{neverWorn.length - 8}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}
            </div>
        </AppLayout>
    );
}

// Helper Components

interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
}

function MetricCard({ icon, label, value }: MetricCardProps) {
    return (
        <motion.div
            className="bg-white rounded-2xl border border-[#E5E5E5] p-6"
            whileHover={{ y: -4, borderColor: "#1A1A1A" }}
            transition={{ duration: 0.2 }}
        >
            <div className="text-[#80163A] mb-3 p-2 bg-[#80163A]/5 rounded-xl w-fit">{icon}</div>
            <div className="text-3xl font-bold text-[#1A1A1A] mb-1 font-playfair">{value}</div>
            <div className="text-sm text-[#6B6B6B]">{label}</div>
        </motion.div>
    );
}

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6">
            <h3
                className="text-[#1A1A1A] mb-6 flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem" }}
            >
                {title}
            </h3>
            {children}
        </div>
    );
}

// Helper function for color visualization
function getColorHex(colorName: string): string {
    const colorMap: Record<string, string> = {
        black: "#000000",
        white: "#FFFFFF",
        red: "#DC2626",
        blue: "#2563EB",
        green: "#16A34A",
        yellow: "#EAB308",
        purple: "#9333EA",
        pink: "#EC4899",
        orange: "#F97316",
        brown: "#92400E",
        gray: "#6B7280",
        beige: "#D4C5B9",
        navy: "#1E3A8A",
        maroon: "#7F1D1D",
        teal: "#14B8A6",
        gold: "#CA8A04",
        silver: "#9CA3AF",
        cream: "#F5F5DC",
        olive: "#808000",
        tan: "#D2B48C",
    };

    return colorMap[colorName.toLowerCase()] || "#80163A";
}
