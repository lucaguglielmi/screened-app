import React from 'react';
import { Workflow, Bot, Radio, FileSearch, Cpu, Server, ShieldCheck, Lock, Database, Activity, Zap } from 'lucide-react';
import { ScreenedFlowCanvas } from '../diagrams/ScreenedFlowCanvas';
import { Node, Edge, MarkerType } from '@xyflow/react';

const archNodes: Node[] = [
  // 1. Clients
  { id: 'clients', position: { x: 50, y: 50 }, data: { label: 'Web UI / Autonoumous Agents' }, style: { backgroundColor: 'var(--color-darkroom-bg)', color: 'var(--color-white)', border: '1px solid var(--color-darkroom-border)', padding: '10px', borderRadius: '8px', width: 200 } },
  
  // 2. Protocols
  { id: 'gateway', position: { x: 350, y: 50 }, data: { label: 'FastAPI Gateway & WebMCP' }, style: { backgroundColor: 'var(--color-darkroom-bg)', color: 'var(--color-white)', border: '1px solid var(--color-blue-500)', padding: '10px', borderRadius: '8px', width: 200 } },

  // 3. Orchestrator
  { id: 'producer_desk', position: { x: 650, y: 50 }, data: { label: 'Screened AI Chat Agent' }, style: { backgroundColor: 'var(--color-darkroom-bg)', color: 'var(--color-white)', border: '1px solid var(--color-purple-500)', padding: '10px', borderRadius: '8px', width: 180 } },
  { id: 'disambiguator', position: { x: 880, y: 0 }, data: { label: 'Disambiguator Agent' }, style: { backgroundColor: 'var(--color-darkroom-bg)', color: 'var(--color-white)', border: '1px solid var(--color-purple-500)', padding: '10px', borderRadius: '8px', width: 180 } },
  { id: 'planner', position: { x: 1110, y: 0 }, data: { label: 'Planner Agent' }, style: { backgroundColor: 'var(--color-darkroom-bg)', color: 'var(--color-white)', border: '1px solid var(--color-purple-500)', padding: '10px', borderRadius: '8px', width: 180 } },
  { id: 'vetting_cluster', position: { x: 1110, y: 100 }, data: { label: 'Deep Vetting Cluster' }, style: { backgroundColor: 'var(--color-darkroom-bg)', color: 'var(--color-white)', border: '1px solid var(--color-purple-500)', padding: '10px', borderRadius: '8px', width: 180 } },
  { id: 'analysis_cluster', position: { x: 880, y: 100 }, data: { label: 'Analysis & Synthesis' }, style: { backgroundColor: 'var(--color-darkroom-bg)', color: 'var(--color-white)', border: '1px solid var(--color-purple-500)', padding: '10px', borderRadius: '8px', width: 180 } },
  { id: 'outreach', position: { x: 650, y: 150 }, data: { label: 'Outreach Agent' }, style: { backgroundColor: 'var(--color-darkroom-bg)', color: 'var(--color-white)', border: '1px solid var(--color-purple-500)', padding: '10px', borderRadius: '8px', width: 180 } },
  { id: 'scout', position: { x: 880, y: 200 }, data: { label: 'Opportunity Scout' }, style: { backgroundColor: 'var(--color-darkroom-bg)', color: 'var(--color-white)', border: '1px solid var(--color-purple-500)', padding: '10px', borderRadius: '8px', width: 180 } },

  // 4. Intelligence
  { id: 'gemini_flash', position: { x: 880, y: -100 }, data: { label: 'Gemini 2.5 Flash' }, style: { backgroundColor: 'var(--color-darkroom-bg)', color: 'var(--color-white)', border: '1px solid var(--color-amber-500)', padding: '10px', borderRadius: '8px', width: 180 } },
  { id: 'gemini_pro', position: { x: 650, y: -100 }, data: { label: 'Gemini 2.5 Pro' }, style: { backgroundColor: 'var(--color-darkroom-bg)', color: 'var(--color-white)', border: '1px solid var(--color-amber-500)', padding: '10px', borderRadius: '8px', width: 180 } },

  // 5. Evidence
  { id: 'parallel', position: { x: 1110, y: 250 }, data: { label: 'Parallel Evidence API' }, style: { backgroundColor: 'var(--color-darkroom-bg)', color: 'var(--color-white)', border: '1px solid var(--color-emerald-500)', padding: '10px', borderRadius: '8px', width: 180 } },

  // 6. Cloud
  { id: 'cloud', position: { x: 350, y: 250 }, data: { label: 'Google Cloud Platform\n(Tasks, Firestore, Trace)' }, style: { backgroundColor: 'var(--color-darkroom-bg)', color: 'var(--color-white)', border: '1px solid var(--color-slate-500)', padding: '10px', borderRadius: '8px', width: 200 } },
];

