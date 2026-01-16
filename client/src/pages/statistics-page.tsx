import { useMemo } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { motion } from "framer-motion";
import {
    TrendingUp,
    Shirt,
    DollarSign,
    Palette,
    Grid3X3,
    Layers,
    Heart,
    User,
    BarChart3,
    PieChart,
} from "lucide-react";

import { useWardrobeItems } from "@/hooks/use-wardrobe";
import { useOutfits } from "@/hooks/use-outfits";

/**
 * STATISTICS PAGE - EDITORIAL ANALYTICS
 *
 * Design: Clean data visualization with minimal charts
 * Focus: Wardrobe insights and patterns
 */

const categoryColors: Record<string, string> = {
    tops: '#1A1A1A',
    bottoms: '#6B6B6B',
    dresses: '#80163A',
    outerwear: '#4A4A4A',
    shoes: '#9A9A9A',
    accessories: '#D4AF37',
    bags: '#C4C4C4',
    activewear: '#3A3A3A'
};

export function StatisticsPage() {
    const { data: wardrobeItems, isLoading: wardrobeLoading } = useWardrobeItems();
    const { data: outfits, isLoading: outfitsLoading } = useOutfits();

    const stats = useMemo(() => {
        if (!wardrobeItems) return null;

        const totalValue = wardrobeItems.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
        const totalItems = wardrobeItems.length;

        const byCategory = wardrobeItems.reduce((acc: Record<string, number>, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {});

        const byColor = wardrobeItems.reduce((acc: Record<string, number>, item) => {
            const color = item.color || 'unknown';
            acc[color] = (acc[color] || 0) + 1;
            return acc;
        }, {});

        const categoryData = Object.entries(byCategory)
            .map(([category, count]) => ({
                category,
                count,
                percentage: Math.round((count / totalItems) * 100),
                color: categoryColors[category] || '#9A9A9A'
            }))
            .sort((a, b) => b.count - a.count);

        const colorData = Object.entries(byColor)
            .map(([color, count]) => ({
                color,
                count,
                percentage: Math.round((count / totalItems) * 100)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);

        // Calculate Item Analytics
        const itemAnalytics = wardrobeItems.map(item => {
            const cost = item.purchasePrice || 0;
            const wears = item.wearCount || 0;
            const cpw = wears > 0 ? Math.round(cost / wears) : cost;
            return { ...item, cost, wears, cpw };
        });

        // Find Best Investment (Min CPW with at least 5 wears)
        const bestInvestmentItem = [...itemAnalytics]
            .filter(i => i.wears >= 5 && i.cost > 0)
            .sort((a, b) => a.cpw - b.cpw)[0];

        // Fallback if no items meet criteria
        const displayBestInvestment = bestInvestmentItem || [...itemAnalytics].sort((a, b) => b.wears - a.wears)[0];

        // Global CPW Average
        const totalWears = itemAnalytics.reduce((sum, i) => sum + i.wears, 0);
        const globalAvgCPW = totalWears > 0 ? Math.round(totalValue / totalWears) : 0;

        return {
            totalValue,
            totalItems,
            totalOutfits: outfits?.length || 0,
            categoryData,
            colorData,
            avgCostPerWear: globalAvgCPW,
            bestInvestment: displayBestInvestment,
            favoriteCount: wardrobeItems.filter(i => i.favorite).length,
        };
    }, [wardrobeItems, outfits]);

    if (wardrobeLoading || outfitsLoading) {
        return (
            <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <AppLayout>
            {/* Navigation */}

            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
                {/* Editorial Header - Asymmetric */}
                <motion.header
                    className="mb-24 relative"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="lg:w-2/3">
                        <span className="text-[#80163A] text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
                            Atelier Insights
                        </span>
                        <h1 className="text-[#1A1A1A] text-5xl lg:text-7xl font-light mb-6 leading-[0.9] italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                            The <span className="not-italic font-medium">Archivist's</span> <br /> Report.
                        </h1>
                        <p className="text-[#666666] text-lg lg:text-xl font-light max-w-md leading-relaxed">
                            A curated analysis of your wardrobe's composition, value, and color harmony.
                        </p>
                    </div>
                    {/* Decorative Element */}
                    <div className="absolute right-0 top-0 hidden lg:block opacity-10">
                        <BarChart3 className="w-64 h-64 text-[#1A1A1A]" strokeWidth={0.5} />
                    </div>
                </motion.header>

                {/* Insights Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    {/* Stat Card 1: Total Value */}
                    <div className="p-8 bg-white rounded-xl shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-shadow duration-500 flex flex-col justify-between h-48">
                        <div>
                            <p className="text-xs text-[#666666] uppercase tracking-[0.2em] mb-2">Portfolio Value</p>
                            <h3 className="text-4xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                ${stats?.totalValue.toLocaleString()}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#9A9A9A] uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                            {stats?.totalItems} Assets
                        </div>
                    </div>

                    {/* Stat Card 2: Cost Per Wear */}
                    <div className="p-8 bg-white rounded-xl shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-shadow duration-500 flex flex-col justify-between h-48 border-l-4 border-[#80163A]">
                        <div>
                            <p className="text-xs text-[#666666] uppercase tracking-[0.2em] mb-2">Cost / Wear</p>
                            <h3 className="text-4xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                ${stats?.avgCostPerWear}
                            </h3>
                        </div>
                        <p className="text-xs text-[#9A9A9A] leading-relaxed">
                            Global average across your entire collection.
                        </p>
                    </div>

                    {/* Stat Card 3: Best Investment */}
                    <div className="md:col-span-2 p-8 bg-[#1A1A1A] rounded-xl shadow-xl flex items-center justify-between relative overflow-hidden group">
                        <div className="relative z-10 w-full">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-xs text-white/60 uppercase tracking-[0.2em] mb-1">Best Investment</p>
                                    <h3 className="text-2xl text-white font-serif italic">
                                        {stats?.bestInvestment?.name || "N/A"}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl text-white font-serif">${stats?.bestInvestment?.cpw || 0}<span className="text-sm font-sans text-white/50 ml-1">/wear</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                                <div>
                                    <p className="text-[10px] uppercase text-white/40 mb-1">Worn</p>
                                    <p className="text-white">{stats?.bestInvestment?.wearCount || 0}x</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-white/40 mb-1">Cost</p>
                                    <p className="text-white">${stats?.bestInvestment?.purchasePrice || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-white/40 mb-1">ROI</p>
                                    <p className="text-green-400">High</p>
                                </div>
                            </div>
                        </div>
                        {/* Background Image Effect */}
                        {stats?.bestInvestment?.imageUrl && (
                            <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 group-hover:opacity-30 transition-opacity">
                                <img src={stats?.bestInvestment?.imageUrl} className="w-full h-full object-cover grayscale mix-blend-luminosity" />
                                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#1A1A1A]" />
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Section: Category Breakdown - Asymmetric Layout */}
                <motion.section
                    className="mb-32 grid lg:grid-cols-12 gap-16 items-start"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <div className="lg:col-span-4 sticky top-32">
                        <h2 className="text-4xl text-[#1A1A1A] mb-6 leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Composition <br /> <span className="italic text-[#80163A]">Analysis</span>
                        </h2>
                        <p className="text-[#666666] leading-relaxed">
                            Your wardrobe is dominated by <span className="text-[#1A1A1A] font-medium border-b border-[#D4AF37]">{stats?.categoryData[0]?.category}</span>.
                            Consider diversifying into {stats?.categoryData[stats.categoryData.length - 1]?.category} to balance your rotation.
                        </p>
                    </div>

                    <div className="lg:col-span-8 space-y-3">
                        {stats?.categoryData.map((cat, i) => (
                            <div key={cat.category} className="group flex items-center gap-6">
                                <div className="w-24 text-right text-xs uppercase tracking-[0.15em] text-[#666666]">{cat.category}</div>
                                <div className="flex-1 h-12 bg-white flex items-center px-4 relative overflow-hidden rounded-r-lg">
                                    <motion.div
                                        className="absolute inset-y-0 left-0 bg-[#1A1A1A]/5 group-hover:bg-[#80163A]/10 transition-colors duration-500"
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${cat.percentage}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                    />
                                    <span className="relative z-10 text-sm font-medium text-[#1A1A1A]">{cat.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Section: Color DNA - Minimalist Grid */}
                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-[#E5E5E5] pb-8">
                        <h2 className="text-4xl text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Color <span className="italic">DNA</span>
                        </h2>
                        <span className="text-xs uppercase tracking-[0.2em] text-[#666666] mt-4 md:mt-0">
                            Primary Palette
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        {stats?.colorData.map((item, i) => (
                            <div key={item.color} className="group cursor-pointer">
                                <div
                                    className="aspect-[3/4] rounded-sm mb-4 relative overflow-hidden shadow-sm transition-transform duration-500 hover:-translate-y-2"
                                    style={{ backgroundColor: getColorHex(item.color) }}
                                >
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                                </div>
                                <p className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A] mb-1">{item.color}</p>
                                <p className="text-[10px] text-[#666666] font-mono">{item.percentage}% Coverage</p>
                            </div>
                        ))}
                    </div>
                </motion.section>
            </div>
        </AppLayout>
    );
}

function getColorHex(colorName: string): string {
    const colorMap: Record<string, string> = {
        'black': '#1A1A1A', 'white': '#F9F9F7', 'gray': '#6B6B6B', 'grey': '#6B6B6B',
        'navy': '#1e3a5f', 'blue': '#4A90D9', 'red': '#C44536', 'burgundy': '#80163A',
        'pink': '#E8A4B8', 'coral': '#E07A5F', 'orange': '#E07A5F', 'yellow': '#E9C46A',
        'gold': '#D4AF37', 'beige': '#E5DDD3', 'cream': '#FAF3E0', 'tan': '#C9B99A',
        'brown': '#8B5E3C', 'olive': '#606C38', 'green': '#588157', 'teal': '#2A9D8F',
        'purple': '#7B68EE', 'lavender': '#E6E6FA',
    };
    const lowerColor = colorName.toLowerCase();
    for (const [key, value] of Object.entries(colorMap)) {
        if (lowerColor.includes(key)) return value;
    }
    return '#9A9A9A';
}

export default StatisticsPage;
