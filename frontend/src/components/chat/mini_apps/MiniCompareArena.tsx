import React from 'react';
import { CompareFestivalsArgs } from '../../../types/chat';
import { soundEffects } from '../../../utils/audio';

interface MiniCompareArenaProps {
  args: CompareFestivalsArgs;
  onSelectFestival: (festivalName: string) => void;
}

export const MiniCompareArena: React.FC<MiniCompareArenaProps> = ({ args, onSelectFestival }) => {
  const festA = args.festival_a || 'Raindance Film Festival';
  const festB = args.festival_b || 'London Independent Film Festival';

  return (
    <div className="my-3 p-4 rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-zinc-900/60 to-black/80 shadow-lg backdrop-blur-md transition-all hover:border-purple-500/50">
      <div className="flex items-center justify-between gap-2 border-b border-purple-500/20 pb-2.5 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 text-sm font-bold ring-1 ring-purple-500/40">
            ⚔️
          </span>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-purple-400">
              Festival Versus Arena
            </h4>
            <p className="text-xs text-zinc-400">Head-to-Head Comparative Due Diligence</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-400/10 text-purple-300 border border-purple-400/20">
          Matchup Matrix
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
        {/* Festival A */}
        <div className="rounded-2xl bg-zinc-950/70 p-4 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Option A</span>
              <span className="text-xs text-emerald-400 font-medium">BAFTA / BIFA</span>
            </div>
            <h5 className="font-semibold text-zinc-100 text-base mb-2.5">{festA}</h5>
            <div className="space-y-1.5 text-sm text-zinc-300">
              <p>🏛 Central London Theatrical Venues</p>
              <p>🎟 Industry & Press Passes Included</p>
              <p>💰 Regular Fee: ~£45 - £65</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playSuccess();
              onSelectFestival(festA);
            }}
            className="mt-4 w-full rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 py-2.5 text-sm font-semibold text-purple-200 transition-all cursor-pointer text-center"
          >
            Investigate {festA.split(' ')[0]} →
          </button>
        </div>

        {/* Festival B */}
        <div className="rounded-2xl bg-zinc-950/70 p-4 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Option B</span>
              <span className="text-xs text-zinc-400 font-medium">Independent</span>
            </div>
            <h5 className="font-semibold text-zinc-100 text-base mb-2.5">{festB}</h5>
            <div className="space-y-1.5 text-sm text-zinc-300">
              <p>📍 Single Micro-Cinema or Hybrid</p>
              <p>🎥 Local Indie Networking Focus</p>
              <p>💰 Regular Fee: ~£25 - £40</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playSuccess();
              onSelectFestival(festB);
            }}
            className="mt-4 w-full rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 py-2.5 text-sm font-semibold text-amber-200 transition-all cursor-pointer text-center"
          >
            Investigate {festB.split(' ')[0]} →
          </button>
        </div>
      </div>

      {args.verdict_summary && (
        <div className="mt-3.5 rounded-xl bg-zinc-900/90 p-3 border border-zinc-800 text-sm text-zinc-300 leading-relaxed">
          <strong className="text-purple-400">Producer Advice: </strong> {args.verdict_summary}
        </div>
      )}

    </div>
  );
};
