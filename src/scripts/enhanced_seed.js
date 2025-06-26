import { sequelize } from '../db/db.js';
import User from '../models/user.js';
import Team from '../models/team.js';
import Participant from '../models/participant.js';
import Championship from '../models/championship.js';
import Subscription from '../models/subscription.js';
import Agent from '../models/agent.js';
import Match from '../models/match.js';
import ParticipantStatistics from '../models/participantStatistics.js';
import ChampionshipStatistics from '../models/championshipStatistics.js';
import bcrypt from 'bcryptjs';

const enhancedSeed = async () => {
    // Wait for database to be fully initialized
    await new Promise(resolve => setTimeout(resolve, 2000));

    const transaction = await sequelize.transaction();

    try {
        console.log('🌱 Iniciando enhanced seed...');

        // Check if data already exists to avoid duplication
        const existingUsers = await User.count({ transaction });
        if (existingUsers > 0) {
            console.log('📋 Dados já existem no banco, pulando seed...');
            await transaction.rollback();
            return;
        }

        // 1. Clear existing data (in reverse dependency order)
        await ParticipantStatistics.destroy({ where: {}, transaction });
        await ChampionshipStatistics.destroy({ where: {}, transaction });
        await Match.destroy({ where: {}, transaction });
        await Subscription.destroy({ where: {}, transaction });
        await Championship.destroy({ where: {}, transaction });
        await Participant.destroy({ where: {}, transaction });
        await Team.destroy({ where: {}, transaction });
        await Agent.destroy({ where: {}, transaction });
        await User.destroy({ where: {}, transaction });

        console.log('🧹 Dados existentes limpos');

        // 2. Create Users (more diverse users for testing)
        const hashedPassword = await bcrypt.hash('123456', 12);
        const users = await User.bulkCreate([
            {
                name: 'João Silva',
                email: 'admin@cce.com',
                password: hashedPassword
            },
            {
                name: 'Maria Santos',
                email: 'maria.santos@cce.com',
                password: hashedPassword
            },
            {
                name: 'Pedro Costa',
                email: 'pedro.costa@cce.com',
                password: hashedPassword
            },
            {
                name: 'Ana Oliveira',
                email: 'ana.oliveira@cce.com',
                password: hashedPassword
            },
            {
                name: 'Lucas Ferreira',
                email: 'lucas.ferreira@cce.com',
                password: hashedPassword
            },
            {
                name: 'Carla Mendes',
                email: 'carla.mendes@cce.com',
                password: hashedPassword
            },
            {
                name: 'Rafael Lima',
                email: 'rafael.lima@cce.com',
                password: hashedPassword
            },
            {
                name: 'Juliana Rocha',
                email: 'juliana.rocha@cce.com',
                password: hashedPassword
            }
        ], { transaction, returning: true });

        console.log('✅ 8 usuários criados');

        // 3. Create Agents (Complete Valorant agents list)
        const agents = [
            { name: 'Vyse' },
            { name: 'Clove' },
            { name: 'Iso' },
            { name: 'Deadlock' },
            { name: 'Gekko' },
            { name: 'Harbor' },
            { name: 'Fade' },
            { name: 'Neon' },
            { name: 'Chamber' },
            { name: 'KAY/O' },
            { name: 'Astra' },
            { name: 'Yoru' },
            { name: 'Skye' },
            { name: 'Killjoy' },
            { name: 'Reyna' },
            { name: 'Brimstone' },
            { name: 'Viper' },
            { name: 'Omen' },
            { name: 'Cypher' },
            { name: 'Sova' },
            { name: 'Sage' },
            { name: 'Phoenix' },
            { name: 'Raze' },
            { name: 'Jett' },
            { name: 'Breach' }
        ];

        const createdAgents = await Agent.bulkCreate(agents, { transaction, returning: true });
        console.log('✅ 25 agentes do Valorant criados');

        // 4. Create Teams (Realistic Valorant-inspired team names)
        const teamNames = [
            'Sentinels', 'Team Liquid', 'Fnatic', 'OpTic Gaming',
            'LOUD', 'FURIA', 'Paper Rex', 'DRX',
            'Cloud9', '100 Thieves', 'Team Vitality', 'G2 Esports',
            'NRG Esports', 'KRÜ Esports', 'EDward Gaming', 'FPX',
            'NAVI', 'FaZe Clan', 'TSM', 'T1'
        ];

        const teamData = [];
        for (let i = 0; i < 20; i++) {
            teamData.push({
                name: teamNames[i],
                user_id: users[i % users.length].user_id
            });
        }

        const teams = await Team.bulkCreate(teamData, { transaction, returning: true });
        console.log('✅ 20 times criados');

        // 5. Create Participants (Realistic Brazilian names and professional nicknames)
        const firstNames = [
            'João', 'Pedro', 'Lucas', 'Gabriel', 'Felipe', 'Matheus', 'Rafael', 'Bruno',
            'Diego', 'Guilherme', 'Thiago', 'André', 'Carlos', 'Daniel', 'Eduardo',
            'Fernando', 'Gustavo', 'Henrique', 'Igor', 'José', 'Leonardo', 'Marcelo',
            'Nicolas', 'Otávio', 'Paulo', 'Ricardo', 'Rodrigo', 'Samuel', 'Tiago', 'Victor',
            'Maria', 'Ana', 'Carla', 'Juliana', 'Fernanda', 'Patricia', 'Amanda', 'Beatriz'
        ];

        const lastNames = [
            'Silva', 'Santos', 'Costa', 'Oliveira', 'Ferreira', 'Pereira', 'Lima', 'Gomes',
            'Ribeiro', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira',
            'Barbosa', 'Rocha', 'Dias', 'Monteiro', 'Cardoso', 'Reis', 'Araújo', 'Cavalcanti',
            'Nascimento', 'Correia', 'Martins', 'Moreira', 'Cunha', 'Teixeira', 'Melo'
        ];

        const professionalNicknames = [
            'aspas', 'saadhak', 'Less', 'pANcada', 'Sacy', 'TenZ', 'ShahZaM', 'dapr',
            'SicK', 'zombs', 'ScreaM', 'Jamppi', 'L1NK', 'soulcas', 'Boaster',
            'Chronicle', 'Alfajer', 'Leo', 'Derke', 'yay', 'FNS', 'crashies',
            'Victor', 'Marved', 'mwzera', 'heat', 'v1xen', 'Mizu', 'kon4n',
            'Quick', 'Jonn', 'dgzin', 'RgLM', 'khalil', 'frz', 'Bzka',
            'nzr', 'adverso', 'keznit', 'Mazino', 'Klaus', 'Shyy', 'daveeys',
            'Zest', 'stax', 'Rb', 'MaKo', 'BuZz', 'f0rsakeN', 'mindfreak',
            'Jinggg', 'd4v41', 'Benkai', 'something', 'Jinboong', 'surf',
            'CHICHOO', 'Haodong', 'Life', 'nobody', 'Smoggy', 'Zyppan',
            'ANGE1', 'Shao', 'suygetsu', 'ardiis', 'cNed', 'Alfajer',
            'qRaxs', 'Kiles', 'Turko', 'russ', 'XigN', 'patiphan',
            'sushiboys', 'foxz', 'JitBoyS', 'PTC', 'sScary', 'ban',
            'Rb', 'Zest', 'stax', 'Mako', 'BuZz', 'Suggest', 'Meteor',
            'texture', 'Foxy9', 'termi', 'carpe', 'eKo', 'esperanza',
            'Sylvan', 'Seoldam', 'Lakia', 'k1Ng', 'Estrella', 'JoxJo',
            'dep', 'crow', 'Fisker', 'Meiy', 'TENNN', 'neth', 'SugarZ3ro',
            'Reita', 'Medusa', 'Art', 'Xdll', 'takej', 'pepper', 'Dep'
        ];

        const participantData = [];
        let nicknameIndex = 0;

        for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
            const team = teams[teamIndex];
            const userIndex = teamIndex % users.length;
            const userId = users[userIndex].user_id;

            // Coach
            const coachFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const coachLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            participantData.push({
                name: `${coachFirstName} ${coachLastName}`,
                nickname: `${team.name.toLowerCase().replace(/\s+/g, '_')}_coach`,
                birth_date: new Date(1985 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                phone: `11${String(90000000 + teamIndex * 10).padStart(8, '0')}`,
                team_id: team.team_id,
                is_coach: true,
                user_id: userId
            });

            // Players
            for (let playerIndex = 1; playerIndex <= 5; playerIndex++) {
                const playerFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                const playerLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                participantData.push({
                    name: `${playerFirstName} ${playerLastName}`,
                    nickname: professionalNicknames[nicknameIndex % professionalNicknames.length],
                    birth_date: new Date(1998 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                    phone: `11${String(90000000 + teamIndex * 10 + playerIndex).padStart(8, '0')}`,
                    team_id: team.team_id,
                    is_coach: false,
                    user_id: userId
                });
                nicknameIndex++;
            }
        }

        const participants = await Participant.bulkCreate(participantData, { transaction, returning: true });
        console.log('✅ 120 participantes criados (1 coach + 5 jogadores por time)');

        // 6. Create Championships (Different states for comprehensive testing)
        const championshipData = [
            {
                name: 'CCE Championship Spring 2024 - FINALIZADO',
                description: 'Campeonato de primavera já finalizado. Uma competição intensa que mostrou o melhor do cenário competitivo brasileiro.',
                format: 'simple',
                start_date: new Date('2024-03-01'),
                end_date: new Date('2024-03-31'),
                location: 'São Paulo, SP',
                status: 'Finalizado',
                prize: '25.000 reais',
                user_id: users[0].user_id
            },
            {
                name: 'CCE Championship Summer 2024 - ATIVO',
                description: 'Campeonato de verão em andamento com eliminação dupla. O mais prestigioso torneio do ano está acontecendo agora!',
                format: 'double',
                start_date: new Date('2024-06-01'),
                end_date: new Date('2024-08-31'),
                location: 'Rio de Janeiro, RJ',
                status: 'Ativo',
                prize: '75.000 reais',
                user_id: users[1].user_id
            },
            {
                name: 'CCE Championship Winter 2024 - PLANEJADO',
                description: 'Campeonato de inverno planejado para os melhores times. Prepare-se para a competição mais acirrada do ano!',
                format: 'simple',
                start_date: new Date('2024-09-01'),
                end_date: new Date('2024-09-30'),
                location: 'Belo Horizonte, MG',
                status: 'Planejado',
                prize: '40.000 reais',
                user_id: users[2].user_id
            },
            {
                name: 'CCE Masters Tournament - Planejado',
                description: 'Torneio especial de masters para os melhores jogadores.',
                format: 'double',
                start_date: new Date('2024-10-15'),
                end_date: new Date('2024-11-15'),
                location: 'Brasília, DF',
                status: 'Planejado',
                prize: '100.000 reais',
                user_id: users[3].user_id
            },
            {
                name: 'CCE Regional Championship - Finalizado',
                description: 'Campeonato regional que foi finalizado.',
                format: 'simple',
                start_date: new Date('2024-07-01'),
                end_date: new Date('2024-07-31'),
                location: 'Curitiba, PR',
                status: 'Finalizado',
                prize: '15.000 reais',
                user_id: users[4].user_id
            }
        ];

        const championships = await Championship.bulkCreate(championshipData, { transaction, returning: true });
        console.log('✅ 5 campeonatos criados (diferentes estados)');

        // 7. Create Subscriptions
        const subscriptionData = [];

        // Championship 1 (FINALIZADO): 8 teams
        for (let i = 0; i < 8; i++) {
            subscriptionData.push({
                championship_id: championships[0].championship_id,
                team_id: teams[i].team_id,
                subscription_date: new Date('2024-02-15')
            });
        }

        // Championship 2 (ATIVO): 16 teams
        for (let i = 0; i < 16; i++) {
            subscriptionData.push({
                championship_id: championships[1].championship_id,
                team_id: teams[i].team_id,
                subscription_date: new Date('2024-05-15')
            });
        }

        // Championship 3 (PLANEJADO): 8 teams (different teams)
        for (let i = 8; i < 16; i++) {
            subscriptionData.push({
                championship_id: championships[2].championship_id,
                team_id: teams[i].team_id,
                subscription_date: new Date('2024-08-15')
            });
        }

        // Championship 4 (EM_ANÁLISE): 16 teams (mix of teams)
        const mixedTeamIndices = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 1, 3, 5, 7, 9, 11];
        for (let i = 0; i < 16; i++) {
            subscriptionData.push({
                championship_id: championships[3].championship_id,
                team_id: teams[mixedTeamIndices[i]].team_id,
                subscription_date: new Date('2024-09-01')
            });
        }

        // Championship 5 (CANCELADO): Had some subscriptions before cancellation
        for (let i = 12; i < 20; i++) {
            subscriptionData.push({
                championship_id: championships[4].championship_id,
                team_id: teams[i].team_id,
                subscription_date: new Date('2024-06-15')
            });
        }

        await Subscription.bulkCreate(subscriptionData, { transaction });
        console.log('✅ 56 inscrições criadas');

        // 8. Create Matches for Championships
        const maps = ['Bind', 'Ascent', 'Icebox', 'Haven', 'Lotus', 'Sunset', 'Abyss', 'Breeze', 'Fracture', 'Pearl', 'Split'];
        
        // Helper function to create realistic scores
        const generateRealisticScore = () => {
            const scenarios = [
                { teamA: 13, teamB: 11 }, // Close game
                { teamA: 13, teamB: 9 },  // Decent lead
                { teamA: 13, teamB: 6 },  // Strong performance
                { teamA: 13, teamB: 3 },  // Dominant
                { teamA: 13, teamB: 1 },  // Crush
            ];
            const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
            return Math.random() > 0.5 ? scenario : { teamA: scenario.teamB, teamB: scenario.teamA };
        };

        // Championship 1 (FINALIZADO) - Complete single elimination tournament
        console.log('Criando partidas do Championship 1 (FINALIZADO)...');
        const championship1Teams = teams.slice(0, 8);
        const championship1Matches = [];

        // Quarterfinals (4 matches)
        const quarterfinalsResults = [];
        for (let i = 0; i < 4; i++) {
            const teamA = championship1Teams[i * 2];
            const teamB = championship1Teams[i * 2 + 1];
            const score = generateRealisticScore();
            
            const match = await Match.create({
                championship_id: championships[0].championship_id,
                teamA_id: teamA.team_id,
                teamB_id: teamB.team_id,
                stage: 'Quartas de final',
                date: new Date(`2024-03-${15 + i}`),
                map: maps[Math.floor(Math.random() * maps.length)],
                status: 'Finalizada',
                winner_team_id: score.teamA > score.teamB ? teamA.team_id : teamB.team_id,
                score: score
            }, { transaction });
            
            championship1Matches.push(match);
            quarterfinalsResults.push(teams.find(team => team.team_id === match.winner_team_id));
        }

        // Semifinals (2 matches)
        const semifinalsResults = [];
        for (let i = 0; i < 2; i++) {
            const teamA = quarterfinalsResults[i * 2];
            const teamB = quarterfinalsResults[i * 2 + 1];
            const score = generateRealisticScore();
            
            const match = await Match.create({
                championship_id: championships[0].championship_id,
                teamA_id: teamA.team_id,
                teamB_id: teamB.team_id,
                stage: 'Semifinal',
                date: new Date(`2024-03-${25 + i}`),
                map: maps[Math.floor(Math.random() * maps.length)],
                status: 'Finalizada',
                winner_team_id: score.teamA > score.teamB ? teamA.team_id : teamB.team_id,
                score: score
            }, { transaction });
            
            championship1Matches.push(match);
            semifinalsResults.push(teams.find(team => team.team_id === match.winner_team_id));
        }

        // Final
        const finalMatch = await Match.create({
            championship_id: championships[0].championship_id,
            teamA_id: semifinalsResults[0].team_id,
            teamB_id: semifinalsResults[1].team_id,
            stage: 'Final',
            date: new Date('2024-03-30'),
            map: maps[Math.floor(Math.random() * maps.length)],
            status: 'Finalizada',
            winner_team_id: semifinalsResults[0].team_id, // LOUD wins!
            score: { teamA: 13, teamB: 11 }
        }, { transaction });

        championship1Matches.push(finalMatch);

        // Championship 2 (ATIVO) - Double elimination with partial completion
        console.log('Criando partidas do Championship 2 (ATIVO)...');
        const championship2Teams = teams.slice(0, 16);

        // Upper Bracket Round 1 (8 matches) - ALL COMPLETED
        const upperR1Winners = [];
        const upperR1Losers = [];
        
        for (let i = 0; i < 8; i++) {
            const teamA = championship2Teams[i * 2];
            const teamB = championship2Teams[i * 2 + 1];
            const score = generateRealisticScore();
            const winnerId = score.teamA > score.teamB ? teamA.team_id : teamB.team_id;
            const loserId = winnerId === teamA.team_id ? teamB.team_id : teamA.team_id;
            
            await Match.create({
                championship_id: championships[1].championship_id,
                teamA_id: teamA.team_id,
                teamB_id: teamB.team_id,
                stage: 'Upper Round 1',
                bracket: 'upper',
                date: new Date(`2024-06-${5 + i}`),
                map: maps[Math.floor(Math.random() * maps.length)],
                status: 'Finalizada',
                winner_team_id: winnerId,
                score: score
            }, { transaction });

            upperR1Winners.push(teams.find(t => t.team_id === winnerId));
            upperR1Losers.push(teams.find(t => t.team_id === loserId));
        }

        // Upper Bracket Round 2 (4 matches) - 2 COMPLETED, 2 SCHEDULED
        const upperR2Winners = [];
        const upperR2Losers = [];
        
        for (let i = 0; i < 4; i++) {
            const teamA = upperR1Winners[i * 2];
            const teamB = upperR1Winners[i * 2 + 1];
            
            if (i < 2) { // First 2 matches completed
                const score = generateRealisticScore();
                const winnerId = score.teamA > score.teamB ? teamA.team_id : teamB.team_id;
                const loserId = winnerId === teamA.team_id ? teamB.team_id : teamA.team_id;
                
                await Match.create({
                    championship_id: championships[1].championship_id,
                    teamA_id: teamA.team_id,
                    teamB_id: teamB.team_id,
                    stage: 'Upper Round 2',
                    bracket: 'upper',
                    date: new Date(`2024-06-${15 + i}`),
                    map: maps[Math.floor(Math.random() * maps.length)],
                    status: 'Finalizada',
                    winner_team_id: winnerId,
                    score: score
                }, { transaction });

                upperR2Winners.push(teams.find(t => t.team_id === winnerId));
                upperR2Losers.push(teams.find(t => t.team_id === loserId));
            } else { // Scheduled matches
                await Match.create({
                    championship_id: championships[1].championship_id,
                    teamA_id: teamA.team_id,
                    teamB_id: teamB.team_id,
                    stage: 'Upper Round 2',
                    bracket: 'upper',
                    date: new Date(`2024-07-${5 + i}`),
                    map: maps[Math.floor(Math.random() * maps.length)],
                    status: 'Agendada'
                }, { transaction });
            }
        }

        // Lower Bracket Round 1 (4 matches) - 1 COMPLETED, others SCHEDULED/PRE-SCHEDULED
        for (let i = 0; i < 4; i++) {
            const teamA = upperR1Losers[i * 2];
            const teamB = upperR1Losers[i * 2 + 1];
            
            if (i === 0) { // First match completed
                const score = generateRealisticScore();
                const winnerId = score.teamA > score.teamB ? teamA.team_id : teamB.team_id;
                
                await Match.create({
                    championship_id: championships[1].championship_id,
                    teamA_id: teamA.team_id,
                    teamB_id: teamB.team_id,
                    stage: 'Lower Round 1',
                    bracket: 'lower',
                    date: new Date('2024-06-20'),
                    map: maps[Math.floor(Math.random() * maps.length)],
                    status: 'Finalizada',
                    winner_team_id: winnerId,
                    score: score
                }, { transaction });
            } else if (i < 3) { // Scheduled matches
                await Match.create({
                    championship_id: championships[1].championship_id,
                    teamA_id: teamA.team_id,
                    teamB_id: teamB.team_id,
                    stage: 'Lower Round 1',
                    bracket: 'lower',
                    date: new Date(`2024-07-${10 + i}`),
                    map: maps[Math.floor(Math.random() * maps.length)],
                    status: 'Agendada'
                }, { transaction });
            } else { // Pre-scheduled
                await Match.create({
                    championship_id: championships[1].championship_id,
                    teamA_id: teamA.team_id,
                    teamB_id: teamB.team_id,
                    stage: 'Lower Round 1',
                    bracket: 'lower',
                    map: maps[Math.floor(Math.random() * maps.length)],
                    status: 'Planejada'
                }, { transaction });
            }
        }

        // Championship 3 (PLANEJADO) - Pre-scheduled matches only
        console.log('Criando partidas do Championship 3 (PLANEJADO)...');
        const championship3Teams = teams.slice(8, 16);
        for (let i = 0; i < 4; i++) {
            const teamA = championship3Teams[i * 2];
            const teamB = championship3Teams[i * 2 + 1];
            
            await Match.create({
                championship_id: championships[2].championship_id,
                teamA_id: teamA.team_id,
                teamB_id: teamB.team_id,
                stage: 'Quartas de final',
                map: maps[Math.floor(Math.random() * maps.length)],
                status: 'Planejada'
            }, { transaction });
        }

        console.log('✅ Partidas criadas para todos os campeonatos');

        // 9. Create Participant Statistics for completed matches
        console.log('Criando estatísticas dos participantes...');
        const completedMatches = await Match.findAll({
            where: {
                status: 'Finalizada'
            },
            transaction
        });

        const participantStatsData = [];
        
        for (const match of completedMatches) {
            // Get participants from both teams (only players, not coaches)
            const teamAParticipants = participants.filter(p => 
                p.team_id === match.teamA_id && !p.is_coach
            );
            const teamBParticipants = participants.filter(p => 
                p.team_id === match.teamB_id && !p.is_coach
            );

            const allMatchParticipants = [...teamAParticipants, ...teamBParticipants];

            // Generate realistic stats for each participant
            for (const participant of allMatchParticipants) {
                const isWinnerTeam = participant.team_id === match.winner_team_id;
                
                // Winners generally have better stats
                const baseKills = isWinnerTeam ? 12 : 8;
                const baseDeaths = isWinnerTeam ? 8 : 12;
                const baseAssists = isWinnerTeam ? 6 : 4;
                const baseACS = isWinnerTeam ? 200 : 150;
                
                const kills = Math.max(1, baseKills + Math.floor(Math.random() * 15) - 7);
                const deaths = Math.max(1, baseDeaths + Math.floor(Math.random() * 10) - 5);
                const assists = Math.max(0, baseAssists + Math.floor(Math.random() * 8) - 4);
                const kda = deaths > 0 ? (kills + assists) / deaths : kills + assists;
                const acs = Math.max(50, baseACS + Math.floor(Math.random() * 150) - 75);
                
                participantStatsData.push({
                    match_id: match.match_id,
                    team_id: participant.team_id,
                    participant_id: participant.participant_id,
                    agent_id: createdAgents[Math.floor(Math.random() * createdAgents.length)].agent_id,
                    kills,
                    assists,
                    deaths,
                    spike_plants: Math.floor(Math.random() * 4),
                    spike_defuses: Math.floor(Math.random() * 3),
                    MVP: false, // Will be set later
                    first_kill: Math.random() > 0.85, // 15% chance of first kill
                    kda: parseFloat(kda.toFixed(2)),
                    average_combat_score: acs,
                    total_score: Math.floor(acs * (13 + Math.random() * 7)) // Realistic total score
                });
            }
        }

        // Set MVP for each match (highest ACS per match)
        const matchIds = [...new Set(participantStatsData.map(stat => stat.match_id))];
        for (const matchId of matchIds) {
            const matchStats = participantStatsData.filter(stat => stat.match_id === matchId);
            if (matchStats.length > 0) {
                const mvpStat = matchStats.reduce((prev, current) => 
                    prev.average_combat_score > current.average_combat_score ? prev : current
                );
                mvpStat.MVP = true;
            }
        }

        await ParticipantStatistics.bulkCreate(participantStatsData, { transaction });
        console.log(`✅ ${participantStatsData.length} estatísticas de participantes criadas`);

        // 10. Create Championship Statistics (only for completed championships)
        console.log('Criando estatísticas dos campeonatos...');
        const championshipStatsData = [];
        
        const completedChampionships = championships.filter(c => c.status === 'Finalizado');
        
        for (const championship of completedChampionships) {
            const championshipMatches = completedMatches.filter(m => 
                m.championship_id === championship.championship_id
            );
            
            // Get all participants from teams that participated in this championship
            const championshipSubscriptions = subscriptionData.filter(s => 
                s.championship_id === championship.championship_id
            );
            const teamIds = championshipSubscriptions.map(s => s.team_id);
            const championshipParticipants = participants.filter(p => 
                teamIds.includes(p.team_id) && !p.is_coach
            );

            for (const participant of championshipParticipants) {
                // Get all stats for this participant in this championship
                const participantStats = participantStatsData.filter(stat => 
                    stat.participant_id === participant.participant_id &&
                    championshipMatches.some(match => match.match_id === stat.match_id)
                );

                if (participantStats.length > 0) {
                    const totalKills = participantStats.reduce((sum, stat) => sum + stat.kills, 0);
                    const totalAssists = participantStats.reduce((sum, stat) => sum + stat.assists, 0);
                    const totalDeaths = participantStats.reduce((sum, stat) => sum + stat.deaths, 0);
                    const totalSpikePlants = participantStats.reduce((sum, stat) => sum + stat.spike_plants, 0);
                    const totalSpikeDefuses = participantStats.reduce((sum, stat) => sum + stat.spike_defuses, 0);
                    const totalMVPs = participantStats.filter(stat => stat.MVP).length;
                    const totalFirstKills = participantStats.filter(stat => stat.first_kill).length;

                    championshipStatsData.push({
                        championship_id: championship.championship_id,
                        participant_id: participant.participant_id,
                        team_id: participant.team_id,
                        kills: totalKills,
                        assists: totalAssists,
                        deaths: totalDeaths,
                        spike_plants: totalSpikePlants,
                        spike_defuses: totalSpikeDefuses,
                        MVPs: totalMVPs,
                        first_kills: totalFirstKills
                    });
                }
            }
        }

        await ChampionshipStatistics.bulkCreate(championshipStatsData, { transaction });
        console.log(`✅ ${championshipStatsData.length} estatísticas de campeonato criadas`);

        await transaction.commit();

        // Final Summary with detailed information
        console.log('\n🎉 ENHANCED SEED COMPLETADO COM SUCESSO! 🎉');
        console.log('\n📊 RESUMO DETALHADO:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`👥 Usuários: ${users.length}`);
        console.log(`🏆 Times: ${teams.length} (times de eSports profissionais)`);
        console.log(`👤 Participantes: ${participants.length} (${teams.length} coaches + ${teams.length * 5} jogadores)`);
        console.log(`🎮 Agentes: ${createdAgents.length} (todos os agentes do Valorant)`);
        console.log(`🏅 Campeonatos: ${championships.length}`);
        console.log(`📝 Inscrições: ${subscriptionData.length}`);
        console.log(`⚔️ Partidas: ${completedMatches.length + 25} (${completedMatches.length} finalizadas)`);
        console.log(`📈 Estatísticas de partidas: ${participantStatsData.length}`);
        console.log(`🏆 Estatísticas de campeonatos: ${championshipStatsData.length}`);
        
        console.log('\n🏅 ESTADOS DOS CAMPEONATOS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   ✅ FINALIZADO: ${championships.filter(c => c.status === 'Finalizado').length} (com estatísticas completas)`);
        console.log(`   🔥 ATIVO: ${championships.filter(c => c.status === 'Ativo').length} (com partidas em andamento)`);
        console.log(`   📋 PLANEJADO: ${championships.filter(c => c.status === 'Planejado').length} (prontos para começar)`);
        
        console.log('\n🎯 RECURSOS PARA FRONTEND:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   • Múltiplos estados de campeonatos para testar diferentes UIs');
        console.log('   • Estatísticas realistas para dashboards e gráficos');
        console.log('   • Nomes profissionais para simulação realista');
        console.log('   • Partidas em diferentes fases para testar brackets');
        console.log('   • Dados de eliminação simples e dupla');
        console.log('   • Estatísticas individuais e de equipe');
        console.log('   • Sistema completo de pontuação e rankings');
        
        console.log('\n🔐 CREDENCIAIS DE TESTE:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Email: admin@cce.com | Senha: 123456');
        console.log('   Email: maria.santos@cce.com | Senha: 123456');
        console.log('   Email: pedro.costa@cce.com | Senha: 123456');
        console.log('   (e outros usuários com senha padrão: 123456)');

    } catch (error) {
        await transaction.rollback();
        console.error('❌ Erro no enhanced seed:', error);
        throw error;
    }
};

const runEnhancedSeed = async () => {
    try {
        await sequelize.authenticate();
        console.log('📦 Conexão com o banco de dados estabelecida');

        await enhancedSeed();

        console.log('\n✨ Enhanced seed concluído com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('💥 Falha no enhanced seed:', error);
        process.exit(1);
    }
};

// Run seed if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    runEnhancedSeed();
}

export default enhancedSeed;
