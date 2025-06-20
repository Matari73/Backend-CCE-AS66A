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
    // Aguardar um pouco mais para garantir que o banco está totalmente inicializado
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const transaction = await sequelize.transaction();

    try {
        console.log('🌱 Iniciando seed...');

        // Verificar se já existem dados para evitar duplicação
        const existingUsers = await User.count({ transaction });
        if (existingUsers > 0) {
            console.log('📋 Dados já existem no banco, pulando seed...');
            await transaction.rollback();
            return;
        }

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
                name: 'Admin Principal',
                email: 'admin@cce.com',
                password: hashedPassword
            },
            {
                name: 'Admin Secundário', 
                email: 'admin2@cce.com',
                password: hashedPassword
            },
            {
                name: 'Admin Terciário',
                email: 'admin3@cce.com', 
                password: hashedPassword
            }
        ], { transaction, returning: true });

        console.log('✅ 3 usuários administradores criados');

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
        const teamData = [];
        const teamNames = [
            'Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta',
            'Team Echo', 'Team Foxtrot', 'Team Golf', 'Team Hotel',
            'Team India', 'Team Juliet', 'Team Kilo', 'Team Lima',
            'Team Mike', 'Team November', 'Team Oscar', 'Team Papa'
        ];

        for (let i = 0; i < 16; i++) {
            teamData.push({
                name: teamNames[i],
                user_id: users[i % 3].user_id // Distribuir entre os 3 usuários
            });
        }

        const teams = await Team.bulkCreate(teamData, { transaction, returning: true });
        console.log('✅ 16 times criados');

        // 5. Create Participants (1 coach + 5 players per team, total 96 participants)
        const participantData = [];
        for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
            const team = teams[teamIndex];
            const userIndex = teamIndex % 3;
            const userId = users[userIndex].user_id;

            // Coach
            participantData.push({
                name: `Coach ${teamIndex + 1}`,
                nickname: `coach_${teamIndex + 1}`,
                birth_date: new Date(1990 + (teamIndex % 10), teamIndex % 12, (teamIndex % 28) + 1),
                phone: `1190000000${teamIndex + 1}`,
                team_id: team.team_id,
                is_coach: true,
                user_id: userId
            });

            // Players
            for (let playerIndex = 1; playerIndex <= 5; playerIndex++) {
                participantData.push({
                    name: `Player ${teamIndex + 1}-${playerIndex}`,
                    nickname: `player_${teamIndex + 1}_${playerIndex}`,
                    birth_date: new Date(1995 + (playerIndex - 1), teamIndex % 12, (teamIndex % 28) + 1),
                    phone: `1190000000${teamIndex + 1}${playerIndex}`,
                    team_id: team.team_id,
                    is_coach: false,
                    user_id: userId
                });
            }
        }

        await Participant.bulkCreate(participantData, { transaction });
        console.log('✅ 96 participantes criados (1 coach + 5 jogadores por time)');

        // 6. Create Championships (8 and 16 teams)
        const championshipData = [
            {
                name: 'CCE Small Championship (8 teams)',
                description: 'Campeonato pequeno com 8 times',
                format: 'simple',
                start_date: new Date('2024-03-01'),
                end_date: new Date('2024-03-31'),
                location: 'São Paulo, SP',
                status: 'ATIVO',
                prize: 10000,
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
                prize: 50000,
                user_id: users[0].user_id
            }
        ];

        const championships = await Championship.bulkCreate(championshipData, { transaction, returning: true });
        console.log('✅ 2 campeonatos criados (8 e 16 times)');

        // 7. Create Subscriptions
        const subscriptionData = [];

        // Championship 1: 8 teams (teams 0-7)
        for (let i = 0; i < 8; i++) {
            subscriptionData.push({
                championship_id: championships[0].championship_id,
                team_id: teams[i].team_id,
                subscription_date: new Date()
            });
        }

        // Championship 2: 16 teams (teams 0-15)
        for (let i = 0; i < 16; i++) {
            subscriptionData.push({
                championship_id: championships[1].championship_id,
                team_id: teams[i].team_id,
                subscription_date: new Date()
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
