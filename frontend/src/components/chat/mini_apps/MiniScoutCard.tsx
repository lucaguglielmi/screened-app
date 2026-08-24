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
    <div className="w-full max-w-full overflow-hidden box-border my-3 p-6 rounded-2xl bg-darkroom-surface shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-tool-scout/20 text-tool-scout flex items-center justify-center font-bold">
            <Compass className="size-5" />
          </div>
          <div>
            <h4 className="text-base font-bold uppercase tracking-wider text-tool-scout">
              Film Slate Strategy & Circuit Matcher
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              {step === 'REQUIREMENTS'
                ? 'Stage 1: Slate Requirements Intake'
                : 'Stage 2: Circuit Plan Review'}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-tool-scout/15 text-tool-scout">
          Opportunity Scout
        </span>
      </div>

      {/* STAGE 1: REQUIREMENTS GATHERING UI */}
      {step === 'REQUIREMENTS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Project Title
              </label>
              <input
                type="text"
                value={filmTitle}
                onChange={(e) => setFilmTitle(e.target.value)}
                className="w-full rounded-xl bg-darkroom-card px-3.5 py-2.5 text-white font-medium focus:outline-none focus:bg-darkroom-border text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Format & Genre
              </label>
              <div className="flex gap-2">
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as FilmFormat)}
                  className="w-1/2 rounded-xl bg-darkroom-card px-3 py-2.5 text-white text-sm cursor-pointer focus:outline-none focus:bg-darkroom-border"
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
                  className="w-1/2 rounded-xl bg-darkroom-card px-3 py-2.5 text-white text-sm focus:outline-none focus:bg-darkroom-border"
                />
              </div>
            </div>
          </div>

          {args.strategy_rationale && (
            <div className="rounded-xl bg-darkroom-card p-3 text-slate-200 text-xs leading-relaxed">
              <span className="font-bold text-tool-scout">Positioning Angle: </span>
              {args.strategy_rationale}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Runtime (minutes)
              </label>
              <input
                type="number"
                min={1}
                max={240}
                value={runtime}
                onChange={(e) => setRuntime(parseInt(e.target.value) || 15)}
                className="w-full rounded-xl bg-darkroom-card px-3.5 py-2.5 text-white text-sm focus:outline-none focus:bg-darkroom-border"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Budget Category
              </label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value)}
                className="w-full rounded-xl bg-darkroom-card px-3.5 py-2.5 text-white text-sm cursor-pointer focus:outline-none focus:bg-darkroom-border"
              >
                <option value="Micro (< £50k)">Micro (&lt; £50k)</option>
                <option value="Low (< £250k)">Low (&lt; £250k)</option>
                <option value="Mid-Tier">Mid-Tier</option>
                <option value="No Limit">No Limit</option>
              </select>
            </div>
          </div>

          {/* Stage 1 Action Trigger */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={handleProceedToReview}
              className="inline-flex items-center gap-2 rounded-xl bg-tool-scout hover:bg-tool-scout-hover px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[var(--color-tool-scout)]/30 transition-all hover:brightness-110 active:scale-95 cursor-pointer font-mono"
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
          <div className="p-4 rounded-xl bg-darkroom-surface border border-darkroom-card space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-darkroom-card pb-2">
              <span className="font-mono font-bold text-tool-scout uppercase tracking-wider">
                Stage 2: Slate Strategy Parameters Ready
              </span>
              <span className="px-2 py-0.5 rounded bg-tool-scout/20 text-tool-scout font-mono text-[10px]">
                Redirect to Opportunity Scout
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-slate-500 font-mono block">Film Title:</span>
                <strong className="text-white text-sm">{filmTitle}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-mono block">Format & Genre:</span>
                <span className="text-slate-200">
                  {format} · {genre} ({runtime} mins)
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-mono block">Budget Tier:</span>
                <span className="text-rose-300 font-mono">{budgetTier}</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono block">Destination Workspace:</span>
                <span className="text-tool-scout font-mono font-bold">Opportunity Scout Page</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06]">
              <span className="text-slate-400 font-mono block mb-1">
                Active Optimization Passes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] text-zinc-200 text-[11px]">
                  ✓ BAFTA / Oscar Accreditation Filter
                </span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] text-zinc-200 text-[11px]">
                  ✓ Early Bird Deadline Tracker
                </span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] text-zinc-200 text-[11px]">
                  ✓ Premiere Priority Protection
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setStep('REQUIREMENTS');
              }}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-midnight hover:bg-surface text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              ‹ Edit Profile
            </button>
            <button
              type="button"
              onClick={handleLaunch}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-tool-scout hover:bg-tool-scout-hover px-5 py-2.5 text-xs font-mono font-bold text-white shadow-md shadow-[var(--color-tool-scout)]/30 transition-all hover:brightness-110 active:scale-95 cursor-pointer"
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
