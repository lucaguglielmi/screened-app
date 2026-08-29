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
  const [step, setStep] = useState<'REQUIREMENTS' | 'REVIEW'>('REQUIREMENTS');
  const [filmTitle, setFilmTitle] = useState(args.film_title || 'Untitled Project');
  const [format, setFormat] = useState<FilmFormat>(args.format || 'SHORT');
  const [genre, setGenre] = useState(args.genre || 'Drama');
  const [runtime, setRuntime] = useState<number>(args.runtime_minutes || 15);
  const [budgetTier, setBudgetTier] = useState(args.budget_tier || 'Micro (< £50k)');

  const handleProceedToReview = () => {
    soundEffects.playClick();
    setStep('REVIEW');
  };

  const handleLaunch = () => {
    soundEffects.playSuccess();
    const profile: FilmProfile = {
      title: filmTitle,
      year: '2024',
      neverReleased: true,
      genre: genre,
      runtimeMinutes: runtime,
      premiereGoals: args.premiere_goal ? [args.premiere_goal as PremiereGoal] : ['WORLD_PREMIERE'],
      targetRegions: args.target_regions || ['UK & Europe'],
    };
    onLaunch(profile);
  };

  return (
    <div className="my-3 p-5 rounded-2xl border border-tool-diligence/30 bg-gradient-to-br from-tool-diligence/10 via-darkroom-surface to-darkroom-bg shadow-xl backdrop-blur-md transition-all hover:border-tool-diligence/60 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-tool-diligence/20 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-tool-diligence/20 text-tool-diligence flex items-center justify-center font-bold border border-tool-diligence/40">
            <Compass className="size-5" />
          </div>
          <div>
            <h4 className="text-base font-bold uppercase tracking-wider text-tool-diligence">
              Film Slate Strategy & Circuit Matcher
            </h4>
            <p className="text-sm text-slate-400">
              {step === 'REQUIREMENTS'
                ? 'Stage 1: Slate Requirements Intake'
                : 'Stage 2: Circuit Plan Review'}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-tool-diligence/15 text-tool-diligence border border-tool-diligence/30">
          Opportunity Scout
        </span>
      </div>

      {/* STAGE 1: REQUIREMENTS GATHERING UI */}
      {step === 'REQUIREMENTS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Project Title
              </label>
              <input
                type="text"
                value={filmTitle}
                onChange={(e) => setFilmTitle(e.target.value)}
                className="w-full rounded-xl bg-darkroom-bg border border-transparent focus:border-tool-diligence px-3.5 py-2.5 text-white font-medium focus:outline-none text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Format & Genre
              </label>
              <div className="flex gap-2">
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as FilmFormat)}
                  className="w-1/2 rounded-xl bg-darkroom-bg border border-transparent focus:border-tool-diligence px-3 py-2.5 text-white text-base cursor-pointer focus:outline-none"
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
                  className="w-1/2 rounded-xl bg-darkroom-bg border border-transparent focus:border-tool-diligence px-3 py-2.5 text-white text-base focus:outline-none"
                />
              </div>
            </div>
          </div>

          {args.strategy_rationale && (
            <div className="rounded-xl bg-darkroom-bg p-3.5 text-slate-200 text-base leading-relaxed">
              <span className="font-bold text-tool-diligence">Positioning Angle: </span>
              {args.strategy_rationale}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Runtime (minutes)
              </label>
              <input
                type="number"
                min={1}
                max={240}
                value={runtime}
                onChange={(e) => setRuntime(parseInt(e.target.value) || 15)}
                className="w-full rounded-xl bg-darkroom-bg border border-transparent focus:border-tool-diligence px-3.5 py-2.5 text-white text-base focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Budget Category
              </label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value)}
                className="w-full rounded-xl bg-darkroom-bg border border-transparent focus:border-tool-diligence px-3.5 py-2.5 text-white text-base cursor-pointer focus:outline-none"
              >
                <option value="Micro (< £50k)">Micro (&lt; £50k)</option>
                <option value="Low (< £250k)">Low (&lt; £250k)</option>
                <option value="Mid-Tier">Mid-Tier</option>
                <option value="No Limit">No Limit</option>
              </select>
            </div>
          </div>

          {/* Stage 1 Action Trigger */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-darkroom-border">
            <button
              onClick={handleProceedToReview}
              className="inline-flex items-center gap-2 rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover px-6 py-3 text-base font-bold text-slate-950 shadow-md shadow-[var(--color-tool-diligence)]/30 transition-all hover:brightness-110 active:scale-95 cursor-pointer"
            >
              <span>Review Opportunity Strategy (Stage 2)</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: REVIEW & LAUNCH CONFIRMATION UI (Redirects to Opportunity Scout Workspace) */}
      {step === 'REVIEW' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-darkroom-bg border border-tool-diligence/20 space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-tool-diligence/15 pb-2.5">
              <span className="font-mono font-bold text-tool-diligence uppercase tracking-wider text-xs">
                Stage 2: Slate Strategy Parameters Ready
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-tool-diligence/15 text-tool-diligence border border-tool-diligence/30 font-mono text-[11px]">
                Ready to Scout
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-slate-400 font-mono text-xs block">Film Title:</span>
                <strong className="text-white text-base">{filmTitle}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-xs block">Format & Genre:</span>
                <span className="text-slate-200">
                  {format} · {genre} ({runtime} mins)
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-xs block">Budget Tier:</span>
                <span className="text-tool-diligence font-mono font-semibold">{budgetTier}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-xs block">Destination:</span>
                <span className="text-tool-diligence font-mono font-bold">Opportunity Scout Workspace</span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-white/[0.08]">
              <span className="text-slate-400 font-mono text-xs block mb-1.5">
                Active Optimization Passes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-darkroom-surface border border-tool-diligence/30 text-tool-diligence text-xs font-mono">
                  ✓ BAFTA / Oscar Accreditation Filter
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-darkroom-surface border border-tool-diligence/30 text-tool-diligence text-xs font-mono">
                  ✓ Early Bird Deadline Tracker
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-darkroom-surface border border-tool-diligence/30 text-tool-diligence text-xs font-mono">
                  ✓ Premiere Priority Protection
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-darkroom-border">
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setStep('REQUIREMENTS');
              }}
              className="px-4 py-3 rounded-xl border border-darkroom-border bg-darkroom-bg hover:bg-darkroom-surface text-sm font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              ‹ Edit Profile
            </button>
            <button
              type="button"
              onClick={handleLaunch}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover px-6 py-3 text-base font-bold text-slate-950 shadow-md shadow-[var(--color-tool-diligence)]/30 transition-all hover:brightness-110 active:scale-95 cursor-pointer"
            >
              <span>Launch Opportunity Scout & Open Workspace</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
