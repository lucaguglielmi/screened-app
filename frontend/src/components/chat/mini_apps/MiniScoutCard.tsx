import React, { useState } from 'react';
import { OpportunityScoutArgs } from '../../../types/chat';
import { FilmProfile, FilmFormat, PremiereGoal } from '../../../types/investigation';
import { soundEffects } from '../../../utils/audio';

interface MiniScoutCardProps {
  args: OpportunityScoutArgs;
  onLaunch: (profile: FilmProfile) => void;
}

export const MiniScoutCard: React.FC<MiniScoutCardProps> = ({ args, onLaunch }) => {
  const [filmTitle, setFilmTitle] = useState(args.film_title || 'Untitled Project');
  const [format, setFormat] = useState<FilmFormat>(args.format || 'SHORT');
  const [genre, setGenre] = useState(args.genre || 'Drama');
  const [runtime, setRuntime] = useState<number>(args.runtime_minutes || 15);
  const [budgetTier, setBudgetTier] = useState(args.budget_tier || 'Micro (< £50k)');

  const handleLaunch = () => {
    soundEffects.playSuccess();
    const profile: FilmProfile = {
      title: filmTitle,
      format: format,
      genre: genre,
      runtimeMinutes: runtime,
      premiereGoal: (args.premiere_goal as PremiereGoal) || 'WORLD_PREMIERE',
      targetRegions: args.target_regions || ['UK & Europe'],
      budgetTier: budgetTier,
    };
    onLaunch(profile);
  };

  return (
    <div className="my-3 p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/25 via-zinc-900/60 to-black/80 shadow-lg backdrop-blur-md transition-all hover:border-indigo-500/50">
      <div className="flex items-center justify-between gap-2 border-b border-indigo-500/20 pb-2.5 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-sm font-bold ring-1 ring-indigo-500/40">
            🎯
          </span>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
              Film Slate Strategy & Deadline Matcher
            </h4>
            <p className="text-xs text-zinc-400">Opportunity Scout Pre-Flight Configuration</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-400/10 text-indigo-300 border border-indigo-400/20">
          Strategy Mapped
        </span>
      </div>

      <div className="space-y-3.5 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Project Title</label>
            <input
              type="text"
              value={filmTitle}
              onChange={(e) => setFilmTitle(e.target.value)}
              className="w-full rounded-xl border border-zinc-700/70 bg-zinc-950/80 px-3.5 py-2 text-zinc-100 font-medium focus:border-indigo-500 focus:outline-none text-base"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Format & Genre</label>
            <div className="flex gap-2">
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as FilmFormat)}
                className="w-1/2 rounded-xl border border-zinc-700/70 bg-zinc-950/80 px-3 py-2 text-zinc-200 text-base"
              >
                <option value="SHORT">Short</option>
                <option value="FEATURE">Feature</option>
                <option value="DOCUMENTARY">Doc</option>
                <option value="ANIMATION">Anim</option>
              </select>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-1/2 rounded-xl border border-zinc-700/70 bg-zinc-950/80 px-3 py-2 text-zinc-100 text-base"
              />
            </div>
          </div>
        </div>

        {args.strategy_rationale && (
          <div className="rounded-xl bg-zinc-900/80 p-3 border border-zinc-800 text-zinc-300 text-sm leading-relaxed">
            <span className="font-semibold text-indigo-400">Positioning Angle: </span>
            {args.strategy_rationale}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Runtime (mins)</label>
            <input
              type="number"
              min={1}
              max={240}
              value={runtime}
              onChange={(e) => setRuntime(parseInt(e.target.value) || 15)}
              className="w-full rounded-xl border border-zinc-700/70 bg-zinc-950/80 px-3.5 py-2 text-zinc-100 text-base"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Budget Category</label>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value)}
              className="w-full rounded-xl border border-zinc-700/70 bg-zinc-950/80 px-3.5 py-2 text-zinc-200 text-base"
            >
              <option value="Micro (< £50k)">Micro (&lt; £50k)</option>
              <option value="Low (< £250k)">Low (&lt; £250k)</option>
              <option value="Mid-Tier">Mid-Tier</option>
              <option value="No Limit">No Limit</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800/80">
          <button
            onClick={handleLaunch}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <span>🧭 Scout All Opportunities</span>
            <span>→</span>
          </button>
        </div>

      </div>
    </div>
  );
};
