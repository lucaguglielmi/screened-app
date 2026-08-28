import React, { useState } from 'react';
import { Button, ButtonVariant, ButtonSize, IconAnimationType } from '../ui/Button';
import { TextLink } from '../ui/TextLink';
import { VectorFieldBackground } from '../animations/VectorFieldBackground';
import { soundEffects } from '../../utils/audio';
import { Copy, Check, Sparkles, ShieldCheck, Compass } from 'lucide-react';

const UI_PALETTE_1 = [
  { name: 'Void Black', hex: 'var(--color-void)', role: 'Deepest backdrop canvas', text: 'var(--color-white)' },
  { name: 'Midnight Base', hex: 'var(--color-midnight-base)', role: 'Primary dark background', text: 'var(--color-white)' },
  {
    name: 'Midnight Surface',
    hex: 'var(--color-darkroom-surface)',
    role: 'Panels, navigation rails, cards',
    text: 'var(--color-white)',
  },
  { name: 'Midnight Card', hex: 'var(--color-darkroom-card)', role: 'Elevated interactive cards', text: 'var(--color-white)' },
  { name: 'Midnight Border', hex: 'var(--color-midnight-border)', role: 'Subtle borders and dividers', text: 'var(--color-white)' },
  { name: 'Deep Indigo', hex: 'var(--color-deep-indigo)', role: 'Accent containers and badges', text: 'var(--color-white)' },
  { name: 'Royal Violet', hex: 'var(--color-royal-violet)', role: 'Glowing ambient highlights', text: 'var(--color-white)' },
  {
    name: 'Royal Desk Blue',
    hex: 'var(--color-midnight-royal)',
    role: 'The Desk brand primary (default)',
    text: 'var(--color-white)',
  },
];

const TOOL_PALETTE_2 = [
  {
    tool: 'The Desk (AI Executive)',
    colorName: 'Royal Desk Blue (Palette 1)',
    hex: 'var(--color-midnight-royal)',
    role: 'Conversational agent, default site-wide brand, chat bubbles',
    icon: Sparkles,
    badgeBg: 'bg-midnight-royal/20',
    badgeBorder: 'border-midnight-royal/40',
    badgeText: 'text-indigo-400',
  },
  {
    tool: 'Due Diligence',
    colorName: 'Bright Neon Mint (Palette 2)',
    hex: 'var(--color-tool-diligence)',
    role: 'Multi-agent cinema investigation, trade registries, evidence dossiers',
    icon: ShieldCheck,
    badgeBg: 'bg-tool-diligence/20',
    badgeBorder: 'border-tool-diligence/40',
    badgeText: 'text-tool-diligence',
  },
  {
    tool: 'Opportunity Scout',
    colorName: 'Bright Electric Purple / Violet (Palette 2)',
    hex: 'var(--color-tool-scout)',
    role: 'Film slate matching, deadline calendars, qualifying submission strategy',
    icon: Compass,
    badgeBg: 'bg-tool-scout/20',
    badgeBorder: 'border-tool-scout/40',
    badgeText: 'text-tool-scout',
  },
];

