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
    GrantScoutToolArgs,
    InvitationEmailToolArgs,
    DocumentAnalysisRequest,
    DocumentAnalysisResult,
    DocumentAnalysisKind,
    FilmFormat,
    PremiereGoal,
    FollowUpOption,
    InteractiveFollowUpProbe,
)
from backend.services.gemini_client import GeminiClient

logger = logging.getLogger("screened.agents.producer_desk")


PRODUCER_DESK_SYSTEM_PROMPT = """You are Screened — an autonomous cinema due diligence and intelligence engine.

Your tone of voice MUST be:
- Straight to the point, authoritative, and concise.
- Short messages (1-3 sentences maximum).
- Never use fluff, conversational filler, or verbose preambles.
- Directly address the user's intent (festival due diligence, grant/funding intake, invitation email verification, or film strategy).
- Always pair your response with the appropriate diagnostic tool call when applicable.
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
                "city_country": {
                    "type": "STRING",
                    "description": "City or country of the festival if specified."
                },
                "suspected_concerns": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"},
                    "description": "Specific areas to scrutinize: ['VENUE_LEGITIMACY', 'FEE_TRANSPARENCY', 'PREDATORY_AWARDS', 'ORGANIZER_TRACK_RECORD']."
                },
                "user_context": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"},
                    "description": "User background facts: ['INVITED', 'RECEIVED_EMAIL', 'TALKED_TO_ORGANIZER', 'ALREADY_PAID']."
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
    },
    {
        "name": "configure_grant_scout",
        "description": "Configures public grant and film funding match search for a project.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "project_title": { "type": "STRING" },
                "grant_category": { "type": "STRING" },
                "target_amount": { "type": "STRING" },
                "production_stage": { "type": "STRING" },
                "filmmaker_region": { "type": "STRING" },
                "grant_strategy_summary": { "type": "STRING" }
            },
            "required": ["project_title", "grant_strategy_summary"]
        }
    },
    {
        "name": "analyze_invitation_email",
        "description": "Analyzes an unsolicited festival invitation or laurel email for predatory signals.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "festival_claimed": { "type": "STRING" },
                "sender_domain": { "type": "STRING" },
                "fee_waiver_offered": { "type": "BOOLEAN" },
                "initial_verdict": { "type": "STRING" }
            },
            "required": ["festival_claimed", "initial_verdict"]
        }
    }
]


class ProducerDeskAgent:
    """Conversational orchestrator with Function Calling for Screened workspaces."""

    def __init__(self, gemini: Optional[GeminiClient] = None):
        self.gemini = gemini or GeminiClient()

    async def analyze_document(self, req: DocumentAnalysisRequest) -> DocumentAnalysisResult:
        """Analyzes an uploaded script, treatment, synopsis, or invitation email."""
        file_name = req.fileName
        raw_text = req.fileContent or ""
        mime_type = req.mimeType or "text/plain"

        # If we have Gemini client and multimodal/text content
        if self.gemini.client and (raw_text or req.fileBase64):
            try:
                import base64
                from google.genai import types

                prompt = f"""You are a cinema document analysis engine. Inspect this document and extract its structural metadata.
File name: {file_name}

Detect whether this is:
1) A Script / Treatment / Synopsis / Pitch Deck (kind: "SCRIPT_TREATMENT")
2) A Festival Acceptance / Laurels / Invitation Email (kind: "INVITATION_EMAIL")
3) A General Document (kind: "GENERAL_DOCUMENT")

