import React from 'react';

interface AgentThinkingPillProps {
  label?: string;
}

export const AgentThinkingPill: React.FC<AgentThinkingPillProps> = ({
  label = 'Executive Producer is analyzing festival records...',
}) => {
  return (
    <div className="flex items-center gap-2.5 my-3 px-4 py-2 rounded-full border border-amber-500/30 bg-zinc-900/80 backdrop-blur-md w-fit shadow-md animate-pulse">
      <div className="flex space-x-1 items-center">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm font-medium text-amber-300/90 tracking-wide">
        {label}
      </span>
    </div>
  );
};

