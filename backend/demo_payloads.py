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
    """Generates a 20-second simulated live-progress SSE stream for the Demo Mode (5s per stage)."""
    
    def format_event(event_type: str, message: str, details: dict = None):
        payload = {
            "id": "evt_demo",
            "investigationId": DEMO_INVESTIGATION_ID,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "eventType": event_type,
            "agentName": "DemoOrchestrator",
            "message": message,
            "details": details or {},
        }
        return f"data: {json.dumps(payload)}\n\n"

    # Stage 1: Planning (5s)
    yield format_event("PLANNING_STARTED", "Formulating parallel investigation strategy...")
    await asyncio.sleep(1.5)
    yield format_event("PLANNING_STEP", "Identifying key domains: Corporate, Venue, Filmmaker Feedback...")
    await asyncio.sleep(2.0)
    yield format_event("PLANNING_STEP", "Found candidate entity.", {"candidates": get_demo_investigation()["candidates"]})
    await asyncio.sleep(1.5)

    # Stage 2: Researching (5s)
    yield format_event("DOMAIN_SEARCH_STARTED", "Dispatching sub-agents to verify claims...")
    await asyncio.sleep(1.25)
    yield format_event("AGENT_UPDATE", "VenueAgent: Verified BFI Southbank private hire manifests.", {"agent": "VenueAgent"})
    await asyncio.sleep(1.25)
    yield format_event("AGENT_UPDATE", "CorporateAgent: Found Companies House matches for key personnel.", {"agent": "CorporateAgent"})
    await asyncio.sleep(1.25)
    yield format_event("AGENT_UPDATE", "SentimentAgent: Aggregating 42+ reviews from Reddit & TrustPilot.", {"agent": "SentimentAgent"})
    await asyncio.sleep(1.25)

    # Stage 3: Analyzing (5s)
    yield format_event("CONTRADICTIONS_ANALYZING", "Cross-referencing claims and calculating risk scores...")
    await asyncio.sleep(1.5)
    yield format_event("AGENT_UPDATE", "VerificationAgent: Checking sponsor legitimacy with ARRI and Sony.", {"agent": "VerificationAgent"})
    await asyncio.sleep(1.5)
    yield format_event("AGENT_UPDATE", "FraudAgent: Flagged conflict of interest anomaly in jury records.", {"agent": "FraudAgent"})
    await asyncio.sleep(2.0)

    # Stage 4: Synthesizing (5s)
    yield format_event("DOSSIER_SYNTHESIZING", "Assembling finalized evidence dossier...")
    await asyncio.sleep(1.5)
    yield format_event("AGENT_UPDATE", "FraudAgent: Flagged fabricated sponsorships.", {"agent": "FraudAgent"})
    await asyncio.sleep(2.0)
    yield format_event("AGENT_UPDATE", "SynthesisAgent: Reviewing final output for accuracy...", {"agent": "SynthesisAgent"})
    await asyncio.sleep(1.5)

    # Complete
    yield format_event("DOSSIER_READY", "Investigation complete. Generating final dossier.")


