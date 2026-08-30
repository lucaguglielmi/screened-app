import React, { useState } from 'react';
import {
  Calendar,
  Award,
  MapPin,
  Trophy,
  ExternalLink,
  Newspaper,
  Info,
} from 'lucide-react';
import { PreviousEditionRecord } from '../../types/investigation';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  previousEditions?: PreviousEditionRecord[];
  festivalName: string;
}

export const PreviousEditionsSection: React.FC<Props> = ({
  previousEditions,
  festivalName,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('ALL');

  if (!previousEditions || previousEditions.length === 0) {
    return (
      <div className="rounded-2xl p-5 border border-darkroom-border bg-darkroom-surface/60 text-slate-400 text-xs flex items-center gap-3">
        <Info className="size-4 text-slate-500 shrink-0" />
        <span>
          No previous edition historical records, winner listings, or archive catalogs were corroborated in public records for {festivalName}.
        </span>
      </div>
    );
  }

  // Sort by year descending
  const sortedEditions = [...previousEditions].sort((a, b) => b.year - a.year);
  const availableYears = Array.from(new Set(sortedEditions.map(e => e.year.toString())));

  const filteredEditions = selectedYear === 'ALL'
    ? sortedEditions
    : sortedEditions.filter(e => e.year.toString() === selectedYear);

  return (
    <div className="space-y-4">
      <div className="border-b border-darkroom-border pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-serif text-white flex items-center gap-2">
            <Calendar className="size-4 text-tool-diligence" />
            <span>Previous Editions &amp; Historical Track Record</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Documented past festival years, screening venue footprints, verified award recipients, and press coverage.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {availableYears.length > 1 && (
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-darkroom-card border border-darkroom-border text-xs font-mono">
              <button
                type="button"
                onClick={() => setSelectedYear('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                  selectedYear === 'ALL'
                    ? 'bg-midnight-royal text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({sortedEditions.length})
              </button>
              {availableYears.map(year => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setSelectedYear(year)}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                    selectedYear === year
                      ? 'bg-midnight-royal text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          <span className="text-xs font-mono font-semibold text-tool-diligence bg-tool-diligence/10 border border-tool-diligence/20 px-2.5 py-0.5 rounded-full">
            {sortedEditions.length} Years Corroborated
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredEditions.map((edition, idx) => (
            <motion.div
              key={edition.year || idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-4 sm:p-5 border border-darkroom-border bg-darkroom-surface/90 hover:border-zinc-700/80 shadow-md space-y-4 transition-all"
            >
            {/* Edition Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-darkroom-border/60">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-midnight-royal/40 border border-tool-diligence/30 text-white font-mono font-bold text-sm sm:text-base">
                  {edition.year}
                </span>
                {edition.editionNumber && (
                  <span className="text-xs font-mono text-tool-diligence font-semibold">
                    {edition.editionNumber}
                  </span>
                )}
              </div>

              {(edition.heldLocation || edition.heldDates) && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
                  {edition.heldLocation && (
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      <MapPin className="size-3.5 text-rose-400 shrink-0" />
                      <span>{edition.heldLocation}</span>
                    </span>
                  )}
                  {edition.heldDates && (
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <Calendar className="size-3.5 text-indigo-400 shrink-0" />
                      <span>{edition.heldDates}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Awards & Winners Grid */}
            {edition.awards && edition.awards.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <Trophy className="size-3 text-amber-400" />
                  <span>Official Awards &amp; Winning Films</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {edition.awards.map((award, aIdx) => (
                    <div
                      key={aIdx}
                      className="p-3 rounded-xl bg-darkroom-card/70 border border-darkroom-border/80 hover:border-zinc-600 transition-all flex flex-col justify-between space-y-2"
                    >
                      <div>
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 inline-block mb-1.5">
                          {award.awardName}
                        </span>
                        <h5 className="text-xs font-bold text-white font-sans flex items-center gap-1">
                          <Award className="size-3 text-amber-400 shrink-0" />
                          <span className="truncate">{award.winnerTitle}</span>
                        </h5>
                        {award.recipientName && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            by <span className="text-slate-300 font-medium">{award.recipientName}</span>
                          </p>
                        )}
                      </div>

                      {award.winnerUrl && (
                        <a
                          href={award.winnerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-tool-diligence hover:text-white transition-colors self-start group pt-1"
                        >
                          <span>Winner Website / IMDb</span>
                          <ExternalLink className="size-2.5 opacity-60 group-hover:opacity-100" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Press Coverage & Articles */}
            {edition.pressCoverage && edition.pressCoverage.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <Newspaper className="size-3 text-indigo-400" />
                  <span>Press Articles &amp; Coverage</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {edition.pressCoverage.map((press, pIdx) => (
                    <a
                      key={pIdx}
                      href={press.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-darkroom-card hover:bg-darkroom-surface border border-darkroom-border hover:border-slate-600 text-xs text-slate-300 hover:text-white transition-all group"
                    >
                      <span className="text-indigo-400 font-mono font-semibold text-[11px]">
                        [{press.publisher}]
                      </span>
                      <span className="truncate max-w-[240px] sm:max-w-xs">{press.headline}</span>
                      <ExternalLink className="size-2.5 opacity-60 group-hover:opacity-100 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Notes / Logistics Corroboration */}
            {edition.notes && (
              <div className="p-2.5 rounded-xl bg-darkroom-card/50 border border-darkroom-border/60 text-xs text-slate-400 italic">
                {edition.notes}
              </div>
            )}
          </motion.div>
        ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
