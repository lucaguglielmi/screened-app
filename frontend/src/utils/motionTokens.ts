import { useSyncExternalStore } from 'react';

/**
 * Single source of truth for motion constants.
 * Ad-hoc numeric literals for transitions are forbidden by convention.
 */
export const motionTokens = {
  durations: {
    instant: 0,
    fast: 0.18,
    base: 0.28,
    slow: 0.45,
    deliberate: 0.7,
  },
  easings: {
    standard: [0.4, 0, 0.2, 1],
    entrance: [0, 0, 0.2, 1], // decelerate
    exit: [0.4, 0, 1, 1], // accelerate
    spring: { type: 'spring', stiffness: 300, damping: 30 },
  },
  stagger: {
    tight: 0.03,
    base: 0.06,
    loose: 0.12,
  },
} as const;

// Helper hook to detect reduced motion preference
const subscribe = (callback: () => void) => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

const getSnapshot = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const getServerSnapshot = () => {
  return false;
};

export const useReducedMotion = () => {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
