import { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Moon, 
  Sun, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  FileText,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Evidence {
  sourceId: string;
  sourceUrl?: string;
  sourceDomain?: string;
  sourceTitle?: string;
  stance: 'SUPPORTS' | 'CONTRADICTS' | 'MENTIONS';
  exactExcerpt: string;
  note?: string;
}

interface Claim {
  id: string;
  researchDomain: string;
  category: string;
  statement: string;
  claimKind: 'FACT' | 'ALLEGATION' | 'OPINION';
  status: 'CORROBORATED' | 'SUPPORTED' | 'DISPUTED' | 'UNVERIFIED';
  editionYear?: number;
  attributedTo?: string;
  evidence: Evidence[];
}

interface Source {
  id: string;
  url: string;
  domain: string;
  title: string;
  publishedDate?: string;
  retrievedAt: string;
  excerpts: string[];
  sourceTier: number;
}

interface PipelineResponse {
  festivalName: string;
  sourcesFound: number;
  sources: Source[];
  extractedClaims: Claim[];
  summaryNarrative: string;
  durationSeconds: number;
}


export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('screened_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [query, setQuery] = useState('Aldergate Film Festival');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PipelineResponse | null>(null);
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('screened_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const runInvestigation = async (festivalName: string) => {
    if (!festivalName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/test-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ festivalName: festivalName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Server error (${res.status})`);
      }
      const data: PipelineResponse = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during investigation.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Claim['status']) => {
    switch (status) {
      case 'CORROBORATED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-3" /> Corroborated
          </span>
        );
      case 'SUPPORTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <ShieldCheck className="size-3" /> Supported
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="size-3" /> Disputed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20">
            Unverified
          </span>
        );
    }
  };

  const getKindBadge = (kind: Claim['claimKind']) => {
    switch (kind) {
      case 'FACT':
        return <span className="font-mono text-[10px] uppercase tracking-wider text-blue-500">FACT</span>;
      case 'ALLEGATION':
        return <span className="font-mono text-[10px] uppercase tracking-wider text-rose-500">ALLEGATION</span>;
      case 'OPINION':
        return <span className="font-mono text-[10px] uppercase tracking-wider text-purple-500">OPINION</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500/20">
      {/* Top Navbar */}
      <header className="border-b border-paper-border dark:border-darkroom-border bg-paper-surface/80 dark:bg-darkroom-surface/80 backdrop-blur sticky top-0 z-30 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <div className="font-serif text-xl font-semibold tracking-tight text-paper-text dark:text-darkroom-text">
                Screened
              </div>
              <div className="text-[10px] font-mono tracking-widest text-paper-muted dark:text-darkroom-muted uppercase">
                Cinema Due Diligence
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Cpu className="size-3.5" /> Parallel Search + Vertex AI
            </span>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-paper-muted dark:text-darkroom-muted hover:bg-paper-card dark:hover:bg-darkroom-card transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-neutral-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-10">
        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-paper-text dark:text-darkroom-text">
            Investigate before you submit.
          </h1>
          <p className="text-sm sm:text-base text-paper-muted dark:text-darkroom-muted leading-relaxed">
            Autonomous multi-agent research across trade registries, press archives, and participant accounts. Transparent, cited facts — no blackbox scores.
          </p>
        </section>

        {/* Search Intake Box */}
        <section className="max-w-2xl mx-auto">
          <form 
            onSubmit={(e) => { e.preventDefault(); runInvestigation(query); }}
            className="p-2 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border shadow-sm flex flex-col sm:flex-row gap-2 transition-colors"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="size-5 absolute left-3.5 text-paper-muted dark:text-darkroom-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter festival name (e.g. Raindance, Aldergate, Sundance)..."
                className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-paper-text dark:text-darkroom-text placeholder-paper-muted dark:placeholder-darkroom-muted focus:outline-none"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm shrink-0 cursor-pointer"
            >
              {loading ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Sparkles className="size-4" />
                  </motion.div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  <span>Investigate</span>
                </>
              )}
            </button>
          </form>

          {/* Quick suggestions */}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-paper-muted dark:text-darkroom-muted">
            <span className="font-mono">Quick Test:</span>
            {['Aldergate Film Festival', 'Raindance Film Festival', 'Aesthetica Short Film Festival'].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => { setQuery(name); runInvestigation(name); }}
                className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {name.split(' ')[0]}
              </button>
            ))}
          </div>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="max-w-3xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-3">
            <AlertTriangle className="size-5 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Live Investigation Results (Walking Skeleton Display) */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Summary Stats Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border">
                  <div className="text-xs font-mono uppercase text-paper-muted dark:text-darkroom-muted">Subject Investigated</div>
                  <div className="font-serif text-lg font-semibold text-paper-text dark:text-darkroom-text mt-1">{results.festivalName}</div>
                </div>
                <div className="p-4 rounded-xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border">
                  <div className="text-xs font-mono uppercase text-paper-muted dark:text-darkroom-muted">Sources & Claims</div>
                  <div className="text-lg font-semibold text-paper-text dark:text-darkroom-text mt-1 flex items-center gap-2">
                    <span>{results.sourcesFound} sources</span>
                    <span className="text-paper-muted dark:text-darkroom-muted">•</span>
                    <span>{results.extractedClaims.length} claims</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border">
                  <div className="text-xs font-mono uppercase text-paper-muted dark:text-darkroom-muted">Execution Latency</div>
                  <div className="text-lg font-semibold text-paper-text dark:text-darkroom-text mt-1 flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <Clock className="size-4" /> {results.durationSeconds}s
                  </div>
                </div>
              </div>

              {/* Narrative Summary Dossier */}
              <div className="p-6 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-4">
                <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-paper-muted dark:text-darkroom-muted border-b border-paper-border dark:border-darkroom-border pb-3">
                  <FileText className="size-4 text-indigo-500" />
                  <span>Dossier Overview</span>
                </div>
                <p className="font-serif text-base sm:text-lg text-paper-text dark:text-darkroom-text leading-relaxed whitespace-pre-line">
                  {results.summaryNarrative}
                </p>
              </div>

              {/* Verified Atomic Claims Accordion */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl font-semibold text-paper-text dark:text-darkroom-text flex items-center gap-2">
                    <Layers className="size-5 text-indigo-500" /> Verified Atomic Claims
                  </h2>
                  <span className="text-xs font-mono text-paper-muted dark:text-darkroom-muted">
                    Sub-string verified against Parallel Search
                  </span>
                </div>

                <div className="space-y-3">
                  {results.extractedClaims.map((claim) => {
                    const isExpanded = expandedClaim === claim.id;
                    return (
                      <div
                        key={claim.id}
                        className="rounded-xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border transition-colors overflow-hidden"
                      >
                        <div
                          onClick={() => setExpandedClaim(isExpanded ? null : claim.id)}
                          className="p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-paper-card dark:hover:bg-darkroom-card transition-colors"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getKindBadge(claim.claimKind)}
                              <span className="text-xs text-paper-muted dark:text-darkroom-muted font-mono">
                                {claim.category}
                              </span>
                              {claim.editionYear && (
                                <span className="text-xs font-mono text-paper-muted dark:text-darkroom-muted">
                                  ({claim.editionYear})
                                </span>
                              )}
                            </div>
                            <div className="text-sm sm:text-base font-medium text-paper-text dark:text-darkroom-text">
                              {claim.statement}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {getStatusBadge(claim.status)}
                            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                          </div>
                        </div>

                        {/* Evidence Drawer */}
                        {isExpanded && (
                          <div className="p-4 bg-paper-card dark:bg-darkroom-card border-t border-paper-border dark:border-darkroom-border space-y-3 text-xs">
                            <div className="font-mono uppercase text-paper-muted dark:text-darkroom-muted text-[11px]">
                              Corroborating Sources ({claim.evidence.length})
                            </div>
                            {claim.evidence.map((ev, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-paper-surface dark:bg-darkroom-surface border border-paper-border/80 dark:border-darkroom-border/80 space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-paper-text dark:text-darkroom-text">
                                    {ev.sourceTitle || ev.sourceDomain}
                                  </span>
                                  {ev.sourceUrl && (
                                    <a
                                      href={ev.sourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                                    >
                                      View Source <ExternalLink className="size-3" />
                                    </a>
                                  )}
                                </div>
                                <blockquote className="text-paper-muted dark:text-darkroom-muted italic border-l-2 border-indigo-500/50 pl-2">
                                  "{ev.exactExcerpt}"
                                </blockquote>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Raw Discovered Sources Strip */}
              <div className="p-6 rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border space-y-4">
                <div className="flex items-center justify-between border-b border-paper-border dark:border-darkroom-border pb-3">
                  <span className="text-sm font-mono uppercase tracking-wider text-paper-muted dark:text-darkroom-muted">
                    Discovered Web Footprint (Parallel Search)
                  </span>
                  <span className="text-xs font-mono text-paper-muted dark:text-darkroom-muted">
                    Tier 1: Official/Trade • Tier 2: General • Tier 3: Forum
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.sources.map((src) => (
                    <div key={src.id} className="p-3 rounded-xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-500/10 text-neutral-600 dark:text-neutral-400">
                          Tier {src.sourceTier} • {src.domain}
                        </span>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      </div>
                      <div className="font-medium text-xs text-paper-text dark:text-darkroom-text truncate">
                        {src.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-paper-border dark:border-darkroom-border py-6 text-center text-xs text-paper-muted dark:text-darkroom-muted">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <div>Screened — Built natively with Google ADK & Parallel Search API</div>
          <div className="text-[11px] opacity-75">All findings are cryptographically hashed and cited to verified web excerpts.</div>
        </div>
      </footer>
    </div>
  );
}
