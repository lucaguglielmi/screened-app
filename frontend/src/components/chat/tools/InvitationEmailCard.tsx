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
      className="w-full max-w-2xl bg-paper-surface dark:bg-darkroom-surface rounded-2xl p-6 shadow-2xl space-y-4 my-2 text-zinc-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-rose-600/20 flex items-center justify-center text-rose-400">
            <MailWarning className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-semibold tracking-wider text-rose-400 uppercase">
                Invitation & Laurel Audit
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 font-mono font-semibold">
                Predatory Pattern Check
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-serif">{festivalName}</h3>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-zinc-400 font-mono">Domain & Fee Check</span>
        </div>
      </div>

      {/* Verdict & Signal Warning */}
      <div className="p-4 rounded-xl bg-paper-card dark:bg-darkroom-card space-y-2.5 text-xs">
        <div className="flex items-start space-x-2 text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{args.initial_verdict}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div className="flex items-center space-x-2 text-[11px] text-zinc-300 bg-paper-surface dark:bg-darkroom-surface p-2.5 rounded-lg">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-mono truncate">Sender: {senderDomain}</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-zinc-300 bg-paper-surface dark:bg-darkroom-surface p-2.5 rounded-lg">
            <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              Waiver Code: {args.fee_waiver_offered ? 'Yes (50-100% Discount)' : 'Standard Entry'}
            </span>
          </div>
        </div>
      </div>

      {/* Red Flag Indicators */}
      <div className="space-y-2 text-xs">
        <span className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
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
              className="flex items-start space-x-2.5 text-zinc-300 bg-paper-card dark:bg-darkroom-card p-3 rounded-xl"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="text-xs leading-relaxed">{signal}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={() => {
            soundEffects.playSuccess();
            onLaunchInvestigation(festivalName);
          }}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs font-mono shadow-lg shadow-rose-950/50 hover:shadow-rose-600/30 transition-all group cursor-pointer"
        >
          <span>Run Full 3-Domain Background Check on "{festivalName}"</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
