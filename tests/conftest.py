import os
import pytest
import json
from unittest.mock import AsyncMock, patch, MagicMock
from google.genai import types

# Force dummy API key so Google LLM doesn't crash on init during tests
os.environ["GEMINI_API_KEY"] = "dummy-offline-key"

@pytest.fixture(autouse=True)
def mock_genai_client():
    """Mock the genai client for all tests to run offline."""
    with patch("google.genai.Client") as mock_client:
        mock_instance = MagicMock()
        mock_instance.vertexai = False
        
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
        mock_client.return_value = mock_instance
        yield mock_client

