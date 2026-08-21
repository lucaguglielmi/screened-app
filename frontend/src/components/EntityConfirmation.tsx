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
      <div className="p-6 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Building2 className="size-4" />
          <span>Entity Confirmation Gate</span>
        </div>

        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-semibold text-paper-text dark:text-darkroom-text">
            Confirm Festival Identity
          </h2>
          <p className="text-sm text-paper-muted dark:text-darkroom-muted">
            To prevent false-identity mixing, please verify which entity you want Screened to investigate.
          </p>
        </div>

        {/* Candidate options */}
        <div className="space-y-3 pt-2">
          {candidates.map((c, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-500/5 dark:border-indigo-500 dark:bg-indigo-500/10'
                    : 'border-paper-border dark:border-darkroom-border hover:border-neutral-400 dark:hover:border-neutral-600'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-medium text-base text-paper-text dark:text-darkroom-text">
                      {c.name}
                    </span>
                    {c.foundedYear && (
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-paper-muted dark:text-darkroom-muted">
                        <Calendar className="size-3" /> Est. {c.foundedYear}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-paper-muted dark:text-darkroom-muted leading-relaxed">
                    {c.descriptor || 'Identified through Parallel Search.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-paper-muted dark:text-darkroom-muted pt-1">
                    {c.cityCountry && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3 text-indigo-500" /> {c.cityCountry}
                      </span>
                    )}
                    {c.officialDomain && (
                      <span className="inline-flex items-center gap-1">
                        <Globe className="size-3 text-indigo-500" /> {c.officialDomain}
                      </span>
                    )}
                  </div>
                </div>

                <div className="size-5 rounded-full border flex items-center justify-center shrink-0 mt-1 border-neutral-400 dark:border-neutral-600">
                  {isSelected && <div className="size-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional field refinement */}
        <div className="p-4 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border space-y-3 text-xs">
          <div className="font-mono uppercase text-paper-muted dark:text-darkroom-muted text-[11px]">
            Target Identity Parameters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-paper-muted dark:text-darkroom-muted mb-1">
                Canonical Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border text-paper-text dark:text-darkroom-text font-sans focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-paper-muted dark:text-darkroom-muted mb-1">
                Official Website Domain
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="e.g. raindance.org"
                className="w-full px-3 py-2 rounded-lg bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border text-paper-text dark:text-darkroom-text font-sans focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-mono text-paper-muted dark:text-darkroom-muted flex items-center gap-1.5">
            <ShieldAlert className="size-3.5 text-amber-500" /> Exact match verified
          </span>

          <button
            onClick={handleSubmit}
            disabled={loading || !customName.trim()}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <span>Confirm & Launch Research</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
