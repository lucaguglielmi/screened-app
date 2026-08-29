import React, { useState, Suspense } from 'react';
import { CompareFestivalsArgs } from '../../../types/chat';
import { soundEffects } from '../../../utils/audio';
import { lazyWithRetry } from '../../../utils/lazyWithRetry';
const VersusDecisionTree = lazyWithRetry(() => import('../../diagrams/VersusDecisionTree').then(m => ({ default: m.VersusDecisionTree })));
const OverlapVennFlow = lazyWithRetry(() => import('../../diagrams/OverlapVennFlow').then(m => ({ default: m.OverlapVennFlow })));
import { GitBranch, Award, ChevronDown, ChevronUp, Swords } from 'lucide-react';

interface MiniCompareArenaProps {
  args: CompareFestivalsArgs;
  onSelectFestival: (festivalName: string) => void;
}

export const MiniCompareArena: React.FC<MiniCompareArenaProps> = ({ args, onSelectFestival }) => {
  const [activeDiagram, setActiveDiagram] = useState<'NONE' | 'DECISION_TREE' | 'ACCREDITATION'>(
    'NONE',
  );

  const festA = args.festival_a || 'Raindance Film Festival';
  const festB = args.festival_b || 'London Independent Film Festival';

  return (
    <div className="my-3 p-5 rounded-2xl border border-tool-diligence/30 bg-gradient-to-br from-tool-diligence/10 via-darkroom-surface to-darkroom-bg shadow-xl backdrop-blur-md transition-all hover:border-tool-diligence/60 text-slate-100 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-tool-diligence/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-tool-diligence/20 text-tool-diligence flex items-center justify-center font-bold border border-tool-diligence/40">
            <Swords className="size-4" />
          </div>
          <div>
            <h4 className="text-base font-bold uppercase tracking-wider text-tool-diligence">
              Festival Versus Arena
            </h4>
            <p className="text-sm text-slate-400">
              Head-to-Head Comparative Due Diligence
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-tool-diligence/15 text-tool-diligence border border-tool-diligence/30">
          Matchup Matrix
        </span>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
        {/* Festival A */}
        <div className="rounded-2xl bg-darkroom-bg border border-tool-diligence/20 p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-tool-diligence">
                Option A
              </span>
              <span className="text-xs text-tool-diligence font-medium px-2 py-0.5 rounded-full bg-tool-diligence/10">BAFTA / BIFA</span>
            </div>
            <h5 className="font-semibold text-white text-base mb-2 font-serif">{festA}</h5>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>🏛 Central London Theatrical Venues</p>
              <p>🎟 Industry & Press Passes Included</p>
              <p>💰 Regular Fee: ~£45 - £65</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEffects.playSuccess();
              onSelectFestival(festA);
            }}
            className="w-full rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover py-2.5 text-xs font-bold text-slate-950 transition-all cursor-pointer text-center shadow-md shadow-[var(--color-tool-diligence)]/20 active:scale-95"
          >
            Investigate {festA.split(' ')[0]} →
          </button>
        </div>

        {/* Festival B */}
        <div className="rounded-2xl bg-darkroom-bg border border-tool-diligence/20 p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-tool-diligence">
                Option B
              </span>
              <span className="text-xs text-slate-300 font-medium px-2 py-0.5 rounded-full bg-darkroom-surface">Independent</span>
            </div>
            <h5 className="font-semibold text-white text-base mb-2 font-serif">{festB}</h5>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>📍 Single Micro-Cinema or Hybrid</p>
              <p>🎥 Local Indie Networking Focus</p>
              <p>💰 Regular Fee: ~£25 - £40</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEffects.playSuccess();
              onSelectFestival(festB);
            }}
            className="w-full rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover py-2.5 text-xs font-bold text-slate-950 transition-all cursor-pointer text-center shadow-md shadow-[var(--color-tool-diligence)]/20 active:scale-95"
          >
            Investigate {festB.split(' ')[0]} →
          </button>
        </div>
      </div>

      {args.verdict_summary && (
        <div className="rounded-2xl bg-darkroom-bg p-3.5 text-sm text-slate-200 leading-relaxed font-sans border border-tool-diligence/10">
          <strong className="text-tool-diligence font-mono">Producer Advice: </strong>{' '}
          {args.verdict_summary}
        </div>
      )}

      {/* Interactive React Flow Diagram Toggles */}
      <div className="border-t border-tool-diligence/20 pt-3 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            setActiveDiagram(activeDiagram === 'DECISION_TREE' ? 'NONE' : 'DECISION_TREE');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
            activeDiagram === 'DECISION_TREE'
              ? 'bg-tool-diligence text-slate-950 font-bold shadow-xs'
              : 'bg-darkroom-bg text-slate-300 hover:text-white border border-darkroom-border hover:border-tool-diligence/40'
          }`}
        >
          <GitBranch className="size-3.5" />
          <span>Interactive Decision Flowchart</span>
          {activeDiagram === 'DECISION_TREE' ? (
            <ChevronUp className="size-3" />
          ) : (
            <ChevronDown className="size-3" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            setActiveDiagram(activeDiagram === 'ACCREDITATION' ? 'NONE' : 'ACCREDITATION');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
            activeDiagram === 'ACCREDITATION'
              ? 'bg-tool-diligence text-slate-950 font-bold shadow-xs'
              : 'bg-darkroom-bg text-slate-300 hover:text-white border border-darkroom-border hover:border-tool-diligence/40'
          }`}
        >
          <Award className="size-3.5" />
          <span>Accreditation Scope</span>
          {activeDiagram === 'ACCREDITATION' ? (
            <ChevronUp className="size-3" />
          ) : (
            <ChevronDown className="size-3" />
          )}
        </button>
      </div>

      {/* Mounted Diagrams */}
      <Suspense fallback={<div className="p-4 text-center text-xs text-slate-500 animate-pulse">Loading diagram engine...</div>}>
        {activeDiagram === 'DECISION_TREE' && (
          <div className="pt-2 animate-fade-in">
            <VersusDecisionTree
              festivalA={{
                name: festA,
                entryFee: '£55',
                premierePolicy: 'UK Premiere Preferred',
                accreditation: ['BAFTA Qualifying', 'BIFA Qualifying'],
                notificationDate: 'Aug 15',
                ratingScore: 92,
              }}
              festivalB={{
                name: festB,
                entryFee: '£30',
                premierePolicy: 'No Premiere Restrictions',
                accreditation: ['Indie Circuit Match'],
                notificationDate: 'Oct 01',
                ratingScore: 78,
              }}
            />
          </div>
        )}

        {activeDiagram === 'ACCREDITATION' && (
          <div className="pt-2 animate-fade-in">
            <OverlapVennFlow festAName={festA} festBName={festB} />
          </div>
        )}
      </Suspense>
    </div>
  );
};
