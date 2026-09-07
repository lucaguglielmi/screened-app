import pytest
from unittest.mock import patch, MagicMock
from backend.orchestrator.state_machine import enqueue_task

def test_enqueue_task_worker_url():
    with patch("backend.orchestrator.state_machine.tasks_client", new_callable=MagicMock) as mock_client:
        with patch("backend.orchestrator.state_machine.QUEUE_PATH", "fake/path"):
            with patch("os.environ.get", return_value="https://my-worker-url.com"):
                enqueue_task("/api/test", {"data": "test"}, None)
                
                mock_client.create_task.assert_called_once()
                call_args = mock_client.create_task.call_args[1]["request"]["task"]["http_request"]
                assert call_args["url"] == "https://my-worker-url.com/api/test"


def test_internal_task_auth_rejected_in_production():
    from fastapi.testclient import TestClient
    from backend.main import app
    client = TestClient(app)

    with patch.dict("os.environ", {"ENVIRONMENT": "production", "INTERNAL_TASK_SECRET": "my-secret"}):
        resp = client.post("/api/internal/tasks/disambiguate", json={"investigation_id": "test", "query": "test"})
        assert resp.status_code == 403


def test_internal_task_auth_accepted_with_secret():
    from fastapi.testclient import TestClient
    from backend.main import app
    client = TestClient(app)

    with patch.dict("os.environ", {"ENVIRONMENT": "production", "INTERNAL_TASK_SECRET": "my-secret"}):
        with patch("backend.main.orchestrator._run_disambiguation") as mock_disambig:
            mock_disambig.return_value = None
            resp = client.post(
                "/api/internal/tasks/disambiguate",
                json={"investigation_id": "test", "query": "test"},
                headers={"X-Internal-Task-Secret": "my-secret"}
            )
            assert resp.status_code == 200
            assert resp.json() == {"status": "ok"}


def test_internal_task_auth_accepted_with_queue_header():
    from fastapi.testclient import TestClient
    from backend.main import app
    client = TestClient(app)

    with patch.dict("os.environ", {"ENVIRONMENT": "production", "CLOUD_TASKS_QUEUE": "projects/p/locations/l/queues/screened-queue"}):
        with patch("backend.main.orchestrator._run_disambiguation") as mock_disambig:
            mock_disambig.return_value = None
            resp = client.post(
                "/api/internal/tasks/disambiguate",
                json={"investigation_id": "test", "query": "test"},
                headers={"X-CloudTasks-QueueName": "projects/p/locations/l/queues/screened-queue"}
            )
            assert resp.status_code == 200
            assert resp.json() == {"status": "ok"}

