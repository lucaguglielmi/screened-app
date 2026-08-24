import React, { useState } from 'react';
import { Evidence } from '../types/investigation';
import { ExternalLink, Quote } from 'lucide-react';

interface Props {
  evidence: Evidence;
  sourceTier?: number;
}

export const CitationPopover: React.FC<Props> = ({ evidence, sourceTier = 2 }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-midnight-royal/15 text-indigo-400 hover:bg-midnight-royal/25 border border-midnight-royal/30 transition-colors cursor-pointer"
        title="View verbatim citation"
      >
        <Quote className="size-2.5" />
        <span className="truncate max-w-[130px]">{evidence.sourceDomain || 'Source'}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 bottom-full mb-2 w-80 sm:w-96 p-4 rounded-xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border shadow-xl z-50 space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-paper-border dark:border-darkroom-border pb-2">
              <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-neutral-500/10 text-neutral-600 dark:text-neutral-400">
                Tier {sourceTier} • {evidence.sourceDomain}
              </span>
              {evidence.sourceUrl && (
                <a
                  href={evidence.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                >
                  Visit <ExternalLink className="size-3" />
                </a>
              )}
            </div>

            <div className="font-medium text-paper-text dark:text-darkroom-text">
              {evidence.sourceTitle || evidence.sourceDomain}
            </div>

            <blockquote className="p-2.5 rounded-lg bg-paper-card dark:bg-darkroom-card text-paper-muted dark:text-darkroom-muted italic border-l-2 border-indigo-500 text-[11px] leading-relaxed">
              "{evidence.exactExcerpt}"
            </blockquote>

            {evidence.note && (
              <div className="text-[11px] text-paper-muted dark:text-darkroom-muted">
                <span className="font-semibold text-paper-text dark:text-darkroom-text">
                  Relevance:{' '}
                </span>
                {evidence.note}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
