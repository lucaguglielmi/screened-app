import React, { useEffect, useRef } from 'react';

export interface VectorFieldProps {
  color?: string; // e.g. '#E11D48' or '#F43F5E'
  speed?: number; // oscillation & magnet transit speed
  amplitude?: number; // harmonic wave oscillation intensity
  gridSpacing?: number; // pixels between needle particles
  dropletLength?: number; // length of each needle/droplet (smaller & sharper)
  blobCoverage?: number; // portion of screen covered by the organic blob (default ~0.70)
  interactive?: boolean; // react to mouse as an interactive magnet dipole
  opacity?: number;
  className?: string;
}

export const VectorFieldBackground: React.FC<VectorFieldProps> = ({
  color = '#E11D48',
  speed = 0.55,
  amplitude = 0.24,
  gridSpacing = 28,
  dropletLength = 7,
  blobCoverage = 0.70,
  interactive = true,
  opacity = 0.28,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // crisp retina cap
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
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

    const startTime = performance.now();

    const render = (time: number) => {
      if (width === 0 || height === 0) {
        handleResize();
      }
      const elapsed = (time - startTime) / 1000 * speed;
      ctx.clearRect(0, 0, width, height);

      // --- 1. ORGANIC MORPHING BLOB DRIFT PHYSICS (Spanning ~70% screen) ---
      // The blob center drifts slowly across the viewport in smooth Lissajous curves
      const blobCenterX = width * 0.5 + Math.sin(elapsed * 0.42) * width * 0.16 + Math.cos(elapsed * 0.28) * width * 0.08;
      const blobCenterY = height * 0.48 + Math.cos(elapsed * 0.35) * height * 0.14 + Math.sin(elapsed * 0.52) * height * 0.07;
      
      // Base radius scaled to cover ~70% of screen diagonal
      const screenDiag = Math.sqrt(width * width + height * height);
      const baseRadius = screenDiag * 0.36 * blobCoverage;

      // --- 2. MOVING MAGNETIC POLES UNDERNEATH ---
      // Pole 1: North Attractor (orbiting around blob center)
      const pole1X = blobCenterX + Math.cos(elapsed * 0.85) * (baseRadius * 0.48);
      const pole1Y = blobCenterY + Math.sin(elapsed * 0.85) * (baseRadius * 0.48);

      // Pole 2: South Vortex Magnet (counter-rotating with tangential twist)
      const pole2X = blobCenterX + Math.sin(elapsed * 1.15) * (baseRadius * 0.62);
      const pole2Y = blobCenterY - Math.cos(elapsed * 1.15) * (baseRadius * 0.42);

      // Pole 3: Central Pulsing Pole
      const pole3X = blobCenterX + Math.cos(elapsed * 0.4) * (baseRadius * 0.22);
      const pole3Y = blobCenterY + Math.sin(elapsed * 0.6) * (baseRadius * 0.22);

      // Grid dimensions with padding
      const cols = Math.ceil(width / gridSpacing) + 2;
      const rows = Math.ceil(height / gridSpacing) + 2;
      const offsetX = (width % gridSpacing) / 2;
      const offsetY = (height % gridSpacing) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * gridSpacing + offsetX - gridSpacing / 2;
          const y = r * gridSpacing + offsetY - gridSpacing / 2;

          // Compute angle & distance to morphing blob center
          const dxBlob = x - blobCenterX;
          const dyBlob = y - blobCenterY;
          const distToBlob = Math.sqrt(dxBlob * dxBlob + dyBlob * dyBlob);
          const angleToBlob = Math.atan2(dyBlob, dxBlob);

          // Harmonic Fourier expansion for undulating organic blob perimeter
          const morphFactor = 1.0 +
            0.18 * Math.sin(3 * angleToBlob + elapsed * 0.9) +
            0.14 * Math.cos(2 * angleToBlob - elapsed * 0.6) +
            0.09 * Math.sin(5 * angleToBlob + elapsed * 1.4) +
            0.06 * Math.cos(4 * angleToBlob - elapsed * 1.1);

          const currentBlobRadius = baseRadius * morphFactor;

          // Feathered falloff at blob perimeter (smooth alpha gradient)
          const featherDistance = baseRadius * 0.35;
          const delta = currentBlobRadius - distToBlob;
          
          if (delta <= -featherDistance) {
            continue; // Completely outside blob mask, skip rendering for peak performance
          }

          let blobAlpha = 1.0;
          if (delta < featherDistance) {
            // Smoothstep hermite interpolation
            const tNorm = Math.max(0, Math.min(1, (delta + featherDistance) / (featherDistance * 2)));
            blobAlpha = tNorm * tNorm * (3 - 2 * tNorm);
          }

          if (blobAlpha <= 0.01) continue;

          // --- 3. MAGNETIC FIELD VECTOR COMPUTATION B(x,y) ---
          // Contribution from Pole 1 (Attractor)
          const dx1 = x - pole1X;
          const dy1 = y - pole1Y;
          const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) + 25;
          const b1X = (dx1 / (dist1 * 1.5)) * 90;
          const b1Y = (dy1 / (dist1 * 1.5)) * 90;

          // Contribution from Pole 2 (Rotational Vortex / Swirl)
          const dx2 = x - pole2X;
          const dy2 = y - pole2Y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) + 25;
          const b2X = (-dy2 / (dist2 * 1.4)) * 120;
          const b2Y = (dx2 / (dist2 * 1.4)) * 120;

          // Contribution from Pole 3 (Pulsar)
          const dx3 = x - pole3X;
          const dy3 = y - pole3Y;
          const dist3 = Math.sqrt(dx3 * dx3 + dy3 * dy3) + 30;
          const b3X = (dx3 / dist3) * 35;
          const b3Y = (dy3 / dist3) * 35;

          // Rhythmic harmonic spatial wave passing through the medium
          const nx = x / (width || 1);
          const ny = y / (height || 1);
          const waveX = Math.cos(elapsed * 1.8 + nx * 4.2 + ny * 2.8) * amplitude * 80;
          const waveY = Math.sin(elapsed * 1.8 + nx * 2.8 - ny * 3.5) * amplitude * 80;

          let netBx = b1X + b2X + b3X + waveX;
          let netBy = b1Y + b2Y + b3Y + waveY;

          // Interactive Cursor as a High-Intensity Magnetic Dipole
          if (interactive && mousePos.current.active) {
            const dxM = x - mousePos.current.x;
            const dyM = y - mousePos.current.y;
            const distM = Math.sqrt(dxM * dxM + dyM * dyM) + 10;
            const mouseRadius = 220;
            if (distM < mouseRadius) {
              const mousePower = (1 - distM / mouseRadius) * 260;
              // Swirling deflection + slight attraction
              netBx += (-dyM / distM) * mousePower * 1.3 - (dxM / distM) * mousePower * 0.4;
              netBy += (dxM / distM) * mousePower * 1.3 - (dyM / distM) * mousePower * 0.4;
            }
          }

          // Net angle of needle alignment
          const angle = Math.atan2(netBy, netBx);

          // --- 4. SHARP & COMPACT NEEDLE RENDERING ---
          const halfLen = dropletLength / 2;
          const x1 = x - Math.cos(angle) * halfLen;
          const y1 = y - Math.sin(angle) * halfLen;
          const x2 = x + Math.cos(angle) * halfLen;
          const y2 = y + Math.sin(angle) * halfLen;

          const currentOpacity = opacity * blobAlpha;

          // Sharp micro-gradient line
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `${color}${Math.round(currentOpacity * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 1.1;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Tiny sharp tip beacon dot
          const tipOpacity = Math.min(1.0, currentOpacity * 1.8);
          ctx.beginPath();
          ctx.arc(x2, y2, 0.85, 0, Math.PI * 2);
          ctx.fillStyle = `${color}${Math.round(tipOpacity * 255).toString(16).padStart(2, '0')}`;
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
  }, [color, speed, amplitude, gridSpacing, dropletLength, blobCoverage, interactive, opacity]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden max-w-full z-0 select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', maxWidth: '100%' }}
        className="block pointer-events-none"
      />
    </div>
  );
};

