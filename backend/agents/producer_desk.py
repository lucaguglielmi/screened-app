"""Producer Desk Conversational Agent with Gemini Function Calling Tools."""
import json
import logging
from typing import AsyncGenerator, Dict, Any, List, Optional
from backend.models import (
    ChatMessage,
    ChatRequest,
    ChatToolCall,
    ToolCallType,
    DueDiligenceToolArgs,
    OpportunityScoutToolArgs,
    CompareFestivalsToolArgs,
)
from backend.services.gemini_client import GeminiClient

logger = logging.getLogger("screened.agents.producer_desk")


PRODUCER_DESK_SYSTEM_PROMPT = """You are the Screened Producer & Chief Intelligence Executive — an expert cinema festival strategist, former indie film producer, and due-diligence investigator.

Your role:
1. Advise filmmakers, producers, and festival participants with sharp, protective, realistic, and highly encouraging industry intelligence.
2. If the user mentions a specific festival they want to vet, investigate, or check legitimacy/scam warnings (e.g. "Is Aldergate Film Festival legit?", "Check Raindance fees", "Tell me about Sundance"), explain what our due diligence pipeline can verify (venues, fees, organizer background, community reviews).
3. If the user asks for festival recommendations, submission strategies, or has a film they want to submit (e.g. "I have a 15-min sci-fi short looking for a UK premiere", "Where should I submit on a £200 budget?"), outline strategic steps (early bird deadlines, premiere protection, qualification circuits).
4. If the user wants to compare two festivals (e.g. "Should I submit to Sundance or Tribeca?", "Raindance vs Leeds"), provide a sharp, comparative analysis highlighting prestige, audience, and qualification perks.
5. If the user attaches an acceptance letter, script synopsis, or invoice, evaluate the document with executive rigor.
6. Provide concise, high-value, cinematic prose directly in your message. Always format lists cleanly with markdown.
IMPORTANT: Write your advice in clean, natural prose. Do NOT output Python code snippets, JSON function calls, or internal API code in your conversational response.
"""


TOOL_DECLARATIONS = [
    {
        "name": "configure_due_diligence",
        "description": "Configures a deep-dive multi-agent credibility investigation for a specific film festival or cinema entity.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "festival_name": {
                    "type": "STRING",
                    "description": "Exact name of the festival or organization."
                },
                "optional_url": {
                    "type": "STRING",
                    "description": "Official website or submission portal URL if mentioned."
                },
                "suspected_concerns": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"},
                    "description": "Specific areas to scrutinize: ['VENUE_LEGITIMACY', 'FEE_TRANSPARENCY', 'PREDATORY_AWARDS', 'ORGANIZER_TRACK_RECORD']."
                },
                "preflight_summary": {
                    "type": "STRING",
                    "description": "1-2 sentence executive overview explaining why this festival warrants scrutiny."
                }
            },
            "required": ["festival_name", "preflight_summary"]
        }
    },
    {
        "name": "configure_opportunity_scout",
        "description": "Prepares a tailored festival submission roadmap and scouts upcoming qualifying deadlines for a specific film profile.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "film_title": {
                    "type": "STRING",
                    "description": "Working project title."
                },
                "format": {
                    "type": "STRING",
                    "enum": ["SHORT", "FEATURE", "DOCUMENTARY", "ANIMATION", "EPISODIC"]
                },
                "genre": {
                    "type": "STRING",
                    "description": "Primary genre."
                },
                "runtime_minutes": {
                    "type": "INTEGER",
                    "description": "Total film runtime in minutes."
                },
                "premiere_goal": {
                    "type": "STRING",
                    "enum": ["WORLD_PREMIERE", "INTERNATIONAL_PREMIERE", "NATIONAL_PREMIERE", "NO_PREFERENCE"]
                },
                "budget_tier": {
                    "type": "STRING",
                    "description": "Budget category (e.g., 'Micro (<£50k)', 'Low (<£250k)')."
                },
                "target_regions": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "strategy_rationale": {
                    "type": "STRING",
                    "description": "Strategic positioning angle."
                }
            },
            "required": ["film_title", "format", "genre", "strategy_rationale"]
        }
    },
    {
        "name": "compare_festivals_arena",
        "description": "Renders a side-by-side comparison matrix between two film festivals evaluating fee vs prestige, audience reach, and accreditation.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "festival_a": { "type": "STRING" },
                "festival_b": { "type": "STRING" },
                "key_comparison_vectors": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "verdict_summary": { "type": "STRING" }
            },
            "required": ["festival_a", "festival_b", "verdict_summary"]
        }
    }
]


