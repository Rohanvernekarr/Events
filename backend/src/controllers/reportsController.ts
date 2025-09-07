import { Request, Response } from 'express';
import prisma from '../prismaClient';

export class ReportsController {
  static async getEventPopularity(req: Request, res: Response) {
    try {
      const collegeId = req.query.collegeId as string | undefined;
      const category = req.query.category as string | undefined;

      const events = await prisma.event.findMany({
        where: {
          ...(collegeId && { collegeId }),
          ...(category && { category: category as any })
        },
        include: {
          college: true,
          registrations: {
            include: {
              attendance: true,
              feedback: true
            }
          },
          _count: {
            select: {
              registrations: true
            }
          }
        }
      });

      const eventStats = events.map(event => {
        const totalRegistrations = event.registrations.length;
        const totalAttendance = event.registrations.filter(reg => reg.attendance).length;
        const feedbacks = event.registrations.filter(reg => reg.feedback);
        const averageRating = feedbacks.length > 0 
          ? feedbacks.reduce((sum, reg) => sum + (reg.feedback?.rating || 0), 0) / feedbacks.length 
          : 0;

        return {
          id: event.id,
          title: event.title,
          date: event.date,
          venue: event.venue,
          category: event.category,
          college: event.college.name,
          totalRegistrations,
          totalAttendance,
          attendancePercentage: totalRegistrations > 0 ? Math.round((totalAttendance / totalRegistrations) * 100) : 0,
          averageRating: Math.round(averageRating * 100) / 100,
          totalFeedbacks: feedbacks.length
        };
      });

      // Sort by total registrations (descending)
      eventStats.sort((a, b) => b.totalRegistrations - a.totalRegistrations);

      res.json(eventStats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getStudentParticipation(req: Request, res: Response) {
    try {
      const collegeId = req.query.collegeId as string | undefined;

      const students = await prisma.student.findMany({
        where: collegeId ? { collegeId } : {},
        include: {
          college: true,
          registrations: {
            include: {
              event: true,
              attendance: true
            }
          }
        }
      });

      const studentStats = students.map(student => {
        const totalRegistrations = student.registrations.length;
        const totalAttendance = student.registrations.filter(reg => reg.attendance).length;

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          college: student.college.name,
          totalRegistrations,
          totalAttendance,
          attendanceRate: totalRegistrations > 0 ? Math.round((totalAttendance / totalRegistrations) * 100) : 0
        };
      });

      // Sort by total attendance (descending)
      studentStats.sort((a, b) => b.totalAttendance - a.totalAttendance);

      res.json(studentStats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getTopActiveStudents(req: Request, res: Response) {
    try {
      const collegeId = req.query.collegeId as string | undefined;
      const limit = parseInt(req.query.limit as string) || 3;

      const students = await prisma.student.findMany({
        where: collegeId ? { collegeId } : {},
        include: {
          college: true,
          registrations: {
            include: {
              event: true,
              attendance: true
            }
          }
        }
      });

      const studentStats = students.map(student => {
        const totalAttendance = student.registrations.filter(reg => reg.attendance).length;
        const totalRegistrations = student.registrations.length;

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          college: student.college.name,
          totalRegistrations,
          totalAttendance,
          attendanceRate: totalRegistrations > 0 ? Math.round((totalAttendance / totalRegistrations) * 100) : 0,
          eventsAttended: student.registrations.filter(reg => reg.attendance).map(reg => ({
            eventTitle: reg.event.title,
            eventDate: reg.event.date
          }))
        };
      })
      .sort((a, b) => b.totalAttendance - a.totalAttendance)
      .slice(0, limit);

      res.json(studentStats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getAttendancePercentage(req: Request, res: Response) {
    try {
      const eventId = req.query.eventId as string | undefined;
      const collegeId = req.query.collegeId as string | undefined;

      const events = await prisma.event.findMany({
        where: {
          ...(eventId && { id: eventId }),
          ...(collegeId && { collegeId })
        },
        include: {
          registrations: {
            include: {
              attendance: true
            }
          }
        }
      });

      const attendanceStats = events.map(event => {
        const totalRegistrations = event.registrations.length;
        const totalAttendance = event.registrations.filter(reg => reg.attendance).length;

        return {
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          totalRegistrations,
          totalAttendance,
          attendancePercentage: totalRegistrations > 0 ? Math.round((totalAttendance / totalRegistrations) * 100) : 0
        };
      });

      res.json(attendanceStats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getAverageFeedback(req: Request, res: Response) {
    try {
      const eventId = req.query.eventId as string | undefined;
      const collegeId = req.query.collegeId as string | undefined;

      const events = await prisma.event.findMany({
        where: {
          ...(eventId && { id: eventId }),
          ...(collegeId && { collegeId })
        },
        include: {
          registrations: {
            include: {
              feedback: true
            }
          }
        }
      });

      const feedbackStats = events.map(event => {
        const feedbacks = event.registrations.filter(reg => reg.feedback);
        const totalFeedbacks = feedbacks.length;
        const averageRating = totalFeedbacks > 0 
          ? feedbacks.reduce((sum, reg) => sum + (reg.feedback?.rating || 0), 0) / totalFeedbacks 
          : 0;

        return {
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          totalFeedbacks,
          averageRating: Math.round(averageRating * 100) / 100,
          ratingDistribution: {
            1: feedbacks.filter(reg => reg.feedback?.rating === 1).length,
            2: feedbacks.filter(reg => reg.feedback?.rating === 2).length,
            3: feedbacks.filter(reg => reg.feedback?.rating === 3).length,
            4: feedbacks.filter(reg => reg.feedback?.rating === 4).length,
            5: feedbacks.filter(reg => reg.feedback?.rating === 5).length,
          }
        };
      });

      res.json(feedbackStats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getOverallStats(req: Request, res: Response) {
    try {
      const collegeId = req.query.collegeId as string | undefined;

      const totalStudents = await prisma.student.count({
        where: collegeId ? { collegeId } : {}
      });

      const totalEvents = await prisma.event.count({
        where: collegeId ? { collegeId } : {}
      });

      const totalRegistrations = await prisma.registration.count({
        where: collegeId ? {
          student: { collegeId }
        } : {}
      });

      const totalAttendance = await prisma.attendance.count({
        where: collegeId ? {
          registration: {
            student: { collegeId }
          }
        } : {}
      });

      const totalFeedbacks = await prisma.feedback.count({
        where: collegeId ? {
          registration: {
            student: { collegeId }
          }
        } : {}
      });

      const overallAttendanceRate = totalRegistrations > 0 
        ? Math.round((totalAttendance / totalRegistrations) * 100) 
        : 0;

      res.json({
        totalStudents,
        totalEvents,
        totalRegistrations,
        totalAttendance,
        totalFeedbacks,
        overallAttendanceRate
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
