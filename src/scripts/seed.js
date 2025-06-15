import { sequelize } from '../db/db.js';
import User from '../models/user.js';
import Team from '../models/team.js';
import Participant from '../models/participant.js';
import Championship from '../models/championship.js';
import Subscription from '../models/subscription.js';
import Agent from '../models/agent.js';
import Match from '../models/match.js';
import bcrypt from 'bcryptjs';

const seed = async () => {
    const transaction = await sequelize.transaction();

    try {
        console.log('🌱 Iniciando seed...');

        // 1. Clear existing data (in reverse dependency order)
        await Match.destroy({ where: {}, transaction });
        await Subscription.destroy({ where: {}, transaction });
        await Championship.destroy({ where: {}, transaction });
        await Participant.destroy({ where: {}, transaction });
        await Team.destroy({ where: {}, transaction });
        await Agent.destroy({ where: {}, transaction });
        await User.destroy({ where: {}, transaction });

        console.log('🧹 Dados existentes limpos');

        // 2. Create Users
        const hashedPassword = await bcrypt.hash('123456', 12);
        const users = await User.bulkCreate([
            {
                name: 'Admin User',
                email: 'admin@cce.com',
                password: hashedPassword
            },
            ...Array.from({ length: 6 }, (_, i) => ({
                name: `Manager ${i + 1}`,
                email: `manager${i + 1}@cce.com`,
                password: hashedPassword
            }))
        ], { transaction, returning: true });

        console.log('✅ Usuários criados');

        // 3. Create Agents
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

        await Agent.bulkCreate(agents, { transaction, returning: true });

        console.log('✅ 25 agentes do Valorant criados');

        // 4. Create Teams (16 teams total)
        const teamNames = [
            'Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta',
            'Team Echo', 'Team Foxtrot', 'Team Golf', 'Team Hotel',
            'Team India', 'Team Juliet', 'Team Kilo', 'Team Lima',
            'Team Mike', 'Team November', 'Team Oscar', 'Team Papa'
        ];

        const teams = await Team.bulkCreate(
            teamNames.map((name, index) => ({
                name,
                user_id: users[1 + (index % (users.length - 1))].user_id // Skip admin (index 0) and cycle through managers
            })),
            { transaction, returning: true }
        );

        console.log('✅ 16 times criados');

        // 5. Create Participants (1 coach + 5 players per team, total 96 participants)
        const participantData = [];
        teams.forEach((team, teamIndex) => {
            const userIndex = 1 + (teamIndex % (users.length - 1));

            // 1 Coach for each team
            participantData.push({
                name: `Coach ${teamIndex + 1}`,
                nickname: `coach_${teamIndex + 1}`,
                birth_date: new Date(1990 + (teamIndex % 10), (teamIndex % 12), (teamIndex % 28) + 1),
                phone: 11900000000 + teamIndex * 10 + 1,
                team_id: team.team_id,
                is_coach: true,
                user_id: users[userIndex].user_id
            });

            // Exactly 5 players per team
            for (let i = 0; i < 5; i++) {
                participantData.push({
                    name: `Player ${teamIndex + 1}-${i + 1}`,
                    nickname: `player_${teamIndex + 1}_${i + 1}`,
                    birth_date: new Date(1995 + (i % 8), ((teamIndex + i) % 12), ((teamIndex + i) % 28) + 1),
                    phone: 11900000000 + teamIndex * 10 + i + 2,
                    team_id: team.team_id,
                    is_coach: false,
                    user_id: users[userIndex].user_id
                });
            }
        });

        await Participant.bulkCreate(participantData, { transaction });

        console.log('✅ 96 participantes criados (1 coach + 5 jogadores por time)');

        // 6. Create Championships (8 and 16 teams)
        const championships = await Championship.bulkCreate([
            {
                name: 'CCE Small Championship (8 teams)',
                description: 'Campeonato pequeno com 8 times',
                format: 'simple',
                start_date: new Date('2024-03-01'),
                end_date: new Date('2024-03-31'),
                location: 'São Paulo, SP',
                status: 'ATIVO',
                user_id: users[0].user_id
            },
            {
                name: 'CCE Medium Championship (16 teams)',
                description: 'Campeonato médio com 16 times',
                format: 'double',
                start_date: new Date('2024-06-01'),
                end_date: new Date('2024-06-30'),
                location: 'Rio de Janeiro, RJ',
                status: 'PLANEJADO',
                user_id: users[0].user_id
            }
        ], { transaction, returning: true });

        console.log('✅ 2 campeonatos criados (8 e 16 times)');

        // 7. Create Subscriptions
        const subscriptionData = [];

        // Championship 1: 8 teams (teams 0-7)
        for (let i = 0; i < 8; i++) {
            subscriptionData.push({
                championship_id: championships[0].championship_id,
                team_id: teams[i].team_id,
                subscription_date: new Date(),
                switching_code: 1000 + i + 1,
                score: 0
            });
        }

        // Championship 2: 16 teams (teams 0-15)
        for (let i = 0; i < 16; i++) {
            subscriptionData.push({
                championship_id: championships[1].championship_id,
                team_id: teams[i].team_id,
                subscription_date: new Date(),
                switching_code: 2000 + i + 1,
                score: 0
            });
        }

        await Subscription.bulkCreate(subscriptionData, { transaction });

        console.log('✅ 24 inscrições criadas (8 + 16 times)');
        console.log(`📊 Campeonato 1: ${8} times`);
        console.log(`📊 Campeonato 2: ${16} times`);

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Erro no seed:', error);
        throw error;
    }
};

const runSeed = async () => {
    try {
        await sequelize.authenticate();
        console.log('📦 Conexão com o banco de dados estabelecida');

        await seed();

        console.log('✨ Seed concluído com sucesso');
        process.exit(0);
    } catch (error) {
        console.error('💥 Falha no seed:', error);
        process.exit(1);
    }
};

// Run seed if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    runSeed();
}

export default seed;
