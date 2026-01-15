import { motion, AnimatePresence } from "framer-motion";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

/**
 * LUXURY SHARED ELEMENT TRANSITIONS
 *
 * Creates fluid, cinematic transitions between views:
 * - Image morphs from thumbnail to full view
 * - Maintains object permanence
 * - Hallmark of high-end iOS design
 */

interface SharedElementContextType {
  activeElement: string | null;
  setActiveElement: (id: string | null) => void;
  getElementRect: (id: string) => DOMRect | null;
  registerElement: (id: string, element: HTMLElement) => void;
  unregisterElement: (id: string) => void;
}

const SharedElementContext = createContext<SharedElementContextType | null>(null);

/**
 * Provider for shared element transitions
 */
export function SharedElementProvider({ children }: { children: ReactNode }) {
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [elements] = useState<Map<string, HTMLElement>>(new Map());

  const registerElement = useCallback((id: string, element: HTMLElement) => {
    elements.set(id, element);
  }, [elements]);

  const unregisterElement = useCallback((id: string) => {
    elements.delete(id);
  }, [elements]);

  const getElementRect = useCallback((id: string): DOMRect | null => {
    const element = elements.get(id);
    return element?.getBoundingClientRect() ?? null;
  }, [elements]);

  return (
    <SharedElementContext.Provider
      value={{
        activeElement,
        setActiveElement,
        getElementRect,
        registerElement,
        unregisterElement,
      }}
    >
      {children}
    </SharedElementContext.Provider>
  );
}

export function useSharedElement() {
  const context = useContext(SharedElementContext);
  if (!context) {
    throw new Error("useSharedElement must be used within SharedElementProvider");
  }
  return context;
}

/**
 * Shared Element wrapper - wraps content that will animate between views
 */
interface SharedElementProps {
  id: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function SharedElement({ id, children, className, onClick }: SharedElementProps) {
  const { setActiveElement, registerElement, unregisterElement } = useSharedElement();

  const handleRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      registerElement(id, node);
    } else {
      unregisterElement(id);
    }
  }, [id, registerElement, unregisterElement]);

  const handleClick = () => {
    setActiveElement(id);
    onClick?.();
  };

  return (
    <motion.div
      ref={handleRef}
      layoutId={id}
      className={className}
      onClick={handleClick}
      initial={false}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Luxury Page Transition variants
 */
export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Staggered children animation for lists
 */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * Modal/Overlay transition
 */
export const overlayTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const modalTransition = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
};

/**
 * Luxury Card hover animation
 */
export const cardHoverAnimation = {
  rest: {
    scale: 1,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  tap: {
    scale: 0.98,
  },
};

/**
 * Image reveal animation (for lazy loading)
 */
export const imageRevealAnimation = {
  initial: { opacity: 0, filter: "blur(10px)" },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/**
 * Success checkmark animation
 */
export const checkmarkAnimation = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.4, ease: "easeOut" },
      opacity: { duration: 0.2 },
    },
  },
};

/**
 * Animated Page wrapper with transitions
 */
interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered list wrapper
 */
interface StaggeredListProps {
  children: ReactNode;
  className?: string;
}

export function StaggeredList({ children, className }: StaggeredListProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered list item
 */
interface StaggeredItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggeredItem({ children, className }: StaggeredItemProps) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

export default SharedElementProvider;
