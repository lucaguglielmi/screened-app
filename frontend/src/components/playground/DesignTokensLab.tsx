import React, { useState } from 'react';
import { Copy, Check, Sparkles, ShieldCheck, Compass, Palette } from 'lucide-react';
import { 

  NeonCyberBar, 
  PipelineStepperBar, 
  FilmSprocketScanner, 
  QuantumWaveLoader, 
  OrbitalReactorLoader 
} from '../animations/AnimatedLoaders';
import { VectorFieldBackground } from '../animations/VectorFieldBackground';
import { soundEffects } from '../../utils/audio';

const UI_PALETTE_1 = [
  { name: 'Void Black', hex: '#05050A', role: 'Deepest backdrop canvas', text: '#FFFFFF' },
  { name: 'Midnight Base', hex: '#070913', role: 'Primary dark background', text: '#FFFFFF' },
  { name: 'Midnight Surface', hex: '#0E1124', role: 'Panels, navigation rails, cards', text: '#FFFFFF' },
  { name: 'Midnight Card', hex: '#141731', role: 'Elevated interactive cards', text: '#FFFFFF' },
  { name: 'Midnight Border', hex: '#22274C', role: 'Subtle borders and dividers', text: '#FFFFFF' },
  { name: 'Deep Indigo', hex: '#1E124A', role: 'Accent containers and badges', text: '#FFFFFF' },
  { name: 'Royal Violet', hex: '#2E107D', role: 'Glowing ambient highlights', text: '#FFFFFF' },
  { name: 'Royal Desk Blue', hex: '#2018E6', role: 'The Desk brand primary (default)', text: '#FFFFFF' },
];

const TOOL_PALETTE_2 = [
  {
    tool: 'The Desk (AI Executive)',
    colorName: 'Royal Desk Blue (Palette 1)',
    hex: '#2018E6',
    role: 'Conversational agent, default site-wide brand, chat bubbles',
    icon: Sparkles,
    badgeBg: 'bg-[#2018E6]/20',
    badgeBorder: 'border-[#2018E6]/40',
    badgeText: 'text-indigo-400',
  },
  {
    tool: 'Due Diligence',
    colorName: 'Mint / Emerald Teal',
    hex: '#00D29E',
    role: 'Multi-agent cinema investigation, trade registries, evidence dossiers',
    icon: ShieldCheck,
    badgeBg: 'bg-[#00D29E]/20',
    badgeBorder: 'border-[#00D29E]/40',
    badgeText: 'text-[#00D29E]',
  },
  {
    tool: 'Opportunity Scout',
    colorName: 'Coral Rose / Watermelon',
    hex: '#F43F5E',
    role: 'Film slate matching, deadline calendars, qualifying submission strategy',
    icon: Compass,
    badgeBg: 'bg-[#F43F5E]/20',
    badgeBorder: 'border-[#F43F5E]/40',
    badgeText: 'text-[#F43F5E]',
  },
];

