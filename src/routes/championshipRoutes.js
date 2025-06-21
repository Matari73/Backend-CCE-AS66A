import express from 'express';
import {
  createChampionship,
  getAllChampionships,
  getChampionshipById,
  updateChampionship,
  deleteChampionship,
  generateBracket,
  generateNextPhase,
  getChampionshipMatches,
  bulkUpdateMatches
} from '../controllers/championshipController.js';
import { championshipSchema } from '../schemas/championship.schema.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { checkOwnership } from '../middlewares/ownershipMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Championship:
 *       type: object
 *       required:
 *         - name
 *         - start_date
 *         - end_date
 *       properties:
 *         championship_id:
 *           type: integer
 *           description: ID único do campeonato
 *           example: 1
 *         name:
 *           type: string
 *           description: Nome do campeonato
 *           example: "VCT Champions 2024"
 *         description:
 *           type: string
 *           description: Descrição do campeonato
 *           example: "Campeonato mundial de Valorant 2024"
 *         start_date:
 *           type: string
 *           format: date
 *           description: Data de início do campeonato
 *           example: "2024-01-15"
 *         end_date:
 *           type: string
 *           format: date
 *           description: Data de fim do campeonato
 *           example: "2024-02-15"
 *         status:
 *           type: string
 *           enum: [planejado, ativo, finalizado]
 *           description: Status atual do campeonato
 *           example: "agendado"
 *         prize:
 *           type: number
 *           format: decimal
 *           description: Premiação total em reais
 *           example: 1000000.00
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação do campeonato
 *           example: "2023-12-01T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *           example: "2023-12-01T10:00:00.000Z"
 *     ChampionshipInput:
 *       type: object
 *       required:
 *         - name
 *         - start_date
 *         - end_date
 *       properties:
 *         name:
 *           type: string
 *           description: Nome do campeonato
 *           example: "VCT Champions 2024"
 *         description:
 *           type: string
 *           description: Descrição do campeonato
 *           example: "Campeonato mundial de Valorant 2024"
 *         start_date:
 *           type: string
 *           format: date
 *           description: Data de início do campeonato
 *           example: "2024-01-15"
 *         end_date:
 *           type: string
 *           format: date
 *           description: Data de fim do campeonato
 *           example: "2024-02-15"
 *         status:
 *           type: string
 *           enum: [Planejado, ativo, finalizado]
 *           description: Status atual do campeonato
 *           example: "agendado"
 *         prize:
 *           type: number
 *           format: decimal
 *           description: Premiação total em reais
 *           example: 1000000.00
 *         format:
 *           type: string
 *           enum: [double, simple]
 *           description: Formato de chaveamento do campeonato
 *           example: "simple"
 *         user_id:
 *           type: integer
 *           description: ID do usuário que criou o campeonato
 *           example: 1
 *         location:
 *           type: string
 *           description: Localização do campeonato
 *           example: "São Paulo, Brasil"
 */

