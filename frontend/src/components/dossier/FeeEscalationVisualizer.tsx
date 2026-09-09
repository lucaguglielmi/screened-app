import React from 'react';
import { TrendingUp, AlertTriangle, Coins, Clock, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { FeeEscalationModel } from '../../types/investigation';

interface Props {
  model?: FeeEscalationModel;
  festivalName?: string;
  isSummary?: boolean;
  onNavigateToFull?: () => void;
}

export const FeeEscalationVisualizer: React.FC<Props> = ({
  model,
  festivalName,
  isSummary = false,
  onNavigateToFull,
}) => {
  if (!model || !model.tiers || model.tiers.length === 0) {
    return (
      <div className="rounded-2xl p-5 border border-darkroom-border bg-darkroom-surface/60 text-slate-400 text-xs flex items-center gap-3">
        <Info className="size-4 text-slate-500 shrink-0" />
        <span>No tiered fee schedule detected in public archives. The event may operate a flat-rate entry, free submission window, or unindexed submission deadlines.</span>
      </div>
    );
  }

  const data = model;

  if (data.tiers.length === 1) {
    const tier = data.tiers[0];
    return (
      <div className="rounded-2xl p-5 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs flex items-center gap-3">
        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
        <span>Flat submission fee of {tier.currency}{tier.amount} — no late deadline surge or price escalation detected.</span>
      </div>
    );
  }

  const maxAmount = Math.max(...data.tiers.map((t) => t.amount), 100);
  const minAmount = Math.min(...data.tiers.map((t) => t.amount), 20);
  const totalSurge = data.tiers.length > 1
    ? Math.round(((data.tiers[data.tiers.length - 1].amount - data.tiers[0].amount) / data.tiers[0].amount) * 100)
    : 0;

  const isHighSurge = totalSurge >= 150 || (data.percentile && data.percentile >= 80);

  const getDeadlineBadge = (tierIndex: number, deadlineDate?: string) => {
    if (!deadlineDate) return null;
    const now = new Date();
    const currentYear = now.getFullYear();
    let targetDate = new Date(deadlineDate);
    if (isNaN(targetDate.getTime())) {
      targetDate = new Date(`${deadlineDate} ${currentYear}`);
    }

    if (!isNaN(targetDate.getTime())) {
      const diffMs = targetDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        return { text: 'Passed', style: 'bg-slate-800/80 text-slate-400 border-slate-700/60' };
      } else if (diffDays <= 7) {
        return { text: `Closes in ${diffDays}d`, style: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold' };
      } else if (diffDays <= 30) {
        return { text: `In ${diffDays}d`, style: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
      } else {
        return { text: 'Upcoming', style: 'bg-darkroom-surface text-slate-400 border-darkroom-border/60' };
      }
    }

    if (tierIndex === 0) return { text: 'Passed', style: 'bg-slate-800/80 text-slate-400 border-slate-700/60' };
    if (tierIndex === 1) return { text: 'Active Tier', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold' };
    return { text: 'Upcoming', style: 'bg-darkroom-surface text-slate-400 border-darkroom-border/60' };
  };

  // Mode: Summary View (only show the +250% fee inflation, on click sends user to Full)
  if (isSummary) {
    return (
      <div
        onClick={onNavigateToFull}
        role={onNavigateToFull ? 'button' : undefined}
        tabIndex={onNavigateToFull ? 0 : undefined}
        onKeyDown={(e) => {
          if (onNavigateToFull && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onNavigateToFull();
          }
        }}
        className={`rounded-2xl bg-white/[0.02] border border-white/10 shadow-xl backdrop-blur-sm p-5 sm:p-6 space-y-4 transition-all ${
          onNavigateToFull ? 'cursor-pointer hover:bg-white/[0.04] hover:border-white/20 group' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-tool-diligence/10 border border-tool-diligence/20 text-tool-diligence">
              <Coins className="size-4" />
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
              Fee Escalation
            </h3>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-mono font-semibold">
            <AlertTriangle className="size-3.5" />
            <span>+{totalSurge}% Fee Inflation</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          {data.spikeAlert || `Significant ${totalSurge}% fee increase detected between early and late submission deadlines.`}
        </p>

        {onNavigateToFull && (
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-orange-400 group-hover:text-orange-300 transition-colors">
            <span>View complete fee tier schedule in Full Dossier</span>
            <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    );
  }

  // Mode: Full View
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/10 shadow-xl backdrop-blur-sm p-5 sm:p-6 space-y-4 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-tool-diligence/10 border border-tool-diligence/20 text-tool-diligence">
              <Coins className="size-4" />
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
              Fee Escalation Visualizer
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Tracks submission fees for {festivalName || 'this festival'} across deadline tiers to show late-entry fee increases.
          </p>
        </div>

        {/* Total Surge Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isHighSurge ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-mono font-semibold">
              <AlertTriangle className="size-3.5" />
              <span>+{totalSurge}% Fee Inflation</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold">
              <CheckCircle2 className="size-3.5" />
              <span>Standard Progression</span>
            </div>
          )}
        </div>
      </div>

      {/* Step / Timeline Chart */}
      <div className="space-y-3 pt-1">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {data.tiers.map((tier, idx) => {
            const heightPercent = Math.max(25, Math.round((tier.amount / maxAmount) * 100));
            const isLate = idx >= data.tiers.length - 2;
            const badge = getDeadlineBadge(idx, tier.deadlineDate);

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                  isLate && isHighSurge
                    ? 'bg-orange-500/10 border-orange-500/40 shadow-sm'
                    : 'bg-white/[0.03] border-white/10'
                }`}
              >
                {/* Tier Title & Deadline */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="text-[11px] font-mono uppercase text-slate-400 font-medium truncate">
                      {tier.tierName}
                    </div>
                    {badge && (
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${badge.style} shrink-0`}>
                        {badge.text}
                      </span>
                    )}
                  </div>
                  {tier.deadlineDate && (
                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="size-3" />
                      <span>{tier.deadlineDate}</span>
                    </div>
                  )}
                </div>

                {/* Amount & Bar */}
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isLate && isHighSurge
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500 shadow-xs'
                          : 'bg-tool-diligence'
                      }`}
                      style={{ width: `${heightPercent}%` }}
                    />
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="font-serif text-lg font-bold text-white">
                      {tier.currency}{tier.amount}
                    </span>
                    {tier.surgePercentage > 0 && (
                      <span
                        className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                          tier.surgePercentage >= 150
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-tool-diligence/15 text-tool-diligence'
                        }`}
                      >
                        +{tier.surgePercentage}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparative Market Benchmark Strip - Streamlined on two separate rows to prevent horizontal squashing */}
      <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2 text-xs">
        <div className="flex items-start sm:items-center gap-2.5 text-slate-300">
          <TrendingUp className="size-4 text-orange-400 shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-relaxed">
            {data.spikeAlert || `Early bird entries begin at ${data.currency}${minAmount}, escalating to ${data.currency}${maxAmount}.`}
          </span>
        </div>

        {data.percentile && (
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] pl-6.5 sm:pl-6.5">
            <span>Market Benchmark:</span>
            <span className="font-bold text-orange-400">{data.percentile}th percentile</span>
            <span className="text-slate-500">({data.averageMarketFee || '£32 UK avg'})</span>
          </div>
        )}
      </div>
    </div>
  );
};
