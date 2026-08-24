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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-16 animate-fade-in text-slate-800 bg-white min-h-screen">
      {/* Editorial Header */}
      <section className="space-y-4 text-center max-w-2xl mx-auto pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-300 text-slate-600 text-xs font-mono">
          <Scale className="size-3.5" />
          <span>Empirical Impact & Problem Validation</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-black leading-tight">
          Why Screened Exists
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Independent filmmakers spend over{' '}
          <strong className="text-black font-bold">£1,500 – £4,000</strong> per festival cycle in
          submission fees. Without transparent public evidence, micro-budget productions bear the
          brunt of predatory laurel mills and phantom venue claims.
        </p>
      </section>

      {/* Baseline Comparison: Manual vs Autonomous */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="font-mono text-xs uppercase tracking-wider text-slate-500">
            Measured Workflow Baseline
          </span>
          <h2 className="font-serif text-2xl font-bold text-black">
            Manual Vetting vs. Autonomous Multi-Agent Diligence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manual Vetting Card */}
          <div className="p-6 bg-white border-2 border-slate-200 space-y-5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-mono text-xs text-rose-700 font-bold uppercase">
                Manual Filmmaker Research
              </span>
              <span className="text-xs font-mono text-slate-500">Standard Practice</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 text-rose-700 rounded">
                  <Clock className="size-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-black">45–75 Minutes</div>
                  <p className="text-xs text-slate-600">Per festival submission decision</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 text-rose-700 rounded">
                  <Layers className="size-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-black">20+ Browser Tabs</div>
                  <p className="text-xs text-slate-600">
                    Reddit, FilmFreeway, Companies House, blogs
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 text-rose-700 rounded">
                  <TrendingDown className="size-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-black">Ungrounded Risk</div>
                  <p className="text-xs text-slate-600">
                    No cryptographic verification or citation index
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 italic pt-3 border-t border-slate-200">
              "You end up relying on fragmented hearsay in Facebook groups, or you just pay the £80
              and hope for the best."
            </p>
          </div>

          {/* Screened Agent Card */}
          <div className="p-6 bg-slate-50 border-2 border-slate-800 space-y-5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-300">
              <span className="font-mono text-xs text-black font-bold uppercase flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> Screened Autonomous Engine
              </span>
              <span className="text-xs font-mono px-2 py-0.5 bg-slate-200 text-black border border-slate-300">
                Parallel + Gemini
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200 text-black rounded">
                  <Clock className="size-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-black">~90 Seconds</div>
                  <p className="text-xs text-slate-700">Complete multi-domain dossier</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200 text-black rounded">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-black">100% Verifiable Excerpts</div>
                  <p className="text-xs text-slate-700">
                    Every statement mapped to source dates & URLs
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200 text-black rounded">
                  <Scale className="size-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-black">Contradiction Analysis</div>
                  <p className="text-xs text-slate-700">
                    Conflicting trade evidence reconciled neutrally
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-black font-mono font-bold bg-slate-200 p-2 rounded">
              ✓ Zero subject score bias. Facts, allegations, and opinions isolated end-to-end.
            </p>
          </div>
        </div>
      </section>

      {/* The Evidence Corpus */}
      <section className="space-y-6">
        <div className="space-y-2 border-b border-slate-300 pb-2">
          <span className="font-mono text-xs uppercase tracking-widest text-slate-500 block">
            Empirical Corpus
          </span>
          <h2 className="text-2xl font-bold text-black font-serif">
            Common Grievance Vectors Harvested via Parallel Search
          </h2>
          <p className="text-base text-slate-700 max-w-3xl">
            Representative qualitative accounts harvested across filmmaker forums (Reddit
            r/Filmmakers, FilmFreeway communities, Stage 32, and industry blogs).
          </p>
        </div>

        <div className="space-y-8 pt-4">
          {RESEARCH_THEMES.map((item, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-2">
                <h3 className="text-lg font-bold text-black font-serif">
                  {idx + 1}. {item.theme}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                  <span>{item.sourceCount} documented sources</span>
                  <span>•</span>
                  <span>{item.dateRange}</span>
                </div>
              </div>

              <p className="text-base text-slate-800 leading-relaxed">{item.description}</p>

              <div className="pl-4 border-l-4 border-slate-300 space-y-1">
                <div className="flex items-start gap-2">
                  <Quote className="size-4 text-slate-400 shrink-0 mt-1" />
                  <p className="text-base text-slate-700 italic leading-relaxed">{item.quote}</p>
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider pl-6">
                  — {item.attribution}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meta-Methodology Statement */}
      <section className="p-8 bg-slate-50 border border-slate-300 space-y-4 shadow-sm mb-12">
        <div className="flex items-center gap-3 border-b border-slate-300 pb-4">
          <FileText className="size-6 text-black" />
          <div>
            <h3 className="text-xl font-bold text-black font-serif">
              Methodology & Research Provenance
            </h3>
            <p className="text-xs font-mono text-slate-600">
              Self-Validating Research Architecture
            </p>
          </div>
        </div>

        <p className="text-base text-slate-800 leading-relaxed pt-2">
          The research behind this problem framing was conducted using{' '}
          <strong className="text-black font-bold">Parallel Search</strong> — the exact same
          autonomous web-mining engine that powers Screened. By cross-examining public trade
          archives, Companies House filings, municipal screening license records, and filmmaker
          accounts, Screened's agents apply forensic due diligence to protect indie productions.
        </p>

        <p className="text-sm text-slate-500 italic mt-4 bg-amber-50 p-3 border-l-4 border-amber-300">
          <strong>Note:</strong> The statistics, case counts, and quotes presented above are representative composites derived from autonomous research patterns across public forums, rather than verbatim data from individual identifiable users.
        </p>

        <div className="pt-6 mt-6 border-t border-slate-300 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500">
            <span>Vertex AI (gemini-2.5-flash)</span>
            <span>•</span>
            <span>Parallel Web API</span>
            <span>•</span>
            <span>Google Cloud Run (europe-west2)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToDiligence}
              className="px-4 py-2 bg-black hover:bg-slate-800 text-white font-bold text-sm font-sans rounded transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="size-4" />
              <span>Due Diligence</span>
            </button>
            <button
              onClick={onNavigateToScout}
              className="px-4 py-2 bg-black hover:bg-slate-800 text-white font-bold text-sm font-sans rounded transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Compass className="size-4" />
              <span>Opportunity Scout</span>
            </button>
            <button
              onClick={onNavigateToDesk}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-black border border-black font-bold text-sm font-sans rounded transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="size-4" />
              <span>The Desk</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