/**
 * @swagger
 * /championships:
 *   get:
 *     summary: Lista todos os campeonatos
 *     tags: [Championships]
 *     responses:
 *       200:
 *         description: Lista de campeonatos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Championship'
 *                 total:
 *                   type: integer
 *                   description: Total de campeonatos
 *                   example: 25
 *                 limit:
 *                   type: integer
 *                   description: Limite usado na consulta
 *                   example: 10
 *                 offset:
 *                   type: integer
 *                   description: Offset usado na consulta
 *                   example: 0
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro interno do servidor"
 *   post:
 *     summary: Criar novo campeonato
 *     tags: [Championships]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChampionshipInput'
 *     responses:
 *       201:
 *         description: Campeonato criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Championship'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Nome do campeonato é obrigatório"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "start_date"
 *                       message:
 *                         type: string
 *                         example: "Data de início é obrigatória"
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token não fornecido"
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /championships/{id}:
 *   get:
 *     summary: Obter campeonato por ID
 *     tags: [Championships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Campeonato encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Championship'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID inválido. Deve ser um número."
 *       404:
 *         description: Campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campeonato não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro interno do servidor"
 *                 details:
 *                   type: string
 *                   example: "Database connection failed"
 *   put:
 *     summary: Atualizar campeonato
 *     tags: [Championships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChampionshipInput'
 *     responses:
 *       200:
 *         description: Campeonato atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Championship'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Dados inválidos fornecidos"
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campeonato não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *   delete:
 *     summary: Deletar campeonato
 *     tags: [Championships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       204:
 *         description: Campeonato deletado com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token não fornecido"
 *       404:
 *         description: Campeonato não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Campeonato não encontrado"
 *       409:
 *         description: Conflito - Campeonato não pode ser deletado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Não é possível deletar campeonato com equipes inscritas"
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /championships/{id}/generate-bracket:
 *   post:
 *     summary: Gerar chaveamento inicial do campeonato
 *     tags: [Championships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - format
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [single, double]
 *                 description: Formato do chaveamento
 *                 example: "single"
 *     responses:
 *       201:
 *         description: Chaveamento gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Chaveamento (single) gerado com sucesso!"
 *                 data:
 *                   type: object
 *                   description: Dados do chaveamento gerado
 *                   properties:
 *                     matches:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           match_id:
 *                             type: integer
 *                             example: 1
 *                           teamA_id:
 *                             type: integer
 *                             example: 1
 *                           teamB_id:
 *                             type: integer
 *                             example: 2
 *                           stage:
 *                             type: string
 *                             example: "quarterfinal"
 *                           championship_id:
 *                             type: integer
 *                             example: 1
 *                     totalMatches:
 *                       type: integer
 *                       description: Total de partidas geradas
 *                       example: 15
 *                     stages:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["quarterfinal", "semifinal", "final"]
 *       400:
 *         description: Formato inválido ou erro na geração
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Formato inválido. Use 'single' ou 'double'"
 *                 error:
 *                   type: string
 *                   example: "Número insuficiente de equipes para gerar chaveamento"
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Campeonato não encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro interno do servidor ao gerar chaveamento"
 */

/**
 * @swagger
 * /championships/{id}/generate-next-phase:
 *   post:
 *     summary: Gerar próxima fase do campeonato
 *     tags: [Championships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - format
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [single, double]
 *                 description: Formato do chaveamento
 *                 example: "single"
 *     responses:
 *       201:
 *         description: Próxima fase gerada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Próxima fase (single) gerada com sucesso!"
 *                 data:
 *                   type: object
 *                   description: Dados da próxima fase
 *                   properties:
 *                     matches:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           match_id:
 *                             type: integer
 *                             example: 5
 *                           teamA_id:
 *                             type: integer
 *                             example: 1
 *                           teamB_id:
 *                             type: integer
 *                             example: 3
 *                           stage:
 *                             type: string
 *                             example: "semifinal"
 *                 details:
 *                   type: object
 *                   properties:
 *                     winnersAdvanced:
 *                       type: integer
 *                       description: Número de vencedores que avançaram
 *                       example: 8
 *                     newMatchesGenerated:
 *                       type: integer
 *                       description: Número de novas partidas geradas
 *                       example: 4
 *       400:
 *         description: Partidas pendentes ou formato inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Existem 2 partidas pendentes. Complete todas as partidas antes de gerar a próxima fase."
 *                 pendingMatches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       match_id:
 *                         type: integer
 *                         example: 1
 *                       stage:
 *                         type: string
 *                         example: "quarterfinal"
 *                       teamA_id:
 *                         type: integer
 *                         example: 1
 *                       teamB_id:
 *                         type: integer
 *                         example: 2
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Campeonato não encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Erro interno do servidor"
 *                 details:
 *                   type: string
 *                   example: "Verifique se todas as partidas foram finalizadas e se há vencedores suficientes."
 */

