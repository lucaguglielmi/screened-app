import React, { useState, useEffect, useRef } from 'react';
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
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
    role: 'Entity Resolution & Registry Lookup',
    description: 'Searches global film festival indices, official domains, and corporate filings to resolve the precise festival identity and eliminate name collisions.',
    details: [
      'Disambiguates festival variants and editions',
      'Corroborates official website & corporate registration',
      'Prevents investigation contamination from namesake events'
    ],
    toolsUsed: ['Parallel Web Search', 'Entity Resolution Engine'],
    icon: Bot,
    activeStatus: ['DISAMBIGUATING', 'AWAITING_ENTITY_CONFIRMATION'],
  },
  {
    id: 'planner',
    stepNumber: 2,
    name: 'Planner',
    shortLabel: 'Strategy',
    role: '3-Domain Investigative Strategy',
    description: 'Decomposes the confirmed entity into targeted forensic research matrices across Festival Policies, Organizer Credentials, and Participant Footprints.',
    details: [
      'Generates 12+ targeted Parallel Search queries',
      'Structures parallel investigation vectors',
      'Configures forensic verification hypotheses'
    ],
    toolsUsed: ['ADK Planner Agent', 'Gemini 2.5 Flash'],
    icon: Sparkles,
    activeStatus: ['PLANNING'],
  },
  {
    id: 'parallel_agents',
    stepNumber: 3,
    name: 'Parallel Domain Agents',
    shortLabel: 'Deep Search',
    role: 'Multi-Agent Autonomous Web Crawl',
    description: 'Concurrently executes deep web crawling across venue contracts, press archives, regulatory databases, and filmmaker forums.',
    details: [
      'Parallel multi-domain data ingestion',
      'Extracts raw source documents and tier scores',
      'Cross-checks physical screening theater leases'
    ],
    toolsUsed: ['Parallel Search API', 'Multi-Agent Dispatcher'],
    icon: Search,
    activeStatus: ['RESEARCHING'],
  },
  {
    id: 'claim_extractor',
    stepNumber: 4,
    name: 'ClaimExtractor',
    shortLabel: 'Evidence',
    role: 'Substring-Verified Claim Extraction',
    description: 'Parses webpage texts and isolates atomic factual claims, enforcing strict character-exact substring matching to eliminate AI hallucinations.',
    details: [
      'Exact character-level substring ground truth',
      'Synthesizes atomic claims with certainty tiers',
      'Tags fee transparency & submission timelines'
    ],
    toolsUsed: ['Exact Substring Matcher', 'Gemini Extraction Core'],
    icon: Layers,
    activeStatus: ['RESEARCHING', 'ANALYZING_CONTRADICTIONS'],
  },
  {
    id: 'contradiction_analyst',
    stepNumber: 5,
    name: 'ContradictionAnalyst',
    shortLabel: 'Scrutiny',
    role: 'Dispute & Conflict Cross-Examination',
    description: 'Cross-examines corroborating vs opposing claims, identifying fee disputes, deceptive laurel awards, or fake venue addresses.',
    details: [
      'Detects conflicting prize and fee statements',
      'Calculates source tier discrepancy penalties',
      'Flags unverified claims for sandbox outreach'
    ],
    toolsUsed: ['Dispute Resolution Matrix', 'Forensic Scoring Core'],
    icon: Scale,
    activeStatus: ['ANALYZING_CONTRADICTIONS'],
  },
  {
    id: 'report_writer',
    stepNumber: 6,
    name: 'ReportWriter',
    shortLabel: 'Dossier',
    role: 'Cryptographic Dossier Synthesis',
    description: 'Assembles the finalized due diligence report with verified claims, dispute matrices, and SHA-256 cryptographic provenance signature.',
    details: [
      'Generates executive summary & risk ratings',
      'Computes overall authenticity rating (0-100)',
      'Generates SHA-256 tamper-proof payload hash'
    ],
    toolsUsed: ['Dossier Synthesizer', 'SHA-256 Signer'],
    icon: FileText,
    activeStatus: ['ASSEMBLING_DOSSIER'],
  },
];

