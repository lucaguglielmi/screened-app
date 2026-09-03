import os
import pytest
import json
from unittest.mock import AsyncMock, patch, MagicMock
from google.genai import types

# Force dummy API key so Google LLM doesn't crash on init during tests if no real key is set
if "GEMINI_API_KEY" not in os.environ:
    os.environ["GEMINI_API_KEY"] = "dummy-offline-key"

# Ensure tests always use in-memory database store and never write to live production Firestore
from backend.db.firestore import db
db.use_memory = True

def is_vcr_enabled(config=None) -> bool:
    """Determine if VCR record/replay is enabled via CLI option or environment variable."""
    if config is not None:
        try:
            if config.getoption("--disable-vcr", default=False):
                return False
            if config.getoption("--use-vcr", default=False):
                return True
        except (ValueError, AttributeError):
            pass
    val = os.getenv("SCREENED_VCR_ENABLED", "").strip().lower()
    return val in ("1", "true", "yes", "on")

def pytest_addoption(parser):
    """Register CLI options for toggling VCR Record & Replay."""
    parser.addoption(
        "--use-vcr",
        action="store_true",
        default=False,
        help="Enable VCR record/replay for LLM HTTP calls instead of the in-memory mock",
    )
    parser.addoption(
        "--disable-vcr",
        action="store_true",
        default=False,
        help="Force disable VCR and use in-memory mocks even if SCREENED_VCR_ENABLED is set",
    )

def _build_default_mock_plan():
    return {
        "festivalName": "Aldergate Film Festival",
        "domains": {
            "FESTIVAL": {
                "domain": "FESTIVAL",
                "objective": "Check festival details",
                "searchQueries": ["query 1", "query 2"],
                "keyQuestions": ["q1", "q2"]
            },
            "ORGANIZER": {
                "domain": "ORGANIZER",
                "objective": "Check organizer",
                "searchQueries": ["query 3"],
                "keyQuestions": ["q3"]
            },
            "PARTICIPANTS": {
                "domain": "PARTICIPANTS",
                "objective": "Check participants",
                "searchQueries": ["query 4"],
                "keyQuestions": ["q4"]
            }
        }
    }

def _build_default_mock_response():
    return types.GenerateContentResponse(
        model_version="gemini-mock",
        candidates=[
            types.Candidate(
                content=types.Content(
                    role="model",
                    parts=[types.Part(text=json.dumps(_build_default_mock_plan()))]
                ),
                finish_reason=types.FinishReason.STOP
            )
        ]
    )

# Mock the genai client at import time so that backend imports don't crash before fixtures run.
mock_genai_patcher = patch("google.genai.Client")
mock_client_class = mock_genai_patcher.start()

# Provide a default mock instance with AsyncMock for async models.generate_content
mock_instance = MagicMock()
mock_instance.vertexai = False
default_aio = MagicMock()
default_aio.models.generate_content = AsyncMock(return_value=_build_default_mock_response())
mock_instance.aio = default_aio
mock_client_class.return_value = mock_instance

def pytest_configure(config):
    """If VCR is enabled, stop the blanket mock patcher so real HTTP traffic can flow through VCR."""
    if is_vcr_enabled(config):
        try:
            mock_genai_patcher.stop()
        except RuntimeError:
            pass

def pytest_collection_modifyitems(config, items):
    """When VCR is disabled, strip 'vcr' markers so tests seamlessly use the in-memory mock."""
    if not is_vcr_enabled(config):
        for item in items:
            if "vcr" in item.keywords:
                item.own_markers = [m for m in item.own_markers if m.name != "vcr"]

@pytest.fixture(scope="session")
def vcr_config():
    """VCR configuration for filtering sensitive tokens and ignoring local test server requests."""
    return {
        "filter_headers": [
            "x-goog-api-key",
            "authorization",
            "cookie",
            "user-agent",
        ],
        "filter_query_parameters": [
            "key",
        ],
        "ignore_localhost": True,
        "ignore_hosts": ["testserver", "localhost", "127.0.0.1", "test"],
        "record_mode": os.getenv("VCR_RECORD_MODE", "once"),
        "match_on": ["method", "scheme", "host", "port", "path", "query"],
    }

@pytest.fixture(autouse=True)
def mock_genai_client(request):
    """Configure the mock genai client for tests to run offline when VCR is not enabled."""
    global mock_instance
    
    if is_vcr_enabled(request.config):
        yield mock_client_class
        return
    
    mock_response = _build_default_mock_response()
    mock_aio = MagicMock()
    mock_aio.models.generate_content = AsyncMock(return_value=mock_response)
    mock_instance.aio = mock_aio
    yield mock_client_class

