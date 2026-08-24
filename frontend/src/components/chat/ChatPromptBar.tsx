import React, { useState, useRef } from 'react';
import { 
  Paperclip, 
  Send, 
  Loader2, 
  Sparkles, 
  HelpCircle, 
  AlertTriangle,
  Mic,
  Plus
} from 'lucide-react';
import { soundEffects } from '../../utils/audio';
import { QuestionsCategoryModal } from '../modals/QuestionsCategoryModal';

interface AttachedFileState {
  name: string;
  content?: string;
  base64?: string;
  mimeType: string;
  size: number;
}

interface ChatPromptBarProps {
  onSendMessage: (
    message: string,
    attachedFileName?: string,
    attachedFileContent?: string,
    attachedFileBase64?: string,
    attachedFileMimeType?: string,
    attachedFileSize?: number
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
  const recognitionRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');

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
      attachedFile?.size
    );
    setInput('');
    setAttachedFile(null);
    setVideoGuardWarning(null);
    latestTranscriptRef.current = '';
  };

  const startRecording = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      soundEffects.playCaution();
      setVideoGuardWarning('Voice dictation is supported in modern browsers (Chrome, Edge, Safari, Brave).');
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

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setInput(currentTranscript);
          latestTranscriptRef.current = currentTranscript;
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          soundEffects.playCaution();
          setVideoGuardWarning('Microphone access was denied. Please allow microphone permissions in your browser.');
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
            attachedFile?.size
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

  const processFile = (file: File) => {
    setVideoGuardWarning(null);
    const fileNameLower = file.name.toLowerCase();
    
    // Security check: block executables, scripts, and potentially malicious files
    const dangerousExtensions = ['.exe', '.bat', '.sh', '.js', '.vbs', '.cmd', '.scr', '.msi', '.pif', '.application', '.ps1'];
    if (dangerousExtensions.some(ext => fileNameLower.endsWith(ext))) {
      soundEffects.playCaution();
      setVideoGuardWarning('Security Alert: This file type is not allowed.');
      return;
    }

    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.wmv'];

    // Check for video file attempt
    if (videoExtensions.some((ext) => fileNameLower.endsWith(ext)) || file.type.startsWith('video/')) {
      soundEffects.playCaution();
      setVideoGuardWarning('Video analysis is coming soon! Please drop your script, synopsis, treatment, or email for now.');
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      soundEffects.playCaution();
      setVideoGuardWarning('Security Alert: File is too large. Please upload files under 10MB.');
      return;
    }

    const mimeType = file.type || (fileNameLower.endsWith('.pdf') ? 'application/pdf' : 'text/plain');

    if (mimeType.startsWith('image/')) {
      // Image cropping/resizing via Canvas
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const MAX_DIMENSION = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL(mimeType, 0.8);
            const base64Data = dataUrl.split(',')[1];
            setAttachedFile({
              name: file.name,
              base64: base64Data,
              mimeType,
              size: file.size,
            });
            soundEffects.playClick();
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    } else if (mimeType.startsWith('application/pdf')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64Data = result.split(',')[1] || result;
        setAttachedFile({
          name: file.name,
          base64: base64Data,
          mimeType,
          size: file.size,
        });
        soundEffects.playClick();
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setAttachedFile({
          name: file.name,
          content: content || `[Extracted text from ${file.name}]`,
          mimeType,
          size: file.size,
        });
        soundEffects.playClick();
      };
      reader.readAsText(file);
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
        className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl bg-[#0E1124] shadow-2xl transition-all p-2 gap-2"
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
            className="flex items-center justify-center size-10 rounded-xl bg-[#141834] hover:bg-[#1C224B] text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm shrink-0"
          >
            <Plus className="size-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Listening... Speak now..." : "Ask Mission Control, research a festival, or drop a script/treatment PDF..."}
            className={`w-full bg-transparent px-2.5 py-2 text-base text-slate-100 placeholder-slate-400 focus:outline-none ${
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-700 bg-midnight/80 hover:bg-surface text-xs font-mono text-zinc-300 hover:text-white hover:border-blue-500/50 transition-colors cursor-pointer"
          >
            <HelpCircle className="size-3.5 text-blue-400" />
            <span className="hidden sm:inline">what can I ask</span>
            <span className="sm:hidden">help</span>
          </button>

          {/* Microphone Dictate & Auto-Send Button */}
          <button
            type="button"
            onClick={toggleRecording}
            title={isRecording ? "Listening... Click to stop & send" : "Click to speak & auto-send"}
            aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
            className={`flex h-10 items-center justify-center rounded-xl transition-all cursor-pointer shrink-0 ${
              isRecording
                ? 'px-3 gap-1.5 bg-rose-500/20 border border-rose-500/60 text-rose-300 shadow-md shadow-rose-950 animate-pulse'
                : 'w-10 bg-midnight/80 hover:bg-[#141A3B] border border-zinc-700 hover:border-indigo-500/50 text-zinc-300 hover:text-white'
            }`}
          >
            {isRecording ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <Mic className="size-4 text-rose-400" />
              </>
            ) : (
              <Mic className="size-4 text-zinc-400 hover:text-indigo-300" />
            )}
          </button>

          {/* Airplane Send Button */}
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !attachedFile)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2018E6] hover:bg-[#1A13C7] text-white shadow-md shadow-[#2018E6]/30 transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title="Send message"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin text-white" />
            ) : (
              <Send className="size-4 text-white -translate-x-0.5" />
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
