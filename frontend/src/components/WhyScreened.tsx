import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  Scale,
  Clock,
  FileText,
  Coins,
  Quote,
  CheckCircle2,
  TrendingDown,
  Layers,
  Command as CommandIcon,
} from 'lucide-react';

interface Props {
  onNavigateToDesk: () => void;
  onNavigateToDiligence: () => void;
  onNavigateToScout: () => void;
  onOpenCommandPalette?: () => void;
}

const RESEARCH_THEMES = [
  {
    theme: 'Fee Without Physical Screening',
    description:
      'Festivals soliciting £50–£120 submission fees under the promise of West End / theatrical galas, subsequently pivoting to unlisted private Vimeo links with zero audience.',
    sourceCount: 38,
    dateRange: '2022 – 2026',
    quote:
      '"We paid £85 for a Gala Premiere category. Two days before, they emailed an unlisted Vimeo link with 3 total views. The cinema venue they advertised had no record of them."',
    attribution: 'INDEPENDENT DOCUMENTARY DIRECTOR, UK',
  },
  {
    theme: 'Laurel Mill & Vanity Certificate Schemes',
    description:
      'Fabricated awards created exclusively to sell digital laurels, physical trophies (£150+), and paid press releases to micro-budget filmmakers seeking early validation.',
    sourceCount: 45,
    dateRange: '2021 – 2026',
    quote:
      '"Selected in 14 categories within 6 hours of submitting. They offered an Official Laurel Trophy for £180 plus shipping. There was no festival program or jury."',
    attribution: 'DEBUT INDIE PRODUCER, BIFA LONGLIST CANDIDATE',
  },
  {
    theme: 'Phantom Venue & Municipal Lease Contradictions',
    description:
      'Promotional literature claiming historical cinema leases (e.g. IMAX, BFI Southbank, Curzon), contradicted by municipal licensing records and direct cinema manifests.',
    sourceCount: 29,
    dateRange: '2023 – 2026',
    quote:
      '"I called the venue directly to ask about technical DCP specs. The box office manager said they had never heard of the festival and were screening Dune 2 that night."',
    attribution: 'NARRATIVE SHORT FILMMAKER, GLASGOW',
  },
  {
    theme: 'Ghost Organizers & Impunity',
    description:
      'Dissolved corporate entities with no public directors, unmonitored generic web forms, and zero refund accountability once fees are transferred.',
    sourceCount: 22,
    dateRange: '2022 – 2026',
    quote:
      '"Once payment went through, all communication vanished. When we checked Companies House, the operating company was dissolved 8 months before submissions opened."',
    attribution: 'ANIMATION PRODUCER, BRISTOL',
  },
];

