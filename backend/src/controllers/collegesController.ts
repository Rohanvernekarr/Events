import { Request, Response } from 'express';
import prisma from '../prismaClient';

export class CollegesController {
  static async createCollege(req: Request, res: Response) {
    try {
      const { name, emailDomain } = req.body;

      if (!name || !emailDomain) {
        return res.status(400).json({ error: 'Name and emailDomain are required' });
      }

      // Ensure emailDomain starts with @
      const formattedDomain = emailDomain.startsWith('@') ? emailDomain : `@${emailDomain}`;

      const college = await prisma.college.create({
        data: {
          name,
          emailDomain: formattedDomain
        }
      });

      res.status(201).json(college);
    } catch (error) {
      if ((error as any).code === 'P2002') {
        return res.status(400).json({ error: 'College name already exists' });
      }
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getAllColleges(req: Request, res: Response) {
    try {
      const colleges = await prisma.college.findMany({
        include: {
          _count: {
            select: {
              students: true,
              events: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.json(colleges);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async getCollegeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const college = await prisma.college.findUnique({
        where: { id },
        include: {
          students: {
            select: {
              id: true,
              name: true,
              email: true,
              isVerified: true
            }
          },
          events: {
            include: {
              _count: {
                select: {
                  registrations: true
                }
              }
            }
          }
        }
      });

      if (!college) {
        return res.status(404).json({ error: 'College not found' });
      }

      res.json(college);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async updateCollege(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, emailDomain } = req.body;

      const updates: any = {};
      if (name) updates.name = name;
      if (emailDomain) {
        updates.emailDomain = emailDomain.startsWith('@') ? emailDomain : `@${emailDomain}`;
      }

      const college = await prisma.college.update({
        where: { id },
        data: updates
      });

      res.json(college);
    } catch (error) {
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'College not found' });
      }
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async deleteCollege(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if college has students or events
      const college = await prisma.college.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              students: true,
              events: true
            }
          }
        }
      });

      if (!college) {
        return res.status(404).json({ error: 'College not found' });
      }

      if (college._count.students > 0 || college._count.events > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete college with existing students or events' 
        });
      }

      await prisma.college.delete({
        where: { id }
      });

      res.json({ message: 'College deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
