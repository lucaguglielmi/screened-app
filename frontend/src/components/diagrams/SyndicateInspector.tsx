import React from 'react';
import {
  ShieldAlert,
  Building2,
  Mail,
  Users,
  Film,
  DollarSign,
  AlertTriangle,
  X,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export type SyndicateNodeType =
  | 'TARGET_FESTIVAL'
  | 'MAILBOX_HUB'
  | 'SHELL_ENTITY'
  | 'SHARED_DIRECTOR'
  | 'SISTER_FESTIVAL'
  | 'UPSELL_FUNNEL'
  | 'INDEPENDENT_ENTITY';

export interface SyndicateNodeData {
  id: string;
  type: SyndicateNodeType;
  label: string;
  sublabel: string;
  status: 'RED_FLAG' | 'AMBER_WARNING' | 'VERIFIED' | 'DISPUTED' | 'INFORMATIONAL';
  registrationNumber?: string;
  address?: string;
  summary?: string;
  signals?: string[];
  connectedCount?: number;
  educationalContext?: string;
  flags?: string[];
}

interface Props {
  data: SyndicateNodeData | null;
  onClose: () => void;
}

export const SyndicateInspector: React.FC<Props> = ({ data, onClose }) => {
  if (!data) return null;

  const getStatusBadge = () => {
    switch (data.status) {
      case 'RED_FLAG':
      case 'DISPUTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <ShieldAlert className="size-3 text-rose-400" />
            <span>RED FLAG / HIGH RISK</span>
          </span>
        );
      case 'AMBER_WARNING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="size-3 text-amber-400" />
            <span>CAUTION / ANOMALY</span>
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            VERIFIED STANDALONE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
            INFORMATIONAL
          </span>
        );
    }
  };

  const getNodeIcon = () => {
    switch (data.type) {
      case 'MAILBOX_HUB':
        return <Mail className="size-4 text-rose-400" />;
      case 'SHELL_ENTITY':
        return <Building2 className="size-4 text-orange-400" />;
      case 'SHARED_DIRECTOR':
        return <Users className="size-4 text-indigo-400" />;
      case 'SISTER_FESTIVAL':
        return <Film className="size-4 text-amber-400" />;
      case 'UPSELL_FUNNEL':
        return <DollarSign className="size-4 text-emerald-400" />;
      default:
        return <Building2 className="size-4 text-indigo-400" />;
    }
  };

  return (
    <div
      data-testid="syndicate-inspector"
      className="p-4 rounded-2xl bg-[#090d18]/95 border border-darkroom-border/90 shadow-2xl backdrop-blur-xl text-xs space-y-3.5 animate-fade-in text-slate-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-darkroom-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-darkroom-card border border-darkroom-border">
            {getNodeIcon()}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
              {data.type.replace(/_/g, ' ')}
            </span>
            <h4 className="text-sm font-bold text-white font-serif">{data.label}</h4>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-darkroom-card transition-colors cursor-pointer"
            title="Close node details"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Primary Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-darkroom-surface/60 p-2.5 rounded-xl border border-darkroom-border/50">
        <div>
          <span className="text-slate-400 block text-[10px]">Classification:</span>
          <span className="text-slate-200 font-semibold">{data.sublabel}</span>
        </div>
        {data.registrationNumber && (
          <div>
            <span className="text-slate-400 block text-[10px]">Registration No:</span>
            <span className="text-indigo-300 font-semibold">{data.registrationNumber}</span>
          </div>
        )}
        {data.address && (
          <div className="sm:col-span-2">
            <span className="text-slate-400 block text-[10px]">Registered Office:</span>
            <span className="text-slate-300">{data.address}</span>
          </div>
        )}
      </div>

      {/* Summary Narrative */}
      {data.summary && (
        <p className="text-xs text-slate-300 leading-relaxed">
          {data.summary}
        </p>
      )}

      {/* Warning Signals */}
      {data.signals && data.signals.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="size-3 text-rose-400" />
            <span>Forensic Indicators ({data.signals.length})</span>
          </span>
          <ul className="space-y-1 text-[11px] text-slate-300 font-sans">
            {data.signals.map((sig, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-tight">
                <span className="text-rose-400 font-mono">•</span>
                <span>{sig}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Industry Educational Context */}
      {data.educationalContext && (
        <div className="p-3 rounded-xl bg-midnight-royal/15 border border-midnight-royal/30 text-[11px] text-slate-300 space-y-1">
          <span className="text-[10px] font-mono text-indigo-300 font-semibold uppercase flex items-center gap-1.5">
            <BookOpen className="size-3 text-indigo-400" />
            <span>Why Festival Syndicates Do This</span>
          </span>
          <p className="leading-relaxed text-slate-300">
            {data.educationalContext}
          </p>
        </div>
      )}

      {/* Actionable Advice */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-darkroom-border/40">
        <span className="font-mono text-[10px]">
          Click another node to inspect connection
        </span>
        <span className="text-tool-diligence hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
          <span>Cross-reference in ledger</span>
          <ExternalLink className="size-3" />
        </span>
      </div>
    </div>
  );
};
