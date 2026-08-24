import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { DueDiligenceArgs } from '../../../types/chat';
import { soundEffects } from '../../../utils/audio';

interface MiniDueDiligenceProps {
  args: DueDiligenceArgs;
  onLaunch: (festivalName: string, optionalUrl?: string) => void;
}

export const MiniDueDiligence: React.FC<MiniDueDiligenceProps> = ({ args, onLaunch }) => {
  const [festivalName, setFestivalName] = useState(args.festival_name || 'Target Festival');
  const [optionalUrl, setOptionalUrl] = useState(args.optional_url || '');

  const handleLaunch = () => {
    soundEffects.playSuccess();
    onLaunch(festivalName, optionalUrl || undefined);
  };

  return (
    <div className="my-3 p-5 rounded-2xl border border-tool-diligence/30 bg-gradient-to-br from-tool-diligence/10 via-darkroom-surface to-darkroom-bg shadow-xl backdrop-blur-md transition-all hover:border-tool-diligence/60">
      <div className="flex items-center justify-between gap-2 border-b border-tool-diligence/20 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-tool-diligence/20 text-tool-diligence flex items-center justify-center font-bold border border-tool-diligence/40">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h4 className="text-base font-bold uppercase tracking-wider text-tool-diligence">
              Pre-Flight Due Diligence Dossier
            </h4>
            <p className="text-sm text-slate-400">Autonomous Multi-Agent Investigation Probe</p>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-tool-diligence/15 text-tool-diligence border border-tool-diligence/30">
          Ready to Screen
        </span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Target Festival / Organization
            </label>
            <input
              type="text"
              value={festivalName}
              onChange={(e) => setFestivalName(e.target.value)}
              className="w-full rounded-xl bg-paper-bg dark:bg-darkroom-bg border border-transparent focus:border-tool-diligence px-3.5 py-2.5 text-white font-medium focus:outline-none text-base"
              placeholder="e.g. Raindance Film Festival"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Official Website (Optional)
            </label>
            <input
              type="text"
              value={optionalUrl}
              onChange={(e) => setOptionalUrl(e.target.value)}
              className="w-full rounded-xl bg-paper-bg dark:bg-darkroom-bg border border-transparent focus:border-tool-diligence px-3.5 py-2.5 text-white font-medium focus:outline-none text-base"
              placeholder="e.g. https://festival.org"
            />
          </div>
        </div>

        {args.preflight_summary && (
          <div className="rounded-xl bg-paper-bg dark:bg-darkroom-bg p-3.5 text-slate-200 text-base leading-relaxed">
            <span className="font-bold text-tool-diligence">Agent Rationale: </span>
            {args.preflight_summary}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Check className="size-4 text-tool-diligence" /> Physical Venue Leases
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Check className="size-4 text-tool-diligence" /> Fee & Award Clarity
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Check className="size-4 text-tool-diligence" /> Trade Registry Filings
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Check className="size-4 text-tool-diligence" /> Community Red Flags
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-paper-border dark:border-darkroom-border">
          <button
            onClick={handleLaunch}
            className="inline-flex items-center gap-2 rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover px-6 py-3 text-base font-bold text-slate-950 shadow-md shadow-[var(--color-tool-diligence)]/30 transition-all hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <span>Launch Full Due Diligence</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
