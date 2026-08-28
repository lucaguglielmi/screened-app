import React, { useState } from 'react';
import { ChatMessage } from '../../types/chat';

import { ChatBubble } from '../chat/ChatBubble';
import { AgentThinkingPill } from '../chat/AgentThinkingPill';
import { ChatPromptBar } from '../chat/ChatPromptBar';
import { AgentAvatar, AvatarStatus } from '../chat/AgentAvatar';
import { MiniScoutCard } from '../chat/mini_apps/MiniScoutCard';
import { MiniCompareArena } from '../chat/mini_apps/MiniCompareArena';
import { FestivalIntakeCard } from '../chat/tools/FestivalIntakeCard';
import { GrantIntakeCard } from '../chat/tools/GrantIntakeCard';
import { InvitationEmailCard } from '../chat/tools/InvitationEmailCard';
import { DeepVettingMatrix } from '../investigation/DeepVettingMatrix';
import {
  NeonCyberBar,
  PipelineStepperBar,
  FilmSprocketScanner,
  QuantumWaveLoader,
  OrbitalReactorLoader,
} from '../animations/AnimatedLoaders';
import { AgentObservabilityLab } from './AgentObservabilityLab';
import { UiGalleryLab } from './UiGalleryLab';
import { FeedbackLogTab } from './FeedbackLogTab';
import { ArchitecturePage } from './ArchitecturePage';
import { FeedbackModal } from '../modals/FeedbackModal';
import { soundEffects } from '../../utils/audio';
import { Workflow, Coins, MailWarning, ShieldCheck, Sparkles, Loader2, MessageSquare, Palette } from 'lucide-react';

