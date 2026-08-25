import React, { useState, useEffect, useRef } from 'react';

const CHARS = '!<>-_\\\\/[]{}—=+*^?#________';

interface ScrambleTextProps {
  text: string;
  className?: string;
}

export const ScrambleText: React.FC<ScrambleTextProps> = ({ text, className }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isHovered) {
      let iteration = 0;
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }

      intervalRef.current = window.setInterval(() => {
        setDisplayText((prev) =>
          prev
            .split('')
            .map((letter, index) => {
              // Maintain spaces
              if (letter === ' ') return ' ';
              if (text[index] === ' ') return ' ';

              if (index < iteration) {
                return text[index];
              }
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join('')
        );

        if (iteration >= text.length) {
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
          }
        }
        
        iteration += 1 / 2; // Adjust speed here
      }, 30);
    } else {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      // Animate back to normal or just snap? Let's just snap back to the correct text on mouse leave.
      setDisplayText(text);
    }

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, text]);

  return (
    <span 
      className={className} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayText}
    </span>
  );
};
