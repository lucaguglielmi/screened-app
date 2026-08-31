import React from 'react';
import { AtomicClaim, DisputeRecord } from '../types/investigation';
import {
  AlertTriangle,
  Sparkles,
  Building2,
  DollarSign,
  Award,
  Users,
} from 'lucide-react';

interface Props {
  claims: AtomicClaim[];
  disputes: DisputeRecord[];
}

export const CredibilityRadar: React.FC<Props> = ({ claims, disputes }) => {
  // Calculate category scores dynamically
  const venueClaims = claims.filter(
    (c) =>
      c.researchDomain === 'VENUES' ||
      c.researchDomain === 'FESTIVAL' ||
      c.category.toLowerCase().includes('venue') ||
      c.category.toLowerCase().includes('screening'),
  );
  const feeClaims = claims.filter(
    (c) => c.category.toLowerCase().includes('fee') || c.category.toLowerCase().includes('prize'),
  );
  const organizerClaims = claims.filter(
    (c) =>
      c.researchDomain === 'ORGANIZER' ||
      c.category.toLowerCase().includes('jury') ||
      c.category.toLowerCase().includes('company'),
  );
  const participantClaims = claims.filter(
    (c) => c.researchDomain === 'PARTICIPANTS' || c.category.toLowerCase().includes('feedback'),
  );

  const isCorroboratedClaim = (c: AtomicClaim) => {
    const s = (c.status || '').toUpperCase();
    return s === 'CORROBORATED' || s === 'SUPPORTED' || s === 'VERIFIED_MATCH' || (c.evidence && c.evidence.length > 0);
  };

  const getFactualStats = (catClaims: AtomicClaim[], hasDispute: boolean) => {
    const total = catClaims.length;
    const corroborated = catClaims.filter(isCorroboratedClaim).length;
    const disputed = catClaims.filter((c) => c.status === 'DISPUTED').length;
    return {
      total,
      corroborated,
      disputed,
      hasDispute: hasDispute || disputed > 0,
      label: total === 0 ? 'Public Record Active' : `${corroborated}/${total} Verified Claims`,
    };
  };

  const hasVenueDispute = disputes.some(
    (d) =>
      d.pointOfContention.toLowerCase().includes('venue') ||
      d.pointOfContention.toLowerCase().includes('screening') ||
      d.category.toLowerCase().includes('venue'),
  ) || venueClaims.some(c => c.status === 'DISPUTED');

  const hasFeeDispute = disputes.some(
    (d) =>
      d.pointOfContention.toLowerCase().includes('fee') ||
      d.pointOfContention.toLowerCase().includes('prize') ||
      d.category.toLowerCase().includes('fee'),
  ) || feeClaims.some(c => c.status === 'DISPUTED');

  const hasOrganizerDispute = disputes.some(
    (d) =>
      d.pointOfContention.toLowerCase().includes('organizer') ||
      d.pointOfContention.toLowerCase().includes('company') ||
      d.pointOfContention.toLowerCase().includes('jury') ||
      d.category.toLowerCase().includes('organizer'),
  ) || organizerClaims.some(c => c.status === 'DISPUTED');

  const hasParticipantDispute = disputes.some(
    (d) =>
      d.pointOfContention.toLowerCase().includes('feedback') ||
      d.pointOfContention.toLowerCase().includes('participant') ||
      d.category.toLowerCase().includes('community'),
  ) || participantClaims.some(c => c.status === 'DISPUTED');

  const venueStats = getFactualStats(venueClaims, hasVenueDispute);
  const feeStats = getFactualStats(feeClaims, hasFeeDispute);
  const organizerStats = getFactualStats(organizerClaims, hasOrganizerDispute);
  const participantStats = getFactualStats(participantClaims, hasParticipantDispute);

  const getCategoryStatus = (catName: string, stats: { total: number; corroborated: number; hasDispute: boolean }) => {
    if (stats.hasDispute) {
      switch (catName) {
        case 'Screening Venue': return 'Disputed Venue Claims';
        case 'Fee & Prize Structure': return 'Fee Discrepancy Found';
        case 'Organizer & Directorships': return 'Directorship Inconsistencies';
        case 'Filmmaker Alumni Footprint': return 'Alumni Inquiries Flagged';
        default: return 'Disputed Claims Flagged';
      }
    }

    if (stats.corroborated > 0) {
      switch (catName) {
        case 'Screening Venue': return 'Physical Venue Corroborated';
        case 'Fee & Prize Structure': return 'Fee Schedule Corroborated';
        case 'Organizer & Directorships': return 'Corporate Identity Verified';
        case 'Filmmaker Alumni Footprint': return 'Alumni Footprint Corroborated';
        default: return 'Evidence Corroborated';
      }
    }

    // When corroboration is 0 and no dispute, hide this message
    return null;
  };

  const dimensions = [
    {
      name: 'Screening Venue',
      icon: Building2,
      stats: venueStats,
      status: getCategoryStatus('Screening Venue', venueStats),
      isRisk: venueStats.hasDispute,
    },
    {
      name: 'Fee & Prize Structure',
      icon: DollarSign,
      stats: feeStats,
      status: getCategoryStatus('Fee & Prize Structure', feeStats),
      isRisk: feeStats.hasDispute,
    },
    {
      name: 'Organizer & Directorships',
      icon: Award,
      stats: organizerStats,
      status: getCategoryStatus('Organizer & Directorships', organizerStats),
      isRisk: organizerStats.hasDispute,
    },
    {
      name: 'Filmmaker Alumni Footprint',
      icon: Users,
      stats: participantStats,
      status: getCategoryStatus('Filmmaker Alumni Footprint', participantStats),
      isRisk: participantStats.hasDispute,
    },
  ];

  const totalCorroborated = claims.filter(isCorroboratedClaim).length;

  return (
    <div className="py-3 border-b border-darkroom-border/30 pb-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-darkroom-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-indigo-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold">
            Evidence-Based Corroboration Summary
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">
            Verified Claims:
          </span>
          <span className={`font-semibold ${totalCorroborated > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
            {totalCorroborated}/{claims.length || '0'} Corroborated
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {dimensions.map((dim, idx) => {
          const Icon = dim.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-darkroom-surface/60 border border-darkroom-border/60 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs font-medium text-slate-200">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                    <Icon className="size-5 text-indigo-400" />
                  </div>
                  <span className="font-semibold text-white">{dim.name}</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-300">
                  {dim.stats.label}
                </span>
              </div>

              {dim.status && (
                <div className="flex items-center justify-between text-[11px] font-mono pt-0.5">
                  <span className={`inline-flex items-center gap-1.5 ${dim.isRisk ? 'text-orange-400 font-medium' : 'text-slate-300'}`}>
                    {dim.isRisk && (
                      <AlertTriangle className="size-3.5 shrink-0 text-orange-400" />
                    )}
                    <span className="truncate">{dim.status}</span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
