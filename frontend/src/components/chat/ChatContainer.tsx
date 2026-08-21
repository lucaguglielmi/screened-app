import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatStreamEvent, ChatToolCall } from '../../types/chat';
import { FilmProfile } from '../../types/investigation';
import { ChatBubble } from './ChatBubble';
import { ChatPromptBar } from './ChatPromptBar';
import { StarterPromptChips } from './StarterPromptChips';
import { AgentThinkingPill } from './AgentThinkingPill';
import { AgentAvatar } from './AgentAvatar';
import { VectorFieldBackground } from '../animations/VectorFieldBackground';
import { soundEffects } from '../../utils/audio';

interface ChatContainerProps {
  onLaunchDueDiligence: (festivalName: string, optionalUrl?: string) => void;
  onLaunchOpportunityScout: (profile: FilmProfile) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  onLaunchDueDiligence,
  onLaunchOpportunityScout,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null);
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
    setThinkingMessage('The Producer Desk is evaluating your request...');

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
                      ? { ...msg, content: assistantContent, toolCall: detectedToolCall }
                      : msg
                  )
                );
              } else if (event.type === 'TOOL_CALL' && event.toolCall) {
                detectedToolCall = event.toolCall;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: assistantContent, toolCall: detectedToolCall }
                      : msg
                  )
                );
                soundEffects.playSuccess();
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
            '⚠️ An error occurred while communicating with The Producer Desk. Please ensure your backend is active.',
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

      {/* Scrollable Message Area */}
      <div className="relative z-10 flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center pt-8">
            <div className="mb-4 animate-fade-in">
              <AgentAvatar size="xl" isThinking={isLoading} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-3 font-serif">
              The Producer Desk
            </h1>
            <p className="max-w-xl text-base text-slate-300 leading-relaxed mb-6 font-sans">
              Your autonomous cinema intelligence executive. Ask for due diligence vetting on any film festival,
              map out qualifying festival submission strategies for your slate, or drop an acceptance email for instant analysis.
            </p>

            <div className="w-full">
              <ChatPromptBar
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
              <StarterPromptChips onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
            </div>
          </div>
        ) : (
          <div className="pt-2">
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                onLaunchDueDiligence={onLaunchDueDiligence}
                onLaunchOpportunityScout={onLaunchOpportunityScout}
              />
            ))}
            {thinkingMessage && <AgentThinkingPill label={thinkingMessage} />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Persistent Bottom Prompt Bar when messages exist */}
      {messages.length > 0 && (
        <div className="pt-3 pb-2 border-t border-zinc-800/80 mt-2">
          <ChatPromptBar
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};
