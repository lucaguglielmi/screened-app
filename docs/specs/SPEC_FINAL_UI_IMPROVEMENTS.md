# Spec: Final UI Improvements (Mobile & Desktop)

**Status:** COMPLETED (Implemented & Verified)
**Date:** September 9, 2026

## 1. Overview
This specification details a set of final UI polish tasks, specifically targeting the mobile experience on the main chat interface, footer, and disambiguation cards, to reduce visual clutter and improve user comprehension. It also includes the restoration of the terminal-style agent progress console and a fix for the investigation progress timer.

## 2. Changes Required

### 2.1 Viewport / Zoom (Mobile)
**Target Component:** `index.html`
- **Disable Zoom:** Ensure the page cannot be zoomed past 100% on mobile devices by updating the viewport meta tag (e.g., adding `maximum-scale=1, user-scalable=no`).

### 2.2 Chat Bubble Styling
**Target Component:** Initial Screened AI chat bubble.
- **Background Color:** Darken the background color of the chat bubble so it visually contrasts more distinctly from the main input field below it.
- **Font Size:** Change the font size of the text inside the chat bubble to `14px` (`text-sm`) to improve readability and visual hierarchy.

### 2.3 "What can I ask" Link
**Target Component:** The helper link below Quick Actions.
- **Icon Removal (Mobile):** Remove the preceding icon (e.g., `HelpCircle` or `Info` icon) strictly on mobile viewports.

### 2.4 The `/demo` Hint
**Target Component:** The hint text currently located below the main input field.
- **Relocation:** Move this hint to sit on the right side of the "QUICK ACTIONS:" section header.
- **Text Update:** Change the text to simply read `"try /demo"`. 
- **Styling:** Retain the existing styling (size and colors) for the `/demo` pill/text.

### 2.5 Footer Overhaul
**Target Component:** The main application footer (`AppFooter.tsx`) and the existing feedback button.
- **Remove "Leave Feedback" link:** Remove the standalone "Leave feedback" button from below the chat input.
- **Remove Tagline Row:** Completely remove the row containing `"Screened · Agentic Cinema Due Diligence · totallyscreened.com"`.
- **Remove "About Screened":** Remove this link entirely from the footer, as it is accessible by clicking the Screened AI avatar.
- **Streamline Footer Menu:** Consolidate the footer links into a single row of one-word items:
  - `Privacy`
  - `Terms`
  - `Cookies`
  - `Feedback` (This replaces the old "Leave feedback" button).

### 2.6 Disambiguation UI Polish
**Target Component:** Disambiguation cards (e.g., `EntityConfirmation.tsx` or similar).
- **Stack Elements on Mobile:** Ensure data points that are currently squashed into a single row on mobile (such as the location "Miami, United States" and the website URL) are stacked vertically (`flex-col` on mobile, `flex-row` on desktop). Audit other areas in the UI where mobile elements are squashed and apply this stacking rule.
- **Festival Description Size:** Reduce the font size of the festival description text inside the disambiguation card to `14px` (`text-sm`).

### 2.7 Reinstate Terminal Console
**Target Component:** The live investigation progress view (e.g., `LiveProgress.tsx` or `TerminalLog.tsx`).
- **Terminal UI Restoration:** Add back the black, console-like terminal box under the progression tabs. 
- **Live Stream Effect:** Ensure it displays the live information, data fetches, and extractions from the parallel agents. It should constantly update and scroll to indicate the speed and depth of the search.

### 2.8 Investigation Timer Fix
**Target Component:** The active search timer (likely in `LiveProgress.tsx` or a custom timer hook).
- **Diagnosis & Fix:** Investigate why the timer gets stuck at `0.1s`, jumps to `15s`, and freezes again. Ensure the visual timer measures elapsed time continuously and smoothly, independent of external SSE event delays, utilizing a robust `setInterval` or `requestAnimationFrame` ticking mechanism tied to the absolute `startTime`.
- **Tooltip Addition:** Add a hover tooltip to the timer that displays both the "Total Elapsed Time" (smooth local ticking) and the "Last Server Event Time" (when the last update was actually received from the server) to provide transparency.

## 3. Execution Plan
1. Update `index.html` viewport meta tag.
2. Update `ChatContainer.tsx` (or relevant message component) for bubble color, text size, and `/demo` hint relocation.
3. Update `AppFooter.tsx` to implement the stripped-down 4-word menu layout.
4. Update `EntityConfirmation.tsx` to fix mobile flex wrapping/stacking and description text size.
5. Revert or re-implement the terminal console in the live investigation component (`LiveProgress.tsx`).
6. Debug and fix the local ticking logic for the investigation timer so it runs smoothly without freezing.
7. Verify changes across mobile and desktop viewports using Chrome DevTools.

---
**Note to Agent:** Do not execute these changes until the user explicitly responds with an approval (e.g., "proceed" or "execute the spec").
