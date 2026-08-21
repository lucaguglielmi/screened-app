import React, { useEffect, useRef } from 'react';

export interface VectorFieldProps {
  color?: string; // e.g. '#E11D48' or 'rgba(225, 29, 72, 0.4)'
  speed?: number; // oscillation speed
  amplitude?: number; // oscillation angle in radians
  gridSpacing?: number; // pixels between droplets
  dropletLength?: number; // length of each needle/droplet
  interactive?: boolean; // react to mouse
  opacity?: number;
  className?: string;
}

export const VectorFieldBackground: React.FC<VectorFieldProps> = ({
  color = '#E11D48',
  speed = 0.45,
  amplitude = 0.16,
  gridSpacing = 34,
  dropletLength = 9,
  interactive = true,
  opacity = 0.18,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mousePos.current.active = false;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
    }

    let startTime = performance.now();

    const render = (time: number) => {
      if (width === 0 || height === 0) {
        handleResize();
      }
      const elapsed = (time - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / gridSpacing) + 2;
      const rows = Math.ceil(height / gridSpacing) + 2;
      const offsetX = (width % gridSpacing) / 2;
      const offsetY = (height % gridSpacing) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * gridSpacing + offsetX - gridSpacing / 2;
          const y = r * gridSpacing + offsetY - gridSpacing / 2;

          // Normalized coordinates (0 to 1)
          const nx = x / (width || 1);
          const ny = y / (height || 1);

          // Base field orientation:
          // Top-left is vertical, bottom-left is horizontal, gradual diagonal transition
          const baseAngle = (1 - ny) * (Math.PI / 2) * (1 - nx * 0.45) + (nx * Math.PI * 0.28);

          // Synchronous subtle harmonic wave across spatial field
          const wave = Math.sin(elapsed * speed * 1.5 + nx * 3.5 + ny * 2.2) * amplitude;
          
          let angle = baseAngle + wave;

          // Mouse proximity deflection
          if (interactive && mousePos.current.active) {
            const dx = mousePos.current.x - x;
            const dy = mousePos.current.y - y;
            const distSq = dx * dx + dy * dy;
            const maxDist = 150;
            if (distSq < maxDist * maxDist) {
              const dist = Math.sqrt(distSq);
              const targetAngle = Math.atan2(dy, dx);
              const influence = (1 - dist / maxDist) * 0.35;
              angle = angle * (1 - influence) + targetAngle * influence;
            }
          }

          // Needle endpoints
          const halfLen = dropletLength / 2;
          const x1 = x - Math.cos(angle) * halfLen;
          const y1 = y - Math.sin(angle) * halfLen;
          const x2 = x + Math.cos(angle) * halfLen;
          const y2 = y + Math.sin(angle) * halfLen;

          // Faint gradient line
          const grad = ctx.createLinearGradient(x1, y1, x2, y2);
          grad.addColorStop(0, 'rgba(225, 29, 72, 0.02)');
          grad.addColorStop(0.5, `${color}30`);
          grad.addColorStop(1, `${color}88`);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.25;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Tiny tip dot
          ctx.beginPath();
          ctx.arc(x2, y2, 0.9, 0, Math.PI * 2);
          ctx.fillStyle = `${color}BB`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [color, speed, amplitude, gridSpacing, dropletLength, interactive]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden max-w-full z-0 ${className}`}
    >
      <canvas
        ref={canvasRef}
        style={{ opacity, width: '100%', height: '100%', maxWidth: '100%' }}
        className="block pointer-events-none"
      />
    </div>
  );
};
