import React from "react";
import { cn } from "@/lib/utils";

interface FashionPatternBackgroundProps {
  className?: string;
  children: React.ReactNode;
  pattern?: "hanger" | "fabric" | "runway" | "stitch";
  density?: "light" | "medium" | "dense";
  color?: "primary" | "secondary" | "accent" | "muted";
}

export function FashionPatternBackground({
  className,
  children,
  pattern = "hanger",
  density = "medium",
  color = "primary"
}: FashionPatternBackgroundProps) {
  // Density controls how many pattern elements appear
  const densityMap = {
    light: 20,
    medium: 40,
    dense: 60
  };

  // Color classes for different theme options
  const colorClasses = {
    primary: "text-primary/20",
    secondary: "text-pink-500/20",
    accent: "text-purple-500/20",
    muted: "text-slate-500/10"
  };

  const itemCount = densityMap[density];
  const patternItems = [];

  for (let i = 0; i < itemCount; i++) {
    // Random positioning and sizing
    const top = `${Math.random() * 100}%`;
    const left = `${Math.random() * 100}%`;
    const size = `${0.5 + Math.random() * 2}rem`;
    const rotate = `rotate(${Math.random() * 360}deg)`;
    
    const style = {
      position: "absolute" as const,
      top,
      left,
      width: size,
      height: size,
      transform: rotate,
      opacity: 0.1 + Math.random() * 0.3
    };

    // Different pattern elements
    let patternElement;
    
    switch (pattern) {
      case "hanger":
        patternElement = (
          <svg
            key={i}
            style={style}
            className={cn(colorClasses[color])}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="4" r="2" />
            <path d="M12 6 L5 16 L19 16 Z" />
            <line x1="5" y1="16" x2="19" y2="16" />
          </svg>
        );
        break;
        
      case "fabric":
        patternElement = (
          <svg
            key={i}
            style={style}
            className={cn(colorClasses[color])}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M3 3h18v18H3z" fillOpacity="0.2" />
            <path d="M3 3h6v6H3z" fillOpacity="0.3" />
            <path d="M9 3h6v6H9z" fillOpacity="0.4" />
            <path d="M15 3h6v6h-6z" fillOpacity="0.3" />
            <path d="M3 9h6v6H3z" fillOpacity="0.4" />
            <path d="M9 9h6v6H9z" fillOpacity="0.5" />
            <path d="M15 9h6v6h-6z" fillOpacity="0.4" />
            <path d="M3 15h6v6H3z" fillOpacity="0.3" />
            <path d="M9 15h6v6H9z" fillOpacity="0.4" />
            <path d="M15 15h6v6h-6z" fillOpacity="0.3" />
          </svg>
        );
        break;
        
      case "runway":
        patternElement = (
          <svg
            key={i}
            style={style}
            className={cn(colorClasses[color])}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="0" y1="12" x2="24" y2="12" />
            <line x1="0" y1="6" x2="24" y2="6" strokeDasharray="2,2" />
            <line x1="0" y1="18" x2="24" y2="18" strokeDasharray="2,2" />
          </svg>
        );
        break;
        
      case "stitch":
      default:
        patternElement = (
          <svg
            key={i}
            style={style}
            className={cn(colorClasses[color])}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M 2,12 L 22,12" strokeDasharray="2,2" />
            <path d="M 12,2 L 12,22" strokeDasharray="2,2" />
            <path d="M 4,4 L 20,20" strokeDasharray="2,2" />
            <path d="M 20,4 L 4,20" strokeDasharray="2,2" />
          </svg>
        );
    }
    
    patternItems.push(patternElement);
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 overflow-hidden">
        {patternItems}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}