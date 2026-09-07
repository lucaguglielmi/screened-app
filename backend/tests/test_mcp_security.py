"""Tests for MCP security utilities (SSRF, indirect prompt injection quarantine, rate limiting)."""
import pytest
from backend.utils.security import (
    validate_public_url,
    quarantine_external_evidence,
    sanitize_agent_query,
)
from backend.utils.rate_limiter import TieredRateLimiter


def test_validate_public_url_allows_valid_http():
    assert validate_public_url("https://filmfreeway.com/festivals") is True
    assert validate_public_url("http://example.com") is True


def test_validate_public_url_blocks_schemes():
    with pytest.raises(ValueError, match="scheme"):
        validate_public_url("file:///etc/passwd")

    with pytest.raises(ValueError, match="scheme"):
        validate_public_url("ftp://server/resource")


def test_validate_public_url_blocks_private_and_metadata_ips():
    # Direct loopback IP
    with pytest.raises(PermissionError):
        validate_public_url("http://127.0.0.1/admin")

    # Cloud metadata service (AWS/GCP)
    with pytest.raises(PermissionError):
        validate_public_url("http://169.254.169.254/computeMetadata/v1/")

    # Private network RFC-1918
    with pytest.raises(PermissionError):
        validate_public_url("http://10.0.0.1/dashboard")

    with pytest.raises(PermissionError):
        validate_public_url("http://192.168.1.1/")


def test_validate_public_url_blocks_non_standard_ports():
    with pytest.raises(ValueError, match="Disallowed port"):
        validate_public_url("http://example.com:22/ssh")

    with pytest.raises(ValueError, match="Disallowed port"):
        validate_public_url("https://example.com:3306/db")


def test_quarantine_external_evidence_strips_invisible_unicode():
    raw_text = "Legit\u200bimate\ufeff Festival Claims"
    quarantined = quarantine_external_evidence(raw_text, "test_source")
    assert "\u200b" not in quarantined
    assert "\ufeff" not in quarantined
    assert "Legitimate Festival Claims" in quarantined
    assert '<untrusted_evidence_data source="test_source">' in quarantined
    assert "</untrusted_evidence_data>" in quarantined


def test_quarantine_external_evidence_escapes_html():
    raw_malicious = '<script>alert("pwned")</script> <b>Bold</b>'
    quarantined = quarantine_external_evidence(raw_malicious)
    assert "<script>" not in quarantined
    assert "&lt;script&gt;" in quarantined
    assert "&lt;b&gt;" in quarantined


def test_sanitize_agent_query():
    dirty = "Hello\u200cWorld! " + "A" * 600
    cleaned = sanitize_agent_query(dirty, max_length=50)
    assert len(cleaned) <= 50
    assert "\u200c" not in cleaned
    assert cleaned.startswith("HelloWorld!")


def test_tiered_rate_limiter():
    limiter = TieredRateLimiter()
    # Test bucket with 2 capacity and 1/sec
    limiter.TIER_CONFIGS["TEST"] = (2, 0.1)

    allowed1, retry1 = limiter.check("client_1", "TEST")
    assert allowed1 is True
    assert retry1 == 0

    allowed2, retry2 = limiter.check("client_1", "TEST")
    assert allowed2 is True

    # Third should be blocked
    allowed3, retry3 = limiter.check("client_1", "TEST")
    assert allowed3 is False
    assert retry3 > 0

    # Another client is not blocked
    allowed_other, _ = limiter.check("client_2", "TEST")
    assert allowed_other is True
