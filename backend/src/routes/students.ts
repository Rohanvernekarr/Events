import express from 'express';
import { StudentsController } from '../controllers/studentsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', StudentsController.registerStudent);
router.post('/login', StudentsController.loginStudent);

// Admin routes
router.post('/', StudentsController.createStudent);
router.get('/', StudentsController.getAllStudents);
router.get('/:id', StudentsController.getStudentById);
router.patch('/:id/verify', StudentsController.verifyStudent);
router.post('/:id/resend-verification', StudentsController.resendVerification);
router.delete('/:id', StudentsController.deleteStudent);

// Student authenticated routes
router.get('/me/events', authMiddleware('student', 'mobile'), StudentsController.getStudentEvents);
router.post('/events/:eventId/register', authMiddleware('student', 'mobile'), StudentsController.registerForEvent);
router.post('/events/:eventId/attendance', authMiddleware('student', 'mobile'), StudentsController.markAttendance);
router.post('/events/:eventId/feedback', authMiddleware('student', 'mobile'), StudentsController.submitFeedback);

export default router;
