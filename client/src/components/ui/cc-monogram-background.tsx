import React from 'react';

interface CCMonogramBackgroundProps {
  className?: string;
  opacity?: number;
  size?: number;
  spacing?: number;
  rotate?: number;
  children?: React.ReactNode;
}

export function CCMonogramBackground({
  className = "",
  opacity = 0.04,
  size = 60,
  spacing = 100,
  rotate = 0,
  children
}: CCMonogramBackgroundProps) {
  // Create a single CC monogram SVG
  const monogramSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 60 60" fill="none">
      <g transform="rotate(${rotate} 30 30)">
        <path d="M15 15C15 9.47715 19.4772 5 25 5H35C40.5228 5 45 9.47715 45 15V45C45 50.5228 40.5228 55 35 55H25C19.4772 55 15 50.5228 15 45V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M15 15C15 9.47715 19.4772 5 25 5H35C40.5228 5 45 9.47715 45 15V45C45 50.5228 40.5228 55 35 55H25C19.4772 55 15 50.5228 15 45V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" transform="translate(5, 0)"/>
      </g>
    </svg>
  `;

  // Create a data URL from the SVG
  const dataUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(monogramSvg)}")`;

  return (
    <div
      className={`relative ${className}`}
      style={{
        position: 'relative',
        zIndex: 0,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none z-[-1]"
        style={{
          backgroundImage: dataUrl,
          backgroundSize: `${spacing}px ${spacing}px`,
          backgroundRepeat: 'repeat',
          opacity: opacity,
          color: 'rgb(251, 191, 36)',
        }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

// Advanced luxury monogram with more detailed pattern
export function LuxuryMonogramBackground({
  className = "",
  opacity = 0.05,
  darkOpacity = 0.08,
  rotate = -15,
  children
}: {
  className?: string;
  opacity?: number;
  darkOpacity?: number;
  rotate?: number;
  children?: React.ReactNode;
}) {
  // Create a more elaborate CC monogram
  const monogramSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none">
      <g transform="rotate(${rotate} 60 60)">
        <!-- First C -->
        <path d="M40 30C40 24.4772 44.4772 20 50 20H70C75.5228 20 80 24.4772 80 30V90C80 95.5228 75.5228 100 70 100H50C44.4772 100 40 95.5228 40 90V30Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        
        <!-- Second C -->
        <path d="M40 30C40 24.4772 44.4772 20 50 20H70C75.5228 20 80 24.4772 80 30V90C80 95.5228 75.5228 100 70 100H50C44.4772 100 40 95.5228 40 90V30Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" transform="translate(10, 0)"/>
        
        <!-- Decorative elements -->
        <path d="M50 15L70 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M50 105L70 105" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M35 60L85 60" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 4"/>
        
        <!-- Corner accents -->
        <path d="M38 28L38 36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M38 28L46 28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        
        <path d="M82 28L82 36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M82 28L74 28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        
        <path d="M38 92L38 84" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M38 92L46 92" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        
        <path d="M82 92L82 84" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M82 92L74 92" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </g>
    </svg>
  `;

  // Create a data URL from the SVG
  const dataUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(monogramSvg)}")`;

  return (
    <div
      className={`relative ${className}`}
      style={{
        position: 'relative',
        zIndex: 0,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none z-[-1] transition-opacity duration-500"
        style={{
          backgroundImage: dataUrl,
          backgroundSize: '180px 180px',
          backgroundRepeat: 'repeat',
          opacity: opacity,
          color: 'rgb(251, 191, 36)',
        }}
        data-dark-opacity={darkOpacity}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

// A designer-inspired monogram pattern with decorative elements
export function DesignerMonogramBackground({
  className = "",
  opacity = 0.03,
  darkOpacity = 0.06,
  children
}: {
  className?: string;
  opacity?: number;
  darkOpacity?: number;
  children?: React.ReactNode;
}) {
  const monogramSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none">
      <!-- Main CC logo -->
      <g transform="translate(50, 50)">
        <path d="M20 20C20 13.3726 25.3726 8 32 8H68C74.6274 8 80 13.3726 80 20V80C80 86.6274 74.6274 92 68 92H32C25.3726 92 20 86.6274 20 80V20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M20 20C20 13.3726 25.3726 8 32 8H68C74.6274 8 80 13.3726 80 20V80C80 86.6274 74.6274 92 68 92H32C25.3726 92 20 86.6274 20 80V20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" transform="translate(10, 0)"/>
      </g>
      
      <!-- Decorative border pattern -->
      <rect x="10" y="10" width="180" height="180" rx="8" stroke="currentColor" stroke-width="1" stroke-dasharray="4 8" opacity="0.3"/>
      
      <!-- Corner embellishments -->
      <path d="M10 40L10 10L40 10" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
      <path d="M160 10L190 10L190 40" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
      <path d="M10 160L10 190L40 190" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
      <path d="M160 190L190 190L190 160" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
      
      <!-- Subtle diamond pattern in background -->
      <path d="M50 0L100 50L50 100L0 50Z" stroke="currentColor" stroke-width="0.5" opacity="0.2" transform="translate(0, 50)"/>
      <path d="M50 0L100 50L50 100L0 50Z" stroke="currentColor" stroke-width="0.5" opacity="0.2" transform="translate(100, 50)"/>
      <path d="M50 0L100 50L50 100L0 50Z" stroke="currentColor" stroke-width="0.5" opacity="0.2" transform="translate(50, 0)"/>
      <path d="M50 0L100 50L50 100L0 50Z" stroke="currentColor" stroke-width="0.5" opacity="0.2" transform="translate(50, 100)"/>
    </svg>
  `;

  // Create a data URL from the SVG
  const dataUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(monogramSvg)}")`;

  return (
    <div
      className={`relative ${className}`}
      style={{
        position: 'relative',
        zIndex: 0,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none z-[-1] transition-opacity duration-500"
        style={{
          backgroundImage: dataUrl,
          backgroundSize: '300px 300px',
          backgroundRepeat: 'repeat',
          opacity: opacity,
          color: 'rgb(251, 191, 36)',
        }}
        data-dark-opacity={darkOpacity}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}