# Screened: Agentic Due Diligence for Independent Cinema

## Inspiration
Independent filmmakers spend thousands of pounds on festival submission fees, often falling victim to opaque screening venues, predatory organizers, and deceptive premiere policies. "Screened" was born to transform cinema due-diligence from guesswork into an autonomous, transparent multi-agent investigation. We wanted to build a research room, not a blackbox trust score.

## What it does
Screened operates an orchestrated pipeline of specialized autonomous agents using the Google ADK, Gemini, and the Parallel Search API. A conversational "Producer Desk" agent takes filmmaker queries or uploaded scripts and dispatches specialized tools. The system dissects subject entities, gathers public evidence from official registries, and grounds atomic claims using retrieved evidence sources and timestamps. It provides a Generative Mini-UI for users to review the evidence and make informed submission decisions.

## How we built it
We utilized a multi-agent architecture built on the Google Agent Development Kit (ADK):
*   **Orchestration**: ADK's `LlmAgent`, `SequentialAgent`, and `ParallelAgent` coordinate the research pipeline.
*   **Reasoning**: Vertex AI (Gemini 2.5 Pro & Flash) handles conversational function calling, contradiction analysis, and narrative synthesis.
*   **Evidence Layer**: The Parallel API provides Search, Extract, Task API, FindAll, and Monitor capabilities, serving as the sole source of factual truth.
*   **Backend & Frontend**: A high-performance FastAPI backend manages state via Google Cloud Firestore, while a React 19 + Tailwind CSS frontend provides interactive Generative Mini-UIs and React Flow provenance diagrams.

## Challenges we ran into
Integrating multiple asynchronous agents while maintaining a cohesive user experience required building a robust Event Bridging system. Ensuring that Gemini never hallucinated evidence meant strictly separating the "reasoning layer" (Gemini) from the "evidence layer" (Parallel).

## Accomplishments that we're proud of
*   **100% Verifiable Evidence**: Every claim is backed by a direct link to a verbatim quote with source tier tags.
*   **Generative Mini-UIs**: Embedding interactive, context-aware applications directly within the chat interface.
*   **Cryptographic Integrity**: Implementing SHA-256 payload hashing for action approval gates, ensuring complete transparency and security.

## What we learned
Building an agentic system requires strict guardrails. The ADK's structured state machine, combined with Gemini's advanced function calling, allowed us to build a deterministic and reliable research assistant. We also learned the immense value of separating reasoning (LLMs) from evidence gathering (Search APIs) to build trust.

## What's next for Screened
We plan to expand our monitoring capabilities, allowing filmmakers to track festival credibility shifts over time using Parallel's Monitor API. We also aim to integrate more specialized industry databases and refine our "Opportunity Scout" matching algorithms.
