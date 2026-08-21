import React from 'react';
import { ActiveTool } from '../types/investigation';
import { ShieldCheck, Compass } from 'lucide-react';


interface Props {
  activeTool: ActiveTool;
  onChange: (tool: ActiveTool) => void;
}

export const ToolSwitcher: React.FC<Props> = ({ activeTool, onChange }) => {
  return (
    <div className="inline-flex p-1 rounded-2xl bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border shadow-xs">
      <button
        onClick={() => onChange('DUE_DILIGENCE')}
        className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
          activeTool === 'DUE_DILIGENCE'
            ? 'bg-paper-surface dark:bg-darkroom-surface text-paper-text dark:text-darkroom-text shadow-xs font-semibold'
            : 'text-paper-muted dark:text-darkroom-muted hover:text-paper-text dark:hover:text-darkroom-text'
        }`}
      >
        <ShieldCheck className="size-4 text-indigo-500" />
        <span>Festival Due Diligence</span>
      </button>

      <button
        onClick={() => onChange('OPPORTUNITY_SCOUT')}
        className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
          activeTool === 'OPPORTUNITY_SCOUT'
            ? 'bg-paper-surface dark:bg-darkroom-surface text-paper-text dark:text-darkroom-text shadow-xs font-semibold'
            : 'text-paper-muted dark:text-darkroom-muted hover:text-paper-text dark:hover:text-darkroom-text'
        }`}
      >
        <Compass className="size-4 text-indigo-500" />
        <span>Opportunity Scout</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono">
          New
        </span>
      </button>
    </div>
  );
};
