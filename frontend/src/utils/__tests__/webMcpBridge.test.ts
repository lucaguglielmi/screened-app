import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initializeWebMCP,
  executeWebMCPTool,
  WEBMCP_TOOLS,
  WebMCPBridge,
} from '../webMcpBridge';

describe('WebMCP In-Browser Protocol Bridge', () => {
  beforeEach(() => {
    // Clear global window mock
    delete (window as unknown as { __screened_web_mcp__?: WebMCPBridge }).__screened_web_mcp__;
    vi.restoreAllMocks();
  });

  it('initializes window.__screened_web_mcp__ with sealed tools', () => {
    const bridge = initializeWebMCP();
    expect(bridge).not.toBeNull();
    expect(bridge?.protocol).toBe('WebMCP/2026');
    expect(bridge?.tools.length).toBe(5);

    // Verify tamper protection (Object.freeze)
    expect(Object.isFrozen(bridge)).toBe(true);
    expect(Object.isFrozen(bridge?.tools)).toBe(true);
  });

  it('exposes all 5 standardized tools', () => {
    const names = WEBMCP_TOOLS.map((t) => t.name);
    expect(names).toContain('screened_ask_dossier');
    expect(names).toContain('screened_inspect_claim');
    expect(names).toContain('screened_verify_sources');
    expect(names).toContain('screened_start_investigation');
    expect(names).toContain('screened_scout_grants');
  });

  it('executes tool via fetch to /api/mcp and handles response', async () => {
    const mockResponse = {
      jsonrpc: '2.0',
      id: 'web-1',
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              dossier_id: 'demo_pinco_pallino',
              verdict: 'FLAGGED',
              confidence_score: 88,
            }),
          },
        ],
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as unknown as Response);

    const result = await executeWebMCPTool('screened_ask_dossier', {
      dossier_id: 'demo_pinco_pallino',
      query: 'Is venue confirmed?',
    });

    expect(result.success).toBe(true);
    expect((result.data as { verdict: string }).verdict).toBe('FLAGGED');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/mcp',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('handles network failure gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    const result = await executeWebMCPTool('screened_verify_sources', {
      dossier_id: 'demo_pinco_pallino',
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('NETWORK_ERROR');
    expect(result.error?.message).toContain('Network offline');
  });
});
