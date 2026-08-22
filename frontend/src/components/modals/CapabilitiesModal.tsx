import React, { useState } from 'react';
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
  CheckSquare,
  ArrowRight
} from 'lucide-react';
import { soundEffects } from '../../utils/audio';
import { TextLink } from '../ui/TextLink';

interface CapabilityCardData {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  description: string;
  capabilitiesList: string[];
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
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  if (typeof document === 'undefined') return null;

  const toggleExpand = (id: string) => {
    soundEffects.playClick();
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRunExample = (promptText: string) => {
    soundEffects.playSuccess();
    onClose();
    onSelectAction(promptText);
  };

  const capabilitiesData: CapabilityCardData[] = [
    {
      id: 'due-diligence',
      title: 'Festival Due Diligence & Credibility Vetting',
      badge: 'Due Diligence',
      badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      icon: Search,
      iconColor: 'text-emerald-400',
      description: 'Autonomous multi-agent background checks cross-examining municipal venue leases, corporate registry filings, and hidden fee structures.',
      capabilitiesList: [
        'Verifies physical cinema venue leases and municipal screening license records',
        'Cross-checks UK Companies House & national corporate registries for active entity status',
        'Audits historical entry fee escalation and refund / withdrawal policies',
        'Examines jury prestige and published industry credits across IMDb & festival archives',
        'Scans trade journals, filmmaker forums, and community scam reports for red flag alerts',
        'Verifies BAFTA, BIFA, and Academy Award qualifying accreditation status',
        'Cross-corroborates claimed screening schedules against municipal cinema box office listings'
      ],
      searchExamples: [
        { label: 'Vet Aberdeen Film Festival', promptText: 'Is Aberdeen Film Festival legitimate? Check their physical venue leases and entry fees.' },
        { label: 'Audit Aldergate Festival', promptText: 'Is Aldergate Film Festival legitimate or a scam? Check their screening leases.' },
        { label: 'Check Raindance credentials', promptText: 'Perform due diligence on Raindance Film Festival accreditation and venue scale.' }
      ]
    },
    {
      id: 'opportunity-scout',
      title: 'Opportunity Scout & Qualifying Strategy',
      badge: 'Opportunity Scout',
      badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
      icon: Compass,
      iconColor: 'text-rose-400',
      description: 'Autonomous submission calendar and strategy tailored to your film’s format, genre, runtime, budget tier, and premiere goals.',
      capabilitiesList: [
        'Matches optimal submission circuits based on genre, runtime, and budget tier',
        'Flags Early Bird submission discount deadlines to minimize festival expenditure',
        'Protects World, International, and Regional Premiere status eligibility',
        'Filters Tier-1 Academy Award and BAFTA-qualifying shorts and features festivals',
        'Generates downloadable .ics calendar deadlines for production coordination',
        'Recommends bespoke European & North American rollout roadmaps'
      ],
      searchExamples: [
        { label: 'Sci-Fi Short Strategy', promptText: 'Where should I submit my 15-minute sci-fi short film looking for a UK premiere on a £300 budget?' },
        { label: 'Feature Doc Rollout', promptText: 'Recommend a festival premiere strategy for an 80-minute independent documentary.' },
        { label: 'Early Bird Deadlines', promptText: 'Find upcoming Early Bird submission deadlines under £40 for indie shorts.' }
      ]
    },
    {
      id: 'grant-scout',
      title: 'Film Grants, Match Funding & Public Schemes',
      badge: 'Public Grants & Funds',
      badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
      icon: Coins,
      iconColor: 'text-blue-400',
      description: 'Scouts public film funding opportunities, development grants, and regional match funding with eligibility criteria.',
      capabilitiesList: [
        'Matches BFI Filmmaking Fund, Screen Scotland, and regional UK lottery grant windows',
        'Identifies European co-production and Eurimages match funding criteria',
        'Screens early-stage script development grants and documentary production funds',
        'Checks submission deadlines, co-funding ratios, and producer eligibility rules',
        'Extracts funding caps, match percentages, and non-dilutive grant awards'
      ],
      searchExamples: [
        { label: 'UK Doc Production Grants', promptText: 'Find £25k documentary production grants and public funding schemes in the UK.' },
        { label: 'Script Development Funds', promptText: 'Show active early-stage development grants and script development funds for indie filmmakers.' },
        { label: 'BFI Filmmaking Fund', promptText: 'What are the upcoming deadlines and criteria for the BFI Filmmaking Fund?' }
      ]
    },
    {
      id: 'invitation-audit',
      title: 'Invitation Email & Laurel Mill Verification',
      badge: 'Email & Laurel Audit',
      badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
      icon: MailWarning,
      iconColor: 'text-amber-400',
      description: 'Analyzes unsolicited festival invitations, 50% waiver codes, and award notices to protect filmmakers from laurel mills and trophy fees.',
      capabilitiesList: [
        'Analyzes email provenance, sender domain age, and SPF/DKIM authentication',
        'Detects laurel mill boilerplates and unsolicited bulk filmmaker outreach templates',
        'Flags hidden trophy, statue, certificate, and gala ticket fees',
        'Verifies whether the festival actually screens films in public cinema theaters',
        'Identifies phantom online-only award schemes designed exclusively to extract fees'
      ],
      searchExamples: [
        { label: 'Analyze Waiver Email', promptText: 'Analyze this festival invitation email offering a 50% waiver code for red flags.' },
        { label: 'Verify Trophy Fees', promptText: 'Is it standard practice for a film festival to charge £120 for a physical trophy and laurel?' },
        { label: 'Check Sender Domain', promptText: 'Perform forensic domain checks on submissions-indie-cinema.net.' }
      ]
    },
    {
      id: 'compare-arena',
      title: 'Head-to-Head Festival Comparison Arena',
      badge: 'Comparison Arena',
      badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
      icon: GitCompare,
      iconColor: 'text-purple-400',
      description: 'Direct side-by-side assessment of two candidate festivals across prestige, submission cost ROI, and industry visibility.',
      capabilitiesList: [
        'Compares BAFTA / BIFA / Oscar accreditation prestige between two circuits',
        'Evaluates screening venue capacity (West End cinema vs local community hall)',
        'Analyzes acceptance rate competitiveness and press / buyer attendance density',
        'Calculates fee-to-prestige ROI score for targeted budget allocation'
      ],
      searchExamples: [
        { label: 'Raindance vs LIFF', promptText: 'Compare Raindance vs London Independent Film Festival across accreditation and ROI.' },
        { label: 'Edinburgh vs Leeds', promptText: 'Compare Edinburgh International Film Festival vs Leeds International Film Festival.' }
      ]
    },
    {
      id: 'deep-vetting-matrix',
      title: '360° Forensic Deep Vetting Matrix',
      badge: '7-Dimension Forensic Matrix',
      badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      description: 'Comprehensive 7-dimension forensic audit investigating corporate registry, WHOIS age, plagiarism, jury dossier, venue, alumni footprint, and image authenticity.',
      capabilitiesList: [
        'Corporate Registry: Companies House status, incorporation date, active officer disclosures',
        'Domain Provenance: WHOIS registrar, domain creation age, DNS authenticity',
        'Boilerplate Plagiarism: Text fingerprinting against known laurel mill rules and terms',
        'Key Personnel Dossier: Objective IMDb credits, trade press mentions, and industry track records',
        'Venue Corroboration: Physical cinema lease manifests, box office schedules, municipal licenses',
        'Alumni Footprint: Past selected filmmakers, verified premiere histories, distributor acquisitions',
        'Image Provenance: Real venue photography verification vs stock image reverse matches'
      ],
      searchExamples: [
        { label: '360° Audit on Raindance', promptText: 'Perform full 360° forensic matrix audit on Raindance Film Festival across all 7 dimensions.' },
        { label: 'Deep Vetting on Unknown Festival', promptText: 'Run deep vetting investigation on a newly registered international indie festival.' }
      ]
    }
  ];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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
            className="relative w-full max-w-4xl bg-void border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-6 max-h-[88vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-midnight/90 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-5 h-5 animate-soft-twinkle" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-serif tracking-tight">What Can You Search?</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Autonomous cinema due diligence, opportunity scouting, and grant discovery capabilities.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onClose();
                }}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/60 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stacked Cards Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {capabilitiesData.map((card) => {
                const IconComponent = card.icon;
                const isExpanded = !!expandedCards[card.id];
                const visibleCapabilities = isExpanded 
                  ? card.capabilitiesList 
                  : card.capabilitiesList.slice(0, 3);
                const hasMore = card.capabilitiesList.length > 3;

                return (
                  <div
                    key={card.id}
                    className="p-5 rounded-2xl bg-card/80 border border-zinc-800/90 hover:border-zinc-700/80 transition-all shadow-sm space-y-4"
                  >
                    {/* Card Top Title & Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-zinc-900 border border-zinc-800 ${card.iconColor}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-zinc-100 font-serif">{card.title}</h3>
                          <p className="text-xs text-zinc-400 mt-0.5">{card.description}</p>
                        </div>
                      </div>
                      <span className={`self-start sm:self-center px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium border ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                    </div>

                    {/* Capabilities Checklist */}
                    <div className="pt-2 border-t border-zinc-850/80 space-y-2">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                        Actions & Investigations Performed:
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {visibleCapabilities.map((capItem, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            <span className="leading-relaxed">{capItem}</span>
                          </div>
                        ))}
                      </div>

                      {/* View More / View Less Toggle */}
                      {hasMore && (
                        <div className="pt-1">
                          <TextLink
                            variant="muted"
                            size="xs"
                            iconType="chevron-down"
                            animatedIconContinuous
                            asButton
                            onActionClick={() => toggleExpand(card.id)}
                          >
                            {isExpanded 
                              ? 'View less' 
                              : `View more (+${card.capabilitiesList.length - 3} actions)`}
                          </TextLink>
                        </div>
                      )}
                    </div>

                    {/* 1-Click Search Examples */}
                    <div className="pt-2 border-t border-zinc-850/80 space-y-2">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Search Examples (Click to Run):</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {card.searchExamples.map((ex, exIdx) => (
                          <button
                            key={exIdx}
                            type="button"
                            onClick={() => handleRunExample(ex.promptText)}
                            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-midnight/90 hover:bg-[#2018E6] border border-zinc-800 hover:border-indigo-400 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                          >
                            <span>{ex.label}</span>
                            <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Note */}
            <div className="px-6 py-3.5 border-t border-zinc-800 bg-midnight/90 text-xs text-zinc-400 flex items-center justify-between shrink-0 font-mono">
              <span>Tip: Drop any script PDF or invitation email directly into The Desk.</span>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  onClose();
                }}
                className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
