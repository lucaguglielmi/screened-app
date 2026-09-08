import React, { useState } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  forceOpen?: boolean;
  onClose?: () => void;
  onOpenPrivacy?: () => void;
}

export const CookieConsentBanner: React.FC<Props> = ({
  forceOpen = false,
  onClose,
  onOpenPrivacy,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasStoredConsent] = useState(() => {
    if (typeof window === 'undefined') return true;
    return Boolean(localStorage.getItem('screened_cookie_consent'));
  });

  const isVisible = (forceOpen || !hasStoredConsent) && !isDismissed;

  const handleChoice = (choice: 'accepted' | 'declined') => {
    localStorage.setItem('screened_cookie_consent', choice);
    setIsDismissed(true);
    if (onClose) onClose();

    // Update Google Analytics Consent Mode v2 if window.gtag is available
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
      gtag('consent', 'update', {
        analytics_storage: choice === 'accepted' ? 'granted' : 'denied',
      });
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 p-4 rounded-2xl bg-darkroom-surface/95 backdrop-blur-md border border-darkroom-border shadow-2xl text-xs space-y-3"
        role="region"
        aria-label="Cookie consent banner"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-indigo-400 font-mono font-semibold text-xs tracking-wide">
            <Cookie className="size-4 text-indigo-400" />
            <span>COOKIE &amp; PRIVACY CHOICE</span>
          </div>
          <button
            onClick={() => handleChoice('declined')}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Dismiss cookie banner"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <p className="text-slate-300 leading-relaxed text-[11px]">
          Screened respects filmmaker privacy. We use essential local storage for themes and sound. Optional anonymized cookies measure platform stability and performance.{' '}
          {onOpenPrivacy && (
            <button
              onClick={onOpenPrivacy}
              className="text-indigo-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer font-medium"
            >
              Privacy Policy &rarr;
            </button>
          )}
        </p>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={() => handleChoice('declined')}
            className="px-3 py-1.5 rounded-lg bg-darkroom-card hover:bg-white/[0.08] text-slate-300 hover:text-white font-mono text-[11px] transition-colors border border-darkroom-border cursor-pointer"
          >
            Decline Non-Essential
          </button>
          <button
            onClick={() => handleChoice('accepted')}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-semibold text-[11px] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <ShieldCheck className="size-3.5" />
            <span>Accept Analytics</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
