import React, { useState, useRef } from 'react';
import { 
  Paperclip, 
  ArrowUp, 
  Loader2, 
  Sparkles, 
  HelpCircle, 
  AlertTriangle,
  Search,
  Coins,
  MailWarning,
  GitCompare,
  Compass
} from 'lucide-react';
import { soundEffects } from '../../utils/audio';
import { QuestionsCategoryModal } from '../modals/QuestionsCategoryModal';

interface ChatPromptBarProps {
  onSendMessage: (message: string, attachedFileName?: string, attachedFileContent?: string) => void;
  isLoading: boolean;
}

export const ChatPromptBar: React.FC<ChatPromptBarProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [videoGuardWarning, setVideoGuardWarning] = useState<string | null>(null);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    setVideoGuardWarning(null);
  };

  const handleActionPillClick = (pillQuery: string) => {
    soundEffects.playClick();
    onSendMessage(pillQuery);
  };

  const processFile = (file: File) => {
    setVideoGuardWarning(null);
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.wmv'];
    const fileNameLower = file.name.toLowerCase();

    // Check for video file attempt
    if (videoExtensions.some((ext) => fileNameLower.endsWith(ext)) || file.type.startsWith('video/')) {
      soundEffects.playCaution();
      setVideoGuardWarning('Video analysis is coming soon! Please drop your script, synopsis, treatment, or email for now.');
      return;
    }

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
      processFile(e.dataTransfer.files[0]);
    }
  };

  const actionPills = [
    { label: 'Research a festival', icon: Search, query: 'Is Aldergate Film Festival legitimate?' },
    { label: 'Find a grant', icon: Coins, query: 'Find £25k documentary production grants in the UK' },
    { label: 'Analyze an invitation', icon: MailWarning, query: 'Analyze this festival invitation email offering a 50% waiver' },
    { label: 'Compare festivals', icon: GitCompare, query: 'Compare Raindance vs Leeds International Film Festival' },
    { label: 'Scout strategy', icon: Compass, query: 'I have a 15-min sci-fi short looking for a UK premiere on a £200 budget' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto relative space-y-2.5">
      {/* Drag & Drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl border-2 border-dashed border-[#2018E6] bg-[#070913]/95 backdrop-blur-md">
          <div className="text-center text-indigo-300">
            <Sparkles className="size-8 mx-auto text-[#2018E6] animate-bounce" />
            <p className="mt-2 text-base font-semibold">Drop PDF synopsis, treatment, or festival email</p>
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
            className="text-amber-400 hover:text-white ml-2"
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
        className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl border border-[#22274C] bg-[#0E1124]/95 shadow-2xl backdrop-blur-xl focus-within:border-[#2018E6]/80 focus-within:ring-2 focus-within:ring-[#2018E6]/20 transition-all p-2 gap-2"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".txt,.pdf,.doc,.docx,.md,.eml"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex items-center flex-1 min-w-0">
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach script synopsis, treatment, or festival email"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-[#151936] hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <Paperclip className="size-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a festival, grant search, or paste an email..."
            className="w-full bg-transparent px-2.5 py-2 text-base text-slate-100 placeholder-slate-400 focus:outline-none"
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-700 bg-midnight/80 hover:bg-surface text-xs font-mono text-zinc-300 hover:text-white hover:border-blue-500/50 transition-colors"
          >
            <HelpCircle className="size-3.5 text-blue-400" />
            <span>what can I ask</span>
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !attachedFile)}
            className="flex h-10 items-center gap-2 rounded-xl bg-[#2018E6] hover:bg-[#1A13C7] px-4 text-sm font-semibold text-white shadow-md shadow-[#2018E6]/30 transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5 text-xs">
                <Loader2 className="size-3.5 animate-spin text-white" />
                <span>Thinking...</span>
              </span>
            ) : (
              <>
                <span className="text-xs font-semibold">Send</span>
                <ArrowUp className="size-3.5 text-white" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Small Action Pills Beneath the Search Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
        {actionPills.map((pill, idx) => {
          const Icon = pill.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleActionPillClick(pill.query)}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0E1124]/80 border border-zinc-800 hover:border-blue-500/50 hover:bg-[#141731] text-xs text-zinc-300 hover:text-white transition-all font-mono"
            >
              <Icon className="size-3 text-blue-400 shrink-0" />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

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
