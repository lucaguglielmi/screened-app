import React from 'react';
import { AgentAvatar } from './AgentAvatar';

interface AgentThinkingPillProps {
  label?: string;
}

export const AgentThinkingPill: React.FC<AgentThinkingPillProps> = ({
  label = 'Executive Producer is analyzing festival records...',
}) => {
  return (
    <div className="flex items-center gap-3 my-4 px-4 py-2.5 rounded-2xl border border-indigo-500/40 bg-[#0E1124]/90 backdrop-blur-xl w-fit shadow-xl shadow-indigo-950/40">
      <AgentAvatar size="sm" isThinking={true} />
      <div className="flex space-x-1.5 items-center">
        <div className="size-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="size-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="size-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-base font-medium text-indigo-200 tracking-wide font-sans">
        {label}
      </span>
    </div>
  );
};
