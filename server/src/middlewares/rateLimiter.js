/**
 * Simple in-memory rate limiter middleware
 * For production use, consider using express-rate-limit with Redis
 */

const requestCounts = new Map();

/**
 * Creates a rate limiter middleware
 * @param {number} maxRequests - Maximum number of requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} message - Error message to send when limit is exceeded
 */
export const createRateLimiter = (maxRequests = 10, windowMs = 60000, message = 'Too many requests') => {
  return (req, res, next) => {
    const key = `${req.user._id}:${req.path}`;
    const now = Date.now();
    
    // Get or initialize request data for this user+path
    let requestData = requestCounts.get(key);
    
    if (!requestData) {
      requestData = {
        count: 0,
        resetTime: now + windowMs
      };
      requestCounts.set(key, requestData);
    }
    
    // Reset if window has passed
    if (now > requestData.resetTime) {
      requestData.count = 0;
      requestData.resetTime = now + windowMs;
    }
    
    // Check if limit exceeded
    if (requestData.count >= maxRequests) {
      const retryAfter = Math.ceil((requestData.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        message: message,
        retryAfter: retryAfter
      });
    }
    
    // Increment counter
    requestData.count++;
    
    next();
  };
};

/**
 * Cleanup old entries periodically to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Clean up every minute

export default createRateLimiter;
