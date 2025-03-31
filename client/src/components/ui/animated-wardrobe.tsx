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
      <motion.div
        className="relative bg-amber-100 rounded-full w-24 h-24 flex items-center justify-center"
        whileHover={{ 
          boxShadow: "0 0 20px rgba(251, 191, 36, 0.5)"
        }}
      >
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 10 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 2,
            ease: "easeInOut"
          }}
          className="text-amber-500"
        >
          <Shirt size={48} />
        </motion.div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-200/50 to-transparent pointer-events-none"></div>
      </motion.div>
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
      <div className="relative">
        <motion.div
          className="p-4 bg-amber-100 rounded-full relative z-10"
          animate={{ 
            boxShadow: ["0 0 0px rgba(251, 191, 36, 0.3)", "0 0 20px rgba(251, 191, 36, 0.5)", "0 0 0px rgba(251, 191, 36, 0.3)"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
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
            <Loader2 size={40} className="text-amber-500" />
          </motion.div>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-200/20 to-transparent rounded-full blur-lg transform scale-150"></div>
      </div>
      <motion.p 
        className="mt-6 text-amber-700 font-luxury-body"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Curating your collection...
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
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        className={cn("btn-luxury font-luxury-body", className)}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};