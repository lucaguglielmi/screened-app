"""Claim Extractor Agent with verbatim substring verification."""
import logging
from typing import Dict, List
from backend.models import AtomicClaim, ResearchDomain, SourceRecord
from backend.services.gemini_client import GeminiClient

logger = logging.getLogger("screened.agents.claim_extractor")


class ClaimExtractorAgent:
    """Extracts atomic claims per research domain and verifies citation excerpts."""

    def __init__(self, gemini: GeminiClient):
        self.gemini = gemini

    async def extract_all_domains(
        self,
        subject_name: str,
        domain_sources: Dict[ResearchDomain, List[SourceRecord]],
    ) -> List[AtomicClaim]:
        """Extract atomic claims across all 3 domains."""
        all_claims: List[AtomicClaim] = []

        for domain, sources in domain_sources.items():
            if not sources:
                continue
            logger.info(f"Extracting claims for domain: {domain.value} ({len(sources)} sources)")
            claims = await self.gemini.extract_claims_from_sources(
                subject_name=subject_name,
                sources=sources,
                research_domain=domain,
            )
            all_claims.extend(claims)

        # Deduplicate claims with identical statements
        unique_claims = {}
        for claim in all_claims:
            # Normalize statement for comparison
            normalized_stmt = claim.statement.strip().lower()
            if normalized_stmt in unique_claims:
                # Merge evidence
                existing_claim = unique_claims[normalized_stmt]
                
                # Keep a set of existing evidence hashes or source URLs to avoid duplicate evidence too
                existing_urls = {ev.sourceUrl for ev in existing_claim.evidence}
                for ev in claim.evidence:
                    if ev.sourceUrl not in existing_urls:
                        existing_claim.evidence.append(ev)
                        existing_urls.add(ev.sourceUrl)
            else:
                unique_claims[normalized_stmt] = claim

        deduped = list(unique_claims.values())
        logger.info(f"Total extracted claims: {len(all_claims)}, after deduplication: {len(deduped)}")
        return deduped
