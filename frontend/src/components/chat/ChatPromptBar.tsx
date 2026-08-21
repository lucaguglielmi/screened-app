import React, { useState, useRef } from 'react';
import { Paperclip, ArrowUp, Loader2, Sparkles } from 'lucide-react';
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
        <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl border-2 border-dashed border-[#2018E6] bg-[#070913]/95 backdrop-blur-md">
          <div className="text-center text-indigo-300">
            <Sparkles className="size-8 mx-auto text-[#2018E6] animate-bounce" />
            <p className="mt-2 text-base font-semibold">Drop PDF script synopsis or festival email</p>
          </div>
        </div>
      )}

      {/* Attached file chip */}
      {attachedFile && (
        <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm w-fit">
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
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="relative flex items-center rounded-2xl border border-[#22274C] bg-[#0E1124]/95 shadow-2xl backdrop-blur-xl focus-within:border-[#2018E6]/80 focus-within:ring-2 focus-within:ring-[#2018E6]/20 transition-all p-2 gap-2"
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
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-[#151936] hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <Paperclip className="size-5" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask The Producer Desk about a festival, submission strategy, or paste an email..."
          className="w-full bg-transparent px-3 py-2 text-base text-slate-100 placeholder-slate-400 focus:outline-none"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (!input.trim() && !attachedFile)}
          className="flex h-11 items-center gap-2 rounded-xl bg-[#2018E6] hover:bg-[#1A13C7] px-5 text-base font-semibold text-white shadow-md shadow-[#2018E6]/30 transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-base">
              <Loader2 className="size-4 animate-spin text-white" />
              <span>Thinking...</span>
            </span>
          ) : (
            <>
              <span className="text-base font-semibold">Send</span>
              <ArrowUp className="size-4 text-white" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
