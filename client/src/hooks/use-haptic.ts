import { useCallback } from 'react';

type HapticPattern =
    | 'selection' // Light tap for selection
    | 'success'   // Success vibration
    | 'warning'   // Warning vibration
    | 'error'     // Error vibration
    | 'light'     // Very light tap
    | 'medium'    // Medium tap
    | 'heavy';    // Heavy tap

/**
 * useHaptic Hook
 *
 * Provides a simple interface for triggering haptic feedback on supported devices.
 * Gracefully degrades on devices without haptic support.
 */
export function useHaptic() {
    const vibrate = useCallback((pattern: HapticPattern) => {
        // Check for navigator.vibrate support
        if (typeof navigator === 'undefined' || !navigator.vibrate) {
            return;
        }

        try {
            switch (pattern) {
                case 'selection':
                case 'light':
                    navigator.vibrate(10); // 10ms
                    break;
                case 'medium':
                    navigator.vibrate(20); // 20ms
                    break;
                case 'heavy':
                    navigator.vibrate(40); // 40ms
                    break;
                case 'success':
                    navigator.vibrate([10, 30, 10]); // Two quick taps
                    break;
                case 'warning':
                    navigator.vibrate([30, 20, 30]); // Two medium taps
                    break;
                case 'error':
                    navigator.vibrate([50, 30, 50, 30, 50]); // Three heavy taps
                    break;
                default:
                    break;
            }
        } catch (e) {
            // Ignore errors (some browsers might throw if user hasn't interacted)
        }
    }, []);

    return { vibrate };
}
