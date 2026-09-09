import React from 'react';
import { Terminal, Copy, CheckCircle2, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { soundEffects } from '../utils/audio';

export const McpOnboarding: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const mcpConfig = `{
  "mcpServers": {
    "screened": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sse", "https://api.screened.org/api/mcp/sse"]
    }
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mcpConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Connect via Model Context Protocol</h2>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              Screened provides an official, authenticated MCP Server. You can add it to AI clients like Claude Desktop, Cursor, or Google Antigravity.
            </p>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-neutral-800">
                <span className="text-sm font-mono text-neutral-500">claude_desktop_config.json</span>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm font-mono text-teal-400">
                  {mcpConfig}
                </code>
              </pre>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Native Prompt Recipes</h2>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              Once connected, your agent will automatically discover Screened's native prompt recipes. Try asking your agent:
            </p>
            <div className="grid gap-4">
              <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-start gap-4">
                <ChevronRight className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-medium text-white mb-1">"Spawn a multi-agent review"</h3>
                  <p className="text-sm text-neutral-500">Instructs your agent to spawn 3 sub-agents to independently review venue leases, corporate registry filings, and fee models.</p>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-start gap-4">
                <ChevronRight className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-medium text-white mb-1">"Run a cross-reference audit"</h3>
                  <p className="text-sm text-neutral-500">Forces your AI to perform an active web search to find conflicting evidence that disputes Screened's findings.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Agent-Friendly Dossiers</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              You are currently viewing an Agent-Friendly Dossier page (with the <code>/BYOA</code> suffix). 
              Simply copy the URL of this page and paste it into your AI agent (like Google Antigravity or ChatGPT).
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
