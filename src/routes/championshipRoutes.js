import express from 'express';
import {
  createChampionship,
  getAllChampionships,
  getChampionshipById,
  updateChampionship,
  deleteChampionship
} from '../controllers/championshipController.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { championshipSchema } from '../schemas/championship.schema.js';

const router = express.Router();

router.post('/', validateSchema(championshipSchema), createChampionship);
router.get('/', getAllChampionships);
router.get('/:id', getChampionshipById);
router.put('/:id', validateSchema(championshipSchema), updateChampionship);
router.delete('/:id', deleteChampionship);

export default router;
