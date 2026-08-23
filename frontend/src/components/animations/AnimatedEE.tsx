import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const AnimatedEE: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span 
      className="relative inline-flex items-center justify-center cursor-crosshair group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative z-10 transition-colors duration-300 group-hover:text-indigo-400">ee</span>
      
      <AnimatePresence>
        {isHovered && (
          <>
            {/* Confetti / Lines */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`line-${i}`}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 1],
                  x: (Math.random() - 0.5) * 60,
                  y: (Math.random() - 0.5) * 60 - 10
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute w-1 h-3 bg-indigo-500 rounded-full z-0 pointer-events-none"
                style={{ rotate: `${i * 60}deg` }}
              />
            ))}
            
            {/* Floating Symbols */}
            {['✨', '✦', '✶'].map((symbol, i) => (
              <motion.span
                key={`symbol-${i}`}
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  y: -30 - (Math.random() * 20),
                  x: (Math.random() - 0.5) * 40
                }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                className="absolute text-sm pointer-events-none z-20 text-indigo-300"
              >
                {symbol}
              </motion.span>
            ))}
          </>
        )}
      </AnimatePresence>
    </span>
  );
};
