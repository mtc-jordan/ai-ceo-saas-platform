"""Rate limiting middleware for API protection."""
import time
from collections import defaultdict
from typing import Dict, Tuple
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware to protect against abuse.
    
    Default limits:
    - 100 requests per minute for authenticated users
    - 20 requests per minute for unauthenticated users
    - 5 login attempts per minute per IP
    """
    
    def __init__(
        self,
        app,
        authenticated_limit: int = 100,
        unauthenticated_limit: int = 20,
        login_limit: int = 5,
        window_seconds: int = 60
    ):
        super().__init__(app)
        self.authenticated_limit = authenticated_limit
        self.unauthenticated_limit = unauthenticated_limit
        self.login_limit = login_limit
        self.window_seconds = window_seconds
        # Store: {key: [(timestamp, count)]}
        self.requests: Dict[str, list] = defaultdict(list)
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _is_authenticated(self, request: Request) -> bool:
        """Check if request has authentication token."""
        auth_header = request.headers.get("Authorization", "")
        return auth_header.startswith("Bearer ")
    
    def _is_login_endpoint(self, request: Request) -> bool:
        """Check if this is a login/auth endpoint."""
        path = request.url.path
        return "/auth/token" in path or "/auth/login" in path
    
    def _clean_old_requests(self, key: str, current_time: float) -> None:
        """Remove requests outside the current window."""
        cutoff = current_time - self.window_seconds
        self.requests[key] = [
            (ts, count) for ts, count in self.requests[key]
            if ts > cutoff
        ]
    
    def _get_request_count(self, key: str) -> int:
        """Get total request count in current window."""
        return sum(count for _, count in self.requests[key])
    
    def _add_request(self, key: str, current_time: float) -> None:
        """Add a request to the tracking."""
        self.requests[key].append((current_time, 1))
    
    async def dispatch(self, request: Request, call_next):
        """Process request with rate limiting."""
        current_time = time.time()
        client_ip = self._get_client_ip(request)
        
        # Determine rate limit based on context
        if self._is_login_endpoint(request):
            key = f"login:{client_ip}"
            limit = self.login_limit
        elif self._is_authenticated(request):
            # Use user ID from token if available, fallback to IP
            key = f"auth:{client_ip}"
            limit = self.authenticated_limit
        else:
            key = f"unauth:{client_ip}"
            limit = self.unauthenticated_limit
        
        # Clean old requests and check limit
        self._clean_old_requests(key, current_time)
        current_count = self._get_request_count(key)
        
        if current_count >= limit:
            # Calculate retry-after
            oldest_request = min(ts for ts, _ in self.requests[key]) if self.requests[key] else current_time
            retry_after = int(self.window_seconds - (current_time - oldest_request))
            
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "limit": limit,
                    "window_seconds": self.window_seconds,
                    "retry_after": max(1, retry_after)
                },
                headers={"Retry-After": str(max(1, retry_after))}
            )
        
        # Track this request
        self._add_request(key, current_time)
        
        # Add rate limit headers to response
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(limit - current_count - 1)
        response.headers["X-RateLimit-Reset"] = str(int(current_time + self.window_seconds))
        
        return response


class IPBlockMiddleware(BaseHTTPMiddleware):
    """
    Middleware to block suspicious IPs.
    
    Blocks IPs that have been flagged for:
    - Too many failed login attempts
    - Suspicious request patterns
    """
    
    def __init__(self, app, max_failed_attempts: int = 10, block_duration: int = 3600):
        super().__init__(app)
        self.max_failed_attempts = max_failed_attempts
        self.block_duration = block_duration
        self.failed_attempts: Dict[str, Tuple[int, float]] = {}
        self.blocked_ips: Dict[str, float] = {}
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _is_blocked(self, ip: str) -> bool:
        """Check if IP is currently blocked."""
        if ip in self.blocked_ips:
            if time.time() < self.blocked_ips[ip]:
                return True
            else:
                del self.blocked_ips[ip]
        return False
    
    def record_failed_attempt(self, ip: str) -> None:
        """Record a failed login attempt."""
        current_time = time.time()
        if ip in self.failed_attempts:
            count, first_attempt = self.failed_attempts[ip]
            # Reset if window expired
            if current_time - first_attempt > 3600:
                self.failed_attempts[ip] = (1, current_time)
            else:
                self.failed_attempts[ip] = (count + 1, first_attempt)
                if count + 1 >= self.max_failed_attempts:
                    self.blocked_ips[ip] = current_time + self.block_duration
        else:
            self.failed_attempts[ip] = (1, current_time)
    
    async def dispatch(self, request: Request, call_next):
        """Check if IP is blocked before processing."""
        client_ip = self._get_client_ip(request)
        
        if self._is_blocked(client_ip):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "error": "IP temporarily blocked",
                    "reason": "Too many failed attempts",
                    "retry_after": int(self.blocked_ips.get(client_ip, 0) - time.time())
                }
            )
        
        return await call_next(request)
