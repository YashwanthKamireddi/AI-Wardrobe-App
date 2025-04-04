/**
 * GoldenParticleEffect Component
 * 
 * A luxurious, subtle particle animation that creates a gentle shower of golden particles
 * to enhance the luxury aesthetic of modals, dialogs, and special UI elements.
 * 
 * @module GoldenParticleEffect
 * @component
 * 
 * Features:
 * - Configurable particle count, size, speed, and color variations
 * - Support for both contained elements and full-screen effects
 * - Gaussian distribution options for realistic particle clustering
 * - Variable opacity and blur for depth perception
 * - Optimized rendering with requestAnimationFrame
 * 
 * @example
 * // Basic usage
 * <GoldenParticleEffect>
 *   <div className="p-8">Your luxury content here</div>
 * </GoldenParticleEffect>
 * 
 * // Customized usage
 * <GoldenParticleEffect
 *   particleCount={80}
 *   particleSize={4}
 *   speed={1.5}
 *   className="rounded-xl overflow-hidden"
 * >
 *   <div className="p-8">Enhanced luxury experience</div>
 * </GoldenParticleEffect>
 */

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface GoldenParticleEffectProps {
  /** Content to display inside the particle effect container */
  children?: React.ReactNode;
  /** Number of particles to render */
  particleCount?: number;
  /** Base size of particles in pixels */
  particleSize?: number;
  /** Animation speed multiplier */
  speed?: number;
  /** Additional CSS classes for the container */
  className?: string;
  /** Whether the effect should fill its container */
  fillContainer?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  opacity: number;
  color: string;
  blur: number;
}

/**
 * GoldenParticleEffect Component
 * 
 * Creates a luxury-style animated golden particle effect behind content.
 */
export function GoldenParticleEffect({
  children,
  particleCount = 40,
  particleSize = 3,
  speed = 1,
  className,
  fillContainer = true,
}: GoldenParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const requestIdRef = useRef<number>(0);
  
  // Initialize particles on mount or when parameters change
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    setDimensions({ width, height });
    
    // Generate golden color variations
    const goldColors = [
      'rgba(255, 215, 0, 0.7)',   // Classic gold
      'rgba(255, 223, 0, 0.7)',   // Golden yellow
      'rgba(238, 198, 67, 0.7)',  // Golden amber
      'rgba(212, 175, 55, 0.7)',  // Metallic gold
      'rgba(207, 181, 59, 0.7)',  // Old gold
    ];
    
    // Create initial particles
    particlesRef.current = Array.from({ length: particleCount }, () => {
      const randomSize = (Math.random() * 0.8 + 0.6) * particleSize; // 60-140% of base size
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: randomSize,
        // Gaussian-like distribution for more natural speed variation
        speedY: (0.3 + Math.random() * 0.7) * speed,
        opacity: 0.1 + Math.random() * 0.5,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
        blur: Math.random() > 0.7 ? 1 : 0, // 30% have blur for depth effect
      };
    });
    
    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      setDimensions({ width: newWidth, height: newHeight });
      
      // Adjust particle positions for new dimensions
      particlesRef.current = particlesRef.current.map(p => ({
        ...p,
        x: (p.x / dimensions.width) * newWidth,
        y: (p.y / dimensions.height) * newHeight,
      }));
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestIdRef.current);
    };
  }, [particleCount, particleSize, speed, fillContainer]);
  
  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      if (!ctx || !canvas) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particlesRef.current.forEach((particle, i) => {
        // Update position
        particle.y += particle.speedY;
        
        // Reset if out of bounds
        if (particle.y > canvas.height) {
          particle.y = 0 - particle.size;
          particle.x = Math.random() * canvas.width;
        }
        
        // Draw particle
        ctx.save();
        if (particle.blur) {
          ctx.filter = 'blur(1px)';
        }
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      requestIdRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    requestIdRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(requestIdRef.current);
    };
  }, [dimensions]);
  
  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        fillContainer && "w-full h-full",
        className
      )}
      ref={containerRef}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 pointer-events-none"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}