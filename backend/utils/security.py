"""Security and adversarial defense utilities for Screened MCP & WebMCP services."""
import html
import ipaddress
import re
import socket
import urllib.parse
from typing import List

# Blocked IP CIDRs (Localhost, link-local metadata, RFC-1918 private subnets, carrier-grade NAT)
BLOCKED_CIDRS: List[ipaddress.IPv4Network | ipaddress.IPv6Network] = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("100.64.0.0/10"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),       # Cloud metadata (AWS/GCP/Azure)
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("198.18.0.0/15"),       # Benchmark tests
    ipaddress.ip_network("::1/128"),             # IPv6 loopback
    ipaddress.ip_network("fc00::/7"),            # IPv6 unique local
    ipaddress.ip_network("fe80::/10"),           # IPv6 link-local
]

# Regex for invisible / zero-width characters used in prompt injection evasion
INVISIBLE_CHARS_REGEX = re.compile(r"[\u200B-\u200D\uFEFF\u202A-\u202E\u0000-\u0008\u000B\u000C\u000E-\u001F]")


def validate_public_url(url: str) -> bool:
    """Validate that a URL uses safe protocols (HTTP/HTTPS) and does not point to internal/metadata networks (SSRF prevention).
    
    Raises:
        ValueError: If URL structure or scheme is invalid.
        PermissionError: If the target IP resolves to a restricted CIDR block.
    """
    if not url or not isinstance(url, str):
        raise ValueError("URL must be a non-empty string.")
    
    parsed = urllib.parse.urlparse(url.strip())
    if parsed.scheme.lower() not in ("http", "https"):
        raise ValueError("Invalid URL scheme: only HTTP and HTTPS are permitted.")
        
    if parsed.port and parsed.port not in (80, 443, 8080, 8443):
        raise ValueError("Disallowed port in URL: only standard web ports are permitted.")
        
    hostname = parsed.hostname
    if not hostname:
        raise ValueError("URL must include a valid hostname.")
        
    # Check for raw IP address in hostname
    try:
        ip = ipaddress.ip_address(hostname)
        for blocked in BLOCKED_CIDRS:
            if ip in blocked:
                raise PermissionError(f"Direct IP access to restricted address {ip} is blocked.")
    except ValueError:
        # Hostname is a domain name, not a raw IP
        pass

    # Resolve domain to all IP addresses
    try:
        addr_info = socket.getaddrinfo(hostname, None)
    except socket.gaierror as e:
        raise ValueError(f"Could not resolve host '{hostname}': {e}")

    for entry in addr_info:
        ip_str = entry[4][0]
        try:
            ip = ipaddress.ip_address(ip_str)
            for blocked in BLOCKED_CIDRS:
                if ip in blocked:
                    raise PermissionError(f"Resolved host '{hostname}' maps to restricted IP {ip}.")
        except ValueError:
            continue

    return True


def quarantine_external_evidence(raw_text: str, source_id: str = "web") -> str:
    """Sanitize external untrusted text to neutralize indirect prompt injection attacks.
    
    1. Strips zero-width unicode characters.
    2. Escapes HTML entities.
    3. Wraps content in non-executable boundary markers.
    """
    if not raw_text:
        return ""
    
    # Strip invisible/evasion characters
    cleaned = INVISIBLE_CHARS_REGEX.sub("", str(raw_text))
    # Escape HTML to prevent markup injection
    escaped = html.escape(cleaned.strip())
    # Boundary encapsulation
    safe_source = html.escape(str(source_id).strip() or "web")
    return f'<untrusted_evidence_data source="{safe_source}">{escaped}</untrusted_evidence_data>'


def sanitize_agent_query(query: str, max_length: int = 500) -> str:
    """Sanitize user/agent prompt inputs, truncating excessive length and stripping control characters."""
    if not query:
        return ""
    cleaned = INVISIBLE_CHARS_REGEX.sub("", str(query)).strip()
    return cleaned[:max_length]


def get_real_client_ip(request) -> str:
    """Safely extracts the originating client IP without trusting spoofable leftmost headers.
    
    1. Checks trusted proxy headers (e.g. CF-Connecting-IP if routed through Cloudflare).
    2. Parses X-Forwarded-For from right to left, selecting the first valid public IP
       before internal Google Front End / Cloud Load Balancer hops.
    3. Falls back to request.client.host if available, or '127.0.0.1'.
    """
    # 1. Trusted Cloudflare Header
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        try:
            parsed = ipaddress.ip_address(cf_ip.strip())
            if not (parsed.is_private or parsed.is_link_local or parsed.is_loopback):
                return str(parsed)
        except ValueError:
            pass

    # 2. Google Front End / Reverse Proxy X-Forwarded-For
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        parts = [p.strip() for p in forwarded.split(",")]
        # Traverse right-to-left: GFE appends verified client IP to the right
        for ip_str in reversed(parts):
            try:
                ip_obj = ipaddress.ip_address(ip_str)
                if not (ip_obj.is_private or ip_obj.is_link_local or ip_obj.is_loopback):
                    return str(ip_obj)
            except ValueError:
                continue

    # 3. Direct client host fallback
    if getattr(request, "client", None) and getattr(request.client, "host", None):
        return request.client.host

    return "127.0.0.1"


