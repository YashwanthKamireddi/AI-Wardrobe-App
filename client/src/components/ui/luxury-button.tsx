import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HapticFeedback } from "@/lib/haptics";

/**
 * LUXURY BUTTON SYSTEM
 *
 * Precision-engineered button components with:
 * - Haptic feedback on interaction
 * - Press effect animations
 * - Luxury typography and spacing
 * - Warm palette colors
 */

const luxuryButtonVariants = cva(
  // Base styles - luxury typography and spacing
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary - Burgundy brand color
        default: [
          "bg-[#80163a] text-white",
          "hover:bg-[#9b1b4a]",
          "active:bg-[#5C1029]",
          "focus-visible:ring-[#80163a]",
          "shadow-sm hover:shadow-md",
        ].join(" "),

        // Gold accent
        gold: [
          "bg-[#D4A54A] text-[#1A1A1A]",
          "hover:bg-[#E8C067]",
          "active:bg-[#B8965C]",
          "focus-visible:ring-[#D4A54A]",
          "shadow-sm hover:shadow-md",
        ].join(" "),

        // Secondary - Subtle background
        secondary: [
          "bg-slate-100 text-slate-700",
          "hover:bg-slate-200",
          "active:bg-slate-300",
          "focus-visible:ring-slate-400",
        ].join(" "),

        // Ghost - Minimal
        ghost: [
          "text-slate-600",
          "hover:bg-slate-100 hover:text-slate-900",
          "active:bg-slate-200",
        ].join(" "),

        // Outline - Border only
        outline: [
          "border border-slate-200 bg-transparent text-slate-700",
          "hover:bg-slate-50 hover:border-slate-300",
          "active:bg-slate-100",
          "focus-visible:ring-slate-400",
        ].join(" "),

        // Destructive - Muted red
        destructive: [
          "bg-[#B44141] text-white",
          "hover:bg-[#9B3636]",
          "active:bg-[#822C2C]",
          "focus-visible:ring-[#B44141]",
        ].join(" "),

        // Link style
        link: [
          "text-[#80163a] underline-offset-4",
          "hover:underline",
        ].join(" "),

        // Glass effect
        glass: [
          "bg-white/80 backdrop-blur-md text-slate-700",
          "border border-white/50",
          "hover:bg-white/90",
          "shadow-sm",
        ].join(" "),
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-md gap-1",
        sm: "h-9 px-3 text-sm rounded-lg gap-1.5",
        default: "h-11 px-5 text-sm rounded-xl gap-2",
        lg: "h-12 px-6 text-base rounded-xl gap-2",
        xl: "h-14 px-8 text-base rounded-2xl gap-2.5",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
        "icon-lg": "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface LuxuryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof luxuryButtonVariants> {
  asChild?: boolean;
  haptic?: boolean;
  hapticType?: "success" | "selection" | "heavy" | "light";
  loading?: boolean;
}

const LuxuryButton = React.forwardRef<HTMLButtonElement, LuxuryButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      haptic = true,
      hapticType = "selection",
      loading = false,
      disabled,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic && !disabled && !loading) {
        // Trigger haptic based on type
        switch (hapticType) {
          case "success":
            HapticFeedback.success();
            break;
          case "heavy":
            HapticFeedback.heavy();
            break;
          case "light":
            HapticFeedback.light();
            break;
          default:
            HapticFeedback.selection();
        }
      }
      onClick?.(e);
    };

    return (
      <motion.div
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <Comp
          className={cn(luxuryButtonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled || loading}
          onClick={handleClick}
          {...props}
        >
          {loading ? (
            <>
              <motion.span
                className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>Loading...</span>
            </>
          ) : (
            children
          )}
        </Comp>
      </motion.div>
    );
  }
);

LuxuryButton.displayName = "LuxuryButton";

/**
 * Icon Button - Square button for icons only
 */
export interface IconButtonProps extends LuxuryButtonProps {
  icon: React.ReactNode;
  label: string; // For accessibility
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, size = "icon", ...props }, ref) => {
    return (
      <LuxuryButton
        ref={ref}
        size={size}
        aria-label={label}
        {...props}
      >
        {icon}
      </LuxuryButton>
    );
  }
);

IconButton.displayName = "IconButton";

/**
 * Floating Action Button - For primary actions
 */
interface FABProps extends LuxuryButtonProps {
  icon: React.ReactNode;
  label: string;
  extended?: boolean;
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ icon, label, extended = false, children, ...props }, ref) => {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-24 right-4 md:bottom-8 z-50"
      >
        <LuxuryButton
          ref={ref}
          size={extended ? "lg" : "icon-lg"}
          variant="default"
          hapticType="success"
          className={cn(
            "shadow-lg hover:shadow-xl",
            extended && "rounded-full px-6"
          )}
          aria-label={label}
          {...props}
        >
          {icon}
          {extended && <span>{children || label}</span>}
        </LuxuryButton>
      </motion.div>
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";

export { LuxuryButton, IconButton, FloatingActionButton, luxuryButtonVariants };
export default LuxuryButton;
