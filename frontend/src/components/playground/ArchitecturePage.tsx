import React from 'react';
import { Workflow, Database, Layers, Shield } from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  return (
    <section className="space-y-4 rounded-2xl border border-[#22274C] bg-[#0E1124] p-6 shadow-md">
      <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center space-x-2">
            <Workflow className="w-4 h-4 text-emerald-400" />
            <span>Architecture & System State</span>
          </h3>
          <p className="text-xs text-zinc-400">Live tracker of system architecture components.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-4">
        <div className="p-4 rounded-xl bg-[#151B2E] border border-blue-900/40 space-y-2">
          <div className="flex items-center space-x-2 text-blue-400 font-bold font-mono">
            <Layers className="w-4 h-4" />
            <span>ADK Orchestrator & State Machine</span>
          </div>
          <p className="text-zinc-300">
            Coordinates agent flows, lifecycle events, and API boundaries. 
            Handles investigation resumption and checkpointing.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#151B2E] border border-amber-900/40 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-bold font-mono">
            <Database className="w-4 h-4" />
            <span>Firestore Persistence Layer</span>
          </div>
          <p className="text-zinc-300">
            Maintains the single source of truth for investigations, claims, sources, events, and filmmaker feedback.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#151B2E] border border-purple-900/40 space-y-2">
          <div className="flex items-center space-x-2 text-purple-400 font-bold font-mono">
            <Shield className="w-4 h-4" />
            <span>Parallel Search & Gemini Clients</span>
          </div>
          <p className="text-zinc-300">
            Integrates with Parallel Search SDK for external domain intelligence and Vertex AI for structured extraction, bounded by asyncio concurrency limits.
          </p>
        </div>
      </div>
    </section>
  );
};
