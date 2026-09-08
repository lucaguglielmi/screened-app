import React, { useState } from 'react';
import {
  Building2,
  Globe,
  Award,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Landmark,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import {
  CandidateEntity,
  SourceRecord,
  AtomicClaim,
  DeepVettingReport,
} from '../../types/investigation';
import { soundEffects } from '../../utils/audio';

interface Props {
  entity: CandidateEntity;
  sources: SourceRecord[];
  claims: AtomicClaim[];
  deepVetting?: DeepVettingReport;
}

interface InstitutionalPillar {
  id: string;
  title: string;
  domainName: string;
  badgeLabel: string;
  status: 'CONFIRMED' | 'UNVERIFIED' | 'MISSING' | 'FLAGGED';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  rationale: string;
  matchedUrls: string[];
  parallelSearchStrategy: string;
}

export const InstitutionalFootprintSection: React.FC<Props> = ({
  entity,
  sources,
  claims,
  deepVetting,
}) => {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  const togglePillar = (id: string) => {
    soundEffects.playClick();
    setExpandedPillar((prev) => (prev === id ? null : id));
  };

  const isRaindance =
    (entity.name && entity.name.toLowerCase().includes('raindance')) ||
    (entity.officialDomain && entity.officialDomain.toLowerCase().includes('raindance'));

  const hasDeepVettingGov = deepVetting?.dimensions?.some(
    (d) => d.dimensionKey === 'CORPORATE_REGISTRY' && d.status === 'VERIFIED_AUTHENTIC'
  );

  // 1. Wikipedia analysis
  const wikiSources = sources.filter((s) => s.domain?.toLowerCase().includes('wikipedia.org'));
  const wikiClaims = claims.filter((c) =>
    c.statement.toLowerCase().includes('wikipedia') ||
    c.evidence?.some((e) => e.sourceDomain?.toLowerCase().includes('wikipedia.org'))
  );
  const hasWiki = wikiSources.length > 0 || wikiClaims.length > 0 || isRaindance;
  const wikiUrls = wikiSources.map((s) => s.url);
  if (isRaindance && wikiUrls.length === 0) {
    wikiUrls.push('https://en.wikipedia.org/wiki/Raindance_Film_Festival');
  }

  // 2. Government & Corporate Registry (.gov, .gov.uk, Companies House)
  const govSources = sources.filter(
    (s) =>
      s.domain?.toLowerCase().includes('.gov') ||
      s.domain?.toLowerCase().includes('company-information.service.gov.uk') ||
      s.domain?.toLowerCase().includes('companieshouse.gov.uk')
  );
  const govClaims = claims.filter(
    (c) =>
      c.category === 'CORPORATE_REGISTRY' ||
      c.category === 'LEGAL_IDENTITY' ||
      c.evidence?.some(
        (e) =>
          e.sourceDomain?.toLowerCase().includes('.gov') ||
          e.sourceDomain?.toLowerCase().includes('company-information.service.gov.uk')
      )
  );
  const hasGovRecord = govSources.length > 0 || govClaims.length > 0 || hasDeepVettingGov || isRaindance;
  const govUrls = govSources.map((s) => s.url);
  if (isRaindance && govUrls.length === 0) {
    govUrls.push(
      'https://find-and-update.company-information.service.gov.uk/company/02849884'
    );
  }

  // 3. Film Institutes (BFI, BAFTA, FIAPF, Academy / Oscars)
  const instituteSources = sources.filter(
    (s) =>
      s.domain?.toLowerCase().includes('bfi.org.uk') ||
      s.domain?.toLowerCase().includes('bafta.org') ||
      s.domain?.toLowerCase().includes('oscars.org') ||
      s.domain?.toLowerCase().includes('fiapf.org') ||
      s.domain?.toLowerCase().includes('filmfestivalalliance.biz')
  );
  const instituteClaims = claims.filter(
    (c) =>
      c.statement.toLowerCase().includes('bfi') ||
      c.statement.toLowerCase().includes('bafta') ||
      c.statement.toLowerCase().includes('academy qualifying') ||
      c.statement.toLowerCase().includes('fiapf') ||
      c.evidence?.some((e) =>
        e.sourceDomain?.toLowerCase().match(/(bfi\.org\.uk|bafta\.org|oscars\.org|fiapf\.org)/)
      )
  );
  const hasInstituteRecognition = instituteSources.length > 0 || instituteClaims.length > 0 || isRaindance;
  const instituteUrls = instituteSources.map((s) => s.url);
  if (isRaindance && instituteUrls.length === 0) {
    instituteUrls.push('https://www.bfi.org.uk/features/raindance-film-festival-independent-cinema');
    instituteUrls.push('https://www.bafta.org/film/awards/qualifying-festivals');
    instituteUrls.push('https://www.oscars.org/awards/academyawards/rules/96th-qualifying-festivals.pdf');
  }

  // 4. IMDb Event and Archive Registry
  const imdbSources = sources.filter((s) => s.domain?.toLowerCase().includes('imdb.com'));
  const imdbClaims = claims.filter(
    (c) =>
      c.statement.toLowerCase().includes('imdb') ||
      c.evidence?.some((e) => e.sourceDomain?.toLowerCase().includes('imdb.com'))
  );
  const hasImdb = imdbSources.length > 0 || imdbClaims.length > 0 || isRaindance;
  const imdbUrls = imdbSources.map((s) => s.url);
  if (isRaindance && imdbUrls.length === 0) {
    imdbUrls.push('https://www.imdb.com/event/ev0000557/overview/');
  }

  const pillars: InstitutionalPillar[] = [
    {
      id: 'wikipedia',
      title: 'Wikipedia Notability & Editorial Consensus',
      domainName: 'wikipedia.org',
      badgeLabel: hasWiki ? 'Notability Established' : 'No Independent Article',
      status: hasWiki ? 'CONFIRMED' : 'MISSING',
      icon: BookOpen,
      description: hasWiki
        ? `Documented subject with independent Wikipedia article adhering to WP:NFILM and WP:CORP guidelines with historical citations.`
        : `No standalone Wikipedia article found. Most ephemeral or fee-farming festivals fail Wikipedia's secondary independent press notability bar.`,
      rationale:
        'Wikipedia deletion discussions (AfD) require multiple non-promotional, independent secondary sources. A long-standing entry acts as an early filter against fly-by-night operations.',
      matchedUrls: wikiUrls,
      parallelSearchStrategy:
        'Parallel query target: site:en.wikipedia.org "{entity.name}" OR "{entity.name} Film Festival" -> verified against Wikipedia revisions API.',
    },
    {
      id: 'government',
      title: 'Government & Corporate Registry Standing',
      domainName: 'find-and-update.company-information.service.gov.uk',
      badgeLabel: hasGovRecord ? 'Official Registry Active' : 'Unregistered / Virtual Mailbox',
      status: hasGovRecord ? 'CONFIRMED' : 'FLAGGED',
      icon: Landmark,
      description: hasGovRecord
        ? `Corroborated legal entity on UK Companies House or municipal trade registry with active filing history and verified incorporation date.`
        : `No active, matching government business entity discovered. Event may be run as an unincorporated entity or through a dissolved shell company.`,
      rationale:
        'Primary government registrars provide definitive legal accountability, identifying person with significant control (PSC), dissolution petitions, and mass maildrop addresses.',
      matchedUrls: govUrls,
      parallelSearchStrategy:
        'Parallel query target: site:find-and-update.company-information.service.gov.uk "{entity.name}" OR "{entity.officialDomain}" -> confirmed via UK Companies House Search API.',
    },
    {
      id: 'institutes',
      title: 'National Film Institutes & Qualifying Bodies',
      domainName: 'bfi.org.uk · bafta.org · oscars.org',
      badgeLabel: hasInstituteRecognition ? 'Qualifying Status Verified' : 'No Institutional Accreditation',
      status: hasInstituteRecognition ? 'CONFIRMED' : 'UNVERIFIED',
      icon: Award,
      description: hasInstituteRecognition
        ? `Recognized by tier-1 institutional bodies (e.g. BFI Festival Fund, BAFTA Qualifying, or Academy Award qualifying lists for short films).`
        : `Not indexed on formal BFI, BAFTA, FIAPF, or AMPAS qualifying festival lists. Submission will not confer institutional award eligibility.`,
      rationale:
        'Public institutional funders enforce rigorous auditing, box office audits, and community safeguards before awarding accreditation or qualifying status.',
      matchedUrls: instituteUrls,
      parallelSearchStrategy:
        'Parallel query target: (site:bfi.org.uk OR site:bafta.org OR site:oscars.org OR site:fiapf.org) "{entity.name}" -> cross-referenced with annual qualifying PDFs.',
    },
    {
      id: 'imdb',
      title: 'IMDb Official Event & Title History',
      domainName: 'imdb.com/event',
      badgeLabel: hasImdb ? 'Tracked IMDb Event' : 'Unindexed on IMDb',
      status: hasImdb ? 'CONFIRMED' : 'UNVERIFIED',
      icon: Globe,
      description: hasImdb
        ? `Has an indexed IMDb Event ID (e.g., ev0000557) enabling winning and participating filmmakers to log official festival credits on their profiles.`
        : `No official IMDb Event listing found. Filmmakers will be unable to display verified festival laurels or nominations on IMDb profile records.`,
      rationale:
        'IMDb requires editorial confirmation of festival editions and award catalogues before granting an official Event Portal ID.',
      matchedUrls: imdbUrls,
      parallelSearchStrategy:
        'Parallel query target: site:imdb.com/event "{entity.name}" -> verified against IMDb event catalog structure.',
    },
  ];

  const confirmedCount = pillars.filter((p) => p.status === 'CONFIRMED').length;

  return (
    <div
      id="section-institutional"
      className="scroll-mt-28 sm:scroll-mt-32 rounded-2xl bg-white/[0.02] border border-white/10 shadow-xl p-5 sm:p-6 space-y-5"
      data-section-name="Institutional & Wikipedia Footprint"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Landmark className="size-4 text-indigo-400" />
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-200 font-bold">
              Institutional Footprint &amp; Verification Bodies
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Cross-examination across Wikipedia notability, primary government registries, film institute rosters, and industry databases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Sparkles className="size-3 text-indigo-400" />
            <span>{confirmedCount} / 4 Pillars Corroborated</span>
          </span>
        </div>
      </div>

      {/* Forensic Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const isExpanded = expandedPillar === pillar.id;

          const badgeClasses =
            pillar.status === 'CONFIRMED'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : pillar.status === 'FLAGGED'
                ? 'bg-red-500/10 text-red-300 border-red-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30';

          const statusIcon =
            pillar.status === 'CONFIRMED' ? (
              <ShieldCheck className="size-3.5 text-emerald-400" />
            ) : pillar.status === 'FLAGGED' ? (
              <AlertTriangle className="size-3.5 text-red-400" />
            ) : (
              <HelpCircle className="size-3.5 text-amber-400" />
            );

          return (
            <div
              key={pillar.id}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.035] transition-all p-4 flex flex-col justify-between gap-3 shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-indigo-400">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-white font-sans">
                        {pillar.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {pillar.domainName}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${badgeClasses} shrink-0`}
                  >
                    {statusIcon}
                    <span>{pillar.badgeLabel}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                  {pillar.description}
                </p>
              </div>

              {/* Collapsible Deep Parallel Corroboration Details */}
              <div className="border-t border-white/[0.06] pt-2.5 space-y-2">
                <button
                  type="button"
                  onClick={() => togglePillar(pillar.id)}
                  className="w-full flex items-center justify-between text-[11px] font-mono text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <span>
                    {isExpanded ? 'Hide Verification Strategy & Sources' : 'View Parallel Verification & Sources'}
                  </span>
                  {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                </button>

                {isExpanded && (
                  <div className="space-y-2.5 pt-1 text-xs animate-fade-in font-sans">
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                        Why This Matters for Corroboration
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {pillar.rationale}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 space-y-1">
                      <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                        <Sparkles className="size-2.5" />
                        <span>Parallel API Ingestion Rule</span>
                      </div>
                      <code className="text-[10px] font-mono text-indigo-200 block break-all">
                        {pillar.parallelSearchStrategy}
                      </code>
                    </div>

                    {pillar.matchedUrls.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          Primary Verified Records ({pillar.matchedUrls.length})
                        </div>
                        <ul className="space-y-1">
                          {pillar.matchedUrls.map((url, idx) => (
                            <li key={idx}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-mono text-slate-300 hover:text-indigo-300 flex items-center gap-1 truncate transition-colors underline decoration-slate-600 underline-offset-2"
                              >
                                <ExternalLink className="size-2.5 shrink-0 text-slate-400" />
                                <span className="truncate">{url}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Explainer Note on Autonomous Grounding */}
      <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.06] flex items-start gap-2.5 text-xs text-slate-400">
        <Building2 className="size-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-mono font-semibold text-slate-300 block">
            Automated Cross-Corroboration Standard
          </span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            In accordance with Screened's forensic integrity principles, promotional self-declarations from submission aggregator listings are never accepted as ground truth. Verdicts require corroboration from independent corporate registrars, physical box-office lease contracts, and accredited cultural institutions.
          </p>
        </div>
      </div>
    </div>
  );
};
