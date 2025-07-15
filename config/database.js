require('dotenv').config();
const {Sequelize} = require('sequelize');

const CLUBE_CINEMA_DATABASE_NAME = process.env.CLUBE_CINEMA_DATABASE_NAME;
const CLUBE_CINEMA_HOST_DB = process.env.CLUBE_CINEMA_HOST_DB;
const CLUBE_CINEMA_USER_DB = process.env.CLUBE_CINEMA_USER_DB;
const CLUBE_CINEMA_PASSWORD_DB = process.env.CLUBE_CINEMA_PASSWORD_DB;
const CLUBE_CINEMA_PORT_DB = process.env.CLUBE_CINEMA_PORT_DB;

const sequelize = new Sequelize(
  `mysql://${CLUBE_CINEMA_USER_DB}:${CLUBE_CINEMA_PASSWORD_DB}@${CLUBE_CINEMA_HOST_DB}:${CLUBE_CINEMA_PORT_DB}/${CLUBE_CINEMA_DATABASE_NAME}`,
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