export const DesignTokensLab: React.FC = () => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  
  // Vector field interactive state
  const [vfColor, setVfColor] = useState('#E11D48');
  const [vfSpeed, setVfSpeed] = useState(0.6);
  const [vfAmplitude, setVfAmplitude] = useState(0.24);
  const [vfSpacing, setVfSpacing] = useState(28);
  const [vfLength, setVfLength] = useState(7);
  const [vfOpacity, setVfOpacity] = useState(0.70);
  const [vfBlobCoverage, setVfBlobCoverage] = useState(0.75);

  // Loader interactive state
  const [progressVal, setProgressVal] = useState(68);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    soundEffects.playClick();
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="space-y-12 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="border-b border-[#22274C] pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-[#2018E6]/20 border border-[#2018E6]/40 text-indigo-400">
            <Palette className="size-6" />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-white">
              Design Playground
            </h2>
            <p className="text-sm text-slate-400">
              Palette variables, tool identity guidelines, droplet vector fields, and animated loaders.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PALETTE 1: MIDNIGHT UI & THE DESK COLOR SCHEME */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🌌 Palette 1: Midnight Darkroom UI</span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#2018E6]/20 text-indigo-300 border border-[#2018E6]/30">
                Site-Wide Default & The Desk
              </span>
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Curated midnight, indigo, violet, and royal ultramarine tones for background depth, surface contrast, and chat interface.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {UI_PALETTE_1.map((swatch) => (
            <div
              key={swatch.hex}
              onClick={() => handleCopy(swatch.hex)}
              className="p-4 rounded-2xl bg-[#0E1124] border border-[#22274C] hover:border-indigo-500/60 transition-all cursor-pointer group space-y-3 shadow-lg"
            >
              {/* Color preview box */}
              <div
                className="h-20 w-full rounded-xl border border-white/10 flex items-end justify-end p-2.5 shadow-inner transition-transform group-hover:scale-[1.02]"
                style={{ backgroundColor: swatch.hex }}
              >
                <button
                  type="button"
                  className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-md text-[11px] font-mono text-white flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedHex === swatch.hex ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  <span>{copiedHex === swatch.hex ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white text-base">{swatch.name}</h4>
                  <span className="font-mono text-xs text-indigo-300">{swatch.hex}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{swatch.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PALETTE 2: TOOL COLOR SYSTEM (2 TOOLS + DESK) */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-4 border-t border-[#22274C]">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎯 Palette 2: Tool Color Architecture</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Tool Differentiation
            </span>
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Distinctive colors assigned to each tool workspace while maintaining unified darkroom contrast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOOL_PALETTE_2.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.tool}
                className="p-6 rounded-3xl bg-[#0E1124] border border-[#22274C] space-y-4 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: tool.hex }}
                />

                <div className="flex items-center gap-3">
                  <div
                    className="size-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: tool.hex }}
                  >
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-white">{tool.tool}</h4>
                    <span className="text-xs font-mono text-slate-400">{tool.colorName}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#070913] border border-[#1A1E3D] space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">HEX Code:</span>
                    <span className="font-bold" style={{ color: tool.hex }}>{tool.hex}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Workspace Role:</span>
                    <span className="text-slate-200">Active</span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{tool.role}</p>

                <button
                  onClick={() => handleCopy(tool.hex)}
                  className="w-full py-2 px-3 rounded-xl bg-[#141731] hover:bg-[#1C2145] border border-[#23284E] text-xs font-mono flex items-center justify-center gap-2 text-slate-300 transition-colors cursor-pointer"
                >
                  {copiedHex === tool.hex ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  <span>{copiedHex === tool.hex ? 'Hex Copied!' : `Copy ${tool.hex}`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ANIMATED DROPLET VECTOR FIELD LABORATORY (Reference Image Animation) */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-4 border-t border-[#22274C]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🧲 Organic Magnetic Vector Field</span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Interactive Ferrofluid Mask
              </span>
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Sharp micro-needles aligning to subterranean moving magnetic poles (attractor, vortex, and cursor dipole) masked within an independently morphing 70% organic fluid blob.
            </p>
          </div>
        </div>

        {/* Live Vector Field Container */}
        <div className="relative h-80 w-full rounded-3xl bg-[#090C16] border border-[#22274C] overflow-hidden shadow-2xl flex items-center justify-center">
          <VectorFieldBackground
            color={vfColor}
            speed={vfSpeed}
            amplitude={vfAmplitude}
            gridSpacing={vfSpacing}
            dropletLength={vfLength}
            blobCoverage={vfBlobCoverage}
            opacity={vfOpacity}
          />
          <div className="relative z-10 text-center space-y-2 p-6 rounded-2xl bg-[#070913]/85 backdrop-blur-md border border-[#22274C] max-w-md shadow-2xl">
            <h4 className="font-serif text-lg font-bold text-white">Subterranean Magnet Simulation</h4>
            <p className="text-xs text-slate-300">
              Move your mouse across this area to see the interactive magnetic dipole distort the ferrofluid field lines in real-time.
            </p>
          </div>
        </div>

        {/* Vector Field Controls */}
        <div className="p-6 rounded-3xl bg-[#0E1124] border border-[#22274C] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Color Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase">Needle Glow Color</label>
            <div className="flex items-center gap-2">
              {['#E11D48', '#FF2A55', '#2018E6', '#00D29E', '#A855F7'].map((c) => (
                <button
                  key={c}
                  onClick={() => setVfColor(c)}
                  className={`size-7 rounded-full border-2 transition-transform cursor-pointer ${
                    vfColor === c ? 'scale-125 border-white shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Speed */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Magnet Transit Speed</span>
              <span>{vfSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={2.5}
              step={0.1}
              value={vfSpeed}
              onChange={(e) => setVfSpeed(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Amplitude */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
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
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Blob Coverage */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Organic Blob Span</span>
              <span>{(vfBlobCoverage * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={1.0}
              step={0.05}
              value={vfBlobCoverage}
              onChange={(e) => setVfBlobCoverage(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Grid Spacing */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Grid Density (Sharp)</span>
              <span>{vfSpacing}px</span>
            </div>
            <input
              type="range"
              min={20}
              max={50}
              step={2}
              value={vfSpacing}
              onChange={(e) => setVfSpacing(parseInt(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Needle Length */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Needle Length (Micro)</span>
              <span>{vfLength}px</span>
            </div>
            <input
              type="range"
              min={4}
              max={24}
              step={1}
              value={vfLength}
              onChange={(e) => setVfLength(parseInt(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
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
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 4. ANIMATED LOADERS SUITE */}
      {/* ========================================================================= */}
      <section className="space-y-6 pt-4 border-t border-[#22274C]">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>⚡ Animated Loaders & Status Indicators</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Framer Motion
            </span>
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Production-grade loading bars and orbital status spinners for investigation phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Neon Cyber Bar */}
          <div className="p-6 rounded-3xl bg-[#0E1124] border border-[#22274C] space-y-4">
            <h4 className="font-semibold text-base text-white">1. Neon Cyber Progress Bar</h4>
            <NeonCyberBar progress={progressVal} label="Mining Trade Registries & Press Archives..." />
            <div className="flex items-center gap-3 pt-2">
              <input
                type="range"
                min={0}
                max={100}
                value={progressVal}
                onChange={(e) => setProgressVal(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-mono text-indigo-400">{progressVal}%</span>
            </div>
          </div>

          {/* 2. Indeterminate Laser Sweep */}
          <div className="p-6 rounded-3xl bg-[#0E1124] border border-[#22274C] space-y-4">
            <h4 className="font-semibold text-base text-white">2. Indeterminate Agent Laser Sweep</h4>
            <NeonCyberBar label="Executive Producer Reasoning..." />
            <p className="text-xs text-slate-400">Used during Vertex AI streaming inference & tool orchestration.</p>
          </div>

          {/* 3. Film Sprocket Scanner */}
          <div className="p-6 rounded-3xl bg-[#0E1124] border border-[#22274C] space-y-4">
            <h4 className="font-semibold text-base text-white">3. Film Celluloid Scanner</h4>
            <FilmSprocketScanner label="Scanning Physical Screening Leases..." />
          </div>

          {/* 4. Quantum Harmonic Wave */}
          <div className="p-6 rounded-3xl bg-[#0E1124] border border-[#22274C] space-y-4">
            <h4 className="font-semibold text-base text-white">4. Quantum Harmonic Wave</h4>
            <QuantumWaveLoader bars={22} height={42} />
            <p className="text-xs text-center text-slate-400">Contradiction analyst synthesis equalizer</p>
          </div>

          {/* 5. Pipeline Stepper */}
          <div className="p-6 rounded-3xl bg-[#0E1124] border border-[#22274C] space-y-4 md:col-span-2">
            <h4 className="font-semibold text-base text-white">5. Multi-Phase Investigation Stepper</h4>
            <PipelineStepperBar currentStep={2} />
          </div>

          {/* 6. Orbital Reactor */}
          <div className="p-6 rounded-3xl bg-[#0E1124] border border-[#22274C] space-y-4 md:col-span-2 flex flex-col items-center">
            <h4 className="font-semibold text-base text-white mb-2">6. Orbital Dual-Ring Reactor</h4>
            <OrbitalReactorLoader size={76} label="Synthesizing Cryptographic Evidence Dossier..." />
          </div>
        </div>
      </section>
    </div>
  );
};
