import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  transitionType?: "fade" | "slide" | "zoom" | "spring" | "advanced";
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = "",
  transitionType = "fade"
}) => {
  const [location] = useLocation();
  
  // Animation variants based on transition type
  const getVariants = () => {
    switch (transitionType) {
      case "fade":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.3 }
        };
      case "slide":
        return {
          initial: { opacity: 0, x: 20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -20 },
          transition: { duration: 0.3, ease: "easeInOut" }
        };
      case "zoom":
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.05 },
          transition: { duration: 0.3 }
        };
      case "spring":
        return {
          initial: { opacity: 0, y: 15 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -15 },
          transition: { 
            type: "spring", 
            stiffness: 350, 
            damping: 25 
          }
        };
      case "advanced":
        return {
          initial: { 
            opacity: 0, 
            y: 20,
            rotateX: 5,
            perspective: 1000
          },
          animate: { 
            opacity: 1, 
            y: 0,
            rotateX: 0,
            perspective: 1000,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 20,
              mass: 0.8
            }
          },
          exit: { 
            opacity: 0,
            y: -20,
            perspective: 1000,
            transition: {
              duration: 0.2
            }
          }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.3 }
        };
    }
  };

  const variants = getVariants();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={variants.transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Higher-order component for wrapping pages with transitions
export const withPageTransition = (
  Component: React.ComponentType<any>,
  transitionType: "fade" | "slide" | "zoom" | "spring" | "advanced" = "fade"
) => {
  return (props: any) => (
    <PageTransition transitionType={transitionType}>
      <Component {...props} />
    </PageTransition>
  );
};