/**
 * @swagger
 * /championships/{id}/matches:
 *   get:
 *     summary: Obter partidas do campeonato
 *     tags: [Championships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de partidas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       match_id:
 *                         type: integer
 *                         description: ID da partida
 *                         example: 1
 *                       championship_id:
 *                         type: integer
 *                         description: ID do campeonato
 *                         example: 1
 *                       teamA_id:
 *                         type: integer
 *                         description: ID do time A
 *                         example: 1
 *                       teamB_id:
 *                         type: integer
 *                         description: ID do time B
 *                         example: 2
 *                       winner_team_id:
 *                         type: integer
 *                         nullable: true
 *                         description: ID do time vencedor
 *                         example: 1
 *                       stage:
 *                         type: string
 *                         description: Fase da partida
 *                         example: "quarterfinal"
 *                       score:
 *                         type: object
 *                         nullable: true
 *                         description: Placar da partida
 *                         properties:
 *                           teamA:
 *                             type: integer
 *                             example: 2
 *                           teamB:
 *                             type: integer
 *                             example: 1
 *                       map:
 *                         type: string
 *                         nullable: true
 *                         description: Mapa jogado
 *                         example: "Haven"
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         description: Data e hora da partida
 *                         example: "2024-01-20T14:00:00.000Z"
 *                       TeamA:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           team_id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Team Alpha"
 *                       TeamB:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           team_id:
 *                             type: integer
 *                             example: 2
 *                           name:
 *                             type: string
 *                             example: "Team Beta"
 *                       WinnerTeam:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           team_id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Team Alpha"
 *                 total:
 *                   type: integer
 *                   description: Total de partidas
 *                   example: 8
 *       404:
 *         description: Campeonato não encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch matches"
 *                 details:
 *                   type: string
 *                   example: "Database connection failed"
 */

/**
 * @swagger
 * /championships/{id}/matches/bulk-update:
 *   put:
 *     summary: Atualizar múltiplas partidas em lote
 *     tags: [Championships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do campeonato
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matches
 *             properties:
 *               matches:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     match_id:
 *                       type: integer
 *                       description: ID da partida a ser atualizada
 *                       example: 1
 *                     score:
 *                       type: object
 *                       description: Placar da partida
 *                       properties:
 *                         teamA:
 *                           type: integer
 *                           example: 2
 *                         teamB:
 *                           type: integer
 *                           example: 1
 *                     map:
 *                       type: string
 *                       description: Mapa jogado
 *                       example: "Haven"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       description: Data e hora da partida
 *                       example: "2024-01-20T14:00:00.000Z"
 *     responses:
 *       200:
 *         description: Partidas atualizadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bulk update completed"
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       match_id:
 *                         type: integer
 *                         example: 1
 *                       success:
 *                         type: boolean
 *                         example: true
 *                       message:
 *                         type: string
 *                         example: "Updated successfully"
 *                       error:
 *                         type: string
 *                         example: "Invalid score format"
 *                       winner_team_id:
 *                         type: integer
 *                         example: 1
 *                       score_details:
 *                         type: string
 *                         example: "TeamA: 2 x 1 :TeamB"
 *                       new_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-20T14:00:00.000Z"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Matches array is required"
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Campeonato não encontrado
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to bulk update matches"
 *                 details:
 *                   type: string
 *                   example: "Database connection failed"
 */

router.get('/', getAllChampionships);
router.get('/:id', getChampionshipById);
router.post('/', authMiddleware, validateSchema(championshipSchema), createChampionship);
router.put('/:id', authMiddleware, checkOwnership('championship'), validateSchema(championshipSchema), updateChampionship);
router.delete('/:id', authMiddleware, deleteChampionship);
router.post('/:id/generate-bracket', authMiddleware, generateBracket);
router.post('/:id/generate-next-phase', authMiddleware, generateNextPhase);
router.get('/:id/matches', getChampionshipMatches);
router.put('/:id/matches/bulk-update', authMiddleware, checkOwnership('match'), bulkUpdateMatches);

export default router;
