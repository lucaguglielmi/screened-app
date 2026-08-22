import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatStreamEvent, ChatToolCall } from '../../types/chat';
import { FilmProfile } from '../../types/investigation';
import { ChatBubble } from './ChatBubble';
import { ChatPromptBar } from './ChatPromptBar';
import { AgentThinkingPill } from './AgentThinkingPill';
import { VectorFieldBackground } from '../animations/VectorFieldBackground';
import { CapabilitiesModal } from '../modals/CapabilitiesModal';
import { soundEffects } from '../../utils/audio';
import { HelpCircle } from 'lucide-react';

interface ChatContainerProps {
  onLaunchDueDiligence: (festivalName: string, optionalUrl?: string) => void;
  onLaunchOpportunityScout: (profile: FilmProfile) => void;
}

const INITIAL_HARDCODED_MESSAGE: ChatMessage = {
  id: 'initial-greeting-01',
  role: 'assistant',
  content: 'Cinema Due Diligence Desk online. Enter a festival name to investigate, request a grant/funding scan, or drop an invitation email.',
  timestamp: new Date().toISOString(),
};

export const ChatContainer: React.FC<ChatContainerProps> = ({
  onLaunchDueDiligence,
  onLaunchOpportunityScout,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_HARDCODED_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null);
  const [isCapabilitiesModalOpen, setIsCapabilitiesModalOpen] = useState(false);
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
    attachedFileContent?: string
  ) => {
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);
    setThinkingMessage('Cinema Due Diligence Desk is evaluating your request...');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversationHistory: messages,
          attachedFileName,
          attachedFileContent,
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
                      ? { ...msg, content: assistantContent, toolCall: detectedToolCall, followUpProbe: detectedFollowUpProbe }
                      : msg
                  )
                );
              } else if (event.type === 'TOOL_CALL' && event.toolCall) {
                detectedToolCall = event.toolCall;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: assistantContent, toolCall: detectedToolCall, followUpProbe: detectedFollowUpProbe }
                      : msg
                  )
                );
                soundEffects.playSuccess();
              } else if (event.type === 'FOLLOW_UP_PROBE' && event.followUpProbe) {
                detectedFollowUpProbe = event.followUpProbe;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: assistantContent, toolCall: detectedToolCall, followUpProbe: detectedFollowUpProbe }
                      : msg
                  )
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
      {/* Animated Subtle Droplet Vector Field Background */}
      <VectorFieldBackground
        color="#E11D48"
        speed={0.45}
        amplitude={0.16}
        gridSpacing={34}
        dropletLength={9}
        opacity={0.18}
      />

      {/* Hero Header Area */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-2 pb-3 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-serif mb-1">
          Cinema Due diligence
        </h1>
        <button
          type="button"
          onClick={() => {
            soundEffects.playClick();
            setIsCapabilitiesModalOpen(true);
          }}
          className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-500/40 hover:decoration-blue-400 font-mono transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>what can you search?</span>
        </button>
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
            />
          ))}
          {thinkingMessage && <AgentThinkingPill label={thinkingMessage} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Persistent Bottom Prompt Bar with Action Pills */}
      <div className="relative z-10 pt-2 pb-2 border-t border-zinc-800/80 mt-1">
        <ChatPromptBar
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Fullscreen / Immersive Capabilities Modal */}
      <CapabilitiesModal
        isOpen={isCapabilitiesModalOpen}
        onClose={() => setIsCapabilitiesModalOpen(false)}
        onSelectAction={(prompt) => handleSendMessage(prompt)}
      />
    </div>
  );
};
