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
    <div 
      className="my-3 p-5 rounded-2xl border border-[#00D29E]/30 bg-gradient-to-br from-[#00D29E]/10 via-[#0E1124] to-[#070913] shadow-xl backdrop-blur-md transition-all hover:border-[#00D29E]/60"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#00D29E]/20 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-[#00D29E]/20 text-[#00D29E] flex items-center justify-center font-bold border border-[#00D29E]/40">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h4 className="text-base font-bold uppercase tracking-wider text-[#00D29E]">
              Pre-Flight Due Diligence Dossier
            </h4>
            <p className="text-sm text-slate-400">Autonomous Multi-Agent Investigation Probe</p>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#00D29E]/15 text-[#00D29E] border border-[#00D29E]/30">
          Ready to Screen
        </span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Target Festival / Organization</label>
            <input
              type="text"
              value={festivalName}
              onChange={(e) => setFestivalName(e.target.value)}
              className="w-full rounded-xl border border-[#22274C] bg-[#070913] px-3.5 py-2.5 text-white font-medium focus:border-[#00D29E] focus:outline-none text-base"
              placeholder="e.g. Raindance Film Festival"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Official Website (Optional)</label>
            <input
              type="text"
              value={optionalUrl}
              onChange={(e) => setOptionalUrl(e.target.value)}
              className="w-full rounded-xl border border-[#22274C] bg-[#070913] px-3.5 py-2.5 text-white font-medium focus:border-[#00D29E] focus:outline-none text-base"
              placeholder="e.g. https://festival.org"
            />
          </div>
        </div>

        {args.preflight_summary && (
          <div className="rounded-xl bg-[#141731] p-3.5 border border-[#22274C] text-slate-200 text-base leading-relaxed">
            <span className="font-bold text-[#00D29E]">Agent Rationale: </span>
            {args.preflight_summary}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Check className="size-4 text-[#00D29E]" /> Physical Venue Leases
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Check className="size-4 text-[#00D29E]" /> Fee & Award Clarity
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Check className="size-4 text-[#00D29E]" /> Trade Registry Filings
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Check className="size-4 text-[#00D29E]" /> Community Red Flags
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1F254E]">
          <button
            onClick={handleLaunch}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00D29E] hover:bg-[#00B887] px-6 py-3 text-base font-bold text-slate-950 shadow-md shadow-[#00D29E]/30 transition-all hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <span>Launch Full Due Diligence</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