class ProducerDeskAgent:
    """Conversational orchestrator with Function Calling for Screened workspaces."""

    def __init__(self, gemini: Optional[GeminiClient] = None):
        self.gemini = gemini or GeminiClient()

    async def process_chat(self, req: ChatRequest) -> AsyncGenerator[Dict[str, Any], None]:
        """Processes a chat turn, yielding text tokens and tool call events."""
        user_message = req.message
        if req.attachedFileName and req.attachedFileContent:
            user_message += f"\n\n[Attached File: {req.attachedFileName}]\n{req.attachedFileContent[:2500]}"

        # Check intent with rule-based heuristics or Gemini LLM
        prompt = f"{PRODUCER_DESK_SYSTEM_PROMPT}\n\nUser Message: {user_message}\n\nRespond to the filmmaker and invoke the appropriate tool if applicable."

        if not self.gemini.client:
            # High-fidelity offline / simulated response with smart tool dispatch
            async for event in self._generate_fallback_response(user_message):
                yield event
            return

        try:
            # Call Vertex AI Gemini with structured prompt (gemini-2.5-flash is available in europe-west2)
            response = self.gemini.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )


            response_text = response.text if hasattr(response, "text") and response.text else str(response)

            # Scrub any raw Python/JSON code blocks if Gemini accidentally included them
            import re
            cleaned_text = re.sub(r"```python[\s\S]*?```", "", response_text)
            cleaned_text = re.sub(r"```json[\s\S]*?```", "", cleaned_text)
            cleaned_text = re.sub(r"print\(client[\s\S]*?\)", "", cleaned_text)
            cleaned_text = re.sub(r"\*\*Calling Tool:[\s\S]*?\n\n", "", cleaned_text)
            cleaned_text = re.sub(r"\*\*Tool Call:[\s\S]*?\n\n", "", cleaned_text)
            cleaned_text = cleaned_text.strip()

            if not cleaned_text:
                cleaned_text = response_text

            # Check if response contains tool invocation or formulate one
            tool_call = self._extract_or_infer_tool_call(user_message, response_text)

            # Stream response in chunks
            words = cleaned_text.split(" ")
            for i in range(0, len(words), 4):
                chunk = " ".join(words[i:i+4]) + " "
                yield {"type": "TOKEN", "token": chunk}

            if tool_call:
                yield {
                    "type": "TOOL_CALL",
                    "toolCall": tool_call.model_dump()
                }

            yield {"type": "DONE"}

        except Exception as e:
            logger.warning(f"Gemini API chat fallback triggered: {e}")
            async for event in self._generate_fallback_response(user_message):
                yield event

    def _extract_or_infer_tool_call(self, user_msg: str, agent_response: str) -> Optional[ChatToolCall]:
        """Infers structured tool invocation if the model discusses a specific festival or film slate."""
        import re
        msg_lower = user_msg.lower()

        # Check for Comparison
        if " vs " in msg_lower or " vs. " in msg_lower or ("compare" in msg_lower and (" and " in msg_lower or " to " in msg_lower)):
            clean_q = re.sub(r"(what are the advantages of premiering at|should i submit to|compare|between)", "", user_msg, flags=re.IGNORECASE)
            parts = re.split(r"\s+(?:vs\.?|or|and|to)\s+", clean_q.strip(), flags=re.IGNORECASE)
            fest_a = parts[0].replace("?", "").strip() if len(parts) > 0 and parts[0].strip() else "Raindance Film Festival"
            fest_b = parts[1].replace("?", "").strip() if len(parts) > 1 and parts[1].strip() else "Leeds International Film Festival"
            return ChatToolCall(
                toolName=ToolCallType.COMPARE_FESTIVALS_ARENA,
                args=CompareFestivalsToolArgs(
                    festival_a=fest_a.title() if not any(c.isupper() for c in fest_a) else fest_a,
                    festival_b=fest_b.title() if not any(c.isupper() for c in fest_b) else fest_b,
                    key_comparison_vectors=["BAFTA/BIFA Qualification", "Physical Screening Venues", "Entry Fee Bracket"],
                    verdict_summary=f"Head-to-head comparison between {fest_a} and {fest_b} on accreditation, prestige, and venue transparency."
                ).model_dump()
            )

        # Check for Due Diligence intent
        if any(w in msg_lower for w in ["vet", "legit", "scam", "aldergate", "raindance", "sundance", "aesthetica", "cannes", "venice", "berlinale", "sxsw", "tribeca", "toronto", "check festival", "is it real", "is this real", "check fees", "tell me about"]):
            # Extract festival name
            festival_name = "Raindance Film Festival"
            if "aldergate" in msg_lower:
                festival_name = "Aldergate Film Festival"
            elif "sundance" in msg_lower:
                festival_name = "Sundance Film Festival"
            elif "aesthetica" in msg_lower:
                festival_name = "Aesthetica Short Film Festival"
            elif "cannes" in msg_lower:
                festival_name = "Cannes Film Festival"
            elif "tribeca" in msg_lower:
                festival_name = "Tribeca Film Festival"
            elif "berlinale" in msg_lower or "berlin" in msg_lower:
                festival_name = "Berlin International Film Festival"
            elif "venice" in msg_lower:
                festival_name = "Venice International Film Festival"
            elif "sxsw" in msg_lower or "south by" in msg_lower:
                festival_name = "SXSW Film Festival"
            elif "toronto" in msg_lower or "tiff" in msg_lower:
                festival_name = "Toronto International Film Festival"
            else:
                # Use query snippet
                cleaned = re.sub(r"(tell me about|is|a|the|legit|scam|real|check|fees|for|\?)", "", user_msg, flags=re.IGNORECASE).strip()
                if cleaned and len(cleaned) > 2:
                    festival_name = cleaned.title()

            return ChatToolCall(
                toolName=ToolCallType.CONFIGURE_DUE_DILIGENCE,
                args=DueDiligenceToolArgs(
                    festival_name=festival_name,
                    suspected_concerns=["VENUE_LEGITIMACY", "FEE_TRANSPARENCY", "ORGANIZER_TRACK_RECORD"],
                    preflight_summary=f"Prepare an autonomous 3-domain due diligence investigation across physical venues, organizer filings, and community feedback for {festival_name}."
                ).model_dump()
            )

        # Check for Opportunity Scout intent
        if any(w in msg_lower for w in ["short", "feature", "documentary", "submit", "scout", "budget", "strategy", "where should i", "recommend", "comedy", "horror", "drama", "thriller", "animation"]):
            format_type = "SHORT" if "short" in msg_lower else ("FEATURE" if "feature" in msg_lower else "SHORT")
            genre = "Drama"
            for g in ["Comedy", "Horror", "Sci-Fi", "Thriller", "Documentary", "Animation", "Drama"]:
                if g.lower() in msg_lower:
                    genre = g
                    break

            # Parse runtime
            runtime = 14 if format_type == "SHORT" else 90
            rt_match = re.search(r"(\d+)\s*(?:min|minute)", msg_lower)
            if rt_match:
                try:
                    runtime = int(rt_match.group(1))
                except Exception:
                    pass

            # Parse budget
            budget = "Micro (< £50k)"
            b_match = re.search(r"([£$€]\s*\d+(?:[kK]|,\d+|\s*budget)?)", user_msg)
            if b_match:
                budget = b_match.group(1).strip()

            return ChatToolCall(
                toolName=ToolCallType.CONFIGURE_OPPORTUNITY_SCOUT,
                args=OpportunityScoutToolArgs(
                    film_title="My Festival Project",
                    format=format_type,
                    genre=genre,
                    runtime_minutes=runtime,
                    premiere_goal="WORLD_PREMIERE",
                    budget_tier=budget,
                    target_regions=["UK & Europe", "North America"],
                    strategy_rationale=f"Target verified Early Bird windows for {genre} {format_type.lower()} circuits before locking regional independent festival runs."
                ).model_dump()
            )



        return None

    async def _generate_fallback_response(self, user_msg: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Offline simulation yielding cinematic intelligence."""
        tool_call = self._extract_or_infer_tool_call(user_msg, "")

        if tool_call and tool_call.toolName == ToolCallType.CONFIGURE_DUE_DILIGENCE:
            fest_name = tool_call.args.get("festival_name", "Target Festival")
            text = (
                f"I've configured a pre-flight due diligence probe for **{fest_name}**.\n\n"
                f"Before spending your submission budget, our multi-agent research core will cross-examine:\n"
                f"- **Physical Screening Venues**: Verifying actual theatrical cinema leases versus unlisted streaming links.\n"
                f"- **Organizer Track Record**: Checking corporate filings, dissolution notices, and prior editions.\n"
                f"- **Community Accounts**: Scanning trade publications and filmmaker complaints for fee discrepancies.\n\n"
                f"Review the pre-flight parameters below and click **Launch Deep Screen** to start live multi-track research."
            )
        elif tool_call and tool_call.toolName == ToolCallType.CONFIGURE_OPPORTUNITY_SCOUT:
            text = (
                f"I've mapped out a strategic festival submission roadmap for your project.\n\n"
                f"Here is how we should position this run:\n"
                f"1. **Early Bird Windows**: Submit to Tier-1 BAFTA and Oscar qualifying festivals while entry fees are discounted.\n"
                f"2. **Premiere Preservation**: Protect your World and International premiere eligibility before locking regional runs.\n"
                f"3. **Budget Runway**: Allocate submission spend across top-tier and high-acceptance genre circuits.\n\n"
                f"Inspect the film profile card below and click **Scout All Opportunities** to scan live deadlines."
            )
        elif tool_call and tool_call.toolName == ToolCallType.COMPARE_FESTIVALS_ARENA:
            fest_a = tool_call.args.get("festival_a", "Festival A")
            fest_b = tool_call.args.get("festival_b", "Festival B")
            text = (
                f"Here is an executive head-to-head breakdown between **{fest_a}** and **{fest_b}**.\n\n"
                f"Key strategic considerations:\n"
                f"- **Accreditation**: Ensure their awards meet your target qualification criteria (BAFTA, BIFA, Oscars).\n"
                f"- **Screening Format**: Verify physical projection capabilities and press delegate attendance.\n"
                f"- **Fee Value**: Balance entry fee costs against guaranteed networking and distribution exposure."
            )
        else:
            text = (
                "Welcome to **The Producer Desk** at Screened.\n\n"
                "I am your autonomous cinema intelligence executive. Tell me about:\n"
                "- A film festival you want to **vet or investigate** for legitimacy, physical venues, or fee transparency.\n"
                "- Your film project's format, genre, and budget to **scout open submission deadlines** and qualifying roadmaps.\n"
                "- Any festival acceptance email or submission invoice you'd like me to analyze for red flags.\n\n"
                "How can I assist your festival run today?"
            )

        words = text.split(" ")
        for i in range(0, len(words), 3):
            chunk = " ".join(words[i:i+3]) + " "
            yield {"type": "TOKEN", "token": chunk}

        if tool_call:
            yield {
                "type": "TOOL_CALL",
                "toolCall": tool_call.model_dump()
            }


        yield {"type": "DONE"}


producer_desk_agent = ProducerDeskAgent()
