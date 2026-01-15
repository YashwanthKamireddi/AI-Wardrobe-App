import { useState, useEffect } from "react";
import {
  Award,
  Crown,
  Star,
  Zap,
  Target,
  Flame,
  Trophy,
  Medal,
  Heart,
  Sparkles,
  Leaf,
  Shirt,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Lock,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof BADGE_ICONS;
  tier: "bronze" | "silver" | "gold" | "platinum";
  progress: number; // 0-100
  unlocked: boolean;
  unlockedAt?: string;
  category: "streak" | "sustainability" | "style" | "community" | "special";
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  completedAt?: string;
}

interface GamificationStats {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  streak: number;
  badges: Badge[];
  recentAchievements: Achievement[];
}

const BADGE_ICONS = {
  crown: Crown,
  star: Star,
  zap: Zap,
  target: Target,
  flame: Flame,
  trophy: Trophy,
  medal: Medal,
  heart: Heart,
  sparkles: Sparkles,
  leaf: Leaf,
  shirt: Shirt,
  calendar: Calendar,
  trending: TrendingUp,
  award: Award,
};

const TIER_COLORS = {
  bronze: {
    bg: "rgba(205, 127, 50, 0.1)",
    border: "rgba(205, 127, 50, 0.3)",
    text: "#CD7F32",
    glow: "rgba(205, 127, 50, 0.2)",
  },
  silver: {
    bg: "rgba(192, 192, 192, 0.1)",
    border: "rgba(192, 192, 192, 0.4)",
    text: "#808080",
    glow: "rgba(192, 192, 192, 0.2)",
  },
  gold: {
    bg: "rgba(212, 175, 55, 0.1)",
    border: "rgba(212, 175, 55, 0.4)",
    text: "#D4AF37",
    glow: "rgba(212, 175, 55, 0.3)",
  },
  platinum: {
    bg: "rgba(229, 228, 226, 0.1)",
    border: "rgba(229, 228, 226, 0.5)",
    text: "#E5E4E2",
    glow: "rgba(229, 228, 226, 0.4)",
  },
};

interface GamificationBadgesProps {
  stats: GamificationStats;
  compact?: boolean;
  onBadgeClick?: (badge: Badge) => void;
}

