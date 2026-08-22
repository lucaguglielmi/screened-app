# 🎬 Engineering Specification: Screened Conversational Concierge ("The Producer Desk") & Interactive Design Playground

> **Document Version**: 2.1.0-SPEC  
> **Target System**: Screened — Agentic Cinema Due Diligence  
> **Architecture Pattern**: Conversational Agent Orchestrator with Gemini Function Calling, Embedded Generative Mini-UIs, and Component Design Playground  
> **Status**: Approved for Implementation

---

## 1. Executive Summary & Core Concept

**Screened** evolves into an agentic conversational workspace where filmmakers and producers start at **"The Producer Desk"** — an autonomous executive cinema intelligence agent powered by **Google Gemini 2.5 Pro Tool / Function Calling API**.

Instead of manually navigating disparate forms, users can talk, paste festival links, or drag & drop PDFs (scripts, acceptance emails, or invoices). The agent reasons over their request and dynamically mounts **dedicated interactive Mini-UIs inside chat bubbles**. When the user clicks the primary action inside any embedded Mini-UI, the system transitions into the full dedicated research workspaces (**Due Diligence** or **Opportunity Scout**) with live streaming data.

Additionally, this specification includes an isolated **Interactive Design Playground (`/playground`)** to test, review, and fine-tune every visual component, state loader, and mini-app card across light/dark themes in isolation.

---

## 2. System Architecture & Interaction Loop

```
                      [ Filmmaker Prompt / PDF Drop / Preset Chip ]
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │      "The Producer Desk" Conversational Agent │
                    │    (Vertex AI Gemini 2.5 Pro Function Calling)│
                    └───────────────────────┬───────────────────────┘
                                            │
                                            ▼ (Autonomous Tool Invocation)
                    ┌───────────────────────────────────────────────┐
                    │      Embedded Mini-UI Inside Chat Bubble      │
                    │   ┌─────────────────────────────────────────┐ │
                    │   │  Pre-filled Parameters & Entity Preview │ │
                    │   │  Confidence Radar & Strategy Rationale  │ │
                    │   │  [ 🚀 Run Full Due Diligence ] Action   │ │
                    │   └─────────────────────────────────────────┘ │
                    └───────────────────────┬───────────────────────┘
                                            │ (User Clicks Primary Action)
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │   Seamless Transition to Full Dedicated Page  │
                    │    (/diligence or /scout with Live Pipeline)  │
                    └───────────────────────────────────────────────┘
```

---

## 3. Navigation & Route Hierarchy

| Route | View | Description |
| :--- | :--- | :--- |
| **`/`** | **`The Producer Desk`** | Conversational homepage with large prompt bar, AI chat bubbles, and generative mini-apps. |
| **`/diligence`** | **`Due Diligence`** | Standalone multi-agent research core, Evidence Dossier, Detail Dial, and Action Approval Gate. |
| **`/scout`** | **`Opportunity Scout`** | Standalone film profile matcher, qualification badges, and deadline calendar (.ics). |
| **`/playground`** | **`Design Playground`** | **[NEW]** Interactive component studio to visually review and tweak all chat and AI widgets. |

---

## 4. Gemini Agent Tool Declarations (`google-genai` SDK)

The backend agent uses official Gemini Function Calling schema declarations:

### 4.1 Tool 1: `configure_due_diligence`
Invoked when the user asks about festival legitimacy, screening venues, organizers, fees, or scams.
```json
{
  "name": "configure_due_diligence",
  "description": "Configures a deep-dive multi-agent credibility investigation for a specific film festival or cinema entity.",
  "parameters": {
    "type": "OBJECT",
    "properties": {
      "festival_name": { "type": "STRING", "description": "Exact name of the festival or organization." },
      "optional_url": { "type": "STRING", "description": "Official website or submission portal URL if mentioned." },
      "suspected_concerns": {
        "type": "ARRAY",
        "items": { "type": "STRING" },
        "description": "Specific areas to scrutinize: ['VENUE_LEGITIMACY', 'FEE_TRANSPARENCY', 'PREDATORY_AWARDS', 'ORGANIZER_TRACK_RECORD']."
      },
      "preflight_summary": { "type": "STRING", "description": "1-2 sentence executive overview explaining why this festival warrants scrutiny." }
    },
    "required": ["festival_name", "preflight_summary"]
  }
}
```

