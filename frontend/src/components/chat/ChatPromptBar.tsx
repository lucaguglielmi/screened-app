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
import { CapabilitiesModal } from '../modals/CapabilitiesModal';
import { VoiceDictationModal } from './VoiceDictationModal';
import { AttachedFileState } from '../../hooks/useFileUpload';

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


// Force release microphone hardware lock on iOS Safari

export const ChatPromptBar: React.FC<ChatPromptBarProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachedFileState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [videoGuardWarning, setVideoGuardWarning] = useState<string | null>(null);
  const [isCapabilitiesModalOpen, setIsCapabilitiesModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      soundEffects.playCaution();
      setVideoGuardWarning('File size exceeds 10MB limit.');
      return;
    }
    setVideoGuardWarning(null);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setAttachedFile({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        base64: base64,
        content: undefined,
      });
      soundEffects.playClick();
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !attachedFile) return;

    soundEffects.playClick();
    onSendMessage(
      input.trim(),
      attachedFile?.name,
      attachedFile?.content,
      attachedFile?.base64,
      attachedFile?.mimeType,
      attachedFile?.size,
    );
    setInput('');
    setAttachedFile(null);
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

      <form
        onSubmit={handleSubmit}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl sm:rounded-3xl bg-darkroom-surface shadow-2xl transition-all duration-300 p-2.5 sm:p-4 gap-2 sm:gap-3 border border-zinc-700/50 hover-soft-pulse"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,.txt,.pdf,.doc,.docx,.md,.eml"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFile(e.target.files[0]);
              e.target.value = '';
            }
          }}
        />

        <div className="flex items-center flex-1 min-w-0 gap-1.5 pl-0.5 sm:pl-1">
          <button
            type="button"
            title="Attach a file or photo"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center size-10 sm:size-12 rounded-xl sm:rounded-2xl bg-darkroom-card hover:bg-paper-border hover:bg-darkroom-border text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm shrink-0"
          >
            <Plus className="size-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Ask Mission Control, research a festival, or drop a script/treatment PDF...'
            className='w-full bg-transparent px-2 sm:px-3 py-2 sm:py-3 text-sm sm:text-base md:text-lg text-slate-100 placeholder-slate-400 focus:outline-none'
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setIsCapabilitiesModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 h-10 sm:h-12 rounded-xl sm:rounded-2xl border border-zinc-700 bg-midnight/80 hover:bg-surface text-xs sm:text-sm font-mono text-zinc-300 hover:text-white hover:border-blue-500/50 transition-colors cursor-pointer"
          >
            <HelpCircle className="size-3.5 sm:size-4 text-blue-400" />
            <span className="inline">what can I ask</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setIsVoiceModalOpen(true);
            }}
            title="Click to speak & auto-send"
            aria-label="Start voice recording"
            className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl transition-all cursor-pointer shrink-0 bg-midnight/80 hover:bg-darkroom-card border border-zinc-700 hover:border-indigo-500/50 text-zinc-300 hover:text-white"
          >
            <Mic className="size-4 sm:size-5 text-zinc-400 hover:text-indigo-300" />
          </button>

          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !attachedFile)}
            className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-midnight-royal hover:bg-midnight-royal text-white shadow-md shadow-[var(--color-midnight-royal)]/30 transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title="Send message"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="size-4 sm:size-5 animate-spin text-white" />
            ) : (
              <Send className="size-4 sm:size-5 text-white -translate-x-0.5" />
            )}
          </button>
        </div>
      </form>

      <CapabilitiesModal
        isOpen={isCapabilitiesModalOpen}
        onClose={() => setIsCapabilitiesModalOpen(false)}
        onSelectAction={(promptText) => {
          setInput(promptText);
          onSendMessage(promptText);
        }}
      />
      <VoiceDictationModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSend={(text) => {
          onSendMessage(
            text,
            attachedFile?.name,
            attachedFile?.content,
            attachedFile?.base64,
            attachedFile?.mimeType,
            attachedFile?.size,
          );
          setInput('');
          setAttachedFile(null);
        }}
      />
    </div>
  );
};
