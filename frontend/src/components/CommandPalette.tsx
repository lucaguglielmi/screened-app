import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Palette, 
  Scale, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Command, 
  X
} from 'lucide-react';
import { ActiveTool } from '../types/investigation';


interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ActiveTool) => void;
  onSearchFestival: (name: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
}

export const CommandPalette: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectTool,
  onSearchFestival,
  theme,
  onToggleTheme,
  soundMuted,
  onToggleSound,
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
      action: () => { onSelectTool('CONVERSATIONAL_DESK'); onClose(); },
    },
    {
      id: 'diligence',
      label: 'Due Diligence (Cinema Investigation)',
      category: 'Workspaces',
      icon: ShieldCheck,
      iconColor: 'text-[#00D29E]',
      action: () => { onSelectTool('DUE_DILIGENCE'); onClose(); },
    },
    {
      id: 'scout',
      label: 'Opportunity Scout (Slate Matching)',
      category: 'Workspaces',
      icon: Compass,
      iconColor: 'text-[#F43F5E]',
      action: () => { onSelectTool('OPPORTUNITY_SCOUT'); onClose(); },
    },
    {
      id: 'why',
      label: 'Why Screened Exists (Problem & Impact)',
      category: 'Evidence & Research',
      icon: Scale,
      iconColor: 'text-indigo-300',
      action: () => { onSelectTool('WHY_SCREENED'); onClose(); },
    },
    {
      id: 'tokens',
      label: 'Design Tokens & Motion Lab',
      category: 'Design Playground',
      icon: Palette,
      iconColor: 'text-purple-400',
      action: () => { onSelectTool('DESIGN_PLAYGROUND'); onClose(); },
    },
    {
      id: 'theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'Preferences',
      icon: theme === 'dark' ? Sun : Moon,
      iconColor: 'text-amber-400',
      action: () => { onToggleTheme(); onClose(); },
    },
    {
      id: 'sound',
      label: `${soundMuted ? 'Unmute' : 'Mute'} Audio Feedback`,
      category: 'Preferences',
      icon: soundMuted ? Volume2 : VolumeX,
      iconColor: 'text-rose-400',
      action: () => { onToggleSound(); onClose(); },
    },
  ];

  const filteredItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
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
        className="w-full max-w-xl rounded-3xl bg-[#0E1124] border border-[#22274C] shadow-2xl shadow-black/90 overflow-hidden space-y-0 text-slate-200"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1A1E3D] bg-[#070913]">
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
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-[#141731] px-2 py-0.5 rounded-md border border-[#23284E]">
            <Command className="size-3" />
            <span>K</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#1A1E3D] text-slate-400 hover:text-white transition-colors cursor-pointer"
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
              className="p-3 rounded-2xl bg-[#151936] hover:bg-[#1D224A] border border-[#00D29E]/30 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#00D29E]/20 text-[#00D29E]">
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
              <ArrowRight className="size-4 text-[#00D29E]" />
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
                    ? 'bg-[#181D40] border border-indigo-500/40 text-white'
                    : 'hover:bg-[#121633] text-slate-300 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-[#070913] border border-[#1A1E3D] ${item.iconColor}`}>
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
        <div className="px-5 py-2.5 bg-[#070913] border-t border-[#1A1E3D] flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Navigate with ↑ ↓</span>
          <span>Enter to execute • Esc to dismiss</span>
        </div>
      </div>
    </div>
  );
};
