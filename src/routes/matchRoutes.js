import express from 'express';
import {
  getAllMatches,
  getMatchById,
  bulkUpdateMatches,
  getChampionshipMatches,
  generateNextRound
} from '../controllers/matchController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllMatches);
router.get('/:id', getMatchById);
router.put('/bulk-update', authMiddleware, bulkUpdateMatches);
router.get('/championships/:championshipId/matches', getChampionshipMatches);
router.post('/championships/:championshipId/generate-next-round', authMiddleware, generateNextRound);

export default router;