export const DesignPlayground: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'UI' | 'LOADERS' | 'CHAT' | 'ARCHITECTURE' | 'ALL'>('UI');
  const [activeToolSubtab, setActiveToolSubtab] = useState<
    'FESTIVAL' | 'GRANT' | 'INVITATION' | 'SCOUT' | 'COMPARE' | 'VETTING' | 'PROBES'
  >('FESTIVAL');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Avatar testing state
  const [avatarSimStatus, setAvatarSimStatus] = useState<AvatarStatus>('idle');

  // Loader interactive progress
  const [progressVal, setProgressVal] = useState(68);

  const [streamSimText, setStreamSimText] = useState<string>(
    'I have conducted an initial background check on the festival. Screening records indicate physical cinema leases at Curzon Soho.',
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [eventLogs, setEventLogs] = useState<string[]>([
    'Playground initialized in sandbox mode with AI Tool Parity active.',
  ]);

  const addLog = (msg: string) => {
    setEventLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  };

  const handleSimulateStream = () => {
    setIsSimulating(true);
    soundEffects.playClick();
    addLog('Starting token streaming simulation (30ms per word)...');
    const fullText =
      'Executive investigation complete. The screening venue at Curzon Soho is corroborated by municipal license records. However, filmmaker entry fees have escalated by 40% in recent editions without a corresponding increase in prize purse transparency.';
    let current = '';
    const words = fullText.split(' ');
    let idx = 0;

    const timer = setInterval(() => {
      if (idx < words.length) {
        current += (idx > 0 ? ' ' : '') + words[idx];
        setStreamSimText(current);
        idx++;
      } else {
        clearInterval(timer);
        setIsSimulating(false);
        soundEffects.playSuccess();
        addLog('Token stream simulation completed successfully.');
      }
    }, 50);
  };

  // Mock fixtures for Chat Bubbles
  const mockUserMsg: ChatMessage = {
    id: 'mock-user-1',
    role: 'user',
    content: 'Is Aldergate Film Festival (Test Entity) legitimate or a scam? Check their screening leases.',
    timestamp: new Date().toISOString(),
  };

  const mockAssistantMsg: ChatMessage = {
    id: 'mock-assistant-1',
    role: 'assistant',
    content:
      'I have reviewed the background for **Aldergate Film Festival (Test Entity)**.\n\nKey investigative findings:\n- **Venue Discrepancies**: Official promotional materials state gala screenings occur at the IMAX, but booking manifests list private Vimeo links.\n- **Fee Escalation**: Late entry fees average £65 with no published jury roster.\n- **Accreditation**: Not listed on BAFTA or BIFA qualifying lists.',
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-darkroom-card text-zinc-100 pb-12 w-full">
      {/* Full-width Header & Nav Bar */}
      <div className="w-full bg-darkroom-card border-b border-indigo-900/50 shadow-md mb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 text-base font-bold ring-1 ring-blue-500/40">
                🎨
              </span>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight font-serif">
                Design Playground
              </h1>
            </div>
            <p className="text-xs text-blue-200/70 mt-1">
              Visual workbench organized by topic: UI, Loaders, Chat Components & Architecture.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSimulateStream}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <span>{isSimulating ? '⏳ Streaming...' : '▶ Token Stream'}</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playSuccess();
                addLog('Sound effects chime triggered.');
              }}
              className="rounded-xl border border-blue-700/50 bg-blue-900/40 px-3 py-2 text-xs font-medium text-blue-200 hover:bg-blue-800/60 transition-colors cursor-pointer"
            >
              🔊 Audio
            </button>
          </div>
        </div>

        {/* Consolidated 4-Topic Navigation Bar */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 px-4 pb-3 overflow-x-auto">
          {[
            { id: 'UI', label: 'UI & Tokens', icon: Palette },
            { id: 'LOADERS', label: 'Loaders', icon: Loader2 },
            { id: 'CHAT', label: 'Chat Related', icon: MessageSquare },
            { id: 'ARCHITECTURE', label: 'Architecture & Traces', icon: Workflow },
            { id: 'ALL', label: 'All Components', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundEffects.playClick();
                  setActiveSection(tab.id as 'UI' | 'LOADERS' | 'CHAT' | 'ARCHITECTURE' | 'ALL');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-400/40'
                    : 'text-blue-200/70 hover:text-white hover:bg-blue-950/40 border border-transparent'
                }`}
              >
                <Icon className={`size-3.5 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {/* ========================================================================= */}
        {/* 1. TOPIC: UI COMPONENTS & DESIGN TOKENS */}
        {/* ========================================================================= */}
        {(activeSection === 'ALL' || activeSection === 'UI') && <UiGalleryLab />}

        {/* ========================================================================= */}
        {/* 2. TOPIC: LOADERS & PROGRESS INDICATORS */}
        {/* ========================================================================= */}
        {(activeSection === 'ALL' || activeSection === 'LOADERS') && (
          <div className="space-y-8 animate-fade-in">
            {/* Loaders Header */}
            <div className="border-b border-darkroom-border pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-sm font-bold">
                  ⚡
                </span>
                <h2 className="text-xl font-bold text-white font-serif">
                  Animated Loaders & Progress Indicators
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Hardware-accelerated loading bars, harmonic waves, celluloid scanners, and agent reasoning pills.
              </p>
            </div>

            {/* Loaders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Neon Cyber Bar */}
              <div className="p-6 rounded-3xl bg-darkroom-surface space-y-4 border border-darkroom-border">
                <h4 className="font-semibold text-sm text-white font-mono uppercase tracking-wider">
                  1. Neon Cyber Progress Bar
                </h4>
                <NeonCyberBar
                  progress={progressVal}
                  label="Mining Trade Registries & Press Archives..."
                />
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
              <div className="p-6 rounded-3xl bg-darkroom-surface space-y-4 border border-darkroom-border">
                <h4 className="font-semibold text-sm text-white font-mono uppercase tracking-wider">
                  2. Indeterminate Agent Laser Sweep
                </h4>
                <NeonCyberBar label="Executive Producer Reasoning..." />
                <p className="text-xs text-slate-400">
                  Used during Vertex AI streaming inference & tool orchestration.
                </p>
              </div>

              {/* 3. Film Sprocket Scanner */}
              <div className="p-6 rounded-3xl bg-darkroom-surface space-y-4 border border-darkroom-border">
                <h4 className="font-semibold text-sm text-white font-mono uppercase tracking-wider">
                  3. Film Celluloid Scanner
                </h4>
                <FilmSprocketScanner label="Scanning Physical Screening Leases..." />
              </div>

              {/* 4. Quantum Harmonic Wave */}
              <div className="p-6 rounded-3xl bg-darkroom-surface space-y-4 border border-darkroom-border">
                <h4 className="font-semibold text-sm text-white font-mono uppercase tracking-wider">
                  4. Quantum Harmonic Wave
                </h4>
                <QuantumWaveLoader bars={22} height={42} />
                <p className="text-xs text-center text-slate-400 font-mono">
                  Contradiction analyst synthesis equalizer
                </p>
              </div>

              {/* 5. Pipeline Stepper */}
              <div className="p-6 rounded-3xl bg-darkroom-surface space-y-4 md:col-span-2 border border-darkroom-border">
                <h4 className="font-semibold text-sm text-white font-mono uppercase tracking-wider">
                  5. Multi-Phase Investigation Stepper
                </h4>
                <PipelineStepperBar currentStep={2} />
              </div>

              {/* 6. Orbital Reactor */}
              <div className="p-6 rounded-3xl bg-darkroom-surface space-y-4 md:col-span-2 flex flex-col items-center border border-darkroom-border">
                <h4 className="font-semibold text-sm text-white mb-2 font-mono uppercase tracking-wider">
                  6. Orbital Dual-Ring Reactor
                </h4>
                <OrbitalReactorLoader
                  size={76}
                  label="Synthesizing Cryptographic Evidence Dossier..."
                />
              </div>

              {/* 7. Agent Thinking Pills */}
              <div className="p-6 rounded-3xl bg-darkroom-surface space-y-4 md:col-span-2 border border-darkroom-border">
                <h4 className="font-semibold text-sm text-white font-mono uppercase tracking-wider">
                  7. Agent Thinking Pills & State Indicators
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-medium block mb-2 font-mono">
                      Default Executive Reasoning:
                    </span>
                    <AgentThinkingPill />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 font-medium block mb-2 font-mono">
                      Targeted Tool Resolution:
                    </span>
                    <AgentThinkingPill label="Cross-checking Companies House filings & venue leases..." />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. TOPIC: CHAT RELATED (AVATAR, INPUT BAR, BUBBLES, MINI TOOLS) */}
        {/* ========================================================================= */}
        {(activeSection === 'ALL' || activeSection === 'CHAT') && (
          <div className="space-y-10 animate-fade-in">
            {/* Chat Related Header */}
            <div className="border-b border-darkroom-border pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                  💬
                </span>
                <h2 className="text-xl font-bold text-white font-serif">
                  Chat Related Components & Cinema Agent
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                State-of-the-Art Cinema Animated Avatar, Chat Prompt Bar, Message Bubbles, and In-Chat Generative Mini Tools.
              </p>
            </div>

            {/* SECTION 3A: HIGH-END CINEMA ANIMATED AVATAR SUITE */}
            <section className="space-y-6 p-6 rounded-3xl bg-darkroom-surface border border-darkroom-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono flex items-center gap-2">
                    <span>🎬 Cinema Animated Avatar Suite (Motion v12)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Multi-Axis Motion & State Reactive
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Dual counter-rotating orbit rings, organic swirling vortex, articulated clapperboard tilt, and reactive lifecycle states.
                  </p>
                </div>

                {/* State Simulator Switcher */}
                <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase px-1.5">State:</span>
                  {(['idle', 'hover', 'active', 'thinking', 'writing'] as AvatarStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        soundEffects.playClick();
                        setAvatarSimStatus(st);
                        addLog(`Avatar simulated state switched to: '${st}'`);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono capitalize transition-all cursor-pointer ${
                        avatarSimStatus === st
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Size Matrix with Active State Simulator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Size Small */}
                <div className="p-5 rounded-2xl bg-midnight/90 flex flex-col items-center justify-center text-center space-y-3 border border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    Small (`sm`) - Chat Pill
                  </span>
                  <div className="py-2">
                    <AgentAvatar
                      size="sm"
                      status={avatarSimStatus}
                      onClick={() => {
                        soundEffects.playSuccess();
                        addLog('Clicked Small Avatar (modal trigger)');
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400">Used in compact thinking pills and dense feeds.</p>
                </div>

                {/* Size Medium */}
                <div className="p-5 rounded-2xl bg-midnight/90 flex flex-col items-center justify-center text-center space-y-3 border border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    Medium (`md`) - Message Bubble
                  </span>
                  <div className="py-2">
                    <AgentAvatar
                      size="md"
                      status={avatarSimStatus}
                      onClick={() => {
                        soundEffects.playSuccess();
                        addLog('Clicked Medium Avatar (modal trigger)');
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400">Default avatar for all agent message bubbles.</p>
                </div>

                {/* Size Large */}
                <div className="p-5 rounded-2xl bg-midnight/90 flex flex-col items-center justify-center text-center space-y-3 border border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    Large (`lg`) - Header Hero
                  </span>
                  <div className="py-2">
                    <AgentAvatar
                      size="lg"
                      status={avatarSimStatus}
                      onClick={() => {
                        soundEffects.playSuccess();
                        addLog('Clicked Large Avatar (modal trigger)');
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400">Prominent holographic lens sweeps & wide orbits.</p>
                </div>

                {/* Size Extra Large */}
                <div className="p-5 rounded-2xl bg-midnight/90 flex flex-col items-center justify-center text-center space-y-3 border border-zinc-800/80">
                  <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider font-semibold">
                    Extra Large (`xl`) - Modal Hero
                  </span>
                  <div className="py-2">
                    <AgentAvatar
                      size="xl"
                      status={avatarSimStatus}
                      onClick={() => {
                        soundEffects.playSuccess();
                        addLog('Clicked XL Avatar (modal trigger)');
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400">Full showcase display with all micro-motion physics.</p>
                </div>
              </div>
            </section>

            {/* SECTION 3B: CHAT PROMPT BAR */}
            <section className="space-y-4 p-6 rounded-3xl bg-darkroom-surface border border-darkroom-border">
              <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
                    Chat Prompt Bar & File Upload Zone
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Multi-modal prompt input with file drop attachments, audio recording simulation, and submit actions.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  ChatPromptBar.tsx
                </span>
              </div>

              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                <ChatPromptBar
                  onSendMessage={(text, fileName) =>
                    addLog(
                      `[Submit] Prompt sent: "${text.slice(0, 45)}..." (Attached: ${fileName || 'None'})`,
                    )
                  }
                  isLoading={false}
                />
              </div>
            </section>

            {/* SECTION 3C: CHAT BUBBLES & STREAMING */}
            <section className="space-y-4 p-6 rounded-3xl bg-darkroom-surface border border-darkroom-border">
              <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
                    Chat Bubble Variations & Simulated Stream
                  </h3>
                  <p className="text-xs text-zinc-400">
                    User prompts, assistant responses, markdown formatting, and live simulated token stream.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  ChatBubble.tsx
                </span>
              </div>

              <div className="space-y-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800">
                <ChatBubble
                  message={mockUserMsg}
                  onLaunchDueDiligence={(name) => addLog(`Launch Due Diligence for: ${name}`)}
                  onLaunchOpportunityScout={(p) => addLog(`Launch Opportunity Scout for: ${p.title}`)}
                />

                <ChatBubble
                  message={mockAssistantMsg}
                  onLaunchDueDiligence={(name) => addLog(`Launch Due Diligence for: ${name}`)}
                  onLaunchOpportunityScout={(p) => addLog(`Launch Opportunity Scout for: ${p.title}`)}
                />

                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1 font-mono">
                    Live Simulated Typewriter Stream:
                  </span>
                  <ChatBubble
                    message={{
                      id: 'sim-msg',
                      role: 'assistant',
                      content: streamSimText,
                      timestamp: new Date().toISOString(),
                    }}
                    onLaunchDueDiligence={(name) => addLog(`Launch Due Diligence for: ${name}`)}
                    onLaunchOpportunityScout={(p) =>
                      addLog(`Launch Opportunity Scout for: ${p.title}`)
                    }
                  />
                </div>
              </div>
            </section>

            {/* SECTION 3D: IN-CHAT GENERATIVE MINI TOOLS */}
            <section className="space-y-4 p-6 rounded-3xl bg-darkroom-surface border border-darkroom-border">
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
                    In-Chat Generative Mini Tools (AI Tool Parity Mirror)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Standard 2-stage interaction cards mounted by the agent during conversation.
                  </p>
                </div>
              </div>

              {/* Subtabs for Mini Tools */}
              <div className="flex items-center gap-1 bg-midnight p-1 rounded-xl overflow-x-auto border border-zinc-800">
                {[
                  { id: 'FESTIVAL', label: '1. Festival Intake' },
                  { id: 'GRANT', label: '2. Grant Match' },
                  { id: 'INVITATION', label: '3. Email Audit' },
                  { id: 'SCOUT', label: '4. Scout Card' },
                  { id: 'COMPARE', label: '5. Compare Arena' },
                  { id: 'VETTING', label: '6. 360° Matrix' },
                  { id: 'PROBES', label: '7. Follow-Up Probes' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      soundEffects.playClick();
                      setActiveToolSubtab(st.id as typeof activeToolSubtab);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
                      activeToolSubtab === st.id
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Tool Card Render Area */}
              <div className="p-4 rounded-2xl bg-darkroom-bg flex justify-center border border-zinc-800">
                {activeToolSubtab === 'FESTIVAL' && (
                  <div className="w-full max-w-2xl">
                    <FestivalIntakeCard
                      args={{
                        festival_name: 'Aldergate Film Festival (Test Entity)',
                        city_country: 'London, United Kingdom',
                        optional_url: 'https://aldergatefilmfest.example.com',
                        preflight_summary:
                          'Targeted probe cross-examining municipal venue lease records against unlisted online screening links.',
                      }}
                      onLaunch={(name, url) =>
                        addLog(
                          `[Action] Launched Due Diligence for '${name}' (URL: ${url || 'None'})`,
                        )
                      }
                    />
                  </div>
                )}

                {activeToolSubtab === 'GRANT' && (
                  <div className="w-full max-w-2xl">
                    <GrantIntakeCard
                      args={{
                        project_title: 'Echoes of the Humber',
                        grant_category: 'DEVELOPMENT_AND_PRODUCTION',
                        target_amount: '£25,000',
                        production_stage: 'Production',
                        filmmaker_region: 'UK & Europe',
                        grant_strategy_summary:
                          'Target BFI and Screen Scotland documentary production funds.',
                      }}
                      onLaunchSearch={(query) =>
                        addLog(`[Action] Launched Grant Discovery Search: "${query}"`)
                      }
                    />
                  </div>
                )}

                {activeToolSubtab === 'INVITATION' && (
                  <div className="w-full max-w-2xl">
                    <InvitationEmailCard
                      args={{
                        festival_claimed: 'International Indie Cinema Awards',
                        sender_domain: 'submissions-indie-cinema.net',
                        fee_waiver_offered: true,
                        initial_verdict:
                          'High probability of laurel mill. Unsolicited email with generic laurel code and paid statue upgrade clauses.',
                        red_flag_signals: [
                          'Bulk unsolicited outreach without viewing film',
                          'No listed cinema screening theater in city center',
                          '£120 fee for physical winner trophy',
                        ],
                      }}
                      onLaunchInvestigation={(name) =>
                        addLog(`[Action] Launched Background Audit on: "${name}"`)
                      }
                    />
                  </div>
                )}

                {activeToolSubtab === 'SCOUT' && (
                  <div className="w-full max-w-2xl">
                    <MiniScoutCard
                      args={{
                        film_title: 'The Silent Transmission',
                        genre: 'Sci-Fi',
                        format: 'SHORT',
                        budget_tier: 'Low',
                        runtime_minutes: 14,
                        premiere_goal: 'WORLD_PREMIERE',
                        target_regions: ['UK & Europe', 'North America'],
                        strategy_rationale:
                          'Target Tier-1 BAFTA-qualifying shorts showcases during Early Bird deadlines before regional runs.',
                      }}
                      onLaunch={(profile) =>
                        addLog(`[Action] Launched Opportunity Scout for '${profile.title}'`)
                      }
                    />
                  </div>
                )}

                {activeToolSubtab === 'COMPARE' && (
                  <div className="w-full max-w-2xl">
                    <MiniCompareArena
                      args={{
                        festival_a: 'Raindance Film Festival',
                        festival_b: 'London Independent Film Festival',
                        key_comparison_vectors: ['Accreditation', 'Venue Scale', 'Entry Fee'],
                        verdict_summary:
                          'Raindance offers premier BAFTA/BIFA prestige and central West End cinemas, while LIFF provides lower barrier indie networking.',
                      }}
                      onSelectFestival={(name) =>
                        addLog(`[Action] Selected matchup candidate: '${name}'`)
                      }
                    />
                  </div>
                )}

                {activeToolSubtab === 'VETTING' && (
                  <div className="w-full">
                    <DeepVettingMatrix festivalName="Raindance Film Festival" />
                  </div>
                )}

                {activeToolSubtab === 'PROBES' && (
                  <div className="w-full max-w-2xl space-y-4">
                    <div className="p-4 rounded-xl bg-darkroom-card space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                        <span className="text-amber-400 text-sm">✦</span>
                        <span>Interactive Follow-Up Probes (1-Click Filmmaker Action Chips)</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          {
                            id: '1',
                            label: 'Check sender domain WHOIS',
                            promptText: 'Check sender domain',
                            badge: 'Domain Forensics',
                          },
                          {
                            id: '2',
                            label: 'Verify physical cinema lease',
                            promptText: 'Verify physical cinema',
                            badge: 'Venue Corroboration',
                          },
                          {
                            id: '3',
                            label: 'Scrutinize trophy & award fees',
                            promptText: 'Scrutinize trophy fees',
                            badge: 'Fee Transparency',
                          },
                          {
                            id: '4',
                            label: 'Filter BAFTA / Oscar qualifiers',
                            promptText: 'Filter BAFTA qualifiers',
                            badge: 'Accreditation',
                          },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              soundEffects.playClick();
                              addLog(`[Probe Click] Prompt: "${opt.promptText}" (${opt.badge})`);
                            }}
                            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-darkroom-surface hover:bg-midnight-royal border border-darkroom-border hover:border-tool-ocean text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm cursor-pointer"
                          >
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 group-hover:bg-white/20 text-[10px] font-mono text-indigo-300 group-hover:text-white">
                              {opt.badge}
                            </span>
                            <span>{opt.label}</span>
                            <span className="text-slate-400 group-hover:text-white font-mono text-xs">
                              →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. TOPIC: ARCHITECTURE, TRACES & FEEDBACK */}
        {/* ========================================================================= */}
        {(activeSection === 'ALL' || activeSection === 'ARCHITECTURE') && (
          <div className="space-y-10 animate-fade-in">
            {/* Architecture Header */}
            <div className="border-b border-darkroom-border pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 text-sm font-bold">
                  📐
                </span>
                <h2 className="text-xl font-bold text-white font-serif">
                  Architecture, Observability & Feedback Logs
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Multi-agent pipeline blueprints, OTel telemetry traces, and filmmaker intelligence repository.
              </p>
            </div>

            {/* Architecture Blueprint */}
            <div className="p-6 rounded-3xl bg-darkroom-surface border border-darkroom-border space-y-6">
              <ArchitecturePage />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-4 border-t border-zinc-800">
                <div className="p-4 rounded-xl bg-darkroom-bg space-y-2 border border-zinc-800">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold font-mono">
                    <ShieldCheck className="w-4 h-4" />
                    <span>1. Festival Vetting Path</span>
                  </div>
                  <p className="text-zinc-300">
                    Triggered on queries about festival legitimacy, fees, venues, or scam checks. Mounts FestivalIntakeCard, collects city and interaction context, then launches parallel research across 3 domains.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-darkroom-bg space-y-2 border border-zinc-800">
                  <div className="flex items-center space-x-2 text-blue-400 font-bold font-mono">
                    <Coins className="w-4 h-4" />
                    <span>2. Grant & Funding Path</span>
                  </div>
                  <p className="text-zinc-300">
                    Triggered on grants, funding, or subsidies. Mounts GrantIntakeCard with budget and funding sliders, stage selectors, and PDF deck drop zone to match BFI and international public funds.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-darkroom-bg space-y-2 border border-zinc-800">
                  <div className="flex items-center space-x-2 text-rose-400 font-bold font-mono">
                    <MailWarning className="w-4 h-4" />
                    <span>3. Email & Laurel Audit</span>
                  </div>
                  <p className="text-zinc-300">
                    Triggered when user pastes an email or mentions unsolicited invites. Mounts InvitationEmailCard to scan sender domains, waiver traps, and trophy upsells.
                  </p>
                </div>
              </div>
            </div>

            {/* OTel Agent Traces & Telemetry */}
            <div className="p-6 rounded-3xl bg-darkroom-surface border border-darkroom-border">
              <AgentObservabilityLab />
            </div>

            {/* Filmmaker Feedback & Intelligence Log */}
            <div className="p-6 rounded-3xl bg-darkroom-surface border border-darkroom-border">
              <FeedbackLogTab onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)} />
            </div>
          </div>
        )}

        {/* Global Playground Activity & Event Log Drawer */}
        <div className="p-4 rounded-2xl bg-darkroom-surface text-xs font-mono text-zinc-300 border border-darkroom-border">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-zinc-200">Playground Event Log</span>
            </div>
            <button
              onClick={() => setEventLogs(['Log cleared.'])}
              className="text-[10px] text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              Clear Log
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {eventLogs.map((log, idx) => (
              <div key={idx} className="text-zinc-400 text-[11px]">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Filmmaker Feedback Modal inside Playground */}
        <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
      </div>
    </div>
  );
};
