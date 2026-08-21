import React from 'react';
import { FestivalOpportunity } from '../types/investigation';
import { 
  Calendar, 
  MapPin, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';


interface Props {
  opportunity: FestivalOpportunity;
  onDeepScreen: (festivalName: string) => void;
}

export const OpportunityCard: React.FC<Props> = ({
  opportunity,
  onDeepScreen,
}) => {
  const getAccreditationBadge = (tag: string) => {
    switch (tag) {
      case 'BAFTA_QUALIFYING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">BAFTA Qualifying</span>;
      case 'BIFA_QUALIFYING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-semibold">BIFA Qualifying</span>;
      case 'ACADEMY_QUALIFYING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 font-semibold">Oscar Qualifying</span>;
      case 'FIAPF_ACCREDITED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">FIAPF Accredited</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20">Indie Circuit</span>;
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border hover:border-neutral-400 dark:hover:border-neutral-600 transition-all flex flex-col justify-between gap-4 shadow-sm">
      <div className="space-y-3">
        {/* Top Info */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-semibold text-paper-text dark:text-darkroom-text">
              {opportunity.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-mono text-paper-muted dark:text-darkroom-muted mt-0.5">
              <MapPin className="size-3 text-indigo-500" />
              <span>{opportunity.cityCountry}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-paper-text dark:text-darkroom-text font-mono">
              {opportunity.feeEstimate}
            </div>
            <div className="text-[10px] font-mono text-paper-muted dark:text-darkroom-muted">
              Estimated Entry
            </div>
          </div>
        </div>

        {/* Accreditation Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {opportunity.accreditationTags.map((tag, idx) => (
            <span key={idx}>{getAccreditationBadge(tag)}</span>
          ))}
        </div>

        {/* Deadline Banner */}
        <div className="p-2.5 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border flex items-center justify-between text-xs">
          <span className="font-mono text-paper-muted dark:text-darkroom-muted flex items-center gap-1.5">
            <Calendar className="size-3.5 text-indigo-500" />
            <span>{opportunity.deadlineTier}:</span>
          </span>
          <span className="font-semibold text-paper-text dark:text-darkroom-text font-mono">
            {opportunity.nextDeadline}
          </span>
        </div>

        {/* Strategic Fit Rationale */}
        <div className="space-y-1">
          <div className="text-[11px] font-mono uppercase text-paper-muted dark:text-darkroom-muted">
            Strategic Fit Rationale:
          </div>
          <p className="text-xs text-paper-text dark:text-darkroom-text leading-relaxed">
            {opportunity.strategicFitRationale}
          </p>
        </div>

        {/* Eligibility Notes */}
        {opportunity.eligibilityNotes && (
          <div className="text-[11px] text-paper-muted dark:text-darkroom-muted flex items-start gap-1.5 border-t border-paper-border dark:border-darkroom-border pt-2">
            <AlertCircle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>{opportunity.eligibilityNotes}</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t border-paper-border dark:border-darkroom-border pt-3 gap-2">
        {opportunity.officialDomain ? (
          <a
            href={`https://${opportunity.officialDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            Website <ExternalLink className="size-3" />
          </a>
        ) : (
          <span />
        )}

        <button
          onClick={() => onDeepScreen(opportunity.name)}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <ShieldCheck className="size-3.5" />
          <span>Deep Screen</span>
          <ArrowRight className="size-3" />
        </button>
      </div>
    </div>
  );
};
