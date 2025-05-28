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

const router = express.Router();

router.get('/', getAllTeams);
router.get('/:teamId', getTeamById);
router.post('/', authMiddleware, validateSchema(teamSchema), createTeam);
router.put('/:teamId', authMiddleware, validateSchema(teamSchema), updateTeam);
router.delete('/:teamId', authMiddleware, deleteTeam);
router.get('/:teamId/validate', validateTeam)

export default router;