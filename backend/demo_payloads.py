import asyncio
import json
from datetime import datetime, timezone
from typing import List, Dict, Any

DEMO_INVESTIGATION_ID = "demo_pinco_pallino"


def generate_demo_claims() -> List[Dict[str, Any]]:
    """Generates a comprehensive corpus of 363 atomic claims across all 6 core categories for Pinco Pallino."""
    core_claims = [
        {
            "id": "claim_1",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "FESTIVAL",
            "category": "VENUE_SCREENINGS",
            "statement": "The festival hosts physical screenings at Genesis Cinema (Studio 4) in East London with standard 2K DCP projection.",
            "claimKind": "FACT",
            "status": "CORROBORATED",
            "editionYear": 2024,
            "attributedTo": "Genesis Cinema Venue Hire Manifest & Festival Schedule",
            "evidence": [
                {
                    "sourceId": "src_genesis_manifest",
                    "sourceUrl": "https://genesiscinema.co.uk/events/2024-screenings/pinco-pallino",
                    "sourceDomain": "genesiscinema.co.uk",
                    "sourceTitle": "Genesis Cinema Events Booking Schedule",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Confirmed private screening hire for Studio 4 booked under Pinco Pallino Film CIC for Oct 12-14, 2024.",
                    "note": "Venue manifest confirms physical theatrical booking with DCP projection."
                },
                {
                    "sourceId": "src_ff_overview",
                    "sourceUrl": "https://www.filmfreeway.com/PincoPallinoFilmFestival",
                    "sourceDomain": "filmfreeway.com",
                    "sourceTitle": "Pinco Pallino London Submissions Overview",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Selected films screen theatrically at East London's historic Genesis Cinema in an intimate boutique setting followed by filmmaker Q&As.",
                    "note": "Promotional copy matches verified venue."
                }
            ]
        },
        {
            "id": "claim_2",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "PARTICIPANTS",
            "category": "EXPERIENCE_FEEDBACK",
            "statement": "Screenings take place in Studio 4, a boutique screening room with 40-seat capacity suited for networking and debut shorts.",
            "claimKind": "FACT",
            "status": "CORROBORATED",
            "editionYear": 2024,
            "attributedTo": "Filmmaker Community Forum & Venue Technical Specs",
            "evidence": [
                {
                    "sourceId": "src_reddit_reviews",
                    "sourceUrl": "https://www.reddit.com/r/Filmmakers/comments/18m2b1/pinco_pallino_festival_experience",
                    "sourceDomain": "reddit.com",
                    "sourceTitle": "r/Filmmakers - Anyone attended Pinco Pallino London?",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Attended with our short film. Studio 4 is cozy (around 40 velvet seats) and sound/projection was solid. Great bar networking afterwards, though only 2 badges per film.",
                    "note": "Firsthand filmmaker testimony confirms positive atmosphere with limited seating."
                }
            ]
        },
        {
            "id": "claim_3",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "ORGANIZER",
            "category": "LEGAL_IDENTITY",
            "statement": "Operating entity Pinco Pallino Film CIC (Company No. 13984712) is an active UK Community Interest Company registered in London.",
            "claimKind": "FACT",
            "status": "CORROBORATED",
            "editionYear": 2024,
            "attributedTo": "UK Companies House Public Register",
            "evidence": [
                {
                    "sourceId": "src_ch_filing",
                    "sourceUrl": "https://find-and-update.company-information.service.gov.uk/company/13984712",
                    "sourceDomain": "gov.uk",
                    "sourceTitle": "Companies House - Pinco Pallino Film CIC Filing History",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Pinco Pallino Film CIC (Company number 13984712): Active Community Interest Company. Annual confirmation statement and micro-entity accounts filed on time.",
                    "note": "Official corporate register confirms active non-profit status."
                }
            ]
        },
        {
            "id": "claim_4",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "ORGANIZER",
            "category": "ORGANIZER_TRACK_RECORD",
            "statement": "Festival Director Arthur Smith has curated four consecutive annual London editions with verifiable independent filmmaking credits.",
            "claimKind": "FACT",
            "status": "CORROBORATED",
            "editionYear": 2024,
            "attributedTo": "IMDb & Film London Public Listings",
            "evidence": [
                {
                    "sourceId": "src_film_london",
                    "sourceUrl": "https://filmlondon.org.uk/community-listings/pinco-pallino-2024",
                    "sourceDomain": "filmlondon.org.uk",
                    "sourceTitle": "Film London Community Cinema Listings",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Curated by London-based producer Arthur Smith, Pinco Pallino enters its fourth year supporting debut short filmmakers in East London.",
                    "note": "Regional screen agency confirms multi-year operational continuity."
                }
            ]
        },
        {
            "id": "claim_5",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "FEES",
            "category": "FEES_POLICY",
            "statement": "Submission fees progress from £28 Super Early Bird to £75 Late Deadline across short film categories.",
            "claimKind": "FACT",
            "status": "CORROBORATED",
            "editionYear": 2024,
            "attributedTo": "FilmFreeway Dates & Deadlines Schedule",
            "evidence": [
                {
                    "sourceId": "src_ff_rules",
                    "sourceUrl": "https://www.filmfreeway.com/PincoPallinoFilmFestival/dates-fees",
                    "sourceDomain": "filmfreeway.com",
                    "sourceTitle": "FilmFreeway Submission Rules & Deadline Schedule",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Submission Deadlines: Super Early Bird £28, Early Bird £38, Regular £55, Late £75, Extended £85. Student discount: £20.",
                    "note": "Published schedule reflects standard indie tier progression with a moderate late surge."
                }
            ]
        },
        {
            "id": "claim_6",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "ORGANIZER",
            "category": "JURY_AWARDS",
            "statement": "Jury panel comprises 5 working UK independent filmmakers and programmers using peer scoring.",
            "claimKind": "FACT",
            "status": "SUPPORTED",
            "editionYear": 2024,
            "attributedTo": "Official Festival Program & Jury Guide",
            "evidence": [
                {
                    "sourceId": "src_ff_overview",
                    "sourceUrl": "https://www.filmfreeway.com/PincoPallinoFilmFestival",
                    "sourceDomain": "filmfreeway.com",
                    "sourceTitle": "Pinco Pallino London Submissions Overview",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "All selected titles are evaluated by our rotating panel of 5 working UK independent filmmakers, writers, and guest curators.",
                    "note": "Evaluation is peer-reviewed rather than mechanized."
                }
            ]
        },
        {
            "id": "claim_7",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "ORGANIZER",
            "category": "JURY_AWARDS",
            "statement": "The 2024 Best Short winner 'The Echo Chamber' was selected by the jury and subsequently screened at regional UK festivals.",
            "claimKind": "FACT",
            "status": "CORROBORATED",
            "editionYear": 2024,
            "attributedTo": "Official Awards Archive & Letterboxd",
            "evidence": [
                {
                    "sourceId": "src_winners_archive",
                    "sourceUrl": "https://www.pincopallinofilmfestival.com/past-winners",
                    "sourceDomain": "pincopallinofilmfestival.com",
                    "sourceTitle": "Pinco Pallino Past Editions Winners Archive",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "2024 Best Narrative Short: 'The Echo Chamber' directed by Martin Sterling. Special Mention: 'Echoes in Amber' directed by Chloe Laurent.",
                    "note": "Official catalog records verified indie winners."
                }
            ]
        },
        {
            "id": "claim_8",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "ORGANIZER",
            "category": "ORGANIZER_TRACK_RECORD",
            "statement": "Festival promotional literature references community partnerships with local East London camera and post-production facilities.",
            "claimKind": "FACT",
            "status": "SUPPORTED",
            "editionYear": 2024,
            "attributedTo": "Festival Printed Program & Website",
            "evidence": [
                {
                    "sourceId": "src_ff_overview",
                    "sourceUrl": "https://www.filmfreeway.com/PincoPallinoFilmFestival",
                    "sourceDomain": "filmfreeway.com",
                    "sourceTitle": "Pinco Pallino London Submissions Overview",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Supported by East London creative spaces and local equipment rental partners providing in-kind filmmaker discount vouchers.",
                    "note": "Community-level grassroots partnerships verified."
                }
            ]
        },
        {
            "id": "claim_9",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "PARTICIPANTS",
            "category": "EXPERIENCE_FEEDBACK",
            "statement": "Filmmaker sentiment indicates responsive Q&A sessions, with occasional 1–2 week email response lags close to deadlines.",
            "claimKind": "FACT",
            "status": "SUPPORTED",
            "editionYear": 2024,
            "attributedTo": "Letterboxd & FilmFreeway Aggregated Reviews",
            "evidence": [
                {
                    "sourceId": "src_letterboxd_reviews",
                    "sourceUrl": "https://letterboxd.com/festival/pinco-pallino-2024",
                    "sourceDomain": "letterboxd.com",
                    "sourceTitle": "Letterboxd - Pinco Pallino 2024 Selected Shorts Reviews",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Community rating: 3.6/5 stars across 34 reviews. Praise for thoughtful Q&A moderation and screening quality; minor comments on email reply delays in August.",
                    "note": "Balanced user sentiment showing legitimate operations with minor logistical growing pains."
                }
            ]
        },
        {
            "id": "claim_10",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "FEES",
            "category": "FEES_POLICY",
            "statement": "Festival submission policy provides clear categories and standard non-refundable entry terms with student discounts.",
            "claimKind": "FACT",
            "status": "CORROBORATED",
            "editionYear": 2024,
            "attributedTo": "Official Submission Terms & Conditions",
            "evidence": [
                {
                    "sourceId": "src_ff_rules",
                    "sourceUrl": "https://www.filmfreeway.com/PincoPallinoFilmFestival/rules",
                    "sourceDomain": "filmfreeway.com",
                    "sourceTitle": "Pinco Pallino Rules & Terms",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Section 3.1: All submission fees are non-refundable once films enter programming review. Student concessions available upon institutional ID submission.",
                    "note": "Standard independent festival submission policy."
                }
            ]
        }
    ]

    claims = list(core_claims)

    venue_templates = [
        ("Genesis Cinema Studio 4 DCP server test completed for 2K short film projection block.", "FESTIVAL", "VENUE_SCREENINGS", "CORROBORATED", 2024),
        ("Genesis Cinema Studio 4 hosted 2024 edition short film blocks across October 12-14.", "FESTIVAL", "VENUE_SCREENINGS", "CORROBORATED", 2024),
        ("Genesis Cinema bar and lounge reserved for evening filmmaker networking reception.", "FESTIVAL", "VENUE_SCREENINGS", "CORROBORATED", 2024),
        ("BFI Southbank NFT3 was hired for a single 3-hour special guest retrospective block in 2024.", "FESTIVAL", "VENUE_SCREENINGS", "CORROBORATED", 2024),
        ("Watermans Arts Centre hosted 2022 edition with 110 recorded theater ticket admissions.", "FESTIVAL", "VENUE_SCREENINGS", "CORROBORATED", 2022),
        ("Genesis Cinema Studio 2 hosted 2023 edition short film competition block on October 15.", "FESTIVAL", "VENUE_SCREENINGS", "CORROBORATED", 2023),
        ("Private screening room capacity at Genesis Studio 4 is capped at 40 seats with 2 complimentary passes per director.", "FESTIVAL", "VENUE_SCREENINGS", "CORROBORATED", 2024),
        ("Projectionist logged clear 5.1 audio playback during short film competition blocks.", "PARTICIPANTS", "VENUE_SCREENINGS", "SUPPORTED", 2024),
        ("Rich Mix Cinema held initial booking discussions for 2025 expansion, pending scheduling.", "FESTIVAL", "VENUE_SCREENINGS", "SUPPORTED", 2025),
        ("Genesis Cinema box office confirmed on-site ticket sales for public attendance blocks.", "FESTIVAL", "VENUE_SCREENINGS", "CORROBORATED", 2024),
    ]

    corporate_templates = [
        ("Pinco Pallino Film CIC registered as Community Interest Company in London.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2022),
        ("Registered office at 71-75 Shelton Street, Covent Garden, a standard central London business mailbox.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2022),
        ("Annual confirmation statement and micro-entity accounts filed on time with Companies House.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2024),
        ("Director Arthur Smith listed with UK resident status and verified producer credits.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2022),
        ("Articles of Association declare asset lock dedicating surplus funds to grassroots filmmaker initiatives.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2022),
        ("Previous commercial shell Pallino Media Lab Ltd dissolved in 2024 to consolidate all operations under the non-profit CIC.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2024),
        ("Public liability insurance policy active for London cinema screening dates.", "ORGANIZER", "LEGAL_IDENTITY", "SUPPORTED", 2024),
        ("Event licensing coordinated in accordance with Tower Hamlets municipal cinema regulations.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2024),
        ("FilmFreeway Gold Festival status maintained based on positive user reviews.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2024),
        ("Bank account held with registered UK clearing bank under Community Interest Company name.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2024),
    ]

    fees_templates = [
        ("Super Early Bird fee set at £28 for short films under 20 minutes.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Early Bird fee set at £38 for regular short film competition categories.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Regular submission deadline fee set at £55 across narrative and documentary categories.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Late deadline fee increased to £75 during the final 3 weeks before submissions close.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Student category discount offered at £20 with verified institutional ID.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Standard laurel package provided in high-resolution digital format at zero additional charge.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Optional engraved physical award statuette offered for winners requesting physical keepsake (£65).", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Filmmaker pass includes admission for 2 team members to all screened competition blocks.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Clear refund policy states entry fees are non-refundable once films enter programming review.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Festival rules clearly outline technical delivery specifications for accepted DCP files.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
    ]

    jury_templates = [
        ("Jury panel comprises 5 independent filmmakers with active UK industry credits.", "ORGANIZER", "JURY_AWARDS", "SUPPORTED", 2024),
        ("Jury scoring rubric evaluates narrative structure, cinematography, and original voice.", "ORGANIZER", "JURY_AWARDS", "SUPPORTED", 2024),
        ("Grand Jury Prize for Best Narrative Short awarded to 'The Echo Chamber' in 2024 edition.", "ORGANIZER", "JURY_AWARDS", "CORROBORATED", 2024),
        ("Best Documentary Short awarded to 'Under The Flyover' by Sarah Jenkins in 2023 edition.", "ORGANIZER", "JURY_AWARDS", "CORROBORATED", 2023),
        ("Filmmaker Q&A sessions moderated by jury members following each screening block.", "ORGANIZER", "JURY_AWARDS", "CORROBORATED", 2024),
        ("Guest programmer recused from scoring category where a former short film collaborator was nominated.", "ORGANIZER", "JURY_AWARDS", "SUPPORTED", 2024),
        ("Jury selections announced via official press release and FilmFreeway portal.", "ORGANIZER", "JURY_AWARDS", "CORROBORATED", 2024),
        ("Best Cinematography award presented in partnership with local equipment hire facility.", "ORGANIZER", "JURY_AWARDS", "CORROBORATED", 2024),
        ("Audience Choice award voted via ticket-holder ballots at Genesis Cinema box office.", "FESTIVAL", "JURY_AWARDS", "CORROBORATED", 2024),
        ("Program longlist curated by screening committee before final jury deliberation.", "ORGANIZER", "JURY_AWARDS", "SUPPORTED", 2024),
    ]

    sentiment_templates = [
        ("Letterboxd reviews for 2024 selected shorts show positive community feedback (average 3.6/5).", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "SUPPORTED", 2024),
        ("Filmmakers on Reddit r/Filmmakers describe festival as good London networking for debut directors.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "SUPPORTED", 2024),
        ("Attendees note lively post-screening drinks and networking at Genesis Cinema Bar.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "CORROBORATED", 2024),
        ("Submitters note communication can take 10-14 days during final deadline rush.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "SUPPORTED", 2024),
        ("Selected directors report high satisfaction with DCP projection quality and sound mix in Studio 4.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "CORROBORATED", 2024),
        ("Feedback suggests advance ticket reservations are essential due to 40-seat screening room.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "CORROBORATED", 2024),
        ("Debut directors highlight helpful networking connections made with local London crew.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "SUPPORTED", 2024),
        ("Event photography shared widely on social media with active filmmaker engagement.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "CORROBORATED", 2024),
        ("Submitters recommend entering early to avoid the £75 late submission deadline fee.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "SUPPORTED", 2024),
        ("Filmmakers appreciate thoughtful program curation grouping thematically aligned shorts.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "SUPPORTED", 2024),
    ]

    milestone_templates = [
        ("Inaugural 2021 virtual edition hosted online screenings during pandemic period.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2021),
        ("2022 edition transitioned to in-person screenings at Watermans Arts Centre.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2022),
        ("2023 edition partnered with Genesis Cinema Studio 2 in East London.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2023),
        ("2024 edition screened 24 shorts across 3 days at Genesis Cinema Studio 4.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2024),
        ("Digital festival program published with director bios and synopsis for each title.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2024),
        ("2025 Call for Entries launched on FilmFreeway with 4 submission phases.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2025),
        ("Official festival trailer published on YouTube highlighting past selected filmmakers.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2024),
        ("Festival poster and program branding designed by local London graphic artist.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2024),
        ("Panel discussion on low-budget distribution hosted during 2024 weekend program.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2024),
        ("Festival joined the London Independent Cinema Network for regional cross-promotion.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2024),
    ]

    all_templates = (
        venue_templates * 7 +
        corporate_templates * 7 +
        fees_templates * 7 +
        jury_templates * 6 +
        sentiment_templates * 6 +
        milestone_templates * 5
    )

    for i, (stmt, domain, cat, status, yr) in enumerate(all_templates[:353], start=11):
        cid = f"claim_{i}"
        claims.append({
            "id": cid,
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": domain,
            "category": cat,
            "statement": f"{stmt}",
            "claimKind": "FACT",
            "status": status,
            "editionYear": yr,
            "attributedTo": f"Public Record & Corroboration #{i}",
            "evidence": [
                {
                    "sourceId": f"src_evidence_{i}",
                    "sourceUrl": "https://genesiscinema.co.uk/events/archive" if domain == "FESTIVAL" else ("https://find-and-update.company-information.service.gov.uk" if domain == "ORGANIZER" else "https://filmfreeway.com"),
                    "sourceDomain": "genesiscinema.co.uk" if domain == "FESTIVAL" else ("gov.uk" if domain == "ORGANIZER" else "filmfreeway.com"),
                    "sourceTitle": f"Corroboration Record #{i}",
                    "stance": "SUPPORTS" if status != "DISPUTED" else "CONTRADICTS",
                    "exactExcerpt": stmt,
                    "note": f"Extracted due diligence claim node #{i}."
                }
            ]
        })

    return claims


def get_demo_investigation():
    now_iso = datetime.now(timezone.utc).isoformat()
    candidate = {
        "id": "cand_pinco_1",
        "name": "Pinco Pallino Film Festival",
        "entityType": "FESTIVAL",
        "cityCountry": "London, UK",
        "foundedYear": 2021,
        "descriptor": "An emerging independent film festival hosting theatrical screenings at Genesis Cinema in East London.",
        "sourceIds": [],
        "officialDomain": "pincopallinofilmfestival.com",
    }
    return {
        "id": DEMO_INVESTIGATION_ID,
        "status": "PLANNING",
        "query": "Pinco Pallino Film Festival",
        "intent": "Vet before submitting",
        "createdAt": now_iso,
        "updatedAt": now_iso,
        "candidates": [candidate],
        "confirmedEntity": candidate,
        "sourcesCount": 0,
        "claimsCount": 0,
        "disputes": [],
    }


async def demo_sse_generator():
    """Generates a 25-second simulated live-progress SSE stream for Demo Mode (5s per stage)."""

    def format_event(event_type: str, message: str, details: dict = None, agent: str = "DemoOrchestrator"):
        payload = {
            "id": "evt_demo",
            "investigationId": DEMO_INVESTIGATION_ID,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "eventType": event_type,
            "agentName": agent,
            "message": message,
            "details": details or {},
        }
        return f"data: {json.dumps(payload)}\n\n"

    # Stage 1: Strategy & Planning / Disambiguation (0s - 5s)
    yield format_event("PLANNING_STARTED", "Formulating parallel investigation strategy across 3 core domains...", agent="DemoOrchestrator")
    await asyncio.sleep(2.5)
    yield format_event("PLANNING_STEP", "Entity Disambiguated: Verified Pinco Pallino Film Festival (Genesis Cinema, London).", {"queriesCount": 12, "sourcesCount": 14}, agent="Disambiguator")
    await asyncio.sleep(2.5)

    # Stage 2: Parallel Search / Data Fetch (5s - 10s)
    yield format_event("DOMAIN_SEARCH_STARTED", "Dispatching parallel sub-agents across 42 public and commercial sources...", {"sourcesCount": 42, "queriesCount": 12}, agent="ParallelSearch")
    await asyncio.sleep(2.0)
    yield format_event("AGENT_UPDATE", "VenueAgent: Harvested Genesis Cinema box office manifests and Studio 4 technical specs.", {"agent": "VenueAgent", "sourcesCount": 24, "claimsCount": 85}, agent="VenueAgent")
    await asyncio.sleep(1.5)
    yield format_event("AGENT_UPDATE", "CorporateAgent: Verified Companies House filings for Pinco Pallino Film CIC.", {"agent": "CorporateAgent", "sourcesCount": 32, "claimsCount": 160}, agent="CorporateAgent")
    await asyncio.sleep(1.5)

    # Stage 3: Claim & Evidence Extraction (10s - 15s)
    yield format_event("CLAIMS_EXTRACTING", "Extracting atomic claims and verbatim quotes from 42 harvested sources...", {"sourcesCount": 42, "claimsCount": 210}, agent="ClaimExtractor")
    await asyncio.sleep(2.5)
    yield format_event("AGENT_UPDATE", "ClaimExtractor: Corroborated 363 atomic claims against primary documents and registry filings.", {"agent": "ClaimExtractor", "sourcesCount": 42, "claimsCount": 363}, agent="ClaimExtractor")
    await asyncio.sleep(2.5)

    # Stage 4: Contradiction Analysis & Forensics (15s - 20s)
    yield format_event("CONTRADICTIONS_ANALYZING", "Cross-referencing 363 atomic claims against public registers and market baselines...", {"sourcesCount": 42, "claimsCount": 363, "contradictionsCount": 2}, agent="ContradictionAnalyst")
    await asyncio.sleep(2.5)
    yield format_event("AGENT_UPDATE", "ForensicScorer: Flagged fee escalation anomaly (+168% surge) and virtual registered address at 71-75 Shelton St.", {"agent": "ForensicScorer", "sourcesCount": 42, "claimsCount": 363, "contradictionsCount": 2}, agent="ForensicScorer")
    await asyncio.sleep(2.5)

    # Stage 5: Report Synthesis & Risk Scoring (20s - 25s)
    yield format_event("DOSSIER_SYNTHESIZING", "Assembling finalized evidence dossier with 42 verified sources and risk index...", {"sourcesCount": 42, "claimsCount": 363, "contradictionsCount": 2}, agent="DossierSynthesizer")
    await asyncio.sleep(2.5)
    yield format_event("AGENT_UPDATE", "ExecutiveSummaryAgent: Generated multi-domain due diligence dossier. Overall Authenticity Score: 68/100.", {"agent": "ExecutiveSummaryAgent", "sourcesCount": 42, "claimsCount": 363}, agent="ExecutiveSummaryAgent")
    await asyncio.sleep(2.5)

    # Complete (25s)
    yield format_event("DOSSIER_READY", "Investigation complete. Generating final due diligence dossier.", {"sourcesCount": 42, "claimsCount": 363, "contradictionsCount": 2}, agent="DossierSynthesizer")


def get_demo_full_dossier():
    """Returns the finalized, realistic mock investigation state for Pinco Pallino."""
    now_iso = datetime.now(timezone.utc).isoformat()
    claims = generate_demo_claims()
    
    return {
        "id": DEMO_INVESTIGATION_ID,
        "status": "READY",
        "createdAt": now_iso,
        "updatedAt": now_iso,
        "candidates": get_demo_investigation()["candidates"],
        "confirmedEntity": get_demo_investigation()["candidates"][0],
        "sourcesCount": 42,
        "claimsCount": len(claims),
        "premiereRisk": {
            "riskScore": 45,
            "riskLevel": "MODERATE_CAUTION",
            "premiereDemand": "London / Regional Premiere Preferred (Flexible)",
            "accreditationStatus": "Independent Grassroots Showcase (Non-BAFTA Qualifying)",
            "buyerPressFootprint": "Emerging film bloggers, Film London community dispatch, local indie press",
            "verdictRationale": "A legitimate, grassroots London independent festival with real theatrical screenings. However, because it is not BAFTA-qualifying and trade buyers are limited, filmmakers should avoid burning a World or UK Premiere here if targeting major Tier-1 festivals.",
            "recommendation": "Recommended for UK debut shorts and London networking under Early Bird tiers. If targeting Tier-1 festivals, retain World Premiere status."
        },
        "feeEscalation": {
            "currency": "£",
            "tiers": [
                {"tierName": "Super Early Bird", "amount": 28, "currency": "£", "deadlineDate": "15 Jan 2024", "surgePercentage": 0},
                {"tierName": "Early Bird", "amount": 38, "currency": "£", "deadlineDate": "1 Mar 2024", "surgePercentage": 35},
                {"tierName": "Regular Deadline", "amount": 55, "currency": "£", "deadlineDate": "15 May 2024", "surgePercentage": 96},
                {"tierName": "Late Deadline", "amount": 75, "currency": "£", "deadlineDate": "1 Aug 2024", "surgePercentage": 168},
                {"tierName": "Extended / Last Chance", "amount": 85, "currency": "£", "deadlineDate": "15 Sep 2024", "surgePercentage": 203}
            ],
            "spikeAlert": "Moderate fee increase in late submission windows (£28 -> £75). Early submission recommended.",
            "averageMarketFee": "£32 average for UK indie short film entries",
            "percentile": 65
        },
        "forensicSummary": {
            "scamPattern": {
                "status": "AMBER_WARNING",
                "headline": "Grassroots Operational Footprint",
                "summary": "Pinco Pallino operates through Pinco Pallino Film CIC, an active UK Community Interest Company. Its registered address at 71-75 Shelton Street is a shared central London commercial address, common among early-stage arts organizations. Annual filings are maintained and up to date.",
                "educationalContext": "Community Interest Companies (CICs) are regulated UK non-profit entities with an asset lock. While a shared virtual office is common for emerging festivals, filmmakers should confirm physical event venues.",
                "signals": [
                    "Active UK Community Interest Company (Pinco Pallino Film CIC)",
                    "Registered office at 71-75 Shelton Street shared commercial address",
                    "Previous trading entity dissolved in 2024 to consolidate non-profit CIC operations"
                ],
                "relatedEntities": ["Pinco Pallino Film CIC", "Pallino Media Lab Ltd", "Genesis Cinema Studio 4"]
            },
            "juryConflict": {
                "status": "AMBER_WARNING",
                "headline": "Informal Jury & Programming Governance",
                "summary": "The jury consists of working UK independent filmmakers and programmers. While selections are peer-reviewed, the festival relies on informal recusal rather than an automated blind-scoring portal. An associate producer screened a short in an earlier non-competitive showcase in 2023.",
                "educationalContext": "Grassroots festivals often draw jurors from their local filmmaker community. Transparent recusal policies ensure impartial scoring.",
                "signals": [
                    "Jury members have active independent production credits",
                    "Informal recusal protocols rather than blind evaluation software",
                    "2023 showcase included an associate producer's non-competitive short"
                ],
                "relatedEntities": ["Arthur Smith", "Benjamin Jones", "Genesis Cinema Studio 4"]
            },
            "venueReality": {
                "status": "AMBER_WARNING",
                "headline": "Boutique Screening Room vs. Gala Marketing",
                "summary": "The festival delivers authentic physical screenings at Genesis Cinema (Studio 4) in East London with verified 2K DCP projection and enthusiastic filmmaker attendance. However, marketing references to 'London Gala Showcases' should be understood as an intimate 40-seat boutique screening room rather than a West End palace.",
                "educationalContext": "Boutique cinema rentals provide genuine big-screen DCP projection and intimate peer networking, but filmmakers should expect limited crew ticket allocations.",
                "signals": [
                    "Verified physical DCP screenings at Genesis Cinema Studio 4",
                    "Intimate 40-seat auditorium capacity",
                    "One-off 3-hour private hire at BFI Southbank NFT3 in 2024"
                ],
                "relatedEntities": ["Genesis Cinema Studio 4", "BFI Southbank NFT3"]
            }
        },
        
        "disputes": [
            {
                "id": "disp_venue",
                "pointOfContention": "Screening Scope & Room Capacity",
                "category": "VENUE_SCREENINGS",
                "claimA": "Promotional headlines advertise London cinema showcase on the big screen.",
                "evidenceA": [
                    {
                        "sourceId": "src_ff_promo",
                        "sourceUrl": "https://filmfreeway.com/PincoPallinoFilmFestival",
                        "sourceDomain": "filmfreeway.com",
                        "sourceTitle": "FilmFreeway Promotional Headline",
                        "stance": "SUPPORTS",
                        "exactExcerpt": "Screen your film on the big screen in vibrant East London with live Q&A.",
                        "snippet": "Screen your film on the big screen in vibrant East London with live Q&A."
                    }
                ],
                "claimB": "Physical screenings take place in Genesis Cinema Studio 4, a boutique screening room with 40-seat capacity.",
                "evidenceB": [
                    {
                        "sourceId": "src_genesis_manifest",
                        "sourceUrl": "https://genesiscinema.co.uk/events/2024-screenings/pinco-pallino",
                        "sourceDomain": "genesiscinema.co.uk",
                        "sourceTitle": "Genesis Cinema Events Booking Schedule",
                        "stance": "CONTRADICTS",
                        "exactExcerpt": "Confirmed private screening hire for Studio 4 (40 luxury armchair capacity) booked for Oct 12-14, 2024.",
                        "snippet": "Confirmed private screening hire for Studio 4 (40 luxury armchair capacity) booked for Oct 12-14, 2024."
                    }
                ],
                "guidance": "Expectation Management. Physical screenings are authentic with verified DCP projection, but seating capacity is intimate."
            },
            {
                "id": "disp_fees",
                "pointOfContention": "Late Deadline Fee Markup",
                "category": "FEES_POLICY",
                "claimA": "Early bird entry fee is accessible at £28 for short films.",
                "evidenceA": [
                    {
                        "sourceId": "src_ff_fees",
                        "sourceUrl": "https://filmfreeway.com/PincoPallinoFilmFestival",
                        "sourceDomain": "filmfreeway.com",
                        "sourceTitle": "FilmFreeway - Pinco Pallino Entry Fees",
                        "stance": "SUPPORTS",
                        "exactExcerpt": "Super Early Bird Deadline: £28 for all short film categories.",
                        "snippet": "Super Early Bird Deadline: £28 for all short film categories."
                    }
                ],
                "claimB": "Late deadline fee escalates to £75 in the final weeks before submissions close.",
                "evidenceB": [
                    {
                        "sourceId": "src_ff_late",
                        "sourceUrl": "https://filmfreeway.com/PincoPallinoFilmFestival/dates-fees",
                        "sourceDomain": "filmfreeway.com",
                        "sourceTitle": "FilmFreeway - Pinco Pallino Late Deadline Breakdown",
                        "stance": "CONTRADICTS",
                        "exactExcerpt": "Late Deadline: £75 for short films. Extended: £85.",
                        "snippet": "Late Deadline: £75 for short films. Extended: £85."
                    }
                ],
                "guidance": "Advisory Note. Standard late fee surge; filmmakers should submit early to maximize budget value."
            }
        ],

        "claims": claims,

        "sources": [
            {
                "id": "src_genesis_manifest",
                "url": "https://genesiscinema.co.uk/events/2024-screenings/pinco-pallino",
                "domain": "genesiscinema.co.uk",
                "title": "Genesis Cinema Events Booking Schedule & Technical Specs",
                "sourceTier": 1,
                "retrievedAt": now_iso,
                "excerpts": ["Confirmed private screening hire for Studio 4 booked under Pinco Pallino Film CIC for Oct 12-14, 2024."],
                "contentHash": "hash_gen_1"
            },
            {
                "id": "src_ch_filing",
                "url": "https://find-and-update.company-information.service.gov.uk/company/13984712",
                "domain": "gov.uk",
                "title": "Companies House - Pinco Pallino Film CIC Filing History",
                "sourceTier": 1,
                "retrievedAt": now_iso,
                "excerpts": ["Pinco Pallino Film CIC (Company number 13984712): Active Community Interest Company with up-to-date micro-entity filings."],
                "contentHash": "hash_ch_2"
            },
            {
                "id": "src_ff_overview",
                "url": "https://www.filmfreeway.com/PincoPallinoFilmFestival",
                "domain": "filmfreeway.com",
                "title": "FilmFreeway - Pinco Pallino London Submissions Overview",
                "sourceTier": 2,
                "retrievedAt": now_iso,
                "excerpts": ["Selected films screen theatrically at East London's historic Genesis Cinema in an intimate boutique setting."],
                "contentHash": "hash_ff_3"
            },
            {
                "id": "src_ff_rules",
                "url": "https://www.filmfreeway.com/PincoPallinoFilmFestival/dates-fees",
                "domain": "filmfreeway.com",
                "title": "FilmFreeway - Submission Rules & Deadlines",
                "sourceTier": 2,
                "retrievedAt": now_iso,
                "excerpts": ["Submission Deadlines: Super Early Bird £28, Early Bird £38, Regular £55, Late £75, Extended £85."],
                "contentHash": "hash_ff_4"
            },
            {
                "id": "src_reddit_reviews",
                "url": "https://www.reddit.com/r/Filmmakers/comments/18m2b1/pinco_pallino_festival_experience",
                "domain": "reddit.com",
                "title": "r/Filmmakers - Anyone attended Pinco Pallino London?",
                "sourceTier": 3,
                "retrievedAt": now_iso,
                "excerpts": ["Studio 4 is cozy (around 40 velvet seats) and sound/projection was solid. Great bar networking afterwards."],
                "contentHash": "hash_red_5"
            },
            {
                "id": "src_letterboxd_reviews",
                "url": "https://letterboxd.com/festival/pinco-pallino-2024",
                "domain": "letterboxd.com",
                "title": "Letterboxd - Pinco Pallino Festival Selected Shorts Reviews",
                "sourceTier": 3,
                "retrievedAt": now_iso,
                "excerpts": ["Community rating: 3.6/5 stars across 34 reviews. Praise for thoughtful Q&A moderation and screening quality."],
                "contentHash": "hash_let_6"
            },
            {
                "id": "src_winners_archive",
                "url": "https://www.pincopallinofilmfestival.com/past-winners",
                "domain": "pincopallinofilmfestival.com",
                "title": "Pinco Pallino Past Editions Winners Archive",
                "sourceTier": 2,
                "retrievedAt": now_iso,
                "excerpts": ["2024 Best Narrative Short: 'The Echo Chamber' directed by Martin Sterling."],
                "contentHash": "hash_win_7"
            },
            {
                "id": "src_film_london",
                "url": "https://filmlondon.org.uk/community-listings/pinco-pallino-2024",
                "domain": "filmlondon.org.uk",
                "title": "Film London Community Cinema Listings",
                "sourceTier": 1,
                "retrievedAt": now_iso,
                "excerpts": ["Pinco Pallino enters its fourth year supporting debut short filmmakers in East London."],
                "contentHash": "hash_fl_8"
            }
        ],

        "dossier": {
            "executiveSummary": "Pinco Pallino Film Festival presents a typical emerging grassroots profile: an authentic, independently organized London showcase with genuine physical cinema screenings and positive community networking, tempered by a few standard indie limitations.\n\nOur investigation confirmed physical DCP screenings at Genesis Cinema (Studio 4) in East London, active UK corporate registration (Pinco Pallino Film CIC), and verifiable past alumni credits on IMDb. Key points of attention include intimate venue capacity (40 seats), a notable late-entry fee markup (£28 to £75), and an informal programming committee. Overall, it serves as a credible local showcase for emerging directors under early-bird submission tiers.",
            
            "festivalOverview": "Established in 2021 in London, the Pinco Pallino Film Festival is an annual multi-day indie event celebrating debut shorts and grassroots cinema. Over four editions, it has screened more than 80 independent short films and features, centered around East London's Genesis Cinema.\n\nThe festival operates transparent submission deadlines on FilmFreeway. Audience attendance is community-driven, offering valuable peer networking for debut creators, though buyer and major trade press presence remains modest.",
            
            "organizerProfile": "The festival is organized by Pinco Pallino Film CIC (UK Community Interest Company No. 13984712), directed by Arthur Smith and programmer Benjamin Jones. Both hold verifiable independent filmmaking and community cinema curation credits.\n\nPublic records show the Community Interest Company is active and compliant with annual micro-entity filings. A previous commercial vehicle (Pallino Media Lab Ltd) was dissolved in 2024 to centralize all festival operations under the non-profit CIC.",
            
            "participantFeedback": "Filmmaker sentiment across FilmFreeway, Letterboxd, and Reddit r/Filmmakers is broadly balanced (3.6/5 average). Attendees consistently praise the welcoming atmosphere, physical Q&As, and Genesis Cinema bar networking.\n\nConstructive feedback primarily cites communication latency during peak submission windows (1–2 week reply delays) and limited ticket allocations for filmmakers' extended crews due to the 40-seat auditorium size.",
            
            "corporateEntity": {
                "legalName": "Pinco Pallino Film CIC",
                "registrationNumber": "13984712",
                "status": "Active Community Interest Company",
                "incorporationDate": "12 April 2022",
                "registeredAddress": "71-75 Shelton Street, London, WC2H 9JQ, UK",
                "associatedFestivals": ["Pinco Pallino Film Festival", "East London Short Film Showcase"],
                "connectedEntities": ["Pallino Media Lab Ltd", "East London Filmmakers Collective"],
                "flags": [
                    "Virtual Mailbox Registered Address (Shelton Street)",
                    "Sole Director Structure"
                ],
                "notes": "Registered as a UK Community Interest Company with statutory asset lock. Annual accounts and confirmation statements are up to date."
            },

            "unresolvedQuestions": [
                "Will physical screening allocations expand beyond Studio 4 for the upcoming edition?",
                "Does the festival plan to implement a formalized blind jury evaluation rubric for student categories?",
                "What proportion of selected filmmakers receive complimentary festival passes?"
            ],
            "filmmakerChecklist": [
                "Submit during Super Early Bird or Early Bird windows (£28–£38) for best value.",
                "Confirm screening room technical specs (Studio 4 DCP 2K projection) with organizers.",
                "Reserve screening tickets early due to intimate 40-seat auditorium capacity.",
                "Retain World Premiere status if targeting Tier-1 BAFTA-qualifying festivals."
            ],
            "previousEditions": [
                {
                    "year": 2024,
                    "editionNumber": "4th Annual Edition",
                    "heldLocation": "Genesis Cinema (Studio 4), London",
                    "heldDates": "October 12-14, 2024",
                    "awards": [
                        {
                            "awardName": "Grand Jury Prize (Best Narrative Short)",
                            "winnerTitle": "The Echo Chamber",
                            "recipientName": "Martin Sterling",
                            "recipientAvatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
                            "winnerUrl": "https://www.imdb.com/title/tt2948194",
                            "imdbUrl": "https://www.imdb.com/name/nm5829104"
                        },
                        {
                            "awardName": "Best Cinematography Short",
                            "winnerTitle": "Echoes in Amber",
                            "recipientName": "Chloe Laurent",
                            "recipientAvatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
                            "winnerUrl": "https://chloelaurentfilm.com",
                            "imdbUrl": "https://www.imdb.com/name/nm8920141"
                        },
                        {
                            "awardName": "Special Director's Discovery Award",
                            "winnerTitle": "Submerged Voices",
                            "recipientName": "Tariq Mansoor",
                            "recipientAvatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
                            "winnerUrl": "https://www.imdb.com/title/tt3819201",
                            "imdbUrl": "https://www.imdb.com/name/nm7418290"
                        }
                    ],
                    "pressCoverage": [
                        {
                            "headline": "London Grassroots Showcase Highlights Emerging Short Filmmakers",
                            "publisher": "Film London News",
                            "url": "https://filmlondon.org.uk"
                        },
                        {
                            "headline": "East London Indie Shorts Celebrate Community Screening",
                            "publisher": "British Film Review",
                            "url": "https://www.britishfilmreview.co.uk"
                        }
                    ],
                    "notes": "Official catalog listed 24 screened shorts across 3 blocks. Strong attendance with lively Q&A panels."
                },
                {
                    "year": 2023,
                    "editionNumber": "3rd Annual Edition",
                    "heldLocation": "Genesis Cinema (Studio 2), London",
                    "heldDates": "October 15-16, 2023",
                    "awards": [
                        {
                            "awardName": "Grand Jury Prize (Best Narrative Short)",
                            "winnerTitle": "Fading Horizon",
                            "recipientName": "Oliver Finch",
                            "recipientAvatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
                            "winnerUrl": "https://www.imdb.com/title/tt1928472",
                            "imdbUrl": "https://www.imdb.com/name/nm4829102"
                        },
                        {
                            "awardName": "Best Student Documentary",
                            "winnerTitle": "Under The Flyover",
                            "recipientName": "Sarah Jenkins",
                            "recipientAvatarUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
                            "winnerUrl": "https://sarahjenkinsdocs.co.uk",
                            "imdbUrl": "https://www.imdb.com/name/nm6391024"
                        }
                    ],
                    "pressCoverage": [
                        {
                            "headline": "Pinco Pallino Festival 2023 Concludes in East London",
                            "publisher": "Film London News",
                            "url": "https://filmlondon.org.uk"
                        }
                    ],
                    "notes": "Early bird entries accounted for 65% of submitted catalog."
                },
                {
                    "year": 2022,
                    "editionNumber": "2nd Annual Edition",
                    "heldLocation": "The Watermans Arts Centre, Brentford, London",
                    "heldDates": "November 5-6, 2022",
                    "awards": [
                        {
                            "awardName": "Best UK Independent Short",
                            "winnerTitle": "Thames Drift",
                            "recipientName": "Chloe Laurent",
                            "recipientAvatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
                            "winnerUrl": "https://chloelaurentfilm.com",
                            "imdbUrl": "https://www.imdb.com/name/nm8920141"
                        }
                    ],
                    "pressCoverage": [
                        {
                            "headline": "Emerging Voices Screen at Watermans Centre",
                            "publisher": "British Film Review",
                            "url": "https://www.britishfilmreview.co.uk"
                        }
                    ],
                    "notes": "Inaugural physical screening following the 2021 virtual pandemic launch."
                }
            ],

            "premiereRisk": {
                "riskScore": 45,
                "riskLevel": "MODERATE_CAUTION",
                "premiereDemand": "London / Regional Premiere Preferred (Flexible)",
                "accreditationStatus": "Independent Grassroots Showcase (Non-BAFTA Qualifying)",
                "buyerPressFootprint": "Emerging film bloggers, Film London community dispatch, local indie press",
                "verdictRationale": "A legitimate, grassroots London independent festival with real theatrical screenings. However, because it is not BAFTA-qualifying and trade buyers are limited, filmmakers should avoid burning a World or UK Premiere here if targeting major Tier-1 festivals.",
                "recommendation": "Recommended for UK debut shorts and London networking under Early Bird tiers. If targeting Tier-1 festivals, retain World Premiere status."
            },

            "feeEscalation": {
                "currency": "£",
                "tiers": [
                    {"tierName": "Super Early Bird", "amount": 28, "currency": "£", "deadlineDate": "15 Jan 2024", "surgePercentage": 0},
                    {"tierName": "Early Bird", "amount": 38, "currency": "£", "deadlineDate": "1 Mar 2024", "surgePercentage": 35},
                    {"tierName": "Regular Deadline", "amount": 55, "currency": "£", "deadlineDate": "15 May 2024", "surgePercentage": 96},
                    {"tierName": "Late Deadline", "amount": 75, "currency": "£", "deadlineDate": "1 Aug 2024", "surgePercentage": 168},
                    {"tierName": "Extended / Last Chance", "amount": 85, "currency": "£", "deadlineDate": "15 Sep 2024", "surgePercentage": 203}
                ],
                "spikeAlert": "Moderate fee increase in late submission windows (£28 -> £75). Early submission recommended.",
                "averageMarketFee": "£32 average for UK indie short film entries",
                "percentile": 65
            },

            "forensicSummary": {
                "scamPattern": {
                    "status": "AMBER_WARNING",
                    "headline": "Grassroots Operational Footprint",
                    "summary": "Pinco Pallino operates through Pinco Pallino Film CIC, an active UK Community Interest Company. Its registered address at 71-75 Shelton Street is a shared central London commercial address, common among early-stage arts organizations. Annual filings are maintained and up to date.",
                    "educationalContext": "Community Interest Companies (CICs) are regulated UK non-profit entities with an asset lock. While a shared virtual office is common for emerging festivals, filmmakers should confirm physical event venues.",
                    "signals": [
                        "Active UK Community Interest Company (Pinco Pallino Film CIC)",
                        "Registered office at 71-75 Shelton Street shared commercial address",
                        "Previous trading entity dissolved in 2024 to consolidate non-profit CIC operations"
                    ],
                    "relatedEntities": ["Pinco Pallino Film CIC", "Pallino Media Lab Ltd", "Genesis Cinema Studio 4"]
                },
                "juryConflict": {
                    "status": "AMBER_WARNING",
                    "headline": "Informal Jury & Programming Governance",
                    "summary": "The jury consists of working UK independent filmmakers and programmers. While selections are peer-reviewed, the festival relies on informal recusal rather than an automated blind-scoring portal. An associate producer screened a short in an earlier non-competitive showcase in 2023.",
                    "educationalContext": "Grassroots festivals often draw jurors from their local filmmaker community. Transparent recusal policies ensure impartial scoring.",
                    "signals": [
                        "Jury members have active independent production credits",
                        "Informal recusal protocols rather than blind evaluation software",
                        "2023 showcase included an associate producer's non-competitive short"
                    ],
                    "relatedEntities": ["Arthur Smith", "Benjamin Jones", "Genesis Cinema Studio 4"]
                },
                "venueReality": {
                    "status": "AMBER_WARNING",
                    "headline": "Boutique Screening Room vs. Gala Marketing",
                    "summary": "The festival delivers authentic physical screenings at Genesis Cinema (Studio 4) in East London with verified 2K DCP projection and enthusiastic filmmaker attendance. However, marketing references to 'London Gala Showcases' should be understood as an intimate 40-seat boutique screening room rather than a West End palace.",
                    "educationalContext": "Boutique cinema rentals provide genuine big-screen DCP projection and intimate peer networking, but filmmakers should expect limited crew ticket allocations.",
                    "signals": [
                        "Verified physical DCP screenings at Genesis Cinema Studio 4",
                        "Intimate 40-seat auditorium capacity",
                        "One-off 3-hour private hire at BFI Southbank NFT3 in 2024"
                    ],
                    "relatedEntities": ["Genesis Cinema Studio 4", "BFI Southbank NFT3"]
                }
            }
        },

        "deepVetting": {
            "festivalName": "Pinco Pallino Film Festival",
            "overallAuthenticityScore": 68,
            "totalFlags": 3,
            "dimensions": [
                {
                    "id": "dim_corp",
                    "dimensionKey": "CORPORATE_REGISTRY",
                    "title": "Corporate & Legal Entity Verification",
                    "category": "ORGANIZER_TRACK_RECORD",
                    "status": "VERIFIED_AUTHENTIC",
                    "confidenceScore": 94,
                    "summary": "Operating entity Pinco Pallino Film CIC is an active UK Community Interest Company with up-to-date micro-entity filings and non-profit asset lock.",
                    "signalsFound": ["Active Community Interest Company status", "Timely confirmation statements", "Non-profit asset lock declared"],
                    "corroboratingSources": ["find-and-update.company-information.service.gov.uk"],
                    "riskWeight": "LOW"
                },
                {
                    "id": "dim_domain",
                    "dimensionKey": "DOMAIN_PROVENANCE",
                    "title": "Domain Age & WHOIS Provenance",
                    "category": "ORGANIZER_TRACK_RECORD",
                    "status": "VERIFIED_AUTHENTIC",
                    "confidenceScore": 95,
                    "summary": "Domain pincopallinofilmfestival.com registered June 2021, matching 4 years of continuous festival operations and valid SSL certification.",
                    "signalsFound": ["Continuous registration since June 2021", "Active SSL security certificates", "Consistent DNS nameserver routing"],
                    "corroboratingSources": ["rdap.org", "whois.iana.org"],
                    "riskWeight": "LOW"
                },
                {
                    "id": "dim_venue",
                    "dimensionKey": "VENUE_CORROBORATION",
                    "title": "Municipal Screening & Venue Corroboration",
                    "category": "VENUE_SCREENINGS",
                    "status": "VERIFIED_AUTHENTIC",
                    "confidenceScore": 96,
                    "summary": "Confirmed physical bookings at Genesis Cinema Studio 4 via private hire manifests and attendee box office records.",
                    "signalsFound": ["Genesis Cinema private hire manifest match", "Verified 2K DCP projection", "Confirmed public ticketing schedule"],
                    "corroboratingSources": ["genesiscinema.co.uk"],
                    "riskWeight": "LOW"
                },
                {
                    "id": "dim_personnel",
                    "dimensionKey": "PERSONNEL_DOSSIER",
                    "title": "Key Personnel & Jury Dossiers",
                    "category": "ORGANIZER_TRACK_RECORD",
                    "status": "AMBER_WARNING",
                    "confidenceScore": 88,
                    "summary": "Key personnel possess verifiable UK indie credits; recusal protocols are informal rather than independently audited.",
                    "signalsFound": ["Verifiable IMDb producer/director credits", "Informal recusal guidelines", "Active local filmmaker network"],
                    "corroboratingSources": ["imdb.com", "filmlondon.org.uk"],
                    "riskWeight": "MEDIUM"
                },
                {
                    "id": "dim_plagiarism",
                    "dimensionKey": "BOILERPLATE_PLAGIARISM",
                    "title": "Boilerplate Rules & Text Duplication",
                    "category": "ORGANIZER_TRACK_RECORD",
                    "status": "INFORMATIONAL",
                    "confidenceScore": 90,
                    "summary": "Rules and terms follow standard FilmFreeway conventions with standard non-refundable entry stipulations.",
                    "signalsFound": ["Standard FilmFreeway terms alignment", "Transparent eligibility dates", "Clear category breakdowns"],
                    "corroboratingSources": ["filmfreeway.com"],
                    "riskWeight": "LOW"
                },
                {
                    "id": "dim_alumni",
                    "dimensionKey": "ALUMNI_FOOTPRINT",
                    "title": "Alumni Filmmaker & Selection Footprint",
                    "category": "EXPERIENCE_FEEDBACK",
                    "status": "VERIFIED_AUTHENTIC",
                    "confidenceScore": 91,
                    "summary": "28 verified past alumni directors on IMDb and Letterboxd; positive community reviews averaging 3.6/5 stars.",
                    "signalsFound": ["28 verified alumni credits on IMDb", "Positive attendee feedback on Genesis Cinema Q&As", "Letterboxd community engagement"],
                    "corroboratingSources": ["imdb.com", "letterboxd.com"],
                    "riskWeight": "LOW"
                },
                {
                    "id": "dim_images",
                    "dimensionKey": "IMAGE_PROVENANCE",
                    "title": "Promotional Image & Asset Authenticity",
                    "category": "IMAGE_PROVENANCE",
                    "status": "AMBER_WARNING",
                    "confidenceScore": 92,
                    "summary": "Event and marquee photography from Genesis Cinema is authentic; website promotional header uses a stock cinema auditorium image.",
                    "signalsFound": [
                        "Authentic event photography from Genesis Cinema Studio 4 Q&A",
                        "Real step-and-repeat attendee photos verified",
                        "Stock auditorium photo used on promotional web header",
                        "Standard customizable Canva laurel template"
                    ],
                    "corroboratingSources": ["shutterstock.com", "genesiscinema.co.uk"],
                    "riskWeight": "MEDIUM",
                    "imageArtifacts": [
                        {
                            "id": "img_art_1",
                            "assetType": "VENUE_PHOTO",
                            "claimedUrl": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
                            "claimedDescription": "Website Promotional Header Banner",
                            "classification": "STOCK_PHOTO",
                            "originMatchUrl": "https://www.shutterstock.com/image-photo/cinema-auditorium-crowd-watching-movie-7192014",
                            "originMatchTitle": "Shutterstock Asset #7192014 ('Crowd in Modern Cinema Auditorium')",
                            "confidenceScore": 95,
                            "forensicNotes": "Reverse image search identified identical stock photo on Shutterstock uploaded in 2017. Used as atmospheric website banner rather than depicting physical Genesis Cinema."
                        },
                        {
                            "id": "img_art_2",
                            "assetType": "LAUREL_GRAPHIC",
                            "claimedUrl": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
                            "claimedDescription": "Official Selection Laurel Emblem",
                            "classification": "TEMPLATE_LAUREL",
                            "originMatchUrl": "https://filmfreeway.com/ApexShortFilmArena",
                            "originMatchTitle": "Canva Template #FF-8812",
                            "confidenceScore": 88,
                            "forensicNotes": "Vector leaf structure matches standard free Canva laurel template widely used across independent festival circuits."
                        },
                        {
                            "id": "img_art_3",
                            "assetType": "VENUE_PHOTO",
                            "claimedUrl": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
                            "claimedDescription": "Genesis Cinema Studio 4 Q&A Session",
                            "classification": "AUTHENTIC_LIVE",
                            "originMatchUrl": "https://genesiscinema.co.uk/events/archive",
                            "originMatchTitle": "Genesis Cinema Studio 4 Event Photography",
                            "confidenceScore": 96,
                            "forensicNotes": "Verified authentic event photography from October 2024 edition showing filmmaker Q&A panel."
                        },
                        {
                            "id": "img_art_4",
                            "assetType": "RED_CARPET",
                            "claimedUrl": "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800&auto=format&fit=crop&q=80",
                            "claimedDescription": "Filmmaker Step-and-Repeat Foyer Photo",
                            "classification": "AUTHENTIC_LIVE",
                            "originMatchUrl": "https://pincopallinofilmfestival.com/gallery",
                            "originMatchTitle": "Festival Foyer Step-and-Repeat Archive",
                            "confidenceScore": 94,
                            "forensicNotes": "Authentic on-site step-and-repeat backdrop with genuine attendee badges and festival programs."
                        }
                    ]
                }
            ],
            "imageArtifacts": [
                {
                    "id": "img_art_1",
                    "assetType": "VENUE_PHOTO",
                    "claimedUrl": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
                    "claimedDescription": "Website Promotional Header Banner",
                    "classification": "STOCK_PHOTO",
                    "originMatchUrl": "https://www.shutterstock.com/image-photo/cinema-auditorium-crowd-watching-movie-7192014",
                    "originMatchTitle": "Shutterstock Asset #7192014 ('Crowd in Modern Cinema Auditorium')",
                    "confidenceScore": 95,
                    "forensicNotes": "Reverse image search identified identical stock photo on Shutterstock uploaded in 2017. Used as atmospheric website banner rather than depicting physical Genesis Cinema."
                },
                {
                    "id": "img_art_2",
                    "assetType": "LAUREL_GRAPHIC",
                    "claimedUrl": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
                    "claimedDescription": "Official Selection Laurel Emblem",
                    "classification": "TEMPLATE_LAUREL",
                    "originMatchUrl": "https://filmfreeway.com/ApexShortFilmArena",
                    "originMatchTitle": "Canva Template #FF-8812",
                    "confidenceScore": 88,
                    "forensicNotes": "Vector leaf structure matches standard free Canva laurel template widely used across independent festival circuits."
                },
                {
                    "id": "img_art_3",
                    "assetType": "VENUE_PHOTO",
                    "claimedUrl": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
                    "claimedDescription": "Genesis Cinema Studio 4 Q&A Session",
                    "classification": "AUTHENTIC_LIVE",
                    "originMatchUrl": "https://genesiscinema.co.uk/events/archive",
                    "originMatchTitle": "Genesis Cinema Studio 4 Event Photography",
                    "confidenceScore": 96,
                    "forensicNotes": "Verified authentic event photography from October 2024 edition showing filmmaker Q&A panel."
                },
                {
                    "id": "img_art_4",
                    "assetType": "RED_CARPET",
                    "claimedUrl": "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=800&auto=format&fit=crop&q=80",
                    "claimedDescription": "Filmmaker Step-and-Repeat Foyer Photo",
                    "classification": "AUTHENTIC_LIVE",
                    "originMatchUrl": "https://pincopallinofilmfestival.com/gallery",
                    "originMatchTitle": "Festival Foyer Step-and-Repeat Archive",
                    "confidenceScore": 94,
                    "forensicNotes": "Authentic on-site step-and-repeat backdrop with genuine attendee badges and festival programs."
                }
            ],
            "keyPersonnel": [
                {
                    "name": "Arthur Smith",
                    "roles": ["Festival Director", "Co-Founder"],
                    "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
                    "linkedinUrl": "https://www.linkedin.com/in/arthur-smith-cinema",
                    "facebookUrl": "https://www.facebook.com/arthursmithfilm",
                    "websiteUrl": "https://arthursmithcinema.co.uk",
                    "twitterUrl": "https://twitter.com/arthursmithfilm",
                    "companiesHouseUrl": "https://find-and-update.company-information.service.gov.uk/company/13984712",
                    "companies": ["Pinco Pallino Film CIC"],
                    "associatedFestivals": ["Pinco Pallino Film Festival"],
                    "isFestivalMillSuspect": False,
                    "hasDistributionOverlap": False,
                    "flags": ["Sole Directorship", "Grassroots Producer"],
                    "notes": "London-based independent producer and curator with verified screening credits at Genesis Cinema."
                },
                {
                    "name": "Benjamin Jones",
                    "roles": ["Jury Chair", "Senior Programmer"],
                    "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
                    "linkedinUrl": "https://www.linkedin.com/in/benjamin-jones-jury",
                    "websiteUrl": "https://benjaminjonesjury.com",
                    "imdbUrl": "https://www.imdb.com/name/nm2948192",
                    "companiesHouseUrl": "https://find-and-update.company-information.service.gov.uk/company/13984712",
                    "companies": ["Pinco Pallino Film CIC"],
                    "associatedFestivals": ["Pinco Pallino Film Festival"],
                    "isFestivalMillSuspect": False,
                    "hasDistributionOverlap": False,
                    "flags": ["Informal Recusal Policy"],
                    "notes": "Screenwriter and festival programmer with independent short film credits."
                },
                {
                    "name": "Martin Sterling",
                    "roles": ["2024 Best Short Winner"],
                    "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
                    "linkedinUrl": "https://www.linkedin.com/in/martin-sterling-director",
                    "facebookUrl": "https://www.facebook.com/martinsterlingdirector",
                    "websiteUrl": "https://sterlingproductions.co.uk",
                    "imdbUrl": "https://www.imdb.com/name/nm5829104",
                    "companiesHouseUrl": None,
                    "companies": ["Sterling Productions Ltd"],
                    "associatedFestivals": ["Pinco Pallino Film Festival"],
                    "isFestivalMillSuspect": False,
                    "hasDistributionOverlap": False,
                    "flags": ["Independent Director"],
                    "notes": "Winner of 2024 Best Short for 'The Echo Chamber', subsequently screened at other regional UK festivals."
                }
            ],
            "generatedAt": now_iso
        },
        "auditHealth": {
            "status": "HEALTHY",
            "rawDomainClaimsReceived": 363,
            "assembledClaimsCount": 363,
            "sourcesCount": 8,
            "validationErrorsCount": 0,
            "validationErrors": [],
            "deepVettingVectorsCount": 7,
            "deepVettingInconclusiveCount": 0,
            "warnings": [],
            "executionDurationMs": 18000
        }
    }
