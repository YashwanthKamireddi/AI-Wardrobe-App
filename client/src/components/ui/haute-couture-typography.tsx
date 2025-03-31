import React from 'react';
import { cn } from '@/lib/utils';

interface CoutureHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  variant?: 'default' | 'serif' | 'display' | 'editorial';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'gold' | 'accent';
  tracking?: 'normal' | 'wide' | 'wider' | 'widest';
  decorative?: boolean;
  caps?: boolean;
  spaced?: boolean;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  gradient?: boolean;
  underlineStyle?: 'solid' | 'dotted' | 'dashed' | 'gold';
}

export function CoutureHeading({
  as: Component = 'h2',
  size = 'lg',
  variant = 'default',
  weight = 'normal',
  color = 'default',
  tracking = 'normal',
  decorative = false,
  caps = false,
  spaced = false,
  bold = false,
  italic = false,
  underline = false,
  gradient = false,
  underlineStyle = 'solid',
  className,
  children,
  ...props
}: CoutureHeadingProps) {
  const sizeStyles = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'md': 'text-base',
    'lg': 'text-lg sm:text-xl',
    'xl': 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl',
    '4xl': 'text-4xl sm:text-5xl',
  }[size];

  const variantStyles = {
    'default': 'font-luxury-heading',
    'serif': 'font-luxury-heading',
    'display': 'font-luxury-heading',
    'editorial': 'font-luxury-heading italic',
  }[variant];

  const weightStyles = {
    'light': 'font-light',
    'normal': 'font-normal',
    'medium': 'font-medium',
    'semibold': 'font-semibold',
    'bold': 'font-bold',
  }[weight];

  const colorStyles = {
    'default': 'text-amber-900 dark:text-amber-100',
    'muted': 'text-amber-700/70 dark:text-amber-300/70',
    'gold': 'text-amber-600 dark:text-amber-400',
    'accent': 'text-amber-500 dark:text-amber-300',
  }[color];

  const trackingStyles = {
    'normal': 'tracking-normal',
    'wide': 'tracking-wide',
    'wider': 'tracking-wider',
    'widest': 'tracking-widest',
  }[tracking];

  const underlineStyles = {
    'solid': 'border-b border-amber-300/50 dark:border-amber-700/50 pb-1',
    'dotted': 'border-b border-dotted border-amber-300/70 dark:border-amber-700/70 pb-1',
    'dashed': 'border-b border-dashed border-amber-300/70 dark:border-amber-700/70 pb-1',
    'gold': 'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-amber-400 dark:after:via-amber-500 after:to-transparent after:opacity-70',
  }[underlineStyle];

  return (
    <Component
      className={cn(
        sizeStyles,
        variantStyles,
        weightStyles,
        colorStyles,
        trackingStyles,
        caps && 'uppercase',
        spaced && 'tracking-widest',
        bold && 'font-bold',
        italic && 'italic',
        underline && underlineStyles,
        gradient && 'bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 dark:from-amber-300 dark:via-amber-500 dark:to-amber-300 bg-clip-text text-transparent',
        decorative && 'relative pl-6 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[1px] before:w-4 before:bg-amber-400 dark:before:bg-amber-600',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

interface PullQuoteProps {
  children: React.ReactNode;
  source?: string;
  position?: 'left' | 'right' | 'center';
  bordered?: boolean;
  luxury?: boolean;
  className?: string;
}

export function PullQuote({
  children,
  source,
  position = 'left',
  bordered = true,
  luxury = true,
  className,
}: PullQuoteProps) {
  const positionStyles = {
    'left': 'ml-0 mr-auto text-left',
    'right': 'ml-auto mr-0 text-right',
    'center': 'mx-auto text-center',
  }[position];

  return (
    <div 
      className={cn(
        'my-8 max-w-lg relative p-6',
        position === 'center' ? 'w-full flex flex-col items-center justify-center' : 'w-fit',
        bordered && 'border-l-2 border-amber-400/50 dark:border-amber-600/50',
        luxury && 'bg-amber-50/30 dark:bg-amber-900/10 rounded-sm',
        position === 'left' && bordered && 'pl-8',
        position === 'right' && bordered && 'pr-8 border-l-0 border-r-2',
        positionStyles,
        className
      )}
    >
      {/* Large quotation mark */}
      <div className="absolute top-2 opacity-20 text-6xl font-serif text-amber-500 dark:text-amber-400 leading-none pointer-events-none">
        {position === 'right' ? '"' : '"'}
      </div>
      
      {/* Main quote text */}
      <p className="relative font-luxury-body text-lg italic text-amber-900/80 dark:text-amber-200/80 mb-4 z-10">
        {children}
      </p>
      
      {/* Quote source/attribution if provided */}
      {source && (
        <footer className="font-luxury-heading text-amber-600 dark:text-amber-400 text-sm font-medium not-italic">
          — {source}
        </footer>
      )}
      
      {/* Decorative elements for luxury style */}
      {luxury && (
        <>
          <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-amber-300/30 dark:border-amber-700/30" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-amber-300/30 dark:border-amber-700/30" />
        </>
      )}
    </div>
  );
}

interface EditorialCalloutProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'highlight' | 'subtle' | 'luxury';
  bordered?: boolean;
  className?: string;
}

export function EditorialCallout({
  title,
  icon,
  variant = 'default',
  bordered = true,
  className,
  children
}: EditorialCalloutProps) {
  const variantStyles = {
    'default': 'bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100',
    'highlight': 'bg-gradient-to-r from-amber-100/80 to-amber-50/80 dark:from-amber-900/30 dark:to-amber-900/10 text-amber-900 dark:text-amber-100',
    'subtle': 'bg-amber-50/50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200',
    'luxury': 'bg-gradient-to-br from-amber-50/90 to-amber-100/50 dark:from-amber-900/30 dark:to-amber-950/30 text-amber-900 dark:text-amber-100 shadow-md',
  }[variant];

  return (
    <div 
      className={cn(
        'p-4 sm:p-6 my-6 rounded-md relative overflow-hidden',
        bordered && 'border border-amber-200/50 dark:border-amber-800/50',
        variantStyles,
        variant === 'luxury' && 'gold-corner',
        className
      )}
    >
      {/* Background pattern for luxury variant */}
      {variant === 'luxury' && (
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDIwdjIwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGg0djRIMHptOCAwaDR2NEg4em04IDBoNHY0aC00ek00IDRoNHY0SDR6bTggMGg0djRoLTR6TTAgOGg0djRIMHptOCAwaDR2NEg4em04IDBoNHY0aC00ek00IDEyaDR2NEg0em04IDBoNHY0aC00eiIgZmlsbD0iY3VycmVudENvbG9yIiBvcGFjaXR5PSIwLjIiLz48L3N2Zz4=')]"></div>
        </div>
      )}
      
      {/* Title block if provided */}
      {title && (
        <div className="mb-4 pb-3 border-b border-amber-200/40 dark:border-amber-800/40 flex items-center">
          {icon && (
            <span className="mr-3 text-amber-500 dark:text-amber-400">
              {icon}
            </span>
          )}
          <h4 className="font-luxury-heading text-lg font-medium text-amber-800 dark:text-amber-300">
            {title}
          </h4>
        </div>
      )}
      
      {/* Content */}
      <div className="font-luxury-body text-amber-800/90 dark:text-amber-200/90 relative z-10">
        {children}
      </div>
      
      {/* Additional decorative elements for luxury variant */}
      {variant === 'luxury' && (
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-radial from-amber-200/20 to-transparent dark:from-amber-500/10 dark:to-transparent blur-md"></div>
      )}
    </div>
  );
}

interface MagazineTextBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  alignment?: 'left' | 'right' | 'center' | 'justify';
  dropcap?: boolean;
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
}

export function MagazineTextBlock({
  alignment = 'left',
  dropcap = false,
  columns = 1,
  gap = 'md',
  className,
  children,
  ...props
}: MagazineTextBlockProps) {
  const alignmentStyles = {
    'left': 'text-left',
    'right': 'text-right',
    'center': 'text-center',
    'justify': 'text-justify',
  }[alignment];

  const columnStyles = {
    1: '',
    2: 'sm:columns-2',
    3: 'sm:columns-3',
  }[columns];

  const gapStyles = {
    'sm': 'sm:gap-4',
    'md': 'sm:gap-6',
    'lg': 'sm:gap-8',
  }[gap];

  // Process the children to apply a dropcap to the first letter if requested
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (index === 0 && dropcap && typeof child === 'string') {
      const firstLetter = child.charAt(0);
      const restOfText = child.slice(1);
      
      return (
        <p>
          <span className="float-left text-5xl font-luxury-heading font-bold text-amber-600 dark:text-amber-400 mr-2 mt-1 leading-none">
            {firstLetter}
          </span>
          {restOfText}
        </p>
      );
    }
    
    return child;
  });

  return (
    <div 
      className={cn(
        'font-luxury-body text-amber-900 dark:text-amber-100 my-6',
        alignmentStyles,
        columnStyles,
        columns > 1 && gapStyles,
        className
      )}
      {...props}
    >
      {enhancedChildren}
    </div>
  );
}

interface FashionHighlightProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'underline' | 'highlight' | 'gold' | 'editorial';
}

export function FashionHighlight({
  variant = 'highlight',
  className,
  children,
  ...props
}: FashionHighlightProps) {
  const variantStyles = {
    'underline': 'border-b-2 border-amber-300 dark:border-amber-500 pb-0.5 text-amber-800 dark:text-amber-200',
    'highlight': 'bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded-sm text-amber-900 dark:text-amber-100',
    'gold': 'text-amber-600 dark:text-amber-400 font-medium',
    'editorial': 'font-luxury-heading italic text-amber-700 dark:text-amber-300',
  }[variant];

  return (
    <span
      className={cn(variantStyles, className)}
      {...props}
    >
      {children}
    </span>
  );
}