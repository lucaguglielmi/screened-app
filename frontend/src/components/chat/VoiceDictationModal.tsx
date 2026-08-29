import React, { useEffect, useState, useRef } from 'react';
import { Mic, Send, X, AlertTriangle } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
}

// Force release microphone hardware lock on iOS Safari
const forceReleaseMicrophone = () => {
  if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(() => {});
  }
};

export const VoiceDictationModal: React.FC<Props> = ({ isOpen, onClose, onSend }) => {
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Timer state
  const [lastSpeechTime, setLastSpeechTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(3000);
  
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const transcriptRef = useRef('');

  useEffect(() => {
    if (isOpen) {
      startDictation();
    } else {
      stopDictation();
    }
    return () => stopDictation();
  }, [isOpen]);

  // Handle the countdown timer
  useEffect(() => {
    if (!isOpen || lastSpeechTime === null) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastSpeechTime;
      const remaining = Math.max(0, 3000 - elapsed);
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
        handleSend();
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [lastSpeechTime, isOpen]);

  const startDictation = () => {
    setTranscript('');
    setErrorMsg(null);
    setLastSpeechTime(null);
    setTimeLeft(3000);
    transcriptRef.current = '';

    const win = typeof window !== 'undefined' ? (window as any) : null;
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      soundEffects.playCaution();
      setErrorMsg('Voice dictation is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = true; // Essential for ignoring pauses

      recognition.onstart = () => {
        isListeningRef.current = true;
        soundEffects.playClick();
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setTranscript(currentTranscript);
          transcriptRef.current = currentTranscript;
          // User spoke, start/reset the 3s timer!
          setLastSpeechTime(Date.now());
          setTimeLeft(3000);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          soundEffects.playCaution();
          setErrorMsg('Microphone access denied.');
        } else if (event.error !== 'aborted') {
          // If iOS silently aborts it, we don't want to spam errors.
          if (transcriptRef.current) {
             // Let it ride.
          } else {
             setErrorMsg('Microphone disconnected or failed.');
          }
        }
        forceReleaseMicrophone();
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        forceReleaseMicrophone();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setErrorMsg('Failed to initialize microphone.');
    }
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      forceReleaseMicrophone();
    }
    isListeningRef.current = false;
  };

  const handleSend = () => {
    const textToSend = transcriptRef.current.trim();
    if (textToSend) {
      soundEffects.playClick();
      onSend(textToSend);
    }
    onClose();
  };
  
  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  // SVG Circle Progress Math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  // If timer hasn't started (lastSpeechTime is null), strokeDashoffset = circumference (invisible).
  // If timer is running, strokeDashoffset interpolates from circumference down to 0.
  const progress = lastSpeechTime === null ? 0 : 1 - (timeLeft / 3000);
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-3xl bg-darkroom-bg border border-darkroom-border shadow-2xl overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button 
          onClick={handleCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-darkroom-surface rounded-full transition-colors cursor-pointer z-10"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center justify-center text-center mt-2">
          
          <h2 className="text-xl font-bold text-white mb-2 font-serif tracking-tight">
            Voice Dictation
          </h2>
          <p className="text-sm text-slate-400 mb-8 max-w-[250px]">
            {lastSpeechTime === null ? "Listening... Speak whenever you're ready." : "Keep speaking, or wait to send."}
          </p>
          
          {/* Microphone Animation Area */}
          <div className="relative flex items-center justify-center mb-8">
            {/* The SVG Circular Progress Ring */}
            <svg 
              className="absolute pointer-events-none" 
              width="140" 
              height="140" 
              viewBox="0 0 140 140"
            >
              {/* Background Ring */}
              <circle 
                cx="70" cy="70" r={radius} 
                className="stroke-darkroom-surface fill-none" 
                strokeWidth="4" 
              />
              {/* Animated Progress Ring */}
              <circle 
                cx="70" cy="70" r={radius} 
                className="stroke-indigo-500 fill-none transition-all duration-75 origin-center -rotate-90" 
                strokeWidth="6" 
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={lastSpeechTime === null ? circumference : strokeDashoffset}
              />
            </svg>

            {/* Glowing Backdrop when listening */}
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping opacity-75" />

            {/* The Mic Button itself */}
            <button
              onClick={handleSend} // Tapping mic when running can also send early
              className="relative z-10 size-20 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-900/50 cursor-pointer transition-colors"
            >
              <Mic className="size-8" />
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 px-4 py-2 rounded-xl text-sm mb-4">
              <AlertTriangle className="size-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Live Transcript Display */}
          <div className="w-full bg-darkroom-surface rounded-2xl p-4 min-h-[80px] max-h-[150px] overflow-y-auto mb-6 border border-darkroom-border">
            {transcript ? (
              <p className="text-sm text-slate-200 text-left leading-relaxed">
                {transcript}
              </p>
            ) : (
              <p className="text-sm text-slate-500 italic">
                ...
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="w-full flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-slate-400 bg-darkroom-surface hover:bg-darkroom-card hover:text-white transition-colors cursor-pointer border border-transparent"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!transcript.trim()}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="size-4" />
              Send Now
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};