export function GamificationBadges({
  stats,
  compact = false,
  onBadgeClick,
}: GamificationBadgesProps) {
  const [selectedCategory, setSelectedCategory] = useState<Badge["category"] | "all">("all");
  const [showConfetti, setShowConfetti] = useState(false);

  const levelProgress = (stats.currentXP / stats.nextLevelXP) * 100;

  const filteredBadges = stats.badges.filter(
    (badge) => selectedCategory === "all" || badge.category === selectedCategory
  );

  const renderBadgeIcon = (badge: Badge) => {
    const IconComponent = BADGE_ICONS[badge.icon];
    const tierColor = TIER_COLORS[badge.tier];

    return (
      <div
        className={cn(
          "relative w-14 h-14 rounded-xl flex items-center justify-center transition-all",
          badge.unlocked ? "opacity-100" : "opacity-40"
        )}
        style={{
          background: badge.unlocked ? tierColor.bg : "var(--color-pearl)",
          border: `2px solid ${badge.unlocked ? tierColor.border : "var(--color-pearl)"}`,
          boxShadow: badge.unlocked ? `0 0 20px ${tierColor.glow}` : "none",
        }}
      >
        <IconComponent
          className="h-6 w-6"
          style={{ color: badge.unlocked ? tierColor.text : "var(--color-taupe)" }}
        />
        {!badge.unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
            <Lock className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    );
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
        {/* Level Progress */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(212, 175, 55, 0.1)" }}
          >
            <Crown className="h-5 w-5" style={{ color: "var(--color-gold-muted)" }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold" style={{ color: "var(--color-charcoal)" }}>
                Level {stats.level}
              </span>
              <span className="text-xs" style={{ color: "var(--color-graphite)" }}>
                {stats.currentXP}/{stats.nextLevelXP} XP
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "var(--color-pearl)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${levelProgress}%`,
                  background: "var(--color-gold-muted)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4" style={{ color: "var(--color-warning)" }} />
            <span className="text-sm" style={{ color: "var(--color-charcoal)" }}>
              {stats.streak} day streak
            </span>
          </div>
          <div className="flex -space-x-2">
            {stats.badges
              .filter((b) => b.unlocked)
              .slice(0, 4)
              .map((badge) => (
                <div
                  key={badge.id}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: TIER_COLORS[badge.tier].bg,
                    border: `1.5px solid ${TIER_COLORS[badge.tier].border}`,
                    color: TIER_COLORS[badge.tier].text,
                  }}
                >
                  {React.createElement(BADGE_ICONS[badge.icon], { className: "h-3 w-3" })}
                </div>
              ))}
          </div>
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
      {/* Header with Level */}
      <div
        className="p-5"
        style={{
          background: "linear-gradient(135deg, var(--color-cashmere) 0%, white 100%)",
          borderBottom: "1px solid var(--color-pearl)",
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className="text-xs font-semibold tracking-wider uppercase mb-1"
              style={{ color: "var(--color-graphite)" }}
            >
              Your Style Journey
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className="text-3xl font-bold"
                style={{ color: "var(--color-charcoal)" }}
              >
                Level {stats.level}
              </span>
              <span className="text-sm" style={{ color: "var(--color-gold-muted)" }}>
                Style Maven
              </span>
            </div>
          </div>

          {/* Streak Badge */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "rgba(196, 149, 74, 0.1)",
              border: "1px solid rgba(196, 149, 74, 0.2)",
            }}
          >
            <Flame className="h-5 w-5" style={{ color: "var(--color-warning)" }} />
            <div>
              <p className="text-lg font-bold" style={{ color: "var(--color-charcoal)" }}>
                {stats.streak}
              </p>
              <p className="text-[10px]" style={{ color: "var(--color-graphite)" }}>
                day streak
              </p>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: "var(--color-graphite)" }}>
              Progress to Level {stats.level + 1}
            </span>
            <span className="text-sm font-semibold" style={{ color: "var(--color-charcoal)" }}>
              {stats.currentXP}/{stats.nextLevelXP} XP
            </span>
          </div>
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ background: "var(--color-pearl)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700 shimmer-gold"
              style={{
                width: `${levelProgress}%`,
                background: "linear-gradient(90deg, #D4AF37 0%, #E8C975 50%, #D4AF37 100%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div
        className="flex gap-2 p-4 overflow-x-auto"
        style={{ borderBottom: "1px solid var(--color-pearl)" }}
      >
        {[
          { id: "all", label: "All" },
          { id: "streak", label: "Streak" },
          { id: "sustainability", label: "Eco" },
          { id: "style", label: "Style" },
          { id: "community", label: "Social" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id as typeof selectedCategory)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              selectedCategory === id
                ? "bg-[var(--color-obsidian)] text-[var(--color-alabaster)]"
                : "bg-[var(--color-cashmere)] text-[var(--color-graphite)]"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="p-4 grid grid-cols-3 gap-3">
        {filteredBadges.map((badge) => (
          <button
            key={badge.id}
            onClick={() => onBadgeClick?.(badge)}
            className="flex flex-col items-center p-3 rounded-xl transition-all hover:bg-cashmere press-feedback"
            style={{ background: badge.unlocked ? "var(--color-cashmere)" : "transparent" }}
          >
            {renderBadgeIcon(badge)}
            <p
              className="text-xs font-medium mt-2 text-center line-clamp-1"
              style={{ color: badge.unlocked ? "var(--color-charcoal)" : "var(--color-taupe)" }}
            >
              {badge.name}
            </p>
            {!badge.unlocked && badge.progress > 0 && (
              <div className="w-full mt-1">
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: "var(--color-pearl)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${badge.progress}%`,
                      background: "var(--color-taupe)",
                    }}
                  />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Recent Achievements */}
      {stats.recentAchievements.length > 0 && (
        <div className="p-4" style={{ borderTop: "1px solid var(--color-pearl)" }}>
          <p
            className="text-xs font-semibold tracking-wider uppercase mb-3"
            style={{ color: "var(--color-graphite)" }}
          >
            Recent Achievements
          </p>
          <div className="space-y-2">
            {stats.recentAchievements.slice(0, 3).map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-3 rounded-xl animate-fade-up"
                style={{ background: "var(--color-cashmere)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(46, 125, 90, 0.1)" }}
                >
                  <CheckCircle2 className="h-5 w-5" style={{ color: "var(--color-success)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--color-charcoal)" }}>
                    {achievement.title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-graphite)" }}>
                    +{achievement.xp} XP
                  </p>
                </div>
                <Sparkles className="h-4 w-4" style={{ color: "var(--color-gold-muted)" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4" style={{ borderTop: "1px solid var(--color-pearl)" }}>
        <button
          className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all press-feedback"
          style={{
            background: "var(--color-obsidian)",
            color: "var(--color-alabaster)",
          }}
        >
          <Trophy className="h-4 w-4" />
          View All Achievements
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Sample data generator for testing
export function getMockGamificationStats(): GamificationStats {
  return {
    level: 12,
    currentXP: 2340,
    nextLevelXP: 3000,
    totalXP: 15340,
    streak: 7,
    badges: [
      {
        id: "1",
        name: "First Outfit",
        description: "Create your first outfit",
        icon: "shirt",
        tier: "bronze",
        progress: 100,
        unlocked: true,
        unlockedAt: "2024-01-15",
        category: "style",
      },
      {
        id: "2",
        name: "Style Streak",
        description: "Log outfits for 7 days straight",
        icon: "flame",
        tier: "silver",
        progress: 100,
        unlocked: true,
        unlockedAt: "2024-01-22",
        category: "streak",
      },
      {
        id: "3",
        name: "Eco Warrior",
        description: "Re-wear items 10 times",
        icon: "leaf",
        tier: "gold",
        progress: 80,
        unlocked: false,
        category: "sustainability",
      },
      {
        id: "4",
        name: "Trendsetter",
        description: "Get 50 saves on an outfit",
        icon: "sparkles",
        tier: "gold",
        progress: 45,
        unlocked: false,
        category: "community",
      },
      {
        id: "5",
        name: "Wardrobe Master",
        description: "Add 50 items to wardrobe",
        icon: "crown",
        tier: "platinum",
        progress: 60,
        unlocked: false,
        category: "style",
      },
      {
        id: "6",
        name: "Daily Devotee",
        description: "30 day streak",
        icon: "target",
        tier: "gold",
        progress: 23,
        unlocked: false,
        category: "streak",
      },
    ],
    recentAchievements: [
      {
        id: "a1",
        title: "7 Day Streak!",
        description: "You're on fire!",
        xp: 100,
        completedAt: "2024-01-22",
      },
      {
        id: "a2",
        title: "Outfit of the Week",
        description: "Your outfit was featured",
        xp: 250,
        completedAt: "2024-01-21",
      },
    ],
  };
}

import React from "react";
export default GamificationBadges;
