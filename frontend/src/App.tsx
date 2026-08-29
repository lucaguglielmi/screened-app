import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import {
  Search,
  AlertTriangle,
  History,
  ShieldCheck,
  Command as CommandIcon,
  Volume2,
  VolumeX,
  Keyboard,
} from 'lucide-react';

import {
  ActivityEvent,
  ActiveTool,
  AtomicClaim,
  CandidateEntity,
  Investigation,
  OutreachDraft,
  FilmProfile,
} from './types/investigation';
import { LeftNavigation } from './components/navigation/LeftNavigation';
import { MobileNavigation } from './components/navigation/MobileNavigation';
import { LiveProgress } from './components/LiveProgress';
import { OutreachModal } from './components/OutreachModal';
import { KeyboardHelpModal } from './components/KeyboardHelpModal';
import { FunkyCursor } from './components/common/FunkyCursor';
import { ChatContainer } from './components/chat/ChatContainer';
import { WhyScreened } from './components/WhyScreened';
import { HowToUse } from './components/HowToUse';
import { CommandPalette } from './components/CommandPalette';
import { HistorySidebar } from './components/HistorySidebar';

import { lazyWithRetry } from './utils/lazyWithRetry';

const EvidenceDossier = lazyWithRetry(() => import('./components/EvidenceDossier').then(m => ({ default: m.EvidenceDossier })));
const OpportunityScout = lazyWithRetry(() => import('./components/OpportunityScout').then(m => ({ default: m.OpportunityScout })));
const DesignPlayground = lazyWithRetry(() => import('./components/playground/DesignPlayground').then(m => ({ default: m.DesignPlayground })));
const EntityConfirmation = lazyWithRetry(() => import('./components/EntityConfirmation').then(m => ({ default: m.EntityConfirmation })));
import { VectorFieldBackground } from './components/animations/VectorFieldBackground';
import { AnimatedEE } from './components/animations/AnimatedEE';
import { ScrambleText } from './components/animations/ScrambleText';
import { UpdateNotifier } from './components/common/UpdateNotifier';
import { isSoundMuted, setSoundMuted, playSuccessChime } from './utils/audio';
import { track } from './utils/analytics';
import { piiVault } from './utils/pii';

