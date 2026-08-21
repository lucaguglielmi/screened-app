import React, { useEffect, useRef } from 'react';
import { ActivityEvent, InvestigationStatus } from '../types/investigation';
import { 
  Bot, 
  Search, 
  Sparkles, 
  Layers, 
  Scale, 
  FileText, 
  CheckCircle2, 
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  status: InvestigationStatus;
  events: ActivityEvent[];
  festivalName: string;
}

interface AgentCard {
  name: string;
  role: string;
  icon: React.ElementType;
  activeStatus: InvestigationStatus[];
}

const AGENTS: AgentCard[] = [
  {
    name: 'Disambiguator',
    role: 'Identity Verification',
    icon: Bot,
    activeStatus: ['DISAMBIGUATING', 'AWAITING_ENTITY_CONFIRMATION'],
  },
  {
    name: 'Planner',
    role: '3-Domain Strategy',
    icon: Sparkles,
    activeStatus: ['PLANNING'],
  },
  {
    name: 'Parallel Domain Agents',
    role: 'Festival, Organizer & Participants',
    icon: Search,
    activeStatus: ['RESEARCHING'],
  },
  {
    name: 'ClaimExtractor',
    role: 'Substring Excerpt Validation',
    icon: Layers,
    activeStatus: ['RESEARCHING', 'ANALYZING_CONTRADICTIONS'],
  },
  {
    name: 'ContradictionAnalyst',
    role: 'Dispute & Conflict Analysis',
    icon: Scale,
    activeStatus: ['ANALYZING_CONTRADICTIONS'],
  },
  {
    name: 'ReportWriter',
    role: 'Neutral Dossier Synthesis',
    icon: FileText,
    activeStatus: ['ASSEMBLING_DOSSIER'],
  },
];

export const LiveProgress: React.FC<Props> = ({
  status,
  events,
  festivalName,
}) => {
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#00D29E]">
            <Loader2 className="size-3.5 animate-spin" />
            <span>Autonomous Multi-Agent Pipeline Active</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-paper-text dark:text-darkroom-text">
            Investigating {festivalName}
          </h2>
          <p className="text-base text-paper-muted dark:text-darkroom-muted leading-relaxed">
            Executing live Parallel Search API calls and Gemini claim extraction across 3 domains.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-[#00D29E]/15 border border-[#00D29E]/30 text-[#00D29E] text-xs font-mono font-semibold">
          State: {status}
        </div>
      </div>

      {/* Agents Multi-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {AGENTS.map((agent, idx) => {
          const isActive = agent.activeStatus.includes(status);
          const isDone = 
            (status === 'READY') ||
            (agent.name === 'Disambiguator' && !['DRAFT', 'DISAMBIGUATING'].includes(status)) ||
            (agent.name === 'Planner' && ['RESEARCHING', 'ANALYZING_CONTRADICTIONS', 'ASSEMBLING_DOSSIER', 'READY'].includes(status));

          const Icon = agent.icon;

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                isActive
                  ? 'border-[#00D29E] bg-[#00D29E]/10 dark:border-[#00D29E] dark:bg-[#00D29E]/10 shadow-md'
                  : 'border-paper-border dark:border-darkroom-border bg-paper-card/50 dark:bg-darkroom-card/50 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${isActive ? 'bg-[#00D29E] text-slate-950 shadow-md shadow-[#00D29E]/30' : 'bg-neutral-500/10 text-neutral-400'}`}>
                  <Icon className="size-4.5" />
                </div>
                {isActive ? (
                  <span className="size-2.5 rounded-full bg-[#00D29E] animate-pulse" />
                ) : isDone ? (
                  <CheckCircle2 className="size-4 text-[#00D29E]" />
                ) : (
                  <span className="size-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                )}
              </div>

              <div className="mt-3">
                <div className="font-serif font-bold text-sm text-paper-text dark:text-darkroom-text truncate">
                  {agent.name}
                </div>
                <div className="text-xs font-mono text-paper-muted dark:text-darkroom-muted truncate">
                  {agent.role}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live SSE Activity Stream Console */}
      <div className="rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border overflow-hidden shadow-sm">
        <div className="p-4 border-b border-paper-border dark:border-darkroom-border flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-paper-muted dark:text-darkroom-muted flex items-center gap-2 font-semibold">
            <span className="size-2 rounded-full bg-[#00D29E] animate-pulse" />
            Live Activity Stream (SSE)
          </span>
          <span className="text-xs font-mono text-paper-muted dark:text-darkroom-muted">
            {events.length} events logged
          </span>
        </div>

        <div className="p-4 max-h-64 overflow-y-auto space-y-2.5 text-sm font-mono">
          {events.length === 0 ? (
            <div className="text-paper-muted dark:text-darkroom-muted text-center py-6 text-sm">
              Awaiting agent events...
            </div>
          ) : (
            events.map((evt, idx) => (
              <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-paper-muted dark:text-darkroom-muted text-xs shrink-0 pt-0.5">
                  {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : ''}
                </span>
                <span className="text-[#00D29E] font-semibold shrink-0">
                  [{evt.agentName}]
                </span>
                <span className="text-paper-text dark:text-darkroom-text flex-1">
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
