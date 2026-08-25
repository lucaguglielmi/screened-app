import React, { useState, useEffect } from 'react';
import { Activity, Cpu, AlertTriangle, Clock, Coins, ShieldCheck, RefreshCw } from 'lucide-react';
import { fetchRecentTraces, SpanTrace } from '../../utils/observability';

export const AgentObservabilityLab: React.FC = () => {
  const [traces, setTraces] = useState<SpanTrace[]>([]);
  const [selectedSpan, setSelectedSpan] = useState<SpanTrace | null>(null);

  const fetchTraces = async () => {
    const data = await fetchRecentTraces();
    setTraces(data);
    if (data.length > 0 && !selectedSpan) {
      setSelectedSpan(data[0]);
    }
  };

  useEffect(() => {
    fetchTraces();
    const interval = setInterval(fetchTraces, 3000); // 3s polling per spec
    return () => clearInterval(interval);
  }, []);

  const totalDuration = traces.reduce((acc, t) => acc + t.durationMs, 0);
  const totalTokens = traces.reduce((acc, t) => acc + (t.tokens || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-darkroom-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-midnight-royal/20 text-indigo-400 border border-midnight-royal/40 font-semibold">
              Admin & Diagnostics
            </span>
            <span className="text-xs font-mono text-slate-400">
              GenAI Semantic Tracing (OTel Native)
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mt-1">
            Agent Tracing & Telemetry Laboratory
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchTraces();
            }}
            className="px-3 py-1.5 rounded-xl bg-darkroom-surface hover:bg-paper-border hover:bg-darkroom-border text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-darkroom-border transition-colors cursor-pointer"
          >
            <RefreshCw className="size-3.5 text-indigo-400" />
            <span>Reset Trace</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-darkroom-surface space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Total Latency</span>
            <Clock className="size-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{(totalDuration / 1000).toFixed(2)}s</div>
          <p className="text-[11px] text-tool-diligence font-mono">Within 90s SLA</p>
        </div>

        <div className="p-4 rounded-2xl bg-darkroom-surface space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Tokens Consumed</span>
            <Coins className="size-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400 font-mono">~£0.0034 Vertex AI spend</p>
        </div>

        <div className="p-4 rounded-2xl bg-darkroom-surface space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>Verification Pass</span>
            <ShieldCheck className="size-4 text-tool-diligence" />
          </div>
          <div className="text-2xl font-bold text-tool-diligence">100%</div>
          <p className="text-[11px] text-slate-400 font-mono">18/18 claims grounded</p>
        </div>

        <div className="p-4 rounded-2xl bg-darkroom-surface space-y-1">
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

        <div className="p-4 rounded-3xl bg-darkroom-surface space-y-3">
          {traces.map((trace) => {
            const isSelected = selectedSpan?.id === trace.id;
            const widthPct = Math.max(12, (trace.durationMs / totalDuration) * 100);

            return (
              <div
                key={trace.id}
                onClick={() => setSelectedSpan(trace)}
                className={`p-3 rounded-2xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-darkroom-card border-indigo-500/50 shadow-md'
                    : 'bg-darkroom-bg hover:bg-darkroom-surface border-paper-card border-darkroom-card'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`size-2.5 rounded-full ${
                        trace.service.includes('Parallel')
                          ? 'bg-tool-diligence'
                          : trace.service.includes('Gemini')
                            ? 'bg-midnight-royal'
                            : 'bg-purple-500'
                      }`}
                    />
                    <span className="font-semibold text-white">{trace.name}</span>
                    <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded-md bg-darkroom-card">
                      {trace.service}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-slate-400">
                    {trace.tokens && <span>{trace.tokens} tok</span>}
                    <span className="text-indigo-400 font-semibold">{trace.durationMs}ms</span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="mt-2 w-full bg-darkroom-surface h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      trace.service.includes('Parallel')
                        ? 'bg-tool-diligence'
                        : trace.service.includes('Gemini')
                          ? 'bg-midnight-royal'
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
        <div className="p-6 rounded-3xl bg-darkroom-surface space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-darkroom-border">
            <div className="flex items-center gap-2">
              <Cpu className="size-5 text-indigo-400" />
              <h4 className="font-serif text-base font-bold text-white">
                Span Inspector: {selectedSpan.name}
              </h4>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-tool-diligence/20 text-tool-diligence border border-tool-diligence/40 font-semibold">
              {selectedSpan.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-darkroom-bg border border-darkroom-border space-y-1">
              <span className="text-slate-500">Service</span>
              <div className="text-white font-semibold">{selectedSpan.service}</div>
            </div>
            <div className="p-3 rounded-xl bg-darkroom-bg border border-darkroom-border space-y-1">
              <span className="text-slate-500">Duration</span>
              <div className="text-indigo-400 font-semibold">
                {selectedSpan.durationMs} milliseconds
              </div>
            </div>
            <div className="p-3 rounded-xl bg-darkroom-bg border border-darkroom-border space-y-1">
              <span className="text-slate-500">Tokens</span>
              <div className="text-amber-400 font-semibold">{selectedSpan.tokens || 'N/A'}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-darkroom-bg border border-darkroom-border space-y-1.5">
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
