import React from 'react';
import { DetailDensity } from '../types/investigation';
import {
  BookOpen,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface Props {
  density: DetailDensity;
  onChange: (newDensity: DetailDensity) => void;
}

export const DetailDial: React.FC<Props> = ({ density, onChange }) => {
  const isForensic = density === 'FULL_EVIDENCE' || density === 'MACHINE_AI_INGESTION';

  return (
    <div className="w-full space-y-2">
      {/* Header bar with title and active level */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-tool-diligence/20 text-tool-diligence flex items-center justify-center font-bold">
            <SlidersHorizontal className="size-3.5" />
          </div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
            Dossier View Depth
          </span>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Viewing: <span className="text-tool-diligence font-bold">{isForensic ? 'Deep Forensic Evidence' : 'Executive Brief'}</span>
        </div>
      </div>

      {/* 2-Mode Segmented Control */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-darkroom-card border border-darkroom-border shadow-inner gap-1">
        {/* Mode 1: Executive Brief */}
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onChange('BALANCED');
          }}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-mono transition-all cursor-pointer ${
            !isForensic
              ? 'bg-darkroom-surface text-tool-diligence font-bold border border-tool-diligence/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="size-3.5" />
          <span>Executive Brief</span>
        </button>

        {/* Mode 2: Deep Forensic Evidence */}
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onChange('FULL_EVIDENCE');
          }}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-mono transition-all cursor-pointer ${
            isForensic
              ? 'bg-darkroom-surface text-tool-diligence font-bold border border-tool-diligence/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="size-3.5" />
          <span>Forensic Evidence & Graph</span>
        </button>
      </div>
    </div>
  );
};

