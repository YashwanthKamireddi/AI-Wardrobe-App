/**
 * Haptic Feedback Utilities
 * Provides tactile feedback for premium interactions
 * Falls back gracefully on unsupported devices
 */

type HapticPattern = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection";

// Vibration patterns in milliseconds
const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [30, 50, 80],
  warning: [40, 30, 40],
  error: [50, 30, 50, 30, 50],
  selection: 5,
};

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

/**
 * Trigger haptic feedback
 */
export function haptic(pattern: HapticPattern = "light"): void {
  if (!isHapticSupported()) return;

  try {
    const vibrationPattern = HAPTIC_PATTERNS[pattern];
    navigator.vibrate(vibrationPattern);
  } catch (error) {
    // Silently fail if vibration is not allowed
    console.debug("Haptic feedback not available:", error);
  }
}

/**
 * Trigger light tap feedback (for buttons, selections)
 */
export function hapticTap(): void {
  haptic("light");
}

/**
 * Trigger impact feedback (for important actions)
 */
export function hapticImpact(): void {
  haptic("medium");
}

/**
 * Trigger success feedback (for completions, confirmations)
 */
export function hapticSuccess(): void {
  haptic("success");
}

/**
 * Trigger warning feedback
 */
export function hapticWarning(): void {
  haptic("warning");
}

/**
 * Trigger error feedback
 */
export function hapticError(): void {
  haptic("error");
}

/**
 * Trigger selection feedback (for pickers, sliders)
 */
export function hapticSelection(): void {
  haptic("selection");
}

/**
 * Custom haptic pattern
 */
export function hapticCustom(pattern: number | number[]): void {
  if (!isHapticSupported()) return;

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.debug("Custom haptic feedback not available:", error);
  }
}

/**
 * Stop any ongoing haptic feedback
 */
export function hapticStop(): void {
  if (!isHapticSupported()) return;
  navigator.vibrate(0);
}

/**
 * React hook for haptic feedback
 */
export function useHaptic() {
  return {
    tap: hapticTap,
    impact: hapticImpact,
    success: hapticSuccess,
    warning: hapticWarning,
    error: hapticError,
    selection: hapticSelection,
    custom: hapticCustom,
    stop: hapticStop,
    isSupported: isHapticSupported(),
  };
}

/**
 * Create a click handler with haptic feedback
 */
export function withHapticClick<T extends (...args: any[]) => void>(
  handler: T,
  pattern: HapticPattern = "light"
): T {
  return ((...args: any[]) => {
    haptic(pattern);
    return handler(...args);
  }) as T;
}

export default haptic;
