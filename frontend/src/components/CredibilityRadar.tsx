import React from 'react';
import { AtomicClaim, DisputeRecord } from '../types/investigation';
import {
  ShieldCheck,
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

  const calcScore = (catClaims: AtomicClaim[], hasDispute: boolean) => {
    if (catClaims.length === 0) return 75; // baseline if no specific claims
    const corroborated = catClaims.filter((c) => c.status === 'CORROBORATED').length;
    const supported = catClaims.filter((c) => c.status === 'SUPPORTED').length;
    const disputed = catClaims.filter((c) => c.status === 'DISPUTED').length;
    let score = Math.round(
      ((corroborated * 1.0 + supported * 0.8) / Math.max(1, catClaims.length)) * 100,
    );
    if (hasDispute || disputed > 0) score = Math.min(score, 45);
    return Math.max(25, Math.min(100, score));
  };

  const hasVenueDispute = disputes.some(
    (d) =>
      d.pointOfContention.toLowerCase().includes('venue') ||
      d.pointOfContention.toLowerCase().includes('screening') ||
      d.category.toLowerCase().includes('venue'),
  );
  const hasFeeDispute = disputes.some(
    (d) =>
      d.pointOfContention.toLowerCase().includes('fee') ||
      d.pointOfContention.toLowerCase().includes('prize') ||
      d.category.toLowerCase().includes('fee'),
  );
  const hasOrganizerDispute = disputes.some(
    (d) =>
      d.pointOfContention.toLowerCase().includes('organizer') ||
      d.pointOfContention.toLowerCase().includes('company') ||
      d.category.toLowerCase().includes('organizer'),
  );
  const hasParticipantDispute = disputes.some(
    (d) =>
      d.pointOfContention.toLowerCase().includes('feedback') ||
      d.pointOfContention.toLowerCase().includes('participant') ||
      d.category.toLowerCase().includes('community'),
  );

  const dimensions = [
    {
      name: 'Screening Venue',
      icon: Building2,
      score: calcScore(venueClaims, hasVenueDispute),
      status: hasVenueDispute ? 'Disputed Venue Claims' : 'Physical Venue Corroborated',
      isRisk: hasVenueDispute,
    },
    {
      name: 'Fee & Prize Structure',
      icon: DollarSign,
      score: calcScore(feeClaims, hasFeeDispute),
      status: hasFeeDispute ? 'Fee Discrepancy Found' : 'Fee Schedule Clear',
      isRisk: hasFeeDispute,
    },
    {
      name: 'Organizer & Jury',
      icon: Award,
      score: calcScore(organizerClaims, hasOrganizerDispute),
      status: hasOrganizerDispute ? 'Track Record Questions' : 'Verified Company Filing',
      isRisk: hasOrganizerDispute,
    },
    {
      name: 'Filmmaker Sentiment',
      icon: Users,
      score: calcScore(participantClaims, hasParticipantDispute),
      status: hasParticipantDispute ? 'Community Red Flags' : 'Positive Participant Accounts',
      isRisk: hasParticipantDispute,
    },
  ];

  const overallTransparency = Math.round(
    dimensions.reduce((acc, d) => acc + d.score, 0) / dimensions.length,
  );

  return (
    <div className="p-6 rounded-2xl bg-darkroom-surface border border-darkroom-border space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-darkroom-border pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-indigo-600 text-indigo-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-darkroom-text font-semibold">
            Evidence-Based Transparency Radar
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-darkroom-muted">
            Overall Index:
          </span>
          <span
            className={`text-sm font-mono font-bold px-2 py-0.5 rounded-full ${
              overallTransparency >= 75
                ? 'bg-emerald-500/10 text-emerald-600 text-emerald-400 border border-emerald-500/20'
                : overallTransparency >= 50
                  ? 'bg-amber-500/10 text-amber-600 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-600 text-rose-400 border border-rose-500/20'
            }`}
          >
            {overallTransparency}/100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {dimensions.map((dim, idx) => {
          const Icon = dim.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-darkroom-card border border-darkroom-border space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-darkroom-text">
                  <Icon className="size-3.5 text-indigo-500" />
                  <span>{dim.name}</span>
                </div>
                <span className="font-mono text-xs font-semibold text-darkroom-text">
                  {dim.score}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-paper-border bg-darkroom-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    dim.score >= 70
                      ? 'bg-emerald-500'
                      : dim.score >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                  }`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono">
                <span
                  className={`inline-flex items-center gap-1 ${
                    dim.isRisk
                      ? 'text-rose-600 text-rose-400'
                      : 'text-darkroom-muted'
                  }`}
                >
                  {dim.isRisk ? (
                    <AlertTriangle className="size-3 shrink-0" />
                  ) : (
                    <ShieldCheck className="size-3 shrink-0 text-emerald-500" />
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
