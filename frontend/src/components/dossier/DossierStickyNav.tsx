import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import {
  DetailDensity,
  DossierReport,
  AtomicClaim,
  SourceRecord,
  DisputeRecord,
} from '../../types/investigation';
import { soundEffects } from '../../utils/audio';

export interface DossierStickyNavProps {
  dossier?: DossierReport;
  entityName?: string;
  entityId?: string;
  officialDomain?: string;
  claims?: AtomicClaim[];
  sources?: SourceRecord[];
  disputes?: DisputeRecord[];
  density: DetailDensity;
  onDensityChange: (newDensity: DetailDensity) => void;
  onExport?: () => void;
  authenticityScore?: number;

  // Optional overrides
  scrollProgress?: number;
  isActionsMenuOpen?: boolean;
  copiedSummary?: boolean;
  shareableLinkCopied?: boolean;
  copiedAiPayload?: boolean;
  copiedRawText?: boolean;
  onToggleActionsMenu?: () => void;
  onCloseActionsMenu?: () => void;
  onCopySummary?: () => void;
  onCopyShareableLink?: () => void;
  onPrint?: () => void;
  onCopyAiPayload?: () => void;
  onCopyRawText?: () => void;
  actionsMenuRef?: React.RefObject<HTMLDivElement | null>;
}

