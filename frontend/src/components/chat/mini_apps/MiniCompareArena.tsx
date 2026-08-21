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
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/20 text-purple-400 text-xs font-bold ring-1 ring-purple-500/40">
            ⚔️
          </span>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Festival Versus Arena
            </h4>
            <p className="text-[11px] text-zinc-400">Head-to-Head Comparative Due Diligence</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-400/10 text-purple-300 border border-purple-400/20">
          Matchup Matrix
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Festival A */}
        <div className="rounded-lg bg-zinc-950/70 p-3 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Option A</span>
              <span className="text-[10px] text-emerald-400 font-medium">BAFTA / BIFA</span>
            </div>
            <h5 className="font-semibold text-zinc-100 text-sm mb-2">{festA}</h5>
            <div className="space-y-1 text-[11px] text-zinc-400">
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
            className="mt-3 w-full rounded-md bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 py-1.5 text-[11px] font-semibold text-purple-200 transition-all cursor-pointer text-center"
          >
            Investigate {festA.split(' ')[0]} →
          </button>
        </div>

        {/* Festival B */}
        <div className="rounded-lg bg-zinc-950/70 p-3 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Option B</span>
              <span className="text-[10px] text-zinc-400 font-medium">Independent</span>
            </div>
            <h5 className="font-semibold text-zinc-100 text-sm mb-2">{festB}</h5>
            <div className="space-y-1 text-[11px] text-zinc-400">
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
            className="mt-3 w-full rounded-md bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 py-1.5 text-[11px] font-semibold text-amber-200 transition-all cursor-pointer text-center"
          >
            Investigate {festB.split(' ')[0]} →
          </button>
        </div>
      </div>

      {args.verdict_summary && (
        <div className="mt-3 rounded-lg bg-zinc-900/90 p-2.5 border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed">
          <strong className="text-purple-400">Producer Advice: </strong> {args.verdict_summary}
        </div>
      )}
    </div>
  );
};
