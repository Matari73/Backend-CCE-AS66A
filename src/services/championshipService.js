import { Team, Match } from '../models/associations.js';
import { Op } from 'sequelize';

const isPowerOfTwo = (num) => (num & (num - 1)) === 0;

const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

const mapOptions = [
    'Bind', 'Ascent', 'Icebox', 'Haven', 'Lotus',
    'Sunset', 'Abyss', 'Breeze', 'Fracture', 'Pearl', 'Split'
];

const getRandomMap = () => {
    const index = Math.floor(Math.random() * mapOptions.length);
    return mapOptions[index];
};

function getStageNameByRound(round, totalRounds) {
    const stageNames = {
        1: 'Final',
        2: 'Semifinal',
        3: 'Quartas de final',
        4: 'Oitavas de final',
        5: 'Rodada 1',
        6: 'Rodada 2',
    };

    const remaining = totalRounds - round + 1;
    return stageNames[remaining] || `Rodada ${round}`;
}

// -----------------------------
// Eliminatória Simples
// -----------------------------
const generateSingleEliminationBracket = async (championshipId) => {
    const teams = await Team.findAll({ where: { championship_id: championshipId } });

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

const handleSingleEliminationNextPhase = async (championshipId, currentRound) => {
    const previousMatches = await Match.findAll({
        where: {
            championship_id: championshipId,
            stage: { [Op.iLike]: `%${currentRound}` } 
        },
    });

    const winners = previousMatches
        .filter(match => match.winner_team_id !== null)
        .map(match => match.winner_team_id);

    if (winners.length < 2) {
        throw new Error('Número insuficiente de vencedores para a próxima fase.');
    }

    const nextRound = currentRound + 1;
    const totalRounds = Math.log2(
        await Team.count({ where: { championship_id: championshipId } })
    );
    const stageName = getStageNameByRound(nextRound, totalRounds);

    const newMatches = [];

    for (let i = 0; i < winners.length; i += 2) {
        if (i + 1 < winners.length) {
            newMatches.push({
                championship_id: championshipId,
                teamA_id: winners[i],
                teamB_id: winners[i + 1],
                stage: stageName,
                date: new Date(),
                map: getRandomMap()
            });
        }
    }

    const created = await Match.bulkCreate(newMatches);
    return created;
};

// -----------------------------
// Eliminatória Dupla
// -----------------------------
const generateDoubleEliminationBracket = async (championshipId) => {
    const teams = await Team.findAll({ where: { championship_id: championshipId } });

    const totalTeams = teams.length;

    if (!isPowerOfTwo(totalTeams)) {
        throw new Error('A quantidade de times deve ser uma potência de 2: 2, 4, 8, 16...');
    }

    const shuffledTeams = shuffleArray(teams);
    const upperBracketMatches = [];

    for (let i = 0; i < shuffledTeams.length; i += 2) {
        const match = await Match.create({
            championship_id: championshipId,
            teamA_id: shuffledTeams[i].team_id,
            teamB_id: shuffledTeams[i + 1].team_id,
            stage: 'Upper Round 1',
            bracket: 'upper',
            date: new Date(),
            map: getRandomMap(),
        });

        upperBracketMatches.push(match);
    }

    return { upperBracketMatches };
};

function handleDoubleEliminationNextPhase(matches, results, currentRound) {
    const upperBracket = matches.filter(m => m.bracket === 'upper' && m.round === currentRound);
    const lowerBracket = matches.filter(m => m.bracket === 'lower' && m.round === currentRound);

    const nextUpper = [];
    const nextLower = [];

    const upperWinners = upperBracket
        .filter(m => results[m.match_id])
        .map(m => results[m.match_id]);

    for (let i = 0; i < upperWinners.length; i += 2) {
        if (i + 1 < upperWinners.length) {
            nextUpper.push({
                round: currentRound + 1,
                bracket: 'upper',
                teamA_id: upperWinners[i],
                teamB_id: upperWinners[i + 1],
            });
        }
    }

    const upperLosers = upperBracket
        .filter(m => results[m.match_id])
        .map(m => {
            const winner = results[m.match_id];
            return winner === m.teamA_id ? m.teamB_id : m.teamA_id;
        });

    const lowerWinners = lowerBracket
        .filter(m => results[m.match_id])
        .map(m => results[m.match_id]);

    const lowerTeams = [...lowerWinners, ...upperLosers];

    for (let i = 0; i < lowerTeams.length; i += 2) {
        if (i + 1 < lowerTeams.length) {
            nextLower.push({
                round: currentRound + 1,
                bracket: 'lower',
                teamA_id: lowerTeams[i],
                teamB_id: lowerTeams[i + 1],
            });
        }
    }

    return { nextUpper, nextLower };
}

export {
    generateSingleEliminationBracket,
    generateDoubleEliminationBracket,
    handleSingleEliminationNextPhase,
    handleDoubleEliminationNextPhase
};