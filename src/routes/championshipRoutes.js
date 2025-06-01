import express from 'express';
import {
  createChampionship,
  getAllChampionships,
  getChampionshipById,
  updateChampionship,
  deleteChampionship,
  generateBracket
} from '../controllers/championshipController.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { championshipSchema } from '../schemas/championship.schema.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', validateSchema(championshipSchema), createChampionship);
router.get('/', getAllChampionships);
router.get('/:id', getChampionshipById);
router.put('/:id', validateSchema(championshipSchema), updateChampionship);
router.delete('/:id', deleteChampionship);
router.post('/:id/generate-bracket', authMiddleware, generateBracket)

export default router;
