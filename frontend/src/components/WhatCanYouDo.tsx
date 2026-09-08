import React from 'react';
import {
  ShieldCheck,
  Search,
  FileCheck2,
  AlertTriangle,
  Fingerprint,
  Coins,
  Briefcase,
  MailWarning,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Sparkle,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface WhatCanYouDoProps {
  onNavigateToDiligence?: () => void;
  onNavigateToDesk?: () => void;
}

export const WhatCanYouDo: React.FC<WhatCanYouDoProps> = ({
  onNavigateToDiligence,
  onNavigateToDesk,
}) => {
  return (
    <div className="relative w-full min-h-screen text-slate-100 px-4 py-12 sm:py-20 animate-fade-in overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto space-y-16 sm:space-y-20">
        {/* Editorial Header */}
        <section className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tool-diligence/10 border border-tool-diligence/30 text-tool-diligence text-xs font-mono font-semibold uppercase tracking-widest">
            <Sparkles className="size-3.5" />
            <span>Platform Capabilities &amp; Roadmap</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            What Can Screened Do?
          </h1>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-3xl mx-auto font-normal">
            Screened is an autonomous intelligence platform engineered to protect independent filmmakers from deceptive circuits, fee harvesting, and unverified theatrical claims.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onNavigateToDiligence && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onNavigateToDiligence();
                }}
                className="px-5 py-2.5 rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition-all shadow-lg shadow-[var(--color-tool-diligence)]/20 cursor-pointer active:scale-95"
              >
                <ShieldCheck className="size-4" />
                <span>Launch Due Diligence</span>
              </button>
            )}

            {onNavigateToDesk && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onNavigateToDesk();
                }}
                className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkle className="size-4 text-indigo-400" />
                <span>Consult Screened AI Chat</span>
              </button>
            )}
          </div>
        </section>

        {/* Section 1: Autonomous Due Diligence Engine */}
        <section className="space-y-8 sm:space-y-10">
          <div className="text-center space-y-2">
            <span className="text-slate-400 font-mono uppercase tracking-widest text-xs font-semibold">
              Core Intelligence Pipeline
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              The 5-Stage Autonomous Vetting Engine
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
              Automated multi-domain corroboration cross-examining marketing literature against primary corporate filings, box office schedules, and trade manifests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stage 1 */}
            <div className="rounded-2xl p-5 sm:p-6 bg-white/[0.02] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Search className="size-5" />
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    Stage 01
                  </span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Disambiguation &amp; Entity Resolution
                </h3>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  Identifies the exact legal and promotional entity behind any festival name across 15,000+ global circuits to prevent trademark spoofing.
                </p>
              </div>

              <ul className="space-y-2 pt-2 text-sm text-slate-300 font-sans border-t border-white/[0.06]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Resolves official domains, organizer corporate names, and aliases</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Detects trademark copycats and cloned festival domains</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Pinpoints official headquarters vs. claimed screening cities</span>
                </li>
              </ul>
            </div>

            {/* Stage 2 */}
            <div className="rounded-2xl p-5 sm:p-6 bg-white/[0.02] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                    <Layers className="size-5" />
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/30">
                    Stage 02
                  </span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                  4-Pillar Parallel Domain Search
                </h3>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  Simultaneously queries and indexes intelligence across isolated verification vectors using the high-precision Parallel Search engine.
                </p>
              </div>

              <ul className="space-y-2 pt-2 text-sm text-slate-300 font-sans border-t border-white/[0.06]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <span><strong>Trade Press:</strong> Variety, Screen Daily, Deadline festival reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <span><strong>Filings:</strong> UK Companies House, IRS 990-EZ non-profit filings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <span><strong>Venues:</strong> Box office manifests &amp; verified indie cinema leases</span>
                </li>
              </ul>
            </div>

            {/* Stage 3 */}
            <div className="rounded-2xl p-5 sm:p-6 bg-white/[0.02] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                    <FileCheck2 className="size-5" />
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Stage 03
                  </span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Atomic Claim Extraction
                </h3>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  Deconstructs unstructured web text into discrete, isolated atomic claims mapped directly to source URLs and cryptographic hashes.
                </p>
              </div>

              <ul className="space-y-2 pt-2 text-sm text-slate-300 font-sans border-t border-white/[0.06]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Categorizes statements into <strong>FACT</strong>, <strong>ALLEGATION</strong>, or <strong>OPINION</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Assigns confidence scores and temporal edition dates to every statement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Preserves exact quoted substrings with full source tier metadata</span>
                </li>
              </ul>
            </div>

            {/* Stage 4 */}
            <div className="rounded-2xl p-5 sm:p-6 bg-white/[0.02] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                    <AlertTriangle className="size-5" />
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30">
                    Stage 04
                  </span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Contradiction Analysis &amp; Risk Scoring
                </h3>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  Rigorous cross-examination comparing festival promoter marketing against physical reality to isolate red flags.
                </p>
              </div>

              <ul className="space-y-2 pt-2 text-sm text-slate-300 font-sans border-t border-white/[0.06]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <span><strong>Venue Corroboration:</strong> Flags advertised cinemas with no manifest records</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <span><strong>Fee Escalation:</strong> Detects sharp entry fee surges without cash awards</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <span><strong>Prestige Integrity:</strong> Audits BAFTA/BIFA claims against official directories</span>
                </li>
              </ul>
            </div>

            {/* Stage 5: Full Width */}
            <div className="rounded-2xl p-5 sm:p-6 bg-white/[0.02] space-y-4 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                    <Fingerprint className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                      Stage 05: Cryptographic SHA-256 Audit Trail
                    </h3>
                    <p className="text-xs font-mono text-purple-300 mt-0.5">
                      Immutable Evidence Ledger &amp; Offline Integrity
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold self-start sm:self-auto">
                  Deterministic Hash
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                Guarantees complete immutability so dossiers can be verified independently offline, submitted to festivals during fee disputes, or cited in institutional grant appeals.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm text-slate-300 font-sans border-t border-white/[0.06]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Deterministic SHA-256 over all claims</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Tamper-evident verification without cloud lock-in</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Signed JSON-LD &amp; printable PDF export</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Roadmap & Upcoming Tools */}
        <section className="space-y-8 sm:space-y-10">
          <div className="text-center space-y-2">
            <span className="text-slate-400 font-mono uppercase tracking-widest text-xs font-semibold">
              Ecosystem Roadmap
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Upcoming Cinema Intelligence Tools
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
              Specialized forensic suites in active development on our filmmaker protection engineering roadmap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tool 1 */}
            <div className="rounded-2xl p-5 sm:p-6 bg-white/[0.02] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Coins className="size-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 uppercase tracking-wider">
                    In Progress
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                    Grant Scout &amp; Public Funds Match
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-300 font-mono mt-0.5">
                    Institutional Public Funding Intelligence
                  </p>
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  Autonomous matching against 200+ global public film funds, national lotteries (BFI, Eurimages, Sundance Institute, Telefilm) tailored to your project format and budget tier.
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Key Capabilities:
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-tool-diligence font-bold">•</span>
                    <span>Direct integration with BFI Filmmaking Fund &amp; regional lotteries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tool-diligence font-bold">•</span>
                    <span>Automated eligibility check for co-production treaties &amp; spend ratios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-tool-diligence font-bold">•</span>
                    <span>Deadline radar with calendar exports and submission packaging checklists</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tool 2 */}
            <div className="rounded-2xl p-5 sm:p-6 bg-white/[0.02] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                    <Briefcase className="size-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 uppercase tracking-wider">
                    Planned
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                    Sales Agent &amp; Distributor Forensics
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-300 font-mono mt-0.5">
                    Distribution Contract &amp; Track Record Vetting
                  </p>
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  Background audits on international sales companies and acquisition executives before signing away international exploitation rights.
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Key Capabilities:
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>Minimum Guarantee (MG) terms transparency and market cap verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>Uncapped market expense auditor to prevent inflated delivery overheads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>Filmmaker community payout rating and accounting dispute tracker</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tool 3 */}
            <div className="rounded-2xl p-5 sm:p-6 bg-white/[0.02] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                    <MailWarning className="size-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 uppercase tracking-wider">
                    Early Access
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                    Invitation &amp; Laurel Auditor
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-300 font-mono mt-0.5">
                    Phishing &amp; Trophy Fee Defense
                  </p>
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  Instant scan of cold outreach emails and unsolicited waivers to catch fake laurel mills and statue fee traps before you reply.
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Key Capabilities:
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>Sender domain WHOIS forensics and spam campaign cross-checking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>Trophy fee trap detection (£150+ charges to claim physical awards)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>Fake waiver detection offering free entry followed by paid laurel tiers</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tool 4 */}
            <div className="rounded-2xl p-5 sm:p-6 bg-white/[0.02] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                    <Calculator className="size-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 uppercase tracking-wider">
                    Research
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                    Production Tax Credit Calculator
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-300 font-mono mt-0.5">
                    Jurisdiction Incentive Optimization
                  </p>
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  Compare effective net rebates across UK Audio-Visual Expenditure Credit (AVEC), Georgia, Canada, and European tax incentive regimes.
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Key Capabilities:
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">•</span>
                    <span>Direct calculation of qualified production expenditures (QPE)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">•</span>
                    <span>Cultural test score assessment (BFI &amp; European points tests)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">•</span>
                    <span>Co-production treaty split scenarios to maximize soft money</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Call to Action */}
        <section className="rounded-3xl p-8 sm:p-10 bg-white/[0.02] border border-white/10 text-center space-y-5">
          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Ready to Vet Your Next Festival?
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Enter any film festival name to generate an immutable, multi-domain forensic due diligence dossier in under 90 seconds.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            {onNavigateToDiligence && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onNavigateToDiligence();
                }}
                className="px-6 py-3 rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover text-slate-950 font-bold text-sm font-mono flex items-center gap-2 transition-all shadow-lg shadow-[var(--color-tool-diligence)]/25 cursor-pointer active:scale-95"
              >
                <span>Start Due Diligence Now</span>
                <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
