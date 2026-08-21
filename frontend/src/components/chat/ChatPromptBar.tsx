import React, { useState, useRef } from 'react';
import { soundEffects } from '../../utils/audio';

interface ChatPromptBarProps {
  onSendMessage: (message: string, attachedFileName?: string, attachedFileContent?: string) => void;
  isLoading: boolean;
}

export const ChatPromptBar: React.FC<ChatPromptBarProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if ((!trimmed && !attachedFile) || isLoading) return;

    soundEffects.playClick();
    onSendMessage(
      trimmed || `Please review the attached document: ${attachedFile?.name}`,
      attachedFile?.name,
      attachedFile?.content
    );
    setInput('');
    setAttachedFile(null);
  };

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setAttachedFile({
        name: file.name,
        content: content || `[Extracted text from ${file.name}]`,
      });
      soundEffects.playClick();
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      {/* Drag & Drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl border-2 border-dashed border-amber-500 bg-zinc-950/90 backdrop-blur-md">
          <div className="text-center text-amber-400">
            <span className="text-3xl">📄</span>
            <p className="mt-2 text-sm font-semibold">Drop PDF script synopsis or festival email</p>
          </div>
        </div>
      )}

      {/* Attached file chip */}
      {attachedFile && (
        <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs w-fit">
          <span>📎</span>
          <span className="font-medium truncate max-w-xs">{attachedFile.name}</span>
          <button
            type="button"
            onClick={() => setAttachedFile(null)}
            className="ml-1 text-zinc-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Input Form */}
      <form
        onSubmit={handleSubmit}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="relative flex items-center rounded-2xl border border-zinc-700/80 bg-zinc-900/90 shadow-2xl backdrop-blur-xl focus-within:border-amber-500/70 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all p-2"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".txt,.pdf,.doc,.docx,.md"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach script synopsis or festival email"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-amber-400 transition-colors cursor-pointer"
        >
          📎
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask The Producer Desk about a festival, submission strategy, or paste an email..."
          className="w-full bg-transparent px-3 py-2 text-base text-zinc-100 placeholder-zinc-500 focus:outline-none"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (!input.trim() && !attachedFile)}
          className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 text-sm font-semibold text-zinc-950 shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5 text-sm">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
              Thinking...
            </span>
          ) : (
            <>
              <span className="text-sm font-semibold">Send</span>
              <span className="text-zinc-900 font-bold text-base">↵</span>
            </>
          )}
        </button>
      </form>
    </div>

  );
};
