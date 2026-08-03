
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5, // Limit each IP + account combination to 5 attempts per window
  keyGenerator: (req) => {
    // 1. Get normalized IP (handles both IPv4 and IPv6 properly)
    const normalizedIp = ipKeyGenerator(req);
    
    // 2. Extract and sanitize email
    const email = req.body.email ? req.body.email.toLowerCase().trim() : '';

    // 3. Combine IP + Email
    return `${normalizedIp}_${email}`;
  },
  message: {
    message: 'Too many login attempts for this account from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});