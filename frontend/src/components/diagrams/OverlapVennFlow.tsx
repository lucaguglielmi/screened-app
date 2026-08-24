import React, { useMemo } from 'react';
import { Node, Edge, MarkerType } from '@xyflow/react';
import { ScreenedFlowCanvas } from './ScreenedFlowCanvas';
import { Award } from 'lucide-react';

interface Props {
  festAName?: string;
  festBName?: string;
  festATags?: string[];
  festBTags?: string[];
}

export const OverlapVennFlow: React.FC<Props> = ({
  festAName = 'Sundance Film Festival',
  festBName = 'Tribeca Film Festival',
}) => {
  const { nodes, edges } = useMemo(() => {
    const rawNodes: Node[] = [];
    const rawEdges: Edge[] = [];

    // Shared Honors (Intersection)
    rawNodes.push({
      id: 'shared-honors',
      position: { x: 320, y: 140 },
      data: {
        label: 'Shared Accreditation Scope',
        sublabel: 'Academy Awards (Oscars) Qualifying',
        details:
          'Award winners across eligible competition categories at both festivals qualify for Oscar consideration.',
      },
      style: {
        background: 'var(--color-darkroom-card)',
        color: 'var(--color-accent-gold)',
        border: '2px solid var(--color-accent-gold)',
        borderRadius: '16px',
        padding: '14px 18px',
        width: 240,
        boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.3)',
        fontSize: '11px',
      },
    });

    // Festival A Exclusive
    rawNodes.push({
      id: 'fest-a-exclusive',
      position: { x: 60, y: 140 },
      data: {
        label: `${festAName} Exclusive`,
        sublabel: 'BAFTA Qualifying · FIAPF Accredited',
        details: 'Recognised by the British Academy Film Awards for UK Debut & Shorts categories.',
      },
      style: {
        background: 'var(--color-darkroom-card)',
        color: 'var(--color-tool-diligence)',
        border: '1.5px solid var(--color-tool-diligence)',
        borderRadius: '14px',
        padding: '12px 16px',
        width: 220,
        fontSize: '11px',
      },
    });

    // Festival B Exclusive
    rawNodes.push({
      id: 'fest-b-exclusive',
      position: { x: 620, y: 140 },
      data: {
        label: `${festBName} Exclusive`,
        sublabel: 'BIFA Qualifying · Tribeca Industry Market',
        details: 'Direct pipeline to US distribution sales agencies and BIFA discovery longlists.',
      },
      style: {
        background: 'var(--color-darkroom-card)',
        color: 'var(--color-royal-violet)',
        border: '1.5px solid var(--color-royal-violet)',
        borderRadius: '14px',
        padding: '12px 16px',
        width: 220,
        fontSize: '11px',
      },
    });

    // Top Summary Node
    rawNodes.push({
      id: 'top-summary',
      position: { x: 340, y: 20 },
      data: {
        label: 'Accreditation & Industry Honor Scope',
      },
      style: {
        background: 'var(--color-darkroom-surface)',
        color: 'var(--color-white)',
        border: '1.5px solid var(--color-midnight-royal)',
        borderRadius: '12px',
        padding: '8px 16px',
        width: 200,
        fontSize: '11px',
      },
    });

    rawEdges.push({
      id: 'e-top-shared',
      source: 'top-summary',
      target: 'shared-honors',
      style: { stroke: 'var(--color-accent-gold)', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-accent-gold)' },
    });

    rawEdges.push({
      id: 'e-top-a',
      source: 'top-summary',
      target: 'fest-a-exclusive',
      style: { stroke: 'var(--color-tool-diligence)', strokeWidth: 1.2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-tool-diligence)' },
    });

    rawEdges.push({
      id: 'e-top-b',
      source: 'top-summary',
      target: 'fest-b-exclusive',
      style: { stroke: 'var(--color-royal-violet)', strokeWidth: 1.2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-royal-violet)' },
    });

    return { nodes: rawNodes, edges: rawEdges };
  }, [festAName, festBName]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-mono text-slate-300 px-1">
        <Award className="size-4 text-amber-400" />
        <span className="font-bold uppercase tracking-wider">
          Accreditation & Qualifying Honors Overlap
        </span>
      </div>

      <ScreenedFlowCanvas
        nodes={nodes}
        edges={edges}
        className="h-[320px] w-full"
        showMiniMap={false}
      />
    </div>
  );
};
