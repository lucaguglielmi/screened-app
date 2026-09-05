"""Centralized Demo Mode Service for Screened.

Encapsulates all logic and data access for the deterministic 'Pinco Pallino'
demo mode, ensuring clean separation from production database and orchestrator paths.
"""
from typing import Any, AsyncGenerator, Dict, List, Optional
from backend.demo_payloads import (
    DEMO_INVESTIGATION_ID,
    get_demo_investigation as _get_demo_investigation,
    get_demo_full_dossier as _get_demo_full_dossier,
    demo_sse_generator as _demo_sse_generator,
)

__all__ = [
    "DEMO_INVESTIGATION_ID",
    "is_demo_query",
    "is_demo_id",
    "get_demo_investigation",
    "get_demo_full_dossier",
    "demo_sse_generator",
]

_DEMO_KEYWORDS = {
    "demo",
    "demo mode",
    "/demo",
    "demo_mode",
    "pincopallino",
}


def is_demo_query(query: Optional[str]) -> bool:
    """Check whether an incoming festival search query matches demo triggers."""
    if not query:
        return False
    q_clean = query.lower().strip()
    if q_clean in _DEMO_KEYWORDS:
        return True
    if "pinco pallino" in q_clean or "pinco_pallino" in q_clean:
        return True
    return False


def is_demo_id(investigation_id: Optional[str]) -> bool:
    """Check whether an investigation ID corresponds to the demo payload."""
    return investigation_id == DEMO_INVESTIGATION_ID


def get_demo_investigation() -> Dict[str, Any]:
    """Retrieve the initial disambiguating demo state."""
    return _get_demo_investigation()


def get_demo_full_dossier() -> Dict[str, Any]:
    """Retrieve the finalized full demo investigation with dossier, claims, and sources."""
    return _get_demo_full_dossier()


async def demo_sse_generator() -> AsyncGenerator[str, None]:
    """Yield simulated Server-Sent Events for the demo investigation."""
    async for event in _demo_sse_generator():
        yield event
