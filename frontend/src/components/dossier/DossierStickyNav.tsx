import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  Sparkles,
  Check,
  Copy,
  Printer,
  Download,
  Bot,
  Code,
  ExternalLink,
} from 'lucide-react';
import { DetailDial } from '../DetailDial';
import { DetailDensity, DossierReport } from '../../types/investigation';

interface Props {
  dossier?: DossierReport;
  scrollProgress: number;
  isActionsMenuOpen: boolean;
  density: DetailDensity;
  copiedSummary: boolean;
  shareableLinkCopied: boolean;
  copiedAiPayload: boolean;
  copiedRawText: boolean;
  onToggleActionsMenu: () => void;
  onCloseActionsMenu: () => void;
  onDensityChange: (newDensity: DetailDensity) => void;
  onCopySummary: () => void;
  onCopyShareableLink: () => void;
  onPrint: () => void;
  onExport: () => void;
  onCopyAiPayload: () => void;
  onCopyRawText: () => void;
  actionsMenuRef: React.RefObject<HTMLDivElement | null>;
}

export const DossierStickyNav: React.FC<Props> = ({
  dossier,
  scrollProgress,
  isActionsMenuOpen,
  density,
  copiedSummary,
  shareableLinkCopied,
  copiedAiPayload,
  copiedRawText,
  onToggleActionsMenu,
  onCloseActionsMenu,
  onDensityChange,
  onCopySummary,
  onCopyShareableLink,
  onPrint,
  onExport,
  onCopyAiPayload,
  onCopyRawText,
  actionsMenuRef,
}) => {
  if (!dossier) return null;

  return (
    <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-2.5 bg-[#070b14]/95 backdrop-blur-xl border-b border-darkroom-border shadow-lg shadow-black/60 no-print transition-all">
      {/* Reading Scroll Progress Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-darkroom-border/40 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-tool-diligence via-emerald-400 to-indigo-400 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Detail Dial: Summary / Full / Agent */}
        <div className="flex-1 max-w-sm sm:max-w-md">
          <DetailDial density={density} onChange={onDensityChange} />
        </div>

        {/* Actions Dropdown Menu */}
        <div className="relative shrink-0" ref={actionsMenuRef}>
          <button
            type="button"
            onClick={onToggleActionsMenu}
            className="px-3 py-1.5 rounded-xl bg-darkroom-card/90 hover:bg-darkroom-surface border border-darkroom-border text-xs font-mono font-medium text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
            aria-expanded={isActionsMenuOpen}
          >
            <Sparkles className="size-3.5 text-indigo-400 shrink-0" />
            <span>Actions</span>
            <ChevronDown
              className={`size-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                isActionsMenuOpen ? 'rotate-180 text-white' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {isActionsMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-72 p-1.5 rounded-2xl bg-darkroom-surface/98 backdrop-blur-xl border border-darkroom-border shadow-2xl shadow-black/80 z-50 space-y-1 font-sans text-xs"
              >
                <button
                  type="button"
                  onClick={() => {
                    onCopySummary();
                    onCloseActionsMenu();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-darkroom-card text-slate-200 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-500/25">
                    {copiedSummary ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-100">
                      {copiedSummary ? 'Copied to Clipboard!' : 'Copy Summary'}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">Executive summary &amp; checklist</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onCopyShareableLink();
                    onCloseActionsMenu();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-darkroom-card text-slate-200 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                >
                  <div className="p-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 group-hover:bg-sky-500/25">
                    {shareableLinkCopied ? <Check className="size-3.5 text-emerald-400" /> : <ExternalLink className="size-3.5" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-100">
                      {shareableLinkCopied ? 'Link Copied!' : 'Copy Shareable Link'}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">Read-only view for producers</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onPrint();
                    onCloseActionsMenu();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-darkroom-card text-slate-200 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                >
                  <div className="p-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 group-hover:bg-blue-500/25">
                    <Printer className="size-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-100">Print / Save as PDF</span>
                    <span className="text-[11px] text-slate-400 truncate">Printable clean dossier view</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onExport();
                    onCloseActionsMenu();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-darkroom-card text-slate-200 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/25">
                    <Download className="size-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-100">Export Signed Archive</span>
                    <span className="text-[11px] text-slate-400 truncate">Markdown archive with SHA-256 seal</span>
                  </div>
                </button>

                <div className="border-t border-darkroom-border my-1 pt-1" />

                <button
                  type="button"
                  onClick={() => {
                    onCopyAiPayload();
                    onCloseActionsMenu();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-darkroom-card text-slate-300 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                >
                  <Bot className="size-3.5 text-purple-400 ml-1.5" />
                  <span className="text-xs font-mono">
                    {copiedAiPayload ? 'Copied JSON-LD!' : 'Copy AI Graph (JSON-LD)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onCopyRawText();
                    onCloseActionsMenu();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-darkroom-card text-slate-300 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                >
                  <Code className="size-3.5 text-slate-400 ml-1.5" />
                  <span className="text-xs font-mono">
                    {copiedRawText ? 'Copied Raw Text!' : 'Copy Plain Text Dump'}
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
