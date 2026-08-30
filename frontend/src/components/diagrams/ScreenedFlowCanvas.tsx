import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';

interface ScreenedFlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: OnNodesChange;
  onEdgesChange?: OnEdgesChange;
  nodeTypes?: NodeTypes;
  edgeTypes?: EdgeTypes;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  className?: string;
  minZoom?: number;
  maxZoom?: number;
  fitView?: boolean;
  showMiniMap?: boolean;
  showControls?: boolean;
}

export const ScreenedFlowCanvas: React.FC<ScreenedFlowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  nodeTypes,
  edgeTypes,
  onNodeClick,
  className = 'h-96 w-full',
  minZoom = 0.7,
  maxZoom = 1.2,
  fitView = true,
  showMiniMap = false,
  showControls = false,
}) => {
  return (
    <div
      className={`relative rounded-2xl bg-darkroom-bg border border-darkroom-border/40 overflow-hidden shadow-2xl ${className}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        minZoom={minZoom}
        maxZoom={maxZoom}
        fitView={fitView}
        fitViewOptions={{ padding: 0.15, includeHiddenNodes: false }}
        zoomOnScroll={false}
        panOnScroll={false}
        zoomOnPinch={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        translateExtent={[[-150, -80], [1100, 750]]}
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1.2} color="var(--color-midnight-base)" />
        {showControls && (
          <Controls className="!bg-darkroom-surface !border-none !rounded-xl !shadow-xl !text-slate-300 [&>button]:!bg-darkroom-card [&>button]:!border-none [&>button]:!text-slate-300 hover:[&>button]:!bg-darkroom-card hover:[&>button]:!text-white" />
        )}
        {showMiniMap && (
          <MiniMap
            className="!bg-darkroom-surface !border-none !rounded-xl !shadow-xl !overflow-hidden hidden sm:block"
            nodeColor={(node) => {
              if (node.data?.status === 'CORROBORATED' || node.data?.status === 'VERIFIED')
                return 'var(--color-tool-diligence)';
              if (node.data?.status === 'DISPUTED' || node.data?.status === 'CONTRADICTED')
                return 'var(--color-state-disputed)';
              if (node.data?.status === 'SUPPORTED' || node.data?.status === 'CAUTION')
                return 'var(--color-accent-blue)';
              return 'var(--color-midnight-royal)';
            }}
            maskColor="rgba(7, 9, 19, 0.75)"
          />
        )}
      </ReactFlow>
    </div>
  );
};
