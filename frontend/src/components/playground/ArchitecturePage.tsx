import React, { useState } from 'react';
import {
  Workflow,
  Database,
  Layers,
  Bot,
  Globe,
  Terminal,
  ExternalLink,
  Check,
  Copy,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Code,
  ShieldCheck,
  Lock,
  Radio,
  Cpu,
  FileSearch,
  Download,
  Activity,
  Server,
  Zap,
} from 'lucide-react';

const D2_SOURCE = `direction: down
title: "Screened — Cloud & Multi-Agent Architecture (Google ADK, Gemini, Parallel Search & MCP)"

classes: {
  client_box: {
    style: {
      fill: "#1e1e2e"
      stroke: "#6366f1"
      stroke-width: 2
      border-radius: 8
    }
  }
  protocol_box: {
    style: {
      fill: "#181825"
      stroke: "#a855f7"
      stroke-width: 2
      border-radius: 8
    }
  }
  adk_box: {
    style: {
      fill: "#1e293b"
      stroke: "#38bdf8"
      stroke-width: 2
      border-radius: 8
    }
  }
  agent_node: {
    style: {
      fill: "#0f172a"
      stroke: "#38bdf8"
      stroke-width: 1
      border-radius: 6
    }
  }
  reasoning_box: {
    style: {
      fill: "#1e1b4b"
      stroke: "#818cf8"
      stroke-width: 2
      border-radius: 8
    }
  }
  evidence_box: {
    style: {
      fill: "#064e3b"
      stroke: "#10b981"
      stroke-width: 2
      border-radius: 8
    }
  }
  cloud_box: {
    style: {
      fill: "#1c1917"
      stroke: "#f59e0b"
      stroke-width: 2
      border-radius: 8
    }
  }
}

clients: "1. Filmmaker & Autonomous Agent Clients" {
  class: client_box

  web_ui: "Filmmaker Web Application\\n(React 19 + Tailwind v4 + Vite)"
  browser_agent: "Autonomous In-Browser Agents\\n(Chrome WebMCP / Claude Computer Use / Gemini Live)"
  headless_agent: "External Agent Desktops & IDEs\\n(Claude Desktop / Cursor / Antigravity)"
}

protocols: "2. Ingestion & Dual-Protocol Agent Layer" {
  class: protocol_box

  webmcp: "In-Browser WebMCP (WebMCP/2026)\\n• window.__screened_web_mcp__\\n• DOM Event Bus: webmcp:call / webmcp:result\\n• Visual DOM Sync & Telemetry Spotlighting"
  
  server_mcp: "Headless Server MCP (Anthropic MCP v1.x)\\n• SSE Transport: /api/mcp/sse\\n• JSON-RPC Messages: /api/mcp/messages\\n• HTTP Testing: /api/mcp/rpc"
  
  gateway: "FastAPI Application Gateway\\n• REST Endpoints & SSE Event Stream\\n• PII Masking Vault & Rate Limiter\\n• Action Approval Sandbox Gate (SHA-256)"
}

clients.web_ui -> protocols.gateway: "REST / SSE / WebSockets"
clients.browser_agent -> protocols.webmcp: "DOM CustomEvents"
protocols.webmcp -> protocols.gateway: "Tool Invocations"
clients.headless_agent -> protocols.server_mcp: "JSON-RPC 2.0 (SSE/Stdio)"
protocols.server_mcp -> protocols.gateway: "Internal Tool Execution"

orchestration: "3. Google Agent Development Kit (ADK) Orchestrator" {
  class: adk_box

  producer_desk: "Producer Desk Agent (LlmAgent)\\nConversational Triage, PDF Intake & Mini-UIs" {
    class: agent_node
  }

  disambiguator: "Disambiguator Agent (LlmAgent)\\nTarget Entity Identification & Alias Resolution" {
    class: agent_node
  }

  planner: "Planner Agent (LlmAgent)\\nStrategy Synthesis & Domain Task Formulation" {
    class: agent_node
  }

  vetting_cluster: "Deep Vetting Cluster (ParallelAgent)" {
    class: adk_box
    festival_agent: "FestivalAgent\\nScreening Leases & Rules" { class: agent_node }
    organizer_agent: "OrganizerAgent\\nCompanies House Filings" { class: agent_node }
    participants_agent: "ParticipantsAgent\\nJury & Community Flags" { class: agent_node }
  }

  analysis_cluster: "Analysis & Synthesis Cluster (SequentialAgent)" {
    class: adk_box
    claim_extractor: "ClaimExtractorAgent\\nGrounds Atomic Claims" { class: agent_node }
    contradiction_analyst: "ContradictionAnalystAgent\\nDetects Collisions & Penalty" { class: agent_node }
    report_writer: "ReportWriterAgent\\n4-Tier Dossier & SHA-256 Seal" { class: agent_node }
  }

  scout: "OpportunityScoutAgent (LlmAgent)\\nGrant & Open Call Matcher (.ics)" {
    class: agent_node
  }

  outreach: "OutreachDrafterAgent (LlmAgent)\\nSHA-256 Sandboxed Inquiries" {
    class: agent_node
  }

  producer_desk -> disambiguator: "Entity Query"
  disambiguator -> planner: "Confirmed Subject"
  planner -> vetting_cluster: "Parallel Execution"
  vetting_cluster -> analysis_cluster: "Gathered Domain Evidence"
  producer_desk -> scout: "Grant / Festival Request"
  analysis_cluster -> outreach: "Flagged Discrepancy"
}

protocols.gateway -> orchestration.producer_desk: "Dispatches Investigation"

intelligence: "4. Reasoning Engine (Vertex AI)" {
  class: reasoning_box

  gemini_pro: "Gemini 2.5 Pro\\n• Function Calling & Agent Tool Execution\\n• Complex Multi-Step Contradiction Analysis\\n• Multimodal Script Extraction & Dossier Synthesis"

  gemini_flash: "Gemini 2.5 Flash\\n• Sub-Second Entity Disambiguation\\n• Low-Latency Streaming Chat Token Generation"
}

orchestration.producer_desk -> intelligence.gemini_pro: "Tool Calls & Chat"
orchestration.disambiguator -> intelligence.gemini_flash: "Fast Match"
orchestration.analysis_cluster -> intelligence.gemini_pro: "Contradiction Check"

evidence: "5. Ground-Truth Evidence Engine (Parallel API)" {
  class: evidence_box

  search: "Parallel Search\\nHigh-Precision Web & Registry Discovery"
  extract: "Parallel Extract\\nVerbatim Quoted Substrings & Source Tiers"
  findall: "Parallel FindAll\\nExhaustive Grant & Festival Search"
  task_api: "Parallel Task API\\nAsynchronous Deep Investigation"
  monitor: "Parallel Monitor\\nPage Drift & Policy Change Tracking"
}

orchestration.vetting_cluster -> evidence.search: "Domain Queries"
orchestration.vetting_cluster -> evidence.extract: "Verbatim Proof"
orchestration.scout -> evidence.findall: "Grant Exploration"
evidence.monitor -> protocols.gateway: "HMAC-SHA256 Webhook (/api/webhooks/parallel)"

cloud: "6. Google Cloud Platform Infrastructure" {
  class: cloud_box

  cloud_run: "Google Cloud Run (London europe-west2)\\nAuto-Scaling Serverless FastAPI Container"
  cloud_tasks: "Google Cloud Tasks (screened-tasks)\\nDurable Asynchronous Queue with OIDC Auth"
  firestore: "Google Cloud Firestore (Native Mode)\\nState Machine Persistence & Claim Ledger"
  secret_manager: "Google Cloud Secret Manager\\nRuntime Secrets & Key Injection"
  observability: "OpenTelemetry & Cloud Trace\\nDistributed Spans & Structured Cloud Logging"
}

protocols.gateway -> cloud.cloud_run: "Hosted On"
orchestration -> cloud.cloud_tasks: "Enqueues Background Tasks"
orchestration -> cloud.firestore: "Persists State & Claims"
protocols.gateway -> cloud.secret_manager: "Loads API Keys"
orchestration -> cloud.observability: "Exports Distributed Spans"`;

