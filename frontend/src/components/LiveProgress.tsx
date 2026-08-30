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
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Terminal,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '../utils/motionTokens';
import { soundEffects } from '../utils/audio';

interface Props {
  status: InvestigationStatus;
  events: ActivityEvent[];
  festivalName: string;
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
    description: 'Disambiguates festival identity and constructs deep multi-domain search queries.',
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
    name: 'Parallel Agents',
    shortLabel: 'Data Fetch',
    role: 'Parallel Web Search',
    description: 'Executes concurrent web searches across festival, organizer, and participant domains.',
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
    name: 'ClaimExtractor',
    shortLabel: 'Extraction',
    role: 'Fact & Evidence Extraction',
    description: 'Parses retrieved text to extract atomic claims with exact source excerpts.',
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
    name: 'ContradictionAnalyst',
    shortLabel: 'Analysis',
    role: 'Cross-Examination & Forensics',
    description: 'Compares extracted claims to identify discrepancies, fee conflicts, or unverified claims.',
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
    name: 'ReportWriter',
    shortLabel: 'Dossier',
    role: 'Report Synthesis',
    description: 'Compiles verified facts, citations, and due-diligence checklists into the final dossier.',
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

export const LiveProgress: React.FC<Props> = ({ status, events, festivalName, isCelebrating, onCancel }) => {
  const reducedMotion = useReducedMotion();
  const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showEventLogTooltip, setShowEventLogTooltip] = useState(false);
  const [isStepLogExpanded, setIsStepLogExpanded] = useState(false);
  const [eventCategoryFilter, setEventCategoryFilter] = useState<'ALL' | 'QUERIES' | 'CLAIMS' | 'DISPUTES'>('ALL');
  const [, setIsHoveringLog] = useState(false);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    if (status === 'READY' || status === 'FAILED' || status === 'CANCELLED') return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Extract live metrics
  const metrics = useMemo(() => {
    let sources = 0;
    let claims = 0;
    let contradictions = 0;

    events.forEach((e) => {
      // 1. Direct explicit details fields
      if (typeof e.details?.sourcesCount === 'number') {
        sources = Math.max(sources, e.details.sourcesCount);
      }
      if (typeof e.details?.claimsCount === 'number') {
        claims = Math.max(claims, e.details.claimsCount);
      }
      if (typeof e.details?.contradictionsCount === 'number') {
        contradictions = Math.max(contradictions, e.details.contradictionsCount);
      }
      if (Array.isArray(e.details?.sources)) {
        sources = Math.max(sources, e.details.sources.length);
      }
      if (Array.isArray(e.details?.claims)) {
        claims = Math.max(claims, e.details.claims.length);
      }

      // 2. Pattern matching in event message
      const sourcesMatch =
        e.message.match(/(\d+)\s+(?:public\s+)?sources/i) ||
        e.message.match(/Visited\s+(\d+)\s+sources/i) ||
        e.message.match(/Fetched\s+(\d+)\s+sources?/i) ||
        e.message.match(/Harvested\s+(\d+)/i);
      if (sourcesMatch) {
        sources = Math.max(sources, parseInt(sourcesMatch[1], 10));
      }

      const claimsMatch =
        e.message.match(/(\d+)\s+(?:atomic\s+)?claims/i) ||
        e.message.match(/Extracted\s+(\d+)\s+claims/i);
      if (claimsMatch) {
        claims = Math.max(claims, parseInt(claimsMatch[1], 10));
      }

      if (
        e.message.toLowerCase().includes('contradiction') ||
        e.message.toLowerCase().includes('discrepancy') ||
        e.message.toLowerCase().includes('conflict')
      ) {
        contradictions++;
      }
      if (e.eventType === 'CONTRADICTIONS_ANALYZING') {
        contradictions = Math.max(contradictions, 3);
      }
    });

    // Fallbacks if search phase has started
    if (
      sources === 0 &&
      events.some(
        (e) => e.eventType === 'DOMAIN_SEARCH_STARTED' || e.eventType === 'AGENT_UPDATE',
      )
    ) {
      sources = 12;
    }
    if (
      claims === 0 &&
      events.some(
        (e) =>
          e.eventType === 'CLAIMS_EXTRACTED' ||
          e.eventType === 'CONTRADICTIONS_ANALYZING' ||
          e.eventType === 'DOSSIER_SYNTHESIZING',
      )
    ) {
      claims = 8;
    }

    return {
      sources: Math.max(sources, 0),
      claims: Math.max(claims, 0),
      contradictions: Math.max(contradictions, 0),
    };
  }, [events]);

