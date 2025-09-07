import express from 'express';
import { EventsController } from '../controllers/eventsController';
import { adminOnly, studentOnly, collegeOwnerOnly } from '../middleware/auth';
import { validateSchema, eventSchema } from '../middleware/validation';

const router = express.Router();

// Admin can create events (web only) - only for their college
router.post('/', adminOnly, collegeOwnerOnly, validateSchema(eventSchema), EventsController.createEvent);

// Admin can view all events (for admin portal) - filtered by college
router.get('/', adminOnly, EventsController.getAllEvents);
router.get('/:id', EventsController.getEventById);
router.put('/:id', adminOnly, collegeOwnerOnly, EventsController.updateEvent);
router.delete('/:id', adminOnly, collegeOwnerOnly, EventsController.deleteEvent);
router.get('/:id/capacity', EventsController.checkEventCapacity);
router.put('/:id/cancel', adminOnly, collegeOwnerOnly, EventsController.cancelEvent);
router.post('/:id/send-feedback-reminders', adminOnly, collegeOwnerOnly, EventsController.sendFeedbackReminders);

export default router;
