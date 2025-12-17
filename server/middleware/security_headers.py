"""
Security middleware for setting various HTTP headers.
"""
from flask import request, g
from functools import wraps

def security_headers(response):
    """Add security headers to all responses."""
    # Prevent clickjacking
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    
    # Enable XSS protection
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Prevent MIME type sniffing
    response.headers['X-Content-Type-Options'] = 'nosniff'
    
    # Referrer policy
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    # Content Security Policy (CSP)
    # Note: Adjust these based on your application's requirements
    csp = [
        "default-src 'self';",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
        "style-src 'self' 'unsafe-inline';",
        "img-src 'self' data:;",
        "font-src 'self';",
        "connect-src 'self';",
        "frame-ancestors 'self';"
    ]
    
    response.headers['Content-Security-Policy'] = ' '.join(csp).replace('  ', ' ')
    
    # HSTS - only enable in production with HTTPS
    if request.is_secure:
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    return response

def require_auth(f):
    """Decorator to ensure user is authenticated."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"message": "Authentication required"}), 401
            
        # Check if session is still fresh
        if not session.get('_fresh', False):
            session.clear()
            return jsonify({"message": "Session expired, please login again"}), 401
            
        return f(*args, **kwargs)
    return decorated_function
