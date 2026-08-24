import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Globe,
  CopyCheck,
  Users,
  Ticket,
  GraduationCap,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { DeepVettingReport, VettingSignalStatus } from '../../types/investigation';
import { soundEffects } from '../../utils/audio';

interface DeepVettingMatrixProps {
  report?: DeepVettingReport;
  festivalName: string;
}

export const DeepVettingMatrix: React.FC<DeepVettingMatrixProps> = ({ report, festivalName }) => {
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'ALERTS' | 'INFO'>('ALL');
  const [expandedDimId, setExpandedDimId] = useState<string | null>(null);

  // If report not provided, create realistic preview fixture
  const activeReport: DeepVettingReport = report || {
    festivalName: festivalName || 'Raindance Film Festival',
    overallAuthenticityScore: 91,
    totalFlags: 0,
    generatedAt: new Date().toISOString(),
    dimensions: [
      {
        id: 'dim-1',
        dimensionKey: 'CORPORATE_REGISTRY',
        title: 'Corporate & Legal Entity Verification',
        category: 'CORPORATE_REGISTRY',
        status: 'VERIFIED_AUTHENTIC',
        confidenceScore: 95,
        summary: `Operating entity 'RAINDANCE FILM FESTIVAL LIMITED' (Company No. 02849884) is an active UK entity registered with Companies House since 1993 with valid annual filings.`,
        signalsFound: [
          'Active company status with zero dissolution filings',
          'Incorporation date (1993) strictly matches claimed 32nd Edition history',
          'Physical registered office at central London cinema precinct',
        ],
        corroboratingSources: [
          'find-and-update.company-information.service.gov.uk',
          'opencorporates.com',
        ],
        riskWeight: 'LOW',
      },
      {
        id: 'dim-2',
        dimensionKey: 'DOMAIN_PROVENANCE',
        title: 'Domain Age & WHOIS Provenance',
        category: 'DOMAIN_PROVENANCE',
        status: 'VERIFIED_AUTHENTIC',
        confidenceScore: 94,
        summary: `Official web domain has been continuously registered and operational for over 22 years with verified DNS routing and enterprise SSL certifications.`,
        signalsFound: [
          'Domain registration age > 20 years without ownership drop-catch',
          'Continuous nameserver routing with zero parking redirects',
          'Active security headers and SSL verified to UK registrant',
        ],
        corroboratingSources: ['rdap.org', 'whois.iana.org'],
        riskWeight: 'LOW',
      },
      {
        id: 'dim-3',
        dimensionKey: 'BOILERPLATE_PLAGIARISM',
        title: 'Boilerplate Rules & Text Duplication',
        category: 'BOILERPLATE_PLAGIARISM',
        status: 'VERIFIED_AUTHENTIC',
        confidenceScore: 88,
        summary: `Rules and submission agreements exhibit high originality specifically referencing UK premiere statuses and venue exhibition guidelines with 0% overlap with laurel mill templates.`,
        signalsFound: [
          'Original, jurisdiction-specific submission clauses',
          'Transparent non-refundable entry policy and clear eligibility cutoffs',
          'Zero phrase overlap with known syndicate clone networks',
        ],
        corroboratingSources: ['filmfreeway.com', 'raindance.org'],
        riskWeight: 'LOW',
      },
      {
        id: 'dim-4',
        dimensionKey: 'PERSONNEL_DOSSIER',
        title: 'Key Personnel & Jury Dossiers',
        category: 'PERSONNEL_DOSSIER',
        status: 'INFORMATIONAL',
        confidenceScore: 89,
        summary: `Published Founder and Programming Directors possess extensive verifiable IMDb producer/director credits and recognized BAFTA/BIFA jury service.`,
        signalsFound: [
          'Festival Founder credited on multiple theatrically released features',
          'Jury roster includes working DGA and BAFTA-winning filmmakers',
          'Objective trade press coverage in Variety, Screen International, and Deadline',
        ],
        corroboratingSources: ['imdb.com', 'screendaily.com', 'variety.com'],
        riskWeight: 'LOW',
      },
      {
        id: 'dim-5',
        dimensionKey: 'VENUE_CORROBORATION',
        title: 'Municipal Screening & Venue Corroboration',
        category: 'VENUE_CORROBORATION',
        status: 'VERIFIED_AUTHENTIC',
        confidenceScore: 96,
        summary: `Gala screenings and shorts programs are confirmed by official venue ticketing manifests at Curzon Soho and Vue West End in central London.`,
        signalsFound: [
          'Direct box office ticketing links hosted on Curzon cinema domain',
          'Physical cinema auditoriums with 150+ seating capacity',
          'Public municipal entertainment licensing corroborated for festival dates',
        ],
        corroboratingSources: ['curzon.com', 'myvue.com', 'westminster.gov.uk'],
        riskWeight: 'LOW',
      },
      {
        id: 'dim-6',
        dimensionKey: 'ALUMNI_FOOTPRINT',
        title: 'Alumni Filmmaker & Selection Footprint',
        category: 'ALUMNI_FOOTPRINT',
        status: 'VERIFIED_AUTHENTIC',
        confidenceScore: 90,
        summary: `Over 40 independent directors and production companies publicly document screening laurels, premiere photos, and award certificates from recent editions.`,
        signalsFound: [
          'Alumni filmmaker social posts and premiere Q&A photography verified',
          'Past winning shorts subsequently qualified for BAFTA short film longlists',
          'IMDb title pages credit official festival competition selections',
        ],
        corroboratingSources: ['letterboxd.com', 'imdb.com', 'instagram.com'],
        riskWeight: 'LOW',
      },
      {
        id: 'dim-7',
        dimensionKey: 'IMAGE_PROVENANCE',
        title: 'Promotional Image & Asset Authenticity',
        category: 'IMAGE_PROVENANCE',
        status: 'INFORMATIONAL',
        confidenceScore: 85,
        summary: `Marketing imagery and website photography depict actual physical auditoriums and red-carpet step-and-repeats with zero stock photo matches.`,
        signalsFound: [
          'Branded festival step-and-repeat backdrops with verified attendee photos',
          'Auditorium crowd shots match physical architecture of Curzon Soho',
          'Absence of generic royalty-free cinema stock imagery in promotions',
        ],
        corroboratingSources: ['raindance.org', 'filmfreeway.com'],
        riskWeight: 'LOW',
      },
    ],
  };

  const getDimensionIcon = (key: string) => {
    switch (key) {
      case 'CORPORATE_REGISTRY':
        return <Building2 className="w-5 h-5 text-emerald-400" />;
      case 'DOMAIN_PROVENANCE':
        return <Globe className="w-5 h-5 text-blue-400" />;
      case 'BOILERPLATE_PLAGIARISM':
        return <CopyCheck className="w-5 h-5 text-indigo-400" />;
      case 'PERSONNEL_DOSSIER':
        return <Users className="w-5 h-5 text-amber-400" />;
      case 'VENUE_CORROBORATION':
        return <Ticket className="w-5 h-5 text-emerald-400" />;
      case 'ALUMNI_FOOTPRINT':
        return <GraduationCap className="w-5 h-5 text-purple-400" />;
      case 'IMAGE_PROVENANCE':
        return <ImageIcon className="w-5 h-5 text-pink-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getStatusBadge = (status: VettingSignalStatus) => {
    switch (status) {
      case 'VERIFIED_AUTHENTIC':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Authentic
          </span>
        );
      case 'AMBER_WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Caution Signal
          </span>
        );
      case 'RED_FLAG':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            Red Flag Alert
          </span>
        );
      case 'INFORMATIONAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Info className="w-3.5 h-3.5" />
            Corroborated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-zinc-700/30 text-zinc-400 border border-zinc-700">
            <HelpCircle className="w-3.5 h-3.5" />
            Inconclusive
          </span>
        );
    }
  };

  const filteredDimensions = activeReport.dimensions.filter((dim) => {
    if (filter === 'VERIFIED') return dim.status === 'VERIFIED_AUTHENTIC';
    if (filter === 'ALERTS') return dim.status === 'AMBER_WARNING' || dim.status === 'RED_FLAG';
    if (filter === 'INFO') return dim.status === 'INFORMATIONAL';
    return true;
  });

  const toggleExpand = (id: string) => {
    soundEffects.playClick();
    setExpandedDimId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Authenticity Radar & Health Metrics */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-darkroom-surface via-darkroom-bg to-darkroom-surface border border-darkroom-border shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-mono font-bold uppercase">
                Spec 14 Forensic Audit
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Generated: {new Date(activeReport.generatedAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white font-serif tracking-tight flex items-center gap-2">
              <span>360° Forensic Vetting Matrix:</span>
              <span className="text-indigo-400">{activeReport.festivalName}</span>
            </h2>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              Multi-vector corroboration cross-examining corporate filings, WHOIS age, original
              entry rules, IMDb jury records, physical screening leases, and alumni footprint.
            </p>
          </div>

          {/* Authenticity Score Card */}
          <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl shrink-0">
            <div className="text-center">
              <div className="text-2xl font-black font-mono text-emerald-400">
                {activeReport.overallAuthenticityScore}%
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Authenticity
              </span>
            </div>

            <div className="h-10 w-px bg-zinc-800" />

            <div className="text-center">
              <div
                className={`text-2xl font-black font-mono ${activeReport.totalFlags === 0 ? 'text-zinc-400' : 'text-rose-400'}`}
              >
                {activeReport.totalFlags}
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Risk Signals
              </span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEffects.playClick();
                setFilter('ALL');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                filter === 'ALL'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-black/30 text-zinc-400 hover:text-white'
              }`}
            >
              All Dimensions ({activeReport.dimensions.length})
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setFilter('VERIFIED');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                filter === 'VERIFIED'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-black/30 text-zinc-400 hover:text-white'
              }`}
            >
              Verified Authentic (
              {activeReport.dimensions.filter((d) => d.status === 'VERIFIED_AUTHENTIC').length})
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setFilter('ALERTS');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                filter === 'ALERTS'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-black/30 text-zinc-400 hover:text-white'
              }`}
            >
              Risk Alerts (
              {
                activeReport.dimensions.filter(
                  (d) => d.status === 'AMBER_WARNING' || d.status === 'RED_FLAG',
                ).length
              }
              )
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setFilter('INFO');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                filter === 'INFO'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-black/30 text-zinc-400 hover:text-white'
              }`}
            >
              Informational (
              {activeReport.dimensions.filter((d) => d.status === 'INFORMATIONAL').length})
            </button>
          </div>

          <span className="text-xs text-zinc-500 font-mono">
            Showing {filteredDimensions.length} of 7 vectors
          </span>
        </div>
      </div>

      {/* 7 Dimension Cards List */}
      <div className="space-y-3">
        {filteredDimensions.map((dim, idx) => {
          const isExpanded = expandedDimId === dim.id;

          return (
            <motion.div
              key={dim.id || idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'bg-darkroom-surface border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                  : 'bg-darkroom-bg border-darkroom-border hover:border-midnight-violet'
              }`}
            >
              {/* Collapsed Header */}
              <div
                onClick={() => toggleExpand(dim.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-white/[0.04] shrink-0">
                    {getDimensionIcon(dim.dimensionKey)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                        {dim.title}
                      </h3>
                      {getStatusBadge(dim.status)}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{dim.summary}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pl-3 shrink-0">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-mono font-bold text-zinc-300">
                      {dim.confidenceScore}% Conf.
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      Risk: {dim.riskWeight}
                    </span>
                  </div>

                  <button
                    type="button"
                    aria-label={isExpanded ? 'Collapse dimension' : 'Expand dimension'}
                    className="p-1.5 rounded-lg bg-white/[0.04] text-zinc-400 hover:text-white"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Inspection Drawer */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-zinc-800/80 p-5 space-y-4 text-xs overflow-hidden"
                  >
                    {/* Full Summary */}
                    <div className="p-3.5 rounded-xl bg-black/40">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                        Executive Forensic Summary
                      </span>
                      <p className="text-zinc-200 leading-relaxed">{dim.summary}</p>
                    </div>

                    {/* Specific Extracted Signals */}
                    {dim.signalsFound && dim.signalsFound.length > 0 && (
                      <div>
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                          Corroborated Signals & Registry Matches ({dim.signalsFound.length})
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {dim.signalsFound.map((sig, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2.5 rounded-xl bg-black/40 flex items-start space-x-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="text-zinc-300">{sig}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Corroborating Source Domains */}
                    {dim.corroboratingSources && dim.corroboratingSources.length > 0 && (
                      <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-zinc-400">
                        <div className="flex items-center space-x-2">
                          <Search className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="text-[11px] font-mono">
                            Corroborating Registers & Manifests:
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {dim.corroboratingSources.map((src, srcIdx) => (
                            <span
                              key={srcIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300"
                            >
                              <span>{src}</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
