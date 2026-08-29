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
    <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-6">
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-amber-400">
          <Scale className="size-4.5" />
          <span>Factual Contradictions & Direct Disputes ({disputes.length})</span>
        </div>
        <span className="text-xs font-mono text-amber-400/80">
          Side-by-side evidence comparison
        </span>
      </div>

      <div className="space-y-6">
        {disputes.map((dispute, idx) => (
          <div
            key={dispute.id || idx}
            className="p-4 rounded-xl bg-darkroom-surface border border-amber-500/30 space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  {dispute.category}
                </span>
                <h3 className="font-serif font-semibold text-base text-darkroom-text mt-1.5">
                  {dispute.pointOfContention}
                </h3>
              </div>
            </div>

            {/* Split Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Claim A */}
              <div className="p-3.5 rounded-lg bg-black/40 space-y-2">
                <div className="text-[11px] font-mono uppercase text-blue-400 font-semibold flex items-center gap-1.5">
                  <span>Position A</span>
                </div>
                <div className="text-xs font-medium text-darkroom-text">
                  "{dispute.claimA}"
                </div>

                {dispute.evidenceA && dispute.evidenceA.length > 0 && (
                  <div className="space-y-2 pt-1 text-[11px]">
                    {(dispute.evidenceA as FlexibleEvidence[]).map((ev, eIdx) => {
                      const { quote, url, title } = resolveEvidence(ev);
                      if (!quote && !url) return null;
                      return (
                        <div
                          key={eIdx}
                          className="border-l-2 border-blue-500/60 bg-blue-500/5 rounded-r-md px-2.5 py-1.5 text-darkroom-muted space-y-1"
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
                              className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1 text-[10px] font-mono"
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
              <div className="p-3.5 rounded-lg bg-black/40 space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
                  <span>Position B (Opposing)</span>
                </div>
                <div className="text-xs font-medium text-darkroom-text">
                  "{dispute.claimB}"
                </div>

                {dispute.evidenceB && dispute.evidenceB.length > 0 && (
                  <div className="space-y-2 pt-1 text-[11px]">
                    {(dispute.evidenceB as FlexibleEvidence[]).map((ev, eIdx) => {
                      const { quote, url, title } = resolveEvidence(ev);
                      if (!quote && !url) return null;
                      return (
                        <div
                          key={eIdx}
                          className="border-l-2 border-slate-500/60 bg-slate-500/5 rounded-r-md px-2.5 py-1.5 text-darkroom-muted space-y-1"
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
            </div>

            {/* Guidance for Filmmaker */}
            <div className="p-3 rounded-lg bg-amber-500/10 text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-semibold font-mono uppercase text-[10px]">
                  Filmmaker Recommendation:{' '}
                </span>
                <span>{dispute.guidance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
