import React from 'react';
import { Terminal, Copy, ChevronRight } from 'lucide-react';
import { soundEffects } from '../utils/audio';

export const McpOnboarding: React.FC = () => {
  const mcpConfig = `{
  "mcpServers": {
    "screened": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sse", "https://api.screened.org/api/mcp/sse"]
    }
  }
}`;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16 text-neutral-200">
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
            <Terminal className="w-6 h-6 text-teal-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-white tracking-tight">
            Bring Your Own Agent (MCP)
          </h1>
        </div>

        <p className="text-xl text-neutral-400 mb-10 leading-relaxed">
          Screened acts as a Forensic Extraction Engine. We do the heavy lifting of scraping, Companies House queries, and cross-referencing. You can connect your own external agent to synthesize this intelligence based on your custom logic.
        </p>

        <div className="space-y-12">
          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Configure Your Client</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              Screened provides an official, authenticated MCP Server. You can add it to Google Antigravity or any other AI agent.
            </p>
            <div className="bg-[#0f1115] border border-neutral-800 rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-[#16181d] border-b border-neutral-800 flex justify-between items-center">
                <span className="text-sm font-mono text-neutral-500">mcp_client_config.json</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(mcpConfig);
                    soundEffects?.playSuccess();
                  }}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Config
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm font-mono text-emerald-400">
                {mcpConfig}
              </pre>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">2. Example Prompts</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              Once connected, try running one of our built-in intelligence recipes:
            </p>
            <div className="space-y-3">
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">spawn_multi_agent_review</h4>
                  <p className="text-sm text-neutral-400">Spawns a multi-agent cluster where each agent reviews a different dimension of the dossier (Box office, incorporation, sentiment).</p>
                </div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">laurel_mill_fraud_check</h4>
                  <p className="text-sm text-neutral-400">Instructs the agent to specifically look for "laurel mill" patterns, fee inflation, and fake physical screening locations.</p>
                </div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold mb-1">cross_reference_audit</h4>
                  <p className="text-sm text-neutral-400">Directs your agent to go online and cross-reference the extracted dossier data against external film forums for conflicting evidence.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Agent-Friendly Dossiers</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              You are currently viewing an Agent-Friendly Dossier page (with the <code>/BYOA</code> suffix). 
              Simply copy the URL of this page and paste it into your AI agent (like Google Antigravity or any other AI agent).
            </p>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 flex items-center justify-between">
               <span className="text-sm font-mono text-teal-400 truncate">
                 {typeof window !== 'undefined' ? window.location.href : 'https://totallyscreened.com/diligence/.../BYOA'}
               </span>
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
                   soundEffects?.playSuccess();
                 }}
                 className="shrink-0 flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors ml-4"
               >
                 <Copy className="w-4 h-4" />
                 Copy URL
               </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
