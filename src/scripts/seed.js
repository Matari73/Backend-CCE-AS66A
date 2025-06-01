import { sequelize } from '../db/db.js';
import User from '../models/user.js';
import Team from '../models/team.js';
import Championship from '../models/championship.js';
import Agent from '../models/agent.js'; // model com apenas 'name'

const seed = async () => {
    try {
        await sequelize.sync({ force: true });

        // Cria um usuário
        const user = await User.create({
            name: 'Usuário Teste',
            email: 'teste@seed.com',
            password: '123456',
            isOrganizer: true,
        });

        // Cria um campeonato
        const championship = await Championship.create({
            name: 'Campeonato Seed',
            description: 'Para testar chaveamento',
            format: 'single',
            start_date: '2025-06-15',
            end_date: '2025-06-30',
            location: 'Online',
            status: 'aberto',
            user_id: user.user_id,
        });

        // Cria 8 times
        const teamsData = Array.from({ length: 8 }, (_, i) => ({
            name: `Team ${String.fromCharCode(65 + i)}`,
            user_id: user.user_id,
            championship_id: championship.championship_id,
            ranking: i + 1,
        }));

        await Team.bulkCreate(teamsData);

        // Cria os agentes (somente nome)
        const agentsData = [
            'Vyse', 'Clove', 'Iso', 'Deadlock', 'Gekko', 'Harbor', 'Fade', 'Neon', 'Chamber',
            'KAY/O', 'Astra', 'Yoru', 'Skye', 'Killjoy', 'Reyna', 'Brimstone', 'Viper',
            'Omen', 'Cypher', 'Sova', 'Sage', 'Phoenix', 'Raze', 'Jett', 'Breach'
        ].map(name => ({ name }));

        await Agent.bulkCreate(agentsData);

        console.log('✅ Seed executado com sucesso!');
        process.exit(0);
    } catch (err) {
        console.error('Erro ao rodar o seed:', err);
        process.exit(1);
    }
};

export default seed;
