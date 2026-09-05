import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  ShieldCheck,
  FileText,
  Fingerprint,
  Calendar,
  AlertTriangle,
  Layers,
  Globe,
  Building2,
  ListChecks,
  ExternalLink,
  Sparkles,
  Check,
  Copy,
  Printer,
  Download,
  Bot,
  Code,
  Plus,
} from 'lucide-react';
import { DetailDial } from '../DetailDial';
import { DetailDensity, DossierReport } from '../../types/investigation';
import { soundEffects } from '../../utils/audio';

interface Props {
  dossier?: DossierReport;
  scrollProgress: number;
  activeSection: string;
  isNavOpen: boolean;
  isActionsMenuOpen: boolean;
  isNewSearchMenuOpen: boolean;
  density: DetailDensity;
  normalizedDensity: DetailDensity;
  disputesCount: number;
  claimsCount: number;
  sourcesCount: number;
  copiedSummary: boolean;
  shareableLinkCopied: boolean;
  copiedAiPayload: boolean;
  copiedRawText: boolean;
  onToggleNav: () => void;
  onToggleActionsMenu: () => void;
  onToggleNewSearchMenu: () => void;
  onCloseNav: () => void;
  onCloseActionsMenu: () => void;
  onCloseNewSearchMenu: () => void;
  onDensityChange: (newDensity: DetailDensity) => void;
  onCopySummary: () => void;
  onCopyShareableLink: () => void;
  onPrint: () => void;
  onExport: () => void;
  onCopyAiPayload: () => void;
  onCopyRawText: () => void;
  onNewInvestigation: () => void;
  navMenuRef: React.RefObject<HTMLDivElement | null>;
  actionsMenuRef: React.RefObject<HTMLDivElement | null>;
  newSearchMenuRef: React.RefObject<HTMLDivElement | null>;
}

