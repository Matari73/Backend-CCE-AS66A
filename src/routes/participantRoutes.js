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
import { checkOwnership } from '../middlewares/ownershipMiddleware.js';

const router = express.Router();

// Rotas padrão
router.get('/', getAllParticipants);
router.get('/:participantId', getParticipantById);
router.post('/', authMiddleware, validateSchema(participantSchema), createParticipant);
router.put('/:participantId', authMiddleware, checkOwnership('participant'), validateSchema(participantSchema), updateParticipant);
router.delete('/:participantId', authMiddleware, checkOwnership('participant'), deleteParticipant);

export default router;
