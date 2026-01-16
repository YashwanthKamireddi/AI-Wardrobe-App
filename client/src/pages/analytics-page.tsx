
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, DollarSign, Percent, Info, Palette, Sparkles, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WardrobeStats {
    totalValue: number;
    totalItems: number;
    averageCPW: number;
    utilizationRate: number;
    mostWornCategory: string;
    brandDistribution: Record<string, number>;
    colorSeason: {
        season: string;
        palette: string[];
        description: string;
    };
    potentialSavings: number;
}

export default function AnalyticsPage() {
    const { data: stats, isLoading, error } = useQuery<WardrobeStats>({
        queryKey: ['analytics'],
        queryFn: async () => {
            const res = await fetch('/api/analytics/wardrobe');
            if (!res.ok) throw new Error('Failed to fetch analytics');
            return res.json();
        }
    });

    if (isLoading) {
        return (
            <AppLayout>
                <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-8">
                    <div className="h-12 w-64 bg-gray-200 rounded animate-pulse mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-40 rounded-3xl" />
                        ))}
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout>
                <div className="min-h-screen flex items-center justify-center p-6">
                    <Alert variant="destructive" className="max-w-md">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Analytics Error</AlertTitle>
                        <AlertDescription>
                            We couldn't analyze your wardrobe at this time. Please try adding more items or checking back later.
                        </AlertDescription>
                    </Alert>
                </div>
            </AppLayout>
        );
    }

    if (!stats) return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-6 py-12 text-center text-muted-foreground">
                Initializing Style DNA...
            </div>
        </AppLayout>
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount / 100); // Amount is in cents
    };

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
                <motion.header
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-2">
                        Intelligence
                    </p>
                    <h1
                        className="text-[#1A1A1A]"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(2rem, 5vw, 3rem)",
                            lineHeight: 1.1
                        }}
                    >
                        Style DNA
                    </h1>
                </motion.header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* KPI Cards */}
                    <KPICard
                        title="Wardrobe Value"
                        value={formatCurrency(stats.totalValue)}
                        icon={<DollarSign className="w-4 h-4" />}
                        description={`${stats.totalItems} items invested`}
                        delay={0.1}
                    />
                    <KPICard
                        title="Cost Per Wear"
                        value={formatCurrency(stats.averageCPW)}
                        icon={<TrendingUp className="w-4 h-4" />}
                        description="Average across wardrobe"
                        delay={0.2}
                    />
                    <KPICard
                        title="Utilization"
                        value={`${Math.round(stats.utilizationRate)}%`}
                        icon={<Percent className="w-4 h-4" />}
                        description="Active wardrobe usage"
                        delay={0.3}
                        alert={stats.utilizationRate < 40}
                    />
                    <KPICard
                        title="Potential Savings"
                        value={formatCurrency(stats.potentialSavings)}
                        icon={<Sparkles className="w-4 h-4" />}
                        description="Value of unworn items"
                        delay={0.4}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Color Season Analysis */}
                    <motion.div
                        className="lg:col-span-2 space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                    >
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-[#F9F9F7] overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-1">
                                    <Palette className="w-4 h-4 text-[#80163A]" />
                                    <span className="text-xs font-semibold tracking-wider text-[#80163A] uppercase">Color Analysis</span>
                                </div>
                                <CardTitle className="text-3xl font-playfair capitalize">
                                    {stats.colorSeason.season} Season
                                </CardTitle>
                                <CardDescription className="text-base text-gray-500 max-w-lg mt-2">
                                    {stats.colorSeason.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-medium uppercase tracking-wider text-gray-400">Your Palette</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {stats.colorSeason.palette.map((color, i) => (
                                            <motion.div
                                                key={color}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.7 + (i * 0.05) }}
                                                className="group relative"
                                            >
                                                <div
                                                    className="w-16 h-16 rounded-full shadow-sm border border-black/5"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] capitalize whitespace-nowrap bg-black text-white px-2 py-0.5 rounded">
                                                    {color}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Brand Distribution (Simple List) */}
                        <Card className="border border-border/40 bg-white/50 backdrop-blur">
                            <CardHeader>
                                <CardTitle className="font-playfair text-xl">Top Brands</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(stats.brandDistribution)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 5)
                                        .map(([brand, count], i) => (
                                            <div key={brand} className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{brand}</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-32 bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#1A1A1A]"
                                                            style={{ width: `${(count / stats.totalItems) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Side Info */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                        >
                            <Card className="bg-[#1A1A1A] text-[#F9F9F7] border-0">
                                <CardHeader>
                                    <CardTitle className="font-playfair text-xl text-white">Rational Closet</CardTitle>
                                    <CardDescription className="text-white/60">
                                        Optimization tips based on your data.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {stats.utilizationRate < 50 && (
                                        <div className="flex gap-3 text-sm">
                                            <Info className="w-5 h-5 text-yellow-400 shrink-0" />
                                            <p className="leading-relaxed">
                                                You're using less than 50% of your wardrobe. Consider decluttering items you haven't worn in 6 months to improve clarity.
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex gap-3 text-sm">
                                        <Sparkles className="w-5 h-5 text-[#80163A] shrink-0" />
                                        <p className="leading-relaxed">
                                            Your most worn category is <strong>{stats.mostWornCategory}</strong>. Focus future investments here for maximum CPW efficiency.
                                        </p>
                                    </div>
                                    <div className="pt-4 mt-2 border-t border-white/10">
                                        <Link href="/wardrobe">
                                            <button className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded transition-transform hover:scale-[1.02]">
                                                Audit Wardrobe
                                            </button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function KPICard({ title, value, icon, description, delay, alert = false }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <Card className={`border-0 shadow-sm bg-white hover:shadow-md transition-all duration-300 ${alert ? 'ring-1 ring-red-100 bg-red-50/30' : ''}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[10px]">
                        {title}
                    </CardTitle>
                    <div className={`p-2 rounded-full ${alert ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-900'}`}>
                        {icon}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold font-playfair">{value}</div>
                    <p className={`text-xs mt-1 ${alert ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                        {description}
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
