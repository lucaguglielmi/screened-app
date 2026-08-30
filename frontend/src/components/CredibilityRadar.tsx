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

  const getFactualStats = (catClaims: AtomicClaim[], hasDispute: boolean) => {
    const total = catClaims.length;
    const corroborated = catClaims.filter((c) => c.status === 'CORROBORATED' || c.status === 'SUPPORTED').length;
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

  const dimensions = [
    {
      name: 'Screening Venue',
      icon: Building2,
      stats: getFactualStats(venueClaims, hasVenueDispute),
      status: hasVenueDispute ? 'Disputed Venue Claims' : 'Physical Venue Corroborated',
      isRisk: hasVenueDispute,
    },
    {
      name: 'Fee & Prize Structure',
      icon: DollarSign,
      stats: getFactualStats(feeClaims, hasFeeDispute),
      status: hasFeeDispute ? 'Fee Discrepancy Found' : 'Fee Schedule Corroborated',
      isRisk: hasFeeDispute,
    },
    {
      name: 'Organizer & Directorships',
      icon: Award,
      stats: getFactualStats(organizerClaims, hasOrganizerDispute),
      status: hasOrganizerDispute ? 'Directorship Inconsistencies' : 'Verified Companies House Filing',
      isRisk: hasOrganizerDispute,
    },
    {
      name: 'Filmmaker Alumni Footprint',
      icon: Users,
      stats: getFactualStats(participantClaims, hasParticipantDispute),
      status: hasParticipantDispute ? 'Alumni Inquiries Flagged' : 'Alumni Premiers Documented',
      isRisk: hasParticipantDispute,
    },
  ];

  const totalCorroborated = claims.filter(c => c.status === 'CORROBORATED' || c.status === 'SUPPORTED').length;

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
          <span className="font-semibold text-emerald-400">
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

              <div className="flex items-center justify-between text-[11px] font-mono pt-0.5">
                <span className={`inline-flex items-center gap-1.5 ${dim.isRisk ? 'text-orange-400 font-medium' : 'text-slate-300'}`}>
                  {dim.isRisk && (
                    <AlertTriangle className="size-3.5 shrink-0 text-orange-400" />
                  )}
                  <span className="truncate">{dim.status}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
