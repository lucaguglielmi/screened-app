"""Opportunity Scout Agent for discovering verified festival calls and evaluating submission strategy."""
import json
import logging
import time
from typing import List
from google.genai import types

from backend.models import (
    FestivalOpportunity,
    FilmProfile,
    ScoutResponse,
)
from backend.services.gemini_client import GeminiClient
from backend.tools.parallel_search import ParallelSearchTool

logger = logging.getLogger("screened.agents.opportunity_scout")


class OpportunityScoutAgent:
    """Discovers matching festival submission opportunities via FindAll API and evaluates strategic fit."""

    def __init__(self, parallel_tool: ParallelSearchTool, gemini: GeminiClient):
        self.parallel_tool = parallel_tool
        self.gemini = gemini

    async def scout_opportunities(self, profile: FilmProfile) -> ScoutResponse:
        start_time = time.time()
        logger.info(f"Scouting opportunities for film: {profile.title} ({profile.format.value}, {profile.genre})")

        from google.adk.agents import LlmAgent
        from google.adk.tools import FunctionTool
        from backend.tools.findall_tools import findall_search, findall_enrich
        from google.genai import types

        search_tool = FunctionTool(findall_search)
        enrich_tool = FunctionTool(findall_enrich)

        instruction = f"""
You are the Lead Submission Strategist for Screened, an agentic cinema due-diligence platform.
Your goal is to identify high-fit film festival submission opportunities for this independent film.

Film Profile:
- Title: "{profile.title}"
- Format: {profile.format.value} ({profile.runtimeMinutes} minutes)
- Genre: {profile.genre}
- Premiere Strategy: {profile.premiereGoal.value}
- Target Regions: {', '.join(profile.targetRegions) if profile.targetRegions else 'international'}
- Budget Tier: {profile.budgetTier}

You MUST use the `findall_search` tool to discover festivals, and `findall_enrich` to get deadlines, fees, and accreditations.
You MUST NOT invent entities, dates, or fees. Only rely on the data returned by the tools.
Generate a cohesive submission strategy roadmap and a list of structured opportunities.
        """

        scout_agent = LlmAgent(
            name="scout",
            model="gemini-2.5-flash",
            instruction=instruction,
            tools=[search_tool, enrich_tool],
            output_schema=ScoutResponse,
            output_key="scout_response"
        )

        try:
            # We use an ad-hoc runner for this agent
            from google.adk.runners import Runner
            from google.adk.sessions.in_memory_session_service import InMemorySessionService
            import uuid

            sid = str(uuid.uuid4())
            session_service = InMemorySessionService()
            runner = Runner(agent=scout_agent, app_name="screened", session_service=session_service)
            scout_result = None
            new_msg = types.Content(role="user", parts=[types.Part.from_text(text="Please find film festival opportunities for my film.")])
            async for event in runner.run_async(user_id="sys", session_id=sid, new_message=new_msg):
                pass
            
            session = await session_service.get_session(app_name="screened", user_id="sys", session_id=sid)
            if session and session.state and "scout_response" in session.state:
                scout_result = session.state["scout_response"]
            
            if scout_result:
                scout_result.durationSeconds = round(time.time() - start_time, 2)
                scout_result.opportunitiesFound = len(scout_result.opportunities)
                return scout_result
            else:
                raise RuntimeError("scout_response not found in state")

        except Exception as e:
            from backend.config import settings
            if settings.strict_mode:
                raise
            logger.exception(f"ADK FindAll Scout failed: {e}. Falling back to Search+Gemini path.")
            return await self._fallback_scout(profile, start_time)

    async def _fallback_scout(self, profile: FilmProfile, start_time: float) -> ScoutResponse:
        """Original Search+Gemini fallback path."""
        # Formulate search queries
        regions_str = " ".join(profile.targetRegions) if profile.targetRegions else "international"
        search_queries = [
            f"{profile.genre} {profile.format.value} film festival call for entries submission deadline 2026 {regions_str}",
            f"BAFTA BIFA Academy qualifying {profile.format.value} film festivals deadlines 2026",
            f"independent {profile.format.value} film festival submission fees deadlines {regions_str}",
        ]

        objective = (
            f"Discover reputable film festivals accepting {profile.format.value} films in the {profile.genre} genre "
            f"in {regions_str} with upcoming 2026 submission deadlines, entry fee tiers, and qualifying accreditations."
        )

        sources = await self.parallel_tool.search(
            queries=search_queries,
            objective=objective,
            mode="basic",
            max_results_total=8,
        )

        sources_payload = [
            {"domain": s.domain, "title": s.title, "excerpts": s.excerpts}
            for s in sources
        ]

        prompt = f"""
You are the Lead Submission Strategist for Screened.
Analyze the provided web search excerpts to identify high-fit film festival submission opportunities for this independent film:

Film Profile:
- Title: "{profile.title}"
- Format: {profile.format.value} ({profile.runtimeMinutes} minutes)
- Genre: {profile.genre}
- Premiere Strategy: {profile.premiereGoal.value}
- Target Regions: {', '.join(profile.targetRegions) if profile.targetRegions else 'international'}
- Budget Tier: {profile.budgetTier}

Discovered Web Footprint:
{json.dumps(sources_payload, indent=2)}

REQUIREMENTS:
1. Extract 3 to 6 distinct, reputable film festivals matching the film's profile from the sources or verified industry knowledge.
2. For each festival, provide:
   - Canonical name & location
   - Next deadline date (e.g. "October 15, 2026")
   - Deadline tier
   - Estimated entry fee tier
   - Accreditation tags (array among: "BAFTA_QUALIFYING", "BIFA_QUALIFYING", "ACADEMY_QUALIFYING", "FIAPF_ACCREDITED", "INDIE_CIRCUIT", "GENRE_SPECIALIST")
   - Clear strategic fit rationale
   - Specific eligibility notes

Return a JSON object conforming to:
{{
  "strategySummary": "string (2-3 paragraphs providing an overarching submission strategy roadmap for this film)",
  "opportunities": [
    {{
      "name": "string",
      "cityCountry": "string (e.g. London, United Kingdom)",
      "officialDomain": "string or null",
      "nextDeadline": "string",
      "deadlineTier": "string",
      "feeEstimate": "string",
      "accreditationTags": ["BAFTA_QUALIFYING", "BIFA_QUALIFYING"],
      "strategicFitRationale": "string (1-2 sentences)",
      "eligibilityNotes": "string (1 sentence)",
      "submissionUrl": "string or null"
    }}
  ]
}}
"""
        try:
            response = self.gemini.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                ),
            )

            raw = json.loads(response.text or "{}")

            strategy_summary = raw.get(
                "strategySummary",
                f"Curated submission roadmap for '{profile.title}' focusing on {profile.genre} {profile.format.value.lower()}s."
            )
            # Add advisory flag
            strategy_summary = "⚠️ ADVISORY — VERIFY DEADLINES: FindAll API is unavailable. Results are inferred from web search and may contain outdated deadlines.\n\n" + strategy_summary

            raw_opps = raw.get("opportunities", [])
            opportunities: List[FestivalOpportunity] = []

            for item in raw_opps:
                opportunities.append(
                    FestivalOpportunity(
                        name=item.get("name", "Film Festival").strip(),
                        cityCountry=item.get("cityCountry", "International"),
                        officialDomain=item.get("officialDomain"),
                        nextDeadline=item.get("nextDeadline", "Upcoming 2026 Deadline"),
                        deadlineTier=item.get("deadlineTier", "Regular Deadline"),
                        feeEstimate=item.get("feeEstimate", "£35 - £55"),
                        accreditationTags=item.get("accreditationTags", ["INDIE_CIRCUIT"]),
                        strategicFitRationale=item.get("strategicFitRationale", "Strong genre and format alignment."),
                        eligibilityNotes=item.get("eligibilityNotes", "Check runtime and premiere terms before submitting."),
                        submissionUrl=item.get("submissionUrl"),
                    )
                )

            duration = round(time.time() - start_time, 2)
            logger.info(f"Fallback Opportunity Scout completed in {duration}s. Found {len(opportunities)} opportunities.")

            return ScoutResponse(
                filmTitle=profile.title,
                opportunitiesFound=len(opportunities),
                opportunities=opportunities,
                strategySummary=strategy_summary,
                durationSeconds=duration,
            )
        except Exception as fallback_e:
            logger.exception(f"Fallback Opportunity scout failed: {fallback_e}")
            duration = round(time.time() - start_time, 2)
            return ScoutResponse(
                filmTitle=profile.title,
                opportunitiesFound=0,
                opportunities=[],
                strategySummary=f"Search completed for '{profile.title}'. Please verify specific festival deadlines directly.",
                durationSeconds=duration,
            )
