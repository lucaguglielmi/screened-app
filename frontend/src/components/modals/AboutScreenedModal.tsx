import React, { useEffect } from 'react';
import { X, ShieldCheck, Search, Scale, Sparkles, CheckCircle2 } from 'lucide-react';
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
        className="absolute inset-0 bg-midnight-void/40 backdrop-blur-xl transition-opacity"
        onClick={() => {
          soundEffects.playClick();
          onClose();
        }}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-darkroom-bg border border-darkroom-border shadow-2xl shadow-indigo-950/60 overflow-hidden text-slate-100 animate-scale-up">
        {/* Scrollable Container (Non-sticky Header + Body) */}
        <div className="flex-1 overflow-y-auto">
          {/* Header with Sherlock Cinema Avatar & Close */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-darkroom-border bg-darkroom-surface">
            <div className="flex items-center gap-3.5">
              <AgentAvatar size="md" isInteractive={false} />
              <div>
                <h2 className="font-serif text-xl font-bold text-white tracking-tight">
                  About Screened
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Autonomous cinema intelligence
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-darkroom-border transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Body Content (16px base font for maximum readability) */}
          <div className="p-6 sm:p-8 space-y-6 text-base leading-relaxed text-slate-200">
            {/* Mission Hero Banner */}
            <div className="p-5 rounded-2xl bg-darkroom-bg space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 uppercase tracking-wider font-semibold">
                <ShieldCheck className="size-4 text-tool-diligence" />
                Forensic Protection for Indie Cinema
              </div>
              <p className="text-base text-slate-100 font-medium leading-relaxed">
                We apply <strong>finance-level due diligence</strong> to the cinema industry,
                specifically engineered to protect and empower individual indie filmmakers with
                government-grade forensic verification.
              </p>
            </div>

            {/* Three Core Pillars */}
            <div className="space-y-4 pt-1">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                How Screened Works
              </h3>

              {/* Pillar 1: Parallel Web Crawling */}
              <div className="p-4 rounded-2xl bg-darkroom-bg flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                  <Search className="size-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-white text-base">
                    Multi-Million Web Scraping via Parallel Tech
                  </h4>
                  <p className="text-sm text-slate-300 leading-normal">
                    We scan millions of web sources in real-time using high-concurrency Parallel
                    technology. We query official government APIs, Companies House filings, IRS 990
                    non-profit tax returns, and press archives to validate every physical venue,
                    organizer record, and past screening.
                  </p>
                </div>
              </div>

              {/* Pillar 2: Deterministic Corroboration */}
              <div className="p-4 rounded-2xl bg-darkroom-bg flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-tool-diligence/20 text-tool-diligence shrink-0 mt-0.5">
                  <Scale className="size-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-white text-base">
                    Deterministic Output & Corroborated Evidence
                  </h4>
                  <p className="text-sm text-slate-300 leading-normal">
                    You are interacting with an advanced conversational AI agent, but the research
                    outputs generated by our multi-agent pipeline are{' '}
                    <strong>fully deterministic</strong>. Every finding is corroborated by independent
                    source citations, verifiable web archives, and hard facts.
                  </p>
                </div>
              </div>

              {/* Pillar 3: Non-Dilutive Grant Roadmaps */}
              <div className="p-4 rounded-2xl bg-darkroom-bg flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                  <Sparkles className="size-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-white text-base">
                    Protecting Your Submission Budget & Finding Real Funds
                  </h4>
                  <p className="text-sm text-slate-300 leading-normal">
                    Beyond identifying predatory submission fees and fake vanity laurels, Screened
                    matches your film with legitimate BAFTA/Oscar qualifying circuits and verified
                    non-dilutive public grants (BFI, Sundance, Screen Scotland, Eurimages).
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Summary Highlights */}
            <div className="p-4 rounded-2xl bg-darkroom-bg grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-tool-diligence" />
                <span>Zero Blackbox Scores</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-tool-diligence" />
                <span>Verifiable Citations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-tool-diligence" />
                <span>Live Venue Audits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-tool-diligence" />
                <span>Government Registries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-tool-diligence" />
                <span>Non-Dilutive Grants</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-tool-diligence" />
                <span>Privacy & PII Masking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Actions */}
        <div className="px-6 py-4 border-t border-darkroom-border bg-darkroom-surface flex items-center justify-between gap-3">
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
                className="px-4 py-2 rounded-xl bg-paper-border bg-darkroom-border hover:bg-paper-border hover:bg-darkroom-border text-slate-200 text-xs font-mono border border-darkroom-border transition-all cursor-pointer"
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
              className="px-4 py-2 rounded-xl bg-midnight-royal hover:bg-midnight-royal text-white font-bold text-xs font-mono transition-all shadow-md shadow-indigo-950/50 cursor-pointer"
            >
              Ask Mission Control
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
