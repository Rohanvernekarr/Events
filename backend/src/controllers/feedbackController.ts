import { Request, Response } from 'express';
import prisma from '../prismaClient';

export class FeedbackController {
  static async submitFeedback(req: Request, res: Response) {
    try {
      const { registrationId, rating, comments } = req.body;

      if (!registrationId || !rating) {
        return res.status(400).json({ error: 'registrationId and rating are required' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      // Check if registration exists and has attendance
      const registration = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: {
          attendance: true,
          event: true,
          student: true
        }
      });

      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      if (!registration.attendance) {
        return res.status(400).json({ error: 'Cannot submit feedback without attendance' });
      }

      // Check if event has occurred
      if (registration.event.date > new Date()) {
        return res.status(400).json({ error: 'Cannot submit feedback for future events' });
      }

      // Check if feedback already exists
      const existingFeedback = await prisma.feedback.findUnique({
        where: { registrationId }
      });

      if (existingFeedback) {
        return res.status(400).json({ error: 'Feedback already submitted for this event' });
      }

      const feedback = await prisma.feedback.create({
        data: {
          registrationId,
          rating,
          comments: comments || null
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

      res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getFeedbackByEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      const feedbacks = await prisma.feedback.findMany({
        where: {
          registration: {
            eventId
          }
        },
        include: {
          registration: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              event: true
            }
          }
        },
        orderBy: {
          submittedAt: 'desc'
        }
      });

      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async updateFeedback(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { rating, comments } = req.body;

      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const updateData: any = {};
      if (rating !== undefined) updateData.rating = rating;
      if (comments !== undefined) updateData.comments = comments;

      const feedback = await prisma.feedback.update({
        where: { id },
        data: updateData,
        include: {
          registration: {
            include: {
              student: true,
              event: true
            }
          }
        }
      });

      res.json({ message: 'Feedback updated successfully', feedback });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async deleteFeedback(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.feedback.delete({
        where: { id }
      });

      res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getFeedbackStats(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      const feedbacks = await prisma.feedback.findMany({
        where: {
          registration: {
            eventId
          }
        }
      });

      const totalFeedbacks = feedbacks.length;
      const averageRating = totalFeedbacks > 0 
        ? feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / totalFeedbacks 
        : 0;

      const ratingDistribution = {
        1: feedbacks.filter(f => f.rating === 1).length,
        2: feedbacks.filter(f => f.rating === 2).length,
        3: feedbacks.filter(f => f.rating === 3).length,
        4: feedbacks.filter(f => f.rating === 4).length,
        5: feedbacks.filter(f => f.rating === 5).length,
      };

      res.json({
        eventId,
        totalFeedbacks,
        averageRating: Math.round(averageRating * 100) / 100,
        ratingDistribution
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
