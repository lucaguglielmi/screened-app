import React from 'react';
import { DetailDensity } from '../types/investigation';
import {
  BookOpen,
  Layers,
  ShieldAlert,
  Bot,
  SlidersHorizontal,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface Props {
  density: DetailDensity;
  onChange: (newDensity: DetailDensity) => void;
}

export const DetailDial: React.FC<Props> = ({ density, onChange }) => {
  // Normalize active density (handling legacy values)
  const activeMode: DetailDensity =
    density === 'SUMMARY'
      ? 'SIMPLIFIED'
      : density === 'STANDARD'
        ? 'BALANCED'
        : density === 'EVIDENCE'
          ? 'FULL_EVIDENCE'
          : density;

  const modeOptions: {
    value: DetailDensity;
    stepNumber: string;
    label: string;
    sublabel: string;
    icon: React.ElementType;
  }[] = [
    {
      value: 'SIMPLIFIED',
      stepNumber: '1',
      label: 'Controversial',
      sublabel: 'Red flags & disputes',
      icon: BookOpen,
    },
    {
      value: 'BALANCED',
      stepNumber: '2',
      label: 'Overview',
      sublabel: 'Quick summary & map',
      icon: Layers,
    },
    {
      value: 'FULL_EVIDENCE',
      stepNumber: '3',
      label: 'All Data',
      sublabel: 'Full evidence & ledger',
      icon: ShieldAlert,
    },
    {
      value: 'MACHINE_AI_INGESTION',
      stepNumber: '4',
      label: 'I am not human',
      sublabel: 'AI & machine ingestion',
      icon: Bot,
    },
  ];

  const modeValues: DetailDensity[] = ['SIMPLIFIED', 'BALANCED', 'FULL_EVIDENCE', 'MACHINE_AI_INGESTION'];
  const currentIndex = modeValues.indexOf(activeMode) !== -1 ? modeValues.indexOf(activeMode) : 1;

  return (
    <div className="w-full space-y-2.5">
      {/* Header bar with title and active level */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <SlidersHorizontal className="size-3.5" />
          </div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
            How much data do you want to see?
          </span>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Mode <span className="text-indigo-400 font-bold">{currentIndex + 1} of 4</span>: <span className="text-white font-semibold">{modeOptions[currentIndex].label}</span>
        </div>
      </div>

      {/* Interactive Range Track */}
      <div className="px-1">
        <input 
          type="range"
          min="0"
          max="3"
          step="1"
          value={currentIndex}
          onChange={(e) => {
            soundEffects.playClick();
            onChange(modeValues[parseInt(e.target.value, 10)]);
          }}
          className="w-full h-2 bg-darkroom-card rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
        />
        
        {/* Step Buttons */}
        <div className="flex justify-between mt-2 text-xs font-mono">
          {modeOptions.map((opt, idx) => (
            <button
              key={opt.value}
              type="button" 
              className={`flex flex-col items-center gap-1 w-1/4 text-center cursor-pointer transition-colors ${
                idx === currentIndex 
                  ? 'text-indigo-400 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => {
                soundEffects.playClick();
                onChange(opt.value);
              }}
            >
              <opt.icon className={`size-3.5 ${idx === currentIndex ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span className="hidden sm:inline text-[11px]">{opt.label}</span>
              <span className="inline sm:hidden text-[10px]">{opt.stepNumber}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
