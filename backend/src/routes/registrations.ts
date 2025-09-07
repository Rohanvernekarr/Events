import express from 'express';
import { RegistrationsController } from '../controllers/registrationsController';
import { studentOnly } from '../middleware/auth';
import { validateSchema, registrationSchema } from '../middleware/validation';

const router = express.Router();

// Only students can register for events (mobile only)
router.post('/', studentOnly, validateSchema(registrationSchema), RegistrationsController.createRegistration);
router.get('/event/:eventId', RegistrationsController.getRegistrationsByEvent);
router.get('/student/:studentId', RegistrationsController.getRegistrationsByStudent);
router.get('/:id', RegistrationsController.getRegistrationById);
router.delete('/:id', RegistrationsController.cancelRegistration);

export default router;
