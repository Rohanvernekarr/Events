import express from 'express';
import { CollegesController } from '../controllers/collegesController';

const router = express.Router();

router.post('/', CollegesController.createCollege);
router.get('/', CollegesController.getAllColleges);
router.get('/:id', CollegesController.getCollegeById);
router.put('/:id', CollegesController.updateCollege);
router.delete('/:id', CollegesController.deleteCollege);

export default router;
