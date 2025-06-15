import { Sequelize } from 'sequelize';

class TestDatabase {
  constructor() {
    this.sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      },
      pool: {
        max: 1,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  }

  async setup() {
    try {
      await this.sequelize.authenticate();
      console.log('✅ Test database connection established');
      
      await this.importModels();
      await this.sequelize.sync({ force: true });
      console.log('✅ Test database synchronized');
    } catch (error) {
      console.error('❌ Test database setup failed:', error);
      throw error;
    }
  }

  async cleanup() {
    try {
      await this.sequelize.close();
      console.log('✅ Test database connection closed');
    } catch (error) {
      console.error('❌ Test database cleanup failed:', error);
    }
  }

  async reset() {
    try {
      // Truncate all tables
      await this.sequelize.truncate({ 
        cascade: true, 
        restartIdentity: true 
      });
    } catch (error) {
      console.error('❌ Test database reset failed:', error);
      throw error;
    }
  }

  async importModels() {
    // Em um ambiente real, você importaria seus modelos aqui
    // Por enquanto, vamos definir modelos simples para demonstração
    
    this.User = this.sequelize.define('User', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });

    this.Championship = this.sequelize.define('Championship', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('upcoming', 'ongoing', 'completed'),
        defaultValue: 'upcoming'
      }
    });

    // Definir associações
    this.User.hasMany(this.Championship);
    this.Championship.belongsTo(this.User);
  }

  getModel(modelName) {
    return this[modelName];
  }
}

export default TestDatabase;