export const DossierStickyNav: React.FC<Props> = ({
  dossier,
  scrollProgress,
  activeSection,
  isNavOpen,
  isActionsMenuOpen,
  isNewSearchMenuOpen,
  density,
  normalizedDensity,
  disputesCount,
  claimsCount,
  sourcesCount,
  copiedSummary,
  shareableLinkCopied,
  copiedAiPayload,
  copiedRawText,
  onToggleNav,
  onToggleActionsMenu,
  onToggleNewSearchMenu,
  onCloseNav,
  onCloseActionsMenu,
  onCloseNewSearchMenu,
  onDensityChange,
  onCopySummary,
  onCopyShareableLink,
  onPrint,
  onExport,
  onCopyAiPayload,
  onCopyRawText,
  onNewInvestigation,
  navMenuRef,
  actionsMenuRef,
  newSearchMenuRef,
}) => {
  if (!dossier) return null;

  const sectionItems = [
    { id: 'section-radar', name: 'Transparency & Credibility', icon: ShieldCheck },
    { id: 'section-overview', name: 'Executive Overview', icon: FileText },
    { id: 'section-forensic-matrix', name: '360° Forensic Matrix (7 Vectors)', icon: Fingerprint },
    { id: 'section-previous-editions', name: 'Previous Editions & Track Record', icon: Calendar },
    { id: 'section-disputes', name: 'Contradictions & Disputes', icon: AlertTriangle, condition: disputesCount > 0 },
    { id: 'section-network', name: 'Entity Architecture & Network', icon: Layers, condition: normalizedDensity === 'FULL_EVIDENCE' },
    { id: 'section-domains', name: '3-Domain Synthesis', icon: Globe, condition: normalizedDensity === 'FULL_EVIDENCE' },
    { id: 'section-corporate', name: 'Corporate Entity Intelligence', icon: Building2, condition: Boolean(dossier?.corporateEntity) },
    { id: 'section-claims', name: 'Atomic Claims & Citations', icon: ShieldCheck, condition: normalizedDensity === 'FULL_EVIDENCE' && claimsCount > 0 },
    { id: 'section-checklist', name: 'Filmmaker Action Checklist', icon: ListChecks },
    { id: 'section-sources', name: 'Discovered Web Sources', icon: ExternalLink, condition: normalizedDensity === 'FULL_EVIDENCE' && sourcesCount > 0 },
  ].filter((item) => item.condition === undefined || item.condition);

  const handleSectionJump = (id: string) => {
    soundEffects.playClick();
    onCloseNav();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -140;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-2.5 bg-[#070b14]/95 backdrop-blur-xl border-b border-darkroom-border shadow-lg shadow-black/60 no-print transition-all relative">
      {/* Reading Scroll Progress Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-darkroom-border/40">
        <div
          className="h-full bg-gradient-to-r from-tool-diligence via-emerald-400 to-indigo-400 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 relative">
        {/* Left: Section Navigator Pill Dropdown */}
        <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0 flex-1">
          <div className="relative" ref={navMenuRef}>
            <button
              type="button"
              onClick={onToggleNav}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer shadow-2xs group ${
                isNavOpen
                  ? 'bg-midnight-royal text-white border-midnight-royal'
                  : 'bg-darkroom-card/90 hover:bg-darkroom-surface text-slate-200 hover:text-white border-darkroom-border'
              }`}
              title="Click to jump to another section"
              aria-expanded={isNavOpen}
            >
              <span className="size-2 rounded-full bg-indigo-400 animate-pulse shrink-0" />
              <span className="text-slate-400 hidden sm:inline">Reading:</span>
              <span className="font-bold text-white truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px]">
                {activeSection}
              </span>
              <ChevronDown className={`size-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 shrink-0 ${isNavOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* Section Quick Jump Popover */}
            <AnimatePresence>
              {isNavOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute left-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm p-2 rounded-2xl bg-[#090d18]/98 backdrop-blur-2xl border border-darkroom-border shadow-2xl shadow-black/90 z-50 space-y-1 max-h-[70vh] overflow-y-auto"
                >
                  <div className="px-3 py-1.5 border-b border-darkroom-border flex items-center justify-between text-[11px] font-mono uppercase text-slate-400">
                    <span>Jump to Section</span>
                    <button
                      type="button"
                      onClick={onCloseNav}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="pt-1 space-y-0.5">
                    {sectionItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.name;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSectionJump(item.id)}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-mono transition-all cursor-pointer ${
                            isActive
                              ? 'bg-midnight-royal text-white font-bold'
                              : 'text-slate-300 hover:text-white hover:bg-darkroom-card'
                          }`}
                        >
                          <Icon className={`size-3.5 shrink-0 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                          <span className="truncate">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Actions in Header Row */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            <div className="relative" ref={actionsMenuRef}>
              <button
                onClick={onToggleActionsMenu}
                className="px-2.5 py-1.5 rounded-xl bg-darkroom-card/90 hover:bg-darkroom-surface border border-darkroom-border text-xs font-mono font-medium text-slate-200 hover:text-white transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                aria-expanded={isActionsMenuOpen}
              >
                <Sparkles className="size-3.5 text-indigo-400" />
                <span>Actions</span>
                <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${isActionsMenuOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              <AnimatePresence>
                {isActionsMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-[calc(100vw-3rem)] max-w-xs p-1.5 rounded-2xl bg-darkroom-surface/98 backdrop-blur-xl border border-darkroom-border shadow-2xl shadow-black/80 z-50 space-y-1 font-sans text-xs"
                  >
                    <button
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
                        <span className="font-semibold text-slate-100">{copiedSummary ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
                        <span className="text-[11px] text-slate-400 truncate">Executive summary & checklist</span>
                      </div>
                    </button>

                    <button
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
                        <span className="font-semibold text-slate-100">{shareableLinkCopied ? 'Link Copied!' : 'Copy Shareable Link'}</span>
                        <span className="text-[11px] text-slate-400 truncate">Read-only view for producers</span>
                      </div>
                    </button>

                    <button
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
                      onClick={() => {
                        onCopyAiPayload();
                        onCloseActionsMenu();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-darkroom-card text-slate-300 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                    >
                      <Bot className="size-3.5 text-purple-400 ml-1.5" />
                      <span className="text-xs font-mono">{copiedAiPayload ? 'Copied JSON-LD!' : 'Copy AI Graph (JSON-LD)'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onCopyRawText();
                        onCloseActionsMenu();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-darkroom-card text-slate-300 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                    >
                      <Code className="size-3.5 text-slate-400 ml-1.5" />
                      <span className="text-xs font-mono">{copiedRawText ? 'Copied Raw Text!' : 'Copy Plain Text Dump'}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={newSearchMenuRef}>
              <button
                onClick={onToggleNewSearchMenu}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer shadow-2xs active:scale-95 border ${isNewSearchMenuOpen ? 'bg-darkroom-surface text-white border-darkroom-border' : 'bg-darkroom-card/90 hover:bg-darkroom-surface text-slate-300 hover:text-white border-darkroom-border'}`}
                title="New Screen"
              >
                <Plus className="size-4" />
              </button>

              <AnimatePresence>
                {isNewSearchMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-darkroom-card border border-darkroom-border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col p-1"
                  >
                    <button
                      onClick={() => {
                        soundEffects.playSuccess();
                        onCloseNewSearchMenu();
                        onNewInvestigation();
                      }}
                      className="flex items-start gap-3 w-full text-left px-3 py-2.5 hover:bg-darkroom-surface transition-colors rounded-lg group"
                    >
                      <div className="bg-indigo-500/10 p-1.5 rounded-md group-hover:bg-indigo-500/20 transition-colors shrink-0">
                        <Plus className="size-4 text-indigo-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Start a new search</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">Click on history to come back to this dossier</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Center: Detail Dial */}
        <div className="w-full sm:w-auto sm:min-w-[240px] md:min-w-[280px]">
          <DetailDial density={density} onChange={onDensityChange} />
        </div>

        {/* Desktop Actions & New Screen */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="relative" ref={actionsMenuRef}>
            <button
              onClick={onToggleActionsMenu}
              className="px-3 py-1.5 rounded-xl bg-darkroom-card/90 hover:bg-darkroom-surface border border-darkroom-border text-xs font-mono font-medium text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              aria-expanded={isActionsMenuOpen}
            >
              <Sparkles className="size-3.5 text-indigo-400" />
              <span>Actions</span>
              <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${isActionsMenuOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            <AnimatePresence>
              {isActionsMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-[calc(100vw-3rem)] max-w-xs sm:w-72 p-1.5 rounded-2xl bg-darkroom-surface/98 backdrop-blur-xl border border-darkroom-border shadow-2xl shadow-black/80 z-50 space-y-1 font-sans text-xs"
                >
                  <button
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
                      <span className="font-semibold text-slate-100">{copiedSummary ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
                      <span className="text-[11px] text-slate-400 truncate">Executive summary & checklist</span>
                    </div>
                  </button>

                  <button
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
                      <span className="font-semibold text-slate-100">{shareableLinkCopied ? 'Link Copied!' : 'Copy Shareable Link'}</span>
                      <span className="text-[11px] text-slate-400 truncate">Read-only view for producers</span>
                    </div>
                  </button>

                  <button
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
                    onClick={() => {
                      onCopyAiPayload();
                      onCloseActionsMenu();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-darkroom-card text-slate-300 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                  >
                    <Bot className="size-3.5 text-purple-400 ml-1.5" />
                    <span className="text-xs font-mono">{copiedAiPayload ? 'Copied JSON-LD!' : 'Copy AI Graph (JSON-LD)'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onCopyRawText();
                      onCloseActionsMenu();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-darkroom-card text-slate-300 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                  >
                    <Code className="size-3.5 text-slate-400 ml-1.5" />
                    <span className="text-xs font-mono">{copiedRawText ? 'Copied Raw Text!' : 'Copy Plain Text Dump'}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={newSearchMenuRef}>
            <button
              onClick={onToggleNewSearchMenu}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer shadow-2xs active:scale-95 border ${isNewSearchMenuOpen ? 'bg-darkroom-surface text-white border-darkroom-border' : 'bg-darkroom-card/90 hover:bg-darkroom-surface text-slate-300 hover:text-white border-darkroom-border'}`}
              title="New Screen"
            >
              <Plus className="size-4" />
            </button>

            <AnimatePresence>
              {isNewSearchMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-darkroom-card border border-darkroom-border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col p-1"
                >
                  <button
                    onClick={() => {
                      soundEffects.playSuccess();
                      onCloseNewSearchMenu();
                      onNewInvestigation();
                    }}
                    className="flex items-start gap-3 w-full text-left px-3 py-2.5 hover:bg-darkroom-surface transition-colors rounded-lg group"
                  >
                    <div className="bg-indigo-500/10 p-1.5 rounded-md group-hover:bg-indigo-500/20 transition-colors shrink-0">
                      <Plus className="size-4 text-indigo-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Start a new search</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">Click on history to come back to this dossier</span>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
