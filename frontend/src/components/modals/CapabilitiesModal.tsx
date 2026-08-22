import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Coins, 
  MailWarning, 
  GitCompare, 
  Compass, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  FileText
} from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface CapabilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (promptText: string) => void;
}

export const CapabilitiesModal: React.FC<CapabilitiesModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (typeof document === 'undefined') return null;

  const capabilities = [
    {
      id: 'due-diligence',
      title: 'Research a Festival in Depth',
      badge: 'Due Diligence',
      badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      icon: Search,
      iconColor: 'text-emerald-400',
      description:
        'Verify physical cinema venue leases, check Companies House legal filings, trace organizer track records, and scan trade publications for hidden fee schemes.',
      examplePrompt: 'Is Aldergate Film Festival legitimate? Check their screening venues and fees.',
      tags: ['Venue Leases', 'Companies House', 'Fee Audit', 'Jury Prestige'],
    },
    {
      id: 'grant-scout',
      title: 'Find a Grant or Sponsor for Your Film',
      badge: 'Public Grants & Funds',
      badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
      icon: Coins,
      iconColor: 'text-blue-400',
      description:
        'Discover public film funds (BFI Filmmaking Fund, Screen Scotland, Sundance Doc Fund, Eurimages), match funding criteria, and early submission grant windows.',
      examplePrompt: 'Find £25k documentary production grants and public funding in the UK.',
      tags: ['BFI Fund', 'Doc Grants', 'Match Funding', 'Development Money'],
    },
    {
      id: 'invitation-audit',
      title: 'Verify an Unsolicited Invitation Email',
      badge: 'Laurel & Email Audit',
      badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
      icon: MailWarning,
      iconColor: 'text-rose-400',
      description:
        'Paste or drop an acceptance email or waiver code to detect laurel mills, phantom online-only screenings, or high-priced trophy/statue upsells.',
      examplePrompt: 'Analyze this festival invitation email offering a 50% waiver code for red flags.',
      tags: ['Fee Waiver Scams', 'Phantom Laurels', 'Trophy Upsells', 'Domain Audit'],
    },
    {
      id: 'compare-festivals',
      title: 'Compare Two Festivals Head-to-Head',
      badge: 'Comparison Arena',
      badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
      icon: GitCompare,
      iconColor: 'text-purple-400',
      description:
        'Evaluate acceptance rates, audience attendance, press presence, and accreditation value (BAFTA, BIFA, Oscars, FIAPF) between two target festivals.',
      examplePrompt: 'Compare Raindance vs Leeds International Film Festival.',
      tags: ['BAFTA vs BIFA', 'Submission ROI', 'Audience Scale', 'Press Reach'],
    },
    {
      id: 'slate-strategy',
      title: 'Map a Qualifying Submission Roadmap',
      badge: 'Opportunity Scout',
      badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
      icon: Compass,
      iconColor: 'text-rose-400',
      description:
        'Input your project format, genre, runtime, and budget to receive an optimal calendar timeline with Early Bird discounts and exportable .ics deadlines.',
      examplePrompt: 'I have a 15-min sci-fi short looking for a UK premiere on a £200 budget.',
      tags: ['.ics Calendar', 'Early Bird', 'Premiere Protection', 'Oscar Qualifiers'],
    },
    {
      id: 'script-treatment',
      title: 'Drop a Treatment, Synopsis or Pitch Deck',
      badge: 'Multimodal Intake',
      badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
      icon: FileText,
      iconColor: 'text-amber-400',
      description:
        'Drop a 1-page synopsis, PDF treatment, or script draft directly into the desk. The agent autonomously extracts parameters and customizes your festival strategy.',
      examplePrompt: 'Extract genre and runtime from my treatment PDF and recommend qualifying circuits.',
      tags: ['PDF Drop', 'Synopsis Extraction', 'Automatic Targeting'],
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
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-void border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-midnight/80">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-serif">What Can You Search?</h2>
                  <p className="text-sm text-zinc-400">Goal-oriented cinema intelligence and autonomous due diligence</p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onClose();
                }}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Grid */}
            <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {capabilities.map((cap) => {
                const IconComponent = cap.icon;
                return (
                  <div
                    key={cap.id}
                    className="flex flex-col justify-between p-5 rounded-xl bg-card border border-zinc-800/80 hover:border-blue-500/40 hover:bg-surface/90 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <IconComponent className={`w-5 h-5 ${cap.iconColor}`} />
                          <span className="font-semibold text-white text-base font-sans">{cap.title}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${cap.badgeColor}`}>
                          {cap.badge}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed mb-4">{cap.description}</p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {cap.tags.map((t) => (
                          <span key={t} className="text-xs bg-midnight/90 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        soundEffects.playClick();
                        onSelectAction(cap.examplePrompt);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-midnight border border-zinc-700/60 text-xs text-blue-400 hover:text-white hover:bg-blue-600/20 hover:border-blue-500/50 transition-all font-mono"
                    >
                      <span className="truncate pr-2">Try: "{cap.examplePrompt}"</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-800 bg-midnight/60 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>All queries run against verified registry, trade press, and official festival archives.</span>
              </div>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onClose();
                }}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
