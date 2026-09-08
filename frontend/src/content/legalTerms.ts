/**
 * Legal Content & Disclosures for Screened (totallyscreened.com).
 * Compliant with UK Data Protection Act 2018, EU GDPR, and UK PECR regulations.
 */

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export const TERMS_OF_SERVICE = {
  lastUpdated: "September 8, 2026",
  version: "1.0.0",
  title: "Screened Terms of Service",
  subtitle: "Terms and conditions governing the use of the Screened Cinema Intelligence Platform.",
  sections: [
    {
      title: "1. Nature of the Service & Investigative Scope",
      paragraphs: [
        "Screened (the \"Platform\", \"totallyscreened.com\") operates an autonomous intelligence pipeline that aggregates, cross-examines, and evaluates publicly accessible data regarding film festivals, awards bodies, venue bookings, and institutional cinema grants.",
        "The services provided by Screened are for informational and investigative research purposes only. Screened does not provide legal, financial, accounting, or formal theatrical distribution representation. Users must exercise their own independent judgment and due diligence before committing submission fees, entry contracts, or premiere rights."
      ]
    },
    {
      title: "2. Investigation Dossiers & Objective Evidence Standard",
      paragraphs: [
        "Screened evaluates subject entities against objective public records, including corporate registry filings (e.g. UK Companies House, OpenCorporates), verified commercial cinema venue box-office manifests, historical domain registration archives, and public community dispute records.",
        "Our forensic verdicts (SAFE, CAUTION, FLAGGED, CRITICAL_RISK) reflect verifiable factual corroboration. A \"SAFE\" verdict is an objective indicator of physical venue confirmation and active registry compliance; it does not guarantee film selection, awards, or commercial success.",
        "A \"FLAGGED\" or \"CRITICAL_RISK\" verdict identifies documented discrepancies between promotional representations and official public records. It does not constitute a criminal accusation or defamatory allegation. Organizers who wish to submit official documentation or lease agreements to update a dossier may do so via our official dispute intake channels."
      ]
    },
    {
      title: "3. Filmmaker Intellectual Property & Creative Asset Guarantee",
      paragraphs: [
        "Filmmakers frequently consult Screened with unproduced screenplays, treatments, director statements, and proprietary pitch decks. Screened guarantees that you retain 100% exclusive intellectual property ownership, copyright, and distribution rights over all materials uploaded to the Platform.",
        "Screened does not sell, license, share, or monetize filmmaker creative assets. Uploaded documents are processed strictly within ephemeral, non-training computing boundaries and are never utilized to train external or public foundation artificial intelligence models."
      ]
    },
    {
      title: "4. Permissible Use & Platform Guardrails",
      paragraphs: [
        "Users agree to use Screened solely in compliance with applicable local, national, and international laws. You agree not to: (a) conduct denial-of-service attacks or deliberately circumvent rate-limiting mechanisms; (b) utilize Screened's Open MCP or WebMCP endpoints to execute abusive, automated scraping against target festivals; (c) impersonate filmmakers, festivals, or industry personnel; or (d) reverse engineer or disrupt the secure operational integrity of the Platform.",
        "To protect computational infrastructure and upstream registries, Screened enforces strict rate limits (60 read requests per minute; 3 deep forensic investigations per hour for unauthenticated sessions)."
      ]
    },
    {
      title: "5. Limitation of Liability & Warranty Disclaimer",
      paragraphs: [
        "The Platform and all investigative intelligence are provided on an \"AS IS\" and \"AS AVAILABLE\" basis without warranties of any kind, whether express, implied, statutory, or otherwise.",
        "To the fullest extent permitted by law, Screened, its maintainers, contributors, and technology partners shall not be liable for any direct, indirect, incidental, consequential, special, or exemplary damages, including but not limited to loss of entry fees, unreturned festival submission costs, lost premiere opportunities, or commercial disruptions arising from reliance on the Platform."
      ]
    },
    {
      title: "6. Governing Law & Dispute Resolution",
      paragraphs: [
        "These Terms of Service and any dispute or claim arising out of or in connection with them or their subject matter shall be governed by and construed in accordance with the laws of England and Wales.",
        "If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect."
      ]
    }
  ]
};

