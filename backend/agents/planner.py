"""Planner Agent for generating structured multi-domain investigation strategies."""
import json
import logging
from typing import Dict, List
from pydantic import BaseModel, Field
from google.genai import types
from google.adk.agents import LlmAgent

from backend.models import CandidateEntity, ResearchDomain
from backend.services.gemini_client import GeminiClient

logger = logging.getLogger("screened.agents.planner")


class DomainPlan(BaseModel):
    domain: ResearchDomain
    objective: str
    searchQueries: List[str] = Field(default_factory=list)
    keyQuestions: List[str] = Field(default_factory=list)


class InvestigationPlan(BaseModel):
    festivalName: str
    domains: Dict[str, DomainPlan]


from backend.agents.adk_helpers import get_adk_model

def create_planner_adk_agent(entity_name: str, location: str, official_website: str, intent: str) -> LlmAgent:
    instruction = f"""
You are the Lead Planning Agent for Screened.
Your goal is to parse the user's intent regarding a specific film festival, and formulate a targeted research plan across 7 specialized swarm domains:
1. FESTIVAL (OfficialSiteCrawler): Analyzing the official domain for boilerplate text, stolen assets, and structural integrity.
2. ORGANIZER (CorporateRegistry): Corporate footprint, key personnel, LinkedIn traces, Companies House, IMDb footprints.
3. PARTICIPANTS (CommunitySentiment): Filmmaker alumni, sentiments, allegations, Reddit, Letterboxd.
4. FEES (PlatformScout): FilmFreeway, Festhome, deadlines, pricing escalation, submission policies.
5. VENUES (VenueForensics): Physical cinemas, theaters, Google Maps verification, municipal records.
6. CLAIMS (HeritageAudit): Past editions, winners, historical tracing, Wikipedia citations, news archives.
7. FIT (InstitutionalArchive): BFI, FIAPF, Creative Europe grants, local film commissions, tax credits.

Entity: {entity_name}
Location: {location}
Website: {official_website}
User Intent: {intent}

Return a detailed JSON adhering strictly to the `InvestigationPlan` schema. Ensure each domain has a specific objective and 3-5 search queries tailored to find deep forensic evidence for that vertical.
    """

    return LlmAgent(
        name="planner",
        model=get_adk_model("gemini-2.5-flash"),
        instruction=instruction,
        output_schema=InvestigationPlan,
        output_key="plan",
        generate_content_config=types.GenerateContentConfig(
            temperature=0.1,
        )
    )



class PlannerAgent:
    """Creates a targeted 7-domain research plan with specific Parallel Search queries."""

    def __init__(self, gemini: GeminiClient):
        self.gemini = gemini

    async def create_plan(self, entity: CandidateEntity, intent: str = "Vet before submitting") -> InvestigationPlan:
        logger.info(f"Creating 7-agent investigation plan for: {entity.name}")

        prompt = f"""
You are the Lead Research Planner for Screened, a cinema due-diligence intelligence platform.
Create a structured 7-domain research plan for investigating the following film festival:

Entity Name: {entity.name}
Location: {entity.cityCountry or 'Unknown'}
Official Website: {entity.officialDomain or 'Unknown'}
Filmmaker Intent: {intent}

Generate specific Parallel Search queries covering 360° forensic vetting across 7 specialist agents:
1. FESTIVAL: (Official site analysis, original rules vs boilerplate text, copyright claims)
2. ORGANIZER: (Operating legal entity name, Companies House or registry filing status, founders, directors, LinkedIn, IMDb credentials)
3. PARTICIPANTS: (Filmmaker alumni confirmations, Letterboxd/Reddit threads, attendee reviews, complaints)
4. FEES: (FilmFreeway, Festhome entries, fee tier escalation, late deadline surges)
5. VENUES: (Physical cinema screening venues, theater bookings, venue proof of existence)
6. CLAIMS: (Past editions, winners, history, site:wikipedia.org or news archives)
7. FIT: (Institutional backing, BFI/FIAPF status, local film commission funding, grants)

Generate localized queries (e.g. Italian terms if in Italy). Use site:imdb.com and site:wikipedia.org where applicable.

Return a JSON object matching this schema exactly:
{{
  "domains": {{
    "FESTIVAL": {{ "objective": "string", "searchQueries": ["query 1", "query 2"], "keyQuestions": ["q1"] }},
    "ORGANIZER": {{ "objective": "string", "searchQueries": ["query 1", "query 2"], "keyQuestions": ["q1"] }},
    "PARTICIPANTS": {{ "objective": "string", "searchQueries": ["query 1", "query 2"], "keyQuestions": ["q1"] }},
    "FEES": {{ "objective": "string", "searchQueries": ["query 1", "query 2"], "keyQuestions": ["q1"] }},
    "VENUES": {{ "objective": "string", "searchQueries": ["query 1", "query 2"], "keyQuestions": ["q1"] }},
    "CLAIMS": {{ "objective": "string", "searchQueries": ["query 1", "query 2"], "keyQuestions": ["q1"] }},
    "FIT": {{ "objective": "string", "searchQueries": ["query 1", "query 2"], "keyQuestions": ["q1"] }}
  }}
}}
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
            raw = json.loads(response.text or "{}")
            domains_data = raw.get("domains", {})

            domain_plans: Dict[str, DomainPlan] = {}
            for domain_key in ["FESTIVAL", "ORGANIZER", "PARTICIPANTS", "FEES", "VENUES", "CLAIMS", "FIT"]:
                data = domains_data.get(domain_key, {})
                domain_plans[domain_key] = DomainPlan(
                    domain=ResearchDomain(domain_key),
                    objective=data.get("objective", f"Investigate {domain_key.lower()} for {entity.name}"),
                    searchQueries=data.get("searchQueries", [f"{entity.name} {domain_key.lower()}"]),
                    keyQuestions=data.get("keyQuestions", ["What is verified here?"]),
                )

            return InvestigationPlan(
                festivalName=entity.name,
                domains=domain_plans,
            )

        except Exception as e:
            logger.exception(f"Planner failed: {e}. Using deterministic default plan.")
            return InvestigationPlan(
                festivalName=entity.name,
                domains={
                    d: DomainPlan(
                        domain=ResearchDomain(d),
                        objective=f"Investigate {d.lower()} for {entity.name}",
                        searchQueries=[f"{entity.name} {d.lower()} verified"],
                        keyQuestions=["What is verified here?"],
                    ) for d in ["FESTIVAL", "ORGANIZER", "PARTICIPANTS", "FEES", "VENUES", "CLAIMS", "FIT"]
                }
            )
