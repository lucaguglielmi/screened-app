import React from 'react';
import { X, Keyboard, Command, Volume2, Sun, Sparkles, ShieldCheck, Compass, Scale } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardHelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleClose = () => {
    soundEffects.playClick();
    onClose();
  };

  const sections = [
    {
      title: 'Global Utilities & Audio',
      items: [
        { key: '⌘ / Ctrl + K', description: 'Open Command Palette & Quick Search', icon: Command },
        { key: '?', description: 'Open / Close this Keyboard Shortcuts modal', icon: Keyboard },
        { key: 'T', description: 'Toggle Dark / Light Cinema Mode', icon: Sun },
        { key: 'M', description: 'Mute / Unmute Audio Sound Effects', icon: Volume2 },
        { key: 'Esc', description: 'Dismiss modals, popovers, or active input' },
      ]
    },
    {
      title: 'Workspace Navigation',
      items: [
        { key: '1', description: 'Switch to Mission Control (Main AI Desk)', icon: Sparkles },
        { key: '2', description: 'Switch to Due Diligence Workspace', icon: ShieldCheck },
        { key: '3', description: 'Switch to Opportunity Scout Workspace', icon: Compass },
        { key: '4', description: 'Switch to Why Screened Exists', icon: Scale },
        { key: '/', description: 'Quick focus search prompt' },
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-lg rounded-3xl bg-[#0B0E20] border border-[#222852] shadow-2xl shadow-black/80 p-6 sm:p-7 space-y-6 text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C2145] pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-[#2018E6]/20 border border-[#2018E6]/40 flex items-center justify-center text-indigo-400">
              <Keyboard className="size-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                Keyboard Shortcuts
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Fast navigation & command hotkeys
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#141838] border border-transparent hover:border-[#222852] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Shortcuts Categories */}
        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-2">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400/90 pl-1">
                {sec.title}
              </h4>
              <div className="space-y-1.5">
                {sec.items.map((sc, idx) => {
                  const Icon = sc.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 rounded-2xl bg-[#10142D] hover:bg-[#151A3C] border border-[#1A2045] transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2.5 text-slate-300">
                        {Icon && <Icon className="size-3.5 text-slate-400 shrink-0" />}
                        <span>{sc.description}</span>
                      </div>
                      <kbd className="px-2.5 py-1 rounded-lg bg-[#181E44] border border-[#2B346E] font-mono text-[11px] font-semibold text-indigo-200 shadow-sm whitespace-nowrap">
                        {sc.key}
                      </kbd>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="pt-2 border-t border-[#1C2145] flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Tips show contextually across the UI</span>
          <span className="text-[11px]">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[#181E44] border border-[#2B346E] text-slate-300">Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};
