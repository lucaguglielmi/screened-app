import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Compass,
  Palette,
  Scale,
  ArrowRight,
  Command,
  X,
  Keyboard,
} from 'lucide-react';
import { ActiveTool } from '../types/investigation';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ActiveTool) => void;
  onSearchFestival: (name: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  onSearchFestival,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const navItems = [
    {
      id: 'desk',
      label: 'Mission Control (Main AI Interface)',
      category: 'Workspaces',
      icon: Sparkles,
      iconColor: 'text-indigo-400',
      action: () => {
        onSelectTool('CONVERSATIONAL_DESK');
        onClose();
      },
    },
    {
      id: 'diligence',
      label: 'Due Diligence (Cinema Investigation)',
      category: 'Workspaces',
      icon: ShieldCheck,
      iconColor: 'text-tool-diligence',
      action: () => {
        onSelectTool('DUE_DILIGENCE');
        onClose();
      },
    },
    {
      id: 'scout',
      label: 'Opportunity Scout (Slate Matching)',
      category: 'Workspaces',
      icon: Compass,
      iconColor: 'text-tool-scout',
      action: () => {
        onSelectTool('OPPORTUNITY_SCOUT');
        onClose();
      },
    },
    {
      id: 'why',
      label: 'Why Screened Exists (Problem & Impact)',
      category: 'Evidence & Research',
      icon: Scale,
      iconColor: 'text-indigo-300',
      action: () => {
        onSelectTool('WHY_SCREENED');
        onClose();
      },
    },
    {
      id: 'how',
      label: 'How To Use Screened (AI Agent Page)',
      category: 'Evidence & Research',
      icon: Command,
      iconColor: 'text-indigo-300',
      action: () => {
        onSelectTool('HOW_TO_USE');
        onClose();
      },
    },
    {
      id: 'tokens',
      label: 'Design Playground',
      category: 'Design Playground',
      icon: Palette,
      iconColor: 'text-purple-400',
      action: () => {
        onSelectTool('DESIGN_PLAYGROUND');
        onClose();
      },
    },
  ];

  const filteredItems = navItems.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()),
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems.length > 0 && selectedIndex < filteredItems.length) {
        filteredItems[selectedIndex].action();
      } else if (search.trim()) {
        onSearchFestival(search.trim());
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-paper-surface dark:bg-darkroom-surface border border-paper-border dark:border-darkroom-border shadow-2xl shadow-black/90 overflow-hidden space-y-0 text-slate-200"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-paper-border dark:border-darkroom-border bg-paper-bg dark:bg-darkroom-bg">
          <Search className="size-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or festival to investigate..."
            className="w-full bg-transparent text-base text-white placeholder-slate-500 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-paper-card dark:bg-darkroom-card px-2 py-0.5 rounded-md border border-paper-border dark:border-darkroom-border">
            <Command className="size-3" />
            <span>K</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-paper-border dark:hover:bg-darkroom-border text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {search.trim() && (
            <div
              onClick={() => {
                onSearchFestival(search.trim());
                onClose();
              }}
              className="p-3 rounded-2xl bg-paper-card dark:bg-darkroom-card hover:bg-paper-border dark:hover:bg-darkroom-border border border-tool-diligence/30 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-tool-diligence/20 text-tool-diligence">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    Investigate "{search.trim()}"
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Launch multi-agent due diligence probe
                  </div>
                </div>
              </div>
              <ArrowRight className="size-4 text-tool-diligence" />
            </div>
          )}

          {filteredItems.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-paper-card dark:bg-darkroom-card border border-indigo-500/40 text-white'
                    : 'hover:bg-paper-surface dark:hover:bg-darkroom-surface text-slate-300 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl bg-paper-bg dark:bg-darkroom-bg border border-paper-border dark:border-darkroom-border ${item.iconColor}`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-[11px] font-mono text-slate-500">{item.category}</div>
                  </div>
                </div>
                {isSelected && (
                  <span className="text-[10px] font-mono text-indigo-400 flex items-center gap-1">
                    <span>Select</span>
                    <ArrowRight className="size-3" />
                  </span>
                )}
              </div>
            );
          })}

          {filteredItems.length === 0 && !search.trim() && (
            <div className="p-6 text-center text-xs font-mono text-slate-500">
              No matching commands.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-2.5 bg-paper-bg dark:bg-darkroom-bg border-t border-paper-border dark:border-darkroom-border flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Navigate with ↑ ↓ • Enter to execute • Esc to dismiss</span>
          <button
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            onClick={() => {
              // We can emit an event or just alert for now, wait we need to open the keyboard modal
              // The user said: "add the keyboard shortcuts link to the quick search"
              // For simplicity, let's just trigger a custom event that App.tsx can catch to open the modal
              window.dispatchEvent(new CustomEvent('open-keyboard-shortcuts'));
              onClose();
            }}
          >
            <Keyboard className="size-3" />
            <span>Keyboard Shortcuts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