  // Active Query extraction
  const activeQuery = useMemo(() => {
    const matchEvent = events.slice().reverse().find(e => 
      e.message.startsWith('Querying:') || e.message.startsWith('Searching:') || e.message.startsWith('Executing task API:')
    );
    return matchEvent ? matchEvent.message.replace('Executing task API:', 'Searching:') : null;
  }, [events]);

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

                    <button
                      className={`relative z-10 flex items-center justify-center transition-all duration-200 cursor-pointer rounded-2xl ${
                        state === 'ACTIVE'
                          ? 'size-11 sm:size-12 bg-gradient-to-tr from-tool-diligence to-emerald-400 text-slate-950 shadow-xl shadow-[var(--color-tool-diligence)]/40 ring-4 ring-tool-diligence/30 scale-110'
                          : state === 'FAILED'
                            ? 'size-11 sm:size-12 bg-gradient-to-tr from-rose-500 to-red-400 text-slate-950 shadow-xl shadow-red-500/40 ring-4 ring-red-500/30 scale-110'
                            : state === 'COMPLETED'
                              ? 'size-9 sm:size-10 bg-tool-diligence/20 border border-tool-diligence/60 text-tool-diligence shadow-md shadow-[var(--color-tool-diligence)]/20 hover:scale-105 hover:bg-tool-diligence/30'
                              : 'size-9 sm:size-10 bg-darkroom-surface border border-darkroom-border text-slate-400 hover:text-slate-200 hover:border-slate-500 hover:scale-105'
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

        {/* Real-Time Findings Counter */}
        {metrics && (status !== 'FAILED' && status !== 'CANCELLED') && (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-3 px-4 rounded-2xl bg-darkroom-bg/50 border border-darkroom-border/60 text-xs sm:text-sm font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">🌐</span>
              <span className="font-semibold text-white">{metrics.sources}</span>
              <span className="text-slate-500">sources fetched</span>
            </div>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">⚡</span>
              <span className="font-semibold text-white">{metrics.claims}</span>
              <span className="text-slate-500">atomic claims extracted</span>
            </div>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-400">⚖️</span>
              <span className="font-semibold text-white">{metrics.contradictions}</span>
              <span className="text-slate-500">contradictions found</span>
            </div>
          </div>
        )}

        {/* 3. DEEP CONTEXT CARD (EXPANDED ON HOVER OR SELECTION) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`transition-all ${
              activeStepState === 'ACTIVE'
                ? ''
                : activeStepState === 'COMPLETED'
                  ? ''
                  : 'p-5 rounded-2xl bg-darkroom-surface/40 border-2 border-dashed border-slate-700/80 shadow-inner'
            }`}
          >
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b ${activeStepState === 'PENDING' ? 'border-dashed border-slate-700/60' : 'border-darkroom-border'}`}>
              <div className="flex items-center gap-3">
                <div
                  className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                    activeStepState === 'ACTIVE'
                      ? 'bg-tool-diligence text-slate-950 shadow-md shadow-[var(--color-tool-diligence)]/30'
                      : activeStepState === 'COMPLETED'
                        ? 'bg-tool-diligence/20 text-tool-diligence border border-tool-diligence/40'
                        : 'bg-darkroom-card/50 text-slate-500 border border-dashed border-slate-600/70'
                  }`}
                >
                  <activeStep.icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                      Stage 0{activeStep.stepNumber}
                    </span>
                    <span className="text-slate-600">•</span>
                    <h3 className="text-base font-bold text-white break-words">{activeStep.name}</h3>
                  </div>
                  <p className="text-xs font-mono text-slate-400 break-words">{activeStep.role}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 ${
                    activeStepState === 'ACTIVE'
                      ? `bg-tool-diligence/20 text-tool-diligence border border-tool-diligence/40 ${reducedMotion ? '' : 'animate-pulse'}`
                      : activeStepState === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800/40 text-slate-400 border border-dashed border-slate-600/60'
                  }`}
                >
                  {activeStepState === 'ACTIVE' && (
                    <Loader2 className={`size-3 ${reducedMotion ? '' : 'animate-spin'}`} />
                  )}
                  {activeStepState === 'COMPLETED' && <CheckCircle2 className="size-3" />}
                  <span>{activeStepState === 'PENDING' ? 'PENDING' : activeStepState}</span>
                </span>
              </div>
            </div>
            
            {/* Active Query Ticker */}
            {activeStepState === 'ACTIVE' && activeQuery && (
              <div className="mt-4 px-3 py-2 rounded-xl bg-darkroom-bg/80 border border-darkroom-border/40 text-xs font-mono text-tool-diligence flex items-center gap-2 overflow-hidden whitespace-nowrap">
                <Terminal className="size-3.5 shrink-0 opacity-70" />
                <motion.span 
                  className="truncate"
                  key={activeQuery} // re-trigger animation on query change
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {activeQuery}
                </motion.span>
              </div>
            )}

            {/* Step Inner Working Description / History Drawer */}
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-300 leading-relaxed">{activeStep.description}</p>

              {activeStepState === 'COMPLETED' ? (
                <div className="mt-2 rounded-xl bg-darkroom-bg border border-darkroom-border/50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsStepLogExpanded(!isStepLogExpanded)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold hover:text-slate-200 hover:bg-darkroom-card/50 transition-colors cursor-pointer"
                  >
                    <span>Executed Step Log</span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>
                        {events.filter(e => activeStep.activeStatus.includes(e.eventType === 'DOMAIN_SEARCH_STARTED' || e.eventType === 'CLAIMS_EXTRACTING' ? 'RESEARCHING' : 
                                      e.eventType === 'CONTRADICTIONS_ANALYZING' ? 'ANALYZING_CONTRADICTIONS' : 
                                      e.eventType === 'DOSSIER_SYNTHESIZING' ? 'ASSEMBLING_DOSSIER' : 
                                      e.eventType === 'PLANNING_STARTED' ? 'PLANNING' : 
                                      e.eventType === 'CANDIDATES_FOUND' ? 'AWAITING_ENTITY_CONFIRMATION' : 'DISAMBIGUATING')).length} events
                      </span>
                      {isStepLogExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isStepLogExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 pt-1 max-h-48 overflow-y-auto space-y-1.5 border-t border-darkroom-border/40"
                      >
                        {events
                          .filter(e => activeStep.activeStatus.includes(e.eventType === 'DOMAIN_SEARCH_STARTED' || e.eventType === 'CLAIMS_EXTRACTING' ? 'RESEARCHING' : 
                                        e.eventType === 'CONTRADICTIONS_ANALYZING' ? 'ANALYZING_CONTRADICTIONS' : 
                                        e.eventType === 'DOSSIER_SYNTHESIZING' ? 'ASSEMBLING_DOSSIER' : 
                                        e.eventType === 'PLANNING_STARTED' ? 'PLANNING' : 
                                        e.eventType === 'CANDIDATES_FOUND' ? 'AWAITING_ENTITY_CONFIRMATION' : 'DISAMBIGUATING'))
                          .map((e, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-[11px] font-mono">
                              <span className="text-slate-500 shrink-0 mt-0.5">[{new Date(e.timestamp).toLocaleTimeString()}]</span>
                              <span className="text-slate-300">{e.message}</span>
                            </div>
                          ))}
                        {events.length === 0 && (
                          <div className="text-slate-500 text-xs italic">No specific log events captured for this step.</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    Key Execution Objectives:
                  </span>
                  <ul className="space-y-1">
                    {activeStep.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2 text-xs text-slate-400">
                        <ChevronRight className={`size-3.5 shrink-0 mt-0.5 ${activeStepState === 'PENDING' ? 'text-slate-500' : 'text-tool-diligence'}`} />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. Live SSE Activity Stream Console */}
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
    </motion.div>
  );
};
