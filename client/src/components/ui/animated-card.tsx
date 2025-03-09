
import React from "react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: "lift" | "glow" | "border" | "scale" | "none";
  transitionDelay?: string;
  children?: React.ReactNode;
}

export const AnimatedCard = React.forwardRef<
  HTMLDivElement,
  AnimatedCardProps
>(({ className, hoverEffect = "lift", transitionDelay, children, ...props }, ref) => {
  
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
      case "none":
        return "";
      default:
        return "hover:-translate-y-2 hover:shadow-card";
    }
  };
  
  return (
    <Card
      ref={ref}
      className={cn(
        "transition-all duration-300 ease-in-out",
        getHoverClass(),
        transitionDelay && `transition-delay-${transitionDelay}`,
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
});

AnimatedCard.displayName = "AnimatedCard";
