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

from backend.tools.source_tiers import determine_source_tier

def extract_registrable_domain(url: str) -> str:
    try:
        parsed = urlparse(url)
        netloc = parsed.netloc.lower()
        if netloc.startswith("www."):
            netloc = netloc[4:]
        return netloc
    except Exception:
        return ""

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
        self._semaphore = asyncio.Semaphore(5)

    async def _search_single_query(self, query: str, objective: str, mode: str, advanced_settings: dict, session_id: Optional[str]) -> List[SourceRecord]:
        logger.info(f"Parallel Search single query: {query}")
        try:
            async with self._semaphore:
                response = await self.async_client.search(
                    search_queries=[query],
                    objective=objective,
                    mode=mode,
                    advanced_settings=advanced_settings,
                    session_id=session_id
                )
            raw_results = getattr(response, "results", []) or []
            source_records: List[SourceRecord] = []

            for item in raw_results:
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
                        discoveredByQuery=query,
                    )
                )
            return source_records
        except Exception as e:
            logger.error(f"Parallel Search single query failed for '{query}': {e}", exc_info=True)
            return []

    async def search(
        self,
        queries: List[str],
        objective: str,
        mode: str = "basic",
        max_results_total: int = 10,
        source_policy: Optional[dict] = None,
        session_id: Optional[str] = None
    ) -> List[SourceRecord]:
        """Execute a search with Parallel Search and normalize results to SourceRecord list."""
        if not queries:
            return []

        logger.info(f"Executing Parallel Search for objective: {objective} with {len(queries)} queries")
        advanced_settings = {
            "max_results": 10,
            "excerpt_settings": {"max_chars_per_result": 1500}
        }
        if source_policy:
            advanced_settings["source_policy"] = source_policy

        tasks = [
            self._search_single_query(q, objective, mode, advanced_settings, session_id)
            for q in queries
        ]
        results_lists = await asyncio.gather(*tasks, return_exceptions=True)
        
        seen_urls = set()
        deduped_records = []
        
        for records in results_lists:
            if isinstance(records, Exception):
                continue
            for record in records:
                # Normalize URL for deduplication
                norm_url = record.url.lower().rstrip('/')
                if norm_url not in seen_urls:
                    seen_urls.add(norm_url)
                    deduped_records.append(record)

        # Optional: return max_results_total across all queries
        deduped_records = deduped_records[:max_results_total]
        logger.info(f"Parallel Search returned {len(deduped_records)} distinct source records")
        return deduped_records
