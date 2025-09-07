import { Request, Response } from 'express';
import prisma from '../prismaClient';

export class AttendanceController {
  static async markAttendance(req: Request, res: Response) {
    try {
      const { registrationId } = req.body;

      if (!registrationId) {
        return res.status(400).json({ error: 'registrationId is required' });
      }

      // Check if registration exists
      const registration = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: {
          event: true,
          student: true
        }
      });

      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      // Check if attendance already marked
      const existingAttendance = await prisma.attendance.findUnique({
        where: { registrationId }
      });

      if (existingAttendance) {
        return res.status(400).json({ error: 'Attendance already marked for this registration' });
      }

      // Check if event is today (optional validation)
      const today = new Date();
      const eventDate = new Date(registration.event.date);
      const isToday = today.toDateString() === eventDate.toDateString();

      if (!isToday) {
        return res.status(400).json({ error: 'Can only mark attendance on event day' });
      }

      const attendance = await prisma.attendance.create({
        data: {
          registrationId
        },
        include: {
          registration: {
            include: {
              student: true,
              event: true
            }
          }
        }
      });

      res.status(201).json({ message: 'Attendance marked successfully', attendance });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getAttendanceByEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      const attendances = await prisma.attendance.findMany({
        where: {
          registration: {
            eventId
          }
        },
        include: {
          registration: {
            include: {
              student: true,
              event: true
            }
          }
        },
        orderBy: {
          checkedInAt: 'asc'
        }
      });

      res.json(attendances);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getAttendanceByStudent(req: Request, res: Response) {
    try {
      const { studentId } = req.params;

      const attendances = await prisma.attendance.findMany({
        where: {
          registration: {
            studentId
          }
        },
        include: {
          registration: {
            include: {
              event: true
            }
          }
        },
        orderBy: {
          checkedInAt: 'desc'
        }
      });

      res.json(attendances);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async bulkMarkAttendance(req: Request, res: Response) {
    try {
      const { registrationIds } = req.body;

      if (!registrationIds || !Array.isArray(registrationIds)) {
        return res.status(400).json({ error: 'registrationIds array is required' });
      }

      const attendances = [];
      const errors = [];

      for (const registrationId of registrationIds) {
        try {
          // Check if already exists
          const existing = await prisma.attendance.findUnique({
            where: { registrationId }
          });

          if (!existing) {
            const attendance = await prisma.attendance.create({
              data: { registrationId },
              include: {
                registration: {
                  include: {
                    student: true,
                    event: true
                  }
                }
              }
            });
            attendances.push(attendance);
          }
        } catch (error) {
          errors.push({ registrationId, error: (error as Error).message });
        }
      }

      res.json({
        message: 'Bulk attendance processing completed',
        successful: attendances.length,
        errors: errors.length,
        attendances,
        
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async removeAttendance(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const attendance = await prisma.attendance.findUnique({
        where: { id }
      });

      if (!attendance) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }

      await prisma.attendance.delete({
        where: { id }
      });

      res.json({ message: 'Attendance removed successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
