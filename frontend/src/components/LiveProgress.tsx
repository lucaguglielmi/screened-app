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
      <div className="p-6 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Loader2 className="size-3.5 animate-spin" />
            <span>Autonomous Multi-Agent Pipeline Active</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-paper-text dark:text-darkroom-text">
            Investigating {festivalName}
          </h2>
          <p className="text-xs text-paper-muted dark:text-darkroom-muted">
            Executing live Parallel Search API calls and Gemini claim extraction across 3 domains.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono">
          State: {status}
        </div>
      </div>

      {/* Agents Multi-Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
              className={`p-3.5 rounded-xl border transition-all ${
                isActive
                  ? 'border-indigo-600 bg-indigo-500/5 dark:border-indigo-500 dark:bg-indigo-500/10 shadow-sm'
                  : 'border-paper-border dark:border-darkroom-border bg-paper-card/50 dark:bg-darkroom-card/50 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'bg-neutral-500/10 text-neutral-500'}`}>
                  <Icon className="size-4" />
                </div>
                {isActive ? (
                  <span className="size-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                ) : isDone ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                ) : (
                  <span className="size-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                )}
              </div>

              <div className="mt-2.5">
                <div className="font-serif font-medium text-xs text-paper-text dark:text-darkroom-text truncate">
                  {agent.name}
                </div>
                <div className="text-[10px] font-mono text-paper-muted dark:text-darkroom-muted truncate">
                  {agent.role}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live SSE Activity Stream Console */}
      <div className="rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border overflow-hidden">
        <div className="p-4 border-b border-paper-border dark:border-darkroom-border flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-paper-muted dark:text-darkroom-muted flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Activity Stream (SSE)
          </span>
          <span className="text-[11px] font-mono text-paper-muted dark:text-darkroom-muted">
            {events.length} events logged
          </span>
        </div>

        <div className="p-4 max-h-64 overflow-y-auto space-y-2.5 text-xs font-mono">
          {events.length === 0 ? (
            <div className="text-paper-muted dark:text-darkroom-muted text-center py-6">
              Awaiting agent events...
            </div>
          ) : (
            events.map((evt, idx) => (
              <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-paper-muted dark:text-darkroom-muted text-[10px] shrink-0 pt-0.5">
                  {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : ''}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">
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
