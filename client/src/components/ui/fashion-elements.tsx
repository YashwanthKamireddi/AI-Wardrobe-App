
import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

interface FashionTagProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: "pink" | "purple" | "teal" | "yellow" | "orange";
}

export function FashionTag({ 
  children, 
  className, 
  color = "pink", 
  ...props 
}: FashionTagProps) {
  const colorMap = {
    pink: "bg-[hsl(var(--fashion-pink)/0.15)] text-[hsl(var(--fashion-pink))] border-[hsl(var(--fashion-pink)/0.2)]",
    purple: "bg-[hsl(var(--fashion-purple)/0.15)] text-[hsl(var(--fashion-purple))] border-[hsl(var(--fashion-purple)/0.2)]",
    teal: "bg-[hsl(var(--fashion-teal)/0.15)] text-[hsl(var(--fashion-teal))] border-[hsl(var(--fashion-teal)/0.2)]",
    yellow: "bg-[hsl(var(--fashion-yellow)/0.15)] text-[hsl(var(--fashion-yellow))] border-[hsl(var(--fashion-yellow)/0.2)]",
    orange: "bg-[hsl(var(--fashion-orange)/0.15)] text-[hsl(var(--fashion-orange))] border-[hsl(var(--fashion-orange)/0.2)]",
  };

  return (
    <Badge 
      className={cn(
        "px-3 py-1 text-xs rounded-full border", 
        colorMap[color],
        className
      )} 
      {...props}
    >
      {children}
    </Badge>
  );
}

export function TrendingLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "absolute top-3 right-3 px-3 py-1 bg-black/70 text-white text-xs font-medium rounded-full backdrop-blur-sm animate-fashion-pulse",
        className
      )}
      {...props}
    >
      Trending
    </div>
  );
}

export function CategoryHeading({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 
      className={cn(
        "text-2xl font-bold mb-4 inline-block",
        "bg-gradient-to-r from-[hsl(var(--fashion-pink))] to-[hsl(var(--fashion-purple))]",
        "bg-clip-text text-transparent",
        className
      )} 
      {...props}
    >
      {children}
    </h2>
  );
}

export function GlassCard({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "fashion-card p-6",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function ColoredAccentBox({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "fashion-border p-4 bg-background/60 backdrop-blur-sm",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
