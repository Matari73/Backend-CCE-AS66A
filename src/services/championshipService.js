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
        console.log(`🔄 Starting handleSingleEliminationNextPhase for championship ${championshipId}`);

        const completedMatches = await Match.findAll({
            where: {
                championship_id: championshipId,
                winner_team_id: { [Op.ne]: null }
            },
            order: [['date', 'ASC']]
        });

        console.log(`✅ Found ${completedMatches.length} completed matches`);

        if (completedMatches.length === 0) {
            throw new Error('Nenhuma partida completada encontrada');
        }

        const stages = [...new Set(completedMatches.map(match => match.stage))];
        console.log('📊 Stages found:', stages);

        const stageOrder = ['Rodada 1', 'Rodada 2', 'Oitavas de final', 'Quartas de final', 'Semifinal', 'Final'];
        let currentStage = null;

        for (const stage of stageOrder) {
            if (stages.includes(stage)) {
                currentStage = stage;
            }
        }

        console.log(`🎯 Current stage: ${currentStage}`);

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

        console.log(`🏆 Winners from ${currentStage}:`, winners);

        if (winners.length < 2) {
            throw new Error(`Número insuficiente de vencedores (${winners.length}) para a próxima fase`);
        }

        const nextStageIndex = stageOrder.indexOf(currentStage) + 1;
        if (nextStageIndex >= stageOrder.length) {
            throw new Error('Campeonato já foi finalizado');
        }

        const nextStage = stageOrder[nextStageIndex];
        console.log(`➡️ Next stage: ${nextStage}`);

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

        console.log(`📝 Creating ${nextPhaseMatches.length} matches for ${nextStage}`);

        const createdMatches = await Match.bulkCreate(nextPhaseMatches);

        return {
            stage: nextStage,
            matches: createdMatches,
            winnersAdvanced: winners.length
        };

    } catch (error) {
        console.error('❌ Error in handleSingleEliminationNextPhase:', error);
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
        console.log(`🔄 Starting handleDoubleEliminationNextPhase for championship ${championshipId}`);

        const allMatches = await Match.findAll({
            where: { championship_id: championshipId },
            order: [['date', 'ASC']]
        });

        const completedMatches = allMatches.filter(match => match.winner_team_id);
        const pendingMatches = allMatches.filter(match => !match.winner_team_id);

        console.log(`✅ Found ${completedMatches.length} completed, ${pendingMatches.length} pending matches`);

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

        console.log(`📊 Upper matches: ${upperBracketMatches.length}, Lower matches: ${lowerBracketMatches.length}`);
        console.log(`🔍 All lower matches:`, lowerBracketMatches.map(m => ({
            match_id: m.match_id,
            stage: m.stage,
            teamA: m.teamA_id,
            teamB: m.teamB_id,
            winner: m.winner_team_id
        })));

        const upperChampion = getUpperBracketChampion(upperBracketMatches);
        const lowerChampion = getLowerBracketChampion(lowerBracketMatches);

        console.log(`🏆 Upper Champion: ${upperChampion}, Lower Champion: ${lowerChampion}`);

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

            console.log(`🎯 Creating Grand Final: Team ${upperChampion} vs Team ${lowerChampion}`);
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

        // Continuar lógica normal se não há campeões ainda
        // Identificar as fases atuais
        const upperStages = [...new Set(upperBracketMatches.map(m => m.stage))];
        const lowerStages = [...new Set(lowerBracketMatches.map(m => m.stage))];

        const currentUpperStage = upperStages[upperStages.length - 1];
        const currentLowerStage = lowerStages.length > 0 ? lowerStages[lowerStages.length - 1] : null;

        console.log(`🎯 Current upper stage: ${currentUpperStage}, lower stage: ${currentLowerStage}`);
        console.log(`📋 All upper stages: [${upperStages.join(', ')}]`);
        console.log(`📋 All lower stages: [${lowerStages.join(', ')}]`);

        const nextMatches = [];

        // Processar Upper Bracket
        if (currentUpperStage) {
            console.log(`🔄 Processing Upper Bracket - Stage: ${currentUpperStage}`);
            const currentUpperMatches = upperBracketMatches.filter(m => m.stage === currentUpperStage);
            const upperWinners = currentUpperMatches.map(m => m.winner_team_id).filter(Boolean);
            const upperLosers = currentUpperMatches.map(m =>
                m.winner_team_id === m.teamA_id ? m.teamB_id : m.teamA_id
            ).filter(Boolean);

            console.log(`🏆 Upper winners: [${upperWinners.join(', ')}], losers: [${upperLosers.join(', ')}]`);

            // Gerar próxima fase do upper bracket
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
            } else if (upperWinners.length === 1) {
                console.log('🏆 Upper bracket champion defined, waiting for lower bracket');
            }

            // Processar lower bracket baseado na situação atual
            if (currentLowerStage) {
                console.log(`🔄 Processing Lower Bracket - Stage: ${currentLowerStage}`);
                const currentLowerMatches = lowerBracketMatches.filter(m => m.stage === currentLowerStage);
                console.log(`🔍 Current lower matches:`, currentLowerMatches.map(m => ({
                    match_id: m.match_id,
                    teamA: m.teamA_id,
                    teamB: m.teamB_id,
                    winner: m.winner_team_id
                })));

                const lowerWinners = currentLowerMatches.map(m => m.winner_team_id).filter(Boolean);
                console.log(`🏆 Lower winners: [${lowerWinners.join(', ')}]`);

                // Se há perdedores do upper nesta rodada, intercalar com vencedores do lower
                if (upperLosers.length > 0) {
                    const nextLowerStage = getNextLowerStage(currentLowerStage, upperLosers.length);

                    // Intercalar vencedores do lower com perdedores do upper
                    const mixedTeams = [];
                    for (let i = 0; i < Math.max(lowerWinners.length, upperLosers.length); i++) {
                        if (i < lowerWinners.length) mixedTeams.push(lowerWinners[i]);
                        if (i < upperLosers.length) mixedTeams.push(upperLosers[i]);
                    }

                    for (let i = 0; i < mixedTeams.length; i += 2) {
                        if (i + 1 < mixedTeams.length) {
                            nextMatches.push({
                                championship_id: championshipId,
                                teamA_id: mixedTeams[i],
                                teamB_id: mixedTeams[i + 1],
                                date: new Date(),
                                stage: nextLowerStage,
                                bracket: 'lower',
                                map: getRandomMap()
                            });
                        }
                    }
                } else if (lowerWinners.length > 1) {
                    // Apenas vencedores do lower avançam (sem perdedores do upper)
                    const nextLowerStage = getNextLowerStage(currentLowerStage, 0);

                    for (let i = 0; i < lowerWinners.length; i += 2) {
                        if (i + 1 < lowerWinners.length) {
                            nextMatches.push({
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
            } else if (upperLosers.length > 0) {
                // Primeira vez no lower bracket - apenas perdedores do upper
                const nextLowerStage = getNextLowerStage(null, upperLosers.length);

                for (let i = 0; i < upperLosers.length; i += 2) {
                    if (i + 1 < upperLosers.length) {
                        nextMatches.push({
                            championship_id: championshipId,
                            teamA_id: upperLosers[i],
                            teamB_id: upperLosers[i + 1],
                            date: new Date(),
                            stage: nextLowerStage,
                            bracket: 'lower',
                            map: getRandomMap()
                        });
                    }
                }
            }
        } else if (currentLowerStage) {
            console.log(`🔄 Processing ONLY Lower Bracket - Stage: ${currentLowerStage}`);
            // Processar apenas lower bracket quando upper está finalizado
            const currentLowerMatches = lowerBracketMatches.filter(m => m.stage === currentLowerStage);
            console.log(`🔍 ISOLATED Lower matches for stage ${currentLowerStage}:`, currentLowerMatches.map(m => ({
                match_id: m.match_id,
                teamA: m.teamA_id,
                teamB: m.teamB_id,
                winner: m.winner_team_id
            })));

            const lowerWinners = currentLowerMatches.map(m => m.winner_team_id).filter(Boolean);

            console.log(`🎯 Lower winners from ${currentLowerStage}: [${lowerWinners.join(', ')}]`);
            console.log(`🔍 Lower matches in ${currentLowerStage}:`, currentLowerMatches.map(m => ({
                match_id: m.match_id,
                teamA: m.teamA_id,
                teamB: m.teamB_id,
                winner: m.winner_team_id
            })));

            if (lowerWinners.length >= 2) {
                const nextLowerStage = getNextLowerStage(currentLowerStage, 0);
                console.log(`🔄 Creating ${Math.floor(lowerWinners.length / 2)} matches for ${nextLowerStage}`);
                console.log(`🎯 Winners to advance: [${lowerWinners.join(', ')}]`);

                for (let i = 0; i < lowerWinners.length; i += 2) {
                    if (i + 1 < lowerWinners.length) {
                        console.log(`🆚 Creating Match: Team ${lowerWinners[i]} vs Team ${lowerWinners[i + 1]}`);
                        nextMatches.push({
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
            } else if (lowerWinners.length === 1) {
                console.log('🏆 Lower bracket champion defined');
            }
        }

        // Verificar se é hora da Grand Final
        if (upperChampion && lowerChampion) {
            nextMatches.push({
                championship_id: championshipId,
                teamA_id: upperChampion,
                teamB_id: lowerChampion,
                date: new Date(),
                stage: 'Grand Final',
                bracket: 'final',
                map: getRandomMap()
            });
        }

        if (nextMatches.length === 0) {
            console.log('🚫 No matches to generate. Checking tournament state...');
            console.log(`Upper Champion: ${upperChampion}, Lower Champion: ${lowerChampion}`);
            console.log(`Current Upper Stage: ${currentUpperStage}, Current Lower Stage: ${currentLowerStage}`);

            if (upperChampion && !lowerChampion) {
                throw new Error('Upper bracket finalizado. Aguardando conclusão do lower bracket.');
            } else if (!upperChampion && lowerChampion) {
                throw new Error('Lower bracket finalizado. Aguardando conclusão do upper bracket.');
            } else {
                throw new Error('Eliminação dupla finalizada ou não há partidas para gerar');
            }
        }

        console.log(`📝 Creating ${nextMatches.length} matches for next phase`);
        console.log(`🔍 Next matches to create:`, nextMatches.map(m => ({
            teamA: m.teamA_id,
            teamB: m.teamB_id,
            stage: m.stage,
            bracket: m.bracket
        })));

        const createdMatches = await Match.bulkCreate(nextMatches);

        // Determinar o stage principal baseado no tipo de partidas geradas
        let mainStage;
        const hasUpper = nextMatches.some(m => m.bracket === 'upper');
        const hasLower = nextMatches.some(m => m.bracket === 'lower');
        const hasGrandFinal = nextMatches.some(m => m.bracket === 'final');

        if (hasGrandFinal) {
            mainStage = 'Grand Final';
        } else if (hasUpper && hasLower) {
            // Quando há ambos, priorizar o upper
            const upperStage = nextMatches.find(m => m.bracket === 'upper')?.stage;
            mainStage = upperStage || nextMatches[0].stage;
        } else if (hasUpper) {
            mainStage = nextMatches.find(m => m.bracket === 'upper').stage;
        } else {
            // Apenas lower bracket
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
        console.error('❌ Error in handleDoubleEliminationNextPhase:', error);
        throw error;
    }
};

// Funções auxiliares para eliminação dupla
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
    // Buscar vencedor do Upper Semifinal (que existe no seu caso)
    const upperSemifinal = upperMatches.find(m => m.stage === 'Upper Semifinal' && m.winner_team_id);
    if (upperSemifinal) {
        return upperSemifinal.winner_team_id;
    }

    // Fallback para outras fases do upper bracket
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
    const lowerFinal = lowerMatches.find(m => m.stage === 'Lower Final' && m.winner_team_id);
    return lowerFinal ? lowerFinal.winner_team_id : null;
}

export {
    generateSingleEliminationBracket,
    generateDoubleEliminationBracket,
    handleSingleEliminationNextPhase,
    handleDoubleEliminationNextPhase
};