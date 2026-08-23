import React, { useState, useRef } from 'react';
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
  Loader2,
  Upload
} from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onDeepScreen: (festivalName: string) => void;
  initialProfile?: FilmProfile;
}

export const OpportunityScout: React.FC<Props> = ({ onDeepScreen, initialProfile }) => {
  const [profile, setProfile] = useState<FilmProfile>(() => initialProfile || {
    title: '',
    year: '',
    genre: '',
    runtimeMinutes: 0,
    premiereGoals: ['WORLD_PREMIERE'],
    targetRegions: ['UK & Europe', 'North America'],
    neverReleased: false,
  });

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

  const filteredOpportunities = scoutResult?.opportunities.filter((opp) => {
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
    // In a real app we would parse the file/URL here
  };

  const isFormValid = profile.title.length > 0 && profile.year.length > 0 && profile.genre.length > 0 && profile.runtimeMinutes > 0;

  const handlePremiereGoalToggle = (goal: PremiereGoal) => {
    setProfile(prev => {
      const current = [...prev.premiereGoals];
      if (current.includes(goal)) {
        return { ...prev, premiereGoals: current.filter(g => g !== goal) };
      }
      return { ...prev, premiereGoals: [...current, goal] };
    });
  };

  const handleRegionToggle = (region: string) => {
    setProfile(prev => {
      const current = [...prev.targetRegions];
      if (current.includes(region)) {
        return { ...prev, targetRegions: current.filter(r => r !== region) };
      }
      return { ...prev, targetRegions: [...current, region] };
    });
  };

  return (
    <div className="space-y-8">
      {/* Header & Hero */}
      <section className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-paper-text dark:text-darkroom-text">
          Find the best festival for your film
        </h1>
      </section>

      {/* Film Profile Intake Form */}
      <form
        onSubmit={handleScout}
        className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border shadow-sm space-y-6"
      >
        {/* Dropzone */}
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging ? 'border-[#F43F5E] bg-[#F43F5E]/5' : 'border-paper-border dark:border-darkroom-border hover:border-paper-muted'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="size-8 mx-auto mb-3 text-paper-muted dark:text-darkroom-muted" />
          <p className="text-paper-text dark:text-darkroom-text font-medium">Drop any document about the film or an URL here</p>
          <p className="text-sm text-paper-muted dark:text-darkroom-muted mt-1">We'll automatically extract the details</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm pt-4">
          {/* Film Title */}
          <div className="space-y-1.5">
            <label className="font-semibold text-paper-text dark:text-darkroom-text">
              Film Title
            </label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border text-base text-paper-text dark:text-darkroom-text focus:outline-none focus:border-[#F43F5E]"
              required
            />
          </div>

          {/* Year */}
          <div className="space-y-1.5">
            <label className="font-semibold text-paper-text dark:text-darkroom-text">
              Year
            </label>
            <input
              type="text"
              value={profile.year}
              onChange={(e) => setProfile({ ...profile, year: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border text-base text-paper-text dark:text-darkroom-text focus:outline-none focus:border-[#F43F5E]"
              required
            />
          </div>

          {/* Genre */}
          <div className="space-y-1.5">
            <label className="font-semibold text-paper-text dark:text-darkroom-text">
              Genre
            </label>
            <input
              type="text"
              value={profile.genre}
              onChange={(e) => setProfile({ ...profile, genre: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border text-base text-paper-text dark:text-darkroom-text focus:outline-none focus:border-[#F43F5E]"
              required
            />
          </div>

          {/* Runtime */}
          <div className="space-y-1.5">
            <label className="font-semibold text-paper-text dark:text-darkroom-text">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min={1}
              max={300}
              value={profile.runtimeMinutes || ''}
              onChange={(e) => setProfile({ ...profile, runtimeMinutes: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border text-base text-paper-text dark:text-darkroom-text focus:outline-none focus:border-[#F43F5E]"
              required
            />
          </div>
        </div>

        <div className="pt-2">
           <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.neverReleased}
                onChange={(e) => setProfile({ ...profile, neverReleased: e.target.checked })}
                className="size-4 rounded border-paper-border text-[#F43F5E] focus:ring-[#F43F5E]"
              />
              <span className="text-paper-text dark:text-darkroom-text font-medium text-sm">
                Never released on a festival
              </span>
           </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm pt-2">
          {/* Premiere Goals Multiple */}
          <div className="space-y-2">
            <label className="font-semibold text-paper-text dark:text-darkroom-text block">
              Premiere Status
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'WORLD_PREMIERE', label: 'World Premiere' },
                { id: 'INTERNATIONAL_PREMIERE', label: 'International Premiere' },
                { id: 'NATIONAL_PREMIERE', label: 'National Premiere' },
                { id: 'NO_PREFERENCE', label: 'No Preference' }
              ].map(goal => (
                <button
                  type="button"
                  key={goal.id}
                  onClick={() => handlePremiereGoalToggle(goal.id as PremiereGoal)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${profile.premiereGoals.includes(goal.id as PremiereGoal) ? 'border-[#F43F5E] bg-[#F43F5E]/10 text-[#F43F5E]' : 'border-paper-border dark:border-darkroom-border text-paper-muted dark:text-darkroom-muted hover:border-paper-muted'}`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Regions Multiple */}
          <div className="space-y-2">
            <label className="font-semibold text-paper-text dark:text-darkroom-text block">
              Submission Region
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'UK & Europe', label: 'UK & Europe' },
                { id: 'North America', label: 'North America' },
                { id: 'Global / International', label: 'Global' }
              ].map(region => (
                <button
                  type="button"
                  key={region.id}
                  onClick={() => handleRegionToggle(region.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${profile.targetRegions.includes(region.id) ? 'border-[#F43F5E] bg-[#F43F5E]/10 text-[#F43F5E]' : 'border-paper-border dark:border-darkroom-border text-paper-muted dark:text-darkroom-muted hover:border-paper-muted'}`}
                >
                  {region.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-3.5 rounded-xl bg-[#F43F5E] hover:bg-[#E11D48] disabled:opacity-50 text-white font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-md shadow-[#F43F5E]/25 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <span>Scan for opportunities</span>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="max-w-3xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-base">
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
            <div className="text-sm font-mono font-semibold uppercase tracking-wider text-[#F43F5E] flex items-center gap-2">
              <Compass className="size-4.5" />
              <span>Strategy Roadmap: {scoutResult.filmTitle}</span>
            </div>
            <p className="font-serif text-base sm:text-lg text-paper-text dark:text-darkroom-text leading-relaxed whitespace-pre-line">
              {scoutResult.strategySummary}
            </p>
          </div>

          {/* Filter Pills Strip */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm font-mono text-paper-muted dark:text-darkroom-muted">
              Found {scoutResult.opportunitiesFound} opportunities in {scoutResult.durationSeconds}s
            </div>

            <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border text-xs">
              {[
                { id: 'ALL', label: 'All Calls' },
                { id: 'BAFTA', label: 'BAFTA Qualifying' },
                { id: 'ACADEMY', label: 'Oscar Qualifying' },
                { id: 'BIFA', label: 'BIFA Qualifying' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterTag(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer ${
                    filterTag === f.id
                      ? 'bg-[#F43F5E] text-white shadow-xs font-semibold'
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
