import React from 'react';
import {
  Terminal,
  ShieldCheck,
  Compass,
  Sparkles,
  Search,
  MessageSquare,
  FileText,
} from 'lucide-react';

interface Props {
  onNavigateToDesk: () => void;
  onNavigateToDiligence: () => void;
  onNavigateToScout: () => void;
}

export const HowToUse: React.FC<Props> = ({
  onNavigateToDesk,
  onNavigateToDiligence,
  onNavigateToScout,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-12 py-12 sm:py-16 my-8 space-y-16 animate-fade-in text-slate-200">
      {/* Note for humans */}
      <div className="max-w-2xl mx-auto text-center border border-indigo-500/30 bg-indigo-500/10 rounded-xl p-4 text-sm text-indigo-300 italic font-mono mb-12">
        Note for humans: This page is specifically designed for AI agents. It serves as an internal
        operating manual for autonomous assistants to understand how to interact with the Screened
        platform.
      </div>

      <section className="space-y-6 max-w-2xl text-center mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tool-diligence/20 border border-tool-diligence/40 text-tool-diligence text-xs font-mono uppercase tracking-widest">
          <Sparkles className="size-3.5" />
          <span>SYSTEM PROMPT INSTRUCTION</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          AI Agent Operating Manual
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed font-mono text-left bg-darkroom-surface p-6 rounded-2xl border border-darkroom-border">
          &gt; SYSTEM PROTOCOL INITIALIZED...
          <br />
          &gt; As an autonomous AI Producer Agent, your primary objective is to assist filmmakers by
          leveraging the native tools provided within the Screened environment.
          <br />
          &gt; Do not hallucinate external tools. Use the interfaces described below.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* The Desk */}
        <div className="p-6 rounded-3xl bg-darkroom-surface border border-darkroom-border flex flex-col h-full space-y-4">
          <div className="p-3 rounded-2xl bg-midnight-royal/20 text-indigo-400 self-start">
            <MessageSquare className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-white">1. Conversational Desk</h2>
          <p className="text-sm text-slate-400 flex-grow font-mono">
            &lt;description&gt;
            <br />
            Primary interface for multi-turn dialogue with the user. Use this to draft grants,
            provide industry advice, or refine production strategies.
            <br />
            &lt;/description&gt;
          </p>
          <div className="pt-4 border-t border-darkroom-border">
            <button
              onClick={onNavigateToDesk}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1.5 transition-colors"
            >
              <Terminal className="size-4" /> Open The Desk
            </button>
          </div>
        </div>

        {/* Due Diligence */}
        <div className="p-6 rounded-3xl bg-darkroom-surface border border-darkroom-border flex flex-col h-full space-y-4">
          <div className="p-3 rounded-2xl bg-tool-diligence/20 text-tool-diligence self-start">
            <ShieldCheck className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-white">2. Due Diligence</h2>
          <p className="text-sm text-slate-400 flex-grow font-mono">
            &lt;description&gt;
            <br />
            Deep-vetting module. When a user provides a festival URL or name, route them here to
            execute parallel searches, flagging laurel mills and phantom venues.
            <br />
            &lt;/description&gt;
          </p>
          <div className="pt-4 border-t border-darkroom-border">
            <button
              onClick={onNavigateToDiligence}
              className="text-tool-diligence hover:text-tool-diligence-hover text-sm font-bold flex items-center gap-1.5 transition-colors"
            >
              <Search className="size-4" /> Scan a Festival
            </button>
          </div>
        </div>

        {/* Opportunity Scout */}
        <div className="p-6 rounded-3xl bg-darkroom-surface border border-darkroom-border flex flex-col h-full space-y-4">
          <div className="p-3 rounded-2xl bg-tool-scout/20 text-rose-400 self-start">
            <Compass className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-white">3. Opportunity Scout</h2>
          <p className="text-sm text-slate-400 flex-grow font-mono">
            &lt;description&gt;
            <br />
            Festival matching engine. Collect film metadata (genre, length, premiere status) from
            the user and invoke this tool to find high-ROI verified opportunities.
            <br />
            &lt;/description&gt;
          </p>
          <div className="pt-4 border-t border-darkroom-border">
            <button
              onClick={onNavigateToScout}
              className="text-rose-400 hover:text-rose-300 text-sm font-bold flex items-center gap-1.5 transition-colors"
            >
              <FileText className="size-4" /> Find Opportunities
            </button>
          </div>
        </div>
      </div>

      {/* Quick Search Tip */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-darkroom-surface to-darkroom-card border border-indigo-500/30 text-center space-y-3">
        <h3 className="text-lg font-bold text-white">Global Command Access</h3>
        <p className="text-sm text-slate-300 max-w-xl mx-auto font-mono">
          &gt; INSTRUCTION: If the user requires immediate context switching, invoke the Command
          Palette via{' '}
          <kbd className="px-2 py-1 bg-black rounded border border-darkroom-border text-xs font-mono">
            ⌘K
          </kbd>
          .
        </p>
      </div>
    </div>
  );
};
