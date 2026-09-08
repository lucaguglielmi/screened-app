import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../utils/motionTokens';

export interface LivingBackgroundProps {
  color?: string; // Contour stroke color (supports CSS variables, hex, rgb)
  speed?: number; // Drift & morph speed (default: 0.4)
  amplitude?: number; // Organic wave amplitude (default: 0.22)
  gridSpacing?: number; // Echo layer spacing (default: 30)
  dropletLength?: number; // Stroke weight / detail (default: 8)
  blobCoverage?: number; // Scale of the morphing blob (0.3 to 1.0, default: 0.75)
  opacity?: number; // Overall contour opacity (subtle default: 0.20)
  interactive?: boolean; // React to cursor movement (default: true)
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

// Color parsing helper supporting CSS vars, hex (#RGB, #RRGGBB), and rgb/rgba
function parseColorToRgb(colorStr: string): { r: number; g: number; b: number } {
  let resolved = (colorStr || '').trim();

  if (resolved.startsWith('var(')) {
    const varName = resolved.slice(4, -1).trim();
    if (typeof document !== 'undefined') {
      const computed = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      if (computed) {
        resolved = computed;
      }
    }
    if (resolved.startsWith('var(')) {
      if (varName.includes('scout') || varName.includes('diligence')) {
        return { r: 16, g: 229, b: 153 };
      } else if (varName.includes('royal')) {
        return { r: 29, g: 78, b: 216 };
      } else {
        return { r: 59, g: 130, b: 246 };
      }
    }
  }

  if (resolved.startsWith('#')) {
    let hex = resolved.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        return { r, g, b };
      }
    }
  } else if (resolved.startsWith('rgb')) {
    const match = resolved.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0], 10);
      const g = parseInt(match[1], 10);
      const b = parseInt(match[2], 10);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        return { r, g, b };
      }
    }
  }

  return { r: 16, g: 229, b: 153 }; // default scout mint
}

