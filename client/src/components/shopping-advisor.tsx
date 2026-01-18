import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
    Brain, TrendingUp, AlertTriangle, Sparkles, ShoppingBag,
    ChevronRight, Copy, X, Star, Target, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * SHOPPING ADVISOR - "THE INTELLIGENCE BUREAU"
 *
 * AI-powered wardrobe analysis with:
 * - Gap Analysis (missing essentials)
 * - Duplicate Detection
 * - Versatility Score
 * - Budget Insights
 * - Smart Shopping Recommendations
 */

interface IntelligenceData {
    gapAnalysis: {
        score: number;
        missingEssentials: string[];
        recommendations: Array<{ category?: string; item?: string; priority: string; reason?: string }>;
    };
    duplicates: Array<{
        items: Array<{ id: number; name: string; color: string; imageUrl: string }>;
        category: string;
        suggestion: string;
    }>;
    versatilityScore: number;
    budgetInsights: {
        totalValue: number;
        avgPrice: number;
        avgCostPerWear: number;
        bestInvestments: Array<{ name: string; cpw: number }>;
        worstInvestments: Array<{ name: string; cpw: number }>;
        suggestions: string[];
    };
    totalItems: number;
}

export function ShoppingAdvisor({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<"overview" | "gaps" | "duplicates" | "budget">("overview");

    const { data: intelligence, isLoading } = useQuery<IntelligenceData>({
        queryKey: ["/api/wardrobe/intelligence"],
        enabled: isOpen,
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    className="relative w-full max-w-4xl max-h-[90vh] bg-[#FAF9F6] mx-4 overflow-hidden flex flex-col"
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5] bg-white">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#80163A] to-[#D4AF37] flex items-center justify-center">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-playfair text-[#1A1A1A]">
                                    Style <span className="italic text-[#80163A]">Intelligence</span>
                                </h2>
                                <p className="text-xs uppercase tracking-widest text-gray-400">AI Shopping Advisor</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-[#1A1A1A]" />
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-[#E5E5E5] bg-white px-6">
                        {[
                            { id: "overview", label: "Overview", icon: Target },
                            { id: "gaps", label: "Gap Analysis", icon: Layers },
                            { id: "duplicates", label: "Duplicates", icon: Copy },
                            { id: "budget", label: "Budget", icon: TrendingUp },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-4 text-xs uppercase tracking-widest transition-all border-b-2",
                                    activeTab === tab.id
                                        ? "border-[#80163A] text-[#80163A]"
                                        : "border-transparent text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {isLoading ? (
                            <div className="h-64 flex flex-col items-center justify-center">
                                <motion.div
                                    className="w-12 h-12 border-2 border-[#80163A] border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <p className="mt-4 text-xs uppercase tracking-widest text-gray-400">
                                    Analyzing your wardrobe...
                                </p>
                            </div>
                        ) : intelligence ? (
                            <>
                                {activeTab === "overview" && (
                                    <OverviewTab data={intelligence} />
                                )}
                                {activeTab === "gaps" && (
                                    <GapsTab data={intelligence.gapAnalysis} />
                                )}
                                {activeTab === "duplicates" && (
                                    <DuplicatesTab data={intelligence.duplicates} />
                                )}
                                {activeTab === "budget" && (
                                    <BudgetTab data={intelligence.budgetInsights} />
                                )}
                            </>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                                <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                                <p className="text-sm">Unable to analyze wardrobe</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function OverviewTab({ data }: { data: IntelligenceData }) {
    return (
        <div className="space-y-8">
            {/* Score Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ScoreCard
                    label="Completeness"
                    value={data.gapAnalysis.score}
                    suffix="%"
                    color={data.gapAnalysis.score > 70 ? "green" : data.gapAnalysis.score > 40 ? "yellow" : "red"}
                />
                <ScoreCard
                    label="Versatility"
                    value={data.versatilityScore}
                    suffix="%"
                    color={data.versatilityScore > 70 ? "green" : data.versatilityScore > 40 ? "yellow" : "red"}
                />
                <ScoreCard
                    label="Total Items"
                    value={data.totalItems}
                    color="neutral"
                />
                <ScoreCard
                    label="Avg CPW"
                    value={data.budgetInsights.avgCostPerWear}
                    prefix="₹"
                    color={data.budgetInsights.avgCostPerWear < 200 ? "green" : "yellow"}
                />
            </div>

            {/* Priority Actions */}
            <div className="bg-white p-6 border border-[#E5E5E5]">
                <h3 className="text-lg font-playfair text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                    Priority Actions
                </h3>
                <div className="space-y-3">
                    {data.gapAnalysis.missingEssentials.slice(0, 3).map((essential, i) => (
                        <div
                            key={essential}
                            className="flex items-center justify-between p-3 bg-[#80163A]/5 border-l-2 border-[#80163A]"
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-[#80163A] text-white text-xs flex items-center justify-center font-bold">
                                    {i + 1}
                                </span>
                                <span className="text-sm text-[#1A1A1A] capitalize">Add {essential}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                    ))}
                    {data.duplicates.length > 0 && (
                        <div className="flex items-center justify-between p-3 bg-amber-50 border-l-2 border-amber-500">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                                    !
                                </span>
                                <span className="text-sm text-[#1A1A1A]">
                                    {data.duplicates.length} duplicate groups detected
                                </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                    )}
                </div>
            </div>

            {/* Best Investments */}
            {data.budgetInsights.bestInvestments.length > 0 && (
                <div className="bg-white p-6 border border-[#E5E5E5]">
                    <h3 className="text-lg font-playfair text-[#1A1A1A] mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                        Your Best Investments
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        {data.budgetInsights.bestInvestments.map((item, i) => (
                            <div key={i} className="text-center p-4 bg-[#FAF9F6]">
                                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">#{i + 1}</p>
                                <p className="font-playfair text-[#1A1A1A] truncate">{item.name}</p>
                                <p className="text-lg font-bold text-[#80163A]">₹{item.cpw}/wear</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function GapsTab({ data }: { data: IntelligenceData["gapAnalysis"] }) {
    return (
        <div className="space-y-6">
            {/* Score */}
            <div className="text-center py-8 bg-white border border-[#E5E5E5]">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Wardrobe Completeness</p>
                <p className="text-6xl font-playfair text-[#1A1A1A]">{data.score}%</p>
            </div>

            {/* Missing Essentials */}
            {data.missingEssentials.length > 0 && (
                <div className="bg-white p-6 border border-[#E5E5E5]">
                    <h3 className="text-lg font-playfair text-[#1A1A1A] mb-4">Missing Categories</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.missingEssentials.map(essential => (
                            <span
                                key={essential}
                                className="px-4 py-2 bg-red-50 text-red-700 text-sm capitalize border border-red-200"
                            >
                                {essential}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            <div className="bg-white p-6 border border-[#E5E5E5]">
                <h3 className="text-lg font-playfair text-[#1A1A1A] mb-4">Recommendations</h3>
                <div className="space-y-3">
                    {data.recommendations.map((rec, i) => (
                        <div
                            key={i}
                            className={cn(
                                "p-4 border-l-4",
                                rec.priority === "high" ? "bg-red-50 border-red-500" :
                                    rec.priority === "medium" ? "bg-amber-50 border-amber-500" :
                                        "bg-gray-50 border-gray-300"
                            )}
                        >
                            <p className="text-sm text-[#1A1A1A] capitalize">
                                {rec.reason || `Add ${rec.category || rec.item}`}
                            </p>
                            <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">
                                {rec.priority} priority
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function DuplicatesTab({ data }: { data: IntelligenceData["duplicates"] }) {
    if (data.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Star className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-playfair text-[#1A1A1A]">No duplicates found!</p>
                <p className="text-sm text-gray-400 mt-2">Your wardrobe is well-balanced</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {data.map((group, i) => (
                <div key={i} className="bg-white p-6 border border-[#E5E5E5]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-playfair text-[#1A1A1A] capitalize">
                            {group.category} Duplicates
                        </h3>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1">
                            {group.items.length} similar items
                        </span>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {group.items.map(item => (
                            <div key={item.id} className="flex-shrink-0 w-24">
                                <div className="aspect-square bg-gray-100 mb-2 overflow-hidden">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ShoppingBag className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-[#1A1A1A] truncate">{item.name}</p>
                                <p className="text-[10px] text-gray-400 capitalize">{item.color}</p>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm text-gray-600 mt-4 p-3 bg-[#FAF9F6] italic">
                        💡 {group.suggestion}
                    </p>
                </div>
            ))}
        </div>
    );
}

function BudgetTab({ data }: { data: IntelligenceData["budgetInsights"] }) {
    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-6 border border-[#E5E5E5] text-center">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Total Value</p>
                    <p className="text-3xl font-playfair text-[#1A1A1A]">₹{data.totalValue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 border border-[#E5E5E5] text-center">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Avg Item Price</p>
                    <p className="text-3xl font-playfair text-[#1A1A1A]">₹{data.avgPrice.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 border border-[#E5E5E5] text-center">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Avg Cost/Wear</p>
                    <p className="text-3xl font-playfair text-[#80163A]">₹{data.avgCostPerWear}</p>
                </div>
            </div>

            {/* Best vs Worst */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 border border-[#E5E5E5]">
                    <h3 className="text-lg font-playfair text-[#1A1A1A] mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-green-600 fill-green-600" />
                        Best Investments
                    </h3>
                    {data.bestInvestments.length > 0 ? (
                        <div className="space-y-2">
                            {data.bestInvestments.map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-green-50">
                                    <span className="text-sm text-[#1A1A1A]">{item.name}</span>
                                    <span className="text-sm font-bold text-green-700">₹{item.cpw}/wear</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">Wear items more to calculate</p>
                    )}
                </div>

                <div className="bg-white p-6 border border-[#E5E5E5]">
                    <h3 className="text-lg font-playfair text-[#1A1A1A] mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Needs More Wear
                    </h3>
                    {data.worstInvestments.length > 0 ? (
                        <div className="space-y-2">
                            {data.worstInvestments.map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-red-50">
                                    <span className="text-sm text-[#1A1A1A]">{item.name}</span>
                                    <span className="text-sm font-bold text-red-700">₹{item.cpw}/wear</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">All items are well-utilized!</p>
                    )}
                </div>
            </div>

            {/* Suggestions */}
            {data.suggestions.length > 0 && (
                <div className="bg-[#80163A]/5 p-6 border border-[#80163A]/20">
                    <h3 className="text-lg font-playfair text-[#1A1A1A] mb-4">AI Suggestions</h3>
                    <ul className="space-y-2">
                        {data.suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <Sparkles className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function ScoreCard({ label, value, prefix, suffix, color }: {
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
    color: "green" | "yellow" | "red" | "neutral";
}) {
    const colorClasses = {
        green: "bg-green-50 border-green-200 text-green-700",
        yellow: "bg-amber-50 border-amber-200 text-amber-700",
        red: "bg-red-50 border-red-200 text-red-700",
        neutral: "bg-white border-gray-200 text-[#1A1A1A]",
    };

    return (
        <div className={cn("p-4 border text-center", colorClasses[color])}>
            <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">{label}</p>
            <p className="text-2xl font-playfair">
                {prefix}{value}{suffix}
            </p>
        </div>
    );
}

export default ShoppingAdvisor;
