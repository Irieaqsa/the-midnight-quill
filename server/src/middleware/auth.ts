import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-tmq';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'MEMBER' | 'EDITOR' | 'ADMIN';
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.cookies?.token;

  if (!token) {
    return next(); // Proceed as unauthenticated
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; role: 'MEMBER' | 'EDITOR' | 'ADMIN' };
    req.user = payload;
    next();
  } catch (error) {
    // If token is invalid, we clear it and proceed as unauthenticated or return error
    next();
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export function requireEditor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== 'EDITOR' && req.user.role !== 'ADMIN')) {
    return res.status(403).json({ error: 'Access denied: Editor or Admin role required' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied: Admin role required' });
  }
  next();
}
