# Agent Rule: Spec Tracking Hook & AI Tool Parity Protocol

## 1. What's Next & Spec Tracking Hook Protocol
Whenever the user asks:
- *"what's next?"*
- *"what should we work on?"*
- *"anything i should work on next?"*
- or any similar planning / status inquiry

You **MUST ALWAYS**:
1. Check `WHAT_THE_HUMAN_SHOULD_DO.md` for any pending decisions, test assets, or actions required from the user.
2. Review all active specs in `RESEARCH/antigravity-plan/` (especially Specs 12, 13, 14, 15) to list unfinished/in-flight specs and completed ones.
3. If any spec is fully concluded, ask the human creator if they wish to mark it completed or archive it.
4. Add 2–3 concise, high-value ideas of your own (keep them short; only expand if the user asks for more).

---

## 2. AI Tool Parity Rule
- Every generative tool, modal, slider, input, chat bubble, avatar, or state rendered in the main application **MUST** have an exact, fully interactive mirror in the **Design Playground** (`/playground`).
- If you modify a tool or logic in the chat/app, immediately update the corresponding Playground sandbox and documentation tab.
- If a new component or design is developed in the Playground, ensure it connects cleanly to the real application pipeline without drift.

---

## 3. Capabilities Catalog ('What does it do?') Maintenance Protocol
- Whenever a new feature, agent tool, search mode, or diagnostic capability is added or expanded in Screened (e.g. Due Diligence checks, Grant funds, Opportunity Scout parameters, Laurel audits, Deep Vetting dimensions):
  1. You **MUST** update `frontend/src/components/modals/CapabilitiesModal.tsx` to add the new capability under its corresponding domain card.
  2. Provide real-world, 1-click executable `searchExamples` queries for that new capability with 16px readable font and minimal interactive tag chips.

---

## 4. Standard 2-Stage In-Chat Tool Pattern Mandate
The main AI interface is **Mission Control**. Individual tools each possess their own page/workspace, but can also be invoked directly inside Mission Control via this mandatory 2-stage interaction pattern:

1. **User Inquiry**: User asks something in Mission Control chat.
2. **Agent Tool Selection**: Agent decides which tool is required and mounts the tool card.
3. **Stage 1 (Requirements Gathering UI)**: The mounted card displays inputs, sliders, file dropzone, and investigative checkboxes.
4. **Stage 2 (Review / Launch Confirmation UI)**: Once parameters are confirmed, the card switches to a concise summary card displaying parsed parameters, investigative directives, and the destination page.
5. **Launch & Workspace Redirection**: The user clicks `[ Launch & Open [Tool] → ]` which executes the action and redirects the user directly into that tool's dedicated full page/workspace.

**All new tools, widgets, and mini-apps MUST follow this 2-stage pattern without exception.**

---

## 5. Architecture Page Upkeep
- The **Design Playground** includes an `ArchitecturePage.tsx` component which tracks the system's live architecture (e.g. backend states, databases, AI pipelines).
- Whenever you make architectural changes, add new databases, implement new caching layers, or change deployment patterns, you **MUST** update `frontend/src/components/playground/ArchitecturePage.tsx` to reflect the new architecture.
