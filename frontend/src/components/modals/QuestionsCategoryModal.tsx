import React, { useState } from 'react';
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
  CheckCircle2,
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
  const [activeCategory, setActiveCategory] = useState<string>('due-diligence');

  if (typeof document === 'undefined') return null;

  const categories = [
    {
      id: 'due-diligence',
      label: 'Festival Due Diligence',
      icon: Search,
      color: 'text-emerald-400',
      description:
        'Scrutinize physical venues, fee transparency, legal entity status, and community reports.',
      questions: [
        'Is Aldergate Film Festival (Test Entity) legitimate or a virtual laurel mill?',
        'Verify physical cinema venue leases for Raindance Film Festival.',
        'Check submission fee transparency and hidden costs for Aesthetica.',
        'Who is the festival director behind Cannes Indie Shorts and are they verified on IMDb?',
        'Has any filmmaker reported predatory fee schemes with London Cinema Gala?',
      ],
    },
    {
      id: 'grants',
      label: 'Film Grants & Public Funds',
      icon: Coins,
      color: 'text-blue-400',
      description: 'Find active institutional funds, match funding, and regional agency subsidies.',
      questions: [
        'Find £25,000 documentary production grants and public funds in the UK.',
        'What public film funds match my drama short in early development?',
        'Show early bird deadlines for BFI Filmmaking Fund supported circuits.',
        'Are there non-dilutive film grants for European co-productions in 2026?',
      ],
    },
    {
      id: 'invitations',
      label: 'Invitation & Laurel Emails',
      icon: MailWarning,
      color: 'text-rose-400',
      description: 'Audit unsolicited direct messages, waiver offers, and trophy markups.',
      questions: [
        'Analyze this festival invitation email offering a 50% fee discount code.',
        'I received an unsolicited email saying my film was selected — is this real?',
        'They asked for £150 for a winner statue after nomination — is this normal?',
        'Check if this email domain is registered to an active cinema festival.',
      ],
    },
    {
      id: 'comparison',
      label: 'Festival Comparisons',
      icon: GitCompare,
      color: 'text-purple-400',
      description: 'Head-to-head comparison on accreditation, submission fee ROI, and press reach.',
      questions: [
        'Compare Raindance vs Leeds International Film Festival.',
        'What are the advantages of premiering at Sundance vs Tribeca?',
        'Compare Sheffield DocFest vs IDFA for short documentary premieres.',
        'Is it worth submitting to a non-qualifying festival for £80?',
      ],
    },
    {
      id: 'strategy',
      label: 'Submission Slate Strategy',
      icon: Compass,
      color: 'text-amber-400',
      description: 'Optimal release window planning, Early Bird deadlines, and .ics export.',
      questions: [
        'I have a 15-minute sci-fi short looking for a UK premiere on a £200 budget.',
        'How do I protect my World Premiere status while submitting to European festivals?',
        'What is the optimal submission calendar for a horror feature aiming for 2027 festivals?',
      ],
    },
  ];

  const currentCategoryData = categories.find((c) => c.id === activeCategory) || categories[0];

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

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl bg-void border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-midnight/80">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-serif">What Can I Ask?</h2>
                  <p className="text-xs text-zinc-400">
                    Select a category or click any example question to test
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onClose();
                }}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-zinc-800/60">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        soundEffects.playClick();
                        setActiveCategory(cat.id);
                      }}
                      className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'bg-black/40 text-zinc-300 hover:bg-black/70 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : cat.color}`} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-400 font-mono">
                    {currentCategoryData.description}
                  </p>
                  <span className="text-xs text-zinc-500 font-mono">
                    {currentCategoryData.questions.length} suggestions
                  </span>
                </div>

                <div className="space-y-2">
                  {currentCategoryData.questions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        soundEffects.playClick();
                        onSelectQuestion(q);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl bg-black/40 hover:bg-black/70 text-left group transition-all cursor-pointer"
                    >
                      <div className="flex items-start space-x-3 pr-2">
                        <CheckCircle2 className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 mt-0.5 shrink-0 transition-colors" />
                        <span className="text-sm text-zinc-200 group-hover:text-white font-sans">
                          {q}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-0.5 shrink-0 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-zinc-800 bg-midnight/60 flex items-center justify-between text-xs text-zinc-400">
              <span>
                You can also drop PDFs, emails, or treatment docs directly into the chat prompt bar.
              </span>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
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
