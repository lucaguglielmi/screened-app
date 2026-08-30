import React, { useState } from 'react';
import {
  ExternalLink,
  Building2,
  ShieldAlert,
  User,
  Film,
  Globe,
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
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  if (!keyPersonnel || keyPersonnel.length === 0) return null;

  const handleImageError = (name: string) => {
    setImageErrors((prev) => ({ ...prev, [name]: true }));
  };

  const handleImageLoad = (name: string) => {
    setImagesLoaded((prev) => ({ ...prev, [name]: true }));
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
          const initials = person.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          const hasImgError = imageErrors[person.name];
          const isLoaded = imagesLoaded[person.name];
          const anchorId = `key-person-${person.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

          return (
            <div
              key={idx}
              id={anchorId}
              className="rounded-2xl p-4.5 border border-darkroom-border bg-darkroom-surface/90 hover:border-zinc-700/80 shadow-md transition-all flex flex-col justify-between scroll-mt-32"
            >
              <div className="space-y-3.5">
                {/* Header: Avatar & Name */}
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0 size-12 rounded-xl overflow-hidden bg-darkroom-card border border-darkroom-border shadow-xs">
                    {person.avatarUrl && !hasImgError ? (
                      <>
                        {!isLoaded && (
                          <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
                            <span className="text-[10px] font-mono text-slate-500">{initials}</span>
                          </div>
                        )}
                        <img
                          src={person.avatarUrl}
                          alt={person.name}
                          onLoad={() => handleImageLoad(person.name)}
                          onError={() => handleImageError(person.name)}
                          className={`size-full object-cover transition-opacity duration-200 ${
                            isLoaded ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      </>
                    ) : (
                      <div className="size-full flex items-center justify-center font-bold text-sm bg-midnight-royal/40 text-white">
                        {initials || <User className="size-5 text-slate-300" />}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-white truncate font-sans">{person.name}</h4>
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

                {/* External Verified Links (LinkedIn, Companies House, Facebook, Website, IMDb, Twitter) */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {person.linkedinUrl && (
                    <a
                      href={person.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0077b5]/15 hover:bg-[#0077b5]/30 text-[#38bdf8] border border-[#0077b5]/40 text-xs font-semibold transition-all hover:text-white group"
                      title={`View ${person.name}'s LinkedIn Profile`}
                    >
                      <svg className="size-3 fill-current" viewBox="0 0 24 24">
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
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all hover:text-white group"
                      title="View Official Corporate Filings & Directorships"
                    >
                      <Building2 className="size-3 text-indigo-400" />
                      <span>Gov Registry</span>
                      <ExternalLink className="size-2.5 opacity-60 group-hover:opacity-100" />
                    </a>
                  )}

                  {person.facebookUrl && (
                    <a
                      href={person.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1877f2]/15 hover:bg-[#1877f2]/30 text-[#60a5fa] border border-[#1877f2]/30 text-xs font-semibold transition-all hover:text-white group"
                      title={`View ${person.name}'s Facebook Profile`}
                    >
                      <svg className="size-3 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>Facebook</span>
                      <ExternalLink className="size-2.5 opacity-60 group-hover:opacity-100" />
                    </a>
                  )}

                  {person.websiteUrl && (
                    <a
                      href={person.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all hover:text-white group"
                      title={`Visit ${person.name}'s Personal Website`}
                    >
                      <Globe className="size-3 text-emerald-400" />
                      <span>Website</span>
                      <ExternalLink className="size-2.5 opacity-60 group-hover:opacity-100" />
                    </a>
                  )}

                  {person.imdbUrl && (
                    <a
                      href={person.imdbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all hover:text-white group"
                      title={`View ${person.name}'s IMDb Profile`}
                    >
                      <Film className="size-3 text-amber-400" />
                      <span>IMDb</span>
                      <ExternalLink className="size-2.5 opacity-60 group-hover:opacity-100" />
                    </a>
                  )}

                  {person.twitterUrl && (
                    <a
                      href={person.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-500/15 hover:bg-slate-500/30 text-slate-300 border border-slate-500/30 text-xs font-semibold transition-all hover:text-white group"
                      title={`View ${person.name} on X/Twitter`}
                    >
                      <span className="font-bold text-[11px]">𝕏</span>
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

                {/* Flags Pill List (Contextual Highlights) */}
                {person.flags && person.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {person.flags.map((flag, fIdx) => (
                      <span
                        key={fIdx}
                        className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      >
                        <ShieldAlert className="size-2.5 text-amber-400" />
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
