import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 

  ShieldCheck, 
  Compass, 
  Palette, 
  Layers, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  GripVertical, 
  ChevronsUpDown,
  Check,
  Scale,
  Command
} from 'lucide-react';
import { ActiveTool } from '../../types/investigation';
import { soundEffects } from '../../utils/audio';

interface Props {
  activeTool: ActiveTool;
  onChange: (tool: ActiveTool) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  onOpenKeyboardHelp: () => void;
  onOpenCommandPalette?: () => void;
}

export const LeftNavigation: React.FC<Props> = ({
  activeTool,
  onChange,
  theme,
  onToggleTheme,
  soundMuted,
  onToggleSound,
  onOpenKeyboardHelp,
  onOpenCommandPalette,
}) => {

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
    <aside className="relative flex flex-col items-center justify-between w-16 sm:w-20 min-h-screen py-4 sm:py-6 bg-[#070913] border-r border-[#1B2040] select-none z-40 shrink-0 text-slate-300">
      {/* Top Section: Logo & Workspace Selector */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* App Logo */}
        <button
          onClick={() => handleSelectTool('CONVERSATIONAL_DESK')}
          className="relative group p-2.5 rounded-2xl bg-gradient-to-b from-[#2018E6]/25 to-[#1E124A]/20 border border-[#2018E6]/40 hover:border-[#2018E6]/80 shadow-lg shadow-[#2018E6]/20 transition-all cursor-pointer"
          title="Screened Home"
        >
          <div className="size-7 sm:size-8 rounded-xl bg-[#2018E6] flex items-center justify-center text-white font-serif font-bold text-lg shadow-md shadow-[#2018E6]/50">
            S
          </div>
          <span className="sr-only">Screened</span>
        </button>

        {/* Workspace Quick Switcher Trigger */}
        <button
          onClick={() => {
            soundEffects.playClick();
            setIsProductMenuOpen(!isProductMenuOpen);
          }}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isProductMenuOpen
              ? 'bg-[#151936] border-[#2018E6]/60 text-indigo-300'
              : 'bg-[#0E122B] border-[#1F254E] hover:border-[#2D3670] text-slate-400 hover:text-slate-200'
          }`}
          title="Switch Product Workspace"
        >
          <ChevronsUpDown className="size-4" />
        </button>
      </div>

      {/* Center Section: Navigation Rail Icons */}
      <div className="flex flex-col items-center gap-3 w-full my-auto">
        {/* 1. The Desk (Conversational AI Home - Royal Desk Blue) */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('CONVERSATIONAL_DESK')}
            onMouseEnter={() => setActiveTooltip('The Desk')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`relative p-3 rounded-2xl transition-all cursor-pointer ${
              activeTool === 'CONVERSATIONAL_DESK'
                ? 'bg-[#2018E6] text-white shadow-lg shadow-[#2018E6]/40'
                : 'hover:bg-[#121633] text-slate-400 hover:text-slate-100'
            }`}
          >
            <Sparkles className="size-5" />
            {activeTool === 'CONVERSATIONAL_DESK' && (
              <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-amber-400 ring-2 ring-[#070913]" />
            )}
          </button>
          {activeTooltip === 'The Desk' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0E1124] text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-[#22274C] z-50 pointer-events-none">
              The Desk (AI Executive)
            </div>
          )}
        </div>

        {/* 2. Due Diligence Workspace (Mint / Emerald Teal - #00D29E) */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('DUE_DILIGENCE')}
            onMouseEnter={() => setActiveTooltip('Due Diligence')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`relative p-3 rounded-2xl transition-all cursor-pointer ${
              activeTool === 'DUE_DILIGENCE'
                ? 'bg-[#00D29E] text-slate-950 shadow-lg shadow-[#00D29E]/30 font-bold'
                : 'hover:bg-[#121633] text-slate-400 hover:text-[#00D29E]'
            }`}
          >
            <ShieldCheck className="size-5" />
          </button>
          {activeTooltip === 'Due Diligence' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0E1124] text-[#00D29E] text-sm font-medium whitespace-nowrap shadow-xl border border-[#00D29E]/30 z-50 pointer-events-none">
              Due Diligence
            </div>
          )}
        </div>

        {/* 3. Opportunity Scout Workspace (Coral Rose - #F43F5E) */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('OPPORTUNITY_SCOUT')}
            onMouseEnter={() => setActiveTooltip('Opportunity Scout')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`relative p-3 rounded-2xl transition-all cursor-pointer ${
              activeTool === 'OPPORTUNITY_SCOUT'
                ? 'bg-[#F43F5E] text-white shadow-lg shadow-[#F43F5E]/30'
                : 'hover:bg-[#121633] text-slate-400 hover:text-[#F43F5E]'
            }`}
          >
            <Compass className="size-5" />
          </button>
          {activeTooltip === 'Opportunity Scout' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0E1124] text-[#F43F5E] text-sm font-medium whitespace-nowrap shadow-xl border border-[#F43F5E]/30 z-50 pointer-events-none">
              Opportunity Scout
            </div>
          )}
        </div>

        {/* 4. Why Screened (Impact & Research) */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('WHY_SCREENED')}
            onMouseEnter={() => setActiveTooltip('Why Screened')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`relative p-3 rounded-2xl transition-all cursor-pointer ${
              activeTool === 'WHY_SCREENED'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'hover:bg-[#121633] text-slate-400 hover:text-indigo-300'
            }`}
          >
            <Scale className="size-5" />
          </button>
          {activeTooltip === 'Why Screened' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0E1124] text-indigo-300 text-sm font-medium whitespace-nowrap shadow-xl border border-indigo-500/30 z-50 pointer-events-none">
              Why Screened Exists
            </div>
          )}
        </div>

        {/* Separator Line */}
        <div className="w-8 h-px bg-[#1D234A] my-1" />

        {/* 5. Products & Workspaces Flyout Trigger */}
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
              isProductMenuOpen
                ? 'bg-[#181D40] text-white border border-[#2018E6]/60 shadow-md'
                : 'hover:bg-[#121633] text-slate-400 hover:text-slate-100'
            }`}
          >
            <Layers className="size-5" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-[#00D29E] ring-2 ring-[#070913]" />
          </button>
          {activeTooltip === 'Products' && !isProductMenuOpen && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0E1124] text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-[#22274C] z-50 pointer-events-none">
              Product Switcher
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Utility Controls */}
      <div className="flex flex-col items-center gap-3 w-full pt-2">
        {/* Command Palette Trigger */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="p-2.5 rounded-xl hover:bg-[#121633] text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
            title="Command Palette (⌘K)"
          >
            <Command className="size-4.5" />
          </button>
        )}

        {/* Component Design Playground */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('DESIGN_PLAYGROUND')}
            onMouseEnter={() => setActiveTooltip('Design Playground')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              activeTool === 'DESIGN_PLAYGROUND'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'hover:bg-[#121633] text-slate-400 hover:text-purple-400'
            }`}
            title="Design Playground"
          >
            <Palette className="size-4.5" />
          </button>
          {activeTooltip === 'Design Playground' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0E1124] text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-[#22274C] z-50 pointer-events-none">
              Design Playground
            </div>
          )}
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleSound}
          className="p-2.5 rounded-xl hover:bg-[#121633] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title={soundMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
        >
          {soundMuted ? <VolumeX className="size-4.5 text-rose-400" /> : <Volume2 className="size-4.5" />}
        </button>

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl hover:bg-[#121633] text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          title="Toggle Theme (T)"
        >
          {theme === 'dark' ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
        </button>

        {/* Keyboard Shortcuts */}
        <button
          onClick={onOpenKeyboardHelp}
          className="p-2.5 rounded-xl hover:bg-[#121633] text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
          title="Keyboard Shortcuts (?)"
        >
          <Keyboard className="size-4.5" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* EXPANDABLE FLOATING PRODUCT FLYOUT */}
      {/* ========================================================================= */}
      {isProductMenuOpen && (
        <div
          ref={flyoutRef}
          className="absolute left-[72px] sm:left-[88px] top-1/2 -translate-y-1/2 w-88 p-3 rounded-3xl bg-[#0E1124]/95 backdrop-blur-xl border border-[#22274C] shadow-2xl shadow-black/90 space-y-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-2 border-b border-[#1B2042] flex items-center justify-between">
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
              Select Workspace
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#2018E6]/20 text-indigo-300 border border-[#2018E6]/40">
              2 Products
            </span>
          </div>

          {/* Product 1: Due Diligence (Mint / Emerald Teal) */}
          <button
            onClick={() => handleSelectTool('DUE_DILIGENCE')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3.5 transition-all text-left group cursor-pointer ${
              activeTool === 'DUE_DILIGENCE'
                ? 'bg-[#151936] border border-[#00D29E]/50 shadow-inner'
                : 'hover:bg-[#141838] border border-transparent'
            }`}
          >
            <GripVertical className="size-4 text-slate-600 group-hover:text-slate-400 shrink-0" />

            <div className="size-11 rounded-2xl bg-gradient-to-tr from-[#00D29E] to-[#00B887] flex items-center justify-center text-slate-950 shadow-lg shadow-[#00D29E]/30 shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="size-6 text-slate-950" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-white group-hover:text-[#00D29E] transition-colors">
                  Due Diligence
                </h4>
                {activeTool === 'DUE_DILIGENCE' && (
                  <Check className="size-4 text-[#00D29E] shrink-0" />
                )}
              </div>
              <p className="text-sm text-slate-400 line-clamp-1">
                Multi-agent cinema investigation & dossier
              </p>
            </div>
          </button>

          {/* Product 2: Opportunity Scout (Coral Rose) */}
          <button
            onClick={() => handleSelectTool('OPPORTUNITY_SCOUT')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3.5 transition-all text-left group cursor-pointer ${
              activeTool === 'OPPORTUNITY_SCOUT'
                ? 'bg-[#151936] border border-[#F43F5E]/50 shadow-inner'
                : 'hover:bg-[#141838] border border-transparent'
            }`}
          >
            <GripVertical className="size-4 text-slate-600 group-hover:text-slate-400 shrink-0" />

            <div className="size-11 rounded-2xl bg-gradient-to-tr from-[#F43F5E] via-[#EE3B65] to-orange-500 flex items-center justify-center text-white shadow-lg shadow-[#F43F5E]/30 shrink-0 group-hover:scale-105 transition-transform">
              <Compass className="size-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-white group-hover:text-[#F43F5E] transition-colors">
                  Opportunity Scout
                </h4>
                {activeTool === 'OPPORTUNITY_SCOUT' && (
                  <Check className="size-4 text-[#F43F5E] shrink-0" />
                )}
              </div>
              <p className="text-sm text-slate-400 line-clamp-1">
                Slate distribution & festival matching
              </p>
            </div>
          </button>

          {/* Section: Why Screened Exists */}
          <div className="pt-2 border-t border-[#1B2042]">
            <button
              onClick={() => handleSelectTool('WHY_SCREENED')}
              className={`w-full p-2.5 rounded-2xl flex items-center gap-3 transition-all text-left group cursor-pointer ${
                activeTool === 'WHY_SCREENED'
                  ? 'bg-[#151936] border border-indigo-500/50'
                  : 'hover:bg-[#141838] border border-transparent'
              }`}
            >
              <div className="size-9 rounded-xl bg-[#2018E6]/20 text-indigo-400 flex items-center justify-center shrink-0 border border-[#2018E6]/40">
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

          {/* Quick Hub Option: The Desk */}
          <div className="pt-1.5 border-t border-[#1B2042]">
            <button
              onClick={() => handleSelectTool('CONVERSATIONAL_DESK')}
              className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400 hover:text-indigo-300 hover:bg-[#141838] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-indigo-400" />
                <span>Return to The Desk (AI Home)</span>
              </div>
              <span className="text-[10px] text-slate-500">Esc to close</span>
            </button>
          </div>
        </div>
      )}

    </aside>
  );
};
