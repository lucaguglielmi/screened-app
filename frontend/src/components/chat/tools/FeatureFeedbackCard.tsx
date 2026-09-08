/**
 * ==============================================================================
 * FAKE DOOR TEST COMPONENT: Feature Feedback & Demand Validation
 * ==============================================================================
 * This component acts as a "Fake Door Test" to evaluate real filmmaker demand
 * for prospective features (such as grant scouting, distributor due diligence,
 * sales agent forensics, and tax credit calculators) before committing engineering
 * resources to build out full backend pipelines.
 *
 * User requirements submitted through this card post directly to the backend
 * `/api/feedback` endpoint and are viewable in the Design Playground (/playground).
 * ==============================================================================
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, CheckCircle2, Mail, HelpCircle, Tag } from 'lucide-react';
import { FeatureFeedbackToolArgs } from '../../../types/chat';
import { soundEffects } from '../../../utils/audio';

interface FeatureFeedbackCardProps {
  args: FeatureFeedbackToolArgs;
}

export const FeatureFeedbackCard: React.FC<FeatureFeedbackCardProps> = ({
  args,
}) => {
  const [requirements, setRequirements] = useState('');
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('screened_notification_email') || '';
    } catch {
      return '';
    }
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const featureName = args.feature_name || 'Upcoming Cinema Feature';
  const pitch =
    args.pitch || 'We are currently evaluating this feature for our next product release cycle.';
  const promptQuestion =
    args.prompt_question || 'What would you like and what are you trying to achieve?';
  const suggestedOptions = args.suggested_options || [
    'Public Grant Matching',
    'Deadline & Eligibility Alerts',
    'Application Checklist & Guidelines',
  ];

  const toggleTag = (tag: string) => {
    soundEffects.playClick();
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullComment = [
      `[Feature Request: ${featureName}]`,
      requirements.trim(),
      selectedTags.length > 0 ? `Selected Focus: ${selectedTags.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    if (!fullComment.trim()) {
      setError('Please share a few words about what you would like to achieve.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: 5,
          category: args.prefill_category || 'FEATURE_REQUEST',
          comment: fullComment,
          authorEmail: email.trim() || undefined,
          authorName: 'Filmmaker (Chat Intake)',
        }),
      });

      if (!res.ok) {
        throw new Error('Could not submit roadmap feedback.');
      }

      if (email.trim()) {
        try {
          localStorage.setItem('screened_notification_email', email.trim());
        } catch {
          // ignore
        }
      }

      setIsSubmitted(true);
      soundEffects.playSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl my-2 p-5 sm:p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-darkroom-surface to-darkroom-bg shadow-xl backdrop-blur-md transition-all hover:border-indigo-500/50 text-slate-100 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/40 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xs font-mono font-bold tracking-wider text-indigo-400 uppercase">
                Roadmap Feature
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-semibold">
                Demand Validation (Fake Door)
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-serif truncate">{featureName}</h3>
          </div>
        </div>

        <div className="text-right hidden sm:block shrink-0">
          <span className="text-[11px] text-slate-400 font-mono">
            Feature in Consideration
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
              <span className="font-bold text-sm text-white">
                Requirements Logged to Engineering Roadmap
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Thank you for sharing your use case for <strong className="text-white">{featureName}</strong>!
              Your requirements have been recorded in our product roadmap and will help prioritize upcoming features.
              {email && (
                <span className="block mt-1 text-emerald-200">
                  We will notify <strong className="font-mono">{email}</strong> as soon as early access opens.
                </span>
              )}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Prioritized in our product roadmap</span>
            </div>
          </motion.div>
        ) : (
          <form key="form" onSubmit={handleSubmit} className="space-y-4">
            {/* Pitch & Prompt */}
            <div className="p-3.5 rounded-xl bg-darkroom-bg/80 border border-indigo-500/20 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-start gap-2">
                <HelpCircle className="size-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-200">{pitch}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{promptQuestion}</p>
                </div>
              </div>
            </div>

            {/* Quick Suggestion Tags */}
            {suggestedOptions.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Tag className="size-3 text-indigo-400" />
                  <span>Click to select key capabilities you need:</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {suggestedOptions.map((opt) => {
                    const isSelected = selectedTags.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleTag(opt)}
                        className={`text-xs px-3 py-1 rounded-lg border font-mono transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 font-semibold'
                            : 'bg-darkroom-bg border-white/10 hover:border-white/20 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* User Requirements Textarea */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-sm font-semibold text-slate-300">
                What are you trying to achieve?
              </label>
              <textarea
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="e.g. I need to find UK & European documentary completion grants for a £30k project, or evaluate festival entry fee budgets..."
                className="w-full bg-darkroom-bg border border-transparent focus:border-indigo-400 rounded-xl p-3 text-white text-xs placeholder:text-zinc-500 focus:outline-none resize-none font-mono"
              />
            </div>

            {/* Optional Early Access Email */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-xs font-semibold text-slate-400">
                Get notified when early access launches (Optional):
              </label>
              <div className="relative">
                <Mail className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="director@production.com"
                  className="w-full pl-9 pr-3 py-2 bg-darkroom-bg border border-transparent focus:border-indigo-400 rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 border-t border-darkroom-border flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting ? 'Logging...' : 'Submit to Engineering Roadmap'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
