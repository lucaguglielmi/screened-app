from google.adk.models import Gemini
from backend.config import settings
from typing import Optional

def get_adk_model(model_name: str = "gemini-2.5-flash") -> Gemini:
    """Returns a google.adk.models.Gemini properly configured for Vertex AI if needed."""
    client_kwargs = None
    if settings.google_genai_use_vertexai:
        client_kwargs = {
            "vertexai": True,
            "project": settings.google_cloud_project,
            "location": settings.google_cloud_location,
        }
    return Gemini(model_name=model_name, client_kwargs=client_kwargs)
