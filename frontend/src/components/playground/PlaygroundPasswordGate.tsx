import React, { useState } from 'react';
import { Lock, Unlock, Eye, EyeOff, ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import { soundEffects } from '../../utils/audio';
import { track } from '../../utils/analytics';
import { navigateTo } from '../../router/Router';

export const PLAYGROUND_AUTH_STORAGE_KEY = 'screened_playground_unlocked_until';
export const PLAYGROUND_SESSION_STORAGE_KEY = 'screened_playground_auth';
export const HONEYPOT_PASSWORD = 'honeypotpassword';
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export const isPlaygroundAuthorized = (): boolean => {
  try {
    // 1. Check session storage
    if (sessionStorage.getItem(PLAYGROUND_SESSION_STORAGE_KEY) === HONEYPOT_PASSWORD) {
      return true;
    }
    // 2. Check 1-year persistent local storage
    const expiry = localStorage.getItem(PLAYGROUND_AUTH_STORAGE_KEY);
    if (expiry && Number(expiry) > Date.now()) {
      return true;
    }
  } catch {
    // Storage restricted or unavailable
  }
  return false;
};

export const authorizePlayground = (): void => {
  try {
    const expiry = Date.now() + ONE_YEAR_MS;
    localStorage.setItem(PLAYGROUND_AUTH_STORAGE_KEY, String(expiry));
    sessionStorage.setItem(PLAYGROUND_SESSION_STORAGE_KEY, HONEYPOT_PASSWORD);
  } catch {
    // Storage restricted or unavailable
  }
};

interface Props {
  children: React.ReactNode;
}

export const PlaygroundPasswordGate: React.FC<Props> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => isPlaygroundAuthorized());
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passwordInput.trim();
    const now = new Date().toISOString();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';

    if (clean === HONEYPOT_PASSWORD) {
      authorizePlayground();
      setIsAuthorized(true);
      setErrorMessage(null);
      soundEffects.playSuccess();

      // Log successful clearance in GA
      track('playground_password_entered', {
        timestamp: now,
        status: 'success',
        page: window.location.pathname,
        attempt_count: attempts + 1,
        user_timezone: timezone,
      });
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setErrorMessage('Access Denied: Incorrect authorization key. Attempt logged.');
      soundEffects.playCaution();

      // Log failed clearance attempt in GA
      track('playground_password_entered', {
        timestamp: now,
        status: 'failed',
        page: window.location.pathname,
        attempt_count: nextAttempts,
        user_timezone: timezone,
      });
    }
  };

  if (isAuthorized) {
    return <>{children}</>;
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-[70vh] p-4 sm:p-6 select-none animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#070b16]/95 border border-amber-500/30 shadow-2xl shadow-black/80 backdrop-blur-md p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 size-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Security Badge & Header */}
        <div className="flex flex-col items-center text-center space-y-3 relative z-10">
          <div className="size-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Lock className="size-7 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-semibold uppercase tracking-wider mb-1">
              <ShieldAlert className="size-3" />
              <span>Restricted Workbench</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
              Design Playground Access
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              This internal testing sandbox is access-restricted. Please enter the honeypot access key to unlock the engineering workbench.
            </p>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-300 font-semibold">
              Honeypot Authorization Key
            </label>
            <div className="relative flex items-center">
              <KeyRound className="size-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter password..."
                autoFocus
                className="w-full pl-9.5 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-amber-400 text-white font-mono text-sm placeholder-slate-500 focus:outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-white cursor-pointer transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-start gap-2 animate-in fade-in zoom-in-95">
              <ShieldAlert className="size-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!passwordInput.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold font-mono text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-98"
          >
            <Unlock className="size-4 shrink-0" />
            <span>Unlock Sandbox</span>
          </button>
        </form>

        {/* Security Guarantee & Back Button */}
        <div className="pt-2 border-t border-white/[0.06] flex flex-col items-center gap-3 text-center text-xs font-mono text-slate-500 relative z-10">
          <span className="flex items-center gap-1.5">
            <span>🔒</span>
            <span>Once verified, access is maintained for 1 year on this browser.</span>
          </span>

          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              navigateTo('/');
            }}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer hover:underline pt-1"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Cinema Due Diligence Desk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
