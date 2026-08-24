import React, { useMemo } from 'react';
import { Node, Edge, MarkerType } from '@xyflow/react';
import { ScreenedFlowCanvas } from './ScreenedFlowCanvas';
import { Clock } from 'lucide-react';

interface Props {
  festAName?: string;
  festBName?: string;
}

export const DeadlineRaceTimeline: React.FC<Props> = ({
  festAName = 'Sundance',
  festBName = 'Tribeca',
}) => {
  const { nodes, edges } = useMemo(() => {
    const rawNodes: Node[] = [];
    const rawEdges: Edge[] = [];

    // Milestone 1: Fest A Earlybird
    rawNodes.push({
      id: 'm1',
      position: { x: 40, y: 120 },
      data: {
        label: `${festAName} Earlybird`,
        date: 'July 15',
        fee: '$75',
      },
      style: {
        background: '#141834',
        color: '#F8F9FC',
        border: '1.5px solid #00D29E',
        borderRadius: '12px',
        padding: '10px 14px',
        width: 170,
        fontSize: '11px',
      },
    });

    // Milestone 2: Fest B Earlybird
    rawNodes.push({
      id: 'm2',
      position: { x: 250, y: 120 },
      data: {
        label: `${festBName} Earlybird`,
        date: 'August 20',
        fee: '$60',
      },
      style: {
        background: '#141834',
        color: '#F8F9FC',
        border: '1.5px solid #8B5CF6',
        borderRadius: '12px',
        padding: '10px 14px',
        width: 170,
        fontSize: '11px',
      },
    });

    // Milestone 3: Fest A Notification Date
    rawNodes.push({
      id: 'm3',
      position: { x: 460, y: 120 },
      data: {
        label: `${festAName} Notification`,
        date: 'December 08',
        role: 'Selection Verdict',
      },
      style: {
        background: '#1D1A38',
        color: '#F59E0B',
        border: '2px solid #F59E0B',
        borderRadius: '12px',
        padding: '10px 14px',
        width: 180,
        fontSize: '11px',
      },
    });

    // Milestone 4: Fest B Late Window / Festival Run
    rawNodes.push({
      id: 'm4',
      position: { x: 680, y: 120 },
      data: {
        label: `${festBName} Notification`,
        date: 'February 15',
        role: 'Selection Verdict',
      },
      style: {
        background: '#141834',
        color: '#00D29E',
        border: '1.5px solid #00D29E',
        borderRadius: '12px',
        padding: '10px 14px',
        width: 180,
        fontSize: '11px',
      },
    });

    // Connecting Edges
    rawEdges.push({
      id: 'e-m1-m2',
      source: 'm1',
      target: 'm2',
      label: '+35 Days',
      style: { stroke: '#9499B8', strokeWidth: 1.2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#9499B8' },
    });

    rawEdges.push({
      id: 'e-m2-m3',
      source: 'm2',
      target: 'm3',
      label: 'Deliberation',
      animated: true,
      style: { stroke: '#F59E0B', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B' },
    });

    rawEdges.push({
      id: 'e-m3-m4',
      source: 'm3',
      target: 'm4',
      label: 'Rollover',
      style: { stroke: '#00D29E', strokeWidth: 1.2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#00D29E' },
    });

    return { nodes: rawNodes, edges: rawEdges };
  }, [festAName, festBName]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <Clock className="size-4 text-indigo-400" />
          <span className="font-bold uppercase tracking-wider">Submission Race & Rollover Timeline</span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400">Zero Premiere Forfeiture Conflict</span>
      </div>

      <ScreenedFlowCanvas
        nodes={nodes}
        edges={edges}
        className="h-[280px] w-full"
        showMiniMap={false}
      />
    </div>
  );
};
