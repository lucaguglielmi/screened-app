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
import { DeepVettingMatrix } from '../investigation/DeepVettingMatrix';
import { DesignTokensLab } from './DesignTokensLab';
import { AgentObservabilityLab } from './AgentObservabilityLab';
import { UiGalleryLab } from './UiGalleryLab';
import { FeedbackLogTab } from './FeedbackLogTab';
import { ArchitecturePage } from './ArchitecturePage';
import { FeedbackModal } from '../modals/FeedbackModal';
import { soundEffects } from '../../utils/audio';
import { 
  Workflow, 
  Coins, 
  MailWarning, 
  ShieldCheck 
} from 'lucide-react';

export const DesignPlayground: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'UI' | 'TOOLS' | 'FEEDBACK' | 'ARCHITECTURE' | 'TOKENS' | 'TRACES' | 'ALL' | 'BUBBLES' | 'LOADERS' | 'PROMPTS'>('UI');
  const [activeToolSubtab, setActiveToolSubtab] = useState<'FESTIVAL' | 'GRANT' | 'INVITATION' | 'SCOUT' | 'COMPARE' | 'VETTING' | 'PROBES'>('FESTIVAL');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

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
    <div className="min-h-screen bg-[#0A192F] text-zinc-100 pb-12 w-full">
      {/* Full-width Header & Nav Bar */}
      <div className="w-full bg-[#112240] border-b border-indigo-900/50 shadow-md mb-8">
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
              Visual workbench to review components, tools, and UI states.
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

        {/* Full-width Navigation Bar */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 px-4 pb-3 overflow-x-auto">
          {(['UI', 'TOOLS', 'FEEDBACK', 'ARCHITECTURE', 'TOKENS', 'TRACES', 'ALL', 'BUBBLES', 'LOADERS', 'PROMPTS'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => {
                soundEffects.playClick();
                setActiveSection(sec);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                activeSection === sec
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-blue-300/70 hover:text-blue-100 hover:bg-blue-900/40'
              }`}
            >
              {sec === 'UI' && 'UI Gallery'}
              {sec === 'TOOLS' && 'Tools'}
              {sec === 'FEEDBACK' && 'Feedback'}
              {sec === 'ARCHITECTURE' && 'Architecture'}
              {sec === 'TOKENS' && 'Tokens'}
              {sec === 'TRACES' && 'Traces'}
              {sec === 'ALL' && 'All Sections'}
              {sec === 'BUBBLES' && 'Bubbles'}
              {sec === 'LOADERS' && 'Loaders'}
              {sec === 'PROMPTS' && 'Prompts'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-8">

      {/* SECTION: SHARED UI GALLERY & ICON MOTION LAB */}
      {(activeSection === 'ALL' || activeSection === 'UI') && (
        <UiGalleryLab />
      )}

      {/* SECTION: FILMMAKER FEEDBACK & LOGS */}
      {(activeSection === 'ALL' || activeSection === 'FEEDBACK') && (
        <FeedbackLogTab onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)} />
      )}

      {/* SECTION: IN-CHAT GENERATIVE TOOLS WITH SUBTABS */}
      {(activeSection === 'ALL' || activeSection === 'TOOLS') && (
        <section className="space-y-4 rounded-2xl border border-[#22274C] bg-[#0E1124] p-6 shadow-md">
          <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider font-mono">
                Active Generative In-Chat Tools (AI Tool Parity Mirror)
              </h3>
              <p className="text-xs text-zinc-400">Standard 2-stage interaction pattern required for all current and future generative tools.</p>
            </div>
          </div>

          {/* 2-STAGE TOOL PATTERN ARCHITECTURAL BLUEPRINT */}
          <div className="p-4 rounded-xl bg-[#151B2E] border border-blue-900/30 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              <span>Standard 2-Stage Generative Tool Lifecycle Architecture</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs text-zinc-300">
              <div className="p-2.5 rounded-lg bg-surface/80 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 block">STEP 1</span>
                <span className="font-bold text-white block">User Inquiry</span>
                <p className="text-[11px] text-zinc-400">User prompts Mission Control chat.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-surface/80 border border-zinc-800 space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 block">STEP 2</span>
                <span className="font-bold text-emerald-400 block">Agent Tool Call</span>
                <p className="text-[11px] text-zinc-400">Agent selects tool & mounts card.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 block">STAGE 1 UI</span>
                <span className="font-bold text-emerald-300 block">Requirements Intake</span>
                <p className="text-[11px] text-zinc-300">Gathers parameters, doc uploads, sliders.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/40 space-y-1">
                <span className="text-[10px] font-mono text-blue-400 block">STAGE 2 UI</span>
                <span className="font-bold text-blue-300 block">Review & Launch</span>
                <p className="text-[11px] text-zinc-300">Summary card with edit & launch trigger.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/40 space-y-1">
                <span className="text-[10px] font-mono text-purple-400 block">DESTINATION</span>
                <span className="font-bold text-purple-300 block">Redirect to Page</span>
                <p className="text-[11px] text-zinc-300">Opens dedicated full workspace.</p>
              </div>
            </div>
          </div>

          {/* Subtabs for Tools */}
          <div className="flex items-center gap-1 bg-midnight p-1 rounded-xl border border-zinc-800 overflow-x-auto">
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
              <button
                onClick={() => { soundEffects.playClick(); setActiveToolSubtab('VETTING'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  activeToolSubtab === 'VETTING' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-zinc-400 hover:text-white'
                }`}
              >
                6. 360° Forensic Matrix (Spec 14)
              </button>
              <button
                onClick={() => { soundEffects.playClick(); setActiveToolSubtab('PROBES'); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  activeToolSubtab === 'PROBES' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-zinc-400 hover:text-white'
                }`}
              >
                7. Follow-Up Probes & Intake
              </button>
            </div>

          <div className="p-4 rounded-xl bg-[#0B1021] border border-[#22274C] flex justify-center">
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
                    year: "2024", neverReleased: true, premiereGoals: ["WORLD_PREMIERE"], targetRegions: ["UK & Europe"],
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

            {activeToolSubtab === 'VETTING' && (
              <div className="w-full">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-2">
                  Tool: DeepVettingMatrix.tsx (360° Forensic Audit with 7 Dimension Vectors)
                </span>
                <DeepVettingMatrix festivalName="Raindance Film Festival" />
              </div>
            )}

            {activeToolSubtab === 'PROBES' && (
              <div className="w-full max-w-2xl space-y-4">
                <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block">
                  Feature: Interactive Multi-Step Follow-Up Probes & Document Intake (Branch A + B)
                </span>
                <div className="p-4 rounded-xl bg-[#141838]/90 border border-[#252C5E] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                    <span className="text-amber-400 text-sm">✦</span>
                    <span>Interactive Follow-Up Probes (1-Click Filmmaker Action Chips)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: '1', label: 'Check sender domain WHOIS', promptText: 'Check sender domain', badge: 'Domain Forensics' },
                      { id: '2', label: 'Verify physical cinema lease', promptText: 'Verify physical cinema', badge: 'Venue Corroboration' },
                      { id: '3', label: 'Scrutinize trophy & award fees', promptText: 'Scrutinize trophy fees', badge: 'Fee Transparency' },
                      { id: '4', label: 'Filter BAFTA / Oscar qualifiers', promptText: 'Filter BAFTA qualifiers', badge: 'Accreditation' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { soundEffects.playClick(); addLog(`[Probe Click] Prompt: "${opt.promptText}" (${opt.badge})`); }}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D2352] hover:bg-[#2018E6] border border-[#2E387A] hover:border-[#4B58C9] text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm cursor-pointer"
                      >
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 group-hover:bg-white/20 text-[10px] font-mono text-indigo-300 group-hover:text-white">
                          {opt.badge}
                        </span>
                        <span>{opt.label}</span>
                        <span className="text-slate-400 group-hover:text-white font-mono text-xs">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION: AGENT ARCHITECTURE & INTENT DIAGRAMS */}
      {(activeSection === 'ALL' || activeSection === 'ARCHITECTURE') && (
        <div className="space-y-4">
          <ArchitecturePage />
          <section className="space-y-4 rounded-2xl border border-[#22274C] bg-[#0E1124] p-6 shadow-md">
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
        </div>
      )}

      {/* SECTION: DESIGN TOKENS & MOTION LAB */}
      {activeSection === 'TOKENS' && <DesignTokensLab />}

      {/* SECTION: AGENT TRACES & TELEMETRY */}
      {activeSection === 'TRACES' && <AgentObservabilityLab />}

      {/* SECTION: CHAT BUBBLES */}
      {(activeSection === 'ALL' || activeSection === 'BUBBLES') && (
        <section className="space-y-4 rounded-2xl border border-[#22274C] bg-[#0E1124] p-6 shadow-md">
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
        <section className="space-y-4 rounded-2xl border border-[#22274C] bg-[#0E1124] p-6 shadow-md">
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
        <section className="space-y-4 rounded-2xl border border-[#22274C] bg-[#0E1124] p-6 shadow-md">
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
      <div className="p-4 rounded-2xl border border-[#22274C] bg-[#0E1124] text-xs font-mono text-zinc-300">
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
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
      </div>
    </div>
  );
};
