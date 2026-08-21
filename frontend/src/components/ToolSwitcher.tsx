import React from 'react';
import { ActiveTool } from '../types/investigation';
import { ShieldCheck, Compass, Sparkles, Palette } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface Props {
  activeTool: ActiveTool;
  onChange: (tool: ActiveTool) => void;
}

export const ToolSwitcher: React.FC<Props> = ({ activeTool, onChange }) => {
  const handleSwitch = (tool: ActiveTool) => {
    soundEffects.playClick();
    onChange(tool);
  };

  return (
    <div className="inline-flex p-1 rounded-2xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border shadow-xs">
      {/* The Desk (Conversational Agent Home) */}
      <button
        onClick={() => handleSwitch('CONVERSATIONAL_DESK')}
        className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
          activeTool === 'CONVERSATIONAL_DESK'
            ? 'bg-paper-surface dark:bg-darkroom-surface text-paper-text dark:text-darkroom-text shadow-xs font-semibold'
            : 'text-paper-muted dark:text-darkroom-muted hover:text-paper-text dark:hover:text-darkroom-text'
        }`}
      >
        <Sparkles className="size-3.5 text-amber-500" />
        <span>The Desk</span>
        <span className="hidden sm:inline text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
          AI
        </span>
      </button>

      {/* Festival Due Diligence */}
      <button
        onClick={() => handleSwitch('DUE_DILIGENCE')}
        className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
          activeTool === 'DUE_DILIGENCE'
            ? 'bg-paper-surface dark:bg-darkroom-surface text-paper-text dark:text-darkroom-text shadow-xs font-semibold'
            : 'text-paper-muted dark:text-darkroom-muted hover:text-paper-text dark:hover:text-darkroom-text'
        }`}
      >
        <ShieldCheck className="size-3.5 text-indigo-500" />
        <span>Due Diligence</span>
      </button>

      {/* Opportunity Scout */}
      <button
        onClick={() => handleSwitch('OPPORTUNITY_SCOUT')}
        className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
          activeTool === 'OPPORTUNITY_SCOUT'
            ? 'bg-paper-surface dark:bg-darkroom-surface text-paper-text dark:text-darkroom-text shadow-xs font-semibold'
            : 'text-paper-muted dark:text-darkroom-muted hover:text-paper-text dark:hover:text-darkroom-text'
        }`}
      >
        <Compass className="size-3.5 text-indigo-500" />
        <span>Opportunity Scout</span>
      </button>

      {/* Design Playground */}
      <button
        onClick={() => handleSwitch('DESIGN_PLAYGROUND')}
        title="Interactive Component Studio & Visual Playground"
        className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
          activeTool === 'DESIGN_PLAYGROUND'
            ? 'bg-paper-surface dark:bg-darkroom-surface text-paper-text dark:text-darkroom-text shadow-xs font-semibold'
            : 'text-paper-muted dark:text-darkroom-muted hover:text-paper-text dark:hover:text-darkroom-text'
        }`}
      >
        <Palette className="size-3.5 text-pink-500" />
        <span className="hidden md:inline">Playground</span>
      </button>
    </div>
  );
};
