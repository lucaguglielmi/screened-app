import { useState, useEffect, useCallback } from 'react';
import { CandidateEntity, Investigation } from '../types/investigation';
import { track } from '../utils/analytics';
import { piiVault } from '../utils/pii';

export type InvestigationEntryPoint =
  | 'search_form'
  | 'starter_chip'
  | 'command_palette'
  | 'chat_deep_screen'
  | 'scout_deep_screen'
  | 'command_palette_deep_screen'
  | 'grant_scout_deep_screen';

export function useInvestigation() {
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      }
    } catch {
      // ignore
    }
  }, []);

  const updateUrlForInvestigation = useCallback((id: string) => {
    try {
      const currentParams = new URLSearchParams(window.location.search);
      if (currentParams.get('id') !== id) {
        currentParams.set('id', id);
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
        window.history.pushState({ investigationId: id }, '', newUrl);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchInvestigation = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/investigations/${id}`);
        if (res.ok) {
          const data: Investigation = await res.json();
          setInvestigation(data);
          saveRecentInvestigation(data.id);
          updateUrlForInvestigation(data.id);
          if (data.confirmedEntity?.name) {
            saveRecentSearch(data.confirmedEntity.name);
          }
        }
      } catch (e) {
        console.error('Failed to fetch investigation:', e);
      }
    },
    [saveRecentInvestigation, saveRecentSearch, updateUrlForInvestigation],
  );

  // Hydrate investigation from URL parameter (?id=... or /investigation/...)
  useEffect(() => {
    let isMounted = true;
    const loadInitialInvestigation = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const idParam = params.get('id') || params.get('investigationId');
        const pathMatch = window.location.pathname.match(/\/investigation\/([^/]+)/);
        const initialId = idParam || (pathMatch ? pathMatch[1] : null);

        if (initialId && isMounted) {
          const res = await fetch(`/api/investigations/${initialId}`);
          if (res.ok && isMounted) {
            const data: Investigation = await res.json();
            setInvestigation(data);
            saveRecentInvestigation(data.id);
            updateUrlForInvestigation(data.id);
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
  }, [saveRecentInvestigation, saveRecentSearch, updateUrlForInvestigation]);

  // Handle browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id') || params.get('investigationId');
      if (idParam) {
        fetchInvestigation(idParam);
      } else {
        setInvestigation(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [fetchInvestigation]);

  // Fallback polling every 3s while investigation is active
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
        fetchInvestigation(invId);
      }
    }, 3000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [investigation?.id, investigation?.status, fetchInvestigation]);

  // Re-poll on tab focus / visibility change
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' && investigation?.id && investigation.status !== 'READY') {
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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Server error (${res.status})`);
      }

      const rawInv: Investigation = await res.json();
      const invString = JSON.stringify(rawInv);
      const unmaskedInvString = piiVault.unmask(invString);
      const inv: Investigation = JSON.parse(unmaskedInvString);
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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Server error (${res.status})`);
      }

      const updatedInv: Investigation = await res.json();
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
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Resume failed (${res.status})`);
      }
      const updatedInv: Investigation = await res.json();
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
    fetchInvestigation,
    startInvestigation,
    confirmEntity,
    resumeInvestigation,
  };
}
