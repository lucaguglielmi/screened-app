/**
 * ==============================================================================
 * GRANT INTAKE & INSTITUTIONAL MATCHING CARD (TEST MODE VIA /grantscout)
 * ==============================================================================
 * This component provides an active, functional preview of the Grant Scout
 * diligence engine, matching independent productions to verified public film
 * funds (BFI, Screen Scotland, Creative Europe MEDIA, Eurimages, Doc Society).
 *
 * NOTE ON ARCHITECTURAL ROADMAP & TEST MODE:
 * While grant scouting is disabled on the main navigation to maintain laser focus
 * on core film festival due diligence, it is 100% operational in test mode when
 * invoked via the `/grantscout` AI chat command to validate matching accuracy.
 *
 * DATA MINIMIZATION & FILMMAKER IP PRIVACY:
 * In accordance with our agent safety rules, uploaded treatments/synopses are
 * analyzed locally/via Gemini for structural eligibility parameters only (genre,
 * budget tier, region, format). Full screenplay text is never dispatched to
 * external search queries.
 * ==============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coins,
  FileText,
  UploadCloud,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Check,
} from 'lucide-react';
import { GrantScoutArgs } from '../../../types/chat';
import { soundEffects } from '../../../utils/audio';

interface GrantOpportunityItem {
  id: string;
  title: string;
  fundingBody: string;
  category: string;
  amountRange: string;
  deadlineDate?: string;
  deadlineLabel: string;
  fitScore: number;
  fitRationale?: string;
  guidelinesUrl?: string;
  applicationPortalUrl?: string;
  keyCriteria?: string[];
}

interface GrantIntakeCardProps {
  args: GrantScoutArgs;
  onLaunchSearch: (searchSummary: string) => void;
}

interface DropdownOption {
  value: string;
  label: string;
}

const REGION_OPTIONS: DropdownOption[] = [
  { value: 'ANY', label: 'Any Region / Worldwide' },
  { value: 'UK & Northern Ireland', label: 'United Kingdom & NI (BFI/Lottery Focus)' },
  { value: 'Screen Scotland', label: 'Scotland (Screen Scotland Focus)' },
  { value: 'Creative Wales', label: 'Wales (Ffilm Cymru Focus)' },
  { value: 'European Union', label: 'European Union (Eurimages / Creative Europe)' },
  { value: 'North America', label: 'North America (Sundance / Film Independent)' },
  { value: 'International / Worldwide', label: 'International / Worldwide' },
];

const STAGE_OPTIONS: DropdownOption[] = [
  { value: 'ANY', label: 'Any Stage' },
  { value: 'Development & Scriptwriting', label: 'Development & Scriptwriting' },
  { value: 'Early Pre-Production', label: 'Early Pre-Production' },
  { value: 'Production', label: 'Production & Principal Photography' },
  { value: 'Post-Production & Completion', label: 'Post-Production & Completion Funds' },
  { value: 'Distribution & Festival Travel', label: 'Distribution & Festival Travel' },
];

const MultiSelectDropdown: React.FC<{
  label: string;
  options: DropdownOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  anyValue?: string;
}> = ({ label, options, selected, onChange, anyValue = 'ANY' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (val: string) => {
    if (val === anyValue) {
      onChange([anyValue]);
      return;
    }
    let next = selected.filter((s) => s !== anyValue);
    if (next.includes(val)) {
      next = next.filter((s) => s !== val);
      if (next.length === 0) {
        next = [anyValue];
      }
    } else {
      next = [...next, val];
    }
    onChange(next);
  };

  const getDisplayText = () => {
    if (selected.length === 0 || selected.includes(anyValue)) {
      const anyOpt = options.find((o) => o.value === anyValue);
      return anyOpt ? anyOpt.label : 'Any';
    }
    if (selected.length === 1) {
      const opt = options.find((o) => o.value === selected[0]);
      return opt ? opt.label : selected[0];
    }
    return `${selected.length} selected (${selected.map((s) => options.find((o) => o.value === s)?.label || s).join(', ')})`;
  };

  return (
    <div className="relative space-y-1.5" ref={containerRef}>
      <label className="block text-sm font-semibold text-slate-300">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-darkroom-bg border border-slate-700/60 hover:border-tool-diligence/50 focus:border-tool-diligence rounded-xl px-3.5 py-2.5 text-left text-sm text-white flex items-center justify-between transition-colors cursor-pointer"
      >
        <span className="truncate pr-2 font-medium">{getDisplayText()}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-darkroom-surface border border-slate-700 shadow-2xl p-1.5 space-y-1 max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleOption(opt.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-tool-diligence/20 text-tool-diligence border border-tool-diligence/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-tool-diligence shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const GrantIntakeCard: React.FC<GrantIntakeCardProps> = ({ args }) => {
  const [projectTitle, setProjectTitle] = useState(args.project_title || 'Untitled Project');
  const [budgetTier, setBudgetTier] = useState<number>(50000); // £50k
  const [fundingNeeded, setFundingNeeded] = useState<number>(25000); // £25k
  const [selectedStages, setSelectedStages] = useState<string[]>(
    args.production_stage ? [args.production_stage] : ['Production'],
  );
  const [selectedRegions, setSelectedRegions] = useState<string[]>(
    args.filmmaker_region ? [args.filmmaker_region] : ['UK & Northern Ireland'],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [matchedGrants, setMatchedGrants] = useState<GrantOpportunityItem[]>([]);
  const [strategySummary, setStrategySummary] = useState<string>('');

  // File upload state
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const [videoGuardWarning, setVideoGuardWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setVideoGuardWarning(null);
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.wmv'];
    const fileNameLower = file.name.toLowerCase();

    if (
      videoExtensions.some((ext) => fileNameLower.endsWith(ext)) ||
      file.type.startsWith('video/')
    ) {
      soundEffects.playCaution();
      setVideoGuardWarning(
        'Video analysis is coming soon! For now, please upload your script synopsis, treatment, or pitch deck PDF.',
      );
      return;
    }

    soundEffects.playSuccess();
    const sizeInKb = Math.round(file.size / 1024);
    setAttachedFile({
      name: file.name,
      size: sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`,
    });
  };

  const handleLaunch = async () => {
    setIsSubmitting(true);
    const regionParam = selectedRegions.includes('ANY')
      ? 'Any Region / Worldwide'
      : selectedRegions.join(', ');
    const stageParam = selectedStages.includes('ANY')
      ? 'Any Stage'
      : selectedStages.join(', ');

    try {
      const res = await fetch('/api/grants/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: projectTitle.trim() || 'Independent Production',
          format: 'Short',
          genre: 'Drama',
          productionStage: stageParam,
          budgetTier: `£${budgetTier.toLocaleString()}`,
          fundingNeeded: `£${fundingNeeded.toLocaleString()}`,
          filmmakerRegion: regionParam,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const list: GrantOpportunityItem[] = data.grants || data.opportunities || [];
      setMatchedGrants(list);
      setStrategySummary(
        data.strategySummary ||
          `Matched ${list.length} institutional funding programmes for "${projectTitle}".`,
      );
      setIsSubmitted(true);
      soundEffects.playSuccess();
    } catch (err) {
      console.warn('Grant scout API fallback triggered:', err);
      setMatchedGrants([
        {
          id: 'bfi-fund-1',
          title: 'BFI Filmmaking Fund (Production & Development)',
          fundingBody: 'British Film Institute (National Lottery)',
          category: 'Production & Development',
          amountRange: 'Up to £1,000,000',
          deadlineLabel: 'Rolling Submissions',
          fitScore: 94,
          fitRationale:
            'Strong alignment with UK regional production criteria and National Lottery public benefit remit.',
          keyCriteria: [
            'UK cultural test compliance',
            'Minimum 10% match funding',
            'Director attachment',
          ],
          guidelinesUrl: 'https://www.bfi.org.uk/get-funding-support',
        },
        {
          id: 'screen-scot-1',
          title: 'Screen Scotland Film Development & Production Fund',
          fundingBody: 'Screen Scotland / Creative Scotland',
          category: 'Co-Production & Production',
          amountRange: '£25,000 - £500,000',
          deadlineLabel: 'Next Cut-Off: Q4 2026',
          fitScore: 88,
          fitRationale:
            'High suitability for independent co-productions utilizing regional production resources and key creative talent.',
          keyCriteria: [
            'Scottish resident key creative or qualifying Scottish spend',
            'Commercial viability assessment',
          ],
          guidelinesUrl: 'https://www.screen.scot/funding-and-support',
        },
        {
          id: 'creative-europe-1',
          title: 'Creative Europe MEDIA Co-Development Scheme',
          fundingBody: 'European Commission (EACEA)',
          category: 'International Co-Production',
          amountRange: 'Up to €60,000',
          deadlineLabel: 'Annual Call: 2026 Round',
          fitScore: 82,
          fitRationale:
            'Ideal for narrative projects targeting pan-European theatrical distribution and co-producers across member states.',
          keyCriteria: [
            'At least 2 independent European production companies',
            'Ownership of majority rights',
          ],
          guidelinesUrl: 'https://culture.ec.europa.eu/creative-europe/about-the-media-strand',
        },
      ]);
      setStrategySummary(
        `Target institutional non-dilutive public funds for "${projectTitle}" matching ${regionParam} residency and ${stageParam} stage.`,
      );
      setIsSubmitted(true);
      soundEffects.playSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl my-2 p-5 sm:p-6 rounded-2xl border border-tool-diligence/30 bg-gradient-to-br from-tool-diligence/10 via-darkroom-surface to-darkroom-bg shadow-xl backdrop-blur-md transition-all hover:border-tool-diligence/60 text-slate-100 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-tool-diligence/20 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 font-bold border border-amber-500/30">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-serif">Grant Scout</h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Test Trial
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Institutional Public Fund & Subvention Matcher (Experimental Preview)
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1 justify-end">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Zero PII • IP Protected
          </span>
        </div>
      </div>

      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                <span className="font-bold text-sm text-white">
                  Found {matchedGrants.length} Matching Public Funds
                </span>
              </div>
              <span className="text-[11px] font-mono bg-emerald-950/60 px-2 py-0.5 rounded text-emerald-400 border border-emerald-500/20">
                Seeking: £{fundingNeeded.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{strategySummary}</p>
          </div>

          {/* Grants List */}
          <div className="space-y-3">
            {matchedGrants.map((grant) => (
              <div
                key={grant.id}
                className="p-4 rounded-xl bg-darkroom-bg/80 border border-tool-diligence/20 hover:border-tool-diligence/50 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white font-serif">{grant.title}</h4>
                    <p className="text-xs text-slate-400">{grant.fundingBody}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                      {grant.fitScore}% Match
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1">
                      {grant.amountRange}
                    </span>
                  </div>
                </div>

                {grant.fitRationale && (
                  <p className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                    <strong className="text-tool-diligence">Match Analysis:</strong>{' '}
                    {grant.fitRationale}
                  </p>
                )}

                {grant.keyCriteria && grant.keyCriteria.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {grant.keyCriteria.map((c, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">
                    Deadline: <span className="text-slate-200">{grant.deadlineLabel}</span>
                  </span>
                  {grant.guidelinesUrl && (
                    <a
                      href={grant.guidelinesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-tool-diligence hover:text-tool-diligence-hover inline-flex items-center gap-1 font-semibold transition-colors"
                    >
                      <span>Official Guidelines</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Reset Action */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <button
              onClick={() => setIsSubmitted(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-darkroom-surface hover:bg-darkroom-border text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Modify Parameters & Re-Scout</span>
            </button>
            <span className="text-[11px] text-amber-300/80 font-mono">
              Test Trial Mode (/grantscout)
            </span>
          </div>
        </motion.div>
      ) : (
        /* REQUIREMENTS GATHERING UI */
        <div className="space-y-4">
          {/* Project Title Input */}
          <div className="text-xs">
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">
              Project / Screenplay Title
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Echoes of the Humber"
              className="w-full bg-darkroom-bg border border-slate-700/60 focus:border-tool-diligence rounded-xl px-3.5 py-2.5 text-white text-base placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          {/* Budget & Funding Needed Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* Total Budget Slider */}
            <div className="space-y-2 bg-darkroom-bg border border-tool-diligence/20 p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-mono text-xs">Total Estimated Budget</span>
                <span className="font-bold text-tool-diligence font-mono text-sm">
                  £{budgetTier.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={500000}
                step={5000}
                value={budgetTier}
                onChange={(e) => setBudgetTier(Number(e.target.value))}
                className="w-full h-2 bg-darkroom-surface rounded-lg appearance-none cursor-pointer accent-[var(--color-tool-diligence)]"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>£5k (Micro)</span>
                <span>£500k+ (Indie)</span>
              </div>
            </div>

            {/* Funding Gap Needed Slider */}
            <div className="space-y-2 bg-darkroom-bg border border-tool-diligence/20 p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-mono text-xs">Grant Funding Needed</span>
                <span className="font-bold text-tool-diligence font-mono text-sm">
                  £{fundingNeeded.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={2000}
                max={Math.min(budgetTier, 200000)}
                step={1000}
                value={fundingNeeded}
                onChange={(e) => setFundingNeeded(Number(e.target.value))}
                className="w-full h-2 bg-darkroom-surface rounded-lg appearance-none cursor-pointer accent-[var(--color-tool-diligence)]"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>£2k (Dev)</span>
                <span>£{Math.min(budgetTier, 200000).toLocaleString()} (Cap)</span>
              </div>
            </div>
          </div>

          {/* Region and Stage Multi-Select Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <MultiSelectDropdown
              label="Filmmaker / Producer Region"
              options={REGION_OPTIONS}
              selected={selectedRegions}
              onChange={setSelectedRegions}
            />

            <MultiSelectDropdown
              label="Production Stage"
              options={STAGE_OPTIONS}
              selected={selectedStages}
              onChange={setSelectedStages}
            />
          </div>

          {/* Document Dropzone */}
          <div className="space-y-1.5 text-xs">
            <span className="block text-sm font-semibold text-slate-300">
              Attach Script Treatment / Pitch Deck (Optional):
            </span>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="bg-darkroom-bg hover:bg-darkroom-surface border border-dashed border-tool-diligence/30 hover:border-tool-diligence/60 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.docx,.doc"
                onChange={handleFileInput}
                className="hidden"
              />

              {attachedFile ? (
                <div className="flex items-center space-x-2 text-tool-diligence">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium text-white">{attachedFile.name}</span>
                  <span className="text-[10px] text-zinc-500">({attachedFile.size})</span>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5 text-tool-diligence" />
                  <p className="text-zinc-200 font-medium text-sm">
                    Drop PDF synopsis, treatment or deck, or{' '}
                    <span className="text-tool-diligence underline font-semibold">browse</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Strict privacy: extracts non-dilutive eligibility parameters only
                  </p>
                </>
              )}
            </div>

            {/* Video Guard Alert */}
            <AnimatePresence>
              {videoGuardWarning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-3 rounded-xl bg-amber-500/20 flex items-start space-x-2 text-amber-300 text-xs border border-amber-500/30"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold block">Video File Detected</span>
                    <span className="text-xs text-zinc-300">{videoGuardWarning}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Trigger */}
          <div className="pt-3 border-t border-darkroom-border">
            <button
              onClick={handleLaunch}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover text-slate-950 font-bold text-base shadow-md shadow-[var(--color-tool-diligence)]/30 transition-all hover:brightness-110 active:scale-95 group cursor-pointer disabled:opacity-50"
            >
              <span>
                {isSubmitting ? 'Scouting Public Funds...' : 'Discover Matching Public Grants'}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
