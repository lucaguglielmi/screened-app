import React, { useState, useEffect } from 'react';
import {
  Terminal,
  ShieldCheck,
  Compass,
  Sparkles,
  Copy,
  Check,
  Code,
  Bot,
  CheckCircle2,
  Play,
  RotateCw,
  Info,
  ArrowDown,
} from 'lucide-react';
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

interface PromptTemplate {
  title: string;
  description: string;
  prompt: string;
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    title: 'Audit Operating Entity & Legitimacy',
    description: 'Verify company status, registration history, and active directors on Companies House.',
    prompt:
      'Open https://totallyscreened.com/diligence/demo_pinco_pallino and use WebMCP to verify if the operating company is dissolved on Companies House.',
  },
  {
    title: 'Inspect Specific Claim & Contradictions',
    description: 'Interrogate unverified venue bookings and inspect archive evidence dates.',
    prompt:
      'Use Screened WebMCP to inspect claim #1 on this dossier. Tell me the source archive date and whether any filmmaker disputed it.',
  },
  {
    title: 'Dispatch Multi-Agent Scan for New Festival',
    description: 'Trigger autonomous due diligence from a submission URL and summarize risk indicators.',
    prompt:
      'Start a new due diligence dossier on Screened for the short film festival at filmfreeway.com/sample and summarize the top 3 risk indicators.',
  },
  {
    title: 'Search Live Dossier with Gemini / Antigravity',
    description: 'Instruct your Gemini agent or Google Antigravity to audit venue reality, Companies House filings, and fee traps.',
    prompt:
      'Audit the Pinco Pallino Film Festival dossier (demo_pinco_pallino) using Screened MCP: verify venue manifest at BFI Southbank and fee escalation.',
  },
  {
    title: 'Scout Public Film Grants with Gemini Agent',
    description: 'Match non-repayable public funds (BFI, Doc Society, Creative Europe) and generate a 4-pillar packaging checklist.',
    prompt:
      'I have a £150,000 narrative feature in development in the UK. Use Screened grant scouting tools to match institutional funding programs and prepare an application readiness checklist.',
  },
];

const MCP_SERVER_CONFIG = `{
  "mcpServers": {
    "screened": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sse", "https://api.screened.org/api/mcp/sse"]
    }
  }
}`;

