const sequelize = require('../config/database');
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require('uuid');

const Client = sequelize.define('Client', {
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
  cnpj: {
    type: DataTypes.STRING(14),
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O CNPJ do estabelecimento não deve estar vazio'
      },
      len: {
        args: [14, 14],
        msg: 'O CNPJ deve conter exatamente 14 dígitos'
      },
      isNumeric: {
        msg: 'O CNPJ deve conter apenas números'
      }
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

module.exports = Client