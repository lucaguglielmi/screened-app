import asyncio
import json
from datetime import datetime, timezone

DEMO_INVESTIGATION_ID = "demo_pinco_pallino"

def generate_demo_claims():
    """Generates a comprehensive corpus of 300 atomic claims across all 6 core categories."""
    core_claims = [
        {
            "id": "claim_1",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "FESTIVAL",
            "category": "VENUE_SCREENINGS",
            "statement": "The festival claims theatrical gala screenings at BFI Southbank NFT1 and Genesis Cinema Studio 4.",
            "claimKind": "FACT",
            "status": "CORROBORATED",
            "editionYear": 2024,
            "attributedTo": "FilmFreeway Submissions Overview",
            "evidence": [
                {
                    "sourceId": "src_ff_overview",
                    "sourceUrl": "https://www.filmfreeway.com/PincoPallinoFilmFestival",
                    "sourceDomain": "filmfreeway.com",
                    "sourceTitle": "Pinco Pallino London Submissions Overview",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "All selected short and feature films will be screened on the big screen at the legendary BFI Southbank in Central London followed by an industry red-carpet awards reception.",
                    "note": "Promotional claim made directly to submitting filmmakers."
                },
                {
                    "sourceId": "src_genesis_hire",
                    "sourceUrl": "https://genesiscinema.co.uk/events/2024-private-hires",
                    "sourceDomain": "genesiscinema.co.uk",
                    "sourceTitle": "Genesis Cinema Events Booking Schedule",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Confirmed private screening hire for Studio 4 booked under Pinco Pallino Media for Oct 13, 2024.",
                    "note": "Venue manifest confirms physical private booking."
                }
            ]
        },
        {
            "id": "claim_2",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "PARTICIPANTS",
            "category": "EXPERIENCE_FEEDBACK",
            "statement": "Filmmakers receive an unlisted private Vimeo link with fewer than 5 views in lieu of advertised theatrical screenings.",
            "claimKind": "FACT",
            "status": "CORROBORATED",
            "editionYear": 2024,
            "attributedTo": "Verified Filmmaker Testimonies",
            "evidence": [
                {
                    "sourceId": "src_reddit_warning",
                    "sourceUrl": "https://www.reddit.com/r/Filmmakers/comments/18m2b1/pinco_pallino_festival_warning",
                    "sourceDomain": "reddit.com",
                    "sourceTitle": "r/Filmmakers - Anyone submitted to Pinco Pallino London?",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "We paid £85 for a Gala Premiere category. Two days before, they emailed an unlisted Vimeo link with 3 total views. The cinema venue they advertised had no record of them.",
                    "note": "Firsthand filmmaker testimony confirmed by receipt."
                },
                {
                    "sourceId": "src_stage32_thread",
                    "sourceUrl": "https://www.stage32.com/lounge/screenwriting/pinco-pallino-festival-experience",
                    "sourceDomain": "stage32.com",
                    "sourceTitle": "Stage 32 Community Forum - London Festival Vetting",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Confirmed: no live audience or physical cinema was ever booked. An unlisted Vimeo link password 'laurel2024' was emailed 48 hours prior with only 2 total impressions.",
                    "note": "Independent corroboration from debut producer."
                }
            ]
        },
        {
            "id": "claim_3",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "ORGANIZER",
            "category": "LEGAL_IDENTITY",
            "statement": "Operating entity Pallino Media Lab Ltd (Company No. 13984712) was dissolved via compulsory strike-off on 14 March 2024.",
            "claimKind": "FACT",
            "status": "CORROBORATED",
            "editionYear": 2024,
            "attributedTo": "UK Companies House Public Register",
            "evidence": [
                {
                    "sourceId": "src_ch_filing",
                    "sourceUrl": "https://find-and-update.company-information.service.gov.uk/company/13984712",
                    "sourceDomain": "gov.uk",
                    "sourceTitle": "Companies House - Pallino Media Lab Ltd Filing History",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Final Gazette notice: Pallino Media Lab Ltd (Company number 13984712) dissolved via Compulsory Strike-off on 14 March 2024. Registered office: 71-75 Shelton Street, London, WC2H 9JQ.",
                    "note": "Official corporate register confirms entity dissolved prior to current festival cycle."
                }
            ]
        },
        {
            "id": "claim_4",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "ORGANIZER",
            "category": "ORGANIZER_TRACK_RECORD",
            "statement": "Festival Director Arthur Smith is subject to an individual bankruptcy order filed in November 2022.",
            "claimKind": "FACT",
            "status": "SUPPORTED",
            "editionYear": 2022,
            "attributedTo": "The London Gazette",
            "evidence": [
                {
                    "sourceId": "src_gazette_notice",
                    "sourceUrl": "https://www.thegazette.co.uk/notice/23849102",
                    "sourceDomain": "thegazette.co.uk",
                    "sourceTitle": "The London Gazette - Official Public Record of Insolvencies",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Insolvency Service Notice 23849102: Bankruptcy order dated 11 November 2022 against Arthur Smith (trading as Pallino Media & Events). Case No: 0491-2022.",
                    "note": "Official UK government public record confirms active bankruptcy proceeding."
                }
            ]
        },
        {
            "id": "claim_5",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "FEES",
            "category": "FEES_POLICY",
            "statement": "Submission fee tiers escalate from £35 Early Bird to £95 Late Deadline, plus a £180 mandatory trophy package fee.",
            "claimKind": "FACT",
            "status": "CORROBORATED",
            "editionYear": 2025,
            "attributedTo": "FilmFreeway Rules & Pricing Manifest",
            "evidence": [
                {
                    "sourceId": "src_ff_rules",
                    "sourceUrl": "https://www.filmfreeway.com/PincoPallinoFilmFestival/rules",
                    "sourceDomain": "filmfreeway.com",
                    "sourceTitle": "FilmFreeway Submission Rules & Deadline Schedule",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Fee Deadlines: Early Bird £35, Regular £65, Late £95, Extended £120. Official Laurel Trophy Package available for £180 plus £35 international shipping.",
                    "note": "Official fee schedule reflects high rate of fee escalation and ancillary trophy monetization."
                }
            ]
        },
        {
            "id": "claim_6",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "ORGANIZER",
            "category": "ORGANIZER_TRACK_RECORD",
            "statement": "Jury Chair Benjamin Jones actively markets £120 paid script consulting to rejected festival submitters via IndiePitch Consulting.",
            "claimKind": "FACT",
            "status": "CORROBORATED",
            "editionYear": 2025,
            "attributedTo": "IndiePitch Consulting Direct Manifest",
            "evidence": [
                {
                    "sourceId": "src_indiepitch",
                    "sourceUrl": "https://www.indiepitchconsulting.co.uk/services",
                    "sourceDomain": "indiepitchconsulting.co.uk",
                    "sourceTitle": "IndiePitch Consulting Services & Rates",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Senior Jury Consultant: Benjamin Jones. Festival Rejection Recovery Pitch Audit: £120 per script. Direct submission feedback available within 48 hours of notification.",
                    "note": "Cross-commercial commercial conflict of interest documented on business website."
                }
            ]
        },
        {
            "id": "claim_7",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "ORGANIZER",
            "category": "JURY_AWARDS",
            "statement": "Associate Producer Martin Sterling won 'Best International Short' in consecutive years (2024 and 2025) despite claimed 1.2% acceptance rate.",
            "claimKind": "FACT",
            "status": "CORROBORATED",
            "editionYear": 2025,
            "attributedTo": "Official Awards Archive",
            "evidence": [
                {
                    "sourceId": "src_winners_archive",
                    "sourceUrl": "https://www.pincopallinofilmfestival.com/past-winners-2024-2025",
                    "sourceDomain": "pincopallinofilmfestival.com",
                    "sourceTitle": "Pinco Pallino Past Editions Winners Archive",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "2024 Best International Short: 'The Echo Chamber' directed by Martin Sterling. 2025 Best International Short: 'Shadow Puppets' directed by Martin Sterling.",
                    "note": "Official catalog archives show identical director receiving top award in back-to-back editions."
                }
            ]
        },
        {
            "id": "claim_8",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "ORGANIZER",
            "category": "ORGANIZER_TRACK_RECORD",
            "statement": "Claimed 'Official Platinum Sponsorships' from ARRI and Sony Cinema were formally denied by manufacturer PR representatives.",
            "claimKind": "FACT",
            "status": "CORROBORATED",
            "editionYear": 2024,
            "attributedTo": "ARRI & Sony Corporate Communications",
            "evidence": [
                {
                    "sourceId": "src_arri_statement",
                    "sourceUrl": "https://twitter.com/ARRIChannel/status/1234567890",
                    "sourceDomain": "twitter.com",
                    "sourceTitle": "ARRI Official Corporate Communications",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "@PincoPallinoFest is not an authorized or official ARRI festival partner. We have issued a formal trademark cease-and-desist request for logo removal.",
                    "note": "Manufacturer explicitly denies sponsorship affiliation."
                }
            ]
        },
        {
            "id": "claim_9",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "PARTICIPANTS",
            "category": "EXPERIENCE_FEEDBACK",
            "statement": "Over 42 independent filmmakers document 3–5 week communication blackouts following submission fee processing.",
            "claimKind": "FACT",
            "status": "SUPPORTED",
            "editionYear": 2024,
            "attributedTo": "TrustPilot & Reddit Aggregated Accounts",
            "evidence": [
                {
                    "sourceId": "src_trustpilot_reviews",
                    "sourceUrl": "https://www.trustpilot.com/review/pincopallino.com",
                    "sourceDomain": "trustpilot.com",
                    "sourceTitle": "TrustPilot - Pinco Pallino Festival Reviews (Score: 1.4/5)",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "42 separate filmmaker reviews report zero communication for over a month past the stated notification date, followed by automated upsell templates.",
                    "note": "Aggregated consumer protection reviews indicate recurring communication pattern."
                }
            ]
        },
        {
            "id": "claim_10",
            "investigationId": DEMO_INVESTIGATION_ID,
            "researchDomain": "FEES",
            "category": "FEES_POLICY",
            "statement": "Festival policy stipulates zero entry fee refunds under any circumstances, including canceled physical screenings.",
            "claimKind": "FACT",
            "status": "CORROBORATED",
            "editionYear": 2025,
            "attributedTo": "Official Submission Terms & Conditions",
            "evidence": [
                {
                    "sourceId": "src_terms_conditions",
                    "sourceUrl": "https://www.pincopallinofilmfestival.com/terms-and-conditions",
                    "sourceDomain": "pincopallinofilmfestival.com",
                    "sourceTitle": "Pinco Pallino Terms & Conditions - Section 4.2",
                    "stance": "SUPPORTS",
                    "exactExcerpt": "Section 4.2: All entry fees, trophy packaging fees, and review fees are strictly non-refundable regardless of screening format adaptations, venue changes, or program cancellations.",
                    "note": "Non-refundable indemnity clause protects organizer against venue cancellations."
                }
            ]
        }
    ]

    claims = list(core_claims)

    venue_templates = [
        ("Genesis Cinema Studio 4 DCP server test completed for 2K short film projection block.", "FESTIVAL", "VENUE_SCREENINGS", "CORROBORATED", 2024),
        ("BFI Southbank NFT3 hire agreement executed for 3-hour private evening screening window.", "FESTIVAL", "VENUE_SCREENINGS", "CORROBORATED", 2024),
        ("Watermans Arts Centre hosted 2022 edition with 120 recorded theater ticket admissions.", "FESTIVAL", "VENUE_SCREENINGS", "CORROBORATED", 2022),
        ("Genesis Cinema Studio 2 hosted 2023 edition short film competition block on October 15.", "FESTIVAL", "VENUE_SCREENINGS", "CORROBORATED", 2023),
        ("Rich Mix Cinema venue inquiry log shows no formal rental deposit paid for claimed 2025 dates.", "FESTIVAL", "VENUE_SCREENINGS", "SUPPORTED", 2025),
        ("Curzon Soho management confirms zero affiliation or booking for advertised gala premiere.", "FESTIVAL", "VENUE_SCREENINGS", "DISPUTED", 2025),
        ("Regent Street Cinema confirmed initial date hold was canceled due to non-payment of balance.", "FESTIVAL", "VENUE_SCREENINGS", "DISPUTED", 2024),
        ("Genesis Cinema projectionist noted 4 audio sync failures during uncalibrated short film playlist playback.", "PARTICIPANTS", "VENUE_SCREENINGS", "SUPPORTED", 2024),
        ("Private screening room capacity at Genesis Studio 4 is capped at 40 seats for 180 accepted directors.", "FESTIVAL", "VENUE_SCREENINGS", "CORROBORATED", 2024),
        ("BFI Southbank security logs record no red carpet or outdoor banner setup permission granted.", "FESTIVAL", "VENUE_SCREENINGS", "CORROBORATED", 2024),
    ]

    corporate_templates = [
        ("Pallino Media Lab Ltd incorporated on 12 April 2022 with 100 ordinary shares at £1.00 each.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2022),
        ("Registered office changed to 71-75 Shelton Street, Covent Garden, a known virtual mailbox provider.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2022),
        ("First Gazette notice for compulsory strike-off issued by Registrar on 28 November 2023.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2023),
        ("Strike-off action temporarily suspended on 15 December 2023 following creditor objection.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2023),
        ("Final dissolution notice published in The London Gazette under notice ID 4591024.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2024),
        ("Director Arthur Smith listed with occupation 'Film Producer' and UK resident status.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2022),
        ("PSC register lists Arthur Smith with 75% or more voting rights and significant influence.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2022),
        ("Pinco Pallino Film CIC registered as Community Interest Company in January 2024.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2024),
        ("IndiePitch Consulting registered as trading name under unregistered sole proprietorship.", "ORGANIZER", "LEGAL_IDENTITY", "SUPPORTED", 2024),
        ("Companies House accounts overdue notice issued on 12 January 2024 prior to dissolution.", "ORGANIZER", "LEGAL_IDENTITY", "CORROBORATED", 2024),
    ]

    fees_templates = [
        ("Early Bird submission fee for student shorts set at £22 on FilmFreeway platform.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Regular submission fee for narrative shorts set at £45 across all standard genres.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Late deadline fee increased by 111% to £95 during the final 14 days before closing.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Extended deadline surcharge of £120 introduced for post-deadline emergency entries.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Fast-Track 48-Hour Jury Review add-on priced at £65 per submitted title.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Official Laurel Trophy physical statuette priced at £180 plus £35 international courier fee.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Certificate of Official Selection printed parchment offered for £45 fee.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Filmmaker Red Carpet VIP admission wristband charged at £30 per individual attendee.", "FEES", "FEES_POLICY", "CORROBORATED", 2024),
        ("Waiver discount codes offered via cold Instagram DMs with 20% discount on £95 fee.", "PARTICIPANTS", "FEES_POLICY", "SUPPORTED", 2024),
        ("Submission fee refund requests automatically rejected citing Section 4.2 terms.", "PARTICIPANTS", "FEES_POLICY", "CORROBORATED", 2024),
    ]

    jury_templates = [
        ("Jury panel advertised with 7 international industry jurors on festival promotional graphics.", "ORGANIZER", "JURY_AWARDS", "SUPPORTED", 2024),
        ("2 of 7 named jurors confirmed they had not reviewed any submissions or attended screenings.", "ORGANIZER", "JURY_AWARDS", "DISPUTED", 2024),
        ("Jury Chair Benjamin Jones credited as producer on 3 past winning short films.", "ORGANIZER", "JURY_AWARDS", "CORROBORATED", 2024),
        ("Best Narrative Short award granted to 'The Echo Chamber' in 2024 edition.", "ORGANIZER", "JURY_AWARDS", "CORROBORATED", 2024),
        ("Best Narrative Short award granted to 'Shadow Puppets' by same director in 2025 edition.", "ORGANIZER", "JURY_AWARDS", "CORROBORATED", 2025),
        ("Over 65 distinct award categories created including 'Best Sound Design in a Micro-Budget Horror'.", "FESTIVAL", "JURY_AWARDS", "CORROBORATED", 2024),
        ("Blind evaluation protocol claimed in festival rules not implemented in judging software.", "ORGANIZER", "JURY_AWARDS", "DISPUTED", 2024),
        ("Written jury feedback contains identical template phrasing across 14 independent submissions.", "PARTICIPANTS", "JURY_AWARDS", "SUPPORTED", 2024),
        ("Jury members receive zero financial remuneration for judging duties according to alumni juror.", "ORGANIZER", "JURY_AWARDS", "SUPPORTED", 2023),
        ("Audience Choice Award tallied via Instagram poll with no ticket-holder validation.", "FESTIVAL", "JURY_AWARDS", "CORROBORATED", 2024),
    ]

    sentiment_templates = [
        ("Filmmaker forum thread logs 18 complaints regarding unannounced screening schedule changes.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "SUPPORTED", 2024),
        ("TrustPilot review score averages 1.4/5 stars across 42 verified submitter submissions.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "CORROBORATED", 2024),
        ("Submitters report receiving unsolicited marketing emails from IndiePitch Consulting within 48 hours.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "CORROBORATED", 2024),
        ("Reddit r/Filmmakers thread advises first-time directors against submitting to Pinco Pallino.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "SUPPORTED", 2024),
        ("Filmmaker in attendance reported only 8 people in the auditorium during feature premiere.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "SUPPORTED", 2024),
        ("Festival organizer failed to respond to 12 formal email inquiries regarding DCP delivery specs.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "SUPPORTED", 2024),
        ("Instagram comments disabled on festival account following filmmaker dispute over laurel sales.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "CORROBORATED", 2024),
        ("Letterboxd reviews for 2024 winning shorts show average community rating of 3.4/5.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "SUPPORTED", 2024),
        ("Cinematography forum post confirms receipt of automated acceptance letter within 4 hours of submission.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "SUPPORTED", 2024),
        ("Filmmaker received laurel graphic with misspelled festival name on official PNG file.", "PARTICIPANTS", "EXPERIENCE_FEEDBACK", "SUPPORTED", 2024),
    ]

    milestone_templates = [
        ("Inaugural 2021 virtual edition streamed 24 short films via password-protected Vimeo showcase.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2021),
        ("2022 edition expanded to in-person screenings at Watermans Arts Centre in West London.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2022),
        ("2023 edition introduced FilmFreeway Gold Festival status badge on submission page.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2023),
        ("2024 edition reported receiving 3,200 submissions from 48 countries in press release.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "SUPPORTED", 2024),
        ("Official festival catalogue distributed in digital PDF format to all selected filmmakers.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2024),
        ("2025 Call for Entries opened on FilmFreeway with 4 deadline phases.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2025),
        ("Press release published on IndieWire Community wire announcing 2024 jury longlist.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "SUPPORTED", 2024),
        ("Festival established official YouTube channel featuring 12 trailer compilations.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2023),
        ("Official poster art updated annually with custom graphic design for London skyline motif.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "CORROBORATED", 2024),
        ("Festival announced new 'Green Cinema' sustainability initiative in 2024 program guide.", "FESTIVAL", "ORGANIZER_TRACK_RECORD", "SUPPORTED", 2024),
    ]

    all_templates = (
        venue_templates * 5 +
        corporate_templates * 6 +
        fees_templates * 6 +
        jury_templates * 5 +
        sentiment_templates * 5 +
        milestone_templates * 4
    )

    for i, (stmt, domain, cat, status, yr) in enumerate(all_templates[:290], start=11):
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
            "attributedTo": f"Public Record & Forensic Extraction #{i}",
            "evidence": [
                {
                    "sourceId": f"src_evidence_{i}",
                    "sourceUrl": "https://pincopallinofilmfestival.com/evidence-archive",
                    "sourceDomain": "pincopallinofilmfestival.com" if domain == "FESTIVAL" else ("gov.uk" if domain == "ORGANIZER" else "reddit.com"),
                    "sourceTitle": f"Corroboration Record #{i}",
                    "stance": "SUPPORTS" if status != "DISPUTED" else "CONTRADICTS",
                    "exactExcerpt": stmt,
                    "note": f"Forensically extracted claim verification node #{i}."
                }
            ]
        })

    return claims


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
    yield format_event("PLANNING_STARTED", "Formulating parallel investigation strategy across 3 core domains...")
    await asyncio.sleep(1.5)
    yield format_event("PLANNING_STEP", "Identifying target research domains: Corporate Shells, Venue Verification, Filmmaker Sentiment...", {"queriesCount": 12, "sourcesCount": 14})
    await asyncio.sleep(2.0)
    yield format_event("PLANNING_STEP", "Found candidate entity. Ready for confirmation.", {"candidates": get_demo_investigation()["candidates"], "sourcesCount": 18})
    await asyncio.sleep(1.5)

    # Stage 2: Researching (5s)
    yield format_event("DOMAIN_SEARCH_STARTED", "Dispatching parallel sub-agents across 42 public and commercial sources...", {"sourcesCount": 42, "queriesCount": 12})
    await asyncio.sleep(1.25)
    yield format_event("AGENT_UPDATE", "VenueAgent: Harvested BFI Southbank & Genesis Cinema box office manifests (12 sources).", {"agent": "VenueAgent", "sourcesCount": 24, "claimsCount": 85})
    await asyncio.sleep(1.25)
    yield format_event("AGENT_UPDATE", "CorporateAgent: Retrieved Companies House & London Gazette filings for Pallino Media Lab (14 sources).", {"agent": "CorporateAgent", "sourcesCount": 32, "claimsCount": 160})
    await asyncio.sleep(1.25)
    yield format_event("AGENT_UPDATE", "SentimentAgent: Aggregated 42+ filmmaker testimonies from Reddit r/Filmmakers, Stage 32 & TrustPilot (16 sources).", {"agent": "SentimentAgent", "sourcesCount": 42, "claimsCount": 300})
    await asyncio.sleep(1.25)

    # Stage 3: Analyzing (5s)
    yield format_event("CONTRADICTIONS_ANALYZING", "Cross-referencing 300 atomic claims against 42 multi-domain sources...", {"sourcesCount": 42, "claimsCount": 300, "contradictionsCount": 4})
    await asyncio.sleep(1.5)
    yield format_event("AGENT_UPDATE", "VerificationAgent: Verified manufacturer sponsorship disavowals with ARRI & Sony.", {"agent": "VerificationAgent", "sourcesCount": 42, "claimsCount": 300})
    await asyncio.sleep(1.5)
    yield format_event("AGENT_UPDATE", "FraudAgent: Flagged conflict of interest anomaly in jury records & consulting upsells.", {"agent": "FraudAgent", "sourcesCount": 42, "claimsCount": 300, "contradictionsCount": 4})
    await asyncio.sleep(2.0)

    # Stage 4: Synthesizing (5s)
    yield format_event("DOSSIER_SYNTHESIZING", "Assembling finalized evidence dossier with 42 verified sources and 300 claims...", {"sourcesCount": 42, "claimsCount": 300, "contradictionsCount": 4})
    await asyncio.sleep(1.5)
    yield format_event("AGENT_UPDATE", "SynthesisAgent: Finalizing full forensic dossier and executive summary.", {"agent": "SynthesisAgent", "sourcesCount": 42, "claimsCount": 300})
    await asyncio.sleep(2.0)
    yield format_event("AGENT_UPDATE", "SynthesisAgent: Reviewing final output for accuracy and source citations...", {"agent": "SynthesisAgent", "sourcesCount": 42, "claimsCount": 300})
    await asyncio.sleep(1.5)

    # Complete
    yield format_event("DOSSIER_READY", "Investigation complete. Generating final dossier.", {"sourcesCount": 42, "claimsCount": 300, "contradictionsCount": 4})


def get_demo_full_dossier():
    """Returns the finalized, highly detailed mock investigation state."""
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
        
        "disputes": [
            {
                "id": "disp_conflict",
                "pointOfContention": "Jury & Organizer Conflict of Interest",
                "category": "JURY_AWARDS",
                "claimA": "The festival claims an impartial, independent, blind-judging jury.",
                "evidenceA": [
                    {
                        "sourceId": "src_jury_rules",
                        "sourceUrl": "https://pincopallino.com/jury",
                        "sourceDomain": "pincopallino.com",
                        "sourceTitle": "Pinco Pallino Rules & Regulations / Jury Charter",
                        "stance": "SUPPORTS",
                        "exactExcerpt": "Our independent jury evaluates all films blindly and without prejudice across all competition categories.",
                        "snippet": "Our independent jury evaluates all films blindly and without prejudice across all competition categories."
                    }
                ],
                "claimB": "Companies House records show 3 key organizers and jurors co-own Pallino Media Lab Ltd, aggressively upselling PR & distribution packages to applicants.",
                "evidenceB": [
                    {
                        "sourceId": "src_ch_filing",
                        "sourceUrl": "https://find-and-update.company-information.service.gov.uk/company/13984712",
                        "sourceDomain": "gov.uk",
                        "sourceTitle": "Companies House - Pallino Media Lab Ltd (13984712)",
                        "stance": "CONTRADICTS",
                        "exactExcerpt": "Active Officers & PSC: A. Smith (Festival Director), B. Jones (Jury Chair), C. Davis (Programmer). Nature of control: 75% or more shares with joint commercial consultancy rights.",
                        "snippet": "Active Officers & PSC: A. Smith (Festival Director), B. Jones (Jury Chair), C. Davis (Programmer). Nature of control: 75% or more shares with joint commercial consultancy rights."
                    }
                ],
                "guidance": "High Risk. Key festival personnel co-own an external consultancy actively monetizing and upselling distribution services to submitting filmmakers."
            },
            {
                "id": "disp_fees",
                "pointOfContention": "Aggressive Fee Escalation",
                "category": "FEES_POLICY",
                "claimA": "Early bird entry fee is advertised as a highly accessible £28.",
                "evidenceA": [
                    {
                        "sourceId": "src_ff_fees",
                        "sourceUrl": "https://filmfreeway.com/PincoPallinoFilmFestival",
                        "sourceDomain": "filmfreeway.com",
                        "sourceTitle": "FilmFreeway - Pinco Pallino Entry Fees",
                        "stance": "SUPPORTS",
                        "exactExcerpt": "Early Bird Deadline: £28 for all short film categories. Standard: £45.",
                        "snippet": "Early Bird Deadline: £28 for all short film categories. Standard: £45."
                    }
                ],
                "claimB": "Late fees spike aggressively to £85 in the final 10 days, accounting for 65% of their total annual revenue according to leaked financial summaries.",
                "evidenceB": [
                    {
                        "sourceId": "src_ff_late",
                        "sourceUrl": "https://filmfreeway.com/PincoPallinoFilmFestival/dates-fees",
                        "sourceDomain": "filmfreeway.com",
                        "sourceTitle": "FilmFreeway - Pinco Pallino Late Deadline Breakdown",
                        "stance": "CONTRADICTS",
                        "exactExcerpt": "Extended Late Fee: £85 for shorts, £115 for features. Expedited jury review add-on: £65.",
                        "snippet": "Extended Late Fee: £85 for shorts, £115 for features. Expedited jury review add-on: £65."
                    }
                ],
                "guidance": "Attention Item. The late fee tier surges 200% above base rates; filmmakers should avoid late entry windows."
            },
            {
                "id": "disp_sponsors",
                "pointOfContention": "Fabricated Platinum Sponsorships",
                "category": "ORGANIZER_TRACK_RECORD",
                "claimA": "Promotional banners claim official Platinum partnerships with Sony Cinema and ARRI.",
                "evidenceA": [
                    {
                        "sourceId": "src_fest_home",
                        "sourceUrl": "https://pincopallino.com/sponsors",
                        "sourceDomain": "pincopallino.com",
                        "sourceTitle": "Pinco Pallino Festival Sponsor Showcase",
                        "stance": "SUPPORTS",
                        "exactExcerpt": "Official 2024 Platinum Industry Partners: Sony CineAlta & ARRI Rental London.",
                        "snippet": "Official 2024 Platinum Industry Partners: Sony CineAlta & ARRI Rental London."
                    }
                ],
                "claimB": "ARRI official PR communications issued a formal denial and trademark cease-and-desist regarding unauthorized logo usage.",
                "evidenceB": [
                    {
                        "sourceId": "src_arri_tweet",
                        "sourceUrl": "https://twitter.com/ARRIChannel/status/1234567890",
                        "sourceDomain": "twitter.com",
                        "sourceTitle": "ARRI Official Communications",
                        "stance": "CONTRADICTS",
                        "exactExcerpt": "@PincoPallinoFest is not an authorized or official ARRI festival partner. We have issued a formal trademark cease-and-desist request.",
                        "snippet": "@PincoPallinoFest is not an authorized or official ARRI festival partner. We have issued a formal trademark cease-and-desist request."
                    }
                ],
                "guidance": "Critical Warning. Festival claims brand endorsements that have been formally repudiated by the manufacturers."
            },
            {
                "id": "disp_venue",
                "pointOfContention": "Promotional Screening Scope vs. Venue Reality",
                "category": "VENUE_SCREENINGS",
                "claimA": "All selected short and feature films are promised full theatrical projection at BFI Southbank.",
                "evidenceA": [
                    {
                        "sourceId": "src_ff_promo",
                        "sourceUrl": "https://filmfreeway.com/PincoPallinoFilmFestival",
                        "sourceDomain": "filmfreeway.com",
                        "sourceTitle": "FilmFreeway Promotional Headline",
                        "stance": "SUPPORTS",
                        "exactExcerpt": "Screen your film on London's premier cinema screen at BFI Southbank.",
                        "snippet": "Screen your film on London's premier cinema screen at BFI Southbank."
                    }
                ],
                "claimB": "Venue manifests confirm BFI Southbank private hire was restricted to a single 3-hour NFT3 slot for 2 feature titles; remaining 40+ shorts received unlisted Vimeo links.",
                "evidenceB": [
                    {
                        "sourceId": "src_bfi_manifest",
                        "sourceUrl": "https://www.bfi.org.uk/venue-hire/southbank/calendar-2024",
                        "sourceDomain": "bfi.org.uk",
                        "sourceTitle": "BFI Southbank Private Hire Booking Archive",
                        "stance": "CONTRADICTS",
                        "exactExcerpt": "NFT3 private hire: 3 hours allocated on Oct 14, 2024 for private screening. Capacity: 130 seats.",
                        "snippet": "NFT3 private hire: 3 hours allocated on Oct 14, 2024 for private screening. Capacity: 130 seats."
                    }
                ],
                "guidance": "Material Discrepancy. Physical theatrical screening is severely restricted compared to broad promotional promises."
            }
        ],

        "claims": claims,

        "sources": [
            {
                "id": "src_bfi_calendar",
                "url": "https://www.bfi.org.uk/venue-hire/southbank/calendar-2025",
                "domain": "bfi.org.uk",
                "title": "BFI Southbank Venue Hire & Event Manifest Archive",
                "sourceTier": 1,
                "retrievedAt": now_iso,
                "excerpts": ["BFI Southbank NFT1/NFT2/NFT3 screening manifests for October 12-14 show zero public bookings for 'Pinco Pallino Film Festival'."],
                "contentHash": "hash_bfi_1"
            },
            {
                "id": "src_ch_filing",
                "url": "https://find-and-update.company-information.service.gov.uk/company/13984712",
                "domain": "gov.uk",
                "title": "Companies House - Pallino Media Lab Ltd Filing History",
                "sourceTier": 1,
                "retrievedAt": now_iso,
                "excerpts": ["Final Gazette notice: Pallino Media Lab Ltd (Company number 13984712) dissolved via Compulsory Strike-off on 14 March 2024."],
                "contentHash": "hash_ch_2"
            },
            {
                "id": "src_gazette_notice",
                "url": "https://www.thegazette.co.uk/notice/23849102",
                "domain": "thegazette.co.uk",
                "title": "The London Gazette - Official Public Record of Insolvencies",
                "sourceTier": 1,
                "retrievedAt": now_iso,
                "excerpts": ["Insolvency Service Notice 23849102: Bankruptcy order dated 11 November 2022 against Arthur Smith (trading as Pallino Media & Events)."],
                "contentHash": "hash_gaz_3"
            },
            {
                "id": "src_ff_overview",
                "url": "https://www.filmfreeway.com/PincoPallinoFilmFestival",
                "domain": "filmfreeway.com",
                "title": "Pinco Pallino London Submissions Overview",
                "sourceTier": 2,
                "retrievedAt": now_iso,
                "excerpts": ["All selected short and feature films will be screened on the big screen at the legendary BFI Southbank in Central London."],
                "contentHash": "hash_ff_4"
            },
            {
                "id": "src_ff_rules",
                "url": "https://www.filmfreeway.com/PincoPallinoFilmFestival/rules",
                "domain": "filmfreeway.com",
                "title": "FilmFreeway Submission Rules & Deadlines",
                "sourceTier": 2,
                "retrievedAt": now_iso,
                "excerpts": ["Fee Deadlines: Early Bird £35, Regular £65, Late £95, Extended £120. Official Laurel Trophy Package available for £180 plus shipping."],
                "contentHash": "hash_ff_5"
            },
            {
                "id": "src_reddit_warning",
                "url": "https://www.reddit.com/r/Filmmakers/comments/18m2b1/pinco_pallino_festival_warning",
                "domain": "reddit.com",
                "title": "r/Filmmakers - Anyone submitted to Pinco Pallino London?",
                "sourceTier": 3,
                "retrievedAt": now_iso,
                "excerpts": ["We paid £85 for a Gala Premiere category. Two days before, they emailed an unlisted Vimeo link with 3 total views. The cinema venue they advertised had no record of them."],
                "contentHash": "hash_red_6"
            },
            {
                "id": "src_stage32_thread",
                "url": "https://www.stage32.com/lounge/screenwriting/pinco-pallino-festival-experience",
                "domain": "stage32.com",
                "title": "Stage 32 Community Forum - London Festival Vetting",
                "sourceTier": 3,
                "retrievedAt": now_iso,
                "excerpts": ["Confirmed: no live audience or physical cinema was ever booked. An unlisted Vimeo link password 'laurel2024' was emailed 48 hours prior with only 2 total impressions."],
                "contentHash": "hash_st32_7"
            },
            {
                "id": "src_indiepitch",
                "url": "https://www.indiepitchconsulting.co.uk/services",
                "domain": "indiepitchconsulting.co.uk",
                "title": "IndiePitch Consulting Services & Rates",
                "sourceTier": 2,
                "retrievedAt": now_iso,
                "excerpts": ["Senior Jury Consultant: Benjamin Jones. Festival Rejection Recovery Pitch Audit: £120 per script."],
                "contentHash": "hash_ind_8"
            },
            {
                "id": "src_winners_archive",
                "url": "https://www.pincopallinofilmfestival.com/past-winners-2024-2025",
                "domain": "pincopallinofilmfestival.com",
                "title": "Pinco Pallino Past Editions Winners Archive",
                "sourceTier": 2,
                "retrievedAt": now_iso,
                "excerpts": ["2024 Best International Short: 'The Echo Chamber' directed by Martin Sterling. 2025 Best International Short: 'Shadow Puppets' directed by Martin Sterling."],
                "contentHash": "hash_win_9"
            },
            {
                "id": "src_arri_statement",
                "url": "https://twitter.com/ARRIChannel/status/1234567890",
                "domain": "twitter.com",
                "title": "ARRI Official Corporate Communications",
                "sourceTier": 1,
                "retrievedAt": now_iso,
                "excerpts": ["@PincoPallinoFest is not an authorized or official ARRI festival partner. We have issued a formal trademark cease-and-desist request for logo removal."],
                "contentHash": "hash_arri_10"
            },
            {
                "id": "src_trustpilot_reviews",
                "url": "https://www.trustpilot.com/review/pincopallino.com",
                "domain": "trustpilot.com",
                "title": "TrustPilot - Pinco Pallino Festival Reviews",
                "sourceTier": 3,
                "retrievedAt": now_iso,
                "excerpts": ["42 separate filmmaker reviews report zero communication for over a month past the stated notification date, followed by automated upsell templates."],
                "contentHash": "hash_tp_11"
            },
            {
                "id": "src_terms_conditions",
                "url": "https://www.pincopallinofilmfestival.com/terms-and-conditions",
                "domain": "pincopallinofilmfestival.com",
                "title": "Pinco Pallino Terms & Conditions - Section 4.2",
                "sourceTier": 2,
                "retrievedAt": now_iso,
                "excerpts": ["Section 4.2: All entry fees, trophy packaging fees, and review fees are strictly non-refundable regardless of screening format adaptations, venue changes, or program cancellations."],
                "contentHash": "hash_tc_12"
            }
        ],

        "dossier": {
            "executiveSummary": "Pinco Pallino Film Festival presents a concerning profile characterized by material conflicts of interest, predatory fee structures, and disavowed manufacturer affiliations. While the festival does execute private room bookings (including Genesis Cinema Studio 4 and BFI Southbank private hires), these physical screenings are severely restricted compared to promotional literature.\n\nOur investigation corroborated that 3 key organizers and jurors co-own an auxiliary media consulting firm actively upselling PR and script pitch reviews to rejected submitters within 48 hours of notification. Furthermore, anomalous award patterns reveal the same associate director winning the top prize in consecutive years (2024 and 2025). Filmmakers should exercise diligence.",
            
            "festivalOverview": "Established in 2021 in London, the Pinco Pallino Film Festival markets itself as an emerging international showcase for independent cinema. It claims over 3,000 annual entries and advertises 'Official Platinum Sponsorships' from ARRI and Sony Cinema.\n\nHowever, these sponsorships have been publicly disavowed by the manufacturers. The primary revenue driver is an aggressive fee escalation model, escalating from £28 to £95 in the final weeks, supplemented by £180 physical trophy packages. Screening logistics are verified but restricted in audience capacity.",
            
            "organizerProfile": "The entity was registered as 'Pallino Media Lab Ltd' via UK Companies House. Directors Arthur Smith and Benjamin Jones are listed on public records. \n\nPublic filings reveal that Pallino Media Lab Ltd was dissolved via compulsory strike-off on 14 March 2024 while continuing to accept entry fees. Multiple submitters reported receiving unsolicited marketing emails from IndiePitch Consulting offering paid rejection audits. Additionally, Director Arthur Smith holds an individual bankruptcy filing dating to November 2022.",
            
            "participantFeedback": "Aggregated sentiment across Reddit r/Filmmakers, TrustPilot, and Stage 32 is overwhelmingly cautionary (1.4/5 average score). The most frequent complaint (42 independent reports) centers on 3–5 week communication blackouts following payment processing.\n\nSecondary complaints focus on the screening format. Filmmakers accepted under 'Gala Premiere' categories reported receiving unlisted Vimeo links with single-digit view counts instead of physical cinema DCP projection.",
            
            "corporateEntity": {
                "legalName": "Pallino Media Lab Ltd",
                "registrationNumber": "13984712",
                "status": "Dissolved via Compulsory Strike-off (14 March 2024)",
                "incorporationDate": "12 April 2022",
                "registeredAddress": "71-75 Shelton Street, London, WC2H 9JQ, UK",
                "associatedFestivals": ["Pinco Pallino Film Festival", "Apex Short Film Arena", "London Indie Excellence Awards"],
                "connectedEntities": ["Pinco Pallino Film CIC", "IndiePitch Consulting", "Sterling Productions Ltd"],
                "flags": [
                    "Dissolved via Compulsory Strike-off",
                    "Virtual Mailbox Registered Address (Shelton Street)",
                    "Director Active Insolvency Notice"
                ],
                "notes": "Registered to a well-known virtual office address. Entity was dissolved on the public register while active festival cycles were open for submission fees."
            },

            "unresolvedQuestions": [
                "Why was the 'Best International Short' awarded to the exact same director (Martin Sterling) in both 2024 and 2025?",
                "How does the festival acquire filmmaker contact information to solicit paid IndiePitch Consulting packages?",
                "Where is the £180 trophy packaging fee allocated given the reported 4-week communication delays?"
            ],
            "filmmakerChecklist": [
                "Avoid late deadline fees (£95+); they provide no marginal selection benefit.",
                "Do not purchase unsolicited 'rejection audit' services from IndiePitch Consulting.",
                "Disregard the disavowed ARRI/Sony sponsorships when evaluating festival prestige.",
                "Request written confirmation of physical DCP screening room before attending."
            ],
            "previousEditions": [
                {
                    "year": 2024,
                    "editionNumber": "4th Annual Edition",
                    "heldLocation": "Genesis Cinema (Studio 4) & BFI Southbank (NFT3 private hire), London",
                    "heldDates": "October 12-14, 2024",
                    "awards": [
                        {
                            "awardName": "Grand Jury Prize (Best International Feature)",
                            "winnerTitle": "The Iron Threshold",
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
                            "headline": "London Indie Festival Announces 2024 Winners Amidst Venue Shift",
                            "publisher": "IndieWire Community Wire",
                            "url": "https://www.indiewire.com"
                        },
                        {
                            "headline": "Filmmakers Voice Mixed Reactions Following Genesis Cinema Screening",
                            "publisher": "Screen International Dispatch",
                            "url": "https://www.screendaily.com"
                        }
                    ],
                    "notes": "Official catalog listed 18 screened shorts and 2 features. Multiple attendees reported AV projection glitches in Studio 4."
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
                            "recipientName": "Martin Sterling",
                            "recipientAvatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
                            "winnerUrl": "https://www.imdb.com/title/tt1928472",
                            "imdbUrl": "https://www.imdb.com/name/nm5829104"
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
                            "recipientName": "Oliver Finch",
                            "recipientAvatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
                            "winnerUrl": "https://www.oliverfinchcinema.com",
                            "imdbUrl": "https://www.imdb.com/name/nm4829102"
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
                    "summary": "Aggressive 200% late fee spikes and questionable £180 trophy packaging add-ons.",
                    "signalsFound": ["£180 trophy package option", "£95 late fee", "No waivers policy"],
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
                    "name": "Arthur Smith",
                    "roles": ["Festival Director", "Co-Founder"],
                    "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
                    "linkedinUrl": "https://www.linkedin.com/in/arthur-smith-cinema",
                    "facebookUrl": "https://www.facebook.com/arthursmithfilm",
                    "websiteUrl": "https://arthursmithcinema.co.uk",
                    "twitterUrl": "https://twitter.com/arthursmithfilm",
                    "companiesHouseUrl": "https://find-and-update.company-information.service.gov.uk/company/13984712",
                    "companies": ["Pinco Pallino Film CIC", "Pallino Media Lab Ltd"],
                    "associatedFestivals": ["Pinco Pallino Film Festival", "Apex Short Film Arena"],
                    "isFestivalMillSuspect": True,
                    "hasDistributionOverlap": True,
                    "flags": ["Distribution Upsell Overlap", "2022 Insolvency Notice", "Shell Entity Director"],
                    "notes": "Co-director of Pallino Media Lab Ltd, upselling consulting packages to rejected applicants. Subject of a 2022 insolvency filing."
                },
                {
                    "name": "Benjamin Jones",
                    "roles": ["Jury Chair", "Senior Programmer"],
                    "avatarUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
                    "linkedinUrl": "https://www.linkedin.com/in/benjamin-jones-jury",
                    "websiteUrl": "https://benjaminjonesjury.com",
                    "imdbUrl": "https://www.imdb.com/name/nm2948192",
                    "companiesHouseUrl": "https://find-and-update.company-information.service.gov.uk/company/13984712",
                    "companies": ["IndiePitch Consulting", "Pallino Media Lab Ltd"],
                    "associatedFestivals": ["Pinco Pallino Film Festival"],
                    "isFestivalMillSuspect": False,
                    "hasDistributionOverlap": True,
                    "flags": ["Paid Pitch Consulting Upsell", "Directorship Conflict with Director"],
                    "notes": "Jury chair offering paid pitch consulting to submitters within 48 hours of their rejection. Shares directorship with Festival Director."
                },
                {
                    "name": "Martin Sterling",
                    "roles": ["Repeat Winner (2024 & 2025)", "Associate Producer"],
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
                    "flags": ["Anomalous Consecutive Winner (2024, 2025)", "Family Tie to Jury Chair"],
                    "notes": "Anomalous repeat winner of the top prize in consecutive years (2024, 2025) despite claimed 1.2% selection rate."
                }
            ],
            "generatedAt": now_iso
        }
    }
