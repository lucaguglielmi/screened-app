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
  FileText,
  UploadCloud,
  CheckSquare,
  Square,
  Download,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  FolderArchive,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FilmFormat,
  GrantOpportunity,
  GrantScoutRequest,
  GrantScoutResponse,
  GrantGuidelinesAnalysis,
  GrantChecklistResponse,
  GrantExportKitResponse,
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

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [sortBy, setSortBy] = useState<'fitScore' | 'deadlineDate'>('fitScore');

  // Results State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoutResult, setScoutResult] = useState<GrantScoutResponse | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  // Guidelines Parsing Modal State (Phase 2)
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState(false);
  const [guidelinesText, setGuidelinesText] = useState('');
  const [guidelinesFileName, setGuidelinesFileName] = useState('Official_Guidelines.txt');
  const [parsingGuidelines, setParsingGuidelines] = useState(false);
  const [guidelinesAnalysis, setGuidelinesAnalysis] = useState<GrantGuidelinesAnalysis | null>(null);

  // Application Packaging Checklist Drawer State (Phase 3)
  const [checklistDrawerOpen, setChecklistDrawerOpen] = useState(false);
  const [activeChecklist, setActiveChecklist] = useState<GrantChecklistResponse | null>(null);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [exportingKit, setExportingKit] = useState(false);
  const [exportKitResult, setExportKitResult] = useState<GrantExportKitResponse | null>(null);

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

  // Auto-scout on initial mount or pagination change
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
        page: currentPage,
        pageSize,
        sortBy,
      };
      executeGrantScout(payload);
    }, 0);
    return () => clearTimeout(timer);
  }, [currentPage, sortBy, executeGrantScout]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const payload: GrantScoutRequest = {
      projectTitle: projectTitle.trim() || 'Untitled Cinema Project',
      format,
      genre,
      productionStage,
      budgetTier,
      fundingNeeded,
      filmmakerRegion,
      page: 1,
      pageSize,
      sortBy,
    };
    executeGrantScout(payload);
  };

  // Guidelines Parsing Handler (Phase 2)
  const handleParseGuidelines = async () => {
    if (!guidelinesText.trim()) return;
    setParsingGuidelines(true);
    soundEffects.playClick();
    try {
      const res = await fetch('/api/grants/parse-guidelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: guidelinesFileName,
          fileContent: guidelinesText,
          mimeType: 'text/plain',
        }),
      });
      if (!res.ok) throw new Error(`Guideline parsing failed with status ${res.status}`);
      const data: GrantGuidelinesAnalysis = await res.json();
      setGuidelinesAnalysis(data);
      soundEffects.playSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Guideline parsing failed');
      soundEffects.playCaution();
    } finally {
      setParsingGuidelines(false);
    }
  };

  // Packaging Checklist Generation Handler (Phase 3)
  const handleOpenChecklist = async (grant?: GrantOpportunity) => {
    setLoadingChecklist(true);
    setChecklistDrawerOpen(true);
    setExportKitResult(null);
    soundEffects.playClick();
    try {
      const res = await fetch('/api/grants/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grantId: grant?.id,
          grantOpportunity: grant,
          projectTitle: projectTitle || 'Untitled Cinema Project',
          format,
          genre,
          productionStage,
          budgetTier,
        }),
      });
      if (!res.ok) throw new Error(`Failed to load checklist: ${res.status}`);
      const data: GrantChecklistResponse = await res.json();
      setActiveChecklist(data);
      soundEffects.playSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate packaging checklist');
      soundEffects.playCaution();
    } finally {
      setLoadingChecklist(false);
    }
  };

  // Toggle Checklist Item Checkbox
  const handleToggleChecklistItem = (itemId: string) => {
    if (!activeChecklist) return;
    soundEffects.playClick();
    const updatedItems = activeChecklist.items.map((it) =>
      it.id === itemId ? { ...it, isCompleted: !it.isCompleted } : it,
    );
    const completedCount = updatedItems.filter((it) => it.isCompleted).length;
    const score = Math.round((completedCount / updatedItems.length) * 100);

    setActiveChecklist({
      ...activeChecklist,
      items: updatedItems,
      readinessScore: score,
    });
  };

  // 1-Click Export Readiness Kit (Phase 3)
  const handleExportReadinessKit = async () => {
    if (!activeChecklist) return;
    setExportingKit(true);
    soundEffects.playClick();
    try {
      const res = await fetch('/api/grants/checklist/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklist: activeChecklist }),
      });
      if (!res.ok) throw new Error(`Failed to export kit: ${res.status}`);
      const data: GrantExportKitResponse = await res.json();
      setExportKitResult(data);

      // Download Markdown Binder
      const mdBlob = new Blob([data.markdownContent], { type: 'text/markdown;charset=utf-8' });
      const mdUrl = URL.createObjectURL(mdBlob);
      const mdLink = document.createElement('a');
      mdLink.href = mdUrl;
      mdLink.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_readiness_kit.md`;
      document.body.appendChild(mdLink);
      mdLink.click();
      document.body.removeChild(mdLink);

      // Download .ICS calendar
      const icsBlob = new Blob([data.icsContent], { type: 'text/calendar;charset=utf-8' });
      const icsUrl = URL.createObjectURL(icsBlob);
      const icsLink = document.createElement('a');
      icsLink.href = icsUrl;
      icsLink.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_milestones.ics`;
      document.body.appendChild(icsLink);
      icsLink.click();
      document.body.removeChild(icsLink);

      soundEffects.playSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      soundEffects.playCaution();
    } finally {
      setExportingKit(false);
    }
  };

  // 1-Click .ics Calendar Export for Single Grant Deadline
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

  const totalPages = scoutResult?.totalCount
    ? Math.ceil(scoutResult.totalCount / pageSize)
    : 1;

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Hero Header & Guideline Parser CTA */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tool-diligence/10 border border-tool-diligence/30 text-tool-diligence text-xs font-mono font-bold tracking-wider uppercase">
          <Coins className="size-3.5 text-tool-diligence" />
          <span>Institutional Film Funds & Grants Diligence</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          Public Grant & Film Fund Match
        </h1>

        <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Discover verified public funding, lottery endowments, and regional production grants with
          automated guideline parsing and 1-click submission packaging kits.
        </p>

        {/* Phase 2: Guideline Parser Banner CTA */}
        <div className="pt-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setGuidelinesModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-darkroom-surface border border-tool-diligence/40 hover:border-tool-diligence text-tool-diligence hover:text-white text-xs font-mono font-bold transition-all shadow-lg hover:shadow-tool-diligence/10 cursor-pointer"
          >
            <FileText className="size-4 text-tool-diligence" />
            <span>Parse Official Guidelines PDF / Text</span>
            <span className="px-1.5 py-0.5 rounded-full bg-tool-diligence/20 text-[10px] text-tool-diligence uppercase">
              Gemini Flash
            </span>
          </button>
        </div>
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
                placeholder="e.g. The Salt Road"
                className="w-full px-4 py-2.5 rounded-xl bg-darkroom-card border border-darkroom-border focus:border-tool-diligence focus:outline-none text-white text-sm"
              />
            </div>

            {/* Filmmaker Region */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Filmmaker Legal Residency / Country
              </label>
              <select
                value={filmmakerRegion}
                onChange={(e) => setFilmmakerRegion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-darkroom-card border border-darkroom-border focus:border-tool-diligence focus:outline-none text-white text-sm"
              >
                <option value="UK & Europe">UK & Europe</option>
                <option value="UK & Scotland">UK & Scotland</option>
                <option value="UK & Wales">UK & Wales</option>
                <option value="UK & Northern Ireland">UK & Northern Ireland</option>
                <option value="North America">North America (US & Canada)</option>
                <option value="International">International (Global South & All)</option>
              </select>
            </div>

            {/* Format */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as FilmFormat)}
                className="w-full px-4 py-2.5 rounded-xl bg-darkroom-card border border-darkroom-border focus:border-tool-diligence focus:outline-none text-white text-sm"
              >
                <option value="FEATURE">Feature Film</option>
                <option value="SHORT">Short Film</option>
                <option value="DOCUMENTARY">Documentary</option>
                <option value="SERIES">Episodic Series</option>
                <option value="ANIMATION">Animation</option>
              </select>
            </div>

            {/* Genre */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Primary Genre
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Drama, Thriller"
                className="w-full px-4 py-2.5 rounded-xl bg-darkroom-card border border-darkroom-border focus:border-tool-diligence focus:outline-none text-white text-sm"
              />
            </div>

            {/* Production Stage */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Target Funding Stage
              </label>
              <select
                value={productionStage}
                onChange={(e) => setProductionStage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-darkroom-card border border-darkroom-border focus:border-tool-diligence focus:outline-none text-white text-sm"
              >
                <option value="Development">Development (Early / Script)</option>
                <option value="Pre-Production">Pre-Production & Packaging</option>
                <option value="Production">Production (Shoot)</option>
                <option value="Post-Production">Post-Production & Completion</option>
                <option value="Distribution">Festival Launch & Distribution</option>
              </select>
            </div>

            {/* Budget Tier */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Estimated Total Budget Tier
              </label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-darkroom-card border border-darkroom-border focus:border-tool-diligence focus:outline-none text-white text-sm"
              >
                <option value="Micro / Indie (< £50k)">Micro / Indie (&lt; £50k)</option>
                <option value="Low (< £250k)">Low (&lt; £250k)</option>
                <option value="Mid (£250k - £1M)">Mid (£250k - £1M)</option>
                <option value="Upper Indie (£1M - £3M)">Upper Indie (£1M - £3M)</option>
                <option value="Major (> £3M)">Major (&gt; £3M)</option>
              </select>
            </div>

            {/* Funding Needed */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Grant Funding Sought
              </label>
              <input
                type="text"
                value={fundingNeeded}
                onChange={(e) => setFundingNeeded(e.target.value)}
                placeholder="e.g. £50,000"
                className="w-full px-4 py-2.5 rounded-xl bg-darkroom-card border border-darkroom-border focus:border-tool-diligence focus:outline-none text-white text-sm font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <Sparkles className="size-4 text-tool-diligence shrink-0" />
              <span>Cross-references BFI, Screen Scotland, Eurimages & international funds.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-tool-diligence hover:bg-tool-diligence/90 text-darkroom-bg font-mono font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-tool-diligence/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Matching Film Funds...</span>
                </>
              ) : (
                <>
                  <Search className="size-4" />
                  <span>Match Public Grants</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Error Display */}
      {error && (
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="size-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {scoutResult && (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Strategy Summary & Controls */}
          <div className="p-5 rounded-3xl bg-darkroom-surface border border-darkroom-border space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-tool-diligence">
                <Building2 className="size-4" />
                <span>Executive Funding Strategy</span>
              </div>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <span>{scoutResult.grantsFound} Opportunities Identified</span>
                <span>•</span>
                <span>Scouted in {scoutResult.durationSeconds}s</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {scoutResult.strategySummary}
            </p>

            {/* Filter Pills & Sort Selector */}
            <div className="pt-2 border-t border-darkroom-border flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-400">Filter:</span>
                {[
                  { id: 'ALL', label: 'All Grants' },
                  { id: 'PRODUCTION', label: 'Production' },
                  { id: 'DEVELOPMENT', label: 'Development' },
                  { id: 'UK_LOTTERY', label: 'UK & National Lottery' },
                  { id: 'DOC', label: 'Documentary' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setActiveCategoryFilter(tab.id);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                      activeCategoryFilter === tab.id
                        ? 'bg-tool-diligence text-darkroom-bg font-bold'
                        : 'bg-darkroom-card hover:bg-darkroom-card/80 text-slate-400 hover:text-slate-200 border border-darkroom-border'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sort By Selector */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-3.5 text-slate-400" />
                <span className="text-xs font-mono text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const nextSort = e.target.value as 'fitScore' | 'deadlineDate';
                    setSortBy(nextSort);
                    soundEffects.playClick();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-darkroom-card border border-darkroom-border text-xs font-mono text-white focus:outline-none cursor-pointer"
                >
                  <option value="fitScore">Highest Fit Score</option>
                  <option value="deadlineDate">Upcoming Deadline</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grant Cards Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredGrants.map((grant, idx) => (
              <motion.div
                key={grant.id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="p-5 sm:p-6 rounded-3xl bg-darkroom-surface border border-darkroom-border hover:border-tool-diligence/50 transition-all shadow-xl space-y-4"
              >
                {/* Header: Title, Funding Body & Fit Badge */}
                <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-darkroom-card text-tool-diligence border border-darkroom-border">
                        {grant.fundingBody}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{grant.category}</span>
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

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Phase 3: Packaging Checklist & Kit Exporter */}
                    <button
                      type="button"
                      onClick={() => handleOpenChecklist(grant)}
                      className="px-3.5 py-1.5 rounded-xl bg-tool-diligence/10 hover:bg-tool-diligence/20 border border-tool-diligence/40 text-tool-diligence text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      title="Generate 4-Pillar Application Packaging Checklist"
                    >
                      <CheckSquare className="size-3.5 text-tool-diligence" />
                      <span>Packaging Checklist</span>
                    </button>

                    {/* 1-Click .ics Calendar Sync */}
                    <button
                      type="button"
                      onClick={() => handleExportICS(grant)}
                      className="px-3 py-1.5 rounded-xl bg-darkroom-card hover:bg-darkroom-surface border border-darkroom-border text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download .ics Calendar Event"
                    >
                      <Calendar className="size-3.5 text-tool-diligence" />
                      <span>Sync (.ics)</span>
                    </button>

                    {/* Official Guidelines Link */}
                    {grant.guidelinesUrl && (
                      <a
                        href={grant.guidelinesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-darkroom-card hover:bg-darkroom-surface border border-darkroom-border text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <span>Official Portal</span>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-darkroom-border">
              <span className="text-xs font-mono text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    soundEffects.playClick();
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-darkroom-surface border border-darkroom-border text-xs font-mono text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    soundEffects.playClick();
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-darkroom-surface border border-darkroom-border text-xs font-mono text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 2: Official Guidelines Clause Extractor Modal */}
      <AnimatePresence>
        {guidelinesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-darkroom-surface border border-darkroom-border rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-darkroom-border pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-tool-diligence" />
                  <h2 className="font-serif text-xl font-bold text-white">
                    Parse Official Funding Guidelines
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setGuidelinesModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-darkroom-card transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {!guidelinesAnalysis ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Paste official grant guideline text, rules, or criteria below. Gemini Flash will
                    automatically extract funding caps, match percentages, nationality rules, and
                    statutory cultural test mandates.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-slate-400">
                      Guideline Title / Source
                    </label>
                    <input
                      type="text"
                      value={guidelinesFileName}
                      onChange={(e) => setGuidelinesFileName(e.target.value)}
                      placeholder="e.g. BFI_Filmmaking_Fund_Guidelines_2026.pdf"
                      className="w-full px-3 py-2 rounded-xl bg-darkroom-card border border-darkroom-border text-white text-xs font-mono focus:outline-none focus:border-tool-diligence"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase text-slate-400">
                      Guideline Content (Paste Text)
                    </label>
                    <textarea
                      rows={8}
                      value={guidelinesText}
                      onChange={(e) => setGuidelinesText(e.target.value)}
                      placeholder="Paste guidelines, eligibility sections, and deliverable lists here..."
                      className="w-full p-3 rounded-xl bg-darkroom-card border border-darkroom-border text-white text-xs font-mono focus:outline-none focus:border-tool-diligence"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setGuidelinesModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-darkroom-card text-xs font-mono text-slate-300 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={parsingGuidelines || !guidelinesText.trim()}
                      onClick={handleParseGuidelines}
                      className="px-5 py-2 rounded-xl bg-tool-diligence text-darkroom-bg text-xs font-mono font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg"
                    >
                      {parsingGuidelines ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Extracting Clauses...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="size-4" />
                          <span>Extract Clauses with Gemini Flash</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs text-slate-300">
                  {/* Extracted Header */}
                  <div className="p-4 rounded-2xl bg-darkroom-card border border-darkroom-border space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-bold text-white text-sm">
                        {guidelinesAnalysis.grantTitle}
                      </span>
                      {guidelinesAnalysis.culturalTestRequired && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-[10px]">
                          Cultural Test Required
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 font-mono">
                      Funding Body: {guidelinesAnalysis.fundingBody}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-darkroom-border font-mono">
                      <div>
                        Max Award:{' '}
                        <strong className="text-emerald-400">
                          {guidelinesAnalysis.maxAwardAmount}
                        </strong>
                      </div>
                      <div>
                        Match Requirement:{' '}
                        <strong className="text-white">
                          {guidelinesAnalysis.matchFundingPercentage || 'None'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-slate-300 leading-relaxed italic">
                    {guidelinesAnalysis.guidelineSummary}
                  </p>

                  {/* Eligibility */}
                  <div className="space-y-1.5">
                    <span className="font-mono font-bold text-tool-diligence uppercase">
                      Eligibility & Residency Rules:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      {guidelinesAnalysis.eligibilityCriteria.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                      {guidelinesAnalysis.nationalityOrResidencyRules.map((r, i) => (
                        <li key={`r-${i}`} className="text-slate-400">
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deliverables */}
                  <div className="space-y-1.5">
                    <span className="font-mono font-bold text-tool-diligence uppercase">
                      Required Deliverables:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      {guidelinesAnalysis.requiredDeliverables.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-darkroom-border">
                    <button
                      type="button"
                      onClick={() => setGuidelinesAnalysis(null)}
                      className="text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Parse Another Document
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGuidelinesModalOpen(false);
                        handleOpenChecklist();
                      }}
                      className="px-4 py-2 rounded-xl bg-tool-diligence text-darkroom-bg font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <span>Generate Packaging Checklist</span>
                      <CheckSquare className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PHASE 3: Interactive 4-Pillar Packaging Checklist & 1-Click Kit Exporter Drawer */}
      <AnimatePresence>
        {checklistDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-darkroom-surface border border-darkroom-border rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-darkroom-border pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FolderArchive className="size-5 text-tool-diligence" />
                    <h2 className="font-serif text-xl font-bold text-white">
                      Submission Readiness Kit & Checklist
                    </h2>
                  </div>
                  <p className="text-xs font-mono text-slate-400">
                    Target: {activeChecklist?.grantTitle} ({activeChecklist?.fundingBody}) • Project:{' '}
                    {activeChecklist?.projectTitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setChecklistDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-darkroom-card transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {loadingChecklist ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="size-8 animate-spin text-tool-diligence mx-auto" />
                  <p className="text-xs font-mono text-slate-400">
                    Assembling tailored 4-pillar application checklist...
                  </p>
                </div>
              ) : activeChecklist ? (
                <div className="space-y-5">
                  {/* Readiness Progress Bar */}
                  <div className="p-4 rounded-2xl bg-darkroom-card border border-darkroom-border space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">Submission Readiness Score</span>
                      <span className="text-tool-diligence font-bold text-sm">
                        {activeChecklist.readinessScore}% Ready
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-darkroom-surface overflow-hidden">
                      <motion.div
                        className="h-full bg-tool-diligence"
                        initial={{ width: 0 }}
                        animate={{ width: `${activeChecklist.readinessScore}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic pt-1">
                      {activeChecklist.packagingAdvice}
                    </p>
                  </div>

                  {/* 4 Pillars Checklist Items */}
                  <div className="space-y-4">
                    {[
                      'Creative Packaging',
                      'Financial & Budget',
                      'Legal & Chain of Title',
                      'Cultural & Mandate Alignment',
                    ].map((category) => {
                      const categoryItems = activeChecklist.items.filter(
                        (it) => it.category === category,
                      );
                      if (categoryItems.length === 0) return null;

                      return (
                        <div
                          key={category}
                          className="rounded-2xl bg-darkroom-card/80 border border-darkroom-border p-4 space-y-3"
                        >
                          <h4 className="text-xs font-mono font-bold text-tool-diligence uppercase tracking-wider">
                            {category}
                          </h4>
                          <div className="space-y-2.5">
                            {categoryItems.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => handleToggleChecklistItem(item.id)}
                                className="flex items-start gap-3 p-2.5 rounded-xl bg-darkroom-surface/60 hover:bg-darkroom-surface border border-darkroom-border/60 hover:border-tool-diligence/40 transition-all cursor-pointer"
                              >
                                <div className="mt-0.5 text-tool-diligence shrink-0">
                                  {item.isCompleted ? (
                                    <CheckSquare className="size-4 text-emerald-400" />
                                  ) : (
                                    <Square className="size-4 text-slate-500" />
                                  )}
                                </div>
                                <div className="space-y-0.5 text-xs flex-1">
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`font-semibold ${item.isCompleted ? 'line-through text-slate-500' : 'text-white'}`}
                                    >
                                      {item.title}
                                    </span>
                                    <span
                                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                        item.priority === 'Critical'
                                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                                          : 'bg-slate-700/30 text-slate-400'
                                      }`}
                                    >
                                      {item.priority}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400">{item.description}</p>
                                  {item.guidanceTip && (
                                    <p className="text-[10px] text-tool-diligence/80 font-mono">
                                      Tip: {item.guidanceTip}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Export Result Seal Banner */}
                  {exportKitResult && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs">
                        <ShieldCheck className="size-4" />
                        <span>Readiness Kit Downloaded & Cryptographically Sealed</span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-mono truncate">
                        SHA-256 Digest: <code>{exportKitResult.sha256Digest}</code>
                      </p>
                    </div>
                  )}

                  {/* Actions: 1-Click Export Submission Kit */}
                  <div className="pt-2 border-t border-darkroom-border flex items-center justify-between flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setChecklistDrawerOpen(false)}
                      className="px-4 py-2 rounded-xl bg-darkroom-card text-xs font-mono text-slate-300 hover:text-white cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      disabled={exportingKit}
                      onClick={handleExportReadinessKit}
                      className="px-5 py-2.5 rounded-2xl bg-tool-diligence text-darkroom-bg font-mono font-bold text-xs flex items-center gap-2 hover:bg-tool-diligence/90 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                    >
                      {exportingKit ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Generating Kit & Milestones...</span>
                        </>
                      ) : (
                        <>
                          <Download className="size-4" />
                          <span>1-Click Export Submission Kit (.md + .ics)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
