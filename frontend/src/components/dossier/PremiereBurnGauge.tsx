import React from 'react';
import { Award, AlertTriangle, ShieldCheck, Flame, Info, CheckCircle2, XCircle } from 'lucide-react';
import { PremiereRiskAssessment } from '../../types/investigation';

interface Props {
  assessment?: PremiereRiskAssessment;
  festivalName?: string;
}

export const PremiereBurnGauge: React.FC<Props> = ({ assessment, festivalName = 'This Festival' }) => {
  // Default fallback fixture if not explicitly parsed
  const data: PremiereRiskAssessment = assessment || {
    riskScore: 78,
    riskLevel: 'HIGH_BURN_RISK',
    premiereDemand: 'World or National Premiere Requested',
    accreditationStatus: 'Unaccredited (Non-BAFTA / Non-BIFA)',
    buyerPressFootprint: 'Limited local press; zero verified acquisitions',
    verdictRationale:
      'The festival requests premiere exclusivity but lacks the distributor attendance, press accreditation, or industry standing to launch a theatrical premiere.',
    recommendation:
      'Do not burn your World or National Premiere here. Save premiere status for accredited festivals and submit here only for second-window catalog runs.',
  };

  const isHigh = data.riskLevel === 'HIGH_BURN_RISK' || data.riskScore >= 66;
  const isModerate = (data.riskLevel === 'MODERATE_RISK' || (data.riskScore >= 36 && data.riskScore < 66)) && !isHigh;

  const colorConfig = isHigh
    ? {
        badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        barColor: 'from-amber-500 via-orange-500 to-rose-500',
        textColor: 'text-rose-400',
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
        title: 'High Burn Risk',
        icon: Flame,
      }
    : isModerate
      ? {
          badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          barColor: 'from-emerald-500 to-amber-500',
          textColor: 'text-amber-400',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
          title: 'Moderate Risk',
          icon: AlertTriangle,
        }
      : {
          badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          barColor: 'from-emerald-600 to-emerald-400',
          textColor: 'text-emerald-400',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
          title: 'Protected Leverage',
          icon: ShieldCheck,
        };

  const IconComponent = colorConfig.icon;

  return (
    <div
      className={`rounded-2xl bg-darkroom-surface/80 border border-darkroom-border/80 p-5 sm:p-6 space-y-5 transition-all ${colorConfig.glow}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-darkroom-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Flame className="size-4" />
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
              Premiere Value vs. Burn Risk
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Quantifies whether surrendering premiere rights to {festivalName} is justified by festival industry leverage.
          </p>
        </div>

        {/* Status Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-semibold uppercase tracking-wider self-start sm:self-auto ${colorConfig.badgeBg}`}
        >
          <IconComponent className="size-3.5" />
          <span>{colorConfig.title} ({data.riskScore}/100)</span>
        </div>
      </div>

      {/* Meter Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-mono text-slate-400">
          <span>Protected Premiere (0)</span>
          <span className="font-bold text-slate-200">{data.riskScore} / 100</span>
          <span>Critical Burn (100)</span>
        </div>
        <div className="h-3 w-full bg-darkroom-card rounded-full overflow-hidden p-0.5 border border-darkroom-border/80">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${colorConfig.barColor} transition-all duration-700 ease-out`}
            style={{ width: `${Math.max(5, Math.min(100, data.riskScore))}%` }}
          />
        </div>
      </div>

      {/* 3 Parameter Breakdown Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-darkroom-card/50 border border-darkroom-border/60 space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <Info className="size-3 text-slate-400" />
            <span>Exclusivity Demand</span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-200 line-clamp-2">
            {data.premiereDemand}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-darkroom-card/50 border border-darkroom-border/60 space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <Award className="size-3 text-slate-400" />
            <span>Accreditation Standing</span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-200 line-clamp-2">
            {data.accreditationStatus}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-darkroom-card/50 border border-darkroom-border/60 space-y-1">
          <div className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="size-3 text-slate-400" />
            <span>Buyer & Press Density</span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-200 line-clamp-2">
            {data.buyerPressFootprint}
          </div>
        </div>
      </div>

      {/* Rationale & Actionable Advice Card */}
      <div className="p-4 rounded-xl bg-darkroom-card/80 border border-darkroom-border/80 space-y-2.5">
        <div className="flex items-start gap-2.5">
          {isHigh ? (
            <XCircle className="size-4 text-rose-400 shrink-0 mt-0.5" />
          ) : isModerate ? (
            <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
              Verdict Rationale
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {data.verdictRationale}
            </p>
          </div>
        </div>

        {data.recommendation && (
          <div className="mt-2 pt-2.5 border-t border-darkroom-border/60 flex items-start gap-2.5 text-xs sm:text-sm">
            <span className="font-mono text-tool-diligence font-bold uppercase shrink-0">
              Guidance:
            </span>
            <span className="text-slate-200 leading-relaxed font-sans">
              {data.recommendation}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
