import { Request, Response } from 'express';
import prisma from '../prismaClient';

export class RegistrationsController {
  static async createRegistration(req: Request, res: Response) {
    try {
      const { studentId, eventId } = req.body;

      if (!studentId || !eventId) {
        return res.status(400).json({ error: 'studentId and eventId are required' });
      }

      // Check if event exists and get capacity info
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          _count: {
            select: {
              registrations: true
            }
          }
        }
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Check capacity
      if (event.maxCapacity && event._count.registrations >= event.maxCapacity) {
        return res.status(400).json({ error: 'Event is full' });
      }

      // Check for existing registration
      const existingRegistration = await prisma.registration.findFirst({
        where: { studentId, eventId },
      });

      if (existingRegistration) {
        return res.status(400).json({ error: 'Student is already registered for this event' });
      }

      // Check if student belongs to same college as event
      const student = await prisma.student.findUnique({
        where: { id: studentId }
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      if (student.collegeId !== event.collegeId) {
        return res.status(400).json({ error: 'Student can only register for events in their college' });
      }

      const registration = await prisma.registration.create({
        data: {
          studentId,
          eventId,
        },
        include: {
          student: true,
          event: true
        }
      });

      res.status(201).json({ message: 'Registration successful', registration });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getRegistrationsByEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const registrations = await prisma.registration.findMany({
        where: { eventId },
        include: { 
          student: true,
          attendance: true,
          feedback: true
        },
        orderBy: { registeredAt: 'asc' }
      });
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getRegistrationsByStudent(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const registrations = await prisma.registration.findMany({
        where: { studentId },
        include: { 
          event: true,
          attendance: true,
          feedback: true
        },
        orderBy: { registeredAt: 'desc' }
      });
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async cancelRegistration(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if registration exists
      const registration = await prisma.registration.findUnique({
        where: { id },
        include: {
          event: true,
          attendance: true
        }
      });

      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      // Check if event has already occurred or attendance marked
      if (registration.attendance) {
        return res.status(400).json({ error: 'Cannot cancel registration with marked attendance' });
      }

      if (registration.event.date < new Date()) {
        return res.status(400).json({ error: 'Cannot cancel registration for past events' });
      }

      await prisma.registration.delete({
        where: { id }
      });

      res.json({ message: 'Registration cancelled successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getRegistrationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const registration = await prisma.registration.findUnique({
        where: { id },
        include: {
          student: true,
          event: true,
          attendance: true,
          feedback: true
        }
      });

      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      res.json(registration);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
