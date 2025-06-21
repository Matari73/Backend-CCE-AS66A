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

/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da equipe
 *           example: 1
 *         name:
 *           type: string
 *           description: Nome da equipe
 *           example: "Equipe Alpha"
 *         user_id:
 *           type: integer
 *           description: ID do usuário criador
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação da equipe
 *           example: "2023-12-01T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *           example: "2023-12-01T10:00:00.000Z"
 *     TeamInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Nome da equipe
 *           example: "Equipe Alpha"
 *     TeamValidation:
 *       type: object
 *       properties:
 *         isValid:
 *           type: boolean
 *           description: Indica se a equipe é válida
 *           example: true
 *         message:
 *           type: string
 *           description: Mensagem de validação
 *           example: "Equipe válida"
 *         details:
 *           type: object
 *           description: Detalhes da validação
 */

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Lista todas as equipes
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: Lista de equipes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 *       500:
 *         description: Erro interno do servidor
 *   post:
 *     summary: Criar nova equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamInput'
 *     responses:
 *       201:
 *         description: Equipe criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /teams/{teamId}:
 *   get:
 *     summary: Obter equipe por ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da equipe
 *         example: 1
 *     responses:
 *       200:
 *         description: Equipe encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       404:
 *         description: Equipe não encontrada
 *       500:
 *         description: Erro interno do servidor
 *   put:
 *     summary: Atualizar equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da equipe
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamInput'
 *     responses:
 *       200:
 *         description: Equipe atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Não autorizado - você só pode atualizar suas próprias equipes
 *       404:
 *         description: Equipe não encontrada
 *       500:
 *         description: Erro interno do servidor
 *   delete:
 *     summary: Deletar equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da equipe
 *         example: 1
 *     responses:
 *       200:
 *         description: Equipe deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Equipe deletada com sucesso"
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Não autorizado - você só pode deletar suas próprias equipes
 *       404:
 *         description: Equipe não encontrada
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /teams/{teamId}/validate:
 *   get:
 *     summary: Validar equipe
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da equipe
 *         example: 1
 *     responses:
 *       200:
 *         description: Validação da equipe retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamValidation'
 *       404:
 *         description: Equipe não encontrada
 *       500:
 *         description: Erro interno do servidor
 */

router.get('/', getAllTeams);
router.get('/:teamId', getTeamById);
router.post('/', authMiddleware, validateSchema(teamSchema), createTeam);
router.put('/:teamId', authMiddleware, validateSchema(teamSchema), checkOwnership('team'), updateTeam);
router.delete('/:teamId', authMiddleware, checkOwnership('team'), deleteTeam);
router.get('/:teamId/validate', validateTeam);

export default router;