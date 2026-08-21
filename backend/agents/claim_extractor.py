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

        logger.info(f"Total extracted and verified claims across all domains: {len(all_claims)}")
        return all_claims
