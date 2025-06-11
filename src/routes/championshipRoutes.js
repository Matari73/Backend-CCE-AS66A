import express from 'express';
import {
  createChampionship,
  getAllChampionships,
  getChampionshipById,
  updateChampionship,
  deleteChampionship,
  generateBracket,
  generateBracketNextPhase
} from '../controllers/championshipController.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { championshipSchema } from '../schemas/championship.schema.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { checkOwnership } from '../middlewares/ownershipMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, validateSchema(championshipSchema), createChampionship);
router.get('/', getAllChampionships);
router.get('/:id', getChampionshipById);
router.put('/:id', authMiddleware, checkOwnership('championship'), validateSchema(championshipSchema), updateChampionship);
router.delete('/:id', authMiddleware , checkOwnership('championship'), deleteChampionship);
router.post('/:id/generate-bracket', authMiddleware, generateBracket)
router.post('/:id/generate-next-phase', authMiddleware, generateBracketNextPhase)

export default router;
