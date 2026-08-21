import React from 'react';
import { ChatMessage } from '../../types/chat';
import { FilmProfile } from '../../types/investigation';
import { MiniDueDiligence } from './mini_apps/MiniDueDiligence';
import { MiniScoutCard } from './mini_apps/MiniScoutCard';
import { MiniCompareArena } from './mini_apps/MiniCompareArena';
import { AgentAvatar } from './AgentAvatar';

interface ChatBubbleProps {
  message: ChatMessage;
  onLaunchDueDiligence: (festivalName: string, optionalUrl?: string) => void;
  onLaunchOpportunityScout: (profile: FilmProfile) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  onLaunchDueDiligence,
  onLaunchOpportunityScout,
}) => {
  const isUser = message.role === 'user';

  // Format markdown snippets safely (bold, lists, code)
  const formatContent = (text: string) => {
    return text.split('\n\n').map((paragraph, pIdx) => {
      // Check for bullet lists
      if (paragraph.startsWith('- ') || paragraph.startsWith('* ') || /^\d+\.\s/.test(paragraph)) {
        const items = paragraph.split('\n');
        return (
          <ul key={pIdx} className="my-2 space-y-2 pl-5 list-disc marker:text-indigo-400">
            {items.map((item, iIdx) => {
              const cleaned = item.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
              return (
                <li key={iIdx} className="text-base leading-relaxed text-slate-200">
                  {renderFormattedInline(cleaned)}
                </li>
              );
            })}
          </ul>
        );
      }

      return (
        <p key={pIdx} className="text-base leading-relaxed text-slate-200 mb-3 last:mb-0">
          {renderFormattedInline(paragraph)}
        </p>
      );
    });
  };

  const renderFormattedInline = (inlineText: string) => {
    // Basic bold **text** parsing
    const parts = inlineText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`flex gap-3.5 max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="size-9 rounded-full bg-gradient-to-tr from-[#1E234B] to-[#2E3672] flex items-center justify-center text-sm font-bold text-white shadow-sm ring-1 ring-[#3D4791]">
              👤
            </div>
          ) : (
            <AgentAvatar size="md" />
          )}
        </div>

        {/* Message Content & Mini-UIs */}
        <div className="flex-1 overflow-hidden">
          {/* Header */}
          <div className={`flex items-center gap-2 mb-1.5 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="font-semibold text-slate-300 font-mono">
              {isUser ? 'You' : 'The Producer Desk'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Text Bubble */}
          <div
            className={`rounded-2xl px-5 py-4 text-base leading-relaxed shadow-md ${
              isUser
                ? 'bg-[#1A1F45] text-slate-100 rounded-tr-none border border-[#2B346E]'
                : 'bg-[#0E1124]/95 text-slate-200 rounded-tl-none border border-[#22274C] backdrop-blur-md'
            }`}
          >
            {formatContent(message.content)}
          </div>

          {/* Embedded Mini-UI if tool call present */}
          {message.toolCall && (
            <div className="mt-3">
              {message.toolCall.toolName === 'configure_due_diligence' && (
                <MiniDueDiligence
                  args={message.toolCall.args as any}
                  onLaunch={onLaunchDueDiligence}
                />
              )}

              {message.toolCall.toolName === 'configure_opportunity_scout' && (
                <MiniScoutCard
                  args={message.toolCall.args as any}
                  onLaunch={onLaunchOpportunityScout}
                />
              )}

              {message.toolCall.toolName === 'compare_festivals_arena' && (
                <MiniCompareArena
                  args={message.toolCall.args as any}
                  onSelectFestival={(name) => onLaunchDueDiligence(name)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
