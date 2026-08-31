import React, { useMemo } from 'react';
import {
  ReactFlow,
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
  Network,
} from 'lucide-react';
import clsx from 'clsx';

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
    <div className="space-y-3">
      {/* Header */}
      <div className="border-b border-darkroom-border pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Network className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-serif">Entity &amp; Directorship Connection Network</h4>
            <span className="text-[11px] text-slate-400 block">
              Structural cross-entity linkages, shared corporate directorships, and sister festival networks.
            </span>
          </div>
        </div>
      </div>

      {/* Embedded Non-Hijacking Diagram */}
      <div className="w-full h-[400px] sm:h-[450px] rounded-2xl border border-darkroom-border/60 bg-darkroom-bg overflow-hidden shadow-2xl">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.25}
          maxZoom={1.2}
          zoomOnScroll={false}
          panOnScroll={false}
          zoomOnPinch={true}
          panOnDrag={true}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          proOptions={{ hideAttribution: true }}
          colorMode="dark"
        >
          <Background color="var(--color-midnight-base)" gap={20} size={1.2} />
        </ReactFlow>
      </div>

      {/* Forensic Takeaway Footer */}
      {hasSuspects && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-slate-200 leading-relaxed flex items-start gap-3">
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
  );
};