### 4.2 Tool 2: `configure_opportunity_scout`
Invoked when the user seeks submission strategies, deadline calendars, or qualification roadmaps.
```json
{
  "name": "configure_opportunity_scout",
  "description": "Prepares a tailored festival submission roadmap and scouts upcoming qualifying deadlines for a specific film profile.",
  "parameters": {
    "type": "OBJECT",
    "properties": {
      "film_title": { "type": "STRING", "description": "Working project title." },
      "format": { "type": "STRING", "enum": ["SHORT", "FEATURE", "DOCUMENTARY", "ANIMATION", "EPISODIC"] },
      "genre": { "type": "STRING", "description": "Primary genre." },
      "runtime_minutes": { "type": "INTEGER", "description": "Total film runtime in minutes." },
      "premiere_goal": { "type": "STRING", "enum": ["WORLD_PREMIERE", "INTERNATIONAL_PREMIERE", "NATIONAL_PREMIERE", "NO_PREFERENCE"] },
      "budget_tier": { "type": "STRING", "description": "Budget category (e.g., 'Micro (<£50k)', 'Low (<£250k)')." },
      "target_regions": { "type": "ARRAY", "items": { "type": "STRING" } },
      "strategy_rationale": { "type": "STRING", "description": "Strategic positioning angle." }
    },
    "required": ["film_title", "format", "genre", "strategy_rationale"]
  }
}
```

### 4.3 Tool 3: `compare_festivals_arena`
Invoked when comparing two festivals side-by-side (e.g. *"Sundance vs Tribeca"*).
```json
{
  "name": "compare_festivals_arena",
  "description": "Renders a side-by-side comparison matrix between two film festivals evaluating fee vs prestige, audience reach, and accreditation.",
  "parameters": {
    "type": "OBJECT",
    "properties": {
      "festival_a": { "type": "STRING" },
      "festival_b": { "type": "STRING" },
      "key_comparison_vectors": { "type": "ARRAY", "items": { "type": "STRING" } },
      "verdict_summary": { "type": "STRING" }
    },
    "required": ["festival_a", "festival_b", "verdict_summary"]
  }
}
```

---

## 5. Embedded Mini-UI Card Specifications

### 5.1 `MiniDueDiligence.tsx`
- **Visuals**: Film noir investigation badge, detected entity city/country, pre-flight controversy highlight, and track checklist.
- **Interactive Controls**: Editable festival name/URL and track toggles.
- **Action**: `[ 🚀 Launch Deep Screen ]` — navigates to `/diligence` and starts live research.

### 5.2 `MiniScoutCard.tsx`
- **Visuals**: Project slate summary pill (Runtime, Format, Genre, Budget), qualification badge radar, and strategic positioning note.
- **Interactive Controls**: Inline runtime and budget sliders.
- **Action**: `[ 🧭 Scout All Opportunities ]` — navigates to `/scout` with film profile pre-loaded.

### 5.3 `MiniCompareArena.tsx`
- **Visuals**: Split card with dual column indicators: Accreditation, Typical Entry Fee, Acceptance Rate Tier, and Strategy Verdict.
- **Action**: `[ Investigate Festival A ]` or `[ Investigate Festival B ]`.

---

## 6. Interactive Design Playground Specification (`/playground`)

The **Design Playground** is a dedicated visual workbench where designers and developers can review, test, state-cycle, and modify every chat component and AI widget in total isolation.

