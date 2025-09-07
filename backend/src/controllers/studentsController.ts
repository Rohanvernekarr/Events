import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';

export class StudentsController {
  static async createStudent(req: Request, res: Response) {
    try {
      const { name, email, collegeId } = req.body;

      if (!name || !email || !collegeId) {
        return res.status(400).json({ error: 'Name, email, and collegeId are required' });
      }

      // Check if college exists and get email domain
      const college = await prisma.college.findUnique({
        where: { id: collegeId }
      });

      if (!college) {
        return res.status(404).json({ error: 'College not found' });
      }

      // Validate email domain
      const emailDomain = email.split('@')[1];
      const allowedDomain = college.emailDomain.replace('@', '');
      
      if (emailDomain !== allowedDomain) {
        return res.status(400).json({ error: 'Email domain does not match college domain' });
      }

      const student = await prisma.student.create({
        data: {
          name,
          email,
          collegeId,
          verificationToken: Math.random().toString(36).substr(2, 9) // Generate random token
        },
        include: {
          college: true
        }
      });

      res.status(201).json(student);
    } catch (error) {
      if ((error as any).code === 'P2002') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getAllStudents(req: Request, res: Response) {
    try {
      const collegeId = req.query.collegeId as string | undefined;
      
      const students = await prisma.student.findMany({
        where: collegeId ? { collegeId } : {},
        include: {
          college: true,
          _count: {
            select: {
              registrations: true
            }
          }
        }
      });

      res.json(students);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getStudentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const student = await prisma.student.findUnique({
        where: { id },
        include: {
          college: true,
          registrations: {
            include: {
              event: true,
              attendance: true,
              feedback: true
            }
          }
        }
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json(student);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async verifyStudent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { verificationToken } = req.body;

      const student = await prisma.student.findUnique({
        where: { id }
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      if (student.verificationToken !== verificationToken) {
        return res.status(400).json({ error: 'Invalid verification token' });
      }

      const updatedStudent = await prisma.student.update({
        where: { id },
        data: {
          isVerified: true,
          verificationToken: null
        }
      });

      res.json({ message: 'Email verified successfully', student: updatedStudent });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async resendVerification(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const newToken = Math.random().toString(36).substr(2, 9);

      const student = await prisma.student.update({
        where: { id },
        data: {
          verificationToken: newToken
        }
      });

      // Here you would integrate email service to send verification email
      res.json({ message: 'Verification email resent', verificationToken: newToken });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async deleteStudent(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if student exists
      const student = await prisma.student.findUnique({
        where: { id }
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Delete the student (this will cascade delete related registrations, attendance, and feedback)
      await prisma.student.delete({
        where: { id }
      });

      res.json({ message: 'Student deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Student Authentication Methods
  static async loginStudent(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Find student by email
      const student = await prisma.student.findUnique({
        where: { email },
        include: { college: true }
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      if (!student.isVerified) {
        return res.status(400).json({ error: 'Email not verified' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: student.id, 
          email: student.email, 
          collegeId: student.collegeId,
          role: 'student'
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '30d' }
      );

      res.json({
        token,
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          college: student.college
        }
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async registerStudent(req: Request, res: Response) {
    try {
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      // Extract domain from email
      const emailDomain = '@' + email.split('@')[1];
      
      // Find college by email domain
      const college = await prisma.college.findFirst({
        where: { emailDomain }
      });

      if (!college) {
        return res.status(400).json({ error: 'No college found for this email domain' });
      }

      // Check if student already exists
      const existingStudent = await prisma.student.findUnique({
        where: { email }
      });

      if (existingStudent) {
        return res.status(400).json({ error: 'Student already registered' });
      }

      // Create student
      const student = await prisma.student.create({
        data: {
          name,
          email,
          collegeId: college.id,
          verificationToken: Math.random().toString(36).substr(2, 9),
          isVerified: true // Auto-verify for demo purposes
        },
        include: {
          college: true
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: student.id, 
          email: student.email, 
          collegeId: student.collegeId,
          role: 'student'
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '30d' }
      );

      res.status(201).json({
        token,
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          college: student.college
        }
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  // Student Event Methods
  static async getStudentEvents(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const student = await prisma.student.findUnique({
        where: { id: userId },
        include: { college: true }
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Get all active events (from all colleges)
      const events = await prisma.event.findMany({
        where: {
          status: 'ACTIVE'
        },
        include: {
          college: true,
          registrations: {
            where: { studentId: userId },
            include: {
              attendance: true,
              feedback: true
            }
          },
          _count: {
            select: { registrations: true }
          }
        },
        orderBy: { date: 'asc' }
      });

      // Transform events to include registration status and eligibility
      const eventsWithStatus = events.map(event => {
        const isOwnCollege = event.collegeId === student.collegeId;
        const canRegister = isOwnCollege || event.allowOtherColleges;
        
        return {
          ...event,
          isRegistered: event.registrations.length > 0,
          hasAttended: event.registrations.some(reg => reg.attendance !== null),
          hasFeedback: event.registrations.some(reg => reg.feedback !== null),
          registrationCount: event._count.registrations,
          canRegister,
          isOwnCollege
        };
      });

      res.json(eventsWithStatus);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async registerForEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const studentId = req.user?.userId;

      if (!studentId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get student info
      const student = await prisma.student.findUnique({
        where: { id: studentId }
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Check if event exists and is active
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { _count: { select: { registrations: true } } }
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (event.status !== 'ACTIVE') {
        return res.status(400).json({ error: 'Event is not active' });
      }

      // Check if student can register for this event
      const isOwnCollege = event.collegeId === student.collegeId;
      if (!isOwnCollege && !event.allowOtherColleges) {
        return res.status(403).json({ error: 'This event is only open to students from the organizing college' });
      }

      // Check if event is full
      if (event.maxCapacity && event._count.registrations >= event.maxCapacity) {
        return res.status(400).json({ error: 'Event is full' });
      }

      // Check if already registered
      const existingRegistration = await prisma.registration.findFirst({
        where: { studentId, eventId }
      });

      if (existingRegistration) {
        return res.status(400).json({ error: 'Already registered for this event' });
      }

      // Create registration
      const registration = await prisma.registration.create({
        data: { studentId, eventId },
        include: { event: true }
      });

      res.status(201).json(registration);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async markAttendance(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const studentId = req.user?.userId;

      if (!studentId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Find registration
      const registration = await prisma.registration.findFirst({
        where: { studentId, eventId },
        include: { event: true, attendance: true }
      });

      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      if (registration.attendance) {
        return res.status(400).json({ error: 'Attendance already marked' });
      }

      // Check if event date is today (allow attendance marking)
      const eventDate = new Date(registration.event.date);
      const today = new Date();
      const isEventDay = eventDate.toDateString() === today.toDateString();

      if (!isEventDay && eventDate > today) {
        return res.status(400).json({ error: 'Cannot mark attendance before event date' });
      }

      // Create attendance record
      const attendance = await prisma.attendance.create({
        data: { registrationId: registration.id }
      });

      res.status(201).json(attendance);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async submitFeedback(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const { rating, comments } = req.body;
      const studentId = req.user?.userId;

      if (!studentId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      // Find registration with attendance
      const registration = await prisma.registration.findFirst({
        where: { studentId, eventId },
        include: { attendance: true, feedback: true }
      });

      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      if (!registration.attendance) {
        return res.status(400).json({ error: 'Must attend event before submitting feedback' });
      }

      if (registration.feedback) {
        return res.status(400).json({ error: 'Feedback already submitted' });
      }

      // Create feedback
      const feedback = await prisma.feedback.create({
        data: {
          registrationId: registration.id,
          rating,
          comments: comments || null
        }
      });

      res.status(201).json(feedback);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
