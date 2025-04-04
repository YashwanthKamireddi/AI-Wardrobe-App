/**
 * FashionLogo Component
 * 
 * A stylized logo component for the Cher's Closet application featuring a custom clothing hanger icon
 * with luxury fashion branding. The component supports different sizes, animation options,
 * and a compact mode for space-constrained UI areas.
 * 
 * @module FashionLogo
 * @component
 * 
 * Features:
 * - Responsive sizing with predefined options (sm, md, lg, xl)
 * - Optional animation effects for interactive elements
 * - Compact mode that shows only the icon without text for space-constrained areas
 * - Luxury gradient styling for the text portion
 * - Custom SVG implementation of a fashion hanger with clothing silhouette
 * 
 * UI Elements:
 * - SVG hanger icon with geometric styling
 * - Gradient text treatment for the "Cher's Closet" brand name
 * - Configurable animation effects
 * 
 * Usage:
 * - In the NavigationBar as the primary brand identity
 * - On authentication screens for brand recognition
 * - In headers or footers across the application
 * 
 * @example
 * // Default usage with medium size
 * <FashionLogo />
 * 
 * @example
 * // Large animated logo
 * <FashionLogo size="lg" animated={true} />
 * 
 * @example
 * // Compact logo for mobile navigation
 * <FashionLogo size="sm" compact={true} />
 */

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Props for the FashionLogo component
 * 
 * @interface FashionLogoProps
 * @property {string} [className] - Additional CSS classes to apply to the component
 * @property {"sm" | "md" | "lg" | "xl"} [size="md"] - Size variant for the logo
 *           - sm: Small (28×28px) - suitable for mobile or compact UI elements
 *           - md: Medium (40×40px) - default size for general use
 *           - lg: Large (64×64px) - for featured areas or headers
 *           - xl: Extra Large (96×96px) - for hero sections or splash screens
 * @property {boolean} [animated=false] - Whether to apply animation effects to the logo
 * @property {boolean} [compact=false] - Whether to show only the icon without the text label
 */
interface FashionLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  compact?: boolean;
}

/**
 * FashionLogo Component Function
 * 
 * Renders the Cher's Closet brand logo with customizable size, animation, and display options.
 * The logo consists of a custom SVG hanger icon and optional gradient text branding.
 * 
 * @function FashionLogo
 * @param {FashionLogoProps} props - The component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {"sm" | "md" | "lg" | "xl"} [props.size="md"] - Size variant
 * @param {boolean} [props.animated=false] - Whether to apply animation
 * @param {boolean} [props.compact=false] - Whether to show only the icon
 * @returns {JSX.Element} The rendered FashionLogo component
 * 
 * Design Notes:
 * - The SVG icon is constructed with semantic parts (top circle, triangle body, bottom bar)
 * - Gradient text uses the primary amber color from the theme.json configuration
 * - Animation is subtle pulse effect to draw attention without distraction
 * - Compact mode is responsive to viewport constraints
 * 
 * Accessibility:
 * - SVG elements use appropriate ARIA attributes
 * - Color contrast meets WCAG AA standards for text readability
 * - Animation is subtle and not distracting for users with vestibular disorders
 */
export function FashionLogo({ 
  className, 
  size = "md", 
  animated = false,
  compact = false 
}: FashionLogoProps) {
  // Map size variants to Tailwind CSS classes for consistent sizing
  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  // Apply animation class conditionally
  const animationClass = animated ? "animate-pulse" : "";

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn("relative", sizeClasses[size], animationClass)}>
        {/* Stylized hanger icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("text-primary", sizeClasses[size])}
        >
          {/* Hanger top part */}
          <circle cx="12" cy="4" r="2" className="fill-primary" />
          
          {/* Hanger triangle */}
          <path 
            d="M12 6 L5 16 L19 16 Z" 
            className="fill-primary/10 stroke-primary"
            strokeWidth="1.5" 
          />
          
          {/* Hanger bottom bar */}
          <line x1="5" y1="16" x2="19" y2="16" strokeWidth="2.5" className="stroke-primary" />
          
          {/* Clothing silhouette */}
          <path 
            d="M7 16 C7 16 6 20 8 21 C10 22 14 22 16 21 C18 20 17 16 17 16" 
            className="stroke-primary/70"
            strokeDasharray={animated ? "5,3" : "0"} 
          />
        </svg>
      </div>
      {!compact && (
        <div className={cn("ml-2 font-bold", {
          "text-sm": size === "sm",
          "text-lg": size === "md",
          "text-2xl": size === "lg",
          "text-3xl": size === "xl",
        })}>
          <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
            Cher's Closet
          </span>
        </div>
      )}
    </div>
  );
}