import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ActivityEvent, InvestigationStatus } from '../types/investigation';
import {
  Search,
  Sparkles,
  Layers,
  Scale,
  FileText,
  CheckCircle2,
  Loader2,
  Terminal,
  AlertTriangle,
  Bell,
  Mail,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '../utils/motionTokens';
import { soundEffects } from '../utils/audio';
import { VerifiedTick } from './ui/VerifiedTick';

interface Props {
  status: InvestigationStatus;
  events: ActivityEvent[];
  festivalName: string;
  investigationId?: string;
  isCelebrating?: boolean;
  onCancel?: () => void;
}

interface TimelineStep {
  id: string;
  stepNumber: number;
  name: string;
  shortLabel: string;
  role: string;
  description: string;
  details: string[];
  toolsUsed: string[];
  icon: React.ElementType;
  activeStatus: InvestigationStatus[];
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 'planner',
    stepNumber: 1,
    name: 'Strategy & Planning',
    shortLabel: 'Strategy',
    role: 'Entity Resolution & Search Strategy',
    description: 'Identifies the festival and plans the web search.',
    details: [
      'Disambiguates festival identity',
      'Generates search queries',
      'Configures verification targets',
    ],
    toolsUsed: ['Parallel Search', 'Search Planner', 'Entity Matcher'],
    icon: Sparkles,
    activeStatus: ['DISAMBIGUATING', 'AWAITING_ENTITY_CONFIRMATION', 'PLANNING'],
  },
  {
    id: 'parallel_agents',
    stepNumber: 2,
    name: 'Parallel Search',
    shortLabel: 'Data Fetch',
    role: 'Parallel Web Search',
    description: 'Searches official websites, public records, and directories.',
    details: [
      'Dispatches domain tasks',
      'Fetches web documents',
      'Harvests public records',
    ],
    toolsUsed: ['Parallel Task API', 'Parallel Search API'],
    icon: Search,
    activeStatus: ['RESEARCHING'],
  },
  {
    id: 'claim_extractor',
    stepNumber: 3,
    name: 'Claim Extraction',
    shortLabel: 'Extraction',
    role: 'Fact & Evidence Extraction',
    description: 'Pulls key facts, dates, and quotes from sources.',
    details: [
      'Extracts atomic claims',
      'Links verbatim quotes',
      'Verifies source domains',
    ],
    toolsUsed: ['Substring Matcher', 'LLM Extractor'],
    icon: Layers,
    activeStatus: ['RESEARCHING', 'ANALYZING_CONTRADICTIONS'],
  },
  {
    id: 'contradiction_analyst',
    stepNumber: 4,
    name: 'Contradiction Analysis',
    shortLabel: 'Analysis',
    role: 'Cross-Examination & Forensics',
    description: 'Checks for hidden fees, false claims, and red flags.',
    details: [
      'Detects conflicting statements',
      'Flags unverified claims',
      'Evaluates forensic risks',
    ],
    toolsUsed: ['Dispute Resolver', 'Forensic Scorer'],
    icon: Scale,
    activeStatus: ['ANALYZING_CONTRADICTIONS'],
  },
  {
    id: 'report_writer',
    stepNumber: 5,
    name: 'Report Synthesis',
    shortLabel: 'Dossier',
    role: 'Report Synthesis',
    description: 'Builds the final verification dossier and trust score.',
    details: [
      'Generates neutral summary',
      'Calculates authenticity score',
      'Assembles evidence dossier',
    ],
    toolsUsed: ['Dossier Synthesizer'],
    icon: FileText,
    activeStatus: ['ASSEMBLING_DOSSIER'],
  },
];

