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

export const EntityConfirmation: React.FC<Props> = ({
  candidates,
  query,
  onConfirm,
  loading,
}) => {
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
      <div className="p-6 sm:p-8 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#00D29E]">
          <Building2 className="size-4" />
          <span>Entity Confirmation Gate</span>
        </div>

        <div className="space-y-1.5">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-paper-text dark:text-darkroom-text">
            Confirm Festival Identity
          </h2>
          <p className="text-base text-paper-muted dark:text-darkroom-muted leading-relaxed">
            To prevent false-identity mixing, please verify which entity you want Screened to investigate.
          </p>
        </div>

        {/* Candidate options */}
        <div className="space-y-3.5 pt-2">
          {candidates.map((c, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  isSelected
                    ? 'border-[#00D29E] bg-[#00D29E]/10 dark:border-[#00D29E] dark:bg-[#00D29E]/10 shadow-md'
                    : 'border-paper-border dark:border-darkroom-border hover:border-neutral-400 dark:hover:border-neutral-600'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-serif font-bold text-lg sm:text-xl text-paper-text dark:text-darkroom-text">
                      {c.name}
                    </span>
                    {c.foundedYear && (
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-paper-muted dark:text-darkroom-muted">
                        <Calendar className="size-3.5" /> Est. {c.foundedYear}
                      </span>
                    )}
                  </div>

                  <p className="text-base text-paper-muted dark:text-darkroom-muted leading-relaxed">
                    {c.descriptor || 'Identified through Parallel Search.'}
                  </p>

                  <div className="flex items-center gap-4 text-sm font-mono text-paper-muted dark:text-darkroom-muted pt-1">
                    {c.cityCountry && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-[#00D29E]" /> {c.cityCountry}
                      </span>
                    )}
                    {c.officialDomain && (
                      <span className="inline-flex items-center gap-1.5">
                        <Globe className="size-3.5 text-[#00D29E]" /> {c.officialDomain}
                      </span>
                    )}
                  </div>
                </div>

                <div className="size-6 rounded-full border flex items-center justify-center shrink-0 mt-1 border-neutral-400 dark:border-neutral-600">
                  {isSelected && <div className="size-3 rounded-full bg-[#00D29E]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional field refinement */}
        <div className="p-5 rounded-2xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border space-y-3.5 text-sm">
          <div className="font-mono uppercase font-semibold text-paper-muted dark:text-darkroom-muted text-xs">
            Target Identity Parameters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-paper-muted dark:text-darkroom-muted mb-1.5">
                Canonical Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border text-paper-text dark:text-darkroom-text font-sans focus:outline-none focus:border-[#00D29E] text-base"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-paper-muted dark:text-darkroom-muted mb-1.5">
                Official Website Domain
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="e.g. raindance.org"
                className="w-full px-3.5 py-2.5 rounded-xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border text-paper-text dark:text-darkroom-text font-sans focus:outline-none focus:border-[#00D29E] text-base"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-mono text-paper-muted dark:text-darkroom-muted flex items-center gap-1.5">
            <ShieldAlert className="size-4 text-amber-500" /> Exact match verified
          </span>

          <button
            onClick={handleSubmit}
            disabled={loading || !customName.trim()}
            className="px-6 py-3 rounded-xl bg-[#00D29E] hover:bg-[#00B887] disabled:opacity-50 text-slate-950 font-bold text-base flex items-center gap-2 transition-all shadow-md shadow-[#00D29E]/20 cursor-pointer"
          >
            <span>Confirm & Launch Research</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
