import React, { useRef, useState } from 'react';
import { Search, Coins, UploadCloud } from 'lucide-react';
import {
  ChatMessage,
  DueDiligenceArgs,
  GrantScoutArgs,
  InvitationEmailArgs,
} from '../../types/chat';
import { FestivalIntakeCard } from './tools/FestivalIntakeCard';
import { GrantIntakeCard } from './tools/GrantIntakeCard';
import { InvitationEmailCard } from './tools/InvitationEmailCard';
import { AgentAvatar } from './AgentAvatar';
import { soundEffects } from '../../utils/audio';
import { useFileUpload, AttachedFileState } from '../../hooks/useFileUpload';

const ACTION_TABS = [
  { label: 'Research a festival', icon: Search, query: 'I want to research a film festival' },
  {
    label: 'Find a grant',
    icon: Coins,
    query: 'Help me find film grants and funding opportunities',
  },
];

interface ChatBubbleProps {
  message: ChatMessage;
  onLaunchDueDiligence: (festivalName: string, optionalUrl?: string) => void;
  onLaunchCustomPrompt?: (promptText: string) => void;
  onAvatarClick?: () => void;
  onFileUpload?: (file: AttachedFileState) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  onLaunchDueDiligence,
  onLaunchCustomPrompt,
  onAvatarClick,
  onFileUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { processFile, isProcessing } = useFileUpload({
    onFileProcessed: (file) => {
      setUploadError(null);
      if (onFileUpload) onFileUpload(file);
    },
    onError: (msg) => {
      setUploadError(msg);
    }
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

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
                <li key={iIdx} className="text-sm md:text-base leading-relaxed text-slate-200">
                  {renderFormattedInline(cleaned)}
                </li>
              );
            })}
          </ul>
        );
      }

      return (
        <p key={pIdx} className="text-sm md:text-base leading-relaxed text-slate-200 mb-3 last:mb-0">
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

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex w-full mb-5 md:mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`flex flex-col md:flex-row w-full md:max-w-3xl md:gap-3.5 ${isUser ? 'md:flex-row-reverse' : ''}`}>
        {/* Desktop Avatar (Hidden on Mobile) */}
        <div className="hidden md:block shrink-0 mt-0.5">
          {isUser ? (
            <div className="size-9 rounded-full bg-gradient-to-tr from-darkroom-border to-midnight-violet flex items-center justify-center text-sm font-bold text-white shadow-sm ring-1 ring-midnight-violet">
              👤
            </div>
          ) : (
            <AgentAvatar size="md" onClick={onAvatarClick} />
          )}
        </div>

        {/* Message Content & Mini-UIs */}
        <div className="w-full flex-1 overflow-hidden min-w-0">
          {/* Mobile Header with Avatar on Top */}
          {isUser ? (
            <div className="flex md:hidden items-center justify-end gap-2 mb-2 w-full">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-[11px] text-slate-500 font-mono shrink-0">
                  {formattedTime}
                </span>
                <span className="font-semibold text-xs text-slate-300 font-mono truncate">
                  You
                </span>
              </div>
              <div className="size-7 rounded-full bg-gradient-to-tr from-darkroom-border to-midnight-violet flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-midnight-violet shrink-0">
                👤
              </div>
            </div>
          ) : (
            <div className="flex md:hidden items-center gap-2 mb-2 w-full">
              <AgentAvatar size="sm" onClick={onAvatarClick} />
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="font-semibold text-xs text-slate-200 font-mono truncate">
                  Screened AI
                </span>
                <span className="text-[11px] text-slate-500 font-mono shrink-0">
                  {formattedTime}
                </span>
              </div>
            </div>
          )}

          {/* Desktop Header */}
          <div
            className={`hidden md:flex items-center gap-2 mb-1.5 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <span className="font-semibold text-slate-300 font-mono">
              {isUser ? 'You' : 'Screened AI'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {formattedTime}
            </span>
          </div>

          {/* Text Bubble - Full Width on Mobile */}
          {(message.content.trim() || message.attachedFile) && (
            <div
              className={`w-full rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 text-base leading-relaxed shadow-md ${
                isUser
                  ? 'bg-paper-border bg-darkroom-border text-slate-100 md:rounded-tr-none border border-darkroom-border'
                  : 'bg-darkroom-surface text-slate-200 md:rounded-tl-none border border-darkroom-border'
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
              {message.content.trim() ? formatContent(message.content) : null}
            </div>
          )}

          {/* Quick Action Tabs (Under First Greeting Bubble) - Full Width on Mobile */}
          {message.id === 'initial-greeting-01' && (
            <div className="mt-3.5 space-y-2 w-full">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Quick Actions:
              </span>
              <div className="flex flex-wrap items-center gap-2 w-full">
                {/* Upload Action Pill */}
                <div 
                  className="group relative"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed text-slate-300 hover:text-white transition-all text-xs font-mono cursor-pointer shadow-2xs active:scale-95 ${
                      dragActive 
                        ? 'border-indigo-400 bg-indigo-500/15 text-indigo-200 shadow-indigo-500/20 shadow-md' 
                        : 'border-slate-500/50 hover:border-indigo-400/80 bg-darkroom-card/50 hover:bg-darkroom-surface'
                    }`}
                  >
                    <UploadCloud className={`size-3.5 shrink-0 ${dragActive ? 'text-indigo-400 animate-bounce' : 'text-slate-400 group-hover:text-indigo-300'}`} />
                    <span>{isProcessing ? 'Processing...' : 'Upload or drop document'}</span>
                  </button>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-0 mb-2 w-64 p-3 rounded-xl bg-darkroom-surface border border-indigo-500/40 text-slate-100 text-xs shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                    <div className="font-semibold text-indigo-300 mb-1">
                      Upload Document
                    </div>
                    <p className="text-slate-300 leading-relaxed font-sans text-xs">
                      Start your search by uploading an invitation email, festival prospectus, or notes.
                    </p>
                  </div>
                </div>

                {/* Primary Action Pills */}
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-darkroom-card hover:bg-darkroom-surface border border-darkroom-border hover:border-slate-600 text-slate-300 hover:text-white transition-all text-xs font-mono cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Icon className="size-3.5 text-slate-400 group-hover:text-white shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              {uploadError && (
                <div className="text-xs text-rose-400 mt-1 animate-pulse">
                  {uploadError}
                </div>
              )}
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
                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-paper-border bg-darkroom-border hover:bg-midnight-royal border border-midnight-violet hover:border-tool-ocean text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm cursor-pointer hover:shadow-indigo-500/20 text-left"
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
                  args={message.toolCall.args as unknown as DueDiligenceArgs}
                  onLaunch={onLaunchDueDiligence}
                />
              )}

              {message.toolCall.toolName === 'configure_grant_scout' && (
                <GrantIntakeCard
                  args={message.toolCall.args as unknown as GrantScoutArgs}
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
                  args={message.toolCall.args as unknown as InvitationEmailArgs}
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