export const HowToUse: React.FC<Props> = ({
  onNavigateToDesk,
  onNavigateToDiligence,
  onNavigateToScout,
}) => {
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);
  const [copiedAntigravity, setCopiedAntigravity] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const ANTIGRAVITY_INSTALL_CMD = 'cp -r plugins/screened-gemini-plugin ~/.gemini/config/plugins/screened';

  const handleCopyAntigravity = () => {
    navigator.clipboard.writeText(ANTIGRAVITY_INSTALL_CMD);
    setCopiedAntigravity(true);
    setTimeout(() => setCopiedAntigravity(false), 2000);
  };

  // Sandbox state (inside Agent section)
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

  // Initialize WebMCP runtime bridge
  useEffect(() => {
    initializeWebMCP();
  }, []);

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(MCP_SERVER_CONFIG);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleCopyResult = () => {
    if (!sandboxResult) return;
    navigator.clipboard.writeText(sandboxResult);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  const handleCopyPrompt = (promptText: string, idx: number) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPromptIdx(idx);
    setTimeout(() => setCopiedPromptIdx(null), 2000);
  };

  const handleToolSelect = (toolName: string) => {
    setSandboxTool(toolName);
    setSandboxPayload(TOOL_DEFAULT_PAYLOADS[toolName] || '{}');
    setSandboxResult(null);
    setSandboxDuration(null);

    // Smooth scroll down to sandbox
    const sandboxEl = document.getElementById('agent-sandbox');
    if (sandboxEl) {
      sandboxEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
      <div className="relative z-10 max-w-4xl mx-auto space-y-16 sm:space-y-20">
        {/* Header Hero Section */}
        <section className="space-y-5 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Screened Agents &amp; WebMCP Protocol
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
            Screened is built for seamless collaboration between independent filmmakers and AI agents.
            Through <strong className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">WebMCP</strong> (in-browser tool calling)
            and <strong className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">Agent MCP</strong> (Model Context Protocol),
            autonomous assistants can cross-examine festival claims, audit sources, and trigger investigations.
          </p>

          {/* Simplified Security Badge with Tooltip */}
          {isTamperProof && (
            <div className="relative inline-block mt-2">
              <button
                type="button"
                onClick={() => setShowTooltip((prev) => !prev)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono hover:bg-emerald-950/60 transition-colors cursor-pointer"
                aria-label="Security status: Tamper-Proof Agent Protocol Active"
              >
                <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold">Tamper-Proof Agent Protocol Active</span>
                <Info className="size-3 text-emerald-500/70 ml-0.5" />
              </button>

              {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 sm:w-84 p-3.5 rounded-xl bg-midnight-void border border-emerald-500/40 text-left shadow-2xl z-30 animate-fade-in text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                    <ShieldCheck className="size-3.5" />
                    <span>Technical Security Details</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    The in-browser WebMCP runtime (<code className="text-emerald-300 bg-black/50 px-1 py-0.5 rounded">window.__screened_web_mcp__</code>) is cryptographically sealed with <code className="text-emerald-300">Object.freeze()</code> on initialization. Malicious third-party browser extensions or scripts cannot alter tool schemas or intercept evidence data.
                  </p>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-midnight-void border-r border-b border-emerald-500/40 rotate-45 -mt-1" />
                </div>
              )}
            </div>
          )}
        </section>

        {/* SECTION 1: What is WebMCP & Why Does It Matter */}
        <section className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
              What is WebMCP &amp; Why Does It Matter?
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Direct browser tool execution instead of slow screen-scraping
            </p>
          </div>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal pt-1">
            On ordinary websites, an AI assistant has to browse like a human: clicking around, scrolling, and taking screenshots to parse messy page layouts, which is slow and often breaks.
            With a compatible browser, your agent (such as a Gemini Live browser assistant or other AI agents) understands Screened directly through our built-in WebMCP tools. It skips clumsy browser navigation entirely, querying verified evidence, auditing sources, and cross-examining festival claims instantly and reliably.
          </p>
        </section>

        {/* SECTION 2: How You Can Use AI Agents with Screened */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              How You Can Use AI Agents with Screened Today
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Zero software installation required
            </p>
          </div>

          {/* 3 Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3">
              <span className="text-xs font-mono font-semibold text-cyan-400 tracking-wider">
                01
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">Enable WebMCP or Open Your Agent</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                In Chrome, activate experimental web platform flags via{' '}
                <code className="text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded text-cyan-300 break-all">
                  chrome://flags/#enable-experimental-web-platform-features
                </code>
                , or open your Gemini Live browser assistant or agentic workspace.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3">
              <span className="text-xs font-mono font-semibold text-cyan-400 tracking-wider">
                02
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">Paste a Prompt into Your AI</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Navigate to any festival dossier (such as <code className="text-xs font-mono text-cyan-300">/diligence/demo_pinco_pallino</code>).
                Instruct your agent: <em>&quot;Ask Screened whether the venue booking is verified and extract the conflicting dates.&quot;</em>
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3">
              <span className="text-xs font-mono font-semibold text-cyan-400 tracking-wider">
                03
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">Trigger Live Multi-Agent Scans</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                Tell your agent: <em>&quot;Start due diligence for Sundance Film Festival on Screened.&quot;</em>
                The agent executes <code className="text-xs font-mono text-tool-diligence">screened_start_investigation</code> and reads the real-time stream.
              </p>
            </div>
          </div>

          {/* Ready-Made Prompts Section */}
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                Ready-Made Prompts to Paste into Your AI
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Click any prompt to copy into clipboard
              </p>
            </div>

            <div className="space-y-3">
              {PROMPT_TEMPLATES.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-semibold text-white">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(item.prompt, idx)}
                      className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      {copiedPromptIdx === idx ? (
                        <>
                          <Check className="size-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: WebMCP In-Browser Toolset & Testing Lab */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              WebMCP In-Browser Toolset &amp; Testing Lab
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Registered in-browser tools available to compatible AI agents
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs sm:text-sm text-slate-300">
            These functions are registered directly in the browser runtime under{' '}
            <code className="text-tool-diligence bg-black/40 px-1 py-0.5 rounded break-all">window.__screened_web_mcp__.tools</code>.
            AI agents in compatible browsers execute them automatically. You can also test each tool directly in the live simulator below.
          </div>

          {/* Tools Cards */}
          <div className="space-y-4">
            {WEBMCP_TOOLS.map((tool, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-5 sm:p-6 bg-white/[0.02] border border-white/[0.04] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <h3 className="font-mono text-base font-bold text-white break-all sm:break-normal">{tool.name}</h3>
                    <span className="text-xs font-mono text-slate-400">
                      ({tool.scope})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToolSelect(tool.name)}
                    className="text-xs font-mono px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1.5 w-fit"
                  >
                    <span>Test in Sandbox</span>
                    <ArrowDown className="size-3" />
                  </button>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {tool.description}
                </p>

                <div className="bg-black/30 p-3 rounded-xl text-xs font-mono text-slate-300 space-y-1">
                  {Object.entries(tool.parameters).map(([param, type]) => (
                    <div key={param} className="flex items-baseline gap-2">
                      <span className="text-tool-diligence">{param}:</span>
                      <span className="text-slate-400">{type}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-400 flex flex-wrap items-baseline gap-1.5 pt-0.5">
                  <span className="text-slate-400 font-mono">Example:</span>
                  <span className="text-slate-300 italic font-sans">&ldquo;{tool.examplePrompt}&rdquo;</span>
                </div>
              </div>
            ))}
          </div>

          {/* THE INTERACTIVE TOOL SANDBOX (Situated inside the Agent section) */}
          <div id="agent-sandbox" className="p-5 sm:p-7 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-6 scroll-mt-20">
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                WebMCP &amp; Agent Tool Simulator
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                Simulate how AI agents invoke tools against Screened&apos;s runtime in real-time
              </p>
            </div>

            {/* Tool Picker */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 block">
                Select Tool to Execute:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {WEBMCP_TOOLS.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => handleToolSelect(t.name)}
                    className={`p-3 rounded-xl font-mono text-xs text-left transition-all cursor-pointer ${
                      sandboxTool === t.name
                        ? 'bg-amber-500/20 text-amber-300 font-bold shadow-sm border border-amber-500/30'
                        : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] border border-transparent'
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
                <label className="text-xs font-mono text-slate-400">
                  Input Parameters (JSON Schema Payload):
                </label>
                <button
                  type="button"
                  onClick={() => setSandboxPayload(TOOL_DEFAULT_PAYLOADS[sandboxTool] || '{}')}
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="size-3" />
                  <span>Reset Default Payload</span>
                </button>
              </div>
              <textarea
                value={sandboxPayload}
                onChange={(e) => setSandboxPayload(e.target.value)}
                rows={6}
                className="w-full p-4 rounded-xl bg-black/40 border border-slate-700/30 text-xs sm:text-sm font-mono text-emerald-300 focus:outline-none focus:border-amber-500/60 transition-colors"
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
                <span>{sandboxLoading ? 'Executing Tool Call...' : 'Execute Live Tool Call'}</span>
              </button>

              {sandboxDuration !== null && (
                <span className="text-xs font-mono text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg">
                  Latency: <strong className="text-emerald-400 font-bold">{sandboxDuration}ms</strong>
                </span>
              )}
            </div>

            {/* Results Console */}
            {sandboxResult && (
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-400 flex items-center gap-2">
                    <Code className="size-3.5 text-tool-diligence" />
                    <span>JSON-RPC 2.0 Response Content:</span>
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
                <pre className="p-4 rounded-xl bg-black/80 text-xs sm:text-sm font-mono text-indigo-200 overflow-x-auto max-h-96">
                  {sandboxResult}
                </pre>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 4: Headless Agents & Google Antigravity Plugin */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Google Antigravity Plugin &amp; Native MCP Server
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Connect Google Antigravity, Cursor, or custom agent swarms via SSE and Stdio
            </p>
          </div>

          {/* Google Antigravity Spotlight Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-indigo-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                  Google Antigravity &amp; Gemini Native Plugin
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Zero-config discovery at <code className="text-indigo-300 font-mono">.agents/plugins/screened/</code>
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyAntigravity}
                className="w-full sm:w-auto shrink-0 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                {copiedAntigravity ? <Check className="size-3.5 text-emerald-300" /> : <Copy className="size-3.5" />}
                <span>{copiedAntigravity ? 'Command Copied!' : 'Copy Global Install'}</span>
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Screened includes a turnkey, first-class workspace plugin for <strong>Google Antigravity</strong> and the <strong>Gemini CLI</strong>. When you open this repository in Antigravity, the agent automatically mounts Screened&apos;s Cloud Run MCP endpoint, equips forensic investigation runbooks, and enforces strict anti-hallucination rules.
            </p>

            {/* Grid of Plugin Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="font-semibold text-white">
                  Zero-Config Discovery
                </div>
                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                  Located in <code className="text-indigo-200 font-mono">.agents/plugins/screened/</code>. Antigravity connects to Cloud Run SSE automatically with no manual token setup.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="font-semibold text-white">
                  Forensic Rules &amp; Defense
                </div>
                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                  <code className="text-indigo-200 font-mono">rules/AGENTS.md</code> quarantines untrusted festival text inside tags to defeat prompt injections.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <div className="font-semibold text-white">
                  2 Specialized Skills
                </div>
                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                  <code className="text-indigo-200 font-mono">screened-festival-diligence</code> (venue &amp; fee audit) and <code className="text-indigo-200 font-mono">screened-grant-scout</code> (public funding).
                </p>
              </div>
            </div>

            {/* Global Install Command Callout */}
            <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Terminal className="size-4 shrink-0 text-indigo-400" />
                <span className="text-slate-400">Install to global Antigravity:</span>
                <code className="text-white bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30 select-all break-all font-mono">
                  cp -r plugins/screened-gemini-plugin ~/.gemini/config/plugins/screened
                </code>
              </div>
            </div>

            {/* Deep-Dive: How Gemini Queries Any Live Dossier */}
            <div className="pt-2 border-t border-white/5 space-y-3">
              <div className="text-sm font-semibold text-white font-serif">
                How Gemini &amp; Antigravity Interrogate Live Dossiers
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Left: The Filmmaker Experience */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <div className="font-semibold text-indigo-300 text-xs">
                    1. Conversational Query (Filmmaker)
                  </div>
                  <p className="text-slate-300 leading-relaxed font-normal text-xs">
                    Navigate to any festival dossier (e.g. <code className="text-indigo-200 font-mono">/diligence/demo_pinco_pallino</code>) and ask Gemini:
                  </p>
                  <blockquote className="p-2.5 rounded-lg bg-indigo-950/40 border-l-2 border-indigo-400 text-indigo-200 font-mono text-[11px] italic">
                    &quot;Audit the Pinco Pallino dossier (demo_pinco_pallino) using Screened MCP: verify venue reality and fee escalation.&quot;
                  </blockquote>
                </div>

                {/* Right: The Forensic Execution */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <div className="font-semibold text-emerald-300 text-xs">
                    2. Ground-Truth Tool Dispatch (Gemini Agent)
                  </div>
                  <p className="text-slate-300 leading-relaxed font-normal text-xs">
                    Under the hood, Gemini executes <code className="text-emerald-300 font-mono">screened_ask_dossier</code> to retrieve verified atomic claims, verifies verbatim quotes with <code className="text-emerald-300 font-mono">screened_inspect_claim</code>, and applies <code className="text-emerald-300 font-mono">rules/AGENTS.md</code>:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                    <li>Cross-references advertised venues against commercial cinema box-office manifests.</li>
                    <li>Inspects active vs dissolved company status on UK Companies House.</li>
                    <li>Enforces quarantine tags (&lt;untrusted_evidence_data&gt;) to contain prompt injections.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                  Model Context Protocol (MCP) Server Setup
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Connect Cursor, Antigravity, or custom agent swarms
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyConfig}
                className="w-full sm:w-auto shrink-0 px-3.5 py-1.5 rounded-xl bg-midnight-royal hover:bg-indigo-600 text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedConfig ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                <span>{copiedConfig ? 'Copied!' : 'Copy Config'}</span>
              </button>
            </div>

            {/* Callout */}
            <div className="p-3 rounded-xl bg-purple-950/20 text-xs text-purple-200">
              <strong>How to connect:</strong> Copy the JSON block below into your MCP client configuration (such as{' '}
              <code className="text-purple-300 bg-black/40 px-1.5 py-0.5 rounded font-mono">.cursor/mcp.json</code> or your agent settings). Your AI assistant will immediately be equipped with Screened&apos;s cinema due diligence tools.
            </div>

            {/* Code Snippet Box */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-black/40 text-xs sm:text-sm font-mono text-indigo-300 overflow-x-auto">
                {MCP_SERVER_CONFIG}
              </pre>
            </div>
          </div>


          {/* Agent-Friendly Dossier Block */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
            <h3 className="text-base sm:text-lg font-bold font-serif text-white">
              Agent-Friendly Dossiers
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              You can provide an Agent-Friendly Dossier URL (with the <code className="text-purple-300 font-mono text-xs">/BYOA</code> suffix) to your AI agent.
              Simply copy the URL of the dossier page and paste it into your AI agent to let it securely read the extracted intelligence.
            </p>
            <div className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
               <span className="text-sm font-mono text-teal-400 truncate w-full">
                 {typeof window !== 'undefined' ? window.location.href.replace('/agents', '/BYOA') : 'https://totallyscreened.com/diligence/.../BYOA'}
               </span>
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href.replace('/agents', '/BYOA') : '');
                   setCopiedConfig(true);
                   setTimeout(() => setCopiedConfig(false), 2000);
                 }}
                 className="shrink-0 w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-teal-500/30"
               >
                 <Copy className="size-3.5" />
                 Copy Example URL
               </button>
            </div>
          </div>

          {/* Architecture Overview */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
            <h3 className="text-base sm:text-lg font-bold font-serif text-white">
              Agent MCP Capabilities
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
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
        </section>

        {/* Action Bar Footer */}
        <section className="pt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToDesk}
              className="px-5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2"
            >
              <Bot className="size-4 text-indigo-400" />
              <span>Ask Screened AI Chat</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToDiligence}
              className="px-5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2"
            >
              <Compass className="size-4 text-tool-diligence" />
              <span>Open Due Diligence</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onNavigateToScout}
            className="px-5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2"
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
