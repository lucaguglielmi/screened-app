import React from 'react';
import { motion } from 'motion/react';
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
      <div className="relative p-1 rounded-xl bg-[#060a15]/90 border border-darkroom-border/60 shadow-inner">
        {/* Sliding Indicator Layer */}
        <div
          className="absolute inset-1 grid grid-cols-3 gap-1 pointer-events-none"
          aria-hidden="true"
        >
          <div className="relative h-full">
            <motion.div
              className="absolute inset-0 rounded-lg bg-midnight-royal shadow-md shadow-midnight-royal/40 border border-blue-400/30"
              initial={false}
              animate={{
                x: `calc(${isShort ? 0 : isAgent ? 2 : 1} * 100% + ${(isShort ? 0 : isAgent ? 2 : 1) * 4}px)`,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 32,
                mass: 0.8,
              }}
            />
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-3 gap-1 relative z-10">
          {/* Mode 1: Summary */}
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              onChange('SIMPLIFIED');
            }}
            className={`relative py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs font-mono transition-colors cursor-pointer select-none ${
              isShort
                ? 'text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
            title="Summary executive overview & key checklist"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <BookOpen className="size-3.5 shrink-0" />
              <span>Summary</span>
            </span>
          </button>

          {/* Mode 2: Full research (Default) */}
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              onChange('FULL_EVIDENCE');
            }}
            className={`relative py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs font-mono transition-colors cursor-pointer select-none ${
              isFull
                ? 'text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
            title="Full comprehensive due diligence with all vectors, claims, and graphs"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 shrink-0" />
              <span>Full</span>
            </span>
          </button>

          {/* Mode 3: AI Agent */}
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              onChange('MACHINE_AI_INGESTION');
            }}
            className={`relative py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs font-mono transition-colors cursor-pointer select-none ${
              isAgent
                ? 'text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
            title="Machine AI JSON-LD & plain-text token dump for autonomous agents"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <Bot className="size-3.5 shrink-0" />
              <span>Agent</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};


