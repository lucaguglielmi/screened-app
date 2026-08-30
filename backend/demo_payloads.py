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
    yield format_event("PLANNING_STARTED", "Formulating parallel investigation strategy across 3 core domains...")
    await asyncio.sleep(1.5)
    yield format_event("PLANNING_STEP", "Identifying target research domains: Corporate Shells, Venue Verification, Filmmaker Sentiment...", {"queriesCount": 6, "sourcesCount": 4})
    await asyncio.sleep(2.0)
    yield format_event("PLANNING_STEP", "Found candidate entity. Ready for confirmation.", {"candidates": get_demo_investigation()["candidates"], "sourcesCount": 6})
    await asyncio.sleep(1.5)

    # Stage 2: Researching (5s)
    yield format_event("DOMAIN_SEARCH_STARTED", "Dispatching parallel sub-agents across 18 public and commercial sources...", {"sourcesCount": 18, "queriesCount": 6})
    await asyncio.sleep(1.25)
    yield format_event("AGENT_UPDATE", "VenueAgent: Harvested BFI Southbank & Genesis Cinema box office manifests (4 sources).", {"agent": "VenueAgent", "sourcesCount": 8, "claimsCount": 3})
    await asyncio.sleep(1.25)
    yield format_event("AGENT_UPDATE", "CorporateAgent: Retrieved Companies House & London Gazette filings for Pallino Media Lab (5 sources).", {"agent": "CorporateAgent", "sourcesCount": 14, "claimsCount": 6})
    await asyncio.sleep(1.25)
    yield format_event("AGENT_UPDATE", "SentimentAgent: Aggregated 42+ filmmaker testimonies from Reddit r/Filmmakers, Stage 32 & TrustPilot (9 sources).", {"agent": "SentimentAgent", "sourcesCount": 18, "claimsCount": 10})
    await asyncio.sleep(1.25)

    # Stage 3: Analyzing (5s)
    yield format_event("CONTRADICTIONS_ANALYZING", "Cross-referencing 10 atomic claims against 18 multi-domain sources...", {"sourcesCount": 18, "claimsCount": 10, "contradictionsCount": 4})
    await asyncio.sleep(1.5)
    yield format_event("AGENT_UPDATE", "VerificationAgent: Verified manufacturer sponsorship disavowals with ARRI & Sony.", {"agent": "VerificationAgent", "sourcesCount": 18, "claimsCount": 10})
    await asyncio.sleep(1.5)
    yield format_event("AGENT_UPDATE", "FraudAgent: Flagged conflict of interest anomaly in jury records & consulting upsells.", {"agent": "FraudAgent", "sourcesCount": 18, "claimsCount": 10, "contradictionsCount": 4})
    await asyncio.sleep(2.0)

    # Stage 4: Synthesizing (5s)
    yield format_event("DOSSIER_SYNTHESIZING", "Assembling finalized evidence dossier with 18 verified sources and 10 claims...", {"sourcesCount": 18, "claimsCount": 10, "contradictionsCount": 4})
    await asyncio.sleep(1.5)
    yield format_event("AGENT_UPDATE", "SynthesisAgent: Finalizing full forensic dossier and executive summary.", {"agent": "SynthesisAgent", "sourcesCount": 18, "claimsCount": 10})
    await asyncio.sleep(2.0)
    yield format_event("AGENT_UPDATE", "SynthesisAgent: Reviewing final output for accuracy and source citations...", {"agent": "SynthesisAgent", "sourcesCount": 18, "claimsCount": 10})
    await asyncio.sleep(1.5)

    # Complete
    yield format_event("DOSSIER_READY", "Investigation complete. Generating final dossier.", {"sourcesCount": 18, "claimsCount": 10, "contradictionsCount": 4})


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
                        "sourceUrl": "https://filmfreeway.com/PincoPallinoFilmFestival",
                        "sourceDomain": "filmfreeway.com",
                        "sourceTitle": "FilmFreeway - Extended Late Deadline Notice",
                        "stance": "CONTRADICTS",
                        "exactExcerpt": "Extended Late Deadline fee: £85 (Strictly no fee waivers, student discounts, or hardship exemptions granted in final 10 days).",
                        "snippet": "Extended Late Deadline fee: £85 (Strictly no fee waivers, student discounts, or hardship exemptions granted in final 10 days)."
                    }
                ],
                "guidance": "Medium Risk. The 200% price spike in the final 10 days is an extractive financial mechanism designed to harvest panic submissions."
            },
            {
                "id": "disp_winner",
                "pointOfContention": "Competitive Integrity & Repeat Winners",
                "category": "JURY_AWARDS",
                "claimA": "The festival claims to receive over 3,000 global submissions per cycle, boasting a hyper-competitive 1.2% acceptance rate.",
                "evidenceA": [
                    {
                        "sourceId": "src_about_stats",
                        "sourceUrl": "https://pincopallino.com/about",
                        "sourceDomain": "pincopallino.com",
                        "sourceTitle": "Pinco Pallino Official About & Submissions Statistics",
                        "stance": "SUPPORTS",
                        "exactExcerpt": "With over 3,000 entries from 75 countries annually, securing an official selection or laurel at Pinco Pallino is an elite international achievement.",
                        "snippet": "With over 3,000 entries from 75 countries annually, securing an official selection or laurel at Pinco Pallino is an elite international achievement."
                    }
                ],
                "claimB": "The same local director, Martin Sterling, won the 'Best International Short' award twice in a row (2024 and 2025).",
                "evidenceB": [
                    {
                        "sourceId": "src_imdb_awards",
                        "sourceUrl": "https://www.imdb.com/event/ev0028912/2025/1",
                        "sourceDomain": "imdb.com",
                        "sourceTitle": "IMDb - Pinco Pallino London Awards 2024-2025",
                        "stance": "CONTRADICTS",
                        "exactExcerpt": "2025 Winner Best International Short: 'Midnight Call' directed by Martin Sterling (also awarded Best Short 2024 by the same jury panel).",
                        "snippet": "2025 Winner Best International Short: 'Midnight Call' directed by Martin Sterling (also awarded Best Short 2024 by the same jury panel)."
                    }
                ],
                "guidance": "High Risk. Given the claimed 3,000+ global submissions, consecutive back-to-back category wins by an insider associate severely undermine competitive legitimacy."
            },
            {
                "id": "disp_sponsors",
                "pointOfContention": "Fabricated Brand Partnerships",
                "category": "ORGANIZER_TRACK_RECORD",
                "claimA": "The festival lists Sony Cinema and ARRI as 'Official Platinum Sponsors'.",
                "evidenceA": [
                    {
                        "sourceId": "src_sponsors_page",
                        "sourceUrl": "https://pincopallino.com/sponsors",
                        "sourceDomain": "pincopallino.com",
                        "sourceTitle": "Pinco Pallino Partners & Corporate Sponsorships",
                        "stance": "SUPPORTS",
                        "exactExcerpt": "Official Platinum Industry Partners: Sony Professional Cinema Solutions, ARRI Rental UK, Blackmagic Design.",
                        "snippet": "Official Platinum Industry Partners: Sony Professional Cinema Solutions, ARRI Rental UK, Blackmagic Design."
                    }
                ],
                "claimB": "ARRI PR confirmed via official public statement they have no affiliation with the festival.",
                "evidenceB": [
                    {
                        "sourceId": "src_arri_statement",
                        "sourceUrl": "https://twitter.com/ARRIChannel/status/17849120489",
                        "sourceDomain": "twitter.com",
                        "sourceTitle": "ARRI Channel Official Statement",
                        "stance": "CONTRADICTS",
                        "exactExcerpt": "@ARRIChannel: Pinco Pallino Film Festival is not an authorized ARRI partner or sponsored event. We have issued a formal notice requesting unauthorized logo removal.",
                        "snippet": "@ARRIChannel: Pinco Pallino Film Festival is not an authorized ARRI partner or sponsored event. We have issued a formal notice requesting unauthorized logo removal."
                    }
                ],
                "guidance": "High Risk. Falsely claiming tier-1 cinema camera manufacturer sponsorships is a deceptive marketing practice and a hallmark of predatory festivals."
            }
        ],
        
        "claims": [
            {
                "id": "claim_1",
                "investigationId": DEMO_INVESTIGATION_ID,
                "researchDomain": "VENUES",
                "category": "VENUE_SCREENINGS",
                "statement": "Festival advertises theatrical West End gala screenings at BFI Southbank (Belvedere Rd, London SE1 8XT).",
                "claimKind": "FACT",
                "status": "DISPUTED",
                "editionYear": 2025,
                "attributedTo": "Pinco Pallino Festival Website",
                "evidence": [
                    {
                        "sourceId": "src_bfi_calendar",
                        "sourceUrl": "https://www.bfi.org.uk/venue-hire/southbank/calendar-2025",
                        "sourceDomain": "bfi.org.uk",
                        "sourceTitle": "BFI Southbank Public Event Manifest & Venue Hire Schedule",
                        "stance": "CONTRADICTS",
                        "exactExcerpt": "BFI Southbank NFT1/NFT2/NFT3 screening manifests for October 12-14 show zero bookings for 'Pinco Pallino Film Festival'. The venue is leased to BFI London Film Festival events.",
                        "note": "Cinema box office records directly contradict claimed West End theatrical screening booking."
                    },
                    {
                        "sourceId": "src_ff_overview",
                        "sourceUrl": "https://www.filmfreeway.com/PincoPallinoFilmFestival",
                        "sourceDomain": "filmfreeway.com",
                        "sourceTitle": "Pinco Pallino London Submissions Page",
                        "stance": "SUPPORTS",
                        "exactExcerpt": "All selected short and feature films will be screened on the big screen at the legendary BFI Southbank in Central London followed by an industry red-carpet awards reception.",
                        "note": "Promotional claim made directly to submitting filmmakers."
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
        ],

        "sources": [
            {
                "id": "src_bfi_calendar",
                "url": "https://www.bfi.org.uk/venue-hire/southbank/calendar-2025",
                "domain": "bfi.org.uk",
                "title": "BFI Southbank Venue Hire & Event Manifest Archive",
                "sourceTier": 1,
                "retrievedAt": now_iso,
                "excerpts": ["BFI Southbank NFT1/NFT2/NFT3 screening manifests for October 12-14 show zero bookings for 'Pinco Pallino Film Festival'."],
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
            "executiveSummary": "Pinco Pallino Film Festival presents a highly concerning profile characterized by severe conflicts of interest, predatory fee structures, and fabricated industry affiliations. While the festival does hold legitimate physical screenings at verified locations (including BFI Southbank private hires), these events serve largely as a front for extractive financial practices.\n\nOur investigation uncovered that 3 key jury members concurrently operate a media consulting firm that actively upsells PR and distribution services to rejected applicants. Furthermore, the festival's claim of a hyper-competitive 1.2% acceptance rate is mathematically implausible and directly contradicted by anomalous award patterns, notably the same local director winning the top prize in consecutive years. Filmmakers should approach with extreme caution.",
            
            "festivalOverview": "Established 4 years ago in London, the Pinco Pallino Film Festival markets itself as a premier independent showcase for emerging global talent. It claims to receive over 3,000 submissions annually and boasts 'Official Platinum Sponsorships' from tier-1 industry giants like Sony Cinema and ARRI. \n\nHowever, these sponsorships have been publicly disavowed by the brands in question. The festival's primary revenue driver appears to be an aggressive submission fee escalation model, jumping from £28 to £85 in the final weeks, supplemented by a £150 'Expedited Judging' add-on. Screening logistics are verified, but community feedback describes them as disorganized and poorly attended.",
            
            "organizerProfile": "The entity is registered as 'Pinco Pallino Film CIC' via Companies House. The core leadership trio—A. Smith, B. Jones, and C. Davis—are listed as active directors. \n\nFinancial and corporate records reveal that these same directors are the sole proprietors of 'Pallino Media Lab Ltd.', a private consulting firm. Multiple whistleblower accounts from filmmakers indicate that within 48 hours of receiving a festival rejection letter, they receive unsolicited marketing emails from Pallino Media Lab offering paid 'distribution consultation' packages. Additionally, Director A. Smith holds an active insolvency notice filed in 2022.",
            
            "participantFeedback": "Aggregated sentiment across Reddit, TrustPilot, and FilmFreeway reviews is overwhelmingly negative, generating a high volume of community red flags. The most frequent complaint (42 independent reports) centers on severe communication blackouts, with filmmakers citing 3 to 5 week delays past the official notification date.\n\nSecondary complaints focus on the physical screening experience. Despite the prestigious venue names, filmmakers report that the actual screenings were relegated to secondary, unequipped basement rooms with frequent audio-visual failures and no attending industry professionals or press.",
            
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
                    "Shell Entity Registered Address (Shelton Street)",
                    "Director Active Insolvency Notice"
                ],
                "notes": "Registered to a well-known virtual office address often associated with shell companies. Entity was struck off the register while continuing to collect festival entry fees."
            },

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
                            "winnerUrl": "https://www.imdb.com/title/tt2948194"
                        },
                        {
                            "awardName": "Best Cinematography Short",
                            "winnerTitle": "Echoes in Amber",
                            "recipientName": "Chloe Laurent",
                            "winnerUrl": "https://chloelaurentfilm.com"
                        },
                        {
                            "awardName": "Special Director's Discovery Award",
                            "winnerTitle": "Submerged Voices",
                            "recipientName": "Tariq Mansoor",
                            "winnerUrl": "https://www.imdb.com/title/tt3819201"
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
                            "winnerUrl": "https://www.imdb.com/title/tt1928472"
                        },
                        {
                            "awardName": "Best Student Documentary",
                            "winnerTitle": "Under The Flyover",
                            "recipientName": "Sarah Jenkins",
                            "winnerUrl": "https://sarahjenkinsdocs.co.uk"
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
                            "winnerUrl": "https://www.oliverfinchcinema.com"
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
                    "notes": "Co-director of Pallino Media Lab Ltd, aggressively upselling distribution packages to rejected applicants. Subject of a 2022 insolvency filing."
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
                    "notes": "Anomalous repeat winner of the top prize in consecutive years (2024, 2025) despite the claimed 1.2% selection rate. Reddit threads indicate familial relationship to Jury Chair."
                }
            ],
            "generatedAt": now_iso
        }
    }
