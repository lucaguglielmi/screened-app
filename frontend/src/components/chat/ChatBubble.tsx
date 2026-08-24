import React from 'react';
import { Search, Coins, MailWarning, GitCompare, Compass } from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import { FilmProfile } from '../../types/investigation';
import { MiniScoutCard } from './mini_apps/MiniScoutCard';
import { MiniCompareArena } from './mini_apps/MiniCompareArena';
import { FestivalIntakeCard } from './tools/FestivalIntakeCard';
import { GrantIntakeCard } from './tools/GrantIntakeCard';
import { InvitationEmailCard } from './tools/InvitationEmailCard';
import { AgentAvatar } from './AgentAvatar';
import { soundEffects } from '../../utils/audio';

const ACTION_TABS = [
  { label: 'Research a festival', icon: Search, query: 'I want to research a film festival' },
  {
    label: 'Find a grant',
    icon: Coins,
    query: 'Help me find film grants and funding opportunities',
  },
  {
    label: 'Analyze an invitation',
    icon: MailWarning,
    query: 'I received a festival invitation email I want to analyze',
  },
  { label: 'Compare festivals', icon: GitCompare, query: 'I want to compare two film festivals' },
  {
    label: 'Scout strategy',
    icon: Compass,
    query: 'Help me plan a festival submission strategy for my film',
  },
];

interface ChatBubbleProps {
  message: ChatMessage;
  onLaunchDueDiligence: (festivalName: string, optionalUrl?: string) => void;
  onLaunchOpportunityScout: (profile: FilmProfile) => void;
  onLaunchCustomPrompt?: (promptText: string) => void;
  onAvatarClick?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  onLaunchDueDiligence,
  onLaunchOpportunityScout,
  onLaunchCustomPrompt,
  onAvatarClick,
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
            <div className="size-9 rounded-full bg-gradient-to-tr from-darkroom-border to-midnight-violet flex items-center justify-center text-sm font-bold text-white shadow-sm ring-1 ring-midnight-violet">
              👤
            </div>
          ) : (
            <AgentAvatar size="md" onClick={onAvatarClick} />
          )}
        </div>

        {/* Message Content & Mini-UIs */}
        <div className="flex-1 overflow-hidden">
          {/* Header */}
          <div
            className={`flex items-center gap-2 mb-1.5 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <span className="font-semibold text-slate-300 font-mono">
              {isUser ? 'You' : 'The Producer Desk'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Text Bubble */}
          <div
            className={`rounded-2xl px-5 py-4 text-base leading-relaxed shadow-md ${
              isUser
                ? 'bg-darkroom-border text-slate-100 rounded-tr-none border border-darkroom-border'
                : 'bg-darkroom-surface text-slate-200 rounded-tl-none border border-darkroom-border'
            }`}
          >
            {message.attachedFile && (
              <div className="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono w-fit">
                <span>📎</span>
                <span className="font-semibold">{message.attachedFile.name}</span>
                {message.attachedFile.size && (
                  <span className="text-slate-400">
                    ({Math.round(message.attachedFile.size / 1024)} KB)
                  </span>
                )}
              </div>
            )}
            {formatContent(message.content)}
          </div>

          {/* Quick Action Tabs (Under First Greeting Bubble) */}
          {message.id === 'initial-greeting-01' && (
            <div className="mt-3 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Quick Actions:
              </span>
              <div className="flex flex-wrap gap-2">
                {ACTION_TABS.map((tab, idx) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        if (onLaunchCustomPrompt) {
                          onLaunchCustomPrompt(tab.query);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-darkroom-card hover:bg-midnight-royal border border-darkroom-border text-slate-300 hover:text-white transition-all text-xs font-mono cursor-pointer shadow-sm active:scale-95"
                    >
                      <Icon className="size-3.5 text-indigo-400 group-hover:text-white shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Follow-Up Probes */}
          {message.followUpProbe && message.followUpProbe.options.length > 0 && (
            <div className="mt-3 p-3.5 rounded-xl bg-darkroom-card border border-darkroom-border space-y-2.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                <span>✦</span>
                <span>{message.followUpProbe.question}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {message.followUpProbe.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      if (onLaunchCustomPrompt) {
                        onLaunchCustomPrompt(opt.promptText);
                      }
                    }}
                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-darkroom-border hover:bg-midnight-royal border border-midnight-violet hover:border-tool-ocean text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm cursor-pointer hover:shadow-indigo-500/20 text-left"
                  >
                    {opt.badge && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 group-hover:bg-white/20 text-[10px] font-mono text-indigo-300 group-hover:text-white">
                        {opt.badge}
                      </span>
                    )}
                    <span>{opt.label}</span>
                    <span className="text-slate-400 group-hover:text-white ml-0.5 font-mono text-xs">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Embedded Mini-UI if tool call present */}
          {message.toolCall && (
            <div className="mt-3">
              {message.toolCall.toolName === 'configure_due_diligence' && (
                <FestivalIntakeCard
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

              {message.toolCall.toolName === 'configure_grant_scout' && (
                <GrantIntakeCard
                  args={message.toolCall.args as any}
                  onLaunchSearch={(query) => {
                    if (onLaunchCustomPrompt) {
                      onLaunchCustomPrompt(query);
                    } else {
                      onLaunchDueDiligence(query);
                    }
                  }}
                />
              )}

              {message.toolCall.toolName === 'analyze_invitation_email' && (
                <InvitationEmailCard
                  args={message.toolCall.args as any}
                  onLaunchInvestigation={(name) => onLaunchDueDiligence(name)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
