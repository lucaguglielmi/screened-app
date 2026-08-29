import React from 'react';
import { DisputeRecord } from '../types/investigation';
import { AlertTriangle, ExternalLink, Scale } from 'lucide-react';

interface Props {
  disputes: DisputeRecord[];
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
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    {dispute.evidenceA.map((ev, eIdx) => (
                      <div
                        key={eIdx}
                        className="border-l-2 border-blue-500/50 pl-2 text-darkroom-muted"
                      >
                        <div className="italic">"{ev.exactExcerpt}"</div>
                        {ev.sourceUrl && (
                          <a
                            href={ev.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            Source: {ev.sourceTitle || ev.sourceDomain}{' '}
                            <ExternalLink className="size-2.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Claim B */}
              <div className="p-3.5 rounded-lg bg-black/40 space-y-2">
                <div className="text-[11px] font-mono uppercase text-rose-400 font-semibold flex items-center gap-1.5">
                  <span>Position B (Opposing)</span>
                </div>
                <div className="text-xs font-medium text-darkroom-text">
                  "{dispute.claimB}"
                </div>

                {dispute.evidenceB && dispute.evidenceB.length > 0 && (
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    {dispute.evidenceB.map((ev, eIdx) => (
                      <div
                        key={eIdx}
                        className="border-l-2 border-rose-500/50 pl-2 text-darkroom-muted"
                      >
                        <div className="italic">"{ev.exactExcerpt}"</div>
                        {ev.sourceUrl && (
                          <a
                            href={ev.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            Source: {ev.sourceTitle || ev.sourceDomain}{' '}
                            <ExternalLink className="size-2.5" />
                          </a>
                        )}
                      </div>
                    ))}
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
