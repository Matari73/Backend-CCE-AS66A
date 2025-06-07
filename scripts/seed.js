import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { User, Team, Championship, Match, Subscription, Participant, Agent } from '../src/models/associations.js';

// Carregar variáveis do .env
dotenv.config();

// Configuração do PostgreSQL com variáveis do .env
const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    logging: false
});

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seed...');

        // Verificar conexão com banco
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Sync database
        await sequelize.sync({ force: true });
        console.log('✅ Database synced');

        // Create agents
        console.log('🎮 Creating agents...');
        const agents = await Agent.bulkCreate([
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
        ]);
        console.log(`✅ Created ${agents.length} agents`);

        // Create users (apenas 3 users básicos)
        console.log('👥 Creating users...');
        const users = await User.bulkCreate([
            { name: 'Admin User', email: 'admin@example.com', password: 'password123' },
            { name: 'Team Manager 1', email: 'manager1@example.com', password: 'password123' },
            { name: 'Team Manager 2', email: 'manager2@example.com', password: 'password123' }
        ]);
        console.log(`✅ Created ${users.length} users`);

        // Create teams (associados aos users como proprietários)
        console.log('🏆 Creating teams...');
        const teams = [];

        for (let i = 1; i <= 32; i++) {
            // Distribuir times entre os 3 users (principalmente admin)
            const ownerId = i <= 30 ? 1 : (i === 31 ? 2 : 3); // 30 teams para admin, 1 para cada manager

            teams.push({
                name: `Team ${i}`,
                description: `Competitive team ${i} with 5 players and 1 coach`,
                user_id: ownerId
            });
        }

        const createdTeams = await Team.bulkCreate(teams);
        console.log(`✅ Created ${createdTeams.length} teams`);

        // Create participants (associados aos 3 users existentes)
        console.log('👥 Creating participants...');
        const participants = [];

        for (let teamNum = 1; teamNum <= 32; teamNum++) {
            // Distribuir participants entre os 3 users de forma cíclica
            const baseUserId = ((teamNum - 1) % 3) + 1; // 1, 2, 3, 1, 2, 3...

            // Coach para cada time
            participants.push({
                name: `Coach Team ${teamNum}`,
                nickname: `coach_t${teamNum}`,
                birth_date: new Date('1985-01-01'),
                phone: `+55119${teamNum.toString().padStart(3, '0')}00`,
                is_coach: true,
                team_id: teamNum,
                user_id: baseUserId
            });

            // 5 Jogadores para cada time
            for (let playerNum = 1; playerNum <= 5; playerNum++) {
                participants.push({
                    name: `Player ${playerNum} Team ${teamNum}`,
                    nickname: `player${playerNum}_t${teamNum}`,
                    birth_date: new Date('1998-01-01'),
                    phone: `+55119${teamNum.toString().padStart(3, '0')}${playerNum}${playerNum}`,
                    is_coach: false,
                    team_id: teamNum,
                    user_id: baseUserId
                });
            }
        }

        const createdParticipants = await Participant.bulkCreate(participants);
        console.log(`✅ Created ${createdParticipants.length} participants`);

        // Create championships with required fields
        console.log('🏅 Creating championships...');
        const championships = await Championship.bulkCreate([
            {
                name: 'Championship 8 Teams',
                description: 'Tournament with 8 teams',
                format: 'single', // Campo obrigatório
                start_date: new Date('2025-01-01'),
                end_date: new Date('2025-01-31'),
                location: 'Online',
                max_teams: 8,
                status: 'upcoming',
                prize: 5000,
                user_id: 1 // Admin as creator
            },
            {
                name: 'Championship 16 Teams',
                description: 'Tournament with 16 teams',
                format: 'double', // Campo obrigatório
                start_date: new Date('2025-02-01'),
                end_date: new Date('2025-02-28'),
                location: 'Online',
                max_teams: 16,
                status: 'upcoming',
                prize: 10000,
                user_id: 1 // Admin as creator
            },
            {
                name: 'Championship 32 Teams',
                description: 'Tournament with 32 teams',
                format: 'double', // Campo obrigatório
                start_date: new Date('2025-03-01'),
                end_date: new Date('2025-03-31'),
                location: 'Online',
                max_teams: 32,
                status: 'upcoming',
                prize: 20000,
                user_id: 1 // Admin as creator
            }
        ]);
        console.log(`✅ Created ${championships.length} championships`);

        // Create subscriptions
        console.log('📝 Creating subscriptions...');
        const subscriptions = [];

        // Championship 1: 8 teams
        for (let i = 1; i <= 8; i++) {
            subscriptions.push({
                championship_id: 1,
                team_id: i,
                subscription_date: new Date()
            });
        }

        // Championship 2: 16 teams
        for (let i = 1; i <= 16; i++) {
            subscriptions.push({
                championship_id: 2,
                team_id: i,
                subscription_date: new Date()
            });
        }

        // Championship 3: 32 teams
        for (let i = 1; i <= 32; i++) {
            subscriptions.push({
                championship_id: 3,
                team_id: i,
                subscription_date: new Date()
            });
        }

        await Subscription.bulkCreate(subscriptions);
        console.log(`✅ Created ${subscriptions.length} subscriptions`);

        // Log final counts
        const userCount = await User.count();
        const teamCount = await Team.count();
        const participantCount = await Participant.count();
        const championshipCount = await Championship.count();
        const subscriptionCount = await Subscription.count();
        const agentCount = await Agent.count();

        console.log(`📊 Final counts:`);
        console.log(`   Users: ${userCount} (team owners/managers)`);
        console.log(`   Teams: ${teamCount}`);
        console.log(`   Participants: ${participantCount} (${32} coaches + ${32 * 5} players)`);
        console.log(`   Championships: ${championshipCount}`);
        console.log(`   Subscriptions: ${subscriptionCount}`);
        console.log(`   Agents: ${agentCount}`);

        console.log('🎉 Database seeded successfully!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        await sequelize.close();
        console.log('🔌 Database connection closed');
    }
};

seedDatabase();