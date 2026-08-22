import React from 'react';
import { motion } from 'motion/react';
import { 
  MailWarning, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowRight, 
  Globe, 
  DollarSign
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
      className="w-full max-w-2xl bg-[#0B0F19] border border-[#1E2545] rounded-2xl p-5 shadow-xl space-y-4 my-2 text-zinc-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <MailWarning className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-semibold tracking-wider text-rose-400 uppercase">
                Invitation & Laurel Audit
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
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
      <div className="p-3 rounded-xl bg-[#151B2E] border border-rose-900 space-y-2 text-xs">
        <div className="flex items-start space-x-2 text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{args.initial_verdict}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div className="flex items-center space-x-2 text-[11px] text-zinc-300 bg-void/60 p-2 rounded-lg border border-zinc-800">
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-mono truncate">Sender: {senderDomain}</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-zinc-300 bg-void/60 p-2 rounded-lg border border-zinc-800">
            <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
            <span>Waiver Code: {args.fee_waiver_offered ? 'Yes (50-100% Discount)' : 'Standard Entry'}</span>
          </div>
        </div>
      </div>

      {/* Red Flag Indicators */}
      <div className="space-y-1.5 text-xs">
        <span className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
          Forensic Indicators Detected:
        </span>
        <div className="space-y-1.5">
          {(args.red_flag_signals || [
            'Unsolicited bulk email sent to unreleased film contact',
            'Offers free entry but charges £100+ for winner laurel certification',
            'No confirmed theatrical screening venue listed on domain',
          ]).map((signal, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-zinc-300 bg-[#151B2E] p-2 rounded-lg border border-zinc-800">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span className="text-[11px]">{signal}</span>
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
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs font-mono shadow-lg shadow-rose-950/50 hover:shadow-rose-600/30 transition-all group"
        >
          <span>Run Full 3-Domain Background Check on "{festivalName}"</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
