import React, { useState } from 'react';
import { 
  FilmFormat, 
  FilmProfile, 
  PremiereGoal, 
  ScoutResponse 
} from '../types/investigation';
import { OpportunityCard } from './OpportunityCard';
import { 
  Compass, 
  Sparkles, 
  Film, 
  Loader2 
} from 'lucide-react';

import { motion } from 'motion/react';

interface Props {
  onDeepScreen: (festivalName: string) => void;
}

export const OpportunityScout: React.FC<Props> = ({ onDeepScreen }) => {
  const [profile, setProfile] = useState<FilmProfile>({
    title: 'The Silent Echo',
    format: 'SHORT',
    genre: 'Drama',
    runtimeMinutes: 14,
    premiereGoal: 'WORLD_PREMIERE',
    targetRegions: ['UK & Europe', 'North America'],
    budgetTier: 'Micro (< $50k)',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoutResult, setScoutResult] = useState<ScoutResponse | null>(null);
  const [filterTag, setFilterTag] = useState<string>('ALL');

  const handleScout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to scout festival opportunities.');
      }

      const data: ScoutResponse = await res.json();
      setScoutResult(data);
    } catch (err: any) {
      setError(err.message || 'Scouting search failed.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = scoutResult?.opportunities.filter((opp) => {
    if (filterTag === 'ALL') return true;
    if (filterTag === 'BAFTA') return opp.accreditationTags.includes('BAFTA_QUALIFYING');
    if (filterTag === 'ACADEMY') return opp.accreditationTags.includes('ACADEMY_QUALIFYING');
    if (filterTag === 'BIFA') return opp.accreditationTags.includes('BIFA_QUALIFYING');
    return true;
  }) || [];

  return (
    <div className="space-y-8">
      {/* Header & Hero */}
      <section className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <Compass className="size-3.5" />
          <span>Strategic Festival Scouting</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-paper-text dark:text-darkroom-text">
          Find matching festivals for your film.
        </h1>
        <p className="text-sm text-paper-muted dark:text-darkroom-muted leading-relaxed">
          Screened scans open call-for-entries, deadlines, qualification lists (BAFTA/BIFA/Oscar), and fee schedules matching your specific runtime and premiere goals.
        </p>
      </section>

      {/* Film Profile Intake Form */}
      <form
        onSubmit={handleScout}
        className="max-w-3xl mx-auto p-6 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border shadow-sm space-y-5"
      >
        <div className="flex items-center gap-2 border-b border-paper-border dark:border-darkroom-border pb-3">
          <Film className="size-4 text-indigo-500" />
          <h2 className="font-serif text-base font-semibold text-paper-text dark:text-darkroom-text">
            Film Profile & Premiere Strategy
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Film Title */}
          <div className="space-y-1">
            <label className="font-mono uppercase text-paper-muted dark:text-darkroom-muted">
              Film Title
            </label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border text-paper-text dark:text-darkroom-text focus:outline-none"
              required
            />
          </div>

          {/* Format */}
          <div className="space-y-1">
            <label className="font-mono uppercase text-paper-muted dark:text-darkroom-muted">
              Format
            </label>
            <select
              value={profile.format}
              onChange={(e) => setProfile({ ...profile, format: e.target.value as FilmFormat })}
              className="w-full px-3 py-2 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border text-paper-text dark:text-darkroom-text focus:outline-none"
            >
              <option value="SHORT">Short Film (&lt; 40 min)</option>
              <option value="FEATURE">Feature Narrative (&gt; 60 min)</option>
              <option value="DOCUMENTARY">Documentary</option>
              <option value="ANIMATION">Animation</option>
              <option value="EPISODIC">Episodic / Series</option>
            </select>
          </div>

          {/* Genre */}
          <div className="space-y-1">
            <label className="font-mono uppercase text-paper-muted dark:text-darkroom-muted">
              Primary Genre
            </label>
            <input
              type="text"
              value={profile.genre}
              onChange={(e) => setProfile({ ...profile, genre: e.target.value })}
              placeholder="e.g. Drama, Thriller, Sci-Fi, Horror"
              className="w-full px-3 py-2 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border text-paper-text dark:text-darkroom-text focus:outline-none"
              required
            />
          </div>

          {/* Runtime */}
          <div className="space-y-1">
            <label className="font-mono uppercase text-paper-muted dark:text-darkroom-muted">
              Runtime (Minutes)
            </label>
            <input
              type="number"
              min={1}
              max={300}
              value={profile.runtimeMinutes}
              onChange={(e) => setProfile({ ...profile, runtimeMinutes: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border text-paper-text dark:text-darkroom-text focus:outline-none"
              required
            />
          </div>

          {/* Premiere Goal */}
          <div className="space-y-1">
            <label className="font-mono uppercase text-paper-muted dark:text-darkroom-muted">
              Target Premiere Status
            </label>
            <select
              value={profile.premiereGoal}
              onChange={(e) => setProfile({ ...profile, premiereGoal: e.target.value as PremiereGoal })}
              className="w-full px-3 py-2 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border text-paper-text dark:text-darkroom-text focus:outline-none"
            >
              <option value="WORLD_PREMIERE">World Premiere Required</option>
              <option value="INTERNATIONAL_PREMIERE">International Premiere</option>
              <option value="NATIONAL_PREMIERE">National / Regional Premiere</option>
              <option value="NO_PREFERENCE">No Premiere Preference</option>
            </select>
          </div>

          {/* Target Regions */}
          <div className="space-y-1">
            <label className="font-mono uppercase text-paper-muted dark:text-darkroom-muted">
              Target Submission Region
            </label>
            <select
              value={profile.targetRegions[0] || 'UK & Europe'}
              onChange={(e) => setProfile({ ...profile, targetRegions: [e.target.value] })}
              className="w-full px-3 py-2 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border text-paper-text dark:text-darkroom-text focus:outline-none"
            >
              <option value="UK & Europe">UK & Europe</option>
              <option value="North America">North America (US & Canada)</option>
              <option value="Global / International">Global / International</option>
            </select>
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Scanning 2026 Deadlines & Accreditations via Parallel...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                <span>Discover Verified Festival Opportunities</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="max-w-3xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Results Section */}
      {scoutResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Strategy Roadmap Narrative */}
          <div className="p-6 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Compass className="size-4" />
              <span>Strategy Roadmap: {scoutResult.filmTitle}</span>
            </div>
            <p className="font-serif text-sm sm:text-base text-paper-text dark:text-darkroom-text leading-relaxed whitespace-pre-line">
              {scoutResult.strategySummary}
            </p>
          </div>

          {/* Filter Pills Strip */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs font-mono text-paper-muted dark:text-darkroom-muted">
              Found {scoutResult.opportunitiesFound} opportunities in {scoutResult.durationSeconds}s
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border text-xs">
              {[
                { id: 'ALL', label: 'All Calls' },
                { id: 'BAFTA', label: 'BAFTA Qualifying' },
                { id: 'ACADEMY', label: 'Oscar Qualifying' },
                { id: 'BIFA', label: 'BIFA Qualifying' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterTag(f.id)}
                  className={`px-3 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                    filterTag === f.id
                      ? 'bg-indigo-600 text-white shadow-xs font-medium'
                      : 'text-paper-muted dark:text-darkroom-muted hover:text-paper-text dark:hover:text-darkroom-text'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onDeepScreen={onDeepScreen}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
