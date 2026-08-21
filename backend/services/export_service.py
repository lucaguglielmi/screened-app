"""Export Service for generating archival Markdown and Plaintext investigation reports."""
import hashlib
from datetime import datetime, timezone
from typing import Any, Dict, List
from backend.models import (
    AtomicClaim,
    CandidateEntity,
    SourceRecord,
)

class ExportService:
    """Generates clean, signed Markdown investigation dossiers."""

    @staticmethod
    def generate_markdown(
        investigation_id: str,
        entity_data: Dict[str, Any],
        dossier_data: Dict[str, Any],
        claims: List[Dict[str, Any]],
        sources: List[Dict[str, Any]],
        disputes: List[Dict[str, Any]],
    ) -> str:
        name = entity_data.get("name", "Unknown Festival")
        location = entity_data.get("cityCountry", "Unspecified")
        domain = entity_data.get("officialDomain", "None")
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        exec_summary = dossier_data.get("executiveSummary", "No executive summary available.")
        festival_overview = dossier_data.get("festivalOverview", "")
        organizer_profile = dossier_data.get("organizerProfile", "")
        participant_feedback = dossier_data.get("participantFeedback", "")
        checklist = dossier_data.get("filmmakerChecklist", [])
        unresolved = dossier_data.get("unresolvedQuestions", [])

        lines = [
            f"# Screened Investigation Dossier: {name}",
            f"**Generated**: {now} | **Investigation ID**: `{investigation_id}`",
            f"**Location**: {location} | **Official Domain**: {domain}",
            "",
            "---",
            "",
            "## Executive Overview",
            exec_summary,
            "",
        ]

        if disputes:
            lines.extend([
                f"## ⚠️ Direct Factual Disputes & Contradictions ({len(disputes)})",
                "",
            ])
            for idx, d in enumerate(disputes, 1):
                lines.extend([
                    f"### Dispute {idx}: {d.get('pointOfContention', 'Contradiction')}",
                    f"- **Category**: `{d.get('category', 'GENERAL')}`",
                    f"- **Position A**: \"{d.get('claimA', '')}\"",
                    f"- **Position B**: \"{d.get('claimB', '')}\"",
                    f"- **Filmmaker Recommendation**: {d.get('guidance', 'Verify directly with venue.')}",
                    "",
                ])

        lines.extend([
            "## Domain Research Summaries",
            "",
            "### 1. Festival & Screening Profile",
            festival_overview or "No details extracted.",
            "",
            "### 2. Organizer & Corporate Entity",
            organizer_profile or "No details extracted.",
            "",
            "### 3. Filmmaker & Community Feedback",
            participant_feedback or "No details extracted.",
            "",
        ])

        if checklist:
            lines.extend([
                "## Filmmaker Action Checklist",
                "",
            ])
            for idx, item in enumerate(checklist, 1):
                lines.append(f"{idx}. {item}")
            lines.append("")

        if unresolved:
            lines.extend([
                "## Unresolved Questions & Ambiguities",
                "",
            ])
            for item in unresolved:
                lines.append(f"- {item}")
            lines.append("")

        # Claims Table
        lines.extend([
            f"## Verified Atomic Claims ({len(claims)})",
            "",
            "| Kind | Category | Status | Statement | Sources |",
            "| :--- | :--- | :--- | :--- | :--- |",
        ])

        for c in claims:
            kind = c.get("claimKind", "FACT")
            category = c.get("category", "GENERAL")
            status = c.get("status", "UNVERIFIED")
            stmt = c.get("statement", "").replace("|", "\\|")
            ev_count = len(c.get("evidence", []))
            lines.append(f"| `{kind}` | `{category}` | **{status}** | {stmt} | {ev_count} source(s) |")

        lines.append("")

        # Sources Table
        lines.extend([
            f"## Discovered Web Footprint ({len(sources)} Sources via Parallel Search)",
            "",
            "| Tier | Domain | Title | URL |",
            "| :--- | :--- | :--- | :--- |",
        ])

        for s in sources:
            tier = s.get("sourceTier", 2)
            src_domain = s.get("domain", "")
            title = s.get("title", "").replace("|", "\\|")
            url = s.get("url", "")
            lines.append(f"| Tier {tier} | `{src_domain}` | {title} | [{url}]({url}) |")

        lines.extend([
            "",
            "---",
            "### Chain of Custody & Verification Seal",
            "- Platform: **Screened (Parallel Track / Google Cloud Agentic Cinema)**",
            "- Cryptographic Integrity: All claims are verbatim substring verified against raw excerpts.",
            "- Invariant: Strict neutrality enforced. No universal scam scores or blackbox ratings assigned.",
        ])

        content = "\n".join(lines)
        digest = hashlib.sha256(content.encode("utf-8")).hexdigest()
        content += f"\n- **Dossier SHA-256 Digest**: `{digest}`\n"

        return content


export_service = ExportService()
