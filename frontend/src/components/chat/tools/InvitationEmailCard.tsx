import React from 'react';
import { motion } from 'motion/react';
import {
  MailWarning,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Globe,
  DollarSign,
} from 'lucide-react';
import { InvitationEmailArgs } from '../../../types/chat';
import { soundEffects } from '../../../utils/audio';

interface InvitationEmailCardProps {
  args: InvitationEmailArgs;
  onLaunchInvestigation: (festivalName: string) => void;
}

export const InvitationEmailCard: React.FC<InvitationEmailCardProps> = ({
  args,
  onLaunchInvestigation,
}) => {
  const festivalName = args.festival_claimed || 'Festival Organizers';
  const senderDomain = args.sender_domain || 'festival-submissions.com';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl my-2 p-5 sm:p-6 rounded-2xl border border-tool-diligence/30 bg-gradient-to-br from-tool-diligence/10 via-darkroom-surface to-darkroom-bg shadow-xl backdrop-blur-md transition-all hover:border-tool-diligence/60 text-slate-100 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-tool-diligence/20 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-tool-diligence/20 flex items-center justify-center text-tool-diligence font-bold border border-tool-diligence/40">
            <MailWarning className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold tracking-wider text-tool-diligence uppercase">
                Invitation & Laurel Audit
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-tool-diligence/15 text-tool-diligence border border-tool-diligence/30 font-mono font-semibold">
                Predatory Pattern Check
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-serif">{festivalName}</h3>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs text-slate-400 font-mono">Domain & Fee Check</span>
        </div>
      </div>

      {/* Verdict & Signal Warning */}
      <div className="p-4 rounded-xl bg-darkroom-bg border border-tool-diligence/20 space-y-3 text-xs">
        <div className="flex items-start space-x-2 text-slate-200 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{args.initial_verdict}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div className="flex items-center space-x-2 text-xs text-slate-300 bg-darkroom-surface p-2.5 rounded-lg border border-darkroom-border">
            <Globe className="w-3.5 h-3.5 text-tool-diligence shrink-0" />
            <span className="font-mono truncate">Sender: {senderDomain}</span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-300 bg-darkroom-surface p-2.5 rounded-lg border border-darkroom-border">
            <DollarSign className="w-3.5 h-3.5 text-tool-diligence shrink-0" />
            <span>
              Waiver: {args.fee_waiver_offered ? 'Yes (50-100% Discount)' : 'Standard Entry'}
            </span>
          </div>
        </div>
      </div>

      {/* Red Flag Indicators */}
      <div className="space-y-2 text-xs">
        <span className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Forensic Indicators Detected:
        </span>
        <div className="space-y-2">
          {(
            args.red_flag_signals || [
              'Unsolicited bulk email sent to unreleased film contact',
              'Offers free entry but charges £100+ for winner laurel certification',
              'No confirmed theatrical screening venue listed on domain',
            ]
          ).map((signal, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-2.5 text-slate-200 bg-darkroom-bg border border-tool-diligence/15 p-3 rounded-xl"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-xs leading-relaxed">{signal}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-3 border-t border-darkroom-border">
        <button
          onClick={() => {
            soundEffects.playSuccess();
            onLaunchInvestigation(festivalName);
          }}
          className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover text-slate-950 font-bold text-base shadow-md shadow-[var(--color-tool-diligence)]/30 transition-all hover:brightness-110 active:scale-95 group cursor-pointer"
        >
          <span>Run Full 3-Domain Background Check on "{festivalName}"</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
