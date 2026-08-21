import React from 'react';
import { ChatMessage } from '../../types/chat';
import { FilmProfile } from '../../types/investigation';
import { MiniDueDiligence } from './mini_apps/MiniDueDiligence';
import { MiniScoutCard } from './mini_apps/MiniScoutCard';
import { MiniCompareArena } from './mini_apps/MiniCompareArena';

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
          <ul key={pIdx} className="my-2 space-y-1.5 pl-5 list-disc marker:text-amber-500/70">
            {items.map((item, iIdx) => {
              const cleaned = item.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
              return (
                <li key={iIdx} className="text-base leading-relaxed text-zinc-300">
                  {renderFormattedInline(cleaned)}
                </li>
              );
            })}
          </ul>
        );
      }

      return (
        <p key={pIdx} className="text-base leading-relaxed text-zinc-200 mb-3 last:mb-0">
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
          <strong key={idx} className="font-semibold text-amber-300">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex w-full mb-5 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`flex gap-3.5 max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          {isUser ? (
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-sm font-bold text-white shadow-sm ring-1 ring-zinc-500">
              👤
            </div>
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-base shadow-md ring-1 ring-amber-400">
              🎬
            </div>
          )}
        </div>

        {/* Message Content & Mini-UIs */}
        <div className="flex-1 overflow-hidden">
          {/* Header */}
          <div className={`flex items-center gap-2 mb-1.5 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="font-medium text-zinc-400">
              {isUser ? 'You' : 'The Producer Desk'}
            </span>
            <span className="text-[11px] text-zinc-500">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Text Bubble */}
          <div
            className={`rounded-2xl px-5 py-3.5 text-base shadow-sm ${
              isUser
                ? 'bg-zinc-800 text-zinc-100 rounded-tr-none border border-zinc-700/60'
                : 'bg-zinc-900/90 text-zinc-200 rounded-tl-none border border-zinc-800/90 backdrop-blur-md'
            }`}
          >
            {formatContent(message.content)}
          </div>


          {/* Embedded Mini-UI if tool call present */}
          {message.toolCall && (
            <div className="mt-2">
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
