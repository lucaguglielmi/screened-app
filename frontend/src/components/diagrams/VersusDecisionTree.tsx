import React, { useState, useMemo } from 'react';
import { Node, Edge, MarkerType } from '@xyflow/react';
import { ScreenedFlowCanvas } from './ScreenedFlowCanvas';
import { GitBranch, Trophy, DollarSign, ShieldCheck } from 'lucide-react';

interface FestivalComparisonSpec {
  name: string;
  entryFee: string;
  premierePolicy: string;
  accreditation: string[];
  notificationDate: string;
  ratingScore: number;
}

interface Props {
  festivalA?: FestivalComparisonSpec;
  festivalB?: FestivalComparisonSpec;
}

type StrategyPriority = 'PRESTIGE' | 'COST_ROI' | 'PREMIERE_PROTECTION';

export const VersusDecisionTree: React.FC<Props> = ({
  festivalA = {
    name: 'Sundance Film Festival',
    entryFee: '$110',
    premierePolicy: 'World Premiere Required for Competition',
    accreditation: ['Academy Qualifying', 'BAFTA Recognised', 'FIAPF Spec'],
    notificationDate: 'Dec 08',
    ratingScore: 94,
  },
  festivalB = {
    name: 'Tribeca Film Festival',
    entryFee: '$85',
    premierePolicy: 'US / North American Premiere Required',
    accreditation: ['Academy Qualifying', 'BIFA Recognised'],
    notificationDate: 'Feb 15',
    ratingScore: 88,
  },
}) => {
  const [priority, setPriority] = useState<StrategyPriority>('PRESTIGE');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const { nodes, edges } = useMemo(() => {
    const rawNodes: Node[] = [];
    const rawEdges: Edge[] = [];

    // Root: Filmmaker Slate Objective
    rawNodes.push({
      id: 'root-objective',
      position: { x: 340, y: 20 },
      data: {
        label: `Strategic Submission Objective: ${priority === 'PRESTIGE' ? 'Maximize Global Awards & Distribution' : priority === 'COST_ROI' ? 'Budget Optimization (< £100/call)' : 'Premiere Protection Sequence'}`,
        role: 'Input Film Profile & Strategy Target',
      },
      style: {
        background: 'var(--color-darkroom-surface)',
        color: 'var(--color-white)',
        border: '2px solid var(--color-midnight-royal)',
        borderRadius: '16px',
        padding: '12px 18px',
        width: 280,
        boxShadow: '0 10px 25px -5px rgba(32, 24, 230, 0.4)',
        fontSize: '11px',
      },
    });

    // Branch A: Festival A
    const isAPreferred = priority === 'PRESTIGE' || priority === 'PREMIERE_PROTECTION';
    rawNodes.push({
      id: 'node-fest-a',
      position: { x: 120, y: 150 },
      data: {
        label: festivalA.name,
        fee: festivalA.entryFee,
        policy: festivalA.premierePolicy,
        notify: festivalA.notificationDate,
        isOptimal: isAPreferred,
        details: `Top-tier industry footprint. Notifies on ${festivalA.notificationDate}. ${festivalA.premierePolicy}.`,
      },
      style: {
        background: isAPreferred ? 'var(--color-darkroom-surface)' : 'var(--color-darkroom-card)',
        color: 'var(--color-white)',
        border: isAPreferred ? '2px solid var(--color-tool-diligence)' : '1.5px solid var(--color-midnight-border)',
        borderRadius: '14px',
        padding: '12px 16px',
        width: 240,
        fontSize: '11px',
      },
    });

    rawEdges.push({
      id: 'e-root-a',
      source: 'root-objective',
      target: 'node-fest-a',
      animated: isAPreferred,
      label: isAPreferred ? '★ Priority 1 Route' : 'Alternative',
      style: { stroke: isAPreferred ? 'var(--color-tool-diligence)' : 'var(--color-midnight-border)', strokeWidth: isAPreferred ? 2 : 1 },
      markerEnd: { type: MarkerType.ArrowClosed, color: isAPreferred ? 'var(--color-tool-diligence)' : 'var(--color-midnight-border)' },
    });

    // Branch B: Festival B
    const isBPreferred = priority === 'COST_ROI';
    rawNodes.push({
      id: 'node-fest-b',
      position: { x: 600, y: 150 },
      data: {
        label: festivalB.name,
        fee: festivalB.entryFee,
        policy: festivalB.premierePolicy,
        notify: festivalB.notificationDate,
        isOptimal: isBPreferred,
        details: `Lower entry cost (${festivalB.entryFee}). Notifies on ${festivalB.notificationDate}. Ideal second-window premiere.`,
      },
      style: {
        background: isBPreferred ? 'var(--color-darkroom-surface)' : 'var(--color-darkroom-card)',
        color: 'var(--color-white)',
        border: isBPreferred ? '2px solid var(--color-tool-diligence)' : '1.5px solid var(--color-midnight-border)',
        borderRadius: '14px',
        padding: '12px 16px',
        width: 240,
        fontSize: '11px',
      },
    });

    rawEdges.push({
      id: 'e-root-b',
      source: 'root-objective',
      target: 'node-fest-b',
      animated: isBPreferred,
      label: isBPreferred ? '★ Priority 1 Route' : 'Phase 2 Fallback',
      style: { stroke: isBPreferred ? 'var(--color-tool-diligence)' : 'var(--color-midnight-border)', strokeWidth: isBPreferred ? 2 : 1 },
      markerEnd: { type: MarkerType.ArrowClosed, color: isBPreferred ? 'var(--color-tool-diligence)' : 'var(--color-midnight-border)' },
    });

    // Outcome 1: Accepted at Festival A
    rawNodes.push({
      id: 'outcome-a-accepted',
      position: { x: 50, y: 290 },
      data: {
        label: `Selected at ${festivalA.name}`,
        details: `Lock World Premiere status. Withdraw from competing North American calls to preserve distribution rights.`,
      },
      style: {
        background: 'var(--color-darkroom-surface)',
        color: 'var(--color-tool-diligence)',
        border: '1.5px solid var(--color-tool-diligence)',
        borderRadius: '10px',
        padding: '10px 12px',
        width: 180,
        fontSize: '10px',
      },
    });

    rawEdges.push({
      id: 'e-a-accepted',
      source: 'node-fest-a',
      target: 'outcome-a-accepted',
      label: 'If Selected',
      style: { stroke: 'var(--color-tool-diligence)', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-tool-diligence)' },
    });

    // Outcome 2: Rejected at Festival A -> Immediate Rollover to Festival B
    rawNodes.push({
      id: 'outcome-rollover',
      position: { x: 380, y: 290 },
      data: {
        label: `Rollover to ${festivalB.name}`,
        details: `Submit to ${festivalB.name} immediately before late deadline (${festivalB.notificationDate}). Preserves national premiere qualification.`,
      },
      style: {
        background: 'var(--color-darkroom-surface)',
        color: 'var(--color-white)',
        border: '1.5px solid var(--color-midnight-royal)',
        borderRadius: '10px',
        padding: '10px 12px',
        width: 200,
        fontSize: '10px',
      },
    });

    rawEdges.push({
      id: 'e-a-rollover',
      source: 'node-fest-a',
      target: 'outcome-rollover',
      label: 'If Rejected',
      style: { stroke: 'var(--color-midnight-royal)', strokeWidth: 1.2, strokeDasharray: '4 4' },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-midnight-royal)' },
    });

    // Outcome 3: Dual Qualifying Awards
    rawNodes.push({
      id: 'outcome-dual',
      position: { x: 670, y: 290 },
      data: {
        label: `BAFTA / Oscar Track Secured`,
        details: `Both festivals qualify film for Academy consideration upon competitive selection.`,
      },
      style: {
        background: 'var(--color-darkroom-surface)',
        color: 'var(--color-accent-gold)',
        border: '1.5px solid var(--color-accent-gold)',
        borderRadius: '10px',
        padding: '10px 12px',
        width: 180,
        fontSize: '10px',
      },
    });

    rawEdges.push({
      id: 'e-b-dual',
      source: 'node-fest-b',
      target: 'outcome-dual',
      style: { stroke: 'var(--color-accent-gold)', strokeWidth: 1.2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-accent-gold)' },
    });

    return { nodes: rawNodes, edges: rawEdges };
  }, [festivalA, festivalB, priority]);

  return (
    <div className="space-y-4">
      {/* Strategy Priority Selector Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <GitBranch className="size-4 text-indigo-400" />
          <span className="font-bold uppercase tracking-wider">Interactive Decision Tree</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-darkroom-card text-xs">
          {[
            { id: 'PRESTIGE', label: 'Max Prestige', icon: Trophy },
            { id: 'COST_ROI', label: 'Low Fee / ROI', icon: DollarSign },
            { id: 'PREMIERE_PROTECTION', label: 'Premiere Protection', icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = priority === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPriority(item.id as StrategyPriority)}
                className={`px-3 py-1 rounded-lg font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-midnight-royal text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* React Flow Canvas */}
      <ScreenedFlowCanvas
        nodes={nodes}
        edges={edges}
        onNodeClick={(_e, node) => setSelectedNode(node.data)}
        className="h-[380px] w-full"
      />

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="p-4 rounded-2xl bg-darkroom-card text-xs space-y-1 animate-fade-in shadow-xl">
          <div className="font-bold text-white font-serif text-sm">{selectedNode.label}</div>
          <p className="text-slate-300 leading-relaxed font-sans">
            {selectedNode.details || selectedNode.role}
          </p>
        </div>
      )}
    </div>
  );
};
