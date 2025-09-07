import { Request, Response } from 'express';
import prisma from '../prismaClient';

export class EventsController {
  static async createEvent(req: Request, res: Response) {
    try {
      const { title, description, date, venue, category, maxCapacity, allowOtherColleges } = req.body;

      if (!title || !date || !venue || !category) {
        return res.status(400).json({ 
          error: 'Title, date, venue, and category are required' 
        });
      }

      // Admin can only create events for their own college
      const collegeId = req.user.collegeId;
      if (!collegeId) {
        return res.status(403).json({ error: 'College association required' });
      }

      const event = await prisma.event.create({
        data: {
          title,
          description,
          date: new Date(date),
          venue,
          category,
          maxCapacity,
          allowOtherColleges: allowOtherColleges || false,
          collegeId,
        },
        include: {
          college: true
        }
      });

      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getAllEvents(req: Request, res: Response) {
    try {
      const collegeId = req.query.collegeId as string | undefined;
      const category = req.query.category as string | undefined;
      const upcoming = req.query.upcoming === 'true';

      // If user is admin, filter by their college only
      const whereClause: any = {};
      if (req.user && req.user.role === 'admin' && req.user.collegeId) {
        whereClause.collegeId = req.user.collegeId;
      } else if (collegeId) {
        whereClause.collegeId = collegeId;
      }

      if (category) {
        whereClause.category = category as any;
      }

      if (upcoming) {
        whereClause.date = { gte: new Date() };
      }

      const events = await prisma.event.findMany({
        where: whereClause,
        include: {
          college: true,
          _count: {
            select: {
              registrations: true
            }
          }
        },
        orderBy: { date: 'asc' }
      });

      res.json(events);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getEventById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          college: true,
          registrations: {
            include: {
              student: true,
              attendance: true,
              feedback: true
            }
          }
        }
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.json(event);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async updateEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // First check if event exists and belongs to user's college
      const existingEvent = await prisma.event.findUnique({
        where: { id },
        select: { collegeId: true }
      });

      if (!existingEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (existingEvent.collegeId !== req.user.collegeId) {
        return res.status(403).json({ error: 'You can only edit events from your own college' });
      }

      if (updates.date) {
        updates.date = new Date(updates.date);
      }

      const event = await prisma.event.update({
        where: { id },
        data: updates,
        include: {
          college: true
        }
      });

      res.json(event);
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async deleteEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // First check if event exists and belongs to user's college
      const existingEvent = await prisma.event.findUnique({
        where: { id },
        select: { collegeId: true }
      });

      if (!existingEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (existingEvent.collegeId !== req.user.collegeId) {
        return res.status(403).json({ error: 'You can only delete events from your own college' });
      }

      await prisma.event.delete({
        where: { id }
      });

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async checkEventCapacity(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const event = await prisma.event.findUnique({
        where: { id },
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

      const availableSpots = event.maxCapacity ? 
        event.maxCapacity - event._count.registrations : null;

      res.json({
        eventId: event.id,
        title: event.title,
        maxCapacity: event.maxCapacity,
        currentRegistrations: event._count.registrations,
        availableSpots,
        isFull: event.maxCapacity ? event._count.registrations >= event.maxCapacity : false
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async cancelEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // First check if event exists and belongs to user's college
      const existingEvent = await prisma.event.findUnique({
        where: { id },
        select: { collegeId: true }
      });

      if (!existingEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (existingEvent.collegeId !== req.user.collegeId) {
        return res.status(403).json({ error: 'You can only cancel events from your own college' });
      }

      const event = await prisma.event.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          college: true
        }
      });

      res.json(event);
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async sendFeedbackReminders(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Get event with registrations that have attendance but no feedback
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          registrations: {
            where: {
              attendance: {
                isNot: null
              },
              feedback: null
            },
            include: {
              student: true
            }
          }
        }
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Check if event belongs to user's college
      if (event.collegeId !== req.user.collegeId) {
        return res.status(403).json({ error: 'You can only send reminders for events from your own college' });
      }

      // Check if event is in the past
      if (new Date(event.date) > new Date()) {
        return res.status(400).json({ error: 'Cannot send feedback reminders for future events' });
      }

      const studentsToRemind = event.registrations.map(reg => reg.student);

      // In a real application, you would send actual emails here
      // For now, we'll just log the action and return success
      console.log(`Sending feedback reminders for event "${event.title}" to ${studentsToRemind.length} students:`, 
        studentsToRemind.map(s => s.email));

      res.json({
        message: 'Feedback reminders sent successfully',
        eventTitle: event.title,
        remindersSent: studentsToRemind.length,
        students: studentsToRemind.map(s => ({ id: s.id, email: s.email, name: s.name }))
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
