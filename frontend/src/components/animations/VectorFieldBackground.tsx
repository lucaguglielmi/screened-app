import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../utils/motionTokens';

export interface LivingBackgroundProps {
  primaryColor?: string; // Shade 1: Deep Midnight Navy (default: '#0a1936')
  secondaryColor?: string; // Shade 2: Abyssal Deep Navy (default: '#040a17')
  accentColor?: string; // Subtle complimentary dark navy (default: '#0d2248')
  speed?: number; // Fluid drift speed (default: 0.35)
  organicScale?: number; // Spread & size of the living fluid membrane (default: 1.0)
  opacity?: number; // Base opacity (default: 0.5)
  interactive?: boolean; // Smooth liquid ripple on mouse move (default: true)
  position?: 'fixed' | 'absolute';
  className?: string;
  // Backward-compatible props for playgrounds
  color?: string;
  amplitude?: number;
  gridSpacing?: number;
  dropletLength?: number;
  blobCoverage?: number;
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
  primaryColor = 'var(--color-midnight-surface)',
  secondaryColor = 'var(--color-midnight-base)',
  accentColor = 'var(--color-midnight-card)',
  speed = 0.35,
  organicScale = 1.0,
  opacity = 0.5,
  interactive = true,
  position = 'fixed',
  className = '',
  // Backward compatibility
  color,
}) => {
  const reducedMotion = useReducedMotion();
  const effectiveSpeed = reducedMotion ? 0 : speed;
  const effectiveInteractive = reducedMotion ? false : interactive;

  const activePrimary = color || primaryColor;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse fluid interaction state with spring physics
  const mouseState = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: false,
    velocity: 0,
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

    // Initialize floating light motes (subtle cold-white / icy blue dust)
    const motesCount = 28;
    const motes: Mote[] = Array.from({ length: motesCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00012,
      vy: (Math.random() - 0.5) * 0.0001 - 0.00006, // gentle upward drift
      size: 0.8 + Math.random() * 1.6,
      baseAlpha: 0.12 + Math.random() * 0.28,
      pulseSpeed: 0.4 + Math.random() * 1.0,
      phase: Math.random() * Math.PI * 2,
    }));

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let lastMouseX = -1000;
    let lastMouseY = -1000;
    let lastMouseTime = performance.now();

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const curX = e.clientX - rect.left;
      const curY = e.clientY - rect.top;
      const now = performance.now();
      const dt = Math.max(1, now - lastMouseTime);

      const dx = curX - lastMouseX;
      const dy = curY - lastMouseY;
      const speedPx = Math.sqrt(dx * dx + dy * dy) / dt;

      mouseState.current.targetX = curX;
      mouseState.current.targetY = curY;
      mouseState.current.velocity = Math.min(speedPx * 12, 180);
      mouseState.current.active = true;
      mouseState.current.targetInfluence = 1.0;

      lastMouseX = curX;
      lastMouseY = curY;
      lastMouseTime = now;
    };

    const handleMouseLeave = () => {
      mouseState.current.targetInfluence = 0.0;
      mouseState.current.active = false;
    };

    if (effectiveInteractive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    const resolveColor = (c: string) => {
      if (c.startsWith('var(')) {
        const match = c.match(/var\((.*?)\)/);
        if (match) {
          const val = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
          if (val) return val;
        }
      }
      return c;
    };

    const colorWithAlpha = (colorStr: string, alpha: number) => {
      const clampedAlpha = Math.max(0, Math.min(1, alpha));
      const resolved = resolveColor(colorStr);
      if (resolved.startsWith('#')) {
        const hex = resolved.replace('#', '');
        let r = 0, g = 0, b = 0;
        if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16);
          g = parseInt(hex[1] + hex[1], 16);
          b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length >= 6) {
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${clampedAlpha.toFixed(3)})`;
      } else if (resolved.startsWith('rgb')) {
        const match = resolved.match(/\d+/g);
        if (match && match.length >= 3) {
          return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${clampedAlpha.toFixed(3)})`;
        }
      }
      return resolved;
    };

    const resolvedPrimary = resolveColor(activePrimary);
    const resolvedSecondary = resolveColor(secondaryColor);
    const resolvedAccent = resolveColor(accentColor);

    const startTime = performance.now();

    const render = (time: number) => {
      if (width === 0 || height === 0) {
        handleResize();
      }

      const elapsed = ((time - startTime) / 1000) * effectiveSpeed;

      // Smooth spring interpolation for mouse interaction
      const m = mouseState.current;
      m.x += (m.targetX - m.x) * 0.06;
      m.y += (m.targetY - m.y) * 0.06;
      m.influence += (m.targetInfluence - m.influence) * 0.04;
      m.velocity *= 0.94; // decay

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      const diag = Math.sqrt(width * width + height * height);
      const baseScale = diag * 0.48 * organicScale;

      // --- 1. DEFINING ORGANIC LIVING NODES (Harmonic Dark Blue Fluid Bodies) ---
      // Node 1: Primary Dark Blue Core (Breathing & drifting in Lissajous curve)
      const n1X =
        width * 0.52 +
        Math.sin(elapsed * 0.35) * width * 0.18 +
        Math.cos(elapsed * 0.22) * width * 0.08;
      const n1Y =
        height * 0.44 +
        Math.cos(elapsed * 0.28) * height * 0.15 +
        Math.sin(elapsed * 0.48) * height * 0.06;
      const n1R = baseScale * (0.85 + Math.sin(elapsed * 0.55) * 0.12);

      // Node 2: Abyssal Dark Navy Ambient Swell (Counter-orbiting bottom left)
      const n2X = width * 0.32 + Math.cos(elapsed * 0.42 + 1.2) * width * 0.16;
      const n2Y = height * 0.62 + Math.sin(elapsed * 0.38 + 0.8) * height * 0.14;
      const n2R = baseScale * (1.1 + Math.cos(elapsed * 0.45) * 0.15);

      // Node 3: Complimentary Dark Blue Glow (Top right)
      const n3X = width * 0.68 + Math.sin(elapsed * 0.52 + 2.4) * width * 0.14;
      const n3Y = height * 0.32 + Math.cos(elapsed * 0.48 + 1.8) * height * 0.12;
      const n3R = baseScale * (0.65 + Math.sin(elapsed * 0.62) * 0.1);

      // Node 4: Secondary Dark Navy Tendril (Floating harmonic wave)
      const n4X = width * 0.45 + Math.cos(elapsed * 0.25 + 3.1) * width * 0.22;
      const n4Y = height * 0.56 + Math.sin(elapsed * 0.32 + 2.2) * height * 0.18;
      const n4R = baseScale * (0.9 + Math.cos(elapsed * 0.38) * 0.14);

      // --- 2. MOUSE FLUID DEFLECTION ---
      let mouseDisplaceX1 = 0;
      let mouseDisplaceY1 = 0;
      let mouseRippleGlow = 0;

      if (effectiveInteractive && m.influence > 0.01) {
        const dx = m.x - n1X;
        const dy = m.y - n1Y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = diag * 0.45;
        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * m.influence;
          mouseDisplaceX1 = (-dx / (dist || 1)) * force * 45;
          mouseDisplaceY1 = (-dy / (dist || 1)) * force * 45;
          mouseRippleGlow = force * 0.18;
        }
      }

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // --- 3. LAYER 1: DEEP ABYSSAL NAVY AMBIENCE (Background Foundation) ---
      const gradIndigo = ctx.createRadialGradient(n2X, n2Y, n2R * 0.08, n2X, n2Y, n2R);
      gradIndigo.addColorStop(0, colorWithAlpha(resolvedSecondary, opacity * 0.8));
      gradIndigo.addColorStop(0.45, colorWithAlpha(resolvedSecondary, opacity * 0.4));
      gradIndigo.addColorStop(0.85, colorWithAlpha(resolvedSecondary, opacity * 0.1));
      gradIndigo.addColorStop(1, 'transparent');

      ctx.fillStyle = gradIndigo;
      ctx.beginPath();
      ctx.arc(n2X, n2Y, n2R, 0, Math.PI * 2);
      ctx.fill();

      // --- 4. LAYER 2: SECONDARY DARK NAVY HARMONIC WAVE (Node 4) ---
      const gradNode4 = ctx.createRadialGradient(n4X, n4Y, n4R * 0.05, n4X, n4Y, n4R);
      const node4Alpha = opacity * 0.5;
      gradNode4.addColorStop(0, colorWithAlpha(resolvedSecondary, node4Alpha));
      gradNode4.addColorStop(0.5, colorWithAlpha(resolvedPrimary, node4Alpha * 0.4));
      gradNode4.addColorStop(1, 'transparent');

      ctx.fillStyle = gradNode4;
      ctx.beginPath();
      ctx.arc(n4X, n4Y, n4R, 0, Math.PI * 2);
      ctx.fill();

      // --- 5. LAYER 3: PRIMARY MIDNIGHT NAVY MEMBRANE (The Living Body) ---
      const coreX = n1X + mouseDisplaceX1;
      const coreY = n1Y + mouseDisplaceY1;
      const coreR = n1R;

      const gradRuby = ctx.createRadialGradient(coreX, coreY, coreR * 0.05, coreX, coreY, coreR);
      const primaryAlpha = Math.min(1.0, opacity * (0.9 + mouseRippleGlow));
      gradRuby.addColorStop(0, colorWithAlpha(resolvedPrimary, primaryAlpha));
      gradRuby.addColorStop(0.35, colorWithAlpha(resolvedPrimary, primaryAlpha * 0.6));
      gradRuby.addColorStop(0.7, colorWithAlpha(resolvedPrimary, primaryAlpha * 0.2));
      gradRuby.addColorStop(1, 'transparent');

      ctx.fillStyle = gradRuby;
      ctx.beginPath();
      ctx.arc(coreX, coreY, coreR, 0, Math.PI * 2);
      ctx.fill();

      // --- 6. LAYER 4: COMPLIMENTARY DARK BLUE AMBIENT EMBER ---
      const gradAmber = ctx.createRadialGradient(n3X, n3Y, n3R * 0.05, n3X, n3Y, n3R);
      const accentAlpha = opacity * 0.6;
      gradAmber.addColorStop(0, colorWithAlpha(resolvedAccent, accentAlpha));
      gradAmber.addColorStop(0.4, colorWithAlpha(resolvedAccent, accentAlpha * 0.35));
      gradAmber.addColorStop(0.8, colorWithAlpha(resolvedAccent, accentAlpha * 0.08));
      gradAmber.addColorStop(1, 'transparent');

      ctx.fillStyle = gradAmber;
      ctx.beginPath();
      ctx.arc(n3X, n3Y, n3R, 0, Math.PI * 2);
      ctx.fill();

      // --- 7. LAYER 5: MORPHING ORGANIC CONTOUR WAVE (Smooth Dark Blue Ribbons) ---
      ctx.globalCompositeOperation = 'lighter';
      const contourAlpha = opacity * 0.3;
      ctx.strokeStyle = colorWithAlpha(resolvedPrimary, contourAlpha);
      ctx.lineWidth = 1.5;

      const pointsCount = 12;
      const contourPoints: { x: number; y: number }[] = [];
      const contourBaseRadius = coreR * 0.62;

      for (let i = 0; i < pointsCount; i++) {
        const theta = (i / pointsCount) * Math.PI * 2;
        const harmonic =
          Math.sin(theta * 3 + elapsed * 1.2) * 0.14 +
          Math.cos(theta * 2 - elapsed * 0.8) * 0.1 +
          Math.sin(theta * 5 + elapsed * 1.6) * 0.06;

        const rCurrent = contourBaseRadius * (1.0 + harmonic);
        contourPoints.push({
          x: coreX + Math.cos(theta) * rCurrent,
          y: coreY + Math.sin(theta) * rCurrent,
        });
      }

      ctx.beginPath();
      for (let i = 0; i < pointsCount; i++) {
        const p0 = contourPoints[i];
        const p1 = contourPoints[(i + 1) % pointsCount];
        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;
        if (i === 0) {
          ctx.moveTo(midX, midY);
        } else {
          ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
        }
      }
      ctx.closePath();
      ctx.stroke();

      // --- 8. LAYER 6: FLOATING SUBTLE PROJECTOR MOTES ---
      for (let i = 0; i < motes.length; i++) {
        const mote = motes[i];
        mote.x += mote.vx;
        mote.y += mote.vy;

        // Wrap around screen bounds
        if (mote.x < 0) mote.x = 1;
        if (mote.x > 1) mote.x = 0;
        if (mote.y < 0) mote.y = 1;
        if (mote.y > 1) mote.y = 0;

        const posX = mote.x * width;
        const posY = mote.y * height;

        // Pulsing luminance
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * mote.pulseSpeed + mote.phase);
        const moteAlpha = opacity * mote.baseAlpha * pulse * 0.65;

        ctx.fillStyle = `rgba(200, 225, 255, ${moteAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(posX, posY, mote.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 9. LAYER 7: INTERACTIVE CURSOR LUMINESCENT HALO ---
      if (effectiveInteractive && m.active && m.influence > 0.02) {
        const mouseGlowRadius = 160 + m.velocity * 0.4;
        const mouseGrad = ctx.createRadialGradient(m.x, m.y, 4, m.x, m.y, mouseGlowRadius);
        const cursorAlpha = opacity * 0.45 * m.influence;
        mouseGrad.addColorStop(0, colorWithAlpha(resolvedPrimary, cursorAlpha));
        mouseGrad.addColorStop(0.5, colorWithAlpha(resolvedSecondary, cursorAlpha * 0.4));
        mouseGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = mouseGrad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, mouseGlowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // --- 10. CENTER CLARITY MASK (Gentle Vignette in Deep Midnight Tone) ---
      ctx.save();
      const vignetteGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.48,
        width * 0.2,
        width * 0.5,
        height * 0.48,
        width * 0.7,
      );
      vignetteGrad.addColorStop(0, 'rgba(4, 10, 23, 0.18)');
      vignetteGrad.addColorStop(0.65, 'rgba(4, 10, 23, 0.05)');
      vignetteGrad.addColorStop(1, 'rgba(4, 10, 23, 0.0)');
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

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
    activePrimary,
    secondaryColor,
    accentColor,
    effectiveSpeed,
    organicScale,
    opacity,
    effectiveInteractive,
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
