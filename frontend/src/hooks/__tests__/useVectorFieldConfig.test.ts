import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVectorFieldConfig, DEFAULT_VECTOR_FIELD_CONFIG } from '../useVectorFieldConfig';

describe('useVectorFieldConfig', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default vector field configuration', () => {
    const { result } = renderHook(() => useVectorFieldConfig());
    expect(result.current.config.color).toBe(DEFAULT_VECTOR_FIELD_CONFIG.color);
    expect(result.current.config.speed).toBe(DEFAULT_VECTOR_FIELD_CONFIG.speed);
    expect(result.current.config.gridSpacing).toBe(DEFAULT_VECTOR_FIELD_CONFIG.gridSpacing);
    expect(result.current.config.dropletLength).toBe(DEFAULT_VECTOR_FIELD_CONFIG.dropletLength);
    expect(result.current.config.blobCoverage).toBe(DEFAULT_VECTOR_FIELD_CONFIG.blobCoverage);
    expect(result.current.config.enabledOnChat).toBe(true);
  });

  it('updates configuration and persists to localStorage', () => {
    const { result } = renderHook(() => useVectorFieldConfig());

    act(() => {
      result.current.updateConfig({
        color: 'var(--color-midnight-royal)',
        speed: 1.2,
        gridSpacing: 38,
      });
    });

    expect(result.current.config.color).toBe('var(--color-midnight-royal)');
    expect(result.current.config.speed).toBe(1.2);
    expect(result.current.config.gridSpacing).toBe(38);

    const stored = JSON.parse(localStorage.getItem('screened_vector_field_config_v1') || '{}');
    expect(stored.color).toBe('var(--color-midnight-royal)');
    expect(stored.speed).toBe(1.2);
    expect(stored.gridSpacing).toBe(38);
  });

  it('resets configuration back to defaults', () => {
    const { result } = renderHook(() => useVectorFieldConfig());

    act(() => {
      result.current.updateConfig({
        color: 'var(--color-royal-violet)',
        speed: 2.0,
      });
    });
    expect(result.current.config.speed).toBe(2.0);

    act(() => {
      result.current.resetConfig();
    });

    expect(result.current.config.color).toBe(DEFAULT_VECTOR_FIELD_CONFIG.color);
    expect(result.current.config.speed).toBe(DEFAULT_VECTOR_FIELD_CONFIG.speed);
  });
});
