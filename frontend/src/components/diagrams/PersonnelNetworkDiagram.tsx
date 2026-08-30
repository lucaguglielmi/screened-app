import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  Edge,
  Node,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { KeyPerson } from '../../types/investigation';
import {
  AlertTriangle,
  Building2,
  Ticket,
  User,
  ShieldAlert,
  Layers,
  Network,
  Maximize2,
  Minimize2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import { soundEffects } from '../../utils/audio';

interface PersonNodeData extends Record<string, unknown> {
  name: string;
  roles: string[];
  isSuspect: boolean;
  isFestivalMillSuspect: boolean;
  hasDistributionOverlap: boolean;
}

interface BasicNodeData extends Record<string, unknown> {
  name: string;
}

// Custom Nodes for Canvas Mode
const PersonNode = ({ data }: { data: PersonNodeData }) => {
  return (
    <div
      className={clsx(
        'px-4 py-3 rounded-2xl border shadow-xl w-72 backdrop-blur-md transition-all',
        data.isSuspect
          ? 'bg-rose-950/60 border-rose-500/60 shadow-rose-950/40'
          : 'bg-darkroom-surface/95 border-zinc-700/80 shadow-black/40',
      )}
    >
      <Handle type="source" position={Position.Right} id="right-source" className="opacity-0" />
      <Handle type="source" position={Position.Left} id="left-source" className="opacity-0" />
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            'p-2.5 rounded-xl shrink-0',
            data.isSuspect ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400',
          )}
        >
          <User className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-white text-sm truncate">{data.name}</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">
            {data.roles.join(', ')}
          </div>
        </div>
      </div>
      {data.isSuspect && (
        <div className="mt-3 pt-3 border-t border-rose-500/20 flex flex-col gap-1.5">
          {data.isFestivalMillSuspect && (
            <div className="flex items-center gap-1.5 text-xs text-rose-300 font-medium">
              <AlertTriangle className="size-3.5 text-rose-400 shrink-0" />
              <span>Festival Mill Suspect</span>
            </div>
          )}
          {data.hasDistributionOverlap && (
            <div className="flex items-center gap-1.5 text-xs text-rose-300 font-medium">
              <ShieldAlert className="size-3.5 text-rose-400 shrink-0" />
              <span>Distribution Overlap</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CompanyNode = ({ data }: { data: BasicNodeData }) => {
  return (
    <div className="px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 shadow-lg flex items-center gap-2.5 max-w-xs">
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <div className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg shrink-0">
        <Building2 className="size-4" />
      </div>
      <div className="font-medium text-zinc-200 text-xs truncate">{data.name}</div>
    </div>
  );
};

const FestivalNode = ({ data }: { data: BasicNodeData }) => {
  return (
    <div className="px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 shadow-lg flex items-center gap-2.5 max-w-xs">
      <Handle type="target" position={Position.Right} className="opacity-0" />
      <div className="p-1.5 bg-amber-500/15 text-amber-400 rounded-lg shrink-0">
        <Ticket className="size-4" />
      </div>
      <div className="font-medium text-zinc-200 text-xs truncate">{data.name}</div>
    </div>
  );
};

const nodeTypes = {
  person: PersonNode,
  company: CompanyNode,
  festival: FestivalNode,
};

interface Props {
  keyPersonnel: KeyPerson[];
}

export const PersonnelNetworkDiagram: React.FC<Props> = ({ keyPersonnel }) => {
  const [displayMode, setDisplayMode] = useState<'RESPONSIVE' | 'CANVAS'>('RESPONSIVE');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Compute graph nodes and edges with generous spacing
  const { nodes, edges } = useMemo(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    const companySet = new Set<string>();
    const festivalSet = new Set<string>();

    keyPersonnel.forEach((person) => {
      (person.companies || []).forEach((c) => companySet.add(c));
      (person.associatedFestivals || []).forEach((f) => festivalSet.add(f));
    });

    const companyArray = Array.from(companySet);
    const festivalArray = Array.from(festivalSet);

    // X positions with generous horizontal clearance
    const FESTIVAL_X = -120;
    const PERSON_X = 400;
    const COMPANY_X = 920;

    // Y spacing
    const Y_SPACING = Math.max(220, (Math.max(companyArray.length, festivalArray.length) * 100) / Math.max(1, keyPersonnel.length));
    const ITEM_Y_SPACING = 95;

    // Place People in the middle column
    keyPersonnel.forEach((person, idx) => {
      const isSuspect = person.isFestivalMillSuspect || person.hasDistributionOverlap;
      newNodes.push({
        id: `person-${idx}`,
        type: 'person',
        position: { x: PERSON_X, y: idx * Y_SPACING },
        data: {
          name: person.name,
          roles: person.roles,
          isSuspect,
          isFestivalMillSuspect: person.isFestivalMillSuspect,
          hasDistributionOverlap: person.hasDistributionOverlap,
        },
      });

      // Connect to companies
      (person.companies || []).forEach((company) => {
        newEdges.push({
          id: `edge-${idx}-company-${company}`,
          source: `person-${idx}`,
          target: `company-${company}`,
          sourceHandle: 'right-source',
          animated: isSuspect,
          style: {
            stroke: isSuspect ? 'var(--color-rose-500)' : 'var(--color-indigo-500)',
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isSuspect ? 'var(--color-rose-500)' : 'var(--color-indigo-500)',
          },
        });
      });

      // Connect to festivals
      (person.associatedFestivals || []).forEach((festival) => {
        newEdges.push({
          id: `edge-${idx}-festival-${festival}`,
          source: `person-${idx}`,
          target: `festival-${festival}`,
          sourceHandle: 'left-source',
          animated: isSuspect,
          style: {
            stroke: isSuspect ? 'var(--color-rose-500)' : 'var(--color-indigo-500)',
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isSuspect ? 'var(--color-rose-500)' : 'var(--color-indigo-500)',
          },
        });
      });
    });

    // Place Companies
    companyArray.forEach((company, idx) => {
      newNodes.push({
        id: `company-${company}`,
        type: 'company',
        position: { x: COMPANY_X, y: idx * ITEM_Y_SPACING },
        data: { name: company },
      });
    });

    // Place Festivals
    festivalArray.forEach((festival, idx) => {
      newNodes.push({
        id: `festival-${festival}`,
        type: 'festival',
        position: { x: FESTIVAL_X, y: idx * ITEM_Y_SPACING },
        data: { name: festival },
      });
    });

    return { nodes: newNodes, edges: newEdges };
  }, [keyPersonnel]);

  const hasSuspects = useMemo(
    () => keyPersonnel.some((p) => p.isFestivalMillSuspect || p.hasDistributionOverlap),
    [keyPersonnel],
  );

  if (keyPersonnel.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Top Toolbar with Mode Switcher & Fullscreen Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-darkroom-surface border border-darkroom-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Sparkles className="size-4" />
          </div>
          <div>
            <span className="text-xs font-mono font-semibold text-white">Connection View</span>
            <span className="text-[10px] text-slate-400 block">
              {displayMode === 'RESPONSIVE'
                ? 'Clean in-page relationship flow (touch & mobile friendly)'
                : 'Interactive pan/zoom topological canvas'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-darkroom-card p-1 rounded-xl border border-darkroom-border">
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setDisplayMode('RESPONSIVE');
            }}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer',
              displayMode === 'RESPONSIVE'
                ? 'bg-midnight-royal text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-darkroom-surface',
            )}
          >
            <Layers className="size-3.5" />
            <span>In-Page Flow</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setDisplayMode('CANVAS');
            }}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer',
              displayMode === 'CANVAS'
                ? 'bg-midnight-royal text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-darkroom-surface',
            )}
          >
            <Network className="size-3.5" />
            <span>Interactive Graph</span>
          </button>

          {displayMode === 'CANVAS' && (
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setIsFullscreen(!isFullscreen);
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-darkroom-surface transition-colors cursor-pointer ml-1"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
            >
              {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* MODE 1: IN-PAGE RESPONSIVE FLOW (Clean, non-canvas, perfect for mobile & structured reading) */}
      {displayMode === 'RESPONSIVE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {keyPersonnel.map((person, idx) => {
              const isSuspect = person.isFestivalMillSuspect || person.hasDistributionOverlap;
              return (
                <div
                  key={`person-flow-${idx}`}
                  className={clsx(
                    'p-5 rounded-2xl border transition-all space-y-4 shadow-xl',
                    isSuspect
                      ? 'bg-darkroom-surface border-rose-500/40 shadow-rose-950/20'
                      : 'bg-darkroom-surface border-darkroom-border',
                  )}
                >
                  {/* Person Identity Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-darkroom-border pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={clsx(
                          'p-2.5 rounded-xl shrink-0',
                          isSuspect ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400',
                        )}
                      >
                        <User className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{person.name}</h4>
                          {isSuspect && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-rose-400 border border-rose-500/30">
                              <AlertTriangle className="size-3" /> Directorship Alert
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {person.roles.join(' • ')}
                        </div>
                      </div>
                    </div>

                    {/* Suspect Alert Badges */}
                    {isSuspect && (
                      <div className="flex flex-wrap items-center gap-2">
                        {person.isFestivalMillSuspect && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300">
                            Festival Mill Pattern
                          </span>
                        )}
                        {person.hasDistributionOverlap && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300">
                            Distribution Overlap
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Connected Entities Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Left Lane: Corporate Directorships */}
                    <div className="p-3.5 rounded-xl bg-darkroom-card/70 border border-darkroom-border/80 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
                        <Building2 className="size-3.5 text-emerald-400" />
                        <span>Corporate Entities & Directorships</span>
                      </div>
                      {person.companies && person.companies.length > 0 ? (
                        <div className="space-y-1.5">
                          {person.companies.map((company, cIdx) => (
                            <div
                              key={`c-${cIdx}`}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-darkroom-surface border border-zinc-700/60 text-xs text-slate-200"
                            >
                              <ArrowRight className="size-3 text-emerald-400 shrink-0" />
                              <span className="font-medium truncate">{company}</span>
                              <span className="ml-auto text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                Active Director
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic py-1">
                          No external corporate directorships registered.
                        </div>
                      )}
                    </div>

                    {/* Right Lane: Associated Festivals */}
                    <div className="p-3.5 rounded-xl bg-darkroom-card/70 border border-darkroom-border/80 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
                        <Ticket className="size-3.5 text-amber-400" />
                        <span>Associated Film Festivals</span>
                      </div>
                      {person.associatedFestivals && person.associatedFestivals.length > 0 ? (
                        <div className="space-y-1.5">
                          {person.associatedFestivals.map((fest, fIdx) => (
                            <div
                              key={`f-${fIdx}`}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-darkroom-surface border border-zinc-700/60 text-xs text-slate-200"
                            >
                              <ArrowRight className="size-3 text-amber-400 shrink-0" />
                              <span className="font-medium truncate">{fest}</span>
                              <span className="ml-auto text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                Linked Festival
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic py-1">
                          No additional linked festivals detected.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Forensic Takeaway Footer */}
          {hasSuspects && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-slate-200 leading-relaxed flex items-start gap-3">
              <ShieldAlert className="size-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300">Forensic Network Assessment:</strong> Key personnel
                hold concurrent directorships across multiple festival entities and commercial sales
                companies. Screened recommends verifying jury independence and checking for paid
                consultancy solicitations.
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: INTERACTIVE CANVAS (Generously spaced topological graph) */}
      {displayMode === 'CANVAS' && (
        <div
          className={clsx(
            'w-full rounded-2xl border border-darkroom-border bg-darkroom-bg overflow-hidden transition-all',
            isFullscreen
              ? 'fixed inset-4 z-50 shadow-2xl h-[calc(100vh-2rem)]'
              : 'h-[520px]',
          )}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.35 }}
            proOptions={{ hideAttribution: true }}
            zoomOnScroll={false}
            preventScrolling={false}
          >
            <Background color="var(--color-zinc-700)" gap={28} size={2} />
            <Controls className="bg-darkroom-surface border-zinc-700 fill-zinc-400" />
          </ReactFlow>
        </div>
      )}
    </div>
  );
};