export const DossierStickyNav: React.FC<DossierStickyNavProps> = ({
  dossier,
  entityName,
  entityId,
  officialDomain,
  density,
  onDensityChange,
  onExport: onExportProp,
  authenticityScore,
  disputes,
  scrollProgress: scrollProgressProp,
  isActionsMenuOpen: isActionsMenuOpenProp,
  copiedSummary: copiedSummaryProp,
  shareableLinkCopied: shareableLinkCopiedProp,
  copiedAiPayload: copiedAiPayloadProp,
  copiedRawText: copiedRawTextProp,
  onToggleActionsMenu: onToggleActionsMenuProp,
  onCloseActionsMenu: onCloseActionsMenuProp,
  onCopySummary: onCopySummaryProp,
  onCopyShareableLink: onCopyShareableLinkProp,
  onPrint: onPrintProp,
  onCopyAiPayload: onCopyAiPayloadProp,
  onCopyRawText: onCopyRawTextProp,
  actionsMenuRef: actionsMenuRefProp,
}) => {
  // Auto-scroll progress tracking if not provided externally
  const [internalScrollProgress, setInternalScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('section-radar');
  const activeScrollProgress =
    scrollProgressProp !== undefined ? scrollProgressProp : internalScrollProgress;

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0 && scrollProgressProp === undefined) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setInternalScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      // Track active section for jump anchors
      const anchorIds = [
        'section-radar',
        'section-premiere-fee',
        'section-forensic-brief',
        'section-forensic-matrix',
        'section-previous-editions',
        'section-disputes',
        'section-claims',
        'section-checklist',
      ];
      let currentActive = anchorIds[0];
      for (const id of anchorIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) {
            currentActive = id;
          }
        }
      }
      setActiveSection(currentActive);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollProgressProp]);

  // Actions dropdown menu state
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const internalMenuRef = useRef<HTMLDivElement>(null);
  const isMenuOpen =
    isActionsMenuOpenProp !== undefined ? isActionsMenuOpenProp : internalMenuOpen;
  const menuRef = actionsMenuRefProp || internalMenuRef;

  const toggleMenu =
    onToggleActionsMenuProp || (() => setInternalMenuOpen((prev) => !prev));
  const closeMenu = useCallback(() => {
    if (onCloseActionsMenuProp) {
      onCloseActionsMenuProp();
    } else {
      setInternalMenuOpen(false);
    }
  }, [onCloseActionsMenuProp]);

  useEffect(() => {
    if (isActionsMenuOpenProp !== undefined) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isActionsMenuOpenProp, menuRef, closeMenu]);

  // Copy feedback states
  const [internalCopiedSummary, setInternalCopiedSummary] = useState(false);
  const [internalCopiedLink, setInternalCopiedLink] = useState(false);
  const [internalCopiedAi, setInternalCopiedAi] = useState(false);
  const [internalCopiedRaw, setInternalCopiedRaw] = useState(false);
  const [internalCopiedGeminiPrompt, setInternalCopiedGeminiPrompt] = useState(false);

  const handleCopyGeminiPrompt = () => {
    const slug =
      entityId ||
      (entityName === 'Pinco Pallino Film Festival'
        ? 'demo_pinco_pallino'
        : (entityName || '').toLowerCase().replace(/[^a-z0-9]+/g, '_'));
    const prompt = `Audit the ${entityName || 'festival'} dossier (${slug}) using Screened MCP / Antigravity plugin: verify venue manifest and fee escalation.`;
    navigator.clipboard.writeText(prompt);
    soundEffects.playClick();
    setInternalCopiedGeminiPrompt(true);
    setTimeout(() => setInternalCopiedGeminiPrompt(false), 2000);
  };

  const copiedSummary =
    copiedSummaryProp !== undefined ? copiedSummaryProp : internalCopiedSummary;
  const shareableLinkCopied =
    shareableLinkCopiedProp !== undefined ? shareableLinkCopiedProp : internalCopiedLink;
  const copiedAiPayload =
    copiedAiPayloadProp !== undefined ? copiedAiPayloadProp : internalCopiedAi;
  const copiedRawText =
    copiedRawTextProp !== undefined ? copiedRawTextProp : internalCopiedRaw;

  const handleCopySummary = () => {
    if (onCopySummaryProp) {
      onCopySummaryProp();
      return;
    }
    if (!dossier) return;
    soundEffects.playClick();
    const festName = entityName || 'Festival';
    const text = `# ${festName} — Screened Due-Diligence Summary\n\n${dossier.executiveSummary || ''}\n\n## Action Checklist:\n${(dossier.filmmakerChecklist || []).map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nGenerated with Screened (Agentic Cinema Due-Diligence)`;
    navigator.clipboard.writeText(text);
    setInternalCopiedSummary(true);
    soundEffects.playSuccess();
    setTimeout(() => setInternalCopiedSummary(false), 2000);
  };

  const handleCopyShareableLink = () => {
    if (onCopyShareableLinkProp) {
      onCopyShareableLinkProp();
      return;
    }
    soundEffects.playClick();
    const canonicalUrl = `${window.location.origin}/diligence/${encodeURIComponent(entityId || 'inv-001')}`;
    navigator.clipboard.writeText(canonicalUrl);
    setInternalCopiedLink(true);
    soundEffects.playSuccess();
    setTimeout(() => setInternalCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    if (onPrintProp) {
      onPrintProp();
      return;
    }
    window.print();
  };

  const handleExport = () => {
    if (onExportProp) {
      onExportProp();
    }
  };

  const handleCopyAiPayload = () => {
    if (onCopyAiPayloadProp) {
      onCopyAiPayloadProp();
      return;
    }
    soundEffects.playClick();
    const globalPayload = (window as unknown as { __SCREENED_INTEL__?: { jsonLd?: unknown } })
      .__SCREENED_INTEL__?.jsonLd;
    const payload = globalPayload || dossier;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setInternalCopiedAi(true);
    soundEffects.playSuccess();
    setTimeout(() => setInternalCopiedAi(false), 2000);
  };

  const handleCopyRawText = () => {
    if (onCopyRawTextProp) {
      onCopyRawTextProp();
      return;
    }
    soundEffects.playClick();
    const globalRaw = (window as unknown as { __SCREENED_INTEL__?: { rawText?: string } })
      .__SCREENED_INTEL__?.rawText;
    const rawText = globalRaw || dossier?.executiveSummary || '';
    navigator.clipboard.writeText(rawText);
    setInternalCopiedRaw(true);
    soundEffects.playSuccess();
    setTimeout(() => setInternalCopiedRaw(false), 2000);
  };

  const jumpAnchors = [
    { id: 'section-radar', label: 'Radar' },
    { id: 'section-premiere-fee', label: 'Fees & Premiere' },
    { id: 'section-forensic-brief', label: 'Forensic Brief' },
    { id: 'section-forensic-matrix', label: '7-Vectors' },
    { id: 'section-previous-editions', label: 'Editions' },
    ...(disputes && disputes.length > 0 ? [{ id: 'section-disputes', label: 'Disputes' }] : []),
    { id: 'section-claims', label: 'Claims' },
    { id: 'section-checklist', label: 'Checklist' },
  ];

  const handleJumpToSection = (id: string) => {
    soundEffects.playClick();
    const el = document.getElementById(id);
    if (el) {
      setActiveSection(id);
      const yOffset = -140;
      const targetY = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset + yOffset);
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const targetProgress = Math.min(100, Math.max(0, (targetY / totalHeight) * 100));
        setInternalScrollProgress(targetProgress);
      }
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  if (!dossier) return null;

  return (
    <nav
      aria-label="Dossier Reading Control and Tools"
      className="sticky top-16 z-20 w-full bg-midnight-base/95 backdrop-blur-xl border-b border-white/[0.06] shadow-md shadow-black/40 no-print transition-all"
    >
      {/* Reading Scroll Progress Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.06] pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-tool-diligence via-emerald-400 to-indigo-400 transition-all duration-150 ease-out"
          style={{ width: `${activeScrollProgress}%` }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-2 space-y-2">
        {/* Row 1: Actions & Context Metadata */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Entity identifier / status badge */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-mono text-slate-300 max-w-[210px] sm:max-w-sm truncate shadow-2xs">
              <span className="size-1.5 rounded-full bg-tool-diligence shrink-0 animate-pulse" />
              <span className="truncate font-semibold text-white">
                {entityName || 'Dossier Overview'}
              </span>
            </span>
            {officialDomain && (
              <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                {officialDomain}
              </span>
            )}
            {authenticityScore !== undefined && (
              <span
                className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-mono font-semibold shrink-0"
                style={{
                  color:
                    authenticityScore >= 75
                      ? 'var(--color-tool-diligence)'
                      : authenticityScore >= 50
                      ? 'rgb(245, 158, 11)'
                      : 'rgb(244, 63, 94)',
                  backgroundColor:
                    authenticityScore >= 75
                      ? 'rgba(16, 229, 153, 0.1)'
                      : authenticityScore >= 50
                      ? 'rgba(245, 158, 11, 0.1)'
                      : 'rgba(244, 63, 94, 0.1)',
                  borderColor:
                    authenticityScore >= 75
                      ? 'rgba(16, 229, 153, 0.3)'
                      : authenticityScore >= 50
                      ? 'rgba(245, 158, 11, 0.3)'
                      : 'rgba(244, 63, 94, 0.3)',
                }}
              >
                <span>Score: {authenticityScore}/100</span>
              </span>
            )}
          </div>

          {/* Right: Actions Dropdown Menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={toggleMenu}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono font-medium text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              aria-expanded={isMenuOpen}
            >
              <Sparkles className="size-3.5 text-tool-diligence shrink-0" />
              <span>Actions</span>
              <ChevronDown
                className={`size-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                  isMenuOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-72 p-1.5 rounded-2xl bg-midnight-void/98 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80 z-50 space-y-1 font-sans text-xs"
                >
                <button
                  type="button"
                  onClick={() => {
                    handleCopySummary();
                    closeMenu();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-slate-200 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
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
                    handleCopyShareableLink();
                    closeMenu();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-slate-200 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
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
                    handlePrint();
                    closeMenu();
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

                {onExportProp && (
                  <button
                    type="button"
                    onClick={() => {
                      handleExport();
                      closeMenu();
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
                )}

                <div className="border-t border-darkroom-border my-1 pt-1" />

                <button
                  type="button"
                  onClick={() => {
                    handleCopyGeminiPrompt();
                    closeMenu();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-darkroom-card text-indigo-300 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer group"
                >
                  <Sparkles className="size-3.5 text-indigo-400 ml-1.5" />
                  <span className="text-xs font-mono">
                    {internalCopiedGeminiPrompt ? 'Copied Gemini Prompt!' : 'Copy Gemini Agent Prompt'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleCopyAiPayload();
                    closeMenu();
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
                    handleCopyRawText();
                    closeMenu();
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

      {/* Row 2: Detail Dial Tabs (Summary / Full / Agent) */}
      <div className="w-full max-w-lg mx-auto sm:max-w-none">
        <DetailDial density={density} onChange={onDensityChange} />
      </div>

      {/* Row 3: Section Jump Anchors (Visible in Full Evidence mode) */}
      {(density === 'FULL_EVIDENCE' || density === 'EVIDENCE') && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-white/[0.06] pt-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider pl-1 shrink-0 font-medium">
            Jump:
          </span>
          {jumpAnchors.map((anchor) => {
            const isActive = activeSection === anchor.id;
            return (
              <button
                key={anchor.id}
                type="button"
                onClick={() => handleJumpToSection(anchor.id)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-tool-diligence/20 text-tool-diligence border border-tool-diligence/60 font-semibold shadow-xs'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-tool-diligence border border-white/10 hover:border-tool-diligence/40'
                }`}
              >
                {anchor.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  </nav>
  );
};
