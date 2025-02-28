
/**
 * Debounces a function call
 * @param fn Function to debounce
 * @param delay Delay in ms
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      fn(...args);
      timeout = null;
    }, delay);
  };
}

/**
 * Throttles a function call
 * @param fn Function to throttle
 * @param limit Time limit in ms
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall >= limit) {
      lastCall = now;
      fn(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now();
        fn(...args);
        timeout = null;
      }, limit - timeSinceLastCall);
    }
  };
}

/**
 * Request animation frame wrapper for smoother animations
 * @param callback Callback function
 */
export function rafCallback(callback: FrameRequestCallback): () => void {
  let rafId: number | null = null;
  
  const executeCallback: FrameRequestCallback = (timestamp) => {
    callback(timestamp);
    rafId = null;
  };
  
  return () => {
    if (rafId === null) {
      rafId = requestAnimationFrame(executeCallback);
    }
  };
}
