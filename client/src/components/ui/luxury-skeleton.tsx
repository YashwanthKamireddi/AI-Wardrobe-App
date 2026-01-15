import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * LUXURY SKELETON LOADING SYSTEM
 *
 * Based on Farfetch's "Optimistic UI" pattern:
 * - Shimmering outlines instead of spinners
 * - Reduces perceived latency
 * - Maintains visual hierarchy during load
 */

interface SkeletonProps {
  className?: string;
  variant?: "default" | "gold" | "card" | "text" | "avatar" | "image";
  animate?: boolean;
}

export function LuxurySkeleton({
  className,
  variant = "default",
  animate = true
}: SkeletonProps) {
  const baseClass = "rounded";

  const variants = {
    default: "bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100",
    gold: "bg-gradient-to-r from-amber-50/50 via-amber-100/30 to-amber-50/50",
    card: "bg-gradient-to-r from-slate-100 via-white to-slate-100",
    text: "bg-gradient-to-r from-slate-200/60 via-slate-100/60 to-slate-200/60 h-4",
    avatar: "bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-full",
    image: "bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 aspect-[3/4]",
  };

  return (
    <motion.div
      className={cn(baseClass, variants[variant], className)}
      animate={animate ? {
        backgroundPosition: ["200% 0", "-200% 0"],
      } : undefined}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        backgroundSize: "200% 100%",
      }}
    />
  );
}

/**
 * Wardrobe Item Skeleton - Mimics the item card structure
 */
export function WardrobeItemSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-white border border-slate-200/50 shadow-sm">
      {/* Image skeleton with aspect ratio */}
      <LuxurySkeleton variant="image" className="w-full" />

      {/* Content skeleton */}
      <div className="p-3 space-y-2">
        <LuxurySkeleton variant="text" className="w-3/4" />
        <LuxurySkeleton variant="text" className="w-1/2 h-3" />
      </div>
    </div>
  );
}

/**
 * Outfit Card Skeleton
 */
export function OutfitCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-slate-200/50 shadow-sm">
      <LuxurySkeleton variant="image" className="w-full aspect-square" />
      <div className="p-4 space-y-3">
        <LuxurySkeleton variant="text" className="w-2/3" />
        <div className="flex gap-2">
          <LuxurySkeleton className="w-16 h-6 rounded-full" />
          <LuxurySkeleton className="w-20 h-6 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Profile Card Skeleton
 */
export function ProfileCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/50 p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <LuxurySkeleton variant="avatar" className="w-16 h-16" />
        <div className="flex-1 space-y-2">
          <LuxurySkeleton variant="text" className="w-32" />
          <LuxurySkeleton variant="text" className="w-24 h-3" />
        </div>
      </div>
      <div className="mt-4">
        <LuxurySkeleton className="w-full h-1.5 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Stats Grid Skeleton
 */
export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="text-center p-3 rounded-xl bg-white border border-slate-200/50">
          <LuxurySkeleton className="w-4 h-4 mx-auto mb-1.5 rounded" />
          <LuxurySkeleton variant="text" className="w-8 h-5 mx-auto mb-1" />
          <LuxurySkeleton variant="text" className="w-12 h-2 mx-auto" />
        </div>
      ))}
    </div>
  );
}

/**
 * List Item Skeleton
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200/50">
      <LuxurySkeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <LuxurySkeleton variant="text" className="w-3/4" />
        <LuxurySkeleton variant="text" className="w-1/2 h-3" />
      </div>
      <LuxurySkeleton className="w-5 h-5 rounded" />
    </div>
  );
}

/**
 * Full Page Skeleton - Dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#faf9f7] p-4 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <LuxurySkeleton variant="text" className="w-20 h-3" />
          <LuxurySkeleton variant="text" className="w-32 h-6" />
        </div>
        <LuxurySkeleton className="w-10 h-10 rounded-full" />
      </div>

      {/* Stats grid */}
      <StatsGridSkeleton />

      {/* Content cards */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        {[...Array(4)].map((_, i) => (
          <WardrobeItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Processing Overlay - For AI operations
 */
interface ProcessingOverlayProps {
  message?: string;
  progress?: number;
}

export function ProcessingOverlay({
  message = "Processing...",
  progress
}: ProcessingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl z-10"
    >
      {/* Gold shimmer ring */}
      <motion.div
        className="w-16 h-16 rounded-full border-2 border-transparent"
        style={{
          background: "linear-gradient(135deg, rgba(212,165,74,0.2) 0%, transparent 50%, rgba(212,165,74,0.2) 100%)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />

      <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>

      {progress !== undefined && (
        <div className="w-32 h-1 bg-slate-200 rounded-full mt-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #80163a, #D4A54A)" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </motion.div>
  );
}

export default LuxurySkeleton;
