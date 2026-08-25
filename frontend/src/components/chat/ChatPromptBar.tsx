import React, { useState, useRef } from 'react';
import {
  Paperclip,
  Send,
  Loader2,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Mic,
  Plus,
} from 'lucide-react';
import { soundEffects } from '../../utils/audio';
import { QuestionsCategoryModal } from '../modals/QuestionsCategoryModal';
import { useFileUpload, AttachedFileState } from '../../hooks/useFileUpload';

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface ChatPromptBarProps {
  onSendMessage: (
    message: string,
    attachedFileName?: string,
    attachedFileContent?: string,
    attachedFileBase64?: string,
    attachedFileMimeType?: string,
    attachedFileSize?: number,
  ) => void;
  isLoading: boolean;
}

export const ChatPromptBar: React.FC<ChatPromptBarProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachedFileState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [videoGuardWarning, setVideoGuardWarning] = useState<string | null>(null);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const latestTranscriptRef = useRef<string>('');

  const { processFile } = useFileUpload({
    onFileProcessed: (fileData) => {
      setAttachedFile(fileData);
    },
    onError: (msg) => {
      setVideoGuardWarning(msg);
    }
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if ((!trimmed && !attachedFile) || isLoading) return;

    soundEffects.playClick();
    onSendMessage(
      trimmed || `Please review the attached document: ${attachedFile?.name}`,
      attachedFile?.name,
      attachedFile?.content,
      attachedFile?.base64,
      attachedFile?.mimeType,
      attachedFile?.size,
    );
    setInput('');
    setAttachedFile(null);
    setVideoGuardWarning(null);
    latestTranscriptRef.current = '';
  };

  const startRecording = () => {
    const win = typeof window !== 'undefined' ? (window as unknown as WindowWithSpeech) : null;
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      soundEffects.playCaution();
      setVideoGuardWarning(
        'Voice dictation is supported in modern browsers (Chrome, Edge, Safari, Brave).',
      );
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;

      latestTranscriptRef.current = '';

      recognition.onstart = () => {
        setIsRecording(true);
        soundEffects.playClick();
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setInput(currentTranscript);
          latestTranscriptRef.current = currentTranscript;
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          soundEffects.playCaution();
          setVideoGuardWarning(
            'Microphone access was denied. Please allow microphone permissions in your browser.',
          );
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        const textToSend = latestTranscriptRef.current.trim();
        if (textToSend) {
          soundEffects.playClick();
          onSendMessage(
            textToSend,
            attachedFile?.name,
            attachedFile?.content,
            attachedFile?.base64,
            attachedFile?.mimeType,
            attachedFile?.size,
          );
          setInput('');
          setAttachedFile(null);
          latestTranscriptRef.current = '';
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
      }
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative space-y-2">
      {/* Drag & Drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl border-2 border-dashed border-midnight-royal bg-darkroom-bg/95 backdrop-blur-md">
          <div className="text-center text-indigo-300">
            <Sparkles className="size-8 mx-auto text-midnight-royal animate-bounce" />
            <p className="mt-2 text-base font-semibold">
              Drop PDF synopsis, treatment, or festival email
            </p>
          </div>
        </div>
      )}

      {/* Video Guard Warning Toast */}
      {videoGuardWarning && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="size-4 text-amber-400 shrink-0" />
            <span>{videoGuardWarning}</span>
          </div>
          <button
            type="button"
            onClick={() => setVideoGuardWarning(null)}
            className="text-amber-400 hover:text-white ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Attached file chip */}
      {attachedFile && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm w-fit">
          <Paperclip className="size-4 text-indigo-400" />
          <span className="font-medium truncate max-w-xs">{attachedFile.name}</span>
          <button
            type="button"
            onClick={() => setAttachedFile(null)}
            className="ml-1 text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Input Form */}
      <form
        onSubmit={handleSubmit}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-3xl bg-darkroom-surface shadow-2xl transition-all duration-300 p-3 sm:p-4 gap-3 border border-zinc-700/50 hover-soft-pulse"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,.txt,.pdf,.doc,.docx,.md,.eml"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFile(e.target.files[0]);
              e.target.value = ''; // reset
            }
          }}
        />

        <div className="flex items-center flex-1 min-w-0 gap-1.5 pl-1">
          {/* Prominent Document Upload Button */}
          <button
            type="button"
            title="Attach a file or photo"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center size-12 rounded-2xl bg-darkroom-card hover:bg-paper-border hover:bg-darkroom-border text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm shrink-0"
          >
            <Plus className="size-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isRecording
                ? 'Listening... Speak now...'
                : 'Ask Mission Control, research a festival, or drop a script/treatment PDF...'
            }
            className={`w-full bg-transparent px-3 py-3 text-base sm:text-lg text-slate-100 placeholder-slate-400 focus:outline-none ${
              isRecording ? 'placeholder-rose-300 animate-pulse' : ''
            }`}
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {/* Outline Button: What Can I Ask */}
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setIsQuestionsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-3 h-12 rounded-2xl border border-zinc-700 bg-midnight/80 hover:bg-surface text-sm font-mono text-zinc-300 hover:text-white hover:border-blue-500/50 transition-colors cursor-pointer"
          >
            <HelpCircle className="size-4 text-blue-400" />
            <span className="hidden sm:inline">what can I ask</span>
            <span className="sm:hidden">help</span>
          </button>

          {/* Microphone Dictate & Auto-Send Button */}
          <button
            type="button"
            onClick={toggleRecording}
            title={isRecording ? 'Listening... Click to stop & send' : 'Click to speak & auto-send'}
            aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
            className={`flex h-12 items-center justify-center rounded-2xl transition-all cursor-pointer shrink-0 ${
              isRecording
                ? 'px-4 gap-2 bg-rose-500/20 border border-rose-500/60 text-rose-300 shadow-md shadow-rose-950 animate-pulse'
                : 'w-12 bg-midnight/80 hover:bg-darkroom-card border border-zinc-700 hover:border-indigo-500/50 text-zinc-300 hover:text-white'
            }`}
          >
            {isRecording ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <Mic className="size-5 text-rose-400" />
              </>
            ) : (
              <Mic className="size-5 text-zinc-400 hover:text-indigo-300" />
            )}
          </button>

          {/* Airplane Send Button */}
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !attachedFile)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-midnight-royal hover:bg-midnight-royal text-white shadow-md shadow-[var(--color-midnight-royal)]/30 transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title="Send message"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin text-white" />
            ) : (
              <Send className="size-5 text-white -translate-x-0.5" />
            )}
          </button>
        </div>
      </form>

      {/* What Can I Ask Modal */}
      <QuestionsCategoryModal
        isOpen={isQuestionsModalOpen}
        onClose={() => setIsQuestionsModalOpen(false)}
        onSelectQuestion={(q) => {
          setInput(q);
          onSendMessage(q);
        }}
      />
    </div>
  );
};
