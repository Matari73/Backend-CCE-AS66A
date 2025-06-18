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
    isPowerOfTwo,
    shuffleArray,
    getRandomMap,
    getStageNameByRound,
    getNextUpperStage,
    getNextLowerStage,
    getUpperBracketChampion,
    getLowerBracketChampion
};
