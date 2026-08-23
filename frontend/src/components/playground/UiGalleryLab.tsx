import React, { useState } from 'react';
import { Button, ButtonVariant, ButtonSize, IconAnimationType } from '../ui/Button';
import { TextLink } from '../ui/TextLink';
import { AgentAvatar } from '../chat/AgentAvatar';
import { soundEffects } from '../../utils/audio';

export const UiGalleryLab: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<ButtonVariant>('primary');
  const [selectedSize, setSelectedSize] = useState<ButtonSize>('md');
  const [selectedIcon, setSelectedIcon] = useState<IconAnimationType>('arrow-right');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [iconPos, setIconPos] = useState<'left' | 'right'>('right');
  const [clickCount, setClickCount] = useState<number>(0);
  const [statusLog, setStatusLog] = useState<string>('Hover any button or link to test icon-specific micro-animations.');

  const logAction = (msg: string) => {
    setStatusLog(`[${new Date().toLocaleTimeString()}] ${msg}`);
  };

  const iconOptions: { type: IconAnimationType; label: string; desc: string }[] = [
    { type: 'arrow-right', label: 'Arrow Right', desc: 'Soft horizontal nudge right (group-hover:translate-x-1.5)' },
    { type: 'arrow-up-right', label: 'Arrow Up-Right', desc: 'Diagonal nudge up & right (group-hover:translate-x-1 -translate-y-1)' },
    { type: 'plus', label: 'Plus (+)', desc: '180-degree rotation on self (group-hover:rotate-180)' },
    { type: 'chevron-down', label: 'Chevron Down', desc: 'Subtle vertical float / shift down (group-hover:translate-y-1)' },
    { type: 'sparkles', label: 'Sparkles (✦)', desc: 'Gentle twinkle & scale pulse (group-hover:scale-125 rotate-12)' },
    { type: 'search', label: 'Search Lens', desc: 'Subtle lens pulse & tilt (group-hover:scale-115 -rotate-6)' },
    { type: 'refresh', label: 'Refresh / Sync', desc: '180-degree spin cycle (group-hover:rotate-180)' },
    { type: 'external', label: 'External Pop', desc: 'Corner diagonal pop (group-hover:translate-x-0.5 -translate-y-0.5)' },
    { type: 'check', label: 'Checkmark (✓)', desc: 'Elastic scale pop with emerald tint' },
    { type: 'mail', label: 'Mail Warning', desc: 'Gentle float and tilt with rose accent' },
    { type: 'help', label: 'Help / Question', desc: 'Curiosity tilt and scale pulse' },
    { type: 'doc', label: 'Doc Treatment', desc: 'Document scale lift with indigo accent' },
    { type: 'send', label: 'Send Airplane (✈)', desc: 'Paper airplane diagonal flight (group-hover:translate-x-1 -translate-y-1 rotate-12)' },
    { type: 'film', label: 'Cinema Reel (🎞)', desc: '45-degree cinematic spin (group-hover:rotate-45 scale-115)' },
    { type: 'clapper', label: 'Clapperboard (🎬)', desc: 'Clapper snap scale & tilt (group-hover:scale-115 -rotate-6)' },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-zinc-100">
      {/* Header Banner */}
      <div className="py-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 text-base font-bold ring-1 ring-blue-500/40">
                ✨
              </span>
              <h2 className="text-xl font-bold text-zinc-100 tracking-tight font-serif">
                Shared UI Component Gallery & Icon Motion Lab
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Reusable Buttons, Text Links, and icon-specific micro-animations used throughout Screened.
            </p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-midnight border border-zinc-800 text-xs font-mono text-indigo-300">
            {statusLog}
          </div>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE BUTTON BUILDER & MOTION PLAYGROUND */}
      <section className="space-y-6">
        <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
              1. Interactive Button Playground
            </h3>
            <p className="text-xs text-zinc-400">Configure styles, icon animations, loading states, and live audio feedback.</p>
          </div>
          <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            Clicks: {clickCount}
          </span>
        </div>

        {/* Live Preview Card */}
        <div className="p-8 rounded-xl bg-[#070913] flex flex-col sm:flex-row items-center justify-around gap-6">
          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Live Configured Button</span>
            <Button
              variant={selectedVariant}
              size={selectedSize}
              iconType={selectedIcon}
              iconPosition={iconPos}
              isLoading={isLoading}
              disabled={isDisabled}
              onClick={() => {
                setClickCount((c) => c + 1);
                logAction(`Clicked live button (${selectedVariant}, ${selectedSize}, icon: ${selectedIcon})`);
              }}
            >
              Launch Due Diligence
            </Button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Accent Tool Button</span>
            <Button
              variant="accent"
              size={selectedSize}
              iconType="sparkles"
              onClick={() => logAction('Clicked Emerald Due Diligence button')}
            >
              Verify Film Festival
            </Button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Ghost & Outline</span>
            <Button
              variant="outline"
              size={selectedSize}
              iconType="external"
              onClick={() => logAction('Clicked Outline Link button')}
            >
              External Audit
            </Button>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Variant Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">Variants</label>
            <div className="flex flex-wrap gap-1.5">
              {(['primary', 'secondary', 'outline', 'ghost', 'danger', 'accent', 'glass'] as ButtonVariant[]).map((v) => (
                <button
                  key={v}
                  onClick={() => { soundEffects.playClick(); setSelectedVariant(v); }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-all cursor-pointer ${
                    selectedVariant === v
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Size & Position Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">Size & Icon Alignment</label>
            <div className="flex gap-2">
              <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                {(['xs', 'sm', 'md', 'lg'] as ButtonSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => { soundEffects.playClick(); setSelectedSize(s); }}
                    className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-colors cursor-pointer ${
                      selectedSize === s ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                {(['left', 'right'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => { soundEffects.playClick(); setIconPos(pos); }}
                    className={`px-2.5 py-1 rounded text-xs font-mono capitalize transition-colors cursor-pointer ${
                      iconPos === pos ? 'bg-indigo-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* States Toggles */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">State Overrides</label>
            <div className="flex gap-2">
              <button
                onClick={() => { soundEffects.playClick(); setIsLoading(!isLoading); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  isLoading ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                }`}
              >
                {isLoading ? '⏳ Loading: ON' : 'Loading: OFF'}
              </button>
              <button
                onClick={() => { soundEffects.playClick(); setIsDisabled(!isDisabled); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  isDisabled ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                }`}
              >
                {isDisabled ? '🚫 Disabled: ON' : 'Disabled: OFF'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ICON-SPECIFIC MOTION SHOWCASE */}
      <section className="space-y-4 pt-4">
        <div className="border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
            2. Icon-Specific Micro-Animation Matrix
          </h3>
          <p className="text-xs text-zinc-400">
            Hover each button to see how icon behaviors differ (nudges, 180° rotations, vertical floats, scale pulses).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {iconOptions.map((opt) => (
            <div
              key={opt.type}
              className="p-3.5 rounded-xl bg-[#0E1124] flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 font-mono">{opt.label}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{opt.type}</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{opt.desc}</p>
              </div>

              <div className="pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  iconType={opt.type}
                  className="w-full justify-between"
                  onClick={() => {
                    setSelectedIcon(opt.type);
                    logAction(`Selected ${opt.label} motion preview`);
                  }}
                >
                  Hover Action
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: REUSABLE TEXT LINKS GALLERY */}
      <section className="space-y-4 pt-4">
        <div className="border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
            3. Animated Text Links with Icon Motion
          </h3>
          <p className="text-xs text-zinc-400">
            Interactive inline links with animated underlines and corresponding micro-animated icons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Primary / Blue Link */}
          <div className="p-4 rounded-xl bg-midnight/90 space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Primary Help Link</span>
            <TextLink
              variant="primary"
              size="sm"
              iconType="help"
              animatedIconContinuous
              asButton
              onActionClick={() => logAction('Clicked Primary Help TextLink')}
            >
              what can you search?
            </TextLink>
            <p className="text-xs text-zinc-400">Pulsing help icon with smooth blue underline on hover.</p>
          </div>

          {/* Emerald / Due Diligence Link */}
          <div className="p-4 rounded-xl bg-midnight/90 space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Emerald Diligence Link</span>
            <TextLink
              variant="emerald"
              size="sm"
              iconType="check"
              asButton
              onActionClick={() => logAction('Clicked Emerald Due Diligence TextLink')}
            >
              View 360° Forensic Audit
            </TextLink>
            <p className="text-xs text-zinc-400">Elastic checkmark pop with emerald accent.</p>
          </div>

          {/* Rose / Email Audit Link */}
          <div className="p-4 rounded-xl bg-midnight/90 space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Rose Scam Audit Link</span>
            <TextLink
              variant="rose"
              size="sm"
              iconType="mail"
              asButton
              onActionClick={() => logAction('Clicked Rose Scam Audit TextLink')}
            >
              Analyze Unsolicited Email
            </TextLink>
            <p className="text-xs text-zinc-400">Hover tilt on envelope with warning rose underline.</p>
          </div>

          {/* Amber / Scout Link */}
          <div className="p-4 rounded-xl bg-midnight/90 space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Amber Roadmap Link</span>
            <TextLink
              variant="amber"
              size="sm"
              iconType="sparkles"
              animatedIconContinuous
              asButton
              onActionClick={() => logAction('Clicked Amber Roadmap TextLink')}
            >
              Scout Early Bird Deadlines
            </TextLink>
            <p className="text-xs text-zinc-400">Twinkling star icon with amber underline.</p>
          </div>

          {/* Chevron Down TextLink */}
          <div className="p-4 rounded-xl bg-midnight/90 space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Expandable / Collapse Link</span>
            <TextLink
              variant="muted"
              size="sm"
              iconType="chevron-down"
              animatedIconContinuous
              asButton
              onActionClick={() => logAction('Clicked Chevron Expand TextLink')}
            >
              View more (+8 capabilities)
            </TextLink>
            <p className="text-xs text-zinc-400">Soft vertical float up & down on chevron icon.</p>
          </div>

          {/* Plus Add Link */}
          <div className="p-4 rounded-xl bg-midnight/90 space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Plus Action Link</span>
            <TextLink
              variant="white"
              size="sm"
              iconType="plus"
              asButton
              onActionClick={() => logAction('Clicked Plus Action TextLink')}
            >
              Add Comparison Festival
            </TextLink>
            <p className="text-xs text-zinc-400">Rotates 180° on hover with clean white underline.</p>
          </div>

          {/* Paper Airplane Send Link */}
          <div className="p-4 rounded-xl bg-midnight/90 space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Airplane Send Link</span>
            <TextLink
              variant="primary"
              size="sm"
              iconType="send"
              iconPosition="right"
              asButton
              onActionClick={() => logAction('Clicked Airplane Send TextLink')}
            >
              Submit Due Diligence Query
            </TextLink>
            <p className="text-xs text-zinc-400">Paper airplane diagonal takeoff flight on hover.</p>
          </div>

          {/* Cinema Reel Link */}
          <div className="p-4 rounded-xl bg-midnight/90 space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Cinema Reel Link</span>
            <TextLink
              variant="purple"
              size="sm"
              iconType="film"
              asButton
              onActionClick={() => logAction('Clicked Cinema Reel TextLink')}
            >
              Analyze Screenplay & Reel
            </TextLink>
            <p className="text-xs text-zinc-400">45-degree cinematic reel spin with purple accent.</p>
          </div>

          {/* Clapperboard Link */}
          <div className="p-4 rounded-xl bg-midnight/90 space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Clapperboard Link</span>
            <TextLink
              variant="white"
              size="sm"
              iconType="clapper"
              asButton
              onActionClick={() => logAction('Clicked Clapperboard TextLink')}
            >
              Film Festival Slate Review
            </TextLink>
            <p className="text-xs text-zinc-400">Clapper snap scale & tilt with white underline.</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: CINEMA CLAPPERBOARD AVATAR & MOTION PHYSICS */}
      <section className="space-y-6 pt-4">
        <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <span>🎬 Cinema Clapperboard Avatar Suite</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Interactive Micro-Motion
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Bright dual-color gradient with clean all-white cinema clapperboard emblem, counter-rotating orbit rings, hover wave ripples, and click modal dispatch.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Size Small */}
          <div className="p-4 rounded-xl bg-midnight/90 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Small (`sm`) - Chat Feed</span>
            <AgentAvatar size="sm" onClick={() => logAction('Clicked Small Avatar')} />
            <p className="text-[11px] text-zinc-400">Used in compact thinking states and dense chat feeds.</p>
          </div>

          {/* Size Medium */}
          <div className="p-4 rounded-xl bg-midnight/90 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Medium (`md`) - Message Bubble</span>
            <AgentAvatar size="md" onClick={() => logAction('Clicked Medium Avatar')} />
            <p className="text-[11px] text-zinc-400">Default avatar for all Mission Control agent message bubbles.</p>
          </div>

          {/* Size Large */}
          <div className="p-4 rounded-xl bg-midnight/90 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Large (`lg`) - Header Hero</span>
            <AgentAvatar size="lg" onClick={() => logAction('Clicked Large Avatar')} />
            <p className="text-[11px] text-zinc-400">Expanded display with prominent holographic sweeps.</p>
          </div>

          {/* Thinking State */}
          <div className="p-4 rounded-xl bg-midnight/90 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">Active Thinking Mode</span>
            <AgentAvatar size="md" isThinking={true} onClick={() => logAction('Clicked Thinking Avatar')} />
            <p className="text-[11px] text-zinc-400">High-speed dual-axis orbital spins and pulsating shockwaves.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