def get_demo_full_dossier():
    """Returns the finalized, highly detailed mock investigation state."""
    now_iso = datetime.now(timezone.utc).isoformat()
    
    return {
        "id": DEMO_INVESTIGATION_ID,
        "status": "READY",
        "createdAt": now_iso,
        "updatedAt": now_iso,
        "candidates": get_demo_investigation()["candidates"],
        "confirmedEntity": get_demo_investigation()["candidates"][0],
        "sourcesCount": 42,
        "claimsCount": 87,
        
        "disputes": [
            {
                "id": "disp_conflict",
                "pointOfContention": "Jury & Organizer Conflict of Interest",
                "category": "JURY_AWARDS",
                "claimA": "The festival claims an impartial, independent, blind-judging jury.",
                "evidenceA": [{"url": "https://pincopallino.com/jury", "snippet": "Our independent jury evaluates all films blindly and without prejudice."}],
                "claimB": "Records show 3 key organizers and jurors co-own Pallino Media Lab Ltd, aggressively upselling PR & distribution services to applicants.",
                "evidenceB": [{"url": "https://find-and-update.company-information.service.gov.uk/company/13984712", "snippet": "Active Directors: A. Smith (Fest Dir), B. Jones (Jury Chair), C. Davis."}],
                "guidance": "High Risk. Key personnel are cross-selling services to submitting filmmakers."
            },
            {
                "id": "disp_fees",
                "pointOfContention": "Aggressive Fee Escalation",
                "category": "FEES_POLICY",
                "claimA": "Early bird entry fee is advertised as a highly accessible £28.",
                "evidenceA": [{"url": "https://filmfreeway.com/PincoPallino", "snippet": "Early Bird: £28 for all categories."}],
                "claimB": "Late fees spike aggressively to £85 in the final 10 days, accounting for 65% of their total annual revenue according to leaked financial summaries.",
                "evidenceB": [{"url": "https://filmfreeway.com/PincoPallino", "snippet": "Extended Late Deadline: £85 (No waivers accepted)." }],
                "guidance": "Medium Risk. The 200% price spike in the final 10 days is an extractive financial mechanism."
            },
            {
                "id": "disp_winner",
                "pointOfContention": "Competitive Integrity & Repeat Winners",
                "category": "JURY_AWARDS",
                "claimA": "The festival claims to receive over 3,000 global submissions per cycle, boasting a hyper-competitive 1.2% acceptance rate.",
                "evidenceA": [{"url": "https://pincopallino.com/about", "snippet": "With over 3,000 entries from 75 countries, securing a nomination is an elite achievement."}],
                "claimB": "The same local director, Martin Sterling, won the 'Best International Short' award twice in a row (2024 and 2025).",
                "evidenceB": [{"url": "https://imdb.com/festival/pincopallino/2025", "snippet": "Best International Short: 'Midnight Call' dir. Martin Sterling (also 2024 winner)."}],
                "guidance": "High Risk. Given the claimed 3,000+ submissions, a back-to-back win by the same local director severely undermines competitive integrity."
            },
            {
                "id": "disp_sponsors",
                "pointOfContention": "Fabricated Brand Partnerships",
                "category": "ORGANIZER_TRACK_RECORD",
                "claimA": "The festival lists Sony Cinema and ARRI as 'Official Platinum Sponsors'.",
                "evidenceA": [{"url": "https://pincopallino.com/sponsors", "snippet": "Platinum Sponsors: Sony Cinema, ARRI, Blackmagic Design."}],
                "claimB": "ARRI PR confirmed via Twitter they have no affiliation with the festival.",
                "evidenceB": [{"url": "https://twitter.com/ARRIChannel/status/123456", "snippet": "@PincoPallinoFest is not an official ARRI partner. We have requested logo removal."}],
                "guidance": "High Risk. Falsely claiming tier-1 industry sponsors is a classic indicator of a predatory festival model."
            }
        ],
        
        "claims": [
            {
                "id": "claim_1",
                "investigationId": DEMO_INVESTIGATION_ID,
                "researchDomain": "VENUES",
                "category": "VENUE_SCREENINGS",
                "statement": "Festival holds physical screenings at Genesis Cinema and BFI Southbank.",
                "claimKind": "FACT",
                "status": "CORROBORATED",
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
                "claimKind": "ALLEGATION",
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
            },
            {
                "id": "claim_3",
                "investigationId": DEMO_INVESTIGATION_ID,
                "researchDomain": "ORGANIZER",
                "category": "ORGANIZER_TRACK_RECORD",
                "statement": "Festival Director A. Smith holds an active bankruptcy proceeding filed in 2022.",
                "claimKind": "FACT",
                "status": "SUPPORTED",
                "evidence": [
                    {
                        "sourceId": "src_gazette",
                        "url": "https://thegazette.co.uk/notice/2384",
                        "snippet": "Insolvency notice for A. Smith (trading as Pallino Media).",
                        "confidenceScore": 92,
                        "extractionDate": now_iso
                    }
                ]
            },
            {
                "id": "claim_4",
                "investigationId": DEMO_INVESTIGATION_ID,
                "researchDomain": "FEES",
                "category": "FEES_POLICY",
                "statement": "Festival offers an 'Expedited Judging' add-on for £150.",
                "claimKind": "FACT",
                "status": "CORROBORATED",
                "evidence": [
                    {
                        "sourceId": "src_ff",
                        "url": "https://filmfreeway.com/PincoPallino",
                        "snippet": "Upgrade to Platinum Review (£150) for a guaranteed decision within 48 hours.",
                        "confidenceScore": 99,
                        "extractionDate": now_iso
                    }
                ]
            },
            {
                "id": "claim_5",
                "investigationId": DEMO_INVESTIGATION_ID,
                "researchDomain": "PARTICIPANTS",
                "category": "EXPERIENCE_FEEDBACK",
                "statement": "Filmmakers report that the screening venue was half-empty and lacked adequate projection equipment.",
                "claimKind": "ALLEGATION",
                "status": "SUPPORTED",
                "evidence": [
                    {
                        "sourceId": "src_trustpilot",
                        "url": "https://trustpilot.com/review/pincopallino.com",
                        "snippet": "Screening was literally just a projector in the basement of a pub. Sound cut out twice.",
                        "confidenceScore": 76,
                        "extractionDate": now_iso
                    }
                ]
            },
            {
                "id": "claim_6",
                "investigationId": DEMO_INVESTIGATION_ID,
                "researchDomain": "ORGANIZER",
                "category": "ORGANIZER_TRACK_RECORD",
                "statement": "Festival uses bot accounts to inflate Twitter following.",
                "claimKind": "ALLEGATION",
                "status": "UNVERIFIED",
                "evidence": [
                    {
                        "sourceId": "src_reddit2",
                        "url": "https://reddit.com/r/Filmmakers/comments/yy",
                        "snippet": "I checked their followers, mostly bots with no profile pics.",
                        "confidenceScore": 45,
                        "extractionDate": now_iso
                    }
                ]
            },
            {
                "id": "claim_7",
                "investigationId": DEMO_INVESTIGATION_ID,
                "researchDomain": "VENUES",
                "category": "VENUE_LOGISTICS",
                "statement": "Event scheduled for June 2026 at BFI Southbank has been paid in full.",
                "claimKind": "FACT",
                "status": "CORROBORATED",
                "evidence": [
                    {
                        "sourceId": "src_bfi",
                        "url": "https://bfi.org.uk/southbank/rentals/2026",
                        "snippet": "Deposit cleared for 2026 dates.",
                        "confidenceScore": 91,
                        "extractionDate": now_iso
                    }
                ]
            },
            {
                "id": "claim_8",
                "investigationId": DEMO_INVESTIGATION_ID,
                "researchDomain": "PARTICIPANTS",
                "category": "EXPERIENCE_FEEDBACK",
                "statement": "Organizers failed to provide laurels after payment of a 'Laurel Delivery Fee'.",
                "claimKind": "ALLEGATION",
                "status": "CONTRADICTED",
                "evidence": [
                    {
                        "sourceId": "src_trustpilot2",
                        "url": "https://trustpilot.com/review/pincopallino.com",
                        "snippet": "They charge 20 quid for a laurel PNG and then take weeks to send it.",
                        "confidenceScore": 82,
                        "extractionDate": now_iso
                    }
                ]
            },
            {
                "id": "claim_9",
                "investigationId": DEMO_INVESTIGATION_ID,
                "researchDomain": "FEES",
                "category": "FEES_POLICY",
                "statement": "Festival grants fee waivers to local community centers and schools.",
                "claimKind": "FACT",
                "status": "SUPPORTED",
                "evidence": [
                    {
                        "sourceId": "src_ff",
                        "url": "https://filmfreeway.com/PincoPallino",
                        "snippet": "Free submissions for Tower Hamlets schools.",
                        "confidenceScore": 85,
                        "extractionDate": now_iso
                    }
                ]
            },
            {
                "id": "claim_10",
                "investigationId": DEMO_INVESTIGATION_ID,
                "researchDomain": "ORGANIZER",
                "category": "JURY_AWARDS",
                "statement": "Best Actor award was given to a jury member's relative.",
                "claimKind": "ALLEGATION",
                "status": "SUPPORTED",
                "evidence": [
                    {
                        "sourceId": "src_reddit",
                        "url": "https://reddit.com/r/Filmmakers/comments/zz",
                        "snippet": "The Best Actor winner was B. Jones' nephew. Unbelievable.",
                        "confidenceScore": 79,
                        "extractionDate": now_iso
                    }
                ]
            }
        ],

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
            },
            {
                "id": "src_reddit",
                "url": "https://reddit.com/r/Filmmakers/comments/xx",
                "domain": "reddit.com",
                "title": "Warning: Avoid Pinco Pallino Fest",
                "sourceTier": 3,
                "retrievedAt": now_iso,
                "excerpts": ["They ghosted me for 4 weeks after the notification date before sending a generic rejection."],
                "contentHash": "hash3"
            },
            {
                "id": "src_gazette",
                "url": "https://thegazette.co.uk/notice/2384",
                "domain": "thegazette.co.uk",
                "title": "Insolvency Notices",
                "sourceTier": 1,
                "retrievedAt": now_iso,
                "excerpts": ["Insolvency notice for A. Smith (trading as Pallino Media)."],
                "contentHash": "hash4"
            },
            {
                "id": "src_ff",
                "url": "https://filmfreeway.com/PincoPallino",
                "domain": "filmfreeway.com",
                "title": "Pinco Pallino Film Festival",
                "sourceTier": 2,
                "retrievedAt": now_iso,
                "excerpts": ["Upgrade to Platinum Review (£150) for a guaranteed decision within 48 hours.", "Early Bird: £28 for all categories.", "Extended Late Deadline: £85 (No waivers accepted)."],
                "contentHash": "hash5"
            },
            {
                "id": "src_twitter",
                "url": "https://twitter.com/ARRIChannel/status/123456",
                "domain": "twitter.com",
                "title": "ARRI Official Statement",
                "sourceTier": 1,
                "retrievedAt": now_iso,
                "excerpts": ["@PincoPallinoFest is not an official ARRI partner. We have requested logo removal."],
                "contentHash": "hash6"
            },
            {
                "id": "src_trustpilot",
                "url": "https://trustpilot.com/review/pincopallino.com",
                "domain": "trustpilot.com",
                "title": "Terrible Screening Experience",
                "sourceTier": 3,
                "retrievedAt": now_iso,
                "excerpts": ["Screening was literally just a projector in the basement of a pub. Sound cut out twice."],
                "contentHash": "hash7"
            }
        ],

        "dossier": {
            "executiveSummary": "Pinco Pallino Film Festival presents a highly concerning profile characterized by severe conflicts of interest, predatory fee structures, and fabricated industry affiliations. While the festival does hold legitimate physical screenings at verified locations (including BFI Southbank private hires), these events serve largely as a front for extractive financial practices.\n\nOur investigation uncovered that 3 key jury members concurrently operate a media consulting firm that actively upsells PR and distribution services to rejected applicants. Furthermore, the festival's claim of a hyper-competitive 1.2% acceptance rate is mathematically implausible and directly contradicted by anomalous award patterns, notably the same local director winning the top prize in consecutive years. Filmmakers should approach with extreme caution.",
            
            "festivalOverview": "Established 4 years ago in London, the Pinco Pallino Film Festival markets itself as a premier independent showcase for emerging global talent. It claims to receive over 3,000 submissions annually and boasts 'Official Platinum Sponsorships' from tier-1 industry giants like Sony Cinema and ARRI. \n\nHowever, these sponsorships have been publicly disavowed by the brands in question. The festival's primary revenue driver appears to be an aggressive submission fee escalation model, jumping from £28 to £85 in the final weeks, supplemented by a £150 'Expedited Judging' add-on. Screening logistics are verified, but community feedback describes them as disorganized and poorly attended.",
            
            "organizerProfile": "The entity is registered as 'Pinco Pallino Film CIC' via Companies House. The core leadership trio—A. Smith, B. Jones, and C. Davis—are listed as active directors. \n\nFinancial and corporate records reveal that these same directors are the sole proprietors of 'Pallino Media Lab Ltd.', a private consulting firm. Multiple whistleblower accounts from filmmakers indicate that within 48 hours of receiving a festival rejection letter, they receive unsolicited marketing emails from Pallino Media Lab offering paid 'distribution consultation' packages. Additionally, Director A. Smith holds an active insolvency notice filed in 2022.",
            
            "participantFeedback": "Aggregated sentiment across Reddit, TrustPilot, and FilmFreeway reviews is overwhelmingly negative, generating a high volume of community red flags. The most frequent complaint (42 independent reports) centers on severe communication blackouts, with filmmakers citing 3 to 5 week delays past the official notification date.\n\nSecondary complaints focus on the physical screening experience. Despite the prestigious venue names, filmmakers report that the actual screenings were relegated to secondary, unequipped basement rooms with frequent audio-visual failures and no attending industry professionals or press.",
            
            "unresolvedQuestions": [
                "Why was the 'Best International Short' awarded to the exact same director (Martin Sterling) in both 2024 and 2025?",
                "How does the festival acquire filmmaker contact information to use for third-party Pallino Media Lab marketing?",
                "Where is the £150 'Expedited Judging' fee going, given the reported 4-week communication delays?"
            ],
            "filmmakerChecklist": [
                "Avoid the £85 late fee deadline; it offers no marginal benefit.",
                "Do not purchase 'distribution consultation' services from Pallino Media Lab Ltd.",
                "Disregard the fabricated ARRI/Sony sponsorships when evaluating prestige.",
                "Expect a 3-5 week delay on all communication regarding submission status."
            ]
        },

        "deepVetting": {
            "festivalName": "Pinco Pallino Film Festival",
            "overallAuthenticityScore": 34,
            "totalFlags": 12,
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
                    "id": "dim_sponsors",
                    "dimensionKey": "INDUSTRY_AFFILIATION",
                    "title": "Corporate Sponsorship Integrity",
                    "category": "ORGANIZER_TRACK_RECORD",
                    "status": "RED_FLAG",
                    "confidenceScore": 98,
                    "summary": "Festival falsely claims ARRI and Sony as platinum sponsors.",
                    "signalsFound": ["ARRI public disavowal on Twitter", "No press releases from Sony"],
                    "corroboratingSources": ["twitter.com"],
                    "riskWeight": "HIGH"
                },
                {
                    "id": "dim_personnel",
                    "dimensionKey": "PERSONNEL_DOSSIER",
                    "title": "Key Personnel & Jury Dossiers",
                    "category": "ORGANIZER_TRACK_RECORD",
                    "status": "RED_FLAG",
                    "confidenceScore": 90,
                    "summary": "Key personnel cross-sell distribution services. Same filmmaker won in 2024 and 2025.",
                    "signalsFound": ["Companies House directorship overlap", "Repeat winner anomaly", "Insolvency notice"],
                    "corroboratingSources": ["gov.uk", "imdb.com", "thegazette.co.uk"],
                    "riskWeight": "HIGH"
                },
                {
                    "id": "dim_fees",
                    "dimensionKey": "FINANCIAL_MODEL",
                    "title": "Fee Structure & Revenue Generation",
                    "category": "FEES_POLICY",
                    "status": "AMBER_WARNING",
                    "confidenceScore": 88,
                    "summary": "Aggressive 200% late fee spikes and questionable £150 expedited judging add-ons.",
                    "signalsFound": ["£150 fast-track judging option", "£85 late fee", "No waivers policy"],
                    "corroboratingSources": ["filmfreeway.com"],
                    "riskWeight": "MEDIUM"
                },
                {
                    "id": "dim_feedback",
                    "dimensionKey": "FILMMAKER_SENTIMENT",
                    "title": "Community Sentiment & Feedback",
                    "category": "EXPERIENCE_FEEDBACK",
                    "status": "RED_FLAG",
                    "confidenceScore": 85,
                    "summary": "Consistent reports of 3-5 week communication delays and poor AV quality.",
                    "signalsFound": ["42 negative mentions of communication delays", "TrustPilot reports of AV failure"],
                    "corroboratingSources": ["reddit.com", "trustpilot.com"],
                    "riskWeight": "HIGH"
                }
            ],
            "keyPersonnel": [
                {
                    "name": "A. Smith",
                    "roles": ["Festival Director", "Co-Founder"],
                    "companies": ["Pinco Pallino Film CIC", "Pallino Media Lab Ltd"],
                    "associatedFestivals": ["Pinco Pallino"],
                    "isFestivalMillSuspect": True,
                    "hasDistributionOverlap": True,
                    "notes": "Co-director of Pallino Media Lab, aggressively upselling DCP packaging. Subject of a 2022 insolvency proceeding."
                },
                {
                    "name": "B. Jones",
                    "roles": ["Jury Chair"],
                    "companies": ["IndiePitch Consulting", "Pallino Media Lab Ltd"],
                    "associatedFestivals": [],
                    "isFestivalMillSuspect": False,
                    "hasDistributionOverlap": True,
                    "notes": "Jury chair offering paid pitch consulting to submitters within 48 hours of their rejection."
                },
                {
                    "name": "Martin Sterling",
                    "roles": ["Repeat Winner"],
                    "companies": ["Sterling Productions"],
                    "associatedFestivals": ["Pinco Pallino"],
                    "isFestivalMillSuspect": False,
                    "hasDistributionOverlap": False,
                    "notes": "Anomalous repeat winner of the top prize (2024, 2025) despite the festival's claimed 1.2% acceptance rate."
                }
            ],
            "generatedAt": now_iso
        }
    }
