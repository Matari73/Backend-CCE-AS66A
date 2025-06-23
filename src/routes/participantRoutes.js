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

/**
 * @swagger
 * components:
 *   schemas:
 *     Participant:
 *       type: object
 *       required:
 *         - name
 *         - nickname
 *         - birth_date
 *         - phone
 *         - is_coach
 *         - user_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do participante
 *           example: 1
 *         name:
 *           type: string
 *           description: Nome completo do participante
 *           example: "João Silva"
 *         nickname:
 *           type: string
 *           minLength: 2
 *           description: Apelido do participante
 *           example: "João"
 *         birth_date:
 *           type: string
 *           format: date
 *           description: Data de nascimento no formato YYYY-MM-DD
 *           example: "1990-05-15"
 *         phone:
 *           type: integer
 *           description: Número de telefone
 *           example: 11999999999
 *         team_id:
 *           type: integer
 *           nullable: true
 *           description: ID da equipe (opcional)
 *           example: 1
 *         is_coach:
 *           type: boolean
 *           description: Indica se é treinador
 *           example: false
 *         user_id:
 *           type: integer
 *           description: ID do usuário criador
 *           example: 1
 *     ParticipantInput:
 *       type: object
 *       required:
 *         - name
 *         - nickname
 *         - birth_date
 *         - phone
 *         - is_coach
 *         - user_id
 *       properties:
 *         name:
 *           type: string
 *           description: Nome completo do participante
 *           example: "João Silva"
 *         nickname:
 *           type: string
 *           minLength: 2
 *           description: Apelido do participante
 *           example: "João"
 *         birth_date:
 *           type: string
 *           format: date
 *           description: Data de nascimento no formato YYYY-MM-DD
 *           example: "1990-05-15"
 *         phone:
 *           type: integer
 *           description: Número de telefone
 *           example: 11999999999
 *         team_id:
 *           type: integer
 *           nullable: true
 *           description: ID da equipe (opcional)
 *           example: 1
 *         is_coach:
 *           type: boolean
 *           description: Indica se é treinador
 *           example: false
 *         user_id:
 *           type: integer
 *           description: ID do usuário criador
 *           example: 1
 */

/**
 * @swagger
 * /participants:
 *   get:
 *     summary: Lista todos os participantes
 *     tags: [Participants]
 *     responses:
 *       200:
 *         description: Lista de participantes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Participant'
 *       500:
 *         description: Erro interno do servidor
 *   post:
 *     summary: Criar novo participante
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParticipantInput'
 *     responses:
 *       201:
 *         description: Participante criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Participant'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /participants/{participantId}:
 *   get:
 *     summary: Obter participante por ID
 *     tags: [Participants]
 *     parameters:
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do participante
 *         example: 1
 *     responses:
 *       200:
 *         description: Participante encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Participant'
 *       404:
 *         description: Participante não encontrado
 *       500:
 *         description: Erro interno do servidor
 *   put:
 *     summary: Atualizar participante
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do participante
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParticipantInput'
 *     responses:
 *       200:
 *         description: Participante atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Participant'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Não autorizado - você só pode atualizar seus próprios participantes
 *       404:
 *         description: Participante não encontrado
 *       500:
 *         description: Erro interno do servidor
 *   delete:
 *     summary: Deletar participante
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do participante
 *         example: 1
 *     responses:
 *       200:
 *         description: Participante deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Participante deletado com sucesso"
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Não autorizado - você só pode deletar seus próprios participantes
 *       404:
 *         description: Participante não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

router.get('/', authMiddleware, getAllParticipants);
router.get('/:participantId', getParticipantById);
router.post('/', authMiddleware, validateSchema(participantSchema), createParticipant);
router.put('/:participantId', authMiddleware, checkOwnership('participant'), validateSchema(participantSchema), updateParticipant);
router.delete('/:participantId', authMiddleware, checkOwnership('participant'), deleteParticipant);

export default router;
