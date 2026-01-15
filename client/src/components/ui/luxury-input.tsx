import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HapticFeedback } from "@/lib/haptics";
import { Search, X } from "lucide-react";

/**
 * LUXURY INPUT SYSTEM
 *
 * Precision-engineered input components with:
 * - Warm luxury color palette
 * - Subtle animations on focus
 * - Haptic feedback
 * - Clean, minimal design
 */

export interface LuxuryInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  variant?: "default" | "filled" | "ghost";
}

const LuxuryInput = React.forwardRef<HTMLInputElement, LuxuryInputProps>(
  (
    {
      className,
      type,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onClear,
      variant = "default",
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = props.value !== undefined && props.value !== "";

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      HapticFeedback.selection();
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const variantStyles = {
      default: [
        "bg-white border border-slate-200",
        "focus:border-[#80163a] focus:ring-2 focus:ring-[#80163a]/10",
        error && "border-[#B44141] focus:border-[#B44141] focus:ring-[#B44141]/10",
      ],
      filled: [
        "bg-slate-100 border border-transparent",
        "focus:bg-white focus:border-[#80163a] focus:ring-2 focus:ring-[#80163a]/10",
        error && "border-[#B44141]",
      ],
      ghost: [
        "bg-transparent border-b border-slate-200 rounded-none",
        "focus:border-[#80163a]",
        error && "border-[#B44141]",
      ],
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            className={cn(
              "block text-sm font-medium mb-1.5 transition-colors",
              isFocused ? "text-[#80163a]" : "text-slate-700",
              error && "text-[#B44141]",
              disabled && "text-slate-400"
            )}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            type={type}
            className={cn(
              // Base styles
              "w-full h-11 px-4 rounded-xl text-sm",
              "text-slate-900 placeholder:text-slate-400",
              "transition-all duration-200",
              "outline-none",
              // Disabled
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50",
              // Variant styles
              ...variantStyles[variant],
              // Icon padding
              leftIcon && "pl-10",
              (rightIcon || onClear) && "pr-10",
              className
            )}
            ref={ref}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {/* Right icon / Clear button */}
          {(rightIcon || (onClear && hasValue)) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {onClear && hasValue ? (
                <button
                  type="button"
                  onClick={() => {
                    HapticFeedback.light();
                    onClear();
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 -m-1"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <span className="text-slate-400">{rightIcon}</span>
              )}
            </div>
          )}

          {/* Focus indicator line */}
          {variant === "default" && (
            <motion.div
              className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-[#80163a]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isFocused ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>

        {/* Error or hint message */}
        {(error || hint) && (
          <p
            className={cn(
              "mt-1.5 text-xs",
              error ? "text-[#B44141]" : "text-slate-500"
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

LuxuryInput.displayName = "LuxuryInput";

/**
 * Search Input - Specialized for search functionality
 */
interface SearchInputProps extends Omit<LuxuryInputProps, "leftIcon" | "type"> {
  onSearch?: (value: string) => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onClear, ...props }, ref) => {
    const [value, setValue] = React.useState(props.value || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      props.onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        onSearch(value as string);
        HapticFeedback.success();
      }
      props.onKeyDown?.(e);
    };

    const handleClear = () => {
      setValue("");
      onClear?.();
    };

    return (
      <LuxuryInput
        ref={ref}
        type="search"
        leftIcon={<Search className="h-4 w-4" />}
        placeholder="Search..."
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClear={onClear ? handleClear : undefined}
        variant="filled"
        {...props}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";

/**
 * Textarea - Multi-line input
 */
interface LuxuryTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const LuxuryTextarea = React.forwardRef<HTMLTextAreaElement, LuxuryTextareaProps>(
  ({ className, label, error, hint, disabled, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className="w-full">
        {label && (
          <label
            className={cn(
              "block text-sm font-medium mb-1.5 transition-colors",
              isFocused ? "text-[#80163a]" : "text-slate-700",
              error && "text-[#B44141]",
              disabled && "text-slate-400"
            )}
          >
            {label}
          </label>
        )}

        <textarea
          className={cn(
            "w-full min-h-[100px] px-4 py-3 rounded-xl text-sm",
            "text-slate-900 placeholder:text-slate-400",
            "bg-white border border-slate-200",
            "focus:border-[#80163a] focus:ring-2 focus:ring-[#80163a]/10",
            "transition-all duration-200 outline-none resize-y",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50",
            error && "border-[#B44141] focus:border-[#B44141] focus:ring-[#B44141]/10",
            className
          )}
          ref={ref}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {(error || hint) && (
          <p className={cn("mt-1.5 text-xs", error ? "text-[#B44141]" : "text-slate-500")}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

LuxuryTextarea.displayName = "LuxuryTextarea";

export { LuxuryInput, SearchInput, LuxuryTextarea };
export default LuxuryInput;
