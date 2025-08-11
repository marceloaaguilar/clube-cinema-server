
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Code = sequelize.define('Code', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  voucherId: {
    type: DataTypes.UUID,
    allowNull: false,
    validate: {
      notNull: { msg: 'O ID do voucher é obrigatório' },
    },
  },
  sequential: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    unique: true,
  },
  barCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
     validate: {
      notNull: { msg: 'O Código de Barras do Código é obrigatório' },
    },
  },
  expirationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notNull: { msg: 'A data de validade do código é obrigatória' },
    }
  },
  status: {
    type: DataTypes.ENUM('available', 'purchased'),
    allowNull: false,
    defaultValue: 'available'
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
  
}, { timestamps: true});

Code.sync({alter: true});

module.exports = Code;