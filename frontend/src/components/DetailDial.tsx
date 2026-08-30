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
      <div className="grid grid-cols-3 p-1 rounded-xl bg-darkroom-card border border-darkroom-border shadow-inner gap-1">
        {/* Mode 1: Short summary */}
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onChange('SIMPLIFIED');
          }}
          className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${
            isShort
              ? 'bg-midnight-royal text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Short executive summary & key checklist"
        >
          <BookOpen className="size-3.5 shrink-0" />
          <span className="sm:hidden">Short</span>
          <span className="hidden sm:inline">Short summary</span>
        </button>

        {/* Mode 2: Full research (Default) */}
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onChange('FULL_EVIDENCE');
          }}
          className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${
            isFull
              ? 'bg-midnight-royal text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Full comprehensive due diligence with all vectors, claims, and graphs"
        >
          <ShieldCheck className="size-3.5 shrink-0" />
          <span className="sm:hidden">Full</span>
          <span className="hidden sm:inline">Full research</span>
        </button>

        {/* Mode 3: AI Agent */}
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            onChange('MACHINE_AI_INGESTION');
          }}
          className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${
            isAgent
              ? 'bg-midnight-royal text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Machine AI JSON-LD & plain-text token dump for autonomous agents"
        >
          <Bot className="size-3.5 shrink-0" />
          <span className="sm:hidden">Agent</span>
          <span className="hidden sm:inline">AI Agent</span>
        </button>
      </div>
    </div>
  );
};

