"""Parallel Search Tool Integration using the official parallel-web SDK."""
import hashlib
import logging
from typing import List, Optional
from urllib.parse import urlparse

import asyncio
from parallel import Parallel, AsyncParallel
from backend.config import settings
from backend.models import SourceRecord

logger = logging.getLogger("screened.tools.parallel_search")

# Tier 1: Official government / company registries, major trade publications
TIER_1_DOMAINS = {
    "companieshouse.gov.uk", "gov.uk", "bfi.org.uk", "variety.com",
    "hollywoodreporter.com", "screendaily.com", "deadline.com", "imdb.com"
}

# Tier 3: Anonymous forums, social platforms, blog comments
TIER_3_DOMAINS = {
    "reddit.com", "quora.com", "medium.com", "facebook.com",
    "twitter.com", "x.com", "tiktok.com"
}


def extract_registrable_domain(url: str) -> str:
    try:
        parsed = urlparse(url)
        netloc = parsed.netloc.lower()
        if netloc.startswith("www."):
            netloc = netloc[4:]
        return netloc
    except Exception:
        return ""


def determine_source_tier(domain: str) -> int:
    domain_lower = domain.lower()
    for t1 in TIER_1_DOMAINS:
        if domain_lower == t1 or domain_lower.endswith("." + t1):
            return 1
    for t3 in TIER_3_DOMAINS:
        if domain_lower == t3 or domain_lower.endswith("." + t3):
            return 3
    return 2


def compute_content_hash(text: str) -> str:
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()


class ParallelSearchTool:
    """Wrapper around Parallel Search API."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.parallel_api_key
        if not self.api_key:
            logger.warning("ParallelSearchTool initialized without PARALLEL_API_KEY")
        self.client = Parallel(api_key=self.api_key)
        self.async_client = AsyncParallel(api_key=self.api_key)
        self._semaphore = asyncio.Semaphore(3)

    async def search(
        self,
        queries: List[str],
        objective: str,
        mode: str = "basic",
        max_results: int = 8,
    ) -> List[SourceRecord]:
        """Execute a search with Parallel Search and normalize results to SourceRecord list."""
        if not queries:
            return []

        logger.info(f"Executing Parallel Search for objective: {objective} with queries: {queries}")
        try:
            async with self._semaphore:
                response = await self.async_client.search(
                    search_queries=queries,
                    objective=objective,
                    mode=mode,  # turbo, fast, basic, advanced
                )
            raw_results = getattr(response, "results", []) or []
            source_records: List[SourceRecord] = []

            for item in raw_results[:max_results]:
                url = getattr(item, "url", "")
                if not url:
                    continue

                domain = extract_registrable_domain(url)
                title = getattr(item, "title", "") or domain
                publish_date = getattr(item, "publish_date", None)
                
                # Excerpts handling
                raw_excerpts = getattr(item, "excerpts", []) or []
                excerpts: List[str] = []
                for ex in raw_excerpts:
                    if isinstance(ex, str) and ex.strip():
                        excerpts.append(ex.strip())
                    elif hasattr(ex, "text") and getattr(ex, "text", ""):
                        excerpts.append(getattr(ex, "text", "").strip())
                    elif isinstance(ex, dict) and "text" in ex:
                        excerpts.append(str(ex["text"]).strip())

                # If no excerpts, check snippet or summary
                if not excerpts:
                    snippet = getattr(item, "snippet", "") or getattr(item, "summary", "")
                    if snippet:
                        excerpts.append(snippet.strip())

                if not excerpts:
                    continue

                full_text = " ".join(excerpts)
                content_hash = compute_content_hash(full_text)
                tier = determine_source_tier(domain)

                source_records.append(
                    SourceRecord(
                        url=url,
                        domain=domain,
                        title=title,
                        publishedDate=publish_date,
                        excerpts=excerpts,
                        sourceTier=tier,
                        contentHash=content_hash,
                    )
                )

            logger.info(f"Parallel Search returned {len(source_records)} valid source records")
            return source_records

        except Exception as e:
            logger.error(f"Parallel Search failed: {e}", exc_info=True)
            raise
