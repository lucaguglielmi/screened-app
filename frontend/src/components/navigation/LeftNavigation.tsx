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
  Check
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
}

export const LeftNavigation: React.FC<Props> = ({
  activeTool,
  onChange,
  theme,
  onToggleTheme,
  soundMuted,
  onToggleSound,
  onOpenKeyboardHelp,
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
    <aside className="relative flex flex-col items-center justify-between w-16 sm:w-20 min-h-screen py-4 sm:py-6 bg-[#0E1013] border-r border-[#1F2228] select-none z-40 shrink-0 text-slate-300">
      {/* Top Section: Logo & Workspace Selector */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* App Logo */}
        <button
          onClick={() => handleSelectTool('CONVERSATIONAL_DESK')}
          className="relative group p-2.5 rounded-2xl bg-gradient-to-b from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 hover:border-indigo-500/60 shadow-lg shadow-indigo-500/10 transition-all cursor-pointer"
          title="Screened Home"
        >
          <div className="size-7 sm:size-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-serif font-bold text-lg shadow-md shadow-indigo-600/40">
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
              ? 'bg-[#1C1E24] border-indigo-500/50 text-indigo-400'
              : 'bg-[#14161A] border-[#262930] hover:border-[#3B3F4A] text-slate-400 hover:text-slate-200'
          }`}
          title="Switch Product Workspace"
        >
          <ChevronsUpDown className="size-4" />
        </button>
      </div>

      {/* Center Section: Navigation Rail Icons */}
      <div className="flex flex-col items-center gap-3 w-full my-auto">
        {/* 1. The Desk (Conversational AI Home) */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('CONVERSATIONAL_DESK')}
            onMouseEnter={() => setActiveTooltip('The Desk')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`relative p-3 rounded-2xl transition-all cursor-pointer ${
              activeTool === 'CONVERSATIONAL_DESK'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'hover:bg-[#1A1C22] text-slate-400 hover:text-slate-100'
            }`}
          >
            <Sparkles className="size-5" />
            {activeTool === 'CONVERSATIONAL_DESK' && (
              <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-amber-400 ring-2 ring-[#0E1013]" />
            )}
          </button>
          {activeTooltip === 'The Desk' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#181A20] text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-[#2B2F38] z-50 pointer-events-none">
              The Desk (AI Executive)
            </div>
          )}
        </div>

        {/* 2. Due Diligence Workspace */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('DUE_DILIGENCE')}
            onMouseEnter={() => setActiveTooltip('Due Diligence')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`relative p-3 rounded-2xl transition-all cursor-pointer ${
              activeTool === 'DUE_DILIGENCE'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'hover:bg-[#1A1C22] text-slate-400 hover:text-slate-100'
            }`}
          >
            <ShieldCheck className="size-5" />
          </button>
          {activeTooltip === 'Due Diligence' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#181A20] text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-[#2B2F38] z-50 pointer-events-none">
              Due Diligence
            </div>
          )}
        </div>

        {/* 3. Opportunity Scout Workspace */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('OPPORTUNITY_SCOUT')}
            onMouseEnter={() => setActiveTooltip('Opportunity Scout')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`relative p-3 rounded-2xl transition-all cursor-pointer ${
              activeTool === 'OPPORTUNITY_SCOUT'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'hover:bg-[#1A1C22] text-slate-400 hover:text-slate-100'
            }`}
          >
            <Compass className="size-5" />
          </button>
          {activeTooltip === 'Opportunity Scout' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#181A20] text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-[#2B2F38] z-50 pointer-events-none">
              Opportunity Scout
            </div>
          )}
        </div>

        {/* Separator Line */}
        <div className="w-8 h-px bg-[#232730] my-1" />

        {/* 4. Products & Workspaces Flyout Trigger (matches screenshot button with dot) */}
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
                ? 'bg-[#222630] text-white border border-indigo-500/40 shadow-md'
                : 'hover:bg-[#1A1C22] text-slate-400 hover:text-slate-100'
            }`}
          >
            <Layers className="size-5" />
            {/* Active product status dot */}
            <span className="absolute top-2 right-2 size-2 rounded-full bg-cyan-400 ring-2 ring-[#0E1013]" />
          </button>
          {activeTooltip === 'Products' && !isProductMenuOpen && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#181A20] text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-[#2B2F38] z-50 pointer-events-none">
              Product Switcher
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Utility Controls */}
      <div className="flex flex-col items-center gap-3 w-full pt-2">
        {/* Component Design Playground */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('DESIGN_PLAYGROUND')}
            onMouseEnter={() => setActiveTooltip('Design Playground')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              activeTool === 'DESIGN_PLAYGROUND'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                : 'hover:bg-[#1A1C22] text-slate-400 hover:text-pink-400'
            }`}
            title="Design Playground"
          >
            <Palette className="size-4.5" />
          </button>
          {activeTooltip === 'Design Playground' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#181A20] text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-[#2B2F38] z-50 pointer-events-none">
              Design Playground
            </div>
          )}
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleSound}
          className="p-2.5 rounded-xl hover:bg-[#1A1C22] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title={soundMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
        >
          {soundMuted ? <VolumeX className="size-4.5 text-rose-400" /> : <Volume2 className="size-4.5" />}
        </button>

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-xl hover:bg-[#1A1C22] text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          title="Toggle Theme (T)"
        >
          {theme === 'dark' ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
        </button>

        {/* Keyboard Shortcuts */}
        <button
          onClick={onOpenKeyboardHelp}
          className="p-2.5 rounded-xl hover:bg-[#1A1C22] text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
          title="Keyboard Shortcuts (?)"
        >
          <Keyboard className="size-4.5" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* EXPANDABLE FLOATING PRODUCT FLYOUT (Matches Attached Mockup with 2 Products) */}
      {/* ========================================================================= */}
      {isProductMenuOpen && (
        <div
          ref={flyoutRef}
          className="absolute left-[72px] sm:left-[88px] top-1/2 -translate-y-1/2 w-84 p-2.5 rounded-3xl bg-[#13151A]/95 backdrop-blur-xl border border-[#2A2E39] shadow-2xl shadow-black/80 space-y-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-2 border-b border-[#222630] flex items-center justify-between">
            <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
              Select Workspace
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              2 Products
            </span>
          </div>

          {/* Product 1: Due Diligence */}
          <button
            onClick={() => handleSelectTool('DUE_DILIGENCE')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3.5 transition-all text-left group cursor-pointer ${
              activeTool === 'DUE_DILIGENCE'
                ? 'bg-[#1E222C] border border-indigo-500/40 shadow-inner'
                : 'hover:bg-[#1A1D24] border border-transparent'
            }`}
          >
            {/* Grip icon */}
            <GripVertical className="size-4 text-slate-600 group-hover:text-slate-400 shrink-0" />

            {/* Circular Product Badge */}
            <div className="size-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="size-6" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  Due Diligence
                </h4>
                {activeTool === 'DUE_DILIGENCE' && (
                  <Check className="size-4 text-indigo-400 shrink-0" />
                )}
              </div>
              <p className="text-sm text-slate-400 line-clamp-1">
                Multi-agent cinema investigation & dossier
              </p>
            </div>
          </button>

          {/* Product 2: Opportunity Scout */}
          <button
            onClick={() => handleSelectTool('OPPORTUNITY_SCOUT')}
            className={`w-full p-3 rounded-2xl flex items-center gap-3.5 transition-all text-left group cursor-pointer ${
              activeTool === 'OPPORTUNITY_SCOUT'
                ? 'bg-[#1E222C] border border-rose-500/40 shadow-inner'
                : 'hover:bg-[#1A1D24] border border-transparent'
            }`}
          >
            {/* Grip icon */}
            <GripVertical className="size-4 text-slate-600 group-hover:text-slate-400 shrink-0" />

            {/* Circular Product Badge */}
            <div className="size-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 shrink-0 group-hover:scale-105 transition-transform">
              <Compass className="size-6" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-white group-hover:text-rose-300 transition-colors">
                  Opportunity Scout
                </h4>
                {activeTool === 'OPPORTUNITY_SCOUT' && (
                  <Check className="size-4 text-rose-400 shrink-0" />
                )}
              </div>
              <p className="text-sm text-slate-400 line-clamp-1">
                Film slate matching & deadline strategy
              </p>
            </div>
          </button>

          {/* Quick Hub Option: The Desk */}
          <div className="pt-1.5 border-t border-[#222630]">
            <button
              onClick={() => handleSelectTool('CONVERSATIONAL_DESK')}
              className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400 hover:text-amber-300 hover:bg-[#1A1D24] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-amber-400" />
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
