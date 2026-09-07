import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../utils/motionTokens';

export interface LivingBackgroundProps {
  color?: string; // Needle & glow accent color (supports CSS variables, hex, rgb)
  speed?: number; // Oscillation & transit speed (default: 0.6)
  amplitude?: number; // Wave amplitude (default: 0.22)
  gridSpacing?: number; // Space between needles in px (default: 30)
  dropletLength?: number; // Length of each needle in px (default: 8)
  blobCoverage?: number; // Coverage of the morphing blob mask (0.3 to 1.0, default: 0.8)
  opacity?: number; // Overall field opacity (default: 0.45)
  interactive?: boolean; // React to mouse movement (default: true)
  position?: 'fixed' | 'absolute'; // 'fixed' for viewport background, 'absolute' for card previews
  className?: string;

  // Backward-compatible props
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  organicScale?: number;
}

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  pulseSpeed: number;
  phase: number;
}

export const VectorFieldBackground: React.FC<LivingBackgroundProps> = ({
  color,
  speed = 0.6,
  amplitude = 0.22,
  gridSpacing = 30,
  dropletLength = 8,
  blobCoverage = 0.8,
  opacity = 0.45,
  interactive = true,
  position = 'fixed',
  className = '',
  // Backward compatibility
  primaryColor = 'var(--color-tool-scout)',
}) => {
  const reducedMotion = useReducedMotion();
  const effectiveSpeed = reducedMotion ? 0 : speed;
  const effectiveInteractive = reducedMotion ? false : interactive;

  const activeColor = color || primaryColor;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse fluid interaction state with smooth spring interpolation
  const mouseState = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: false,
    influence: 0,
    targetInfluence: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Initialize subtle projector motes (cinematic stardust)
    const motesCount = 20;
    const motes: Mote[] = Array.from({ length: motesCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0001,
      vy: (Math.random() - 0.5) * 0.00008 - 0.00005,
      size: 0.8 + Math.random() * 1.4,
      baseAlpha: 0.15 + Math.random() * 0.25,
      pulseSpeed: 0.5 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
    }));

    const isAbsolute = position === 'absolute' || className.includes('absolute');

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (isAbsolute && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        width = Math.floor(rect.width) || 300;
        height = Math.floor(rect.height) || 200;
      } else {
        width = window.innerWidth;
        height = window.innerHeight;
      }

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      let curX = e.clientX;
      let curY = e.clientY;

      if (isAbsolute) {
        const rect = canvas.getBoundingClientRect();
        curX = e.clientX - rect.left;
        curY = e.clientY - rect.top;

        // Verify if cursor is inside or near the preview card
        const isInside =
          curX >= -30 && curX <= rect.width + 30 && curY >= -30 && curY <= rect.height + 30;
        if (!isInside) {
          mouseState.current.targetInfluence = 0.0;
          mouseState.current.active = false;
          return;
        }
      }

      mouseState.current.targetX = curX;
      mouseState.current.targetY = curY;
      mouseState.current.active = true;
      mouseState.current.targetInfluence = 1.0;
    };

    const handleMouseLeave = () => {
      mouseState.current.targetInfluence = 0.0;
      mouseState.current.active = false;
    };

    if (effectiveInteractive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    // Dynamic color resolution helper for CSS variables
    const resolveColor = (c: string): string => {
      if (c.startsWith('var(')) {
        const match = c.match(/var\((.*?)\)/);
        if (match) {
          const val = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
          if (val) return val;
        }
      }
      return c;
    };

    const parseColorToRgb = (colorStr: string): { r: number; g: number; b: number } => {
      const resolved = resolveColor(colorStr);
      if (resolved.startsWith('#')) {
        const hex = resolved.replace('#', '');
        if (hex.length === 3) {
          return {
            r: parseInt(hex[0] + hex[0], 16),
            g: parseInt(hex[1] + hex[1], 16),
            b: parseInt(hex[2] + hex[2], 16),
          };
        } else if (hex.length >= 6) {
          return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16),
          };
        }
      } else if (resolved.startsWith('rgb')) {
        const match = resolved.match(/\d+/g);
        if (match && match.length >= 3) {
          return {
            r: parseInt(match[0], 10),
            g: parseInt(match[1], 10),
            b: parseInt(match[2], 10),
          };
        }
      }
      return { r: 16, g: 229, b: 153 }; // default scout mint
    };

    const colorWithAlpha = (colorStr: string, alpha: number): string => {
      const { r, g, b } = parseColorToRgb(colorStr);
      const clamped = Math.max(0, Math.min(1, alpha));
      return `rgba(${r}, ${g}, ${b}, ${clamped.toFixed(3)})`;
    };

    const startTime = performance.now();

    const render = (time: number) => {
      if (width === 0 || height === 0) {
        handleResize();
      }

      // If document tab is hidden, pause heavy animation calculations
      if (document.visibilityState === 'hidden') {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const elapsed = ((time - startTime) / 1000) * effectiveSpeed;

      // Smooth spring interpolation for mouse interaction
      const m = mouseState.current;
      m.x += (m.targetX - m.x) * 0.08;
      m.y += (m.targetY - m.y) * 0.08;
      m.influence += (m.targetInfluence - m.influence) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // --- 1. ORGANIC MORPHING BLOB DRIFT PHYSICS ---
      // Lissajous curve drift of the primary organic attractor
      const blobCenterX =
        width * 0.5 +
        Math.sin(elapsed * 0.38) * width * 0.15 +
        Math.cos(elapsed * 0.25) * width * 0.08;
      const blobCenterY =
        height * 0.48 +
        Math.cos(elapsed * 0.32) * height * 0.14 +
        Math.sin(elapsed * 0.45) * height * 0.06;

      const screenDiag = Math.sqrt(width * width + height * height);
      const baseRadius = screenDiag * 0.38 * Math.max(0.2, Math.min(1.2, blobCoverage));

      // --- 2. SUBTERRANEAN MOVING MAGNETIC POLES ---
      // Pole 1: North Attractor (orbiting around blob center)
      const pole1X = blobCenterX + Math.cos(elapsed * 0.85) * (baseRadius * 0.48);
      const pole1Y = blobCenterY + Math.sin(elapsed * 0.85) * (baseRadius * 0.48);

      // Pole 2: South Vortex Magnet (counter-rotating with tangential twist)
      const pole2X = blobCenterX + Math.sin(elapsed * 1.1) * (baseRadius * 0.58);
      const pole2Y = blobCenterY - Math.cos(elapsed * 1.1) * (baseRadius * 0.4);

      // Pole 3: Central Pulsing Pole
      const pole3X = blobCenterX + Math.cos(elapsed * 0.45) * (baseRadius * 0.2);
      const pole3Y = blobCenterY + Math.sin(elapsed * 0.55) * (baseRadius * 0.2);

      // --- 3. AMBIENT LUMINESCENT CORE GLOW (Underneath Needles) ---
      ctx.save();
      const glowGrad = ctx.createRadialGradient(
        blobCenterX,
        blobCenterY,
        baseRadius * 0.05,
        blobCenterX,
        blobCenterY,
        baseRadius * 0.8,
      );
      glowGrad.addColorStop(0, colorWithAlpha(activeColor, opacity * 0.15));
      glowGrad.addColorStop(0.5, colorWithAlpha(activeColor, opacity * 0.05));
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(blobCenterX, blobCenterY, baseRadius * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- 4. MAGNETIC VECTOR FIELD NEEDLE GRID ---
      const effectiveSpacing = Math.max(16, Math.min(60, gridSpacing));
      const effectiveLength = Math.max(4, Math.min(24, dropletLength));

      const cols = Math.ceil(width / effectiveSpacing) + 2;
      const rows = Math.ceil(height / effectiveSpacing) + 2;
      const offsetX = (width % effectiveSpacing) / 2;
      const offsetY = (height % effectiveSpacing) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * effectiveSpacing + offsetX - effectiveSpacing / 2;
          const y = r * effectiveSpacing + offsetY - effectiveSpacing / 2;

          // Compute angle & distance to morphing blob center
          const dxBlob = x - blobCenterX;
          const dyBlob = y - blobCenterY;
          const distToBlob = Math.sqrt(dxBlob * dxBlob + dyBlob * dyBlob);
          const angleToBlob = Math.atan2(dyBlob, dxBlob);

          // Harmonic Fourier expansion for undulating organic blob perimeter
          const morphFactor =
            1.0 +
            0.16 * Math.sin(3 * angleToBlob + elapsed * 0.8) +
            0.12 * Math.cos(2 * angleToBlob - elapsed * 0.5) +
            0.08 * Math.sin(5 * angleToBlob + elapsed * 1.2) +
            0.05 * Math.cos(4 * angleToBlob - elapsed * 0.9);

          const currentBlobRadius = baseRadius * morphFactor;

          // Feathered falloff at blob perimeter
          const featherDistance = baseRadius * 0.32;
          const delta = currentBlobRadius - distToBlob;

          if (delta <= -featherDistance) {
            continue; // Outside organic boundary
          }

          let blobAlpha = 1.0;
          if (delta < featherDistance) {
            const tNorm = Math.max(0, Math.min(1, (delta + featherDistance) / (featherDistance * 2)));
            blobAlpha = tNorm * tNorm * (3 - 2 * tNorm); // Hermite smoothstep
          }

          if (blobAlpha <= 0.02) continue;

          // --- 5. MAGNETIC FIELD COMPUTATION B(x,y) ---
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

          // Harmonic spatial waves
          const nx = x / (width || 1);
          const ny = y / (height || 1);
          const waveX = Math.cos(elapsed * 1.8 + nx * 4.2 + ny * 2.8) * amplitude * 80;
          const waveY = Math.sin(elapsed * 1.8 + nx * 2.8 - ny * 3.5) * amplitude * 80;

          let netBx = b1X + b2X + b3X + waveX;
          let netBy = b1Y + b2Y + b3Y + waveY;

          // Interactive Cursor High-Intensity Magnetic Dipole
          if (effectiveInteractive && m.influence > 0.01) {
            const dxM = x - m.x;
            const dyM = y - m.y;
            const distM = Math.sqrt(dxM * dxM + dyM * dyM) + 10;
            const mouseRadius = isAbsolute ? 140 : 260;
            if (distM < mouseRadius) {
              const mousePower = (1 - distM / mouseRadius) * 280 * m.influence;
              netBx += (-dyM / distM) * mousePower * 1.2 - (dxM / distM) * mousePower * 0.4;
              netBy += (dxM / distM) * mousePower * 1.2 - (dyM / distM) * mousePower * 0.4;
            }
          }

          // Net angle of needle alignment
          const angle = Math.atan2(netBy, netBx);

          // --- 6. SHARP & COMPACT NEEDLE RENDERING ---
          const halfLen = effectiveLength / 2;
          const x1 = x - Math.cos(angle) * halfLen;
          const y1 = y - Math.sin(angle) * halfLen;
          const x2 = x + Math.cos(angle) * halfLen;
          const y2 = y + Math.sin(angle) * halfLen;

          const currentOpacity = opacity * blobAlpha;

          // Needle stroke gradient from subtle tail to bright head
          const needleGrad = ctx.createLinearGradient(x1, y1, x2, y2);
          needleGrad.addColorStop(0, colorWithAlpha(activeColor, currentOpacity * 0.08));
          needleGrad.addColorStop(0.5, colorWithAlpha(activeColor, currentOpacity * 0.65));
          needleGrad.addColorStop(1, colorWithAlpha(activeColor, currentOpacity));

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = needleGrad;
          ctx.lineWidth = 1.2;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Tiny glowing tip beacon dot
          const tipOpacity = Math.min(1.0, currentOpacity * 1.7);
          ctx.beginPath();
          ctx.arc(x2, y2, 0.9, 0, Math.PI * 2);
          ctx.fillStyle = colorWithAlpha(activeColor, tipOpacity);
          ctx.fill();
        }
      }

      // --- 7. FLOATING SUBTLE PROJECTOR MOTES ---
      for (let i = 0; i < motes.length; i++) {
        const mote = motes[i];
        mote.x += mote.vx;
        mote.y += mote.vy;

        if (mote.x < 0) mote.x = 1;
        if (mote.x > 1) mote.x = 0;
        if (mote.y < 0) mote.y = 1;
        if (mote.y > 1) mote.y = 0;

        const posX = mote.x * width;
        const posY = mote.y * height;
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * mote.pulseSpeed + mote.phase);
        const moteAlpha = opacity * mote.baseAlpha * pulse * 0.7;

        ctx.fillStyle = colorWithAlpha(activeColor, moteAlpha);
        ctx.beginPath();
        ctx.arc(posX, posY, mote.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 8. CENTER CLARITY VIGNETTE (Keeps Content 100% Legible) ---
      if (!isAbsolute) {
        ctx.save();
        const vignetteGrad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.48,
          width * 0.15,
          width * 0.5,
          height * 0.48,
          width * 0.75,
        );
        vignetteGrad.addColorStop(0, 'rgba(4, 10, 23, 0.16)');
        vignetteGrad.addColorStop(0.65, 'rgba(4, 10, 23, 0.05)');
        vignetteGrad.addColorStop(1, 'rgba(4, 10, 23, 0.0)');
        ctx.fillStyle = vignetteGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (effectiveInteractive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [
    activeColor,
    effectiveSpeed,
    amplitude,
    gridSpacing,
    dropletLength,
    blobCoverage,
    opacity,
    effectiveInteractive,
    position,
    className,
  ]);

  const isAbsolute = position === 'absolute' || className.includes('absolute');

  return (
    <div
      ref={containerRef}
      className={`${
        isAbsolute ? 'absolute' : 'fixed'
      } inset-0 w-full h-full pointer-events-none overflow-hidden max-w-full z-0 select-none ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', maxWidth: '100%' }}
        className="block pointer-events-none"
      />
    </div>
  );
};
