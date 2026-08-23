import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  AlertTriangle, 
  Clock, 
  Coins, 
  ShieldCheck, 
  RefreshCw
} from 'lucide-react';


interface SpanTrace {
  id: string;
  name: string;
  service: 'Orchestrator' | 'Parallel Search API' | 'Gemini 2.5 Flash' | 'Contradiction Engine';
  durationMs: number;
  tokens?: number;
  status: 'OK' | 'VERIFIED' | 'STALLED_RECOVERED';
  detail: string;
}

const MOCK_TRACES: SpanTrace[] = [
  {
    id: 'span-1',
    name: 'Disambiguate & Entity Identification',
    service: 'Gemini 2.5 Flash',
    durationMs: 420,
    tokens: 380,
    status: 'OK',
    detail: 'Extracted candidate: Aldergate Film Festival (Bristol, UK - Est 2021)',
  },
  {
    id: 'span-2',
    name: 'Domain Fanout: Festival Leases & Press',
    service: 'Parallel Search API',
    durationMs: 1450,
    status: 'OK',
    detail: 'Retrieved 14 public web sources across municipal records & local press',
  },
  {
    id: 'span-3',
    name: 'Domain Fanout: Participant Accounts & Forums',
    service: 'Parallel Search API',
    durationMs: 1680,
    status: 'OK',
    detail: 'Retrieved 9 filmmaker discussion threads on r/Filmmakers & Stage32',
  },
  {
    id: 'span-4',
    name: 'Extract Atomic Claims & Excerpts',
    service: 'Gemini 2.5 Flash',
    durationMs: 920,
    tokens: 1420,
    status: 'VERIFIED',
    detail: 'Extracted 18 atomic claims; 100% passed cryptographic excerpt verification',
  },
  {
    id: 'span-5',
    name: 'Contradiction & Stance Synthesis',
    service: 'Contradiction Engine',
    durationMs: 650,
    tokens: 890,
    status: 'OK',
    detail: 'Detected 1 Disputed claim on West End cinema lease vs private Vimeo manifest',
  },
  {
    id: 'span-6',
    name: 'Assemble Final Cryptographic Dossier',
    service: 'Orchestrator',
    durationMs: 310,
    status: 'OK',
    detail: 'Signed payload hash with SHA-256; generated 4-point filmmaker action checklist',
  },
];

export const AgentObservabilityLab: React.FC = () => {
  const [traces, setTraces] = useState<SpanTrace[]>(MOCK_TRACES);
  const [selectedSpan, setSelectedSpan] = useState<SpanTrace | null>(traces[3]);

  const totalDuration = traces.reduce((acc, t) => acc + t.durationMs, 0);
  const totalTokens = traces.reduce((acc, t) => acc + (t.tokens || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#22274C]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#2018E6]/20 text-indigo-400 border border-[#2018E6]/40 font-semibold">
              Admin & Diagnostics
            </span>
            <span className="text-xs font-mono text-slate-400">GenAI Semantic Tracing (OTel Native)</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mt-1">
            Agent Tracing & Telemetry Laboratory
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTraces([...MOCK_TRACES]);
              setSelectedSpan(MOCK_TRACES[3]);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#121633] hover:bg-[#1A2045] text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-[#22274C] transition-colors cursor-pointer"
          >
            <RefreshCw className="size-3.5 text-indigo-400" />
            <span>Reset Trace</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0E1124] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Total Latency</span>
            <Clock className="size-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{(totalDuration / 1000).toFixed(2)}s</div>
          <p className="text-[11px] text-[#00D29E] font-mono">Within 90s SLA</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0E1124] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Tokens Consumed</span>
            <Coins className="size-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400 font-mono">~£0.0034 Vertex AI spend</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0E1124] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Verification Pass</span>
            <ShieldCheck className="size-4 text-[#00D29E]" />
          </div>
          <div className="text-2xl font-bold text-[#00D29E]">100%</div>
          <p className="text-[11px] text-slate-400 font-mono">18/18 claims grounded</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0E1124] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Disputed Claims</span>
            <AlertTriangle className="size-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">1 Detected</div>
          <p className="text-[11px] text-slate-400 font-mono">Contradiction reconciled</p>
        </div>
      </div>

      {/* Waterfall Span Execution Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Activity className="size-4.5 text-indigo-400" />
            <span>Multi-Agent Execution Waterfall</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Click span for metadata</span>
        </div>

        <div className="p-4 rounded-3xl bg-[#0E1124] space-y-3">
          {traces.map((trace) => {
            const isSelected = selectedSpan?.id === trace.id;
            const widthPct = Math.max(12, (trace.durationMs / totalDuration) * 100);

            return (
              <div
                key={trace.id}
                onClick={() => setSelectedSpan(trace)}
                className={`p-3 rounded-2xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#181D40] border-indigo-500/50 shadow-md'
                    : 'bg-[#070913] hover:bg-[#121633] border-[#1C2042]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`size-2.5 rounded-full ${
                        trace.service.includes('Parallel')
                          ? 'bg-[#00D29E]'
                          : trace.service.includes('Gemini')
                          ? 'bg-[#2018E6]'
                          : 'bg-purple-500'
                      }`}
                    />
                    <span className="font-semibold text-white">{trace.name}</span>
                    <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded-md bg-[#141731]">
                      {trace.service}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-slate-400">
                    {trace.tokens && <span>{trace.tokens} tok</span>}
                    <span className="text-indigo-400 font-semibold">{trace.durationMs}ms</span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="mt-2 w-full bg-[#121633] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      trace.service.includes('Parallel')
                        ? 'bg-[#00D29E]'
                        : trace.service.includes('Gemini')
                        ? 'bg-[#2018E6]'
                        : 'bg-purple-500'
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Span Detail Inspector */}
      {selectedSpan && (
        <div className="p-6 rounded-3xl bg-[#0E1124] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1E3D]">
            <div className="flex items-center gap-2">
              <Cpu className="size-5 text-indigo-400" />
              <h4 className="font-serif text-base font-bold text-white">
                Span Inspector: {selectedSpan.name}
              </h4>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#00D29E]/20 text-[#00D29E] border border-[#00D29E]/40 font-semibold">
              {selectedSpan.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#070913] border border-[#1A1E3D] space-y-1">
              <span className="text-slate-500">Service</span>
              <div className="text-white font-semibold">{selectedSpan.service}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#070913] border border-[#1A1E3D] space-y-1">
              <span className="text-slate-500">Duration</span>
              <div className="text-indigo-400 font-semibold">{selectedSpan.durationMs} milliseconds</div>
            </div>
            <div className="p-3 rounded-xl bg-[#070913] border border-[#1A1E3D] space-y-1">
              <span className="text-slate-500">Tokens</span>
              <div className="text-amber-400 font-semibold">{selectedSpan.tokens || 'N/A'}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#070913] border border-[#1A1E3D] space-y-1.5">
            <span className="text-xs font-mono text-slate-500">Payload Output & Findings</span>
            <p className="text-sm text-slate-300 font-mono leading-relaxed">
              {selectedSpan.detail}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