// Helper to determine status for each timeline step
function getStepState(step: TimelineStep, currentStatus: InvestigationStatus): 'COMPLETED' | 'ACTIVE' | 'PENDING' {
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

  const currentIdx = statusOrder.indexOf(currentStatus);

  if (step.activeStatus.includes(currentStatus)) {
    return 'ACTIVE';
  }

  // Find the highest status index associated with this step
  const stepIndices = step.activeStatus.map(s => statusOrder.indexOf(s));
  const maxStepIdx = Math.max(...stepIndices);

  if (currentIdx > maxStepIdx) {
    return 'COMPLETED';
  }

  return 'PENDING';
}

export const LiveProgress: React.FC<Props> = ({
  status,
  events,
  festivalName,
}) => {
  const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  // Auto-select the active step on status change if user hasn't manually selected
  useEffect(() => {
    const activeIdx = TIMELINE_STEPS.findIndex(s => getStepState(s, status) === 'ACTIVE');
    if (activeIdx !== -1 && selectedStepIndex === null) {
      // Keep focused on active
    }
  }, [status, selectedStepIndex]);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  // Compute overall progress percentage
  const activeStepIdx = TIMELINE_STEPS.findIndex(s => getStepState(s, status) === 'ACTIVE');
  const completedCount = TIMELINE_STEPS.filter(s => getStepState(s, status) === 'COMPLETED').length;
  
  const progressPercent = status === 'READY' 
    ? 100 
    : activeStepIdx >= 0 
      ? Math.round(((activeStepIdx + 0.5) / TIMELINE_STEPS.length) * 100)
      : Math.round((completedCount / TIMELINE_STEPS.length) * 100);

  // Active step or selected step for inspection spotlight
  const inspectedStepIndex = hoveredStepIndex !== null 
    ? hoveredStepIndex 
    : selectedStepIndex !== null 
      ? selectedStepIndex 
      : activeStepIdx >= 0 
        ? activeStepIdx 
        : 0;

  const activeStep = TIMELINE_STEPS[inspectedStepIndex] || TIMELINE_STEPS[0];
  const activeStepState = getStepState(activeStep, status);

  // Find latest events related to the inspected agent
  const relatedEvents = events.filter(e => 
    e.agentName.toLowerCase().includes(activeStep.name.toLowerCase()) ||
    activeStep.name.toLowerCase().includes(e.agentName.toLowerCase()) ||
    (activeStep.id === 'parallel_agents' && (e.agentName.includes('Domain') || e.agentName.includes('Search')))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#0E1124] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-2xl shadow-black/80 relative overflow-hidden">
        {/* Glow ambient accent behind header */}
        <div className="absolute -right-20 -top-20 size-60 rounded-full bg-[#2018E6]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 size-60 rounded-full bg-[#00D29E]/10 blur-3xl pointer-events-none" />

        <div className="space-y-1.5 z-10 min-w-0">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#00D29E]">
            <Loader2 className="size-3.5 animate-spin" />
            <span className="font-semibold">Autonomous Multi-Agent Pipeline Active</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
            Investigating {festivalName}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            Executing live Parallel Search API calls and Gemini claim extraction across 3 domains.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 z-10 shrink-0">
          <div className="px-4 py-1.5 rounded-xl bg-[#00D29E]/15 text-[#00D29E] text-xs font-mono font-semibold flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#00D29E] animate-pulse" />
            <span>State: {status}</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Pipeline Progress: <span className="text-white font-semibold">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* 2. THE SINGLE NEAT TIMELINE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1124] shadow-2xl shadow-black/80 space-y-6 relative">
        
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
        <div className="relative py-6 px-2 sm:px-6">
          {/* Background Connecting Rail */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-[#1A2045] rounded-full z-0" />

          {/* Animated Gradient Active Fill Rail */}
          <motion.div 
            className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#2018E6] via-[#00D29E] to-emerald-400 rounded-full z-0 shadow-sm shadow-[#00D29E]/50"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(5, Math.min(100, progressPercent))}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ maxWidth: 'calc(100% - 4rem)' }}
          />

          {/* Timeline Nodes Grid */}
          <div className="relative z-10 flex items-center justify-between w-full">
            {TIMELINE_STEPS.map((step, idx) => {
              const state = getStepState(step, status);
              const isHovered = hoveredStepIndex === idx;
              const isSelected = selectedStepIndex === idx;
              const isInspected = inspectedStepIndex === idx;
              const Icon = step.icon;

              return (
                <div 
                  key={step.id}
                  className="flex flex-col items-center relative group"
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
                  {/* Interactive Dot / Node */}
                  <button
                    className={`relative flex items-center justify-center transition-all duration-200 cursor-pointer rounded-2xl ${
                      state === 'ACTIVE'
                        ? 'size-11 sm:size-12 bg-gradient-to-tr from-[#00D29E] to-emerald-400 text-slate-950 shadow-xl shadow-[#00D29E]/40 ring-4 ring-[#00D29E]/30 scale-110'
                        : state === 'COMPLETED'
                          ? 'size-9 sm:size-10 bg-[#00D29E]/20 border border-[#00D29E]/60 text-[#00D29E] shadow-md shadow-[#00D29E]/20 hover:scale-105 hover:bg-[#00D29E]/30'
                          : 'size-9 sm:size-10 bg-[#121633] border border-[#22274C] text-slate-400 hover:text-slate-200 hover:border-slate-500 hover:scale-105'
                    } ${isSelected ? 'ring-2 ring-[#00D29E]' : isInspected && state !== 'ACTIVE' ? 'ring-2 ring-indigo-400/60 border-indigo-400' : ''}`}
                    title={`${step.stepNumber}. ${step.name}`}
                  >
                    {/* Active Ping Ripple */}
                    {state === 'ACTIVE' && (
                      <span className="absolute -inset-1.5 rounded-2xl bg-[#00D29E] opacity-30 animate-ping pointer-events-none" />
                    )}

                    {/* Step Icon or Checkmark */}
                    {state === 'COMPLETED' ? (
                      <CheckCircle2 className="size-4.5 sm:size-5 text-[#00D29E]" />
                    ) : state === 'ACTIVE' ? (
                      <Icon className="size-5 sm:size-5.5 text-slate-950 animate-pulse" />
                    ) : (
                      <Icon className="size-4 sm:size-4.5" />
                    )}

                    {/* Step Number Small Badge */}
                    <span className={`absolute -top-1.5 -right-1.5 size-4 rounded-full text-[9px] font-mono font-bold flex items-center justify-center shadow ${
                      state === 'ACTIVE'
                        ? 'bg-slate-950 text-[#00D29E] border border-[#00D29E]'
                        : state === 'COMPLETED'
                          ? 'bg-[#00D29E] text-slate-950'
                          : 'bg-[#1E2552] text-slate-400 border border-[#262E63]'
                    }`}>
                      {step.stepNumber}
                    </span>
                  </button>

                  {/* Node Label Below */}
                  <div className="mt-3 flex flex-col items-center text-center select-none">
                    <span className={`text-[11px] sm:text-xs font-semibold font-mono tracking-tight transition-colors ${
                      state === 'ACTIVE'
                        ? 'text-[#00D29E] font-bold'
                        : state === 'COMPLETED'
                          ? 'text-slate-200'
                          : 'text-slate-400'
                    }`}>
                      {step.shortLabel}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
                      {step.name.length > 12 ? step.name.slice(0, 10) + '..' : step.name}
                    </span>
                  </div>

                  {/* MINI HOVER TOOLTIP BADGE */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-[#070913] text-slate-100 text-xs font-mono whitespace-nowrap shadow-xl border border-[#22274C] z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-150 flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full ${
                        state === 'ACTIVE' ? 'bg-[#00D29E] animate-pulse' : state === 'COMPLETED' ? 'bg-[#00D29E]' : 'bg-slate-500'
                      }`} />
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
            className={`p-5 rounded-2xl border transition-all ${
              activeStepState === 'ACTIVE'
                ? 'bg-gradient-to-br from-[#121938] to-[#0E132D] border-[#00D29E]/40 shadow-lg shadow-[#00D29E]/10'
                : activeStepState === 'COMPLETED'
                  ? 'bg-[#10142D] border-[#1E2554]'
                  : 'bg-[#0C0F24] border-[#1B2042]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1B2042] pb-3.5">
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                  activeStepState === 'ACTIVE'
                    ? 'bg-[#00D29E] text-slate-950 shadow-md shadow-[#00D29E]/30'
                    : activeStepState === 'COMPLETED'
                      ? 'bg-[#00D29E]/20 text-[#00D29E] border border-[#00D29E]/40'
                      : 'bg-[#181D40] text-slate-400 border border-[#242A58]'
                }`}>
                  <activeStep.icon className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                      Stage 0{activeStep.stepNumber}
                    </span>
                    <span className="text-slate-600">•</span>
                    <h3 className="text-base font-bold text-white">
                      {activeStep.name}
                    </h3>
                  </div>
                  <p className="text-xs font-mono text-slate-400">
                    {activeStep.role}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 ${
                  activeStepState === 'ACTIVE'
                    ? 'bg-[#00D29E]/20 text-[#00D29E] border border-[#00D29E]/40 animate-pulse'
                    : activeStepState === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800/60 text-slate-400 border border-slate-700/60'
                }`}>
                  {activeStepState === 'ACTIVE' && <Loader2 className="size-3 animate-spin" />}
                  {activeStepState === 'COMPLETED' && <CheckCircle2 className="size-3" />}
                  <span>{activeStepState}</span>
                </span>
              </div>
            </div>

            {/* Step Inner Working Description */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left 2 Cols: Description & Details */}
              <div className="md:col-span-2 space-y-3">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {activeStep.description}
                </p>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    Key Execution Objectives:
                  </span>
                  <ul className="space-y-1">
                    {activeStep.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2 text-xs text-slate-400">
                        <ChevronRight className="size-3.5 text-[#00D29E] shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Col: Tools & Live Log Peek */}
              <div className="p-3.5 rounded-xl bg-[#070914] border border-[#1B2042] space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
                    <Zap className="size-3" />
                    <span>Engines & Tools</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {activeStep.toolsUsed.map((tool, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 rounded-lg bg-[#141938] text-[11px] font-mono text-slate-300 border border-[#22274C]">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Latest Event for this Agent */}
                {relatedEvents.length > 0 && (
                  <div className="pt-2 border-t border-[#161B38]">
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
      <div className="rounded-3xl bg-[#0E1124] overflow-hidden shadow-2xl shadow-black/80">
        <div className="p-4 sm:px-6 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2 font-semibold">
            <span className="size-2 rounded-full bg-[#00D29E] animate-pulse" />
            <Terminal className="size-3.5 text-indigo-400" />
            <span>Live Agent Event Log</span>
          </span>
          <span className="text-xs font-mono text-slate-400">
            {events.length} events recorded
          </span>
        </div>

        <div className="p-4 sm:p-5 max-h-60 overflow-y-auto space-y-2.5 text-xs font-mono bg-[#070913]/60">
          {events.length === 0 ? (
            <div className="text-slate-400 text-center py-6 text-xs font-mono flex flex-col items-center gap-2">
              <Loader2 className="size-4 animate-spin text-indigo-400" />
              <span>Awaiting agent execution events...</span>
            </div>
          ) : (
            events.map((evt, idx) => (
              <div key={idx} className="flex items-start gap-2.5 leading-relaxed hover:bg-[#121633]/40 p-1 rounded-lg transition-colors">
                <span className="text-slate-400 text-[11px] shrink-0 pt-0.5 font-mono">
                  {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                </span>
                <span className="text-[#00D29E] font-semibold shrink-0">
                  [{evt.agentName}]
                </span>
                <span className="text-slate-200 flex-1 break-words">
                  {evt.message}
                </span>
              </div>
            ))
          )}
          <div ref={eventsEndRef} />
        </div>
      </div>
    </motion.div>
  );
};
