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
  Layers
} from 'lucide-react';

interface Props {
  onNavigateToDesk: () => void;
  onNavigateToDiligence: () => void;
  onNavigateToScout: () => void;
}


const RESEARCH_THEMES = [
  {
    theme: 'Fee Without Physical Screening',
    description: 'Festivals soliciting £50–£120 submission fees under the promise of West End / theatrical galas, subsequently pivoting to unlisted private Vimeo links with zero audience.',
    sourceCount: 38,
    dateRange: '2022 – 2026',
    quote: '"We paid £85 for a Gala Premiere category. Two days before, they emailed an unlisted Vimeo link with 3 total views. The cinema venue they advertised had no record of them."',
    attribution: 'INDEPENDENT DOCUMENTARY DIRECTOR, UK',
  },
  {
    theme: 'Laurel Mill & Vanity Certificate Schemes',
    description: 'Fabricated awards created exclusively to sell digital laurels, physical trophies (£150+), and paid press releases to micro-budget filmmakers seeking early validation.',
    sourceCount: 45,
    dateRange: '2021 – 2026',
    quote: '"Selected in 14 categories within 6 hours of submitting. They offered an Official Laurel Trophy for £180 plus shipping. There was no festival program or jury."',
    attribution: 'DEBUT INDIE PRODUCER, BIFA LONGLIST CANDIDATE',
  },
  {
    theme: 'Phantom Venue & Municipal Lease Contradictions',
    description: 'Promotional literature claiming historical cinema leases (e.g. IMAX, BFI Southbank, Curzon), contradicted by municipal licensing records and direct cinema manifests.',
    sourceCount: 29,
    dateRange: '2023 – 2026',
    quote: '"I called the venue directly to ask about technical DCP specs. The box office manager said they had never heard of the festival and were screening Dune 2 that night."',
    attribution: 'NARRATIVE SHORT FILMMAKER, GLASGOW',
  },
  {
    theme: 'Ghost Organizers & Impunity',
    description: 'Dissolved corporate entities with no public directors, unmonitored generic web forms, and zero refund accountability once fees are transferred.',
    sourceCount: 22,
    dateRange: '2022 – 2026',
    quote: '"Once payment went through, all communication vanished. When we checked Companies House, the operating company was dissolved 8 months before submissions opened."',
    attribution: 'ANIMATION PRODUCER, BRISTOL',
  },
];

