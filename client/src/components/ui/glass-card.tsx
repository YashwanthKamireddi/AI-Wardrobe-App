import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Glassmorphism Card Component
 * Premium frosted glass effect for luxury UI
 * Light theme variant
 */

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  blur?: "sm" | "md" | "lg" | "xl";
  opacity?: "light" | "medium" | "heavy";
  borderGlow?: boolean;
  hoverEffect?: boolean;
  animated?: boolean;
}

const blurLevels = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
};

const opacityLevels = {
  light: "bg-white/80",
  medium: "bg-white/90",
  heavy: "bg-white",
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      blur = "lg",
      opacity = "medium",
      borderGlow = false,
      hoverEffect = true,
      animated = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      // Glass effect
      blurLevels[blur],
      opacityLevels[opacity],
      // Border
      "border border-slate-200/60",
      "rounded-2xl",
      // Shadow
      "shadow-sm",
      // Hover effect
      hoverEffect && [
        "transition-all duration-300 ease-out",
        "hover:border-slate-300/80",
        "hover:shadow-md",
        "hover:-translate-y-0.5",
      ],
      // Glow effect
      borderGlow && "ring-1 ring-amber-500/20 hover:ring-amber-500/40",
      className
    );

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={baseClasses}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          whileHover={hoverEffect ? { y: -2, scale: 1.005 } : undefined}
          {...(props as HTMLMotionProps<"div">)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseClasses} {...props}>
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

/**
 * Glass Panel - Full width frosted section
 */
interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  intensity?: "subtle" | "medium" | "strong";
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, intensity = "medium", children, ...props }, ref) => {
    const intensityClasses = {
      subtle: "bg-white/[0.02] backdrop-blur-sm border-white/[0.05]",
      medium: "bg-white/[0.05] backdrop-blur-md border-white/[0.08]",
      strong: "bg-white/[0.08] backdrop-blur-lg border-white/[0.12]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "border rounded-3xl",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
          intensityClasses[intensity],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = "GlassPanel";

/**
 * Glass Input - Frosted input field
 */
interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, error, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E4E5F1]/50">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3.5",
            icon && "pl-12",
            "bg-white/[0.05] backdrop-blur-md",
            "border border-white/[0.1]",
            "rounded-xl",
            "text-[#F5F0E6] text-sm",
            "placeholder:text-[#E4E5F1]/40",
            "transition-all duration-200",
            "focus:outline-none focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20",
            "focus:bg-white/[0.08]",
            error && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";

/**
 * Glass Badge - Frosted status badge
 */
interface GlassBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "success" | "danger" | "info";
  size?: "sm" | "md";
}

export const GlassBadge = forwardRef<HTMLSpanElement, GlassBadgeProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-white/[0.08] border-white/[0.1] text-[#F5F0E6]",
      gold: "bg-[#D4AF37]/20 border-[#D4AF37]/30 text-[#D4AF37]",
      success: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
      danger: "bg-red-500/20 border-red-500/30 text-red-400",
      info: "bg-blue-500/20 border-blue-500/30 text-blue-400",
    };

    const sizeClasses = {
      sm: "px-2 py-0.5 text-[10px]",
      md: "px-3 py-1 text-xs",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5",
          "backdrop-blur-sm border rounded-full",
          "font-semibold uppercase tracking-wider",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

GlassBadge.displayName = "GlassBadge";

/**
 * Glass Modal Overlay
 */
interface GlassOverlayProps extends HTMLAttributes<HTMLDivElement> {
  show: boolean;
  onClose?: () => void;
}

export function GlassOverlay({ show, onClose, children, className }: GlassOverlayProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "relative z-10",
          "bg-[#1E1F2E]/90 backdrop-blur-xl",
          "border border-white/[0.1]",
          "rounded-3xl",
          "shadow-2xl shadow-black/50",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Glass Stat Card - For displaying metrics
 */
interface GlassStatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function GlassStatCard({
  label,
  value,
  icon,
  trend,
  trendValue,
  className,
  ...props
}: GlassStatCardProps) {
  const trendColors = {
    up: "text-emerald-400",
    down: "text-red-400",
    neutral: "text-[#E4E5F1]/60",
  };

  return (
    <GlassCard className={cn("p-5", className)} {...props}>
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
            <div className="text-[#D4AF37]">{icon}</div>
          </div>
        )}
        {trend && trendValue && (
          <span className={cn("text-xs font-medium", trendColors[trend])}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </span>
        )}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E4E5F1]/50 mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-[#F5F0E6] font-mono">
        {value}
      </p>
    </GlassCard>
  );
}

export default GlassCard;
