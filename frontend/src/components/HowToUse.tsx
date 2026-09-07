import React, { useState, useEffect } from 'react';
import {
  Terminal,
  ShieldCheck,
  Compass,
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  Code,
  Bot,
  Workflow,
  Cpu,
  Layers,
  CheckCircle2,
  BookOpen,
  Play,
  RotateCw,
  Zap,
} from 'lucide-react';
import { OrganicBlobBackground } from './common/OrganicBlobBackground';
import {
  initializeWebMCP,
  executeWebMCPTool,
  WEBMCP_TOOLS,
} from '../utils/webMcpBridge';

interface Props {
  onNavigateToDesk: () => void;
  onNavigateToDiligence: () => void;
  onNavigateToScout: () => void;
}

type TabMode = 'GUIDE' | 'WEBMCP' | 'SANDBOX' | 'AGENT_MCP';

const TOOL_DEFAULT_PAYLOADS: Record<string, string> = {
  screened_ask_dossier: JSON.stringify(
    {
      dossier_id: 'demo_pinco_pallino',
      query: 'Is the screening venue at BFI Southbank confirmed?',
      detail_level: 'SUMMARY',
    },
    null,
    2
  ),
  screened_inspect_claim: JSON.stringify(
    {
      dossier_id: 'demo_pinco_pallino',
      claim_id: 'c1',
    },
    null,
    2
  ),
  screened_verify_sources: JSON.stringify(
    {
      dossier_id: 'demo_pinco_pallino',
      domain_filter: '',
    },
    null,
    2
  ),
  screened_start_investigation: JSON.stringify(
    {
      festival_name: 'Pinco Pallino Film Festival',
      submission_url: 'https://filmfreeway.com/sample',
    },
    null,
    2
  ),
  screened_scout_grants: JSON.stringify(
    {
      project_title: 'Northern Shadows',
      budget_usd: 40000,
      genre: 'Documentary Short',
      country: 'United Kingdom',
    },
    null,
    2
  ),
};

const CLAUDE_MCP_CONFIG = `{
  "mcpServers": {
    "screened": {
      "command": "npx",
      "args": ["-y", "@totallyscreened/mcp-server"],
      "env": {
        "SCREENED_API_BASE": "https://totallyscreened.com"
      }
    }
  }
}`;

