import React, { useState, useEffect, useCallback } from 'react';
import {
  Coins,
  Search,
  Loader2,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building2,
  Award,
  Clock,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  FilmFormat,
  GrantOpportunity,
  GrantScoutRequest,
  GrantScoutResponse,
} from '../types/investigation';
import { soundEffects } from '../utils/audio';

interface Props {
  initialTitle?: string;
  initialStage?: string;
  initialRegion?: string;
  initialFundingNeeded?: string;
  onNavigateToDueDiligence?: (festivalName: string) => void;
}

export const GrantScout: React.FC<Props> = ({
  initialTitle = 'Untitled Cinema Project',
  initialStage = 'Production',
  initialRegion = 'UK & Europe',
  initialFundingNeeded = '£50,000',
}) => {
  // Form State
  const [projectTitle, setProjectTitle] = useState(initialTitle);
  const [format, setFormat] = useState<FilmFormat>('FEATURE');
  const [genre, setGenre] = useState('Drama');
  const [productionStage, setProductionStage] = useState(initialStage);
  const [budgetTier, setBudgetTier] = useState('Micro / Indie (< £250k)');
  const [fundingNeeded, setFundingNeeded] = useState(initialFundingNeeded);
  const [filmmakerRegion, setFilmmakerRegion] = useState(initialRegion);

  // Results State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoutResult, setScoutResult] = useState<GrantScoutResponse | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  const executeGrantScout = useCallback(
    async (reqPayload: GrantScoutRequest) => {
      setLoading(true);
      setError(null);
      soundEffects.playClick();
      try {
        const res = await fetch('/api/grants/scout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reqPayload),
        });
        if (!res.ok) throw new Error(`Grant scout failed with status ${res.status}`);
        const data: GrantScoutResponse = await res.json();
        setScoutResult(data);
        soundEffects.playSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to scout grants');
        soundEffects.playCaution();
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Auto-scout on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const payload: GrantScoutRequest = {
        projectTitle,
        format,
        genre,
        productionStage,
        budgetTier,
        fundingNeeded,
        filmmakerRegion,
      };
      executeGrantScout(payload);
    }, 0);
    return () => clearTimeout(timer);
  }, [executeGrantScout]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: GrantScoutRequest = {
      projectTitle: projectTitle.trim() || 'Untitled Cinema Project',
      format,
      genre,
      productionStage,
      budgetTier,
      fundingNeeded,
      filmmakerRegion,
    };
    executeGrantScout(payload);
  };

  // 1-Click .ics Calendar Export for Grant Deadlines
  const handleExportICS = (grant: GrantOpportunity) => {
    soundEffects.playClick();
    const deadlineStr = grant.deadlineDate || '2026-11-01';
    const cleanDate = deadlineStr.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Screened Cinema Intelligence//Grant Scout//EN',
      'BEGIN:VEVENT',
      `UID:grant-${grant.id}@screened.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;VALUE=DATE:${cleanDate}`,
      `DTEND;VALUE=DATE:${cleanDate}`,
      `SUMMARY:Grant Application Deadline: ${grant.title}`,
      `DESCRIPTION:Funding Body: ${grant.fundingBody}\\nAmount: ${grant.amountRange}\\nGuidelines: ${grant.guidelinesUrl || 'https://screened.app'}`,
      `URL:${grant.guidelinesUrl || grant.applicationPortalUrl || 'https://screened.app'}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P7D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Grant deadline in 7 days',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${grant.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_deadline.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredGrants =
    scoutResult?.grants.filter((g) => {
      if (activeCategoryFilter === 'ALL') return true;
      if (activeCategoryFilter === 'PRODUCTION')
        return g.category.toLowerCase().includes('production');
      if (activeCategoryFilter === 'DEVELOPMENT')
        return (
          g.category.toLowerCase().includes('development') ||
          g.eligibleStages.includes('Development')
        );
      if (activeCategoryFilter === 'UK_LOTTERY')
        return (
          g.fundingBody.toLowerCase().includes('bfi') ||
          g.fundingBody.toLowerCase().includes('scotland') ||
          g.fundingBody.toLowerCase().includes('lottery') ||
          g.fundingBody.toLowerCase().includes('arts council')
        );
      if (activeCategoryFilter === 'DOC')
        return (
          g.category.toLowerCase().includes('doc') ||
          g.eligibleFormats.includes('Documentary')
        );
      return true;
    }) || [];

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tool-diligence/10 border border-tool-diligence/30 text-tool-diligence text-xs font-mono font-bold tracking-wider uppercase">
          <Coins className="size-3.5 text-tool-diligence" />
          <span>Institutional Film Funds & Grants</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          Public Grant & Film Fund Match
        </h1>

        <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Discover verified public funding, lottery endowments, and regional production grants with
          tailored eligibility checks and 1-click calendar deadline sync.
        </p>
      </section>

      {/* Project Configuration Intake Panel */}
      <section className="max-w-4xl mx-auto bg-darkroom-surface/90 backdrop-blur-md rounded-3xl border border-darkroom-border p-5 sm:p-7 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Title */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Project Working Title
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. The Glass Kingdom"
                className="w-full px-4 py-2.5 rounded-xl bg-darkroom-card border border-darkroom-border text-white text-sm focus:outline-none focus:border-tool-diligence/60 transition-colors"
                required
              />
            </div>

            {/* Format */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as FilmFormat)}
                className="w-full px-3 py-2.5 rounded-xl bg-darkroom-card border border-darkroom-border text-white text-sm focus:outline-none focus:border-tool-diligence/60 transition-colors"
              >
                <option value="FEATURE">Feature Film</option>
                <option value="SHORT">Short Film</option>
                <option value="DOCUMENTARY">Documentary</option>
                <option value="ANIMATION">Animation</option>
                <option value="EPISODIC">Episodic / Series</option>
              </select>
            </div>

            {/* Genre */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Genre
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Drama, Sci-Fi, etc."
                className="w-full px-3 py-2.5 rounded-xl bg-darkroom-card border border-darkroom-border text-white text-sm focus:outline-none focus:border-tool-diligence/60 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Stage */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Production Stage
              </label>
              <select
                value={productionStage}
                onChange={(e) => setProductionStage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-darkroom-card border border-darkroom-border text-white text-sm focus:outline-none focus:border-tool-diligence/60 transition-colors"
              >
                <option value="Development">Early Development</option>
                <option value="Pre-Production">Pre-Production</option>
                <option value="Production">Principal Photography</option>
                <option value="Post-Production">Post-Production / Finishing</option>
                <option value="Distribution">Distribution & Festival Travel</option>
              </select>
            </div>

            {/* Region */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Filmmaker Region
              </label>
              <select
                value={filmmakerRegion}
                onChange={(e) => setFilmmakerRegion(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-darkroom-card border border-darkroom-border text-white text-sm focus:outline-none focus:border-tool-diligence/60 transition-colors"
              >
                <option value="UK & Europe">UK & Europe</option>
                <option value="UK & Scotland">UK & Scotland</option>
                <option value="North America">North America</option>
                <option value="International">International</option>
              </select>
            </div>

            {/* Budget Tier */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Total Budget Tier
              </label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-darkroom-card border border-darkroom-border text-white text-sm focus:outline-none focus:border-tool-diligence/60 transition-colors"
              >
                <option value="Micro (< £50k)">Micro (&lt; £50k)</option>
                <option value="Low (< £250k)">Low (&lt; £250k)</option>
                <option value="Mid (< £1M)">Mid (&lt; £1M)</option>
                <option value="Standard (£1M+)">Standard (£1M+)</option>
              </select>
            </div>

            {/* Funding Needed */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Grant Funding Needed
              </label>
              <input
                type="text"
                value={fundingNeeded}
                onChange={(e) => setFundingNeeded(e.target.value)}
                placeholder="e.g. £25,000"
                className="w-full px-3 py-2.5 rounded-xl bg-darkroom-card border border-darkroom-border text-white text-sm focus:outline-none focus:border-tool-diligence/60 transition-colors"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-tool-diligence hover:bg-tool-diligence-hover disabled:opacity-40 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[var(--color-tool-diligence)]/20 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin text-slate-950" />
                  <span>Matching Institutional Funds...</span>
                </>
              ) : (
                <>
                  <Search className="size-4 text-slate-950" />
                  <span>Search & Match Grants</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {scoutResult && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Strategy Roadmap Card */}
          {scoutResult.strategySummary && (
            <div className="p-5 sm:p-6 rounded-3xl bg-darkroom-card/80 border border-tool-diligence/30 shadow-xl backdrop-blur-sm space-y-3">
              <div className="flex items-center gap-2 text-tool-diligence font-mono font-bold text-xs uppercase tracking-wider">
                <Sparkles className="size-4" />
                <span>Grant Packaging Strategy Roadmap</span>
              </div>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
                {scoutResult.strategySummary}
              </p>
            </div>
          )}

          {/* Category Filter Chips */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-b border-darkroom-border pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-slate-400 mr-1">Filter:</span>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  activeCategoryFilter === 'ALL'
                    ? 'bg-tool-diligence text-slate-950 font-bold shadow-md'
                    : 'bg-darkroom-surface text-slate-400 hover:text-white'
                }`}
              >
                All Grants ({scoutResult.grants.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveCategoryFilter('PRODUCTION')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  activeCategoryFilter === 'PRODUCTION'
                    ? 'bg-tool-diligence text-slate-950 font-bold shadow-md'
                    : 'bg-darkroom-surface text-slate-400 hover:text-white'
                }`}
              >
                Production Support
              </button>

              <button
                type="button"
                onClick={() => setActiveCategoryFilter('DEVELOPMENT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  activeCategoryFilter === 'DEVELOPMENT'
                    ? 'bg-tool-diligence text-slate-950 font-bold shadow-md'
                    : 'bg-darkroom-surface text-slate-400 hover:text-white'
                }`}
              >
                Development Funds
              </button>

              <button
                type="button"
                onClick={() => setActiveCategoryFilter('UK_LOTTERY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  activeCategoryFilter === 'UK_LOTTERY'
                    ? 'bg-tool-diligence text-slate-950 font-bold shadow-md'
                    : 'bg-darkroom-surface text-slate-400 hover:text-white'
                }`}
              >
                UK & Lottery Endowments
              </button>

              <button
                type="button"
                onClick={() => setActiveCategoryFilter('DOC')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  activeCategoryFilter === 'DOC'
                    ? 'bg-tool-diligence text-slate-950 font-bold shadow-md'
                    : 'bg-darkroom-surface text-slate-400 hover:text-white'
                }`}
              >
                Documentary Specific
              </button>
            </div>

            <span className="text-xs text-slate-500 font-mono">
              Retrieved in {scoutResult.durationSeconds}s
            </span>
          </div>

          {/* Grants Cards List */}
          <div className="grid grid-cols-1 gap-5">
            {filteredGrants.map((grant, index) => (
              <motion.div
                key={grant.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-3xl bg-darkroom-surface border border-darkroom-border hover:border-tool-diligence/40 transition-all shadow-xl space-y-4 text-slate-200"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-tool-diligence/15 text-tool-diligence border border-tool-diligence/30 font-semibold uppercase">
                        {grant.category}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Building2 className="size-3.5 text-slate-500" />
                        <span>{grant.fundingBody}</span>
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-white tracking-tight">
                      {grant.title}
                    </h3>
                  </div>

                  {/* Fit Score & Amount */}
                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs">
                      <Award className="size-3.5" />
                      <span>{grant.fitScore}% Match</span>
                    </div>
                    <div className="text-sm font-bold text-white font-mono mt-1">
                      {grant.amountRange}
                    </div>
                  </div>
                </div>

                {/* Fit Rationale */}
                <div className="p-3.5 rounded-2xl bg-darkroom-card/90 border border-darkroom-border/80 text-xs sm:text-sm text-slate-300">
                  <span className="font-semibold text-tool-diligence font-mono mr-1">
                    Strategic Fit:
                  </span>
                  {grant.fitRationale}
                </div>

                {/* Key Eligibility Criteria Checklist */}
                {grant.keyCriteria && grant.keyCriteria.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileCheck className="size-3.5 text-tool-diligence" />
                      <span>Key Eligibility Criteria</span>
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      {grant.keyCriteria.map((crit, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="size-4 text-tool-diligence shrink-0 mt-0.5" />
                          <span>{crit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Card Footer: Deadlines & Actions */}
                <div className="pt-3 border-t border-darkroom-border flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Clock className="size-4 text-slate-500" />
                    <span>
                      Deadline:{' '}
                      <strong className="text-white">
                        {grant.deadlineDate || grant.deadlineLabel}
                      </strong>
                    </span>
                    {grant.deadlineLabel && grant.deadlineDate && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-darkroom-card text-slate-400 border border-darkroom-border">
                        {grant.deadlineLabel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 1-Click .ics Calendar Sync */}
                    <button
                      type="button"
                      onClick={() => handleExportICS(grant)}
                      className="px-3 py-1.5 rounded-xl bg-darkroom-card hover:bg-darkroom-surface border border-darkroom-border text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download .ics Calendar Event"
                    >
                      <Calendar className="size-3.5 text-tool-diligence" />
                      <span>Sync Deadline (.ics)</span>
                    </button>

                    {/* Official Guidelines Link */}
                    {grant.guidelinesUrl && (
                      <a
                        href={grant.guidelinesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-tool-diligence/10 hover:bg-tool-diligence/20 border border-tool-diligence/30 text-tool-diligence text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <span>Official Guidelines</span>
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredGrants.length === 0 && (
              <div className="p-12 text-center text-slate-500 rounded-3xl bg-darkroom-surface border border-darkroom-border space-y-2">
                <p>No grants found matching this category filter.</p>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('ALL')}
                  className="text-xs text-tool-diligence underline cursor-pointer"
                >
                  View all grants
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
