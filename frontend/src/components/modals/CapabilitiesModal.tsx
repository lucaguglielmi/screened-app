import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Coins, 
  Compass, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  FileText,
  Info
} from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface CapabilityTag {
  label: string;
  info: string;
}

interface CapabilityDomainData {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  summary: string;
  tags: CapabilityTag[];
  searchExamples: { label: string; promptText: string }[];
}

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
  const [activeHoverTag, setActiveHoverTag] = useState<{ id: string; index: number } | null>(null);

  if (typeof document === 'undefined') return null;

  const handleRunExample = (promptText: string) => {
    soundEffects.playSuccess();
    onClose();
    onSelectAction(promptText);
  };

  const domains: CapabilityDomainData[] = [
    {
      id: 'due-diligence',
      title: 'Festival Due Diligence',
      badge: 'Core Investigation',
      badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      icon: Search,
      iconColor: 'text-emerald-400',
      summary: 'Autonomous background checks cross-examining cinema leases, registry filings, and entry fees.',
      tags: [
        { label: 'Venue Lease Tracing', info: 'Cross-checks municipal theater rental manifests to verify real cinema screenings vs. private streaming links.' },
        { label: 'Corporate Registry', info: 'Searches UK Companies House & global records for active business status and dissolution warnings.' },
        { label: 'Fee Escalation Audit', info: 'Scans past festival editions to detect aggressive late fee inflation and predatory pricing.' },
        { label: 'Jury Credibility', info: 'Verifies published industry credits across IMDb, BAFTA rosters, and trade press records.' },
        { label: 'Scam Forum Scrutiny', info: 'Scans Reddit, Letterboxd, and filmmaker forums for red flags and unfulfilled prize reports.' },
        { label: 'Accreditation Status', info: 'Confirms qualifying status for BAFTA, BIFA, and Academy Awards.' }
      ],
      searchExamples: [
        { label: 'Vet Aberdeen Film Festival', promptText: 'Is Aberdeen Film Festival legitimate? Check their physical venue leases and entry fees.' },
        { label: 'Audit Aldergate Festival', promptText: 'Is Aldergate Film Festival legitimate or a scam? Check their screening leases.' },
        { label: 'Check Raindance credentials', promptText: 'Perform due diligence on Raindance Film Festival accreditation and venue scale.' }
      ]
    },
    {
      id: 'opportunity-scout',
      title: 'Opportunity Scout & Circuit Strategy',
      badge: 'Distribution Match',
      badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
      icon: Compass,
      iconColor: 'text-rose-400',
      summary: 'Custom submission calendar tailored to your film’s format, genre, runtime, and premiere goals.',
      tags: [
        { label: 'Circuit Matching', info: 'Matches the highest-yield festivals based on film duration, genre, and production budget.' },
        { label: 'Early Bird Deadlines', info: 'Flags discounted submission windows to keep distribution expenses low.' },
        { label: 'Premiere Protection', info: 'Protects World, International, and Regional premiere requirements from disqualification.' },
        { label: 'BAFTA / Oscar Filters', info: 'Isolates qualifying festival windows for short films and independent features.' },
        { label: 'ICS Calendar Export', info: 'Generates downloadable calendar reminders for upcoming submission cutoffs.' }
      ],
      searchExamples: [
        { label: 'Sci-Fi Short Strategy', promptText: 'Where should I submit my 15-minute sci-fi short film looking for a UK premiere on a £300 budget?' },
        { label: 'Feature Doc Rollout', promptText: 'Recommend a festival premiere strategy for an 80-minute independent documentary.' },
        { label: 'Early Bird Deadlines', promptText: 'Find upcoming Early Bird submission deadlines under £40 for indie shorts.' }
      ]
    },
    {
      id: 'grants-funding',
      title: 'Film Grants & Public Schemes',
      badge: 'Public Funding',
      badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
      icon: Coins,
      iconColor: 'text-blue-400',
      summary: 'Scouts public film funds, development schemes, and regional non-dilutive awards.',
      tags: [
        { label: 'BFI & National Lottery', info: 'Matches BFI Filmmaking Fund, Screen Scotland, and UK regional grant windows.' },
        { label: 'Eurimages & Co-Production', info: 'Screens international treaty co-production quotas and regional match funding.' },
        { label: 'Script Development', info: 'Surfaces early-stage screenwriting development and treatment incubator funds.' },
        { label: 'Eligibility Scanner', info: 'Evaluates required match ratios, producer residency rules, and expenditure criteria.' }
      ],
      searchExamples: [
        { label: 'UK Doc Production Grants', promptText: 'Find £25k documentary production grants and public funding schemes in the UK.' },
        { label: 'Script Development Funds', promptText: 'Show active early-stage development grants and script development funds for indie filmmakers.' }
      ]
    },
    {
      id: 'script-intake',
      title: 'Script & Invitation Document Intake',
      badge: 'Multimodal OCR',
      badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
      icon: FileText,
      iconColor: 'text-purple-400',
      summary: 'Drag and drop PDF scripts, treatments, or invitation emails for instant autonomous extraction.',
      tags: [
        { label: 'PDF Treatment Parsing', info: 'Extracts logline, genre, runtime, budget tier, and festival eligibility directly from documents.' },
        { label: 'Invitation Verification', info: 'Examines waiver codes, sender domains, and trophy-fee solicitations in invitation emails.' },
        { label: 'Direct Circuit Pre-fill', info: 'Automatically populates Opportunity Scout parameters from the uploaded screenplay.' }
      ],
      searchExamples: [
        { label: 'Analyze Waiver Email', promptText: 'Analyze this festival invitation email offering a 50% discount waiver code.' },
        { label: 'Review Attached Script', promptText: 'Review my uploaded treatment PDF and recommend 5 top UK festival matches.' }
      ]
    },
    {
      id: 'deep-vetting',
      title: 'Deep Multi-Year Vetting',
      badge: 'Multi-Edition Forensic',
      badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
      icon: ShieldCheck,
      iconColor: 'text-amber-400',
      summary: '7-dimension multi-year forensic examination evaluating domain longevity, boilerplate rules, and alumni.',
      tags: [
        { label: 'Image Reverse Tracing', info: 'Detects whether promotional gala photos are stock images or authentic physical venues.' },
        { label: 'Boilerplate Plagiarism', info: 'Identifies copy-pasted rules and submission guidelines from known scam syndicates.' },
        { label: 'Domain WHOIS Longevity', info: 'Checks domain creation dates against claimed edition longevity numbers.' },
        { label: 'Alumni Corroboration', info: 'Verifies real filmmaker screening confirmations on Letterboxd and IMDb.' }
      ],
      searchExamples: [
        { label: 'Multi-Year Forensic Check', promptText: 'Run a deep multi-year forensic scan on Aldergate Film Festival examining alumni and domain history.' }
      ]
    }
  ];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-3xl max-h-[88vh] rounded-3xl bg-[#090C1B] border border-[#1F254E] shadow-2xl p-5 sm:p-7 flex flex-col text-slate-100 z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#1A2045]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-sm">
                    <Sparkles className="size-4" />
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                    What does Screened do?
                  </h2>
                </div>
                <p className="text-base text-slate-300 mt-1">
                  Hover on any capability tag to learn how the agent works, or click an example query.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onClose();
                }}
                className="p-2 rounded-xl bg-[#111633] hover:bg-[#1A214D] border border-[#222B5F] text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Domain Cards Container */}
            <div className="flex-1 overflow-y-auto pr-1.5 py-4 space-y-4">
              {domains.map((domain) => {
                const DomainIcon = domain.icon;
                return (
                  <div
                    key={domain.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#0E122A]/90 border border-[#1C234E] hover:border-[#2C3775] transition-all space-y-3.5"
                  >
                    {/* Domain Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl bg-midnight/80 border border-zinc-800 ${domain.iconColor}`}>
                          <DomainIcon className="size-4.5" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {domain.title}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono border ${domain.badgeColor} w-fit`}>
                        {domain.badge}
                      </span>
                    </div>

                    {/* Summary (Readable 16px font) */}
                    <p className="text-base text-slate-300 leading-relaxed">
                      {domain.summary}
                    </p>

                    {/* Capability Tags Grid with Interactive Hover Tooltips */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                        Capabilities (hover for details)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {domain.tags.map((tag, idx) => {
                          const isHovered = activeHoverTag?.id === domain.id && activeHoverTag?.index === idx;
                          return (
                            <div
                              key={idx}
                              className="relative"
                              onMouseEnter={() => {
                                soundEffects.playClick();
                                setActiveHoverTag({ id: domain.id, index: idx });
                              }}
                              onMouseLeave={() => setActiveHoverTag(null)}
                            >
                              <button
                                type="button"
                                className="px-3 py-1.5 rounded-xl bg-[#141A3B] hover:bg-[#1C2554] border border-[#242E68] text-sm text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-help"
                              >
                                <span>{tag.label}</span>
                                <Info className="size-3 text-slate-400 shrink-0" />
                              </button>

                              {/* Interactive Hover Tooltip */}
                              <AnimatePresence>
                                {isHovered && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute bottom-full left-0 mb-2 w-64 p-3 rounded-xl bg-[#090C1F] border border-indigo-500/40 text-slate-100 text-xs shadow-2xl z-50 pointer-events-none"
                                  >
                                    <div className="font-semibold text-indigo-300 mb-1 flex items-center gap-1">
                                      <span>⚡ {tag.label}</span>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed font-sans">{tag.info}</p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 1-Click Search Examples */}
                    <div className="pt-2 border-t border-[#181F48]/80 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">Try query:</span>
                      {domain.searchExamples.map((ex, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleRunExample(ex.promptText)}
                          className="px-3 py-1 rounded-full bg-[#111736] hover:bg-[#1C2556] border border-zinc-700/80 hover:border-indigo-500/60 text-xs text-indigo-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-mono"
                        >
                          <span>{ex.label}</span>
                          <ArrowRight className="size-3 text-indigo-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#1A2045] flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Screened Autonomous Intelligence</span>
              <button
                type="button"
                onClick={onClose}
                className="hover:text-slate-200 transition-colors cursor-pointer"
              >
                Press Esc to close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
