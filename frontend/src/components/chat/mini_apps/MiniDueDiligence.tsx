import React, { useState } from 'react';
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
      className="my-3 p-4 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-zinc-900/60 to-black/80 shadow-lg backdrop-blur-md transition-all hover:border-amber-500/50"
    >
      <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-400 text-xs font-bold ring-1 ring-amber-500/40">
            🔍
          </span>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Pre-Flight Due Diligence Dossier
            </h4>
            <p className="text-[11px] text-zinc-400">Autonomous Multi-Agent Investigation Probe</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20">
          Ready to Screen
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Target Festival / Organization</label>
            <input
              type="text"
              value={festivalName}
              onChange={(e) => setFestivalName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700/70 bg-zinc-950/80 px-3 py-1.5 text-zinc-100 font-medium focus:border-amber-500 focus:outline-none text-xs"
              placeholder="e.g. Raindance Film Festival"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Official Website (Optional)</label>
            <input
              type="text"
              value={optionalUrl}
              onChange={(e) => setOptionalUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-700/70 bg-zinc-950/80 px-3 py-1.5 text-zinc-100 font-medium focus:border-amber-500 focus:outline-none text-xs"
              placeholder="e.g. https://festival.org"
            />
          </div>
        </div>


        {args.preflight_summary && (
          <div className="rounded-lg bg-zinc-900/80 p-2.5 border border-zinc-800 text-zinc-300 text-[11px] leading-relaxed">
            <span className="font-semibold text-amber-400">Agent Rationale: </span>
            {args.preflight_summary}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
            <span className="text-emerald-400">✓</span> Physical Venue Leases
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
            <span className="text-emerald-400">✓</span> Fee & Award Clarity
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
            <span className="text-emerald-400">✓</span> Companies House Filing
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
            <span className="text-emerald-400">✓</span> Community Red Flags
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800/80">
          <button
            onClick={handleLaunch}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-semibold text-zinc-950 shadow-md transition-all hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <span>🚀 Launch Full Due Diligence</span>
            <span className="text-zinc-900">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
