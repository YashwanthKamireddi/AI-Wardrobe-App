/**
 * LUXURY HAPTIC FEEDBACK SYSTEM
 *
 * Maps haptic feedback to semantic user actions:
 * - Success: Crisp, sharp click (save, complete)
 * - Selection: Barely-there tick (toggle, select)
 * - Heavy: Weighted thud (delete, destructive)
 * - Light: Subtle refresh (pull to refresh)
 *
 * Uses Web Vibration API with iOS-style patterns
 */

type HapticType =
  | "success"
  | "warning"
  | "error"
  | "selection"
  | "light"
  | "medium"
  | "heavy"
  | "soft"
  | "rigid";

// Vibration patterns (in ms) - mimics iOS Taptic Engine
const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  success: [10, 30, 10],      // Double tap - achievement
  warning: [20, 50, 20],      // Alert pattern
  error: [50, 100, 50],       // Heavy warning
  selection: 10,               // Single light tap
  light: 15,                   // Subtle feedback
  medium: 25,                  // Standard interaction
  heavy: 40,                   // Consequential action
  soft: 5,                     // Barely perceptible
  rigid: 30,                   // Firm confirmation
};

// Check if vibration is supported
const isVibrationSupported = (): boolean => {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
};

/**
 * Trigger haptic feedback
 */
export function haptic(type: HapticType = "selection"): void {
  if (!isVibrationSupported()) return;

  try {
    const pattern = HAPTIC_PATTERNS[type];
    navigator.vibrate(pattern);
  } catch (error) {
    // Silently fail - haptics are enhancement, not critical
    console.debug("Haptic feedback not available:", error);
  }
}

/**
 * Semantic haptic triggers - mapped to user actions
 */
export const HapticFeedback = {
  // Achievement / Completion
  success: () => haptic("success"),

  // Toggle / Select item
  selection: () => haptic("selection"),

  // Destructive action (delete)
  heavy: () => haptic("heavy"),

  // Pull to refresh
  light: () => haptic("light"),

  // Warning / Error
  warning: () => haptic("warning"),
  error: () => haptic("error"),

  // Button press
  tap: () => haptic("soft"),

  // Slider / drag
  tick: () => haptic("selection"),

  // Confirm action
  confirm: () => haptic("rigid"),
};

/**
 * React hook for haptic feedback
 */
export function useHaptic() {
  const triggerHaptic = (type: HapticType = "selection") => {
    haptic(type);
  };

  return {
    haptic: triggerHaptic,
    success: () => triggerHaptic("success"),
    selection: () => triggerHaptic("selection"),
    heavy: () => triggerHaptic("heavy"),
    light: () => triggerHaptic("light"),
    warning: () => triggerHaptic("warning"),
    error: () => triggerHaptic("error"),
    tap: () => triggerHaptic("soft"),
    confirm: () => triggerHaptic("rigid"),
    isSupported: isVibrationSupported(),
  };
}

/**
 * Higher-order function to wrap click handlers with haptic feedback
 */
export function withHaptic<T extends (...args: unknown[]) => unknown>(
  handler: T,
  type: HapticType = "selection"
): T {
  return ((...args: Parameters<T>) => {
    haptic(type);
    return handler(...args);
  }) as T;
}

/**
 * Haptic button wrapper component props
 */
export interface HapticButtonProps {
  hapticType?: HapticType;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default HapticFeedback;
