/**
 * Screened In-Browser WebMCP Protocol Bridge
 * Implements WebMCP/2026 client-side execution, DOM event bus, and tamper protection.
 *
 * Interoperability Architecture:
 * 1. In-Browser Agents (Chrome WebMCP flags, Gemini Live browser assistants, Claude Computer Use):
 *    Directly invoke tools on window.__screened_web_mcp__ or dispatch "webmcp:call" CustomEvents.
 * 2. Headless Agents (Google Antigravity, Gemini CLI, Cursor IDE, Claude Desktop):
 *    Connect via Screened's Cloud Run MCP endpoint (/api/mcp/sse) defined in .agents/plugins/screened/.
 * Both pathways expose identical forensic tools with zero hallucination and primary registry corroboration.
 */

export interface WebMCPTool {
  name: string;
  scope: 'Dossier Scope (/diligence/:id)' | 'Platform Scope (Global)';
  description: string;
  parameters: Record<string, string>;
  examplePrompt: string;
}

export interface WebMCPResult<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface WebMCPBridge {
  version: string;
  protocol: 'WebMCP/2026';
  tools: readonly WebMCPTool[];
  executeTool: (name: string, params: Record<string, unknown>) => Promise<WebMCPResult>;
}

const toolsList: WebMCPTool[] = [
  {
    name: 'screened_ask_dossier',
    scope: 'Dossier Scope (/diligence/:id)',
    description:
      'Performs cross-examination and fact-checking against the active due diligence dossier, returning corroborated claims, disputes, and confidence scores.',
    parameters: {
      query: 'string (e.g. "Does the festival hold a confirmed screening venue manifest?")',
      detailLevel: '"SUMMARY" | "FULL_EVIDENCE" | "RAW_SOURCES"',
    },
    examplePrompt: '"Ask the dossier if the advertised cinema venue has confirmed the screening dates."',
  },
  {
    name: 'screened_inspect_claim',
    scope: 'Dossier Scope (/diligence/:id)',
    description:
      'Retrieves the full evidentiary citation chain, source URLs, publication timestamps, and corroboration score for a specific atomic claim.',
    parameters: {
      claimId: 'string (e.g. "claim-venue-manifest-01")',
    },
    examplePrompt: '"Inspect claim #2 and show the exact quotes from UK Companies House and FilmFreeway."',
  },
  {
    name: 'screened_verify_sources',
    scope: 'Dossier Scope (/diligence/:id)',
    description:
      'Audits the provenance of all bibliography URLs linked in the dossier, checking for live status, Wayback Machine archives, and domain WHOIS age.',
    parameters: {
      domainFilter: 'string (optional, e.g. "companieshouse.gov.uk")',
    },
    examplePrompt: '"Verify all source links in this dossier and flag any domains registered less than 12 months ago."',
  },
  {
    name: 'screened_start_investigation',
    scope: 'Platform Scope (Global)',
    description:
      'Dispatches an autonomous multi-agent deep vetting investigation for any film festival name or website URL.',
    parameters: {
      festivalName: 'string (e.g. "Pinco Pallino Film Festival")',
      submissionUrl: 'string (optional FilmFreeway or official portal URL)',
    },
    examplePrompt: '"Start a new due diligence scan on Screened for Sundance Film Festival."',
  },
  {
    name: 'screened_scout_grants',
    scope: 'Platform Scope (Global)',
    description:
      'Scouts institutional funding opportunities, national lottery schemes, and public cinema development funds tailored to a filmmaker profile.',
    parameters: {
      project_title: 'string',
      budget_usd: 'number',
      genre: 'string',
      country: 'string',
    },
    examplePrompt: '"Scout verified documentary grants on Screened for a £40k UK short film."',
  },
];

export const WEBMCP_TOOLS: readonly WebMCPTool[] = Object.freeze(toolsList);

/**
 * Execute a WebMCP tool against the backend /api/mcp endpoint with mock fallback.
 */
export async function executeWebMCPTool(
  toolName: string,
  params: Record<string, unknown>
): Promise<WebMCPResult> {
  try {
    // Notify DOM listeners of tool start (visual highlight/telemetry)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('webmcp:telemetry', {
          detail: { toolName, params, status: 'RUNNING' },
        })
      );
    }

    const res = await fetch('/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: `web-${Date.now()}`,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params,
        },
      }),
    });

    if (res.ok) {
      const payload = (await res.json()) as {
        result?: { content?: Array<{ text?: string }> };
        error?: { code?: number; message?: string };
      };

      if (payload.error) {
        return {
          success: false,
          error: {
            code: String(payload.error.code ?? 'RPC_ERROR'),
            message: payload.error.message ?? 'Unknown RPC error',
          },
        };
      }

      const text = payload.result?.content?.[0]?.text;
      const parsedData = text ? (JSON.parse(text) as Record<string, unknown>) : {};
      return {
        success: true,
        data: parsedData,
      };
    } else {
      const errText = await res.text();
      return {
        success: false,
        error: {
          code: `HTTP_${res.status}`,
          message: errText || res.statusText,
        },
      };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message,
      },
    };
  }
}

/**
 * Initialize WebMCP on the window object with tamper-proof freezing and event listeners.
 */
export function initializeWebMCP(): WebMCPBridge | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const existing = (window as unknown as { __screened_web_mcp__?: WebMCPBridge })
    .__screened_web_mcp__;
  if (existing?.protocol === 'WebMCP/2026') {
    return existing;
  }

  const bridge: WebMCPBridge = {
    version: '1.0.0',
    protocol: 'WebMCP/2026',
    tools: WEBMCP_TOOLS,
    executeTool: executeWebMCPTool,
  };

  // Seal and freeze runtime to prevent tamper
  Object.freeze(bridge.tools);
  Object.freeze(bridge);

  (window as unknown as { __screened_web_mcp__: WebMCPBridge }).__screened_web_mcp__ = bridge;

  // Listen for CustomEvent triggers from browser extensions or sidecar agents
  window.addEventListener('webmcp:call', async (event: Event) => {
    const customEvent = event as CustomEvent<{
      callId: string;
      tool: string;
      parameters: Record<string, unknown>;
    }>;
    if (!customEvent.detail) return;

    const { callId, tool, parameters } = customEvent.detail;
    const result = await executeWebMCPTool(tool, parameters || {});

    window.dispatchEvent(
      new CustomEvent('webmcp:result', {
        detail: {
          callId,
          ...result,
        },
      })
    );
  });

  return bridge;
}
