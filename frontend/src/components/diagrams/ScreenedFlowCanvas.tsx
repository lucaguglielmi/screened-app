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
  EdgeTypes
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
  minZoom = 0.5,
  maxZoom = 1.5,
  fitView = true,
  showMiniMap = true,
  showControls = true,
}) => {
  return (
    <div className={`relative rounded-2xl bg-[#070913] border-none overflow-hidden shadow-2xl ${className}`}>
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
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={16} 
          size={1.2} 
          color="#1A2044" 
        />
        {showControls && (
          <Controls 
            className="!bg-[#0E1124] !border-none !rounded-xl !shadow-xl !text-slate-300 [&>button]:!bg-[#141834] [&>button]:!border-none [&>button]:!text-slate-300 hover:[&>button]:!bg-[#1E2552] hover:[&>button]:!text-white" 
          />
        )}
        {showMiniMap && (
          <MiniMap 
            className="!bg-[#0E1124] !border-none !rounded-xl !shadow-xl !overflow-hidden hidden sm:block"
            nodeColor={(node) => {
              if (node.data?.status === 'CORROBORATED' || node.data?.status === 'VERIFIED') return '#00D29E';
              if (node.data?.status === 'DISPUTED' || node.data?.status === 'CONTRADICTED') return '#F43F5E';
              if (node.data?.status === 'SUPPORTED' || node.data?.status === 'CAUTION') return '#0E86B3';
              return '#2018E6';
            }}
            maskColor="rgba(7, 9, 19, 0.75)"
          />
        )}
      </ReactFlow>
    </div>
  );
};
