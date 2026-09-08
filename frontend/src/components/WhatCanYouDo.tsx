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
    <div className="max-w-6xl mx-auto space-y-12 py-4 px-2 sm:px-4 text-slate-100 select-none animate-fade-in">
      {/* Header Banner */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tool-diligence/10 border-2 border-tool-diligence/40 text-tool-diligence text-xs font-mono font-bold tracking-wide">
          <Sparkles className="size-3.5" />
          <span>CAPABILITIES &amp; ROADMAP</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          What Can Screened Do?
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Screened is an autonomous intelligence platform built to protect independent filmmakers from deceptive circuits, fee harvesting, and predatory distribution.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onNavigateToDiligence && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onNavigateToDiligence();
              }}
              className="px-5 py-2.5 rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition-all shadow-lg shadow-[var(--color-tool-diligence)]/20 cursor-pointer active:scale-95"
            >
              <ShieldCheck className="size-4" />
              <span>Launch Festival Due Diligence</span>
            </button>
          )}

          {onNavigateToDesk && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onNavigateToDesk();
              }}
              className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="size-4 text-indigo-400" />
              <span>Consult Screened AI Desk</span>
            </button>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: AUTONOMOUS FESTIVAL DUE DILIGENCE ENGINE */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 pb-2">
          <div className="p-2.5 rounded-2xl bg-tool-diligence/15 border-2 border-tool-diligence/30 text-tool-diligence">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
              1. The Autonomous Due Diligence Engine
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              5-stage forensic pipeline executing multi-domain corroboration across thousands of sources
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Thickbox 1: Disambiguation */}
          <div className="rounded-2xl bg-white/[0.02] p-5 sm:p-6 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 border-2 border-indigo-500/40 text-indigo-300">
                  <Search className="size-4" />
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Stage 01
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-white">
                Disambiguation &amp; Entity Resolution
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Identifies the exact legal and promotional entity behind any festival name across 15,000+ global events.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-300 font-sans">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Resolves official domains, organizer corporate names, and aliases</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Detects trademark copycats, cloned names, and spoofed websites</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Pinpoints geographical headquarters vs. claimed screening cities</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Thickbox 2: Parallel Search */}
          <div className="rounded-2xl bg-white/[0.02] p-5 sm:p-6 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-500/20 border-2 border-blue-500/40 text-blue-300">
                  <Layers className="size-4" />
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  Stage 02
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-white">
                4-Pillar Parallel Domain Search
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Simultaneously crawls and indexes intelligence across independent verification vectors.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-300 font-sans">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                  <span><strong>Trade Press:</strong> Variety, Screen Daily, Deadline festival reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                  <span><strong>Filings:</strong> UK Companies House, IRS 990-EZ &amp; non-profit filings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                  <span><strong>Venues:</strong> Physical box office manifests &amp; indie cinema leases</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                  <span><strong>Filmmakers:</strong> Reddit r/Filmmakers, FilmFreeway forums, Letterboxd</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Thickbox 3: Claim Extraction */}
          <div className="rounded-2xl bg-white/[0.02] p-5 sm:p-6 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-amber-500/20 border-2 border-amber-500/40 text-amber-300">
                  <FileCheck2 className="size-4" />
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Stage 03
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-white">
                Atomic Claim Extraction
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deconstructs raw textual findings into discrete, verifiable atomic assertions with full provenance.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-300 font-sans">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Categorizes statements into <strong>FACT</strong>, <strong>ALLEGATION</strong>, or <strong>OPINION</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Assigns confidence scores and temporal edition years to every signal</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Preserves exact snippet citations and direct URL references</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Thickbox 4: Contradiction Analysis */}
          <div className="rounded-2xl bg-white/[0.02] p-5 sm:p-6 transition-all flex flex-col justify-between space-y-4 md:col-span-2 lg:col-span-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-rose-500/20 border-2 border-rose-500/40 text-rose-300">
                  <AlertTriangle className="size-4" />
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  Stage 04
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-white">
                Contradiction Analysis &amp; Forensic Risk Index
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rigorous cross-examination comparing promoter marketing against verified physical reality to calculate risk.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300 font-sans">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                    <span><strong>Venue Corroboration:</strong> Flags claimed cinemas that have no physical booking manifests</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                    <span><strong>Fee Escalation:</strong> Detects steep entry fee hikes without transparent cash awards</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                    <span><strong>Conflict of Interest:</strong> Identifies jury members selling paid services to entrants</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                    <span><strong>Prestige Integrity:</strong> Audits BAFTA/Oscar eligibility claims against official academy lists</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thickbox 5: Cryptographic Hash */}
          <div className="rounded-2xl bg-white/[0.02] p-5 sm:p-6 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-purple-500/20 border-2 border-purple-500/40 text-purple-300">
                  <Fingerprint className="size-4" />
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Stage 05
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-white">
                Cryptographic SHA-256 Audit Trail
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Guarantees complete immutability so dossiers can be verified offline and submitted to festivals or peer disputes.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-300 font-sans">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Deterministic SHA-256 checksum over all claims &amp; sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Tamper-evident verification status readable without cloud access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-tool-diligence shrink-0 mt-0.5" />
                  <span>Exportable as signed JSON, official PDF, or printable evidence brief</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: UPCOMING CINEMA INTELLIGENCE TOOLS */}
      {/* ========================================================================= */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center gap-3 pb-2">
          <div className="p-2.5 rounded-2xl bg-indigo-500/15 border-2 border-indigo-500/30 text-indigo-400">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
              2. Upcoming Cinema Intelligence Tools
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Specialized forensic suites in active development on our filmmaker engineering roadmap
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Tool A: Grant Scout */}
          <div className="rounded-3xl bg-white/[0.02] p-6 sm:p-7 space-y-4 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-300 shrink-0">
                  <Coins className="size-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Grant Scout &amp; Public Funds Match
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-400">
                    Institutional Funding Intelligence
                  </span>
                </div>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-300">
                IN PROGRESS
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Autonomous matching against 200+ global public film funds, grants, and soft money subsidies tailored to your project’s budget tier and format.
            </p>

            <div className="p-4 rounded-xl bg-white/[0.02] space-y-2 text-xs font-sans text-slate-300">
              <div className="font-semibold text-emerald-300 font-mono uppercase text-[11px] tracking-wider">
                Key Capabilities:
              </div>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Direct integration with BFI Filmmaking Fund, Eurimages, Sundance Institute, Telefilm</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Automated eligibility check: director nationality, local spend ratio, co-production treaties</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Deadline radar with automated notification alerts for submission windows</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Tool B: Sales Agent Forensics */}
          <div className="rounded-3xl bg-white/[0.02] p-6 sm:p-7 space-y-4 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/20 border-2 border-blue-500/50 text-blue-300 shrink-0">
                  <Briefcase className="size-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Sales Agent &amp; Distributor Forensics
                  </h3>
                  <span className="text-[11px] font-mono text-blue-400">
                    Distribution Contract &amp; Track Record Vetting
                  </span>
                </div>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-blue-500/20 border-2 border-blue-500/40 text-blue-300">
                PLANNED
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Background checks on international sales agents and acquisition executives before signing away international exploitation rights.
            </p>

            <div className="p-4 rounded-xl bg-white/[0.02] space-y-2 text-xs font-sans text-slate-300">
              <div className="font-semibold text-blue-300 font-mono uppercase text-[11px] tracking-wider">
                Key Capabilities:
              </div>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>Minimum Guarantee (MG) terms transparency and market cap verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>Uncapped market expense auditor (preventing inflated AFM/Cannes delivery costs)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>Filmmaker community payout rating and accounting dispute tracker</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Tool C: Invitation & Laurel Auditor */}
          <div className="rounded-3xl bg-white/[0.02] p-6 sm:p-7 space-y-4 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 text-amber-300 shrink-0">
                  <MailWarning className="size-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Invitation &amp; Laurel Auditor
                  </h3>
                  <span className="text-[11px] font-mono text-amber-400">
                    Phishing &amp; Laurel Mill Defense
                  </span>
                </div>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/20 border-2 border-amber-500/40 text-amber-300">
                EARLY ACCESS
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Instant scan of cold outreach emails and unsolicited waivers to catch fake laurel mills and statue fee traps before you reply.
            </p>

            <div className="p-4 rounded-xl bg-white/[0.02] space-y-2 text-xs font-sans text-slate-300">
              <div className="font-semibold text-amber-300 font-mono uppercase text-[11px] tracking-wider">
                Key Capabilities:
              </div>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Sender domain WHOIS forensics and spam campaign cross-checking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Trophy fee trap detection (e.g. £150 charge to claim physical awards)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Fake waiver detection (offering free submission to charge subsequent marketing fees)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Tool D: Production Tax Credit Calculator */}
          <div className="rounded-3xl bg-white/[0.02] p-6 sm:p-7 space-y-4 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/20 border-2 border-purple-500/50 text-purple-300 shrink-0">
                  <Calculator className="size-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Production Tax Credit Calculator
                  </h3>
                  <span className="text-[11px] font-mono text-purple-400">
                    Jurisdiction Incentive Optimization
                  </span>
                </div>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/20 border-2 border-purple-500/40 text-purple-300">
                RESEARCH
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Compare effective net rebates across UK Audio-Visual Expenditure Credit (AVEC), Georgia, Canada, and European tax credit regimes.
            </p>

            <div className="p-4 rounded-xl bg-white/[0.02] space-y-2 text-xs font-sans text-slate-300">
              <div className="font-semibold text-purple-300 font-mono uppercase text-[11px] tracking-wider">
                Key Capabilities:
              </div>
              <ul className="space-y-1.5">
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
                  <span>Co-production treaty split scenarios to maximize total non-recoupable soft money</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="rounded-3xl bg-white/[0.02] p-8 text-center space-y-4">
        <h3 className="font-serif text-2xl font-bold text-white">
          Ready to Vet Your First Festival?
        </h3>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Enter any festival name to generate an immutable, multi-domain forensic due diligence dossier in seconds.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          {onNavigateToDiligence && (
            <button
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
  );
};
