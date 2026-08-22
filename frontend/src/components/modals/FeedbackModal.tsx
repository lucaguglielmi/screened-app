import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Loader2
} from 'lucide-react';
import { soundEffects, playSuccessChime } from '../../utils/audio';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewFeedbackLog?: () => void;
}

const CATEGORIES = [
  { id: 'ACCURACY', label: 'Forensic Accuracy', emoji: '🔍' },
  { id: 'RECOMMENDATIONS', label: 'Grant Matching', emoji: '💰' },
  { id: 'CHAT_INTELLIGENCE', label: 'Mission Control AI', emoji: '🧠' },
  { id: 'UI_DESIGN', label: 'UI & Aesthetics', emoji: '🎨' },
  { id: 'FEATURE_REQUEST', label: 'Feature Request', emoji: '💡' },
  { id: 'GENERAL', label: 'General', emoji: '🎬' },
];

const RATING_LABELS: Record<number, string> = {
  1: 'Needs Work',
  2: 'Fair',
  3: 'Good Experience',
  4: 'Great Intelligence',
  5: 'Exceptional & Protective!',
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onViewFeedbackLog,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('GENERAL');
  const [comment, setComment] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [authorEmail, setAuthorEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide a brief thought or suggestion before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          category,
          comment: comment.trim(),
          authorName: authorName.trim() || undefined,
          authorEmail: authorEmail.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to record feedback. Please try again.');
      }

      setIsSubmitted(true);
      playSuccessChime();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setComment('');
    setAuthorName('');
    setAuthorEmail('');
    setRating(5);
    setCategory('GENERAL');
    onClose();
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in select-none">
      {/* Dark backdrop */}
      <div 
        className="absolute inset-0 bg-[#05050A]/85 backdrop-blur-md transition-opacity"
        onClick={() => {
          soundEffects.playClick();
          onClose();
        }}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-xl flex flex-col rounded-3xl bg-[#090C19] border border-[#22274C] shadow-2xl shadow-indigo-950/60 overflow-hidden text-slate-100 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1D2244] bg-[#0C1024]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white tracking-tight">
                Filmmaker Feedback & Ideas
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Help us improve Screened for indie cinema creators
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1A1F45] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-6 animate-fade-in">
            <div className="size-16 mx-auto rounded-full bg-[#00D29E]/20 border border-[#00D29E]/40 text-[#00D29E] flex items-center justify-center shadow-lg shadow-[#00D29E]/20 animate-bounce">
              <CheckCircle2 className="size-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold text-white">
                Thank You, Filmmaker!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Your feedback has been logged directly into our intelligence registry. You can inspect all community submissions in the Design Playground feedback log.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              {onViewFeedbackLog && (
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    onClose();
                    onViewFeedbackLog();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#1A1F45] hover:bg-[#252C63] text-indigo-300 text-xs font-mono border border-[#2F3775] transition-colors cursor-pointer"
                >
                  View Feedback Log Tab →
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-[#2018E6] hover:bg-[#322CE8] text-white font-bold text-xs font-mono transition-all shadow-md cursor-pointer"
              >
                Back to Workspace
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 text-sm">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* 1. Star Rating */}
            <div className="space-y-2 text-center">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                How is your experience with Screened?
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => {
                      soundEffects.playClick();
                      setRating(star);
                    }}
                    className="p-1.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`size-7 transition-colors ${
                        star <= activeRating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono text-amber-300 block font-medium h-4">
                {RATING_LABELS[activeRating]}
              </span>
            </div>

            {/* 2. Category Pills */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Topic Area
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setCategory(cat.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                      category === cat.id
                        ? 'bg-[#2018E6] text-white border-indigo-400 shadow-md shadow-indigo-950'
                        : 'bg-[#0E1228] text-slate-300 border-[#222852] hover:border-[#3A458C]'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex justify-between">
                <span>What can we do better?</span>
                <span className="text-slate-400 font-normal">Required</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts, missing film grants, accuracy feedback, or feature ideas..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-[#0B0F24] border border-[#222852] text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
                required
              />
            </div>

            {/* 4. Optional Author & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Your Name (Optional)</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Maya Lin (Director)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F24] border border-[#222852] text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Email for follow-up (Optional)</label>
                <input
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="director@indiefilm.org"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F24] border border-[#222852] text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-[#1D2244] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#2018E6] hover:bg-[#322CE8] disabled:opacity-50 text-white font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-indigo-950/60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" />
                    <span>Send Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
