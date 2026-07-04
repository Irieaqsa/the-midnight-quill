import { Request, Response, NextFunction } from 'express';

const rateLimitWindow = 60 * 60 * 1000; // 1 hour window
const ipRequests = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(limit: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Extract real client IP, respecting proxy headers on Render
    const ip = req.headers['x-forwarded-for'] as string || req.ip || 'unknown-ip';
    const cleanIp = ip.split(',')[0].trim(); // Get first IP if comma-separated
    const now = Date.now();
    const clientLimit = ipRequests.get(cleanIp);

    if (!clientLimit || now > clientLimit.resetTime) {
      ipRequests.set(cleanIp, { count: 1, resetTime: now + rateLimitWindow });
      return next();
    }

    if (clientLimit.count >= limit) {
      console.warn(`⚠️ Rate limit exceeded for IP: ${cleanIp} on route: ${req.originalUrl}`);
      return res.status(429).json({ 
        error: 'Too many requests from this device. Please try again in an hour.' 
      });
    }

    clientLimit.count += 1;
    next();
  };
}