// Helper to determine status for each timeline step
function getStepState(
  step: TimelineStep,
  currentStatus: InvestigationStatus,
  events: ActivityEvent[],
  lastActiveStatus?: InvestigationStatus,
): 'COMPLETED' | 'ACTIVE' | 'PENDING' | 'FAILED' {
  if (currentStatus === 'READY') return 'COMPLETED';

  const statusOrder: InvestigationStatus[] = [
    'DRAFT',
    'DISAMBIGUATING',
    'AWAITING_ENTITY_CONFIRMATION',
    'PLANNING',
    'RESEARCHING',
    'ANALYZING_CONTRADICTIONS',
    'ASSEMBLING_DOSSIER',
    'READY',
  ];

  // We determine what the "effective" status is for progress calculation
  const effectiveStatus =
    currentStatus === 'FAILED' || currentStatus === 'CANCELLED'
      ? lastActiveStatus || 'PLANNING'
      : currentStatus;

  const currentIdx = statusOrder.indexOf(effectiveStatus);
  const stepIndices = step.activeStatus.map((s) => statusOrder.indexOf(s));
  const maxStepIdx = Math.max(...stepIndices);

  if (currentStatus === 'FAILED' && step.activeStatus.includes(effectiveStatus)) {
    return 'FAILED';
  }

  // Refined sub-step differentiation inside RESEARCHING:
  // Step 2 (Data Fetch / Parallel Agents) vs Step 3 (Extraction / ClaimExtractor)
  if (effectiveStatus === 'RESEARCHING') {
    const hasStartedExtraction = events.some(
      (e) =>
        e.eventType === 'CLAIMS_EXTRACTING' ||
        e.eventType === 'CLAIMS_EXTRACTED' ||
        e.agentName === 'ClaimAssembler' ||
        e.agentName === 'ClaimExtractor',
    );
    if (step.id === 'parallel_agents') {
      return hasStartedExtraction ? 'COMPLETED' : 'ACTIVE';
    }
    if (step.id === 'claim_extractor') {
      return hasStartedExtraction ? 'ACTIVE' : 'PENDING';
    }
  }

  if (step.activeStatus.includes(effectiveStatus) && currentStatus !== 'FAILED' && currentStatus !== 'CANCELLED') {
    return 'ACTIVE';
  }

  if (currentIdx > maxStepIdx) {
    return 'COMPLETED';
  }

  return 'PENDING';
}

// Helper to determine the connector line state between Step i and Step i + 1
function getSegmentState(
  stepIdx: number,
  steps: TimelineStep[],
  status: InvestigationStatus,
  events: ActivityEvent[],
  lastActiveStatus?: InvestigationStatus,
): 'COMPLETED' | 'ACTIVE' | 'PENDING' | 'FAILED' {
  if (stepIdx >= steps.length - 1) return 'PENDING';

  const stateCurrent = getStepState(steps[stepIdx], status, events, lastActiveStatus);
  const stateNext = getStepState(steps[stepIdx + 1], status, events, lastActiveStatus);

  if (stateCurrent === 'FAILED' || (stateNext === 'FAILED' && stateCurrent !== 'COMPLETED')) {
    return 'FAILED';
  }

  // If both current and next are completed (or entire pipeline is ready)
  if (stateCurrent === 'COMPLETED' && stateNext === 'COMPLETED') {
    return 'COMPLETED';
  }

  // Traversed line leading to the currently active step
  if (stateCurrent === 'COMPLETED' && stateNext === 'ACTIVE') {
    return 'COMPLETED';
  }

  // Line actively extending from or between active steps
  if (stateCurrent === 'ACTIVE' || stateNext === 'ACTIVE') {
    return 'ACTIVE';
  }

  return 'PENDING';
}

