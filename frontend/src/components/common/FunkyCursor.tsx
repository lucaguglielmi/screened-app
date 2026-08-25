import React, { useEffect, useState } from 'react';

export const FunkyCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check if hovering over a clickable element
      const target = e.target as HTMLElement;
      const isClickable = target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer');
      setIsHovering(!!isClickable);
    };

    window.addEventListener('mousemove', updatePosition, { capture: true });
    
    // Also listen to mouseover/mouseout just in case, but mousemove is usually enough
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer');
      setIsHovering(!!isClickable);
    };
    
    window.addEventListener('mouseover', handleMouseOver, { capture: true });

    return () => {
      window.removeEventListener('mousemove', updatePosition, { capture: true });
      window.removeEventListener('mouseover', handleMouseOver, { capture: true });
    };
  }, []);

  return (
    <>
      <style>{`
        * {
          cursor: none !important;
        }
        .funky-cursor-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 99999;
          overflow: hidden;
        }
        .funky-cursor-dot {
          position: absolute;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background-color: #FFFF00;
          mix-blend-mode: difference;
          transition: width 0.15s ease-out, height 0.15s ease-out;
        }
        .funky-cursor-arrow {
          position: absolute;
          transform: translate(0, 0);
        }
        
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.15);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
      <div className="funky-cursor-container">
        {isHovering ? (
          <div 
            className="funky-cursor-dot" 
            style={{ 
              left: `${position.x}px`, 
              top: `${position.y}px`,
              width: '48px',
              height: '48px',
              animation: 'pulse 1.5s infinite ease-in-out'
            }} 
          />
        ) : (
          <svg 
            className="funky-cursor-arrow"
            style={{ 
              left: `${position.x}px`, 
              top: `${position.y}px`,
              width: '28px',
              height: '28px',
              fill: 'var(--color-yellow-400, rgb(255, 255, 0))',
              stroke: 'var(--color-slate-900, rgb(34, 34, 34))',
              strokeWidth: '1.5px',
              filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.4))'
            }}
            viewBox="0 0 24 24"
          >
            <path d="M4.5 2L18.5 13L11 14L15 21L11.5 22.5L7.5 15L2 19.5V2Z" />
          </svg>
        )}
      </div>
    </>
  );
};
