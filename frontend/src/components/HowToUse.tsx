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
} from 'lucide-react';
import { OrganicBlobBackground } from './common/OrganicBlobBackground';

interface Props {
  onNavigateToDesk: () => void;
  onNavigateToDiligence: () => void;
  onNavigateToScout: () => void;
}

type TabMode = 'GUIDE' | 'WEBMCP' | 'AGENT_MCP';

interface WebMCPTool {
  name: string;
  scope: 'Dossier Scope (/diligence/:id)' | 'Platform Scope (Global)';
  description: string;
  parameters: Record<string, string>;
  examplePrompt: string;
}

const WEBMCP_TOOLS: WebMCPTool[] = [
  {
    name: 'screened_ask_dossier',
    scope: 'Dossier Scope (/diligence/:id)',
    description:
      'Performs cross-examination and fact-checking against the active due diligence dossier, returning corroborated claims, disputes, and confidence scores.',
    parameters: {
      query: 'string (e.g. "Does the festival hold a confirmed screening venue manifest?")',
      detailLevel: '"SUMMARY" | "FULL_EVIDENCE" | "RAW_SOURCES"',
    },
    examplePrompt: '"Ask the dossier if the advertised cinema venue has confirmed the screening dates."',
  },
  {
    name: 'screened_inspect_claim',
    scope: 'Dossier Scope (/diligence/:id)',
    description:
      'Retrieves the full evidentiary citation chain, source URLs, publication timestamps, and corroboration score for a specific atomic claim.',
    parameters: {
      claimId: 'string (e.g. "claim-venue-manifest-01")',
    },
    examplePrompt: '"Inspect claim #2 and show the exact quotes from UK Companies House and FilmFreeway."',
  },
  {
    name: 'screened_verify_sources',
    scope: 'Dossier Scope (/diligence/:id)',
    description:
      'Audits the provenance of all bibliography URLs linked in the dossier, checking for live status, Wayback Machine archives, and domain WHOIS age.',
    parameters: {
      domainFilter: 'string (optional, e.g. "companieshouse.gov.uk")',
    },
    examplePrompt: '"Verify all source links in this dossier and flag any domains registered less than 12 months ago."',
  },
  {
    name: 'screened_start_investigation',
    scope: 'Platform Scope (Global)',
    description:
      'Dispatches an autonomous multi-agent deep vetting investigation for any film festival name or website URL.',
    parameters: {
      festivalName: 'string (e.g. "Pinco Pallino Film Festival")',
      submissionUrl: 'string (optional FilmFreeway or official portal URL)',
    },
    examplePrompt: '"Start a new due diligence scan on Screened for Sundance Film Festival."',
  },
  {
    name: 'screened_scout_grants',
    scope: 'Platform Scope (Global)',
    description:
      'Scouts institutional funding opportunities, national lottery schemes, and public cinema development funds tailored to a filmmaker profile.',
    parameters: {
      title: 'string',
      budgetUsd: 'number',
      genre: 'string',
    },
    examplePrompt: '"Scout verified documentary grants on Screened for a £40k UK short film."',
  },
];

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

  // Register in-browser WebMCP tool manifest for agents inspecting window
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const windowWithMcp = window as unknown as {
        __screened_web_mcp__?: {
          version: string;
          protocol: string;
          tools: WebMCPTool[];
        };
      };

      windowWithMcp.__screened_web_mcp__ = {
        version: '1.0.0',
        protocol: 'WebMCP/2026',
        tools: WEBMCP_TOOLS,
      };
    }
  }, []);

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(CLAUDE_MCP_CONFIG);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
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
            <span>WebMCP In-Browser Tools</span>
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

        {/* TAB 2: In-Browser WebMCP Tools Catalog */}
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
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-midnight-royal/30 text-indigo-300 border border-indigo-500/30">
                      {tool.scope}
                    </span>
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

        {/* TAB 3: Native Agent MCP Server Config */}
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
                    <strong>Autonomous Grant Drafting:</strong> Export packaging checklists and application narratives based on verified festival track records.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Platform Launchpad */}
        <section className="rounded-3xl p-6 sm:p-8 bg-darkroom-surface/80 border border-darkroom-border text-center space-y-5 shadow-2xl">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
            Ready to test Screened Workspaces?
          </h3>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Interact with the autonomous agent desk, launch a live due diligence scan, or match grants.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={onNavigateToDiligence}
              className="px-5 py-2.5 bg-tool-diligence hover:bg-tool-diligence-hover text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md shadow-[var(--color-tool-diligence)]/20 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="size-4" />
              <span>Launch Due Diligence</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToDesk}
              className="px-5 py-2.5 bg-midnight-royal hover:bg-midnight-royal/80 text-white font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="size-4" />
              <span>Screened AI Desk</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToScout}
              className="px-5 py-2.5 bg-darkroom-card hover:bg-darkroom-surface text-white border border-darkroom-border font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Compass className="size-4 text-emerald-400" />
              <span>Grant Research</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export const AgentsPage = HowToUse;
export const AgentsProtocol = HowToUse;
export default HowToUse;
