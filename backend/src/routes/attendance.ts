import express from 'express';
import { AttendanceController } from '../controllers/attendanceController';

const router = express.Router();

router.post('/', AttendanceController.markAttendance);
router.post('/bulk', AttendanceController.bulkMarkAttendance);
router.get('/event/:eventId', AttendanceController.getAttendanceByEvent);
router.get('/student/:studentId', AttendanceController.getAttendanceByStudent);
router.delete('/:id', AttendanceController.removeAttendance);

export default router;
