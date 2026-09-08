import React from 'react';
import { ShieldCheck, Cookie, FileText, ExternalLink, Lock } from 'lucide-react';

interface Props {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenCookieSettings: () => void;
  onOpenAbout?: () => void;
}

export const AppFooter: React.FC<Props> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenCookieSettings,
  onOpenAbout,
}) => {
  return (
    <footer className="w-full border-t border-darkroom-border/80 bg-darkroom-surface/90 backdrop-blur-xs py-4 px-4 sm:px-8 mt-auto text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        {/* Left: Branding & Mission */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-[11px]">
          <span className="font-semibold text-white font-mono">Screened</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-300">Agentic Cinema Due Diligence</span>
          <span className="text-slate-400">•</span>
          <a
            href="https://totallyscreened.com/"
            className="text-indigo-400 hover:text-indigo-300 font-mono transition-colors"
          >
            totallyscreened.com
          </a>
        </div>

        {/* Right: Legal & Policy Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-mono">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-slate-300"
          >
            <Lock className="size-3 text-emerald-400" />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            onClick={onOpenTerms}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-slate-300"
          >
            <FileText className="size-3 text-indigo-400" />
            <span>Terms of Service</span>
          </button>

          <button
            type="button"
            onClick={onOpenCookieSettings}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-slate-300"
          >
            <Cookie className="size-3 text-amber-400" />
            <span>Cookie Settings</span>
          </button>

          {onOpenAbout && (
            <button
              type="button"
              onClick={onOpenAbout}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-slate-300"
            >
              <ShieldCheck className="size-3 text-tool-diligence" />
              <span>About Screened</span>
            </button>
          )}

          <a
            href="https://github.com/lucaguglielmi/screened-app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1 text-slate-300"
          >
            <span>GitHub</span>
            <ExternalLink className="size-2.5" />
          </a>
        </div>
      </div>
    </footer>
  );
};
