import React, { useState, useEffect, useRef } from 'react';
import { Clapperboard } from 'lucide-react';

interface AgentAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isThinking?: boolean;
  isInteractive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  size = 'md',
  isThinking = false,
  isInteractive = true,
  onClick,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'size-6',
    sm: 'size-7',
    md: 'size-10',
    lg: 'size-14',
    xl: 'size-18',
  }[size];

  const svgSizes = {
    xs: 'size-3.5',
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-7',
    xl: 'size-9',
  }[size];

  const [hasRecentlyLoaded, setHasRecentlyLoaded] = useState(false);
  const wasThinkingRef = useRef(isThinking);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isThinking) {
      wasThinkingRef.current = true;
      setHasRecentlyLoaded(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else if (wasThinkingRef.current) {
      setHasRecentlyLoaded(true);
      timeoutRef.current = setTimeout(() => {
        setHasRecentlyLoaded(false);
        wasThinkingRef.current = false;
      }, 6000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isThinking]);

  const isActive = isThinking || hasRecentlyLoaded;

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center shrink-0 group ${sizeClasses} ${
        isInteractive ? 'cursor-pointer' : ''
      } ${className}`}
      title={isInteractive ? 'About Screened Cinema Due Diligence (Click to view)' : undefined}
      role={isInteractive && onClick ? 'button' : undefined}
      tabIndex={isInteractive && onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (isInteractive && onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* ========================================================================= */}
      {/* 1. PULSATING CIRCULAR WAVE RIPPLES (On Hover & Thinking) */}
      {/* ========================================================================= */}
      <span
        className={`absolute inset-0 rounded-full bg-gradient-to-tr from-tool-ocean/50 to-darkroom-muted/50 blur-md pointer-events-none transition-all duration-700 ${
          isActive
            ? 'animate-ping opacity-90'
            : 'opacity-0 group-hover:opacity-100 group-hover:scale-125'
        }`}
        style={{ animationDuration: isThinking ? '1.8s' : '3.5s' }}
      />

      {/* Ripple wave 2 (Expands on hover) */}
      <span className="absolute -inset-2 rounded-full border border-sky-300/40 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700" />

      {/* ========================================================================= */}
      {/* 2. ROTATING CIRCULAR LINES (Opposite Directions) */}
      {/* ========================================================================= */}
      {/* Outer Dashed Orbit Ring (Clockwise) */}
      <span
        className={`absolute -inset-1 rounded-full border border-sky-300/60 pointer-events-none transition-all duration-700 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          borderStyle: 'dashed',
          borderWidth: '1.25px',
          animation: isActive ? 'spin 4s linear infinite' : 'none',
        }}
      />

      {/* Middle Segmented Aperture Ring (Counter-Clockwise) */}
      <span
        className={`absolute -inset-0.5 rounded-full border border-indigo-300/60 pointer-events-none transition-all duration-700 ${
          isActive ? 'opacity-90' : 'opacity-0'
        }`}
        style={{
          borderStyle: 'dotted',
          borderWidth: '1.5px',
          animation: isActive ? 'spin 3s linear infinite reverse' : 'none',
        }}
      />

      {/* Inner Glowing Gradient Halo */}
      <span
        className={`absolute inset-0.5 rounded-full bg-gradient-to-br from-tool-ocean/60 to-darkroom-muted/60 blur-xs transition-all duration-700 ${
          isActive ? 'opacity-90' : 'opacity-0 group-hover:opacity-70 group-hover:scale-105'
        }`}
      />

      {/* ========================================================================= */}
      {/* 3. CORE ORB: BRIGHT DUAL-COLOR GRADIENT & CLEAN ALL-WHITE CINEMA ICON */}
      {/* ========================================================================= */}
      <div
        className={`relative z-10 size-full rounded-full bg-gradient-to-tr from-tool-ocean to-darkroom-muted flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden transition-all duration-700 ${
          !isActive ? 'group-hover:scale-105 group-hover:animate-pulse' : 'scale-100'
        }`}
      >
        {/* Holographic light sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

        {/* Clean, simple all-white cinema clapperboard icon */}
        <Clapperboard
          className={`${svgSizes} text-white stroke-[2.2] drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform duration-300 ${!isActive ? 'group-hover:scale-110 group-hover:-rotate-3' : ''}`}
        />

        {/* Live Active Status Indicator Dot */}
        <span
          className={`absolute bottom-0.5 right-0.5 size-2 rounded-full bg-tool-diligence ring-1.5 ring-white/80 shadow-xs shadow-emerald-400 transition-opacity duration-300 ${isActive ? 'opacity-100 animate-pulse' : 'opacity-0'}`}
        />
      </div>
    </div>
  );
};
