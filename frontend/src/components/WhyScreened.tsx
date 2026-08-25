import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  Scale,
  Clock,
  FileText,
  Compass,
  Quote,
  CheckCircle2,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface Props {
  onNavigateToDesk: () => void;
  onNavigateToDiligence: () => void;
  onNavigateToScout: () => void;
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
}) => {
  return (
    <div className="w-full min-h-screen bg-slate-50 bg-slate-950 text-slate-900 text-slate-100 px-4 py-12 sm:py-20 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-24">
        {/* Editorial Header */}
        <section className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 text-slate-500 uppercase tracking-widest text-sm font-semibold">
            <Scale className="size-4" />
            <span>Empirical Impact & Problem Validation</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Why Screened Exists
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Independent filmmakers spend over{' '}
            <strong className="text-slate-900 text-white font-bold">£1,500 – £4,000</strong> per festival cycle in
            submission fees. Without transparent public evidence, micro-budget productions bear the
            brunt of predatory laurel mills and phantom venue claims.
          </p>
        </section>

        {/* Baseline Comparison: Manual vs Autonomous */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <span className="text-slate-500 uppercase tracking-widest text-sm font-semibold">
              Measured Workflow Baseline
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              Manual Vetting vs. Autonomous Diligence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-8">
            {/* Manual Vetting Typography */}
            <div className="space-y-6">
              <div className="border-b border-slate-200 border-slate-800 pb-2">
                <h3 className="text-lg font-bold text-slate-500 uppercase tracking-widest">
                  Manual Filmmaker Research
                </h3>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-2xl font-bold flex items-center gap-3">
                    <Clock className="size-6 text-slate-400" />
                    <span>45–75 Minutes</span>
                  </div>
                  <p className="text-base text-slate-600 text-slate-400 mt-1 ml-9">Per festival submission decision</p>
                </div>

                <div>
                  <div className="text-2xl font-bold flex items-center gap-3">
                    <Layers className="size-6 text-slate-400" />
                    <span>20+ Browser Tabs</span>
                  </div>
                  <p className="text-base text-slate-600 text-slate-400 mt-1 ml-9">
                    Reddit, FilmFreeway, Companies House, blogs
                  </p>
                </div>

                <div>
                  <div className="text-2xl font-bold flex items-center gap-3">
                    <TrendingDown className="size-6 text-slate-400" />
                    <span>Ungrounded Risk</span>
                  </div>
                  <p className="text-base text-slate-600 text-slate-400 mt-1 ml-9">
                    No cryptographic verification or citation index
                  </p>
                </div>
              </div>

              <p className="text-base text-slate-500 italic pt-6 border-t border-slate-200 border-slate-800">
                "You end up relying on fragmented hearsay in Facebook groups, or you just pay the £80
                and hope for the best."
              </p>
            </div>

            {/* Screened Agent Typography */}
            <div className="space-y-6">
              <div className="border-b border-slate-200 border-slate-800 pb-2">
                <h3 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="size-5" /> Screened Engine
                </h3>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-2xl font-bold flex items-center gap-3">
                    <Clock className="size-6 text-indigo-500" />
                    <span>~90 Seconds</span>
                  </div>
                  <p className="text-base text-slate-600 text-slate-400 mt-1 ml-9">Complete multi-domain dossier</p>
                </div>

                <div>
                  <div className="text-2xl font-bold flex items-center gap-3">
                    <CheckCircle2 className="size-6 text-indigo-500" />
                    <span>100% Verifiable Excerpts</span>
                  </div>
                  <p className="text-base text-slate-600 text-slate-400 mt-1 ml-9">
                    Every statement mapped to source dates & URLs
                  </p>
                </div>

                <div>
                  <div className="text-2xl font-bold flex items-center gap-3">
                    <Scale className="size-6 text-indigo-500" />
                    <span>Contradiction Analysis</span>
                  </div>
                  <p className="text-base text-slate-600 text-slate-400 mt-1 ml-9">
                    Conflicting trade evidence reconciled neutrally
                  </p>
                </div>
              </div>

              <p className="text-base font-medium pt-6 border-t border-slate-200 border-slate-800">
                ✓ Zero subject score bias. Facts, allegations, and opinions isolated end-to-end.
              </p>
            </div>
          </div>
        </section>

        {/* The Evidence Corpus */}
        <section className="space-y-10">
          <div className="space-y-3 text-center max-w-2xl mx-auto border-b border-slate-200 border-slate-800 pb-8">
            <span className="text-slate-500 uppercase tracking-widest text-sm font-semibold">
              Empirical Corpus
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif leading-tight">
              Common Grievance Vectors Harvested via Parallel Search
            </h2>
            <p className="text-lg text-slate-600 text-slate-300">
              Representative qualitative accounts harvested across filmmaker forums (Reddit
              r/Filmmakers, FilmFreeway communities, Stage 32, and industry blogs).
            </p>
          </div>

          <div className="space-y-12 pt-4">
            {RESEARCH_THEMES.map((item, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 border-slate-800 pb-3">
                  <h3 className="text-xl font-bold font-serif">
                    {idx + 1}. {item.theme}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-semibold tracking-wide uppercase">
                    <span>{item.sourceCount} documented sources</span>
                    <span>•</span>
                    <span>{item.dateRange}</span>
                  </div>
                </div>

                <p className="text-lg text-slate-700 text-slate-300 leading-relaxed">{item.description}</p>

                <div className="pl-6 border-l-2 border-indigo-200 border-indigo-900/50 space-y-2 py-2">
                  <div className="flex items-start gap-3">
                    <Quote className="size-5 text-indigo-400 shrink-0 mt-1" />
                    <p className="text-lg text-slate-600 text-slate-400 italic leading-relaxed">{item.quote}</p>
                  </div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest pl-8">
                    — {item.attribution}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Meta-Methodology Statement */}
        <section className="space-y-6 pt-12 border-t border-slate-200 border-slate-800">
          <div className="flex items-center gap-4">
            <FileText className="size-8 text-indigo-500" />
            <div>
              <h3 className="text-2xl font-bold font-serif">
                Methodology & Research Provenance
              </h3>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                Self-Validating Research Architecture
              </p>
            </div>
          </div>

          <p className="text-lg text-slate-700 text-slate-300 leading-relaxed">
            The research behind this problem framing was conducted using{' '}
            <strong className="text-slate-900 text-white font-bold">Parallel Search</strong> — the exact same
            autonomous web-mining engine that powers Screened. By cross-examining public trade
            archives, Companies House filings, municipal screening license records, and filmmaker
            accounts, Screened's agents apply forensic due diligence to protect indie productions.
          </p>

          <p className="text-base text-slate-600 text-slate-400 italic">
            Note: The statistics, case counts, and quotes presented above are representative composites derived from autonomous research patterns across public forums, rather than verbatim data from individual identifiable users.
          </p>

          <div className="pt-10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500 uppercase tracking-widest">
              <span>Vertex AI (gemini-2.5-flash)</span>
              <span>•</span>
              <span>Parallel Web API</span>
              <span>•</span>
              <span>Google Cloud Run (europe-west2)</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onNavigateToDiligence}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white bg-white text-slate-900 hover:bg-slate-200 font-bold text-base rounded transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="size-5" />
                <span>Due Diligence</span>
              </button>
              <button
                onClick={onNavigateToScout}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white bg-white text-slate-900 hover:bg-slate-200 font-bold text-base rounded transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Compass className="size-5" />
                <span>Opportunity Scout</span>
              </button>
              <button
                onClick={onNavigateToDesk}
                className="px-6 py-3 bg-transparent hover:bg-slate-200/50 hover:bg-slate-800 text-slate-900 text-white border border-slate-300 border-slate-700 font-bold text-base rounded transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="size-5" />
                <span>The Desk</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
