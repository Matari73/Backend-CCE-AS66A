import { Team, Match, Subscription } from '../models/associations.js';
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
        console.error('Error in handleSingleEliminationNextPhase:', error);
        throw error;
    }
};

const generateDoubleEliminationBracket = async (championshipId) => {
    const subscriptions = await Subscription.findAll({
        where: { championship_id: championshipId },
        include: [Team]
    });

    const teams = subscriptions.map(sub => sub.Team);
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

const handleDoubleEliminationNextPhase = async (championshipId) => {
    try {
        const allMatches = await Match.findAll({
            where: { championship_id: championshipId },
            order: [['date', 'ASC']]
        });

        const completedMatches = allMatches.filter(match => match.winner_team_id);
        const pendingMatches = allMatches.filter(match => !match.winner_team_id);

        if (pendingMatches.length > 0) {
            throw new Error(`Existem ${pendingMatches.length} partidas pendentes. Complete todas antes de gerar a próxima fase.`);
        }

        if (completedMatches.length === 0) {
            throw new Error('Nenhuma partida completada encontrada');
        }

        const grandFinalExists = completedMatches.some(m => m.stage === 'Grand Final');
        if (grandFinalExists) {
            throw new Error('Eliminação dupla já foi finalizada');
        }

        const upperBracketMatches = completedMatches.filter(match => match.bracket === 'upper');
        const lowerBracketMatches = completedMatches.filter(match => match.bracket === 'lower');

        const upperChampion = getUpperBracketChampion(upperBracketMatches);
        const lowerChampion = getLowerBracketChampion(lowerBracketMatches);

        if (upperChampion && lowerChampion) {
            const grandFinalMatch = {
                championship_id: championshipId,
                teamA_id: upperChampion,
                teamB_id: lowerChampion,
                date: new Date(),
                stage: 'Grand Final',
                bracket: 'final',
                map: getRandomMap()
            };

            const createdMatch = await Match.create(grandFinalMatch);

            return {
                stage: 'Grand Final',
                matches: [createdMatch],
                breakdown: {
                    upperBracket: { count: 0, matches: [] },
                    lowerBracket: { count: 0, matches: [] },
                    grandFinal: { count: 1, matches: [createdMatch] }
                }
            };
        }

        const nextMatches = [];
        
        const upperStages = [...new Set(upperBracketMatches.map(m => m.stage))];
        const lowerStages = [...new Set(lowerBracketMatches.map(m => m.stage))];
        
        const currentUpperStage = upperStages[upperStages.length - 1];
        const currentLowerStage = lowerStages.length > 0 ? lowerStages[lowerStages.length - 1] : null;

        // Process Upper Bracket if still has matches
        if (currentUpperStage && !upperChampion) {
            const currentUpperMatches = upperBracketMatches.filter(m => m.stage === currentUpperStage);
            const upperWinners = currentUpperMatches.map(m => m.winner_team_id).filter(Boolean);

            if (upperWinners.length > 1) {
                const nextUpperStage = getNextUpperStage(currentUpperStage);
                for (let i = 0; i < upperWinners.length; i += 2) {
                    if (i + 1 < upperWinners.length) {
                        nextMatches.push({
                            championship_id: championshipId,
                            teamA_id: upperWinners[i],
                            teamB_id: upperWinners[i + 1],
                            date: new Date(),
                            stage: nextUpperStage,
                            bracket: 'upper',
                            map: getRandomMap()
                        });
                    }
                }
            }
        }

        // Process Lower Bracket
        const lowerResult = processLowerBracket(
            upperBracketMatches, 
            lowerBracketMatches, 
            currentUpperStage, 
            currentLowerStage, 
            upperChampion,
            championshipId
        );
        
        nextMatches.push(...lowerResult.matches);

        if (nextMatches.length === 0) {
            if (upperChampion && !lowerChampion) {
                throw new Error('Upper bracket finalizado. Aguardando conclusão do lower bracket.');
            } else if (!upperChampion && lowerChampion) {
                throw new Error('Lower bracket finalizado. Aguardando conclusão do upper bracket.');
            } else {
                throw new Error('Eliminação dupla finalizada ou não há partidas para gerar');
            }
        }

        const createdMatches = await Match.bulkCreate(nextMatches);

        // Determine main stage
        let mainStage;
        const hasUpper = nextMatches.some(m => m.bracket === 'upper');
        const hasLower = nextMatches.some(m => m.bracket === 'lower');

        if (hasUpper && hasLower) {
            const upperStage = nextMatches.find(m => m.bracket === 'upper')?.stage;
            mainStage = upperStage || nextMatches[0].stage;
        } else if (hasUpper) {
            mainStage = nextMatches.find(m => m.bracket === 'upper').stage;
        } else {
            const lowerStage = nextMatches.find(m => m.bracket === 'lower').stage;
            mainStage = `Lower Bracket - ${lowerStage}`;
        }

        return {
            stage: mainStage,
            matches: createdMatches,
            breakdown: {
                upperBracket: {
                    count: nextMatches.filter(m => m.bracket === 'upper').length,
                    matches: createdMatches.filter(m => m.bracket === 'upper')
                },
                lowerBracket: {
                    count: nextMatches.filter(m => m.bracket === 'lower').length,
                    matches: createdMatches.filter(m => m.bracket === 'lower')
                },
                grandFinal: {
                    count: nextMatches.filter(m => m.bracket === 'final').length,
                    matches: createdMatches.filter(m => m.bracket === 'final')
                }
            }
        };

    } catch (error) {
        console.error('Error in handleDoubleEliminationNextPhase:', error);
        throw error;
    }
};

function processLowerBracket(upperBracketMatches, lowerBracketMatches, currentUpperStage, currentLowerStage, upperChampion, championshipId) {
    const matches = [];
    
    if (!currentLowerStage) {
        // First time in lower bracket - only upper bracket losers
        if (currentUpperStage) {
            const currentUpperMatches = upperBracketMatches.filter(m => m.stage === currentUpperStage);
            const upperLosers = currentUpperMatches.map(m =>
                m.winner_team_id === m.teamA_id ? m.teamB_id : m.teamA_id
            ).filter(Boolean);

            for (let i = 0; i < upperLosers.length; i += 2) {
                if (i + 1 < upperLosers.length) {
                    matches.push({
                        championship_id: championshipId,
                        teamA_id: upperLosers[i],
                        teamB_id: upperLosers[i + 1],
                        date: new Date(),
                        stage: 'Lower Round 1',
                        bracket: 'lower',
                        map: getRandomMap()
                    });
                }
            }
        }
        return { matches };
    }

    const currentLowerMatches = lowerBracketMatches.filter(m => m.stage === currentLowerStage);
    const lowerWinners = currentLowerMatches.map(m => m.winner_team_id).filter(Boolean);
    
    // Get upper bracket losers if exists
    let upperLosers = [];
    if (currentUpperStage && !upperChampion) {
        const currentUpperMatches = upperBracketMatches.filter(m => m.stage === currentUpperStage);
        upperLosers = currentUpperMatches.map(m =>
            m.winner_team_id === m.teamA_id ? m.teamB_id : m.teamA_id
        ).filter(Boolean);
    }

    if (currentLowerStage === 'Lower Round 3' && upperChampion) {
        // Include Upper Semifinal loser
        const upperSemifinalMatch = upperBracketMatches.find(m => m.stage === 'Upper Semifinal');
        if (upperSemifinalMatch) {
            const upperSemifinalLoser = upperSemifinalMatch.winner_team_id === upperSemifinalMatch.teamA_id 
                ? upperSemifinalMatch.teamB_id 
                : upperSemifinalMatch.teamA_id;
            
            const allTeamsForLowerSemifinal = [...lowerWinners, upperSemifinalLoser];
            
            for (let i = 0; i < allTeamsForLowerSemifinal.length; i += 2) {
                if (i + 1 < allTeamsForLowerSemifinal.length) {
                    matches.push({
                        championship_id: championshipId,
                        teamA_id: allTeamsForLowerSemifinal[i],
                        teamB_id: allTeamsForLowerSemifinal[i + 1],
                        date: new Date(),
                        stage: 'Lower Semifinal',
                        bracket: 'lower',
                        map: getRandomMap()
                    });
                }
            }
        }
    } else if (lowerWinners.length === 1 && upperChampion) {
        // If only 1 winner and upperChampion exists, include Upper Semifinal loser
        const upperSemifinalMatch = upperBracketMatches.find(m => m.stage === 'Upper Semifinal');
        if (upperSemifinalMatch) {
            const upperSemifinalLoser = upperSemifinalMatch.winner_team_id === upperSemifinalMatch.teamA_id 
                ? upperSemifinalMatch.teamB_id 
                : upperSemifinalMatch.teamA_id;
            
            const nextLowerStage = getNextLowerStage(currentLowerStage, 0);
            matches.push({
                championship_id: championshipId,
                teamA_id: lowerWinners[0],
                teamB_id: upperSemifinalLoser,
                date: new Date(),
                stage: nextLowerStage,
                bracket: 'lower',
                map: getRandomMap()
            });
        }
    } else if (upperLosers.length > 0) {
        // Always mix upper losers with lower winners
        const nextLowerStage = getNextLowerStage(currentLowerStage, upperLosers.length);
        const allTeams = [...lowerWinners, ...upperLosers];
        
        for (let i = 0; i < allTeams.length; i += 2) {
            if (i + 1 < allTeams.length) {
                matches.push({
                    championship_id: championshipId,
                    teamA_id: allTeams[i],
                    teamB_id: allTeams[i + 1],
                    date: new Date(),
                    stage: nextLowerStage,
                    bracket: 'lower',
                    map: getRandomMap()
                });
            }
        }
    } else if (lowerWinners.length >= 2) {
        // Normal logic - only lower bracket winners
        const nextLowerStage = getNextLowerStage(currentLowerStage, 0);

        for (let i = 0; i < lowerWinners.length; i += 2) {
            if (i + 1 < lowerWinners.length) {
                matches.push({
                    championship_id: championshipId,
                    teamA_id: lowerWinners[i],
                    teamB_id: lowerWinners[i + 1],
                    date: new Date(),
                    stage: nextLowerStage,
                    bracket: 'lower',
                    map: getRandomMap()
                });
            }
        }
    }

    return { matches };
}

function getNextUpperStage(currentStage) {
    const stageMap = {
        'Upper Round 1': 'Upper Round 2',
        'Upper Round 2': 'Upper Round 3',
        'Upper Round 3': 'Upper Semifinal',
        'Upper Semifinal': 'Upper Final'
    };
    return stageMap[currentStage] || `Upper Round ${parseInt(currentStage.split(' ')[2]) + 1}`;
}

function getNextLowerStage(currentLowerStage, teamsCount) {
    if (!currentLowerStage) return 'Lower Round 1';

    const stageMap = {
        'Lower Round 1': 'Lower Round 2',
        'Lower Round 2': 'Lower Round 3',
        'Lower Round 3': 'Lower Semifinal',
        'Lower Semifinal': 'Lower Final'
    };
    return stageMap[currentLowerStage] || `Lower Round ${parseInt(currentLowerStage.split(' ')[2]) + 1}`;
}

function getUpperBracketChampion(upperMatches) {
    // Look for Upper Semifinal winner
    const upperSemifinal = upperMatches.find(m => m.stage === 'Upper Semifinal' && m.winner_team_id);
    if (upperSemifinal) {
        return upperSemifinal.winner_team_id;
    }

    const upperStages = ['Upper Final', 'Upper Semifinal', 'Upper Round 3', 'Upper Round 2', 'Upper Round 1'];

    for (let i = 0; i < upperStages.length; i++) {
        const stageMatches = upperMatches.filter(m => m.stage === upperStages[i]);
        if (stageMatches.length === 1 && stageMatches[0].winner_team_id) {
            return stageMatches[0].winner_team_id;
        }
    }
    return null;
}

function getLowerBracketChampion(lowerMatches) {
    if (lowerMatches.length === 0) return null;
    
    const finalStages = ['Lower Final', 'Lower Semifinal', 'Lower Round 3', 'Lower Round 2', 'Lower Round 1'];
    
    for (const stage of finalStages) {
        const stageMatches = lowerMatches.filter(m => m.stage === stage && m.winner_team_id);
        
        if (stageMatches.length === 1) {
            return stageMatches[0].winner_team_id;
        }
        
        if (stageMatches.length > 1) {
            break;
        }
    }
    
    return null;
}

export {
    generateSingleEliminationBracket,
    generateDoubleEliminationBracket,
    handleSingleEliminationNextPhase,
    handleDoubleEliminationNextPhase
};