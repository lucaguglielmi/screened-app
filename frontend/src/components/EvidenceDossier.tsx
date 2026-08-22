import React, { useState } from 'react';
import { 
  AtomicClaim, 
  CandidateEntity, 
  DossierReport, 
  DisputeRecord, 
  DetailDensity,
  SourceRecord,
  DeepVettingReport
} from '../types/investigation';
import { ContradictionPanel } from './ContradictionPanel';
import { DetailDial } from './DetailDial';
import { CitationPopover } from './CitationPopover';
import { CredibilityRadar } from './CredibilityRadar';
import { DeepVettingMatrix } from './investigation/DeepVettingMatrix';
import { playDialClick } from '../utils/audio';
import { 
  FileText, 
  Building2, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  ListChecks, 
  HelpCircle,
  Globe,
  MapPin,
  Calendar,
  Download,
  Printer,
  Copy,
  Check,
  Search,
  Mail,
  Fingerprint
} from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  entity: CandidateEntity;
  dossier: DossierReport;
  claims: AtomicClaim[];
  sources: SourceRecord[];
  disputes: DisputeRecord[];
  deepVetting?: DeepVettingReport;
  onNewInvestigation: () => void;
  onDraftOutreach: (claim?: AtomicClaim) => void;
  onExport: () => void;
}

