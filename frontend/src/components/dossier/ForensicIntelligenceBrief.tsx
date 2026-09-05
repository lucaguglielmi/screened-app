import React, { useState } from 'react';
import {
  ShieldAlert,
  Building2,
  Users2,
  Film,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { ForensicIntelligenceSummary, VettingSignalStatus } from '../../types/investigation';

interface Props {
  summary?: ForensicIntelligenceSummary;
  festivalName?: string;
}

export const ForensicIntelligenceBrief: React.FC<Props> = ({ summary, festivalName = 'Target Festival' }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleExpand = (cardKey: string) => {
    setExpandedCard((prev) => (prev === cardKey ? null : cardKey));
  };

  // High-fidelity fallback data
  const data: ForensicIntelligenceSummary = summary || {
    scamPattern: {
      status: 'RED_FLAG',
      headline: 'Dissolved Corporate Entity & Virtual Maildrop Footprint',
      summary:
        'Operating company Pallino Media Lab Ltd was dissolved via compulsory strike-off in March 2024 while continuing to solicit entry fees. Registered to a known mass virtual office at 71-75 Shelton Street, London.',
      educationalContext:
        'Shell Entity Scheme: Predatory festivals frequently register entities at mass maildrop forwarding addresses, dissolve them to evade refund liabilities, and operate through unregistered clone networks.',
      signals: [
        'Operating entity dissolved on 14 March 2024 via Compulsory Strike-off (Companies House)',
        'Registered office at 71-75 Shelton Street shared with >2,000 corporate mailboxes',
        'Directorship ties link organizer to sister festival "London Indie Shorts Review"',
      ],
      relatedEntities: ['Pallino Media Lab Ltd', 'London Indie Shorts Review', 'Shelton Virtual Mail'],
    },
    juryConflict: {
      status: 'RED_FLAG',
      headline: 'Jury Self-Dealing & Repeat Winner Anomaly',
      summary:
        'Lead Programmer Arthur Smith operates IndiePitch Consulting, marketing paid rejection audits directly to festival applicants. Furthermore, the 2024 Best Short winner is a commercial business associate who also won top honors in 2023.',
      educationalContext:
        'Jury Conflicts & Self-Dealing: Authentic festivals enforce strict blind-judging and recusal policies. When jury members monetize advisory services to applicants or award top honors to co-producers, the competition serves as a closed promotional vehicle.',
      signals: [
        'Arthur Smith co-owns IndiePitch Consulting actively targeting submitting filmmakers',
        '2024 Best Short Winner co-produced a commercial project with Lead Programmer',
        'Same director won top prize across consecutive 2023 and 2024 editions',
      ],
      relatedEntities: ['IndiePitch Consulting', 'Arthur Smith', 'Pallino Media Lab Ltd'],
    },
    venueReality: {
      status: 'MISMATCH',
      headline: 'Advertised Theatrical Gala vs. 4-Wall Private Room Reality',
      summary:
        'Promotional materials promise red-carpet theatrical projection at BFI Southbank. Physical venue corroboration reveals no public BFI contract, only a 2-hour private room hire at Genesis Cinema Studio 4, with filmmaker reports of unlisted Vimeo links substituted.',
      educationalContext:
        'Curated Cinema vs. 4-Wall Rental: In an authentic festival, the cinema directly curates, tickets, and lists the screenings on its public box office schedule. A 4-wall rental is merely an hourly room hire that anyone can purchase for private viewing with zero cinema programming curation.',
      signals: [
        'BFI Southbank NFT1 claim refuted: No municipal screening permit or BFI box office entry',
        'Genesis Cinema manifest indicates private room hire, not curated public festival season',
        'Filmmaker testimonies document unlisted Vimeo password-protected links with < 5 views',
      ],
      relatedEntities: ['BFI Southbank NFT1', 'Genesis Cinema Studio 4', 'Vimeo On-Demand'],
    },
  };

  const renderStatusBadge = (status: VettingSignalStatus | 'MISMATCH') => {
    switch (status) {
      case 'RED_FLAG':
      case 'MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-mono font-semibold uppercase">
            <AlertTriangle className="size-3" />
            <span>Red Flag Alert</span>
          </span>
        );
      case 'AMBER_WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-semibold uppercase">
            <AlertTriangle className="size-3" />
            <span>Caution</span>
          </span>
        );
      case 'VERIFIED_AUTHENTIC':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-semibold uppercase">
            <CheckCircle2 className="size-3" />
            <span>Verified</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-mono font-semibold uppercase">
            <Info className="size-3" />
            <span>Informational</span>
          </span>
        );
    }
  };

  const cards = [
    {
      key: 'scam',
      title: 'Scam Patterns & Shell Network',
      subtitle: 'Corporate registration & syndicate detection',
      icon: Building2,
      item: data.scamPattern,
      iconColor: 'text-amber-400',
      bgGlow: 'hover:border-amber-500/40',
    },
    {
      key: 'jury',
      title: 'Jury Conflict & Nepotism',
      subtitle: 'Self-dealing & repeat laureate analysis',
      icon: Users2,
      item: data.juryConflict,
      iconColor: 'text-orange-400',
      bgGlow: 'hover:border-orange-500/40',
    },
    {
      key: 'venue',
      title: 'Curated Cinema vs. 4-Wall Rental',
      subtitle: 'Physical theater screening corroboration',
      icon: Film,
      item: data.venueReality,
      iconColor: 'text-rose-400',
      bgGlow: 'hover:border-rose-500/40',
    },
  ];

  return (
    <div className="rounded-2xl bg-darkroom-surface/90 border border-darkroom-border/80 p-5 sm:p-6 space-y-5 shadow-xl transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-darkroom-border/60 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <ShieldAlert className="size-4" />
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
              Forensic Intelligence Brief (Key Scam Realities)
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Critical analysis for {festivalName} across shell entity syndicates, jury nepotism, and 4-wall private rental realities.
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          3-Vector Forensic Triad
        </span>
      </div>

      {/* 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isExpanded = expandedCard === card.key;
          const item = card.item;

          return (
            <div
              key={card.key}
              className={`rounded-xl bg-darkroom-card/70 border border-darkroom-border/80 p-4 space-y-3.5 flex flex-col justify-between transition-all ${card.bgGlow}`}
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg bg-darkroom-bg border border-darkroom-border/80 ${card.iconColor}`}>
                      <Icon className="size-4" />
                    </span>
                    <h4 className="text-sm font-bold text-white font-sans">{card.title}</h4>
                  </div>
                  {renderStatusBadge(item.status)}
                </div>

                <div className="text-[11px] font-mono text-slate-400">{card.subtitle}</div>

                <div className="text-xs sm:text-sm font-semibold text-slate-200 leading-snug pt-1">
                  {item.headline}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {item.summary}
                </p>
              </div>

              {/* Expandable Details / Signals */}
              <div className="space-y-2 pt-1 border-t border-darkroom-border/40">
                <button
                  type="button"
                  onClick={() => toggleExpand(card.key)}
                  className="w-full flex items-center justify-between text-xs font-mono text-indigo-300 hover:text-white transition-colors cursor-pointer py-1"
                >
                  <span>{isExpanded ? 'Hide Forensic Signals' : 'View Signals & Context'}</span>
                  {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>

                {isExpanded && (
                  <div className="space-y-2.5 pt-2 text-xs font-sans animate-fade-in">
                    {/* Educational Definition */}
                    {item.educationalContext && (
                      <div className="p-2.5 rounded-lg bg-darkroom-bg/90 border border-darkroom-border/60 text-[11px] text-slate-300 leading-relaxed space-y-1">
                        <span className="font-mono text-orange-400 font-bold block uppercase">
                          The Industry Pattern:
                        </span>
                        <span>{item.educationalContext}</span>
                      </div>
                    )}

                    {/* Bullet Signals */}
                    {item.signals && item.signals.length > 0 && (
                      <ul className="space-y-1.5 text-[11px] text-slate-300">
                        {item.signals.map((sig, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold shrink-0">•</span>
                            <span>{sig}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Related Entities */}
                    {item.relatedEntities && item.relatedEntities.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                        <span className="text-slate-400">Entities:</span>
                        {item.relatedEntities.map((ent, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-darkroom-surface border border-darkroom-border text-slate-300"
                          >
                            {ent}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
