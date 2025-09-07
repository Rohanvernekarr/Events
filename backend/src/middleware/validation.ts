import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Generic validation middleware factory
export const validateSchema = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

// Common validation schemas
export const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  collegeId: z.string().uuid('Invalid college ID')
});

export const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  date: z.string().datetime('Invalid date format'),
  venue: z.string().min(2, 'Venue must be at least 2 characters'),
  category: z.enum(['WORKSHOP', 'SEMINAR', 'FEST', 'HACKATHON', 'TECH_TALK']),
  maxCapacity: z.number().positive().optional(),
  collegeId: z.string().uuid('Invalid college ID')
});

export const registrationSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  eventId: z.string().uuid('Invalid event ID')
});

export const feedbackSchema = z.object({
  registrationId: z.string().uuid('Invalid registration ID'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comments: z.string().optional()
});

export const collegeSchema = z.object({
  name: z.string().min(2, 'College name must be at least 2 characters'),
  emailDomain: z.string().regex(/^@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email domain format')
});
