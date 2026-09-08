import { useState, useEffect, useCallback } from 'react';

export interface VectorFieldConfig {
  color: string;
  speed: number;
  amplitude: number;
  gridSpacing: number;
  dropletLength: number;
  blobCoverage: number;
  opacity: number;
  enabledOnChat: boolean;
}

export const DEFAULT_VECTOR_FIELD_CONFIG: VectorFieldConfig = {
  color: 'var(--color-contour-ice)',
  speed: 0.55,
  amplitude: 0.24,
  gridSpacing: 30,
  dropletLength: 8,
  blobCoverage: 0.70,
  opacity: 0.08,
  enabledOnChat: true,
};

const STORAGE_KEY = 'screened_vector_field_config_v2';
const SYNC_EVENT = 'screened_vector_field_sync';

function readStoredConfig(): VectorFieldConfig {
  if (typeof window === 'undefined') return DEFAULT_VECTOR_FIELD_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VECTOR_FIELD_CONFIG;
    const parsed = JSON.parse(raw);
    const result = {
      ...DEFAULT_VECTOR_FIELD_CONFIG,
      ...parsed,
    };
    // Migrate legacy green default to light subtle slate
    if (
      result.color.includes('scout') ||
      result.color.includes('diligence') ||
      result.color.includes('10E599')
    ) {
      result.color = DEFAULT_VECTOR_FIELD_CONFIG.color;
    }
    // Migrate legacy high opacity
    if (result.opacity > 0.15) {
      result.opacity = DEFAULT_VECTOR_FIELD_CONFIG.opacity;
    }
    return result;
  } catch {
    return DEFAULT_VECTOR_FIELD_CONFIG;
  }
}

export function useVectorFieldConfig() {
  const [config, setConfig] = useState<VectorFieldConfig>(readStoredConfig);

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<VectorFieldConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      } else {
        setConfig(readStoredConfig());
      }
    };

    window.addEventListener(SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const updateConfig = useCallback((partial: Partial<VectorFieldConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors (quota / private browsing)
      }
      window.dispatchEvent(new CustomEvent<VectorFieldConfig>(SYNC_EVENT, { detail: updated }));
      return updated;
    });
  }, []);

  const resetConfig = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setConfig(DEFAULT_VECTOR_FIELD_CONFIG);
    window.dispatchEvent(
      new CustomEvent<VectorFieldConfig>(SYNC_EVENT, { detail: DEFAULT_VECTOR_FIELD_CONFIG }),
    );
  }, []);

  return {
    config,
    updateConfig,
    resetConfig,
  };
}
