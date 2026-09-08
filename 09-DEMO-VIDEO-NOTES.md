# 🎬 Screened — 3-Minute Blockbuster Hackathon Demo Blueprint

> **Track**: Parallel Track ($7,500 1st Place) · Devpost "Agentic Cinema: The Blockbuster Hackathon"  
> **Target Video Runtime**: Exactly 2:50 – 2:58 (Hard cut at 3:00 — judges stop watching after 180s)  
> **Speaker Voice**: Solo Developer ("I", "my project", authentic indie filmmaker perspective)  
> **Resolution / Audio**: 1080p 60fps, crisp microphone narration, sound effects audible  
> **Golden Path Showcase**: **Pinco Pallino Film Festival** (fictional mock entity complying with Section 7.C)

---

## ⏱️ Master Beat Sheet & Script Breakdown

| Time | Scene / UI State | Narration Script & Speaker Direction | Key Visual Focus |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:20**<br>(20s) | **The Origin Story & Extractive Crisis**<br>Landing on `https://screened...` Root Hero / "Why Screened" table | *"20 years ago, I created an indie movie that developed a cult following in Italy. When entering the festival circuit, I experienced firsthand how extractive submission fees can be. Today, independent filmmakers waste millions of dollars on predatory festivals and ghost events. I built Screened to give filmmakers autonomous forensic due diligence."* | Camera or screen recording over the landing page hero and comparison card. |
| **0:20 – 0:55**<br>(35s) | **Producer Desk & Gemini Function Calling**<br>Chat interface $\rightarrow$ `/demo` input $\rightarrow$ `FestivalIntakeCard` mounts | *"Meet the Producer Desk, powered by Google Gemini 2.5 and Google ADK. Instead of an ordinary chatbot, Gemini executes structured function calling to mount interactive mini-apps directly in the feed. Notice the hint: let's type `/demo` to launch an accelerated audit of Pinco Pallino Film Festival."* | Type `/demo` in the input bar. Point out the interactive `FestivalIntakeCard` mounting smoothly. |
| **0:55 – 1:35**<br>(40s) | **The Multi-Agent ADK & Parallel Search Engine**<br>Click 'Launch Due Diligence' $\rightarrow$ `LiveProgress` 20s simulation | *"Under the hood, Google ADK coordinates specialized sub-agents. FestivalAgent, OrganizerAgent, and ParticipantsAgent execute parallel queries across the open web using Parallel Web Systems. Parallel Search operates in sub-second fast mode, retrieving public event bookings, UK Companies House filings, and filmmaker forums with zero latency."* | The 20-second multi-agent pipeline lights up: Planning $\rightarrow$ Parallel Search $\rightarrow$ Claim Extraction $\rightarrow$ Contradiction Analysis. |
| **1:35 – 2:15**<br>(40s) | **The Zero-Hallucination Evidence Dossier**<br>Full `EvidenceDossier` mounts $\rightarrow$ Detail Dial $\rightarrow$ Popover Excerpts | *"Here is the core innovation: zero-hallucination due diligence. Every single claim is pinned to a verbatim excerpt from Parallel Extract, backed by a cryptographic SHA-256 hash. The system proves that while Pinco Pallino has confirmed physical screenings at Genesis Cinema Studio 4, its corporate entity uses a virtual office and late submission fees surge by 168%."* | Turn Detail Dial to 'Detailed Forensics'. Click Claim #1 (Genesis Cinema Studio 4) and Claim #3 (Companies House filing #13984712) to reveal verbatim Parallel Extract quotes. |
| **2:15 – 2:40**<br>(25s) | **The Money Shot: Festival Watch (Parallel Monitor)**<br>Toggle 'Watch Festival' $\rightarrow$ Trigger test webhook $\rightarrow$ Amber Alert Toast | *"Due diligence doesn't stop at submission. With Parallel Monitor, Screened tracks live festival URLs for silent policy drift. When an organizer sneaks in a deadline extension or a late fee spike, Parallel fires an HMAC-SHA256 webhook to our Cloud Run listener, instantly pushing a live alert to the filmmaker."* | Toggle 'Watch Festival'. Hit the test trigger button. Watch the amber alert toast slide in: *'🚨 Festival Watch Alert: Pinco Pallino extended deadline added with +40% fee escalation'*. |
| **2:40 – 3:00**<br>(20s) | **Architecture Hub & Google Cloud Deployment**<br>`/playground/architecture` D2 Diagram | *"Screened is deployed serverless on Google Cloud Run in London, backed by Firestore, Cloud Tasks, and Secret Manager, with an open Model Context Protocol server for external agent IDEs. Built natively with Google Antigravity, Gemini 2.5, and Parallel Web Systems. Thank you."* | Quick 15s display of the interactive D2 diagram showing the 8 ADK agents, Parallel 6-pillar engine, and Cloud Run infrastructure. |

---

## 🎯 Rehearsal Checklist for Recording

1. **Pre-flight Tab Setup**:
   - Tab 1: `https://screened-786241671474.europe-west2.run.app` (Clean session, chat cleared).
   - Tab 2: `https://screened-786241671474.europe-west2.run.app/playground/architecture` (Ready to switch to at 2:40).
2. **Audio & Cursor**:
   - Enable mouse click highlighting so judges see each button click clearly.
   - Speak naturally and candidly during the 0:00–0:20 backstory. Take pride in the Italian cult indie movie journey!
3. **Pacing Rules**:
   - Do **NOT** pause on silent loading screens. The 20-second `isPincoDemo` simulation is pre-timed so you can talk through the ADK agents without awkward silence.
   - Stop recording at **2:55** to guarantee you never cross the 3:00 disqualification threshold.
