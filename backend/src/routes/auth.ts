import express from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// ADMIN WEB ROUTES
router.post('/admin/login', AuthController.loginAdmin);

// STUDENT MOBILE ROUTES
router.post('/student/register', AuthController.registerStudent);
router.post('/student/login', AuthController.loginStudent);
router.post('/student/resend-verification', AuthController.resendVerification);

// COMMON ROUTES
router.get('/me', authMiddleware(), AuthController.getCurrentUser);

export default router;
