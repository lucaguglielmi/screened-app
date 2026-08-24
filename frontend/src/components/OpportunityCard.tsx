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
  Info,
} from 'lucide-react';
import { downloadFestivalIcs } from '../utils/calendar';

interface Props {
  opportunity: FestivalOpportunity;
  onDeepScreen: (festivalName: string) => void;
}

export const OpportunityCard: React.FC<Props> = ({ opportunity, onDeepScreen }) => {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const getAccreditationBadge = (tag: string) => {
    switch (tag) {
      case 'BAFTA_QUALIFYING':
        return (
          <div className="relative inline-block">
            <span
              onMouseEnter={() => setShowTooltip('BAFTA')}
              onMouseLeave={() => setShowTooltip(null)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-darkroom-card text-amber-300 font-semibold cursor-help inline-flex items-center gap-1.5 hover:bg-darkroom-border transition-colors"
            >
              BAFTA Qualifying <Info className="size-3 opacity-70" />
            </span>
            {showTooltip === 'BAFTA' && (
              <div className="absolute bottom-full left-0 mb-2 z-30 p-3 w-56 rounded-2xl bg-darkroom-bg text-slate-200 text-xs font-sans shadow-2xl pointer-events-none">
                Screening here qualifies UK short films and debuts for British Academy Film Awards
                consideration.
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
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-darkroom-card text-purple-300 font-semibold cursor-help inline-flex items-center gap-1.5 hover:bg-darkroom-border transition-colors"
            >
              BIFA Qualifying <Info className="size-3 opacity-70" />
            </span>
            {showTooltip === 'BIFA' && (
              <div className="absolute bottom-full left-0 mb-2 z-30 p-3 w-56 rounded-2xl bg-darkroom-bg text-slate-200 text-xs font-sans shadow-2xl pointer-events-none">
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
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-darkroom-card text-yellow-300 font-semibold cursor-help inline-flex items-center gap-1.5 hover:bg-darkroom-border transition-colors"
            >
              Oscar Qualifying <Info className="size-3 opacity-70" />
            </span>
            {showTooltip === 'OSCAR' && (
              <div className="absolute bottom-full left-0 mb-2 z-30 p-3 w-56 rounded-2xl bg-darkroom-bg text-slate-200 text-xs font-sans shadow-2xl pointer-events-none">
                Award winners in eligible categories qualify for Academy Awards nomination voting
                without commercial theatrical run.
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
              className="px-2.5 py-1 rounded-lg text-xs font-mono bg-darkroom-card text-blue-300 font-semibold cursor-help inline-flex items-center gap-1.5 hover:bg-darkroom-border transition-colors"
            >
              FIAPF Accredited <Info className="size-3 opacity-70" />
            </span>
            {showTooltip === 'FIAPF' && (
              <div className="absolute bottom-full left-0 mb-2 z-30 p-3 w-56 rounded-2xl bg-darkroom-bg text-slate-200 text-xs font-sans shadow-2xl pointer-events-none">
                Regulated by the International Federation of Film Producers Associations for global
                standard compliance.
              </div>
            )}
          </div>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-darkroom-card text-slate-300 font-medium">
            Indie Circuit
          </span>
        );
    }
  };

  const handleDownloadCalendar = () => {
    downloadFestivalIcs(
      opportunity.name,
      opportunity.deadlineTier,
      opportunity.nextDeadline,
      opportunity.feeEstimate,
      opportunity.officialDomain ? `https://${opportunity.officialDomain}` : undefined,
    );
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-darkroom-surface shadow-2xl shadow-black/80 flex flex-col justify-between gap-5 transition-all hover:bg-darkroom-card">
      <div className="space-y-4">
        {/* Top Info */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-xl font-bold text-white">{opportunity.name}</h3>
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mt-1">
              <MapPin className="size-3.5 text-tool-scout" />
              <span>{opportunity.cityCountry}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-sm font-bold text-white font-mono">{opportunity.feeEstimate}</div>
            <div className="text-[11px] font-mono text-slate-400">Estimated Entry</div>
          </div>
        </div>

        {/* Accreditation Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {opportunity.accreditationTags.map((tag, idx) => (
            <span key={idx}>{getAccreditationBadge(tag)}</span>
          ))}
        </div>

        {/* Deadline Banner with Add to Calendar */}
        <div className="p-3.5 rounded-2xl bg-darkroom-card flex items-center justify-between text-xs gap-2">
          <span className="font-mono text-slate-400 flex items-center gap-2">
            <Calendar className="size-4 text-tool-scout" />
            <span>{opportunity.deadlineTier}:</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-white font-mono text-sm">
              {opportunity.nextDeadline}
            </span>
            <button
              onClick={handleDownloadCalendar}
              title="Add deadline to Calendar (.ics)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-darkroom-border transition-colors cursor-pointer"
            >
              <Download className="size-4" />
            </button>
          </div>
        </div>

        {/* Strategic Fit Rationale */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase font-semibold text-slate-400">
            Strategic Fit Rationale:
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {opportunity.strategicFitRationale}
          </p>
        </div>

        {/* Eligibility Notes */}
        {opportunity.eligibilityNotes && (
          <div className="text-xs text-amber-300/90 flex items-start gap-2 pt-1 font-mono">
            <AlertCircle className="size-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{opportunity.eligibilityNotes}</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2 gap-2">
        {opportunity.officialDomain ? (
          <a
            href={`https://${opportunity.officialDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
          >
            Official Site <ExternalLink className="size-3" />
          </a>
        ) : (
          <span />
        )}

        <button
          onClick={() => onDeepScreen(opportunity.name)}
          className="px-4 py-2.5 rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition-all shadow-md shadow-[var(--color-tool-diligence)]/20 cursor-pointer"
        >
          <ShieldCheck className="size-4 text-slate-950" />
          <span>Deep Screen</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
};
