import React from 'react';
import { soundEffects } from '../../utils/audio';

interface StarterPromptChipsProps {
  onSelectPrompt: (prompt: string) => void;
}

const STARTER_PROMPTS = [
  {
    icon: '🚨',
    title: 'Vet Aldergate Festival',
    prompt:
      'Is Aldergate Film Festival legitimate or a scam? Check their physical venue screening leases and entry fees.',
    badge: 'Due Diligence',
    badgeClass: 'bg-tool-diligence/20 text-tool-diligence border-tool-diligence/40',
  },
  {
    icon: '🎯',
    title: 'Short Film Strategy',
    prompt:
      'I have a 14-minute sci-fi short looking for a UK premiere under a £250 submission budget. Where should I apply?',
    badge: 'Opportunity Scout',
    badgeClass: 'bg-tool-scout/20 text-tool-scout border-tool-scout/40',
  },
  {
    icon: '⚔️',
    title: 'Sundance vs Tribeca',
    prompt: 'Compare Sundance vs Tribeca for an independent documentary premiere.',
    badge: 'Versus Arena',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  },
  {
    icon: '📜',
    title: 'Raindance Legitimacy',
    prompt:
      'Check Raindance Film Festival accreditation, BAFTA/BIFA qualifying status, and recent filmmaker feedback.',
    badge: 'Prestige Audit',
    badgeClass: 'bg-midnight-royal/20 text-indigo-300 border-midnight-royal/40',
  },
];

export const StarterPromptChips: React.FC<StarterPromptChipsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <p className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
        Or Ask The Producer Desk:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {STARTER_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              soundEffects.playClick();
              onSelectPrompt(item.prompt);
            }}
            className="flex items-start gap-3.5 p-4 text-left rounded-2xl bg-darkroom-surface hover:bg-darkroom-card transition-all group cursor-pointer shadow-xl"
          >
            <span className="text-2xl shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                  {item.title}
                </span>
                <span
                  className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md ${item.badgeClass}`}
                >
                  {item.badge}
                </span>
              </div>
              <p className="text-base text-slate-300 line-clamp-2 leading-relaxed">{item.prompt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
