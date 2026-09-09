import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from backend.main import app
from backend.utils.security import get_real_client_ip
from backend.utils.correlation import SAFE_CORRELATION_ID_REGEX


class DummyClient:
    def __init__(self, host: str):
        self.host = host


class DummyRequest:
    def __init__(self, headers: dict = None, host: str = "127.0.0.1"):
        self.headers = headers or {}
        self.client = DummyClient(host)


def test_get_real_client_ip_direct():
    req = DummyRequest(host="192.0.2.1")
    assert get_real_client_ip(req) == "192.0.2.1"


def test_get_real_client_ip_cloudflare_precedence():
    req = DummyRequest(
        headers={"cf-connecting-ip": "93.184.216.34", "x-forwarded-for": "82.165.197.1"},
        host="10.0.0.2",
    )
    assert get_real_client_ip(req) == "93.184.216.34"


def test_get_real_client_ip_anti_spoofing_right_to_left():
    # Attacker forged "8.8.8.8" on the left; GFE appended "93.184.216.34", internal hop "10.0.0.1"
    req = DummyRequest(
        headers={"x-forwarded-for": "8.8.8.8, 93.184.216.34, 10.0.0.1"},
        host="169.254.8.1",
    )
    # Must skip internal 10.0.0.1 and pick the verified public IP 93.184.216.34 (not spoofed 8.8.8.8)
    assert get_real_client_ip(req) == "93.184.216.34"


def test_correlation_id_regex():
    assert SAFE_CORRELATION_ID_REGEX.match("valid-uuid-1234_test")
    assert not SAFE_CORRELATION_ID_REGEX.match("bad\r\nHeader: Injection")
    assert not SAFE_CORRELATION_ID_REGEX.match("a" * 65)


def test_correlation_id_middleware_and_capacity_endpoint():
    client = TestClient(app)
    
    # 1. Test valid correlation ID propagation
    custom_id = "test-correlation-uuid-999"
    resp = client.get("/api/diagnostics/capacity", headers={"X-Correlation-ID": custom_id})
    assert resp.status_code == 200
    assert resp.headers.get("X-Correlation-ID") == custom_id
    
    data = resp.json()
    assert data["status"] == "HEALTHY"
    assert "activeSseClients" in data
    assert "memoryRssMb" in data
    assert data["correlationId"] == custom_id

    # 2. Test malicious correlation ID sanitization
    malicious_id = "malicious\r\ninjected: true"
    resp2 = client.get("/api/diagnostics/capacity", headers={"X-Correlation-ID": malicious_id})
    assert resp2.status_code == 200
    returned_id = resp2.headers.get("X-Correlation-ID")
    assert returned_id != malicious_id
    assert SAFE_CORRELATION_ID_REGEX.match(returned_id)
