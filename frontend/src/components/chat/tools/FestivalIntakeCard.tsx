import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  ArrowRight,
  FileText,
  UploadCloud,
  Loader2,
  Paperclip,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { DueDiligenceArgs, DocumentAnalysisResult } from '../../../types/chat';
import { soundEffects } from '../../../utils/audio';

interface FestivalIntakeCardProps {
  args: DueDiligenceArgs;
  onLaunch: (festivalName: string, optionalUrl?: string) => void;
}

export const FestivalIntakeCard: React.FC<FestivalIntakeCardProps> = ({ args, onLaunch }) => {
  const [festivalName, setFestivalName] = useState(args.festival_name || '');
  const [additionalContext, setAdditionalContext] = useState(
    args.optional_url || args.city_country ? `${args.optional_url || ''} ${args.city_country || ''}`.trim() : ''
  );

  // Attachment state
  const [isDragActive, setIsDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [attachedDocResult, setAttachedDocResult] = useState<DocumentAnalysisResult | null>(null);
  const [extractedExtraContext, setExtractedExtraContext] = useState<string | null>(null);
  const [videoGuardWarning, setVideoGuardWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processSelectedFile = async (file: File) => {
    setVideoGuardWarning(null);
    const fileNameLower = file.name.toLowerCase();
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.wmv'];

    // Guard against video files
    if (
      videoExtensions.some((ext) => fileNameLower.endsWith(ext)) ||
      file.type.startsWith('video/')
    ) {
      soundEffects.playCaution();
      setVideoGuardWarning(
        'Video analysis is coming soon! Please drop your festival email, synopsis, treatment, or notes.'
      );
      return;
    }

    // 10MB limit
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      soundEffects.playCaution();
      setVideoGuardWarning('File size exceeds 10MB limit. Please upload files under 10MB.');
      return;
    }

    const sizeInKb = Math.round(file.size / 1024);
    const formattedSize = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;

    setIsAnalyzing(true);
    soundEffects.playClick();

    try {
      let base64Data: string | undefined = undefined;
      let textContent: string | undefined = undefined;

      const isBinaryOrImage =
        file.type.startsWith('image/') ||
        file.type === 'application/pdf' ||
        fileNameLower.endsWith('.pdf');

      if (isBinaryOrImage) {
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            const b64 = res.includes(',') ? res.split(',')[1] : res;
            resolve(b64);
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      } else {
        textContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        });
      }

      const response = await fetch('/api/chat/analyze-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileBase64: base64Data,
          fileContent: textContent,
          mimeType: file.type || (fileNameLower.endsWith('.pdf') ? 'application/pdf' : 'text/plain'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Document analysis failed (${response.status})`);
      }

      const data: DocumentAnalysisResult = await response.json();
      setAttachedFile({ name: file.name, size: formattedSize, type: file.type });
      setAttachedDocResult(data);

      let contextSummary = '';
      if (data.detectedKind === 'INVITATION_EMAIL') {
        const parts = [
          `[Extracted Invitation Clues for '${file.name}']`,
          data.festivalClaimed ? `Claimed Festival: ${data.festivalClaimed}` : '',
          data.senderDomain ? `Sender Domain: ${data.senderDomain}` : '',
          data.feeWaiverOffered !== undefined && data.feeWaiverOffered !== null
            ? `Fee Waiver Offered: ${data.feeWaiverOffered ? 'Yes' : 'No'}`
            : '',
          data.redFlagSignals && data.redFlagSignals.length > 0
            ? `Red Flags: ${data.redFlagSignals.join(', ')}`
            : '',
          data.extractedSummary ? `Summary: ${data.extractedSummary}` : '',
        ].filter(Boolean);
        contextSummary = parts.join('\n');

        // Auto-fill entity name if empty or generic
        if (!festivalName.trim() || festivalName === 'Target Film Festival' || festivalName === 'Festival Target') {
          if (data.festivalClaimed) {
            setFestivalName(data.festivalClaimed);
          }
        }
      } else if (data.detectedKind === 'SCRIPT_TREATMENT') {
        const parts = [
          `[Extracted Script & Synopsis Clues for '${file.name}']`,
          data.filmTitle ? `Project Title: ${data.filmTitle}` : '',
          data.format ? `Format: ${data.format}` : '',
          data.genre ? `Genre: ${data.genre}` : '',
          data.runtimeMinutes ? `Runtime: ${data.runtimeMinutes} min` : '',
          data.logline ? `Logline: ${data.logline}` : '',
          data.extractedSummary ? `Summary: ${data.extractedSummary}` : '',
        ].filter(Boolean);
        contextSummary = parts.join('\n');
      } else {
        contextSummary = `[Attached Context for '${file.name}']:\n${data.extractedSummary || 'General document attached.'}`;
      }

      setExtractedExtraContext(contextSummary);
      soundEffects.playSuccess();
    } catch (error) {
      console.error('Failed to analyze document with AI:', error);
      soundEffects.playCaution();
      setVideoGuardWarning('Could not complete deep AI parsing, but document will be attached to context.');
      setAttachedFile({ name: file.name, size: formattedSize, type: file.type });
      setExtractedExtraContext(`[Attached Document: ${file.name}]`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleRemoveFile = () => {
    soundEffects.playClick();
    setAttachedFile(null);
    setAttachedDocResult(null);
    setExtractedExtraContext(null);
    setVideoGuardWarning(null);
  };

  const handleLaunch = () => {
    soundEffects.playSuccess();
    const contextParts: string[] = [];
    if (additionalContext.trim()) {
      contextParts.push(additionalContext.trim());
    }
    if (extractedExtraContext?.trim()) {
      contextParts.push(extractedExtraContext.trim());
    }
    const combinedContext = contextParts.join('\n\n') || undefined;
    onLaunch(festivalName.trim() || 'Festival Target', combinedContext);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl my-2 p-5 sm:p-6 rounded-2xl border border-tool-diligence/30 bg-gradient-to-br from-tool-diligence/10 via-darkroom-surface to-darkroom-bg shadow-xl backdrop-blur-md transition-all hover:border-tool-diligence/60 text-slate-100 space-y-4"
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-tool-diligence/20 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-tool-diligence/20 flex items-center justify-center text-tool-diligence font-bold border border-tool-diligence/40">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold tracking-wider text-tool-diligence uppercase">
                Festival Due Diligence
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-tool-diligence/15 text-tool-diligence border border-tool-diligence/30 font-mono font-semibold">
                Investigation Pre-Flight
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-serif">
              {festivalName || 'Target Film Festival'}
            </h3>
          </div>
        </div>
      </div>

      {/* Simplified 2-Field Intake UI with Attachment Dropzone */}
      <div className="space-y-4">
        {/* Field 1: Festival Entity Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1.5">
            Festival Entity Name <span className="text-tool-diligence">*</span>
          </label>
          <input
            type="text"
            value={festivalName}
            onChange={(e) => setFestivalName(e.target.value)}
            placeholder="e.g. Pinco Pallino Film Festival"
            className="w-full bg-darkroom-bg border border-zinc-700/60 focus:border-tool-diligence rounded-xl px-3.5 py-2.5 text-white text-base placeholder:text-zinc-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Field 2: Additional Clues & Context (Dropzone on Left, Textarea on Right) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-tool-diligence" />
              <span>Additional Clues & Context (Optional)</span>
            </label>
            {attachedFile && (
              <span className="text-[11px] font-mono text-tool-diligence flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Context Extracted
              </span>
            )}
          </div>

          {/* Side-by-side Container: Dropzone on Left, Textarea on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
            {/* Left Column: Drag & Drop Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isAnalyzing && fileInputRef.current?.click()}
              className={`md:col-span-5 relative flex flex-col items-center justify-center p-3 rounded-xl border border-dashed transition-all cursor-pointer select-none text-center min-h-[110px] ${
                isDragActive
                  ? 'border-tool-diligence bg-tool-diligence/15 text-tool-diligence shadow-lg shadow-[var(--color-tool-diligence)]/10 scale-[0.99]'
                  : attachedFile
                  ? 'border-tool-diligence/40 bg-darkroom-surface/80 hover:border-tool-diligence/70 text-slate-200'
                  : 'border-zinc-700/70 hover:border-tool-diligence/60 bg-darkroom-bg hover:bg-darkroom-surface/50 text-slate-400 hover:text-slate-300'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md,.eml,image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center space-y-2 py-1">
                  <Loader2 className="w-6 h-6 text-tool-diligence animate-spin" />
                  <span className="text-xs font-mono text-tool-diligence animate-pulse font-medium">
                    Extracting context with AI...
                  </span>
                </div>
              ) : attachedFile ? (
                <div className="w-full flex flex-col justify-between h-full space-y-2">
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0 text-left">
                      <div className="w-6 h-6 rounded-lg bg-tool-diligence/20 text-tool-diligence flex items-center justify-center shrink-0">
                        <Paperclip className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-xs font-semibold text-white truncate max-w-[130px]"
                          title={attachedFile.name}
                        >
                          {attachedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">{attachedFile.size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      title="Remove attached file"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Extracted Status Pill */}
                  <div className="bg-darkroom-bg/80 rounded-lg p-1.5 border border-tool-diligence/20 text-left">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-tool-diligence font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-tool-diligence shrink-0" />
                      <span className="truncate">
                        {attachedDocResult?.detectedKind === 'INVITATION_EMAIL'
                          ? 'Email Intel Extracted'
                          : attachedDocResult?.detectedKind === 'SCRIPT_TREATMENT'
                          ? 'Script Intel Extracted'
                          : 'Clues Extracted'}
                      </span>
                    </div>
                    {attachedDocResult?.redFlagSignals && attachedDocResult.redFlagSignals.length > 0 && (
                      <p className="text-[10px] text-amber-400 truncate mt-0.5 font-mono">
                        ⚠️ {attachedDocResult.redFlagSignals.length} flag
                        {attachedDocResult.redFlagSignals.length > 1 ? 's' : ''} detected
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1.5 py-1">
                  <UploadCloud
                    className={`w-6 h-6 transition-transform ${
                      isDragActive
                        ? 'text-tool-diligence scale-110'
                        : 'text-slate-400 group-hover:text-tool-diligence'
                    }`}
                  />
                  <div className="text-xs font-medium">
                    <span className="text-slate-200">Drop attachment</span>
                    <span className="text-slate-400 block text-[11px]">
                      or <span className="text-tool-diligence underline font-semibold">browse</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">PDF, email, laurels, notes</p>
                </div>
              )}
            </div>

            {/* Right Column: Generic Freeform Textarea */}
            <div className="md:col-span-7 flex flex-col">
              <textarea
                rows={4}
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Type or paste extra notes: official website URL, city/country, director/contact name, fees quoted, or invitation details..."
                className="w-full h-full min-h-[110px] bg-darkroom-bg border border-zinc-700/60 focus:border-tool-diligence rounded-xl px-3.5 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* Video Guard Warning */}
          <AnimatePresence>
            {videoGuardWarning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-amber-300 text-xs"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{videoGuardWarning}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVideoGuardWarning(null)}
                  className="text-amber-400 hover:text-white ml-2 cursor-pointer font-bold"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Trigger */}
        <div className="pt-2 border-t border-darkroom-border">
          <button
            onClick={handleLaunch}
            disabled={!festivalName.trim() || isAnalyzing}
            className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover text-slate-950 font-bold text-base shadow-md shadow-[var(--color-tool-diligence)]/30 transition-all hover:brightness-110 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Start Due Diligence Investigation</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

