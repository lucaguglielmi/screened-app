import React, { useState } from 'react';
import { ChatMessage } from '../../types/chat';

import { ChatBubble } from '../chat/ChatBubble';
import { AgentThinkingPill } from '../chat/AgentThinkingPill';
import { ChatPromptBar } from '../chat/ChatPromptBar';
import { MiniScoutCard } from '../chat/mini_apps/MiniScoutCard';
import { MiniCompareArena } from '../chat/mini_apps/MiniCompareArena';
import { FestivalIntakeCard } from '../chat/tools/FestivalIntakeCard';
import { GrantIntakeCard } from '../chat/tools/GrantIntakeCard';
import { InvitationEmailCard } from '../chat/tools/InvitationEmailCard';
import { DesignTokensLab } from './DesignTokensLab';
import { AgentObservabilityLab } from './AgentObservabilityLab';
import { soundEffects } from '../../utils/audio';
import { 
  Workflow, 
  Coins, 
  MailWarning, 
  ShieldCheck
} from 'lucide-react';

export const DesignPlayground: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'TOKENS' | 'TRACES' | 'ARCHITECTURE' | 'ALL' | 'BUBBLES' | 'LOADERS' | 'TOOLS' | 'PROMPTS'>('TOOLS');
  const [activeToolSubtab, setActiveToolSubtab] = useState<'FESTIVAL' | 'GRANT' | 'INVITATION' | 'SCOUT' | 'COMPARE'>('FESTIVAL');

  const [streamSimText, setStreamSimText] = useState<string>(
    'I have conducted an initial background check on the festival. Screening records indicate physical cinema leases at Curzon Soho.'
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [eventLogs, setEventLogs] = useState<string[]>(['Playground initialized in sandbox mode with AI Tool Parity active.']);

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 animate-fade-in text-zinc-100">
      {/* Playground Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-zinc-900/90 via-zinc-950 to-zinc-900/90 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 text-base font-bold ring-1 ring-amber-500/40">
              🎨
            </span>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight font-serif">
              Design Playground & Component Studio
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Visual workbench with strict <strong>AI Tool Parity</strong> for inspecting, modifying, and testing all chat tools, mini-apps, and lifecycle traces.
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

      {/* Main Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 w-fit overflow-x-auto">
        {(['TOOLS', 'ARCHITECTURE', 'TOKENS', 'TRACES', 'ALL', 'BUBBLES', 'LOADERS', 'PROMPTS'] as const).map((sec) => (
          <button
            key={sec}
            onClick={() => {
              soundEffects.playClick();
              setActiveSection(sec);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeSection === sec
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            {sec === 'TOOLS' && '🛠️ In-Chat Generative Tools'}
            {sec === 'ARCHITECTURE' && '📐 Agent Architecture & Intent'}
            {sec === 'TOKENS' && '🎨 Design Tokens & Motion'}
            {sec === 'TRACES' && '⚡ Agent Traces & Telemetry'}
            {sec === 'ALL' && 'All Components'}
            {sec === 'BUBBLES' && 'Chat Bubbles'}
            {sec === 'LOADERS' && 'Loaders & Thinking'}
            {sec === 'PROMPTS' && 'Prompt Bars & Pills'}
          </button>
        ))}
      </div>

      {/* SECTION: IN-CHAT GENERATIVE TOOLS WITH SUBTABS */}
      {(activeSection === 'ALL' || activeSection === 'TOOLS') && (
        <section className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 shadow-md backdrop-blur-sm">
          <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
                Active Generative In-Chat Tools (AI Tool Parity Mirror)
              </h3>
              <p className="text-xs text-zinc-400">Interactive sandboxes for all dynamic cards mounted in the conversational stream.</p>
            </div>

            {/* Subtabs for Tools */}
            <div className="flex items-center gap-1 bg-midnight p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => { soundEffects.playClick(); setActiveToolSubtab('FESTIVAL'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  activeToolSubtab === 'FESTIVAL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-zinc-400 hover:text-white'
                }`}
              >
                1. Festival Intake
              </button>
              <button
                onClick={() => { soundEffects.playClick(); setActiveToolSubtab('GRANT'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  activeToolSubtab === 'GRANT' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'text-zinc-400 hover:text-white'
                }`}
              >
                2. Grant Match
              </button>
              <button
                onClick={() => { soundEffects.playClick(); setActiveToolSubtab('INVITATION'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  activeToolSubtab === 'INVITATION' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'text-zinc-400 hover:text-white'
                }`}
              >
                3. Email Audit
              </button>
              <button
                onClick={() => { soundEffects.playClick(); setActiveToolSubtab('SCOUT'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  activeToolSubtab === 'SCOUT' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40' : 'text-zinc-400 hover:text-white'
                }`}
              >
                4. Scout Card
              </button>
              <button
                onClick={() => { soundEffects.playClick(); setActiveToolSubtab('COMPARE'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  activeToolSubtab === 'COMPARE' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'text-zinc-400 hover:text-white'
                }`}
              >
                5. Compare Arena
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850 flex justify-center">
            {activeToolSubtab === 'FESTIVAL' && (
              <div className="w-full max-w-2xl">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-2">
                  Tool: FestivalIntakeCard.tsx (Autocomplete & Dynamic Follow-Ups)
                </span>
                <FestivalIntakeCard
                  args={{
                    festival_name: 'Aldergate Film Festival',
                    city_country: 'London, United Kingdom',
                    optional_url: 'https://aldergatefilmfest.example.com',
                    preflight_summary: 'Targeted probe cross-examining municipal venue lease records against unlisted online screening links.',
                  }}
                  onLaunch={(name, url) => addLog(`[Action] Launched Due Diligence for '${name}' (URL: ${url || 'None'})`)}
                />
              </div>
            )}

            {activeToolSubtab === 'GRANT' && (
              <div className="w-full max-w-2xl">
                <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider block mb-2">
                  Tool: GrantIntakeCard.tsx (Sliders, Stage, Doc Drop & Video Guard)
                </span>
                <GrantIntakeCard
                  args={{
                    project_title: 'Echoes of the Humber',
                    grant_category: 'DEVELOPMENT_AND_PRODUCTION',
                    target_amount: '£25,000',
                    production_stage: 'Production',
                    filmmaker_region: 'UK & Europe',
                    grant_strategy_summary: 'Target BFI and Screen Scotland documentary production funds.',
                  }}
                  onLaunchSearch={(query) => addLog(`[Action] Launched Grant Discovery Search: "${query}"`)}
                />
              </div>
            )}

            {activeToolSubtab === 'INVITATION' && (
              <div className="w-full max-w-2xl">
                <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider block mb-2">
                  Tool: InvitationEmailCard.tsx (Forensic Signals & Waiver Check)
                </span>
                <InvitationEmailCard
                  args={{
                    festival_claimed: 'International Indie Cinema Awards',
                    sender_domain: 'submissions-indie-cinema.net',
                    fee_waiver_offered: true,
                    initial_verdict: 'High probability of laurel mill. Unsolicited email with generic laurel code and paid statue upgrade clauses.',
                    red_flag_signals: [
                      'Bulk unsolicited outreach without viewing film',
                      'No listed cinema screening theater in city center',
                      '£120 fee for physical winner trophy',
                    ],
                  }}
                  onLaunchInvestigation={(name) => addLog(`[Action] Launched Background Audit on: "${name}"`)}
                />
              </div>
            )}

            {activeToolSubtab === 'SCOUT' && (
              <div className="w-full max-w-2xl">
                <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block mb-2">
                  Tool: MiniScoutCard.tsx (Film Profile Matrix)
                </span>
                <MiniScoutCard
                  args={{
                    film_title: 'The Silent Transmission',
                    format: 'SHORT',
                    genre: 'Sci-Fi',
                    runtime_minutes: 14,
                    premiere_goal: 'WORLD_PREMIERE',
                    budget_tier: 'Micro (< £50k)',
                    target_regions: ['UK & Europe', 'North America'],
                    strategy_rationale: 'Target Tier-1 BAFTA-qualifying shorts showcases during Early Bird deadlines before regional runs.',
                  }}
                  onLaunch={(profile) => addLog(`[Action] Launched Opportunity Scout for '${profile.title}' (${profile.format})`)}
                />
              </div>
            )}

            {activeToolSubtab === 'COMPARE' && (
              <div className="w-full max-w-2xl">
                <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider block mb-2">
                  Tool: MiniCompareArena.tsx (Head-to-Head Festival ROI)
                </span>
                <MiniCompareArena
                  args={{
                    festival_a: 'Raindance Film Festival',
                    festival_b: 'London Independent Film Festival',
                    key_comparison_vectors: ['Accreditation', 'Venue Scale', 'Entry Fee'],
                    verdict_summary: 'Raindance offers premier BAFTA/BIFA prestige and central West End cinemas, while LIFF provides lower barrier indie networking.',
                  }}
                  onSelectFestival={(name) => addLog(`[Action] Selected matchup candidate: '${name}'`)}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION: AGENT ARCHITECTURE & INTENT DIAGRAMS */}
      {(activeSection === 'ALL' || activeSection === 'ARCHITECTURE') && (
        <section className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 shadow-md backdrop-blur-sm">
          <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center space-x-2">
                <Workflow className="w-4 h-4 text-blue-400" />
                <span>Agent Architecture & Multi-Agent Intent Lifecycle</span>
              </h3>
              <p className="text-xs text-zinc-400">How user inputs flow through Gemini 2.5 Pro Function Calling to Parallel Search.</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              Vertex AI + Parallel Search
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-card border border-emerald-500/20 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>1. Festival Vetting Path</span>
              </div>
              <p className="text-zinc-300">
                Triggered on queries about festival legitimacy, fees, venues, or scam checks. Mounts <code className="text-emerald-300">FestivalIntakeCard</code>, collects city and interaction context, then launches parallel research across 3 domains.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-blue-500/20 space-y-2">
              <div className="flex items-center space-x-2 text-blue-400 font-bold font-mono">
                <Coins className="w-4 h-4" />
                <span>2. Grant & Funding Path</span>
              </div>
              <p className="text-zinc-300">
                Triggered on grants, funding, or subsidies. Mounts <code className="text-blue-300">GrantIntakeCard</code> with budget and funding sliders, stage selectors, and PDF deck drop zone to match BFI and international public funds.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-rose-500/20 space-y-2">
              <div className="flex items-center space-x-2 text-rose-400 font-bold font-mono">
                <MailWarning className="w-4 h-4" />
                <span>3. Email & Laurel Audit</span>
              </div>
              <p className="text-zinc-300">
                Triggered when user pastes an email or mentions unsolicited invites. Mounts <code className="text-rose-300">InvitationEmailCard</code> to scan sender domains, waiver traps, and trophy upsells.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* SECTION: DESIGN TOKENS & MOTION LAB */}
      {activeSection === 'TOKENS' && <DesignTokensLab />}

      {/* SECTION: AGENT TRACES & TELEMETRY */}
      {activeSection === 'TRACES' && <AgentObservabilityLab />}

      {/* SECTION: CHAT BUBBLES */}
      {(activeSection === 'ALL' || activeSection === 'BUBBLES') && (
        <section className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 shadow-md backdrop-blur-sm">
          <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
                Chat Bubble Variations
              </h3>
              <p className="text-xs text-zinc-400">User prompts, assistant responses, and token streaming.</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              ChatBubble.tsx
            </span>
          </div>

          <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
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

      {/* SECTION: LOADERS & THINKING PILLS */}
      {(activeSection === 'ALL' || activeSection === 'LOADERS') && (
        <section className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 shadow-md backdrop-blur-sm">
          <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
                Agent Loaders & State Indicators
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

      {/* SECTION: PROMPT BARS & STARTERS */}
      {(activeSection === 'ALL' || activeSection === 'PROMPTS') && (
        <section className="space-y-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 shadow-md backdrop-blur-sm">
          <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
                Prompt Bars & File Drop Zones
              </h3>
              <p className="text-xs text-zinc-400">Multi-modal prompt input and one-click action pills.</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              ChatPromptBar.tsx
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
