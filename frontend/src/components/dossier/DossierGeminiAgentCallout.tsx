import React, { useState } from 'react';
import {
  Bot,
  Copy,
  Check,
  ChevronDown,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { CandidateEntity, DossierReport } from '../../types/investigation';

interface Props {
  entity: CandidateEntity;
  dossier?: DossierReport;
  claimsCount?: number;
  onNavigateToAgents?: () => void;
}

/**
 * DossierGeminiAgentCallout
 *
 * An interactive callout panel embedded directly into the due diligence dossier.
 * Enables filmmakers and researchers to search, cross-examine, and audit the active
 * dossier using their Gemini Live assistant, Google Antigravity, or WebMCP agent.
 */
export const DossierGeminiAgentCallout: React.FC<Props> = ({
  entity,
  dossier,
  claimsCount = 0,
  onNavigateToAgents,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const dossierId =
    (entity.id && entity.id !== 'default' ? entity.id : null) ||
    (entity.name === 'Pinco Pallino Film Festival'
      ? 'demo_pinco_pallino'
      : entity.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'));

  const executiveHighlight = dossier?.executiveSummary
    ? `Indexed ground truth: "${dossier.executiveSummary.slice(0, 110)}..."`
    : null;

  const promptText = `Audit the ${entity.name} dossier (${dossierId}) using Screened MCP / Antigravity plugin: verify venue manifest, check Companies House legal status, and analyze submission fee escalation.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleOpenAgents = () => {
    if (onNavigateToAgents) {
      onNavigateToAgents();
    } else {
      window.history.pushState({}, '', '/agents');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-black/40 border border-indigo-500/30 shadow-lg space-y-3.5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0">
            <Sparkles className="size-4 sm:size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Bot className="size-3.5 text-indigo-400" />
                <span>Gemini &amp; Antigravity Agent Ready</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-mono">
                {claimsCount > 0 ? `${claimsCount} Atomic Claims Indexed` : 'Live Ground Truth'}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white mt-0.5">
              Search this dossier with your Gemini Agent
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95"
            aria-label="Copy prompt to clipboard"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-300" />
                <span className="text-emerald-200">Copied Prompt!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copy Gemini Prompt</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="px-2.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer flex items-center gap-1"
            aria-expanded={isExpanded}
            aria-label="Toggle agent instructions"
          >
            <span className="text-[11px] font-mono hidden sm:inline">Details</span>
            <ChevronDown
              className={`size-3.5 text-slate-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-180 text-white' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Prompt Preview Strip */}
      <div className="p-2.5 rounded-xl bg-black/60 border border-indigo-500/20 text-xs font-mono text-indigo-200/90 flex items-start gap-2 select-all break-words">
        <Terminal className="size-3.5 text-indigo-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{promptText}</span>
      </div>

      {/* Collapsible Inspection Details */}
      {isExpanded && (
        <div className="pt-2 border-t border-indigo-500/20 space-y-3 animate-fade-in text-xs text-slate-300">
          <p className="text-[12px] leading-relaxed">
            When you paste this prompt into <strong>Google Antigravity</strong> or your <strong>Gemini Live browser agent</strong>, Screened&apos;s agent connector autonomously executes the forensic toolchain:
          </p>

          {executiveHighlight && (
            <div className="p-2.5 rounded-xl bg-black/40 border border-indigo-500/20 text-indigo-200/90 text-[11px] font-mono">
              {executiveHighlight}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] font-mono">
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <span className="text-indigo-300 font-bold">1. screened_ask_dossier</span>
              <p className="text-slate-400 font-sans">
                Queries the dossier ID (<code className="text-indigo-200">{dossierId}</code>) for venue contracts and festival history.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <span className="text-indigo-300 font-bold">2. screened_inspect_claim</span>
              <p className="text-slate-400 font-sans">
                Verifies verbatim quotes against official UK Companies House filings and cinema calendars.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
              <span className="text-indigo-300 font-bold">3. rules/AGENTS.md</span>
              <p className="text-slate-400 font-sans">
                Applies strict anti-hallucination standards requiring 2+ independent atomic claims for any risk verdict.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono">
              <ShieldCheck className="size-3.5" />
              <span>Indirect Prompt Injection Protected</span>
            </div>

            <button
              type="button"
              onClick={handleOpenAgents}
              className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View full Agents Protocol &amp; Antigravity Setup</span>
              <ExternalLink className="size-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
