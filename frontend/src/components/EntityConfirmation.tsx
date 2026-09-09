import React, { useState } from 'react';
import { CandidateEntity } from '../types/investigation';
import { Building2, MapPin, Calendar, Globe, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  candidates: CandidateEntity[];
  query: string;
  onConfirm: (selected: CandidateEntity) => void;
  loading: boolean;
}

export const EntityConfirmation: React.FC<Props> = ({ candidates, query, onConfirm, loading }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [customName, setCustomName] = useState(candidates[0]?.name || query);
  const [customDomain, setCustomDomain] = useState(candidates[0]?.officialDomain || '');
  const [customLocation, setCustomLocation] = useState(candidates[0]?.cityCountry || '');

  const handleSelect = (idx: number) => {
    setSelectedIndex(idx);
    const c = candidates[idx];
    if (c) {
      setCustomName(c.name);
      setCustomDomain(c.officialDomain || '');
      setCustomLocation(c.cityCountry || '');
    }
  };

  const handleSubmit = () => {
    const base = candidates[selectedIndex] || {
      id: 'custom',
      name: customName,
      entityType: 'FESTIVAL',
      descriptor: 'User confirmed entity',
      sourceIds: [],
    };

    const confirmed: CandidateEntity = {
      ...base,
      name: customName.trim() || base.name,
      officialDomain: customDomain.trim() || undefined,
      cityCountry: customLocation.trim() || undefined,
    };

    onConfirm(confirmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="p-4 sm:p-8 rounded-2xl bg-white/[0.02] space-y-5">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-tool-diligence">
          <Building2 className="size-4" />
          <span>Entity Confirmation Gate</span>
        </div>

        <div className="space-y-1.5">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-darkroom-text">
            Confirm Festival Identity
          </h2>
          <p className="text-base text-slate-400 leading-relaxed">
            To prevent false-identity mixing, please verify which entity you want Screened to
            investigate.
          </p>
        </div>

        {candidates.some(c => c.descriptor?.includes('unverified web presence') || c.descriptor?.includes('General Festival Entity')) && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-500">
            <ShieldAlert className="size-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">No Web Footprint Found</h4>
              <p className="text-xs sm:text-sm text-amber-500/80 leading-relaxed">
                We couldn't find any verified official presence for this festival during our initial search. You can still proceed, but the investigation may yield limited or inconclusive results if the festival has no digital history.
              </p>
            </div>
          </div>
        )}

        {/* Candidate options */}
        <div className="space-y-3.5 pt-2">
          {candidates.map((c, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => candidates.length > 1 && handleSelect(idx)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-3 sm:gap-4 ${
                  candidates.length > 1 ? 'cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'border-tool-diligence bg-tool-diligence/10 shadow-md'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                }`}
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    <span className="font-serif font-bold text-base sm:text-xl text-darkroom-text break-words">
                      {c.name}
                    </span>
                    {c.foundedYear && (
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-darkroom-muted">
                        <Calendar className="size-3.5 text-slate-400 shrink-0" /> Est. {c.foundedYear}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    {c.descriptor || 'Identified through Parallel Search.'}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm font-mono text-slate-400 pt-1">
                    {c.cityCountry && (
                      <span className="inline-flex items-center gap-1.5 shrink-0">
                        <MapPin className="size-3.5 text-slate-400 shrink-0" />
                        <span>{c.cityCountry}</span>
                      </span>
                    )}
                    {c.officialDomain && (
                      <span className="inline-flex items-center gap-1.5 min-w-0">
                        <Globe className="size-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-full">{c.officialDomain}</span>
                      </span>
                    )}
                  </div>
                </div>

                {candidates.length > 1 && (
                  <div className="size-6 rounded-full border flex items-center justify-center shrink-0 mt-1 border-white/20">
                    {isSelected && <div className="size-3 rounded-full bg-tool-diligence" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Optional field refinement */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3.5 text-sm">
          <div className="font-mono uppercase font-semibold text-slate-300 text-xs">
            Target Identity Parameters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Canonical Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-sans focus:outline-none focus:border-tool-diligence text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Official Website Domain
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="e.g. raindance.org"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-sans focus:outline-none focus:border-tool-diligence text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* Action Button - Stacked on Mobile */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 w-full">
          <span className="text-xs sm:text-sm font-mono text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 py-1">
            <ShieldAlert className="size-4 text-amber-500 shrink-0" /> Exact match verified
          </span>

          <button
            onClick={handleSubmit}
            disabled={loading || !customName.trim()}
            className="w-full sm:w-auto justify-center px-6 py-3.5 sm:py-3 rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover disabled:opacity-50 text-slate-950 font-bold text-base flex items-center gap-2 transition-all shadow-md shadow-[var(--color-tool-diligence)]/20 cursor-pointer active:scale-98"
          >
            <span>Confirm & Launch Research</span>
            <ArrowRight className="size-4 shrink-0" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
