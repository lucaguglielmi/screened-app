# 🌐 Screened WebMCP: In-Browser Agent Protocol Guide

> **Protocol Version**: `WebMCP/2026`  
> **Target Application**: Screened (`https://totallyscreened.com/`)  
> **Status**: ACTIVE & EXPANDING  

Screened's **WebMCP (Web Model Context Protocol)** exposes structured, type-safe JSON tools directly inside the browser DOM runtime. This allows autonomous AI assistants—such as Claude Computer Use, Gemini Live browser agents, Chrome with experimental agent flags, Cursor browser runners, and Playwright/Puppeteer agents—to cross-examine festival dossiers, audit citations, and dispatch investigations without fragile screen scraping or OCR vision models.

---

## 1. Why WebMCP Matters

Traditional web agents interact with applications by capturing screenshots and clicking estimated coordinate pixels, or scraping chaotic HTML trees. This approach is slow, brittle, and error-prone.

WebMCP introduces an in-page tool calling standard:
- **Instant Discovery**: When an AI agent opens Screened, it inspects `window.__screened_web_mcp__` to instantly receive a complete manifest of available forensic tools.
- **Context Awareness**: When navigating `/diligence/:id`, tools automatically inherit the active dossier context, allowing queries without re-transmitting large investigation state.
- **Zero-Install Human Experience**: Independent filmmakers do not need to install browser extensions or configure API tokens. They simply direct their browser assistant to Screened.

---

## 2. Global Runtime Interface

Upon page load, Screened registers its tool manifest on the global window namespace:

```typescript
interface WebMCPTool {
  name: string;
  scope: 'Dossier Scope (/diligence/:id)' | 'Platform Scope (Global)';
  description: string;
  parameters: Record<string, string>;
  examplePrompt: string;
}

interface WebMCPBridge {
  version: string;
  protocol: 'WebMCP/2026';
  tools: WebMCPTool[];
  execute: (toolName: string, params: Record<string, unknown>) => Promise<unknown>;
}

// Available globally in the browser:
window.__screened_web_mcp__: WebMCPBridge;
```

---

## 3. Available WebMCP Tools

### 1. `screened_ask_dossier`
Cross-examines evidence, claims, and filmmaker dispute notes in the active due diligence dossier.
- **Scope**: Dossier Scope (`/diligence/:id`)
- **Parameters**:
  - `query` (`string`, required): Natural language factual question (e.g. *"Did the festival confirm physical screenings at BFI Southbank?"*).
  - `detailLevel` (`"SUMMARY" | "FULL_EVIDENCE" | "RAW_SOURCES"`, optional): Defaults to `"SUMMARY"`.
  - `dossierId` (`string`, optional): Inferred automatically if viewing a dossier page.
- **Example In-Page Invocation**:
  ```javascript
  const res = await window.__screened_web_mcp__.execute('screened_ask_dossier', {
    query: 'Are there unresolved venue contradictions?'
  });
  console.log(res);
  ```

### 2. `screened_inspect_claim`
Inspects the evidentiary citation chain, Companies House registry cross-references, and source archive timestamps for a specific atomic claim.
- **Scope**: Dossier Scope (`/diligence/:id`)
- **Parameters**:
  - `claimId` (`string`, required): Unique claim key (e.g. `"claim_venue_01"`).
- **Example In-Page Invocation**:
  ```javascript
  const claim = await window.__screened_web_mcp__.execute('screened_inspect_claim', {
    claimId: 'claim_venue_01'
  });
  ```

### 3. `screened_verify_sources`
Audits the health and provenance of all bibliography URLs in the current dossier, identifying newly registered domains or missing Wayback Machine snapshots.
- **Scope**: Dossier Scope (`/diligence/:id`)
- **Parameters**:
  - `domainFilter` (`string`, optional): Restrict audit to a specific domain (e.g. `"filmfreeway.com"`).

### 4. `screened_start_investigation`
Dispatches an autonomous multi-agent deep scan for any film festival name or submission URL.
- **Scope**: Platform Scope (Global)
- **Parameters**:
  - `festivalName` (`string`, required): Official festival title.
  - `submissionUrl` (`string`, optional): Portal link (e.g. FilmFreeway, Shortfilmdepot).
  - `filmmakerConcerns` (`string[]`, optional): Specific risk vectors to prioritize.

### 5. `screened_scout_grants`
Matches screenplay project metadata against verified public grants, institutional co-production funds, and national lottery schemes.
- **Scope**: Platform Scope (Global)
- **Parameters**:
  - `projectTitle` (`string`, required): Working title of the film.
  - `budgetUsd` (`number`, required): Project budget in USD.
  - `genre` (`string`, required): Genre / format (e.g. `"Documentary Short"`).
  - `country` (`string`, required): Country of production origin.

---

## 4. Bidirectional DOM Event Bus

For browser extensions and headless agents that prefer event-driven architectures over direct window execution, Screened supports CustomEvent dispatching:

### Calling a Tool via DOM Event
```javascript
window.dispatchEvent(new CustomEvent('webmcp:call', {
  detail: {
    callId: 'call_9842',
    tool: 'screened_ask_dossier',
    parameters: {
      query: 'Does the organizer hold an active company registration?'
    }
  }
}));
```

### Listening for Results
```javascript
window.addEventListener('webmcp:result', (event) => {
  const { callId, success, data, error } = event.detail;
  if (callId === 'call_9842') {
    if (success) {
      console.log('Result:', data);
    } else {
      console.error('WebMCP Error:', error);
    }
  }
});
```

---

## 5. How Humans Use WebMCP Today

Humans can leverage WebMCP directly through modern AI assistants:

### Option 1: Chrome Experimental Features
1. In Google Chrome, navigate to `chrome://flags/#enable-experimental-web-platform-features`.
2. Enable the flag and relaunch Chrome.
3. Use a browser assistant capable of in-page tool discovery.

### Option 2: Claude Computer Use / Agent Workspaces
In agentic environments (such as Anthropic Claude with computer use, Cursor, or Antigravity), direct your agent:
> *"Open `https://totallyscreened.com/diligence/demo_pinco_pallino` and use WebMCP to verify if the operating company is dissolved on Companies House."*

### Option 3: Browser Developer Console
Open Developer Tools (`F12` or `Cmd+Option+I`) on any Screened page and query `window.__screened_web_mcp__` directly.

---

## 6. Security & Tamper Protections

1. **Object Freezing**: The `tools` array and `__screened_web_mcp__` root object are sealed using `Object.freeze()` on hydration to prevent malicious third-party scripts from hijacking or injecting fraudulent tools.
2. **Indirect Prompt Injection Quarantine**: All external text retrieved from festival websites is wrapped inside boundary quarantine tags (`<untrusted_evidence_data>`) and returned as structured data attributes, ensuring LLM agents do not interpret festival text as instructions.
3. **Origin Confinement**: Tool execution verifies that `window.location.origin` belongs to `totallyscreened.com`, Cloud Run deployment mirrors, or local testing hosts (`localhost:5173`, `localhost:8000`).