### 6.1 Playground Features & Controls

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎨 SCREENED COMPONENT STUDIO & DESIGN PLAYGROUND                           │
│ Theme: [ Light / Dark ]  │  Stream Sim: [ ▶ Play Token Stream ]  │  Sound: [🔊]│
├─────────────────────────────────────────────────────────────────────────────┤
│ Component Sections Navigator:                                               │
│ [1. Chat Bubbles] [2. Loaders & Thinking] [3. Mini-UIs] [4. Prompt Bars]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ── Section 1: Chat Bubble Variations ────────────────────────────────────── │
│   • User Prompt Bubble (With & without attached PDF badge)                  │
│   • Assistant Markdown Response (Headings, bullet points, citations)        │
│   • System Notification Bubble (Disambiguation, Error Alert)                │
│                                                                             │
│ ── Section 2: Agent Loaders & State Indicators ──────────────────────────── │
│   • AgentThinkingPill: "Consulting trade registries..."                     │
│   • PulseFilmReel: Animated spinning reel during Parallel Search            │
│   • StreamCursor: Glowing typewriter indicator                              │
│                                                                             │
│ ── Section 3: Embedded Generative Mini-Apps ─────────────────────────────── │
│   • MiniDueDiligence (Standard State · Expanded State · Executing State)    │
│   • MiniScoutCard (Shorts Profile · Feature Profile · Disputed Alert)       │
│   • MiniCompareArena (Side-by-side festival radar comparison)               │
│                                                                             │
│ ── Section 4: Prompt Bars & File Drop Zones ─────────────────────────────── │
│   • Default Empty Prompt Bar with Starter Prompt Chips                      │
│   • Drag-and-Drop Active Overlay ("Drop your PDF script or email here")    │
│   • Attached File Chip (With remove button & file size preview)             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Interactive Playground Capabilities
1. **Live State Simulator**:
   - Includes a **"Simulate Agent Streaming"** button that sends staged tokens at 30ms intervals to test streaming smoothness and typewriter cursor alignment.
2. **Interactive Event Triggers**:
   - Buttons on each Mini-UI card to trigger simulated transitions, tool loading spinners, and audio sound effects.
3. **Zero-Backend Dependency**:
   - The Playground is self-contained with mock fixture data, enabling rapid styling iteration without burning Gemini or Parallel API quota.

---

## 7. Implementation Architecture

```
screened-app/
├── frontend/src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx         # Main chat stream with auto-scroll & empty states
│   │   │   ├── ChatBubble.tsx            # Formatted text bubble with markdown rendering
│   │   │   ├── AgentThinkingPill.tsx     # Pulsing tool selection indicator
│   │   │   ├── ChatPromptBar.tsx         # Cinematic prompt input with PDF drag-and-drop
│   │   │   ├── StarterPromptChips.tsx    # Clickable starter prompt suggestions
│   │   │   └── mini_apps/
│   │   │       ├── MiniDueDiligence.tsx  # Embedded Due Diligence pre-flight card
│   │   │       ├── MiniScoutCard.tsx     # Embedded Opportunity Scout card
│   │   │       └── MiniCompareArena.tsx  # Embedded Festival Versus Arena card
│   │   ├── playground/
│   │   │   └── DesignPlayground.tsx      # Interactive component studio for chat & AI widgets
│   │   └── ToolSwitcher.tsx              # Navigation bar updated with "The Desk", "Due Diligence", "Scout", "Playground"
│   ├── types/
│   │   └── chat.ts                       # TypeScript interfaces for Chat, ToolPayloads, and Sessions
│   └── App.tsx                           # Master router integrating Conversational Desk, Diligence, Scout, and Playground
└── backend/
    ├── agents/
    │   └── producer_desk.py              # Gemini 2.5 Pro Conversational Agent with Function Calling
    ├── models.py                         # ChatMessage, ChatSession, and ToolPayload Pydantic schemas
    └── main.py                           # POST /api/chat streaming endpoint
```

---

## 8. Verification & Acceptance Criteria

1. **Agent Tool Resolution**: Gemini 2.5 Pro correctly chooses between `configure_due_diligence` and `configure_opportunity_scout` based on user intent.
2. **Streaming Performance**: Tokens stream cleanly over SSE without layout jitter or broken Markdown formatting.
3. **Seamless Navigation**: Clicking "Launch" inside an embedded Mini-UI card transitions to the dedicated workspace with zero redundant re-typing.
4. **Design Playground Isolation**: `/playground` renders all component variations, loading states, and embedded cards with interactive state toggles in both light and dark modes.

---
*Specification saved to `docs/SPEC_CONVERSATIONAL_PRODUCER_DESK.md`.*
