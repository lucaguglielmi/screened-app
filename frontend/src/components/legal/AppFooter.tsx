import React from 'react';
import { Cookie, FileText, Lock, MessageSquare } from 'lucide-react';

interface Props {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenCookieSettings: () => void;
  onOpenFeedback?: () => void;
}

export const AppFooter: React.FC<Props> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenCookieSettings,
  onOpenFeedback,
}) => {
  return (
    <footer className="w-full border-t border-darkroom-border/80 bg-darkroom-surface/90 backdrop-blur-xs py-3.5 px-4 sm:px-8 mt-auto text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        {/* Streamlined One-Word Menu */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-mono">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-slate-300"
          >
            <Lock className="size-3 text-emerald-400" />
            <span>privacy</span>
          </button>

          <span className="text-slate-600 select-none">/</span>

          <button
            type="button"
            onClick={onOpenTerms}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-slate-300"
          >
            <FileText className="size-3 text-indigo-400" />
            <span>terms</span>
          </button>

          <span className="text-slate-600 select-none">/</span>

          <button
            type="button"
            onClick={onOpenCookieSettings}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-slate-300"
          >
            <Cookie className="size-3 text-amber-400" />
            <span>cookie</span>
          </button>

          {onOpenFeedback && (
            <>
              <span className="text-slate-600 select-none">/</span>

              <button
                type="button"
                onClick={onOpenFeedback}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-slate-300"
              >
                <MessageSquare className="size-3 text-cyan-400" />
                <span>feedback</span>
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};
