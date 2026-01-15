import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Sparkles,
  Crown,
  Star,
  Zap,
  Trophy,
  Heart,
  Gem,
  Flame,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PlinthButton } from "./plinth-button";

/**
 * Mystery Reward System - Variable Rewards (Slot Machine Effect)
 * Inspired by Cred's gamification patterns
 * Creates dopamine through uncertainty
 */

interface Reward {
  id: string;
  type: "coins" | "badge" | "discount" | "xp" | "special";
  value: number | string;
  label: string;
  icon: React.ReactNode;
  rarity: "common" | "rare" | "epic" | "legendary";
  animation?: "confetti" | "glow" | "shake" | "bounce";
}

interface MysteryRewardCardProps {
  onReveal?: (reward: Reward) => void;
  availableRewards?: Reward[];
  disabled?: boolean;
  compact?: boolean;
}

// Default reward pool with rarity weights
const DEFAULT_REWARDS: Reward[] = [
  { id: "1", type: "xp", value: 10, label: "+10 XP", icon: <Zap className="w-6 h-6" />, rarity: "common" },
  { id: "2", type: "xp", value: 25, label: "+25 XP", icon: <Zap className="w-6 h-6" />, rarity: "common" },
  { id: "3", type: "xp", value: 50, label: "+50 XP", icon: <Zap className="w-6 h-6" />, rarity: "rare" },
  { id: "4", type: "coins", value: 5, label: "5 Coins", icon: <Star className="w-6 h-6" />, rarity: "common" },
  { id: "5", type: "coins", value: 25, label: "25 Coins", icon: <Star className="w-6 h-6" />, rarity: "rare" },
  { id: "6", type: "coins", value: 100, label: "100 Coins", icon: <Gem className="w-6 h-6" />, rarity: "epic", animation: "glow" },
  { id: "7", type: "badge", value: "Style Guru", label: "Style Guru Badge", icon: <Trophy className="w-6 h-6" />, rarity: "epic", animation: "confetti" },
  { id: "8", type: "discount", value: "10%", label: "10% Off Next Item", icon: <Gift className="w-6 h-6" />, rarity: "rare" },
  { id: "9", type: "special", value: "VIP", label: "VIP Status (24h)", icon: <Crown className="w-6 h-6" />, rarity: "legendary", animation: "confetti" },
];

const RARITY_COLORS = {
  common: { bg: "from-slate-600 to-slate-700", border: "border-slate-500", text: "text-slate-300" },
  rare: { bg: "from-blue-600 to-blue-700", border: "border-blue-400", text: "text-blue-300" },
  epic: { bg: "from-purple-600 to-purple-700", border: "border-purple-400", text: "text-purple-300" },
  legendary: { bg: "from-amber-500 to-yellow-500", border: "border-yellow-400", text: "text-yellow-300" },
};

const RARITY_WEIGHTS = {
  common: 60,
  rare: 25,
  epic: 12,
  legendary: 3,
};

