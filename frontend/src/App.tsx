import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  AlertTriangle,
  History,
  MapPin,
  ShieldCheck
} from 'lucide-react';



import { 
  ActivityEvent, 
  ActiveTool,
  AtomicClaim,
  CandidateEntity, 
  Investigation,
  OutreachDraft
} from './types/investigation';
import { LeftNavigation } from './components/navigation/LeftNavigation';
import { EntityConfirmation } from './components/EntityConfirmation';
import { LiveProgress } from './components/LiveProgress';
import { EvidenceDossier } from './components/EvidenceDossier';
import { OutreachModal } from './components/OutreachModal';
import { OpportunityScout } from './components/OpportunityScout';
import { KeyboardHelpModal } from './components/KeyboardHelpModal';
import { ChatContainer } from './components/chat/ChatContainer';
import { DesignPlayground } from './components/playground/DesignPlayground';
import { FilmProfile } from './types/investigation';
import { isSoundMuted, setSoundMuted, playSuccessChime } from './utils/audio';



const SPOTLIGHT_PRESETS = [
  {
    name: 'Raindance Film Festival',
    city: 'London, United Kingdom',
    year: 1992,
    badge: 'BIFA / BAFTA Qualifying',
    desc: 'The UK’s leading independent film festival.'
  },
  {
    name: 'Sundance Film Festival',
    city: 'Park City, Utah, USA',
    year: 1978,
    badge: 'Oscar Qualifying',
    desc: 'Premier showcase for original independent cinema.'
  },
  {
    name: 'Aesthetica Short Film Festival',
    city: 'York, United Kingdom',
    year: 2011,
    badge: 'BAFTA Qualifying',
    desc: 'Major UK celebration of short-form and new talent.'
  },
  {
    name: 'Aldergate Film Festival',
    city: 'Bristol, United Kingdom',
    year: 2021,
    badge: 'Disputed Showcase',
    desc: 'Sample festival with physical venue & fee disputes.'
  }
];

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('screened_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [soundMuted, setSoundMutedState] = useState<boolean>(() => isSoundMuted());
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('screened_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTool, setActiveTool] = useState<ActiveTool>('CONVERSATIONAL_DESK');
  const [initialScoutProfile, setInitialScoutProfile] = useState<FilmProfile | undefined>(undefined);
  const [query, setQuery] = useState('Aldergate Film Festival');

  const [optionalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Investigation state
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  // Outreach Modal state
  const [outreachDraft, setOutreachDraft] = useState<OutreachDraft | null>(null);
  const [isOutreachOpen, setIsOutreachOpen] = useState(false);
  const [outreachLoading, setOutreachLoading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const toggleSound = () => {
    setSoundMutedState(prev => {
      const next = !prev;
      setSoundMuted(next);
      return next;
    });
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveTool('DUE_DILIGENCE');
        searchInputRef.current?.focus();
      } else if (e.key === '/') {
        e.preventDefault();
        setActiveTool('DUE_DILIGENCE');
        searchInputRef.current?.focus();
      } else if (e.key === '?') {
        e.preventDefault();
        setIsKeyboardHelpOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 't') {
        toggleTheme();
      } else if (e.key.toLowerCase() === 'm') {
        toggleSound();
      } else if (e.key === 'Escape') {
        setIsKeyboardHelpOpen(false);
        setIsOutreachOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const saveRecentSearch = (term: string) => {
    setRecentSearches(prev => {
      const updated = [term, ...prev.filter(t => t.toLowerCase() !== term.toLowerCase())].slice(0, 5);
      localStorage.setItem('screened_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  // SSE Subscription
  useEffect(() => {
    if (!investigation?.id) return;

    const eventSource = new EventSource(`/api/investigations/${investigation.id}/events`);

    eventSource.onmessage = (event) => {
      try {
        const activityEvent: ActivityEvent = JSON.parse(event.data);
        setEvents((prev) => [...prev, activityEvent]);

        if (activityEvent.eventType === 'CANDIDATES_FOUND' && activityEvent.details?.candidates) {
          setInvestigation((prev) => prev ? {
            ...prev,
            status: 'AWAITING_ENTITY_CONFIRMATION',
            candidates: activityEvent.details.candidates,
          } : null);
        } else if (activityEvent.eventType === 'DOSSIER_READY') {
          playSuccessChime();
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
      // Auto reconnect
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
        if (data.confirmedEntity?.name) {
          saveRecentSearch(data.confirmedEntity.name);
        }
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
    saveRecentSearch(subjectQuery.trim());
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

  const handleDraftOutreach = async (claim?: AtomicClaim) => {
    if (!investigation) return;
    setOutreachLoading(true);
    try {
      const res = await fetch(`/api/investigations/${investigation.id}/outreach/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: claim?.id,
          targetType: 'FESTIVAL_ORGANIZER',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to draft outreach.');
      }

      const draft: OutreachDraft = await res.json();
      setOutreachDraft(draft);
      setIsOutreachOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to draft outreach inquiry.');
    } finally {
      setOutreachLoading(false);
    }
  };

  const handleApproveOutreach = async (draftId: string, payloadHash: string) => {
    if (!investigation) return;
    setOutreachLoading(true);
    try {
      const res = await fetch(`/api/investigations/${investigation.id}/outreach/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          payloadHash,
          userConfirmed: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Approval failed.');
      }

      const updatedDraft: OutreachDraft = await res.json();
      setOutreachDraft(updatedDraft);
    } catch (err: any) {
      setError(err.message || 'Approval failed.');
    } finally {
      setOutreachLoading(false);
    }
  };

  const handleExport = () => {
    if (!investigation) return;
    window.open(`/api/investigations/${investigation.id}/export`, '_blank');
  };

  const handleReset = () => {
    setInvestigation(null);
    setEvents([]);
    setError(null);
    setOutreachDraft(null);
    setIsOutreachOpen(false);
    setActiveTool('CONVERSATIONAL_DESK');
  };


  const handleDeepScreen = (festivalName: string) => {
    setActiveTool('DUE_DILIGENCE');
    setQuery(festivalName);
    handleReset();
    handleStartInvestigation(festivalName);
  };

  const handleScoutLaunch = (profile: FilmProfile) => {
    setInitialScoutProfile(profile);
    setActiveTool('OPPORTUNITY_SCOUT');
  };


  const currentStatus = investigation?.status || 'DRAFT';

  return (
    <div className="min-h-screen flex flex-row bg-paper-bg dark:bg-darkroom-bg text-paper-text dark:text-darkroom-text selection:bg-indigo-500/20 antialiased">
      {/* Left Vertical Navigation Rail & Expandable Flyout */}
      <LeftNavigation
        activeTool={activeTool}
        onChange={setActiveTool}
        theme={theme}
        onToggleTheme={toggleTheme}
        soundMuted={soundMuted}
        onToggleSound={toggleSound}
        onOpenKeyboardHelp={() => setIsKeyboardHelpOpen(true)}
      />

      {/* Main Scrollable Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="border-b border-paper-border dark:border-darkroom-border bg-paper-surface/80 dark:bg-darkroom-surface/80 backdrop-blur sticky top-0 z-30 transition-colors no-print">
          <div className="px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between gap-4">
            <div 
              onClick={handleReset}
              className="flex items-center gap-3 cursor-pointer shrink-0"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-serif text-xl font-bold tracking-tight text-paper-text dark:text-darkroom-text">
                  Screened
                </span>
                {activeTool === 'CONVERSATIONAL_DESK' && (
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#2018E6]/20 text-indigo-400 border border-[#2018E6]/40">
                    The Desk
                  </span>
                )}
                {activeTool === 'DUE_DILIGENCE' && (
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#00D29E]/20 text-[#00D29E] border border-[#00D29E]/40">
                    Due Diligence
                  </span>
                )}
                {activeTool === 'OPPORTUNITY_SCOUT' && (
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/40">
                    Opportunity Scout
                  </span>
                )}
                {activeTool === 'DESIGN_PLAYGROUND' && (
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40">
                    Playground
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>


        {/* Main Workspace Area */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 flex-1 w-full space-y-8">
          {/* Error Notification */}
          {error && (
            <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-base flex items-center gap-3">
              <AlertTriangle className="size-5 shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {/* View 1: Conversational Producer Desk (Home) */}
          {activeTool === 'CONVERSATIONAL_DESK' && (
            <ChatContainer
              onLaunchDueDiligence={handleDeepScreen}
              onLaunchOpportunityScout={handleScoutLaunch}
            />
          )}

          {/* View 2: Design Playground */}
          {activeTool === 'DESIGN_PLAYGROUND' && (
            <DesignPlayground />
          )}

          {/* View 3: Opportunity Scout */}
          {activeTool === 'OPPORTUNITY_SCOUT' && (
            <OpportunityScout
              onDeepScreen={handleDeepScreen}
              initialProfile={initialScoutProfile}
            />
          )}

          {/* View 4: Due Diligence */}
          {activeTool === 'DUE_DILIGENCE' && (
            <>
              {!investigation && (
                <div className="space-y-12">
                  {/* Hero */}
                  <section className="text-center max-w-2xl mx-auto space-y-3 pt-4">
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-paper-text dark:text-darkroom-text">
                      Investigate before you submit.
                    </h1>
                    <p className="text-base text-paper-muted dark:text-darkroom-muted leading-relaxed">
                      Autonomous multi-agent research across trade registries, press archives, and participant accounts. Transparent, cited facts — no blackbox scores.
                    </p>
                  </section>

                  {/* Search Intake Box */}
                  <section className="max-w-2xl mx-auto space-y-4">
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleStartInvestigation(query); }}
                      className="p-2.5 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border shadow-xs flex flex-col sm:flex-row gap-2.5 transition-colors"
                    >
                      <div className="relative flex-1 flex items-center">
                        <Search className="size-5 absolute left-3.5 text-paper-muted dark:text-darkroom-muted" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Enter festival name (e.g. Raindance, Aldergate, Sundance)..."
                          className="w-full pl-11 pr-4 py-3 bg-transparent text-base text-paper-text dark:text-darkroom-text placeholder-paper-muted dark:placeholder-darkroom-muted focus:outline-none"
                          disabled={loading}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="px-6 py-3 rounded-xl bg-[#00D29E] hover:bg-[#00B887] disabled:opacity-50 text-slate-950 font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
                      >
                        <ShieldCheck className="size-5 text-slate-950" />
                        <span>Start Due Diligence</span>
                      </button>
                    </form>


                    {/* Recent Searches Pills */}
                    {recentSearches.length > 0 && (
                      <div className="flex items-center justify-center gap-2 text-sm text-paper-muted dark:text-darkroom-muted flex-wrap">
                        <span className="inline-flex items-center gap-1 font-mono text-xs">
                          <History className="size-3.5" /> Recent:
                        </span>
                        {recentSearches.map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => { setQuery(name); handleStartInvestigation(name); }}
                            className="px-3 py-1 rounded-lg bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors cursor-pointer text-xs"
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Featured Spotlight Presets */}
                  <section className="space-y-4 pt-4">
                    <div className="flex items-center justify-between border-b border-paper-border dark:border-darkroom-border pb-2">
                      <span className="font-mono text-xs uppercase tracking-wider text-paper-muted dark:text-darkroom-muted">
                        Featured Festival Presets
                      </span>
                      <span className="text-xs font-mono text-paper-muted dark:text-darkroom-muted">
                        Click to analyze live
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {SPOTLIGHT_PRESETS.map((preset) => (
                        <div
                          key={preset.name}
                          onClick={() => { setQuery(preset.name); handleStartInvestigation(preset.name); }}
                          className="p-5 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                {preset.badge}
                              </span>
                              <span className="text-xs font-mono text-paper-muted dark:text-darkroom-muted">
                                Est. {preset.year}
                              </span>
                            </div>
                            <h3 className="font-serif text-lg font-semibold text-paper-text dark:text-darkroom-text group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {preset.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs font-mono text-paper-muted dark:text-darkroom-muted">
                              <MapPin className="size-3.5 text-indigo-500" />
                              <span>{preset.city}</span>
                            </div>
                            <p className="text-sm text-paper-muted dark:text-darkroom-muted line-clamp-2 pt-1">
                              {preset.desc}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-paper-border dark:border-darkroom-border flex items-center justify-between text-xs font-mono text-indigo-600 dark:text-indigo-400">
                            <span>Run Due Diligence</span>
                            <ShieldCheck className="size-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
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
                  onDraftOutreach={handleDraftOutreach}
                  onExport={handleExport}
                />
              )}
            </>
          )}
        </main>

        {/* Outreach Sandbox Approval Modal */}
        <OutreachModal
          draft={outreachDraft}
          isOpen={isOutreachOpen}
          onClose={() => setIsOutreachOpen(false)}
          onApprove={handleApproveOutreach}
          loading={outreachLoading}
        />

        {/* Keyboard Shortcuts Modal */}
        <KeyboardHelpModal
          isOpen={isKeyboardHelpOpen}
          onClose={() => setIsKeyboardHelpOpen(false)}
        />

        {/* Footer */}
        <footer className="border-t border-paper-border dark:border-darkroom-border py-6 text-center text-sm text-paper-muted dark:text-darkroom-muted no-print mt-auto">
          <div className="max-w-6xl mx-auto px-4 space-y-1">
            <div className="flex items-center justify-center gap-4">
              <span>Screened — Built natively with Google ADK & Parallel Search API</span>
              <button
                onClick={() => setIsKeyboardHelpOpen(true)}
                className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-xs"
              >
                Shortcuts (?)
              </button>
            </div>
            <div className="text-xs opacity-75">All findings are cryptographically hashed and cited to verified web excerpts.</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