const archEdges: Edge[] = [
  { id: 'e-client-gw', source: 'clients', target: 'gateway', animated: true, style: { stroke: 'var(--color-blue-500)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-blue-500)' } },
  { id: 'e-gw-pd', source: 'gateway', target: 'producer_desk', animated: true, style: { stroke: 'var(--color-purple-500)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-purple-500)' } },
  
  { id: 'e-pd-disam', source: 'producer_desk', target: 'disambiguator', animated: true, style: { stroke: 'var(--color-purple-500)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-purple-500)' } },
  { id: 'e-disam-plan', source: 'disambiguator', target: 'planner', animated: true, style: { stroke: 'var(--color-purple-500)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-purple-500)' } },
  { id: 'e-plan-vet', source: 'planner', target: 'vetting_cluster', animated: true, style: { stroke: 'var(--color-purple-500)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-purple-500)' } },
  { id: 'e-vet-ana', source: 'vetting_cluster', target: 'analysis_cluster', animated: true, style: { stroke: 'var(--color-purple-500)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-purple-500)' } },
  { id: 'e-ana-out', source: 'analysis_cluster', target: 'outreach', animated: true, style: { stroke: 'var(--color-purple-500)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-purple-500)' } },
  { id: 'e-pd-scout', source: 'producer_desk', target: 'scout', animated: true, style: { stroke: 'var(--color-purple-500)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-purple-500)' } },

  // Intelligence Links
  { id: 'e-disam-flash', source: 'disambiguator', target: 'gemini_flash', animated: true, style: { stroke: 'var(--color-amber-500)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-amber-500)' } },
  { id: 'e-pd-pro', source: 'producer_desk', target: 'gemini_pro', animated: true, style: { stroke: 'var(--color-amber-500)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-amber-500)' } },

  // Evidence Links
  { id: 'e-vet-par', source: 'vetting_cluster', target: 'parallel', animated: true, style: { stroke: 'var(--color-emerald-500)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-emerald-500)' } },
  { id: 'e-scout-par', source: 'scout', target: 'parallel', animated: true, style: { stroke: 'var(--color-emerald-500)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-emerald-500)' } },

  // Cloud Links
  { id: 'e-gw-cloud', source: 'gateway', target: 'cloud', animated: true, style: { stroke: 'var(--color-slate-500)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-slate-500)' } },
];

export const ArchitecturePage: React.FC = () => {
  return (
    <section className="space-y-8 pt-2">
      <div className="border-b border-zinc-800 pb-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold ring-1 ring-emerald-500/30">
                <Workflow className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-zinc-100 uppercase tracking-wider font-mono">
                Screened System Architecture & Multi-Agent Protocol Hub
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Interactive blueprint of Screened's distributed multi-agent intelligence pipeline.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-purple-950/60 text-purple-300 border border-purple-800/60">
              <Bot className="w-3 h-3 text-purple-400" />
              <span>8 ADK Agents</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-blue-950/60 text-blue-300 border border-blue-800/60">
              <Radio className="w-3 h-3 text-blue-400" />
              <span>WebMCP + Server MCP</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              <FileSearch className="w-3 h-3 text-emerald-400" />
              <span>Parallel Engine</span>
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800/80 bg-darkroom-bg/80 overflow-hidden shadow-2xl backdrop-blur-sm h-[500px]">
        <ScreenedFlowCanvas
          nodes={archNodes}
          edges={archEdges}
          showControls={true}
          fitView={true}
          className="h-full w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs mt-8">
        <div className="p-5 rounded-2xl bg-darkroom-surface border border-zinc-800 space-y-3">
          <div className="flex items-center space-x-2 text-rose-400 font-bold font-mono text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographic Integrity & Security Guardrails</span>
          </div>
          <ul className="space-y-2 text-zinc-300">
            <li className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-zinc-100">Exact-Payload Action Gate:</strong> Inquiry emails require manual approval of exact payload hash.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-zinc-100">Evidence Fingerprinting:</strong> Every atomic claim is cryptographically sealed.
              </span>
            </li>
          </ul>
        </div>
        <div className="p-5 rounded-2xl bg-darkroom-surface border border-zinc-800 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold font-mono text-sm">
            <Server className="w-4 h-4" />
            <span>Google Cloud Production Infrastructure</span>
          </div>
          <ul className="space-y-2 text-zinc-300">
            <li className="flex items-start gap-2">
              <Cpu className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-zinc-100">Google Cloud Run:</strong> Auto-scaling containerized FastAPI backend.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Database className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-zinc-100">Google Cloud Firestore:</strong> Real-time document persistence for investigations, claims ledger.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Activity className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-zinc-100">Cloud Tasks:</strong> Durable async queuing.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-zinc-100">Cloud Secret Manager:</strong> Secure runtime injection of keys.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
