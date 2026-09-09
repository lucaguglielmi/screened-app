# Screened Forensic Swarm Architecture

This document outlines the architecture and execution pipeline for Screened's 7-Agent Forensic Swarm, powered by Google ADK and Gemini 2.5.

## 1. Pipeline Overview

When a user submits a film festival to vet (`/api/investigations`), the investigation follows a strict sequence:

1. **Disambiguation Phase**: The `DisambiguatorAgent` normalizes the target name, identifying the canonical legal entity, Wikipedia aliases, and primary jurisdiction.
2. **Planning Phase**: The `PlannerAgent` divides the investigation into 7 highly specialized research domains, formulating targeted parallel search queries for each.
3. **Execution Phase (7-Agent Swarm)**: 7 parallel domain agents execute simultaneously via `asyncio.gather(*tasks)` to maximize throughput and minimize latency.
4. **Synthesis Phase**: The `ContradictionAnalystAgent` and `ReportWriterAgent` cross-examine the claims to synthesize the final dossier and calculate the Transparency Radar score.

## 2. The 7-Agent Specialist Swarm

Each agent in the swarm inherits from `google.adk.agents.LlmAgent` and receives a bespoke system prompt tied to its domain:

| Domain Enum | Swarm Identity | Execution Scope & Objective |
| :--- | :--- | :--- |
| **`FESTIVAL`** | **`OfficialSiteCrawler`** | Scans the festival's official domain for rules, boilerplate T&Cs, and structural anomalies. |
| **`ORGANIZER`** | **`CorporateRegistry`** | Interrogates commercial registers (Companies House, OpenCorporates) to map the legal entity footprint, founders, and directors. |
| **`PARTICIPANTS`**| **`CommunitySentiment`** | Audits Reddit, Letterboxd, and forums for filmmaker alumni reviews, complaints, and controversies. |
| **`FEES`** | **`PlatformScout`** | Audits submission platforms (FilmFreeway, Festhome) to track fee escalation tiers and late-deadline surges. |
| **`VENUES`** | **`VenueForensics`** | Verifies physical screening realities, theater leases, and municipal event manifest records. |
| **`CLAIMS`** | **`HeritageAudit`** | Cross-references historical continuity (past editions, winners) using Wikipedia citations and news archives. |
| **`FIT`** | **`InstitutionalArchive`** | Confirms public funding, BFI/FIAPF status, and local/national government film commission grants. |

## 3. Resiliency & Rate Limiting

The architecture is designed to handle extreme concurrency (e.g., Hackathon evaluation load):

- **Asynchronous Execution**: By utilizing `asyncio.gather(return_exceptions=True)`, the pipeline prevents a single agent's API failure or timeout from collapsing the entire dossier.
- **NAT-Aware Rate Limiting**: The `TieredRateLimiter` ensures evaluation proxies don't trigger `429 Too Many Requests` false positives, with scaled limits (60-180 req/min).
- **Graceful Degradation**: If an agent hits a token quota limit, it returns an empty `claims` array for that domain, allowing the `ReportWriterAgent` to synthesize a partial—but functional—dossier.

## 4. OpenTelemetry Tracing

Every request is wrapped in OpenTelemetry spans. The parent `trace_id` generated at the orchestrator root (`start_investigation`) is propagated downstream to each of the 7 swarm agents, allowing precise latency profiling per domain in GCP Trace.

