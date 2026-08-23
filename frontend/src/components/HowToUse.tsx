import React from 'react';
import { 
  Terminal, 
  ShieldCheck, 
  Compass, 
  Sparkles,
  Search,
  MessageSquare,
  FileText
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
      <section className="space-y-6 max-w-2xl text-center mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D29E]/20 border border-[#00D29E]/40 text-[#00D29E] text-xs font-mono uppercase tracking-widest">
          <Sparkles className="size-3.5" />
          <span>Screened AI Agents</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          How to use Screened
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          Screened provides three autonomous tools designed to protect your budget, optimize your festival strategy, and handle production legwork. Here's how to integrate them into your workflow.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* The Desk */}
        <div className="p-6 rounded-3xl bg-[#0E1124] border border-[#22274C] flex flex-col h-full space-y-4">
          <div className="p-3 rounded-2xl bg-[#2018E6]/20 text-indigo-400 self-start">
            <MessageSquare className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-white">1. The Desk</h2>
          <p className="text-sm text-slate-400 flex-grow">
            A conversational interface where you can chat directly with specialized AI Producer Agents. Ask for industry advice, grant writing tips, or draft outreach emails.
          </p>
          <div className="pt-4 border-t border-[#1A1E3D]">
            <button 
              onClick={onNavigateToDesk}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1.5 transition-colors"
            >
              <Terminal className="size-4" /> Open The Desk
            </button>
          </div>
        </div>

        {/* Due Diligence */}
        <div className="p-6 rounded-3xl bg-[#0E1124] border border-[#22274C] flex flex-col h-full space-y-4">
          <div className="p-3 rounded-2xl bg-[#00D29E]/20 text-[#00D29E] self-start">
            <ShieldCheck className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-white">2. Due Diligence</h2>
          <p className="text-sm text-slate-400 flex-grow">
            Before paying a submission fee, drop the festival's URL here. Screened's agents will cross-reference public records, filmmaker forums, and databases to flag phantom venues or laurel mills.
          </p>
          <div className="pt-4 border-t border-[#1A1E3D]">
            <button 
              onClick={onNavigateToDiligence}
              className="text-[#00D29E] hover:text-[#00B887] text-sm font-bold flex items-center gap-1.5 transition-colors"
            >
              <Search className="size-4" /> Scan a Festival
            </button>
          </div>
        </div>

        {/* Opportunity Scout */}
        <div className="p-6 rounded-3xl bg-[#0E1124] border border-[#22274C] flex flex-col h-full space-y-4">
          <div className="p-3 rounded-2xl bg-[#F43F5E]/20 text-rose-400 self-start">
            <Compass className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-white">3. Opportunity Scout</h2>
          <p className="text-sm text-slate-400 flex-grow">
            Input your film's details (genre, budget, premiere goals) and let the Scout find verified, high-ROI festivals and grants that match your exact profile.
          </p>
          <div className="pt-4 border-t border-[#1A1E3D]">
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
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0E1124] to-[#15123A] border border-indigo-500/30 text-center space-y-3">
        <h3 className="text-lg font-bold text-white">Pro Tip: The Command Menu</h3>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Press <kbd className="px-2 py-1 bg-black rounded border border-[#22274C] text-xs font-mono">⌘K</kbd> anywhere in the app to instantly switch tools, toggle preferences, or start a new festival investigation.
        </p>
      </div>
    </div>
  );
};
