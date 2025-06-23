import express from 'express';
import Match from '../models/match.js';
import { createMatch } from '../controllers/matchController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  getAllMatches,
  getMatchById,
} from '../controllers/matchController.js';

const router = express.Router();

export const createMatch = async (req, res) => {
  try {
    const {
      championship_id,
      teamA_id,
      teamB_id,
      date,
      stage,
      bracket,
      winner_team_id,
      score,
      map
    } = req.body;

    const match = await Match.create({
      championship_id,
      teamA_id,
      teamB_id,
      date,
      stage,
      bracket,
      winner_team_id,
      score,
      map
    });

    res.status(201).json({
      success: true,
      data: match,
      message: 'Partida criada com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar a partida',
      error: error.message
    });
  }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Match:
 *       type: object
 *       required:
 *         - championship_id
 *         - teamA_id
 *         - teamB_id
 *         - stage
 *         - map
 *       properties:
 *         match_id:
 *           type: integer
 *           description: ID único da partida
 *           example: 1
 *         championship_id:
 *           type: integer
 *           description: ID do campeonato
 *           example: 1
 *         teamA_id:
 *           type: integer
 *           description: ID do time A
 *           example: 1
 *         teamB_id:
 *           type: integer
 *           description: ID do time B
 *           example: 2
 *         date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Data e hora da partida
 *           example: "2024-01-20T14:00:00.000Z"
 *         stage:
 *           type: string
 *           description: Fase da partida
 *           example: "quarterfinal"
 *         bracket:
 *           type: string
 *           enum: [upper, lower, final]
 *           nullable: true
 *           description: Chave da partida (para eliminação dupla)
 *           example: "upper"
 *         winner_team_id:
 *           type: integer
 *           nullable: true
 *           description: ID do time vencedor
 *           example: 1
 *         score:
 *           type: object
 *           nullable: true
 *           description: Placar da partida
 *           properties:
 *             teamA:
 *               type: integer
 *               example: 13
 *             teamB:
 *               type: integer
 *               example: 7
 *         map:
 *           type: string
 *           description: Mapa jogado
 *           example: "Haven"
 *         status:
 *           type: string
 *           description: Status da partida
 *           example: "Pre-Agendada"
 *         next_match_id:
 *           type: integer
 *           nullable: true
 *           description: ID da próxima partida
 *           example: 5
 *         TeamA:
 *           type: object
 *           nullable: true
 *           properties:
 *             team_id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: "Team Alpha"
 *         TeamB:
 *           type: object
 *           nullable: true
 *           properties:
 *             team_id:
 *               type: integer
 *               example: 2
 *             name:
 *               type: string
 *               example: "Team Beta"
 *         WinnerTeam:
 *           type: object
 *           nullable: true
 *           properties:
 *             team_id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: "Team Alpha"
 *     MatchInput:
 *       type: object
 *       required:
 *         - championship_id
 *         - teamA_id
 *         - teamB_id
 *         - stage
 *         - map
 *       properties:
 *         championship_id:
 *           type: integer
 *           description: ID do campeonato
 *           example: 1
 *         teamA_id:
 *           type: integer
 *           description: ID do time A
 *           example: 1
 *         teamB_id:
 *           type: integer
 *           description: ID do time B
 *           example: 2
 *         date:
 *           type: string
 *           format: date-time
 *           description: Data e hora da partida
 *           example: "2024-01-20T14:00:00.000Z"
 *         stage:
 *           type: string
 *           description: Fase da partida
 *           example: "quarterfinal"
 *         bracket:
 *           type: string
 *           enum: [upper, lower, final]
 *           description: Chave da partida (para eliminação dupla)
 *           example: "upper"
 *         winner_team_id:
 *           type: integer
 *           description: ID do time vencedor
 *           example: 1
 *         score:
 *           type: object
 *           description: Placar da partida
 *           properties:
 *             teamA:
 *               type: integer
 *               example: 13
 *             teamB:
 *               type: integer
 *               example: 7
 *         map:
 *           type: string
 *           description: Mapa jogado
 *           example: "Haven"
 */  

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Lista todas as partidas
 *     tags: [Matches]
 *     parameters:
 *       - in: query
 *         name: championship_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID do campeonato
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
 *                     $ref: '#/components/schemas/Match'
 *                 total:
 *                   type: integer
 *                   description: Total de partidas
 *                   example: 8
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
 */

/**
 * @swagger
 * /matches/{id}:
 *   get:
 *     summary: Obter partida por ID
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da partida
 *         example: 1
 *     responses:
 *       200:
 *         description: Partida encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       404:
 *         description: Partida não encontrada
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
 *                   example: "Match not found"
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
 *                   example: "Failed to fetch match"
 */
router.post('/', authMiddleware, createMatch); 
router.get('/', getAllMatches);
router.get('/:id', getMatchById);

export default router;


