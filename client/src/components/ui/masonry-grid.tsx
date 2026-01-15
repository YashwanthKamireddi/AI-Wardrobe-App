import { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * LUXURY MASONRY GRID LAYOUT
 *
 * Respects the integrity of each item's natural aspect ratio:
 * - No awkward whitespace from forced square containers
 * - Dynamic breakpoints based on device density
 * - Staggered animation on load
 *
 * Column guidelines from luxury spec:
 * - Mobile Portrait: 2 columns
 * - Mobile Landscape / Tablet: 3-4 columns
 * - Desktop: 4-5 columns
 * - Large Desktop: 5-6 columns (max-width: 1440px)
 */

interface MasonryGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getItemKey: (item: T) => string | number;
  columns?: {
    xs?: number;  // < 640px
    sm?: number;  // >= 640px
    md?: number;  // >= 768px
    lg?: number;  // >= 1024px
    xl?: number;  // >= 1280px
  };
  gap?: number;
  className?: string;
  animate?: boolean;
}

export function MasonryGrid<T>({
  items,
  renderItem,
  getItemKey,
  columns = { xs: 2, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 16,
  className,
  animate = true,
}: MasonryGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(2);
  const [columnHeights, setColumnHeights] = useState<number[]>([]);

  // Responsive column count
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280) setColumnCount(columns.xl || 5);
      else if (width >= 1024) setColumnCount(columns.lg || 4);
      else if (width >= 768) setColumnCount(columns.md || 3);
      else if (width >= 640) setColumnCount(columns.sm || 2);
      else setColumnCount(columns.xs || 2);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [columns]);

  // Distribute items into columns (shortest column first)
  const getColumnIndex = useCallback((itemIndex: number): number => {
    if (columnHeights.length < columnCount) {
      return itemIndex % columnCount;
    }
    // Find shortest column
    return columnHeights.indexOf(Math.min(...columnHeights));
  }, [columnCount, columnHeights]);

  // Organize items into columns
  const columnItems = items.reduce<T[][]>((cols, item, index) => {
    const colIndex = index % columnCount; // Simple distribution
    if (!cols[colIndex]) cols[colIndex] = [];
    cols[colIndex].push(item);
    return cols;
  }, Array.from({ length: columnCount }, () => []));

  return (
    <div
      ref={containerRef}
      className={cn("w-full", className)}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        gap: `${gap}px`,
        maxWidth: "1440px",
        margin: "0 auto",
      }}
    >
      {columnItems.map((column, colIndex) => (
        <div
          key={colIndex}
          className="flex flex-col"
          style={{ gap: `${gap}px` }}
        >
          <AnimatePresence mode="popLayout">
            {column.map((item, itemIndex) => (
              <motion.div
                key={getItemKey(item)}
                layout
                initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : false}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  delay: animate ? (colIndex * 0.05) + (itemIndex * 0.03) : 0,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                {renderItem(item, colIndex * items.length + itemIndex)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/**
 * Simple responsive grid (non-masonry)
 */
interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number | string;
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = { xs: 2, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = "1rem",
  className,
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        "grid w-full",
        `grid-cols-${columns.xs || 2}`,
        `sm:grid-cols-${columns.sm || 2}`,
        `md:grid-cols-${columns.md || 3}`,
        `lg:grid-cols-${columns.lg || 4}`,
        `xl:grid-cols-${columns.xl || 5}`,
        className
      )}
      style={{
        gap: typeof gap === "number" ? `${gap}px` : gap,
        maxWidth: "1440px",
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Luxury card wrapper with hover effects
 */
interface LuxuryCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  aspectRatio?: string;
}

export function LuxuryCard({
  children,
  className,
  onClick,
  aspectRatio,
}: LuxuryCardProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl bg-white",
        "border border-slate-200/50",
        "shadow-sm hover:shadow-lg",
        "transition-shadow duration-300",
        "cursor-pointer",
        className
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

/**
 * Image with BlurHash placeholder simulation
 */
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  onLoad?: () => void;
}

export function LazyImage({
  src,
  alt,
  className,
  aspectRatio = "3/4",
  onLoad,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div
      className={cn("relative overflow-hidden bg-slate-100", className)}
      style={{ aspectRatio }}
    >
      {/* Shimmer placeholder */}
      {!isLoaded && !hasError && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100"
          animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 100%" }}
        />
      )}

      {/* Actual image */}
      <motion.img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover",
          !isLoaded && "opacity-0"
        )}
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={isLoaded ? { opacity: 1, filter: "blur(0px)" } : {}}
        transition={{ duration: 0.4 }}
        onLoad={handleLoad}
        onError={() => setHasError(true)}
        loading="lazy"
      />

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <span className="text-slate-400 text-sm">Failed to load</span>
        </div>
      )}
    </div>
  );
}

export default MasonryGrid;
