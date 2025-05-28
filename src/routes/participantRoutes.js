import express from 'express';
import {
  createParticipant,
  getAllParticipants,
  getParticipantById,
  updateParticipant,
  deleteParticipant
} from '../controllers/participantController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { participantSchema } from '../schemas/participant.schema.js';

const router = express.Router();

// Rotas padrão
router.get('/', getAllParticipants);
router.get('/:participantId', getParticipantById);
router.post('/', authMiddleware, validateSchema(participantSchema), createParticipant);
router.put('/:participantId', authMiddleware, validateSchema(participantSchema), updateParticipant);
router.delete('/:participantId', authMiddleware, deleteParticipant);

export default router;
