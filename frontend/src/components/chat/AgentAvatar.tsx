import React from 'react';

interface AgentAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isThinking?: boolean;
  className?: string;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  size = 'md',
  isThinking = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'size-7',
    md: 'size-9',
    lg: 'size-12',
    xl: 'size-16',
  }[size];

  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl',
  }[size];

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses} ${className}`}>
      {/* Layer 1: Outermost ethereal pulsating halo (slow radial glow) */}
      <span
        className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#2018E6]/40 via-amber-500/25 to-pink-500/30 blur-md pointer-events-none transition-transform duration-1000 ${
          isThinking ? 'animate-ping opacity-75' : 'animate-pulse opacity-40'
        }`}
        style={{ animationDuration: isThinking ? '2s' : '4s' }}
      />

      {/* Layer 2: Expanding concentric shockwave ring (layered opacity 20% -> 0%) */}
      <span
        className={`absolute -inset-1 rounded-full border border-indigo-400/30 pointer-events-none transition-all ${
          isThinking ? 'animate-spin opacity-60' : 'animate-pulse opacity-30'
        }`}
        style={{
          borderStyle: 'dashed',
          borderWidth: '1.5px',
          animationDuration: isThinking ? '3s' : '6s',
        }}
      />

      {/* Layer 3: Secondary orbital gradient halo (layered opacity 50%) */}
      <span
        className="absolute inset-0.5 rounded-full bg-gradient-to-br from-[#2018E6]/60 via-[#4F46E5]/40 to-amber-500/50 opacity-60 blur-xs"
        style={{
          animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />

      {/* Layer 4: High-definition Core Orb with glossy border & holographic sheen */}
      <div className="relative z-10 size-full rounded-full bg-gradient-to-tr from-[#0E1124] via-[#1A1F45] to-[#2018E6] flex items-center justify-center shadow-lg shadow-[#2018E6]/40 border border-indigo-400/50 overflow-hidden group">
        {/* Holographic internal sweep */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"
        />

        {/* Center Cinema Emblem / Sparkle */}
        <span className={`${iconSizes} select-none transform transition-transform group-hover:scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]`}>
          🎬
        </span>

        {/* Glowing live status dot on corner */}
        <span className="absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-[#00D29E] ring-1 ring-[#05050A] shadow-sm shadow-[#00D29E]" />
      </div>
    </div>
  );
};
