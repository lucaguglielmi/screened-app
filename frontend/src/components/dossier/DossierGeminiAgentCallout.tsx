import React, { useState } from 'react';
import {
  Bot,
  Copy,
  Check,
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
}) => {
  const [copied, setCopied] = useState(false);

  const dossierRef =
    (entity.id && entity.id !== 'default' ? entity.id : null) ||
    (entity.name === 'Pinco Pallino Film Festival'
      ? 'demo_pinco_pallino'
      : entity.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'));

  const promptText = `Audit the ${entity.name} film festival (Screened dossier reference: ${dossierRef}) using Screened MCP / Antigravity plugin: verify venue manifest, check Companies House legal status, and analyze submission fee escalation.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-black/40 border border-indigo-500/30 shadow-lg transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0">
            <Sparkles className="size-4 sm:size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Bot className="size-3.5 text-indigo-400" />
                <span>Gemini &amp; WebMCP Agent Ready</span>
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-white mt-0.5">
              Search this dossier with your Gemini &amp; MCP Agent
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
        </div>
      </div>
    </div>
  );
};
