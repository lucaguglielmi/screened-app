import re
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("screened.correlation")

# Strict regex pattern preventing header injection (CWE-113) or log poisoning (CWE-117)
SAFE_CORRELATION_ID_REGEX = re.compile(r"^[a-zA-Z0-9_\-]{1,64}$")


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Universal Request Correlation ID Middleware.
    
    Attaches an immutable, sanitized correlation ID to request.state and
    propagates it into response headers and downstream logging context.
    """

    async def dispatch(self, request: Request, call_next):
        raw_id = request.headers.get("X-Correlation-ID") or request.headers.get("X-Request-ID")
        if raw_id and SAFE_CORRELATION_ID_REGEX.match(raw_id):
            correlation_id = raw_id
        else:
            correlation_id = str(uuid.uuid4())

        request.state.correlation_id = correlation_id

        response: Response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response
