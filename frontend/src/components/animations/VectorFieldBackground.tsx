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
// Color parsing helper supporting CSS vars, hex (#RGB, #RRGGBB), and rgb/rgba
function parseColorToRgb(colorStr: string): { r: number; g: number; b: number } {
  const resolved = (colorStr || '').trim();

  // If a legacy green color is passed, replace it with subtle light ice slate
  if (
    resolved.includes('scout') ||
    resolved.includes('diligence') ||
    resolved.toLowerCase().includes('10e599') ||
    resolved.toLowerCase().includes('34d399')
  ) {
    return { r: 203, g: 213, b: 225 }; // soft light ice slate (NOT green)
  }

  if (resolved.startsWith('var(')) {
    const varName = resolved.slice(4, -1).trim();
    if (typeof document !== 'undefined') {
      const computed = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      if (computed) {
        return parseColorToRgb(computed);
      }
    }
    if (varName.includes('mist') || varName.includes('muted')) {
      return { r: 148, g: 163, b: 184 }; // soft light mist
    } else if (varName.includes('sky')) {
      return { r: 191, g: 219, b: 254 }; // soft ice sky
    } else if (varName.includes('royal') || varName.includes('indigo')) {
      return { r: 147, g: 197, b: 253 }; // soft light blue
    } else {
      return { r: 203, g: 213, b: 225 }; // soft light ice slate
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

  return { r: 203, g: 213, b: 225 }; // default soft light ice slate (neutral, slightly lighter than dark background)
}

function colorWithAlpha(colorStr: string, alpha: number): string {
  const { r, g, b } = parseColorToRgb(colorStr);
  const clamped = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${clamped.toFixed(3)})`;
}

export const VectorFieldBackground: React.FC<LivingBackgroundProps> = ({
  color = 'var(--color-contour-ice)',
  speed = 0.55,
  amplitude = 0.24,
  blobCoverage = 0.70,
  opacity = 0.08,
  interactive = true,
  position = 'fixed',
  className = '',
  primaryColor = 'var(--color-contour-ice)',
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

    // Traumatic non-linear pulse function (sharp contrast between rapid snap and expansion)
    const traumaticWave = (phase: number) => {
      const sinVal = Math.sin(phase);
      // Power shaping creates a rapid snap through zero and sudden cresting
      const shaped = Math.sign(sinVal) * Math.pow(Math.abs(sinVal), 0.62);
      // Second harmonic adds asymmetric acceleration surge
      return shaped * 0.85 + Math.sin(2 * phase) * 0.25;
    };

    // Helper to generate smooth multi-harmonic contour points for a blob layer
    const generateContourPoints = (
      cx: number,
      cy: number,
      r: number,
      rotationAngle: number,
      harmonicFn: (rotatedTheta: number) => number,
      m: { x: number; y: number; influence: number },
    ) => {
      const pointCount = 96;
      const points: { x: number; y: number }[] = [];

      for (let i = 0; i < pointCount; i++) {
        const theta = (i / pointCount) * Math.PI * 2;
        const rotatedTheta = theta + rotationAngle;
        const harmonic = harmonicFn(rotatedTheta);
        const currentR = r * (1.0 + amplitude * harmonic);

        let px = cx + Math.cos(theta) * currentR;
        let py = cy + Math.sin(theta) * currentR;

        // Interactive elastic membrane deflection from cursor
        if (effectiveInteractive && m.influence > 0.02) {
          const dxM = px - m.x;
          const dyM = py - m.y;
          const distM = Math.sqrt(dxM * dxM + dyM * dyM);
          const pushRadius = isAbsolute ? 110 : 160;
          if (distM < pushRadius && distM > 0.1) {
            const pushFactor = Math.pow(1 - distM / pushRadius, 2) * 28 * m.influence;
            px += (dxM / distM) * pushFactor;
            py += (dyM / distM) * pushFactor;
          }
        }

        points.push({ x: px, y: py });
      }

      return points;
    };

    // Helper to render a complete dual-layer blob system (ambient glow, outer echo, outer contour, inside rotating contour)
    const drawBlobSystem = (
      cx: number,
      cy: number,
      outerRadius: number,
      outerPoints: { x: number; y: number }[],
      innerPoints: { x: number; y: number }[],
    ) => {
      // 1. Ambient luminescent core glow (ultra subtle)
      ctx.save();
      const glowGrad = ctx.createRadialGradient(
        cx,
        cy,
        outerRadius * 0.1,
        cx,
        cy,
        outerRadius * 1.25,
      );
      glowGrad.addColorStop(0, colorWithAlpha(activeColor, opacity * 0.08));
      glowGrad.addColorStop(0.55, colorWithAlpha(activeColor, opacity * 0.02));
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius * 1.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Faint dashed outer echo line (blueprint depth)
      ctx.save();
      ctx.setLineDash([3, 9]);
      const echoPoints = outerPoints.map((p) => ({
        x: cx + (p.x - cx) * 1.15,
        y: cy + (p.y - cy) * 1.15,
      }));
      drawClosedBlob(echoPoints);
      ctx.strokeStyle = colorWithAlpha(activeColor, opacity * 0.20);
      ctx.lineWidth = 0.75;
      ctx.stroke();
      ctx.restore();

      // 3. Primary outer blob contour line (subtle glowing contour)
      ctx.save();
      drawClosedBlob(outerPoints);
      ctx.strokeStyle = colorWithAlpha(activeColor, opacity * 0.70);
      ctx.lineWidth = 1.05;
      ctx.shadowColor = colorWithAlpha(activeColor, opacity * 0.35);
      ctx.shadowBlur = 4;
      ctx.stroke();
      ctx.restore();

      // 4. Inside blob shape contour line (asynchronous & rotating on same axis at different speed)
      ctx.save();
      drawClosedBlob(innerPoints);
      ctx.strokeStyle = colorWithAlpha(activeColor, opacity * 0.45);
      ctx.lineWidth = 0.85;
      ctx.shadowColor = colorWithAlpha(activeColor, opacity * 0.20);
      ctx.shadowBlur = 3;
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

      // --- 1. DUAL ASYNCHRONOUS ORGANIC BLOB SYSTEMS ---
      const minDim = Math.min(width, height);
      const coverage = Math.max(0.3, Math.min(1.2, blobCoverage));

      // ----------------- BLOB 1 (Upper-Left / Mid-Left) -----------------
      const b1CenterX =
        width * (0.30 + Math.sin(elapsed * 0.24 + 0.6) * 0.09 + Math.cos(elapsed * 0.12) * 0.05);
      const b1CenterY =
        height * (0.36 + Math.cos(elapsed * 0.19 + 0.9) * 0.11 + Math.sin(elapsed * 0.28) * 0.04);

      // Outer Blob 1: Traumatic, faster expansion/contraction (~6.8s period, w = 0.92 rad/s)
      const b1OuterPhase = elapsed * 0.92;
      const b1OuterBreathe = 1.0 + 0.26 * traumaticWave(b1OuterPhase);
      const b1OuterRadius = minDim * 0.28 * coverage * b1OuterBreathe;
      const b1OuterRotation = elapsed * 0.12;

      // Inside Blob 1: Asynchronous pulsation (~5.4s period, w = 1.16 rad/s) + counter-rotating on same axis at -0.34 rad/s
      const b1InnerPhase = elapsed * 1.16 + 1.5;
      const b1InnerBreathe = 1.0 + 0.22 * traumaticWave(b1InnerPhase);
      const b1InnerRadius = b1OuterRadius * 0.62 * (b1InnerBreathe / b1OuterBreathe);
      const b1InnerRotation = elapsed * -0.34;

      const b1OuterPoints = generateContourPoints(
        b1CenterX,
        b1CenterY,
        b1OuterRadius,
        b1OuterRotation,
        (th) =>
          0.30 * Math.sin(2 * th + elapsed * 0.38) +
          0.22 * Math.cos(3 * th - elapsed * 0.26) +
          0.15 * Math.sin(4 * th + elapsed * 0.19) +
          0.09 * Math.cos(5 * th - elapsed * 0.13) +
          0.05 * Math.sin(7 * th + elapsed * 0.09),
        m,
      );

      const b1InnerPoints = generateContourPoints(
        b1CenterX,
        b1CenterY,
        b1InnerRadius,
        b1InnerRotation,
        (th) =>
          0.26 * Math.cos(2 * th - elapsed * 0.42) +
          0.18 * Math.sin(3 * th + elapsed * 0.31 + 1.1) +
          0.12 * Math.cos(4 * th - elapsed * 0.21) +
          0.07 * Math.sin(5 * th + elapsed * 0.14),
        m,
      );

      drawBlobSystem(b1CenterX, b1CenterY, b1OuterRadius, b1OuterPoints, b1InnerPoints);

      // ----------------- BLOB 2 (Lower-Right / Mid-Right) -----------------
      const b2CenterX =
        width * (0.70 + Math.cos(elapsed * 0.20 + 1.2) * 0.09 - Math.sin(elapsed * 0.14) * 0.05);
      const b2CenterY =
        height * (0.64 + Math.sin(elapsed * 0.23 + 0.3) * 0.11 - Math.cos(elapsed * 0.26) * 0.04);

      // Outer Blob 2: Traumatic, faster expansion/contraction (~8.7s period, w = 0.72 rad/s) with out-of-phase offset (+2.8 rad)
      const b2OuterPhase = elapsed * 0.72 + 2.8;
      const b2OuterBreathe = 1.0 + 0.26 * traumaticWave(b2OuterPhase);
      const b2OuterRadius = minDim * 0.25 * coverage * b2OuterBreathe;
      const b2OuterRotation = elapsed * -0.10;

      // Inside Blob 2: Asynchronous pulsation (~6.5s period, w = 0.96 rad/s) + clockwise rotating on same axis at +0.36 rad/s
      const b2InnerPhase = elapsed * 0.96 + 4.2;
      const b2InnerBreathe = 1.0 + 0.22 * traumaticWave(b2InnerPhase);
      const b2InnerRadius = b2OuterRadius * 0.60 * (b2InnerBreathe / b2OuterBreathe);
      const b2InnerRotation = elapsed * 0.36;

      const b2OuterPoints = generateContourPoints(
        b2CenterX,
        b2CenterY,
        b2OuterRadius,
        b2OuterRotation,
        (th) =>
          0.28 * Math.cos(2 * th - elapsed * 0.32) +
          0.20 * Math.sin(3 * th + elapsed * 0.24 + 1.2) +
          0.14 * Math.cos(4 * th - elapsed * 0.17) +
          0.08 * Math.sin(5 * th + elapsed * 0.11) +
          0.05 * Math.cos(7 * th - elapsed * 0.08),
        m,
      );

      const b2InnerPoints = generateContourPoints(
        b2CenterX,
        b2CenterY,
        b2InnerRadius,
        b2InnerRotation,
        (th) =>
          0.25 * Math.sin(2 * th + elapsed * 0.44 + 0.8) +
          0.19 * Math.cos(3 * th - elapsed * 0.29) +
          0.13 * Math.sin(4 * th + elapsed * 0.22) +
          0.07 * Math.cos(5 * th - elapsed * 0.15),
        m,
      );

      drawBlobSystem(b2CenterX, b2CenterY, b2OuterRadius, b2OuterPoints, b2InnerPoints);

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
        const moteAlpha = opacity * mote.baseAlpha * pulse * 0.4;

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
