
import React from "react";
import { Card } from "./card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: "lift" | "glow" | "border" | "scale" | "luxury" | "luxury-glow" | "none";
  transitionDelay?: string;
  children?: React.ReactNode;
  luxuryVariant?: "gold" | "silver" | "bronze";
  showCorners?: boolean;
  withShimmer?: boolean;
}

export const AnimatedCard = React.forwardRef<
  HTMLDivElement,
  AnimatedCardProps
>(({ 
  className, 
  hoverEffect = "lift", 
  transitionDelay, 
  children, 
  luxuryVariant = "gold",
  showCorners = true,
  withShimmer = false,
  ...props 
}, ref) => {
  
  const getHoverClass = () => {
    switch (hoverEffect) {
      case "lift":
        return "hover:-translate-y-2 hover:shadow-card";
      case "glow":
        return "hover:shadow-[0_0_15px_rgba(var(--primary-rgb)/0.5)]";
      case "border":
        return "hover:border-primary/50";
      case "scale":
        return "hover:scale-[1.02]";
      case "luxury":
        return "hover:border-amber-300/40 dark:hover:border-amber-700/50 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.1),0_0_0_1px_rgba(251,191,36,0.1)]";
      case "luxury-glow":
        return "hover:border-amber-300/60 dark:hover:border-amber-600/60 hover:shadow-[0_5px_20px_rgba(251,191,36,0.2),0_0_0_1px_rgba(251,191,36,0.2)]";
      case "none":
        return "";
      default:
        return "hover:-translate-y-2 hover:shadow-card";
    }
  };
  
  const getLuxuryStyle = () => {
    if (!hoverEffect.includes('luxury')) return {};
    
    switch (luxuryVariant) {
      case "gold":
        return {
          borderColor: "rgba(251, 191, 36, 0.3)",
          borderWidth: "1px",
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(251, 191, 36, 0.1)"
        };
      case "silver":
        return {
          borderColor: "rgba(209, 213, 219, 0.4)",
          borderWidth: "1px",
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(209, 213, 219, 0.2)"
        };
      case "bronze":
        return {
          borderColor: "rgba(180, 83, 9, 0.2)",
          borderWidth: "1px",
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(180, 83, 9, 0.1)"
        };
      default:
        return {};
    }
  };
  
  const CornerDecorations = () => {
    if (!showCorners || !hoverEffect.includes('luxury')) return null;
    
    const cornerColor = luxuryVariant === "gold" 
      ? "rgba(251, 191, 36, 0.5)" 
      : luxuryVariant === "silver" 
        ? "rgba(209, 213, 219, 0.5)" 
        : "rgba(180, 83, 9, 0.4)";
    
    return (
      <>
        <div 
          className="absolute top-0 left-0 w-4 h-4 pointer-events-none" 
          style={{ 
            borderTop: `1px solid ${cornerColor}`, 
            borderLeft: `1px solid ${cornerColor}`
          }} 
        />
        <div 
          className="absolute top-0 right-0 w-4 h-4 pointer-events-none" 
          style={{ 
            borderTop: `1px solid ${cornerColor}`, 
            borderRight: `1px solid ${cornerColor}`
          }} 
        />
        <div 
          className="absolute bottom-0 left-0 w-4 h-4 pointer-events-none" 
          style={{ 
            borderBottom: `1px solid ${cornerColor}`, 
            borderLeft: `1px solid ${cornerColor}`
          }} 
        />
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none" 
          style={{ 
            borderBottom: `1px solid ${cornerColor}`, 
            borderRight: `1px solid ${cornerColor}`
          }} 
        />
      </>
    );
  };
  
  const ShimmerEffect = () => {
    if (!withShimmer || !hoverEffect.includes('luxury')) return null;
    
    return (
      <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden rounded-xl">
        <div 
          className="absolute inset-0 z-[-1] opacity-0 group-hover:opacity-30 transition-opacity duration-700"
          style={{
            background: `linear-gradient(90deg, transparent, ${luxuryVariant === "gold" ? "rgba(251, 191, 36, 0.3)" : luxuryVariant === "silver" ? "rgba(209, 213, 219, 0.3)" : "rgba(180, 83, 9, 0.2)"}, transparent)`,
            backgroundSize: "200% 100%",
            animation: "ribbon-shine 2s infinite"
          }}
        />
      </div>
    );
  };
  
  return (
    <Card
      ref={ref}
      className={cn(
        "transition-all duration-300 ease-in-out relative group",
        getHoverClass(),
        transitionDelay && `transition-delay-${transitionDelay}`,
        hoverEffect.includes('luxury') && "border overflow-hidden",
        className
      )}
      style={getLuxuryStyle()}
      {...props}
    >
      <CornerDecorations />
      <ShimmerEffect />
      {children}
    </Card>
  );
});

AnimatedCard.displayName = "AnimatedCard";
