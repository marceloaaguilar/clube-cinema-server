require('dotenv').config();
const {Sequelize} = require('sequelize');

const DATABASE_NAME = process.env.DATABASE_NAME;
const HOST_DB = process.env.HOST_DB;
const USER_DB = process.env.USER_DB;
const PASSWORD_DB = process.env.PASSWORD_DB;
const PORT_DB = process.env.PORT_DB;

const sequelize = new Sequelize(
  `mysql://${USER_DB}:${PASSWORD_DB}@${HOST_DB}:${PORT_DB}/${DATABASE_NAME}`,
  {
    logging: false,
    dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false
      }
    }
  }
);

async function setupDatabase() {
  try {
    await sequelize.sync({ force: false });
  } catch (error) {
    console.error("Erro ao sincronizar banco de dados: " + error)
  }
}

setupDatabase();

module.exports = sequelize