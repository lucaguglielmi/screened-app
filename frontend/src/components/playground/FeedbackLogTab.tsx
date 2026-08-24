import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  Search,
  RefreshCw,
  Filter,
  Plus,
  User,
  Clock,
  Loader2,
} from 'lucide-react';
import { soundEffects } from '../../utils/audio';

export interface FeedbackItem {
  id: string;
  rating: number;
  category: string;
  comment: string;
  authorName?: string;
  authorEmail?: string;
  timestamp: string;
  status: string;
}

interface FeedbackLogTabProps {
  onOpenFeedbackModal?: () => void;
}

const CATEGORY_MAP: Record<string, { label: string; bg: string; text: string; border: string }> = {
  ACCURACY: {
    label: 'Forensic Accuracy',
    bg: 'bg-tool-diligence/20',
    text: 'text-tool-diligence',
    border: 'border-tool-diligence/40',
  },
  RECOMMENDATIONS: {
    label: 'Grant Matching',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
  },
  CHAT_INTELLIGENCE: {
    label: 'Mission Control AI',
    bg: 'bg-indigo-500/20',
    text: 'text-indigo-300',
    border: 'border-indigo-500/40',
  },
  UI_DESIGN: {
    label: 'UI & Design',
    bg: 'bg-purple-500/20',
    text: 'text-purple-300',
    border: 'border-purple-500/40',
  },
  FEATURE_REQUEST: {
    label: 'Feature Request',
    bg: 'bg-amber-500/20',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
  },
  GENERAL: {
    label: 'General',
    bg: 'bg-slate-500/20',
    text: 'text-slate-300',
    border: 'border-slate-500/40',
  },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  RECEIVED: { label: 'Received', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  REVIEWED: {
    label: 'Reviewed',
    color: 'bg-tool-diligence/20 text-tool-diligence border-tool-diligence/30',
  },
  PLANNED: { label: 'In Roadmap', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
};

export const FeedbackLogTab: React.FC<FeedbackLogTabProps> = ({ onOpenFeedbackModal }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/feedback');
      if (!res.ok) throw new Error('Failed to fetch feedback logs.');
      const data = await res.json();
      setFeedbacks(data);
    } catch (err: any) {
      setError(err?.message || 'Error loading feedback items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const filteredFeedbacks = feedbacks.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.authorName && item.authorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.authorEmail && item.authorEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Analytics Metrics
  const totalCount = feedbacks.length;
  const avgRating =
    totalCount > 0
      ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalCount).toFixed(1)
      : '5.0';
  const accuracyCount = feedbacks.filter((f) => f.category === 'ACCURACY').length;
  const featureCount = feedbacks.filter((f) => f.category === 'FEATURE_REQUEST').length;

  return (
    <div className="space-y-8 animate-fade-in text-slate-100 select-none">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-border dark:border-darkroom-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
            <MessageSquare className="size-6" />
          </div>
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Filmmaker Feedback & Intelligence Log
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Live repository of user submissions, feature requests, and forensic accuracy
              assessments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              soundEffects.playClick();
              fetchFeedback();
            }}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-paper-surface dark:bg-darkroom-surface hover:bg-paper-card dark:hover:bg-darkroom-card text-slate-300 border border-paper-border dark:border-darkroom-border text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {onOpenFeedbackModal && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenFeedbackModal();
              }}
              className="px-4 py-2 rounded-xl bg-midnight-royal hover:bg-midnight-royal text-white font-bold text-xs font-mono flex items-center gap-2 transition-all shadow-md shadow-indigo-950/50 cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Submit Test Feedback</span>
            </button>
          )}
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-paper-bg dark:bg-darkroom-bg shadow-lg space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
            Total Submissions
          </span>
          <div className="text-3xl font-bold font-serif text-white">{totalCount}</div>
          <span className="text-[11px] text-slate-400">Community verified logs</span>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-paper-bg dark:bg-darkroom-bg shadow-lg space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
            Avg Satisfaction Rating
          </span>
          <div className="text-3xl font-bold font-serif text-amber-400 flex items-center gap-1.5">
            <span>{avgRating}</span>
            <Star className="size-5 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[11px] text-slate-400">Out of 5.0 stars</span>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-paper-bg dark:bg-darkroom-bg shadow-lg space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
            Accuracy & Vetting
          </span>
          <div className="text-3xl font-bold font-serif text-tool-diligence">{accuracyCount}</div>
          <span className="text-[11px] text-slate-400">Forensic accuracy reports</span>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-paper-bg dark:bg-darkroom-bg shadow-lg space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
            Roadmap Requests
          </span>
          <div className="text-3xl font-bold font-serif text-purple-400">{featureCount}</div>
          <span className="text-[11px] text-slate-400">Ideas in development</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-paper-surface dark:bg-darkroom-surface flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feedback by text or author..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-paper-bg dark:bg-darkroom-bg border border-paper-border dark:border-darkroom-border text-xs font-mono text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-mono text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="size-3" /> Filter:
          </span>
          {[
            'ALL',
            'ACCURACY',
            'RECOMMENDATIONS',
            'CHAT_INTELLIGENCE',
            'UI_DESIGN',
            'FEATURE_REQUEST',
            'GENERAL',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundEffects.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-midnight-royal text-white border-indigo-400'
                  : 'bg-paper-bg dark:bg-darkroom-bg text-slate-300 border-paper-border dark:border-darkroom-border hover:border-midnight-violet'
              }`}
            >
              {cat === 'ALL' ? 'All Logs' : CATEGORY_MAP[cat]?.label || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Feedback Data Table */}
      <div className="rounded-3xl bg-paper-bg dark:bg-darkroom-bg shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <Loader2 className="size-8 animate-spin mx-auto text-indigo-400" />
            <p className="text-xs font-mono text-slate-400">Loading intelligence feedback...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-400 text-sm space-y-2">
            <p>{error}</p>
            <button
              onClick={fetchFeedback}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-mono border border-rose-500/30"
            >
              Retry
            </button>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <MessageSquare className="size-8 mx-auto text-slate-600" />
            <p className="text-sm text-slate-400">No feedback items match your active filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-paper-border dark:border-darkroom-border bg-paper-surface dark:bg-darkroom-surface text-slate-400 font-mono uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Rating</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-6 font-semibold">Comment & Suggestions</th>
                  <th className="py-3.5 px-4 font-semibold">Filmmaker</th>
                  <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-midnight-border)] text-slate-200">
                {filteredFeedbacks.map((item) => {
                  const catConfig = CATEGORY_MAP[item.category] || CATEGORY_MAP.GENERAL;
                  const statusConfig = STATUS_MAP[item.status] || STATUS_MAP.RECEIVED;
                  const formattedDate = new Date(item.timestamp).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={item.id} className="hover:bg-paper-surface dark:hover:bg-darkroom-surface transition-colors">
                      {/* Rating Stars */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`size-3.5 ${
                                s <= item.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-xs font-mono font-bold text-amber-300">
                            {item.rating}.0
                          </span>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}
                        >
                          {catConfig.label}
                        </span>
                      </td>

                      {/* Comment Body */}
                      <td className="py-4 px-6 max-w-md">
                        <p className="text-sm text-slate-100 leading-relaxed font-sans line-clamp-3">
                          {item.comment}
                        </p>
                      </td>

                      {/* Author */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="font-medium text-slate-200 flex items-center gap-1.5">
                            <User className="size-3 text-slate-400" />
                            <span>{item.authorName || 'Anonymous'}</span>
                          </div>
                          {item.authorEmail && (
                            <span className="text-[11px] font-mono text-slate-400 block">
                              {item.authorEmail}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
