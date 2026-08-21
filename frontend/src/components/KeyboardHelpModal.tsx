import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardHelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ / Ctrl + K', description: 'Jump to Festival Search bar' },
    { key: '/', description: 'Quick focus search input' },
    { key: '1', description: 'Set Detail Dial to Summary' },
    { key: '2', description: 'Set Detail Dial to Standard' },
    { key: '3', description: 'Set Detail Dial to Raw Evidence' },
    { key: 'T', description: 'Toggle Dark / Light Cinema mode' },
    { key: 'M', description: 'Toggle Audio sound effects' },
    { key: '?', description: 'Toggle this Shortcuts Guide' },
    { key: 'Esc', description: 'Close modals or popovers' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-paper-border dark:border-darkroom-border pb-3">
          <div className="flex items-center gap-2 text-paper-text dark:text-darkroom-text font-serif text-lg font-semibold">
            <Keyboard className="size-5 text-indigo-600 dark:text-indigo-400" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-paper-muted dark:text-darkroom-muted hover:bg-paper-card dark:hover:bg-darkroom-card transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-paper-card dark:hover:bg-darkroom-card transition-colors text-xs"
            >
              <span className="text-paper-muted dark:text-darkroom-muted">{sc.description}</span>
              <kbd className="px-2 py-1 rounded bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border font-mono text-[11px] font-semibold text-paper-text dark:text-darkroom-text shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-paper-border dark:border-darkroom-border text-center">
          <p className="text-[11px] font-mono text-paper-muted dark:text-darkroom-muted">
            Press <kbd className="px-1.5 py-0.5 rounded bg-paper-card dark:bg-darkroom-card border border-paper-border dark:border-darkroom-border">Esc</kbd> or click outside to dismiss
          </p>
        </div>
      </div>
    </div>
  );
};
