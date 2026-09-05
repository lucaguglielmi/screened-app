import { useEffect } from 'react';

export interface UseKeyboardShortcutsOptions {
  onToggleCommandPalette: () => void;
  onCloseModals: () => void;
  onFocusSearch: () => void;
  onToggleHelp: () => void;
  onToggleFunkyCursor: () => void;
  onToggleSound: () => void;
  onPasteQuery: (pastedText: string) => void;
}

export function useKeyboardShortcuts({
  onToggleCommandPalette,
  onCloseModals,
  onFocusSearch,
  onToggleHelp,
  onToggleFunkyCursor,
  onToggleSound,
  onPasteQuery,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const handleOpenKeyboardShortcuts = () => onToggleHelp();
    window.addEventListener('open-keyboard-shortcuts', handleOpenKeyboardShortcuts);

    const handlePaste = (e: ClipboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(activeEl?.tagName)) {
        return; // normal paste inside focused field
      }

      const pastedText = e.clipboardData?.getData('text');
      if (pastedText && pastedText.trim()) {
        onPasteQuery(pastedText.trim());
      }
    };

    window.addEventListener('paste', handlePaste);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onToggleCommandPalette();
        return;
      }

      // Don't trigger shortcuts if user is actively typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
          onCloseModals();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        onFocusSearch();
      } else if (e.key === '?') {
        e.preventDefault();
        onToggleHelp();
      } else if (e.key.toLowerCase() === 'f') {
        onToggleFunkyCursor();
      } else if (e.key.toLowerCase() === 'm') {
        onToggleSound();
      } else if (e.key === 'Escape') {
        onCloseModals();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-keyboard-shortcuts', handleOpenKeyboardShortcuts);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    onToggleCommandPalette,
    onCloseModals,
    onFocusSearch,
    onToggleHelp,
    onToggleFunkyCursor,
    onToggleSound,
    onPasteQuery,
  ]);
}
