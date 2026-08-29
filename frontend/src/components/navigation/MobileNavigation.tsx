import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import {
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Compass,
  Palette,
  Volume2,
  VolumeX,
  Search,
  Scale,
  Keyboard,
  Check,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveTool } from '../../types/investigation';
import { soundEffects } from '../../utils/audio';

interface MobileNavigationProps {
  activeTool: ActiveTool;
  onChange: (tool: ActiveTool) => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  onOpenKeyboardHelp: () => void;
  onOpenCommandPalette: () => void;
}

const subscribe = () => () => {};

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTool,
  onChange,
  soundMuted,
  onToggleSound,
  onOpenKeyboardHelp,
  onOpenCommandPalette,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMounted = useSyncExternalStore(subscribe, () => true, () => false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (tool: ActiveTool) => {
    soundEffects.playClick();
    onChange(tool);
    setIsOpen(false);
  };

  // Portal content for the overlay drawer
  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm h-[100dvh] bg-darkroom-bg border-l border-darkroom-border shadow-2xl p-6 flex flex-col justify-between overflow-y-auto text-slate-200"
          >
            {/* Top Bar inside Drawer */}
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-darkroom-border">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-midnight-royal flex items-center justify-center text-white font-serif font-bold text-lg shadow-md shadow-[var(--color-midnight-royal)]/50">
                    S
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white tracking-tight">
                      Screened
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Autonomous Cinema Intelligence
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-darkroom-surface border border-darkroom-border text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Quick Search Action */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenCommandPalette();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-darkroom-surface hover:bg-darkroom-card border border-darkroom-border text-left flex items-center justify-between text-base text-slate-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Search className="size-5 text-indigo-400" />
                    <span>Quick Search (⌘K)</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-paper-border bg-darkroom-border text-slate-400 border border-darkroom-border">
                    ⌘K
                  </span>
                </button>
              </div>

              {/* Primary Workspace Navigation Cards */}
              <div className="mt-6 space-y-2.5">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 px-1">
                  Primary Workspaces
                </span>

                {/* 1. Mission Control */}
                <button
                  type="button"
                  onClick={() => handleSelect('CONVERSATIONAL_DESK')}
                  className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                    activeTool === 'CONVERSATIONAL_DESK'
                      ? 'bg-darkroom-card border border-tool-diligence/80 text-white shadow-lg shadow-[var(--color-tool-diligence)]/20'
                      : 'bg-darkroom-surface hover:bg-darkroom-card border border-darkroom-border text-slate-300'
                  }`}
                >
                  <div className="size-10 rounded-xl bg-tool-diligence/20 text-tool-diligence border border-tool-diligence/40 flex items-center justify-center font-bold shadow-md shrink-0">
                    <Sparkles className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">Mission Control</h4>
                      {activeTool === 'CONVERSATIONAL_DESK' && (
                        <Check className="size-4 text-tool-diligence" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">Main AI Command Interface</p>
                  </div>
                </button>

                {/* 2. Due Diligence */}
                <button
                  type="button"
                  onClick={() => handleSelect('DUE_DILIGENCE')}
                  className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                    activeTool === 'DUE_DILIGENCE'
                      ? 'bg-darkroom-card border border-tool-diligence/80 text-white shadow-lg shadow-[var(--color-tool-diligence)]/20'
                      : 'bg-darkroom-surface hover:bg-darkroom-card border border-darkroom-border text-slate-300'
                  }`}
                >
                  <div className="size-10 rounded-xl bg-gradient-to-tr from-tool-diligence to-tool-diligence-hover flex items-center justify-center text-slate-950 shadow-md shrink-0">
                    <ShieldCheck className="size-5 text-slate-950" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">Due Diligence</h4>
                      {activeTool === 'DUE_DILIGENCE' && (
                        <Check className="size-4 text-tool-diligence" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      Festival Dossier & Fact Vetting
                    </p>
                  </div>
                </button>

                {/* 3. Opportunity Scout */}
                <button
                  type="button"
                  onClick={() => handleSelect('OPPORTUNITY_SCOUT')}
                  className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                    activeTool === 'OPPORTUNITY_SCOUT'
                      ? 'bg-darkroom-card border border-tool-diligence/80 text-white shadow-lg shadow-[var(--color-tool-diligence)]/20'
                      : 'bg-darkroom-surface hover:bg-darkroom-card border border-darkroom-border text-slate-300'
                  }`}
                >
                  <div className="size-10 rounded-xl bg-gradient-to-tr from-tool-diligence to-tool-diligence-hover flex items-center justify-center text-slate-950 shadow-md shrink-0">
                    <Compass className="size-5 text-slate-950" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">Opportunity Scout</h4>
                      {activeTool === 'OPPORTUNITY_SCOUT' && (
                        <Check className="size-4 text-tool-diligence" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      Slate Strategy & Circuit Match
                    </p>
                  </div>
                </button>
              </div>

              {/* Subtle Secondary Links (Why Screened & Design Playground) */}
              <div className="mt-6 pt-4 border-t border-zinc-800/80 space-y-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 px-1 block">
                  Reference & Design
                </span>

                <button
                  type="button"
                  onClick={() => handleSelect('WHY_SCREENED')}
                  className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs font-medium transition-colors ${
                    activeTool === 'WHY_SCREENED'
                      ? 'text-tool-diligence bg-tool-diligence/10 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-zinc-500" />
                    <span>Why Screened (Problem & Empirical Matrix)</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelect('DESIGN_PLAYGROUND')}
                  className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs font-medium transition-colors ${
                    activeTool === 'DESIGN_PLAYGROUND'
                      ? 'text-tool-diligence bg-tool-diligence/10 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-zinc-500" />
                    <span>Design Playground & Tracing Lab</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
            </div>

            {/* Bottom Utilities Row (Theme & Sound as Icons) */}
            <div className="pt-4 mt-6 border-t border-darkroom-border flex items-center justify-between">
              <div className="flex items-center space-x-2">

                {/* Sound Icon Button */}
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    onToggleSound();
                  }}
                  className="p-2.5 rounded-xl bg-darkroom-surface hover:bg-darkroom-card border border-darkroom-border text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title={soundMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
                  aria-label="Toggle sound"
                >
                  {soundMuted ? (
                    <VolumeX className="size-4 text-rose-400" />
                  ) : (
                    <Volume2 className="size-4 text-indigo-400" />
                  )}
                </button>
              </div>

              {/* Keyboard Shortcuts Icon Button */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenKeyboardHelp();
                }}
                className="p-2.5 rounded-xl bg-darkroom-surface hover:bg-darkroom-card border border-darkroom-border text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Keyboard Shortcuts (?)"
                aria-label="Keyboard Shortcuts"
              >
                <Keyboard className="size-4 text-indigo-400" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Mobile Menu Trigger Button in Header (visible only on mobile: md:hidden) */}
      <button
        type="button"
        onClick={() => {
          soundEffects.playClick();
          setIsOpen(!isOpen);
        }}
        aria-label="Open Navigation Menu"
        className="md:hidden p-2 rounded-xl bg-darkroom-surface hover:bg-darkroom-card border border-darkroom-border text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
      >
        {isOpen ? (
          <X className="size-5 text-indigo-400" />
        ) : (
          <Menu className="size-5 text-indigo-400" />
        )}
      </button>

      {/* Render Mobile Drawer via Portal into document.body */}
      {isMounted && typeof document !== 'undefined' && createPortal(drawerContent, document.body)}
    </>
  );
};
