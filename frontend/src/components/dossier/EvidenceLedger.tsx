import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import { AtomicClaim, SourceRecord } from '../../types/investigation';
import { VerifiedTick } from '../ui/VerifiedTick';

interface Props {
  claims: AtomicClaim[];
  sources: SourceRecord[];
  onDraftOutreach: (claim?: AtomicClaim) => void;
  normalizedDensity: string;
}

export const EvidenceLedger: React.FC<Props> = ({
  claims,
  sources,
  onDraftOutreach,
  normalizedDensity,
}) => {
  const [activeDomain, setActiveDomain] = useState<string>('ALL');
  const [claimStatusFilter, setClaimStatusFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [expandedClaimSources, setExpandedClaimSources] = useState<Record<string, boolean>>({});

  const toggleClaimSources = (claimId: string) => {
    setExpandedClaimSources((prev) => ({ ...prev, [claimId]: !prev[claimId] }));
  };

  const filteredClaims = claims.filter((c) => {
    const matchesDomain = activeDomain === 'ALL' || c.researchDomain === activeDomain;
    const matchesStatus = claimStatusFilter === 'ALL' || c.status === claimStatusFilter;
    const matchesSearch =
      !searchFilter.trim() ||
      c.statement.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesDomain && matchesSearch && matchesStatus;
  });

  const sourceStats = React.useMemo(() => {
    const total = sources.length || 1;
    const tier1 = sources.filter((s) => s.sourceTier === 1).length;
    const tier2 = sources.filter((s) => s.sourceTier === 2).length;
    const tier3 = sources.filter((s) => s.sourceTier === 3).length;
    return {
      t1Pct: (tier1 / total) * 100,
      t2Pct: (tier2 / total) * 100,
      t3Pct: (tier3 / total) * 100,
      tier1,
      tier2,
      tier3,
    };
  }, [sources]);

  const getStatusBadge = (status: AtomicClaim['status']) => {
    switch (status) {
      case 'CORROBORATED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-emerald-400">
            <VerifiedTick size={12} />
            <span>Corroborated</span>
          </span>
        );
      case 'SUPPORTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-blue-400">
            <ShieldCheck className="size-3 text-blue-400" />
            <span>Supported</span>
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-orange-400">
            <AlertTriangle className="size-3 text-orange-400" />
            <span>Disputed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-slate-400">
            <span>Unverified</span>
          </span>
        );
    }
  };

  const getKindBadge = (kind: AtomicClaim['claimKind']) => {
    switch (kind) {
      case 'FACT':
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider text-blue-400 font-semibold">
            FACT
          </span>
        );
      case 'ALLEGATION':
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            ALLEGATION
          </span>
        );
      case 'OPINION':
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider text-purple-400 font-semibold">
            OPINION
          </span>
        );
    }
  };

  return (
    <>
      {/* Claims Ledger Container */}
      <div
        id="section-claims"
        className="py-4 space-y-4 scroll-mt-28 sm:scroll-mt-32 border-b border-darkroom-border/30 pb-6"
        data-section-name="Atomic Claims & Citations"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-darkroom-border/40 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            <ShieldCheck className="size-3.5 text-indigo-400" />
            <span>Atomic Claims &amp; Evidence Quotes ({claims.length})</span>
          </div>

          {/* Filters & Domain Selectors */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search filter input */}
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search claims..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-7 pr-3 py-1 text-xs rounded-xl bg-darkroom-surface border border-darkroom-border/60 text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-400/60 font-mono"
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={claimStatusFilter}
              onChange={(e) => setClaimStatusFilter(e.target.value)}
              className="text-xs font-mono py-1 px-2 rounded-xl bg-darkroom-surface border border-darkroom-border/60 text-slate-300 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="CORROBORATED">Corroborated</option>
              <option value="SUPPORTED">Supported</option>
              <option value="DISPUTED">Disputed</option>
              <option value="UNVERIFIED">Unverified</option>
            </select>
          </div>
        </div>

        {/* Domain Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'FESTIVAL', 'ORGANIZER', 'PARTICIPANTS'].map((dom) => (
            <button
              key={dom}
              type="button"
              onClick={() => setActiveDomain(dom)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeDomain === dom
                  ? 'bg-midnight-royal text-white font-semibold'
                  : 'bg-darkroom-surface/50 text-slate-400 hover:text-slate-200 hover:bg-darkroom-surface'
              }`}
            >
              {dom === 'ALL' ? 'All Domains' : dom}
            </button>
          ))}
        </div>

        {/* Filtered Claims Listing */}
        <div className="space-y-3">
          {filteredClaims.length === 0 ? (
            <div className="p-8 rounded-2xl bg-darkroom-surface/40 border border-darkroom-border/40 text-center text-xs text-slate-400">
              No claims matched your filter query "{searchFilter}".
            </div>
          ) : (
            filteredClaims.map((claim) => {
              const isExpanded = normalizedDensity === 'FULL_EVIDENCE';
              return (
                <div
                  key={claim.id}
                  className="rounded-2xl bg-darkroom-surface/60 border border-darkroom-border/60 transition-all overflow-hidden"
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getKindBadge(claim.claimKind)}
                        <span className="text-xs text-slate-400 font-mono">
                          {claim.category}
                        </span>
                        {claim.editionYear && (
                          <span className="text-xs font-mono text-slate-400">
                            ({claim.editionYear})
                          </span>
                        )}
                        {claim.attributedTo && (
                          <span className="text-xs font-mono text-slate-400">
                            • Attributed: {claim.attributedTo}
                          </span>
                        )}
                      </div>

                      <div className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                        {claim.statement}
                      </div>

                      {/* Direct Quoted Evidence References & Sources */}
                      {claim.evidence && claim.evidence.length > 0 && (() => {
                        const isCorroborated = claim.status === 'CORROBORATED';
                        const areSourcesExpanded = Boolean(expandedClaimSources[claim.id]);
                        const showSourceDetails = !isCorroborated || areSourcesExpanded;

                        return (
                          <div className="space-y-2 pt-1">
                            {isCorroborated && (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => toggleClaimSources(claim.id)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-darkroom-card/70 hover:bg-darkroom-surface border border-darkroom-border/60 hover:border-slate-600 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer shadow-2xs group"
                                >
                                  <span className="text-emerald-400 font-semibold">✓</span>
                                  <span>
                                    {areSourcesExpanded ? 'Hide' : 'View'} {claim.evidence.length} {claim.evidence.length === 1 ? 'Source' : 'Sources'}
                                  </span>
                                  {!areSourcesExpanded && (
                                    <span className="text-slate-400 text-[11px] truncate max-w-[200px] sm:max-w-xs">
                                      ({claim.evidence.map((e) => e.sourceDomain || e.sourceTitle || 'Web').slice(0, 2).join(', ')}{claim.evidence.length > 2 ? '...' : ''})
                                    </span>
                                  )}
                                  {areSourcesExpanded ? (
                                    <ChevronUp className="size-3 text-slate-400 group-hover:text-white" />
                                  ) : (
                                    <ChevronDown className="size-3 text-slate-400 group-hover:text-white" />
                                  )}
                                </button>
                              </div>
                            )}

                            {showSourceDetails && (
                              <div className="space-y-2 pt-0.5">
                                {claim.evidence.map((ev, idx) => {
                                  const quoteText =
                                    ev.exactExcerpt ||
                                    (ev as unknown as { quote?: string }).quote;
                                  return (
                                    <div
                                      key={idx}
                                      className="p-2.5 rounded-xl bg-darkroom-bg/70 border border-darkroom-border/40 space-y-1.5"
                                    >
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="font-mono text-slate-400 text-[11px] truncate max-w-[280px] sm:max-w-md">
                                          Source {idx + 1}: {ev.sourceDomain || ev.sourceTitle || 'Web record'}
                                        </span>
                                        {ev.sourceUrl && (
                                          <a
                                            href={ev.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 font-mono text-[11px]"
                                          >
                                            <span>Verify</span>
                                            <ExternalLink className="size-3" />
                                          </a>
                                        )}
                                      </div>

                                      {quoteText && (
                                        <blockquote className="text-slate-300 italic border-l-2 border-tool-diligence/40 pl-3 py-0.5 text-xs leading-relaxed">
                                          "{quoteText}"
                                        </blockquote>
                                      )}

                                      {ev.note && (
                                        <div className="text-[11px] text-slate-400 font-mono pl-3">
                                          ↳ {ev.note}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start no-print">
                      {getStatusBadge(claim.status)}

                      <button
                        onClick={() => onDraftOutreach(claim)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-darkroom-card hover:text-indigo-400 transition-colors cursor-pointer"
                        title="Draft Verification Inquiry for this claim"
                      >
                        <Mail className="size-4" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && claim.evidence && claim.evidence.length > 1 && (
                    <div className="px-4 pb-3 text-right">
                      <span className="text-[11px] font-mono text-slate-400">
                        {claim.evidence.length} corroborated sources linked
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Discovered Web Sources (Rendered in Full mode) */}
      {normalizedDensity === 'FULL_EVIDENCE' && (
        <div
          id="section-sources"
          className="py-4 space-y-4 scroll-mt-28 sm:scroll-mt-32 border-b border-darkroom-border/30 pb-6"
          data-section-name="Discovered Web Sources"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-darkroom-border/40 pb-3 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                <ExternalLink className="size-3.5 text-indigo-400" />
                <span>Discovered Web Sources ({sources.length})</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500"></span> Tier 1 (Official)</div>
                <div className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-blue-500"></span> Tier 2 (Trade/Press)</div>
                <div className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-orange-500"></span> Tier 3 (Community)</div>
              </div>
            </div>

            {/* Source Quality Distribution Indicator */}
            <div className="w-full sm:w-44 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Quality Distribution</span>
                <span>{sources.length} Total</span>
              </div>
              <div className="h-1.5 w-full rounded-full flex overflow-hidden bg-darkroom-card">
                {sourceStats.t1Pct > 0 && <div style={{ width: `${sourceStats.t1Pct}%` }} className="bg-emerald-500 transition-all duration-500" title={`Tier 1: ${sourceStats.tier1}`} />}
                {sourceStats.t2Pct > 0 && <div style={{ width: `${sourceStats.t2Pct}%` }} className="bg-blue-500 transition-all duration-500" title={`Tier 2: ${sourceStats.tier2}`} />}
                {sourceStats.t3Pct > 0 && <div style={{ width: `${sourceStats.t3Pct}%` }} className="bg-orange-500 transition-all duration-500" title={`Tier 3: ${sourceStats.tier3}`} />}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sources.map((src) => (
              <div key={src.id} className="p-3 rounded-xl bg-darkroom-surface/50 border border-darkroom-border/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                    Tier {src.sourceTier} • {src.domain}
                  </span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                <div className="font-medium text-xs text-slate-200 truncate">{src.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
