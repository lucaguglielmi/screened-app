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
