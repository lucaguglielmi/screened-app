import React, { useState } from 'react';
import { 
  AtomicClaim, 
  CandidateEntity, 
  DossierReport, 
  DisputeRecord, 
  SourceRecord 
} from '../types/investigation';
import { ContradictionPanel } from './ContradictionPanel';
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
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  entity: CandidateEntity;
  dossier: DossierReport;
  claims: AtomicClaim[];
  sources: SourceRecord[];
  disputes: DisputeRecord[];
  onNewInvestigation: () => void;
}

export const EvidenceDossier: React.FC<Props> = ({
  entity,
  dossier,
  claims,
  sources,
  disputes,
  onNewInvestigation,
}) => {
  const [activeDomain, setActiveDomain] = useState<string>('ALL');
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);

  const filteredClaims = activeDomain === 'ALL'
    ? claims
    : claims.filter((c) => c.researchDomain === activeDomain);

  const factsCount = claims.filter((c) => c.claimKind === 'FACT').length;
  const allegationsCount = claims.filter((c) => c.claimKind === 'ALLEGATION').length;
  const opinionsCount = claims.filter((c) => c.claimKind === 'OPINION').length;
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
      {/* Top Profile Card */}
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

          <button
            onClick={onNewInvestigation}
            className="px-4 py-2 rounded-xl bg-paper-card dark:bg-darkroom-card hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-medium text-paper-text dark:text-darkroom-text border border-paper-border dark:border-darkroom-border transition-colors cursor-pointer"
          >
            New Search
          </button>
        </div>

        {/* At-a-Glance Count Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center">
          <div className="p-3 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border">
            <div className="text-[10px] font-mono uppercase text-paper-muted dark:text-darkroom-muted">Facts</div>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{factsCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border">
            <div className="text-[10px] font-mono uppercase text-paper-muted dark:text-darkroom-muted">Allegations</div>
            <div className="text-lg font-semibold text-rose-600 dark:text-rose-400 mt-0.5">{allegationsCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border">
            <div className="text-[10px] font-mono uppercase text-paper-muted dark:text-darkroom-muted">Opinions</div>
            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400 mt-0.5">{opinionsCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border">
            <div className="text-[10px] font-mono uppercase text-paper-muted dark:text-darkroom-muted">Corroborated</div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{corroboratedCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border">
            <div className="text-[10px] font-mono uppercase text-paper-muted dark:text-darkroom-muted">Disputes</div>
            <div className="text-lg font-semibold text-amber-600 dark:text-amber-400 mt-0.5">{disputes.length}</div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
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
            <span>Festival & Screenings</span>
          </div>
          <p className="text-xs sm:text-sm text-paper-text dark:text-darkroom-text leading-relaxed">
            {dossier.festivalOverview}
          </p>
        </div>

        {/* Organizer Domain */}
        <div className="p-5 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-paper-border dark:border-darkroom-border pb-2">
            <Building2 className="size-4" />
            <span>Organizer & Entity</span>
          </div>
          <p className="text-xs sm:text-sm text-paper-text dark:text-darkroom-text leading-relaxed">
            {dossier.organizerProfile}
          </p>
        </div>

        {/* Participants Domain */}
        <div className="p-5 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-b border-paper-border dark:border-darkroom-border pb-2">
            <Users className="size-4" />
            <span>Community & Feedback</span>
          </div>
          <p className="text-xs sm:text-sm text-paper-text dark:text-darkroom-text leading-relaxed">
            {dossier.participantFeedback}
          </p>
        </div>
      </div>

      {/* Verified Claims Section with Domain Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold text-paper-text dark:text-darkroom-text flex items-center gap-2">
            <ShieldCheck className="size-5 text-indigo-500" /> Atomic Claims & Evidence Citations
          </h2>

          {/* Domain Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border text-xs">
            {['ALL', 'FESTIVAL', 'ORGANIZER', 'PARTICIPANTS'].map((d) => (
              <button
                key={d}
                onClick={() => setActiveDomain(d)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-mono text-[11px] ${
                  activeDomain === d
                    ? 'bg-indigo-600 text-white shadow-xs font-medium'
                    : 'text-paper-muted dark:text-darkroom-muted hover:text-paper-text dark:hover:text-darkroom-text'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Claims Accordion List */}
        <div className="space-y-3">
          {filteredClaims.map((claim) => {
            const isExpanded = expandedClaim === claim.id;
            return (
              <div
                key={claim.id}
                className="rounded-xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border transition-colors overflow-hidden"
              >
                <div
                  onClick={() => setExpandedClaim(isExpanded ? null : claim.id)}
                  className="p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-paper-card dark:hover:bg-darkroom-card transition-colors"
                >
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
                    <div className="text-sm font-medium text-paper-text dark:text-darkroom-text">
                      {claim.statement}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {getStatusBadge(claim.status)}
                    {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </div>
                </div>

                {/* Evidence Drawer */}
                {isExpanded && (
                  <div className="p-4 bg-paper-card dark:bg-darkroom-card border-t border-paper-border dark:border-darkroom-border space-y-3 text-xs">
                    <div className="font-mono uppercase text-paper-muted dark:text-darkroom-muted text-[11px]">
                      Verbatim Excerpts ({claim.evidence.length})
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
                              Source <ExternalLink className="size-3" />
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
          })}
        </div>
      </div>

      {/* Filmmaker Checklist & Unresolved Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Due Diligence Checklist */}
        <div className="p-5 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-paper-border dark:border-darkroom-border pb-2">
            <ListChecks className="size-4" />
            <span>Filmmaker Action Checklist</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-paper-text dark:text-darkroom-text">
            {dossier.filmmakerChecklist.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-mono text-emerald-500 font-bold">[{idx + 1}]</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Unresolved Questions */}
        <div className="p-5 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-paper-border dark:border-darkroom-border pb-2">
            <HelpCircle className="size-4" />
            <span>Unresolved Questions</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-paper-text dark:text-darkroom-text">
            {dossier.unresolvedQuestions.map((q, idx) => (
              <li key={idx} className="flex items-start gap-2">
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
    </motion.div>
  );
};
