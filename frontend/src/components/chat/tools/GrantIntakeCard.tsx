import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  FileText, 
  UploadCloud, 
  ArrowRight, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { GrantScoutArgs } from '../../../types/chat';
import { soundEffects } from '../../../utils/audio';

interface GrantIntakeCardProps {
  args: GrantScoutArgs;
  onLaunchSearch: (searchSummary: string) => void;
}

export const GrantIntakeCard: React.FC<GrantIntakeCardProps> = ({
  args,
  onLaunchSearch,
}) => {
  const [projectTitle, setProjectTitle] = useState(args.project_title || 'Untitled Project');
  const [budgetTier, setBudgetTier] = useState<number>(50000); // £50k
  const [fundingNeeded, setFundingNeeded] = useState<number>(25000); // £25k
  const [productionStage, setProductionStage] = useState<string>(args.production_stage || 'Production');
  const [filmmakerRegion, setFilmmakerRegion] = useState<string>(args.filmmaker_region || 'UK & Europe');
  const [projectSynopsis, setProjectSynopsis] = useState<string>('');
  
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
    if (videoExtensions.some(ext => fileNameLower.endsWith(ext)) || file.type.startsWith('video/')) {
      soundEffects.playCaution();
      setVideoGuardWarning('Video analysis is coming soon! For now, please upload your script synopsis, treatment, or pitch deck PDF.');
      return;
    }

    // Supported document
    soundEffects.playClick();
    setAttachedFile({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
    });
  };

  const handleLaunch = () => {
    soundEffects.playSuccess();
    const query = `Find film grants for "${projectTitle}" (Budget: £${budgetTier.toLocaleString()}, Seeking: £${fundingNeeded.toLocaleString()}, Stage: ${productionStage}, Region: ${filmmakerRegion})`;
    onLaunchSearch(query);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl bg-card border border-blue-500/30 rounded-2xl p-5 shadow-xl shadow-black/40 space-y-4 my-2 text-zinc-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-semibold tracking-wider text-blue-400 uppercase">
                Film Grant & Sponsor Match
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                Public Funds
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-serif">{projectTitle}</h3>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-zinc-400 font-mono">BFI · Screen Scotland · Sundance</span>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-zinc-400 font-mono mb-1">Project Working Title</label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            placeholder="e.g. Echoes of the Humber"
            className="w-full bg-midnight border border-zinc-700/70 rounded-lg px-3 py-2 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-zinc-400 font-mono mb-1">Production Stage</label>
          <select
            value={productionStage}
            onChange={(e) => setProductionStage(e.target.value)}
            className="w-full bg-midnight border border-zinc-700/70 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="Early Development / Script">Early Development / Script</option>
            <option value="Advanced Development">Advanced Development / Packaging</option>
            <option value="Production">Production / Principal Photography</option>
            <option value="Post-Production / Finishing">Post-Production / Finishing</option>
            <option value="Impact & Festival Distribution">Impact & Festival Distribution</option>
          </select>
        </div>
      </div>

      {/* Sliders: Total Budget & Funding Needed */}
      <div className="space-y-3 pt-1 text-xs">
        {/* Total Budget Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-zinc-400 font-mono text-[11px]">
            <span>Total Production Budget:</span>
            <span className="text-blue-400 font-semibold">£{budgetTier.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={5000}
            max={1000000}
            step={5000}
            value={budgetTier}
            onChange={(e) => {
              soundEffects.playClick();
              setBudgetTier(Number(e.target.value));
            }}
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>£5k (Micro)</span>
            <span>£250k (Indie)</span>
            <span>£1M+ (Feature)</span>
          </div>
        </div>

        {/* Grant Seeking Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-zinc-400 font-mono text-[11px]">
            <span>Grant / Match Funding Sought:</span>
            <span className="text-emerald-400 font-semibold">£{fundingNeeded.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={1000}
            max={250000}
            step={2500}
            value={fundingNeeded}
            onChange={(e) => {
              soundEffects.playClick();
              setFundingNeeded(Number(e.target.value));
            }}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>£1k (Seed)</span>
            <span>£50k (Agency)</span>
            <span>£250k (Major Fund)</span>
          </div>
        </div>
      </div>

      {/* Region & Synopsis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-zinc-400 font-mono mb-1">Filmmaker / Producer Territory</label>
          <select
            value={filmmakerRegion}
            onChange={(e) => setFilmmakerRegion(e.target.value)}
            className="w-full bg-midnight border border-zinc-700/70 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="UK & Nations (England, Scotland, Wales, NI)">UK & Nations (BFI, Screen Scotland, Ffilm Cymru)</option>
            <option value="European Union (Creative Europe / Eurimages)">European Union (Eurimages, National Hubs)</option>
            <option value="North America (USA / Canada)">North America (Sundance, Tribeca, Telefilm)</option>
            <option value="International / Global Co-Production">International / Global Co-Production</option>
          </select>
        </div>

        <div>
          <label className="block text-zinc-400 font-mono mb-1">Logline / Synopsis Notes (Optional)</label>
          <input
            type="text"
            value={projectSynopsis}
            onChange={(e) => setProjectSynopsis(e.target.value)}
            placeholder="1-sentence logline..."
            className="w-full bg-midnight border border-zinc-700/70 rounded-lg px-3 py-2 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Document Attachment & Drag Zone */}
      <div className="text-xs">
        <label className="block text-zinc-400 font-mono mb-1 flex items-center justify-between">
          <span>Attach Treatment, Synopsis, or Budget Deck (PDF, TXT)</span>
          <span className="text-[10px] text-zinc-500">Max 10MB</span>
        </label>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-700/80 hover:border-blue-500/50 bg-midnight/50 hover:bg-surface/80 rounded-xl p-3.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.docx,.doc"
            onChange={handleFileInput}
            className="hidden"
          />

          {attachedFile ? (
            <div className="flex items-center space-x-2 text-blue-400">
              <FileText className="w-4 h-4" />
              <span className="font-medium text-white">{attachedFile.name}</span>
              <span className="text-[10px] text-zinc-500">({attachedFile.size})</span>
            </div>
          ) : (
            <>
              <UploadCloud className="w-5 h-5 text-zinc-500" />
              <p className="text-zinc-300 font-medium text-xs">
                Drop your treatment or deck PDF here, or <span className="text-blue-400">browse</span>
              </p>
              <p className="text-[10px] text-zinc-500">Auto-extracts project themes & budget tier for grant eligibility</p>
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
              className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2 text-amber-300 text-xs"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Video File Detected</span>
                <span className="text-[11px] text-zinc-300">{videoGuardWarning}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Launch Button */}
      <div className="pt-2">
        <button
          onClick={handleLaunch}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs font-mono shadow-lg shadow-blue-950/50 hover:shadow-blue-600/30 transition-all group"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>Discover Matching Public Grants & Deadlines</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
