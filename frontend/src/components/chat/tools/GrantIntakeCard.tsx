/**
 * ==============================================================================
 * FAKE DOOR TEST COMPONENT: Grant Intake & Demand Validation
 * ==============================================================================
 * This component acts as a "Fake Door Test" to evaluate real filmmaker demand
 * for prospective public grant and institutional funding search capabilities.
 *
 * Requirements entered here submit directly to the backend `/api/feedback` store
 * and feed into the Design Playground (/playground) engineering roadmap.
 * ==============================================================================
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, FileText, UploadCloud, ArrowRight, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';
import { GrantScoutArgs } from '../../../types/chat';
import { soundEffects } from '../../../utils/audio';
import { navigateTo } from '../../../router/Router';

interface GrantIntakeCardProps {
  args: GrantScoutArgs;
  onLaunchSearch: (searchSummary: string) => void;
}

export const GrantIntakeCard: React.FC<GrantIntakeCardProps> = ({ args }) => {
  const [projectTitle, setProjectTitle] = useState(args.project_title || 'Untitled Project');
  const [budgetTier, setBudgetTier] = useState<number>(50000); // £50k
  const [fundingNeeded, setFundingNeeded] = useState<number>(25000); // £25k
  const [productionStage, setProductionStage] = useState<string>(
    args.production_stage || 'Production',
  );
  const [filmmakerRegion, setFilmmakerRegion] = useState<string>(
    args.filmmaker_region || 'UK & Europe',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

    // Check if user dropped a video file
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

    // Supported document
    soundEffects.playSuccess();
    const sizeInKb = Math.round(file.size / 1024);
    setAttachedFile({
      name: file.name,
      size: sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`,
    });
  };

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const summary = `[Grant Scout Fake Door] Project: "${projectTitle}", Budget: £${budgetTier.toLocaleString()}, Seeking: £${fundingNeeded.toLocaleString()}, Stage: ${productionStage}, Region: ${filmmakerRegion}${attachedFile ? `, Attached: ${attachedFile.name}` : ''}`;
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: 5,
          category: 'FEATURE_REQUEST',
          comment: summary,
          authorName: 'Filmmaker (Grant Intake Card)',
        }),
      });
      setIsSubmitted(true);
      soundEffects.playSuccess();
    } catch (err) {
      console.error('Failed to log grant feedback:', err);
      setIsSubmitted(true);
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
          <div className="w-8 h-8 rounded-xl bg-tool-diligence/20 flex items-center justify-center text-tool-diligence font-bold border border-tool-diligence/40">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold tracking-wider text-tool-diligence uppercase">
                Film Grant & Sponsor Match
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-semibold">
                Demand Validation (Fake Door)
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-serif">{projectTitle}</h3>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs text-slate-400 font-mono">
            Roadmap In Consideration
          </span>
        </div>
      </div>

      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
            <span className="font-bold text-sm text-white">
              Grant Requirements Logged to Engineering Roadmap
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            We are currently evaluating public film grant discovery for our upcoming release cycle!
            Your parameters for <strong className="text-white">"{projectTitle}"</strong> (Budget: £{budgetTier.toLocaleString()}, Seeking: £{fundingNeeded.toLocaleString()}, Region: {filmmakerRegion}) have been recorded in our product roadmap.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                navigateTo('/playground');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-mono border border-emerald-500/40 transition-colors cursor-pointer"
            >
              <span>View in Design Playground Feedback Log</span>
              <ExternalLink className="size-3" />
            </button>
          </div>
        </motion.div>
      ) : (
        /* REQUIREMENTS GATHERING UI */
        <div className="space-y-4">
          {/* Project Title Input */}
          <div className="text-xs">
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Project / Screenplay Title</label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Echoes of the Humber"
              className="w-full bg-darkroom-bg border border-transparent focus:border-tool-diligence rounded-xl px-3.5 py-2.5 text-white text-base placeholder:text-zinc-500 focus:outline-none"
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

          {/* Region and Stage Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                Filmmaker / Producer Region
              </label>
              <select
                value={filmmakerRegion}
                onChange={(e) => setFilmmakerRegion(e.target.value)}
                className="w-full bg-darkroom-bg border border-transparent focus:border-tool-diligence rounded-xl px-3 py-2.5 text-white text-base focus:outline-none cursor-pointer"
              >
                <option value="UK & Northern Ireland">
                  United Kingdom & NI (BFI/Lottery Focus)
                </option>
                <option value="Screen Scotland">Scotland (Screen Scotland Focus)</option>
                <option value="Creative Wales">Wales (Ffilm Cymru Focus)</option>
                <option value="European Union">European Union (Eurimages / Creative Europe)</option>
                <option value="North America">North America (Sundance / Film Independent)</option>
                <option value="International / Worldwide">International Worldwide</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Production Stage</label>
              <select
                value={productionStage}
                onChange={(e) => setProductionStage(e.target.value)}
                className="w-full bg-darkroom-bg border border-transparent focus:border-tool-diligence rounded-xl px-3 py-2.5 text-white text-base focus:outline-none cursor-pointer"
              >
                <option value="Development & Scriptwriting">Development & Scriptwriting</option>
                <option value="Early Pre-Production">Early Pre-Production</option>
                <option value="Production">Production & Principal Photography</option>
                <option value="Post-Production & Completion">
                  Post-Production & Completion Funds
                </option>
                <option value="Distribution & Festival Travel">
                  Distribution & Festival Travel
                </option>
              </select>
            </div>
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
                    Extracts grant eligibility themes and non-dilutive matching
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
              <span>{isSubmitting ? 'Logging to Roadmap...' : 'Discover Matching Public Grants'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
