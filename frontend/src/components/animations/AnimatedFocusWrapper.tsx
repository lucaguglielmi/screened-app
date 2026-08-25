import React, { useState, useEffect, useRef } from 'react';

interface AnimatedFocusWrapperProps {
  children: React.ReactNode;
  className?: string;
  focusColor?: string;
  borderRadius?: number; // border radius in px
  strokeWidth?: number; // border width in px
  duration?: number; // animation duration in seconds
}

export const AnimatedFocusWrapper: React.FC<AnimatedFocusWrapperProps> = ({ 
  children,
  className = '',
  focusColor = '#818cf8', // Tailwind indigo-400
  borderRadius = 12,
  strokeWidth = 2,
  duration = 0.4
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rectSize, setRectSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setRectSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    // Initial size
    updateSize();
    
    // Observe resize if possible
    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver && containerRef.current) {
      resizeObserver = new ResizeObserver(() => updateSize());
      resizeObserver.observe(containerRef.current);
    } else {
      window.addEventListener('resize', updateSize);
    }
    
    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const w = rectSize.width;
  const h = rectSize.height;
  
  // Calculate perimeter for the stroke-dasharray
  // Exact SVG rect perimeter with rounded corners
  const perimeter = w > 0 && h > 0 
    ? 2 * (w + h) - (8 * borderRadius) + (2 * Math.PI * borderRadius)
    : 0;

  return (
    <div 
      ref={containerRef}
      className={`relative group ${className}`}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsFocused(false);
        }
      }}
    >
      {/* 
        Ensure children (like textarea) don't have their own conflicting borders or outlines.
        The wrapper is expecting the child to be 100% width/height of this container.
      */}
      {children}
      
      {/* Animated SVG Border overlay */}
      {perimeter > 0 && (
        <svg 
          className="absolute inset-0 pointer-events-none transition-opacity duration-200" 
          width="100%" 
          height="100%" 
          style={{ 
            zIndex: 10,
            opacity: isFocused ? 1 : 0
          }}
        >
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={w - strokeWidth}
            height={h - strokeWidth}
            rx={borderRadius}
            ry={borderRadius}
            fill="none"
            stroke={focusColor}
            strokeWidth={strokeWidth}
            strokeDasharray={perimeter}
            strokeDashoffset={isFocused ? 0 : perimeter}
            strokeLinecap="round"
            style={{
              transition: `stroke-dashoffset ${duration}s ease-in-out`,
              // When focused, transition the offset. When blurred, transition offset fast or let opacity hide it.
            }}
          />
        </svg>
      )}
    </div>
  );
};