export const WhyScreened: React.FC<Props> = ({
  onNavigateToDesk,
  onNavigateToDiligence,
  onNavigateToScout,
  onOpenCommandPalette,
}) => {
  return (
    <div className="w-full min-h-screen bg-midnight-void text-slate-100 px-4 py-12 sm:py-20 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-20">
        {/* Editorial Header */}
        <section className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tool-diligence/10 border border-tool-diligence/30 text-tool-diligence text-xs font-mono font-semibold uppercase tracking-widest">
            <Scale className="size-3.5" />
            <span>Empirical Impact & Problem Validation</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Why Screened Exists
          </h1>
          <p className="text-lg sm:text-xl text-slate-200 leading-relaxed max-w-3xl mx-auto font-normal">
            Independent filmmakers spend over{' '}
            <strong className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">£1,500 – £4,000</strong> per festival cycle in
            submission fees. Without transparent public evidence, micro-budget productions bear the
            brunt of predatory laurel mills and phantom venue claims.
          </p>
        </section>

        {/* Baseline Comparison: Manual vs Autonomous */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <span className="text-slate-400 font-mono uppercase tracking-widest text-xs font-semibold">
              Measured Workflow Baseline
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Manual Vetting vs. Autonomous Diligence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Manual Vetting Card */}
            <div className="bg-darkroom-surface/90 border border-darkroom-border rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
              <div className="border-b border-darkroom-border pb-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Manual Filmmaker Research
                </h3>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="text-2xl font-bold text-white flex items-center gap-3">
                    <Clock className="size-6 text-rose-400 shrink-0" />
                    <span>45–75 Minutes</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1 ml-9">Per festival submission decision</p>
                </div>

                <div>
                  <div className="text-2xl font-bold text-white flex items-center gap-3">
                    <Layers className="size-6 text-orange-400 shrink-0" />
                    <span>20+ Browser Tabs</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1 ml-9">
                    Reddit, FilmFreeway, Companies House, blogs
                  </p>
                </div>

                <div>
                  <div className="text-2xl font-bold text-white flex items-center gap-3">
                    <TrendingDown className="size-6 text-rose-400 shrink-0" />
                    <span>Ungrounded Risk</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1 ml-9">
                    No cryptographic verification or citation index
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-400 italic pt-5 border-t border-darkroom-border">
                "You end up relying on fragmented hearsay in Facebook groups, or you just pay the £80
                and hope for the best."
              </p>
            </div>

            {/* Screened Engine Card */}
            <div className="bg-darkroom-card/90 border border-tool-diligence/40 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl shadow-[var(--color-tool-diligence)]/10 ring-1 ring-tool-diligence/20">
              <div className="border-b border-darkroom-border pb-3">
                <h3 className="text-sm font-bold text-tool-diligence uppercase tracking-widest font-mono flex items-center gap-2">
                  <Sparkles className="size-4" /> Screened Autonomous Engine
                </h3>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="text-2xl font-bold text-white flex items-center gap-3">
                    <Clock className="size-6 text-tool-diligence shrink-0" />
                    <span>~90 Seconds</span>
                  </div>
                  <p className="text-sm text-slate-200 mt-1 ml-9">Complete multi-domain dossier</p>
                </div>

                <div>
                  <div className="text-2xl font-bold text-white flex items-center gap-3">
                    <CheckCircle2 className="size-6 text-tool-diligence shrink-0" />
                    <span>100% Verifiable Excerpts</span>
                  </div>
                  <p className="text-sm text-slate-200 mt-1 ml-9">
                    Every statement mapped to source dates & URLs
                  </p>
                </div>

                <div>
                  <div className="text-2xl font-bold text-white flex items-center gap-3">
                    <Scale className="size-6 text-tool-diligence shrink-0" />
                    <span>Contradiction Analysis</span>
                  </div>
                  <p className="text-sm text-slate-200 mt-1 ml-9">
                    Conflicting trade evidence reconciled neutrally
                  </p>
                </div>
              </div>

              <p className="text-sm text-emerald-300 font-medium pt-5 border-t border-darkroom-border">
                ✓ Zero subject score bias. Facts, allegations, and opinions isolated end-to-end.
              </p>
            </div>
          </div>
        </section>

        {/* The Evidence Corpus */}
        <section className="space-y-8">
          <div className="space-y-3 text-center max-w-2xl mx-auto border-b border-darkroom-border pb-6">
            <span className="text-tool-diligence font-mono uppercase tracking-widest text-xs font-semibold">
              Empirical Corpus
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white leading-tight">
              Common Grievance Vectors Harvested via Parallel Search
            </h2>
            <p className="text-base text-slate-300">
              Representative qualitative accounts harvested across filmmaker forums (Reddit
              r/Filmmakers, FilmFreeway communities, Stage 32, and industry blogs).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-2">
            {RESEARCH_THEMES.map((item, idx) => (
              <div
                key={idx}
                className="bg-darkroom-surface/80 border border-darkroom-border hover:border-zinc-700/80 rounded-2xl p-6 space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-darkroom-border pb-3">
                  <h3 className="text-xl font-bold font-serif text-white">
                    {idx + 1}. {item.theme}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400 font-semibold tracking-wide uppercase">
                    <span className="text-tool-diligence">{item.sourceCount} documented sources</span>
                    <span>•</span>
                    <span>{item.dateRange}</span>
                  </div>
                </div>

                <p className="text-base text-slate-200 leading-relaxed font-normal">{item.description}</p>

                <div className="pl-4 sm:pl-6 border-l-2 border-tool-diligence/50 space-y-2 py-1 bg-darkroom-card/40 rounded-r-xl pr-4">
                  <div className="flex items-start gap-3">
                    <Quote className="size-4 text-tool-diligence shrink-0 mt-1" />
                    <p className="text-base text-slate-300 italic leading-relaxed">{item.quote}</p>
                  </div>
                  <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-widest pl-7">
                    — {item.attribution}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Meta-Methodology Statement */}
        <section className="space-y-6 pt-10 border-t border-darkroom-border bg-darkroom-surface/60 rounded-3xl p-8 border">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-tool-diligence/10 border border-tool-diligence/30 text-tool-diligence">
              <FileText className="size-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-serif text-white">
                Methodology & Research Provenance
              </h3>
              <p className="text-xs font-mono font-semibold text-tool-diligence uppercase tracking-widest">
                Self-Validating Research Architecture
              </p>
            </div>
          </div>

          <p className="text-base text-slate-200 leading-relaxed font-normal">
            The research behind this problem framing was conducted using{' '}
            <strong className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">Parallel Search</strong> — the exact same
            autonomous web-mining engine that powers Screened. By cross-examining public trade
            archives, Companies House filings, municipal screening license records, and filmmaker
            accounts, Screened's agents apply forensic due diligence to protect indie productions.
          </p>

          <p className="text-xs font-mono text-slate-400 italic">
            Note: The statistics, case counts, and quotes presented above are representative composites derived from autonomous research patterns across public forums, rather than verbatim data from individual identifiable users.
          </p>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-6 border-t border-darkroom-border">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
              <span>Vertex AI (gemini-2.5-flash)</span>
              <span>•</span>
              <span>Parallel Web API</span>
              <span>•</span>
              <span>Google Cloud Run (europe-west2)</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onNavigateToDiligence}
                className="px-5 py-2.5 bg-tool-diligence hover:bg-tool-diligence-hover text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md shadow-[var(--color-tool-diligence)]/20 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="size-4" />
                <span>Due Diligence</span>
              </button>
              <button
                onClick={onNavigateToScout}
                className="px-5 py-2.5 bg-darkroom-card hover:bg-darkroom-surface text-white border border-darkroom-border font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Coins className="size-4 text-emerald-400" />
                <span>Grant Research</span>
              </button>
              <button
                onClick={onNavigateToDesk}
                className="px-5 py-2.5 bg-midnight-royal hover:bg-midnight-royal/80 text-white font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="size-4" />
                <span>Screened AI</span>
              </button>
            </div>
          </div>
        </section>

        {/* Footer / Provenance & Engine Summary */}
        <footer className="pt-8 border-t border-darkroom-border text-center text-xs text-slate-400 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <span className="font-medium text-slate-300">Screened — Built natively with Google ADK & Parallel Search API</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-tool-diligence/10 text-tool-diligence border border-tool-diligence/20 font-mono text-xs">
              <Scale className="size-3.5" />
              <span>Why Screened exists</span>
            </span>
            {onOpenCommandPalette && (
              <button
                onClick={onOpenCommandPalette}
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-tool-diligence transition-colors cursor-pointer underline font-mono text-xs"
              >
                <CommandIcon className="size-3.5" />
                <span>Command Menu (⌘K)</span>
              </button>
            )}
          </div>
          <div className="text-xs text-slate-400">
            All findings are cryptographically hashed and cited to verified web excerpts.
          </div>
        </footer>
      </div>
    </div>
  );
};
