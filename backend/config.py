"""Application settings and configuration."""
import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Screened"
    app_version: str = "0.1.0"
    environment: str = "development"
    host: str = "0.0.0.0"
    port: int = 8000

    # Parallel Search API Key
    parallel_api_key: str = ""
    parallel_webhook_secret: str = "dev-webhook-secret"

    # Google Cloud & Vertex AI
    google_genai_use_vertexai: bool = True
    google_cloud_project: str = "screened-hackathon"
    google_cloud_location: str = "europe-west2"

    # Security
    session_signing_key: str = "dev-secret-session-key"

    strict_mode: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
