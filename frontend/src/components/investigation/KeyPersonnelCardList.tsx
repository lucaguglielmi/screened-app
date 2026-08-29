import React, { useState } from 'react';
import {
  ExternalLink,
  Building2,
  AlertTriangle,
  ShieldAlert,
  User,
  Film,
} from 'lucide-react';
import { KeyPerson } from '../../types/investigation';

interface Props {
  keyPersonnel: KeyPerson[];
  title?: string;
  subtitle?: string;
}

export const KeyPersonnelCardList: React.FC<Props> = ({
  keyPersonnel,
  title = 'Key Personnel & Leadership Forensic Dossier',
  subtitle = 'Verified organizers, jury members, and connected corporate directorships evaluated for conflicts of interest.',
}) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  if (!keyPersonnel || keyPersonnel.length === 0) return null;

  const handleImageError = (name: string) => {
    setImageErrors((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <div className="space-y-4">
      {title && (
        <div className="border-b border-darkroom-border pb-2.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-white flex items-center gap-2">
              <User className="size-4 text-tool-diligence" />
              <span>{title}</span>
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <span className="text-xs font-mono font-semibold text-tool-diligence bg-tool-diligence/10 border border-tool-diligence/20 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
            {keyPersonnel.length} Profiles Identified
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {keyPersonnel.map((person, idx) => {
          const hasConflict = person.isFestivalMillSuspect || person.hasDistributionOverlap;
          const initials = person.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          const hasImgError = imageErrors[person.name];

          return (
            <div
              key={idx}
              className={`rounded-2xl p-4.5 border transition-all flex flex-col justify-between ${
                hasConflict
                  ? 'bg-darkroom-surface/90 border-rose-500/40 shadow-lg shadow-rose-950/20 ring-1 ring-rose-500/20'
                  : 'bg-darkroom-surface/80 border-darkroom-border hover:border-zinc-700/80 shadow-md'
              }`}
            >
              <div className="space-y-3.5">
                {/* Header: Avatar, Name & Conflict Status */}
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    {person.avatarUrl && !hasImgError ? (
                      <img
                        src={person.avatarUrl}
                        alt={person.name}
                        onError={() => handleImageError(person.name)}
                        className={`size-12 rounded-xl object-cover bg-darkroom-card border ${
                          hasConflict ? 'border-rose-400/50 ring-2 ring-rose-500/30' : 'border-darkroom-border'
                        }`}
                      />
                    ) : (
                      <div
                        className={`size-12 rounded-xl flex items-center justify-center font-bold text-sm border ${
                          hasConflict
                            ? 'bg-rose-950/60 text-rose-300 border-rose-500/40 ring-2 ring-rose-500/30'
                            : 'bg-midnight-royal/40 text-white border-darkroom-border'
                        }`}
                      >
                        {initials || <User className="size-5 text-slate-300" />}
                      </div>
                    )}
                    {hasConflict && (
                      <span
                        className="absolute -bottom-1 -right-1 size-4 rounded-full bg-rose-500 border-2 border-darkroom-bg flex items-center justify-center"
                        title="High Conflict / Risk Flagged"
                      >
                        <AlertTriangle className="size-2.5 text-white" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-white truncate font-sans">{person.name}</h4>
                      {hasConflict && (
                        <span className="shrink-0 text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Risk Flag
                        </span>
                      )}
                    </div>

                    {/* Roles Badges */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {person.roles && person.roles.length > 0 ? (
                        person.roles.map((r, rIdx) => (
                          <span
                            key={rIdx}
                            className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-darkroom-card text-tool-diligence border border-tool-diligence/30"
                          >
                            {r}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400">Personnel</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* External Verified Links (LinkedIn, Companies House) */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {person.linkedinUrl && (
                    <a
                      href={person.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0077b5]/15 hover:bg-[#0077b5]/30 text-[#38bdf8] border border-[#0077b5]/40 text-xs font-semibold transition-all hover:text-white group"
                      title={`View ${person.name}'s LinkedIn Profile`}
                    >
                      <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      <span>LinkedIn</span>
                      <ExternalLink className="size-2.5 opacity-60 group-hover:opacity-100" />
                    </a>
                  )}

                  {person.companiesHouseUrl && (
                    <a
                      href={person.companiesHouseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all hover:text-white group"
                      title="View Official Corporate Filings & Directorships"
                    >
                      <Building2 className="size-3.5 text-indigo-400" />
                      <span>Gov Registry</span>
                      <ExternalLink className="size-2.5 opacity-60 group-hover:opacity-100" />
                    </a>
                  )}
                </div>

                {/* Directorships & Affiliations */}
                {((person.companies && person.companies.length > 0) ||
                  (person.associatedFestivals && person.associatedFestivals.length > 0)) && (
                  <div className="space-y-1.5 pt-1">
                    {person.companies && person.companies.length > 0 && (
                      <div className="text-xs text-slate-300 flex items-start gap-1.5">
                        <Building2 className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          <strong className="text-slate-200">Entities:</strong> {person.companies.join(', ')}
                        </span>
                      </div>
                    )}
                    {person.associatedFestivals && person.associatedFestivals.length > 0 && (
                      <div className="text-xs text-slate-300 flex items-start gap-1.5">
                        <Film className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          <strong className="text-slate-200">Festivals:</strong> {person.associatedFestivals.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Flags Pill List */}
                {person.flags && person.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {person.flags.map((flag, fIdx) => (
                      <span
                        key={fIdx}
                        className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      >
                        <ShieldAlert className="size-2.5 text-rose-400" />
                        <span>{flag}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes Quote Box */}
                {person.notes && (
                  <div className="p-2.5 rounded-xl bg-darkroom-card/80 border border-darkroom-border text-xs text-slate-300 leading-relaxed italic">
                    "{person.notes}"
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