export const UiGalleryLab: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<ButtonVariant>('primary');
  const [selectedSize, setSelectedSize] = useState<ButtonSize>('md');
  const [selectedIcon, setSelectedIcon] = useState<IconAnimationType>('arrow-right');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [iconPos, setIconPos] = useState<'left' | 'right'>('right');
  const [clickCount, setClickCount] = useState<number>(0);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [statusLog, setStatusLog] = useState<string>(
    'Hover any button or link to test icon-specific micro-animations.',
  );

  // Vector field interactive state
  const [vfColor, setVfColor] = useState('var(--color-tool-scout)');
  const [vfSpeed, setVfSpeed] = useState(0.6);
  const [vfAmplitude, setVfAmplitude] = useState(0.24);
  const [vfSpacing, setVfSpacing] = useState(28);
  const [vfLength, setVfLength] = useState(7);
  const [vfOpacity, setVfOpacity] = useState(0.7);
  const [vfBlobCoverage, setVfBlobCoverage] = useState(0.75);

  const logAction = (msg: string) => {
    setStatusLog(`[${new Date().toLocaleTimeString()}] ${msg}`);
  };

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    soundEffects.playClick();
    logAction(`Copied color token: ${hex}`);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const iconOptions: { type: IconAnimationType; label: string; desc: string }[] = [
    {
      type: 'arrow-right',
      label: 'Arrow Right',
      desc: 'Soft horizontal nudge right (group-hover:translate-x-1.5)',
    },
    {
      type: 'arrow-up-right',
      label: 'Arrow Up-Right',
      desc: 'Diagonal nudge up & right (group-hover:translate-x-1 -translate-y-1)',
    },
    {
      type: 'plus',
      label: 'Plus (+)',
      desc: '180-degree rotation on self (group-hover:rotate-180)',
    },
    {
      type: 'chevron-down',
      label: 'Chevron Down',
      desc: 'Subtle vertical float / shift down (group-hover:translate-y-1)',
    },
    {
      type: 'sparkles',
      label: 'Sparkles (✦)',
      desc: 'Gentle twinkle & scale pulse (group-hover:scale-125 rotate-12)',
    },
    {
      type: 'search',
      label: 'Search Lens',
      desc: 'Subtle lens pulse & tilt (group-hover:scale-115 -rotate-6)',
    },
    {
      type: 'refresh',
      label: 'Refresh / Sync',
      desc: '180-degree spin cycle (group-hover:rotate-180)',
    },
    {
      type: 'external',
      label: 'External Pop',
      desc: 'Corner diagonal pop (group-hover:translate-x-0.5 -translate-y-0.5)',
    },
    { type: 'check', label: 'Checkmark (✓)', desc: 'Elastic scale pop with emerald tint' },
    { type: 'mail', label: 'Mail Warning', desc: 'Gentle float and tilt with rose accent' },
    { type: 'help', label: 'Help / Question', desc: 'Curiosity tilt and scale pulse' },
    { type: 'doc', label: 'Doc Treatment', desc: 'Document scale lift with indigo accent' },
    {
      type: 'send',
      label: 'Send Airplane (✈)',
      desc: 'Paper airplane diagonal flight (group-hover:translate-x-1 -translate-y-1 rotate-12)',
    },
    {
      type: 'film',
      label: 'Cinema Reel (🎞)',
      desc: '45-degree cinematic spin (group-hover:rotate-45 scale-115)',
    },
    {
      type: 'clapper',
      label: 'Clapperboard (🎬)',
      desc: 'Clapper snap scale & tilt (group-hover:scale-115 -rotate-6)',
    },
  ];

  return (
    <div className="space-y-12 animate-fade-in text-zinc-100">
      {/* Header Banner */}
      <div className="py-2 border-b border-darkroom-border pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 text-base font-bold ring-1 ring-blue-500/40">
                ✨
              </span>
              <h2 className="text-2xl font-bold text-zinc-100 tracking-tight font-serif">
                UI Components & Design Tokens
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Streamlined Buttons, Animated Text Links, Icon Motion Matrix, and Color Palettes.
            </p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-midnight border border-zinc-800 text-xs font-mono text-indigo-300">
            {statusLog}
          </div>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE BUTTON BUILDER (Streamlined 3 Standard Sizes) */}
      <section className="space-y-6">
        <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
              1. Interactive Button Playground
            </h3>
            <p className="text-xs text-zinc-400">
              Configure styles, icon animations, loading states, and live audio feedback.
            </p>
          </div>
          <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            Clicks: {clickCount}
          </span>
        </div>

        {/* Live Preview Card */}
        <div className="p-8 rounded-2xl bg-darkroom-bg flex flex-col sm:flex-row items-center justify-around gap-6 shadow-xl border border-darkroom-border">
          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              Live Configured Button
            </span>
            <Button
              variant={selectedVariant}
              size={selectedSize}
              iconType={selectedIcon}
              iconPosition={iconPos}
              isLoading={isLoading}
              disabled={isDisabled}
              onClick={() => {
                setClickCount((c) => c + 1);
                logAction(
                  `Clicked live button (${selectedVariant}, size: ${selectedSize}, icon: ${selectedIcon})`,
                );
              }}
            >
              Launch Due Diligence
            </Button>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              Accent Tool Button
            </span>
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
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              Ghost & Outline
            </span>
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
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
              Variants
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  'primary',
                  'secondary',
                  'outline',
                  'ghost',
                  'danger',
                  'accent',
                  'glass',
                ] as ButtonVariant[]
              ).map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedVariant(v);
                  }}
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

          {/* Size & Position Selector (Streamlined to 3 Clean Sizes: sm, md, lg) */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
              Size & Icon Alignment
            </label>
            <div className="flex gap-2">
              <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                {(['sm', 'md', 'lg'] as ButtonSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      soundEffects.playClick();
                      setSelectedSize(s);
                    }}
                    className={`px-3 py-1 rounded text-xs font-mono uppercase transition-colors cursor-pointer ${
                      selectedSize === s
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
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
                    onClick={() => {
                      soundEffects.playClick();
                      setIconPos(pos);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono capitalize transition-colors cursor-pointer ${
                      iconPos === pos
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
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
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
              State Overrides
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsLoading(!isLoading);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  isLoading
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                }`}
              >
                {isLoading ? '⏳ Loading: ON' : 'Loading: OFF'}
              </button>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsDisabled(!isDisabled);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  isDisabled
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                }`}
              >
                {isDisabled ? '🚫 Disabled: ON' : 'Disabled: OFF'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ICON-SPECIFIC MOTION SHOWCASE */}
      <section className="space-y-4 pt-4 border-t border-zinc-800">
        <div className="border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
            2. Icon-Specific Micro-Animation Matrix
          </h3>
          <p className="text-xs text-zinc-400">
            Hover each button to inspect dedicated icon behaviors (nudges, 180° rotations, vertical floats, scale pulses).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {iconOptions.map((opt) => (
            <div
              key={opt.type}
              className="p-3.5 rounded-xl bg-darkroom-surface flex flex-col justify-between space-y-3 border border-darkroom-border"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 font-mono">{opt.label}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{opt.type}</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-snug line-clamp-2">{opt.desc}</p>
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
                  Hover
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: REUSABLE TEXT LINKS GALLERY */}
      <section className="space-y-4 pt-4 border-t border-zinc-800">
        <div className="border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
            3. Animated Text Links with Icon Motion
          </h3>
          <p className="text-xs text-zinc-400">
            Interactive inline links with animated underlines and corresponding micro-animated icons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-midnight/90 space-y-2 border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              Primary Help Link
            </span>
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
            <p className="text-xs text-zinc-400">
              Pulsing help icon with smooth blue underline on hover.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-midnight/90 space-y-2 border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              Emerald Diligence Link
            </span>
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

          <div className="p-4 rounded-xl bg-midnight/90 space-y-2 border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              Rose Scam Audit Link
            </span>
            <TextLink
              variant="rose"
              size="sm"
              iconType="mail"
              asButton
              onActionClick={() => logAction('Clicked Rose Scam Audit TextLink')}
            >
              Analyze Unsolicited Email
            </TextLink>
            <p className="text-xs text-zinc-400">
              Hover tilt on envelope with warning rose underline.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-midnight/90 space-y-2 border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              Amber Roadmap Link
            </span>
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

          <div className="p-4 rounded-xl bg-midnight/90 space-y-2 border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              Plus Action Link
            </span>
            <TextLink
              variant="white"
              size="sm"
              iconType="plus"
              asButton
              onActionClick={() => logAction('Clicked Plus Action TextLink')}
            >
              Add Comparison Festival
            </TextLink>
            <p className="text-xs text-zinc-400">
              Rotates 180° on hover with clean white underline.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-midnight/90 space-y-2 border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              Cinema Reel Link
            </span>
            <TextLink
              variant="purple"
              size="sm"
              iconType="film"
              asButton
              onActionClick={() => logAction('Clicked Cinema Reel TextLink')}
            >
              Analyze Screenplay & Reel
            </TextLink>
            <p className="text-xs text-zinc-400">
              45-degree cinematic reel spin with purple accent.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: COLOR PALETTES & DESIGN TOKENS */}
      <section className="space-y-6 pt-4 border-t border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
            4. Color Palettes & Workspace Identities
          </h3>
          <p className="text-xs text-zinc-400">
            Midnight UI canvas system and distinct tool identities.
          </p>
        </div>

        {/* Midnight UI Swatches */}
        <div className="space-y-3">
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
            Palette 1: Midnight Darkroom UI (Site-Wide Base)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {UI_PALETTE_1.map((swatch) => (
              <div
                key={swatch.name}
                onClick={() => handleCopy(swatch.hex)}
                className="p-2.5 rounded-xl bg-darkroom-surface hover:bg-darkroom-card transition-all cursor-pointer group space-y-2 border border-darkroom-border"
              >
                <div
                  className="h-12 w-full rounded-lg border border-white/10 flex items-end justify-end p-1.5"
                  style={{ backgroundColor: swatch.hex }}
                >
                  {copiedHex === swatch.hex && <Check className="size-3 text-emerald-400" />}
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white truncate">{swatch.name}</div>
                  <div className="text-[9px] font-mono text-indigo-300 truncate">{swatch.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tool Palettes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {TOOL_PALETTE_2.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.tool}
                className="p-4 rounded-2xl bg-darkroom-surface space-y-3 relative overflow-hidden border border-darkroom-border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-9 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                    style={{ backgroundColor: tool.hex }}
                  >
                    <Icon className="size-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{tool.tool}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{tool.hex}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{tool.role}</p>
                <button
                  onClick={() => handleCopy(tool.hex)}
                  className="w-full py-1.5 px-3 rounded-lg bg-darkroom-card hover:bg-darkroom-border border border-darkroom-border text-xs font-mono flex items-center justify-center gap-1.5 text-slate-300 transition-colors cursor-pointer"
                >
                  {copiedHex === tool.hex ? (
                    <Check className="size-3 text-emerald-400" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span>{copiedHex === tool.hex ? 'Copied' : 'Copy Hex'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 5: CONTAINED VECTOR FIELD LAB */}
      <section className="space-y-4 pt-4 border-t border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <span>5. Organic Magnetic Vector Field Laboratory</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Contained Card Preview
            </span>
          </h3>
          <p className="text-xs text-zinc-400">
            Interactive ferrofluid field lines masked within a contained preview canvas.
          </p>
        </div>

        {/* Live Vector Field Container - strictly constrained */}
        <div className="relative h-64 w-full rounded-2xl bg-darkroom-bg overflow-hidden shadow-2xl flex items-center justify-center border border-darkroom-border">
          <VectorFieldBackground
            position="absolute"
            color={vfColor}
            speed={vfSpeed}
            amplitude={vfAmplitude}
            gridSpacing={vfSpacing}
            dropletLength={vfLength}
            blobCoverage={vfBlobCoverage}
            opacity={vfOpacity}
          />
          <div className="relative z-10 text-center space-y-1.5 p-4 rounded-xl bg-darkroom-bg/85 backdrop-blur-md border border-darkroom-border max-w-sm shadow-xl">
            <h4 className="font-serif text-sm font-bold text-white">
              Subterranean Magnet Simulation
            </h4>
            <p className="text-xs text-slate-300">
              Move cursor across this card to see magnetic deflection in real-time.
            </p>
          </div>
        </div>

        {/* Vector Field Controls */}
        <div className="p-4 rounded-2xl bg-darkroom-surface grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border border-darkroom-border text-xs">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-slate-400 uppercase">Needle Color</label>
            <div className="flex items-center gap-2">
              {['var(--color-tool-scout)', 'var(--color-midnight-royal)', 'var(--color-tool-diligence)', 'var(--color-royal-violet)'].map((c) => (
                <button
                  key={c}
                  onClick={() => setVfColor(c)}
                  className={`size-6 rounded-full border transition-transform cursor-pointer ${
                    vfColor === c ? 'scale-125 border-white shadow-md' : 'border-transparent opacity-70'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-slate-400">
              <span>Speed</span>
              <span>{vfSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={2.0}
              step={0.1}
              value={vfSpeed}
              onChange={(e) => setVfSpeed(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-slate-400">
              <span>Wave Amplitude</span>
              <span>{(vfAmplitude * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.8}
              step={0.05}
              value={vfAmplitude}
              onChange={(e) => setVfAmplitude(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-slate-400">
              <span>Blob Coverage</span>
              <span>{(vfBlobCoverage * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={1.0}
              step={0.05}
              value={vfBlobCoverage}
              onChange={(e) => setVfBlobCoverage(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-slate-400">
              <span>Grid Density</span>
              <span>{vfSpacing}px</span>
            </div>
            <input
              type="range"
              min={20}
              max={50}
              step={2}
              value={vfSpacing}
              onChange={(e) => setVfSpacing(parseInt(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-slate-400">
              <span>Needle Length</span>
              <span>{vfLength}px</span>
            </div>
            <input
              type="range"
              min={4}
              max={20}
              step={1}
              value={vfLength}
              onChange={(e) => setVfLength(parseInt(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-slate-400">
              <span>Field Opacity</span>
              <span>{(vfOpacity * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={vfOpacity}
              onChange={(e) => setVfOpacity(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
