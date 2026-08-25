import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  MessageSquare,
  Send,
  CheckCircle2,
  Loader2,
  CheckCircle,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { soundEffects, playSuccessChime } from '../../utils/audio';
import { AnimatedFocusWrapper } from '../animations/AnimatedFocusWrapper';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewFeedbackLog?: () => void;
}

type GoalStatus = 'YES' | 'PARTIALLY' | 'NO';

const GOAL_OPTIONS: {
  id: GoalStatus;
  label: string;
  sublabel: string;
  rating: number;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: 'YES',
    label: 'Yes, completely',
    sublabel: 'Found what I needed',
    rating: 5,
    icon: <CheckCircle className="size-4 text-tool-diligence" />,
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  },
  {
    id: 'PARTIALLY',
    label: 'Partially',
    sublabel: 'Still exploring',
    rating: 3,
    icon: <HelpCircle className="size-4 text-amber-400" />,
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  },
  {
    id: 'NO',
    label: 'Not yet',
    sublabel: 'Encountered blockers',
    rating: 1,
    icon: <XCircle className="size-4 text-rose-400" />,
    color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  },
];

const RATING_LABELS: Record<number, string> = {
  1: 'Encountered blockers / Needs work',
  2: 'Fair experience',
  3: 'Partially completed my goal',
  4: 'Great experience, found helpful info',
  5: 'Completed my goal with excellence!',
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onViewFeedbackLog,
}) => {
  const [goalStatus, setGoalStatus] = useState<GoalStatus>('YES');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
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

  const handleSelectGoal = (option: (typeof GOAL_OPTIONS)[0]) => {
    soundEffects.playClick();
    setGoalStatus(option.id);
    setRating(option.rating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide a brief thought or detail about your goal.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const goalPrefix = `[Goal Completed: ${goalStatus}] `;
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          category: 'GOAL_FEEDBACK',
          comment: `${goalPrefix}${comment.trim()}`,
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
    setGoalStatus('YES');
    setRating(5);
    onClose();
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in select-none">
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-midnight-void/85 backdrop-blur-md transition-opacity"
        onClick={() => {
          soundEffects.playClick();
          onClose();
        }}
      />

      {/* Modal Dialog Card: Solid Opaque, Borderless */}
      <div className="relative z-10 w-full max-w-lg flex flex-col rounded-3xl bg-darkroom-surface shadow-2xl shadow-black/90 overflow-hidden text-slate-100 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-darkroom-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white tracking-tight">
                Filmmaker Feedback
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Tell us how Screened worked for you
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-paper-border hover:bg-darkroom-border transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-6 animate-fade-in">
            <div className="size-16 mx-auto rounded-full bg-tool-diligence/20 text-tool-diligence flex items-center justify-center shadow-lg shadow-[var(--color-tool-diligence)]/20 animate-bounce">
              <CheckCircle2 className="size-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold text-white">Thank You, Filmmaker!</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Your feedback helps us refine the intelligence engine and festival verification
                tools for creators worldwide.
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
                  className="px-4 py-2.5 rounded-xl bg-darkroom-card hover:bg-paper-border hover:bg-darkroom-border text-indigo-300 text-xs font-mono transition-colors cursor-pointer"
                >
                  View Feedback Log →
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-midnight-royal hover:bg-midnight-royal text-white font-bold text-xs font-mono transition-all shadow-md cursor-pointer"
              >
                Back to Workspace
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 text-sm">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-mono">
                {error}
              </div>
            )}

            {/* 1. Main Goal Question */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-white block text-center">
                Did you manage to complete your goal today?
              </label>

              {/* Goal Quick Select Buttons */}
              <div className="grid grid-cols-3 gap-2.5">
                {GOAL_OPTIONS.map((option) => {
                  const isSelected = goalStatus === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelectGoal(option)}
                      className={`p-3 rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? `${option.color} ring-2 ring-indigo-500/60 shadow-lg scale-102`
                          : 'bg-darkroom-card text-slate-300 hover:bg-paper-border hover:bg-darkroom-border hover:text-white'
                      }`}
                    >
                      {option.icon}
                      <span className="text-xs font-semibold leading-tight">{option.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                        {option.sublabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Star Rating (Subtle secondary) */}
            <div className="space-y-1.5 text-center pt-1">
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
                      if (star >= 4) setGoalStatus('YES');
                      else if (star === 3) setGoalStatus('PARTIALLY');
                      else setGoalStatus('NO');
                    }}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`size-6 transition-colors ${
                        star <= activeRating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
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

            {/* 3. Detailed Textarea */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex justify-between">
                <span>Tell us more about your experience:</span>
                <span className="text-slate-500 font-normal">Required</span>
              </label>
              <AnimatedFocusWrapper borderRadius={12}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What festival or goal were you working on? What went well or what can we improve?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-darkroom-card text-slate-100 placeholder-slate-500 text-sm focus:bg-paper-border focus:bg-darkroom-border focus:outline-none transition-colors resize-none leading-relaxed"
                  required
                />
              </AnimatedFocusWrapper>
            </div>

            {/* 4. Optional Author & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Your Name (Optional)</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Maya Lin (Director)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkroom-card text-slate-100 placeholder-slate-500 text-xs focus:bg-paper-border focus:bg-darkroom-border focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">
                  Email for follow-up (Optional)
                </label>
                <input
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="director@indiefilm.org"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-darkroom-card text-slate-100 placeholder-slate-500 text-xs focus:bg-paper-border focus:bg-darkroom-border focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between gap-3">
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
                className="px-6 py-2.5 rounded-xl bg-midnight-royal hover:bg-midnight-royal disabled:opacity-40 text-white font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-indigo-950/60 cursor-pointer active:scale-95"
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