export default function App() {
  const [soundMuted, setSoundMutedState] = useState<boolean>(() => isSoundMuted());
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);
  const [isFunkyCursorEnabled, setIsFunkyCursorEnabled] = useState(false);
  const [isNavLogoHovered, setIsNavLogoHovered] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('screened_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTool, setActiveTool] = useState<ActiveTool>('CONVERSATIONAL_DESK');
  const [initialScoutProfile, setInitialScoutProfile] = useState<FilmProfile | undefined>(
    undefined,
  );
  const [query, setQuery] = useState('');

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
  const [isCelebrating, setIsCelebrating] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);


  const toggleSound = () => {
    setSoundMutedState((prev) => {
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
        setIsCommandPaletteOpen((prev) => !prev);
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
        setIsKeyboardHelpOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'f') {
        setIsFunkyCursorEnabled((prev) => !prev);
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

  const saveRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const updated = [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(
        0,
        5,
      );
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

  const fetchInvestigation = useCallback(
    async (id: string) => {
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
    },
    [saveRecentInvestigation, saveRecentSearch],
  );

  // SSE Subscription
  useEffect(() => {
    if (!investigation?.id) return;
    const invId = investigation.id;
    const invQuery = investigation.query;

    const eventSource = new EventSource(`/api/investigations/${invId}/events`);

    eventSource.onmessage = (event) => {
      try {
        const activityEvent: ActivityEvent = JSON.parse(event.data);
        setEvents((prev) => [...prev, activityEvent]);

        if (activityEvent.eventType === 'CANDIDATES_FOUND' && activityEvent.details?.candidates) {
          const candidates = activityEvent.details.candidates;
          setInvestigation((prev) =>
            prev
              ? {
                  ...prev,
                  status: 'AWAITING_ENTITY_CONFIRMATION',
                  candidates: candidates,
                }
              : null,
          );
        } else if (activityEvent.eventType === 'DOSSIER_READY') {
          playSuccessChime();
          setIsCelebrating(true);
          setTimeout(() => {
            fetchInvestigation(invId);
            setTimeout(() => setIsCelebrating(false), 500); // 500ms celebration delay
          }, 100);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Screened', {
              body: `Investigation for ${invQuery} is complete.`,
              icon: '/icon.svg',
            });
          }
        } else if (activityEvent.eventType === 'PLANNING_STARTED') {
          setInvestigation((prev) => (prev && prev.status !== 'READY' ? { ...prev, status: 'PLANNING' } : prev));
        } else if (activityEvent.eventType === 'DOMAIN_SEARCH_STARTED') {
          setInvestigation((prev) => (prev && prev.status !== 'READY' ? { ...prev, status: 'RESEARCHING' } : prev));
        } else if (activityEvent.eventType === 'CONTRADICTIONS_ANALYZING') {
          setInvestigation((prev) =>
            prev && prev.status !== 'READY' ? { ...prev, status: 'ANALYZING_CONTRADICTIONS' } : prev,
          );
        } else if (activityEvent.eventType === 'DOSSIER_SYNTHESIZING') {
          setInvestigation((prev) => (prev && prev.status !== 'READY' ? { ...prev, status: 'ASSEMBLING_DOSSIER' } : prev));
        } else if (activityEvent.eventType === 'ERROR') {
          console.error('Investigation Error Event Received:', activityEvent);
          setInvestigation((prev) => (prev && prev.status !== 'READY' ? { ...prev, status: 'FAILED' } : prev));
          setError(activityEvent.message || 'An error occurred during the investigation.');
        }
      } catch (e) {
        console.error('Failed to parse SSE event:', e);
      }
    };

    eventSource.onerror = () => {
      // Re-fetch current investigation status on connection glitch
      fetchInvestigation(invId);
    };

    return () => {
      eventSource.close();
    };
  }, [investigation?.id, investigation?.query, fetchInvestigation]);

  // Fallback polling every 3s while investigation is active to guarantee state progression
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


  const handleStartInvestigation = async (
    subjectQuery: string,
    entryPoint: 'search_form' | 'starter_chip' | 'command_palette' | 'chat_deep_screen' | 'scout_deep_screen' | 'command_palette_deep_screen'
  ) => {
    if (!subjectQuery.trim()) return;
    setLoading(true);
    setError(null);
    setEvents([]);
    saveRecentSearch(subjectQuery.trim());
    
    if (entryPoint.endsWith('_deep_screen')) {
      const sourceTool = entryPoint.replace('_deep_screen', '') as 'chat' | 'scout' | 'command_palette';
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
    } catch (err) {
      console.error('Failed to initiate investigation:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate investigation.');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm entity.');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to draft outreach inquiry.');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed.');
    } finally {
      setOutreachLoading(false);
    }
  };

  const handleExport = () => {
    if (!investigation) return;
    track('dossier_exported', {
      investigation_id: investigation.id,
      export_format: 'markdown',
      claim_count: investigation.claims?.length || 0,
    });
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

  const handleDeepScreen = (festivalName: string, sourceTool: 'chat' | 'scout' | 'command_palette') => {
    setInvestigation(null);
    setEvents([]);
    setError(null);
    setOutreachDraft(null);
    setIsOutreachOpen(false);
    setActiveTool('DUE_DILIGENCE');
    setQuery(festivalName);
    const entryPoint = `${sourceTool}_deep_screen` as
      | 'chat_deep_screen'
      | 'scout_deep_screen'
      | 'command_palette_deep_screen';
    handleStartInvestigation(festivalName, entryPoint);
  };

  const handleScoutLaunch = (profile: FilmProfile) => {
    setInitialScoutProfile(profile);
    setActiveTool('OPPORTUNITY_SCOUT');
  };

  const currentStatus = investigation?.status || 'DRAFT';

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col font-sans selection:bg-indigo-500/20 antialiased text-darkroom-text bg-moving-dark-gradient">
      <div
        className={`relative flex-1 flex flex-row min-h-0 w-full ${
          activeTool === 'DESIGN_PLAYGROUND'
            ? 'bg-darkroom-surface'
            : 'bg-moving-dark-gradient'
        }`}
      >
      {/* Live System Update Notifier */}
      <UpdateNotifier />

      {/* Global Organic Morphing Mesh Gradient Background */}
      {activeTool !== 'DESIGN_PLAYGROUND' && activeTool !== 'WHY_SCREENED' && (
        <VectorFieldBackground className="fixed inset-0 pointer-events-none z-0" />
      )}

      {/* Left Vertical Navigation Rail & Expandable Flyout */}
      <LeftNavigation activeTool={activeTool} onChange={setActiveTool} />

      {/* Main Workspace Container */}
      <div
        className={`relative z-10 flex-1 flex flex-col min-w-0 md:pl-16 lg:pl-20 ${
          activeTool === 'CONVERSATIONAL_DESK'
            ? 'h-screen h-[100dvh] overflow-hidden'
            : 'min-h-screen min-h-[100dvh]'
        }`}
      >
        {/* Top Header Bar */}
        <header
          className={`border-b border-darkroom-border ${activeTool === 'DESIGN_PLAYGROUND' ? 'bg-darkroom-surface' : 'bg-darkroom-surface/80 backdrop-blur'} sticky top-0 z-30 transition-colors shrink-0 no-print`}
        >
          <div className="px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between gap-4">
            <div 
              onClick={handleReset} 
              onMouseEnter={() => setIsNavLogoHovered(true)}
              onMouseLeave={() => setIsNavLogoHovered(false)}
              className="flex items-center gap-3 cursor-pointer shrink-0 group"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-serif text-2xl font-black tracking-normal text-darkroom-text flex items-center">
                  Scr
                  <AnimatedEE forceHover={isNavLogoHovered} />
                  ned
                </span>
              </div>
            </div>

            {/* Header Right: Command Palette, Sound Toggle, Theme Toggle, Shortcuts Hint & Mobile Navigation */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Quick Search / Command Palette (⌘K) */}
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-darkroom-surface hover:bg-darkroom-card text-slate-400 hover:text-slate-200 border border-darkroom-border transition-colors cursor-pointer text-xs font-mono"
                title="Command Palette (⌘K)"
              >
                <Search className="size-3.5 text-indigo-400" />
                <span>Search or jump to...</span>
                <span className="flex items-center gap-0.5 text-[10px] bg-paper-border bg-darkroom-border text-slate-400 px-1.5 py-0.5 rounded border border-darkroom-border">
                  <CommandIcon className="size-2.5" /> K
                </span>
              </button>

              {/* History Button */}
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-darkroom-surface hover:bg-darkroom-card text-slate-400 hover:text-indigo-300 border border-darkroom-border hover:border-indigo-500/40 transition-colors cursor-pointer text-xs font-mono flex items-center gap-1.5"
                title="View Past Searches"
              >
                <History className="size-4 text-indigo-400" />
                <span className="hidden sm:inline">History</span>
              </button>

              {/* Sound Effect Toggle Button (M) */}
              <button
                onClick={toggleSound}
                className={`p-2 rounded-xl border transition-all cursor-pointer text-xs font-mono flex items-center justify-center ${
                  soundMuted
                    ? 'bg-darkroom-surface border-darkroom-border text-slate-400 hover:text-slate-200'
                    : 'bg-darkroom-card border-indigo-500/40 text-indigo-300 hover:border-indigo-400 shadow-sm'
                }`}
                title={soundMuted ? 'Unmute Audio (Press M)' : 'Mute Audio (Press M)'}
              >
                {soundMuted ? (
                  <VolumeX className="size-4 text-rose-400" />
                ) : (
                  <Volume2 className="size-4 text-indigo-400" />
                )}
              </button>


              {/* Keyboard Shortcuts Quick Helper Hint */}
              <button
                onClick={() => setIsKeyboardHelpOpen(true)}
                className="hidden md:flex p-2 items-center justify-center rounded-xl bg-darkroom-surface hover:bg-darkroom-card text-slate-400 hover:text-indigo-300 border border-darkroom-border hover:border-indigo-500/40 transition-all cursor-pointer text-xs font-mono"
                title="Keyboard Shortcuts Cheat Sheet (Press ?)"
              >
                <Keyboard className="size-4 text-indigo-400" />
              </button>

              {/* Mobile Menu Drawer Button */}
              <MobileNavigation
                activeTool={activeTool}
                onChange={setActiveTool}
                soundMuted={soundMuted}
                onToggleSound={toggleSound}
                onOpenKeyboardHelp={() => setIsKeyboardHelpOpen(true)}
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              />
            </div>
          </div>
        </header>

        {/* Main Workspace Area */}
        <main
          className={`${
            activeTool === 'DESIGN_PLAYGROUND'
              ? 'w-full flex-1'
              : activeTool === 'CONVERSATIONAL_DESK'
              ? 'max-w-6xl w-full mx-auto flex-1 min-h-0 flex flex-col px-1 sm:px-4 md:px-6 py-1 sm:py-2 overflow-hidden'
              : 'max-w-6xl px-4 sm:px-6 md:px-8 py-8 space-y-8 mx-auto flex-1 w-full'
          }`}
        >
          {/* Error Notification */}
          {error && (
            <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-rose-400 text-base flex items-center gap-3">
              <AlertTriangle className="size-5 shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {/* View 1: Conversational Producer Desk (Home) */}
          {activeTool === 'CONVERSATIONAL_DESK' && (
            <ChatContainer
              onLaunchDueDiligence={(q) => handleDeepScreen(q, 'chat')}
              onLaunchOpportunityScout={handleScoutLaunch}
              onNavigateToPlaygroundFeedback={() => setActiveTool('DESIGN_PLAYGROUND')}
              onOpenKeyboardHelp={() => setIsKeyboardHelpOpen(true)}
            />
          )}

          {/* View 2: Design Playground */}
          {activeTool === 'DESIGN_PLAYGROUND' && (
            <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Playground...</div>}>
              <DesignPlayground />
            </Suspense>
          )}

          {/* View 3: Opportunity Scout */}
          {activeTool === 'OPPORTUNITY_SCOUT' && (
            <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Scout...</div>}>
              <OpportunityScout
                onDeepScreen={(q: string) => handleDeepScreen(q, 'scout')}
                initialProfile={initialScoutProfile}
              />
            </Suspense>
          )}

          {/* View 4: Why Screened Exists */}
          {activeTool === 'WHY_SCREENED' && (
            <WhyScreened
              onNavigateToDesk={() => setActiveTool('CONVERSATIONAL_DESK')}
              onNavigateToDiligence={() => setActiveTool('DUE_DILIGENCE')}
              onNavigateToScout={() => setActiveTool('OPPORTUNITY_SCOUT')}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            />
          )}

          {/* View 5: Due Diligence */}
          {activeTool === 'DUE_DILIGENCE' && (
            <>
              {!investigation && (
                <div className="space-y-12">
                  {/* Hero */}
                  <section className="text-center max-w-2xl mx-auto space-y-6 pt-4">
                    <div className="flex justify-center items-center gap-2 mb-4">
                      <span className="font-serif text-6xl sm:text-7xl lg:text-8xl font-black tracking-normal text-white flex items-center">
                        Scr
                        <AnimatedEE forceHover={true} eyesPattern={true} slowAnimation={true} />
                        ned
                      </span>
                    </div>
                    <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                      <ScrambleText text="Investigate before you submit." />
                    </h1>
                    <p className="text-base text-slate-400 leading-relaxed">
                      Autonomous multi-agent research across trade registries, press archives, and
                      participant accounts. Transparent, cited facts — no blackbox scores.
                    </p>
                  </section>

                  {/* Search Intake Box: Solid Opaque, Borderless */}
                  <section className="max-w-2xl mx-auto space-y-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleStartInvestigation(query, 'search_form');
                      }}
                      className="p-2 rounded-2xl bg-darkroom-surface shadow-2xl shadow-black/80 flex flex-col sm:flex-row gap-2 transition-all"
                    >
                      <div className="relative flex-1 flex items-center">
                        <Search className="size-5 absolute left-3.5 text-slate-400" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Enter festival name (e.g. Raindance, Aldergate (Test Entity), Sundance)..."
                          className="w-full pl-11 pr-4 py-3 bg-transparent text-base text-white placeholder-slate-500 focus:outline-none"
                          disabled={loading}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="px-6 py-3 rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover disabled:opacity-40 text-slate-950 font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-[var(--color-tool-diligence)]/20 shrink-0 cursor-pointer"
                      >
                        <ShieldCheck className="size-5 text-slate-950" />
                        <span>Start Due Diligence</span>
                      </button>
                    </form>

                    {/* Recent Searches Pills */}
                    {recentSearches.length > 0 && (
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-400 flex-wrap pt-1">
                        <span className="inline-flex items-center gap-1 font-mono text-xs">
                          <History className="size-3.5" /> Recent:
                        </span>
                        {recentSearches.map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => {
                              setQuery(name);
                              handleStartInvestigation(name, 'starter_chip');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-darkroom-surface text-slate-300 hover:text-white hover:bg-darkroom-card transition-all cursor-pointer text-xs font-mono shadow-md"
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* State 1: Disambiguation in progress or Awaiting confirmation or Failed/Cancelled before confirmation */}
              {investigation && ['DISAMBIGUATING', 'FAILED', 'CANCELLED'].includes(currentStatus) && !investigation.confirmedEntity && (
                <LiveProgress
                  status={currentStatus}
                  events={events}
                  festivalName={investigation.query}
                  onCancel={handleReset}
                />
              )}

              {investigation && currentStatus === 'AWAITING_ENTITY_CONFIRMATION' && (
                <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Confirmation...</div>}>
                  <EntityConfirmation
                    candidates={investigation.candidates}
                    query={investigation.query}
                    onConfirm={handleConfirmEntity}
                    loading={loading}
                  />
                </Suspense>
              )}

              {/* State 2: Researching / Analyzing / Celebrating or Failed/Cancelled after confirmation */}
              {investigation &&
                (
                  ['PLANNING', 'RESEARCHING', 'ANALYZING_CONTRADICTIONS', 'ASSEMBLING_DOSSIER'].includes(currentStatus) || 
                  (currentStatus === 'READY' && isCelebrating)
                ) && (
                  <LiveProgress
                    status={currentStatus}
                    events={events}
                    festivalName={investigation.confirmedEntity?.name || investigation.query}
                    isCelebrating={isCelebrating}
                    onCancel={handleReset}
                  />
                )}
              {investigation && ['FAILED', 'CANCELLED'].includes(currentStatus) && investigation.confirmedEntity && (
                  <LiveProgress
                    status={currentStatus}
                    events={events}
                    festivalName={investigation.confirmedEntity?.name || investigation.query}
                    onCancel={handleReset}
                  />
                )}

              {/* State 3: Dossier Ready */}
              {investigation && currentStatus === 'READY' && !isCelebrating && investigation.dossier && (
                <EvidenceDossier
                  entity={
                    investigation.confirmedEntity || {
                      id: 'default',
                      name: investigation.query,
                      entityType: 'FESTIVAL',
                      descriptor: '',
                      sourceIds: [],
                    }
                  }
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
          onSearchFestival={(q) => handleDeepScreen(q, 'command_palette')}
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

        {isFunkyCursorEnabled && <FunkyCursor />}

        {/* History Sidebar */}
        <HistorySidebar
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectInvestigation={(id) => {
            fetchInvestigation(id);
            setActiveTool('DUE_DILIGENCE');
          }}
        />
      </div>
    </div>
    </div>
  );
}
