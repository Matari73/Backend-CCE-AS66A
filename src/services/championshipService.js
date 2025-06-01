
import { Team, Match } from '../models/associations.js';
import { Op } from 'sequelize';

const isPowerOfTwo = (num) => (num & (num - 1)) === 0;

// Utilitário para embaralhar os times
const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

// -----------------------------
// Eliminatória Simples
// -----------------------------
const generateSingleEliminationBracket = async (championshipId) => {
    const teams = await Team.findAll({ where: { championship_id: championshipId } });

    const totalTeams = teams.length;

    if (!isPowerOfTwo(totalTeams)) {
        throw new Error('A quantidade de times deve ser uma potência de 2: 2, 4, 8, 16...');
    }

    const shuffledTeams = shuffleArray(teams);
    let matchups = [];

    for (let i = 0; i < shuffledTeams.length; i += 2) {
        const match = await Match.create({
            championship_id: championshipId,
            teamA_id: shuffledTeams[i].team_id,
            teamB_id: shuffledTeams[i + 1].team_id,
            stage: 'Round 1',
            date: new Date(),
            map: 'Haven',
        });

        matchups.push(match);
    }

    return matchups;
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
            date: new Date(),
            map: 'Ascent',
        });

        upperBracketMatches.push(match);
    }

    return { upperBracketMatches };
};

/**
 * Gera os confrontos da próxima fase de uma eliminatória dupla
 */
function handleDoubleEliminationNextPhase(matches, results, currentRound) {
    // Separa partidas da rodada atual por chave
    const upperBracket = matches.filter(m => m.bracket === 'upper' && m.round === currentRound);
    const lowerBracket = matches.filter(m => m.bracket === 'lower' && m.round === currentRound);

    const nextUpper = [];
    const nextLower = [];

    // Vencedores da chave superior
    const upperWinners = upperBracket
        .filter(m => results[m.match_id])
        .map(m => results[m.match_id]);

    // Monta confrontos da próxima rodada da chave superior
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

    // Derrotados da chave superior (descem para a inferior)
    const upperLosers = upperBracket
        .filter(m => results[m.match_id])
        .map(m => {
            const winner = results[m.match_id];
            return winner === m.teamA_id ? m.teamB_id : m.teamA_id;
        });

    // Vencedores da chave inferior
    const lowerWinners = lowerBracket
        .filter(m => results[m.match_id])
        .map(m => results[m.match_id]);

    const lowerTeams = [...lowerWinners, ...upperLosers];

    // Monta confrontos da próxima rodada da chave inferior
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
    handleDoubleEliminationNextPhase
};