export const HowToUse: React.FC<Props> = ({
  onNavigateToDesk,
  onNavigateToDiligence,
  onNavigateToScout,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('GUIDE');
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);

  // Sandbox state
  const [sandboxTool, setSandboxTool] = useState<string>('screened_ask_dossier');
  const [sandboxPayload, setSandboxPayload] = useState<string>(
    TOOL_DEFAULT_PAYLOADS.screened_ask_dossier
  );
  const [sandboxLoading, setSandboxLoading] = useState<boolean>(false);
  const [sandboxResult, setSandboxResult] = useState<string | null>(null);
  const [sandboxDuration, setSandboxDuration] = useState<number | null>(null);
  const [isTamperProof] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const bridge = initializeWebMCP();
    return Boolean(bridge && Object.isFrozen(bridge) && Object.isFrozen(bridge.tools));
  });

  // Initialize WebMCP runtime bridge and event listeners
  useEffect(() => {
    initializeWebMCP();
  }, []);


  const handleCopyConfig = () => {
    navigator.clipboard.writeText(CLAUDE_MCP_CONFIG);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleCopyResult = () => {
    if (!sandboxResult) return;
    navigator.clipboard.writeText(sandboxResult);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  const handleToolSelect = (toolName: string) => {
    setSandboxTool(toolName);
    setSandboxPayload(TOOL_DEFAULT_PAYLOADS[toolName] || '{}');
    setSandboxResult(null);
    setSandboxDuration(null);
  };

  const handleRunSandbox = async () => {
    setSandboxLoading(true);
    setSandboxResult(null);
    const start = performance.now();

    try {
      let parsedArgs: Record<string, unknown> = {};
      try {
        parsedArgs = JSON.parse(sandboxPayload) as Record<string, unknown>;
      } catch {
        setSandboxResult(
          JSON.stringify(
            {
              error: 'Invalid JSON syntax in parameters input.',
            },
            null,
            2
          )
        );
        setSandboxLoading(false);
        return;
      }

      const res = await executeWebMCPTool(sandboxTool, parsedArgs);
      const elapsed = Math.round(performance.now() - start);
      setSandboxDuration(elapsed);

      if (res.success && res.data) {
        setSandboxResult(JSON.stringify(res.data, null, 2));
      } else {
        setSandboxResult(
          JSON.stringify(
            {
              error: res.error || { code: 'EXECUTION_FAILED', message: 'Tool failed' },
            },
            null,
            2
          )
        );
      }
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      setSandboxDuration(elapsed);
      setSandboxResult(
        JSON.stringify(
          {
            error: err instanceof Error ? err.message : String(err),
          },
          null,
          2
        )
      );
    } finally {
      setSandboxLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen text-slate-100 px-4 py-10 sm:py-16 animate-fade-in overflow-hidden">
      <OrganicBlobBackground />

      <div className="relative z-10 max-w-4xl mx-auto space-y-12 sm:space-y-16">
        {/* Header Section */}
        <section className="space-y-5 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-tool-diligence/10 border border-tool-diligence/30 text-tool-diligence text-xs font-mono font-semibold uppercase tracking-widest">
            <Bot className="size-3.5 text-tool-diligence" />
            <span>Autonomous Interoperability &amp; Protocols</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Screened Agents &amp; WebMCP Protocol
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
            Screened is built from the ground up for hybrid collaboration between humans and AI agents.
            Through <strong className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">WebMCP</strong> (in-browser tool calling)
            and <strong className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">Agent MCP</strong> (Model Context Protocol),
            autonomous assistants can cross-examine dossiers, audit sources, and trigger investigations.
          </p>

          {isTamperProof && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <ShieldCheck className="size-3.5" />
              <span>Runtime Sealed: window.__screened_web_mcp__ Object.freeze() Active</span>
            </div>
          )}
        </section>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-darkroom-border pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('GUIDE')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'GUIDE'
                ? 'bg-midnight-royal text-white shadow-md shadow-[var(--color-midnight-royal)]/40 border border-indigo-400/40'
                : 'bg-darkroom-surface hover:bg-darkroom-card text-slate-400 hover:text-slate-200 border border-darkroom-border'
            }`}
          >
            <BookOpen className="size-4" />
            <span>Human Guide &amp; Instructions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WEBMCP')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'WEBMCP'
                ? 'bg-midnight-royal text-white shadow-md shadow-[var(--color-midnight-royal)]/40 border border-indigo-400/40'
                : 'bg-darkroom-surface hover:bg-darkroom-card text-slate-400 hover:text-slate-200 border border-darkroom-border'
            }`}
          >
            <Workflow className="size-4 text-tool-diligence" />
            <span>WebMCP Tools Manifest</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SANDBOX')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'SANDBOX'
                ? 'bg-midnight-royal text-white shadow-md shadow-[var(--color-midnight-royal)]/40 border border-indigo-400/40'
                : 'bg-darkroom-surface hover:bg-darkroom-card text-slate-400 hover:text-slate-200 border border-darkroom-border'
            }`}
          >
            <Zap className="size-4 text-amber-400" />
            <span>Interactive Tool Sandbox</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AGENT_MCP')}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'AGENT_MCP'
                ? 'bg-midnight-royal text-white shadow-md shadow-[var(--color-midnight-royal)]/40 border border-indigo-400/40'
                : 'bg-darkroom-surface hover:bg-darkroom-card text-slate-400 hover:text-slate-200 border border-darkroom-border'
            }`}
          >
            <Terminal className="size-4 text-purple-400" />
            <span>Native Agent MCP Server</span>
          </button>
        </div>

        {/* TAB 1: Human Guide & Instructions */}
        {activeTab === 'GUIDE' && (
          <div className="space-y-10 animate-fade-in">
            {/* Quick Concept Explainer */}
            <div className="p-6 sm:p-7 rounded-2xl bg-darkroom-surface/90 border border-darkroom-border space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-tool-diligence/10 text-tool-diligence">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                    What is WebMCP &amp; Why Does It Matter?
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-slate-400">
                    Eliminating brittle HTML screen scraping with direct browser tool execution
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                Traditional AI agents interact with web applications either by taking screenshots or scraping messy DOM elements.
                <strong> WebMCP (Web Model Context Protocol)</strong> exposes structured JSON tools directly on the web page.
                When an AI agent (like Claude with browser use, Gemini Live agent, or Chrome with WebMCP experimental flags) visits Screened,
                it discovers native functions to query verified evidence, inspect claims, and trigger background searches.
              </p>
            </div>

            {/* How to Use WebMCP Today */}
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2.5">
                <Cpu className="size-5 text-indigo-400" />
                <span>How Humans Can Use WebMCP with Their Agents Today</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <div className="p-6 rounded-2xl bg-darkroom-surface/80 border border-darkroom-border space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      STEP 01
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white">Enable WebMCP in Chrome</h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      Open Chrome or Chrome Canary and activate experimental web platform flags via{' '}
                      <code className="text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded text-indigo-300 border border-darkroom-border">
                        chrome://flags/#enable-experimental-web-platform-features
                      </code>
                      , or run Screened inside an agentic workspace like Cursor, Antigravity, or Claude Computer Use.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-tool-diligence">✓ Zero installation required</div>
                </div>

                {/* Step 2 */}
                <div className="p-6 rounded-2xl bg-darkroom-surface/80 border border-darkroom-border space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      STEP 02
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white">Query Dossiers Live</h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      Navigate to any festival dossier (e.g. <code className="text-xs font-mono text-indigo-300">/diligence/demo_pinco_pallino</code>).
                      Instruct your agent: <em>"Ask Screened whether the venue booking is verified and extract the conflicting dates."</em>
                    </p>
                  </div>
                  <div className="text-xs font-mono text-indigo-300">→ Calls screened_ask_dossier</div>
                </div>

                {/* Step 3 */}
                <div className="p-6 rounded-2xl bg-darkroom-surface/80 border border-darkroom-border space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      STEP 03
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white">Trigger New Investigations</h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      Tell your agent: <em>"Start due diligence for Leeds International Film Festival on Screened."</em>
                      The agent executes <code className="text-xs font-mono text-tool-diligence">screened_start_investigation</code> and waits for the SSE stream.
                    </p>
                  </div>
                  <div className="text-xs font-mono text-emerald-400">⚡ Autonomous Multi-Agent Scan</div>
                </div>
              </div>
            </div>

            {/* Practical Prompt Examples for Humans */}
            <div className="rounded-2xl p-6 sm:p-7 bg-darkroom-card/80 border border-darkroom-border space-y-4">
              <h3 className="text-base sm:text-lg font-bold font-serif text-white flex items-center gap-2">
                <MessageSquare className="size-4.5 text-tool-diligence" />
                <span>Example Prompts to Give Your Agent</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-darkroom-surface border border-darkroom-border/80 text-sm font-mono text-slate-200">
                  <span className="text-indigo-400 select-none">Prompt &gt; </span>
                  "Open totallyscreened.com/diligence/demo_pinco_pallino and use WebMCP to verify if the operating company is dissolved on Companies House."
                </div>

                <div className="p-3.5 rounded-xl bg-darkroom-surface border border-darkroom-border/80 text-sm font-mono text-slate-200">
                  <span className="text-indigo-400 select-none">Prompt &gt; </span>
                  "Use Screened WebMCP to inspect claim #1 on this dossier. Tell me the source archive date and whether any filmmaker disputed it."
                </div>

                <div className="p-3.5 rounded-xl bg-darkroom-surface border border-darkroom-border/80 text-sm font-mono text-slate-200">
                  <span className="text-indigo-400 select-none">Prompt &gt; </span>
                  "Start a new due diligence dossier on Screened for the short film festival at filmfreeway.com/sample and summarize the top 3 risk indicators."
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: In-Browser WebMCP Tools Manifest */}
        {activeTab === 'WEBMCP' && (
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
                <Workflow className="size-5 text-tool-diligence" />
                <span>WebMCP Tool Manifest</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                These functions are registered directly in the browser runtime under{' '}
                <code className="text-xs font-mono text-tool-diligence bg-black/40 px-1.5 py-0.5 rounded border border-darkroom-border">
                  window.__screened_web_mcp__.tools
                </code>
                . AI agents operating in the browser invoke them via standard JSON-RPC.
              </p>
            </div>

            <div className="space-y-5">
              {WEBMCP_TOOLS.map((tool, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-6 bg-darkroom-surface/90 border border-darkroom-border hover:border-zinc-700/80 shadow-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-darkroom-border pb-3">
                    <div className="flex items-center gap-2.5">
                      <Code className="size-4.5 text-tool-diligence" />
                      <h3 className="font-mono text-base font-bold text-white">{tool.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-midnight-royal/30 text-indigo-300 border border-indigo-500/30">
                        {tool.scope}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleToolSelect(tool.name);
                          setActiveTab('SANDBOX');
                        }}
                        className="text-xs font-mono px-2.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                      >
                        Try in Sandbox →
                      </button>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                    {tool.description}
                  </p>

                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                      Parameters Schema:
                    </span>
                    <div className="bg-darkroom-card/60 p-3 rounded-xl border border-darkroom-border/60 text-xs font-mono text-slate-300 space-y-1">
                      {Object.entries(tool.parameters).map(([param, type]) => (
                        <div key={param} className="flex items-baseline gap-2">
                          <span className="text-tool-diligence">{param}:</span>
                          <span className="text-slate-400">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-400 flex items-center gap-2 pt-1">
                    <span className="text-indigo-400">Example invocation:</span>
                    <span className="text-slate-300 italic">{tool.examplePrompt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Interactive Tool Sandbox */}
        {activeTab === 'SANDBOX' && (
          <div className="space-y-8 animate-fade-in">
            <div className="p-6 sm:p-7 rounded-2xl bg-darkroom-surface/90 border border-darkroom-border space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-darkroom-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                    <Zap className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                      Live WebMCP &amp; MCP Tool Simulator
                    </h3>
                    <p className="text-xs sm:text-sm font-mono text-slate-400">
                      Execute tools against real runtime endpoints in your active session
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30 flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5" />
                    <span>SSRF &amp; Injection Guards Active</span>
                  </span>
                </div>
              </div>

              {/* Tool Picker */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider block">
                  Select Tool to Execute:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {WEBMCP_TOOLS.map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => handleToolSelect(t.name)}
                      className={`p-3 rounded-xl font-mono text-xs text-left border transition-all cursor-pointer ${
                        sandboxTool === t.name
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/50 shadow-sm'
                          : 'bg-darkroom-card/50 text-slate-300 border-darkroom-border hover:bg-darkroom-card'
                      }`}
                    >
                      <div className="font-bold">{t.name}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{t.scope}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* JSON Parameters Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
                    Input Parameters (JSON):
                  </label>
                  <button
                    type="button"
                    onClick={() => setSandboxPayload(TOOL_DEFAULT_PAYLOADS[sandboxTool] || '{}')}
                    className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCw className="size-3" />
                    <span>Reset Payload</span>
                  </button>
                </div>
                <textarea
                  value={sandboxPayload}
                  onChange={(e) => setSandboxPayload(e.target.value)}
                  rows={6}
                  className="w-full p-4 rounded-xl bg-midnight-base border border-darkroom-border text-xs sm:text-sm font-mono text-emerald-300 focus:outline-none focus:border-amber-500/60 transition-colors"
                />
              </div>

              {/* Execution Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleRunSandbox}
                  disabled={sandboxLoading}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {sandboxLoading ? (
                    <RotateCw className="size-4 animate-spin" />
                  ) : (
                    <Play className="size-4 fill-black" />
                  )}
                  <span>{sandboxLoading ? 'Executing Protocol Call...' : 'Execute Live Tool Call'}</span>
                </button>

                {sandboxDuration !== null && (
                  <span className="text-xs font-mono text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-darkroom-border">
                    ⚡ Latency: <strong className="text-emerald-400 font-bold">{sandboxDuration}ms</strong>
                  </span>
                )}
              </div>

              {/* Results Console */}
              {sandboxResult && (
                <div className="space-y-2 pt-4 border-t border-darkroom-border">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-2">
                      <Code className="size-3.5 text-tool-diligence" />
                      <span>JSON-RPC Execution Result:</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyResult}
                      className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedResult ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                      <span>{copiedResult ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-black/80 border border-darkroom-border text-xs sm:text-sm font-mono text-indigo-200 overflow-x-auto max-h-96">
                    {sandboxResult}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Native Agent MCP Server Config */}
        {activeTab === 'AGENT_MCP' && (
          <div className="space-y-8 animate-fade-in">
            <div className="p-6 sm:p-7 rounded-2xl bg-darkroom-surface/90 border border-darkroom-border space-y-4 shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                    <Terminal className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                      Model Context Protocol (MCP) Server Setup
                    </h3>
                    <p className="text-xs sm:text-sm font-mono text-slate-400">
                      Connect Claude Desktop, Cursor, Antigravity, or custom agent swarms
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyConfig}
                  className="px-3.5 py-1.5 rounded-xl bg-midnight-royal hover:bg-indigo-600 text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedConfig ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  <span>{copiedConfig ? 'Copied!' : 'Copy Config'}</span>
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                Want your local AI agent or IDE to query Screened without a browser? Add the Screened MCP server configuration to your agent’s settings file (e.g.{' '}
                <code className="text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded text-purple-300">
                  claude_desktop_config.json
                </code>
                ).
              </p>

              {/* Code Snippet Box */}
              <div className="relative">
                <pre className="p-4 rounded-xl bg-midnight-base border border-darkroom-border text-xs sm:text-sm font-mono text-indigo-300 overflow-x-auto">
                  {CLAUDE_MCP_CONFIG}
                </pre>
              </div>
            </div>

            {/* Architecture Overview */}
            <div className="p-6 rounded-2xl bg-darkroom-surface/80 border border-darkroom-border space-y-4">
              <h3 className="text-base sm:text-lg font-bold font-serif text-white flex items-center gap-2">
                <Layers className="size-4.5 text-tool-diligence" />
                <span>Agent MCP Capabilities</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm sm:text-base text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-1" />
                  <span>
                    <strong>Deep Dossier Search:</strong> Vector semantic query across millions of filmmaker comments and archived trade claims.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-1" />
                  <span>
                    <strong>Independent Provenance Audit:</strong> Cryptographically hash and timestamp source URLs before festival organizers can edit terms.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-1" />
                  <span>
                    <strong>Corporate Entity Validation:</strong> Direct lookup on UK Companies House &amp; OpenCorporates for director history and active status.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-1" />
                  <span>
                    <strong>Multi-Agent Autonomous Scans:</strong> Dispatches distributed search workers across registries and community dispute databases.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Bar Footer */}
        <section className="pt-6 border-t border-darkroom-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToDesk}
              className="px-5 py-3 rounded-xl bg-darkroom-card hover:bg-darkroom-surface text-slate-200 text-sm font-semibold transition-all border border-darkroom-border cursor-pointer flex items-center gap-2"
            >
              <Bot className="size-4 text-indigo-400" />
              <span>Ask Screened Desk</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToDiligence}
              className="px-5 py-3 rounded-xl bg-darkroom-card hover:bg-darkroom-surface text-slate-200 text-sm font-semibold transition-all border border-darkroom-border cursor-pointer flex items-center gap-2"
            >
              <Compass className="size-4 text-tool-diligence" />
              <span>Open Due Diligence</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onNavigateToScout}
            className="px-5 py-3 rounded-xl bg-darkroom-card hover:bg-darkroom-surface text-slate-200 text-sm font-semibold transition-all border border-darkroom-border cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="size-4 text-amber-400" />
            <span>Explore Cinema Grants &amp; Funds</span>
          </button>
        </section>
      </div>
    </div>
  );
};

export const AgentsProtocol = HowToUse;
export const AgentsPage = HowToUse;
export default HowToUse;
