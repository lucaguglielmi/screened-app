import React, { useState } from 'react';
import { FilmProfile, PremiereGoal, ScoutResponse } from '../types/investigation';
import { OpportunityCard } from './OpportunityCard';
import { Upload, Loader2, Compass, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onDeepScreen: (festivalName: string) => void;
  initialProfile?: FilmProfile;
}

export const OpportunityScout: React.FC<Props> = ({ onDeepScreen, initialProfile }) => {
  const [profile, setProfile] = useState<FilmProfile>(
    () =>
      initialProfile || {
        title: '',
        year: '',
        genre: '',
        runtimeMinutes: 0,
        premiereGoals: ['WORLD_PREMIERE'],
        targetRegions: ['UK & Europe', 'North America'],
        neverReleased: false,
      },
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoutResult, setScoutResult] = useState<ScoutResponse | null>(null);
  const [filterTag, setFilterTag] = useState<string>('ALL');

  const [isDragging, setIsDragging] = useState(false);

  React.useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      executeScout(initialProfile);
    }
  }, [initialProfile]);

  const executeScout = async (targetProfile: FilmProfile) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: targetProfile }),
      });
      if (!res.ok) throw new Error('Scout request failed');
      const data: ScoutResponse = await res.json();
      setScoutResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to scout opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleScout = async (e: React.FormEvent) => {
    e.preventDefault();
    executeScout(profile);
  };

  const filteredOpportunities =
    scoutResult?.opportunities.filter((opp: any) => {
      if (filterTag === 'ALL') return true;
      if (filterTag === 'BAFTA') return opp.accreditationTags.includes('BAFTA_QUALIFYING');
      if (filterTag === 'ACADEMY') return opp.accreditationTags.includes('ACADEMY_QUALIFYING');
      if (filterTag === 'BIFA') return opp.accreditationTags.includes('BIFA_QUALIFYING');
      return true;
    }) || [];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const isFormValid =
    profile.title.length > 0 &&
    profile.year.length > 0 &&
    profile.genre.length > 0 &&
    profile.runtimeMinutes > 0;

  const handlePremiereGoalToggle = (goal: PremiereGoal) => {
    setProfile((prev) => {
      const current = [...prev.premiereGoals];
      if (current.includes(goal)) {
        return { ...prev, premiereGoals: current.filter((g) => g !== goal) };
      }
      return { ...prev, premiereGoals: [...current, goal] };
    });
  };

  const handleRegionToggle = (region: string) => {
    setProfile((prev) => {
      const current = [...prev.targetRegions];
      if (current.includes(region)) {
        return { ...prev, targetRegions: current.filter((r) => r !== region) };
      }
      return { ...prev, targetRegions: [...current, region] };
    });
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header & Hero */}
      <section className="text-center space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          Find the best festival for your film
        </h1>
        <p className="text-base text-slate-400 max-w-xl mx-auto">
          Scout tailored qualifying submission windows and accreditation roadmaps.
        </p>
      </section>

      {/* Film Profile Intake Form: Solid Opaque Card, No Borders */}
      <form
        onSubmit={handleScout}
        className="p-7 sm:p-9 rounded-3xl bg-darkroom-surface shadow-2xl shadow-black/80 space-y-6"
      >
        {/* Minimalist Dropzone */}
        <div
          className={`rounded-2xl p-6 text-center transition-all cursor-pointer ${
            isDragging ? 'bg-darkroom-card' : 'bg-darkroom-card hover:bg-darkroom-card'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="size-7 mx-auto mb-2 text-tool-scout" />
          <p className="text-white font-medium text-sm">
            Drop any document about the film or paste a URL
          </p>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            We'll automatically extract title, genre, and duration
          </p>
        </div>

        {/* 2-Column Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {/* Film Title */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 block">
              Film Title
            </label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              placeholder="e.g. Echoes of Daylight"
              className="w-full px-4 py-3 rounded-xl bg-darkroom-card text-base text-white placeholder-slate-500 focus:bg-paper-border focus:bg-darkroom-border focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Year */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 block">
              Production Year
            </label>
            <input
              type="text"
              value={profile.year}
              onChange={(e) => setProfile({ ...profile, year: e.target.value })}
              placeholder="2026"
              className="w-full px-4 py-3 rounded-xl bg-darkroom-card text-base text-white placeholder-slate-500 focus:bg-paper-border focus:bg-darkroom-border focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 block">
              Genre
            </label>
            <input
              type="text"
              value={profile.genre}
              onChange={(e) => setProfile({ ...profile, genre: e.target.value })}
              placeholder="e.g. Sci-Fi, Drama, Documentary"
              className="w-full px-4 py-3 rounded-xl bg-darkroom-card text-base text-white placeholder-slate-500 focus:bg-paper-border focus:bg-darkroom-border focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Runtime */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 block">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min={1}
              max={300}
              value={profile.runtimeMinutes || ''}
              onChange={(e) =>
                setProfile({ ...profile, runtimeMinutes: parseInt(e.target.value) || 0 })
              }
              placeholder="15"
              className="w-full px-4 py-3 rounded-xl bg-darkroom-card text-base text-white placeholder-slate-500 focus:bg-paper-border focus:bg-darkroom-border focus:outline-none transition-colors"
              required
            />
          </div>
        </div>

        {/* Never Released Checkbox */}
        <div className="pt-1">
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <div
              onClick={() => setProfile({ ...profile, neverReleased: !profile.neverReleased })}
              className={`size-5 rounded-lg flex items-center justify-center transition-all ${
                profile.neverReleased
                  ? 'bg-tool-scout text-white shadow-md shadow-[var(--color-tool-scout)]/30'
                  : 'bg-darkroom-card group-hover:bg-paper-border group-hover:bg-darkroom-border'
              }`}
            >
              {profile.neverReleased && <Check className="size-3.5 stroke-[3]" />}
            </div>
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
              Never released on a film festival (eligible for World Premiere)
            </span>
          </label>
        </div>

        {/* Premiere Status & Submission Region Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Premiere Goals */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 block">
              Premiere Status
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'WORLD_PREMIERE', label: 'World Premiere' },
                { id: 'INTERNATIONAL_PREMIERE', label: 'International Premiere' },
                { id: 'NATIONAL_PREMIERE', label: 'National Premiere' },
                { id: 'NO_PREFERENCE', label: 'No Preference' },
              ].map((goal) => {
                const active = profile.premiereGoals.includes(goal.id as PremiereGoal);
                return (
                  <button
                    type="button"
                    key={goal.id}
                    onClick={() => handlePremiereGoalToggle(goal.id as PremiereGoal)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-tool-scout text-white shadow-md shadow-[var(--color-tool-scout)]/30 scale-102'
                        : 'bg-darkroom-card text-slate-300 hover:bg-paper-border hover:bg-darkroom-border hover:text-white'
                    }`}
                  >
                    {goal.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Regions */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 block">
              Submission Region
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'UK & Europe', label: 'UK & Europe' },
                { id: 'North America', label: 'North America' },
                { id: 'Global / International', label: 'Global' },
              ].map((region) => {
                const active = profile.targetRegions.includes(region.id);
                return (
                  <button
                    type="button"
                    key={region.id}
                    onClick={() => handleRegionToggle(region.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-tool-scout text-white shadow-md shadow-[var(--color-tool-scout)]/30 scale-102'
                        : 'bg-darkroom-card text-slate-300 hover:bg-paper-border hover:bg-darkroom-border hover:text-white'
                    }`}
                  >
                    {region.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-tool-scout to-tool-scout-hover hover:brightness-110 disabled:opacity-40 text-white font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-[var(--color-tool-scout)]/30 cursor-pointer active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Scanning 200+ Festival Calls...</span>
              </>
            ) : (
              <span>Scan for opportunities</span>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="p-5 rounded-2xl bg-rose-500/20 text-rose-300 text-sm font-mono shadow-lg">
          {error}
        </div>
      )}

      {/* Results Section */}
      {scoutResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 pt-2"
        >
          {/* Strategy Roadmap Narrative: Solid Opaque Card */}
          <div className="p-7 sm:p-8 rounded-3xl bg-darkroom-surface shadow-2xl shadow-black/80 space-y-3">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-tool-scout flex items-center gap-2">
              <Compass className="size-4" />
              <span>Strategy Roadmap: {scoutResult.filmTitle}</span>
            </div>
            <p className="font-serif text-base sm:text-lg text-slate-200 leading-relaxed whitespace-pre-line">
              {scoutResult.strategySummary}
            </p>
          </div>

          {/* Filter Pills Strip */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs font-mono text-slate-400">
              Found{' '}
              <span className="text-white font-semibold">{scoutResult.opportunitiesFound}</span>{' '}
              opportunities in {scoutResult.durationSeconds}s
            </div>

            <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-darkroom-surface text-xs shadow-lg">
              {[
                { id: 'ALL', label: 'All Calls' },
                { id: 'BAFTA', label: 'BAFTA' },
                { id: 'ACADEMY', label: 'Oscars' },
                { id: 'BIFA', label: 'BIFA' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterTag(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer ${
                    filterTag === f.id
                      ? 'bg-tool-scout text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredOpportunities.map((opp: any) => (
              <OpportunityCard key={opp.id} opportunity={opp} onDeepScreen={onDeepScreen} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
