import React from 'react';

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
        className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#2018E6]/40 via-rose-500/25 to-[#00D29E]/30 blur-md pointer-events-none transition-all duration-700 ${
          isThinking 
            ? 'animate-ping opacity-80' 
            : 'opacity-30 group-hover:opacity-90 group-hover:scale-130'
        }`}
        style={{ animationDuration: isThinking ? '1.8s' : '3.5s' }}
      />

      {/* Ripple wave 2 (Expands on hover) */}
      <span
        className="absolute -inset-2 rounded-full border border-indigo-400/30 opacity-0 group-hover:opacity-100 group-hover:animate-ping pointer-events-none transition-opacity duration-300"
        style={{ animationDuration: '2.2s' }}
      />

      {/* ========================================================================= */}
      {/* 2. ROTATING CIRCULAR LINES (Opposite Directions) */}
      {/* ========================================================================= */}
      {/* Outer Dashed Orbit Ring (Clockwise) */}
      <span
        className={`absolute -inset-1 rounded-full border border-indigo-400/40 pointer-events-none transition-all ${
          isThinking ? 'animate-spin opacity-80' : 'opacity-35 group-hover:opacity-100 group-hover:scale-110'
        }`}
        style={{
          borderStyle: 'dashed',
          borderWidth: '1.25px',
          animation: 'spin 10s linear infinite',
        }}
      />

      {/* Middle Segmented Aperture Ring (Counter-Clockwise) */}
      <span
        className={`absolute -inset-0.5 rounded-full border border-rose-400/40 pointer-events-none transition-all ${
          isThinking ? 'opacity-90' : 'opacity-25 group-hover:opacity-85 group-hover:scale-105'
        }`}
        style={{
          borderStyle: 'dotted',
          borderWidth: '1.5px',
          animation: 'spin 7s linear infinite reverse',
        }}
      />

      {/* Inner Glowing Gradient Halo */}
      <span
        className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#2018E6]/60 via-[#4F46E5]/40 to-amber-500/40 opacity-60 blur-xs transition-transform group-hover:scale-105"
      />

      {/* ========================================================================= */}
      {/* 3. CORE ORB & SHERLOCK FILM DETECTIVE EMBLEM */}
      {/* ========================================================================= */}
      <div className="relative z-10 size-full rounded-full bg-gradient-to-tr from-[#090C1B] via-[#121633] to-[#2018E6] flex items-center justify-center shadow-lg shadow-[#2018E6]/40 border border-indigo-400/60 overflow-hidden transition-transform duration-300 group-hover:scale-105">
        {/* Holographic light sweep */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
        />

        {/* Custom Sherlock Deerstalker Hat + Cinema Search Emblem SVG */}
        <svg
          className={`${svgSizes} text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sherlock Deerstalker Hat Visor & Crown */}
          <path
            d="M3 13C3.5 9 7 6 12 6C17 6 20.5 9 21 13C21.5 13.8 20.5 14.5 19 14.5C17.5 14.5 16 13.5 12 13.5C8 13.5 6.5 14.5 5 14.5C3.5 14.5 2.5 13.8 3 13Z"
            fill="url(#sherlockGrad)"
            stroke="#E0E7FF"
            strokeWidth="0.8"
          />
          {/* Hat Top Ribbon Knot */}
          <ellipse cx="12" cy="5.5" rx="1.5" ry="1" fill="#F43F5E" />
          <path d="M11 5.5C10 4 9 4.5 8.5 5M13 5.5C14 4 15 4.5 15.5 5" stroke="#F43F5E" strokeWidth="0.8" strokeLinecap="round" />
          
          {/* Detective Earflaps Bow */}
          <path
            d="M8 8.5C8 11.5 9 12.5 12 12.5C15 12.5 16 11.5 16 8.5"
            stroke="#C7D2FE"
            strokeWidth="0.75"
            strokeDasharray="1 1"
          />

          {/* Cinema Film Search Loupe / Magnifying Lens */}
          <circle cx="12" cy="17" r="4.2" stroke="#00D29E" strokeWidth="1.2" fill="#0E1124" fillOpacity="0.8" />
          {/* Cinema Aperture Blades inside lens */}
          <path d="M12 14V17M12 17L14.5 18.5M12 17L9.5 18.5" stroke="#6EE7B7" strokeWidth="0.7" strokeLinecap="round" />
          {/* Magnifier Handle / Film Perforation */}
          <path d="M15.2 20.2L18.5 23" stroke="#00D29E" strokeWidth="1.4" strokeLinecap="round" />

          {/* Gradients */}
          <defs>
            <linearGradient id="sherlockGrad" x1="3" y1="6" x2="21" y2="14.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="0.5" stopColor="#D97706" />
              <stop offset="1" stopColor="#B45309" />
            </linearGradient>
          </defs>
        </svg>

        {/* Live Active Status Indicator Dot */}
        <span className="absolute bottom-0.5 right-0.5 size-2 rounded-full bg-[#00D29E] ring-1.5 ring-[#05050A] shadow-xs shadow-[#00D29E] animate-pulse" />
      </div>
    </div>
  );
};
