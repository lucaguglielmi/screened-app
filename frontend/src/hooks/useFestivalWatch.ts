import { useState, useEffect, useCallback } from 'react';
import { FestivalWatchState, WatchAlert } from '../types/investigation';
import { soundEffects } from '../utils/audio';

export interface UseFestivalWatchOptions {
  investigationId?: string;
  defaultUrl?: string;
  festivalName?: string;
}

export function useFestivalWatch({
  investigationId,
  defaultUrl,
  festivalName,
}: UseFestivalWatchOptions) {
  const [watchState, setWatchState] = useState<FestivalWatchState>({
    status: 'inactive',
    monitorId: null,
    targetUrl: defaultUrl || null,
    recentAlerts: [],
  });
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [watchAlert, setWatchAlert] = useState<WatchAlert | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial watch status
  useEffect(() => {
    if (!investigationId) return;
    let isMounted = true;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/investigations/${investigationId}/watch`);
        if (res.ok) {
          const data: FestivalWatchState = await res.json();
          if (isMounted) {
            setWatchState(data);
            if (data.recentAlerts && data.recentAlerts.length > 0) {
              setWatchAlert(data.recentAlerts[0]);
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch festival watch status:', e);
      }
    }

    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, [investigationId]);

  // Activate or toggle watch
  const activateWatch = useCallback(
    async (customUrl?: string) => {
      if (!investigationId) return;
      setLoading(true);
      setError(null);
      const targetUrl = customUrl || defaultUrl || watchState.targetUrl;

      try {
        const res = await fetch(`/api/investigations/${investigationId}/watch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUrl: targetUrl || undefined,
            frequency: 'weekly',
            type: 'snapshot',
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || `Failed to activate watch (${res.status})`);
        }

        const data = await res.json();
        setWatchState((prev) => ({
          ...prev,
          status: 'active',
          monitorId: data.monitorId,
          targetUrl: data.targetUrl || targetUrl,
        }));
        soundEffects.playSuccess();
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error activating watch.';
        setError(msg);
        console.error('Activate watch error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [investigationId, defaultUrl, watchState.targetUrl],
  );

  // Manually trigger monitor check (or simulation for demo)
  const triggerWatch = useCallback(async () => {
    if (!investigationId) return;
    setTriggering(true);
    setError(null);

    try {
      const res = await fetch(`/api/investigations/${investigationId}/watch/trigger`, {
        method: 'POST',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to trigger watch (${res.status})`);
      }

      const data = await res.json();
      if (data.alert) {
        const alertObj: WatchAlert = {
          alertId: data.alert.alertId || `drift_${Date.now()}`,
          alertType: data.alert.alertType || 'FEE_ESCALATION',
          severity: data.alert.severity || 'CRITICAL',
          festivalName: data.alert.festivalName || festivalName || 'Festival',
          targetUrl: data.alert.targetUrl || defaultUrl,
          summary: data.alert.summary || 'Policy drift detected on monitored page.',
          delta: data.alert.delta || '+40% late fee surge',
          timestamp: data.alert.timestamp || new Date().toISOString(),
        };
        setWatchAlert(alertObj);
        soundEffects.playCaution();
        setWatchState((prev) => ({
          ...prev,
          status: 'active',
          recentAlerts: [alertObj, ...(prev.recentAlerts || [])].slice(0, 10),
        }));
      }
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error triggering watch.';
      setError(msg);
      console.error('Trigger watch error:', err);
      throw err;
    } finally {
      setTriggering(false);
    }
  }, [investigationId, festivalName, defaultUrl]);

  const dismissAlert = useCallback(() => {
    setWatchAlert(null);
  }, []);

  return {
    isWatching: watchState.status === 'active',
    watchState,
    loading,
    triggering,
    watchAlert,
    error,
    activateWatch,
    triggerWatch,
    dismissAlert,
  };
}
