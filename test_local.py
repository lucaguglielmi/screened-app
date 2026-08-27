import asyncio
from backend.main import app
from fastapi.testclient import TestClient

client = TestClient(app)
response = client.get("/api/architecture/agent-tree")
print(response.status_code)
print(response.json())
