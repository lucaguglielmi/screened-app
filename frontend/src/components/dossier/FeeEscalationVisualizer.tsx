import React from 'react';
import { TrendingUp, AlertTriangle, Coins, Clock, CheckCircle2 } from 'lucide-react';
import { FeeEscalationModel } from '../../types/investigation';

interface Props {
  model?: FeeEscalationModel;
  festivalName?: string;
}

export const FeeEscalationVisualizer: React.FC<Props> = ({ model, festivalName }) => {
  // Default fallback data if not provided
  const data: FeeEscalationModel = model || {
    currency: '£',
    tiers: [
      { tierName: 'Super Early', amount: 28, currency: '£', deadlineDate: '15 Jan', surgePercentage: 0 },
      { tierName: 'Early Bird', amount: 38, currency: '£', deadlineDate: '1 Mar', surgePercentage: 35 },
      { tierName: 'Regular', amount: 55, currency: '£', deadlineDate: '15 May', surgePercentage: 96 },
      { tierName: 'Late Window', amount: 85, currency: '£', deadlineDate: '1 Aug', surgePercentage: 203 },
      { tierName: 'Extended Late', amount: 98, currency: '£', deadlineDate: '15 Sep', surgePercentage: 250 },
    ],
    spikeAlert: 'Aggressive 203% fee surge detected in late submission windows (£28 -> £85).',
    averageMarketFee: '£32 average for UK indie short film entries',
    percentile: 92,
  };

  const maxAmount = Math.max(...data.tiers.map((t) => t.amount), 100);
  const minAmount = Math.min(...data.tiers.map((t) => t.amount), 20);
  const totalSurge = data.tiers.length > 1
    ? Math.round(((data.tiers[data.tiers.length - 1].amount - data.tiers[0].amount) / data.tiers[0].amount) * 100)
    : 0;

  const isPredatory = totalSurge >= 150 || (data.percentile && data.percentile >= 80);

  return (
    <div className="rounded-2xl bg-darkroom-surface/80 border border-darkroom-border/80 p-5 sm:p-6 space-y-5 shadow-xl transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-darkroom-border/60 pb-4">
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
            Tracks submission fee trajectory for {festivalName || 'this festival'} across deadline tiers to expose predatory late-entry inflation.
          </p>
        </div>

        {/* Total Surge Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isPredatory ? (
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
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {data.tiers.map((tier, idx) => {
            const heightPercent = Math.max(25, Math.round((tier.amount / maxAmount) * 100));
            const isLate = idx >= data.tiers.length - 2;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                  isLate && isPredatory
                    ? 'bg-orange-500/10 border-orange-500/40 shadow-sm'
                    : 'bg-darkroom-card/50 border-darkroom-border/60 hover:border-darkroom-border'
                }`}
              >
                {/* Tier Title & Deadline */}
                <div className="space-y-0.5">
                  <div className="text-[11px] font-mono uppercase text-slate-400 font-medium truncate">
                    {tier.tierName}
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
                  <div className="h-1.5 w-full bg-darkroom-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isLate && isPredatory
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500'
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

      {/* Comparative Market Benchmark Strip */}
      <div className="p-4 rounded-xl bg-darkroom-card/80 border border-darkroom-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-300">
          <TrendingUp className="size-4 text-orange-400 shrink-0" />
          <span>
            {data.spikeAlert || `Early bird entries begin at ${data.currency}${minAmount}, escalating to ${data.currency}${maxAmount}.`}
          </span>
        </div>

        {data.percentile && (
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] shrink-0">
            <span>Market Benchmark:</span>
            <span className="font-bold text-orange-400">{data.percentile}th percentile</span>
            <span className="text-slate-500">({data.averageMarketFee || '£32 UK avg'})</span>
          </div>
        )}
      </div>
    </div>
  );
};
