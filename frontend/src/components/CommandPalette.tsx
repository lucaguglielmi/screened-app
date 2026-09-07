import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Coins,
  Scale,
  ArrowRight,
  Command,
  X,
  Keyboard,
  Palette,
} from 'lucide-react';
import { ActiveTool } from '../types/investigation';
import { FEATURES } from '../config/features';

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

  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setSearch('');
        setActiveCategory('ALL');
        setSelectedIndex(0);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const navItems = [
    {
      id: 'desk',
      label: 'Screened AI (Conversational Hub)',
      category: 'Workspaces',
      icon: Sparkles,
      iconColor: 'text-tool-diligence',
      action: () => {
        onSelectTool('CONVERSATIONAL_DESK');
        onClose();
      },
    },
    {
      id: 'diligence',
      label: 'Festival Due Diligence (Forensic Dossier)',
      category: 'Workspaces',
      icon: ShieldCheck,
      iconColor: 'text-tool-diligence',
      action: () => {
        onSelectTool('DUE_DILIGENCE');
        onClose();
      },
    },
    ...(FEATURES.ENABLE_GRANT_SCOUT
      ? [
          {
            id: 'grants',
            label: 'Grant & Funding Research (Public Funds & Lottery)',
            category: 'Workspaces',
            icon: Coins,
            iconColor: 'text-tool-diligence',
            action: () => {
              onSelectTool('GRANT_SCOUT');
              onClose();
            },
          },
        ]
      : []),
    {
      id: 'demo-pinco',
      label: 'Pinco Pallino Film Festival',
      category: 'Demo Investigations',
      description: 'Audit report with flagged corporate disputes and fee spikes',
      icon: Sparkles,
      iconColor: 'text-amber-400',
      action: () => {
        onSearchFestival('Pinco Pallino Film Festival');
        onClose();
      },
    },
    {
      id: 'demo-sundance',
      label: 'Sundance Film Festival',
      category: 'Demo Investigations',
      description: 'Benchmark accredited indie festival dossier',
      icon: Sparkles,
      iconColor: 'text-emerald-400',
      action: () => {
        onSearchFestival('Sundance Film Festival');
        onClose();
      },
    },
    {
      id: 'protection',
      label: 'How to Protect Yourself (Festival Evaluation Guide)',
      category: 'Evidence & Research',
      icon: ShieldCheck,
      iconColor: 'text-orange-400',
      action: () => {
        onSelectTool('FESTIVAL_PROTECTION_GUIDE');
        onClose();
      },
    },
    {
      id: 'why',
      label: 'Why Screened Exists (Problem & Impact)',
      category: 'Evidence & Research',
      icon: Scale,
      iconColor: 'text-tool-diligence',
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
      iconColor: 'text-tool-diligence',
      action: () => {
        onSelectTool('HOW_TO_USE');
        onClose();
      },
    },
    {
      id: 'playground',
      label: 'Design Playground (/playground)',
      description: 'Interactive UI components, loaders, agent traces & feedback log',
      category: 'Evidence & Research',
      icon: Palette,
      iconColor: 'text-purple-400',
      action: () => {
        onSelectTool('DESIGN_PLAYGROUND');
        onClose();
      },
    },
  ];

  const filteredItems = navItems.filter((item) => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch =
      !search.trim() ||
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-darkroom-surface border border-darkroom-border shadow-2xl shadow-black/90 overflow-hidden space-y-0 text-slate-200"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-darkroom-border bg-darkroom-bg">
          <Search className="size-5 text-tool-diligence shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, guides, or festival names..."
            className="w-full bg-transparent text-base text-white placeholder-slate-500 focus:outline-none font-sans"
          />
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-darkroom-card px-2 py-0.5 rounded-md border border-darkroom-border">
            <Command className="size-3" />
            <span>K</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-darkroom-border text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Quick Filter Chips */}
        <div className="px-4 py-2 border-b border-darkroom-border/60 bg-darkroom-surface/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {['ALL', 'Workspaces', 'Demo Investigations', 'Evidence & Research'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer shrink-0 ${
                activeCategory === cat
                  ? 'bg-tool-diligence/15 text-tool-diligence border border-tool-diligence/30 font-semibold'
                  : 'bg-darkroom-card/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {cat === 'ALL' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-84 overflow-y-auto p-2 space-y-1">
          {search.trim() && (
            <div
              onClick={() => {
                onSearchFestival(search.trim());
                onClose();
              }}
              className="p-3 mb-1.5 rounded-2xl bg-darkroom-card hover:bg-darkroom-surface border border-tool-diligence/40 flex items-center justify-between cursor-pointer transition-colors shadow-sm"
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
            const showCategoryHeader = idx === 0 || filteredItems[idx - 1].category !== item.category;

            return (
              <React.Fragment key={item.id}>
                {showCategoryHeader && (
                  <div className="px-3 pt-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    {item.category}
                  </div>
                )}
                <div
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-darkroom-card border border-tool-diligence/50 text-white shadow-sm'
                      : 'hover:bg-darkroom-card/50 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl bg-darkroom-bg border border-darkroom-border shrink-0 ${item.iconColor}`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{item.label}</div>
                      {item.description ? (
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          {item.description}
                        </div>
                      ) : (
                        <div className="text-[11px] font-mono text-slate-500">{item.category}</div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono text-tool-diligence flex items-center gap-1 shrink-0">
                      <span>Select</span>
                      <ArrowRight className="size-3" />
                    </span>
                  )}
                </div>
              </React.Fragment>
            );
          })}

          {filteredItems.length === 0 && !search.trim() && (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No matching commands or actions found.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-3 bg-darkroom-bg border-t border-darkroom-border flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-darkroom-card border border-darkroom-border text-slate-300 text-[10px]">
                ↑↓
              </kbd>
              <span>navigate</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-darkroom-card border border-darkroom-border text-slate-300 text-[10px]">
                ↵
              </kbd>
              <span>select</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-darkroom-card border border-darkroom-border text-slate-300 text-[10px]">
                esc
              </kbd>
              <span>close</span>
            </span>
          </div>

          <button
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-keyboard-shortcuts'));
              onClose();
            }}
          >
            <Keyboard className="size-3 text-tool-diligence" />
            <span>Shortcuts</span>
          </button>
        </div>
      </div>
    </div>
  );
};

