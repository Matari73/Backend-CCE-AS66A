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
    let attempts = 5;
    while (attempts) {
        try {
            await sequelize.authenticate();
            console.log('Conexão com o PostgreSQL estabelecida com sucesso.');
            return sequelize;
        } catch (error) {
            attempts -= 1;
            console.error('Erro ao conectar ao PostgreSQL:', error);
            console.log(`Tentando conectar novamente... (${5 - attempts}/5)`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    console.error('Não foi possível conectar ao PostgreSQL após várias tentativas.');
    process.exit(1);
};

export { sequelize, connectInDatabase };
