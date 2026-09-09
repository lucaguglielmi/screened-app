import React, { useState } from 'react';
import { Bot, Sparkles, Download, Check, Copy, Code, FileText, Terminal, Radio, ShieldCheck, ArrowRight } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface Props {
  entityName: string;
  officialDomain?: string;
  investigationId?: string;
  claimsCount: number;
  sourcesCount: number;
  disputesCount: number;
  aiIngestionPayload: Record<string, unknown>;
  rawPlainTextDossier: string;
  copiedAiPayload: boolean;
  copiedRawText: boolean;
  downloadingMd: boolean;
  onCopyAiPayload: () => void;
  onCopyRawText: () => void;
  onDownloadMarkdown: () => void;
}

export const AiDossierView: React.FC<Props> = ({
  entityName,
  officialDomain,
  investigationId,
  claimsCount,
  sourcesCount,
  disputesCount,
  aiIngestionPayload,
  rawPlainTextDossier,
  copiedAiPayload,
  copiedRawText,
  downloadingMd,
  onCopyAiPayload,
  onCopyRawText,
  onDownloadMarkdown,
}) => {
  const [copiedWebMcp, setCopiedWebMcp] = useState(false);
  const [copiedMcpConfig, setCopiedMcpConfig] = useState(false);
  const [copiedAgentPrompt, setCopiedAgentPrompt] = useState(false);

  const activeId = investigationId || 'demo_pinco_pallino';

  const webMcpSnippet = `// In-Browser WebMCP (WebMCP/2026) - Run directly in Console or via Browser Agent:
const response = await window.__screened_web_mcp__.callTool('screened_ask_dossier', {
  dossier_id: '${activeId}',
  question: 'Audit physical venue leases and Companies House filing status for ${entityName}.'
});
console.log('WebMCP Dossier Intelligence:', response);`;

  const mcpServerConfig = JSON.stringify(
    {
      mcpServers: {
        screened: {
          url: 'https://totallyscreened.com/api/mcp/sse',
        },
      },
    },
    null,
    2
  );

  const agentAuditPrompt = `You are an autonomous cinema intelligence auditor investigating the film festival: ${entityName} (Dossier ID: ${activeId}).
Access the Screened WebMCP / Server MCP protocol and examine:
1. Corporate registration and active Companies House entity status.
2. Direct box office confirmation for advertised physical screening venues.
3. Fee escalation tiers and submission deadline inflation.
4. Historical filmmaker disputes and contradiction records.
Standards: Require 2+ independent corroborating sources before accepting claims. Distinguish FACT from ALLEGATION.`;

  const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    soundEffects.playSuccess();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-6 animate-fade-in" data-density="MACHINE_AI_INGESTION">
      {/* Autonomous Agent Banner */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/[0.02] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Bot className="size-4" />
              <span>Machine Ingestion &amp; Autonomous Agent Pipeline</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Optimized for LLM context windows, LangChain crawlers, and programmatic verification engines.
          </p>
          <div className="flex items-center gap-x-3 gap-y-1.5 pt-1 text-[11px] font-mono text-slate-300 flex-wrap">
            <span>Entity: <strong className="text-white">{entityName}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Domain: <strong className="text-white">{officialDomain || 'Verified Web'}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Claims: <strong className="text-emerald-400">{claimsCount}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Sources: <strong className="text-indigo-400">{sourcesCount}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Contradictions: <strong className="text-orange-400">{disputesCount}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <button
            type="button"
            onClick={onCopyAiPayload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-mono text-emerald-300 hover:text-emerald-200 transition-all shadow-md cursor-pointer group active:scale-95 flex-1 sm:flex-initial justify-center"
            title="Copy structured JSON-LD format for AI workflows"
          >
            {copiedAiPayload ? (
              <>
                <Check className="size-4 text-emerald-400" />
                <span className="font-semibold">Copied Semantic Payload!</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
                <span>Copy Semantic JSON-LD</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onDownloadMarkdown}
            disabled={downloadingMd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-slate-200 hover:text-white transition-all shadow-md cursor-pointer group active:scale-95 flex-1 sm:flex-initial justify-center"
            title="Download full due diligence evidence as a Markdown (.md) document"
          >
            <Download className="size-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            <span>Download data as .md file</span>
          </button>
        </div>
      </div>

      {/* Interactive Agent Protocol Hub: WebMCP & Server MCP */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/[0.02] border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Radio className="size-4" />
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
                Investigate with Autonomous Agents (WebMCP &amp; Server MCP)
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Direct programmatic access for in-browser copilots (Chrome WebMCP / Gemini Live) and external LLMs.
            </p>
          </div>

          <a
            href="/agents"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-mono text-purple-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 self-start sm:self-auto"
          >
            <span>Full Agent Docs &amp; Sandbox</span>
            <ArrowRight className="size-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card A: In-Browser WebMCP Execution */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-emerald-400" />
                <span className="text-xs font-mono font-semibold text-emerald-300">In-Browser WebMCP (/2026)</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(webMcpSnippet, setCopiedWebMcp)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] font-mono text-slate-200 hover:text-white cursor-pointer transition-colors active:scale-95"
              >
                {copiedWebMcp ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3 text-slate-400" />}
                <span>{copiedWebMcp ? 'Copied JS!' : 'Copy JavaScript'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exposed live in this tab via <code className="text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded">window.__screened_web_mcp__</code>. Run this directly in the developer console:
            </p>
            <pre className="p-3 rounded-xl bg-midnight-void/90 text-emerald-300 font-mono text-[11px] leading-relaxed overflow-x-auto border border-white/5 select-all">
              {webMcpSnippet}
            </pre>
          </div>

          {/* Card B: Headless Server MCP Configuration */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="size-4 text-purple-400" />
                <span className="text-xs font-mono font-semibold text-purple-300">Google Antigravity Config</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(mcpServerConfig, setCopiedMcpConfig)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] font-mono text-slate-200 hover:text-white cursor-pointer transition-colors active:scale-95"
              >
                {copiedMcpConfig ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3 text-slate-400" />}
                <span>{copiedMcpConfig ? 'Copied Config!' : 'Copy Config'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect external AI agents via SSE stream at <code className="text-purple-300 bg-purple-950/40 px-1 py-0.5 rounded text-[11px]">/api/mcp/sse</code>:
            </p>
            <pre className="p-3 rounded-xl bg-midnight-void/90 text-purple-200 font-mono text-[11px] leading-relaxed overflow-x-auto border border-white/5 select-all">
              {mcpServerConfig}
            </pre>
          </div>
        </div>

        {/* Card C: Ready-to-Use Agent Audit Prompt */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-indigo-400" />
              <span className="text-xs font-mono font-semibold text-indigo-300">Autonomous Dossier Audit Prompt (Gemini / Antigravity)</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(agentAuditPrompt, setCopiedAgentPrompt)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] font-mono text-slate-200 hover:text-white cursor-pointer transition-colors active:scale-95"
            >
              {copiedAgentPrompt ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3 text-slate-400" />}
              <span>{copiedAgentPrompt ? 'Copied Prompt!' : 'Copy System Prompt'}</span>
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-midnight-void/90 text-slate-200 font-mono text-[11px] leading-relaxed whitespace-pre-wrap border border-white/5 select-all">
            {agentAuditPrompt}
          </pre>
        </div>
      </div>

      {/* 1. Structured JSON-LD Code Block */}
      <div className="rounded-3xl bg-white/[0.02] p-4 sm:p-5 shadow-2xl space-y-3 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            {/* Terminal Window Dots */}
            <div className="flex items-center gap-1.5 pr-1">
              <span className="size-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="size-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="size-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <Code className="size-4 text-slate-400" />
              <span className="font-semibold text-white">dossier_graph.jsonld</span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                ({JSON.stringify(aiIngestionPayload).length.toLocaleString()} bytes)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCopyAiPayload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-white transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {copiedAiPayload ? (
              <>
                <Check className="size-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Copied Raw AI Tokens!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-slate-400" />
                <span>Copy Raw AI Payload</span>
              </>
            )}
          </button>
        </div>

        <pre
          id="screened-jsonld-payload"
          className="p-4 rounded-2xl bg-black/40 text-emerald-400 font-mono text-xs overflow-x-auto overflow-y-auto max-h-[440px] leading-relaxed select-all border border-white/10 shadow-inner"
        >
          {JSON.stringify(aiIngestionPayload, null, 2)}
        </pre>
      </div>

      {/* 2. Full Plain Text Raw Data Dump */}
      <div className="rounded-3xl bg-white/[0.02] p-4 sm:p-5 shadow-2xl space-y-3 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            {/* Terminal Window Dots */}
            <div className="flex items-center gap-1.5 pr-1">
              <span className="size-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="size-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="size-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <FileText className="size-4 text-indigo-400" />
              <span className="font-semibold text-white">dossier_ground_truth.txt</span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                (Complete Ground Truth)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCopyRawText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-white transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {copiedRawText ? (
              <>
                <Check className="size-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Copied Raw Text!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-slate-400" />
                <span>Copy Raw Text</span>
              </>
            )}
          </button>
        </div>

        <pre
          id="screened-raw-ai-dossier"
          className="p-4 rounded-2xl bg-black/40 text-slate-200 font-mono text-xs overflow-x-auto overflow-y-auto max-h-[500px] leading-relaxed whitespace-pre-wrap break-words select-all border border-white/10 shadow-inner"
        >
          {rawPlainTextDossier}
        </pre>
      </div>
    </div>
  );
};
