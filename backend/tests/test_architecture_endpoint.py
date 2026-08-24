import pytest
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)

def test_architecture_endpoint():
    response = client.get("/api/architecture/agent-tree")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    
    nodes = data["nodes"]
    assert len(nodes) > 0
    
    # Check that orchestrator is present
    orchestrator = next((n for n in nodes if n["id"] == "orchestrator"), None)
    assert orchestrator is not None
    assert orchestrator["type"] == "SequentialAgent"
    
    # Check that opportunity_scout is present
    opportunity_scout = next((n for n in nodes if n["id"] == "opportunity_scout"), None)
    assert opportunity_scout is not None
    assert opportunity_scout["type"] == "LlmAgent"
    assert opportunity_scout["parent"] == "orchestrator"
