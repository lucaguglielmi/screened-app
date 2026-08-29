import React, { useMemo } from 'react';
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
import { AlertTriangle, Building2, Ticket, User, ShieldAlert } from 'lucide-react';
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

// Custom Nodes
const PersonNode = ({ data }: { data: PersonNodeData }) => {
  return (
    <div className={clsx("px-4 py-3 rounded-xl border shadow-lg w-64", data.isSuspect ? "bg-rose-950/40 border-rose-500/50" : "bg-darkroom-surface border-zinc-700")}>
      <Handle type="source" position={Position.Right} id="right-source" className="opacity-0" />
      <Handle type="source" position={Position.Left} id="left-source" className="opacity-0" />
      <div className="flex items-center gap-3">
        <div className={clsx("p-2 rounded-lg", data.isSuspect ? "bg-rose-500/20 text-rose-400" : "bg-indigo-500/20 text-indigo-400")}>
          <User className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-white text-sm">{data.name}</div>
          <div className="text-xs text-zinc-400 font-mono mt-0.5">{data.roles.join(', ')}</div>
        </div>
      </div>
      {data.isSuspect && (
        <div className="mt-3 pt-3 border-t border-rose-500/20 flex flex-col gap-1.5">
          {data.isFestivalMillSuspect && (
             <div className="flex items-center gap-1.5 text-xs text-rose-400">
               <AlertTriangle className="w-3.5 h-3.5" />
               <span>Festival Mill Suspect</span>
             </div>
          )}
          {data.hasDistributionOverlap && (
             <div className="flex items-center gap-1.5 text-xs text-rose-400">
               <ShieldAlert className="w-3.5 h-3.5" />
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
    <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 shadow-md flex items-center gap-2">
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-md">
        <Building2 className="w-4 h-4" />
      </div>
      <div className="font-medium text-zinc-200 text-xs">{data.name}</div>
    </div>
  );
};

const FestivalNode = ({ data }: { data: BasicNodeData }) => {
  return (
    <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 shadow-md flex items-center gap-2">
      <Handle type="target" position={Position.Right} className="opacity-0" />
      <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-md">
        <Ticket className="w-4 h-4" />
      </div>
      <div className="font-medium text-zinc-200 text-xs">{data.name}</div>
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
  const { nodes, edges } = useMemo(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    const companySet = new Set<string>();
    const festivalSet = new Set<string>();

    // First, let's collect unique companies and festivals
    keyPersonnel.forEach(person => {
      (person.companies || []).forEach(c => companySet.add(c));
      (person.associatedFestivals || []).forEach(f => festivalSet.add(f));
    });

    const companyArray = Array.from(companySet);
    const festivalArray = Array.from(festivalSet);

    // X positions
    const PERSON_X = 300;
    const COMPANY_X = 750;
    const FESTIVAL_X = -100;

    // Y spacing
    const Y_SPACING = 150;
    const ITEM_Y_SPACING = 80;

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
          hasDistributionOverlap: person.hasDistributionOverlap
        }
      });
      
      // Connect to companies
      (person.companies || []).forEach(company => {
         newEdges.push({
           id: `edge-${idx}-company-${company}`,
           source: `person-${idx}`,
           target: `company-${company}`,
           sourceHandle: 'right-source',
           animated: isSuspect,
           style: { stroke: isSuspect ? 'var(--color-rose-500)' : 'var(--color-indigo-500)', strokeWidth: 2 },
           markerEnd: { type: MarkerType.ArrowClosed, color: isSuspect ? 'var(--color-rose-500)' : 'var(--color-indigo-500)' }
         });
      });

      // Connect to festivals
      (person.associatedFestivals || []).forEach(festival => {
         newEdges.push({
           id: `edge-${idx}-festival-${festival}`,
           source: `person-${idx}`,
           target: `festival-${festival}`,
           sourceHandle: 'left-source',
           animated: isSuspect,
           style: { stroke: isSuspect ? 'var(--color-rose-500)' : 'var(--color-indigo-500)', strokeWidth: 2 },
           markerEnd: { type: MarkerType.ArrowClosed, color: isSuspect ? 'var(--color-rose-500)' : 'var(--color-indigo-500)' }
         });
      });
    });

    // Place Companies
    companyArray.forEach((company, idx) => {
      newNodes.push({
        id: `company-${company}`,
        type: 'company',
        position: { x: COMPANY_X, y: idx * ITEM_Y_SPACING },
        data: { name: company }
      });
    });

    // Place Festivals
    festivalArray.forEach((festival, idx) => {
      newNodes.push({
        id: `festival-${festival}`,
        type: 'festival',
        position: { x: FESTIVAL_X, y: idx * ITEM_Y_SPACING },
        data: { name: festival }
      });
    });

    return { nodes: newNodes, edges: newEdges };
  }, [keyPersonnel]);

  if (keyPersonnel.length === 0) return null;

  return (
    <div className="w-full h-[500px] rounded-2xl border border-darkroom-border bg-darkroom-bg overflow-hidden mt-6">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--color-zinc-600)" gap={24} size={2} />
        <Controls className="bg-darkroom-surface border-zinc-700 fill-zinc-400" />
      </ReactFlow>
    </div>
  );
};
