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
    badgeClass: 'bg-[#00D29E]/20 text-[#00D29E] border-[#00D29E]/40',
  },
  {
    icon: '🎯',
    title: 'Short Film Strategy',
    prompt: 'I have a 14-minute sci-fi short looking for a UK premiere under a £250 submission budget. Where should I apply?',
    badge: 'Opportunity Scout',
    badgeClass: 'bg-[#F43F5E]/20 text-[#F43F5E] border-[#F43F5E]/40',
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
    prompt: 'Check Raindance Film Festival accreditation, BAFTA/BIFA qualifying status, and recent filmmaker feedback.',
    badge: 'Prestige Audit',
    badgeClass: 'bg-[#2018E6]/20 text-indigo-300 border-[#2018E6]/40',
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
            className="flex items-start gap-3.5 p-4 text-left rounded-2xl border border-[#22274C] bg-[#0E1124]/90 hover:bg-[#151936] hover:border-[#2018E6]/60 transition-all group backdrop-blur-sm cursor-pointer shadow-md"
          >
            <span className="text-2xl shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                  {item.title}
                </span>
                <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${item.badgeClass}`}>
                  {item.badge}
                </span>
              </div>
              <p className="text-base text-slate-300 line-clamp-2 leading-relaxed">
                {item.prompt}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
