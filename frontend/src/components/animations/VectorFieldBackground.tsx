import React, { useEffect, useRef } from 'react';

export interface VectorFieldProps {
  color?: string; // e.g. '#FF2A55' or 'rgba(255, 42, 85, 0.85)'
  speed?: number; // oscillation speed
  amplitude?: number; // oscillation angle in radians
  gridSpacing?: number; // pixels between droplets
  dropletLength?: number; // length of each needle/droplet
  interactive?: boolean; // react to mouse
  opacity?: number;
  className?: string;
}

export const VectorFieldBackground: React.FC<VectorFieldProps> = ({
  color = '#FF2A55',
  speed = 0.8,
  amplitude = 0.25,
  gridSpacing = 38,
  dropletLength = 22,
  interactive = true,
  opacity = 0.55,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
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
          const nx = x / width;
          const ny = y / height;

          // Base field orientation matching the reference image:
          // Top-left is nearly 90 deg (vertical), bottom-left is 0 deg (horizontal),
          // transitioning gradually into diagonal (45 deg) and curving right.
          const baseAngle = (1 - ny) * (Math.PI / 2) * (1 - nx * 0.45) + (nx * Math.PI * 0.28);

          // Synchronous harmonic wave undulation across spatial field
          const wave = Math.sin(elapsed * speed * 1.5 + nx * 3.5 + ny * 2.2) * amplitude;
          
          let angle = baseAngle + wave;

          // Mouse proximity influence: subtle deflection toward or with mouse
          if (interactive && mousePos.current.active) {
            const dx = mousePos.current.x - x;
            const dy = mousePos.current.y - y;
            const distSq = dx * dx + dy * dy;
            const maxDist = 180;
            if (distSq < maxDist * maxDist) {
              const dist = Math.sqrt(distSq);
              const targetAngle = Math.atan2(dy, dx);
              const influence = (1 - dist / maxDist) * 0.45;
              angle = angle * (1 - influence) + targetAngle * influence;
            }
          }

          // Compute needle start (tail) and end (bright head)
          const halfLen = dropletLength / 2;
          const x1 = x - Math.cos(angle) * halfLen;
          const y1 = y - Math.sin(angle) * halfLen;
          const x2 = x + Math.cos(angle) * halfLen;
          const y2 = y + Math.sin(angle) * halfLen;

          // Linear gradient from faint tail to bright glowing needle head
          const grad = ctx.createLinearGradient(x1, y1, x2, y2);
          grad.addColorStop(0, 'rgba(255, 35, 75, 0.05)');
          grad.addColorStop(0.4, `${color}40`);
          grad.addColorStop(0.85, `${color}CC`);
          grad.addColorStop(1, `${color}FF`);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.75;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Glowing tip droplet dot
          ctx.beginPath();
          ctx.arc(x2, y2, 1.25, 0, Math.PI * 2);
          ctx.fillStyle = `${color}FF`;
          ctx.shadowColor = color;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0; // reset
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
    <canvas
      ref={canvasRef}
      style={{ opacity }}
      className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${className}`}
    />
  );
};
