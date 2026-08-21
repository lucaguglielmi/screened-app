import { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Moon, 
  Sun, 
  Cpu,
  AlertTriangle
} from 'lucide-react';

import { 
  ActivityEvent, 
  CandidateEntity, 
  Investigation
} from './types/investigation';
import { EntityConfirmation } from './components/EntityConfirmation';
import { LiveProgress } from './components/LiveProgress';
import { EvidenceDossier } from './components/EvidenceDossier';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('screened_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [query, setQuery] = useState('Aldergate Film Festival');
  const [optionalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Investigation state
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    localStorage.setItem('screened_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // SSE Subscription
  useEffect(() => {
    if (!investigation?.id) return;

    const eventSource = new EventSource(`/api/investigations/${investigation.id}/events`);

    eventSource.onmessage = (event) => {
      try {
        const activityEvent: ActivityEvent = JSON.parse(event.data);
        setEvents((prev) => [...prev, activityEvent]);

        // Handle specific milestone triggers
        if (activityEvent.eventType === 'CANDIDATES_FOUND' && activityEvent.details?.candidates) {
          setInvestigation((prev) => prev ? {
            ...prev,
            status: 'AWAITING_ENTITY_CONFIRMATION',
            candidates: activityEvent.details.candidates,
          } : null);
        } else if (activityEvent.eventType === 'DOSSIER_READY') {
          // Fetch final completed investigation state
          fetchInvestigation(investigation.id);
        } else if (activityEvent.eventType === 'PLANNING_STARTED') {
          setInvestigation((prev) => prev ? { ...prev, status: 'PLANNING' } : null);
        } else if (activityEvent.eventType === 'DOMAIN_SEARCH_STARTED') {
          setInvestigation((prev) => prev ? { ...prev, status: 'RESEARCHING' } : null);
        } else if (activityEvent.eventType === 'CONTRADICTIONS_ANALYZING') {
          setInvestigation((prev) => prev ? { ...prev, status: 'ANALYZING_CONTRADICTIONS' } : null);
        } else if (activityEvent.eventType === 'DOSSIER_SYNTHESIZING') {
          setInvestigation((prev) => prev ? { ...prev, status: 'ASSEMBLING_DOSSIER' } : null);
        }
      } catch (e) {
        console.error('Failed to parse SSE event:', e);
      }
    };

    eventSource.onerror = () => {
      // EventSource auto-reconnects
    };

    return () => {
      eventSource.close();
    };
  }, [investigation?.id]);

  const fetchInvestigation = async (id: string) => {
    try {
      const res = await fetch(`/api/investigations/${id}`);
      if (res.ok) {
        const data: Investigation = await res.json();
        setInvestigation(data);
      }
    } catch (e) {
      console.error('Failed to fetch investigation:', e);
    }
  };

  const handleStartInvestigation = async (subjectQuery: string) => {
    if (!subjectQuery.trim()) return;
    setLoading(true);
    setError(null);
    setEvents([]);
    try {
      const res = await fetch('/api/investigations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: subjectQuery.trim(),
          optionalUrl: optionalUrl.trim() || undefined,
          intent: 'Vet before submitting',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Server error (${res.status})`);
      }

      const inv: Investigation = await res.json();
      setInvestigation(inv);
    } catch (err: any) {
      setError(err.message || 'Failed to initiate investigation.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEntity = async (entity: CandidateEntity) => {
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
    } catch (err: any) {
      setError(err.message || 'Failed to confirm entity.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInvestigation(null);
    setEvents([]);
    setError(null);
  };

  const currentStatus = investigation?.status || 'DRAFT';

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500/20">
      {/* Top Navbar */}
      <header className="border-b border-paper-border dark:border-darkroom-border bg-paper-surface/80 dark:bg-darkroom-surface/80 backdrop-blur sticky top-0 z-30 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div 
            onClick={handleReset}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <div className="font-serif text-xl font-semibold tracking-tight text-paper-text dark:text-darkroom-text">
                Screened
              </div>
              <div className="text-[10px] font-mono tracking-widest text-paper-muted dark:text-darkroom-muted uppercase">
                Cinema Due Diligence
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Cpu className="size-3.5" /> Parallel Search + Vertex AI
            </span>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-paper-muted dark:text-darkroom-muted hover:bg-paper-card dark:hover:bg-darkroom-card transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-neutral-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-10">
        {/* Error Notification */}
        {error && (
          <div className="max-w-3xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-3">
            <AlertTriangle className="size-5 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* View Routing Based on Lifecycle State */}
        {!investigation && (
          <div className="space-y-10">
            {/* Hero */}
            <section className="text-center max-w-2xl mx-auto space-y-3">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-paper-text dark:text-darkroom-text">
                Investigate before you submit.
              </h1>
              <p className="text-sm sm:text-base text-paper-muted dark:text-darkroom-muted leading-relaxed">
                Autonomous multi-agent research across trade registries, press archives, and participant accounts. Transparent, cited facts — no blackbox scores.
              </p>
            </section>

            {/* Search Intake Box */}
            <section className="max-w-2xl mx-auto space-y-3">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleStartInvestigation(query); }}
                className="p-2 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border shadow-sm flex flex-col sm:flex-row gap-2 transition-colors"
              >
                <div className="relative flex-1 flex items-center">
                  <Search className="size-5 absolute left-3.5 text-paper-muted dark:text-darkroom-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter festival name (e.g. Raindance, Aldergate, Sundance)..."
                    className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-paper-text dark:text-darkroom-text placeholder-paper-muted dark:placeholder-darkroom-muted focus:outline-none"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  <Sparkles className="size-4" />
                  <span>Start Due Diligence</span>
                </button>
              </form>

              {/* Quick suggestions */}
              <div className="flex items-center justify-center gap-2 text-xs text-paper-muted dark:text-darkroom-muted">
                <span className="font-mono">Quick Test:</span>
                {['Aldergate Film Festival', 'Raindance Film Festival', 'Aesthetica Short Film Festival'].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => { setQuery(name); handleStartInvestigation(name); }}
                    className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    {name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* State 1: Disambiguation in progress or Awaiting confirmation */}
        {investigation && currentStatus === 'DISAMBIGUATING' && (
          <LiveProgress
            status={currentStatus}
            events={events}
            festivalName={investigation.query}
          />
        )}

        {investigation && currentStatus === 'AWAITING_ENTITY_CONFIRMATION' && (
          <EntityConfirmation
            candidates={investigation.candidates}
            query={investigation.query}
            onConfirm={handleConfirmEntity}
            loading={loading}
          />
        )}

        {/* State 2: Researching / Analyzing */}
        {investigation && ['PLANNING', 'RESEARCHING', 'ANALYZING_CONTRADICTIONS', 'ASSEMBLING_DOSSIER'].includes(currentStatus) && (
          <LiveProgress
            status={currentStatus}
            events={events}
            festivalName={investigation.confirmedEntity?.name || investigation.query}
          />
        )}

        {/* State 3: Dossier Ready */}
        {investigation && currentStatus === 'READY' && investigation.dossier && (
          <EvidenceDossier
            entity={investigation.confirmedEntity || {
              id: 'default',
              name: investigation.query,
              entityType: 'FESTIVAL',
              descriptor: '',
              sourceIds: [],
            }}
            dossier={investigation.dossier}
            claims={investigation.claims || []}
            sources={investigation.sources || []}
            disputes={investigation.disputes || []}
            onNewInvestigation={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-paper-border dark:border-darkroom-border py-6 text-center text-xs text-paper-muted dark:text-darkroom-muted">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <div>Screened — Built natively with Google ADK & Parallel Search API</div>
          <div className="text-[11px] opacity-75">All findings are cryptographically hashed and cited to verified web excerpts.</div>
        </div>
      </footer>
    </div>
  );
}
