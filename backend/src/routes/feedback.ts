import express from 'express';
import { FeedbackController } from '../controllers/feedbackController';

const router = express.Router();

router.post('/', FeedbackController.submitFeedback);
router.get('/event/:eventId', FeedbackController.getFeedbackByEvent);
router.get('/:eventId/stats', FeedbackController.getFeedbackStats);
router.put('/:id', FeedbackController.updateFeedback);
router.delete('/:id', FeedbackController.deleteFeedback);

export default router;
