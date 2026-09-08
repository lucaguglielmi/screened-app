import React, { useState } from 'react';
import { DisputeRecord } from '../types/investigation';
import { AlertTriangle, ChevronDown, ExternalLink, Scale } from 'lucide-react';

interface Props {
  disputes: DisputeRecord[];
}

interface FlexibleEvidence {
  sourceId?: string;
  sourceUrl?: string;
  url?: string;
  sourceDomain?: string;
  domain?: string;
  sourceTitle?: string;
  title?: string;
  exactExcerpt?: string;
  snippet?: string;
  exact_excerpt?: string;
  quote?: string;
  text?: string;
}

function resolveEvidence(ev: FlexibleEvidence) {
  const quote =
    ev.exactExcerpt ||
    ev.snippet ||
    ev.exact_excerpt ||
    ev.quote ||
    ev.text ||
    '';
  const url = ev.sourceUrl || ev.url || '';
  let fallbackDomain = '';
  if (url) {
    try {
      fallbackDomain = new URL(url).hostname;
    } catch {
      fallbackDomain = 'Source';
    }
  }
  const title =
    ev.sourceTitle ||
    ev.sourceDomain ||
    ev.title ||
    ev.domain ||
    fallbackDomain ||
    'Source';
  return { quote, url, title };
}

export const ContradictionPanel: React.FC<Props> = ({ disputes }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (!disputes || disputes.length === 0) {
    return null;
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="py-4 space-y-4 border-b border-white/[0.06] pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/[0.06] pb-2.5">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
          <Scale className="size-3.5 text-indigo-400" />
          <span>Factual Contradictions &amp; Disputed Claims ({disputes.length})</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Side-by-side evidence cross-examination
        </span>
      </div>

      <div className="space-y-3">
        {disputes.map((dispute, idx) => {
          const itemId = dispute.id || `dispute-${idx}`;
          const isExpanded = expandedIds.has(itemId);

          return (
            <div
              key={itemId}
              className={`rounded-2xl transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-white/[0.04] shadow-lg'
                  : 'bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              {/* Clickable Header: Collapsed by Default */}
              <button
                type="button"
                onClick={() => toggleExpand(itemId)}
                className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none transition-colors"
                aria-expanded={isExpanded}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 font-semibold">
                      {dispute.category}
                    </span>
                    {!isExpanded && (
                      <span className="font-mono text-[10px] text-slate-400">
                        Click to inspect conflicting claims & evidence
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-semibold text-sm sm:text-base text-white break-words">
                    {dispute.pointOfContention}
                  </h3>

                  {/* Summary Preview Pills when Collapsed */}
                  {!isExpanded && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-sans text-slate-300">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                        <strong>Pos A:</strong> {dispute.claimA.length > 50 ? `${dispute.claimA.slice(0, 50)}...` : dispute.claimA}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">vs</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-300 font-mono text-[10px]">
                        <strong>Pos B:</strong> {dispute.claimB.length > 50 ? `${dispute.claimB.slice(0, 50)}...` : dispute.claimB}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-1.5 rounded-lg bg-white/[0.04] text-slate-400 shrink-0 mt-0.5">
                  <ChevronDown
                    className={`size-4 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Expanded Inspection Section */}
              {isExpanded && (
                <div className="p-4 sm:p-5 pt-0 sm:pt-0 space-y-3.5 border-t border-white/[0.06] mt-1">
                  <div className="pt-3">
                    {/* Split Comparison Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Claim A */}
              <div className="p-3 rounded-xl bg-white/[0.02] space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-indigo-300 font-semibold flex items-center gap-1.5">
                  <span>Position A</span>
                </div>
                <div className="text-xs font-medium text-slate-100 leading-relaxed">
                  "{dispute.claimA}"
                </div>

                {dispute.evidenceA && dispute.evidenceA.length > 0 && (
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    {(dispute.evidenceA as FlexibleEvidence[]).map((ev, eIdx) => {
                      const { quote, url, title } = resolveEvidence(ev);
                      if (!quote && !url) return null;
                      return (
                        <div
                          key={eIdx}
                          className="border-l-2 border-indigo-500/60 bg-indigo-500/5 rounded-r-md px-2.5 py-1 text-slate-300 space-y-1"
                        >
                          {quote && (
                            <div className="italic text-slate-200 font-sans text-xs">
                              "{quote}"
                            </div>
                          )}
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1 text-[10px] font-mono"
                            >
                              Source: {title}{' '}
                              <ExternalLink className="size-2.5" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Claim B */}
              <div className="p-3 rounded-xl bg-white/[0.02] space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-orange-400 font-semibold flex items-center gap-1.5">
                  <span>Position B (Contradictory / Divergent)</span>
                </div>
                <div className="text-xs font-medium text-slate-100 leading-relaxed">
                  "{dispute.claimB}"
                </div>

                {dispute.evidenceB && dispute.evidenceB.length > 0 && (
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    {(dispute.evidenceB as FlexibleEvidence[]).map((ev, eIdx) => {
                      const { quote, url, title } = resolveEvidence(ev);
                      if (!quote && !url) return null;
                      return (
                        <div
                          key={eIdx}
                          className="border-l-2 border-orange-500/60 bg-orange-500/5 rounded-r-md px-2.5 py-1 text-slate-300 space-y-1"
                        >
                          {quote && (
                            <div className="italic text-slate-200 font-sans text-xs">
                              "{quote}"
                            </div>
                          )}
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-400 hover:text-orange-300 hover:underline inline-flex items-center gap-1 text-[10px] font-mono"
                            >
                              Source: {title}{' '}
                              <ExternalLink className="size-2.5" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Reconciliation Guidance */}
            {dispute.guidance && (
              <div className="p-3 rounded-xl bg-white/[0.02] flex items-start gap-2.5 text-xs">
                <AlertTriangle className="size-4 text-orange-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-mono text-[10px] uppercase text-orange-400 font-bold">
                    Filmmaker Advisory &amp; Verification Guidance
                  </div>
                  <div className="text-slate-300 leading-relaxed font-sans text-xs">
                    {dispute.guidance}
                  </div>
                </div>
              </div>
            )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
