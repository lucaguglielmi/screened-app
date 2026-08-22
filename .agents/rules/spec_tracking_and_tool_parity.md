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
