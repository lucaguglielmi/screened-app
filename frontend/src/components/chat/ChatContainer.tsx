import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatStreamEvent, ChatToolCall } from '../../types/chat';
import { FilmProfile } from '../../types/investigation';
import { ChatBubble } from './ChatBubble';
import { ChatPromptBar } from './ChatPromptBar';
import { motion } from 'motion/react';
import { ScrambleText } from '../animations/ScrambleText';
import { AgentThinkingPill } from './AgentThinkingPill';
import { CapabilitiesModal } from '../modals/CapabilitiesModal';
import { AboutScreenedModal } from '../modals/AboutScreenedModal';
import { FeedbackModal } from '../modals/FeedbackModal';
import { soundEffects } from '../../utils/audio';
import { piiVault } from '../../utils/pii';
import { TextLink } from '../ui/TextLink';
import { MessageSquare } from 'lucide-react';

interface ChatContainerProps {
  onLaunchDueDiligence: (festivalName: string, optionalUrl?: string) => void;
  onLaunchOpportunityScout: (profile: FilmProfile) => void;
  onNavigateToPlaygroundFeedback?: () => void;
  onOpenKeyboardHelp?: () => void;
}

const INITIAL_HARDCODED_MESSAGE: ChatMessage = {
  id: 'initial-greeting-01',
  role: 'assistant',
  content:
    'Cinema Due Diligence Desk online. Enter a festival name to investigate, request a grant/funding scan, or drop an invitation email.',
  timestamp: new Date().toISOString(),
};

export const ChatContainer: React.FC<ChatContainerProps> = ({
  onLaunchDueDiligence,
  onLaunchOpportunityScout,
  onNavigateToPlaygroundFeedback,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_HARDCODED_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null);
  const [isCapabilitiesModalOpen, setIsCapabilitiesModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinkingMessage]);

  const handleSendMessage = async (
    userText: string,
    attachedFileName?: string,
    attachedFileContent?: string,
    attachedFileBase64?: string,
    attachedFileMimeType?: string,
    attachedFileSize?: number,
  ) => {
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: userText,
      attachedFile: attachedFileName
        ? {
            name: attachedFileName,
            content: attachedFileContent,
            base64: attachedFileBase64,
            mimeType: attachedFileMimeType,
            size: attachedFileSize,
          }
        : undefined,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);
    setThinkingMessage(
      attachedFileName
        ? `Cinema Due Diligence Desk is analyzing attached file '${attachedFileName}'...`
        : 'Cinema Due Diligence Desk is evaluating your request...',
    );

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: piiVault.mask(userText),
          conversationHistory: messages,
          attachedFileName,
          attachedFileContent,
          attachedFileBase64,
          attachedFileMimeType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('ReadableStream not supported on response body');
      }

      let assistantContent = '';
      let detectedToolCall: ChatToolCall | undefined = undefined;
      let detectedFollowUpProbe: any = undefined;
      const assistantMsgId = String(Date.now() + 1);

      // Create placeholder assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        },
      ]);

      setThinkingMessage(null);

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const event: ChatStreamEvent = JSON.parse(trimmed.slice(6));
              if (event.type === 'TOKEN' && event.token) {
                assistantContent += event.token;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          content: piiVault.unmask(assistantContent),
                          toolCall: detectedToolCall,
                          followUpProbe: detectedFollowUpProbe,
                        }
                      : msg,
                  ),
                );
              } else if (event.type === 'TOOL_CALL' && event.toolCall) {
                detectedToolCall = event.toolCall;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          content: assistantContent,
                          toolCall: detectedToolCall,
                          followUpProbe: detectedFollowUpProbe,
                        }
                      : msg,
                  ),
                );
                soundEffects.playSuccess();
              } else if (event.type === 'FOLLOW_UP_PROBE' && event.followUpProbe) {
                detectedFollowUpProbe = event.followUpProbe;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          content: assistantContent,
                          toolCall: detectedToolCall,
                          followUpProbe: detectedFollowUpProbe,
                        }
                      : msg,
                  ),
                );
              } else if (event.type === 'THINKING' && event.message) {
                setThinkingMessage(event.message);
              }
            } catch (err) {
              console.warn('Failed to parse SSE event:', err);
            }
          }
        }
      }

      soundEffects.playSuccess();
    } catch (error) {
      console.error('Chat stream failed:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 2),
          role: 'assistant',
          content:
            '⚠️ An error occurred while communicating with the Cinema Due Diligence Desk. Please ensure your backend is active.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setThinkingMessage(null);
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-5.5rem)] max-w-5xl mx-auto px-4 py-2 overflow-hidden">
      {/* Hero Header Area with Dirty Film Celluloid Glitch, Spacing & What Does It Do Link */}
      <div className="relative z-10 flex flex-col items-center justify-center my-5 sm:my-7 py-2 text-center select-none">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0, scale: [1, 1.02, 1] }}
          transition={{ 
            opacity: { duration: 0.8 },
            y: { duration: 0.8, ease: "easeOut" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 } 
          }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white font-serif mb-3 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 cursor-default"
        >
          <span className="animate-cinema-glitch text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-stone-200 to-zinc-300">
            Cinema
          </span>
          <ScrambleText text="Due diligence" className="text-zinc-100" />
        </motion.h1>
        <TextLink
          variant="primary"
          size="xs"
          iconType="help"
          animatedIconContinuous
          asButton
          onActionClick={() => setIsCapabilitiesModalOpen(true)}
          className="text-xs sm:text-sm tracking-wide"
        >
          What does it do?
        </TextLink>
      </div>

      {/* Scrollable Message Area */}
      <div className="relative z-10 flex-1 overflow-y-auto pr-2 space-y-4">
        <div className="pt-1">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              onLaunchDueDiligence={onLaunchDueDiligence}
              onLaunchOpportunityScout={onLaunchOpportunityScout}
              onLaunchCustomPrompt={handleSendMessage}
              onAvatarClick={() => {
                soundEffects.playClick();
                setIsAboutModalOpen(true);
              }}
            />
          ))}
          {thinkingMessage && <AgentThinkingPill label={thinkingMessage} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Persistent Bottom Prompt Bar with Action Pills */}
      <div className="relative z-10 pt-2 pb-1 mt-1">
        <ChatPromptBar onSendMessage={handleSendMessage} isLoading={isLoading} />

        {/* Centered Filmmaker Feedback Link */}
        <div className="flex items-center justify-center text-[11px] font-mono text-slate-500 pt-2 pb-0.5 select-none">
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setIsFeedbackModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer hover:underline"
          >
            <MessageSquare className="size-3 text-indigo-400" />
            <span>leave feedback</span>
          </button>
        </div>
      </div>

      {/* Capabilities Modal ("What does it do?") */}
      <CapabilitiesModal
        isOpen={isCapabilitiesModalOpen}
        onClose={() => setIsCapabilitiesModalOpen(false)}
        onSelectAction={(prompt) => handleSendMessage(prompt)}
      />

      {/* About Screened Modal (Triggered by Avatar Click) */}
      <AboutScreenedModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onNavigateToDiligence={() => onLaunchDueDiligence('Aldergate Film Festival (Test Entity)')}
      />

      {/* Filmmaker Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onViewFeedbackLog={onNavigateToPlaygroundFeedback}
      />
    </div>
  );
};
