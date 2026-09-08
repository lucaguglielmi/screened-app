import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFestivalWatch } from '../useFestivalWatch';

describe('useFestivalWatch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'inactive',
            monitorId: null,
            recentAlerts: [],
          }),
      }),
    );
  });

  it('initializes with inactive watch status', async () => {
    const { result } = renderHook(() =>
      useFestivalWatch({
        investigationId: 'test_inv_123',
        defaultUrl: 'https://genesiscinema.co.uk',
        festivalName: 'Pinco Pallino Film Festival',
      }),
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isWatching).toBe(false);
    expect(result.current.watchAlert).toBeNull();
  });

  it('activates watch on API success', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/watch') && !url.includes('/trigger')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              status: 'active',
              monitorId: 'mon_12345',
              targetUrl: 'https://genesiscinema.co.uk',
            }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    const { result } = renderHook(() =>
      useFestivalWatch({
        investigationId: 'test_inv_123',
        defaultUrl: 'https://genesiscinema.co.uk',
        festivalName: 'Pinco Pallino Film Festival',
      }),
    );

    await act(async () => {
      await result.current.activateWatch();
    });

    expect(result.current.isWatching).toBe(true);
    expect(result.current.watchState.monitorId).toBe('mon_12345');
  });

  it('triggers drift check and sets alert banner', async () => {
    const mockAlert = {
      alertId: 'drift_001',
      alertType: 'FEE_ESCALATION',
      severity: 'CRITICAL',
      festivalName: 'Pinco Pallino Film Festival',
      targetUrl: 'https://genesiscinema.co.uk',
      summary: 'Extended deadline added with +40% fee escalation.',
      delta: '+40% late fee surge',
      timestamp: new Date().toISOString(),
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/watch/trigger')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'triggered', alert: mockAlert }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'active', monitorId: 'mon_12345' }),
      });
    });

    const { result } = renderHook(() =>
      useFestivalWatch({
        investigationId: 'test_inv_123',
        defaultUrl: 'https://genesiscinema.co.uk',
        festivalName: 'Pinco Pallino Film Festival',
      }),
    );

    await act(async () => {
      await result.current.triggerWatch();
    });

    expect(result.current.watchAlert).not.toBeNull();
    expect(result.current.watchAlert?.summary).toContain('Extended deadline added with +40% fee escalation');

    act(() => {
      result.current.dismissAlert();
    });

    expect(result.current.watchAlert).toBeNull();
  });
});
