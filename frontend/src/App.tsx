import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  AlertTriangle,
  History,
  ShieldCheck,
  Command as CommandIcon,
  Scale,
  Volume2,
  VolumeX,
  Sun,
  Moon
} from 'lucide-react';

import { 
  ActivityEvent, 
  ActiveTool,
  AtomicClaim,
  CandidateEntity, 
  Investigation,
  OutreachDraft,
  FilmProfile
} from './types/investigation';
import { LeftNavigation } from './components/navigation/LeftNavigation';
import { MobileNavigation } from './components/navigation/MobileNavigation';
import { EntityConfirmation } from './components/EntityConfirmation';
import { LiveProgress } from './components/LiveProgress';
import { EvidenceDossier } from './components/EvidenceDossier';
import { OutreachModal } from './components/OutreachModal';
import { OpportunityScout } from './components/OpportunityScout';
import { KeyboardHelpModal } from './components/KeyboardHelpModal';
import { ChatContainer } from './components/chat/ChatContainer';
import { DesignPlayground } from './components/playground/DesignPlayground';
import { WhyScreened } from './components/WhyScreened';
import { HowToUse } from './components/HowToUse';
import { CommandPalette } from './components/CommandPalette';
import { HistorySidebar } from './components/HistorySidebar';
import { VectorFieldBackground } from './components/animations/VectorFieldBackground';
import { AnimatedEE } from './components/animations/AnimatedEE';
import { isSoundMuted, setSoundMuted, playSuccessChime } from './utils/audio';





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
  // Command Palette & Keyboard state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);


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

  // Global Page-Level Paste Intake
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const handleOpenKeyboardShortcuts = () => setIsKeyboardHelpOpen(true);
    window.addEventListener('open-keyboard-shortcuts', handleOpenKeyboardShortcuts);
    return () => window.removeEventListener('open-keyboard-shortcuts', handleOpenKeyboardShortcuts);

    const handlePaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(activeEl?.tagName)) {
        return; // normal paste inside focused field
      }

      const pastedText = e.clipboardData?.getData('text');
      if (pastedText && pastedText.trim()) {
        const cleaned = pastedText.trim();
        setActiveTool('DUE_DILIGENCE');
        setQuery(cleaned);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      // Don't trigger if user is actively typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
          setIsCommandPaletteOpen(false);
          setIsKeyboardHelpOpen(false);
        }
        return;
      }

      if (e.key === '/') {
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
        setIsCommandPaletteOpen(false);
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

  const saveRecentInvestigation = (id: string) => {
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
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Screened', {
              body: `Investigation for ${investigation.query} is complete.`,
              icon: '/icon.svg'
            });
          }
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
        saveRecentInvestigation(data.id);
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
      saveRecentInvestigation(inv.id);
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
    <div className={`relative min-h-screen flex flex-row ${activeTool === 'DESIGN_PLAYGROUND' ? 'bg-[#0B1021]' : 'bg-paper-bg dark:bg-darkroom-bg'} text-paper-text dark:text-darkroom-text selection:bg-indigo-500/20 antialiased overflow-x-hidden`}>
      {/* Global Organic Morphing Mesh Gradient Background */}
      {activeTool !== 'DESIGN_PLAYGROUND' && (
        <VectorFieldBackground className="fixed inset-0 pointer-events-none z-0" />
      )}

      {/* Left Vertical Navigation Rail & Expandable Flyout */}
      <LeftNavigation
        activeTool={activeTool}
        onChange={setActiveTool}
      />

      {/* Main Scrollable Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className={`border-b border-paper-border dark:border-darkroom-border ${activeTool === 'DESIGN_PLAYGROUND' ? 'bg-[#0B1021]' : 'bg-paper-surface/80 dark:bg-darkroom-surface/80 backdrop-blur'} sticky top-0 z-30 transition-colors no-print`}>
          <div className="px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between gap-4">
            <div 
              onClick={handleReset}
              className="flex items-center gap-3 cursor-pointer shrink-0"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-serif text-2xl font-black tracking-normal text-paper-text dark:text-darkroom-text flex items-center">
                  Scr<AnimatedEE />ned
                </span>
                <span className="text-xl">✨</span>
              </div>
            </div>

            {/* Header Right: Command Palette, Sound Toggle, Theme Toggle, Shortcuts Hint & Mobile Navigation */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Quick Search / Command Palette (⌘K) */}
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0E1124] hover:bg-[#151936] text-slate-400 hover:text-slate-200 border border-[#22274C] transition-colors cursor-pointer text-xs font-mono"
                title="Command Palette (⌘K)"
              >
                <Search className="size-3.5 text-indigo-400" />
                <span>Search or jump to...</span>
                <span className="flex items-center gap-0.5 text-[10px] bg-[#1A1F45] text-slate-400 px-1.5 py-0.5 rounded border border-[#262D5F]">
                  <CommandIcon className="size-2.5" /> K
                </span>
              </button>

              {/* History Button */}
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#0E1124] hover:bg-[#151936] text-slate-400 hover:text-indigo-300 border border-[#22274C] hover:border-indigo-500/40 transition-colors cursor-pointer text-xs font-mono flex items-center gap-1.5"
                title="View Past Searches"
              >
                <History className="size-4 text-indigo-400" />
                <span className="hidden sm:inline">History</span>
              </button>

              {/* Sound Effect Toggle Button (M) */}
              <button
                onClick={toggleSound}
                className={`p-2 rounded-xl border transition-all cursor-pointer text-xs font-mono flex items-center gap-1.5 ${
                  soundMuted 
                    ? 'bg-[#0E1124] border-[#22274C] text-slate-400 hover:text-slate-200' 
                    : 'bg-[#121838] border-indigo-500/40 text-indigo-300 hover:border-indigo-400 shadow-sm'
                }`}
                title={soundMuted ? 'Unmute Audio (Press M)' : 'Mute Audio (Press M)'}
              >
                {soundMuted ? (
                  <VolumeX className="size-4 text-rose-400" />
                ) : (
                  <Volume2 className="size-4 text-indigo-400" />
                )}
                <span className="hidden lg:inline text-[11px]">
                  {soundMuted ? 'Muted' : 'Sound'}
                </span>
                <span className="hidden xl:inline text-[9px] px-1 py-0.5 rounded bg-[#1A1F45] text-slate-400 border border-[#262D5F]">
                  M
                </span>
              </button>

              {/* Light / Dark Mode Toggle Button (T) */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-[#0E1124] hover:bg-[#151936] text-slate-400 hover:text-amber-300 border border-[#22274C] hover:border-amber-400/40 transition-colors cursor-pointer text-xs font-mono flex items-center gap-1.5"
                title={theme === 'dark' ? 'Switch to Light Mode (Press T)' : 'Switch to Dark Mode (Press T)'}
              >
                {theme === 'dark' ? (
                  <Sun className="size-4 text-amber-400" />
                ) : (
                  <Moon className="size-4 text-indigo-400" />
                )}
                <span className="hidden xl:inline text-[9px] px-1 py-0.5 rounded bg-[#1A1F45] text-slate-400 border border-[#262D5F]">
                  T
                </span>
              </button>

              {/* Keyboard Shortcuts Quick Helper Hint */}
              <button
                onClick={() => setIsKeyboardHelpOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0E1124] hover:bg-[#151936] text-slate-400 hover:text-indigo-300 border border-[#22274C] hover:border-indigo-500/40 transition-all cursor-pointer text-xs font-mono"
                title="Keyboard Shortcuts Cheat Sheet (Press ?)"
              >
                <span>Shortcuts</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#1A1F45] text-indigo-300 border border-[#262D5F] text-[10px] font-bold font-mono">
                  ?
                </kbd>
              </button>

              {/* Mobile Menu Drawer Button */}
              <MobileNavigation
                activeTool={activeTool}
                onChange={setActiveTool}
                theme={theme}
                onToggleTheme={toggleTheme}
                soundMuted={soundMuted}
                onToggleSound={toggleSound}
                onOpenKeyboardHelp={() => setIsKeyboardHelpOpen(true)}
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              />
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
              onNavigateToPlaygroundFeedback={() => setActiveTool('DESIGN_PLAYGROUND')}
              onOpenKeyboardHelp={() => setIsKeyboardHelpOpen(true)}
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

          {/* View 4: Why Screened Exists */}
          {activeTool === 'WHY_SCREENED' && (
            <WhyScreened
              onNavigateToDesk={() => setActiveTool('CONVERSATIONAL_DESK')}
              onNavigateToDiligence={() => setActiveTool('DUE_DILIGENCE')}
              onNavigateToScout={() => setActiveTool('OPPORTUNITY_SCOUT')}
            />
          )}

          {/* View 5: Due Diligence */}
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
                  deepVetting={investigation.deepVetting}
                  onNewInvestigation={handleReset}
                  onDraftOutreach={handleDraftOutreach}
                  onExport={handleExport}
                />
              )}
            </>
          )}

          {activeTool === 'HOW_TO_USE' && (
            <HowToUse
              onNavigateToDesk={() => setActiveTool('CONVERSATIONAL_DESK')}
              onNavigateToDiligence={() => setActiveTool('DUE_DILIGENCE')}
              onNavigateToScout={() => setActiveTool('OPPORTUNITY_SCOUT')}
            />
          )}
        </main>

        {/* Global Command Palette (⌘K) */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onSelectTool={setActiveTool}
          onSearchFestival={handleDeepScreen}
        />

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

        {/* History Sidebar */}
        <HistorySidebar
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectInvestigation={(id) => {
            fetchInvestigation(id);
            setActiveTool('DUE_DILIGENCE');
          }}
        />

        {/* Footer */}
        <footer className="border-t border-paper-border dark:border-darkroom-border py-6 text-center text-sm text-paper-muted dark:text-darkroom-muted no-print mt-auto">
          <div className="max-w-6xl mx-auto px-4 space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <span>Screened — Built natively with Google ADK & Parallel Search API</span>
              <button
                onClick={() => setActiveTool('WHY_SCREENED')}
                className="underline hover:text-indigo-400 text-indigo-300 transition-colors cursor-pointer text-xs flex items-center gap-1"
              >
                <Scale className="size-3" />
                <span>Why Screened exists</span>
              </button>
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="underline hover:text-indigo-400 transition-colors cursor-pointer text-xs flex items-center gap-1"
              >
                <CommandIcon className="size-3" />
                <span>Command Menu (⌘K)</span>
              </button>
            </div>
            <div className="text-xs opacity-75">All findings are cryptographically hashed and cited to verified web excerpts.</div>
          </div>
        </footer>

      </div>
    </div>
  );
}

