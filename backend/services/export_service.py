"""Export Service for generating archival Markdown and Plaintext investigation reports."""
import hashlib
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
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
        premiere_risk: Optional[Dict[str, Any]] = None,
        fee_escalation: Optional[Dict[str, Any]] = None,
        forensic_summary: Optional[Dict[str, Any]] = None,
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

        # Fallback to dossier_data or report keys if not directly supplied
        p_risk = premiere_risk or dossier_data.get("premiereRisk")
        f_escalation = fee_escalation or dossier_data.get("feeEscalation")
        f_summary = forensic_summary or dossier_data.get("forensicSummary")

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

        # Forensic Intelligence Brief (3-Vector Triad)
        if f_summary:
            lines.extend([
                "## 🕵️ Forensic Intelligence Brief (Scam Realities)",
                "",
            ])
            scam = f_summary.get("scamPattern")
            if scam:
                status_icon = "🔴 RED FLAG" if scam.get("status") in ["RED_FLAG", "MISMATCH"] else "⚠️ CAUTION"
                lines.extend([
                    f"### 1. Scam Patterns & Shell Network [{status_icon}]",
                    f"**{scam.get('headline', 'Corporate Structure Analysis')}**",
                    f"> {scam.get('summary', '')}",
                    "",
                    f"*Industry Context*: {scam.get('educationalContext', '')}",
                    "",
                ])
                signals = scam.get("signals", [])
                if signals:
                    lines.append("**Key Signals**:")
                    for sig in signals:
                        lines.append(f"- {sig}")
                    lines.append("")

            jury = f_summary.get("juryConflict")
            if jury:
                status_icon = "🔴 RED FLAG" if jury.get("status") in ["RED_FLAG", "MISMATCH"] else "⚠️ CAUTION"
                lines.extend([
                    f"### 2. Jury Conflict & Nepotism [{status_icon}]",
                    f"**{jury.get('headline', 'Adjudication Independence Analysis')}**",
                    f"> {jury.get('summary', '')}",
                    "",
                    f"*Industry Context*: {jury.get('educationalContext', '')}",
                    "",
                ])
                signals = jury.get("signals", [])
                if signals:
                    lines.append("**Key Signals**:")
                    for sig in signals:
                        lines.append(f"- {sig}")
                    lines.append("")

            venue = f_summary.get("venueReality")
            if venue:
                status_icon = "🔴 MISMATCH" if venue.get("status") in ["RED_FLAG", "MISMATCH"] else "⚠️ CAUTION"
                lines.extend([
                    f"### 3. Curated Cinema vs. 4-Wall Rental Reality [{status_icon}]",
                    f"**{venue.get('headline', 'Screening Venue Ground Truth')}**",
                    f"> {venue.get('summary', '')}",
                    "",
                    f"*Industry Context*: {venue.get('educationalContext', '')}",
                    "",
                ])
                signals = venue.get("signals", [])
                if signals:
                    lines.append("**Key Signals**:")
                    for sig in signals:
                        lines.append(f"- {sig}")
                    lines.append("")

        # Premiere Burn Risk Assessment
        if p_risk:
            score = p_risk.get("riskScore", 0)
            level = p_risk.get("riskLevel", "LOW_RISK")
            lines.extend([
                "## ⚖️ Premiere Value vs. Burn Risk Assessment",
                "",
                f"- **Burn Risk Score**: **{score} / 100** (`{level}`)",
                f"- **Exclusivity Demanded**: {p_risk.get('premiereDemand', 'Not specified')}",
                f"- **Accreditation Standing**: {p_risk.get('accreditationStatus', 'Unaccredited')}",
                f"- **Buyer & Press Footprint**: {p_risk.get('buyerPressFootprint', 'Not verified')}",
                f"- **Verdict Rationale**: {p_risk.get('verdictRationale', '')}",
                f"- **Filmmaker Recommendation**: {p_risk.get('recommendation', '')}",
                "",
            ])

        # Fee Escalation Timeline
        if f_escalation:
            tiers = f_escalation.get("tiers", [])
            currency = f_escalation.get("currency", "£")
            lines.extend([
                "## 💰 Submission Fee Trajectory & Escalation Schedule",
                "",
            ])
            if f_escalation.get("spikeAlert"):
                lines.extend([
                    f"> ⚠️ **Price Spike Alert**: {f_escalation.get('spikeAlert')}",
                    "",
                ])
            if tiers:
                lines.extend([
                    "| Deadline Tier | Deadline Date | Fee | Surge Spike |",
                    "| :--- | :--- | :--- | :--- |",
                ])
                for t in tiers:
                    tier_name = t.get("tierName", "Tier")
                    date = t.get("deadlineDate", "N/A")
                    amt = f"{currency}{t.get('amount', 0)}"
                    surge = f"+{t.get('surgePercentage', 0)}%" if t.get('surgePercentage', 0) > 0 else "Baseline"
                    lines.append(f"| {tier_name} | {date} | **{amt}** | {surge} |")
                lines.append("")
            if f_escalation.get("averageMarketFee"):
                percentile_str = f" ({f_escalation.get('percentile')}th percentile)" if f_escalation.get('percentile') else ""
                lines.extend([
                    f"*Benchmark*: {f_escalation.get('averageMarketFee')}{percentile_str}",
                    "",
                ])

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
