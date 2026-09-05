import React from 'react';
import { FileText, MapPin, Calendar, Globe, AlertTriangle } from 'lucide-react';
import { CandidateEntity, InvestigationAuditHealth } from '../../types/investigation';

interface Props {
  entity: CandidateEntity;
  factsCount: number;
  allegationsCount: number;
  corroboratedCount: number;
  disputesCount: number;
  auditHealth?: InvestigationAuditHealth;
}

export const DossierHero: React.FC<Props> = ({
  entity,
  factsCount,
  allegationsCount,
  corroboratedCount,
  disputesCount,
  auditHealth,
}) => {
  return (
    <div className="pt-2 pb-6 border-b border-darkroom-border/40 space-y-4">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400">
            <FileText className="size-3.5" />
            <span>Due Diligence Dossier</span>
          </div>
          <h1 className="flex items-center flex-wrap gap-2 sm:gap-3 font-serif text-3xl sm:text-4xl font-semibold text-white tracking-tight break-words">
            <span>{entity.name}</span>
            {entity.name === 'Pinco Pallino Film Festival' && (
              <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-orange-400 border border-orange-500/20 tracking-normal whitespace-nowrap">
                Demo
              </span>
            )}
          </h1>

          {/* Editorial Metadata Bar */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-slate-400 pt-1">
            {entity.cityCountry && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-slate-400 shrink-0" />
                <span className="break-words">{entity.cityCountry}</span>
              </div>
            )}
            {entity.foundedYear && (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-slate-400 shrink-0" />
                <span>Est. {entity.foundedYear}</span>
              </div>
            )}
            {entity.officialDomain && (
              <div className="flex items-center gap-1.5 min-w-0">
                <Globe className="size-3.5 text-slate-400 shrink-0" />
                <a
                  href={`https://${entity.officialDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-300 hover:underline break-all"
                >
                  {entity.officialDomain}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Claim Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        <div className="py-2.5 px-3 rounded-xl bg-darkroom-surface/60 border border-darkroom-border/60 text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Facts</div>
          <div className="text-base font-semibold text-slate-200 font-mono">{factsCount}</div>
        </div>
        <div className="py-2.5 px-3 rounded-xl bg-darkroom-surface/60 border border-darkroom-border/60 text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Allegations</div>
          <div className="text-base font-semibold text-slate-400 font-mono">{allegationsCount}</div>
        </div>
        <div className="py-2.5 px-3 rounded-xl bg-darkroom-surface/60 border border-darkroom-border/60 text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Corroborated</div>
          <div className="text-base font-semibold text-emerald-400 font-mono">{corroboratedCount}</div>
        </div>
        <div className="py-2.5 px-3 rounded-xl bg-darkroom-surface/60 border border-darkroom-border/60 text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Disputes</div>
          <div className="text-base font-semibold text-orange-400 font-mono">{disputesCount}</div>
        </div>
      </div>

      {/* Diagnostic Anomaly Notice */}
      {auditHealth && (auditHealth.status === 'EMPTY_WARNING' || auditHealth.status === 'DEGRADED') && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs font-mono text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-amber-200">
              Pipeline Health Notice ({auditHealth.status})
            </div>
            {auditHealth.warnings && auditHealth.warnings.length > 0 ? (
              <ul className="list-disc list-inside space-y-0.5 text-amber-300/90 text-[11px]">
                {auditHealth.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            ) : (
              <p className="text-amber-300/90 text-[11px]">
                Some research vectors returned incomplete signals.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
