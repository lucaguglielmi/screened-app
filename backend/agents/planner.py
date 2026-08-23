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
    domains: Dict[ResearchDomain, DomainPlan]


def create_planner_adk_agent(entity_name: str, location: str, official_website: str, intent: str) -> LlmAgent:
    instruction = f"""
You are the Lead Research Planner for Screened, a cinema due-diligence intelligence platform.
Create a structured 3-domain research plan for investigating the following film festival:

Entity Name: {entity_name}
Location: {location}
Official Website: {official_website}
Filmmaker Intent: {intent}

Generate specific Parallel Search queries and questions covering 360° forensic vetting:
1. FESTIVAL domain (physical cinema screening venues, municipal manifests, submission fee tiers, original rules vs boilerplate text, awards)
2. ORGANIZER domain (operating legal entity name, Companies House or registry filing status, domain WHOIS age, founders, festival director IMDb credentials)
3. PARTICIPANTS domain (filmmaker alumni confirmations, Letterboxd/Reddit threads, attendee reviews, fee dispute complaints, selection rates)

Return a JSON object matching the requested output schema where keys are FESTIVAL, ORGANIZER, PARTICIPANTS.
"""
    return LlmAgent(
        name="planner",
        description="Creates a targeted 3-domain research plan with specific Parallel Search queries.",
        model="gemini-2.5-pro",
        instruction=instruction,
        output_schema=InvestigationPlan,
        output_key="plan",
        generate_content_config=types.GenerateContentConfig(
            temperature=0.1,
        )
    )



class PlannerAgent:
    """Creates a targeted 3-domain research plan with specific Parallel Search queries."""

    def __init__(self, gemini: GeminiClient):
        self.gemini = gemini

    async def create_plan(self, entity: CandidateEntity, intent: str = "Vet before submitting") -> InvestigationPlan:
        logger.info(f"Creating investigation plan for: {entity.name}")

        prompt = f"""
You are the Lead Research Planner for Screened, a cinema due-diligence intelligence platform.
Create a structured 3-domain research plan for investigating the following film festival:

Entity Name: {entity.name}
Location: {entity.cityCountry or 'Unknown'}
Official Website: {entity.officialDomain or 'Unknown'}
Filmmaker Intent: {intent}

Generate specific Parallel Search queries and questions covering 360° forensic vetting:
1. FESTIVAL domain (physical cinema screening venues, municipal manifests, submission fee tiers, original rules vs boilerplate text, awards)
2. ORGANIZER domain (operating legal entity name, Companies House or registry filing status, domain WHOIS age, founders, festival director IMDb credentials)
3. PARTICIPANTS domain (filmmaker alumni confirmations, Letterboxd/Reddit threads, attendee reviews, fee dispute complaints, selection rates)

Return a JSON object matching this schema:
{{
  "domains": {{
    "FESTIVAL": {{
      "objective": "string",
      "searchQueries": ["string query 1", "string query 2", "string query 3"],
      "keyQuestions": ["question 1", "question 2"]
    }},
    "ORGANIZER": {{
      "objective": "string",
      "searchQueries": ["string query 1", "string query 2", "string query 3"],
      "keyQuestions": ["question 1", "question 2"]
    }},
    "PARTICIPANTS": {{
      "objective": "string",
      "searchQueries": ["string query 1", "string query 2", "string query 3"],
      "keyQuestions": ["question 1", "question 2"]
    }}
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

            domain_plans: Dict[ResearchDomain, DomainPlan] = {}

            # Parse FESTIVAL
            f_data = domains_data.get("FESTIVAL", {})
            domain_plans[ResearchDomain.FESTIVAL] = DomainPlan(
                domain=ResearchDomain.FESTIVAL,
                objective=f_data.get("objective", f"Investigate venues, fees, and rules for {entity.name}"),
                searchQueries=f_data.get("searchQueries", [
                    f"{entity.name} film festival screening venues physical",
                    f"{entity.name} submission fees deadlines rules awards",
                ]),
                keyQuestions=f_data.get("keyQuestions", ["What are the physical screening venues?", "What are the entry fees?"]),
            )

            # Parse ORGANIZER
            o_data = domains_data.get("ORGANIZER", {})
            domain_plans[ResearchDomain.ORGANIZER] = DomainPlan(
                domain=ResearchDomain.ORGANIZER,
                objective=o_data.get("objective", f"Investigate legal entity and organizers for {entity.name}"),
                searchQueries=o_data.get("searchQueries", [
                    f"{entity.name} company registration legal entity director",
                    f"{entity.name} founder team organization history",
                ]),
                keyQuestions=o_data.get("keyQuestions", ["What legal entity operates the festival?", "Who are the directors?"]),
            )

            # Parse PARTICIPANTS
            p_data = domains_data.get("PARTICIPANTS", {})
            domain_plans[ResearchDomain.PARTICIPANTS] = DomainPlan(
                domain=ResearchDomain.PARTICIPANTS,
                objective=p_data.get("objective", f"Investigate filmmaker feedback and attendee experience for {entity.name}"),
                searchQueries=p_data.get("searchQueries", [
                    f"{entity.name} filmmaker reviews experience reddit forum",
                    f"{entity.name} festival controversy complaints feedback",
                ]),
                keyQuestions=p_data.get("keyQuestions", ["What is the filmmaker community feedback?", "Are there fee disputes?"]),
            )

            return InvestigationPlan(
                festivalName=entity.name,
                domains=domain_plans,
            )

        except Exception as e:
            logger.error(f"Planner failed: {e}. Using deterministic default plan.", exc_info=True)
            return InvestigationPlan(
                festivalName=entity.name,
                domains={
                    ResearchDomain.FESTIVAL: DomainPlan(
                        domain=ResearchDomain.FESTIVAL,
                        objective=f"Investigate festival profile for {entity.name}",
                        searchQueries=[f"{entity.name} submission fees venues awards"],
                        keyQuestions=["What are the physical venues and fee schedules?"],
                    ),
                    ResearchDomain.ORGANIZER: DomainPlan(
                        domain=ResearchDomain.ORGANIZER,
                        objective=f"Investigate organizers for {entity.name}",
                        searchQueries=[f"{entity.name} legal entity director company"],
                        keyQuestions=["Who operates this festival?"],
                    ),
                    ResearchDomain.PARTICIPANTS: DomainPlan(
                        domain=ResearchDomain.PARTICIPANTS,
                        objective=f"Investigate participant feedback for {entity.name}",
                        searchQueries=[f"{entity.name} reviews feedback complaints"],
                        keyQuestions=["What do past participants say?"],
                    ),
                },
            )
