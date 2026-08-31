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


@pytest.mark.asyncio
async def test_sse_disconnect_does_not_cancel_background_task():
    """Verify that when client disconnects from SSE (e.g. mobile phone locked), background task continues running."""
    import asyncio
    from backend.orchestrator.events import broadcaster
    from backend.orchestrator.state_machine import orchestrator

    inv_id = "test_resilient_bg_task"
    
    # Mock a running background task
    async def dummy_work():
        await asyncio.sleep(5)

    task = asyncio.create_task(dummy_work())
    orchestrator._running_tasks[inv_id] = task

    # Client subscribes to SSE
    queue = await broadcaster.subscribe(inv_id)
    assert inv_id in broadcaster._listeners

    # Client disconnects (locks phone / closes tab)
    broadcaster.unsubscribe(inv_id, queue)
    assert inv_id not in broadcaster._listeners

    # Verify background task is still running and was NOT cancelled
    assert not task.cancelled()
    assert not task.done()

    # Clean up dummy task
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