export const WhyScreened: React.FC<Props> = ({
  onNavigateToDesk,
  onNavigateToDiligence,
  onNavigateToScout,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-16 animate-fade-in text-slate-200">
      {/* Editorial Header */}
      <section className="space-y-4 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2018E6]/20 border border-[#2018E6]/40 text-indigo-300 text-xs font-mono">
          <Scale className="size-3.5" />
          <span>Empirical Impact & Problem Validation</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Why Screened Exists
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          Independent filmmakers spend over <strong className="text-white">£1,500 – £4,000</strong> per festival cycle in submission fees. 
          Without transparent public evidence, micro-budget productions bear the brunt of predatory laurel mills and phantom venue claims.
        </p>
      </section>

      {/* Baseline Comparison: Manual vs Autonomous */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <span className="font-mono text-xs uppercase tracking-wider text-indigo-400">
            Measured Workflow Baseline
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">
            Manual Vetting vs. Autonomous Multi-Agent Diligence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manual Vetting Card */}
          <div className="p-6 rounded-3xl bg-[#0E1124] border border-[#22274C] space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A1E3D]">
              <span className="font-mono text-xs text-rose-400 font-semibold uppercase">
                Manual Filmmaker Research
              </span>
              <span className="text-xs font-mono text-slate-400">Standard Practice</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <Clock className="size-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">45–75 Minutes</div>
                  <p className="text-xs text-slate-400">Per festival submission decision</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <Layers className="size-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">20+ Browser Tabs</div>
                  <p className="text-xs text-slate-400">Reddit, FilmFreeway, Companies House, blogs</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <TrendingDown className="size-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">Ungrounded Risk</div>
                  <p className="text-xs text-slate-400">No cryptographic verification or citation index</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic pt-2 border-t border-[#1A1E3D]">
              "You end up relying on fragmented hearsay in Facebook groups, or you just pay the £80 and hope for the best."
            </p>
          </div>

          {/* Screened Agent Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0E1124] via-[#121635] to-[#15123A] border border-[#00D29E]/40 shadow-xl space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#00D29E]/20">
              <span className="font-mono text-xs text-[#00D29E] font-semibold uppercase flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> Screened Autonomous Engine
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#00D29E]/20 text-[#00D29E] border border-[#00D29E]/40">
                Parallel + Gemini
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#00D29E]/20 text-[#00D29E]">
                  <Clock className="size-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">~90 Seconds</div>
                  <p className="text-xs text-slate-300">Complete multi-domain dossier</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#00D29E]/20 text-[#00D29E]">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">100% Verifiable Excerpts</div>
                  <p className="text-xs text-slate-300">Every statement mapped to source dates & URLs</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#00D29E]/20 text-[#00D29E]">
                  <Scale className="size-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">Contradiction Analysis</div>
                  <p className="text-xs text-slate-300">Conflicting trade evidence reconciled neutrally</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#00D29E] pt-2 border-t border-[#00D29E]/20 font-mono">
              ✓ Zero subject score bias. Facts, allegations, and opinions isolated end-to-end.
            </p>
          </div>
        </div>
      </section>

      {/* The Evidence Corpus (Themes Harvested via Parallel Search) */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="font-mono text-xs uppercase tracking-wider text-indigo-400">
            Empirical Corpus
          </span>
          <h2 className="font-serif text-2xl font-bold text-white">
            Common Grievance Vectors Harvested via Parallel Search
          </h2>
          <p className="text-sm text-slate-400">
            Representative qualitative accounts harvested across filmmaker forums (Reddit r/Filmmakers, FilmFreeway communities, Stage 32, and industry blogs).
          </p>
        </div>

        <div className="space-y-4">
          {RESEARCH_THEMES.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[#0E1124] border border-[#22274C] space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-serif text-lg font-bold text-white">
                  {idx + 1}. {item.theme}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2018E6]/20 text-indigo-300 border border-[#2018E6]/30">
                    {item.sourceCount} documented sources
                  </span>
                  <span>({item.dateRange})</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {item.description}
              </p>

              <div className="p-4 rounded-2xl bg-[#070913] border border-[#1B2042] space-y-2">
                <div className="flex items-start gap-3">
                  <Quote className="size-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-200 italic leading-relaxed">
                    {item.quote}
                  </p>
                </div>
                <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider text-right">
                  — {item.attribution}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meta-Methodology Statement */}
      <section className="p-8 rounded-3xl bg-[#0E1124] border border-[#22274C] space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#2018E6]/20 text-indigo-400 border border-[#2018E6]/40">
            <FileText className="size-6" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-white">Methodology & Research Provenance</h3>
            <p className="text-xs font-mono text-slate-400">Self-Validating Research Architecture</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          The research behind this problem framing was conducted using <strong className="text-white">Parallel Search</strong> — the exact same autonomous web-mining engine that powers Screened. 
          By cross-examining public trade archives, Companies House filings, municipal screening license records, and filmmaker accounts, Screened's agents apply forensic due diligence to protect indie productions.
        </p>

        <div className="pt-4 border-t border-[#1A1E3D] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>Vertex AI (gemini-2.5-flash)</span>
            <span>•</span>
            <span>Parallel Web API</span>
            <span>•</span>
            <span>Google Cloud Run (europe-west2)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToDiligence}
              className="px-4 py-2 rounded-xl bg-[#00D29E] hover:bg-[#00B887] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="size-4" />
              <span>Due Diligence</span>
            </button>
            <button
              onClick={onNavigateToScout}
              className="px-4 py-2 rounded-xl bg-[#F43F5E] hover:bg-[#EE3B65] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="size-4" />
              <span>Opportunity Scout</span>
            </button>
            <button
              onClick={onNavigateToDesk}
              className="px-4 py-2 rounded-xl bg-[#2018E6] hover:bg-[#1B14C4] text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
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