export const EvidenceDossier: React.FC<Props> = ({
  entity,
  dossier,
  claims,
  sources,
  disputes,
  deepVetting,
  onNewInvestigation,
  onDraftOutreach,
  onExport,
}) => {
  const [activeTab, setActiveTab] = useState<'DOSSIER' | 'FORENSIC_VETTING'>('DOSSIER');
  const [density, setDensity] = useState<DetailDensity>('STANDARD');
  const [activeDomain, setActiveDomain] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleDensityChange = (newDensity: DetailDensity) => {
    playDialClick();
    setDensity(newDensity);
  };

  const handleCopySummary = () => {
    const text = `# ${entity.name} — Screened Due-Diligence Summary\n\n${dossier.executiveSummary}\n\n## Action Checklist:\n${dossier.filmmakerChecklist.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nGenerated with Screened (Agentic Cinema Due-Diligence)`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredClaims = claims.filter((c) => {
    const matchesDomain = activeDomain === 'ALL' || c.researchDomain === activeDomain;
    const matchesSearch = !searchFilter.trim() || 
      c.statement.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const factsCount = claims.filter((c) => c.claimKind === 'FACT').length;
  const allegationsCount = claims.filter((c) => c.claimKind === 'ALLEGATION').length;
  const corroboratedCount = claims.filter((c) => c.status === 'CORROBORATED').length;

  const getStatusBadge = (status: AtomicClaim['status']) => {
    switch (status) {
      case 'CORROBORATED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-3" /> Corroborated
          </span>
        );
      case 'SUPPORTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <ShieldCheck className="size-3" /> Supported
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="size-3" /> Disputed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20">
            Unverified
          </span>
        );
    }
  };

  const getKindBadge = (kind: AtomicClaim['claimKind']) => {
    switch (kind) {
      case 'FACT':
        return <span className="font-mono text-[10px] uppercase tracking-wider text-blue-500 font-semibold">FACT</span>;
      case 'ALLEGATION':
        return <span className="font-mono text-[10px] uppercase tracking-wider text-rose-500 font-semibold">ALLEGATION</span>;
      case 'OPINION':
        return <span className="font-mono text-[10px] uppercase tracking-wider text-purple-500 font-semibold">OPINION</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Top Profile & Toolbar */}
      <div className="p-6 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-paper-border dark:border-darkroom-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <FileText className="size-4" />
              <span>Evidence Dossier Report</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-paper-text dark:text-darkroom-text">
              {entity.name}
            </h1>
            <div className="flex items-center gap-4 text-xs font-mono text-paper-muted dark:text-darkroom-muted pt-1">
              {entity.cityCountry && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3 text-indigo-500" /> {entity.cityCountry}
                </span>
              )}
              {entity.foundedYear && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3 text-indigo-500" /> Est. {entity.foundedYear}
                </span>
              )}
              {entity.officialDomain && (
                <a
                  href={`https://${entity.officialDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Globe className="size-3" /> {entity.officialDomain}
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap no-print">
            <button
              onClick={handleCopySummary}
              className="px-3 py-2 rounded-xl bg-paper-card dark:bg-darkroom-card hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-medium text-paper-text dark:text-darkroom-text border border-paper-border dark:border-darkroom-border transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy executive summary to clipboard"
            >
              {copiedSummary ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-paper-card dark:bg-darkroom-card hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-medium text-paper-text dark:text-darkroom-text border border-paper-border dark:border-darkroom-border transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Print formatted dossier or save as PDF"
            >
              <Printer className="size-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onExport}
              className="px-3 py-2 rounded-xl bg-paper-card dark:bg-darkroom-card hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-medium text-paper-text dark:text-darkroom-text border border-paper-border dark:border-darkroom-border transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Download signed Markdown archive with SHA-256 seal"
            >
              <Download className="size-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={onNewInvestigation}
              className="px-3 py-2 rounded-xl bg-paper-card dark:bg-darkroom-card hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-medium text-paper-text dark:text-darkroom-text border border-paper-border dark:border-darkroom-border transition-colors cursor-pointer"
            >
              New Search
            </button>
          </div>
        </div>

        {/* Detail Dial & Count Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center flex-1 w-full sm:w-auto">
            <div className="p-2.5 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border">
              <div className="text-[10px] font-mono uppercase text-paper-muted dark:text-darkroom-muted">Facts</div>
              <div className="text-base font-semibold text-blue-600 dark:text-blue-400">{factsCount}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border">
              <div className="text-[10px] font-mono uppercase text-paper-muted dark:text-darkroom-muted">Allegations</div>
              <div className="text-base font-semibold text-rose-600 dark:text-rose-400">{allegationsCount}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border">
              <div className="text-[10px] font-mono uppercase text-paper-muted dark:text-darkroom-muted">Corroborated</div>
              <div className="text-base font-semibold text-emerald-600 dark:text-emerald-400">{corroboratedCount}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border">
              <div className="text-[10px] font-mono uppercase text-paper-muted dark:text-darkroom-muted">Disputes</div>
              <div className="text-base font-semibold text-amber-600 dark:text-amber-400">{disputes.length}</div>
            </div>
          </div>

          <div className="no-print">
            <DetailDial density={density} onChange={handleDensityChange} />
          </div>
        </div>

        {/* View Mode Switcher: Dossier vs 360° Forensic Matrix */}
        <div className="pt-3 border-t border-paper-border dark:border-darkroom-border flex items-center justify-between flex-wrap gap-3 no-print">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border">
            <button
              onClick={() => { playDialClick(); setActiveTab('DOSSIER'); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'DOSSIER'
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'text-paper-muted dark:text-darkroom-muted hover:text-paper-text dark:hover:text-darkroom-text'
              }`}
            >
              <FileText className="size-3.5" />
              <span>Full Due Diligence Dossier</span>
            </button>
            <button
              onClick={() => { playDialClick(); setActiveTab('FORENSIC_VETTING'); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'FORENSIC_VETTING'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-paper-muted dark:text-darkroom-muted hover:text-paper-text dark:hover:text-darkroom-text'
              }`}
            >
              <Fingerprint className="size-3.5" />
              <span>360° Forensic Matrix (7 Vectors)</span>
              <span className="px-1.5 py-0.2 rounded bg-white/20 text-[10px] uppercase tracking-wider">
                Spec 14
              </span>
            </button>
          </div>

          <span className="text-xs text-paper-muted dark:text-darkroom-muted font-mono">
            {activeTab === 'DOSSIER' ? `${claims.length} Claims • ${disputes.length} Disputes` : `7 Forensic Inspection Vectors`}
          </span>
        </div>
      </div>

      {activeTab === 'FORENSIC_VETTING' ? (
        <DeepVettingMatrix report={deepVetting} festivalName={entity.name} />
      ) : (
        <>
          {/* Credibility & Transparency Radar Bar */}
          <CredibilityRadar claims={claims} disputes={disputes} />

          {/* Executive Overview */}
          <div className="p-6 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-paper-muted dark:text-darkroom-muted">
              Executive Overview
            </div>
            <p className="font-serif text-base sm:text-lg text-paper-text dark:text-darkroom-text leading-relaxed whitespace-pre-line">
              {dossier.executiveSummary}
            </p>
          </div>

      {/* Side-by-Side Contradictions Panel */}
      <ContradictionPanel disputes={disputes} />

      {/* 3 Domain Narrative Syntheses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Festival Domain */}
        <div className="p-5 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-paper-border dark:border-darkroom-border pb-2">
            <Layers className="size-4" />
            <span>Festival Profile</span>
          </div>
          <p className="text-base text-paper-text dark:text-darkroom-text leading-relaxed">
            {dossier.festivalOverview}
          </p>
        </div>

        {/* Organizer Domain */}
        <div className="p-5 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-paper-border dark:border-darkroom-border pb-2">
            <Building2 className="size-4" />
            <span>Organizer Profile</span>
          </div>
          <p className="text-base text-paper-text dark:text-darkroom-text leading-relaxed">
            {dossier.organizerProfile}
          </p>
        </div>

        {/* Participants Domain */}
        <div className="p-5 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-paper-border dark:border-darkroom-border pb-2">
            <Users className="size-4" />
            <span>Community Accounts</span>
          </div>
          <p className="text-base text-paper-text dark:text-darkroom-text leading-relaxed">
            {dossier.participantFeedback}
          </p>
        </div>
      </div>

      {/* Render Claims based on Detail Density */}
      {density !== 'SUMMARY' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold text-paper-text dark:text-darkroom-text flex items-center gap-2">
              <ShieldCheck className="size-5 text-indigo-500" /> Atomic Claims & Evidence Citations
            </h2>

            {/* In-Dossier Search & Domain Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto no-print">
              <div className="relative w-full sm:w-44">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-paper-muted dark:text-darkroom-muted" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter claims..."
                  className="w-full pl-8 pr-2.5 py-1 text-xs rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border text-paper-text dark:text-darkroom-text placeholder-paper-muted dark:placeholder-darkroom-muted focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border text-xs">
                {['ALL', 'FESTIVAL', 'ORGANIZER', 'PARTICIPANTS'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setActiveDomain(d)}
                    className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer font-mono text-[10px] ${
                      activeDomain === d
                        ? 'bg-indigo-600 text-white shadow-2xs font-medium'
                        : 'text-paper-muted dark:text-darkroom-muted hover:text-paper-text dark:hover:text-darkroom-text'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Claims List */}
          <div className="space-y-3">
            {filteredClaims.length === 0 ? (
              <div className="p-8 rounded-xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border text-center text-xs text-paper-muted dark:text-darkroom-muted">
                No claims matched your filter query "{searchFilter}".
              </div>
            ) : (
              filteredClaims.map((claim) => {
                const isExpanded = expandedClaim === claim.id || density === 'EVIDENCE';
                return (
                  <div
                    key={claim.id}
                    className="rounded-xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border transition-colors overflow-hidden"
                  >
                    <div className="p-4 flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getKindBadge(claim.claimKind)}
                          <span className="text-xs text-paper-muted dark:text-darkroom-muted font-mono">
                            {claim.category}
                          </span>
                          {claim.editionYear && (
                            <span className="text-xs font-mono text-paper-muted dark:text-darkroom-muted">
                              ({claim.editionYear})
                            </span>
                          )}
                        </div>
                        <div className="text-base font-medium text-paper-text dark:text-darkroom-text leading-relaxed">
                          {claim.statement}
                        </div>

                        {/* Inline Citations Row */}
                        {claim.evidence && claim.evidence.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {claim.evidence.map((ev, idx) => (
                              <CitationPopover key={idx} evidence={ev} sourceTier={2} />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-start no-print">
                        {getStatusBadge(claim.status)}

                        {/* Outreach Draft Inquiry Action */}
                        <button
                          onClick={() => onDraftOutreach(claim)}
                          className="p-1.5 rounded-lg text-paper-muted dark:text-darkroom-muted hover:bg-paper-card dark:hover:bg-darkroom-card hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                          title="Draft Verification Inquiry for this claim"
                        >
                          <Mail className="size-4" />
                        </button>

                        {density === 'STANDARD' && (
                          <button
                            onClick={() => setExpandedClaim(isExpanded ? null : claim.id)}
                            className="p-1.5 rounded-lg text-paper-muted dark:text-darkroom-muted hover:bg-paper-card dark:hover:bg-darkroom-card transition-colors cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Evidence Drawer */}
                    {isExpanded && (
                      <div className="p-4 bg-paper-card dark:bg-darkroom-card border-t border-paper-border dark:border-darkroom-border space-y-3 text-xs">
                        <div className="font-mono uppercase text-paper-muted dark:text-darkroom-muted text-[11px]">
                          Verbatim Quoted Excerpts ({claim.evidence.length})
                        </div>
                        {claim.evidence.map((ev, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-paper-text dark:text-darkroom-text">
                                {ev.sourceTitle || ev.sourceDomain}
                              </span>
                              {ev.sourceUrl && (
                                <a
                                  href={ev.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                                >
                                  View Source <ExternalLink className="size-3" />
                                </a>
                              )}
                            </div>
                            <blockquote className="text-paper-muted dark:text-darkroom-muted italic border-l-2 border-indigo-500/50 pl-2">
                              "{ev.exactExcerpt}"
                            </blockquote>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Filmmaker Checklist & Unresolved Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Due Diligence Checklist */}
        <div className="p-6 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-paper-border dark:border-darkroom-border pb-2">
            <ListChecks className="size-4" />
            <span>Filmmaker Action Checklist</span>
          </div>
          <ul className="space-y-3 text-base text-paper-text dark:text-darkroom-text">
            {dossier.filmmakerChecklist.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="font-mono text-emerald-500 font-bold">[{idx + 1}]</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Unresolved Questions */}
        <div className="p-6 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-paper-border dark:border-darkroom-border pb-2">
            <HelpCircle className="size-4" />
            <span>Unresolved Questions</span>
          </div>
          <ul className="space-y-3 text-base text-paper-text dark:text-darkroom-text">
            {dossier.unresolvedQuestions.map((q, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="font-mono text-amber-500 font-bold">•</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Discovered Footprint Drawer */}
      <div className="p-6 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-4">
        <div className="flex items-center justify-between border-b border-paper-border dark:border-darkroom-border pb-3">
          <span className="text-sm font-mono uppercase tracking-wider text-paper-muted dark:text-darkroom-muted">
            Discovered Web Sources ({sources.length})
          </span>
          <span className="text-xs font-mono text-paper-muted dark:text-darkroom-muted">
            Tier 1: Registry/Trade • Tier 2: General • Tier 3: Forum
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sources.map((src) => (
            <div key={src.id} className="p-3 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-500/10 text-neutral-600 dark:text-neutral-400">
                  Tier {src.sourceTier} • {src.domain}
                </span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
              <div className="font-medium text-xs text-paper-text dark:text-darkroom-text truncate">
                {src.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )}
</motion.div>
);
};
