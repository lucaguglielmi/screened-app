import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ActivityEvent, InvestigationStatus } from '../types/investigation';
import {
  Bot,
  Search,
  Sparkles,
  Layers,
  Scale,
  FileText,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Zap,
  Terminal,
  Cpu,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '../utils/motionTokens';
import { soundEffects } from '../utils/audio';

interface Props {
  status: InvestigationStatus;
  events: ActivityEvent[];
  festivalName: string;
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
    id: 'disambiguator',
    stepNumber: 1,
    name: 'Disambiguator',
    shortLabel: 'Identity',
    role: 'Entity Resolution',
    description: 'Searches for the official festival entity and verifies its primary domain.',
    details: [
      'Resolves exact festival name',
      'Identifies official website URL'
    ],
    toolsUsed: ['Parallel Search', 'Entity Matcher'],
    icon: Bot,
    activeStatus: ['DISAMBIGUATING', 'AWAITING_ENTITY_CONFIRMATION'],
  },
  {
    id: 'planner',
    stepNumber: 2,
    name: 'Planner',
    shortLabel: 'Strategy',
    role: 'Search Strategy',
    description: 'Generates specific search queries across multiple domains (organizer, participants, venue).',
    details: [
      'Generates search queries',
      'Configures verification targets'
    ],
    toolsUsed: ['Search Planner', 'LLM Query Gen'],
    icon: Sparkles,
    activeStatus: ['PLANNING'],
  },
  {
    id: 'parallel_agents',
    stepNumber: 3,
    name: 'Parallel Agents',
    shortLabel: 'Data Fetch',
    role: 'Parallel Search',
    description: 'Executes concurrent web searches to gather raw source documents.',
    details: [
      'Fetches web pages',
      'Downloads raw source text'
    ],
    toolsUsed: ['Parallel Search API'],
    icon: Search,
    activeStatus: ['RESEARCHING'],
  },
  {
    id: 'claim_extractor',
    stepNumber: 4,
    name: 'ClaimExtractor',
    shortLabel: 'Extraction',
    role: 'Fact Extraction',
    description: 'Parses retrieved text to extract factual statements with exact source quotes.',
    details: [
      'Extracts facts and claims',
      'Links exact source excerpts'
    ],
    toolsUsed: ['Substring Matcher', 'LLM Extractor'],
    icon: Layers,
    activeStatus: ['RESEARCHING', 'ANALYZING_CONTRADICTIONS'],
  },
  {
    id: 'contradiction_analyst',
    stepNumber: 5,
    name: 'ContradictionAnalyst',
    shortLabel: 'Analysis',
    role: 'Cross-Examination',
    description: 'Compares extracted claims to identify conflicts or disputed facts.',
    details: [
      'Detects conflicting statements',
      'Flags unverified claims'
    ],
    toolsUsed: ['Dispute Resolver', 'Forensic Scorer'],
    icon: Scale,
    activeStatus: ['ANALYZING_CONTRADICTIONS'],
  },
  {
    id: 'report_writer',
    stepNumber: 6,
    name: 'ReportWriter',
    shortLabel: 'Dossier',
    role: 'Report Synthesis',
    description: 'Compiles verified facts and analysis into the final dossier.',
    details: [
      'Generates summary',
      'Calculates authenticity score'
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
  lastActiveStatus?: InvestigationStatus
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
  const effectiveStatus = (currentStatus === 'FAILED' || currentStatus === 'CANCELLED') 
    ? (lastActiveStatus || 'DISAMBIGUATING') 
    : currentStatus;

  const currentIdx = statusOrder.indexOf(effectiveStatus);
  const stepIndices = step.activeStatus.map((s) => statusOrder.indexOf(s));
  const maxStepIdx = Math.max(...stepIndices);

  if (currentStatus === 'FAILED' && step.activeStatus.includes(effectiveStatus)) {
    return 'FAILED';
  }

  if (step.activeStatus.includes(effectiveStatus) && currentStatus !== 'FAILED' && currentStatus !== 'CANCELLED') {
    return 'ACTIVE';
  }

  if (currentIdx > maxStepIdx) {
    return 'COMPLETED';
  }

  return 'PENDING';
}

export const LiveProgress: React.FC<Props> = ({ status, events, festivalName }) => {
  const reducedMotion = useReducedMotion();
  const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);

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
    return 'DISAMBIGUATING';
  }, [status, events]);

  // Auto-select the active step on status change if user hasn't manually selected
  useEffect(() => {
    const activeIdx = TIMELINE_STEPS.findIndex((s) => getStepState(s, status, lastActiveStatus) === 'ACTIVE' || getStepState(s, status, lastActiveStatus) === 'FAILED');
    if (activeIdx !== -1 && selectedStepIndex === null) {
      // Keep focused on active
    }
  }, [status, selectedStepIndex, lastActiveStatus]);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  // Compute overall progress percentage
  const activeStepIdx = TIMELINE_STEPS.findIndex((s) => getStepState(s, status, lastActiveStatus) === 'ACTIVE' || getStepState(s, status, lastActiveStatus) === 'FAILED');
  const completedCount = TIMELINE_STEPS.filter(
    (s) => getStepState(s, status, lastActiveStatus) === 'COMPLETED',
  ).length;

  const progressPercent =
    status === 'READY'
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
  const activeStepState = getStepState(activeStep, status, lastActiveStatus);

  // Find latest events related to the inspected agent
  const relatedEvents = events.filter(
    (e) =>
      e.agentName.toLowerCase().includes(activeStep.name.toLowerCase()) ||
      activeStep.name.toLowerCase().includes(e.agentName.toLowerCase()) ||
      (activeStep.id === 'parallel_agents' &&
        (e.agentName.includes('Domain') || e.agentName.includes('Search'))),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* 1. Header Banner */}
      <div className={`p-6 sm:p-7 rounded-3xl bg-darkroom-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-2xl shadow-black/80 relative overflow-hidden ${status === 'FAILED' ? 'border border-red-500/20' : ''}`}>
        {/* Glow ambient accent behind header */}
        <div className={`absolute -right-20 -top-20 size-60 rounded-full blur-3xl pointer-events-none ${status === 'FAILED' ? 'bg-red-500/10' : 'bg-midnight-royal/20'}`} />
        <div className={`absolute -left-20 -bottom-20 size-60 rounded-full blur-3xl pointer-events-none ${status === 'FAILED' ? 'bg-rose-500/5' : 'bg-tool-diligence/10'}`} />

        <div className="space-y-1.5 z-10 min-w-0">
          <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-wider ${status === 'FAILED' ? 'text-red-400' : 'text-tool-diligence'}`}>
            {status === 'FAILED' ? (
              <AlertTriangle className="size-3.5" />
            ) : (
              <Loader2 className={`size-3.5 ${reducedMotion || status === 'READY' ? '' : 'animate-spin'}`} />
            )}
            <span className="font-semibold">
              {status === 'FAILED' ? 'Investigation Halted' : status === 'READY' ? 'Investigation Complete' : 'Autonomous Multi-Agent Pipeline Active'}
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
            Investigating {festivalName}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            {status === 'FAILED' 
              ? 'A critical error was encountered during the pipeline execution.' 
              : 'Executing live Parallel Search API calls and Gemini claim extraction across 3 domains.'}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 z-10 shrink-0">
          <div className="px-4 py-1.5 rounded-xl bg-tool-diligence/15 text-tool-diligence text-xs font-mono font-semibold flex items-center gap-2">
            <span
              className={`size-2 rounded-full bg-tool-diligence ${reducedMotion ? '' : 'animate-pulse'}`}
            />
            <span>State: {status}</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Pipeline Progress: <span className="text-white font-semibold">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* 2. THE SINGLE NEAT TIMELINE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-darkroom-surface shadow-2xl shadow-black/80 space-y-6 relative">
        {/* Timeline Header Subtitle */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Cpu className="size-4 text-indigo-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Investigation Pipeline Sequence
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Hover any node to inspect agent context
          </span>
        </div>

        {/* Timeline Horizontal Track */}
        <div className="relative pt-2 pb-4 px-2 sm:px-6">
          {/* Background Connecting Rail */}
          <div className="absolute left-10 sm:left-14 right-10 sm:right-14 top-8 -translate-y-1/2 h-1 bg-darkroom-border rounded-full z-0" />

          {/* Animated Gradient Active Fill Rail */}
          <motion.div
            className="absolute left-10 sm:left-14 top-8 -translate-y-1/2 h-1 bg-gradient-to-r from-tool-diligence via-emerald-400 to-teal-300 rounded-full z-0 shadow-sm shadow-[var(--color-tool-diligence)]/50"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(2, Math.min(100, progressPercent))}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ maxWidth: 'calc(100% - 5.5rem)' }}
          />

          {/* Timeline Nodes Grid */}
          <div className="relative z-10 flex items-start justify-between w-full">
            {TIMELINE_STEPS.map((step, idx) => {
              const state = getStepState(step, status);
              const isHovered = hoveredStepIndex === idx;
              const isSelected = selectedStepIndex === idx;
              const isInspected = inspectedStepIndex === idx;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center relative group w-16 sm:w-20 md:w-24 shrink-0"
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
                  <div className="h-12 flex items-center justify-center relative">
                    <button
                      className={`relative flex items-center justify-center transition-all duration-200 cursor-pointer rounded-2xl ${
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

        {/* 3. DEEP CONTEXT CARD (EXPANDED ON HOVER OR SELECTION) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`p-5 rounded-2xl transition-all ${
              activeStepState === 'ACTIVE'
                ? 'bg-gradient-to-br from-darkroom-card to-darkroom-surface border border-tool-diligence/40 shadow-lg shadow-[var(--color-tool-diligence)]/10'
                : activeStepState === 'COMPLETED'
                  ? 'bg-darkroom-card border border-darkroom-border'
                  : 'bg-darkroom-surface/40 border-2 border-dashed border-slate-700/80 shadow-inner'
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
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                      Stage 0{activeStep.stepNumber}
                    </span>
                    <span className="text-slate-600">•</span>
                    <h3 className="text-base font-bold text-white">{activeStep.name}</h3>
                  </div>
                  <p className="text-xs font-mono text-slate-400">{activeStep.role}</p>
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
                  <span>{activeStepState === 'PENDING' ? 'PENDING (NOT STARTED)' : activeStepState}</span>
                </span>
              </div>
            </div>

            {/* Step Inner Working Description */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left 2 Cols: Description & Details */}
              <div className="md:col-span-2 space-y-3">
                <p className="text-sm text-slate-300 leading-relaxed">{activeStep.description}</p>

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
              </div>

              {/* Right Col: Tools & Live Log Peek */}
              <div className={`p-3.5 rounded-xl border space-y-3 flex flex-col justify-between ${activeStepState === 'PENDING' ? 'bg-darkroom-bg/50 border-dashed border-slate-700/60' : 'bg-darkroom-bg border-darkroom-border'}`}>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
                    <Zap className="size-3" />
                    <span>Engines & Tools</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {activeStep.toolsUsed.map((tool, tIdx) => (
                      <span
                        key={tIdx}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-mono ${activeStepState === 'PENDING' ? 'bg-darkroom-card/50 text-slate-400 border border-dashed border-slate-700/60' : 'bg-darkroom-card text-slate-300 border border-darkroom-border'}`}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Latest Event for this Agent */}
                {relatedEvents.length > 0 && (
                  <div className="pt-2 border-t border-paper-card border-darkroom-card">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">
                      Latest Activity:
                    </span>
                    <p className="text-xs font-mono text-emerald-300 line-clamp-2 leading-tight">
                      "{relatedEvents[relatedEvents.length - 1].message}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. Live SSE Activity Stream Console */}
      {events.length > 0 && (
        <div className="rounded-3xl bg-darkroom-surface overflow-hidden shadow-2xl shadow-black/80">
          <div className="p-4 sm:px-6 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2 font-semibold">
              <span
                className={`size-2 rounded-full bg-tool-diligence ${reducedMotion ? '' : 'animate-pulse'}`}
              />
              <Terminal className="size-3.5 text-indigo-400" />
              <span>Live Agent Event Log</span>
            </span>
            <span className="text-xs font-mono text-slate-400">{events.length} events recorded</span>
          </div>

          <div className="p-4 sm:p-5 max-h-60 overflow-y-auto space-y-2.5 text-xs font-mono bg-darkroom-bg/60">
            {events.map((evt, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 leading-relaxed hover:bg-darkroom-surface/40 p-1 rounded-lg transition-colors"
                >
                  <span className="text-slate-400 text-[11px] shrink-0 pt-0.5 font-mono">
                    {evt.timestamp
                      ? new Date(evt.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : ''}
                  </span>
                  <span className="text-tool-diligence font-semibold shrink-0">
                    [{evt.agentName}]
                  </span>
                  <span className="text-slate-200 flex-1 break-words">{evt.message}</span>
                </div>
              ))}
            <div ref={eventsEndRef} />
          </div>
        </div>
      )}
    </motion.div>
  );
};
