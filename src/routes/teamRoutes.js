import express from 'express';
import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  validateTeam
} from '../controllers/teamController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { teamSchema } from '../schemas/team.schema.js';
import { checkOwnership } from '../middlewares/ownershipMiddleware.js';

const router = express.Router();

router.get('/', getAllTeams);
router.get('/:teamId', getTeamById);
router.post('/', authMiddleware, validateSchema(teamSchema), createTeam);
router.put('/:teamId', authMiddleware, validateSchema(teamSchema), checkOwnership('team'), updateTeam);
router.delete('/:teamId', authMiddleware, checkOwnership('team'), deleteTeam);
router.get('/:teamId/validate', validateTeam)

export default router;