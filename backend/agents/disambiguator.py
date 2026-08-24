"""Disambiguator Agent for identifying and confirming festival entities."""
import json
import logging
from typing import List, Optional
from google.genai import types

from backend.models import CandidateEntity, SourceRecord
from backend.services.gemini_client import GeminiClient
from backend.tools.parallel_search import ParallelSearchTool

logger = logging.getLogger("screened.agents.disambiguator")


class DisambiguatorAgent:
    """Discovers matching entities from user query to prevent false-identity mixing."""

    def __init__(self, parallel_tool: ParallelSearchTool, gemini: GeminiClient):
        self.parallel_tool = parallel_tool
        self.gemini = gemini

    async def disambiguate(
        self,
        query: str,
        optional_url: Optional[str] = None,
    ) -> List[CandidateEntity]:
        """Perform preliminary search and extract candidate entities."""
        logger.info(f"Disambiguating query: {query} (url={optional_url})")

        search_query = f"{query} film festival official" if "festival" not in query.lower() else query
        if optional_url:
            search_query += f" {optional_url}"

        sources = await self.parallel_tool.search(
            queries=[search_query, f"{query} location founded editions"],
            objective=f"Identify the official name, location, founding year, and official website for {query}",
            mode="fast",
            max_results_total=5,
        )

        if not sources:
            # Fallback single candidate if search yields no results
            return [
                CandidateEntity(
                    name=query.strip(),
                    officialDomain=optional_url,
                    descriptor="Directly entered entity (unverified web presence)",
                )
            ]

        # Use Gemini to extract distinct candidate entities
        prompt = f"""
Analyze the web search excerpts below and identify candidate distinct film festival entities matching the user's search query.

User Query: "{query}"
Optional URL: "{optional_url or ''}"

Web Sources:
{json.dumps([{"domain": s.domain, "title": s.title, "excerpts": s.excerpts} for s in sources], indent=2)}

Return a JSON list of 1 to 3 distinct candidate entities. If there is clearly only one festival, return a single item list.
JSON Schema:
[
  {{
    "name": "string (official canonical festival name)",
    "officialDomain": "string or null (e.g. raindance.org)",
    "cityCountry": "string or null (e.g. London, United Kingdom)",
    "foundedYear": number or null,
    "descriptor": "string (1-2 sentence description distinguishing this entity)"
  }}
]
"""
        try:
            response = self.gemini.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )
            raw_data = json.loads(response.text or "[]")
            candidates: List[CandidateEntity] = []
            source_ids = [s.id for s in sources]

            for item in raw_data:
                candidates.append(
                    CandidateEntity(
                        name=item.get("name", query).strip(),
                        officialDomain=item.get("officialDomain"),
                        cityCountry=item.get("cityCountry"),
                        foundedYear=item.get("foundedYear"),
                        descriptor=item.get("descriptor", ""),
                        sourceIds=source_ids,
                    )
                )

            if not candidates:
                candidates.append(CandidateEntity(name=query, descriptor="General Festival Entity"))

            return candidates

        except Exception as e:
            logger.exception(f"Disambiguation parsing failed: {e}")
            return [CandidateEntity(name=query, descriptor="Default candidate entity")]
