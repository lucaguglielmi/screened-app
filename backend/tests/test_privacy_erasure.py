import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.db.firestore import db


@pytest.mark.asyncio
async def test_privacy_erasure_requires_identifier():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/privacy/erase", json={})
        assert res.status_code == 400
        assert "Either 'email' or 'sessionId' must be provided" in res.json()["detail"]


@pytest.mark.asyncio
async def test_privacy_erasure_email_and_session():
    # 1. Seed an investigation with a notification email
    inv_id = "test_inv_privacy_001"
    test_email = "filmmaker@indiefilm.org"
    await db.save_investigation(inv_id, {
        "id": inv_id,
        "festivalName": "Test Privacy Fest",
        "notificationEmail": test_email,
        "userId": "user_privacy_123",
    })

    # Verify seed
    inv = await db.get_investigation(inv_id)
    assert inv is not None
    assert inv.get("notificationEmail") == test_email

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 2. Erase by email
        res = await client.post("/api/privacy/erase", json={"email": test_email})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ERASED"
        assert data["erasedRecordsCount"] >= 1
        assert "GDPR Art. 17" in data["message"]

        # Verify email is scrubbed
        inv_after = await db.get_investigation(inv_id)
        assert inv_after.get("notificationEmail") is None

        # 3. Erase by session_id
        res_session = await client.post("/api/privacy/erase", json={"sessionId": inv_id})
        assert res_session.status_code == 200
        assert res_session.json()["status"] == "ERASED"
        inv_after_session = await db.get_investigation(inv_id)
        assert inv_after_session.get("userId") is None
