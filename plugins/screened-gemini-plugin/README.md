# 🪐 Screened Cinema Intelligence — Google Antigravity & Gemini Plugin

This plugin connects **Google Antigravity** and the **Gemini CLI** to **Screened**, providing autonomous cinema festival due diligence, predatory fee detection, and public film grant scouting.

---

## 📦 What's Included

- **`plugin.json`**: Plugin manifest metadata.
- **`mcp_config.json`**: Pre-configured remote MCP server pointing to Screened's Cloud Run production SSE endpoint (`/api/mcp/sse`).
- **`rules/AGENTS.md`**: Forensic evidentiary rules, anti-hallucination policies, prompt injection quarantine defense, and filmmaker IP data minimization standards.
- **`skills/screened-festival-diligence/`**: Multi-vector forensic runbook for vetting film festivals against corporate registries and venue calendars.
- **`skills/screened-grant-scout/`**: Institutional grant scouting and 4-pillar application readiness checklist generator (BFI, Creative Europe, Doc Society).

---

## 🚀 Quickstart & Installation

### Option 1: Zero-Config Workspace (Automatic)
When you open the `screened-app` repository in Google Antigravity, the plugin is automatically discovered and activated from `.agents/plugins/screened/`. No manual installation is necessary.

### Option 2: Global Machine-Wide Installation
To make Screened intelligence available across all projects on your system:

```bash
# Create Antigravity plugins directory if not present
mkdir -p ~/.gemini/config/plugins

# Copy the plugin
cp -r plugins/screened-gemini-plugin ~/.gemini/config/plugins/screened
```

Restart your Antigravity session or reload plugins. Screened tools and skills will now be active in every project.

---

## 🛠️ Included Tools (via Cloud Run MCP SSE)

- `screened_ask_dossier`: Inquire about festival evidence, venue manifests, and corporate entity status.
- `screened_inspect_claim`: Deep-dive into specific atomic claims with verbatim extracted quotes and provenance URLs.
- `screened_scout_grants`: Search verified non-repayable public film grants by budget tier, genre, and production stage.
- `screened_start_investigation`: Trigger a live autonomous multi-agent web crawl for an unindexed festival (requires confirmation).

---

## 🔒 Security & Privacy
- **Untrusted Content Quarantine**: Crawled festival text is quarantined inside `<untrusted_evidence_data>` tags to prevent indirect prompt injection.
- **Filmmaker Privacy**: Script synopses and pitch decks are processed with zero PII retention; full scripts are never sent to external search APIs.
