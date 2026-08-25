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

const EYES = ['👁️', '👀'];

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
            {/* Confetti / Lines */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`line-${i}`}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                  x: (Math.random() - 0.5) * 80,
                  y: (Math.random() - 0.5) * 80,
                }}
                transition={{
                  duration: slowAnimation ? 1.5 : 0.8,
                  ease: 'easeOut',
                  repeat: Infinity,
                  repeatDelay: Math.random() * (slowAnimation ? 0.6 : 0.2),
                }}
                className={`absolute w-1 h-3 rounded-full z-0 pointer-events-none ${
                  i % 3 === 0 ? 'bg-tool-diligence' : i % 3 === 1 ? 'bg-indigo-500' : 'bg-rose-500'
                }`}
                style={{ rotate: `${i * 45}deg` }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </span>
  );
};
