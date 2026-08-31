"""Parallel Extract Tool Integration."""
import asyncio
import hashlib
import logging
from typing import List, Dict, Optional
from parallel import AsyncParallel
from backend.config import settings
from backend.models import SourceRecord, ClaimEvidence, VerificationStatus

logger = logging.getLogger("screened.tools.parallel_extract")

def normalize_whitespace(text: str) -> str:
    if not text:
        return ""
    return " ".join(text.split())

def compute_content_hash(text: str) -> str:
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()

class ParallelExtractTool:
    """Tool for verbatim provenance hardening via Parallel Extract API."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.parallel_api_key
        if not self.api_key:
            logger.warning("ParallelExtractTool initialized without PARALLEL_API_KEY")
        self.async_client = AsyncParallel(api_key=self.api_key)

    async def extract_and_verify(self, urls: List[str], evidence_list: List[ClaimEvidence]) -> Dict[str, dict]:
        """
        Extract full content for URLs, verify excerpts, and return provenance data.
        Returns a dict of url -> provenance_data (hash, length, publish_date).
        Updates evidence_list in-place if excerpts fail verification.
        """
        if not urls:
            return {}
            
        logger.info(f"Extracting full content for {len(urls)} URLs")
        try:
            provenance = {}
            for i in range(0, len(urls), 5):
                batch = urls[i:i+5]
                res = await self.async_client.extract(urls=batch)
                
                for extract_item in res.results:
                    url = extract_item.url
                    full_content = extract_item.full_content or ""
                    norm_full = normalize_whitespace(full_content)
                    
                    for ev in evidence_list:
                        if ev.sourceUrl == url:
                            norm_excerpt = normalize_whitespace(ev.exactExcerpt)
                            if norm_excerpt and norm_excerpt not in norm_full:
                                ev.verificationStatus = VerificationStatus.UNVERIFIED_EXCERPT
                            else:
                                ev.verificationStatus = VerificationStatus.VERIFIED_MATCH
                                
                    if full_content:
                        provenance[url] = {
                            "hash": compute_content_hash(full_content),
                            "length": len(full_content),
                            "publish_date": extract_item.publish_date
                        }
            return provenance
        except Exception as e:
            logger.exception(f"Extract failed: {e}")
            return {}
