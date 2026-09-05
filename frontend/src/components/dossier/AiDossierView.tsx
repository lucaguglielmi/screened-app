import React from 'react';
import { Bot, Sparkles, Download, Check, Copy, Code, FileText } from 'lucide-react';

interface Props {
  entityName: string;
  officialDomain?: string;
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
  return (
    <div className="space-y-6 animate-fade-in" data-density="MACHINE_AI_INGESTION">
      {/* Autonomous Agent Banner */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-emerald-950/40 via-darkroom-surface to-darkroom-surface border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-300">
            <span>Entity: <strong className="text-white">{entityName}</strong></span>
            <span>•</span>
            <span>Domain: <strong className="text-white">{officialDomain || 'Verified Web'}</strong></span>
            <span>•</span>
            <span>Claims: <strong className="text-emerald-400">{claimsCount}</strong></span>
            <span>•</span>
            <span>Sources: <strong className="text-indigo-400">{sourcesCount}</strong></span>
            <span>•</span>
            <span>Contradictions: <strong className="text-orange-400">{disputesCount}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={onCopyAiPayload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-mono text-emerald-300 hover:text-emerald-200 transition-all shadow-md cursor-pointer group active:scale-95 flex-1 sm:flex-initial justify-center"
            title="Copy structured JSON-LD format for prompt injection"
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-darkroom-card/90 hover:bg-darkroom-surface border border-darkroom-border text-xs font-mono text-slate-200 hover:text-white transition-all shadow-md cursor-pointer group active:scale-95 flex-1 sm:flex-initial justify-center"
            title="Download full due diligence evidence as a Markdown (.md) document"
          >
            <Download className="size-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            <span>Download data as .md file</span>
          </button>
        </div>
      </div>

      {/* 1. Structured JSON-LD Code Block */}
      <div className="rounded-3xl bg-darkroom-surface p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-darkroom-border pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <Code className="size-4 text-slate-400" />
            <span>
              JSON-LD Semantic Due Diligence Payload ({JSON.stringify(aiIngestionPayload).length} bytes)
            </span>
          </div>
          <button
            type="button"
            onClick={onCopyAiPayload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-darkroom-card hover:bg-darkroom-card text-xs font-mono text-white transition-all cursor-pointer shadow-sm active:scale-95"
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
          className="p-4 rounded-2xl bg-darkroom-bg text-emerald-400 font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed select-all"
        >
          {JSON.stringify(aiIngestionPayload, null, 2)}
        </pre>
      </div>

      {/* 2. Full Plain Text Raw Data Dump */}
      <div className="rounded-3xl bg-darkroom-surface p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-darkroom-border pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <FileText className="size-4 text-indigo-400" />
            <span>Raw Plain Text Dossier Dump (Complete Ground Truth)</span>
          </div>
          <button
            type="button"
            onClick={onCopyRawText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-darkroom-card hover:bg-darkroom-card text-xs font-mono text-white transition-all cursor-pointer shadow-sm active:scale-95"
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
          className="p-4 rounded-2xl bg-darkroom-bg text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed whitespace-pre-wrap select-all border border-darkroom-border"
        >
          {rawPlainTextDossier}
        </pre>
      </div>
    </div>
  );
};
