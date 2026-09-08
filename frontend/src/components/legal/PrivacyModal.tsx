import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Cookie, ExternalLink, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRIVACY_POLICY, COOKIE_POLICY } from '../../content/legalTerms';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerms?: () => void;
  onOpenCookieSettings?: () => void;
}

export const PrivacyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpenTerms,
  onOpenCookieSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'cookies'>('privacy');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
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
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Lock className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="privacy-modal-title" className="font-serif text-lg font-semibold text-white">
                    {PRIVACY_POLICY.title}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    GDPR &amp; UK DPA
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Effective: {PRIVACY_POLICY.lastUpdated}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-darkroom-card transition-colors cursor-pointer"
              aria-label="Close Privacy Policy modal"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="px-6 py-2 border-b border-darkroom-border flex items-center gap-3 bg-darkroom-card/30">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'privacy'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="size-3.5" />
              <span>Privacy &amp; Data Protection</span>
            </button>
            <button
              onClick={() => setActiveTab('cookies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'cookies'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cookie className="size-3.5" />
              <span>Cookies &amp; Local Storage</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs leading-relaxed">
            {activeTab === 'privacy' ? (
              <>
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 flex items-start gap-2.5">
                  <Database className="size-4 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <strong className="font-mono text-white block mb-0.5">Strict Data Minimization Guarantee:</strong>
                    Screened extracts structural metadata only (format, genre, budget tier). Your full screenplays and pitch decks are never sent to external search APIs or utilized to train AI models.
                  </div>
                </div>

                {PRIVACY_POLICY.sections.map((section, idx) => (
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
              </>
            ) : (
              <>
                <p className="text-slate-300 leading-relaxed">
                  {COOKIE_POLICY.summary}
                </p>

                <div className="space-y-4">
                  {COOKIE_POLICY.categories.map((cat, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-darkroom-card border border-darkroom-border space-y-2.5">
                      <h3 className="font-mono text-xs font-bold text-white uppercase">
                        {cat.name}
                      </h3>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {cat.description}
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] border-collapse">
                          <thead>
                            <tr className="border-b border-darkroom-border text-slate-400 font-mono">
                              <th className="pb-1.5 font-semibold">Key / Identifier</th>
                              <th className="pb-1.5 font-semibold">Purpose</th>
                              <th className="pb-1.5 font-semibold">Duration</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-darkroom-border/50 text-slate-300">
                            {cat.items.map((item, iIdx) => (
                              <tr key={iIdx}>
                                <td className="py-2 font-mono text-indigo-400">{item.key}</td>
                                <td className="py-2">{item.purpose}</td>
                                <td className="py-2 font-mono text-slate-400">{item.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>

                {onOpenCookieSettings && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCookieSettings();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Cookie className="size-3.5" />
                      <span>Adjust Cookie Preferences</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-darkroom-border bg-darkroom-card/50 flex items-center justify-between">
            {onOpenTerms ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenTerms();
                }}
                className="text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Read Terms of Service</span>
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
