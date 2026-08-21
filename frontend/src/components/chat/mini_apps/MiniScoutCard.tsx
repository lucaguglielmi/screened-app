import React, { useState } from 'react';
import { Compass, ArrowRight } from 'lucide-react';
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
    <div className="my-3 p-5 rounded-2xl border border-[#F43F5E]/30 bg-gradient-to-br from-[#F43F5E]/10 via-[#0E1124] to-[#070913] shadow-xl backdrop-blur-md transition-all hover:border-[#F43F5E]/60">
      <div className="flex items-center justify-between gap-2 border-b border-[#F43F5E]/20 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-[#F43F5E]/20 text-[#F43F5E] flex items-center justify-center font-bold border border-[#F43F5E]/40">
            <Compass className="size-5" />
          </div>
          <div>
            <h4 className="text-base font-bold uppercase tracking-wider text-[#F43F5E]">
              Film Slate Strategy & Deadline Matcher
            </h4>
            <p className="text-sm text-slate-400">Opportunity Scout Pre-Flight Configuration</p>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30">
          Strategy Mapped
        </span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Project Title</label>
            <input
              type="text"
              value={filmTitle}
              onChange={(e) => setFilmTitle(e.target.value)}
              className="w-full rounded-xl border border-[#22274C] bg-[#070913] px-3.5 py-2.5 text-white font-medium focus:border-[#F43F5E] focus:outline-none text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Format & Genre</label>
            <div className="flex gap-2">
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as FilmFormat)}
                className="w-1/2 rounded-xl border border-[#22274C] bg-[#070913] px-3 py-2.5 text-white text-base"
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
                className="w-1/2 rounded-xl border border-[#22274C] bg-[#070913] px-3 py-2.5 text-white text-base"
              />
            </div>
          </div>
        </div>

        {args.strategy_rationale && (
          <div className="rounded-xl bg-[#141731] p-3.5 border border-[#22274C] text-slate-200 text-base leading-relaxed">
            <span className="font-bold text-[#F43F5E]">Positioning Angle: </span>
            {args.strategy_rationale}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Runtime (mins)</label>
            <input
              type="number"
              min={1}
              max={240}
              value={runtime}
              onChange={(e) => setRuntime(parseInt(e.target.value) || 15)}
              className="w-full rounded-xl border border-[#22274C] bg-[#070913] px-3.5 py-2.5 text-white text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Budget Category</label>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value)}
              className="w-full rounded-xl border border-[#22274C] bg-[#070913] px-3.5 py-2.5 text-white text-base"
            >
              <option value="Micro (< £50k)">Micro (&lt; £50k)</option>
              <option value="Low (< £250k)">Low (&lt; £250k)</option>
              <option value="Mid-Tier">Mid-Tier</option>
              <option value="No Limit">No Limit</option>
            </select>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1F254E]">
          <button
            onClick={handleLaunch}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F43F5E] hover:bg-[#E11D48] px-6 py-3 text-base font-bold text-white shadow-md shadow-[#F43F5E]/30 transition-all hover:brightness-110 active:scale-95 cursor-pointer"
          >
            <span>Scout All Opportunities</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
