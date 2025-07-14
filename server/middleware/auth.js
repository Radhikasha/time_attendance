const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify JWT token
 */
const auth = function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Auth Middleware - Request Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Auth Middleware - Token:', token ? 'Token received' : 'No token found');

    // Check if no token
    if (!token) {
        console.log('Auth Middleware - No token provided');
        return res.status(401).json({ 
            success: false,
            message: 'No token, authorization denied',
            error: 'AUTH_ERROR_NO_TOKEN'
        });
    }

    // Verify token
    try {
        console.log('Auth Middleware - Verifying token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        if (!decoded || !decoded.user) {
            throw new Error('Invalid token payload');
        }
        
        console.log('Auth Middleware - Token decoded successfully:', {
            userId: decoded.user.id,
            role: decoded.user.role,
            email: decoded.user.email
        });
        
        // Attach user to request object
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error('Auth Middleware - Token verification failed:', {
            error: err.message,
            name: err.name,
            stack: err.stack
        });
        
        let errorMessage = 'Token is not valid';
        if (err.name === 'TokenExpiredError') {
            errorMessage = 'Token has expired';
        } else if (err.name === 'JsonWebTokenError') {
            errorMessage = 'Invalid token';
        }
        
        return res.status(401).json({ 
            success: false,
            message: errorMessage,
            error: 'AUTH_ERROR_INVALID_TOKEN',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

/**
 * Admin authorization middleware
 * Must be used after the auth middleware
 */
const admin = function(req, res, next) {
    console.log('Admin Middleware - Checking user role:', {
        userId: req.user?.id,
        userRole: req.user?.role,
        path: req.path,
        method: req.method
    });
    
    if (req.user && req.user.role === 'admin') {
        console.log('Admin Middleware - Access granted');
        return next();
    }
    
    console.log('Admin Middleware - Access denied');
    return res.status(403).json({ 
        success: false,
        message: 'Admin access required',
        error: 'AUTH_ERROR_ADMIN_REQUIRED'
    });
};

// Export middleware functions
module.exports = { 
    auth,
    admin,
    protect: auth  // Alias for backward compatibility
};
