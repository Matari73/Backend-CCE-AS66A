import { Team, Match, Subscription } from '../models/associations.js';
import { Op } from 'sequelize';
import { 
    isPowerOfTwo, 
    shuffleArray, 
    getRandomMap, 
    getStageNameByRound 
} from '../utils/bracketUtils.js';

const generateSingleEliminationBracket = async (championshipId) => {
    const subscriptions = await Subscription.findAll({
        where: { championship_id: championshipId },
        include: [Team]
    });

    const teams = subscriptions.map(sub => sub.Team);
    const totalTeams = teams.length;

    if (!isPowerOfTwo(totalTeams)) {
        throw new Error('A quantidade de times deve ser uma potência de 2: 2, 4, 8, 16...');
    }

    const totalRounds = Math.log2(totalTeams);
    const shuffledTeams = shuffleArray(teams);
    const matchups = [];

    const round = 1;
    const stageName = getStageNameByRound(round, totalRounds);

    for (let i = 0; i < shuffledTeams.length; i += 2) {
        const match = await Match.create({
            championship_id: championshipId,
            teamA_id: shuffledTeams[i].team_id,
            teamB_id: shuffledTeams[i + 1].team_id,
            stage: stageName,
            date: new Date(),
            map: getRandomMap(),
        });

        matchups.push(match);
    }

    return matchups;
};

const handleSingleEliminationNextPhase = async (championshipId) => {
    try {
        const completedMatches = await Match.findAll({
            where: {
                championship_id: championshipId,
                winner_team_id: { [Op.ne]: null }
            },
            order: [['date', 'ASC']]
        });

        if (completedMatches.length === 0) {
            throw new Error('Nenhuma partida completada encontrada');
        }

        const stages = [...new Set(completedMatches.map(match => match.stage))];
        const stageOrder = ['Rodada 1', 'Rodada 2', 'Oitavas de final', 'Quartas de final', 'Semifinal', 'Final'];
        let currentStage = null;

        for (const stage of stageOrder) {
            if (stages.includes(stage)) {
                currentStage = stage;
            }
        }

        if (!currentStage) {
            throw new Error(`Não foi possível identificar a fase atual. Stages encontrados: ${stages.join(', ')}`);
        }

        const currentStageMatches = await Match.findAll({
            where: {
                championship_id: championshipId,
                stage: currentStage
            }
        });

        const pendingCurrentStage = currentStageMatches.filter(match => !match.winner_team_id);

        if (pendingCurrentStage.length > 0) {
            throw new Error(`Existem ${pendingCurrentStage.length} partidas pendentes na fase ${currentStage}`);
        }

        const winners = currentStageMatches
            .filter(match => match.winner_team_id)
            .map(match => match.winner_team_id);

        if (winners.length < 2) {
            throw new Error(`Número insuficiente de vencedores (${winners.length}) para a próxima fase`);
        }

        const nextStageIndex = stageOrder.indexOf(currentStage) + 1;
        if (nextStageIndex >= stageOrder.length) {
            throw new Error('Campeonato já foi finalizado');
        }

        const nextStage = stageOrder[nextStageIndex];

        const nextPhaseMatches = [];
        for (let i = 0; i < winners.length; i += 2) {
            if (i + 1 < winners.length) {
                const match = {
                    championship_id: championshipId,
                    teamA_id: winners[i],
                    teamB_id: winners[i + 1],
                    date: new Date(),
                    stage: nextStage,
                    bracket: 'upper',
                    map: getRandomMap()
                };
                nextPhaseMatches.push(match);
            }
        }

        const createdMatches = await Match.bulkCreate(nextPhaseMatches);

        return {
            stage: nextStage,
            matches: createdMatches,
            winnersAdvanced: winners.length
        };

    } catch (error) {
        throw error;
    }
};

export {
    generateSingleEliminationBracket,
    handleSingleEliminationNextPhase
};

