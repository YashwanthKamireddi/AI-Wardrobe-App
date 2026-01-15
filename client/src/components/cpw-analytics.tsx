import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Calendar,
  Award,
  Shirt,
  Zap,
  ChevronRight,
  Star,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WardrobeItem, Outfit } from "@shared/schema";

interface CPWAnalyticsProps {
  wardrobeItems?: WardrobeItem[];
  outfits?: Outfit[];
  compact?: boolean;
}

interface ItemAnalytics {
  item: WardrobeItem;
  wearCount: number;
  cpw: number;
  roi: number;
  trend: "up" | "down" | "stable";
}

export function CPWAnalytics({
  wardrobeItems = [],
  outfits = [],
  compact = false,
}: CPWAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<"best" | "worst" | "unworn">("best");
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate CPW metrics
  const analytics = useMemo(() => {
    const itemWearCounts = new Map<number, number>();

    // Count wears from outfits
    outfits.forEach((outfit) => {
      if (outfit.items) {
        const ids = Array.isArray(outfit.items) ? outfit.items : [];
        ids.forEach((id: number) => {
          itemWearCounts.set(id, (itemWearCounts.get(id) || 0) + 1);
        });
      }
    });

    const itemAnalytics: ItemAnalytics[] = wardrobeItems
      .filter(item => item.purchasePrice && item.purchasePrice > 0)
      .map((item) => {
        const wearCount = itemWearCounts.get(item.id) || (item.wearCount || 0);
        const price = (item.purchasePrice || 0) / 100; // Convert from cents
        const cpw = wearCount > 0 ? price / wearCount : price;
        const roi = wearCount > 0 ? (wearCount * 10) / price * 100 : 0;

        return {
          item,
          wearCount,
          cpw,
          roi,
          trend: wearCount > 5 ? "up" : wearCount > 2 ? "stable" : "down",
        };
      });

    // Sort by CPW
    const bestValue = [...itemAnalytics].sort((a, b) => a.cpw - b.cpw).slice(0, 5);
    const worstValue = [...itemAnalytics].sort((a, b) => b.cpw - a.cpw).slice(0, 5);
    const unworn = itemAnalytics.filter(a => a.wearCount === 0);

    // Overall stats
    const totalValue = wardrobeItems.reduce((sum, item) => sum + ((item.purchasePrice || 0) / 100), 0);
    const totalWears = Array.from(itemWearCounts.values()).reduce((a, b) => a + b, 0);
    const avgCPW = totalWears > 0 ? totalValue / totalWears : totalValue;
    const wardrobeUtilization = wardrobeItems.length > 0
      ? ((wardrobeItems.length - unworn.length) / wardrobeItems.length) * 100
      : 0;

    return {
      bestValue,
      worstValue,
      unworn,
      totalValue,
      totalWears,
      avgCPW,
      wardrobeUtilization,
    };
  }, [wardrobeItems, outfits]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3" style={{ color: "var(--color-success)" }} />;
      case "down":
        return <TrendingDown className="h-3 w-3" style={{ color: "var(--color-error)" }} />;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div
        className="rounded-xl p-4"
        style={{
          background: "white",
          border: "1px solid var(--color-pearl)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" style={{ color: "var(--color-gold-muted)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--color-charcoal)" }}>
              Avg. Cost Per Wear
            </span>
          </div>
          <span
            className="text-lg font-bold"
            style={{ color: "var(--color-charcoal)" }}
          >
            {formatCurrency(analytics.avgCPW)}
          </span>
        </div>

        {/* Mini Bar Chart */}
        <div className="flex items-end gap-1 h-12 mb-2">
          {[85, 60, 100, 45, 75, 90, 55].map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-t transition-all hover:opacity-80"
              style={{
                height: `${height}%`,
                background: i === 2 ? "var(--color-gold-muted)" : "var(--color-pearl)",
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span style={{ color: "var(--color-graphite)" }}>
            {Math.round(analytics.wardrobeUtilization)}% wardrobe used
          </span>
          <span
            className="flex items-center gap-1"
            style={{ color: "var(--color-success)" }}
          >
            <TrendingUp className="h-3 w-3" />
            Improving
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "white",
        border: "1px solid var(--color-pearl)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between"
        style={{
          background: "linear-gradient(135deg, var(--color-cashmere) 0%, white 100%)",
          borderBottom: "1px solid var(--color-pearl)",
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4" style={{ color: "var(--color-gold-muted)" }} />
            <span
              className="text-xs font-semibold tracking-wider uppercase"
              style={{ color: "var(--color-graphite)" }}
            >
              Cost Per Wear Analytics
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--color-taupe)" }}>
            Track the value of your wardrobe
          </p>
        </div>

        <button
          onClick={() => setShowTooltip(!showTooltip)}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--color-cashmere)" }}
        >
          <Info className="h-4 w-4" style={{ color: "var(--color-graphite)" }} />
        </button>
      </div>

      {/* Info Tooltip */}
      {showTooltip && (
        <div
          className="mx-4 mt-4 p-3 rounded-lg text-sm"
          style={{
            background: "rgba(74, 125, 180, 0.08)",
            border: "1px solid rgba(74, 125, 180, 0.15)",
            color: "var(--color-info)",
          }}
        >
          Cost Per Wear = Item Price ÷ Number of Wears. Lower CPW means better value!
        </div>
      )}

      {/* Summary Stats */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <div
          className="p-3 rounded-xl text-center"
          style={{ background: "var(--color-cashmere)" }}
        >
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--color-charcoal)" }}
          >
            {formatCurrency(analytics.avgCPW)}
          </p>
          <p className="text-xs" style={{ color: "var(--color-graphite)" }}>
            Avg. CPW
          </p>
        </div>

        <div
          className="p-3 rounded-xl text-center"
          style={{ background: "var(--color-cashmere)" }}
        >
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--color-charcoal)" }}
          >
            {Math.round(analytics.wardrobeUtilization)}%
          </p>
          <p className="text-xs" style={{ color: "var(--color-graphite)" }}>
            Utilized
          </p>
        </div>

        <div
          className="p-3 rounded-xl text-center"
          style={{ background: "var(--color-cashmere)" }}
        >
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--color-charcoal)" }}
          >
            {analytics.unworn.length}
          </p>
          <p className="text-xs" style={{ color: "var(--color-graphite)" }}>
            Unworn
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="px-4 flex gap-2"
        style={{ borderBottom: "1px solid var(--color-pearl)" }}
      >
        {[
          { id: "best", label: "Best Value", icon: Star },
          { id: "worst", label: "Improve", icon: Zap },
          { id: "unworn", label: "Unworn", icon: Shirt },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={cn(
              "flex items-center gap-2 py-3 px-4 text-sm font-medium transition-all relative",
              activeTab === id
                ? "text-[var(--color-obsidian)]"
                : "text-[var(--color-graphite)]"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {activeTab === id && (
              <div
                className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                style={{ background: "var(--color-obsidian)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Item List */}
      <div className="p-4 space-y-2">
        {(activeTab === "best"
          ? analytics.bestValue
          : activeTab === "worst"
          ? analytics.worstValue
          : analytics.unworn
        ).slice(0, 5).map(({ item, wearCount, cpw, trend }) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-cashmere"
            style={{
              background: "var(--color-cashmere)",
              border: "1px solid var(--color-pearl)",
            }}
          >
            {/* Item Image */}
            <div
              className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
              style={{
                background: item.imageUrl ? "white" : "var(--color-pearl)",
              }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Shirt className="h-5 w-5" style={{ color: "var(--color-taupe)" }} />
                </div>
              )}
            </div>

            {/* Item Info */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "var(--color-charcoal)" }}
              >
                {item.name}
              </p>
              <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-graphite)" }}>
                <span>{wearCount} wears</span>
                <span>•</span>
                <span>{formatCurrency((item.purchasePrice || 0) / 100)} original</span>
              </div>
            </div>

            {/* CPW & Trend */}
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <span
                  className="text-sm font-bold"
                  style={{
                    color: activeTab === "best"
                      ? "var(--color-success)"
                      : activeTab === "worst"
                      ? "var(--color-error)"
                      : "var(--color-graphite)",
                  }}
                >
                  {wearCount > 0 ? formatCurrency(cpw) : "—"}
                </span>
                {getTrendIcon(trend)}
              </div>
              <span className="text-[10px]" style={{ color: "var(--color-taupe)" }}>
                per wear
              </span>
            </div>
          </div>
        ))}

        {((activeTab === "best" && analytics.bestValue.length === 0) ||
          (activeTab === "worst" && analytics.worstValue.length === 0) ||
          (activeTab === "unworn" && analytics.unworn.length === 0)) && (
          <div className="text-center py-8">
            <Award className="h-10 w-10 mx-auto mb-2" style={{ color: "var(--color-gold-muted)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--color-charcoal)" }}>
              {activeTab === "unworn" ? "All items have been worn!" : "Add items with prices to track CPW"}
            </p>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-4" style={{ borderTop: "1px solid var(--color-pearl)" }}>
        <button
          className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all press-feedback"
          style={{
            background: "var(--color-obsidian)",
            color: "var(--color-alabaster)",
          }}
        >
          View Full Analytics
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default CPWAnalytics;