Return a strict JSON object with:
{{
  "detectedKind": "SCRIPT_TREATMENT" | "INVITATION_EMAIL" | "GENERAL_DOCUMENT",
  "fileName": "{file_name}",
  "fileSizeBytes": 0,
  "extractedSummary": "1-2 sentence executive summary of the document",
  "filmTitle": "string or null",
  "format": "SHORT" | "FEATURE" | "DOCUMENTARY" | "ANIMATION" | "EPISODIC" | null,
  "genre": "string or null",
  "runtimeMinutes": number or null,
  "logline": "string or null",
  "budgetTier": "string or null",
  "suggestedPremiereGoal": "WORLD_PREMIERE" | "INTERNATIONAL_PREMIERE" | "NATIONAL_PREMIERE" | "NO_PREFERENCE" | null,
  "keyThemes": ["theme1", "theme2"],
  "festivalClaimed": "string or null",
  "senderDomain": "string or null",
  "feeWaiverOffered": boolean or null,
  "trophyFeeRequested": boolean or null,
  "redFlagSignals": ["signal1", "signal2"],
  "recommendedAction": "string or null"
}}"""

                contents = []
                if req.fileBase64 and mime_type.startswith(("application/pdf", "image/")):
                    try:
                        part = types.Part.from_bytes(data=base64.b64decode(req.fileBase64), mime_type=mime_type)
                        contents.append(part)
                    except Exception as e:
                        logger.warning(f"Failed to decode base64 attachment: {e}")
                if raw_text:
                    contents.append(raw_text[:8000])
                contents.append(prompt)

                response = self.gemini.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.1
                    )
                )

                response_text = response.text if hasattr(response, "text") and response.text else str(response)
                # Clean markdown wrapper if any
                clean_json = response_text.strip()
                if clean_json.startswith("```"):
                    clean_json = clean_json.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
                data = json.loads(clean_json)
                data["fileName"] = file_name
                return DocumentAnalysisResult(**data)
            except Exception as e:
                logger.warning(f"Gemini document analysis error: {e}")

        # Intelligent deterministic fallback extraction
        return self._deterministic_document_fallback(file_name, raw_text)

    def _deterministic_document_fallback(self, file_name: str, text: str) -> DocumentAnalysisResult:
        """Fallback document extractor using pattern matching."""
        import re
        lower_text = text.lower()
        lower_name = file_name.lower()

        # Check for Email / Invitation / Laurel signals
        is_email = any(k in lower_text or k in lower_name for k in [
            "dear filmmaker", "congratulations", "official selection", "invitation", "laurel",
            "submission waiver", "discount code", "award winner", "screening fee", "trophy fee"
        ])

        if is_email:
            # Extract festival name
            fest_match = re.search(
                r"(?:welcome to|selection at|invited to|selection for|at the|for the)\s+([A-Za-z0-9\s\-]+(?:Festival|Awards|Fest|Cinema|Showcase)[A-Za-z0-9\s]*)",
                text,
                re.IGNORECASE,
            )
            festival_claimed = (
                fest_match.group(1).strip()
                if fest_match
                else file_name.rsplit(".", 1)[0].replace("-", " ").replace("_", " ").title()
            )
            fee_waiver = "waiver" in lower_text or "free entry" in lower_text or "discount" in lower_text
            trophy_fee = "trophy" in lower_text or "certificate fee" in lower_text or "vip badge" in lower_text

            red_flags = []
            if "trophy" in lower_text or "certificate" in lower_text:
                red_flags.append("Paid physical trophy or certificate required")
            if "unsolicited" in lower_text or "discovered your film" in lower_text:
                red_flags.append("Unsolicited bulk outreach pattern")
            if not fee_waiver and "submit here" in lower_text:
                red_flags.append("Invitation requiring regular submission fee payment")

            return DocumentAnalysisResult(
                detectedKind=DocumentAnalysisKind.INVITATION_EMAIL,
                fileName=file_name,
                fileSizeBytes=len(text.encode("utf-8")),
                extractedSummary=f"Invitation or notification email claiming affiliation with {festival_claimed}.",
                festivalClaimed=festival_claimed,
                senderDomain="festival-communications.org",
                feeWaiverOffered=fee_waiver,
                trophyFeeRequested=trophy_fee,
                redFlagSignals=red_flags if red_flags else ["Standard festival correspondence template"],
                recommendedAction="Verify official domain and physical cinema venue before proceeding with any payment."
            )

        # Otherwise treat as Script / Treatment / Synopsis
        title_match = re.search(r"^(?:TITLE:|PROJECT:)?\s*([A-Z0-9\s\-:]{3,40})$", text, re.MULTILINE)
        film_title = title_match.group(1).strip() if title_match else file_name.rsplit(".", 1)[0].replace("-", " ").replace("_", " ").title()

        # Format
        format_type = FilmFormat.SHORT
        if any(w in lower_text for w in ["feature film", "feature screenplay", "feature length", "90 pages", "100 pages", "120 pages"]):
            format_type = FilmFormat.FEATURE
        elif "documentary" in lower_text:
            format_type = FilmFormat.DOCUMENTARY
        elif "animation" in lower_text:
            format_type = FilmFormat.ANIMATION
        elif "pilot" in lower_text or "episode" in lower_text:
            format_type = FilmFormat.EPISODIC

        # Genre
        genre = "Drama"
        for g in ["Sci-Fi", "Thriller", "Horror", "Comedy", "Documentary", "Animation", "Romance", "Experimental", "Action"]:
            if g.lower() in lower_text:
                genre = g
                break

        # Runtime
        runtime = 15 if format_type == FilmFormat.SHORT else 95
        rt_match = re.search(r"(\d+)\s*(?:min|minute|pages)", lower_text)
        if rt_match:
            try:
                runtime = int(rt_match.group(1))
            except Exception:
                pass

        # Logline
        logline_match = re.search(r"(?:LOGLINE|SYNOPSIS|SUMMARY):\s*(.+?)(?:\n\n|\n[A-Z]+:|$)", text, re.DOTALL | re.IGNORECASE)
        logline = logline_match.group(1).strip().replace("\n", " ") if logline_match else f"An independent {genre.lower()} {format_type.value.lower()} exploring identity and tension."

        return DocumentAnalysisResult(
            detectedKind=DocumentAnalysisKind.SCRIPT_TREATMENT,
            fileName=file_name,
            fileSizeBytes=len(text.encode("utf-8")),
            extractedSummary=f"{format_type.value.title()} project titled '{film_title}' ({genre}, {runtime} min).",
            filmTitle=film_title,
            format=format_type,
            genre=genre,
            runtimeMinutes=runtime,
            logline=logline[:280],
            budgetTier="Micro (< £50k)" if format_type == FilmFormat.SHORT else "Low (< £250k)",
            suggestedPremiereGoal=PremiereGoal.WORLD_PREMIERE,
            keyThemes=[genre, "Independent Cinema", "Festival Circuit"]
        )

    async def process_chat(self, req: ChatRequest) -> AsyncGenerator[Dict[str, Any], None]:
        """Processes a chat turn, yielding text tokens and tool call events."""
        user_message = req.message

        # If a document is attached, perform document extraction
        doc_result: Optional[DocumentAnalysisResult] = None
        if req.attachedFileName and (req.attachedFileContent or req.attachedFileBase64):
            doc_result = await self.analyze_document(DocumentAnalysisRequest(
                fileName=req.attachedFileName,
                fileContent=req.attachedFileContent,
                fileBase64=req.attachedFileBase64,
                mimeType=req.attachedFileMimeType
            ))

        if doc_result:
            if doc_result.detectedKind == DocumentAnalysisKind.INVITATION_EMAIL:
                user_message += f"\n\n[Extracted Invitation Email Analysis for '{doc_result.fileName}']:\nClaimed Festival: {doc_result.festivalClaimed}\nFee Waiver: {doc_result.feeWaiverOffered}\nRed Flags: {', '.join(doc_result.redFlagSignals)}\nSummary: {doc_result.extractedSummary}"
            elif doc_result.detectedKind == DocumentAnalysisKind.SCRIPT_TREATMENT:
                user_message += f"\n\n[Extracted Script Analysis for '{doc_result.fileName}']:\nTitle: {doc_result.filmTitle}\nFormat: {doc_result.format}\nGenre: {doc_result.genre}\nRuntime: {doc_result.runtimeMinutes} min\nLogline: {doc_result.logline}\nSummary: {doc_result.extractedSummary}"
            else:
                user_message += f"\n\n[Attached File Summary for '{doc_result.fileName}']:\n{doc_result.extractedSummary}"
        elif req.attachedFileName and req.attachedFileContent:
            user_message += f"\n\n[Attached File: {req.attachedFileName}]\n{req.attachedFileContent[:2500]}"

        # Check intent with rule-based heuristics or Gemini LLM
        prompt = f"{PRODUCER_DESK_SYSTEM_PROMPT}\n\nUser Message: {user_message}\n\nProvide a concise 1-2 sentence response and specify the tool parameters."

        if not self.gemini.client:
            # High-fidelity offline / simulated response with smart tool dispatch
            async for event in self._generate_fallback_response(user_message, doc_result):
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

            # Enforce conciseness: keep first 2 sentences if response is overly long
            sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', cleaned_text) if s.strip()]
            if len(sentences) > 3:
                cleaned_text = " ".join(sentences[:2])

            # Check if response contains tool invocation or formulate one
            tool_call = self._extract_or_infer_tool_call(user_message, response_text, doc_result)
            follow_up_probe = self._generate_follow_up_probe(user_message, tool_call, doc_result)

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

            if follow_up_probe:
                yield {
                    "type": "FOLLOW_UP_PROBE",
                    "followUpProbe": follow_up_probe.model_dump()
                }

            yield {"type": "DONE"}

        except Exception as e:
            logger.warning(f"Gemini API chat fallback triggered: {e}")
            async for event in self._generate_fallback_response(user_message, doc_result):
                yield event

    def _extract_or_infer_tool_call(self, user_msg: str, agent_response: str, doc_result: Optional[DocumentAnalysisResult] = None) -> Optional[ChatToolCall]:
        """Infers structured tool invocation if the model discusses a specific festival or film slate."""
        import re
        msg_lower = user_msg.lower()

        # If a document was analyzed, prioritize exact extracted document profile
        if doc_result:
            if doc_result.detectedKind == DocumentAnalysisKind.INVITATION_EMAIL:
                return ChatToolCall(
                    toolName=ToolCallType.ANALYZE_INVITATION_EMAIL,
                    args=InvitationEmailToolArgs(
                        festival_claimed=doc_result.festivalClaimed or "Claimed Festival",
                        sender_domain=doc_result.senderDomain or "festival-communications.org",
                        fee_waiver_offered=bool(doc_result.feeWaiverOffered),
                        red_flag_signals=doc_result.redFlagSignals or ["Requires fee before physical venue verification"],
                        initial_verdict=doc_result.recommendedAction or doc_result.extractedSummary
                    ).model_dump()
                )
            elif doc_result.detectedKind == DocumentAnalysisKind.SCRIPT_TREATMENT:
                return ChatToolCall(
                    toolName=ToolCallType.CONFIGURE_OPPORTUNITY_SCOUT,
                    args=OpportunityScoutToolArgs(
                        film_title=doc_result.filmTitle or "Untitled Project",
                        format=doc_result.format or FilmFormat.SHORT,
                        genre=doc_result.genre or "Drama",
                        runtime_minutes=doc_result.runtimeMinutes or 15,
                        premiere_goal=doc_result.suggestedPremiereGoal or PremiereGoal.WORLD_PREMIERE,
                        budget_tier=doc_result.budgetTier or "Micro (< £50k)",
                        target_regions=["UK & Europe", "North America"],
                        strategy_rationale=f"Tailored roadmap generated from '{doc_result.filmTitle}' ({doc_result.genre}, {doc_result.runtimeMinutes} min). Targeting qualifying festivals matching this tone."
                    ).model_dump()
                )

        # Check for Grant & Funding intent
        if any(w in msg_lower for w in ["grant", "funding", "sponsor", "bfi film fund", "screen scotland", "match funding", "fellowship", "subsidies"]):
            return ChatToolCall(
                toolName=ToolCallType.CONFIGURE_GRANT_SCOUT,
                args=GrantScoutToolArgs(
                    project_title="Independent Production",
                    grant_category="DEVELOPMENT_AND_PRODUCTION",
                    target_amount="£25,000",
                    production_stage="Production",
                    filmmaker_region="UK & Europe",
                    recommended_grants=["BFI Filmmaking Fund", "Screen Scotland", "Sundance Doc Fund"],
                    grant_strategy_summary="Target institutional public funding and regional film agency grants matching your production stage."
                ).model_dump()
            )

        # Check for Email / Invitation analysis intent
        if any(w in msg_lower for w in ["email", "invitation", "invited", "laurel", "waiver offer", "selected", "letter", "acceptance"]):
            return ChatToolCall(
                toolName=ToolCallType.ANALYZE_INVITATION_EMAIL,
                args=InvitationEmailToolArgs(
                    festival_claimed="Festival Organizers",
                    sender_domain="festival-submissions.com",
                    fee_waiver_offered="waiver" in msg_lower or "discount" in msg_lower,
                    red_flag_signals=["Unsolicited bulk invitation", "High paid award upgrade cost"],
                    initial_verdict="Verify whether this invitation originated from an official domain before submitting or paying fees."
                ).model_dump()
            )

        # Check for Comparison intent
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
        if any(w in msg_lower for w in ["vet", "legit", "scam", "aldergate", "raindance", "sundance", "aesthetica", "cannes", "venice", "berlinale", "sxsw", "tribeca", "toronto", "check festival", "is it real", "is this real", "check fees", "tell me about", "research"]):
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
                cleaned = re.sub(r"(tell me about|is|a|the|legit|scam|real|check|fees|for|\?|research)", "", user_msg, flags=re.IGNORECASE).strip()
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

            runtime = 14 if format_type == "SHORT" else 90
            rt_match = re.search(r"(\d+)\s*(?:min|minute)", msg_lower)
            if rt_match:
                try:
                    runtime = int(rt_match.group(1))
                except Exception:
                    pass

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

    def _generate_follow_up_probe(
        self,
        user_msg: str,
        tool_call: Optional[ChatToolCall],
        doc_result: Optional[DocumentAnalysisResult] = None
    ) -> Optional[InteractiveFollowUpProbe]:
        """Generates contextual multi-step follow-up dialogue options to probe filmmaker interactions."""
        msg_lower = user_msg.lower()

        if doc_result and doc_result.detectedKind == DocumentAnalysisKind.SCRIPT_TREATMENT:
            film_title = doc_result.filmTitle or "your project"
            return InteractiveFollowUpProbe(
                question=f"Next strategic actions for '{film_title}':",
                options=[
                    FollowUpOption(
                        label="Scout Early Bird deadlines",
                        promptText=f"Find upcoming Early Bird deadlines under £40 for {film_title}.",
                        badge="Budget Tier"
                    ),
                    FollowUpOption(
                        label="Filter BAFTA / Oscar qualifiers",
                        promptText=f"Show only BAFTA and Academy Award qualifying festivals for {film_title}.",
                        badge="Accreditation"
                    ),
                    FollowUpOption(
                        label="Scan public production grants",
                        promptText=f"Find public film grants and regional funds matching {film_title}.",
                        badge="Grant Match"
                    )
                ]
            )

        if doc_result and doc_result.detectedKind == DocumentAnalysisKind.INVITATION_EMAIL:
            fest_claimed = doc_result.festivalClaimed or "this festival"
            return InteractiveFollowUpProbe(
                question=f"Forensic verification checks for {fest_claimed}:",
                options=[
                    FollowUpOption(
                        label="Check sender domain WHOIS",
                        promptText=f"Perform deep domain provenance check on the sender domain for {fest_claimed}.",
                        badge="Domain Forensics"
                    ),
                    FollowUpOption(
                        label="Verify physical screening venue",
                        promptText=f"Did {fest_claimed} lease a verified physical cinema?",
                        badge="Venue Corroboration"
                    ),
                    FollowUpOption(
                        label="Scrutinize trophy & certificate fees",
                        promptText=f"Is it standard practice for {fest_claimed} to charge for physical awards?",
                        badge="Fee Transparency"
                    )
                ]
            )

        if tool_call and tool_call.toolName == ToolCallType.CONFIGURE_DUE_DILIGENCE:
            fest_name = tool_call.args.get("festival_name", "this festival")
            return InteractiveFollowUpProbe(
                question=f"Key follow-up probes for {fest_name}:",
                options=[
                    FollowUpOption(
                        label="Received unsolicited email invite",
                        promptText=f"I received an unsolicited invitation email from {fest_name} promising an award. Can you check its domain?",
                        badge="Phishing / Scam Check"
                    ),
                    FollowUpOption(
                        label="Checking physical cinema venue",
                        promptText=f"Did {fest_name} lease a verified physical cinema or is it an online-only screening?",
                        badge="Venue Corroboration"
                    ),
                    FollowUpOption(
                        label="Review entry fee tiers",
                        promptText=f"Are the entry fees for {fest_name} reasonable compared to BAFTA-qualifying circuits?",
                        badge="Fee Transparency"
                    )
                ]
            )

        if tool_call and tool_call.toolName == ToolCallType.CONFIGURE_OPPORTUNITY_SCOUT:
            film_title = tool_call.args.get("film_title", "your film")
            return InteractiveFollowUpProbe(
                question=f"Refine festival scouting strategy for '{film_title}':",
                options=[
                    FollowUpOption(
                        label="Target BAFTA / Oscar qualifiers only",
                        promptText=f"Filter only BAFTA and Academy Award qualifying festivals for {film_title}.",
                        badge="Accreditation Filter"
                    ),
                    FollowUpOption(
                        label="Early Bird budget optimization",
                        promptText=f"What are the upcoming Early Bird submission deadlines under £40 for {film_title}?",
                        badge="Budget Tier"
                    ),
                    FollowUpOption(
                        label="UK & European premiere strategy",
                        promptText=f"Recommend a UK & European premiere rollout strategy for {film_title}.",
                        badge="Premiere Strategy"
                    )
                ]
            )

        if tool_call and tool_call.toolName == ToolCallType.CONFIGURE_GRANT_SCOUT:
            return InteractiveFollowUpProbe(
                question="Narrow film grant matching criteria:",
                options=[
                    FollowUpOption(
                        label="Development & Script Grants",
                        promptText="Show active early-stage development grants and script development funds.",
                        badge="Development Stage"
                    ),
                    FollowUpOption(
                        label="Production Match Funding",
                        promptText="Find regional match funding and production grants in the UK/Europe.",
                        badge="Production Stage"
                    ),
                    FollowUpOption(
                        label="BFI & National Lottery Funds",
                        promptText="What are the upcoming deadlines for the BFI Filmmaking Fund?",
                        badge="Institutional Fund"
                    )
                ]
            )

        if tool_call and tool_call.toolName == ToolCallType.ANALYZE_INVITATION_EMAIL:
            return InteractiveFollowUpProbe(
                question="Investigate invitation authenticity:",
                options=[
                    FollowUpOption(
                        label="Check sender domain WHOIS",
                        promptText="Check if the sender domain was registered recently or associated with scam alerts.",
                        badge="Domain Forensics"
                    ),
                    FollowUpOption(
                        label="Verify laurel licensing fees",
                        promptText="Is it standard practice for festivals to charge for physical trophies and laurels?",
                        badge="Trophy Fee Scrutiny"
                    )
                ]
            )

        return None

    async def _generate_fallback_response(
        self,
        user_msg: str,
        doc_result: Optional[DocumentAnalysisResult] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Offline simulation yielding concise, straight-to-the-point intelligence."""
        tool_call = self._extract_or_infer_tool_call(user_msg, "", doc_result)
        follow_up_probe = self._generate_follow_up_probe(user_msg, tool_call, doc_result)

        if doc_result and doc_result.detectedKind == DocumentAnalysisKind.INVITATION_EMAIL:
            text = f"Analyzed email '{doc_result.fileName}'. Claimed festival: **{doc_result.festivalClaimed}**. Verification module prepared below."
        elif doc_result and doc_result.detectedKind == DocumentAnalysisKind.SCRIPT_TREATMENT:
            text = f"Parsed '{doc_result.fileName}' ({doc_result.genre} {doc_result.format.value.lower()}, ~{doc_result.runtimeMinutes} min). Opportunity Scout roadmap configured below."
        elif tool_call and tool_call.toolName == ToolCallType.CONFIGURE_DUE_DILIGENCE:
            fest_name = tool_call.args.get("festival_name", "Target Festival")
            text = f"Initiating due diligence pre-flight for **{fest_name}**. Confirm entity location and your interaction history below to launch."
        elif tool_call and tool_call.toolName == ToolCallType.CONFIGURE_OPPORTUNITY_SCOUT:
            text = "Scouting qualifying submission windows. Configure your film profile below to discover deadlines and accreditation roadmaps."
        elif tool_call and tool_call.toolName == ToolCallType.COMPARE_FESTIVALS_ARENA:
            fest_a = tool_call.args.get("festival_a", "Festival A")
            fest_b = tool_call.args.get("festival_b", "Festival B")
            text = f"Comparing **{fest_a}** vs **{fest_b}** across accreditation, physical venue leases, and ROI."
        elif tool_call and tool_call.toolName == ToolCallType.CONFIGURE_GRANT_SCOUT:
            text = "Configuring film grant discovery. Adjust your budget tier and production stage below to match active funds."
        elif tool_call and tool_call.toolName == ToolCallType.ANALYZE_INVITATION_EMAIL:
            text = "Analyzing invitation provenance. Review the sender signals below to verify legitimacy before paying any fee."
        else:
            text = "Cinema Due Diligence Desk active. Enter a festival to vet, request a grant search, or drop an invitation email."

        words = text.split(" ")
        for i in range(0, len(words), 3):
            chunk = " ".join(words[i:i+3]) + " "
            yield {"type": "TOKEN", "token": chunk}

        if tool_call:
            yield {
                "type": "TOOL_CALL",
                "toolCall": tool_call.model_dump()
            }

        if follow_up_probe:
            yield {
                "type": "FOLLOW_UP_PROBE",
                "followUpProbe": follow_up_probe.model_dump()
            }

        yield {"type": "DONE"}


producer_desk_agent = ProducerDeskAgent()
