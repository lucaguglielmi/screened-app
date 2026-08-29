import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { DueDiligenceArgs } from '../../../types/chat';
import { soundEffects } from '../../../utils/audio';

interface FestivalIntakeCardProps {
  args: DueDiligenceArgs;
  onLaunch: (festivalName: string, optionalUrl?: string) => void;
}

export const FestivalIntakeCard: React.FC<FestivalIntakeCardProps> = ({ args, onLaunch }) => {
  const [festivalName, setFestivalName] = useState(args.festival_name || '');
  const [additionalContext, setAdditionalContext] = useState(
    args.optional_url || args.city_country ? `${args.optional_url || ''} ${args.city_country || ''}`.trim() : ''
  );

  const handleLaunch = () => {
    soundEffects.playSuccess();
    onLaunch(festivalName.trim() || 'Festival Target', additionalContext.trim() || undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl my-2 p-5 sm:p-6 rounded-2xl border border-tool-diligence/30 bg-gradient-to-br from-tool-diligence/10 via-darkroom-surface to-darkroom-bg shadow-xl backdrop-blur-md transition-all hover:border-tool-diligence/60 text-slate-100 space-y-4"
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-tool-diligence/20 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-tool-diligence/20 flex items-center justify-center text-tool-diligence font-bold border border-tool-diligence/40">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold tracking-wider text-tool-diligence uppercase">
                Festival Due Diligence
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-tool-diligence/15 text-tool-diligence border border-tool-diligence/30 font-mono font-semibold">
                Investigation Pre-Flight
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-serif">
              {festivalName || 'Target Film Festival'}
            </h3>
          </div>
        </div>
      </div>

      {/* Simplified 2-Field Intake UI */}
      <div className="space-y-4">
        {/* Field 1: Festival Entity Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">
            Festival Entity Name <span className="text-tool-diligence">*</span>
          </label>
          <input
            type="text"
            value={festivalName}
            onChange={(e) => setFestivalName(e.target.value)}
            placeholder="e.g. Pinco Pallino Film Festival"
            className="w-full bg-darkroom-bg border border-zinc-700/60 focus:border-tool-diligence rounded-xl px-3.5 py-2.5 text-white text-base placeholder:text-zinc-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Field 2: Additional Clues & Context (Freeform Text Area) */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-tool-diligence" />
            <span>Additional Clues & Context (Optional)</span>
          </label>
          <textarea
            rows={3}
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Paste any extra information: official website URL, venue city/country, contact person/director name, submission fee notes, or invitation snippet..."
            className="w-full bg-darkroom-bg border border-zinc-700/60 focus:border-tool-diligence rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Action Trigger */}
        <div className="pt-2 border-t border-darkroom-border">
          <button
            onClick={handleLaunch}
            disabled={!festivalName.trim()}
            className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover text-slate-950 font-bold text-base shadow-md shadow-[var(--color-tool-diligence)]/30 transition-all hover:brightness-110 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Start Due Diligence Investigation</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

