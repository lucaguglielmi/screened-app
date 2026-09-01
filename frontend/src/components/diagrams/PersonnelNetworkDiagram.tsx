import React, { useMemo } from 'react';
import { KeyPerson } from '../../types/investigation';
import {
  AlertTriangle,
  Building2,
  Film,
  User,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Link2,
} from 'lucide-react';

interface Props {
  keyPersonnel: KeyPerson[];
}

export const PersonnelNetworkDiagram: React.FC<Props> = ({ keyPersonnel }) => {
  // Aggregate unique companies, festivals, and shared directorships
  const { companyMap, festivalMap, sharedEntities, hasSuspects } = useMemo(() => {
    const companies = new Map<string, string[]>();
    const festivals = new Map<string, string[]>();

    keyPersonnel.forEach((person) => {
      (person.companies || []).forEach((comp) => {
        const list = companies.get(comp) || [];
        list.push(person.name);
        companies.set(comp, list);
      });

      (person.associatedFestivals || []).forEach((fest) => {
        const list = festivals.get(fest) || [];
        list.push(person.name);
        festivals.set(fest, list);
      });
    });

    // Detect shared entities between multiple people
    const shared: Array<{ entity: string; type: 'COMPANY' | 'FESTIVAL'; people: string[] }> = [];
    companies.forEach((people, entity) => {
      if (people.length > 1) {
        shared.push({ entity, type: 'COMPANY', people });
      }
    });
    festivals.forEach((people, entity) => {
      if (people.length > 1) {
        shared.push({ entity, type: 'FESTIVAL', people });
      }
    });

    const suspectFound = keyPersonnel.some(
      (p) => p.isFestivalMillSuspect || p.hasDistributionOverlap || (p.flags && p.flags.length > 0),
    );

    return {
      companyMap: companies,
      festivalMap: festivals,
      sharedEntities: shared,
      hasSuspects: suspectFound,
    };
  }, [keyPersonnel]);

  if (!keyPersonnel || keyPersonnel.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Network Topology Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="py-2.5 px-3 rounded-xl bg-darkroom-surface/80 border border-darkroom-border/80 text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Individuals</div>
          <div className="text-base font-semibold text-slate-100 font-mono flex items-center justify-center gap-1 mt-0.5">
            <User className="size-3.5 text-indigo-400" />
            <span>{keyPersonnel.length}</span>
          </div>
        </div>

        <div className="py-2.5 px-3 rounded-xl bg-darkroom-surface/80 border border-darkroom-border/80 text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Entities &amp; Filings</div>
          <div className="text-base font-semibold text-emerald-400 font-mono flex items-center justify-center gap-1 mt-0.5">
            <Building2 className="size-3.5 text-emerald-400" />
            <span>{companyMap.size > 0 ? companyMap.size : '1 Direct'}</span>
          </div>
        </div>

        <div className="py-2.5 px-3 rounded-xl bg-darkroom-surface/80 border border-darkroom-border/80 text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Sister Festivals</div>
          <div className="text-base font-semibold text-amber-400 font-mono flex items-center justify-center gap-1 mt-0.5">
            <Film className="size-3.5 text-amber-400" />
            <span>{festivalMap.size > 0 ? festivalMap.size : '0 Network'}</span>
          </div>
        </div>

        <div className="py-2.5 px-3 rounded-xl bg-darkroom-surface/80 border border-darkroom-border/80 text-center">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Governance</div>
          <div className="text-xs font-semibold font-mono flex items-center justify-center gap-1 mt-1 truncate">
            {hasSuspects ? (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertTriangle className="size-3 text-rose-400" /> Overlap Risk
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="size-3 text-emerald-400" /> Independent
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Shared Directorship Callout (When multiple personnel connect to the same entity) */}
      {sharedEntities.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 font-mono font-semibold text-xs">
            <Link2 className="size-4 text-indigo-400" />
            <span>Shared Corporate Directorships &amp; Interlocking Governance</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {sharedEntities.map((item, sIdx) => (
              <div
                key={sIdx}
                className="p-2.5 rounded-xl bg-darkroom-surface/90 border border-darkroom-border flex items-start gap-2.5"
              >
                {item.type === 'COMPANY' ? (
                  <Building2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Film className="size-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white truncate">{item.entity}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Co-directed by: <strong className="text-indigo-300">{item.people.join(', ')}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline Relational Architecture Grid (Height Auto, Clean, Visible) */}
      <div className="space-y-3">
        {keyPersonnel.map((person, pIdx) => {
          const initials = person.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          const isSuspect = Boolean(
            person.isFestivalMillSuspect ||
            person.hasDistributionOverlap ||
            (person.flags && person.flags.length > 0),
          );

          const companies = person.companies || [];
          const festivals = person.associatedFestivals || [];

          return (
            <div
              key={pIdx}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                isSuspect
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-sm shadow-rose-950/20'
                  : 'bg-darkroom-surface/90 border-darkroom-border/80 hover:border-zinc-700/80 shadow-sm'
              }`}
            >
              {/* Row 1: Person Identity & Role */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-darkroom-border/50 pb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`size-10 rounded-xl flex items-center justify-center font-bold text-xs font-mono shrink-0 border ${
                    isSuspect
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-midnight-royal/40 text-white border-indigo-900/40'
                  }`}>
                    {initials || <User className="size-4 text-slate-300" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="text-sm sm:text-base font-bold text-white font-sans truncate">{person.name}</h5>
                      {isSuspect && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          <AlertTriangle className="size-2.5" /> Conflict Flag
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-indigo-300 mt-0.5 truncate">
                      {person.roles && person.roles.length > 0 ? person.roles.join(' • ') : 'Festival Leadership'}
                    </div>
                  </div>
                </div>

                {/* Directorship Status Tag */}
                <div className="self-start sm:self-auto shrink-0">
                  <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                    isSuspect
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      : 'bg-darkroom-card border-darkroom-border text-slate-300'
                  }`}>
                    {isSuspect ? (
                      <>
                        <ShieldAlert className="size-3 text-rose-400" />
                        <span>Corporate Overlap</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-3 text-emerald-400" />
                        <span>Independent Record</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Row 2: Directorship Connections & Associated Entities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5">
                {/* Connected Companies / Entities */}
                <div className="p-3 rounded-xl bg-darkroom-card/60 border border-darkroom-border/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-400">
                    <Building2 className="size-3.5 text-emerald-400" />
                    <span>Corporate Entities &amp; Filings</span>
                  </div>
                  {companies.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {companies.map((comp, cIdx) => (
                        <span
                          key={cIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-medium"
                        >
                          <ArrowRight className="size-2.5 text-emerald-400" />
                          <span>{comp}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-slate-400 italic pt-0.5">
                      Direct individual capacity (No separate corporate directorship found).
                    </p>
                  )}
                </div>

                {/* Connected Sister Festivals */}
                <div className="p-3 rounded-xl bg-darkroom-card/60 border border-darkroom-border/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-400">
                    <Film className="size-3.5 text-amber-400" />
                    <span>Sister Festivals &amp; Networks</span>
                  </div>
                  {festivals.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {festivals.map((fest, fIdx) => (
                        <span
                          key={fIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 font-mono text-xs font-medium"
                        >
                          <ArrowRight className="size-2.5 text-amber-400" />
                          <span>{fest}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-slate-400 italic pt-0.5">
                      Single festival focus (No cross-festival directorship overlap).
                    </p>
                  )}
                </div>
              </div>

              {/* Flags / Notes */}
              {((person.flags && person.flags.length > 0) || person.notes) && (
                <div className="pt-1 border-t border-darkroom-border/40 space-y-1.5">
                  {person.flags && person.flags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {person.flags.map((flag, flIdx) => (
                        <span
                          key={flIdx}
                          className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30"
                        >
                          <ShieldAlert className="size-3 text-rose-400" />
                          <span>{flag}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {person.notes && person.notes.trim().length > 0 && (
                    <p className="text-xs text-slate-300 italic">
                      &ldquo;{person.notes}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Forensic Governance Assessment Card */}
      <div className={`p-4 rounded-2xl border text-xs text-slate-200 leading-relaxed flex items-start gap-3 ${
        hasSuspects
          ? 'bg-rose-500/10 border-rose-500/30'
          : 'bg-darkroom-surface/80 border-darkroom-border'
      }`}>
        {hasSuspects ? (
          <ShieldAlert className="size-4.5 text-rose-400 shrink-0 mt-0.5" />
        ) : (
          <Sparkles className="size-4.5 text-indigo-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <strong className={hasSuspects ? 'text-rose-300' : 'text-white'}>
            Forensic Governance Assessment:
          </strong>{' '}
          {hasSuspects ? (
            <span>
              Autonomous cross-examination discovered overlapping commercial entities or festival network ties. Screened recommends verifying jury independence and confirming that entry fees are processed directly by the verified organization.
            </span>
          ) : (
            <span>
              All identified leadership personnel verified with transparent directorship profiles and zero conflicted auxiliary sales entities across corporate registries.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