export const ArchitecturePage: React.FC = () => {
  const [activeView, setActiveView] = useState<'DIAGRAM' | 'D2_CODE'>('DIAGRAM');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hasCopiedD2, setHasCopiedD2] = useState<boolean>(false);

  const handleCopyD2 = () => {
    navigator.clipboard.writeText(D2_SOURCE);
    setHasCopiedD2(true);
    setTimeout(() => setHasCopiedD2(false), 2000);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.6));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <section className="space-y-8 pt-2">
      {/* 1. Header & Live Capabilities Badges */}
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
              Complete end-to-end blueprint of Screened's distributed multi-agent intelligence pipeline,
              dual-protocol WebMCP & Server MCP bridges, Google Cloud infrastructure, and forensic evidence grounding engine.
            </p>
          </div>

          {/* Quick Telemetry Badges */}
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
              <span>Parallel 6-Matrix</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60">
              <Cpu className="w-3 h-3 text-amber-400" />
              <span>Gemini 2.5 Pro & Flash</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. D2 Architecture Schema Canvas */}
      <div className="rounded-2xl border border-zinc-800/80 bg-darkroom-bg/80 overflow-hidden shadow-2xl backdrop-blur-sm">
        {/* Canvas Toolbar */}
        <div className="px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2">
              <Workflow className="w-3.5 h-3.5 text-blue-400" />
              <span>D2 Architecture Schema</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              D2 v0.9.0 · Dark Theme
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: Diagram vs D2 Source */}
            <div className="inline-flex rounded-lg bg-zinc-950 p-1 border border-zinc-800 text-xs">
              <button
                onClick={() => setActiveView('DIAGRAM')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-mono ${
                  activeView === 'DIAGRAM'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Workflow className="w-3 h-3" />
                <span>Vector Diagram</span>
              </button>
              <button
                onClick={() => setActiveView('D2_CODE')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-mono ${
                  activeView === 'D2_CODE'
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Code className="w-3 h-3" />
                <span>D2 Source (.d2)</span>
              </button>
            </div>

            {/* Diagram Controls (when viewing diagram) */}
            {activeView === 'DIAGRAM' && (
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-zinc-400 px-1.5">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                  className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* D2 Source Copy Button */}
            {activeView === 'D2_CODE' && (
              <button
                onClick={handleCopyD2}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono transition-colors"
              >
                {hasCopiedD2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopiedD2 ? 'Copied D2!' : 'Copy .d2 Code'}</span>
              </button>
            )}

            {/* Direct Download SVG link */}
            <a
              href="/assets/architecture-d2.svg"
              download="screened-architecture-d2.svg"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 hover:text-white border border-blue-800/80 text-xs font-mono transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SVG</span>
            </a>
          </div>
        </div>

        {/* Canvas Body */}
        <div className={`relative transition-all duration-200 ${isFullscreen ? 'fixed inset-0 z-50 bg-zinc-950 p-6 flex flex-col' : ''}`}>
          {isFullscreen && (
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-zinc-800">
              <span className="font-mono text-sm font-bold text-white">Screened Architecture (Fullscreen D2 View)</span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeView === 'DIAGRAM' ? (
            <div className="overflow-auto max-h-[750px] p-6 flex items-center justify-center bg-zinc-950/90 scrollbar-thin scrollbar-thumb-zinc-800">
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="w-full flex justify-center"
              >
                <img
                  src="/assets/architecture-d2.svg"
                  alt="Screened Architecture Schema (Generated with D2)"
                  className="max-w-none w-full object-contain rounded-xl shadow-lg border border-zinc-800/50"
                  style={{ minWidth: '950px' }}
                />
              </div>
            </div>
          ) : (
            <div className="overflow-auto max-h-[750px] p-6 bg-zinc-950 text-zinc-300 font-mono text-xs">
              <pre className="whitespace-pre overflow-x-auto leading-relaxed selection:bg-blue-900 selection:text-white">
                {D2_SOURCE}
              </pre>
            </div>
          )}

          {/* Architecture Color Legend */}
          <div className="px-5 py-3 bg-zinc-900/90 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
            <span className="font-bold text-zinc-300 uppercase tracking-wider">Subsystem Legend:</span>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30"></span>
                <span>1. Filmmakers & Agents</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-500/30"></span>
                <span>2. Dual Protocol (WebMCP / Server MCP)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-sky-400/30"></span>
                <span>3. Google ADK Orchestrator</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 ring-2 ring-indigo-400/30"></span>
                <span>4. Vertex AI (Gemini 2.5)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30"></span>
                <span>5. Parallel Search Ground Truth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30"></span>
                <span>6. Google Cloud Infrastructure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Deep Dive: In-Browser WebMCP vs Headless Server MCP */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
              Dual-Protocol Architecture: WebMCP vs Server MCP
            </h4>
          </div>
          <a
            href="/agents"
            className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 underline transition-colors"
          >
            <span>Open WebMCP Live Sandbox</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* In-Browser WebMCP Card */}
          <div className="p-5 rounded-2xl bg-darkroom-surface border border-purple-800/40 space-y-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-purple-900/60 border-b border-l border-purple-700/50 rounded-bl-xl text-[10px] font-mono text-purple-300">
              WebMCP/2026 Protocol
            </div>
            <div className="flex items-center space-x-2 text-purple-400 font-bold font-mono text-sm">
              <Globe className="w-4 h-4" />
              <span>1. In-Browser WebMCP (DOM Event Bus)</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Exposes structured, type-safe JSON tools directly inside the client browser DOM runtime via{' '}
              <code className="px-1.5 py-0.5 rounded bg-zinc-900 text-purple-300 font-mono text-[11px]">
                window.__screened_web_mcp__
              </code>
              . Designed for autonomous in-browser agents to cross-examine dossiers without fragile screen scraping or OCR vision models.
            </p>
            <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                <span className="text-zinc-300">
                  <strong className="text-zinc-100">Supported Agents:</strong> Chrome with experimental agent flags, Claude Computer Use, Gemini Live browser runners, Cursor browser extensions, and Playwright/Puppeteer.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                <span className="text-zinc-300">
                  <strong className="text-zinc-100">Custom DOM Events:</strong> Agents dispatch{' '}
                  <code className="text-purple-300 font-mono">webmcp:call</code> and listen to{' '}
                  <code className="text-purple-300 font-mono">webmcp:result</code>.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                <span className="text-zinc-300">
                  <strong className="text-zinc-100">Live Visual Telemetry:</strong> Automatically scrolls to and spotlights scrutinized evidence blocks with an amber glow when an agent queries claims.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                <span className="text-zinc-300">
                  <strong className="text-zinc-100">Tamper Defense:</strong> Tool definitions and runtime methods are deeply frozen via{' '}
                  <code className="text-purple-300 font-mono">Object.freeze()</code>.
                </span>
              </div>
            </div>
          </div>

          {/* Headless Server MCP Card */}
          <div className="p-5 rounded-2xl bg-darkroom-surface border border-blue-800/40 space-y-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-blue-900/60 border-b border-l border-blue-700/50 rounded-bl-xl text-[10px] font-mono text-blue-300">
              Anthropic MCP v1.x
            </div>
            <div className="flex items-center space-x-2 text-blue-400 font-bold font-mono text-sm">
              <Terminal className="w-4 h-4" />
              <span>2. Headless Server MCP (JSON-RPC 2.0)</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Standardized Model Context Protocol server exposing 7 specialized investigative tools over Server-Sent Events (SSE) and direct JSON-RPC 2.0 HTTP POST endpoints.
            </p>
            <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <span className="text-zinc-300">
                  <strong className="text-zinc-100">Transport Endpoints:</strong> SSE Stream at{' '}
                  <code className="text-blue-300 font-mono">/api/mcp/sse</code>, JSON-RPC handler at{' '}
                  <code className="text-blue-300 font-mono">/api/mcp/messages</code>, HTTP testing at{' '}
                  <code className="text-blue-300 font-mono">/api/mcp/rpc</code>.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <span className="text-zinc-300">
                  <strong className="text-zinc-100">Supported Clients:</strong> Claude Desktop, Cursor IDE, Antigravity, and automated backend AI agents.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <span className="text-zinc-300">
                  <strong className="text-zinc-100">7 Core Tools:</strong> <code className="text-blue-300 font-mono">screened_ask_dossier</code>, <code className="text-blue-300 font-mono">screened_verify_venue_lease</code>, <code className="text-blue-300 font-mono">screened_audit_companies_house</code>, <code className="text-blue-300 font-mono">screened_detect_contradictions</code>, <code className="text-blue-300 font-mono">screened_export_markdown</code>, <code className="text-blue-300 font-mono">screened_dispatch_investigation</code>, <code className="text-blue-300 font-mono">screened_get_provenance_graph</code>.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                <span className="text-zinc-300">
                  <strong className="text-zinc-100">Security Guardrails:</strong> Token bucket rate limiter, SSRF public URL validation, and prompt injection quarantine.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Google ADK Multi-Agent Orchestration Pipeline */}
      <div className="space-y-4">
        <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
              Google Agent Development Kit (ADK) Roster
            </h4>
          </div>
          <span className="text-xs text-zinc-400 font-mono">8 Specialized Agents · Deterministic State Machine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Producer Desk */}
          <div className="p-4 rounded-xl bg-darkroom-surface border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sky-400 font-bold font-mono">ProducerDeskAgent</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                LlmAgent
              </span>
            </div>
            <p className="text-zinc-300">
              Conversational intake hub. Parses filmmaker queries, PDF scripts, and festival invitations. Dispatches interactive mini-UIs.
            </p>
            <div className="text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
              Model: <span className="text-zinc-200">Gemini 2.5 Pro</span>
            </div>
          </div>

          {/* Disambiguator */}
          <div className="p-4 rounded-xl bg-darkroom-surface border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-bold font-mono">DisambiguatorAgent</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                LlmAgent
              </span>
            </div>
            <p className="text-zinc-300">
              Sub-second candidate normalization. Resolves ambiguous festival names, city editions, and acronym collisions.
            </p>
            <div className="text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
              Model: <span className="text-zinc-200">Gemini 2.5 Flash</span>
            </div>
          </div>

          {/* Planner */}
          <div className="p-4 rounded-xl bg-darkroom-surface border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-400 font-bold font-mono">PlannerAgent</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                LlmAgent
              </span>
            </div>
            <p className="text-zinc-300">
              Formulates investigative questions across 3 domains and delegates tasks to the Deep Vetting Cluster.
            </p>
            <div className="text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
              Model: <span className="text-zinc-200">Gemini 2.5 Pro</span>
            </div>
          </div>

          {/* Deep Vetting Cluster */}
          <div className="p-4 rounded-xl bg-darkroom-surface border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold font-mono">DeepVettingCluster</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                ParallelAgent
              </span>
            </div>
            <p className="text-zinc-300">
              Concurrent domain vetting: FestivalAgent (screening leases), OrganizerAgent (Companies House), ParticipantsAgent (jury/forum flags).
            </p>
            <div className="text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
              Execution: <span className="text-zinc-200">3 Parallel Workers</span>
            </div>
          </div>

          {/* Claim Extractor */}
          <div className="p-4 rounded-xl bg-darkroom-surface border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-purple-400 font-bold font-mono">ClaimExtractorAgent</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                LlmAgent
              </span>
            </div>
            <p className="text-zinc-300">
              Extracts atomic claims and grounds them against verbatim quoted substrings from the Parallel Search layer with source tiers.
            </p>
            <div className="text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
              Integrity: <span className="text-zinc-200">100% Verbatim Proof</span>
            </div>
          </div>

          {/* Contradiction Analyst */}
          <div className="p-4 rounded-xl bg-darkroom-surface border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-rose-400 font-bold font-mono">ContradictionAnalyst</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                LlmAgent
              </span>
            </div>
            <p className="text-zinc-300">
              Detects factual collisions between marketing claims and official registries, computing the severity penalty score C_severity.
            </p>
            <div className="text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
              Model: <span className="text-zinc-200">Gemini 2.5 Pro</span>
            </div>
          </div>

          {/* Report Writer */}
          <div className="p-4 rounded-xl bg-darkroom-surface border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-teal-400 font-bold font-mono">ReportWriterAgent</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-mono">
                SequentialAgent
              </span>
            </div>
            <p className="text-zinc-300">
              Compiles multi-domain narrative dossiers across 4 progressive disclosure tiers and stamps them with a SHA-256 seal.
            </p>
            <div className="text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
              Output: <span className="text-zinc-200">4-Tier Dossier + .md</span>
            </div>
          </div>

          {/* Opportunity Scout & Outreach */}
          <div className="p-4 rounded-xl bg-darkroom-surface border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-indigo-400 font-bold font-mono">Scout & Outreach</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                LlmAgent
              </span>
            </div>
            <p className="text-zinc-300">
              OpportunityScoutAgent matches film profiles to verified public funds (.ics exports). OutreachDrafterAgent drafts sandboxed inquiries.
            </p>
            <div className="text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
              Gate: <span className="text-zinc-200">SHA-256 Approval Gate</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Parallel Search & Evidence Bedrock */}
      <div className="p-5 rounded-2xl bg-darkroom-surface border border-emerald-900/40 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-sm">
            <FileSearch className="w-4 h-4" />
            <span>Parallel Ground-Truth Evidence Engine (6-Capability Matrix)</span>
          </div>
          <span className="text-xs font-mono text-emerald-400/80">Sole Source of Factual Truth</span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Screened enforces an absolute architectural separation between the <strong>Reasoning Layer (Gemini 2.5)</strong> and the{' '}
          <strong>Evidence Layer (Parallel API)</strong>. Gemini is strictly prohibited from searching from parametric memory or hallucinating facts.
          Every single atomic claim in a dossier is grounded against verbatim text quotes extracted by Parallel:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-darkroom-bg border border-zinc-800">
            <span className="font-mono font-bold text-emerald-300">1. Parallel Search</span>
            <p className="text-zinc-400 mt-1">High-precision search queries across public domain databases, press releases, and film festival archives.</p>
          </div>
          <div className="p-3 rounded-xl bg-darkroom-bg border border-zinc-800">
            <span className="font-mono font-bold text-emerald-300">2. Parallel Extract</span>
            <p className="text-zinc-400 mt-1">Extracts exact verbatim quoted substrings and assigns source tier classifications (Tier 1 Registry, Tier 2 Trade, Tier 3 Forum).</p>
          </div>
          <div className="p-3 rounded-xl bg-darkroom-bg border border-zinc-800">
            <span className="font-mono font-bold text-emerald-300">3. Parallel FindAll</span>
            <p className="text-zinc-400 mt-1">Exhaustive opportunity discovery matching filmmaker profile parameters to open festival calls and grant portals.</p>
          </div>
          <div className="p-3 rounded-xl bg-darkroom-bg border border-zinc-800">
            <span className="font-mono font-bold text-emerald-300">4. Parallel Task API</span>
            <p className="text-zinc-400 mt-1">Asynchronous deep investigation tasks for heavy investigative workloads and complex domain checks.</p>
          </div>
          <div className="p-3 rounded-xl bg-darkroom-bg border border-zinc-800">
            <span className="font-mono font-bold text-emerald-300">5. Parallel Monitor</span>
            <p className="text-zinc-400 mt-1">Continuous page drift tracking for fee escalations and venue changes with HMAC SHA-256 webhooks (/api/webhooks/parallel).</p>
          </div>
          <div className="p-3 rounded-xl bg-darkroom-bg border border-zinc-800">
            <span className="font-mono font-bold text-emerald-300">6. Parallel Task Groups</span>
            <p className="text-zinc-400 mt-1">Batch orchestration across multiple monitored targets and concurrent domain audits.</p>
          </div>
        </div>
      </div>

      {/* 6. Security, Cryptography & Cloud Infrastructure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Security & Cryptography Card */}
        <div className="p-5 rounded-2xl bg-darkroom-surface border border-zinc-800 space-y-3">
          <div className="flex items-center space-x-2 text-rose-400 font-bold font-mono text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographic Integrity & Security Guardrails</span>
          </div>
          <ul className="space-y-2 text-zinc-300">
            <li className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-zinc-100">Exact-Payload Action Gate:</strong> Inquiry emails require manual approval of exact payload hash:{' '}
                <code className="text-rose-300 font-mono text-[10px]">sha256(recipient + subject + body + claim_id)</code>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-zinc-100">Evidence Fingerprinting:</strong> Every atomic claim is cryptographically sealed:{' '}
                <code className="text-rose-300 font-mono text-[10px]">sha256(claim + quote + url + timestamp)</code>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-zinc-100">Client-Side PII Vault:</strong> Redacts emails, telephone numbers, and sensitive personal identifiers before external LLM queries.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-zinc-100">HMAC-SHA256 Webhooks:</strong> Webhook deliveries from Parallel Monitor are verified with timestamp expiry validation.
              </span>
            </li>
          </ul>
        </div>

        {/* Cloud Infrastructure & Production Footprint Card */}
        <div className="p-5 rounded-2xl bg-darkroom-surface border border-zinc-800 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold font-mono text-sm">
            <Server className="w-4 h-4" />
            <span>Google Cloud Production Infrastructure</span>
          </div>
          <ul className="space-y-2 text-zinc-300">
            <li className="flex items-start gap-2">
              <Cpu className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-zinc-100">Google Cloud Run:</strong> Auto-scaling containerized FastAPI backend deployed in London (<code className="text-amber-300 font-mono text-[10px]">europe-west2</code>).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Database className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-zinc-100">Google Cloud Firestore:</strong> Real-time document persistence for investigations, claims ledger, and filmmaker feedback.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Activity className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-zinc-100">Cloud Tasks & OpenTelemetry:</strong> Durable async queuing (<code className="text-amber-300 font-mono text-[10px]">screened-tasks</code>) with OIDC authentication and distributed Cloud Trace spans.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-zinc-100">Cloud Secret Manager:</strong> Secure runtime injection of Parallel and session cryptographic keys.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
