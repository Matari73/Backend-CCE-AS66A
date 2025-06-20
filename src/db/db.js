import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.POSTGRES_DB,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    {
        host: process.env.DB_HOST || 'postgres',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
    });

const connectInDatabase = async () => {
    let attempts = 10;
    while (attempts) {
        try {
            console.log(`🔄 Tentando conectar ao PostgreSQL... (${11 - attempts}/10)`);
            await sequelize.authenticate();
            console.log('✅ Conexão com o PostgreSQL estabelecida com sucesso.');
            
            // Aguarda um pouco para garantir que o banco está completamente pronto
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            return sequelize;
        } catch (error) {
            attempts -= 1;
            console.error('❌ Erro ao conectar ao PostgreSQL:', error.message);
            
            if (attempts > 0) {
                console.log(`⏳ Tentando conectar novamente em 5 segundos... (${10 - attempts}/10)`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    console.error('💥 Não foi possível conectar ao PostgreSQL após 10 tentativas.');
    process.exit(1);
};

export { sequelize, connectInDatabase };