export const LiveProgress: React.FC<Props> = ({ status, events, festivalName, investigationId, isCelebrating, onCancel }) => {
  const reducedMotion = useReducedMotion();
  const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showEventLogTooltip, setShowEventLogTooltip] = useState(false);
  const [eventCategoryFilter, setEventCategoryFilter] = useState<'ALL' | 'QUERIES' | 'CLAIMS' | 'DISPUTES'>('ALL');
  const [, setIsHoveringLog] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('screened_notification_email') || '';
    } catch {
      return '';
    }
  });
  const [isNotified, setIsNotified] = useState(false);
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);
  const [pushEnabled, setPushEnabled] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });
  const [stickyDismissed, setStickyDismissed] = useState(false);
  const [showStickyNotify, setShowStickyNotify] = useState(false);

  const isPostDisambiguationRunning =
    status !== 'DRAFT' &&
    status !== 'DISAMBIGUATING' &&
    status !== 'AWAITING_ENTITY_CONFIRMATION' &&
    status !== 'READY' &&
    status !== 'FAILED' &&
    status !== 'CANCELLED';

  // Trigger sticky bottom drawer 10 seconds after disambiguation finishes
  useEffect(() => {
    if (!isPostDisambiguationRunning || stickyDismissed) {
      return;
    }
    const timer = setTimeout(() => {
      setShowStickyNotify(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [isPostDisambiguationRunning, stickyDismissed]);

  const handleRegisterEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@') || !investigationId) return;
    setIsSubmittingNotify(true);
    try {
      localStorage.setItem('screened_notification_email', notifyEmail);
      await fetch(`/api/investigations/${investigationId}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: notifyEmail }),
      });
      setIsNotified(true);
      soundEffects.playSuccess();
    } catch (err) {
      console.error('Failed to register notification email:', err);
    } finally {
      setIsSubmittingNotify(false);
    }
  };

  const handleEnableBrowserPush = async () => {
    if ('Notification' in window) {
      soundEffects.playClick();
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setPushEnabled(true);
        soundEffects.playSuccess();
      }
    }
  };

  const eventsEndRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    if (status === 'READY' || status === 'FAILED' || status === 'CANCELLED') return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Deduplicated display events for stream console, reversed so newest is at the top
  const displayEvents = useMemo(() => {
    const deduped = events.filter((evt, i, arr) => !i || arr[i - 1].message !== evt.message);
    const reversed = [...deduped].reverse();
    if (eventCategoryFilter === 'QUERIES') {
      return reversed.filter(e => e.message.includes('Search') || e.message.includes('Query') || e.message.includes('Visited'));
    }
    if (eventCategoryFilter === 'CLAIMS') {
      return reversed.filter(e => e.message.toLowerCase().includes('claim') || e.message.includes('Extract') || e.eventType === 'CLAIMS_EXTRACTED');
    }
    if (eventCategoryFilter === 'DISPUTES') {
      return reversed.filter(e => e.message.toLowerCase().includes('contradiction') || e.message.toLowerCase().includes('conflict') || e.message.toLowerCase().includes('dispute') || e.eventType === 'CONTRADICTIONS_ANALYZING');
    }
    return reversed;
  }, [events, eventCategoryFilter]);

  const isRunning = status !== 'READY' && status !== 'FAILED' && status !== 'CANCELLED';

  // Compute last active status from events for FAILED states
  const lastActiveStatus = useMemo(() => {
    if (status !== 'FAILED' && status !== 'CANCELLED') return undefined;

    const statusMap: Record<string, InvestigationStatus> = {
      DISAMBIGUATING: 'DISAMBIGUATING',
      PLANNING_STARTED: 'PLANNING',
      DOMAIN_SEARCH_STARTED: 'RESEARCHING',
      CLAIMS_EXTRACTING: 'RESEARCHING',
      CONTRADICTIONS_ANALYZING: 'ANALYZING_CONTRADICTIONS',
      DOSSIER_SYNTHESIZING: 'ASSEMBLING_DOSSIER',
    };

    for (let i = events.length - 1; i >= 0; i--) {
      const s = statusMap[events[i].eventType];
      if (s) return s;
    }
    return 'PLANNING';
  }, [status, events]);

  // Auto-select the active step on status change if user hasn't manually selected
  useEffect(() => {
    const activeIdx = TIMELINE_STEPS.findIndex(
      (s) =>
        getStepState(s, status, events, lastActiveStatus) === 'ACTIVE' ||
        getStepState(s, status, events, lastActiveStatus) === 'FAILED',
    );
    if (activeIdx !== -1 && selectedStepIndex === null) {
      // Keep focused on active
    }
  }, [status, events, selectedStepIndex, lastActiveStatus]);


  // Compute overall progress percentage
  const activeStepIdx = TIMELINE_STEPS.findIndex(
    (s) =>
      getStepState(s, status, events, lastActiveStatus) === 'ACTIVE' ||
      getStepState(s, status, events, lastActiveStatus) === 'FAILED',
  );
  const completedCount = TIMELINE_STEPS.filter(
    (s) => getStepState(s, status, events, lastActiveStatus) === 'COMPLETED',
  ).length;

  const progressPercent =
    status === 'READY' || isCelebrating
      ? 100
      : activeStepIdx >= 0
        ? Math.round(((activeStepIdx + 0.5) / TIMELINE_STEPS.length) * 100)
        : Math.round((completedCount / TIMELINE_STEPS.length) * 100);

  // Active step or selected step for inspection spotlight
  const inspectedStepIndex =
    hoveredStepIndex !== null
      ? hoveredStepIndex
      : selectedStepIndex !== null
        ? selectedStepIndex
        : activeStepIdx >= 0
          ? activeStepIdx
          : 0;

  const activeStep = TIMELINE_STEPS[inspectedStepIndex] || TIMELINE_STEPS[0];
  const activeStepState = isCelebrating ? 'COMPLETED' : getStepState(activeStep, status, events, lastActiveStatus);



  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* 1. Unified Progress & Pipeline Header */}
      <div className={`p-5 sm:p-7 rounded-3xl bg-darkroom-surface shadow-2xl shadow-black/80 space-y-5 sm:space-y-6 relative overflow-hidden ${status === 'FAILED' ? 'border border-red-500/20' : ''}`}>
        {/* Glow ambient accent behind header */}
        <div className={`absolute -right-20 -top-20 size-60 rounded-full blur-3xl pointer-events-none ${status === 'FAILED' ? 'bg-red-500/10' : 'bg-midnight-royal/20'}`} />
        <div className={`absolute -left-20 -bottom-20 size-60 rounded-full blur-3xl pointer-events-none ${status === 'FAILED' ? 'bg-rose-500/5' : 'bg-tool-diligence/10'}`} />

        {/* Top bar: Title + Status + Timers */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-darkroom-border/60 pb-4 relative z-10">
          <div className="space-y-1 min-w-0 flex-1">
            <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-wider ${status === 'FAILED' ? 'text-red-400' : 'text-tool-diligence'}`}>
              {status === 'FAILED' ? (
                <AlertTriangle className="size-3.5" />
              ) : (
                <Loader2 className={`size-3.5 ${reducedMotion || status === 'READY' ? '' : 'animate-spin'}`} />
              )}
              <span className="font-semibold">
                {status === 'FAILED' ? 'Investigation Halted' : status === 'READY' ? 'Investigation Complete' : 'Autonomous Pipeline Active'}
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight break-words flex items-center flex-wrap gap-2 sm:gap-3">
              <span>Investigating {festivalName}</span>
              {festivalName === 'Pinco Pallino Film Festival' && (
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-sans font-medium text-amber-400 border border-amber-500/20 tracking-normal whitespace-nowrap mt-1 sm:mt-0">
                  Demo Only
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-2 z-10 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
            <div className="px-3 py-1.5 rounded-xl bg-darkroom-bg border border-darkroom-border text-slate-300 text-[11px] font-mono font-medium flex items-center gap-1.5 shadow-inner">
              <span>⏱️ {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}</span>
              {isRunning && (
                <span className="text-slate-500 font-normal">
                  · ~{Math.max(0, 35 - elapsedSeconds)}s left
                </span>
              )}
            </div>

            {onCancel && status !== 'READY' && status !== 'FAILED' && status !== 'CANCELLED' && !isCelebrating && (
              <button 
                onClick={onCancel}
                className="px-3 py-1.5 rounded-xl bg-darkroom-card hover:bg-darkroom-surface border border-darkroom-border hover:border-rose-500/50 text-slate-400 hover:text-rose-400 text-[11px] font-mono transition-colors cursor-pointer shadow-sm active:scale-95"
              >
                Cancel
              </button>
            )}

            <div className="px-3 py-1.5 rounded-xl bg-tool-diligence/15 text-tool-diligence text-[11px] font-mono font-semibold flex items-center gap-2">
              <span className={`size-1.5 rounded-full bg-tool-diligence ${reducedMotion || isCelebrating || status === 'FAILED' ? '' : 'animate-pulse'}`} />
              <span>{isCelebrating ? 'COMPLETED' : status}</span>
              <span className="text-white font-semibold ml-1">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Mobile Compact Progress Bar */}
        <div className="block md:hidden space-y-1.5">
          <div className="h-2 w-full bg-darkroom-bg rounded-full overflow-hidden border border-darkroom-border">
            <motion.div
              className="h-full bg-gradient-to-r from-tool-diligence via-emerald-400 to-teal-300 rounded-full shadow-sm shadow-[var(--color-tool-diligence)]/50"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(2, Math.min(100, progressPercent))}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Timeline Track - 5-Column Row with Connected Segment Lines */}
        <div className="relative pt-1 sm:pt-2 pb-2 sm:pb-4 px-1 sm:px-6">
          {/* Timeline Nodes - 5 Columns Grid */}
          <div className="relative z-10 grid grid-cols-5 gap-1 sm:gap-2 w-full">
            {TIMELINE_STEPS.map((step, idx) => {
              const state = getStepState(step, status, events, lastActiveStatus);
              const segmentState = getSegmentState(idx, TIMELINE_STEPS, status, events, lastActiveStatus);
              const isHovered = hoveredStepIndex === idx;
              const isSelected = selectedStepIndex === idx;
              const isInspected = inspectedStepIndex === idx;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center relative group w-full shrink-0"
                  onMouseEnter={() => {
                    soundEffects.playClick();
                    setHoveredStepIndex(idx);
                  }}
                  onMouseLeave={() => setHoveredStepIndex(null)}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedStepIndex(idx === selectedStepIndex ? null : idx);
                  }}
                >
                  {/* Fixed-Height Centered Node Container */}
                  <div className="h-12 w-full flex items-center justify-center relative">
                    {/* Connecting Line Segment to Next Step (Strategy through Dossier) */}
                    {idx < TIMELINE_STEPS.length - 1 && (
                      <div className="absolute left-1/2 w-full top-1/2 -translate-y-1/2 h-1 z-0 pointer-events-none">
                        {/* Base Dark Track */}
                        <div className="absolute inset-0 bg-darkroom-border/80 rounded-full" />

                        {/* Completed 'Done' Segment -> Rich Greener Line */}
                        {segmentState === 'COMPLETED' && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-emerald-500 to-tool-diligence rounded-full shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            style={{ transformOrigin: 'left' }}
                          />
                        )}

                        {/* Active Segment -> Animated glowing pulse wave only on active connecting line */}
                        {segmentState === 'ACTIVE' && (
                          <div className="absolute inset-0 overflow-hidden rounded-full">
                            <div className="absolute inset-0 bg-emerald-500/20" />
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300 to-tool-diligence rounded-full shadow-[0_0_12px_rgba(52,211,153,0.85)]"
                              animate={
                                reducedMotion
                                  ? { opacity: [0.4, 1, 0.4] }
                                  : { x: ['-100%', '100%'] }
                              }
                              transition={{
                                repeat: Infinity,
                                duration: 1.2,
                                ease: 'easeInOut',
                              }}
                            />
                            <div
                              className={`absolute inset-0 bg-tool-diligence/40 ${
                                reducedMotion ? '' : 'animate-pulse'
                              }`}
                            />
                          </div>
                        )}

                        {/* Failed Segment */}
                        {segmentState === 'FAILED' && (
                          <div className="absolute inset-0 bg-rose-500/70 rounded-full shadow-[0_0_6px_rgba(244,63,94,0.4)]" />
                        )}
                      </div>
                    )}

                    {/* Solid Opaque Backing Plate under Node to ensure line is strictly hidden under icon */}
                    <div className="absolute z-10 size-10 sm:size-11 rounded-2xl bg-[#090d18] pointer-events-none" />

                    <button
                      className={`relative z-20 flex items-center justify-center transition-all duration-200 cursor-pointer rounded-2xl ${
                        state === 'ACTIVE'
                          ? 'size-11 sm:size-12 bg-gradient-to-tr from-tool-diligence to-emerald-400 text-slate-950 shadow-xl shadow-[var(--color-tool-diligence)]/40 ring-4 ring-tool-diligence/30 scale-110'
                          : state === 'FAILED'
                            ? 'size-11 sm:size-12 bg-gradient-to-tr from-rose-500 to-red-400 text-slate-950 shadow-xl shadow-red-500/40 ring-4 ring-red-500/30 scale-110'
                            : state === 'COMPLETED'
                              ? 'size-9 sm:size-10 bg-[#0a261e] border-2 border-emerald-400 text-emerald-300 shadow-lg shadow-black/80 hover:scale-105 hover:bg-[#0e352b]'
                              : 'size-9 sm:size-10 bg-[#090e1a] border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 hover:scale-105 shadow-md'
                      } ${isSelected ? (state === 'FAILED' ? 'ring-2 ring-red-500' : 'ring-2 ring-tool-diligence') : isInspected && state !== 'ACTIVE' && state !== 'FAILED' ? 'ring-2 ring-indigo-400/60 border-indigo-400' : ''}`}
                      title={`${step.stepNumber}. ${step.name}`}
                    >
                      {/* Active Ping Ripple */}
                      {state === 'ACTIVE' && !reducedMotion && (
                        <span className="absolute -inset-1.5 rounded-2xl bg-tool-diligence opacity-30 animate-ping pointer-events-none" />
                      )}
                      {state === 'FAILED' && !reducedMotion && (
                        <span className="absolute -inset-1.5 rounded-2xl bg-red-500 opacity-30 animate-ping pointer-events-none" />
                      )}

                      {/* Step Icon or Checkmark */}
                      {state === 'COMPLETED' ? (
                        <CheckCircle2 className="size-4.5 sm:size-5 text-tool-diligence" />
                      ) : state === 'FAILED' ? (
                        <AlertTriangle className="size-5 sm:size-5.5 text-slate-950" />
                      ) : state === 'ACTIVE' ? (
                        <Icon
                          className={`size-5 sm:size-5.5 text-slate-950 ${reducedMotion ? '' : 'animate-pulse'}`}
                        />
                      ) : (
                        <Icon className="size-4 sm:size-4.5" />
                      )}

                      {/* Step Number Small Badge */}
                      <span
                        className={`absolute -top-1.5 -right-1.5 size-4 rounded-full text-[9px] font-mono font-bold flex items-center justify-center shadow ${
                          state === 'ACTIVE'
                            ? 'bg-slate-950 text-tool-diligence border border-tool-diligence'
                            : state === 'FAILED'
                              ? 'bg-slate-950 text-red-400 border border-red-500'
                              : state === 'COMPLETED'
                                ? 'bg-tool-diligence text-slate-950'
                                : 'bg-darkroom-card text-slate-400 border border-darkroom-border'
                        }`}
                      >
                        {step.stepNumber}
                      </span>
                    </button>
                  </div>

                  {/* Node Label Below */}
                  <div className="mt-2 flex flex-col items-center text-center select-none">
                    <span
                      className={`text-[11px] sm:text-xs font-semibold font-mono tracking-tight transition-colors ${
                        state === 'ACTIVE'
                          ? 'text-tool-diligence font-bold'
                          : state === 'FAILED'
                            ? 'text-red-400 font-bold'
                            : state === 'COMPLETED'
                              ? 'text-slate-200'
                              : 'text-slate-400'
                      }`}
                    >
                      {step.shortLabel}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
                      {step.name.length > 12 ? step.name.slice(0, 10) + '..' : step.name}
                    </span>
                  </div>

                  {/* MINI HOVER TOOLTIP BADGE */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-darkroom-bg text-slate-100 text-xs font-mono whitespace-nowrap shadow-xl border border-darkroom-border z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-150 flex items-center gap-1.5">
                      <span
                        className={`size-1.5 rounded-full ${
                          state === 'ACTIVE'
                            ? reducedMotion
                              ? 'bg-tool-diligence'
                              : 'bg-tool-diligence animate-pulse'
                            : state === 'FAILED'
                              ? 'bg-red-500 animate-pulse'
                              : state === 'COMPLETED'
                                ? 'bg-tool-diligence'
                                : 'bg-slate-500'
                        }`}
                      />
                      <span className="font-semibold text-white">{step.name}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{state}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Active / Inspected Step Caption (Streamlined Title & Caption) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="pt-2 pb-1 flex flex-col sm:flex-row items-center sm:items-start gap-3.5 text-center sm:text-left"
          >
            <div
              className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeStepState === 'ACTIVE'
                  ? 'bg-gradient-to-tr from-tool-diligence to-emerald-400 text-slate-950 shadow-md shadow-[var(--color-tool-diligence)]/30'
                  : activeStepState === 'COMPLETED'
                    ? 'bg-[#0a261e] text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#090e1a] text-slate-500 border border-slate-700'
              }`}
            >
              <activeStep.icon className="size-5" />
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{activeStep.name}</h3>
                {activeStepState === 'ACTIVE' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-tool-diligence/20 text-tool-diligence border border-tool-diligence/40 animate-pulse">
                    Running
                  </span>
                )}
                {activeStepState === 'COMPLETED' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <VerifiedTick size={10} />
                    <span>Completed</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">{activeStep.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. Come Back Later & Background Notifications Card (In-Page) */}
      {isRunning && (
        <div className="rounded-3xl bg-darkroom-surface/90 border border-darkroom-border p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-darkroom-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl border ${
                  isNotified
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-midnight-royal/40 border-tool-diligence/30 text-tool-diligence'
                }`}
              >
                {isNotified ? <VerifiedTick size={16} /> : <Bell className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white font-sans flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span>{isNotified ? 'Background Notification Active' : 'Come Back Later & Get Notified'}</span>
                  {isNotified && (
                    <span className="text-[10px] font-mono text-emerald-400 font-normal">
                      (Will notify when ready)
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 break-words">
                  {isNotified
                    ? `Registered to ${notifyEmail}. Feel free to close or bookmark this tab — we'll notify you as soon as the dossier is ready.`
                    : 'Feel free to close this tab. We can notify you via push and email as soon as the dossier is ready.'}
                </p>
              </div>
            </div>

            {/* PWA / Browser Notification Button */}
            {'Notification' in window && (
              <button
                type="button"
                onClick={handleEnableBrowserPush}
                disabled={pushEnabled}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  pushEnabled
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-darkroom-card hover:bg-darkroom-bg text-slate-300 hover:text-white border-darkroom-border'
                }`}
              >
                {pushEnabled ? <VerifiedTick size={13} /> : <Bell className="size-3.5 text-tool-diligence" />}
                <span>{pushEnabled ? 'Push Enabled' : 'Enable Browser Push'}</span>
              </button>
            )}
          </div>

          {/* Email Notification Form or Permanent Confirmation Banner */}
          {isNotified ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 font-mono">
              <div className="flex items-start gap-2 min-w-0">
                <VerifiedTick size={15} className="shrink-0 mt-0.5" />
                <span className="break-all">
                  We&apos;ll email the direct dossier link to: <strong className="text-white">{notifyEmail}</strong>
                </span>
              </div>
              <span className="text-[11px] text-emerald-400/80 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 shrink-0 self-start sm:self-auto">
                Pending Synthesis
              </span>
            </div>
          ) : (
            <form onSubmit={handleRegisterEmail} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Mail className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="Enter your email for direct dossier link..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-darkroom-bg border border-darkroom-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tool-diligence/50 font-mono"
                  disabled={isSubmittingNotify}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingNotify || !notifyEmail.includes('@')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 bg-midnight-royal hover:bg-midnight-royal/80 text-white border border-tool-diligence/40 shadow-sm disabled:opacity-40"
              >
                <Mail className="size-3.5 text-tool-diligence" />
                <span>{isSubmittingNotify ? 'Registering...' : 'Email Me When Ready'}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* 5. Live SSE Activity Stream Console */}
      {events.length > 0 && (
        <div className="rounded-3xl bg-darkroom-surface overflow-hidden shadow-2xl shadow-black/80">
          <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-darkroom-border/60">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2 font-semibold">
              <span
                className={`size-2 rounded-full bg-tool-diligence ${reducedMotion ? '' : 'animate-pulse'}`}
              />
              <Terminal className="size-3.5 text-indigo-400" />
              <span>Live Agent Event Log</span>
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-darkroom-bg border border-darkroom-border text-[11px] font-mono">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'QUERIES', label: 'Queries' },
                  { id: 'CLAIMS', label: 'Claims' },
                  { id: 'DISPUTES', label: 'Disputes' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setEventCategoryFilter(cat.id as 'ALL' | 'QUERIES' | 'CLAIMS' | 'DISPUTES');
                    }}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      eventCategoryFilter === cat.id
                        ? 'bg-midnight-royal text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Event Count Badge with Hover / Tap Tooltip */}
              <div className="relative flex items-center">
                <button
                  type="button"
                  onMouseEnter={() => setShowEventLogTooltip(true)}
                  onMouseLeave={() => setShowEventLogTooltip(false)}
                  onClick={() => setShowEventLogTooltip((prev) => !prev)}
                  onFocus={() => setShowEventLogTooltip(true)}
                  onBlur={() => setShowEventLogTooltip(false)}
                  className="px-2.5 py-0.5 rounded-full bg-darkroom-bg hover:bg-darkroom-card border border-darkroom-border hover:border-slate-600 text-slate-300 hover:text-white font-mono text-xs font-medium cursor-pointer transition-all flex items-center gap-1 shadow-sm select-none"
                  aria-label={`${displayEvents.length} events recorded`}
                >
                  <span>{displayEvents.length}</span>
                </button>

                <AnimatePresence>
                  {showEventLogTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 bottom-full mb-2 px-2.5 py-1 rounded-xl bg-darkroom-bg border border-darkroom-border text-slate-100 text-xs font-mono whitespace-nowrap shadow-2xl z-30 pointer-events-none flex items-center gap-1.5"
                    >
                      <span className="size-1.5 rounded-full bg-tool-diligence" />
                      <span>{displayEvents.length} events matching filter</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div
            className="p-4 sm:p-5 max-h-60 overflow-y-auto space-y-2.5 text-xs font-mono bg-darkroom-bg/60"
            onMouseEnter={() => setIsHoveringLog(true)}
            onMouseLeave={() => setIsHoveringLog(false)}
          >
            {displayEvents.map((evt, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2.5 leading-relaxed hover:bg-darkroom-surface/40 p-2 sm:p-1 rounded-lg transition-colors border-b sm:border-b-0 border-darkroom-border/30 last:border-b-0"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-400 text-[11px] font-mono">
                    {evt.timestamp
                      ? new Date(evt.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : ''}
                  </span>
                  <span className="text-tool-diligence font-semibold text-xs">
                    [{evt.agentName}]
                  </span>
                </div>
                <span className="text-slate-200 text-xs flex-1 break-words">{evt.message}</span>
              </div>
            ))}

            {/* Active Live Agent Pulsating Mini-Loader Indicator */}
            {isRunning && (
              <div className="flex items-center gap-2.5 leading-relaxed p-2 sm:p-1.5 rounded-lg text-xs font-mono text-slate-400 bg-tool-diligence/[0.04] border border-tool-diligence/20 animate-fade-in">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="relative flex size-2">
                    <span
                      className={`absolute inline-flex h-full w-full rounded-full bg-tool-diligence opacity-75 ${
                        reducedMotion ? '' : 'animate-ping'
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full size-2 bg-tool-diligence ${
                        reducedMotion ? '' : 'animate-pulse'
                      }`}
                    />
                  </span>
                  <span className="text-tool-diligence font-semibold text-xs">
                    [Live Agent]
                  </span>
                </div>
                <span className="text-slate-300 text-xs flex items-center gap-2 flex-1">
                  <span>Gathering &amp; analyzing evidence stream</span>
                  <span className="inline-flex gap-1 items-center">
                    <span
                      className={`size-1 rounded-full bg-tool-diligence ${
                        reducedMotion ? '' : 'animate-bounce'
                      }`}
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className={`size-1 rounded-full bg-tool-diligence ${
                        reducedMotion ? '' : 'animate-bounce'
                      }`}
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className={`size-1 rounded-full bg-tool-diligence ${
                        reducedMotion ? '' : 'animate-bounce'
                      }`}
                      style={{ animationDelay: '300ms' }}
                    />
                  </span>
                </span>
              </div>
            )}

            <div ref={eventsEndRef} />
          </div>
        </div>
      )}

      {/* Sticky Bottom Notification Drawer (Appears 10s after disambiguation completes) */}
      <AnimatePresence>
        {isPostDisambiguationRunning && showStickyNotify && !stickyDismissed && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl bg-[#090d18]/95 backdrop-blur-xl border border-indigo-500/40 rounded-2xl shadow-2xl shadow-black/90 p-3.5 sm:p-4 text-white"
          >
            {isNotified ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <VerifiedTick size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      Notification Active for {notifyEmail}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      We&apos;ll email you the dossier as soon as it&apos;s ready. Feel free to close this tab!
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setStickyDismissed(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-mono text-slate-200 hover:text-white transition-colors shrink-0 cursor-pointer"
                >
                  Got it
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-midnight-royal/50 border border-tool-diligence/40 text-tool-diligence shrink-0">
                      <Bell className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        Deep Research Running in Background
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        Feel free to close this tab — get notified when the dossier is ready.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {'Notification' in window && (
                      <button
                        type="button"
                        onClick={handleEnableBrowserPush}
                        disabled={pushEnabled}
                        className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                          pushEnabled
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {pushEnabled ? <VerifiedTick size={11} /> : <Bell className="size-3 text-tool-diligence" />}
                        <span>{pushEnabled ? 'Push On' : 'Push'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        setStickyDismissed(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      aria-label="Dismiss notification banner"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleRegisterEmail} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="Enter your email for direct dossier link..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/60 border border-darkroom-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-mono"
                      disabled={isSubmittingNotify}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingNotify || !notifyEmail.includes('@')}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm disabled:opacity-40"
                  >
                    <Mail className="size-3" />
                    <span>{isSubmittingNotify ? 'Saving...' : 'Notify Me'}</span>
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
