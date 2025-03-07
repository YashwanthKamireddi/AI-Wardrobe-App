
import { useEffect, useState } from 'react';

// Custom hook for smooth transitions
export const useTransition = (value: any, duration = 300) => {
  const [transitionValue, setTransitionValue] = useState(value);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTransitionValue(value);
    }, 10);
    
    return () => clearTimeout(timeout);
  }, [value]);
  
  return transitionValue;
};

// Animation variants for framer-motion
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

export const slideIn = {
  hidden: { x: 20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
