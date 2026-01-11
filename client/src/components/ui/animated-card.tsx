import React from "react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: "lift" | "glow" | "border" | "scale" | "none";
  children?: React.ReactNode;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, hoverEffect = "lift", children, ...props }, ref) => {
    const getHoverClass = () => {
      switch (hoverEffect) {
        case "lift":
          return "hover:-translate-y-1 hover:shadow-lg";
        case "glow":
          return "hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]";
        case "border":
          return "hover:border-primary/50";
        case "scale":
          return "hover:scale-[1.02]";
        case "none":
          return "";
        default:
          return "hover:-translate-y-1 hover:shadow-lg";
      }
    };

    return (
      <Card
        ref={ref}
        className={cn(
          "transition-all duration-300 ease-out",
          getHoverClass(),
          className
        )}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";
