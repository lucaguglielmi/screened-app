import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  HelpCircle,
  Search,
  Coins,
  MailWarning,
  GitCompare,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface QuestionsCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (question: string) => void;
}

export const QuestionsCategoryModal: React.FC<QuestionsCategoryModalProps> = ({
  isOpen,
  onClose,
  onSelectQuestion,
}) => {
  if (typeof document === 'undefined') return null;

  const CATEGORIES = [
    {
      id: 'due-diligence',
      label: 'Festival Due Diligence',
      icon: Search,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Venue authenticity, fee transparency, and operator verification.',
      questions: [
        'Is Raindance Film Festival legitimate or a virtual laurel mill?',
        'Verify physical cinema venue leases for Aesthetica Film Festival.',
      ],
    },
    {
      id: 'grants',
      label: 'Film Grants & Public Funds',
      icon: Coins,
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      description: 'Institutional film funds, regional grants, and non-dilutive subsidies.',
      questions: [
        'Find UK documentary production grants and public funds.',
        'What public funds match my drama short in early development?',
      ],
    },
    {
      id: 'invitations',
      label: 'Invitation & Laurel Emails',
      icon: MailWarning,
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      description: 'Audit unsolicited invitations, discount codes, and trophy charges.',
      questions: [
        'Analyze an invitation email offering a 50% fee discount code.',
        'They asked for £150 for a winner trophy — is this legitimate?',
      ],
    },
    {
      id: 'comparison',
      label: 'Festival Comparisons',
      icon: GitCompare,
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      description: 'Head-to-head analysis on accreditation, fee ROI, and press reach.',
      questions: [
        'Compare Sundance vs Tribeca for indie feature premieres.',
        'Compare Sheffield DocFest vs IDFA for short documentary premieres.',
      ],
    },
    {
      id: 'strategy',
      label: 'Submission Slate Strategy',
      icon: Compass,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      description: 'Release window sequencing, early bird deadlines, and premiere protection.',
      questions: [
        'Recommend a submission timeline for a 15-minute sci-fi short.',
        'How do I protect my World Premiere status across European festivals?',
      ],
    },
  ];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="fixed inset-0 bg-[#040a17]/80 backdrop-blur-md"
          />

          {/* Dialog Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-2xl bg-midnight-surface/95 backdrop-blur-2xl border border-darkroom-border rounded-3xl shadow-2xl shadow-black/80 overflow-hidden z-10 my-6 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-darkroom-border bg-midnight-base/60 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-serif tracking-tight">
                    What Can I Ask?
                  </h2>
                  <p className="text-xs text-slate-400">
                    Click any example query below to launch a deep investigation
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onClose();
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <section key={cat.id} className="space-y-2.5">
                    {/* Category Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono border ${cat.badgeColor}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cat.label}</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
                        {cat.description}
                      </span>
                    </div>

                    {/* Compact Question Cards */}
                    <div className="grid grid-cols-1 gap-2">
                      {cat.questions.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            soundEffects.playClick();
                            onSelectQuestion(q);
                            onClose();
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-2xl bg-midnight-base/60 hover:bg-midnight-royal/60 border border-darkroom-border/80 hover:border-indigo-500/40 text-left group transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.99]"
                        >
                          <div className="flex items-center space-x-2.5 pr-3 min-w-0">
                            <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0 transition-colors" />
                            <span className="text-xs sm:text-sm text-slate-200 group-hover:text-white font-sans truncate">
                              {q}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 group-hover:text-indigo-300 shrink-0">
                            <span className="text-[11px] font-mono hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">
                              Run
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-darkroom-border bg-midnight-base/70 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="text-[11.5px] leading-tight">
                Tip: You can also drag & drop PDFs or emails directly onto the chat window.
              </span>
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-midnight-royal hover:bg-midnight-royal/80 border border-darkroom-border text-slate-200 text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
