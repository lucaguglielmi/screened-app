import React from 'react';
import { DetailDensity } from '../types/investigation';
import { SlidersHorizontal, BookOpen, Layers, Shield } from 'lucide-react';

interface Props {
  density: DetailDensity;
  onChange: (newDensity: DetailDensity) => void;
}

export const DetailDial: React.FC<Props> = ({ density, onChange }) => {
  const options: { value: DetailDensity; label: string; icon: React.ElementType; desc: string }[] = [
    {
      value: 'SUMMARY',
      label: 'Summary',
      icon: BookOpen,
      desc: 'High-level synthesis & disputes',
    },
    {
      value: 'STANDARD',
      label: 'Standard',
      icon: Layers,
      desc: 'All claims & status badges',
    },
    {
      value: 'EVIDENCE',
      label: 'Raw Evidence',
      icon: Shield,
      desc: 'Inline verbatim quotes & source tiers',
    },
  ];

  return (
    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border">
      <div className="hidden sm:flex items-center gap-1 px-2 text-xs font-mono text-paper-muted dark:text-darkroom-muted">
        <SlidersHorizontal className="size-3.5" />
        <span>Detail Dial:</span>
      </div>

      <div className="flex items-center gap-1">
        {options.map((opt) => {
          const isSelected = density === opt.value;
          const Icon = opt.icon;

          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-paper-muted dark:text-darkroom-muted hover:text-paper-text dark:hover:text-darkroom-text'
              }`}
              title={opt.desc}
            >
              <Icon className="size-3.5" />
              <span className="font-mono">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
