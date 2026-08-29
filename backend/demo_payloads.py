import asyncio
import json
from datetime import datetime, timezone

DEMO_INVESTIGATION_ID = "demo_pinco_pallino"

def get_demo_investigation():
    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "id": DEMO_INVESTIGATION_ID,
        "status": "DISAMBIGUATING",
        "query": "Pinco Pallino Film Festival",
        "intent": "Vet before submitting",
        "createdAt": now_iso,
        "updatedAt": now_iso,
        "candidates": [
            {
                "id": "cand_pinco_1",
                "name": "Pinco Pallino Film Festival",
                "entityType": "FESTIVAL",
                "cityCountry": "London, UK",
                "foundedYear": 2021,
                "descriptor": "An independent film festival claiming theatrical screenings at Genesis Cinema and BFI Southbank.",
                "sourceIds": []
            }
        ],
        "confirmedEntity": None,
        "sourcesCount": 0,
        "claimsCount": 0,
        "disputes": []
    }


async def demo_sse_generator():
    """Generates a 18-second simulated live-progress SSE stream for the Demo Mode."""
    
    def format_event(event_type: str, message: str, details: dict = None):
        return f"data: {json.dumps({'id': 'evt_demo', 'investigationId': DEMO_INVESTIGATION_ID, 'timestamp': datetime.now(timezone.utc).isoformat(), 'eventType': event_type, 'agentName': 'DemoOrchestrator', 'message': message, 'details': details or {}})}\n\n"

    # Step 1: Planning (0-3s)
    yield format_event("PLANNING_STARTED", "Formulating parallel investigation strategy...")
    await asyncio.sleep(1.0)
    yield format_event("PLANNING_STEP", "Identifying key domains: Corporate, Venue, Filmmaker Feedback...")
    await asyncio.sleep(2.0)
    
    # Auto-confirm entity
    yield format_event("CANDIDATES_FOUND", "Found candidate entity.", {"candidates": get_demo_investigation()["candidates"]})
    await asyncio.sleep(0.5)

    # Step 2: Researching (3-7s)
    yield format_event("DOMAIN_SEARCH_STARTED", "Initializing parallel intelligence agents...")
    await asyncio.sleep(0.5)
    yield format_event("AGENT_SEARCH", "Querying Companies House for Pinco Pallino Film CIC...")
    await asyncio.sleep(1.5)
    yield format_event("AGENT_SEARCH", "Scraping BFI Southbank physical rental manifests...")
    await asyncio.sleep(1.0)
    yield format_event("AGENT_SEARCH", "Fetching Letterboxd filmmaker reviews and Reddit threads...")
    await asyncio.sleep(1.0)
    yield format_event("AGENT_SEARCH", "Extracting terms and conditions from official website...")
    
    # Step 3/4: Contradiction Analysis (7-11s)
    yield format_event("CONTRADICTIONS_ANALYZING", "Cross-referencing Jury Chair corporate filings against submission fees...")
    await asyncio.sleep(1.5)
    yield format_event("CONTRADICTIONS_STEP", "Found 3 organizers overlapping with Pallino Media Lab Ltd...")
    await asyncio.sleep(1.5)
    yield format_event("CONTRADICTIONS_STEP", "Identified repeat winner anomaly (2024 & 2025)...")
    await asyncio.sleep(1.0)
    yield format_event("CONTRADICTIONS_STEP", "Flagging severe communication delays from 14 Reddit/Letterboxd reviews...")

    # Step 5: Synthesizing Dossier (11-16s)
    yield format_event("DOSSIER_SYNTHESIZING", "Synthesizing deep-vetting matrix and provenance graphs...")
    await asyncio.sleep(1.5)
    yield format_event("DOSSIER_STEP", "Generating Personnel Network Diagram...")
    await asyncio.sleep(1.5)
    yield format_event("DOSSIER_STEP", "Calculating Detail Dial depth layers (1 to 4)...")
    await asyncio.sleep(1.0)
    yield format_event("DOSSIER_STEP", "Finalizing 78/100 Authenticity Score...")
    await asyncio.sleep(1.0)
    
    # End
    yield format_event("DOSSIER_READY", "Demonstration Dossier successfully compiled.")


