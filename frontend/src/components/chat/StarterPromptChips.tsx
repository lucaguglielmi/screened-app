import React from 'react';
import { soundEffects } from '../../utils/audio';

interface StarterPromptChipsProps {
  onSelectPrompt: (prompt: string) => void;
}

const STARTER_PROMPTS = [
  {
    icon: '🚨',
    title: 'Vet Aldergate Festival',
    prompt: 'Is Aldergate Film Festival legitimate or a scam? Check their physical venue screening leases and entry fees.',
    badge: 'Due Diligence',
  },
  {
    icon: '🎯',
    title: 'Short Film Strategy',
    prompt: 'I have a 14-minute sci-fi short looking for a UK premiere under a £250 submission budget. Where should I apply?',
    badge: 'Opportunity Scout',
  },
  {
    icon: '⚔️',
    title: 'Sundance vs Tribeca',
    prompt: 'Compare Sundance vs Tribeca for an independent documentary premiere.',
    badge: 'Versus Arena',
  },
  {
    icon: '📜',
    title: 'Raindance Legitimacy',
    prompt: 'Check Raindance Film Festival accreditation, BAFTA/BIFA qualifying status, and recent filmmaker feedback.',
    badge: 'Prestige Audit',
  },
];

export const StarterPromptChips: React.FC<StarterPromptChipsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 text-center mb-3">
        Or Ask The Producer Desk:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {STARTER_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              soundEffects.playClick();
              onSelectPrompt(item.prompt);
            }}
            className="flex items-start gap-3 p-3 text-left rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-850 hover:border-amber-500/40 transition-all group backdrop-blur-sm cursor-pointer"
          >
            <span className="text-xl shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors truncate">
                  {item.title}
                </span>
                <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 group-hover:bg-amber-500/20 group-hover:text-amber-300">
                  {item.badge}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                {item.prompt}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
