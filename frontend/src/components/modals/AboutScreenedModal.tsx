import React, { useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Search, 
  Scale, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';
import { AgentAvatar } from '../chat/AgentAvatar';
import { soundEffects } from '../../utils/audio';

interface AboutScreenedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDesk?: () => void;
  onNavigateToDiligence?: () => void;
}

export const AboutScreenedModal: React.FC<AboutScreenedModalProps> = ({
  isOpen,
  onClose,
  onNavigateToDesk,
  onNavigateToDiligence,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in select-none">
      {/* Dark backdrop blur */}
      <div 
        className="absolute inset-0 bg-[#05050A]/85 backdrop-blur-md transition-opacity"
        onClick={() => {
          soundEffects.playClick();
          onClose();
        }}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#090C19] border border-[#22274C] shadow-2xl shadow-indigo-950/60 overflow-hidden text-slate-100 animate-scale-up">
        {/* Header with Sherlock Cinema Avatar & Close */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1D2244] bg-[#0C1024]">
          <div className="flex items-center gap-3.5">
            <AgentAvatar size="md" isInteractive={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold text-white tracking-tight">
                  About Screened
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#00D29E]/20 text-[#00D29E] border border-[#00D29E]/40 font-medium">
                  Finance-Grade Due Diligence
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Autonomous intelligence for independent filmmakers
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1A1F45] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Body Content (16px base font for maximum readability) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-base leading-relaxed text-slate-200">
          
          {/* Mission Hero Banner */}
          <div className="p-5 rounded-2xl bg-[#04060E] space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 uppercase tracking-wider font-semibold">
              <ShieldCheck className="size-4 text-[#00D29E]" />
              Forensic Protection for Indie Cinema
            </div>
            <p className="text-base text-slate-100 font-medium leading-relaxed">
              We apply <strong>finance-level due diligence</strong> to the cinema industry, specifically engineered to protect and empower individual indie filmmakers with government-grade forensic verification.
            </p>
          </div>

          {/* Three Core Pillars */}
          <div className="space-y-4 pt-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              How Screened Works
            </h3>

            {/* Pillar 1: Parallel Web Crawling */}
            <div className="p-4 rounded-2xl bg-[#04060E] flex gap-4 items-start">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                <Search className="size-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-white text-base">
                  Multi-Million Web Scraping via Parallel Tech
                </h4>
                <p className="text-sm text-slate-300 leading-normal">
                  We scan millions of web sources in real-time using high-concurrency Parallel technology. We query official government APIs, Companies House filings, IRS 990 non-profit tax returns, and press archives to validate every physical venue, organizer record, and past screening.
                </p>
              </div>
            </div>

            {/* Pillar 2: Deterministic Corroboration */}
            <div className="p-4 rounded-2xl bg-[#04060E] flex gap-4 items-start">
              <div className="p-2.5 rounded-xl bg-[#00D29E]/20 text-[#00D29E] shrink-0 mt-0.5">
                <Scale className="size-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-white text-base">
                  Deterministic Output & Corroborated Evidence
                </h4>
                <p className="text-sm text-slate-300 leading-normal">
                  You are interacting with an advanced conversational AI agent, but the research outputs generated by our multi-agent pipeline are <strong>fully deterministic</strong>. Every finding is corroborated by independent source citations, verifiable web archives, and hard facts.
                </p>
              </div>
            </div>

            {/* Pillar 3: Non-Dilutive Grant Roadmaps */}
            <div className="p-4 rounded-2xl bg-[#04060E] flex gap-4 items-start">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                <Sparkles className="size-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-white text-base">
                  Protecting Your Submission Budget & Finding Real Funds
                </h4>
                <p className="text-sm text-slate-300 leading-normal">
                  Beyond identifying predatory submission fees and fake vanity laurels, Screened matches your film with legitimate BAFTA/Oscar qualifying circuits and verified non-dilutive public grants (BFI, Sundance, Screen Scotland, Eurimages).
                </p>
              </div>
            </div>
          </div>

          {/* Quick Summary Highlights */}
          <div className="p-4 rounded-2xl bg-[#04060E] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#00D29E]" />
              <span>Zero Blackbox Scores</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#00D29E]" />
              <span>Verifiable Citations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#00D29E]" />
              <span>Live Venue Audits</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#00D29E]" />
              <span>Government Registries</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#00D29E]" />
              <span>Non-Dilutive Grants</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#00D29E]" />
              <span>Privacy & PII Masking</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation Actions */}
        <div className="px-6 py-4 border-t border-[#1D2244] bg-[#0C1024] flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Screened Cinema Intelligence v1.0
          </span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {onNavigateToDiligence && (
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onClose();
                  onNavigateToDiligence();
                }}
                className="px-4 py-2 rounded-xl bg-[#1A1F45] hover:bg-[#23295C] text-slate-200 text-xs font-mono border border-[#2B3369] transition-all cursor-pointer"
              >
                Due Diligence Workspace
              </button>
            )}
            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
                if (onNavigateToDesk) onNavigateToDesk();
              }}
              className="px-4 py-2 rounded-xl bg-[#2018E6] hover:bg-[#322CE8] text-white font-bold text-xs font-mono transition-all shadow-md shadow-indigo-950/50 cursor-pointer"
            >
              Ask Mission Control
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
