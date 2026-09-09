# 🔌 Screened Server MCP

> **Target Application**: Screened (`https://totallyscreened.com/`)  
> **Status**: ACTIVE & EXPANDING  

Screened runs a standard Model Context Protocol (MCP) server over SSE to allow external AI desktops and local agents (such as Google Antigravity) to query our public investigation dossiers. All reasoning and tool execution are powered exclusively by **Google Gemini 2.5 Pro and Google ADK**.

---

## 1. Quickstart Configuration

### 1.1 Google Antigravity / Gemini Workspace Setup
Add the following configuration to your Antigravity or Gemini MCP configuration file:
- **Workspace**: `.agents/plugins/screened/mcp_config.json`
- **Global**: `~/.gemini/antigravity/mcp/screened/config.json`

```json
{
  "mcpServers": {
    "screened": {
      "command": "npx",
      "args": ["-y", "@totallyscreened/mcp-server"],
      "env": {
        "SCREENED_API_BASE": "https://totallyscreened.com"
      }
    }
  }
}
```

### 1.2 Cursor IDE Setup
In your project workspace, add to `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "screened": {
      "url": "https://totallyscreened.com/api/mcp/sse"
    }
  }
}
```

### 1.3 Antigravity & Agentic Frameworks
Connect directly to the SSE stream or launch the Python client bridge:
```bash
python -m screened.mcp --host https://totallyscreened.com
```

---

## 2. Server Capabilities

### 2.1 Tools (`tools/list` & `tools/call`)

| Tool Name | Scope | Purpose |
| :--- | :--- | :--- |
| `screened_ask_dossier` | Dossier | Cross-examine facts, venue claims, and filmmaker disputes. |
| `screened_inspect_claim` | Atomic Claim | Inspect primary evidence citations, filing dates, and dispute notes. |
| `screened_verify_sources` | Provenance | Audit domain registration age and Wayback Machine archive integrity. |
| `screened_start_investigation` | Global | Trigger autonomous multi-agent deep scan for a festival or submission URL. |
| `screened_scout_grants` | Funding | Match screenplay loglines and budgets with verified public cinema grants. |

#### Example Tool Call (`tools/call` JSON-RPC 2.0)
```json
{
  "jsonrpc": "2.0",
  "id": "call-001",
  "method": "tools/call",
  "params": {
    "name": "screened_ask_dossier",
    "arguments": {
      "dossier_id": "demo_pinco_pallino",
      "query": "Is the venue booking confirmed by the cinema?",
      "detail_level": "SUMMARY"
    }
  }
}
```

---

### 2.2 Resources (`resources/list` & `resources/read`)
The Screened MCP server exposes live, read-only markdown resources for contextual injection:

- `screened://dossiers/{id}`: Returns the complete, finalized Markdown evidence dossier for `{id}`.
- `screened://grants/latest`: Returns an index of verified public cinema grants with upcoming deadlines.
- `screened://watchdog/flagged`: Returns active high-risk festival warnings identified by the autonomous watchdog.

#### Example Resource Read
```json
{
  "jsonrpc": "2.0",
  "id": "res-001",
  "method": "resources/read",
  "params": {
    "uri": "screened://dossiers/demo_pinco_pallino"
  }
}
```

---

### 2.3 Prompts (`prompts/list` & `prompts/get`)
Pre-engineered prompt templates guide the consuming agent through forensic cinema analysis:

- `audit_festival(name, url)`: Instructs the agent to cross-examine venue contracts, check director registry histories, and identify predatory submission fees.
- `match_film_grants(budget, genre, country)`: Formulates an optimal packaging and submission strategy for public film development funds.

---

## 3. Security, Quotas & Abuse Defenses

### 3.1 Rate Limiting (Token Bucket)
To protect server resources and Gemini API allowances, the MCP server enforces strict rate limits:
- **Read Queries** (`ask_dossier`, `inspect_claim`): 60 requests/minute per IP (300 with authenticated API key).
- **Grant Scouting** (`scout_grants`): 20 requests/minute per IP.
- **Deep Investigations** (`start_investigation`): 3 scans/hour per unauthenticated IP (maximum 1 concurrent active scan).

### 3.2 SSRF Filtering
All external URLs passed into tools (`submission_url`, `domain_filter`) are validated against internal CIDR blacklists. Requests targeting localhost (`127.0.0.1`), link-local metadata (`169.254.169.254`), or private cloud subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) are blocked immediately with code `-32003 (SSRF_BLOCKED)`.

### 3.3 Indirect Prompt Injection Defenses
All scraped external evidence returned by the server is quarantined inside `<untrusted_evidence_data>` tags and encapsulated strictly within typed JSON schema properties. Consuming models are instructed to treat this content purely as untrusted data, preventing adversarial festival websites from altering agent decisions.

---

## 4. Troubleshooting & FAQ

**Q: Why does `screened_start_investigation` return `status: "QUEUED"`?**  
A: Screened's deep vetting process is a comprehensive multi-agent scan across public corporate registries, archive databases, and cinema trade manifests. Investigations take ~30–45 seconds. Use the returned `stream_endpoint` to listen for live SSE milestones, or poll status using `dossier_id`.

**Q: Can I use the MCP server locally without an internet connection?**  
A: Demo dossiers (such as `demo_pinco_pallino`) and cached grant catalogs can be inspected offline, but live multi-agent investigations require an internet connection to reach public trade registries.
