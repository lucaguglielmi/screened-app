import React from 'react';
import { DisputeRecord } from '../types/investigation';
import { AlertTriangle, ExternalLink, Scale } from 'lucide-react';

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
  if (!disputes || disputes.length === 0) {
    return null;
  }

  return (
    <div className="py-4 space-y-4 border-b border-darkroom-border/30 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-darkroom-border/40 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
          <Scale className="size-3.5 text-indigo-400" />
          <span>Factual Contradictions &amp; Disputed Claims ({disputes.length})</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Side-by-side evidence cross-examination
        </span>
      </div>

      <div className="space-y-4">
        {disputes.map((dispute, idx) => (
          <div
            key={dispute.id || idx}
            className="p-4 sm:p-5 rounded-2xl bg-darkroom-surface/60 border border-darkroom-border/60 space-y-3.5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  {dispute.category}
                </span>
                <h3 className="font-serif font-semibold text-base text-white mt-1.5">
                  {dispute.pointOfContention}
                </h3>
              </div>
            </div>

            {/* Split Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Claim A */}
              <div className="p-3 rounded-xl bg-darkroom-bg/70 border border-darkroom-border/40 space-y-1.5">
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
              <div className="p-3 rounded-xl bg-darkroom-bg/70 border border-darkroom-border/40 space-y-1.5">
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
              <div className="p-3 rounded-xl bg-darkroom-bg/50 border border-darkroom-border/40 flex items-start gap-2.5 text-xs">
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
        ))}
      </div>
    </div>
  );
};
