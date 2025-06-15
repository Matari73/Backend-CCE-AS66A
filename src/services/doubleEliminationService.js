import { Team, Match, Subscription } from '../models/associations.js';
import { Op } from 'sequelize';
import { 
    isPowerOfTwo, 
    shuffleArray, 
    getRandomMap,
    getNextUpperStage,
    getNextLowerStage,
    getUpperBracketChampion,
    getLowerBracketChampion
} from '../utils/bracketUtils.js';

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
        throw error;
    }
};

function processLowerBracket(upperBracketMatches, lowerBracketMatches, currentUpperStage, currentLowerStage, upperChampion, championshipId) {
    const matches = [];
    
    if (!currentLowerStage) {
        if (currentUpperStage) {
            const currentUpperMatches = upperBracketMatches.filter(m => m.stage === currentUpperStage);

            const upperLosers = [];
            currentUpperMatches.forEach(match => {
                const loser = match.winner_team_id === match.teamA_id ? match.teamB_id : match.teamA_id;
                upperLosers.push(loser);
            });

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

    // Special handling for when upper champion exists (after Upper Semifinal)
    if (upperChampion) {
        if (currentLowerStage === 'Lower Round 3') {
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
        } else if (lowerWinners.length >= 2) {
            // Normal progression in lower bracket
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
    } else {
        // No upper champion yet - continue normal lower bracket progression
        if (upperLosers.length > 0) {
            const nextLowerStage = getNextLowerStage(currentLowerStage, upperLosers.length);
            
            // Improved pairing logic for Lower Round 2
            if (currentLowerStage === 'Lower Round 1') {
                // For Lower Round 2, we want to pair:
                // Lower Round 1 winners with Upper Round 2 losers
                const pairedTeams = [];
                
                // Alternate pairing: lower winner, upper loser, lower winner, upper loser...
                const maxPairs = Math.min(lowerWinners.length, upperLosers.length);
                for (let i = 0; i < maxPairs; i++) {
                    pairedTeams.push(lowerWinners[i], upperLosers[i]);
                }
                
                // Add remaining teams if any
                if (lowerWinners.length > upperLosers.length) {
                    pairedTeams.push(...lowerWinners.slice(upperLosers.length));
                } else if (upperLosers.length > lowerWinners.length) {
                    pairedTeams.push(...upperLosers.slice(lowerWinners.length));
                }
                
                for (let i = 0; i < pairedTeams.length; i += 2) {
                    if (i + 1 < pairedTeams.length) {
                        matches.push({
                            championship_id: championshipId,
                            teamA_id: pairedTeams[i],
                            teamB_id: pairedTeams[i + 1],
                            date: new Date(),
                            stage: nextLowerStage,
                            bracket: 'lower',
                            map: getRandomMap()
                        });
                    }
                }
            } else {
                // For other rounds, use the original logic
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
            }
        } else if (lowerWinners.length >= 2) {
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
    }

    return { matches };
}

export {
    generateDoubleEliminationBracket,
    handleDoubleEliminationNextPhase
};