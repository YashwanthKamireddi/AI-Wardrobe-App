import React from "react";
import { cn } from "@/lib/utils";

interface FashionLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

export function FashionLogo({ 
  className, 
  size = "md", 
  animated = false 
}: FashionLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const animationClass = animated ? "animate-pulse" : "";

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn("relative", sizeClasses[size], animationClass)}>
        {/* Stylized hanger icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("text-primary", sizeClasses[size])}
        >
          {/* Hanger top part */}
          <circle cx="12" cy="4" r="2" className="fill-primary" />
          
          {/* Hanger triangle */}
          <path 
            d="M12 6 L5 16 L19 16 Z" 
            className="fill-primary/10 stroke-primary"
            strokeWidth="1.5" 
          />
          
          {/* Hanger bottom bar */}
          <line x1="5" y1="16" x2="19" y2="16" strokeWidth="2.5" className="stroke-primary" />
          
          {/* Clothing silhouette */}
          <path 
            d="M7 16 C7 16 6 20 8 21 C10 22 14 22 16 21 C18 20 17 16 17 16" 
            className="stroke-primary/70"
            strokeDasharray={animated ? "5,3" : "0"} 
          />
        </svg>
      </div>
      <div className={cn("ml-2 font-bold", {
        "text-lg": size === "sm",
        "text-xl": size === "md",
        "text-2xl": size === "lg",
        "text-3xl": size === "xl",
      })}>
        <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
          Cher's Closet
        </span>
      </div>
    </div>
  );
}