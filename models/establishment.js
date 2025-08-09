const sequelize = require('../config/database');
const { DataTypes } = require("sequelize");

const Establishment = sequelize.define('Establishment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty:{
        msg: 'O nome do estabelecimento não deve estar vazio'
      },
      notNull: {
        msg: 'O nome do estabelecimento é obrigatório'
      },
    }
  },
  logo_url: {
    type: DataTypes.STRING
  }
},
  {
    timestamps: true,
  },
);

module.exports = Establishment