def get_demo_full_dossier():
    """Returns the comprehensive Gold Standard Pinco Pallino Demo dossier."""
    now_iso = datetime.now(timezone.utc).isoformat()
    
    return {
        "id": DEMO_INVESTIGATION_ID,
        "status": "READY",
        "query": "Pinco Pallino Film Festival",
        "intent": "Vet before submitting",
        "createdAt": now_iso,
        "updatedAt": now_iso,
        "candidates": get_demo_investigation()["candidates"],
        "confirmedEntity": get_demo_investigation()["candidates"][0],
        "sourcesCount": 14,
        "claimsCount": 22,
        
        # Mode 2 & Mode 3: Contradictions (Disputes)
        "disputes": [
            {
                "id": "disp_conflict",
                "pointOfContention": "Jury & Organizer Conflict of Interest",
                "category": "JURY_AWARDS",
                "claimA": "The festival claims an impartial, independent jury.",
                "evidenceA": [{"url": "https://pincopallino.com/jury", "snippet": "Our independent jury evaluates all films blindly."}],
                "claimB": "Companies House records show 3 key organizers and jurors co-own Pallino Media Lab Ltd, selling distribution services.",
                "evidenceB": [{"url": "https://find-and-update.company-information.service.gov.uk/company/13984712", "snippet": "Active Directors: A. Smith (Fest Dir), B. Jones (Jury Chair)."}],
                "guidance": "High Risk. Key personnel are cross-selling services to submitting filmmakers."
            },
            {
                "id": "disp_fees",
                "pointOfContention": "Aggressive Fee Escalation",
                "category": "FEES_POLICY",
                "claimA": "Early bird entry fee is a reasonable £28.",
                "evidenceA": [{"url": "https://filmfreeway.com/PincoPallino", "snippet": "Early Bird: £28"}],
                "claimB": "Late fees spike aggressively to £85 in the final 10 days.",
                "evidenceB": [{"url": "https://filmfreeway.com/PincoPallino", "snippet": "Extended Late Deadline: £85"}],
                "guidance": "Medium Risk. The 200% price spike in the final 10 days is extractive."
            }
        ],
        
        # Mode 3: Claims
        "claims": [
            {
                "id": "claim_1",
                "investigationId": DEMO_INVESTIGATION_ID,
                "researchDomain": "VENUES",
                "category": "VENUE_SCREENINGS",
                "statement": "Festival holds physical screenings at Genesis Cinema and BFI Southbank.",
                "claimKind": "FACTUAL",
                "status": "VERIFIED",
                "evidence": [
                    {
                        "sourceId": "src_bfi",
                        "url": "https://bfi.org.uk/southbank/rentals/2025",
                        "snippet": "Pinco Pallino Film Festival booked for Private Hire, Oct 12-14.",
                        "confidenceScore": 95,
                        "extractionDate": now_iso
                    }
                ]
            },
            {
                "id": "claim_2",
                "investigationId": DEMO_INVESTIGATION_ID,
                "researchDomain": "PARTICIPANTS",
                "category": "EXPERIENCE_FEEDBACK",
                "statement": "Filmmakers experience 3-5 week communication blackouts prior to notification dates.",
                "claimKind": "OPINION",
                "status": "CONTRADICTED",
                "evidence": [
                    {
                        "sourceId": "src_reddit",
                        "url": "https://reddit.com/r/Filmmakers/comments/xx",
                        "snippet": "They ghosted me for 4 weeks after the notification date before sending a generic rejection.",
                        "confidenceScore": 88,
                        "extractionDate": now_iso
                    }
                ]
            }
        ],

        # Sources
        "sources": [
            {
                "id": "src_bfi",
                "url": "https://bfi.org.uk/southbank",
                "domain": "bfi.org.uk",
                "title": "BFI Southbank Venue Hire",
                "sourceTier": 1,
                "retrievedAt": now_iso,
                "excerpts": ["Pinco Pallino Film Festival booked for Private Hire, Oct 12-14."],
                "contentHash": "hash1"
            },
            {
                "id": "src_ch",
                "url": "https://find-and-update.company-information.service.gov.uk/company/13984712",
                "domain": "gov.uk",
                "title": "Pinco Pallino Film CIC - Companies House",
                "sourceTier": 1,
                "retrievedAt": now_iso,
                "excerpts": ["Directors: A. Smith, B. Jones, C. Davis."],
                "contentHash": "hash2"
            }
        ],

        # Mode 1 & 2: Dossier Overview
        "dossier": {
            "executiveSummary": "Pinco Pallino is an active film festival in London with verified screenings at BFI Southbank. However, severe conflicts of interest exist among jury members who cross-sell distribution services, and filmmakers report significant communication blackouts.",
            "festivalOverview": "London-based independent short film festival (4th Edition).",
            "organizerProfile": "Registered as Pinco Pallino Film CIC, but directors concurrently run private media consulting firms targeting applicants.",
            "participantFeedback": "Aggregated reviews highlight poor communication and delayed notifications.",
            "unresolvedQuestions": ["Why was the Best International Short awarded to the same director in 2024 and 2025?"],
            "filmmakerChecklist": ["Avoid the £85 late fee deadline.", "Do not purchase 'distribution consultation' services from the festival organizers."]
        },

        # Mode 3: Deep Vetting Matrix & Personnel Graph
        "deepVetting": {
            "festivalName": "Pinco Pallino Film Festival",
            "overallAuthenticityScore": 78,
            "totalFlags": 4,
            "dimensions": [
                {
                    "id": "dim_venue",
                    "dimensionKey": "VENUE_LOGISTICS",
                    "title": "Physical Venue Footprint",
                    "category": "VENUE_SCREENINGS",
                    "status": "VERIFIED_AUTHENTIC",
                    "confidenceScore": 95,
                    "summary": "Confirmed physical bookings at Genesis Cinema and BFI Southbank.",
                    "signalsFound": ["BFI Private Hire manifest match", "Genesis Cinema website listing"],
                    "corroboratingSources": ["bfi.org.uk", "genesiscinema.co.uk"],
                    "riskWeight": "LOW"
                },
                {
                    "id": "dim_personnel",
                    "dimensionKey": "PERSONNEL_DOSSIER",
                    "title": "Key Personnel & Jury Dossiers",
                    "category": "ORGANIZER_TRACK_RECORD",
                    "status": "RED_FLAG",
                    "confidenceScore": 90,
                    "summary": "Key personnel cross-sell distribution services. Same filmmaker won in 2024 and 2025.",
                    "signalsFound": ["Companies House directorship overlap", "Repeat winner anomaly"],
                    "corroboratingSources": ["gov.uk", "imdb.com"],
                    "riskWeight": "HIGH"
                },
                {
                    "id": "dim_feedback",
                    "dimensionKey": "FILMMAKER_SENTIMENT",
                    "title": "Community Sentiment & Feedback",
                    "category": "EXPERIENCE_FEEDBACK",
                    "status": "AMBER_WARNING",
                    "confidenceScore": 85,
                    "summary": "Consistent reports of 3-5 week communication delays.",
                    "signalsFound": ["14 negative mentions of communication delays"],
                    "corroboratingSources": ["reddit.com", "letterboxd.com"],
                    "riskWeight": "MEDIUM"
                }
            ],
            "keyPersonnel": [
                {
                    "name": "A. Smith",
                    "roles": ["Festival Director", "Co-Founder"],
                    "companies": ["Pinco Pallino Film CIC", "Pallino Media Lab Ltd"],
                    "associatedFestivals": ["Pinco Pallino"],
                    "isFestivalMillSuspect": False,
                    "hasDistributionOverlap": True,
                    "notes": "Co-director of Pallino Media Lab, selling DCP packaging."
                },
                {
                    "name": "B. Jones",
                    "roles": ["Jury Chair"],
                    "companies": ["IndiePitch Consulting", "Pallino Media Lab Ltd"],
                    "associatedFestivals": [],
                    "isFestivalMillSuspect": False,
                    "hasDistributionOverlap": True,
                    "notes": "Jury chair offering paid pitch consulting to submitters."
                }
            ],
            "generatedAt": now_iso
        }
    }
