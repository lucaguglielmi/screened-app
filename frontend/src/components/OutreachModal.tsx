import React, { useState } from 'react';
import { OutreachDraft } from '../types/investigation';
import { Mail, Send, ShieldCheck, X, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { AnimatedFocusWrapper } from './animations/AnimatedFocusWrapper';

import { motion, AnimatePresence } from 'motion/react';

interface Props {
  draft: OutreachDraft | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (draftId: string, payloadHash: string) => Promise<void>;
  loading: boolean;
}

export const OutreachModal: React.FC<Props> = ({ draft, isOpen, onClose, onApprove, loading }) => {
  const [prevDraftId, setPrevDraftId] = useState<string | null>(null);
  const [executed, setExecuted] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(draft?.recipientEmail || '');
  const [subject, setSubject] = useState(draft?.subject || '');
  const [body, setBody] = useState(draft?.body || '');

  if (draft && draft.id !== prevDraftId) {
    setPrevDraftId(draft.id);
    setRecipientEmail(draft.recipientEmail);
    setSubject(draft.subject);
    setBody(draft.body);
    setExecuted(draft.status === 'EXECUTED_SANDBOX');
  }

  if (!isOpen || !draft) return null;

  const handleApprove = async () => {
    await onApprove(draft.id, draft.payloadHash);
    setExecuted(true);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl rounded-2xl bg-darkroom-surface border border-darkroom-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-darkroom-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 text-indigo-400">
                <Mail className="size-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-darkroom-text">
                  Verification Outreach Inquiry
                </h3>
                <div className="text-xs font-mono text-darkroom-muted">
                  Sandbox Action Approval Gate
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-darkroom-muted hover:bg-darkroom-card transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            {/* Sandbox Notice Banner */}
            <div className="p-3.5 rounded-xl bg-indigo-500/5 bg-indigo-500/10 border border-indigo-500/20 text-darkroom-text space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-600 text-indigo-400 font-mono uppercase text-[11px]">
                <ShieldCheck className="size-4" />
                <span>Sandbox Delivery Guarantee</span>
              </div>
              <p className="text-[11px] text-darkroom-muted leading-relaxed">
                To guarantee safety and prevent unapproved spam, this inquiry executes inside a
                simulated sandbox mailbox with cryptographic audit logging. No unapproved real
                emails are dispatched.
              </p>
            </div>

            {/* Recipient Field */}
            <div className="space-y-1">
              <label className="font-mono text-[11px] uppercase text-darkroom-muted">
                Recipient
              </label>
              <input
                type="text"
                value={recipientEmail}
                readOnly
                className="w-full px-3 py-2 rounded-lg bg-darkroom-card border border-darkroom-border text-darkroom-text font-mono text-xs focus:outline-none"
              />
            </div>

            {/* Subject Field */}
            <div className="space-y-1">
              <label className="font-mono text-[11px] uppercase text-darkroom-muted">
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                readOnly
                className="w-full px-3 py-2 rounded-lg bg-darkroom-card border border-darkroom-border text-darkroom-text font-medium text-xs focus:outline-none"
              />
            </div>

            {/* Email Body */}
            <div className="space-y-1">
              <label className="font-mono text-[11px] uppercase text-darkroom-muted">
                Email Message Body
              </label>
              <AnimatedFocusWrapper borderRadius={8}>
                <textarea
                  value={body}
                  readOnly
                  rows={6}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-darkroom-card border border-darkroom-border text-darkroom-text font-sans text-xs focus:outline-none leading-relaxed resize-none"
                />
              </AnimatedFocusWrapper>
            </div>

            {/* Cryptographic SHA-256 Hash Display */}
            <div className="p-3 rounded-xl bg-darkroom-card border border-darkroom-border space-y-1 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 text-darkroom-muted uppercase text-[10px]">
                <Lock className="size-3 text-emerald-500" />
                <span>Exact-Payload SHA-256 Digest:</span>
              </div>
              <div className="text-darkroom-text break-all font-bold">
                {draft.payloadHash}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-5 border-t border-darkroom-border bg-paper-card/40 bg-darkroom-card/40 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-darkroom-muted hover:text-paper-text hover:text-darkroom-text transition-colors cursor-pointer"
            >
              {executed ? 'Close' : 'Cancel'}
            </button>

            {executed ? (
              <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-emerald-400 font-medium text-xs border border-emerald-500/20">
                <CheckCircle2 className="size-4" /> Executed in Sandbox
              </div>
            ) : (
              <button
                onClick={handleApprove}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Signing & Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" />
                    <span>Approve & Execute (Sandbox)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
