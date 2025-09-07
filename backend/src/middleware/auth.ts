// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const jwtPayloadSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'student']),
  collegeId: z.string().optional(),
  iat: z.number(),
  exp: z.number(),
});

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        email: string;
        role: 'admin' | 'student';
        collegeId?: string;
      };
    }
  }
}

// Admin can only access web, student can only access mobile
export const authMiddleware = (requiredRole?: 'admin' | 'student', platform?: 'web' | 'mobile') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'Missing or invalid authorization header' 
        });
      }

      const token = authHeader.split(' ')[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET!);
      const parsedPayload = jwtPayloadSchema.parse(payload);

      // Platform-based access control
      if (parsedPayload.role === 'admin' && platform === 'mobile') {
        return res.status(403).json({ 
          error: 'Admin access is only allowed via web portal' 
        });
      }

      if (parsedPayload.role === 'student' && platform === 'web') {
        return res.status(403).json({ 
          error: 'Student access is only allowed via mobile app' 
        });
      }

      // Check role if required
      if (requiredRole && parsedPayload.role !== requiredRole) {
        return res.status(403).json({ 
          error: 'Insufficient permissions' 
        });
      }

      req.user = {
        userId: parsedPayload.userId,
        email: parsedPayload.email,
        role: parsedPayload.role,
        collegeId: parsedPayload.collegeId
      };

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(401).json({ 
          error: 'Invalid token payload' 
        });
      }
      
      return res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
    }
  };
};

// Admin only (web platform)
export const adminOnly = authMiddleware('admin', 'web');

// Student only (mobile platform)  
export const studentOnly = authMiddleware('student', 'mobile');

// College-based access control middleware
export const collegeOwnerOnly = (req: Request, res: Response, next: NextFunction) => {
  // This middleware should be used after adminOnly to ensure user is authenticated
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (!req.user.collegeId) {
    return res.status(403).json({ error: 'College association required' });
  }

  next();
};
