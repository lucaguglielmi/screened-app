import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const BASE_SYMBOLS = [
  '🎬',
  '🎞️',
  '🍿',
  '🎥',
  '🔬',
  '📚',
  '📊',
  '📝',
  '🕵️',
  '🔍',
  '🔦',
  '💰',
  '💵',
  '🪙',
];

const EYES = ['👀', '👀', 'ee'];

interface RayConfig {
  angle: number;
  color: string;
  delay: number;
  startDist: number;
  endDist: number;
  length: string;
  width: string;
}

const RAYS: RayConfig[] = [
  { angle: 0, color: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]', delay: 0, startDist: 0.48, endDist: 1.35, length: '0.38em', width: '0.07em' },
  { angle: 30, color: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]', delay: 0.15, startDist: 0.44, endDist: 1.25, length: '0.32em', width: '0.06em' },
  { angle: 60, color: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]', delay: 0.3, startDist: 0.48, endDist: 1.4, length: '0.42em', width: '0.075em' },
  { angle: 90, color: 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.9)]', delay: 0.1, startDist: 0.44, endDist: 1.3, length: '0.35em', width: '0.065em' },
  { angle: 120, color: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.9)]', delay: 0.25, startDist: 0.48, endDist: 1.35, length: '0.4em', width: '0.07em' },
  { angle: 150, color: 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.9)]', delay: 0.05, startDist: 0.44, endDist: 1.25, length: '0.34em', width: '0.06em' },
  { angle: 180, color: 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.9)]', delay: 0.2, startDist: 0.48, endDist: 1.38, length: '0.38em', width: '0.07em' },
  { angle: 210, color: 'bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.9)]', delay: 0.35, startDist: 0.44, endDist: 1.26, length: '0.32em', width: '0.06em' },
  { angle: 240, color: 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]', delay: 0.12, startDist: 0.48, endDist: 1.36, length: '0.4em', width: '0.075em' },
  { angle: 270, color: 'bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]', delay: 0.28, startDist: 0.44, endDist: 1.3, length: '0.35em', width: '0.065em' },
  { angle: 300, color: 'bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.9)]', delay: 0.08, startDist: 0.48, endDist: 1.42, length: '0.42em', width: '0.07em' },
  { angle: 330, color: 'bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.9)]', delay: 0.22, startDist: 0.44, endDist: 1.28, length: '0.34em', width: '0.06em' },
];

export interface AnimatedEEProps {
  forceHover?: boolean;
  eyesPattern?: boolean;
  slowAnimation?: boolean;
}

export const AnimatedEE: React.FC<AnimatedEEProps> = ({ 
  forceHover = false, 
  eyesPattern = false, 
  slowAnimation = false 
}) => {
  const [internalHover, setInternalHover] = useState(false);
  const [symbolIndex, setSymbolIndex] = useState(0);

  const isHovered = internalHover || forceHover;

  const currentSymbols = useMemo(() => {
    if (!eyesPattern) {
      return [...BASE_SYMBOLS, ...EYES];
    }
    const pattern = [];
    for (let i = 0; i < BASE_SYMBOLS.length; i++) {
      pattern.push(EYES[i % EYES.length]);
      pattern.push(BASE_SYMBOLS[i]);
    }
    return pattern;
  }, [eyesPattern]);

  useEffect(() => {
    let interval: number;
    if (isHovered) {
      interval = window.setInterval(() => {
        setSymbolIndex((prev) => (prev + 1) % currentSymbols.length);
      }, slowAnimation ? 400 : 100);
    }
    return () => clearInterval(interval);
  }, [isHovered, currentSymbols.length, slowAnimation]);

  return (
    <span
      className="relative inline-flex items-center justify-center cursor-crosshair group w-[1em] h-[1em]"
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <span
        className={`relative z-10 transition-colors duration-300 group-hover:text-indigo-400 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
      >
        ee
      </span>

      {isHovered && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: [0.8, 1.2, 0.8], rotate: [-15, 15, -15] }}
          transition={{
            rotate: { repeat: Infinity, duration: slowAnimation ? 1.2 : 0.3, ease: 'easeInOut' },
            scale: { repeat: Infinity, duration: slowAnimation ? 1.6 : 0.4, ease: 'easeInOut' },
          }}
          className="absolute z-20 text-[0.8em]"
        >
          {currentSymbols[symbolIndex]}
        </motion.span>
      )}

      <AnimatePresence>
        {isHovered && (
          <>
            {/* Radiant colorful burst rays that animate distinctly outside the icons */}
            {RAYS.map((ray, i) => {
              const rad = (ray.angle * Math.PI) / 180;
              const startX = `${(Math.cos(rad) * ray.startDist).toFixed(3)}em`;
              const endX = `${(Math.cos(rad) * ray.endDist).toFixed(3)}em`;
              const startY = `${(Math.sin(rad) * ray.startDist).toFixed(3)}em`;
              const endY = `${(Math.sin(rad) * ray.endDist).toFixed(3)}em`;

              return (
                <motion.div
                  key={`ray-${i}`}
                  initial={{
                    opacity: 0,
                    scale: 0.4,
                    x: startX,
                    y: startY,
                  }}
                  animate={{
                    opacity: [0, 1, 0.9, 0],
                    scale: [0.5, 1.25, 0.7],
                    x: [startX, endX],
                    y: [startY, endY],
                  }}
                  transition={{
                    duration: slowAnimation ? 1.4 : 0.7,
                    ease: 'easeOut',
                    repeat: Infinity,
                    delay: ray.delay * (slowAnimation ? 1.5 : 1),
                    repeatDelay: slowAnimation ? 0.3 : 0.1,
                  }}
                  className={`absolute rounded-full pointer-events-none z-30 ${ray.color}`}
                  style={{
                    width: ray.width,
                    height: ray.length,
                    rotate: `${ray.angle + 90}deg`,
                  }}
                />
              );
            })}
          </>
        )}
      </AnimatePresence>
    </span>
  );
};
