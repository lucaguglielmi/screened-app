import React from 'react';
import { ActiveTool } from '../types/investigation';
import { ShieldCheck, Coins, Sparkles } from 'lucide-react';
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
    <div className="inline-flex p-1 rounded-2xl bg-darkroom-card border border-darkroom-border shadow-xs">
      {/* The Desk (Conversational Agent Home) */}
      <button
        onClick={() => handleSwitch('CONVERSATIONAL_DESK')}
        className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
          activeTool === 'CONVERSATIONAL_DESK'
            ? 'bg-darkroom-surface text-tool-diligence shadow-xs font-bold border border-tool-diligence/30'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Sparkles className="size-3.5 text-tool-diligence" />
        <span>The Desk</span>
        <span className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded-full bg-tool-diligence/15 text-tool-diligence border border-tool-diligence/30 font-mono font-semibold">
          AI
        </span>
      </button>

      {/* Festival Due Diligence */}
      <button
        onClick={() => handleSwitch('DUE_DILIGENCE')}
        className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
          activeTool === 'DUE_DILIGENCE'
            ? 'bg-darkroom-surface text-tool-diligence shadow-xs font-bold border border-tool-diligence/30'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <ShieldCheck className="size-3.5 text-tool-diligence" />
        <span>Due Diligence</span>
      </button>

      {/* Grant & Funding Research */}
      <button
        onClick={() => handleSwitch('GRANT_SCOUT')}
        className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
          activeTool === 'GRANT_SCOUT'
            ? 'bg-darkroom-surface text-tool-diligence shadow-xs font-bold border border-tool-diligence/30'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Coins className="size-3.5 text-tool-diligence" />
        <span>Grant Research</span>
      </button>
    </div>
  );
};

