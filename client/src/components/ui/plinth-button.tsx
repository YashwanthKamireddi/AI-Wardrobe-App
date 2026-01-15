import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * NeoPOP Plinth Button Component
 * Inspired by Cred's signature tactile button design
 * Features 3D "plinth" effect with physics-based press animation
 */

type PlinthVariant = "gold" | "dark" | "ghost" | "neon" | "danger";
type PlinthSize = "sm" | "md" | "lg" | "xl";

interface PlinthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PlinthVariant;
  size?: PlinthSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variantStyles: Record<PlinthVariant, string> = {
  gold: `
    bg-gradient-to-br from-[#D4AF37] to-[#F5D547]
    text-[#161722]
    shadow-[4px_4px_0px_#A68B2B]
    hover:brightness-105
    active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
  `,
  dark: `
    bg-gradient-to-br from-[#2A2C42] to-[#25273C]
    text-[#F5F0E6]
    border border-white/10
    shadow-[4px_4px_0px_#0D0D14]
    hover:border-white/15
    active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
  `,
  ghost: `
    bg-transparent
    text-[#D4AF37]
    border-2 border-[#D4AF37]
    shadow-[4px_4px_0px_rgba(212,175,55,0.3)]
    hover:bg-[#D4AF37]/10
    active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
  `,
  neon: `
    bg-gradient-to-br from-[#39FF14] to-[#32CD32]
    text-[#161722]
    shadow-[4px_4px_0px_#1B8B1B,0_0_15px_rgba(57,255,20,0.4)]
    active:translate-x-[4px] active:translate-y-[4px] active:shadow-[0_0_10px_rgba(57,255,20,0.3)]
  `,
  danger: `
    bg-gradient-to-br from-[#FF4757] to-[#FF6B7A]
    text-white
    shadow-[4px_4px_0px_#C23545]
    active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
  `,
};

const sizeStyles: Record<PlinthSize, string> = {
  sm: "px-4 py-2.5 text-xs gap-1.5",
  md: "px-6 py-3.5 text-sm gap-2",
  lg: "px-8 py-4 text-base gap-2.5",
  xl: "px-10 py-5 text-lg gap-3",
};

export const PlinthButton = forwardRef<HTMLButtonElement, PlinthButtonProps>(
  (
    {
      className,
      variant = "gold",
      size = "md",
      fullWidth = false,
      loading = false,
      icon,
      iconPosition = "left",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "relative inline-flex items-center justify-center",
          "font-semibold uppercase tracking-wider",
          "rounded-xl border-0 cursor-pointer",
          "select-none touch-none",
          "transition-all duration-[80ms] ease-out",
          // Inner light highlight
          "before:absolute before:inset-0 before:rounded-xl",
          "before:bg-gradient-to-b before:from-white/20 before:to-transparent",
          "before:pointer-events-none",
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // Full width
          fullWidth && "w-full",
          // Disabled state
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner />
          </span>
        )}

        {/* Content wrapper */}
        <span
          className={cn(
            "inline-flex items-center justify-center",
            loading && "invisible"
          )}
        >
          {icon && iconPosition === "left" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </span>
      </button>
    );
  }
);

PlinthButton.displayName = "PlinthButton";

// Loading Spinner
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * NeoPOP Icon Button
 * Circular plinth button for icon-only actions
 */
interface PlinthIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PlinthVariant;
  size?: "sm" | "md" | "lg";
}

const iconSizeStyles = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-14 h-14",
};

export const PlinthIconButton = forwardRef<HTMLButtonElement, PlinthIconButtonProps>(
  ({ className, variant = "dark", size = "md", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center",
          "rounded-xl cursor-pointer select-none touch-none",
          "transition-all duration-[80ms] ease-out",
          variantStyles[variant],
          iconSizeStyles[size],
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PlinthIconButton.displayName = "PlinthIconButton";

export default PlinthButton;
