import React from 'react';
import { X, FileText, Shield, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TERMS_OF_SERVICE } from '../../content/legalTerms';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacy?: () => void;
}

export const TermsModal: React.FC<Props> = ({ isOpen, onClose, onOpenPrivacy }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-3xl rounded-2xl bg-darkroom-surface border border-darkroom-border shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-darkroom-border flex items-center justify-between bg-darkroom-card/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileText className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="terms-modal-title" className="font-serif text-lg font-semibold text-white">
                    {TERMS_OF_SERVICE.title}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    v{TERMS_OF_SERVICE.version}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Effective: {TERMS_OF_SERVICE.lastUpdated}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-darkroom-card transition-colors cursor-pointer"
              aria-label="Close Terms of Service modal"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Subtitle Banner */}
          <div className="px-6 py-3 bg-indigo-950/20 border-b border-indigo-500/15 flex items-center gap-2 text-xs text-indigo-300">
            <Shield className="size-4 shrink-0 text-indigo-400" />
            <span>{TERMS_OF_SERVICE.subtitle}</span>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs leading-relaxed">
            {TERMS_OF_SERVICE.sections.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wide">
                  {section.title}
                </h3>
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-slate-300 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-darkroom-border bg-darkroom-card/50 flex items-center justify-between">
            {onOpenPrivacy ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenPrivacy();
                }}
                className="text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Read Privacy Policy</span>
                <ExternalLink className="size-3" />
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-mono text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
