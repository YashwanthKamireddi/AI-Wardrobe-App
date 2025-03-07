
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  aspectRatio?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className, 
  fallback = "/placeholder.jpg",
  aspectRatio = "aspect-square",
  ...props 
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;
    
    // Reset states when src changes
    setLoading(true);
    setError(false);
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setLoading(false);
    };
    
    img.onerror = () => {
      setImageSrc(fallback);
      setError(true);
      setLoading(false);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallback]);

  return (
    <div className={cn("relative overflow-hidden", aspectRatio, className)}>
      {loading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            loading ? "opacity-0" : "opacity-100"
          )}
          {...props}
        />
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <span className="text-sm text-muted-foreground">Image not available</span>
        </div>
      )}
    </div>
  );
}
