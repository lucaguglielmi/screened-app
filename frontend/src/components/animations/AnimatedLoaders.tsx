import React from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../utils/motionTokens';

// ============================================================================
// 1. Neon Cyber Loading Bar
// ============================================================================
export const NeonCyberBar: React.FC<{ progress?: number; color?: string; label?: string }> = ({
  progress,
  color = 'var(--color-midnight-royal)',
  label = 'AI Agent Processing...',
}) => {
  const reducedMotion = useReducedMotion();
  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full bg-indigo-500 ${reducedMotion ? '' : 'animate-ping'}`}
            />
            {label}
          </span>
          {typeof progress === 'number' && <span>{Math.round(progress)}%</span>}
        </div>
      )}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border">
        {typeof progress === 'number' ? (
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 14px ${color}99`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        ) : (
          <motion.div
            className="absolute top-0 bottom-0 w-1/3 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
              boxShadow: `0 0 16px ${color}B3`,
            }}
            animate={reducedMotion ? { x: '0%' } : { x: ['-100%', '350%'] }}
            transition={reducedMotion ? {} : { repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. Multi-Stage Pipeline Stepper Bar
// ============================================================================
export const PipelineStepperBar: React.FC<{ currentStep?: number; steps?: string[] }> = ({
  currentStep = 2,
  steps = [
    'Target Disambiguation',
    'Multi-Source Mining',
    'Contradiction Audit',
    'Dossier Assembly',
  ],
}) => {
  const reducedMotion = useReducedMotion();
  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;
          return (
            <div key={idx} className="space-y-1.5">
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-paper-card dark:bg-darkroom-card">
                {isDone && (
                  <div className="h-full w-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
                {isActive && (
                  <motion.div
                    className="h-full w-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                    animate={reducedMotion ? { opacity: 1 } : { opacity: [0.4, 1, 0.4] }}
                    transition={reducedMotion ? {} : { repeat: Infinity, duration: 1.2 }}
                  />
                )}
              </div>
              <p
                className={`text-[11px] font-mono truncate ${
                  isActive
                    ? 'text-indigo-300 font-semibold'
                    : isDone
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                }`}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 3. Celluloid Film Sprocket Scanner
// ============================================================================
export const FilmSprocketScanner: React.FC<{ label?: string }> = ({
  label = 'Vetting Trade Registry...',
}) => {
  const reducedMotion = useReducedMotion();
  return (
    <div className="relative w-full p-4 rounded-2xl bg-paper-bg dark:bg-darkroom-bg border border-paper-border dark:border-darkroom-border overflow-hidden">
      <div className="flex items-center justify-between mb-3 text-xs font-mono text-amber-400/90">
        <span className="flex items-center gap-2">
          <span className="text-sm">🎞</span> {label}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-300">
          24 FPS SCAN
        </span>
      </div>

      {/* Sprocket track */}
      <div className="relative h-7 flex items-center justify-between px-2 bg-paper-bg dark:bg-darkroom-bg rounded-lg border border-paper-border dark:border-darkroom-border overflow-hidden">
        {/* Sprocket holes */}
        <div className="flex justify-between w-full opacity-40">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="w-2.5 h-3.5 rounded-xs bg-paper-border dark:bg-darkroom-border" />
          ))}
        </div>

        {/* Laser scanner head */}
        <motion.div
          className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent shadow-[0_0_16px_rgba(251,191,36,0.8)]"
          animate={reducedMotion ? { x: '50%' } : { x: ['-20px', '460px'] }}
          transition={reducedMotion ? {} : { repeat: Infinity, duration: 2, ease: 'linear' }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// 4. Quantum Harmonic Pulse Wave
// ============================================================================
export const QuantumWaveLoader: React.FC<{ bars?: number; height?: number }> = ({
  bars = 18,
  height = 36,
}) => {
  const reducedMotion = useReducedMotion();
  return (
    <div className="flex items-center justify-center gap-1.5" style={{ height }}>
      {[...Array(bars)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-indigo-600 via-purple-500 to-rose-400"
          animate={reducedMotion ? { height: '50%' } : { height: ['15%', '95%', '15%'] }}
          transition={
            reducedMotion
              ? {}
              : {
                  repeat: Infinity,
                  duration: 1.1,
                  ease: 'easeInOut',
                  delay: i * 0.06,
                }
          }
        />
      ))}
    </div>
  );
};

// ============================================================================
// 5. Circular Orbital Reactor
// ============================================================================
export const OrbitalReactorLoader: React.FC<{ size?: number; label?: string }> = ({
  size = 64,
  label = 'Synthesizing Evidence Dossier...',
}) => {
  const reducedMotion = useReducedMotion();
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/40"
          animate={reducedMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={reducedMotion ? {} : { repeat: Infinity, duration: 8, ease: 'linear' }}
        />

        {/* Inner Counter Ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-t-indigo-400 border-r-rose-400 border-b-transparent border-l-transparent"
          animate={reducedMotion ? { rotate: 0 } : { rotate: -360 }}
          transition={reducedMotion ? {} : { repeat: Infinity, duration: 2.5, ease: 'linear' }}
        />

        {/* Orbiting Satellite 1 */}
        <motion.div
          className="absolute inset-0 flex items-start justify-center"
          animate={reducedMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={reducedMotion ? {} : { repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <div className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]" />
        </motion.div>

        {/* Orbiting Satellite 2 */}
        <motion.div
          className="absolute inset-0 flex items-end justify-center"
          animate={reducedMotion ? { rotate: 0 } : { rotate: -360 }}
          transition={reducedMotion ? {} : { repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        >
          <div className="size-2 rounded-full bg-rose-400 shadow-[0_0_8px_magenta]" />
        </motion.div>

        {/* Center Glowing Core */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white text-xs font-serif shadow-lg shadow-indigo-600/50">
          🎬
        </div>
      </div>
      {label && (
        <p className={`text-xs font-mono text-slate-400 ${reducedMotion ? '' : 'animate-pulse'}`}>
          {label}
        </p>
      )}
    </div>
  );
};
