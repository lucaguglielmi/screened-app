import { useState, useEffect, useCallback, useRef } from 'react';
import { CandidateEntity, Investigation } from '../types/investigation';
import { track } from '../utils/analytics';
import { piiVault } from '../utils/pii';

import { parseCurrentRoute } from '../router/Router';

export type InvestigationEntryPoint =
  | 'search_form'
  | 'starter_chip'
  | 'command_palette'
  | 'chat_deep_screen'
  | 'scout_deep_screen'
  | 'command_palette_deep_screen'
  | 'grant_scout_deep_screen';

export interface RateLimitDetail {
  endpoint: string;
  retryAfterSeconds: number;
  message: string;
  correlationId: string;
}

export async function handleScreenedApiResponse<T>(res: Response): Promise<T> {
  if (res.status === 429) {
    const retryAfterHeader = res.headers.get('Retry-After');
    const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 30;
    const errData = await res.json().catch(() => ({}));
    const message =
      errData.detail ||
      'Screened research capacity reached. Server is queuing analysis to protect registry quotas.';
    const correlationId =
      res.headers.get('X-Correlation-ID') || errData.correlationId || 'unknown';

    window.dispatchEvent(
      new CustomEvent<RateLimitDetail>('screened:rate-limit-exceeded', {
        detail: {
          endpoint: res.url,
          retryAfterSeconds: retryAfter,
          message,
          correlationId,
        },
      })
    );
    throw new Error(message);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Server error (${res.status})`);
  }

  return res.json();
}

export function useInvestigation() {
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeInvestigationIdRef = useRef<string | null>(null);
  const lastSseHeartbeatRef = useRef<number>(0);

  useEffect(() => {
    const onHeartbeat = () => {
      lastSseHeartbeatRef.current = Date.now();
    };
    window.addEventListener('screened:sse-heartbeat', onHeartbeat);
    return () => {
      window.removeEventListener('screened:sse-heartbeat', onHeartbeat);
    };
  }, []);

  useEffect(() => {
    activeInvestigationIdRef.current = investigation?.id || null;
  }, [investigation?.id]);

  const [hasPastSearches, setHasPastSearches] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('screened_investigation_ids');
      if (!saved) return false;
      const ids: string[] = JSON.parse(saved);
      return Array.isArray(ids) && ids.length > 0;
    } catch {
      return false;
    }
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('screened_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const updated = [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 5);
      localStorage.setItem('screened_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const saveRecentInvestigation = useCallback((id: string) => {
    try {
      const saved = localStorage.getItem('screened_investigation_ids');
      const prevIds: string[] = saved ? JSON.parse(saved) : [];
      if (!prevIds.includes(id)) {
        const updated = [id, ...prevIds].slice(0, 20);
        localStorage.setItem('screened_investigation_ids', JSON.stringify(updated));
        setHasPastSearches(true);
      } else if (prevIds.length > 0) {
        setHasPastSearches(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchInvestigation = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/investigations/${id}`);
        const data = await handleScreenedApiResponse<Investigation>(res);
        setInvestigation(data);
        saveRecentInvestigation(data.id);
        if (data.confirmedEntity?.name) {
          saveRecentSearch(data.confirmedEntity.name);
        }
      } catch (e) {
        console.error('Failed to fetch investigation:', e);
      }
    },
    [saveRecentInvestigation, saveRecentSearch],
  );

  // Hydrate investigation from route (/diligence/:id or normalized legacy ?id=...)
  useEffect(() => {
    let isMounted = true;
    const loadInitialInvestigation = async () => {
      try {
        const route = parseCurrentRoute();
        const initialId = route.investigationId;

        if (initialId && isMounted) {
          const res = await fetch(`/api/investigations/${initialId}`);
          if (res.ok && isMounted) {
            const data: Investigation = await res.json();
            setInvestigation(data);
            saveRecentInvestigation(data.id);
            if (data.confirmedEntity?.name) {
              saveRecentSearch(data.confirmedEntity.name);
            }
          }
        }
      } catch (e) {
        console.error('Failed to parse URL investigation param:', e);
      }
    };

    loadInitialInvestigation();

    return () => {
      isMounted = false;
    };
  }, [saveRecentInvestigation, saveRecentSearch]);

  // Handle browser back / forward navigation and custom navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const route = parseCurrentRoute();
      if (route.investigationId) {
        if (activeInvestigationIdRef.current !== route.investigationId) {
          fetchInvestigation(route.investigationId);
        }
      } else {
        activeInvestigationIdRef.current = null;
        setInvestigation(null);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('screened:navigate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('screened:navigate', handleLocationChange);
    };
  }, [fetchInvestigation]);

  // Heartbeat-aware fallback polling while investigation is active
  useEffect(() => {
    if (!investigation?.id) return;
    const invId = investigation.id;

    // Do not poll for the demo mode, since it relies entirely on the 18s SSE stream
    if (invId === 'demo_pinco_pallino') return;

    const isActiveStatus = (st?: string) =>
      st &&
      [
        'DISAMBIGUATING',
        'PLANNING',
        'RESEARCHING',
        'ANALYZING_CONTRADICTIONS',
        'ASSEMBLING_DOSSIER',
      ].includes(st);

    const pollInterval = setInterval(() => {
      if (isActiveStatus(investigation?.status)) {
        // Heartbeat-aware lazy polling: Skip polling if active SSE message received <15s ago
        const timeSinceHeartbeat = Date.now() - lastSseHeartbeatRef.current;
        if (timeSinceHeartbeat < 15000 && lastSseHeartbeatRef.current > 0) {
          return;
        }
        fetchInvestigation(invId);
      }
    }, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [investigation?.id, investigation?.status, fetchInvestigation]);

  // Re-poll on tab focus / visibility change
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (
        document.visibilityState === 'visible' &&
        investigation?.id &&
        investigation.id !== 'demo_pinco_pallino' &&
        investigation.status !== 'READY'
      ) {
        fetchInvestigation(investigation.id);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [fetchInvestigation, investigation?.id, investigation?.status]);

  const startInvestigation = async (
    subjectQuery: string,
    entryPoint: InvestigationEntryPoint,
    optionalUrl = '',
  ) => {
    if (!subjectQuery.trim()) return;
    setLoading(true);
    setError(null);
    saveRecentSearch(subjectQuery.trim());

    if (entryPoint.endsWith('_deep_screen')) {
      const sourceTool = entryPoint.replace('_deep_screen', '') as 'chat' | 'scout' | 'command_palette' | 'grant_scout';
      track('deep_screen_launched', {
        source_tool: sourceTool,
        query_length: subjectQuery.trim().length,
        target_provided: !!subjectQuery.trim(),
      });
    } else {
      track('investigation_started', {
        entry_point: entryPoint as 'search_form' | 'starter_chip' | 'command_palette',
        query_length: subjectQuery.trim().length,
        has_optional_url: !!optionalUrl.trim(),
      });
    }

    try {
      const res = await fetch('/api/investigations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: piiVault.mask(subjectQuery.trim()),
          optionalUrl: optionalUrl.trim() || undefined,
          intent: 'Vet before submitting',
        }),
      });

      const rawInv = await handleScreenedApiResponse<Investigation>(res);
      const invString = JSON.stringify(rawInv);
      const unmaskedInvString = piiVault.unmask(invString);
      const inv: Investigation = JSON.parse(unmaskedInvString);
      activeInvestigationIdRef.current = inv.id;
      setInvestigation(inv);
      saveRecentInvestigation(inv.id);
      return inv;
    } catch (err) {
      console.error('Failed to initiate investigation:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate investigation.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmEntity = async (entity: CandidateEntity) => {
    if (!investigation) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/investigations/${investigation.id}/confirm-entity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entity),
      });

      const updatedInv = await handleScreenedApiResponse<Investigation>(res);
      if (investigation.id === 'demo_pinco_pallino') {
        const demoInv: Investigation = {
          ...updatedInv,
          status: 'PLANNING',
          confirmedEntity: entity,
        };
        activeInvestigationIdRef.current = 'demo_pinco_pallino';
        setInvestigation(demoInv);
        return demoInv;
      }
      setInvestigation(updatedInv);
      return updatedInv;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm entity.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resumeInvestigation = async (invId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/investigations/${invId}/resume`, {
        method: 'POST',
      });
      const updatedInv = await handleScreenedApiResponse<Investigation>(res);
      setInvestigation(updatedInv);
      return updatedInv;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume investigation.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    investigation,
    setInvestigation,
    loading,
    setLoading,
    error,
    setError,
    recentSearches,
    saveRecentSearch,
    hasPastSearches,
    setHasPastSearches,
    fetchInvestigation,
    startInvestigation,
    confirmEntity,
    resumeInvestigation,
  };
}
