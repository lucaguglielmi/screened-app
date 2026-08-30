"""Unit tests for Screened notification service and background alert endpoints."""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.email_service import email_service

client = TestClient(app)


def test_notification_subscription_endpoint():
    res = client.post(
        "/api/investigations/demo_pinco_pallino/notifications",
        json={"email": "filmmaker@example.com"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"


def test_email_template_contains_required_testing_disclaimer():
    html = email_service.generate_completion_html(
        festival_name="London Independent Film Awards",
        investigation_id="inv_test_123"
    )
    
    # Verify mandatory testing notice wording
    assert "Please note that the festival research functionality is fully working but still in test" in html
    assert "may commit mistakes and give information that requires further validation from you" in html
    assert "inv_test_123" in html
    assert "London Independent Film Awards" in html


@pytest.mark.asyncio
async def test_email_service_send_completion_email():
    success = await email_service.send_completion_email(
        to_email="test.producer@screened.test",
        festival_name="Raindance Film Festival",
        investigation_id="inv_raindance_999"
    )
    assert success is True
