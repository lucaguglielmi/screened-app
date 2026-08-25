import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function VersionAlertBanner() {
  const [hasNewVersion, setHasNewVersion] = useState(false);

  useEffect(() => {
    if (typeof __BUILD_TIME__ === 'undefined') return;

    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        
        // If the build time on the server differs from our build time,
        // it means a new version was deployed.
        if (data.buildTime && data.buildTime !== __BUILD_TIME__) {
          setHasNewVersion(true);
        }
      } catch {
        // Ignore fetch errors (e.g., offline)
      }
    };

    // Check immediately on mount, and then every 2 minutes
    checkVersion();
    const intervalId = window.setInterval(checkVersion, 2 * 60 * 1000);

    // Also check when the user switches tabs back to the app
    const onFocus = () => checkVersion();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  if (!hasNewVersion) return null;

  return (
    <div 
      onClick={() => window.location.reload()}
      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg z-50 relative"
      role="alert"
    >
      <RefreshCw className="size-4 animate-spin" />
      <span className="text-sm font-medium">A new version of Screened is available. Click here to refresh.</span>
    </div>
  );
}
