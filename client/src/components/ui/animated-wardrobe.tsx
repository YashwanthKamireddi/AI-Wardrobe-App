import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2, Shirt, Plus } from "lucide-react";
import { Button } from "./button";

export interface AnimatedWardrobeItemProps {
  animationType?: "fadeIn" | "popUp" | "slide" | "rotate" | "bounce" | "none";
  delay?: number;
  duration?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const AnimatedWardrobeItem = ({
  className,
  animationType = "fadeIn",
  delay = 0,
  duration = 0.5,
  children,
  ...props
}: AnimatedWardrobeItemProps) => {
  const animations = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { 
          duration, 
          delay,
          ease: "easeOut"
        }
      }
    },
    popUp: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { 
          duration, 
          delay,
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }
    },
    slide: {
      hidden: { opacity: 0, x: -20 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { 
          duration, 
          delay,
          type: "spring",
          stiffness: 400,
          damping: 30
        }
      }
    },
    rotate: {
      hidden: { opacity: 0, rotate: -10 },
      visible: { 
        opacity: 1, 
        rotate: 0,
        transition: { 
          duration, 
          delay,
          type: "spring",
          stiffness: 200,
          damping: 25
        }
      }
    },
    bounce: {
      hidden: { opacity: 0, y: 50 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration, 
          delay,
          type: "spring",
          stiffness: 400,
          damping: 15
        }
      }
    },
    none: {
      hidden: { opacity: 1 },
      visible: { opacity: 1 }
    }
  };

  const animation = animations[animationType];

  // Type-safe props by removing any HTML props that conflict with motion props
  const { onDrag, ...safeProps } = props as any;

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      animate="visible"
      variants={animation}
      {...safeProps}
    >
      {children}
    </motion.div>
  );
};

// Animation variants for wardrobe grid
export const wardrobeAnimations = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Drag and drop animation variants
export const dragItemVariants = {
  start: { 
    scale: 1,
    boxShadow: "0 0 0 rgba(0, 0, 0, 0)" 
  },
  drag: { 
    scale: 1.1, 
    boxShadow: "0 10px 15px rgba(0, 0, 0, 0.15)",
    zIndex: 50,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

// Staggered delay for grid items
export const getStaggeredDelay = (index: number, baseDelay: number = 0.1): number => {
  return baseDelay * index;
};

// AnimatedWardrobeList component for displaying a grid of items with staggered animation
export const AnimatedWardrobeList: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ 
  children, 
  className 
}) => {
  return (
    <motion.div
      className={cn(className)}
      variants={wardrobeAnimations.container}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
};

// HangerIcon component for the empty state
export const HangerIcon = () => (
  <motion.div 
    initial={{ rotate: -10 }}
    animate={{ rotate: 10 }}
    transition={{
      repeat: Infinity,
      repeatType: "reverse",
      duration: 2,
      ease: "easeInOut"
    }}
    className="text-primary/70"
  >
    <Shirt size={64} />
  </motion.div>
);

// EmptyWardrobeAnimation component
export const EmptyWardrobeAnimation = () => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <HangerIcon />
      <motion.h3 
        className="mt-4 mb-2 text-xl font-semibold text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Your wardrobe is empty
      </motion.h3>
    </motion.div>
  );
};

// WardrobeLoadingAnimation component
export const WardrobeLoadingAnimation = () => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        animate={{ 
          rotate: 360,
          transition: { 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "linear" 
          }
        }}
      >
        <Loader2 size={40} className="text-primary" />
      </motion.div>
      <motion.p 
        className="mt-4 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Loading your wardrobe...
      </motion.p>
    </motion.div>
  );
};

// FloatingActionButton component
export const FloatingActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  children: React.ReactNode 
}> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        className={cn("shadow-md bg-primary hover:bg-primary/90", className)}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};