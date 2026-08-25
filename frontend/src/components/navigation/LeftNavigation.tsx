import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Compass,
  Palette,
  Layers,
  GripVertical,
  Check,
  Scale,
  Radio,
} from 'lucide-react';
import { ActiveTool } from '../../types/investigation';
import { soundEffects } from '../../utils/audio';

interface Props {
  activeTool: ActiveTool;
  onChange: (tool: ActiveTool) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  soundMuted?: boolean;
  onToggleSound?: () => void;
  onOpenKeyboardHelp?: () => void;
  onOpenCommandPalette?: () => void;
}

export const LeftNavigation: React.FC<Props> = ({ activeTool, onChange }) => {
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close flyout on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        flyoutRef.current &&
        !flyoutRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsProductMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProductMenuOpen(false);
      }
    };

    if (isProductMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProductMenuOpen]);

  const handleSelectTool = (tool: ActiveTool) => {
    soundEffects.playClick();
    onChange(tool);
    setIsProductMenuOpen(false);
  };

  return (
    <aside className="sticky top-0 h-screen hidden md:flex flex-col items-center justify-between w-16 sm:w-20 py-5 sm:py-6 bg-darkroom-bg border-r border-darkroom-border select-none z-40 shrink-0 text-slate-300">
      {/* Top Section: App Logo */}
      <div className="flex flex-col items-center gap-4 w-full">
        <button
          onClick={() => handleSelectTool('CONVERSATIONAL_DESK')}
          className="relative group p-2.5 rounded-2xl bg-gradient-to-b from-midnight-royal/25 to-midnight-indigo/20 border border-midnight-royal/40 hover:border-midnight-royal/80 shadow-lg shadow-[var(--color-midnight-royal)]/20 transition-all cursor-pointer"
          title="Screened Home"
        >
          <div className="size-7 sm:size-8 rounded-xl bg-midnight-royal flex items-center justify-center text-white font-serif font-bold text-lg shadow-md shadow-[var(--color-midnight-royal)]/50">
            S
          </div>
          <span className="sr-only">Screened</span>
        </button>
      </div>

      {/* Center Section: Navigation Rail Icons (Only First and Last Icon Stacked) */}
      <div className="flex flex-col items-center gap-3.5 w-full my-auto">
        {/* 1. First Icon: Mission Control (Sparkles - Royal Blue) */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('CONVERSATIONAL_DESK')}
            onMouseEnter={() => setActiveTooltip('Mission Control')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`relative p-3 rounded-2xl transition-all cursor-pointer ${
              activeTool === 'CONVERSATIONAL_DESK'
                ? 'bg-midnight-royal text-white shadow-lg shadow-[var(--color-midnight-royal)]/40 ring-1 ring-indigo-400/40'
                : 'hover:bg-darkroom-surface text-slate-400 hover:text-slate-100'
            }`}
            title="Mission Control"
          >
            <Sparkles className="size-5" />
            {activeTool === 'CONVERSATIONAL_DESK' && (
              <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-amber-400 ring-2 ring-darkroom-bg" />
            )}
          </button>
          {activeTooltip === 'Mission Control' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-darkroom-surface text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-darkroom-border z-50 pointer-events-none">
              Mission Control (Main AI Interface)
            </div>
          )}
        </div>

        {/* 2. Last Icon: Products & Workspaces Flyout Trigger (Layers) */}
        <div className="relative">
          <button
            ref={triggerRef}
            onClick={() => {
              soundEffects.playClick();
              setIsProductMenuOpen(!isProductMenuOpen);
            }}
            onMouseEnter={() => setActiveTooltip('Products')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`relative p-3 rounded-2xl transition-all cursor-pointer ${
              isProductMenuOpen || activeTool !== 'CONVERSATIONAL_DESK'
                ? 'bg-darkroom-card text-indigo-300 border border-midnight-royal/60 shadow-md ring-1 ring-midnight-royal/40'
                : 'hover:bg-darkroom-surface text-slate-400 hover:text-slate-100'
            }`}
            title="Products & Workspaces"
          >
            <Layers className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-tool-diligence ring-2 ring-darkroom-bg" />
          </button>
          {activeTooltip === 'Products' && !isProductMenuOpen && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-darkroom-surface text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-darkroom-border z-50 pointer-events-none">
              Products & Workspaces
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Utility Controls (Playground only) */}
      <div className="flex flex-col items-center gap-3 w-full pt-2">
        {/* Component Design Playground */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('DESIGN_PLAYGROUND')}
            onMouseEnter={() => setActiveTooltip('Design Playground')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              activeTool === 'DESIGN_PLAYGROUND'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'hover:bg-darkroom-surface text-slate-400 hover:text-purple-400'
            }`}
            title="Design Playground"
          >
            <Palette className="size-4.5" />
          </button>
          {activeTooltip === 'Design Playground' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-darkroom-surface text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-darkroom-border z-50 pointer-events-none">
              Design Playground
            </div>
          )}
        </div>

        {/* Live Deployment Status Indicator */}
        <div className="relative">
          <div
            onMouseEnter={() => setActiveTooltip('Live Deployment')}
            onMouseLeave={() => setActiveTooltip(null)}
            className="p-2 rounded-xl bg-darkroom-surface border border-darkroom-border flex items-center justify-center cursor-default group"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-tool-diligence opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-tool-diligence" />
            </div>
          </div>
          {activeTooltip === 'Live Deployment' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-xl bg-darkroom-surface text-slate-100 text-xs font-mono whitespace-nowrap shadow-xl border border-darkroom-border z-50 pointer-events-none">
              <div className="flex items-center gap-1.5 text-tool-diligence font-semibold">
                <Radio className="size-3" />
                <span>Live Cloud Run</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Commit:{' '}
                <span className="text-slate-200">
                  {typeof __COMMIT_SHA__ !== 'undefined' ? __COMMIT_SHA__ : 'dev'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Built:{' '}
                {typeof __BUILD_TIME__ !== 'undefined'
                  ? new Date(__BUILD_TIME__).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'local'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXPANDABLE FLOATING PRODUCT FLYOUT */}
      {/* ========================================================================= */}
      {isProductMenuOpen && (
        <div
          ref={flyoutRef}
          className="absolute left-[72px] sm:left-[88px] top-1/2 -translate-y-1/2 w-88 p-3 rounded-3xl bg-darkroom-surface/95 backdrop-blur-xl border border-darkroom-border shadow-2xl shadow-black/90 space-y-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-2 border-b border-darkroom-border flex items-center justify-between">
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
              Select Workspace
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-midnight-royal/20 text-indigo-300 border border-midnight-royal/40">
              2 Products
            </span>
          </div>

          {/* Product 1: Due Diligence (Mint / Emerald Teal) */}
          <button
            onClick={() => handleSelectTool('DUE_DILIGENCE')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3.5 transition-all text-left group cursor-pointer ${
              activeTool === 'DUE_DILIGENCE'
                ? 'bg-darkroom-card border border-tool-diligence/50 shadow-inner'
                : 'hover:bg-darkroom-card border border-transparent'
            }`}
          >
            <GripVertical className="size-4 text-slate-600 group-hover:text-slate-400 shrink-0" />

            <div className="size-11 rounded-2xl bg-gradient-to-tr from-tool-diligence to-tool-diligence-hover flex items-center justify-center text-slate-950 shadow-lg shadow-[var(--color-tool-diligence)]/30 shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="size-6 text-slate-950" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-white group-hover:text-tool-diligence transition-colors">
                  Due Diligence
                </h4>
                {activeTool === 'DUE_DILIGENCE' && (
                  <Check className="size-4 text-tool-diligence shrink-0" />
                )}
              </div>
              <p className="text-sm text-slate-400 line-clamp-1">
                Multi-agent cinema investigation & dossier
              </p>
            </div>
          </button>

          {/* Product 2: Opportunity Scout (Coral Rose/Sky Blue) */}
          <button
            onClick={() => handleSelectTool('OPPORTUNITY_SCOUT')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3.5 transition-all text-left group cursor-pointer ${
              activeTool === 'OPPORTUNITY_SCOUT'
                ? 'bg-darkroom-card border border-tool-scout/50 shadow-inner'
                : 'hover:bg-darkroom-card border border-transparent'
            }`}
          >
            <GripVertical className="size-4 text-slate-600 group-hover:text-slate-400 shrink-0" />

            <div className="size-11 rounded-2xl bg-gradient-to-tr from-tool-scout via-tool-scout to-tool-scout-hover flex items-center justify-center text-white shadow-lg shadow-[var(--color-tool-scout)]/30 shrink-0 group-hover:scale-105 transition-transform">
              <Compass className="size-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-white group-hover:text-tool-scout transition-colors">
                  Opportunity Scout
                </h4>
                {activeTool === 'OPPORTUNITY_SCOUT' && (
                  <Check className="size-4 text-tool-scout shrink-0" />
                )}
              </div>
              <p className="text-sm text-slate-400 line-clamp-1">
                Slate distribution & festival matching
              </p>
            </div>
          </button>

          {/* Section: Why Screened Exists */}
          <div className="pt-2 border-t border-darkroom-border">
            <button
              onClick={() => handleSelectTool('WHY_SCREENED')}
              className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-all text-left group cursor-pointer ${
                activeTool === 'WHY_SCREENED'
                  ? 'bg-darkroom-card border border-indigo-500/50'
                  : 'hover:bg-darkroom-card border border-transparent'
              }`}
            >
              <div className="size-9 rounded-xl bg-midnight-royal/20 text-indigo-400 flex items-center justify-center shrink-0 border border-midnight-royal/40">
                <Scale className="size-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300">
                  Why Screened Exists
                </h4>
                <p className="text-xs text-slate-400 line-clamp-1">
                  Problem synthesis & empirical research
                </p>
              </div>
            </button>
          </div>

          {/* Quick Hub Option: Mission Control */}
          <div className="pt-1.5 border-t border-darkroom-border">
            <button
              onClick={() => handleSelectTool('CONVERSATIONAL_DESK')}
              className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400 hover:text-indigo-300 hover:bg-darkroom-card transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-indigo-400" />
                <span>Return to Mission Control (Main Interface)</span>
              </div>
              <span className="text-[10px] text-slate-500">Esc to close</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
