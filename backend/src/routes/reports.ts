import express from 'express';
import { ReportsController } from '../controllers/reportsController';
import { adminOnly } from '../middleware/auth';

const router = express.Router();

// Admin reports (remove auth middleware for admin portal)
router.get('/event-popularity', ReportsController.getEventPopularity);
router.get('/student-participation', ReportsController.getStudentParticipation);
router.get('/top-active-students', ReportsController.getTopActiveStudents);
router.get('/attendance-percentage', ReportsController.getAttendancePercentage);
router.get('/average-feedback', ReportsController.getAverageFeedback);
router.get('/overall-stats', ReportsController.getOverallStats);

export default router;
