import express from 'express';
import {
  createMatch,
  getAllMatches,
  getMatchById,
  updateMatch,
  deleteMatch
} from '../controllers/matchController.js';

import { matchUpdateSchema } from '../schemas/matchUpdate.schema.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { matchSchema } from '../schemas/match.schema.js';

const router = express.Router();

router.get('/', getAllMatches);
router.get('/:matchId', getMatchById);
router.post('/', authMiddleware, validateSchema(matchSchema), createMatch);
router.put('/:matchId', authMiddleware, validateSchema(matchUpdateSchema), updateMatch);
router.delete('/:matchId', authMiddleware, deleteMatch);


export default router;