function colorWithAlpha(colorStr: string, alpha: number): string {
  const { r, g, b } = parseColorToRgb(colorStr);
  const clamped = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${clamped.toFixed(3)})`;
}

export const VectorFieldBackground: React.FC<LivingBackgroundProps> = ({
  color,
  speed = 0.4,
  amplitude = 0.22,
  blobCoverage = 0.75,
  opacity = 0.20,
  interactive = true,
  position = 'fixed',
  className = '',
  primaryColor = 'var(--color-tool-scout)',
}) => {
  const reducedMotion = useReducedMotion();
  const effectiveSpeed = reducedMotion ? 0 : speed;
  const effectiveInteractive = reducedMotion ? false : interactive;

  const activeColor = color || primaryColor;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth spring mouse state
  const mouseState = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: false,
    influence: 0,
    targetInfluence: 0,
  });

  const isAbsolute = position === 'absolute' || className.includes('absolute');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Ultra-faint ambient dust motes (cinematic stardust giving depth)
    const motesCount = 12;
    const motes: Mote[] = Array.from({ length: motesCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00006,
      vy: -0.00003 - Math.random() * 0.00003,
      size: 0.8 + Math.random() * 1.2,
      baseAlpha: 0.06 + Math.random() * 0.10,
      pulseSpeed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

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
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (!effectiveInteractive) return;
      if (isAbsolute && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseState.current.targetX = e.clientX - rect.left;
        mouseState.current.targetY = e.clientY - rect.top;
        const inside =
          mouseState.current.targetX >= 0 &&
          mouseState.current.targetX <= rect.width &&
          mouseState.current.targetY >= 0 &&
          mouseState.current.targetY <= rect.height;
        mouseState.current.targetInfluence = inside ? 1.0 : 0.0;
        mouseState.current.active = inside;
      } else {
        mouseState.current.targetX = e.clientX;
        mouseState.current.targetY = e.clientY;
        mouseState.current.targetInfluence = 1.0;
        mouseState.current.active = true;
      }
    };

    const handleMouseLeave = () => {
      mouseState.current.targetInfluence = 0.0;
      mouseState.current.active = false;
    };

    if (effectiveInteractive) {
      if (isAbsolute && containerRef.current) {
        containerRef.current.addEventListener('mousemove', handleMouseMove);
        containerRef.current.addEventListener('mouseleave', handleMouseLeave);
      } else {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
      }
    }

    const startTime = performance.now();

    // Helper to draw a closed smooth curve from radial coordinates
    const drawClosedBlob = (
      points: { x: number; y: number }[],
    ) => {
      if (points.length < 3) return;
      ctx.beginPath();
      const firstMidX = (points[0].x + points[1].x) / 2;
      const firstMidY = (points[0].y + points[1].y) / 2;
      ctx.moveTo(firstMidX, firstMidY);

      const n = points.length;
      for (let i = 1; i <= n; i++) {
        const p1 = points[i % n];
        const p2 = points[(i + 1) % n];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      }
      ctx.closePath();
    };

    // Helper to generate smooth multi-harmonic contour points for a blob
    const generateBlobContour = (
      centerX: number,
      centerY: number,
      radius: number,
      harmonicFn: (theta: number) => number,
      m: { x: number; y: number; influence: number },
    ) => {
      const pointCount = 96;
      const primaryPoints: { x: number; y: number }[] = [];
      const innerPoints: { x: number; y: number }[] = [];
      const outerPoints: { x: number; y: number }[] = [];

      for (let i = 0; i < pointCount; i++) {
        const theta = (i / pointCount) * Math.PI * 2;
        const harmonic = harmonicFn(theta);
        const rScale = 1.0 + amplitude * harmonic;
        const r = radius * rScale;

        let px = centerX + Math.cos(theta) * r;
        let py = centerY + Math.sin(theta) * r;

        // Interactive elastic membrane deflection from cursor
        if (effectiveInteractive && m.influence > 0.02) {
          const dxM = px - m.x;
          const dyM = py - m.y;
          const distM = Math.sqrt(dxM * dxM + dyM * dyM);
          const pushRadius = isAbsolute ? 120 : 180;
          if (distM < pushRadius && distM > 0.1) {
            const pushFactor = Math.pow(1 - distM / pushRadius, 2) * 32 * m.influence;
            px += (dxM / distM) * pushFactor;
            py += (dyM / distM) * pushFactor;
          }
        }

        primaryPoints.push({ x: px, y: py });

        // Inner echo (0.86x scale)
        const innerR = r * 0.86;
        innerPoints.push({
          x: centerX + (px - centerX) * (innerR / r),
          y: centerY + (py - centerY) * (innerR / r),
        });

        // Outer echo (1.14x scale)
        const outerR = r * 1.14;
        outerPoints.push({
          x: centerX + (px - centerX) * (outerR / r),
          y: centerY + (py - centerY) * (outerR / r),
        });
      }

      return { primaryPoints, innerPoints, outerPoints };
    };

    // Helper to render a complete blob contour layer (ambient glow, echoes, primary line)
    const drawBlobLayer = (
      centerX: number,
      centerY: number,
      radius: number,
      points: {
        primaryPoints: { x: number; y: number }[];
        innerPoints: { x: number; y: number }[];
        outerPoints: { x: number; y: number }[];
      },
    ) => {
      // 1. Ambient luminescent core glow
      ctx.save();
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.1,
        centerX,
        centerY,
        radius * 1.25,
      );
      glowGrad.addColorStop(0, colorWithAlpha(activeColor, opacity * 0.12));
      glowGrad.addColorStop(0.5, colorWithAlpha(activeColor, opacity * 0.04));
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Outer Echo Line (Faint dashed blueprint contour)
      ctx.save();
      ctx.setLineDash([4, 10]);
      drawClosedBlob(points.outerPoints);
      ctx.strokeStyle = colorWithAlpha(activeColor, opacity * 0.22);
      ctx.lineWidth = 0.85;
      ctx.stroke();
      ctx.restore();

      // 3. Inner Echo Line (Delicate hairline contour)
      ctx.save();
      drawClosedBlob(points.innerPoints);
      ctx.strokeStyle = colorWithAlpha(activeColor, opacity * 0.30);
      ctx.lineWidth = 0.85;
      ctx.stroke();
      ctx.restore();

      // 4. Primary Flowing Blob Line (Crisp, subtle glowing contour)
      ctx.save();
      drawClosedBlob(points.primaryPoints);
      ctx.strokeStyle = colorWithAlpha(activeColor, opacity * 0.95);
      ctx.lineWidth = 1.25;
      ctx.shadowColor = colorWithAlpha(activeColor, opacity * 0.5);
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.restore();
    };

    const render = (time: number) => {
      if (width === 0 || height === 0) {
        handleResize();
      }

      // If document tab is hidden, pause animation frame computations
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

      // --- 1. DUAL ORGANIC SHAPES IN SEPARATE SCREEN AREAS (OUT-OF-PHASE PULSATION) ---
      const minDim = Math.min(width, height);
      const coverage = Math.max(0.3, Math.min(1.2, blobCoverage));

      // Blob 1: Upper-Left / Mid-Left Screen Area
      const b1CenterX =
        width * (0.30 + Math.sin(elapsed * 0.22 + 0.6) * 0.09 + Math.cos(elapsed * 0.11) * 0.05);
      const b1CenterY =
        height * (0.36 + Math.cos(elapsed * 0.17 + 0.9) * 0.11 + Math.sin(elapsed * 0.26) * 0.04);
      // Independent expansion & contraction: ~13s cycle (frequency 0.48 rad/s)
      const b1Breathe = 1.0 + 0.16 * Math.sin(elapsed * 0.48);
      const b1Radius = minDim * 0.28 * coverage * b1Breathe;

      const blob1Points = generateBlobContour(
        b1CenterX,
        b1CenterY,
        b1Radius,
        (theta) =>
          0.30 * Math.sin(2 * theta + elapsed * 0.38) +
          0.22 * Math.cos(3 * theta - elapsed * 0.26) +
          0.15 * Math.sin(4 * theta + elapsed * 0.19) +
          0.09 * Math.cos(5 * theta - elapsed * 0.13) +
          0.05 * Math.sin(7 * theta + elapsed * 0.09),
        m,
      );
      drawBlobLayer(b1CenterX, b1CenterY, b1Radius, blob1Points);

      // Blob 2: Lower-Right / Mid-Right Screen Area
      const b2CenterX =
        width * (0.70 + Math.cos(elapsed * 0.18 + 1.2) * 0.09 - Math.sin(elapsed * 0.13) * 0.05);
      const b2CenterY =
        height * (0.64 + Math.sin(elapsed * 0.21 + 0.3) * 0.11 - Math.cos(elapsed * 0.24) * 0.04);
      // Independent expansion & contraction: ~19s cycle (frequency 0.33 rad/s) with 2.4 rad phase offset
      const b2Breathe = 1.0 + 0.16 * Math.sin(elapsed * 0.33 + 2.4);
      const b2Radius = minDim * 0.25 * coverage * b2Breathe;

      const blob2Points = generateBlobContour(
        b2CenterX,
        b2CenterY,
        b2Radius,
        (theta) =>
          0.28 * Math.cos(2 * theta - elapsed * 0.32) +
          0.20 * Math.sin(3 * theta + elapsed * 0.24 + 1.2) +
          0.14 * Math.cos(4 * theta - elapsed * 0.17) +
          0.08 * Math.sin(5 * theta + elapsed * 0.11) +
          0.05 * Math.cos(7 * theta - elapsed * 0.08),
        m,
      );
      drawBlobLayer(b2CenterX, b2CenterY, b2Radius, blob2Points);

      // --- 2. FLOATING SUBTLE AMBIENT MOTES (Cinematic Depth) ---
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
        const moteAlpha = opacity * mote.baseAlpha * pulse * 0.8;

        ctx.fillStyle = colorWithAlpha(activeColor, moteAlpha);
        ctx.beginPath();
        ctx.arc(posX, posY, mote.size, 0, Math.PI * 2);
        ctx.fill();
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
    blobCoverage,
    opacity,
    effectiveInteractive,
    position,
    className,
    isAbsolute,
  ]);

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
