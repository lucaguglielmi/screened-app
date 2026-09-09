import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Clock, RefreshCw, Copy, Check, X } from 'lucide-react';
import type { RateLimitDetail } from '../../hooks/useInvestigation';

export function RateLimitNotice() {
  const [notice, setNotice] = useState<RateLimitDetail | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const handleRateLimit = (e: Event) => {
      const customEvent = e as CustomEvent<RateLimitDetail>;
      if (customEvent.detail) {
        setNotice(customEvent.detail);
        setCountdown(customEvent.detail.retryAfterSeconds || 30);
      }
    };

    window.addEventListener('screened:rate-limit-exceeded', handleRateLimit);
    return () => {
      window.removeEventListener('screened:rate-limit-exceeded', handleRateLimit);
    };
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const copyDiagnosticBundle = useCallback(() => {
    if (!notice) return;
    const bundle = {
      product: 'Screened Cinema Intelligence',
      correlationId: notice.correlationId,
      timestamp: new Date().toISOString(),
      endpoint: notice.endpoint,
      status: 429,
      errorTaxonomy: 'RATE_LIMIT_EXCEEDED',
      message: notice.message,
      environment: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        online: typeof navigator !== 'undefined' ? navigator.onLine : true,
      },
    };

    navigator.clipboard.writeText(JSON.stringify(bundle, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [notice]);

  if (!notice) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] rounded-xl border border-amber-500/40 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm tracking-wide">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Forensic Engines At Peak Capacity</span>
        </div>
        <button
          onClick={() => setNotice(null)}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1 -mr-1"
          aria-label="Dismiss rate limit notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-300 leading-relaxed">
        {notice.message ||
          "Screened's forensic research engines are currently running at peak capacity across multiple film festivals. To protect verification integrity and prevent registry lockout, requests are queued."}
      </p>

      {notice.correlationId && (
        <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 font-mono bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
          <span>Trace ID:</span>
          <span className="text-amber-300/90 truncate">{notice.correlationId}</span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300/90">
          <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
          <span>
            {countdown > 0 ? `Auto-resuming in ${countdown}s` : 'Ready to retry'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyDiagnosticBundle}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-slate-800/90 text-slate-300 hover:bg-slate-700/90 border border-slate-700 transition-colors"
            title="Copy non-sensitive diagnostic snapshot for support"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Diagnostics</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setNotice(null);
              window.location.reload();
            }}
            className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
