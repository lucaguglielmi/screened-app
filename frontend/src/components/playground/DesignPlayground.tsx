import React, { useState } from 'react';
import { ChatMessage } from '../../types/chat';

import { ChatBubble } from '../chat/ChatBubble';
import { AgentThinkingPill } from '../chat/AgentThinkingPill';
import { ChatPromptBar } from '../chat/ChatPromptBar';
import { StarterPromptChips } from '../chat/StarterPromptChips';
import { MiniDueDiligence } from '../chat/mini_apps/MiniDueDiligence';
import { MiniScoutCard } from '../chat/mini_apps/MiniScoutCard';
import { MiniCompareArena } from '../chat/mini_apps/MiniCompareArena';
import { DesignTokensLab } from './DesignTokensLab';
import { AgentObservabilityLab } from './AgentObservabilityLab';
import { soundEffects } from '../../utils/audio';

export const DesignPlayground: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'TOKENS' | 'TRACES' | 'ALL' | 'BUBBLES' | 'LOADERS' | 'MINI_APPS' | 'PROMPTS'>('TOKENS');

  const [streamSimText, setStreamSimText] = useState<string>(

    'I have conducted an initial background check on the festival. Screening records indicate physical cinema leases at Curzon Soho.'
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [eventLogs, setEventLogs] = useState<string[]>(['Playground initialized in sandbox mode.']);

  const addLog = (msg: string) => {
    setEventLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 9),
    ]);
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
    content: 'Is Aldergate Film Festival legitimate or a scam? Check their screening leases.',
    timestamp: new Date().toISOString(),
  };

  const mockAssistantMsg: ChatMessage = {
    id: 'mock-assistant-1',
    role: 'assistant',
    content:
      'I have reviewed the background for **Aldergate Film Festival**.\n\nKey investigative findings:\n- **Venue Discrepancies**: Official promotional materials state gala screenings occur at the IMAX, but booking manifests list private Vimeo links.\n- **Fee Escalation**: Late entry fees average £65 with no published jury roster.\n- **Accreditation**: Not listed on BAFTA or BIFA qualifying lists.',
    timestamp: new Date().toISOString(),
  };

  const mockDueDiligenceMsg: ChatMessage = {
    id: 'mock-dd-1',
    role: 'assistant',
    content: 'I have configured a multi-domain due diligence probe for **Aldergate Film Festival**.',
    toolCall: {
      id: 'tool-1',
      toolName: 'configure_due_diligence',
      args: {
        festival_name: 'Aldergate Film Festival',
        optional_url: 'https://aldergatefilmfest.example.com',
        preflight_summary: 'Targeted probe cross-examining municipal venue lease records against unlisted online screening links.',
        suspected_concerns: ['VENUE_LEGITIMACY', 'FEE_TRANSPARENCY'],
      },
    },
    timestamp: new Date().toISOString(),
  };

  const mockScoutMsg: ChatMessage = {
    id: 'mock-scout-1',
    role: 'assistant',
    content: 'Here is a tailored festival submission roadmap for your sci-fi short project.',
    toolCall: {
      id: 'tool-2',
      toolName: 'configure_opportunity_scout',
      args: {
        film_title: 'The Silent Transmission',
        format: 'SHORT',
        genre: 'Sci-Fi',
        runtime_minutes: 14,
        premiere_goal: 'WORLD_PREMIERE',
        budget_tier: 'Micro (< £50k)',
        target_regions: ['UK & Europe', 'North America'],
        strategy_rationale: 'Target Tier-1 BAFTA-qualifying shorts showcases during Early Bird deadlines before regional runs.',
      },
    },
    timestamp: new Date().toISOString(),
  };

  const mockCompareMsg: ChatMessage = {
    id: 'mock-compare-1',
    role: 'assistant',
    content: 'Head-to-head comparison between **Raindance Film Festival** and **London Independent Film Festival**.',
    toolCall: {
      id: 'tool-3',
      toolName: 'compare_festivals_arena',
      args: {
        festival_a: 'Raindance Film Festival',
        festival_b: 'London Independent Film Festival',
        key_comparison_vectors: ['Accreditation', 'Venue Scale', 'Entry Fee'],
        verdict_summary: 'Raindance offers premier BAFTA/BIFA prestige and central West End cinemas, while LIFF provides lower barrier indie networking.',
      },
    },
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      {/* Playground Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-zinc-900/90 via-zinc-950 to-zinc-900/90 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-base font-bold ring-1 ring-amber-500/40">
              🎨
            </span>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
              Design Playground & Component Studio
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Visual workbench for inspecting, modifying, and stress-testing all AI chat bubbles, loaders, and generative mini-apps.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSimulateStream}
            disabled={isSimulating}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-semibold text-zinc-950 shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSimulating ? '⏳ Streaming...' : '▶ Simulate Token Stream'}</span>
          </button>
          <button
            onClick={() => {
              soundEffects.playSuccess();
              addLog('Sound effects chime triggered.');
            }}
            className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-750 transition-colors cursor-pointer"
          >
            🔊 Test Audio
          </button>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 w-fit overflow-x-auto">
        {(['TOKENS', 'TRACES', 'ALL', 'BUBBLES', 'LOADERS', 'MINI_APPS', 'PROMPTS'] as const).map((sec) => (
          <button
            key={sec}
            onClick={() => {
              soundEffects.playClick();
              setActiveSection(sec);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeSection === sec
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            {sec === 'TOKENS' && '🎨 Design Tokens & Motion'}
            {sec === 'TRACES' && '⚡ Agent Traces & Telemetry'}
            {sec === 'ALL' && 'All Components'}
            {sec === 'BUBBLES' && '1. Chat Bubbles'}
            {sec === 'LOADERS' && '2. Loaders & Thinking'}
            {sec === 'MINI_APPS' && '3. Embedded Mini-Apps'}
            {sec === 'PROMPTS' && '4. Prompt Bars'}
          </button>
        ))}
      </div>

      {/* SECTION 0: DESIGN TOKENS & MOTION LAB */}
      {activeSection === 'TOKENS' && (
        <DesignTokensLab />
      )}

      {/* SECTION 0B: AGENT TRACES & TELEMETRY */}
      {activeSection === 'TRACES' && (
        <AgentObservabilityLab />
      )}



      {/* SECTION 1: CHAT BUBBLES */}
      {(activeSection === 'ALL' || activeSection === 'BUBBLES') && (
        <section className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 shadow-md backdrop-blur-sm">
          <div className="border-b border-zinc-800 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
                Section 1: Chat Bubble Variations
              </h3>
              <p className="text-xs text-zinc-400">User prompts, assistant responses, and token streaming.</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              ChatBubble.tsx
            </span>
          </div>

          <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
            {/* User Bubble */}
            <ChatBubble
              message={mockUserMsg}
              onLaunchDueDiligence={(name) => addLog(`Launch Due Diligence for: ${name}`)}
              onLaunchOpportunityScout={(p) => addLog(`Launch Opportunity Scout for: ${p.title}`)}
            />

            {/* Assistant Markdown Bubble */}
            <ChatBubble
              message={mockAssistantMsg}
              onLaunchDueDiligence={(name) => addLog(`Launch Due Diligence for: ${name}`)}
              onLaunchOpportunityScout={(p) => addLog(`Launch Opportunity Scout for: ${p.title}`)}
            />

            {/* Live Streaming Simulation Bubble */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
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
                onLaunchOpportunityScout={(p) => addLog(`Launch Opportunity Scout for: ${p.title}`)}
              />
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: LOADERS & THINKING PILLS */}
      {(activeSection === 'ALL' || activeSection === 'LOADERS') && (
        <section className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 shadow-md backdrop-blur-sm">
          <div className="border-b border-zinc-800 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
                Section 2: Agent Loaders & State Indicators
              </h3>
              <p className="text-xs text-zinc-400">Pulsing agent reasoning pills and status meters.</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              AgentThinkingPill.tsx
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
            <div>
              <span className="text-[11px] text-zinc-400 font-medium block mb-2">Default Executive Reasoning:</span>
              <AgentThinkingPill />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 font-medium block mb-2">Targeted Tool Resolution:</span>
              <AgentThinkingPill label="Cross-checking Companies House filings & venue leases..." />
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: EMBEDDED MINI-APPS */}
      {(activeSection === 'ALL' || activeSection === 'MINI_APPS') && (
        <section className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 shadow-md backdrop-blur-sm">
          <div className="border-b border-zinc-800 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
                Section 3: Generative Embedded Mini-Apps
              </h3>
              <p className="text-xs text-zinc-400">Interactive pre-flight cards rendered inside the chat flow.</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              mini_apps/*.tsx
            </span>
          </div>

          <div className="space-y-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
            {/* Due Diligence Card */}
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                A. MiniDueDiligence Card
              </span>
              <MiniDueDiligence
                args={mockDueDiligenceMsg.toolCall!.args as any}
                onLaunch={(name, url) => addLog(`[Action] Launched Due Diligence for '${name}' (URL: ${url || 'None'})`)}
              />
            </div>

            {/* Opportunity Scout Card */}
            <div>
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                B. MiniScoutCard
              </span>
              <MiniScoutCard
                args={mockScoutMsg.toolCall!.args as any}
                onLaunch={(profile) => addLog(`[Action] Launched Opportunity Scout for '${profile.title}' (${profile.format})`)}
              />
            </div>

            {/* Compare Arena Card */}
            <div>
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                C. MiniCompareArena Card
              </span>
              <MiniCompareArena
                args={mockCompareMsg.toolCall!.args as any}
                onSelectFestival={(name) => addLog(`[Action] Selected matchup candidate: '${name}'`)}
              />
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: PROMPT BARS & STARTERS */}
      {(activeSection === 'ALL' || activeSection === 'PROMPTS') && (
        <section className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 shadow-md backdrop-blur-sm">
          <div className="border-b border-zinc-800 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
                Section 4: Prompt Bars & File Drop Zones
              </h3>
              <p className="text-xs text-zinc-400">Multi-modal prompt input and one-click starter chips.</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              ChatPromptBar.tsx & StarterPromptChips.tsx
            </span>
          </div>

          <div className="space-y-6 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
            <div>
              <span className="text-[11px] text-zinc-400 font-medium block mb-2">Interactive Prompt Bar:</span>
              <ChatPromptBar
                onSendMessage={(text, fileName) => addLog(`[Submit] Sent: "${text.slice(0, 40)}..." (Attached: ${fileName || 'None'})`)}
                isLoading={false}
              />
            </div>

            <div>
              <StarterPromptChips
                onSelectPrompt={(prompt) => addLog(`[Starter Selected] "${prompt.slice(0, 50)}..."`)}
              />
            </div>
          </div>
        </section>
      )}

      {/* Interactive Activity & Event Log Drawer */}
      <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 text-xs font-mono text-zinc-300">
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
    </div>
  );
};
