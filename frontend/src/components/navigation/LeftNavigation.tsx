import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Coins,
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
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleSelectTool = (tool: ActiveTool) => {
    soundEffects.playClick();
    onChange(tool);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 h-screen h-[100dvh] hidden md:flex flex-col items-center justify-between w-16 md:w-20 py-5 sm:py-6 bg-darkroom-bg border-r border-darkroom-border select-none z-40 shrink-0 text-slate-300">
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

      {/* Center Section: Direct 3-Pillar Navigation Icons */}
      <div className="flex flex-col items-center gap-3.5 w-full my-auto">
        {/* 1. Screened AI */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('CONVERSATIONAL_DESK')}
            onMouseEnter={() => setActiveTooltip('Screened AI')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`relative p-3 rounded-2xl transition-all cursor-pointer ${
              activeTool === 'CONVERSATIONAL_DESK'
                ? 'bg-darkroom-card text-tool-diligence shadow-lg shadow-[var(--color-tool-diligence)]/20 ring-1 ring-tool-diligence/50 border border-tool-diligence/40'
                : 'hover:bg-darkroom-surface text-slate-400 hover:text-slate-100'
            }`}
            title="Screened AI"
          >
            <Sparkles className="size-5" />
            {activeTool === 'CONVERSATIONAL_DESK' && (
              <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-tool-diligence ring-2 ring-darkroom-bg" />
            )}
          </button>
          {activeTooltip === 'Screened AI' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-darkroom-surface text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-darkroom-border z-50 pointer-events-none">
              Screened AI (Conversational Hub)
            </div>
          )}
        </div>

        {/* 2. Festival Due Diligence */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('DUE_DILIGENCE')}
            onMouseEnter={() => setActiveTooltip('Festival Due Diligence')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`relative p-3 rounded-2xl transition-all cursor-pointer ${
              activeTool === 'DUE_DILIGENCE'
                ? 'bg-darkroom-card text-tool-diligence shadow-lg shadow-[var(--color-tool-diligence)]/20 ring-1 ring-tool-diligence/50 border border-tool-diligence/40'
                : 'hover:bg-darkroom-surface text-slate-400 hover:text-slate-100'
            }`}
            title="Festival Due Diligence"
          >
            <ShieldCheck className="size-5" />
            {activeTool === 'DUE_DILIGENCE' && (
              <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-tool-diligence ring-2 ring-darkroom-bg" />
            )}
          </button>
          {activeTooltip === 'Festival Due Diligence' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-darkroom-surface text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-darkroom-border z-50 pointer-events-none">
              Festival Due Diligence (Forensic Dossier)
            </div>
          )}
        </div>

        {/* 3. Grant & Funding Research */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('GRANT_SCOUT')}
            onMouseEnter={() => setActiveTooltip('Grant & Funding Research')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`relative p-3 rounded-2xl transition-all cursor-pointer ${
              activeTool === 'GRANT_SCOUT'
                ? 'bg-darkroom-card text-tool-diligence shadow-lg shadow-[var(--color-tool-diligence)]/20 ring-1 ring-tool-diligence/50 border border-tool-diligence/40'
                : 'hover:bg-darkroom-surface text-slate-400 hover:text-slate-100'
            }`}
            title="Grant & Funding Research"
          >
            <Coins className="size-5" />
            {activeTool === 'GRANT_SCOUT' && (
              <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-tool-diligence ring-2 ring-darkroom-bg" />
            )}
          </button>
          {activeTooltip === 'Grant & Funding Research' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-darkroom-surface text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-darkroom-border z-50 pointer-events-none">
              Grant & Funding Research (Public Funds Match)
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Why Screened & Deployment Status */}
      <div className="flex flex-col items-center gap-3 w-full pt-2">
        {/* Scam & Protection Guide Link */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('FESTIVAL_PROTECTION_GUIDE')}
            onMouseEnter={() => setActiveTooltip('Scam & Risk Defense Guide')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              activeTool === 'FESTIVAL_PROTECTION_GUIDE'
                ? 'bg-darkroom-card text-orange-400 border border-orange-500/40'
                : 'hover:bg-darkroom-surface text-slate-500 hover:text-slate-300'
            }`}
            title="Scam & Risk Defense Guide"
          >
            <ShieldAlert className="size-4.5" />
          </button>
          {activeTooltip === 'Scam & Risk Defense Guide' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-darkroom-surface text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-darkroom-border z-50 pointer-events-none">
              Scam &amp; Risk Defense Guide
            </div>
          )}
        </div>

        {/* Why Screened Link */}
        <div className="relative">
          <button
            onClick={() => handleSelectTool('WHY_SCREENED')}
            onMouseEnter={() => setActiveTooltip('Why Screened Exists')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              activeTool === 'WHY_SCREENED'
                ? 'bg-darkroom-card text-tool-diligence border border-tool-diligence/40'
                : 'hover:bg-darkroom-surface text-slate-500 hover:text-slate-300'
            }`}
            title="Why Screened Exists"
          >
            <Scale className="size-4.5" />
          </button>
          {activeTooltip === 'Why Screened Exists' && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-darkroom-surface text-slate-100 text-sm font-medium whitespace-nowrap shadow-xl border border-darkroom-border z-50 pointer-events-none">
              Why Screened Exists (Baseline Matrix)
            </div>
          )}
        </div>

        {/* Live Deployment Status Indicator */}
        <div className="relative flex flex-col items-center">
          <div
            onMouseEnter={() => setActiveTooltip('Live Deployment')}
            onMouseLeave={() => setActiveTooltip(null)}
            className="p-1.5 px-2 rounded-xl bg-darkroom-surface hover:bg-darkroom-card border border-darkroom-border flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors group"
            title="Live Version Info"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-tool-diligence opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-tool-diligence" />
            </div>
            <span className="text-[9px] font-mono text-slate-400 group-hover:text-tool-diligence font-semibold tracking-tighter">
              {typeof __COMMIT_SHA__ !== 'undefined' && __COMMIT_SHA__ !== 'unknown'
                ? __COMMIT_SHA__.slice(0, 6)
                : typeof __APP_VERSION__ !== 'undefined'
                ? `v${__APP_VERSION__}`
                : 'v0.2'}
            </span>
          </div>
          {activeTooltip === 'Live Deployment' && (
            <div className="absolute left-full ml-3 bottom-0 px-3 py-2.5 rounded-xl bg-darkroom-surface text-slate-100 text-xs font-mono whitespace-nowrap shadow-2xl border border-darkroom-border z-50 pointer-events-none">
              <div className="flex items-center gap-1.5 text-tool-diligence font-semibold">
                <Radio className="size-3" />
                <span>Live Deployment</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1">
                Version: <span className="text-white font-bold">{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.2.0'}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Commit:{' '}
                <span className="text-tool-diligence font-bold">
                  {typeof __COMMIT_SHA__ !== 'undefined' ? __COMMIT_SHA__ : 'production'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Built:{' '}
                {typeof __BUILD_TIME__ !== 'undefined'
                  ? new Date(__BUILD_TIME__).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : 'live'}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

