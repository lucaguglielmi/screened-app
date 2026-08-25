"""Source tier definitions and domain policies for Parallel Search and Task APIs."""

# Tier 1: Official government / company registries, major trade publications
TIER_1_DOMAINS = {
    "companieshouse.gov.uk",
    "gov.uk",
    "find-and-update.company-information.service.gov.uk",
    "bfi.org.uk",
    "variety.com",
    "hollywoodreporter.com",
    "screendaily.com",
    "deadline.com",
    "imdb.com",
    "opencorporates.com"
}

# Tier 3: Anonymous forums, social platforms, blog comments
TIER_3_DOMAINS = {
    "reddit.com",
    "quora.com",
    "medium.com",
    "facebook.com",
    "twitter.com",
    "x.com",
    "tiktok.com"
}

# Deep Vetting Domain Policies
CORPORATE_IDENTITY_DOMAINS = [
    "companieshouse.gov.uk",
    "gov.uk",
    "find-and-update.company-information.service.gov.uk",
    "opencorporates.com"
]

DOMAIN_FORENSICS_DOMAINS = [
    "crt.sh",
    "whois.com",
    "icann.org",
    "lookup.icann.org"
]

VENUE_REALITY_DOMAINS = [
    "timeout.com",
    "google.com/maps",
    "yelp.com"
]

PERSONNEL_DOSSIER_DOMAINS = [
    "variety.com",
    "hollywoodreporter.com",
    "screendaily.com",
    "deadline.com",
    "imdb.com",
    "linkedin.com"
]

def determine_source_tier(domain: str) -> int:
    """Determine the credibility tier of a given domain (1=Highest, 2=Standard, 3=Low)."""
    domain_lower = domain.lower()
    for t1 in TIER_1_DOMAINS:
        if domain_lower == t1 or domain_lower.endswith("." + t1):
            return 1
    for t3 in TIER_3_DOMAINS:
        if domain_lower == t3 or domain_lower.endswith("." + t3):
            return 3
    return 2
