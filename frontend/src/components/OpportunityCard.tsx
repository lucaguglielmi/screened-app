import React, { useState } from 'react';
import { FestivalOpportunity } from '../types/investigation';
import { 
  Calendar, 
  MapPin, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck,
  AlertCircle,
  Download,
  Info
} from 'lucide-react';
import { downloadFestivalIcs } from '../utils/calendar';

interface Props {
  opportunity: FestivalOpportunity;
  onDeepScreen: (festivalName: string) => void;
}

export const OpportunityCard: React.FC<Props> = ({
  opportunity,
  onDeepScreen,
}) => {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const getAccreditationBadge = (tag: string) => {
    switch (tag) {
      case 'BAFTA_QUALIFYING':
        return (
          <div className="relative inline-block">
            <span 
              onMouseEnter={() => setShowTooltip('BAFTA')}
              onMouseLeave={() => setShowTooltip(null)}
              className="px-2.5 py-1 rounded-full text-xs font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold cursor-help inline-flex items-center gap-1.5"
            >
              BAFTA Qualifying <Info className="size-3 opacity-70" />
            </span>
            {showTooltip === 'BAFTA' && (
              <div className="absolute bottom-full left-0 mb-1.5 z-30 p-2.5 w-56 rounded-xl bg-[#141731] text-slate-100 text-xs font-sans shadow-xl border border-[#22274C] pointer-events-none">
                Screening here qualifies UK short films and debuts for British Academy Film Awards consideration.
              </div>
            )}
          </div>
        );
      case 'BIFA_QUALIFYING':
        return (
          <div className="relative inline-block">
            <span 
              onMouseEnter={() => setShowTooltip('BIFA')}
              onMouseLeave={() => setShowTooltip(null)}
              className="px-2.5 py-1 rounded-full text-xs font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold cursor-help inline-flex items-center gap-1.5"
            >
              BIFA Qualifying <Info className="size-3 opacity-70" />
            </span>
            {showTooltip === 'BIFA' && (
              <div className="absolute bottom-full left-0 mb-1.5 z-30 p-2.5 w-56 rounded-xl bg-[#141731] text-slate-100 text-xs font-sans shadow-xl border border-[#22274C] pointer-events-none">
                Recognized on the British Independent Film Awards qualifying festival list.
              </div>
            )}
          </div>
        );
      case 'ACADEMY_QUALIFYING':
        return (
          <div className="relative inline-block">
            <span 
              onMouseEnter={() => setShowTooltip('OSCAR')}
              onMouseLeave={() => setShowTooltip(null)}
              className="px-2.5 py-1 rounded-full text-xs font-mono bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 font-semibold cursor-help inline-flex items-center gap-1.5"
            >
              Oscar Qualifying <Info className="size-3 opacity-70" />
            </span>
            {showTooltip === 'OSCAR' && (
              <div className="absolute bottom-full left-0 mb-1.5 z-30 p-2.5 w-56 rounded-xl bg-[#141731] text-slate-100 text-xs font-sans shadow-xl border border-[#22274C] pointer-events-none">
                Award winners in eligible categories qualify for Academy Awards nomination voting without commercial theatrical run.
              </div>
            )}
          </div>
        );
      case 'FIAPF_ACCREDITED':
        return (
          <div className="relative inline-block">
            <span 
              onMouseEnter={() => setShowTooltip('FIAPF')}
              onMouseLeave={() => setShowTooltip(null)}
              className="px-2.5 py-1 rounded-full text-xs font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold cursor-help inline-flex items-center gap-1.5"
            >
              FIAPF Accredited <Info className="size-3 opacity-70" />
            </span>
            {showTooltip === 'FIAPF' && (
              <div className="absolute bottom-full left-0 mb-1.5 z-30 p-2.5 w-56 rounded-xl bg-[#141731] text-slate-100 text-xs font-sans shadow-xl border border-[#22274C] pointer-events-none">
                Regulated by the International Federation of Film Producers Associations for global standard compliance.
              </div>
            )}
          </div>
        );
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-slate-500/15 text-slate-300 border border-slate-500/30">Indie Circuit</span>;
    }
  };

  const handleDownloadCalendar = () => {
    downloadFestivalIcs(
      opportunity.name,
      opportunity.deadlineTier,
      opportunity.nextDeadline,
      opportunity.feeEstimate,
      opportunity.officialDomain ? `https://${opportunity.officialDomain}` : undefined
    );
  };

  return (
    <div className="p-6 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border hover:border-[#F43F5E]/50 transition-all flex flex-col justify-between gap-4 shadow-sm">
      <div className="space-y-3.5">
        {/* Top Info */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-xl font-bold text-paper-text dark:text-darkroom-text">
              {opportunity.name}
            </h3>
            <div className="flex items-center gap-1.5 text-sm font-mono text-paper-muted dark:text-darkroom-muted mt-1">
              <MapPin className="size-3.5 text-[#F43F5E]" />
              <span>{opportunity.cityCountry}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-bold text-paper-text dark:text-darkroom-text font-mono">
              {opportunity.feeEstimate}
            </div>
            <div className="text-xs font-mono text-paper-muted dark:text-darkroom-muted">
              Estimated Entry
            </div>
          </div>
        </div>

        {/* Accreditation Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {opportunity.accreditationTags.map((tag, idx) => (
            <span key={idx}>{getAccreditationBadge(tag)}</span>
          ))}
        </div>

        {/* Deadline Banner with Add to Calendar */}
        <div className="p-3 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border flex items-center justify-between text-sm gap-2">
          <span className="font-mono text-paper-muted dark:text-darkroom-muted flex items-center gap-1.5">
            <Calendar className="size-4 text-[#F43F5E]" />
            <span>{opportunity.deadlineTier}:</span>
          </span>
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-paper-text dark:text-darkroom-text font-mono">
              {opportunity.nextDeadline}
            </span>
            <button
              onClick={handleDownloadCalendar}
              title="Add deadline to Calendar (.ics)"
              className="p-1.5 rounded-lg text-paper-muted dark:text-darkroom-muted hover:text-[#F43F5E] hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Download className="size-4" />
            </button>
          </div>
        </div>

        {/* Strategic Fit Rationale */}
        <div className="space-y-1.5">
          <div className="text-xs font-mono uppercase font-semibold text-paper-muted dark:text-darkroom-muted">
            Strategic Fit Rationale:
          </div>
          <p className="text-base text-paper-text dark:text-darkroom-text leading-relaxed">
            {opportunity.strategicFitRationale}
          </p>
        </div>

        {/* Eligibility Notes */}
        {opportunity.eligibilityNotes && (
          <div className="text-sm text-paper-muted dark:text-darkroom-muted flex items-start gap-2 border-t border-paper-border dark:border-darkroom-border pt-2.5">
            <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <span>{opportunity.eligibilityNotes}</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t border-paper-border dark:border-darkroom-border pt-4 gap-2">
        {opportunity.officialDomain ? (
          <a
            href={`https://${opportunity.officialDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-indigo-500 hover:underline inline-flex items-center gap-1"
          >
            Website <ExternalLink className="size-3.5" />
          </a>
        ) : (
          <span />
        )}

        <button
          onClick={() => onDeepScreen(opportunity.name)}
          className="px-4 py-2 rounded-xl bg-[#00D29E] hover:bg-[#00B887] text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-[#00D29E]/20 cursor-pointer"
        >
          <ShieldCheck className="size-4 text-slate-950" />
          <span>Deep Screen</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
};
