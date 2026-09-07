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
  color: 'var(--color-tool-scout)',
  speed: 0.4,
  amplitude: 0.22,
  gridSpacing: 30,
  dropletLength: 8,
  blobCoverage: 0.75,
  opacity: 0.20,
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
    return {
      ...DEFAULT_VECTOR_FIELD_CONFIG,
      ...parsed,
    };
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
