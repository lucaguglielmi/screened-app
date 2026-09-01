import React from 'react';
import { DetailDensity } from '../types/investigation';
import {
  BookOpen,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface Props {
  density: DetailDensity;
  onChange: (newDensity: DetailDensity) => void;
}

export const DetailDial: React.FC<Props> = ({ density, onChange }) => {
  const isShort = density === 'SIMPLIFIED' || density === 'SUMMARY';
  const isAgent = density === 'MACHINE_AI_INGESTION';
  const isFull = !isShort && !isAgent;

  return (
    <div className="w-full">
      {/* 3-Mode Segmented Control */}
      <div className="grid grid-cols-3 p-1 rounded-2xl bg-[#060a15]/90 border border-darkroom-border/60 shadow-inner gap-1">
        {/* Mode 1: Short summary */}
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onChange('SIMPLIFIED');
          }}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-mono transition-all cursor-pointer ${
            isShort
              ? 'bg-[#2563eb] text-white font-bold shadow-md shadow-blue-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
          }`}
          title="Short executive summary & key checklist"
        >
          <BookOpen className="size-4 shrink-0" />
          <span>Short</span>
        </button>

        {/* Mode 2: Full research (Default) */}
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onChange('FULL_EVIDENCE');
          }}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-mono transition-all cursor-pointer ${
            isFull
              ? 'bg-[#2563eb] text-white font-bold shadow-md shadow-blue-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
          }`}
          title="Full comprehensive due diligence with all vectors, claims, and graphs"
        >
          <ShieldCheck className="size-4 shrink-0" />
          <span>Full</span>
        </button>

        {/* Mode 3: AI Agent */}
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onChange('MACHINE_AI_INGESTION');
          }}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-mono transition-all cursor-pointer ${
            isAgent
              ? 'bg-[#2563eb] text-white font-bold shadow-md shadow-blue-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
          }`}
          title="Machine AI JSON-LD & plain-text token dump for autonomous agents"
        >
          <Bot className="size-4 shrink-0" />
          <span>Agent</span>
        </button>
      </div>
    </div>
  );
};


