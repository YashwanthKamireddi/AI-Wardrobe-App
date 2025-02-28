
import React, { useEffect, useRef, useState } from 'react';
import { useIntersectionObserver } from '@/lib/use-intersection-observer';

interface VirtualListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  overscan?: number;
  className?: string;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  isLoading?: boolean;
}

export function VirtualList<T>({
  data,
  renderItem,
  itemHeight,
  overscan = 3,
  className,
  emptyState,
  loadingState,
  isLoading = false,
}: VirtualListProps<T>) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight } = container;
      scrollPositionRef.current = scrollTop;
      
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const end = Math.min(
        data.length,
        Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan
      );
      
      setVisibleRange({ start, end });
    };

    // Initial calculation
    handleScroll();

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [data.length, itemHeight, overscan]);

  // Preserve scroll position when items change
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = scrollPositionRef.current;
    }
  }, [visibleRange]);

  if (isLoading) {
    return loadingState || <div className="py-8 text-center">Loading...</div>;
  }

  if (data.length === 0) {
    return emptyState || <div className="py-8 text-center">No items found</div>;
  }

  const totalHeight = data.length * itemHeight;
  const visibleItems = data.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ 
        height: '100%', 
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, i) => {
          const index = visibleRange.start + i;
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: index * itemHeight,
                height: itemHeight,
                width: '100%'
              }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
