import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEffects } from '../../utils/audio';

export type AvatarStatus = 'idle' | 'hover' | 'active' | 'thinking' | 'loading' | 'writing' | 'streaming';

export interface AgentAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isThinking?: boolean;
  isWriting?: boolean;
  isStreaming?: boolean;
  status?: AvatarStatus;
  isInteractive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  size = 'md',
  isThinking = false,
  isWriting = false,
  isStreaming = false,
  status: statusProp,
  isInteractive = true,
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [hasRecentlyLoaded, setHasRecentlyLoaded] = useState(false);
  const wasThinkingRef = useRef(isThinking);

  useEffect(() => {
    if (isThinking) {
      wasThinkingRef.current = true;
    } else if (wasThinkingRef.current) {
      const showTimer = setTimeout(() => {
        setHasRecentlyLoaded(true);
      }, 0);
      const hideTimer = setTimeout(() => {
        setHasRecentlyLoaded(false);
        wasThinkingRef.current = false;
      }, 5000);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isThinking]);

  // Determine current active state
  const currentStatus: AvatarStatus = statusProp
    ? statusProp
    : isThinking || statusProp === 'loading'
    ? 'thinking'
    : isWriting || isStreaming || statusProp === 'writing'
    ? 'writing'
    : isPressed
    ? 'active'
    : isHovered
    ? 'hover'
    : hasRecentlyLoaded
    ? 'hover'
    : 'idle';

  const isThinkingActive = currentStatus === 'thinking' || isThinking;
  const isWritingActive = currentStatus === 'writing' || isWriting || isStreaming;
  const isHighEnergy = isThinkingActive || isWritingActive;

  // Size configurations
  const config = {
    xs: {
      wrapper: 'w-6 h-6',
      iconSize: 12,
      orbitInset1: '-inset-1',
      orbitInset2: '-inset-0.5',
      badgeSize: 'size-1.5',
      badgeOffset: 'bottom-0 right-0',
      strokeWidth: 1,
    },
    sm: {
      wrapper: 'w-8 h-8',
      iconSize: 15,
      orbitInset1: '-inset-1.5',
      orbitInset2: '-inset-0.5',
      badgeSize: 'size-2',
      badgeOffset: 'bottom-0 right-0',
      strokeWidth: 1.25,
    },
    md: {
      wrapper: 'w-11 h-11',
      iconSize: 21,
      orbitInset1: '-inset-2',
      orbitInset2: '-inset-1',
      badgeSize: 'size-2.5',
      badgeOffset: 'bottom-0.5 right-0.5',
      strokeWidth: 1.5,
    },
    lg: {
      wrapper: 'w-15 h-15',
      iconSize: 28,
      orbitInset1: '-inset-2.5',
      orbitInset2: '-inset-1.5',
      badgeSize: 'size-3',
      badgeOffset: 'bottom-1 right-1',
      strokeWidth: 1.75,
    },
    xl: {
      wrapper: 'w-20 h-20',
      iconSize: 38,
      orbitInset1: '-inset-3.5',
      orbitInset2: '-inset-2',
      badgeSize: 'size-3.5',
      badgeOffset: 'bottom-1.5 right-1.5',
      strokeWidth: 2,
    },
  }[size];

  // Rotation speeds for dual concentric orbit rings
  const clockwiseDuration = isThinkingActive ? 2.2 : isWritingActive ? 4.2 : isHovered ? 6.5 : 14;
  const counterClockwiseDuration = isThinkingActive ? 1.8 : isWritingActive ? 3.6 : isHovered ? 5.2 : 11;

  const handleClick = () => {
    if (!isInteractive) return;
    soundEffects.playClick();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${config.wrapper} ${
        isInteractive ? 'cursor-pointer' : 'cursor-default'
      } ${className}`}
      title={isInteractive ? 'Screened Cinema Intelligence (Click to inspect)' : 'Screened Cinema Agent'}
      role={isInteractive && onClick ? 'button' : undefined}
      tabIndex={isInteractive && onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (isInteractive && onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* ========================================================================= */}
      {/* 1. PULSATING AMBIENT SHOCKWAVES & RIPPLES (On Hover, Thinking, Writing) */}
      {/* ========================================================================= */}
      {/* Outer ambient glow halo */}
      <motion.div
        className="absolute -inset-3 rounded-full blur-lg pointer-events-none"
        animate={{
          scale: isThinkingActive ? [1, 1.35, 1] : isWritingActive ? [1, 1.2, 1] : isHovered ? 1.25 : [1, 1.08, 1],
          opacity: isThinkingActive ? [0.6, 0.9, 0.6] : isWritingActive ? [0.5, 0.8, 0.5] : isHovered ? 0.75 : 0.35,
          background: isThinkingActive
            ? 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(99, 102, 241, 0.25) 60%, transparent 80%)'
            : isWritingActive
            ? 'radial-gradient(circle, rgba(52, 211, 153, 0.45) 0%, rgba(56, 189, 248, 0.25) 60%, transparent 80%)'
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(37, 99, 235, 0.2) 60%, transparent 80%)',
        }}
        transition={{
          duration: isThinkingActive ? 1.6 : isWritingActive ? 2.2 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Rhythmic Expanding Pulse Ring (Thinking & Writing Shockwaves) */}
      {isHighEnergy && (
        <motion.span
          className="absolute -inset-2 rounded-full border border-sky-400/40 pointer-events-none"
          initial={{ scale: 0.9, opacity: 0.9 }}
          animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
          transition={{
            duration: isThinkingActive ? 1.4 : 2.0,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}

      {/* Second Harmonic Echo Ripple */}
      {isThinkingActive && (
        <motion.span
          className="absolute -inset-2 rounded-full border border-indigo-400/30 pointer-events-none"
          initial={{ scale: 0.9, opacity: 0.8 }}
          animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
          transition={{
            duration: 1.4,
            delay: 0.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 2. DUAL ROTATING ORBIT RINGS (Opposite Directions & Dynamic Speeds) */}
      {/* ========================================================================= */}
      {/* Outer Orbit Ring 1: Clockwise High-Tech Dashed Cinema Sprocket Ring */}
      <motion.div
        className={`absolute ${config.orbitInset1} pointer-events-none flex items-center justify-center`}
        animate={{ rotate: 360 }}
        transition={{
          duration: clockwiseDuration,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <circle
            cx="50"
            cy="50"
            r="47"
            stroke="url(#outer-avatar-gradient)"
            strokeWidth={config.strokeWidth * 1.8}
            strokeDasharray={isThinkingActive ? '6 4 14 4' : '10 6 22 6'}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="outer-avatar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-tool-ocean)" stopOpacity={isHighEnergy ? 1 : 0.8} />
              <stop offset="40%" stopColor="var(--color-midnight-royal)" stopOpacity={isHighEnergy ? 0.9 : 0.6} />
              <stop offset="70%" stopColor="var(--color-indigo-accent)" stopOpacity={isHighEnergy ? 0.7 : 0.3} />
              <stop offset="100%" stopColor="var(--color-tool-ocean)" stopOpacity={isHighEnergy ? 0.9 : 0.7} />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Inner Orbit Ring 2: Counter-Clockwise Dotted Segmented Aperture Ring */}
      <motion.div
        className={`absolute ${config.orbitInset2} pointer-events-none flex items-center justify-center`}
        animate={{ rotate: -360 }}
        transition={{
          duration: counterClockwiseDuration,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="url(#inner-avatar-gradient)"
            strokeWidth={config.strokeWidth * 1.4}
            strokeDasharray={isThinkingActive ? '3 3 8 3' : '4 6 12 6'}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="inner-avatar-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isWritingActive ? 'var(--color-tool-diligence)' : 'var(--color-tool-scout)'} stopOpacity={isHighEnergy ? 1 : 0.7} />
              <stop offset="50%" stopColor="var(--color-tool-ocean)" stopOpacity={isHighEnergy ? 0.8 : 0.4} />
              <stop offset="100%" stopColor={isWritingActive ? 'var(--color-tool-ocean)' : 'var(--color-tool-scout-hover)'} stopOpacity={isHighEnergy ? 0.9 : 0.6} />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* ========================================================================= */}
      {/* 3. CORE ORB: ORGANIC SWIRLING VORTEX & ARTICULATED CINEMA EMBLEM */}
      {/* ========================================================================= */}
      <motion.div
        className="relative z-10 w-full h-full rounded-full overflow-hidden flex items-center justify-center shadow-lg shadow-black/60 border border-white/20"
        animate={{
          scale: isPressed ? 0.92 : isHovered ? 1.06 : [1, 1.025, 1],
        }}
        transition={{
          scale: isPressed
            ? { type: 'spring', stiffness: 600, damping: 20 }
            : isHovered
            ? { type: 'spring', stiffness: 400, damping: 25 }
            : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          background: 'linear-gradient(135deg, var(--color-midnight-violet) 0%, var(--color-midnight-base) 50%, var(--color-midnight-royal) 100%)',
        }}
      >
        {/* Organic Swirling Conic Vortex Layer */}
        <motion.div
          className="absolute -inset-1 opacity-70 pointer-events-none mix-blend-screen"
          animate={{ rotate: isThinkingActive ? 360 : isWritingActive ? -360 : 360 }}
          transition={{
            duration: isThinkingActive ? 3 : isWritingActive ? 5 : 12,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            background:
              'conic-gradient(from 0deg, rgba(56, 189, 248, 0.6), rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.5), rgba(52, 211, 153, 0.4), rgba(56, 189, 248, 0.6))',
          }}
        />

        {/* Deep dark center radial vignette for high-contrast emblem clarity */}
        <div className="absolute inset-0.5 rounded-full bg-slate-950/70 backdrop-blur-[2px] pointer-events-none" />

        {/* Dynamic Holographic Glass Light Sweep */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none"
          initial={{ x: '-150%' }}
          animate={
            isHovered
              ? { x: '150%' }
              : isThinkingActive
              ? { x: ['-150%', '150%'] }
              : { x: '-150%' }
          }
          transition={{
            duration: isHovered ? 0.7 : isThinkingActive ? 1.8 : 0.7,
            repeat: isThinkingActive ? Infinity : 0,
            repeatDelay: 0.8,
            ease: 'easeInOut',
          }}
        />

        {/* Articulated Cinema Clapperboard SVG Emblem */}
        <div className="relative z-20 flex items-center justify-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          <svg
            width={config.iconSize}
            height={config.iconSize}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible"
          >
            {/* Clapper Lower Base Box */}
            <rect
              x="3"
              y="9"
              width="18"
              height="12"
              rx="2.5"
              fill="white"
              fillOpacity={0.95}
              stroke="white"
              strokeWidth="0.5"
            />
            {/* Base Inner Accent Grid / Cinema Frame notches */}
            <line x1="8" y1="13" x2="16" y2="13" stroke="var(--color-midnight-base)" strokeWidth="1.25" strokeLinecap="round" />
            <line x1="8" y1="16.5" x2="13" y2="16.5" stroke="var(--color-midnight-base)" strokeWidth="1.25" strokeLinecap="round" />

            {/* Articulated Top Clapper Arm (Tilts open -14deg on Hover/Active) */}
            <motion.g
              style={{ originX: '4px', originY: '9px' }}
              animate={{
                rotate: isPressed ? 0 : isHovered ? -14 : isThinkingActive ? [-12, -2, -12] : 0,
              }}
              transition={{
                rotate: isThinkingActive
                  ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                  : { type: 'spring', stiffness: 500, damping: 20 },
              }}
            >
              {/* Clapper Stick */}
              <rect x="3" y="4" width="18" height="4.5" rx="1.5" fill="white" stroke="var(--color-midnight-base)" strokeWidth="0.5" />
              {/* Diagonal Zebra Stripes */}
              <line x1="6.5" y1="4" x2="4.5" y2="8.5" stroke="var(--color-midnight-base)" strokeWidth="1.5" />
              <line x1="11" y1="4" x2="9" y2="8.5" stroke="var(--color-midnight-base)" strokeWidth="1.5" />
              <line x1="15.5" y1="4" x2="13.5" y2="8.5" stroke="var(--color-midnight-base)" strokeWidth="1.5" />
              <line x1="20" y1="4" x2="18" y2="8.5" stroke="var(--color-midnight-base)" strokeWidth="1.5" />
            </motion.g>
          </svg>
        </div>

        {/* Live Active Status Indicator Beacon Dot */}
        <AnimatePresence>
          {(isHighEnergy || isHovered) && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className={`absolute ${config.badgeOffset} ${config.badgeSize} rounded-full ring-1.5 ring-slate-950 z-30 shadow-md ${
                isThinkingActive
                  ? 'bg-amber-400 shadow-amber-400/80'
                  : isWritingActive
                  ? 'bg-emerald-400 shadow-emerald-400/80'
                  : 'bg-sky-400 shadow-sky-400/80'
              }`}
            >
              <motion.span
                className="absolute inset-0 rounded-full bg-inherit"
                animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
              />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
