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
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-midnight-royal/15 text-indigo-400 hover:bg-midnight-royal/25 border border-midnight-royal/30 transition-colors cursor-pointer"
        title="View verbatim citation"
      >
        <Quote className="size-2.5" />
        <span className="truncate max-w-[130px]">{evidence.sourceDomain || 'Source'}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-darkroom-bg/80 backdrop-blur-sm cursor-pointer" 
            onClick={() => setOpen(false)} 
          />
          <div className="relative w-full max-w-lg p-6 rounded-2xl bg-darkroom-surface border border-darkroom-border shadow-2xl space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paper-card border-darkroom-card pb-4">
              <div className="space-y-1">
                <div className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 inline-block">
                  Tier {sourceTier} • {evidence.sourceDomain}
                </div>
                <div className="font-serif text-lg text-white font-medium">
                  {evidence.sourceTitle || evidence.sourceDomain}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                Verbatim AI Excerpt Extract
              </div>
              <blockquote className="p-4 rounded-xl bg-darkroom-card text-slate-200 italic border-l-4 border-indigo-500 text-sm leading-relaxed shadow-inner">
                "{evidence.exactExcerpt}"
              </blockquote>
            </div>

            {evidence.note && (
              <div className="text-xs text-slate-400 bg-darkroom-card/50 p-3 rounded-lg border border-darkroom-border">
                <span className="font-semibold text-slate-300">Analysis Note: </span>
                {evidence.note}
              </div>
            )}
            
            <div className="pt-2 flex justify-end gap-3">
              <button 
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
              {evidence.sourceUrl && (
                <a
                  href={evidence.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium transition-colors shadow-lg shadow-indigo-900/20 inline-flex items-center gap-2"
                >
                  Open Full Article <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
