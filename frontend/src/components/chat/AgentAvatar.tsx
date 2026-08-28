import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEffects } from '../../utils/audio';

export type AvatarStatus = 'idle' | 'hover' | 'active' | 'thinking' | 'loading' | 'writing' | 'streaming';

export interface AgentAvatarProps {
  /**
   * Streamlined 3 standard sizes:
   * - 'sm': 32px (Pills, compact feeds)
   * - 'md': 44px (Default for chat bubbles, nav bars)
   * - 'lg': 64px (Headers, modals, hero showcase)
   * Backward compatible aliases: 'xs' -> 'sm', 'xl' -> 'lg'
   */
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
      }, 4000);
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
  const isInteractiveActive = isHovered || isPressed || isThinkingActive || isWritingActive || hasRecentlyLoaded;

  // Normalized size configuration:
  // All orbit rings, shockwaves, and the core orb stay strictly WITHIN the bounding box (zero negative insets).
  const normalizedSize = size === 'xs' ? 'sm' : size === 'xl' ? 'lg' : size;

  const config = {
    sm: {
      wrapper: 'w-8 h-8',
      coreInset: 'p-1',
      iconSize: 13,
      strokeWidth: 1.2,
      beaconSize: 'size-1.5',
    },
    md: {
      wrapper: 'w-11 h-11',
      coreInset: 'p-1.5',
      iconSize: 18,
      strokeWidth: 1.5,
      beaconSize: 'size-2',
    },
    lg: {
      wrapper: 'w-16 h-16',
      coreInset: 'p-2',
      iconSize: 26,
      strokeWidth: 1.8,
      beaconSize: 'size-2.5',
    },
  }[normalizedSize];

  // Rotation animation durations when active (hover, thinking, writing)
  // When idle, duration is null/stopped (0 rotation).
  const clockwiseDuration = isThinkingActive ? 2.0 : isWritingActive ? 3.8 : isHovered ? 5.5 : 0;
  const counterClockwiseDuration = isThinkingActive ? 1.6 : isWritingActive ? 3.2 : isHovered ? 4.5 : 0;

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
      {/* 1. AMBIENT GLOW & SHOCKWAVES (Contained inside wrapper, active on hover/loading) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isInteractiveActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: isThinkingActive ? [0.4, 0.8, 0.4] : 0.6,
              scale: isThinkingActive ? [0.95, 1.05, 0.95] : 1,
            }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{
              duration: isThinkingActive ? 1.5 : 0.3,
              repeat: isThinkingActive ? Infinity : 0,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full bg-blue-500/25 blur-md pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. DUAL CONCENTRIC ORBIT RINGS (Zero negative insets - fully contained) */}
      {/* ========================================================================= */}
      
      {/* Outer Orbit Ring 1: Clockwise Dashed Cinema Sprocket Ring */}
      <motion.div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        animate={
          clockwiseDuration > 0
            ? { rotate: 360 }
            : { rotate: 0 }
        }
        transition={
          clockwiseDuration > 0
            ? {
                duration: clockwiseDuration,
                repeat: Infinity,
                ease: 'linear',
              }
            : { duration: 0.4, ease: 'easeOut' }
        }
      >
        <svg className="w-full h-full p-0.5" viewBox="0 0 100 100" fill="none">
          <circle
            cx="50"
            cy="50"
            r="46"
            stroke="url(#avatar-outer-orbit-grad)"
            strokeWidth={config.strokeWidth * 1.5}
            strokeDasharray={isThinkingActive ? '8 5 18 5' : isInteractiveActive ? '10 6 22 6' : '14 8'}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          <defs>
            <linearGradient id="avatar-outer-orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-tool-ocean)" stopOpacity={isInteractiveActive ? 1 : 0.85} />
              <stop offset="50%" stopColor="var(--color-midnight-royal)" stopOpacity={isInteractiveActive ? 0.95 : 0.7} />
              <stop offset="100%" stopColor="var(--color-tool-diligence)" stopOpacity={isInteractiveActive ? 0.9 : 0.6} />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Inner Orbit Ring 2: Counter-Clockwise Dotted Segmented Ring */}
      <motion.div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        animate={
          counterClockwiseDuration > 0
            ? { rotate: -360 }
            : { rotate: 0 }
        }
        transition={
          counterClockwiseDuration > 0
            ? {
                duration: counterClockwiseDuration,
                repeat: Infinity,
                ease: 'linear',
              }
            : { duration: 0.4, ease: 'easeOut' }
        }
      >
        <svg className="w-full h-full p-1" viewBox="0 0 100 100" fill="none">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#avatar-inner-orbit-grad)"
            strokeWidth={config.strokeWidth * 1.2}
            strokeDasharray={isThinkingActive ? '4 4 10 4' : isInteractiveActive ? '5 7 14 7' : '8 10'}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          <defs>
            <linearGradient id="avatar-inner-orbit-grad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor={isWritingActive ? 'var(--color-tool-diligence)' : 'var(--color-tool-scout)'}
                stopOpacity={isInteractiveActive ? 1 : 0.75}
              />
              <stop offset="60%" stopColor="var(--color-tool-ocean)" stopOpacity={isInteractiveActive ? 0.85 : 0.55} />
              <stop
                offset="100%"
                stopColor={isWritingActive ? 'var(--color-tool-ocean)' : 'var(--color-tool-scout-hover)'}
                stopOpacity={isInteractiveActive ? 0.9 : 0.6}
              />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* ========================================================================= */}
      {/* 3. CORE ORB: BRIGHT LUMINOUS SAPPHIRE CINEMA ORB & ARTICULATED CLAPPER */}
      {/* ========================================================================= */}
      <div className={`w-full h-full ${config.coreInset} flex items-center justify-center`}>
        <motion.div
          className="relative z-10 w-full h-full rounded-full overflow-hidden flex items-center justify-center shadow-md shadow-blue-950/50 border border-blue-400/40 ring-1 ring-white/20"
          animate={{
            scale: isPressed ? 0.92 : isHovered ? 1.05 : 1,
          }}
          transition={{
            scale: isPressed
              ? { type: 'spring', stiffness: 600, damping: 20 }
              : isHovered
              ? { type: 'spring', stiffness: 400, damping: 25 }
              : { duration: 0.3, ease: 'easeOut' },
          }}
          style={{
            // Brighter, rich cinema royal sapphire gradient (high visibility & vibrancy)
            background:
              'linear-gradient(135deg, var(--color-midnight-royal) 0%, var(--color-tool-ocean) 60%, var(--color-tool-diligence) 100%)',
          }}
        >
          {/* Swirling Conic Highlight Layer (Active on hover/loading/writing) */}
          <AnimatePresence>
            {isInteractiveActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 0.65,
                  rotate: isThinkingActive ? 360 : isWritingActive ? -360 : 360,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.3 },
                  rotate: {
                    duration: isThinkingActive ? 2.5 : isWritingActive ? 4 : 8,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }}
                className="absolute -inset-1 pointer-events-none mix-blend-overlay"
                style={{
                  background:
                    'conic-gradient(from 0deg, rgba(255, 255, 255, 0.8), rgba(56, 189, 248, 0.5), rgba(99, 102, 241, 0.4), rgba(0, 210, 158, 0.6), rgba(255, 255, 255, 0.8))',
                }}
              />
            )}
          </AnimatePresence>

          {/* Dynamic Light Sweep across the lens on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
            initial={{ x: '-150%' }}
            animate={
              isHovered
                ? { x: '150%' }
                : isThinkingActive
                ? { x: ['-150%', '150%'] }
                : { x: '-150%' }
            }
            transition={{
              duration: isHovered ? 0.6 : isThinkingActive ? 1.5 : 0.6,
              repeat: isThinkingActive ? Infinity : 0,
              repeatDelay: 0.6,
              ease: 'easeInOut',
            }}
          />

          {/* Articulated Cinema Clapperboard SVG Emblem */}
          <div className="relative z-20 flex items-center justify-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
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
                fillOpacity={0.98}
                stroke="white"
                strokeWidth="0.5"
              />
              {/* Base Inner Accent Grid / Cinema Frame notches */}
              <line
                x1="8"
                y1="13"
                x2="16"
                y2="13"
                stroke="var(--color-midnight-base)"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <line
                x1="8"
                y1="16.5"
                x2="13"
                y2="16.5"
                stroke="var(--color-midnight-base)"
                strokeWidth="1.3"
                strokeLinecap="round"
              />

              {/* Articulated Top Clapper Arm (Tilts open -14deg on Hover/Active) */}
              <motion.g
                style={{ originX: '4px', originY: '9px' }}
                animate={{
                  rotate: isPressed ? 0 : isHovered ? -14 : isThinkingActive ? [-12, -2, -12] : 0,
                }}
                transition={{
                  rotate: isThinkingActive
                    ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
                    : { type: 'spring', stiffness: 500, damping: 20 },
                }}
              >
                {/* Clapper Stick */}
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="4.5"
                  rx="1.5"
                  fill="white"
                  stroke="var(--color-midnight-base)"
                  strokeWidth="0.5"
                />
                {/* Diagonal Zebra Stripes */}
                <line x1="6.5" y1="4" x2="4.5" y2="8.5" stroke="var(--color-midnight-base)" strokeWidth="1.5" />
                <line x1="11" y1="4" x2="9" y2="8.5" stroke="var(--color-midnight-base)" strokeWidth="1.5" />
                <line x1="15.5" y1="4" x2="13.5" y2="8.5" stroke="var(--color-midnight-base)" strokeWidth="1.5" />
                <line x1="20" y1="4" x2="18" y2="8.5" stroke="var(--color-midnight-base)" strokeWidth="1.5" />
              </motion.g>
            </svg>
          </div>

          {/* Live Status Indicator Beacon (Active on thinking, writing, recently loaded) */}
          <AnimatePresence>
            {(isThinkingActive || isWritingActive || hasRecentlyLoaded) && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={`absolute bottom-0.5 right-0.5 ${config.beaconSize} rounded-full ring-1 ring-white ${
                  isThinkingActive
                    ? 'bg-amber-400 animate-ping'
                    : isWritingActive
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-blue-400'
                }`}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
