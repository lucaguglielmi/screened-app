import os
import pytest
import json
from unittest.mock import AsyncMock, patch, MagicMock
from google.genai import types

# Force dummy API key so Google LLM doesn't crash on init during tests
os.environ["GEMINI_API_KEY"] = "dummy-offline-key"

# Mock the genai client at import time so that backend imports don't crash before fixtures run.
mock_genai_patcher = patch("google.genai.Client")
mock_client_class = mock_genai_patcher.start()

# Provide a default mock instance
mock_instance = MagicMock()
mock_instance.vertexai = False
mock_client_class.return_value = mock_instance

@pytest.fixture(autouse=True)
def mock_genai_client():
    """Configure the mock genai client for tests to run offline."""
    global mock_instance
        
        mock_plan = {
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
        
        # Build a valid GenerateContentResponse
        mock_response = types.GenerateContentResponse(
            model_version="gemini-mock",
            candidates=[
                types.Candidate(
                    content=types.Content(
                        role="model",
                        parts=[types.Part(text=json.dumps(mock_plan))]
                    ),
                    finish_reason=types.FinishReason.STOP
                )
            ]
        )
        
        mock_aio = MagicMock()
        mock_aio.models.generate_content = AsyncMock()
        mock_aio.models.generate_content.return_value = mock_response
        
        mock_instance.aio = mock_aio
        yield mock_client_class

