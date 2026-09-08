import React, { useState, useEffect } from 'react';
import { FileText, MapPin, Calendar, Globe, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CandidateEntity, InvestigationAuditHealth } from '../../types/investigation';
import { VerifiedTick } from '../ui/VerifiedTick';

interface Props {
  entity: CandidateEntity;
  factsCount: number;
  allegationsCount: number;
  corroboratedCount: number;
  disputesCount: number;
  auditHealth?: InvestigationAuditHealth;
  authenticityScore?: number;
}

export const DossierHero: React.FC<Props> = ({
  entity,
  factsCount,
  allegationsCount,
  corroboratedCount,
  disputesCount,
  auditHealth,
  authenticityScore = 68,
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const target = authenticityScore;
    const duration = 900;
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = target / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [authenticityScore]);

  const circumference = 2 * Math.PI * 34;
  const strokeOffset = circumference - (circumference * displayScore) / 100;

  const scoreColor =
    authenticityScore >= 75
      ? 'var(--color-tool-diligence)'
      : authenticityScore >= 50
      ? 'rgb(245, 158, 11)'
      : 'rgb(244, 63, 94)';

  const scoreLabel =
    authenticityScore >= 75
      ? 'Verified Operation'
      : authenticityScore >= 50
      ? 'Caution Advised'
      : 'Review Recommended';

  return (
    <div className="pt-2 pb-6 border-b border-white/[0.06] space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-tool-diligence">
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
                  className="hover:text-tool-diligence hover:underline break-all transition-colors"
                >
                  {entity.officialDomain}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Authenticity Score Ring */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.02] shadow-md shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="relative size-20 sm:size-22 shrink-0 flex items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 80 80">
              {/* Background circle track */}
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                className="text-white/10"
                fill="none"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke={scoreColor}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl sm:text-2xl font-bold font-mono text-white leading-none">
                {displayScore}
              </span>
              <span className="text-[9px] font-mono text-slate-400 leading-tight">/ 100</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium">
              Authenticity Index
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold" style={{ color: scoreColor }}>
              {authenticityScore >= 75 ? (
                <VerifiedTick size={13} />
              ) : authenticityScore >= 50 ? (
                <ShieldCheck className="size-3.5" />
              ) : (
                <AlertTriangle className="size-3.5" />
              )}
              <span>{scoreLabel}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Multi-Vector Vetted
            </div>
          </div>
        </div>
      </div>

      {/* Claim Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        <div className="py-2.5 px-3 rounded-xl bg-white/[0.02] text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Facts</div>
          <div className="text-base font-semibold text-slate-200 font-mono">{factsCount}</div>
        </div>
        <div className="py-2.5 px-3 rounded-xl bg-white/[0.02] text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Allegations</div>
          <div className="text-base font-semibold text-slate-400 font-mono">{allegationsCount}</div>
        </div>
        <div className="py-2.5 px-3 rounded-xl bg-white/[0.02] text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Corroborated</div>
          <div className="text-base font-semibold text-emerald-400 font-mono">{corroboratedCount}</div>
        </div>
        <div className="py-2.5 px-3 rounded-xl bg-white/[0.02] text-center">
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