export function MysteryRewardCard({
  onReveal,
  availableRewards = DEFAULT_REWARDS,
  disabled = false,
  compact = false,
}: MysteryRewardCardProps) {
  const [state, setState] = useState<"idle" | "revealing" | "revealed">("idle");
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Weighted random selection
  const selectReward = useCallback(() => {
    const weightedPool: Reward[] = [];

    availableRewards.forEach((reward) => {
      const weight = RARITY_WEIGHTS[reward.rarity];
      for (let i = 0; i < weight; i++) {
        weightedPool.push(reward);
      }
    });

    const randomIndex = Math.floor(Math.random() * weightedPool.length);
    return weightedPool[randomIndex];
  }, [availableRewards]);

  const handleReveal = () => {
    if (state !== "idle" || disabled) return;

    setState("revealing");

    // Simulate suspense
    setTimeout(() => {
      const reward = selectReward();
      setSelectedReward(reward);
      setState("revealed");

      if (reward.animation === "confetti" || reward.rarity === "legendary") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      // Trigger haptic feedback if available
      if (navigator.vibrate) {
        if (reward.rarity === "legendary") {
          navigator.vibrate([100, 50, 100, 50, 200]);
        } else if (reward.rarity === "epic") {
          navigator.vibrate([100, 50, 100]);
        } else {
          navigator.vibrate(50);
        }
      }

      onReveal?.(reward);
    }, 1500);
  };

  const reset = () => {
    setState("idle");
    setSelectedReward(null);
  };

  if (compact) {
    return (
      <CompactMysteryCard
        state={state}
        reward={selectedReward}
        onReveal={handleReveal}
        onReset={reset}
        disabled={disabled}
      />
    );
  }

  return (
    <div className="relative">
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && <ConfettiEffect />}
      </AnimatePresence>

      <motion.div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "bg-gradient-to-br from-[#1E1F2E] to-[#161722]",
          "border border-white/10",
          "p-6"
        )}
        layout
      >
        {/* Shimmer Effect */}
        {state === "idle" && (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {state === "idle" && (
            <IdleState onReveal={handleReveal} disabled={disabled} />
          )}

          {state === "revealing" && <RevealingState />}

          {state === "revealed" && selectedReward && (
            <RevealedState reward={selectedReward} onReset={reset} />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Idle State - Mystery Card
function IdleState({ onReveal, disabled }: { onReveal: () => void; disabled: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center space-y-5"
    >
      <motion.div
        className="relative w-20 h-20 mx-auto"
        animate={{
          y: [0, -8, 0],
          rotate: [-2, 2, -2]
        }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-2xl blur-xl" />
        <div className="relative w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#F5D547] rounded-2xl flex items-center justify-center">
          <span className="text-4xl font-bold text-[#161722]">?</span>
        </div>
      </motion.div>

      <div>
        <h3 className="text-xl font-bold text-[#F5F0E6] mb-1">Mystery Reward</h3>
        <p className="text-sm text-[#E4E5F1]/60">Complete actions to earn rewards</p>
      </div>

      <PlinthButton
        variant="gold"
        size="lg"
        fullWidth
        onClick={onReveal}
        disabled={disabled}
        icon={<Gift className="w-5 h-5" />}
      >
        Reveal Reward
      </PlinthButton>
    </motion.div>
  );
}

// Revealing State - Slot Machine Effect
function RevealingState() {
  const icons = [Gift, Star, Gem, Crown, Trophy, Zap, Heart, Flame];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center py-8"
    >
      <div className="relative h-24 overflow-hidden">
        <motion.div
          className="absolute inset-x-0"
          animate={{ y: [0, -800] }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          {[...Array(10)].map((_, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div
                key={i}
                className="h-24 flex items-center justify-center"
              >
                <Icon className="w-12 h-12 text-[#D4AF37]" />
              </div>
            );
          })}
        </motion.div>
      </div>

      <motion.p
        className="text-[#E4E5F1]/60 mt-4"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
      >
        Revealing your reward...
      </motion.p>
    </motion.div>
  );
}

// Revealed State - Show Reward
function RevealedState({ reward, onReset }: { reward: Reward; onReset: () => void }) {
  const rarityStyle = RARITY_COLORS[reward.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className="text-center space-y-5"
    >
      <motion.div
        className={cn(
          "relative w-24 h-24 mx-auto rounded-2xl",
          "bg-gradient-to-br",
          rarityStyle.bg,
          "border-2",
          rarityStyle.border,
          "flex items-center justify-center",
          reward.rarity === "legendary" && "shadow-[0_0_30px_rgba(212,175,55,0.5)]"
        )}
        animate={reward.rarity === "legendary" ? {
          boxShadow: [
            "0 0 20px rgba(212,175,55,0.3)",
            "0 0 40px rgba(212,175,55,0.6)",
            "0 0 20px rgba(212,175,55,0.3)",
          ]
        } : undefined}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <div className={cn("w-10 h-10", rarityStyle.text)}>
          {reward.icon}
        </div>
      </motion.div>

      <div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className={cn(
            "inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2",
            "bg-gradient-to-r",
            rarityStyle.bg,
            rarityStyle.text
          )}>
            {reward.rarity}
          </span>
        </motion.div>

        <motion.h3
          className="text-2xl font-bold text-[#F5F0E6]"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {reward.label}
        </motion.h3>

        <motion.p
          className="text-sm text-[#E4E5F1]/60 mt-1"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Added to your account
        </motion.p>
      </div>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <PlinthButton variant="dark" onClick={onReset}>
          Claim & Close
        </PlinthButton>
      </motion.div>
    </motion.div>
  );
}

// Compact Mystery Card
function CompactMysteryCard({
  state,
  reward,
  onReveal,
  onReset,
  disabled,
}: {
  state: "idle" | "revealing" | "revealed";
  reward: Reward | null;
  onReveal: () => void;
  onReset: () => void;
  disabled: boolean;
}) {
  if (state === "revealed" && reward) {
    const rarityStyle = RARITY_COLORS[reward.rarity];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "flex items-center gap-4 p-4 rounded-xl",
          "bg-gradient-to-r",
          rarityStyle.bg,
          "border",
          rarityStyle.border,
          "cursor-pointer"
        )}
        onClick={onReset}
      >
        <div className={cn("w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center", rarityStyle.text)}>
          {reward.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">{reward.label}</p>
          <p className="text-xs text-white/60 uppercase">{reward.rarity}</p>
        </div>
        <PartyPopper className="w-5 h-5 text-white/80" />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl",
        "bg-gradient-to-r from-[#1E1F2E] to-[#25273C]",
        "border border-[#D4AF37]/30",
        "cursor-pointer",
        disabled && "opacity-50 pointer-events-none"
      )}
      onClick={onReveal}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center"
        animate={state === "revealing" ? { rotate: 360 } : { rotate: 0 }}
        transition={{ repeat: state === "revealing" ? Infinity : 0, duration: 0.5, ease: "linear" }}
      >
        {state === "revealing" ? (
          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
        ) : (
          <Gift className="w-5 h-5 text-[#D4AF37]" />
        )}
      </motion.div>
      <div className="flex-1">
        <p className="text-sm font-bold text-[#F5F0E6]">
          {state === "revealing" ? "Revealing..." : "Mystery Reward"}
        </p>
        <p className="text-xs text-[#E4E5F1]/60">Tap to reveal</p>
      </div>
      <div className="text-2xl">🎁</div>
    </motion.div>
  );
}

// Confetti Effect
function ConfettiEffect() {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ["#D4AF37", "#FF1493", "#39FF14", "#00FFFF", "#BF40BF"][Math.floor(Math.random() * 5)],
  }));

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none overflow-hidden z-50"
    >
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: piece.color,
            left: `${piece.x}%`,
            top: "-10%",
          }}
          initial={{ y: 0, rotate: 0 }}
          animate={{
            y: "120vh",
            rotate: 720,
            x: [0, Math.random() * 100 - 50, 0],
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: piece.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
}

export default MysteryRewardCard;
