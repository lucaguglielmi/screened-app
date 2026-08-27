import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface VersionInfo {
  version: string;
  commitSha: string;
  buildTime: string;
  timestamp?: number;
}

export const UpdateNotifier: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState<VersionInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Local client constants injected at build time
  const currentBuildTime = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : '';
  const currentCommitSha = typeof __COMMIT_SHA__ !== 'undefined' ? __COMMIT_SHA__ : '';

  const evaluateVersion = useCallback((serverData: VersionInfo) => {
    if (!serverData) return;

    // Never show update notifications in local development
    if (import.meta.env.DEV || currentCommitSha === 'dev' || !currentCommitSha) {
      return;
    }

    // Check if remote commit or build time differs from current client bundle
    const hasDifferentCommit =
      currentCommitSha &&
      serverData.commitSha &&
      serverData.commitSha !== 'dev' &&
      serverData.commitSha !== 'unknown' &&
      serverData.commitSha !== currentCommitSha;

    const hasNewerBuildTime =
      currentBuildTime &&
      serverData.buildTime &&
      serverData.buildTime !== currentBuildTime;

    if (hasDifferentCommit || (hasNewerBuildTime && serverData.commitSha !== 'dev')) {
      setRemoteVersion(serverData);
      setUpdateAvailable(true);
      // Play a soft notification chime if not muted
      try {
        soundEffects.playCaution();
      } catch {
        // Ignore audio playback error
      }
    }
  }, [currentBuildTime, currentCommitSha]);

  const checkForUpdate = useCallback(async () => {
    try {
      // Use cache-busting timestamp param to ensure direct network fetch
      const res = await fetch(`/api/version?_cb=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      if (!res.ok) {
        // Fallback to version.json in static root if api/version returns non-200
        const fallbackRes = await fetch(`/version.json?_cb=${Date.now()}`);
        if (!fallbackRes.ok) return;
        const data: VersionInfo = await fallbackRes.json();
        evaluateVersion(data);
        return;
      }

      const data: VersionInfo = await res.json();
      evaluateVersion(data);
    } catch {
      // Silent error handling for offline/network blips
    }
  }, [evaluateVersion]);

  useEffect(() => {
    // Initial check after 5 seconds
    const initialTimer = setTimeout(checkForUpdate, 5000);

    // Periodic check every 25 seconds
    const interval = setInterval(checkForUpdate, 25000);

    // Check when user switches back to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };

    const handleFocus = () => {
      checkForUpdate();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkForUpdate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    soundEffects.playClick();

    // 1. Purge all browser caches
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((r) => r.unregister()));
      }
    } catch (e) {
      console.warn('Cache purge on reload error:', e);
    }

    // 2. Perform hard reload
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  if (!updateAvailable || isDismissed) {
    return null;
  }

  // Format relative or friendly build time
  const formattedTime = remoteVersion?.buildTime
    ? new Date(remoteVersion.buildTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Just now';

  return (
    <aside
      aria-label="System Updates"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-darkroom-surface/95 backdrop-blur-xl border border-tool-diligence/40 shadow-2xl shadow-black/80 ring-1 ring-tool-diligence/20 text-slate-100">
        {/* Left: Icon & Text */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-xl bg-tool-diligence/15 border border-tool-diligence/30 flex items-center justify-center text-tool-diligence shrink-0 animate-pulse">
            <Sparkles className="size-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-tool-diligence font-mono">
                Update Live
              </span>
              <span className="size-1.5 rounded-full bg-tool-diligence" />
              <span className="text-[11px] text-slate-400 font-mono">{formattedTime}</span>
            </div>
            <p className="text-xs text-slate-300 truncate">
              New build{' '}
              <span className="font-mono text-slate-200">
                {remoteVersion?.commitSha?.slice(0, 7) || 'latest'}
              </span>{' '}
              is available.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-tool-diligence hover:bg-tool-diligence-hover text-slate-950 text-xs font-semibold transition-all shadow-md shadow-[var(--color-tool-diligence)]/20 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-darkroom-card transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
