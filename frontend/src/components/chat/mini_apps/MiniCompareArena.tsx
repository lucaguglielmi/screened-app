import React, { useState, lazy, Suspense } from 'react';
import { CompareFestivalsArgs } from '../../../types/chat';
import { soundEffects } from '../../../utils/audio';
const VersusDecisionTree = lazy(() => import('../../diagrams/VersusDecisionTree').then(m => ({ default: m.VersusDecisionTree })));
const OverlapVennFlow = lazy(() => import('../../diagrams/OverlapVennFlow').then(m => ({ default: m.OverlapVennFlow })));
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
    <div className="my-3 p-5 rounded-3xl bg-paper-surface dark:bg-darkroom-surface shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-paper-card dark:border-darkroom-card pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Swords className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
              Festival Versus Arena
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              Head-to-Head Comparative Due Diligence
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-300">
          Matchup Matrix
        </span>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
        {/* Festival A */}
        <div className="rounded-2xl bg-paper-card dark:bg-darkroom-card p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                Option A
              </span>
              <span className="text-xs text-emerald-400 font-medium">BAFTA / BIFA</span>
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
            className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 py-2 text-xs font-semibold text-white transition-all cursor-pointer text-center shadow-md active:scale-95"
          >
            Investigate {festA.split(' ')[0]} →
          </button>
        </div>

        {/* Festival B */}
        <div className="rounded-2xl bg-paper-card dark:bg-darkroom-card p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                Option B
              </span>
              <span className="text-xs text-slate-400 font-medium">Independent</span>
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
            className="w-full rounded-xl bg-amber-600 hover:bg-amber-500 py-2 text-xs font-semibold text-white transition-all cursor-pointer text-center shadow-md active:scale-95"
          >
            Investigate {festB.split(' ')[0]} →
          </button>
        </div>
      </div>

      {args.verdict_summary && (
        <div className="rounded-2xl bg-paper-card dark:bg-darkroom-card p-3.5 text-xs text-slate-300 leading-relaxed font-sans">
          <strong className="text-purple-400 font-mono">Producer Advice: </strong>{' '}
          {args.verdict_summary}
        </div>
      )}

      {/* Interactive React Flow Diagram Toggles */}
      <div className="border-t border-paper-card dark:border-darkroom-card pt-3 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            setActiveDiagram(activeDiagram === 'DECISION_TREE' ? 'NONE' : 'DECISION_TREE');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
            activeDiagram === 'DECISION_TREE'
              ? 'bg-midnight-royal text-white font-bold shadow-xs'
              : 'bg-paper-card dark:bg-darkroom-card text-slate-300 hover:text-white'
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
          className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
            activeDiagram === 'ACCREDITATION'
              ? 'bg-amber-600 text-white font-bold shadow-xs'
              : 'bg-paper-card dark:bg-darkroom-card text-slate-300 hover:text-white'
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
