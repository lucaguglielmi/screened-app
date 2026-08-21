import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Menu, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Palette, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Search, 
  Scale, 
  Keyboard,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveTool } from '../../types/investigation';
import { soundEffects } from '../../utils/audio';

interface MobileNavigationProps {
  activeTool: ActiveTool;
  onChange: (tool: ActiveTool) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  onOpenKeyboardHelp: () => void;
  onOpenCommandPalette: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTool,
  onChange,
  theme,
  onToggleTheme,
  soundMuted,
  onToggleSound,
  onOpenKeyboardHelp,
  onOpenCommandPalette,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        <div className="fixed inset-0 z-[9999] md:hidden">
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
            className="fixed inset-y-0 right-0 w-full max-w-sm h-[100dvh] bg-[#070913] border-l border-[#1F254E] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto text-slate-200"
          >
            {/* Top Bar inside Drawer */}
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#1B2042]">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-[#2018E6] flex items-center justify-center text-white font-serif font-bold text-lg shadow-md shadow-[#2018E6]/50">
                    S
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white tracking-tight">Screened</h3>
                    <p className="text-xs text-slate-400 font-mono">Autonomous Cinema Intelligence</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-[#0E1124] border border-[#22274C] text-slate-400 hover:text-white transition-colors cursor-pointer"
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
                  className="w-full py-3 px-4 rounded-2xl bg-[#0E1124] hover:bg-[#151936] border border-[#22274C] text-left flex items-center justify-between text-base text-slate-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Search className="size-5 text-indigo-400" />
                    <span>Quick Search (⌘K)</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1A1F45] text-slate-400 border border-[#262D5F]">
                    ⌘K
                  </span>
                </button>
              </div>

              {/* Workspace Navigation Cards */}
              <div className="mt-6 space-y-3">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 px-1">
                  Workspaces
                </span>

                {/* 1. The Desk */}
                <button
                  type="button"
                  onClick={() => handleSelect('CONVERSATIONAL_DESK')}
                  className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                    activeTool === 'CONVERSATIONAL_DESK'
                      ? 'bg-[#151936] border border-[#2018E6]/80 text-white shadow-lg shadow-[#2018E6]/20'
                      : 'bg-[#0E1124] hover:bg-[#141838] border border-[#1F254E] text-slate-300'
                  }`}
                >
                  <div className="size-10 rounded-xl bg-[#2018E6] flex items-center justify-center text-white shadow-md shrink-0">
                    <Sparkles className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">The Producer Desk</h4>
                      {activeTool === 'CONVERSATIONAL_DESK' && <Check className="size-4 text-indigo-400" />}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-1">Conversational AI Executive</p>
                  </div>
                </button>

                {/* 2. Due Diligence */}
                <button
                  type="button"
                  onClick={() => handleSelect('DUE_DILIGENCE')}
                  className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                    activeTool === 'DUE_DILIGENCE'
                      ? 'bg-[#151936] border border-[#00D29E]/80 text-white shadow-lg shadow-[#00D29E]/20'
                      : 'bg-[#0E1124] hover:bg-[#141838] border border-[#1F254E] text-slate-300'
                  }`}
                >
                  <div className="size-10 rounded-xl bg-gradient-to-tr from-[#00D29E] to-[#00B887] flex items-center justify-center text-slate-950 shadow-md shrink-0">
                    <ShieldCheck className="size-5 text-slate-950" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">Due Diligence</h4>
                      {activeTool === 'DUE_DILIGENCE' && <Check className="size-4 text-[#00D29E]" />}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-1">Festival Dossier & Fact Vetting</p>
                  </div>
                </button>

                {/* 3. Opportunity Scout */}
                <button
                  type="button"
                  onClick={() => handleSelect('OPPORTUNITY_SCOUT')}
                  className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                    activeTool === 'OPPORTUNITY_SCOUT'
                      ? 'bg-[#151936] border border-[#F43F5E]/80 text-white shadow-lg shadow-[#F43F5E]/20'
                      : 'bg-[#0E1124] hover:bg-[#141838] border border-[#1F254E] text-slate-300'
                  }`}
                >
                  <div className="size-10 rounded-xl bg-gradient-to-tr from-[#F43F5E] via-[#EE3B65] to-orange-500 flex items-center justify-center text-white shadow-md shrink-0">
                    <Compass className="size-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">Opportunity Scout</h4>
                      {activeTool === 'OPPORTUNITY_SCOUT' && <Check className="size-4 text-[#F43F5E]" />}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-1">Slate Strategy & Circuit Match</p>
                  </div>
                </button>

                {/* 4. Why Screened Exists */}
                <button
                  type="button"
                  onClick={() => handleSelect('WHY_SCREENED')}
                  className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                    activeTool === 'WHY_SCREENED'
                      ? 'bg-[#151936] border border-indigo-500/80 text-white shadow-lg'
                      : 'bg-[#0E1124] hover:bg-[#141838] border border-[#1F254E] text-slate-300'
                  }`}
                >
                  <div className="size-10 rounded-xl bg-[#2018E6]/20 text-indigo-400 flex items-center justify-center border border-[#2018E6]/40 shrink-0">
                    <Scale className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">Why Screened</h4>
                      {activeTool === 'WHY_SCREENED' && <Check className="size-4 text-indigo-400" />}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-1">Problem Validation & Impact</p>
                  </div>
                </button>

                {/* 5. Design Tokens & Playground */}
                <button
                  type="button"
                  onClick={() => handleSelect('DESIGN_PLAYGROUND')}
                  className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 transition-all text-left cursor-pointer ${
                    activeTool === 'DESIGN_PLAYGROUND'
                      ? 'bg-[#151936] border border-purple-500/80 text-white shadow-lg'
                      : 'bg-[#0E1124] hover:bg-[#141838] border border-[#1F254E] text-slate-300'
                  }`}
                >
                  <div className="size-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/40 shrink-0">
                    <Palette className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">Design Lab & Traces</h4>
                      {activeTool === 'DESIGN_PLAYGROUND' && <Check className="size-4 text-purple-400" />}
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-1">Tokens, Loaders & OTel Traces</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Utilities row */}
            <div className="pt-6 mt-6 border-t border-[#1B2042] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onToggleTheme();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#0E1124] hover:bg-[#151936] border border-[#22274C] flex items-center justify-center gap-2 text-sm text-slate-300 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-400" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onToggleSound();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#0E1124] hover:bg-[#151936] border border-[#22274C] flex items-center justify-center gap-2 text-sm text-slate-300 transition-colors cursor-pointer"
              >
                {soundMuted ? <VolumeX className="size-4 text-rose-400" /> : <Volume2 className="size-4 text-indigo-400" />}
                <span>{soundMuted ? 'Muted' : 'Sound On'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenKeyboardHelp();
                }}
                className="p-2.5 rounded-xl bg-[#0E1124] hover:bg-[#151936] border border-[#22274C] text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Keyboard Shortcuts"
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
        className="md:hidden p-2 rounded-xl bg-[#0E1124] hover:bg-[#151936] border border-[#22274C] text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
      >
        {isOpen ? <X className="size-5 text-indigo-400" /> : <Menu className="size-5 text-indigo-400" />}
      </button>

      {/* Render Mobile Drawer via Portal into document.body */}
      {mounted && typeof document !== 'undefined' && createPortal(drawerContent, document.body)}
    </>
  );
};