export const PRIVACY_POLICY = {
  lastUpdated: "September 8, 2026",
  version: "1.0.0",
  title: "Screened Privacy Policy",
  subtitle: "How Screened protects your creative work, respects data minimization, and handles personal information.",
  sections: [
    {
      title: "1. Data Controller & Contact Information",
      paragraphs: [
        "The data controller responsible for the processing of your personal data on Screened (totallyscreened.com) is the Screened Engineering Team.",
        "If you have any questions regarding your personal data, wish to exercise your statutory rights under GDPR or the UK Data Protection Act 2018, or wish to request data erasure, please contact us at privacy@totallyscreened.com."
      ]
    },
    {
      title: "2. Personal Data We Collect & Lawful Basis",
      paragraphs: [
        "We operate under the fundamental principle of DATA MINIMIZATION. We collect only what is strictly necessary to deliver our cinema intelligence services:",
        "• Conversational Queries & Document Uploads: When you interact with Screened AI Chat or upload treatment PDFs, text is processed in memory to fulfill your request. Lawful basis: Legitimate interest in providing real-time due diligence and grant assistance.",
        "• Email Notifications: If you choose to subscribe to notification alerts for long-running investigations, your email address is stored temporarily. Lawful basis: Your explicit consent (GDPR Art. 6(1)(a)).",
        "• Performance & Telemetry Data: Anonymized interaction metrics (page visits, feature utilization). Lawful basis: Explicit opt-in consent for analytics cookies under PECR and GDPR."
      ]
    },
    {
      title: "3. Third-Party Sub-Processors & Data Flow",
      paragraphs: [
        "Screened relies on select enterprise cloud infrastructure and specialized APIs to execute investigations:",
        "1. Google Cloud Platform (europe-west2, London): Cloud Run for serverless execution, Firestore for state caching, and Vertex AI (Gemini 2.5 Pro & Flash) for structured reasoning. Google Cloud enterprise commitments guarantee customer data is not utilized to train foundation models.",
        "2. Parallel Systems Inc. (Parallel Search API): Provides web retrieval and primary registry grounding. Only public festival entity names and venue search strings are dispatched; confidential screenplays are never forwarded.",
        "3. SendGrid (Twilio Inc.): Transactional email delivery when the user explicitly requests an investigation completion email.",
        "4. Google Analytics 4 (Google LLC): Opt-in anonymized telemetry with IP masking enabled, activated only upon user consent."
      ]
    },
    {
      title: "4. Data Retention Lifecycles & Automatic Purging",
      paragraphs: [
        "We do not store your personal data indefinitely:",
        "• Investigation Notification Emails: Email addresses collected for dossier alerts are permanently deleted immediately after the notification email is delivered, or purged automatically after 7 days.",
        "• Chat Sessions: Inactive chat conversations expire and are automatically evicted from our storage records after 30 days.",
        "• Public Evidence Dossiers: Synthesized dossiers contain only publicly corroborated evidence regarding corporate entities and public screening venues. No filmmaker personal identifiers are retained in public dossiers."
      ]
    },
    {
      title: "5. Your Rights Under GDPR & UK DPA 2018",
      paragraphs: [
        "You possess fundamental statutory rights concerning your personal data:",
        "• Right of Access & Portability: You may export complete archival records of your dossiers at any time.",
        "• Right to Erasure (\"Right to be Forgotten\"): You have the right to request the permanent deletion of your email address, feedback, or session data by contacting privacy@totallyscreened.com or utilizing our automated erasure tools.",
        "• Right to Withdraw Consent: You can modify or withdraw your analytics cookie preferences at any time via the \"Cookie Settings\" option in the footer."
      ]
    }
  ]
};

export const COOKIE_POLICY = {
  lastUpdated: "September 8, 2026",
  title: "Screened Cookie & Local Storage Policy",
  summary: "Screened uses strictly necessary local storage to provide the interface, and optional anonymized analytics cookies to measure platform performance.",
  categories: [
    {
      name: "Strictly Necessary Storage (Always Active)",
      description: "Required for core functionality, UI display preferences, and accessibility settings. These do not track you across other websites.",
      items: [
        { key: "screened_theme", purpose: "Saves your Darkroom / Light visual theme preference.", duration: "Persistent (Local Storage)" },
        { key: "screened_audio_muted", purpose: "Saves your Web Audio sound effects mute state.", duration: "Persistent (Local Storage)" },
        { key: "screened_cookie_consent", purpose: "Remembers your cookie consent choice.", duration: "1 Year (Local Storage)" }
      ]
    },
    {
      name: "Performance & Analytics Cookies (Opt-In Only)",
      description: "Help us understand platform usage patterns to improve response times and multi-agent pipeline stability. Only loaded after you grant consent.",
      items: [
        { key: "_ga, _ga_*", purpose: "Google Analytics 4 cookies with IP anonymization enabled.", duration: "Up to 2 Years" }
      ]
    }
  ]
};
