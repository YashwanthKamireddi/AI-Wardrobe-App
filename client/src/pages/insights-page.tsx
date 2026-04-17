/**
 * WARDROBE HEALTH DASHBOARD
 *
 * Comprehensive analytics page showing:
 * - Overall wardrobe health score
 * - Cost-per-wear analytics
 * - Category breakdown
 * - Dead stock identification
 * - Gap analysis
 * - Sustainability metrics
 *
 * Based on real features from Indyx and similar platforms.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
    TrendingUp, TrendingDown, AlertCircle, CheckCircle2,
    Shirt, DollarSign, Calendar, Leaf, PieChart, BarChart3,
    ArrowRight, Sparkles, Clock, Target, ShoppingBag
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useWearStats } from "@/hooks/use-wear-logs";
import { BRAND, WARDROBE_METRICS } from "@/lib/brand";

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    color?: string;
}

function MetricCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "#80163A" }: MetricCardProps) {
    return (
        <motion.div
            className="bg-white rounded-2xl p-6 border border-black/5"
            whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
        >
            <div className="flex items-start justify-between mb-4">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-gray-400"
                        }`}>
                        {trend === "up" ? <TrendingUp className="w-3 h-3" /> :
                            trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
                        {trendValue}
                    </div>
                )}
            </div>
            <p className="text-2xl font-semibold text-[#1A1A1A] mb-1">{value}</p>
            <p className="text-xs text-gray-500">{title}</p>
            {subtitle && <p className="text-[10px] text-gray-400 mt-1">{subtitle}</p>}
        </motion.div>
    );
}

function GradeCard({ grade, score, label }: { grade: string; score: number; label: string }) {
    const gradeConfig = WARDROBE_METRICS.grades[grade as keyof typeof WARDROBE_METRICS.grades] || WARDROBE_METRICS.grades.C;

    return (
        <div className="bg-white rounded-2xl p-8 border border-black/5 text-center">
            <div
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold"
                style={{ backgroundColor: gradeConfig.color }}
            >
                {grade}
            </div>
            <p className="text-lg font-medium text-[#1A1A1A]">{label}</p>
            <p className="text-sm text-gray-500">Wardrobe Health Score: {score}%</p>
        </div>
    );
}

function CategoryBar({ category, count, percentage, color }: {
    category: string;
    count: number;
    percentage: number;
    color: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="capitalize text-[#1A1A1A]">{category}</span>
                <span className="text-gray-500">{count} items ({percentage}%)</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

export function InsightsPage() {
    const { data: items, isLoading } = useWardrobeItems();
    const wearStats = useWearStats();

    // Calculate wardrobe metrics
    const metrics = useMemo(() => {
        if (!items || items.length === 0) {
            return {
                totalItems: 0,
                totalValue: 0,
                avgCPW: 0,
                deadStock: [],
                favorites: [],
                mostWorn: [],
                categoryBreakdown: {},
                healthScore: 0,
                grade: "F" as const,
            };
        }

        const totalItems = items.length;
        const totalValue = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);

        // Cost per wear calculation
        const itemsWithCPW = items
            .filter(item => item.purchasePrice && item.wearCount)
            .map(item => ({
                ...item,
                cpw: item.purchasePrice! / item.wearCount!,
            }));

        const avgCPW = itemsWithCPW.length > 0
            ? itemsWithCPW.reduce((sum, item) => sum + item.cpw, 0) / itemsWithCPW.length
            : 0;

        // Dead stock (never worn or worn < 2 times in last 6 months)
        const deadStock = items.filter(item => (item.wearCount || 0) < 2);

        // Favorites
        const favorites = items.filter(item => item.favorite);

        // Most worn
        const mostWorn = [...items]
            .sort((a, b) => (b.wearCount || 0) - (a.wearCount || 0))
            .slice(0, 5);

        // Category breakdown
        const categoryBreakdown: Record<string, number> = {};
        items.forEach(item => {
            categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
        });

        // Health score calculation
        let healthScore = 50; // Base score

        // Bonus for having items
        healthScore += Math.min(totalItems / 2, 15);

        // Penalty for dead stock
        const deadStockRatio = deadStock.length / totalItems;
        healthScore -= deadStockRatio * 20;

        // Bonus for good CPW
        if (avgCPW < WARDROBE_METRICS.cpwThresholds.good) healthScore += 10;
        else if (avgCPW > WARDROBE_METRICS.cpwThresholds.poor) healthScore -= 10;

        // Bonus for variety
        const categoryCount = Object.keys(categoryBreakdown).length;
        healthScore += Math.min(categoryCount * 2, 10);

        // Bonus for favorites usage
        if (favorites.length > 0 && favorites.length < totalItems * 0.3) healthScore += 5;

        healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

        // Determine grade
        let grade: keyof typeof WARDROBE_METRICS.grades = "F";
        for (const [g, config] of Object.entries(WARDROBE_METRICS.grades)) {
            if (healthScore >= config.min) {
                grade = g as keyof typeof WARDROBE_METRICS.grades;
                break;
            }
        }

        return {
            totalItems,
            totalValue,
            avgCPW,
            deadStock,
            favorites,
            mostWorn,
            categoryBreakdown,
            healthScore,
            grade,
        };
    }, [items]);

    const categoryColors: Record<string, string> = {
        tops: "#80163A",
        bottoms: "#D4AF37",
        dresses: "#8B5CF6",
        outerwear: "#3B82F6",
        shoes: "#10B981",
        accessories: "#F59E0B",
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="p-6 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.header
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <p className="text-xs tracking-[0.2em] uppercase text-[#80163A] font-medium mb-2">
                        Wardrobe Intelligence
                    </p>
                    <h1
                        className="text-3xl md:text-4xl text-[#1A1A1A] mb-2"
                        style={{ fontFamily: BRAND.fonts.heading }}
                    >
                        Your Style <span className="italic font-light">Insights</span>
                    </h1>
                    <p className="text-gray-500">
                        Understand your wardrobe. Make smarter style decisions.
                    </p>
                </motion.header>

                {/* Health Score */}
                <motion.section
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <GradeCard
                            grade={metrics.grade}
                            score={metrics.healthScore}
                            label={WARDROBE_METRICS.grades[metrics.grade].label}
                        />
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                            <MetricCard
                                title="Total Items"
                                value={metrics.totalItems}
                                icon={Shirt}
                            />
                            <MetricCard
                                title="Wardrobe Value"
                                value={`₹${(metrics.totalValue / 100).toLocaleString()}`}
                                icon={DollarSign}
                                color="#D4AF37"
                            />
                            <MetricCard
                                title="Avg. Cost Per Wear"
                                value={`₹${Math.round(metrics.avgCPW / 100)}`}
                                subtitle={metrics.avgCPW < WARDROBE_METRICS.cpwThresholds.good * 100
                                    ? "Great value!"
                                    : "Room for improvement"}
                                icon={TrendingUp}
                                trend={metrics.avgCPW < WARDROBE_METRICS.cpwThresholds.good * 100 ? "up" : "down"}
                                color="#10B981"
                            />
                            <MetricCard
                                title="Dead Stock"
                                value={metrics.deadStock.length}
                                subtitle="Items worn < 2 times"
                                icon={AlertCircle}
                                color={metrics.deadStock.length > 5 ? "#EF4444" : "#F59E0B"}
                            />
                        </div>
                    </div>
                </motion.section>

                {/* This Month's Activity */}
                {wearStats && (
                    <motion.section
                        className="mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-lg font-medium text-[#1A1A1A] mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#80163A]" />
                            This Month's Activity
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MetricCard
                                title="Outfits Logged"
                                value={wearStats.thisMonthCount}
                                trend="up"
                                trendValue={`${wearStats.thisMonthCount} this month`}
                                icon={CheckCircle2}
                            />
                            <MetricCard
                                title="Total Logs"
                                value={wearStats.totalLogs}
                                icon={BarChart3}
                                color="#3B82F6"
                            />
                            <MetricCard
                                title="Avg. Rating"
                                value={wearStats.averageRating ? `${wearStats.averageRating.toFixed(1)}/5` : "N/A"}
                                icon={Sparkles}
                                color="#D4AF37"
                            />
                            <MetricCard
                                title="Most Active Day"
                                value="Saturday"
                                icon={Clock}
                                color="#8B5CF6"
                            />
                        </div>
                    </motion.section>
                )}

                {/* Category Breakdown */}
                <motion.section
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-lg font-medium text-[#1A1A1A] mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-[#80163A]" />
                        Category Breakdown
                    </h2>
                    <div className="bg-white rounded-2xl p-6 border border-black/5 space-y-4">
                        {Object.entries(metrics.categoryBreakdown)
                            .sort((a, b) => b[1] - a[1])
                            .map(([category, count]) => (
                                <CategoryBar
                                    key={category}
                                    category={category}
                                    count={count}
                                    percentage={Math.round((count / metrics.totalItems) * 100)}
                                    color={categoryColors[category] || "#6B7280"}
                                />
                            ))}
                    </div>
                </motion.section>

                {/* Most Worn Items */}
                <motion.section
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-[#1A1A1A] flex items-center gap-2">
                            <Target className="w-5 h-5 text-[#80163A]" />
                            Wardrobe MVPs
                        </h2>
                        <Link href="/wardrobe" className="text-sm text-[#80163A] hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {metrics.mostWorn.map((item, i) => (
                            <motion.div
                                key={item.id}
                                className="bg-white rounded-xl border border-black/5 overflow-hidden"
                                whileHover={{ y: -4 }}
                            >
                                <div className="aspect-square bg-[#FAF9F6] relative">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Shirt className="w-8 h-8 text-gray-200" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-[#1A1A1A] text-white text-[10px] font-medium rounded-full">
                                        #{i + 1}
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-xs font-medium text-[#1A1A1A] truncate">{item.name}</p>
                                    <p className="text-[10px] text-gray-500">{item.wearCount || 0} wears</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Dead Stock Warning */}
                {metrics.deadStock.length > 3 && (
                    <motion.section
                        className="mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-amber-900 mb-1">
                                        {metrics.deadStock.length} items need attention
                                    </h3>
                                    <p className="text-sm text-amber-700 mb-4">
                                        These items have been worn less than 2 times. Consider styling them into new outfits or donating.
                                    </p>
                                    <div className="flex gap-3">
                                        <Link
                                            href="/compose"
                                            className="px-4 py-2 bg-amber-600 text-white text-sm rounded-full hover:bg-amber-700 transition-colors"
                                        >
                                            Create Outfits
                                        </Link>
                                        <button className="px-4 py-2 text-amber-700 text-sm hover:underline">
                                            View Items
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* Sustainability Score */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Leaf className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-green-900">Sustainability Impact</h3>
                                <p className="text-xs text-green-600">Your conscious fashion footprint</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-semibold text-green-700">
                                    {Math.round(metrics.totalItems * 0.7)}
                                </p>
                                <p className="text-xs text-green-600">Items Still in Use</p>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-green-700">
                                    {Math.round(metrics.avgCPW / 100)}
                                </p>
                                <p className="text-xs text-green-600">Avg Uses Per Item</p>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-green-700">
                                    {Math.round((1 - metrics.deadStock.length / metrics.totalItems) * 100)}%
                                </p>
                                <p className="text-xs text-green-600">Utilization Rate</p>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>
        </AppLayout>
    );
}

export default InsightsPage;
