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
        console.log('🌱 Starting database seed...');

        // 1. Clear existing data (in reverse dependency order)
        await Match.destroy({ where: {}, transaction });
        await Subscription.destroy({ where: {}, transaction });
        await Championship.destroy({ where: {}, transaction });
        await Participant.destroy({ where: {}, transaction });
        await Team.destroy({ where: {}, transaction });
        await Agent.destroy({ where: {}, transaction });
        await User.destroy({ where: {}, transaction });

        console.log('🧹 Cleared existing data');

        // 2. Create Users
        const hashedPassword = await bcrypt.hash('123456', 12);
        const users = await User.bulkCreate([
            {
                name: 'Admin User',
                email: 'admin@cce.com',
                password: hashedPassword
            },
            ...Array.from({ length: 10 }, (_, i) => ({
                name: `Manager ${i + 1}`,
                email: `manager${i + 1}@cce.com`,
                password: hashedPassword
            }))
        ], { transaction, returning: true });

        console.log('✅ Created users');

        // 3. Create Agents
        const agents = await Agent.bulkCreate([
            { name: 'Jett' },
            { name: 'Reyna' },
            { name: 'Phoenix' },
            { name: 'Raze' },
            { name: 'Sage' },
            { name: 'Cypher' },
            { name: 'Sova' },
            { name: 'Omen' }
        ], { transaction, returning: true });

        console.log('✅ Created agents');

        // 4. Create Teams (32 teams total)
        const teamNames = [
            'Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta',
            'Team Echo', 'Team Foxtrot', 'Team Golf', 'Team Hotel',
            'Team India', 'Team Juliet', 'Team Kilo', 'Team Lima',
            'Team Mike', 'Team November', 'Team Oscar', 'Team Papa',
            'Team Quebec', 'Team Romeo', 'Team Sierra', 'Team Tango',
            'Team Uniform', 'Team Victor', 'Team Whiskey', 'Team X-ray',
            'Team Yankee', 'Team Zulu', 'Team Phoenix', 'Team Storm',
            'Team Thunder', 'Team Lightning', 'Team Vortex', 'Team Nexus'
        ];

        const teams = await Team.bulkCreate(
            teamNames.map((name, index) => ({
                name,
                user_id: users[1 + (index % (users.length - 1))].user_id // Skip admin (index 0) and cycle through managers
            })),
            { transaction, returning: true }
        );

        console.log('✅ Created 32 teams');

        // 5. Create Participants (exactly 5 players + 1 coach per team)
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

        console.log('✅ Created participants: 1 coach + 5 players per team (192 total participants)');

        // 6. Create Championships (8, 16 and 32 teams)
        const championships = await Championship.bulkCreate([
            {
                name: 'CCE Small Championship (8 teams)',
                description: 'Campeonato pequeno com 8 times',
                format: 'ELIMINACAO_SIMPLES',
                start_date: new Date('2024-03-01'),
                end_date: new Date('2024-03-31'),
                location: 'São Paulo, SP',
                status: 'ATIVO',
                user_id: users[0].user_id
            },
            {
                name: 'CCE Medium Championship (16 teams)',
                description: 'Campeonato médio com 16 times',
                format: 'ELIMINACAO_DUPLA',
                start_date: new Date('2024-06-01'),
                end_date: new Date('2024-06-30'),
                location: 'Rio de Janeiro, RJ',
                status: 'PLANEJADO',
                user_id: users[0].user_id
            },
            {
                name: 'CCE Large Championship (32 teams)',
                description: 'Campeonato grande com 32 times',
                format: 'ELIMINACAO_SIMPLES',
                start_date: new Date('2024-09-01'),
                end_date: new Date('2024-09-30'),
                location: 'Belo Horizonte, MG',
                status: 'PLANEJADO',
                user_id: users[0].user_id
            }
        ], { transaction, returning: true });

        console.log('✅ Created championships');

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

        // Championship 2: 16 teams (teams 8-23)
        for (let i = 8; i < 24; i++) {
            subscriptionData.push({
                championship_id: championships[1].championship_id,
                team_id: teams[i].team_id,
                subscription_date: new Date(),
                switching_code: 2000 + (i - 8) + 1,
                score: 0
            });
        }

        // Championship 3: 32 teams (all teams)
        for (let i = 0; i < 32; i++) {
            subscriptionData.push({
                championship_id: championships[2].championship_id,
                team_id: teams[i].team_id,
                subscription_date: new Date(),
                switching_code: 3000 + i + 1,
                score: 0
            });
        }

        await Subscription.bulkCreate(subscriptionData, { transaction });

        console.log('✅ Created subscriptions');
        console.log(`📊 Championship 1: ${8} teams`);
        console.log(`📊 Championship 2: ${16} teams`);
        console.log(`📊 Championship 3: ${32} teams`);

        await transaction.commit();
        console.log('🎉 Database seeded successfully!');

    } catch (error) {
        await transaction.rollback();
        console.error('❌ Error seeding database:', error);
        throw error;
    }
};

const runSeed = async () => {
    try {
        await sequelize.authenticate();
        console.log('📦 Database connection established');

        await seed();

        console.log('✨ Seed completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('💥 Seed failed:', error);
        process.exit(1);
    }
};

// Run seed if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    runSeed();
}

export default seed;
