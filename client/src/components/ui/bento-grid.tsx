import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { motion, HTMLMotionProps, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Bento Grid Layout System
 * Modular dashboard-style grid inspired by Cred & Apple
 * Features staggered animations and responsive breakpoints
 */

interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  animated?: boolean;
  staggerDelay?: number;
}

const gapSizes = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

const columnClasses = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

export const BentoGrid = forwardRef<HTMLDivElement, BentoGridProps>(
  (
    {
      className,
      columns = 4,
      gap = "md",
      animated = true,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      "grid",
      columnClasses[columns],
      gapSizes[gap],
      className
    );

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={baseClasses}
          variants={containerVariants}
          initial="hidden"
          animate="show"
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

BentoGrid.displayName = "BentoGrid";

/**
 * Bento Item - Individual grid cell
 */
interface BentoItemProps extends HTMLAttributes<HTMLDivElement> {
  span?: "default" | "wide" | "tall" | "hero";
  variant?: "default" | "glass" | "solid" | "gradient" | "outline";
  interactive?: boolean;
  glowOnHover?: boolean;
  animated?: boolean;
}

const spanClasses = {
  default: "",
  wide: "col-span-2",
  tall: "row-span-2",
  hero: "col-span-2 row-span-2",
};

const variantClasses = {
  default: "bg-[#1E1F2E] border-white/[0.06]",
  glass: "bg-white/[0.03] backdrop-blur-lg border-white/[0.08]",
  solid: "bg-[#25273C] border-white/[0.08]",
  gradient: "bg-gradient-to-br from-[#1E1F2E] to-[#2A2C42] border-white/[0.08]",
  outline: "bg-transparent border-white/[0.12] border-dashed",
};

export const BentoItem = forwardRef<HTMLDivElement, BentoItemProps>(
  (
    {
      className,
      span = "default",
      variant = "default",
      interactive = true,
      glowOnHover = false,
      animated = true,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      "relative overflow-hidden",
      "rounded-2xl border",
      "p-5",
      spanClasses[span],
      variantClasses[variant],
      interactive && [
        "transition-all duration-300 ease-out",
        "hover:border-white/[0.15]",
        "hover:-translate-y-1",
        "hover:shadow-xl hover:shadow-black/20",
        "cursor-pointer",
      ],
      glowOnHover && "hover:ring-1 hover:ring-[#D4AF37]/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]",
      className
    );

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={baseClasses}
          variants={itemVariants}
          whileHover={interactive ? { scale: 1.02 } : undefined}
          whileTap={interactive ? { scale: 0.98 } : undefined}
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

BentoItem.displayName = "BentoItem";

/**
 * Bento Stat - Pre-styled stat display for bento items
 */
interface BentoStatProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: "gold" | "green" | "blue" | "pink" | "purple";
  size?: "sm" | "md" | "lg";
  trend?: { direction: "up" | "down"; value: string };
}

const accentColors = {
  gold: {
    icon: "bg-[#D4AF37]/15 text-[#D4AF37]",
    glow: "shadow-[0_0_15px_rgba(212,175,55,0.2)]",
  },
  green: {
    icon: "bg-emerald-500/15 text-emerald-400",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]",
  },
  blue: {
    icon: "bg-blue-500/15 text-blue-400",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.2)]",
  },
  pink: {
    icon: "bg-pink-500/15 text-pink-400",
    glow: "shadow-[0_0_15px_rgba(236,72,153,0.2)]",
  },
  purple: {
    icon: "bg-purple-500/15 text-purple-400",
    glow: "shadow-[0_0_15px_rgba(168,85,247,0.2)]",
  },
};

const valueSizes = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
};

export function BentoStat({
  label,
  value,
  icon,
  accent = "gold",
  size = "md",
  trend,
}: BentoStatProps) {
  const colors = accentColors[accent];

  return (
    <div className="h-full flex flex-col">
      {icon && (
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center mb-4",
            colors.icon,
            colors.glow
          )}
        >
          {icon}
        </div>
      )}

      <div className="mt-auto">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#E4E5F1]/50 mb-1.5">
          {label}
        </p>
        <div className="flex items-end gap-3">
          <p className={cn("font-bold text-[#F5F0E6] font-mono", valueSizes[size])}>
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                "text-xs font-medium pb-1",
                trend.direction === "up" ? "text-emerald-400" : "text-red-400"
              )}
            >
              {trend.direction === "up" ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Bento Feature - Pre-styled feature card for bento items
 */
interface BentoFeatureProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
  };
  badge?: string;
  accentColor?: string;
}

export function BentoFeature({
  title,
  description,
  icon,
  action,
  badge,
  accentColor = "#D4AF37",
}: BentoFeatureProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <div style={{ color: accentColor }}>{icon}</div>
          </div>
        )}
        {badge && (
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${accentColor}20`,
              color: accentColor,
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <h3 className="text-base font-semibold text-[#F5F0E6] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#E4E5F1]/60 mb-4 line-clamp-2">{description}</p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="mt-auto text-sm font-medium flex items-center gap-1 group"
          style={{ color: accentColor }}
        >
          {action.label}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>
      )}
    </div>
  );
}

/**
 * Bento Hero - Large featured content block
 */
interface BentoHeroProps extends HTMLAttributes<HTMLDivElement> {
  backgroundImage?: string;
  gradient?: string;
  overlay?: boolean;
}

export function BentoHero({
  backgroundImage,
  gradient = "from-[#D4AF37]/20 to-transparent",
  overlay = true,
  className,
  children,
  ...props
}: BentoHeroProps) {
  return (
    <BentoItem
      span="hero"
      variant="gradient"
      className={cn("min-h-[200px] relative", className)}
      {...props}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {overlay && (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            gradient
          )}
        />
      )}

      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </BentoItem>
  );
}

export default BentoGrid;
