import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prismaClient';

// Validation schemas
const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const studentRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  collegeId: z.string().uuid('Invalid college ID')
});

const studentLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  verificationToken: z.string().optional()
});

export class AuthController {
  // Generate JWT token
  static generateToken(userId: string, email: string, role: 'admin' | 'student', collegeId?: string) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    return jwt.sign(
      { userId, email, role, collegeId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // ADMIN WEB LOGIN ONLY
  static async loginAdmin(req: Request, res: Response) {
    try {
      const validatedData = adminLoginSchema.parse(req.body);
      const { email, password } = validatedData;

      // Check admin credentials from environment or database
      if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }

      const token = AuthController.generateToken('admin-id', email, 'admin');

      res.json({
        message: 'Admin login successful',
        token,
        user: {
          email,
          role: 'admin'
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues
        });
      }
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // STUDENT MOBILE REGISTRATION ONLY
  static async registerStudent(req: Request, res: Response) {
    try {
      const validatedData = studentRegisterSchema.parse(req.body);
      const { name, email, collegeId } = validatedData;

      // Check if college exists and get email domain
      const college = await prisma.college.findUnique({
        where: { id: collegeId }
      });

      if (!college) {
        return res.status(404).json({ error: 'College not found' });
      }

      // Validate email domain
      const emailDomain = '@' + email.split('@')[1];
      if (emailDomain !== college.emailDomain) {
        return res.status(400).json({ 
          error: 'Email domain does not match college domain' 
        });
      }

      // Check if student already exists
      const existingStudent = await prisma.student.findUnique({
        where: { email }
      });

      if (existingStudent) {
        return res.status(400).json({ error: 'Student already exists' });
      }

      // Create student with verification token (no password needed)
      const verificationToken = Math.random().toString(36).substr(2, 9);

      const student = await prisma.student.create({
        data: {
          name,
          email,
          collegeId,
          verificationToken
        },
        include: { college: true }
      });

      // Send verification email here (integrate email service)
      
      res.status(201).json({
        message: 'Student registered successfully. Check your email for verification code.',
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          college: student.college.name
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues
        });
      }
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // STUDENT MOBILE LOGIN (with verification)
  static async loginStudent(req: Request, res: Response) {
    try {
      const validatedData = studentLoginSchema.parse(req.body);
      const { email, verificationToken } = validatedData;

      const student = await prisma.student.findUnique({
        where: { email },
        include: { college: true }
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // If not verified, require verification token
      if (!student.isVerified) {
        if (!verificationToken) {
          return res.status(400).json({ 
            error: 'Email not verified. Please provide verification token.' 
          });
        }

        if (student.verificationToken !== verificationToken) {
          return res.status(400).json({ error: 'Invalid verification token' });
        }

        // Verify the student
        await prisma.student.update({
          where: { email },
          data: {
            isVerified: true,
            verificationToken: null
          }
        });
      }

      // Generate token for mobile app
      const token = AuthController.generateToken(student.id, student.email, 'student', student.collegeId);

      res.json({
        message: 'Student login successful',
        token,
        user: {
          id: student.id,
          name: student.name,
          email: student.email,
          college: student.college.name,
          role: 'student'
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues
        });
      }
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Resend verification code for mobile
  static async resendVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const student = await prisma.student.findUnique({
        where: { email }
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      if (student.isVerified) {
        return res.status(400).json({ error: 'Student already verified' });
      }

      const newToken = Math.random().toString(36).substr(2, 9);

      await prisma.student.update({
        where: { email },
        data: { verificationToken: newToken }
      });

      // Send email with new verification code
      
      res.json({ message: 'Verification code resent to your email' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Get current user (both admin and student)
  static async getCurrentUser(req: Request, res: Response) {
    try {
      if (req.user.role === 'student') {
        const student = await prisma.student.findUnique({
          where: { id: req.user.userId },
          include: { college: true }
        });

        if (!student) {
          return res.status(404).json({ error: 'Student not found' });
        }

        res.json({
          id: student.id,
          name: student.name,
          email: student.email,
          isVerified: student.isVerified,
          college: student.college.name,
          role: 'student'
        });
      } else {
        res.json({
          email: req.user.email,
          role: 'admin'
        });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
